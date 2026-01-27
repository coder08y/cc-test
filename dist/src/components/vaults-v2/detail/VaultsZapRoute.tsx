import FreshProgressV2 from '@/components/swap/FreshProgressV2'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useGetPythTokenPrice from '@/hooks/vault-v2/pyth-price/useGetPythTokenPrice'
import useGlobalStore from '@/store/common/global'
import { MarketSource, MarketType } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, d, formatCurrencyWithKMB, formatNumberWithDown, formatPrice, fromDecimalsAmountFix } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Box, HStack, Skeleton, SkeletonCircle, StackProps, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

export interface VaultsZapProps {
  action: 'Deposit' | 'Withdraw'
  isZapCoinA: boolean
  zapAmount: string
  swap_in_amount: string
  swap_out_amount: string
  coinA: Token
  coinB: Token
  coin_amount_a: string
  coin_amount_b: string
  re_balance: any
  category: string
  isReverse: boolean
}

export default function VaultsZapRoute({
  zapProgressRef,
  hideDepositRatio,
  inConfirmModal,
  zapProps,
  warpStyle,
  zapPreCalcLoading,
  reCalculateZapData,
  children
}: {
  zapProgressRef: any
  hideAmountInfo?: boolean
  hideDepositRatio?: boolean
  inConfirmModal?: boolean
  zapProps: VaultsZapProps
  zapPreCalcLoading: boolean
  reCalculateZapData: () => void
  warpStyle?: StackProps
  children?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { liquiditySlippage } = useGlobalStore()
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()
  const { getTokenAmountValue } = useTokenPrice()
  const { isZapCoinA, action, coinB, coinA, swap_in_amount, swap_out_amount, isReverse, coin_amount_a, coin_amount_b, category } = zapProps

  const fromCoin = useMemo(() => {
    if (action === 'Withdraw') {
      return isZapCoinA ? coinB : coinA
    }
    return isZapCoinA ? coinA : coinB
  }, [isZapCoinA, coinA, coinB])
  const toCoin = useMemo(() => {
    if (action === 'Withdraw') {
      return isZapCoinA ? coinA : coinB
    }
    return isZapCoinA ? coinB : coinA
  }, [isZapCoinA, coinA, coinB])

  const [isToggle, setIsToggle] = useState(false)

  const handleToggleRate = () => {
    setIsToggle(!isToggle)
  }

  const swap_out_amount_format = useMemo(() => {
    return fromDecimalsAmount(swap_out_amount, toCoin?.decimals).toString()
  }, [swap_out_amount, toCoin?.coin_type])

  const swap_in_amount_format = useMemo(() => {
    return fromDecimalsAmount(swap_in_amount, fromCoin?.decimals).toString()
  }, [swap_in_amount, fromCoin])

  const coin_amount_a_format = useMemo(() => {
    return fromDecimalsAmountFix(coin_amount_a, coinA?.decimals).toString()
  }, [coin_amount_a, coinA.coin_type])

  const coin_amount_b_format = useMemo(() => {
    return fromDecimalsAmountFix(coin_amount_b, coinB?.decimals).toString()
  }, [coin_amount_b, coinB.coin_type])

  const usePyth = category !== 'cetus'

  const { sources, priceImpactTextInfo, showPriceImpactTips, showIncalculable } = usePriceImpact(
    fromCoin,
    toCoin,
    swap_in_amount_format,
    swap_out_amount_format,
    false,
    usePyth
  )

  const minimumReceived = useMemo(() => {
    if (swap_out_amount_format) {
      return formatNumberWithDown(d(swap_out_amount_format).sub(d(swap_out_amount_format).mul(liquiditySlippage)).toString())
    }
    return '--'
  }, [liquiditySlippage, swap_out_amount_format])

  const handleRefresh = () => {
    console.log('ZapRoute handleRefresh')
    reCalculateZapData()
  }

  const swap_price = useMemo(() => {
    return d(swap_out_amount_format).div(swap_in_amount_format).toString()
  }, [swap_out_amount_format, swap_in_amount_format])

  // 占比
  // const [percentMap, setPercentMap] = useState<any>({})
  // useEffect(() => {
  //   if (coin_amount_a_format && coin_amount_b_format && coinA && coinB) {
  //     const rateMap = calcCoinProportion(coin_amount_a_format, coin_amount_b_format, currentPrice || '0', false)
  //     setPercentMap(rateMap)
  //   }
  // }, [coin_amount_a_format, coin_amount_b_format, currentPrice, coinA])

  const [isOpenRoute, setIsOpenRoute] = useState(false)

  const { isApp } = useWindowWidth()

  return (
    <>
      {swap_in_amount_format && Number(swap_in_amount_format) > 0 && (
        <VStack w="100%" gap="12px" pt={inConfirmModal ? '0px' : '16px'} pb={inConfirmModal ? '0px' : '16px'} {...warpStyle}>
          <HStack w="100%" justify="space-between" cursor="pointer" onClick={() => setIsOpenRoute(!isOpenRoute)}>
            <Text fontSize={{ base: '12px', lg: '14px' }} color="primary_gray">
              Zap Route
            </Text>
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
              {isApp ? (
                <Icon xlinkHref="#icon-detail" svgW="14px" svgH="14px" transform={isOpenRoute ? 'rotate(270deg)' : 'rotate(90deg)'} />
              ) : (
                <Icon xlinkHref="#icon-icon_arrow" svgW="14px" svgH="14px" transform={isOpenRoute ? 'rotate(180deg)' : 'rotate(0deg)'} />
              )}
            </HStack>
          </HStack>
          {children}
          {isOpenRoute && (
            <>
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
                  <HStack
                    w="100%"
                    align="center"
                    onClick={() => {
                      setIsOpen(!isOpen)
                    }}
                  >
                    <VStack w="100%" align="flex-start">
                      <HStack w="100%" justify="flex-start">
                        {zapPreCalcLoading ? (
                          <Skeleton w="100%" h="16px" />
                        ) : (
                          <HStack w="100%" justify="flex-start">
                            <Box as="span" w="4px" minW="4px" h="4px" bg="rgba(255,255,255,0.3)" borderRadius="50%" zIndex="999" />
                            <Text fontSize="12px" color="text_caption" textAlign="left">
                              Swap {formatNumberWithDown(swap_in_amount_format)} {fromCoin?.symbol} for {minimumReceived} {toCoin?.symbol}
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                      {zapPreCalcLoading ? (
                        <Skeleton w="150px" h="16px" />
                      ) : (
                        <HStack w="100%" justify="space-between">
                          <HStack gap="4px" ml="12px">
                            <HStack>
                              <Text fontSize="12px" color="text_paragraph">
                                Price Difference
                              </Text>
                              <Text color={priceImpactTextInfo?.textColor} fontSize="12px">
                                {priceImpactTextInfo?.priceImpactText}
                              </Text>
                              {!showIncalculable &&
                                sources?.map((source: any) => {
                                  return <MarketSource key={source} market={source as MarketType} />
                                })}
                            </HStack>
                          </HStack>
                        </HStack>
                      )}
                      {showPriceImpactTips && (
                        <Text fontSize="12px" color="primary_red" w="100%">
                          High price difference. Be cautious before submitting your order.
                        </Text>
                      )}
                    </VStack>
                    <Icon xlinkHref="#icon-icon_arrow" svgW="12px" svgH="12px" transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} />
                  </HStack>
                  {isOpen && (
                    <HStack w="100%" justify="space-between" bg="bg_fifth" h="52px" borderRadius="12px" p="0px 8px">
                      <Text fontSize="12px" color="text_paragraph">
                        Swap Rate
                      </Text>
                      {zapPreCalcLoading ? (
                        <Skeleton w="150px" h="16px" />
                      ) : (
                        <HStack>
                          {isToggle ? (
                            <Text fontSize="12px" color="text_caption">
                              1 {toCoin?.symbol} = {formatPrice(d(1).div(swap_price).toString())} {fromCoin?.symbol}
                            </Text>
                          ) : (
                            <Text fontSize="12px" color="text_caption">
                              1 {fromCoin?.symbol} = {formatPrice(swap_price)} {toCoin?.symbol}
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
                  <Text w="100%" textAlign="left" fontSize="12px" color="text_paragraph">
                    {action === 'Withdraw' ? 'Expected Amounts of Remove' : 'Expected Amounts to Add'}
                  </Text>
                  <VStack
                    bg="text_highlight_opacity.10"
                    w="100%"
                    justify="space-between"
                    gap="12px"
                    p="12px"
                    h="auto"
                    align="start"
                    borderRadius={{ base: '8px', lg: '12px' }}
                    flexDirection={isReverse ? 'column-reverse' : 'column'}
                  >
                    <PosAmountInfo
                      token={coinA}
                      amount={addComma(coin_amount_a_format)}
                      align="left"
                      rate={
                        usePyth
                          ? getTokenAmountValueByPyth(coinA?.coin_type, coin_amount_a_format)
                          : getTokenAmountValue(coinA?.coin_type, coin_amount_a_format)
                      }
                      loading={zapPreCalcLoading}
                    />

                    <PosAmountInfo
                      token={coinB}
                      amount={addComma(coin_amount_b_format)}
                      loading={zapPreCalcLoading}
                      align="left"
                      rate={
                        usePyth
                          ? getTokenAmountValueByPyth(coinB?.coin_type, coin_amount_b_format)
                          : getTokenAmountValue(coinB?.coin_type, coin_amount_b_format)
                      }
                    />
                  </VStack>
                </VStack>
                {/* )} */}
              </VStack>
            </>
          )}
        </VStack>
      )}
    </>
  )
}

function PosAmountInfo({ token, amount, rate, loading, align = 'left' }: { token: any; amount: any; rate: any; loading: boolean; align?: string }) {
  return (
    <HStack flex="1" gap="8px" justify="flex-start" flexDirection={align === 'left' ? 'row' : 'row-reverse'}>
      {loading ? <SkeletonCircle size="20px" /> : <SingleCoinImage imageUrl={token?.logo_url} w="20px" h="20px" />}
      <VStack align={`flex-${align === 'left' ? 'start' : 'end'}`} gap="4px">
        {loading ? (
          <Skeleton w="50px" h="14px" />
        ) : (
          <Text fontSize="12px" color="text_caption" whiteSpace="nowrap">
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
