import { useCalculateRiskRatio } from '@/hooks/deepbook/margin/useCalculateRiskRatio'
import useDeepbookMarginDebt from '@/hooks/deepbook/margin/useDeepbookMarginDebt'
import useGetDeepBookMarginBalance from '@/hooks/deepbook/margin/useGetDeepBookMarginBalance'
import { useRiskRatios } from '@/hooks/deepbook/margin/useRiskRatios'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { CetusTooltip } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { Icon } from '@cetus/ui-kit'
import { d, formatPercentage, formatUSDPrice } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import LiquidationPriceWarning from './LiquidationPriceWarning'
import MarginAccountSummary, { getMarginAccountSummaryItems, type AccountSummaryItem } from './MarginAccountSummary'
import MarginHealthyChart from './MarginHealthyChart'
import MarginRiskRatios from './MarginRiskRatios'

export function MarginHealthRiskBlock({
  text,
  variant = 'red',
  showCloseButton = false,
  close,
  textStyle
}: {
  text: string
  variant?: 'red' | 'yellow' | 'blue'
  showCloseButton?: boolean
  close?: () => void
  textStyle?: any
}) {
  const color = variant === 'red' ? 'primary_red' : variant === 'yellow' ? 'primary_yellow' : 'primary'
  const bg = variant === 'red' ? 'primary_red_opacity.10' : variant === 'yellow' ? 'primary_yellow_opacity.10' : 'primary_opacity.10'

  return (
    <VStack bg={bg} borderRadius="8px" p="8px" w="100%" alignItems="flex-start">
      <Text fontSize="12px" lineHeight="16px" color={color} whiteSpace="pre-line" {...textStyle}>
        {text}
      </Text>
      {showCloseButton && (
        <Text
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          fontSize="12px"
          lineHeight="16px"
          color={color}
          w="100%"
          textAlign="right"
          onClick={() => close?.()}
        >
          Got it, Close
        </Text>
      )}
    </VStack>
  )
}

export default function MarginHealthBlock() {
  const { currentAccount } = useAccountStore()
  const [showLiquidationAlert, setShowLiquidationAlert] = useState(false)
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const openAssetsActionModal = useDeepBookStore(state => state.openAssetsActionModal)

  // 直接从 store 读取 balance 数据，确保页面刷新后也能使用正确值
  // hook 会在后台更新 store，组件直接从 store 读取即可
  const balanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return state.getMarginBalanceData('', '')
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address)
  })

  // 调用 hook 以确保数据被更新到 store（hook 内部会更新 store）
  useGetDeepBookMarginBalance()

  // 直接从 store 读取数据
  const baseFreeBalance = balanceData.baseFreeBalance
  const quoteFreeBalance = balanceData.quoteFreeBalance
  const totalCollateralValue = balanceData.totalCollateralValue
  const baseMarginBalanceUSD = balanceData.baseMarginBalanceUSD
  const quoteMarginBalanceUSD = balanceData.quoteMarginBalanceUSD
  const baseTotalBalance = balanceData.baseTotalBalance
  const quoteTotalBalance = balanceData.quoteTotalBalance
  const baseTotalBalanceUSD = balanceData.baseTotalBalanceUSD
  const quoteTotalBalanceUSD = balanceData.quoteTotalBalanceUSD

  // console.log(totalCollateralValue)

  const { baseDebt, quoteDebt, baseDebtUSD, quoteDebtUSD, totalDebtValue } = useDeepbookMarginDebt()

  // 获取加载状态
  const isBalanceFetching = useMarginStore(state => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) return false
    return state.isBalanceFetching(currentAccount.address, currentDeepBookPool.address)
  })
  const isDebtFetching = useMarginStore(state => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) return false
    return state.isDebtFetching(currentAccount.address, currentDeepBookPool.address)
  })
  const isMarginPoolsLoading = useDeepBookMarginPoolStore(state => state.isMarginPoolsLoading)

  // 计算综合加载状态
  const isAccountDataLoading = isBalanceFetching || isDebtFetching
  const { riskRatio } = useCalculateRiskRatio()

  // 风险比率配置
  const riskRatios = useRiskRatios()

  const netPositionValueDisplay = useMemo(() => {
    const netValue = d(totalCollateralValue).sub(totalDebtValue)
    const isNegative = netValue.lt(0)
    const absValue = netValue.abs()
    const formattedValue = formatUSDPrice(absValue.toString())
    return isNegative ? `-$${formattedValue}` : `$${formattedValue}`
  }, [totalCollateralValue, totalDebtValue])

  const accountSummary: AccountSummaryItem[] = useMemo(() => {
    return getMarginAccountSummaryItems({
      CollateralValue: `$${formatUSDPrice(totalCollateralValue, true, 1)}`,
      DebtValue: `$${formatUSDPrice(totalDebtValue, true, 10)}`
    })
  }, [totalCollateralValue, totalDebtValue])

  // 判断是否有债务
  const hasDebt = useMemo(() => {
    return d(baseDebt).gt(0) || d(quoteDebt).gt(0)
  }, [baseDebt, quoteDebt])

  // 获取默认 token（初始状态时优先使用 quoteAssets）
  const defaultToken = useMemo(() => {
    return currentDeepBookPool?.quoteAssets || currentDeepBookPool?.baseAssets
  }, [currentDeepBookPool])

  // 根据实际负债 token 确定对应的 coinType
  const borrowToken = useMemo(() => {
    const hasBaseDebt = d(baseDebt).gt(0)
    const hasQuoteDebt = d(quoteDebt).gt(0)

    if (hasBaseDebt) {
      return currentDeepBookPool?.baseAssets
    } else if (hasQuoteDebt) {
      return currentDeepBookPool?.quoteAssets
    }
    // 如果没有负债，返回空字符串
    return null
  }, [baseDebt, quoteDebt, currentDeepBookPool])

  // 获取 deepBookMarginPools
  const deepBookMarginPools = useDeepBookMarginPoolStore(state => state.deepBookMarginPools)

  // 根据负债 token 的 coinType 查找对应的 margin pool 并获取 Borrow APR
  const borrowAPRDisplay = useMemo(() => {
    const marginPool = deepBookMarginPools.find((pool: any) => pool.coinType === borrowToken?.coin_type) as any

    if (!borrowToken || !marginPool || !marginPool.borrowApr) {
      // 数据已加载完成，但没找到对应的 pool 或 borrowApr，显示 0%
      return { value: '0%', color: 'text_caption', isLoaded: true }
    }
    // borrowApr 是小数形式，需要乘以 100 转换为百分比
    const borrowApr = d(marginPool.borrowApr || '0').times(100)
    const isNegative = borrowApr.lt(0)
    const absValue = borrowApr.abs()

    return {
      value: formatPercentage(absValue.toString(), 2),
      color: isNegative ? 'primary_green' : '#ff9968',
      isLoaded: true
    }
  }, [borrowToken, deepBookMarginPools, isMarginPoolsLoading])

  return (
    <VStack w="100%">
      {showLiquidationAlert && (
        <MarginHealthRiskBlock
          showCloseButton={true}
          close={() => setShowLiquidationAlert(false)}
          text={`Your position has been liquidated because its Margin Risk Level fell below {liquidation risk ratio}. You can find more details in Liquidation Records`}
        />
      )}
      <Box display="flex" justifyContent="center" alignItems="center" w="100%" h="120px">
        <MarginHealthyChart
          value={riskRatio}
          minBorrowRatio={riskRatios.find(r => r.label === 'MBR')?.value || 1.25}
          minWithdrawRatio={riskRatios.find(r => r.label === 'MWR')?.value || 2}
          tooltip="Margin Risk Level is calculated as: Total Collateral ÷ Total Debt. A higher Margin Risk Level indicates a safer account with lower liquidation risk."
          // isNoMarginManager={isInitialState}
        />
      </Box>
      <MarginRiskRatios riskRatios={riskRatios} />
      <Box h="" />
      <MarginAccountSummary
        items={accountSummary}
        baseBalance={baseTotalBalance}
        quoteBalance={quoteTotalBalance}
        baseBalanceUSD={baseTotalBalanceUSD}
        quoteBalanceUSD={quoteTotalBalanceUSD}
        baseDebt={baseDebt}
        quoteDebt={quoteDebt}
        baseDebtUSD={baseDebtUSD}
        quoteDebtUSD={quoteDebtUSD}
        loading={isAccountDataLoading}
      />
      <HStack w="100%" justifyContent="space-between">
        <HStack gap="4px">
          <Text fontSize="12px" lineHeight="16px">
            Net Exposure
          </Text>
          <CetusTooltip
            tooltip={
              <Text fontSize="12px" lineHeight="16px">
                Total collateral value - Total debt value
              </Text>
            }
          >
            <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
          </CetusTooltip>
        </HStack>
        <Skeleton isLoaded={!isAccountDataLoading} h="16px">
          <Text fontSize="12px" lineHeight="16px" color="text_caption">
            {netPositionValueDisplay}
          </Text>
        </Skeleton>
      </HStack>
      <HStack w="100%" justifyContent="space-between">
        <HStack gap="4px">
          <Text fontSize="12px" lineHeight="16px">
            Borrow APR
          </Text>
          <CetusTooltip
            tooltip={
              <Text fontSize="12px" lineHeight="16px">
                The interest rate for borrowing {borrowToken?.symbol} from Deepbook margin pool
              </Text>
            }
          >
            <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
          </CetusTooltip>
        </HStack>
        <Skeleton isLoaded={!!borrowAPRDisplay.isLoaded} h="16px">
          <Text fontSize="12px" lineHeight="16px" color={borrowAPRDisplay.color}>
            {borrowAPRDisplay.value}
          </Text>
        </Skeleton>
      </HStack>
      <LiquidationPriceWarning />
      <HStack w="100%" justifyContent="space-between">
        <Button
          onClick={() => {
            // 如果是初始状态，使用 "Initialize & Deposit Collateral"，否则使用 "Deposit"
            // const actionType = isInitialState ? 'Initialize & Deposit Collateral' : 'Deposit'
            openAssetsActionModal('Deposit', defaultToken)
          }}
          bg="primary_opacity.10"
          rounded="6px"
          w="100%"
          h="28px"
          _hover={{ bg: !currentAccount?.address ? 'primary_disabled !important' : 'primary_opacity.20' }}
          justifyContent="center"
          alignItems="center"
          disabled={!currentAccount?.address}
        >
          <Text fontSize="12px" lineHeight="16px" fontWeight="500" color="primary">
            Deposit
          </Text>
        </Button>
        {hasDebt && (
          <Button
            onClick={() => {
              openAssetsActionModal('Repay', borrowToken)
            }}
            bg="primary_opacity.10"
            rounded="6px"
            w="100%"
            h="28px"
            _hover={{ bg: 'primary_opacity.20' }}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize="12px" lineHeight="16px" fontWeight="500" color="primary">
              Repay
            </Text>
          </Button>
        )}
      </HStack>
    </VStack>
  )
}
