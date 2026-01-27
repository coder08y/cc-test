import { useRefValue } from '@/hooks/common/useRefValue'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import { useGetAmountLimit, useGetPriceAcceptRouterData } from '@/hooks/swap/useSwapHelper'
import useGlobalStore from '@/store/common/global'
import useProStore from '@/store/pro'
import { SwapRfqData, SwapRouterData } from '@/types/swap'
import { CurrentPrice, TradeConfirmAmountInfo } from '@cetus/design'
import { Token } from '@cetus/types'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { Decimal, formatNumber } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import cloneDeep from 'lodash-es/cloneDeep'
import { useEffect, useMemo, useRef, useState } from 'react'
import PriceImpact from '../swap/PriceImpact'
import SolidPieCountdown from './rfq/SolidPieCountdown'

type SwapConfirmBlockProps = {
  data: SwapRouterData | SwapRfqData
  lastRouterData?: SwapRouterData
  fromCoin: Token
  toCoin: Token
  isWidget: boolean
  isSelectedRfq: boolean
  rftCountdownFlagRef?: React.MutableRefObject<number | undefined>
  onClose: () => void
  handleRouterSwap: (data: SwapRouterData | SwapRfqData) => void
}

export default function SwapConfirmBlock(props: SwapConfirmBlockProps) {
  const { lastRouterData, fromCoin, toCoin, onClose, data, handleRouterSwap, isWidget, isSelectedRfq = false, rftCountdownFlagRef } = props
  const { slippage } = useGlobalStore()
  const rftCountdownFlag = useRefValue(rftCountdownFlagRef)

  const [countDownEnd, setCountDownEnd] = useState<boolean>(false)

  const isClicking = useRef(false)
  // 原始值
  const [originData, setOriginData] = useState<SwapRouterData | SwapRfqData>(data)

  const fromAmountUi = useMemo(() => {
    return isSelectedRfq ? originData?.fromAmountUi : originData?.fromAmountUi
  }, [originData])

  const toAmountUi = useMemo(() => {
    return isSelectedRfq ? originData?.toAmountUi : originData?.toAmountUi
  }, [originData])

  const originRouterData = useMemo(() => {
    return isSelectedRfq ? undefined : (originData as SwapRouterData)
  }, [originData])

  const originRfqData = useMemo(() => {
    return isSelectedRfq ? (originData as SwapRfqData) : undefined
  }, [originData])

  // 计算最小接收/最大付出
  const { amountLimit } = useGetAmountLimit(slippage, originRouterData)

  // 用户点击了 忽视PriceImpact
  const [ignorePriceImpact, setIgnorePriceImpact] = useState<boolean>(false)

  useEffect(() => {
    if (rftCountdownFlag !== undefined && rftCountdownFlag <= 0) {
      setCountDownEnd(true)
    }
  }, [rftCountdownFlag])

  // 计算价差
  const {
    priceImpactTextInfo,
    marketPrice,
    sources: priceSources,
    showPriceImpactTips,
    showPriceImpactWarn,
    showIncalculable
  } = usePriceImpact(fromCoin, toCoin, fromAmountUi, toAmountUi)

  // 如兑换价格和原始值不一致，返回变动后对象
  const { priceAcceptRouterData } = useGetPriceAcceptRouterData(originRouterData, lastRouterData)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const showPriceUpdated = useMemo(() => {
    return isSelectedRfq ? false : priceAcceptRouterData !== undefined
  }, [priceAcceptRouterData, isSelectedRfq])

  const amountLimitCoin = useMemo(() => {
    return originRouterData?.byAmountIn ? toCoin : fromCoin
  }, [originData])

  const handlePriceAcceptClick = () => {
    if (priceAcceptRouterData) {
      if (isClicking.current) return
      isClicking.current = true

      const safeData = cloneDeep(priceAcceptRouterData)
      setOriginData({ ...safeData })

      setTimeout(() => {
        isClicking.current = false
      }, 300)
    }
  }

  const buttonDisabled = useMemo(() => {
    if (ignorePriceImpact) {
      return false
    }

    if (showPriceImpactWarn) {
      return true
    }
    return false
  }, [ignorePriceImpact, showPriceImpactWarn])

  const showButton = useMemo(() => {
    if (isSelectedRfq) {
      return !countDownEnd
    }
    return !showPriceUpdated
  }, [isSelectedRfq, countDownEnd, showPriceUpdated])
  const { isProMode, currentProTab } = useProStore()

  const buttonText = useMemo(() => {
    if (isSelectedRfq) {
      return 'Trade'
    }
    return isProMode && !isWidget ? currentProTab : 'Confirm Swap'
  }, [isSelectedRfq, isProMode, isWidget, currentProTab])

  return (
    <VStack textAlign="center" gap="0px" p="0px" w="100%">
      <VStack w="100%" gap="16px" pl="16px" pr="16px" pb={isSelectedRfq ? '12px' : '24px'}>
        {/* 交易数量展示 */}
        <TradeConfirmAmountInfo
          bg={isWidget ? 'swap_bg_primary' : 'bg_primary'}
          coinA={{
            amount: fromAmountUi || '0',
            ...(fromCoin as Token)
          }}
          iconParams={{
            xlinkHref: '#icon-a-icon_trade',
            svgFill: 'text_caption',
            fontSize: '12px'
          }}
          coinB={{
            amount: toAmountUi || '0',
            ...(toCoin as Token)
          }}
        />
        {/* 价格 */}
        <HStack
          w="100%"
          minH="48px"
          bg={isWidget ? 'swap_bg_primary' : 'bg_primary'}
          borderRadius="8px"
          border="1px solid"
          borderColor="border"
          justifyContent="center"
          zIndex="100"
        >
          <CurrentPrice fromToken={fromCoin!} toToken={toCoin!} fromValue={fromAmountUi} toValue={toAmountUi} color="text_caption" />
        </HStack>
        {/* 价格提示	 */}
        {showPriceImpactTips && (
          <HStack
            zIndex="99"
            w="100%"
            mt="-26px"
            bg={showPriceImpactWarn ? 'primary_red_opacity.10' : 'primary_yellow_opacity.10'}
            borderRadius="12px"
            border="1px solid"
            borderColor="border"
            justifyContent="center"
            p="18px 16px 10px"
          >
            <Text color={showPriceImpactWarn ? 'primary_red' : 'primary_yellow'} fontSize="12px" lineHeight="20px" textAlign="start" fontWeight="500">
              High price difference. Be cautious before submitting your order.
            </Text>
          </HStack>
        )}
        {!isSelectedRfq && (
          <HTextLabelBox
            wrapStyle={{ h: '20px', lineHeight: '20px' }}
            label="Slippage Tolerance"
            labelStyle={{
              fontSize: '14px'
            }}
            value={`${d(slippage).mul(100)}%`}
            valueStyle={{
              fontSize: '14px'
            }}
          />
        )}
        {!isSelectedRfq && (
          <HTextLabelBox
            wrapStyle={{ h: '20px', lineHeight: '20px' }}
            label={originRouterData?.byAmountIn ? 'Minimum Received' : 'Maximum Input'}
            labelStyle={{
              fontSize: '14px'
            }}
            value={`${formatNumber(amountLimit || 0, amountLimitCoin?.decimals, false, Decimal.ROUND_DOWN).toString()} ${amountLimitCoin?.symbol}`}
            valueStyle={{
              fontSize: '14px'
            }}
          />
        )}

        {/* 价差 */}
        <PriceImpact
          fromToken={fromCoin!}
          toToken={toCoin!}
          sources={priceSources}
          marketPrice={marketPrice}
          priceImpact={priceImpactTextInfo}
          showIncalculable={showIncalculable}
        />
        {/* 价格警告 */}
        {showPriceImpactWarn && (
          <VStack w="100%" gap="8px">
            <HStack
              w="100%"
              bg="primary_red_opacity.10"
              borderRadius="12px"
              border="1px solid"
              borderColor="border"
              justifyContent="start"
              p="10px 16px"
            >
              <Text color="primary_red" fontSize="12px" lineHeight="20px" textAlign="start">
                The exchange rate of this order deviates from the market price by a large percentage. Are you sure you want to continue the swap?
              </Text>
            </HStack>
            <HStack w="100%" justifyContent="space-between" gap="16px">
              <Button
                variant="outline"
                w="100%"
                color="text_highlight"
                fontSize="14px"
                borderColor={ignorePriceImpact ? 'text_highlight' : 'button_outline_border'}
                onClick={() => {
                  setIgnorePriceImpact(true)
                }}
              >
                Yes, please continue.
              </Button>
              <Button variant="outline" w="100%" color="text_highlight" fontSize="14px" borderColor="button_outline_border" onClick={() => onClose()}>
                No,cancel it.
              </Button>
            </HStack>
          </VStack>
        )}
        {showPriceUpdated && !isSelectedRfq && (
          <HStack w="100%" justifyContent="space-between">
            <HStack>
              <Icon xlinkHref="#icon-icon_priceupdated1" svgW="20px" svgH="20px" />
              <Text color="text_caption" fontWeight="500" fontSize="14px">
                Price updated
              </Text>
            </HStack>
            <Button onClick={handlePriceAcceptClick} h="40px" borderRadius="12px" fontSize="16px" fontWeight="500" p="0 42px">
              Accept
            </Button>
          </HStack>
        )}
        {/* 如果选择的是rfq，则显示倒计时 */}
        {isSelectedRfq && (
          <HStack
            mt="-4px"
            w="100%"
            h="40px"
            bg={countDownEnd ? 'primary_yellow_opacity.10' : 'rfq_72C1F7_10'}
            borderRadius="12px"
            justify="center"
            align="center"
          >
            {!countDownEnd && (
              <SolidPieCountdown rftCountdownFlag={rftCountdownFlag} totalSeconds={Number(originRfqData?.rfqQuote?.total_countdown || 0)} />
            )}
            {countDownEnd && (
              <Text color="primary_yellow" fontWeight="400" fontSize="12px">
                Cetus Tide offer expired, please request again.
              </Text>
            )}
          </HStack>
        )}
      </VStack>

      {showButton && (
        <Button
          isDisabled={buttonDisabled}
          isLoading={isLoading}
          mt="4px"
          w="100%"
          h="52px"
          borderRadius="12px"
          fontSize="16px"
          fontWeight="500"
          variant={isProMode && !isWidget && !isSelectedRfq ? `solid-${currentProTab?.toLocaleLowerCase()}` : 'solid'}
          // variant="solid"
          onClick={() => {
            if (isLoading) {
              return
            }
            setIsLoading(true)
            handleRouterSwap(originData)
          }}
        >
          {buttonText}
        </Button>
      )}
    </VStack>
  )
}
