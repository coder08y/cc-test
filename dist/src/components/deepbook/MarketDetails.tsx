import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { AddressCopyLink, TooltipIcon } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { SingleCoinImage } from '@cetus/ui-kit'
import { d, formatNumber, formatNumberWithKMB, formatPercentage, fromDecimalsAmountFix } from '@cetus/utils'
import { Box, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { Suspense, lazy, useMemo } from 'react'

const PriceReference = lazy(() => import('../swap/PriceReference'))

const InfoRow = ({
  label,
  value,
  tooltip,
  color = 'text_caption'
}: {
  label: string
  value: React.ReactNode
  tooltip?: string
  color?: string
}) => (
  <HStack justify="space-between" w="100%" minH="16px">
    <HStack gap="4px">
      <Text fontSize="12px" lineHeight="16px">
        {label}
      </Text>
      {tooltip && <TooltipIcon iconSize="16px" tooltipCon={tooltip} />}
    </HStack>
    <Text as="div" fontSize="12px" color={color} textAlign="right" lineHeight="16px">
      {value}
    </Text>
  </HStack>
)

const MarginPoolInfo = ({
  currentDeepBookPool,
  type,
  labels
}: {
  currentDeepBookPool: any
  type: 'base' | 'quote'
  labels: {
    totalSupplied: string
    totalBorrowed: string
    utilizationRate: string
    supplyAPR: string
    borrowAPR: string | { value: string; color: string }
    maxUtilization: string
    minBorrow: string
  }
}) => {
  const { getExplorerUrl } = useExplorer()
  const assets = type === 'base' ? currentDeepBookPool?.baseAssets : currentDeepBookPool?.quoteAssets
  const marginPool = type === 'base' ? currentDeepBookPool.baseMarginPool : currentDeepBookPool.quoteMarginPool
  return (
    <Box w="100%">
      <HStack gap="4px" justify="flex-start" w="100%" h="16px" mb="12px">
        <SingleCoinImage imageUrl={assets?.logo_url} w="16px" h="16px" coinType={assets?.coin_type} />
        <Text fontSize="12px" color="text_caption" fontWeight="500" lineHeight="16px">
          {assets?.symbol} Margin Pool
        </Text>
      </HStack>

      <HStack justify="space-between" w="100%" mb="12px">
        <Text fontSize="12px">Pool Address</Text>
        <AddressCopyLink
          address={marginPool}
          showLink={false}
          fontSize="12px"
          color="text_caption"
          onClickLink={() => window.open(getExplorerUrl(marginPool, 'poolAddress'), '_blank')}
        />
      </HStack>

      <VStack w="100%" gap="12px">
        <InfoRow label="Total Supplied" value={labels.totalSupplied} />
        <InfoRow label="Total Borrowed" value={labels.totalBorrowed} />
        <InfoRow label="Utilization Rate" value={labels.utilizationRate} />
        <InfoRow label="Supply APR" color="primary_green" value={labels.supplyAPR} />
        <InfoRow
          label="Borrow APR"
          value={
            typeof labels.borrowAPR === 'object' ? (
              <Text fontSize="12px" lineHeight="16px" as="span" color="#ff9968">
                {labels.borrowAPR.value}
              </Text>
            ) : (
              labels.borrowAPR
            )
          }
        />
        <InfoRow label="Max Utilization" value={labels.maxUtilization} />
        <InfoRow label="Min Borrow Size" value={labels.minBorrow} />
      </VStack>
    </Box>
  )
}

export default function MarketDetails({ tradeType, currentDeepBookPool }: { tradeType: string; currentDeepBookPool: any }) {
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()

  const deepBookMarginPools = useDeepBookMarginPoolStore((state: any) => state.deepBookMarginPools)

  // 根据 coinType 查找对应的 margin pool
  const getMarginPoolByCoinType = (coinType: string): any => {
    if (!coinType || !deepBookMarginPools || deepBookMarginPools.length === 0) return null
    return deepBookMarginPools.find((pool: any) => pool.coinType === coinType) || null
  }

  // 计算 margin pool 的 labels
  const getMarginPoolLabels = (type: 'base' | 'quote') => {
    const assets = type === 'base' ? currentDeepBookPool?.baseAssets : currentDeepBookPool?.quoteAssets
    const coinType = assets?.coin_type
    const marginPool = getMarginPoolByCoinType(coinType)

    if (!marginPool) {
      // 如果没有找到对应的 margin pool，返回默认值
      return {
        totalSupplied: `-- ${assets?.symbol || ''}`,
        totalBorrowed: `-- ${assets?.symbol || ''}`,
        utilizationRate: '--',
        supplyAPR: '--',
        borrowAPR: { value: '--', color: 'text_caption' },
        maxUtilization: '--',
        minBorrow: `-- ${assets?.symbol || ''}`
      }
    }

    // 计算总借款量：使用 remain_to_borrow 和 maxUtilizationRate
    const totalSupply = d(marginPool.totalSupply || '0')
    // 格式化最大利用率（maxUtilizationRate 是 "800000000" 表示 80%，需要除以 1000000000 * 100）
    const maxUtilizationRate = d(marginPool.maxUtilizationRate || '0').div(1000000000)
    // 最大可借出量 = 总供应量 × 最大利用率
    const maxBorrowable = totalSupply.times(maxUtilizationRate)
    // 剩余可借出量（考虑最大利用率限制）
    const remainToBorrow = d(marginPool.remainToBorrow || '0')
    // 总借款量 = 最大可借出量 - 剩余可借出量
    const totalBorrowed = maxBorrowable.gt(0) ? maxBorrowable.minus(remainToBorrow) : d(0)
    const totalBorrowedDisplay = formatNumber(totalBorrowed.toString(), 2)

    // 计算利用率 = (总借款量 / 总供应量) * 100
    const utilizationRate = totalSupply.gt(0) ? totalBorrowed.div(totalSupply).times(100) : d(0)
    const utilizationRateDisplay = formatPercentage(utilizationRate.toString(), 2)

    // 格式化 APR（需要乘以 100 转换为百分比）
    const supplyApr = d(marginPool.supplyApr || '0').times(100)
    const borrowApr = d(marginPool.borrowApr || '0').times(100)
    const supplyAprDisplay = formatPercentage(supplyApr.toString(), 2)
    // 格式化 Borrow APR 显示（橙色，如果是负值取绝对值用绿色）
    const borrowAprValue = borrowApr
    const isNegative = borrowAprValue.lt(0)
    const absValue = borrowAprValue.abs()
    const borrowAprDisplay = {
      value: formatPercentage(absValue.toString(), 2),
      color: isNegative ? 'primary_green' : '#ff9968'
    }
    const maxUtilizationDisplay = formatPercentage(maxUtilizationRate.times(100).toString(), 2)

    // 格式化最小借款量（需要根据 decimals 格式化）
    const decimals = marginPool.tokenInfo?.decimals || assets?.decimals || 6
    const minBorrowAmount = fromDecimalsAmountFix(marginPool.minBorrow || '0', decimals)
    const minBorrowDisplay = formatNumber(minBorrowAmount, 2)

    // 格式化总供应量（带价值）
    const totalSuppliedDisplay = `${marginPool.displayTotalSupply || '0'} ${assets?.symbol || ''}`
    // 使用 totalValue 重新格式化为 K/M/B 格式
    const totalValueDisplay = marginPool.totalValue ? `$${formatNumberWithKMB(marginPool.totalValue, 2)}` : null
    const totalSuppliedWithValue = totalValueDisplay ? `${totalSuppliedDisplay} (${totalValueDisplay})` : totalSuppliedDisplay

    // 计算总借款量的价值（如果有总价值和总供应量，可以按比例计算）
    let totalBorrowedWithValue = totalBorrowedDisplay
    if (marginPool.totalValue && totalSupply.gt(0)) {
      const borrowedValue = d(marginPool.totalValue).times(totalBorrowed).div(totalSupply)
      const borrowedValueDisplay = `$${formatNumberWithKMB(borrowedValue.toString(), 2)}`
      totalBorrowedWithValue = `${totalBorrowedDisplay} ${assets?.symbol || ''} (${borrowedValueDisplay})`
    } else {
      totalBorrowedWithValue = `${totalBorrowedDisplay} ${assets?.symbol || ''}`
    }

    return {
      totalSupplied: totalSuppliedWithValue,
      totalBorrowed: totalBorrowedWithValue,
      utilizationRate: utilizationRateDisplay,
      supplyAPR: supplyAprDisplay,
      borrowAPR: borrowAprDisplay,
      maxUtilization: maxUtilizationDisplay,
      minBorrow: `${minBorrowDisplay} ${assets?.symbol || ''}`
    }
  }

  // 计算 base 和 quote 的 labels
  const baseLabels = useMemo(() => getMarginPoolLabels('base'), [currentDeepBookPool, deepBookMarginPools])
  const quoteLabels = useMemo(() => getMarginPoolLabels('quote'), [currentDeepBookPool, deepBookMarginPools])

  return (
    <HStack
      h="calc(100% - 38px)"
      overflowY="auto"
      gap="48px"
      justify="flex-start"
      w="100%"
      bg="bg_secondary"
      p="12px"
      borderRadius="0 0 8px 8px"
      alignItems="flex-start"
      sx={{
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none'
      }}
    >
      <VStack flex="1" gap="0px" alignItems="flex-start" minW="360px" maxW="440px">
        <Text w="100%" textAlign="left" fontSize="14px" color="text_caption" lineHeight="18px" fontWeight="500" mb="16px">
          Market Pool Info
        </Text>

        <Box w="100%">
          <Text w="100%" textAlign="left" fontSize="12px" color="text_caption" lineHeight="16px" fontWeight="500" mb="12px">
            Base Info
          </Text>

          <VStack w="100%" gap="12px">
            <HStack justify="space-between" w="100%" h="16px">
              <Text fontSize="12px">Pool Address</Text>
              <AddressCopyLink
                address={currentDeepBookPool?.address}
                showLink={false}
                fontSize="12px"
                color="text_caption"
                onClickLink={() => window.open(getExplorerUrl(currentDeepBookPool?.address, 'poolAddress'), '_blank')}
              />
            </HStack>

            <HStack justify="space-between" w="100%" h="16px">
              <Text fontSize="12px">Min Order Size</Text>
              <Text fontSize="12px" color="text_caption">
                {currentDeepBookPool?.minSize} {currentDeepBookPool?.baseAssets?.symbol}
              </Text>
            </HStack>
            <InfoRow
              label={'Price Step Size'}
              value={`${currentDeepBookPool?.tickSize} ${currentDeepBookPool?.quoteAssets?.symbol}`}
              tooltip={`The minimum price increment allowed. For example, ${currentDeepBookPool?.tickSize} means prices move by ${currentDeepBookPool?.tickSize} each time. `}
            />
            <InfoRow
              label={'Lot Size'}
              value={`${currentDeepBookPool?.lotSize} ${currentDeepBookPool?.baseAssets?.symbol}`}
              tooltip={`The minimum amount step you can trade in this pool. For example, a lot size of ${currentDeepBookPool?.lotSize} means trades must be in multiples of ${currentDeepBookPool?.lotSize}.`}
            />
            {/* {!currentDeepBookPool?.isMarginPool && ( */}
            <Suspense
              fallback={
                <VStack w="100%" align="flex-start" mt="20px">
                  <VStack w="100%" align="flex-start">
                    <HStack w="100%">
                      <SkeletonCircle w="28px" h="28px" />
                      <Skeleton h="16px" w="60px" borderRadius="4px" />
                    </HStack>
                    <Skeleton h="16px" w="120px" borderRadius="4px" />
                  </VStack>
                  <VStack w="100%" align="flex-start" mt="20px">
                    <HStack w="100%">
                      <SkeletonCircle w="28px" h="28px" />
                      <Skeleton h="16px" w="60px" borderRadius="4px" />
                    </HStack>
                    <Skeleton h="16px" w="120px" borderRadius="4px" />
                  </VStack>
                </VStack>
              }
            >
              <PriceReference
                fromCoin={currentDeepBookPool?.baseAssets}
                toCoin={currentDeepBookPool?.quoteAssets}
                wrapStyle={{ gap: '16px' }}
                titleStyle={{
                  height: 'auto',
                  // m: isApp ? "10px 0 4px" : "16px 0 4px",
                  sx: {
                    '>p': {
                      color: 'text_paragraph',
                      fontSize: '12px',
                      fontWeight: '400'
                    },
                    svg: {
                      width: '16px',
                      height: '16px'
                    }
                  }
                }}
                itemStyle={{
                  bg: 'bg_secondary',
                  p: '16px',
                  borderRadius: '8px',
                  border: '1px solid !important',
                  borderColor: 'border !important'
                }}
                chartStyle={{ flex: isApp ? '0 0 150px' : '' }}
                type="deepbook"
              />
            </Suspense>
            {/* )} */}
          </VStack>
        </Box>

        {tradeType == 'Margin' && (
          <Box w="100%" mt="24px">
            <Text w="100%" textAlign="left" fontSize="12px" color="text_caption" lineHeight="16px" fontWeight="500" mb="12px">
              Risk Parameter
            </Text>
            <VStack w="100%" gap="12px">
              {[
                {
                  label: 'Min Withdraw Risk Ratio',
                  value: currentDeepBookPool?.minWithdrawRiskRatio ? formatNumber(currentDeepBookPool.minWithdrawRiskRatio) : '--',
                  tooltip:
                    'To withdraw funds to your wallet, your Margin Risk Level must remain above the Min Withdraw Risk Ratio after the withdrawal.'
                },
                {
                  label: 'Min Borrow Risk Ratio',
                  value: currentDeepBookPool?.minBorrowRiskRatio ? formatNumber(currentDeepBookPool.minBorrowRiskRatio) : '--',
                  tooltip:
                    'This is the minimum required Collateral Risk Ratio to borrow or add exposure. When your margin risk level approaches this level, borrowing and position increases will be restricted.'
                },
                {
                  label: 'Liquidation Risk Ratio',
                  value: currentDeepBookPool?.liquidationRiskRatio ? formatNumber(currentDeepBookPool.liquidationRiskRatio) : '--',
                  tooltip:
                    "If your Margin Risk Level falls below this level, your account will be liquidated. It's recommended to keep your Margin Risk Level safely above this level, as market volatility or interest accrual may push it down and trigger liquidation."
                },
                {
                  label: 'Target Liquidation Risk Ratio',
                  value: currentDeepBookPool?.targetLiquidationRiskRatio ? formatNumber(currentDeepBookPool.targetLiquidationRiskRatio) : '--',
                  tooltip:
                    'This is the target risk ratio the system aims to maintain after liquidation. Liquidations are executed to bring your Margin Risk Level back to this level or above.'
                },
                {
                  label: 'Liquidation Bonus',
                  value: currentDeepBookPool?.userLiquidationReward
                    ? formatNumber(d(currentDeepBookPool.userLiquidationReward).mul(100).toNumber()) + '%'
                    : '--',
                  tooltip: 'Percentage of the liquidated collateral paid to the liquidator as a reward.'
                },
                {
                  label: 'Pool Penalty',
                  value: currentDeepBookPool?.poolLiquidationReward
                    ? formatNumber(d(currentDeepBookPool.poolLiquidationReward).mul(100).toNumber()) + '%'
                    : '--',
                  tooltip: 'Percentage of the liquidated collateral allocated to the pool.'
                }
              ].map(item => (
                <InfoRow key={item.label} label={item.label} value={item.value} tooltip={item.tooltip} />
              ))}
            </VStack>
          </Box>
        )}
      </VStack>

      {tradeType == 'Margin' && (
        <VStack flex="1" gap="0px" minW="360px" maxW="440px">
          <Text w="100%" textAlign="left" fontSize="14px" color="text_caption" lineHeight="18px" fontWeight="500" mb="16px">
            Margin Pool Info
          </Text>
          <MarginPoolInfo currentDeepBookPool={currentDeepBookPool} type="base" labels={baseLabels} />
          <Box mt="24px" />
          <MarginPoolInfo currentDeepBookPool={currentDeepBookPool} type="quote" labels={quoteLabels} />
        </VStack>
      )}
    </HStack>
  )
}
