import DepositRatio from '@/components/common/DepositRatio'
import FreshProgressV2 from '@/components/swap/FreshProgressV2'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useGlobalStore from '@/store/common/global'
import useZapStore from '@/store/zap/index'
import { calcCoinProportion, checkFullRange } from '@/utils/pool'
import { MarketSource, MarketType } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { bnToAmount, d, formatCurrencyWithKMB, formatNumberWithDown, formatPrice } from '@cetus/utils'
import { Grid, GridItem, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import Slippage from '../common/Slippage'

export default function ZapRouteOrigin({
  action,
  notAllowSetSlippage,
  zapProgressRef,
  reCalculateZapData,
  hideAmountInfo,
  hideDepositRatio
}: {
  action: 'Deposit' | 'Withdraw'
  zapProgressRef: any
  reCalculateZapData: () => void
  notAllowSetSlippage?: boolean
  hideAmountInfo?: boolean
  hideDepositRatio?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isOpenAmount, setIsOpenAmount] = useState(false)
  const { liquiditySlippage } = useGlobalStore()
  const { getTokenAmountValue } = useTokenPrice()

  const { preDepositeData, currentTokens, currentZapToken, zapAmount, isPreLoading, zapApiPool, lower, upper, zapCurrPriceData } = useZapStore()
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

  const { marketPrice, priceImpact, sources, priceImpactTextInfo, showPriceImpactTips } = usePriceImpact(fromCoin, toCoin, fromAmount, toAmount)

  // const zapSwapAmountPercent = useMemo(() => {
  //   if (action === 'Deposit' && fromAmount && zapAmount) {
  //     return fixDown(d(fromAmount).div(zapAmount).mul(100).toString(), 2)
  //   } else if (action === 'Withdraw' && toAmount && zapAmount) {
  //     // return fixDown(d(toAmount).div(zapAmount).mul(100).toString(), 2)
  //     return '100'
  //   }
  //   return '--'
  // }, [zapAmount, fromAmount, action])

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

  // 占比
  const [percentMap, setPercentMap] = useState<any>({})
  useEffect(() => {
    if (coinAmountA || coinAmountB) {
      const isFullRange = checkFullRange(lower, upper)
      const rateMap = calcCoinProportion(coinAmountA || 0, coinAmountB || 0, zapCurrPriceData?.currentPrice, isFullRange)
      setPercentMap(rateMap)
    }
  }, [coinAmountA, coinAmountB, zapCurrPriceData?.currentPrice])

  return (
    <>
      {Number(zapAmount) > 0 && Number(fromAmount) > 0 && (
        <VStack w="100%" gap="12px" p="16px 0px">
          <HStack w="100%" justify="space-between">
            <Text fontSize="14px" color="text_paragraph">
              Zap Route
            </Text>
          </HStack>
          <VStack w="100%" bg="card_bg" borderRadius="12px" p="12px">
            <HStack w="100%" align="center">
              <VStack w="100%" align="flex-start">
                <HStack w="100%" justify="flex-start">
                  {/* <CoinPairImage
                    coinAIconUrl={fromCoin?.logo_url}
                    coinBIconUrl={toCoin?.logo_url}
                    coinACoinType=""
                    coinBCoinType=""
                    w="28px"
                    h="28px"
                  /> */}
                  {isPreLoading ? (
                    <Skeleton w="100%" h="16px" />
                  ) : (
                    <Text w="100%" fontSize="12px" color="text_caption" textAlign="left">
                      {/* Auto-swap {zapSwapAmountPercent}% {fromCoin?.symbol} → {toCoin?.symbol} to match the price range */}
                      1. Swap {formatNumberWithDown(fromAmount)} {fromCoin?.symbol} for {formatNumberWithDown(toAmount)} {toCoin?.symbol}
                    </Text>
                  )}
                </HStack>
                {isPreLoading ? (
                  <Skeleton w="150px" h="16px" />
                ) : (
                  <HStack w="100%" justify="space-between">
                    <HStack gap="4px">
                      <FreshProgressV2 callbackInterval={20} ref={zapProgressRef} min={0} max={20} size="12px" noBg={true} onClick={handleRefresh} />
                      <Text fontSize="12px" color="text_paragraph">
                        Swap Rate
                      </Text>
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
                    <HStack align="center">
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
                      <Icon
                        xlinkHref="#icon-icon_arrow"
                        svgW="12px"
                        svgH="12px"
                        transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                        onClick={() => {
                          setIsOpen(!isOpen)
                        }}
                      />
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
              <Grid
                w="100%"
                templateColumns={['1fr', '1fr 1fr']}
                gap={4}
                p="16px 0px"
                bg="bg_secondary"
                border="1px solid"
                borderColor="border"
                borderRadius="12px"
              >
                <GridItemText label="Amount In" value={`${formatNumberWithDown(fromAmount)} ${fromCoin?.symbol}`} isLoading={isPreLoading} />
                <GridItemText label="Expected Amount Out" value={`${formatNumberWithDown(toAmount)} ${toCoin?.symbol}`} isLoading={isPreLoading} />
                <GridItemText label="Minimum Received" value={`${minimumReceived} ${toCoin?.symbol}`} isLoading={isPreLoading} />
                {!!priceImpactTextInfo?.priceImpactText && (
                  <GridItemText
                    label="Price Difference"
                    value={priceImpactTextInfo?.priceImpactText}
                    color={priceImpactTextInfo?.textColor}
                    sources={sources}
                    isLoading={isPreLoading}
                  />
                )}
              </Grid>
            )}
            <VStack w="100%" justify="space-between" mt="10px">
              <HStack w="100%">
                {isPreLoading ? (
                  <Skeleton w="100%" h="16px" />
                ) : (
                  <Text w="100%" fontSize="12px" color="text_caption" textAlign="left">
                    2. Add liquidity with {formatNumberWithDown(displayCoinAmountA)} {displayTokenA?.symbol} and{' '}
                    {formatNumberWithDown(displayCoinAmountB)} {displayTokenB?.symbol}
                  </Text>
                )}
                <Icon
                  xlinkHref="#icon-icon_arrow"
                  svgW="12px"
                  svgH="12px"
                  transform={isOpenAmount ? 'rotate(180deg)' : 'rotate(0deg)'}
                  onClick={() => {
                    setIsOpenAmount(!isOpenAmount)
                  }}
                />
              </HStack>
              {isOpenAmount && (
                <VStack w="100%" p="16px" bg="bg_secondary" border="1px solid" borderColor="border" borderRadius="12px" gap="20px">
                  {hideDepositRatio ? (
                    <Text w="100%" textAlign="left" fontSize="12px" color="text_paragraph">
                      Your Position will be
                    </Text>
                  ) : (
                    <DepositRatio
                      tokenA={tokenA}
                      tokenB={tokenB}
                      percentMap={percentMap}
                      type="zap"
                      isLoading={isPreLoading}
                      isReverse={zapApiPool?.isReverse}
                    />
                  )}
                  <VStack
                    bg="text_highlight_opacity.10"
                    w="100%"
                    justify="space-between"
                    gap="12px"
                    p="12px"
                    h="auto"
                    align="start"
                    borderRadius={{ base: '8px', lg: '12px' }}
                  >
                    <PosAmountInfo
                      token={displayTokenA}
                      amount={formatNumberWithDown(displayCoinAmountA)}
                      rate={displayAmountARate}
                      loading={isPreLoading}
                    />
                    <PosAmountInfo
                      token={displayTokenB}
                      amount={formatNumberWithDown(displayCoinAmountB)}
                      loading={isPreLoading}
                      rate={displayAmountBRate}
                    />
                  </VStack>
                </VStack>
              )}
            </VStack>
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
      <VStack align={`flex-${align === 'left' ? 'start' : 'end'}`}>
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
