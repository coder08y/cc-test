import FreshProgressV2 from '@/components/swap/FreshProgressV2'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useGetPythTokenPrice from '@/hooks/vault-v2/pyth-price/useGetPythTokenPrice'
import useGlobalStore from '@/store/common/global'
import { MigrateAmountResult, MigrateSwapResult } from '@/types/vaults-v2'
import { MarketSource, MarketType } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, d, formatCurrencyWithKMB, formatNumberWithDown, formatPrice } from '@cetus/utils'
import { Box, HStack, Skeleton, SkeletonCircle, StackProps, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

export interface VaultsMigrateRouteProps {
  coinA: Token
  coinB: Token
  // 存入
  deposit: MigrateAmountResult
  // swap
  swap_results: MigrateSwapResult[]
  isReverse: boolean
  category: string
}

export default function VaultsMigrateRoute({
  zapProgressRef,
  hideDepositRatio,
  inConfirmModal,
  migrateRouteProps,
  warpStyle,
  migratePreCalcLoading,
  reCalculateZapData,
  children
}: {
  zapProgressRef: any
  hideAmountInfo?: boolean
  hideDepositRatio?: boolean
  inConfirmModal?: boolean
  migrateRouteProps: VaultsMigrateRouteProps
  migratePreCalcLoading: boolean
  reCalculateZapData: () => void
  warpStyle?: StackProps
  children?: React.ReactNode
}) {
  const { liquiditySlippage } = useGlobalStore()
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()
  const { getTokenAmountValue } = useTokenPrice()
  const { coinB, coinA, isReverse, category, swap_results, deposit } = migrateRouteProps

  const usePyth = category !== 'cetus'

  const handleRefresh = () => {
    console.log('ZapRoute handleRefresh')
    reCalculateZapData()
  }

  const [isOpenRoute, setIsOpenRoute] = useState(false)
  const { isApp } = useWindowWidth()

  return (
    <>
      <VStack w="100%" gap="12px" pt={inConfirmModal ? '0px' : '16px'} pb={inConfirmModal ? '0px' : '16px'} {...warpStyle}>
        <HStack w="100%" justify="space-between" cursor="pointer" onClick={() => setIsOpenRoute(!isOpenRoute)}>
          <Text fontSize="14px" color="primary_gray">
            Route
          </Text>
          <HStack gap="0px">
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
            <Icon xlinkHref="#icon-icon_arrow" svgW="12px" svgH="12px" transform={isOpenRoute ? 'rotate(180deg)' : 'rotate(0deg)'} />
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
              flexDirection={false ? 'column-reverse' : 'column'}
            >
              {swap_results.length > 0 && (
                <VStack
                  w="100%"
                  align="flex-start"
                  bg={inConfirmModal ? 'none' : 'button_outline_hov_bg'}
                  p={inConfirmModal ? '16px 0px' : '16px 12px'}
                  gap="16px"
                  borderRadius={inConfirmModal ? '0px' : '12px'}
                  borderBottom="1px solid"
                  borderColor={inConfirmModal ? 'border' : 'rgba(0,0,0,0)'}
                >
                  {swap_results.map((swapResult, index) => (
                    <MigrateRouteItem
                      key={index}
                      swapResult={swapResult}
                      loading={migratePreCalcLoading}
                      usePyth={usePyth}
                      slippage={Number(liquiditySlippage)}
                      inConfirmModal={inConfirmModal || false}
                    />
                  ))}
                </VStack>
              )}

              <VStack
                w="100%"
                p={inConfirmModal ? '16px 0px' : '16px 12px'}
                bg={inConfirmModal ? 'none' : 'button_outline_hov_bg'}
                borderRadius="12px"
                gap="12px"
              >
                <Text w="100%" textAlign="left" fontSize="12px" color="text_paragraph">
                  {false ? 'Expected Amounts of Remove' : 'Expected Amounts to Add'}
                </Text>
                <VStack
                  bg="text_highlight_opacity.10"
                  w="100%"
                  gap="12px"
                  justify="space-between"
                  h="auto"
                  align="start"
                  borderRadius={{ base: '8px', lg: '12px' }}
                  flexDirection={isReverse ? 'column-reverse' : 'column'}
                  p="12px"
                >
                  <PosAmountInfo
                    token={coinA}
                    amount={addComma(deposit.amount_a_display)}
                    align="left"
                    rate={deposit.amount_value_a}
                    loading={migratePreCalcLoading}
                  />

                  <PosAmountInfo
                    token={coinB}
                    amount={addComma(deposit.amount_b_display)}
                    loading={migratePreCalcLoading}
                    align="left"
                    rate={deposit.amount_value_b}
                  />
                </VStack>
              </VStack>
              {/* )} */}
            </VStack>
          </>
        )}
      </VStack>
    </>
  )
}

type MigrateRouteItemProps = {
  swapResult: MigrateSwapResult
  loading: boolean
  usePyth: boolean
  slippage: number
  inConfirmModal: boolean
}

function MigrateRouteItem({ swapResult, loading, usePyth, slippage, inConfirmModal }: MigrateRouteItemProps) {
  const {
    in_token: fromCoin,
    out_token: toCoin,
    swap_in_amount_display: swap_in_amount_format,
    swap_out_amount_display: swap_out_amount_format
  } = swapResult
  const { sources, priceImpactTextInfo, showPriceImpactTips } = usePriceImpact(
    fromCoin,
    toCoin,
    swap_in_amount_format,
    swap_out_amount_format,
    false,
    usePyth
  )
  const [isToggle, setIsToggle] = useState(false)

  const handleToggleRate = () => {
    setIsToggle(!isToggle)
  }

  const [isOpen, setIsOpen] = useState(false)

  const minimumReceived = useMemo(() => {
    if (swap_out_amount_format) {
      return formatNumberWithDown(d(swap_out_amount_format).sub(d(swap_out_amount_format).mul(slippage)).toString())
    }
    return '--'
  }, [slippage, swap_out_amount_format])

  const swap_price = useMemo(() => {
    return d(swap_out_amount_format).div(swap_in_amount_format).toString()
  }, [swap_out_amount_format, swap_in_amount_format])

  return (
    <VStack w="100%" align="flex-start">
      <HStack
        w="100%"
        align="center"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        <VStack w="100%" align="flex-start">
          <HStack w="100%" justify="flex-start">
            {loading ? (
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
          {loading ? (
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
                  {sources?.map((source: any) => {
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
          {loading ? (
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
