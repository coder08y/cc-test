import DepositRatio from '@/components/common/DepositRatio'
import FreshProgressV2 from '@/components/swap/FreshProgressV2'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useGlobalStore from '@/store/common/global'
import useZapStore from '@/store/zap/index'
import { calcCoinProportion, checkFullRange } from '@/utils/pool'
import { MarketSource, MarketType } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { bnToAmount, d, formatCurrencyWithKMB, formatNumberWithDown, formatPrice } from '@cetus/utils'
import { GridItem, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import Slippage from '../common/Slippage'

export default function ZapRoute({
  action,
  notAllowSetSlippage,
  zapProgressRef,
  reCalculateZapData,
  hideAmountInfo,
  hideDepositRatio,
  inConfirmModal
}: {
  action: 'Deposit' | 'Withdraw'
  zapProgressRef: any
  reCalculateZapData: () => void
  notAllowSetSlippage?: boolean
  hideAmountInfo?: boolean
  hideDepositRatio?: boolean
  inConfirmModal?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { liquiditySlippage } = useGlobalStore()
  const { getTokenAmountValue } = useTokenPrice()

  const {
    zapSlideValue,
    preDepositeData,
    currentTokens,
    currentZapToken,
    zapAmount,
    isPreLoading,
    zapApiPool,
    lower,
    upper,
    zapCurrPriceData,
    posOriginAmounts
  } = useZapStore()
  const { fromCoin, toCoin } = useMemo(() => {
    const fromCoin = currentZapToken
    const toCoin = currentTokens?.filter((item: any) => item?.coin_type !== currentZapToken?.coin_type)?.[0]
    if (action === 'Withdraw') {
      return {
        fromCoin: toCoin,
        toCoin: fromCoin
      }
    } else {
      return {
        fromCoin,
        toCoin
      }
    }
  }, [currentZapToken?.coin_type, currentTokens, action])

  const { fromAmount, toAmount } = useMemo(() => {
    let fromAmount, toAmount
    if (preDepositeData && fromCoin?.coin_type && toCoin?.coin_type) {
      fromAmount = bnToAmount(preDepositeData?.swap_result?.swap_in_amount, fromCoin?.decimals)
      toAmount = bnToAmount(preDepositeData?.swap_result?.swap_out_amount, toCoin?.decimals)
    }
    return {
      fromAmount,
      toAmount
    }
  }, [preDepositeData, fromCoin?.coin_type, toCoin?.coin_type])

  const { sources, priceImpactTextInfo, showPriceImpactTips } = usePriceImpact(fromCoin, toCoin, fromAmount, toAmount)

  const [isToggle, setIsToggle] = useState(false)

  const handleToggleRate = () => {
    setIsToggle(!isToggle)
  }

  const minimumReceived = useMemo(() => {
    if (toAmount) {
      return formatNumberWithDown(d(toAmount).sub(d(toAmount).mul(liquiditySlippage)).toString())
    }
    return '--'
  }, [liquiditySlippage, toAmount])

  const currentPriceRate = useMemo(() => {
    return preDepositeData?.swap_result?.swap_price
  }, [preDepositeData])

  const handleRefresh = () => {
    console.log('ZapRoute handleRefresh')
    reCalculateZapData()
  }

  const {
    tokenA,
    tokenB,
    coinAmountA,
    coinAmountB,
    displayCoinAmountA,
    displayCoinAmountB,
    displayTokenA,
    displayTokenB,
    displayAmountARate,
    displayAmountBRate
  } = useMemo(() => {
    let coinAmountA, coinAmountB, tokenA, tokenB, amountARate, amountBRate
    const isReverse = zapApiPool?.isReverse
    if (preDepositeData && zapApiPool?.poolAddress) {
      tokenA = zapApiPool?.tokenA
      tokenB = zapApiPool?.tokenB
      coinAmountA = bnToAmount(preDepositeData?.amount_a, tokenA?.decimals)
      coinAmountB = bnToAmount(preDepositeData?.amount_b, tokenB?.decimals)
      amountARate = getTokenAmountValue(tokenA?.coin_type, coinAmountA)
      amountBRate = getTokenAmountValue(tokenB?.coin_type, coinAmountB)
    }

    return {
      displayCoinAmountA: !isReverse ? coinAmountA : coinAmountB,
      displayCoinAmountB: !isReverse ? coinAmountB : coinAmountA,
      displayTokenA: !isReverse ? tokenA : tokenB,
      displayTokenB: !isReverse ? tokenB : tokenA,
      displayAmountARate: !isReverse ? amountARate : amountBRate,
      displayAmountBRate: !isReverse ? amountBRate : amountARate,
      tokenA,
      tokenB,
      coinAmountA,
      coinAmountB
    }
  }, [preDepositeData, zapApiPool?.poolAddress])

  const { originPosDisplayAmountA, originPosDisplayAmountB } = useMemo(() => {
    let originPosDisplayAmountA = ''
    let originPosDisplayAmountB = ''
    if (zapApiPool?.poolAddress && (posOriginAmounts?.coinAmountA || posOriginAmounts?.coinAmountB)) {
      const tokenA = zapApiPool?.tokenA
      const tokenB = zapApiPool?.tokenB
      const isReverse = zapApiPool?.isReverse
      const coinAmountA = bnToAmount(posOriginAmounts?.coinAmountA, tokenA?.decimals)
      const coinAmountB = bnToAmount(posOriginAmounts?.coinAmountB, tokenB?.decimals)
      originPosDisplayAmountA = !isReverse ? coinAmountA : coinAmountB
      originPosDisplayAmountB = !isReverse ? coinAmountB : coinAmountA
    }

    return { originPosDisplayAmountA, originPosDisplayAmountB }
  }, [posOriginAmounts, zapApiPool?.poolAddress])

  // 占比
  const [percentMap, setPercentMap] = useState<any>({})
  useEffect(() => {
    if (coinAmountA || coinAmountB) {
      const isFullRange = checkFullRange(lower, upper)
      const rateMap = calcCoinProportion(coinAmountA || 0, coinAmountB || 0, zapCurrPriceData?.currentPrice, isFullRange)
      setPercentMap(rateMap)
    }
  }, [coinAmountA, coinAmountB, zapCurrPriceData?.currentPrice])

  const { isApp } = useWindowWidth()

  return (
    <>
      {Number(zapAmount) > 0 && Number(fromAmount) > 0 && (
        <VStack w="100%" gap="12px" pt="16px" pb={inConfirmModal ? '0px' : '16px'}>
          <HStack w="100%" justify="space-between">
            <Text fontSize="14px" color="text_paragraph">
              Zap Route
            </Text>
          </HStack>
          <VStack
            w="100%"
            bg={inConfirmModal ? 'bg_secondary' : 'none'}
            borderRadius="12px"
            p={inConfirmModal ? '0px 12px' : '0px'}
            gap={inConfirmModal ? '4px' : '12px'}
            border="1px solid"
            borderColor={inConfirmModal ? 'border' : 'rgba(0,0,0,0)'}
            flexDirection={action === 'Withdraw' ? 'column-reverse' : 'column'}
          >
            <VStack
              w="100%"
              align="flex-start"
              bg={inConfirmModal ? 'none' : 'button_outline_hov_bg'}
              p={inConfirmModal ? '16px 0px' : '16px 12px'}
              borderRadius={inConfirmModal ? '0px' : '12px'}
              borderBottom="1px solid"
              borderColor={inConfirmModal ? 'border' : 'rgba(0,0,0,0)'}
            >
              <HStack w="100%" align="center">
                <VStack
                  w="100%"
                  align="flex-start"
                  onClick={() => {
                    setIsOpen(!isOpen)
                  }}
                >
                  <HStack w="100%" justify="flex-start">
                    {isPreLoading ? (
                      <Skeleton w="100%" h="16px" />
                    ) : (
                      <Text w="100%" fontSize="12px" color="text_caption" textAlign="left">
                        Swap {formatNumberWithDown(fromAmount)} {fromCoin?.symbol} for {minimumReceived} {toCoin?.symbol}
                      </Text>
                    )}
                  </HStack>
                  {isPreLoading ? (
                    <Skeleton w="150px" h="16px" />
                  ) : (
                    <HStack w="100%" justify="space-between">
                      <HStack gap="4px">
                        <FreshProgressV2
                          callbackInterval={20}
                          ref={zapProgressRef}
                          min={0}
                          max={20}
                          size="14px"
                          noBg={true}
                          thickness="16px"
                          onClick={handleRefresh}
                        />
                        <HStack>
                          <Text fontSize="12px" color="text_paragraph">
                            Price Difference
                          </Text>
                          <Text color={priceImpactTextInfo?.textColor} fontSize="12px">
                            {priceImpactTextInfo?.priceImpactText}
                          </Text>
                          {sources?.map((source: any) => {
                            return <MarketSource key={source} market={source as MarketType} />
                          })}
                        </HStack>
                      </HStack>
                      <HStack align="center" gap="2px">
                        {notAllowSetSlippage ? (
                          <HStack gap="4px">
                            <Text fontSize="12px" color="text_paragraph">
                              Slippage
                            </Text>
                            <Text fontSize="12px" color="text_caption">
                              {d(liquiditySlippage).mul(100).toString()}%
                            </Text>
                          </HStack>
                        ) : (
                          <Slippage slippageType="liquidity" toolTipText="Slippage Tolerance" />
                        )}
                        <Icon xlinkHref="#icon-icon_arrow" svgW="12px" svgH="12px" transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} />
                      </HStack>
                    </HStack>
                  )}
                  {showPriceImpactTips && (
                    <Text fontSize="12px" color="primary_red" w="100%">
                      High price difference. Be cautious before submitting your order.
                    </Text>
                  )}
                </VStack>
              </HStack>
              {isOpen && (
                <HStack w="100%" justify="space-between" bg="bg_fifth" h="52px" borderRadius="12px" p="0px 8px">
                  <Text fontSize="12px" color="text_paragraph">
                    Swap Rate
                  </Text>
                  {isPreLoading ? (
                    <Skeleton w="150px" h="16px" />
                  ) : (
                    <HStack>
                      {isToggle ? (
                        <Text fontSize="12px" color="text_caption">
                          1 {toCoin?.symbol} = {formatPrice(1 / currentPriceRate)} {fromCoin?.symbol}
                        </Text>
                      ) : (
                        <Text fontSize="12px" color="text_caption">
                          1 {fromCoin?.symbol} = {formatPrice(currentPriceRate)} {toCoin?.symbol}
                        </Text>
                      )}
                      <Icon xlinkHref="#icon-icon_swap1" svgW="16px" svgH="16px" onClick={handleToggleRate} />
                    </HStack>
                  )}
                </HStack>
              )}
            </VStack>

            <VStack
              w="100%"
              p={inConfirmModal ? '16px 0px' : '16px 12px'}
              bg={inConfirmModal ? 'none' : 'button_outline_hov_bg'}
              borderRadius="12px"
              gap="12px"
            >
              {hideDepositRatio ? (
                <Text w="100%" textAlign="left" fontSize="12px" color="text_paragraph">
                  {action === 'Withdraw' ? 'Expected Amounts of Remove' : 'Expected Amounts to Add'}
                </Text>
              ) : (
                <DepositRatio
                  tokenA={tokenA}
                  tokenB={tokenB}
                  percentMap={percentMap}
                  type="zap"
                  isLoading={isPreLoading}
                  isReverse={zapApiPool?.isReverse}
                  label="Expected Amounts to Add"
                />
              )}
              <VStack
                bg="text_highlight_opacity.10"
                w="100%"
                justify="space-between"
                gap="12px"
                h="auto"
                align="start"
                borderRadius={{ base: '8px', lg: '12px' }}
                flexDir="column"
                p="12px"
              >
                <PosAmountInfo
                  token={displayTokenA}
                  amount={formatNumberWithDown(zapSlideValue == 100 ? originPosDisplayAmountA : displayCoinAmountA)}
                  rate={displayAmountARate}
                  loading={isPreLoading}
                />

                <PosAmountInfo
                  token={displayTokenB}
                  amount={formatNumberWithDown(zapSlideValue == 100 ? originPosDisplayAmountB : displayCoinAmountB)}
                  loading={isPreLoading}
                  rate={displayAmountBRate}
                />
              </VStack>
            </VStack>
            {/* )} */}
          </VStack>
        </VStack>
      )}
    </>
  )
}

function GridItemText({
  label,
  value,
  color,
  isLoading,
  sources
}: {
  label: string
  value: string
  color?: string
  isLoading?: boolean
  sources?: any
}) {
  return (
    <GridItem>
      <VStack>
        <Text fontSize="12px" color="text_paragraph">
          {label}
        </Text>
        {isLoading ? (
          <Skeleton w="150px" h="16px" />
        ) : (
          <HStack>
            <Text fontSize="12px" color={color || 'text_caption'}>
              {value}
            </Text>
            {sources?.map((source: any) => {
              return <MarketSource key={source} market={source as MarketType} />
            })}
          </HStack>
        )}
      </VStack>
    </GridItem>
  )

  function PosAmountInfo({ token, amount, rate, loading, align = 'left' }: { token: any; amount: any; rate: any; loading: boolean; align?: string }) {
    return (
      <HStack flex="1" gap="8px" p="12px" justify="flex-start" flexDirection={align === 'left' ? 'row' : 'row-reverse'}>
        {loading ? <SkeletonCircle size="20px" /> : <SingleCoinImage imageUrl={token?.logo_url} w="20px" h="20px" />}
        <VStack align={`flex-${align === 'left' ? 'start' : 'end'}`}>
          {loading ? (
            <Skeleton w="50px" h="14px" />
          ) : (
            <Text fontSize="14px" color="text_caption">
              {amount} {token?.symbol}
            </Text>
          )}
          {loading ? (
            <Skeleton w="100px" h="12px" />
          ) : (
            <Text fontSize="12px" color="text_paragraph">
              {/* {rate && !!+rate ? `${formatCurrencyWithKMB(rate, 2)}` : null} */}
              {formatCurrencyWithKMB(rate, 2)}
            </Text>
          )}
        </VStack>
      </HStack>
    )
  }
}

function PosAmountInfo({ token, amount, rate, loading, align = 'left' }: { token: any; amount: any; rate: any; loading: boolean; align?: string }) {
  return (
    <HStack flex="1" gap="8px" justify="flex-start" flexDirection={align === 'left' ? 'row' : 'row-reverse'}>
      {loading ? <SkeletonCircle size="20px" /> : <SingleCoinImage imageUrl={token?.logo_url} w="20px" h="20px" />}
      <VStack align={`flex-${align === 'left' ? 'start' : 'end'}`} gap="4px">
        {loading ? (
          <Skeleton w="50px" h="14px" />
        ) : (
          <Text fontSize="12px" color="text_caption">
            {amount} {token?.symbol}
          </Text>
        )}
        {loading ? (
          <Skeleton w="100px" h="12px" />
        ) : (
          <Text fontSize="12px" color="text_paragraph">
            {/* {rate && !!+rate ? `${formatCurrencyWithKMB(rate, 2)}` : null} */}
            {formatCurrencyWithKMB(rate, 2)}
          </Text>
        )}
      </VStack>
    </HStack>
  )
}
