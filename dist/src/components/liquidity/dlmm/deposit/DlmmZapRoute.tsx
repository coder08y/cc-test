import DepositRatio from '@/components/common/DepositRatio'
import FreshProgressV2 from '@/components/swap/FreshProgressV2'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useGlobalStore from '@/store/common/global'
import { calcCoinProportion } from '@/utils/pool'
import { MarketSource, MarketType } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { d, formatCurrencyWithKMB, formatNumberWithDown, formatPrice } from '@cetus/utils'
import { fixCoinType, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Box, HStack, Skeleton, SkeletonCircle, StackProps, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { DLMMZapProps } from './type'

export default function DlmmZapRoute({
  notAllowSetSlippage,
  zapProgressRef,
  hideDepositRatio,
  inConfirmModal,
  zapProps,
  warpStyle,
  children,
  currentRangeTab
}: {
  zapProgressRef: any
  notAllowSetSlippage?: boolean
  hideAmountInfo?: boolean
  hideDepositRatio?: boolean
  inConfirmModal?: boolean
  zapProps: DLMMZapProps
  warpStyle?: StackProps
  children?: React.ReactNode
  currentRangeTab?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { liquiditySlippage } = useGlobalStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { coinA, coinB, zapCoin, action, preDepositResult, preWithdrawResult, zapAmount, zapPreCalcLoading, current_price, reCalculateZapData } =
    zapProps

  const preResult = useMemo(() => {
    return action === 'Deposit' ? preDepositResult : preWithdrawResult
  }, [preDepositResult, preWithdrawResult])

  const isZapCoinA = useMemo(() => {
    return coinA?.coin_type === zapCoin?.coin_type
  }, [coinA?.coin_type, zapCoin?.coin_type])

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

  const { swap_in_amount, swap_out_amount, swap_price } = useMemo(() => {
    if (preResult?.swap_result && fromCoin && toCoin) {
      const { swap_in_amount, swap_out_amount } = preResult.swap_result
      const swap_in_amount_f = fromDecimalsAmount(swap_in_amount, fromCoin.decimals).toString()
      const swap_out_amount_f = fromDecimalsAmount(swap_out_amount, toCoin!.decimals)
      return {
        swap_in_amount: swap_in_amount_f,
        swap_out_amount: swap_out_amount_f,
        swap_price: d(swap_out_amount_f).div(swap_in_amount_f).toString()
      }
    }
    return { swap_in_amount: undefined, swap_out_amount: undefined, swap_price: undefined }
  }, [preResult?.swap_result, isZapCoinA, fromCoin, toCoin])

  const { coin_amount_a, coin_amount_b } = useMemo(() => {
    if (preResult && coinA && coinB) {
      const { amount_a, amount_b } = action === 'Deposit' ? preDepositResult!.bin_infos : preWithdrawResult!.remove_liquidity_info
      const coin_amount_a = fromDecimalsAmount(amount_a, coinA.decimals).toString()
      const coin_amount_b = fromDecimalsAmount(amount_b, coinB.decimals).toString()
      return {
        coin_amount_a,
        coin_amount_b
      }
    }
    return { coin_amount_a: undefined, coin_amount_b: undefined }
  }, [preResult, coinA])

  const { sources, priceImpactTextInfo, showPriceImpactTips, showIncalculable } = usePriceImpact(fromCoin, toCoin, swap_in_amount, swap_out_amount)

  const [isToggle, setIsToggle] = useState(false)

  const is_reverse = useMemo(() => {
    if (!currentRangeTab || !coinB?.coin_type) {
      return false
    }
    return fixCoinType(currentRangeTab) === fixCoinType(coinB?.coin_type)
  }, [currentRangeTab, coinB?.coin_type])

  const handleToggleRate = () => {
    setIsToggle(!isToggle)
  }

  const minimumReceived = useMemo(() => {
    if (swap_out_amount) {
      const minimumReceived = d(swap_out_amount).mul(1 - Number(liquiditySlippage))
      return formatNumberWithDown(minimumReceived.toString(), toCoin?.decimals)
    }
    return '--'
  }, [liquiditySlippage, swap_out_amount])

  const handleRefresh = () => {
    console.log('ZapRoute handleRefresh')
    reCalculateZapData()
  }

  // 占比
  const [percentMap, setPercentMap] = useState<any>({})
  useEffect(() => {
    if (coin_amount_a && coin_amount_b && coinA && coinB && current_price) {
      console.log('🚀 ~ useEffect ~ coin_amount_a:', {
        coin_amount_a,
        coin_amount_b,
        current_price
      })
      const rateMap = calcCoinProportion(coin_amount_a, coin_amount_b, current_price || '0', false)
      setPercentMap(rateMap)
    }
  }, [coin_amount_a, coin_amount_b, current_price, coinA])

  const [isOpenRoute, setIsOpenRoute] = useState(false)
  const { isApp } = useWindowWidth()

  // 处理打开/关闭 Zap Route 弹窗
  const handleToggleRoute = () => {
    setIsOpenRoute(!isOpenRoute)
  }

  // 处理关闭 Zap Route 弹窗
  const handleCloseRoute = () => {
    setIsOpenRoute(false)
  }

  return (
    <>
      {Number(zapAmount) > 0 && swap_in_amount && Number(swap_in_amount) > 0 && (
        <VStack w="100%" gap="12px" pt={inConfirmModal ? '0px' : '16px'} pb={inConfirmModal ? '0px' : '16px'} {...warpStyle}>
          <HStack w="100%" justify="space-between" cursor="pointer" onClick={handleToggleRoute}>
            <Text fontSize={{ base: '12px', lg: '14px' }} color="text_paragraph">
              Zap Route
            </Text>
            <HStack gap="4px">
              <FreshProgressV2
                callbackInterval={20}
                ref={zapProgressRef}
                min={0}
                max={20}
                size={isApp ? '12px' : '14px'}
                noBg={true}
                thickness="16px"
                onClick={handleRefresh}
              />
              {/* {isApp && !inConfirmModal ? (
                <Icon xlinkHref='#icon-detail' svgW='12px' svgH='12px' />
              ) : ( */}
              {isApp ? (
                <Icon xlinkHref="#icon-detail" svgW="14px" svgH="14px" transform={isOpenRoute ? 'rotate(270deg)' : 'rotate(90deg)'} />
              ) : (
                <Icon xlinkHref="#icon-icon_arrow" svgW="14px" svgH="14px" transform={isOpenRoute ? 'rotate(180deg)' : 'rotate(0deg)'} />
              )}

              {/* )} */}
            </HStack>
          </HStack>
          {children}
          {isOpenRoute && (
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
                      {zapPreCalcLoading ? (
                        <Skeleton w="100%" h="16px" />
                      ) : (
                        <HStack w="100%" justify="flex-start">
                          <Box as="span" w="4px" minW="4px" h="4px" bg="rgba(255,255,255,0.3)" borderRadius="50%" zIndex="999" />
                          <Text fontSize="12px" color="text_caption" textAlign="left">
                            Swap {formatNumberWithDown(swap_in_amount)} {fromCoin?.symbol} for {minimumReceived} {toCoin?.symbol}
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
                        <HStack align="center" gap="2px">
                          {/* {notAllowSetSlippage ? (
                            <HStack gap="4px">
                              <Text fontSize="12px" color="text_paragraph">
                                Slippage
                              </Text>
                              <Text fontSize="12px" color="text_caption">
                                {d(liquiditySlippage).mul(100).toString()}%
                              </Text>
                            </HStack>
                          ) : (
                            <Slippage slippageType="dlmm_zap" poolType="dlmm" toolTipText="Slippage Tolerance" isModal={true} />
                          )} */}
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
                {hideDepositRatio ? (
                  <Text w="100%" textAlign="left" fontSize="12px" color="text_paragraph">
                    {action === 'Withdraw' ? 'Expected Amounts of Remove' : 'Expected Amounts to Add'}
                  </Text>
                ) : (
                  <DepositRatio
                    tokenA={coinA}
                    tokenB={coinB}
                    percentMap={percentMap}
                    type="dlmm_zap"
                    isLoading={zapPreCalcLoading}
                    isReverse={is_reverse}
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
                  flexDirection={is_reverse ? 'column-reverse' : 'column'}
                  p="12px"
                >
                  <PosAmountInfo
                    token={coinA}
                    amount={formatNumberWithDown(coin_amount_a)}
                    rate={getTokenAmountValue(coinA?.coin_type, coin_amount_a)}
                    align="left"
                    loading={zapPreCalcLoading}
                  />

                  <PosAmountInfo
                    token={coinB}
                    amount={formatNumberWithDown(coin_amount_b)}
                    loading={zapPreCalcLoading}
                    align="left"
                    rate={getTokenAmountValue(coinB?.coin_type, coin_amount_b)}
                  />
                </VStack>
              </VStack>
              {/* )} */}
            </VStack>
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
