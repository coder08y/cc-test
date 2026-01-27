import { useSwapHook } from '@/hooks/swap/useSwap'
import { useSwapButtonStatus } from '@/hooks/swap/useSwapButtonStatus'
import { useSwapRouter } from '@/hooks/swap/useSwapRouter'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import { SwapRouterData, SwapRouterFormat, SwapWidgetStep } from '@/types/swap'
import { TradeInputGroup } from '@cetus/design'
import { useAccountBalance, useInterval } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { HTextLabelBox, RefreshButton } from '@cetus/ui-kit'
import { d, formatNumber } from '@cetus/utils'
import { Box, Button, HStack, Image, Text, VStack } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import RiskConfirm from '../common/RiskConfirm'
import Slippage from '../common/Slippage'
import PriceRatio from '../swap/PriceRatio'
import ScamsAlert from '../swap/ScamsAlert'
import SwapRoutes from '../swap/SwapRoutes'

type SwapTradeProps = {
  currStep: SwapWidgetStep
  formatSwapRouter?: SwapRouterFormat
  openConfirmModelClick: (routerData: SwapRouterData) => void
  handleSwapWidgetRouterClick: () => void
  handleSettingClick: () => void
  openSelectTokenModal: (isSelectFrom: boolean) => void
  handleSlippageClick: () => void
}

export interface SwapTradeRef {
  handleTradeSubmit: (data: SwapRouterData) => void
  handleSelectToken: (isFrom: boolean, coin?: Token) => void
}

export const SwapTrade = forwardRef<SwapTradeRef, SwapTradeProps>(
  (
    { currStep, openConfirmModelClick, handleSwapWidgetRouterClick, formatSwapRouter, handleSettingClick, openSelectTokenModal, handleSlippageClick },
    ref
  ) => {
    const { currWidgetImg, isOpen, setIsOpen } = useSwapWidgetConfigStore()
    const { pathname } = useLocation()
    const swapStore = useSwapWidgetStore()
    const { fromCoin, toCoin, setFromCoin, setToCoin, byAmountIn, setFromAmount, setToAmount, setByAmountIn, findRouterLoading, routerData } =
      swapStore
    const {
      handleSelectToken,
      handleAmountChange,
      fromAmount,
      toAmount,
      fromAmountValue,
      toAmountValue,
      fromBalanceInfo,
      toBalanceInfo,
      amountLimit,
      handleRouterSwap,
      reCalculateRouteData,
      scamsText,
      refreshMarketPrice,
      resetInputAmount,
      onReverseClick,
      showRiskConfirm,
      knowsRisk,
      handleKnowsRisk,
      slippage
    } = useSwapHook(swapStore, true)

    const { allProviders } = useSwapRouter(routerData)

    const currStepRef = useRef<SwapWidgetStep>(currStep)

    useEffect(() => {
      currStepRef.current = currStep
    }, [currStep])

    useImperativeHandle(ref, () => ({
      handleTradeSubmit: (data: SwapRouterData) => {
        handleRouterSwap(data)
      },
      handleSelectToken: (isFrom: boolean, coin?: Token) => {
        handleSelectToken(coin, isFrom)
      }
    }))

    // Swap 按钮状态
    const { btnText, btnDisabled } = useSwapButtonStatus(fromAmount, toAmount, fromBalanceInfo?.balanceFormat, fromCoin, toCoin, routerData)

    const { fetchAccountBalance } = useAccountBalance()
    useEffect(() => {
      if (currentAccount?.address) {
        fetchAccountBalance()
      }

      return () => {
        resetInputAmount()
      }
    }, [])

    const { startTimer, stopTimer } = useInterval({
      callback: () => {
        //刷新Router
        reCalculateRouteData()
        // 刷新市场价格
        refreshMarketPrice()
      },
      interval: 5 * 1000
    })

    useEffect(() => {
      if (!isOpen) {
        resetInputAmount()
        stopTimer()
      }
    }, [isOpen])

    useEffect(() => {
      if (currStep === SwapWidgetStep.TradeConfirmPage) {
        startTimer()
      } else {
        stopTimer()
      }
    }, [currStep])

    const [tradeIcon, setTradeIcon] = useState('#icon-a-icon_trade')
    const { currentAccount, onWalletModal } = useAccountStore()

    const onTradeIconMouseEnter = () => {
      setTradeIcon('#icon-icon_swap1')
    }

    const onTradeIconMouseLeave = () => {
      setTradeIcon('#icon-a-icon_trade')
    }

    const handleRefresh = (isManual: boolean) => {
      console.log('  handleRefresh')
      //刷新Router
      reCalculateRouteData()
      //刷新余额
      fetchAccountBalance()
      // 刷新市场价格
      refreshMarketPrice()
    }

    return (
      <VStack
        w="100%"
        h="100%"
        display={currStep === SwapWidgetStep.TradeInputPage ? 'flex' : 'none'}
        gap="16px"
        pl="12px"
        pr="12px"
        pt="16px"
        pb="16px"
      >
        {/* 顶部导航条区域 */}
        <HStack w="100%" justify="space-between">
          <HStack>
            <Image
              draggable="false"
              src={currWidgetImg}
              fallbackSrc="/images/placeholder-token@2x.png"
              w="36px"
              h="36px"
              cursor="pointer"
              _hover={{
                transform: 'scale(1.2)'
              }}
              onClick={handleSettingClick}
            />
            <Text fontSize="16px" color="text_caption" fontWeight="500">
              Swap
            </Text>
          </HStack>

          <HStack>
            <Slippage isWidget={true} onClick={handleSlippageClick} tokenA={fromCoin} tokenB={toCoin} showNewTolerance />
            {/* <SwapWidgetSetting handleSettingClick={handleSettingClick} /> */}
            {isOpen && (
              <RefreshButton
                isAutoRefresh={true}
                refreshInterval={20}
                handleRefresh={(isManual: boolean) => {
                  if (currStepRef.current === SwapWidgetStep.TradeConfirmPage) {
                    return
                  }
                  handleRefresh(isManual)
                }}
                borderRadius="8px"
                w="28px"
                h="28px"
                innerStyle={{ bg: 'swap_bg_secondary' }}
              />
            )}
          </HStack>
        </HStack>
        {/* 输入数量区域 */}
        <Box w="100%">
          <TradeInputGroup
            onClick={() => onReverseClick(true, true)}
            from={{
              wrapStyle: { h: 'auto', p: '18px', bg: 'swap_bg_secondary' },
              isWidget: true,
              balance: fromBalanceInfo?.balanceFormat || '',
              value: fromAmount,
              amountValue: fromAmountValue,
              loading: !byAmountIn && findRouterLoading,
              openSelectTokenModal: () => openSelectTokenModal(true),
              onChange: value => {
                handleAmountChange(value, true)
              },
              selectable: true,
              placeholder: '0.0',
              token: fromCoin,
              onFocusChange: (focus: boolean) => {
                if (focus && +fromAmount && !byAmountIn) {
                  handleAmountChange(fromAmount, true)
                }
              }
            }}
            to={{
              isWidget: true,
              wrapStyle: { h: 'auto', p: '18px' },
              balance: toBalanceInfo?.balanceFormat || '',
              value: toAmount,
              amountValue: toAmountValue,
              loading: byAmountIn && findRouterLoading,
              openSelectTokenModal: () => openSelectTokenModal(false),
              onFocusChange: (focus: boolean) => {
                if (focus && +toAmount && byAmountIn) {
                  handleAmountChange(toAmount, false)
                }
              },
              inputAllowed: false,
              onChange: value => {
                handleAmountChange(value, false)
              },
              selectable: true,
              placeholder: '0.0',
              token: toCoin,
              half: false,
              max: false
            }}
            iconParams={{
              xlinkHref: tradeIcon,
              svgFill: 'text_caption',
              transform: tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)',
              fontSize: tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px',
              onMouseEnter: onTradeIconMouseEnter,
              onMouseLeave: onTradeIconMouseLeave
            }}
          />

          {/* 风险提示 */}
          {scamsText && (
            <Box mt="-32px" p="48px 16px 16px" borderRadius="20px" bg="bg_secondary" border="1px solid" borderColor="border">
              <ScamsAlert scamsText={scamsText} />
            </Box>
          )}
        </Box>
        {showRiskConfirm && !findRouterLoading && !btnDisabled && (
          <RiskConfirm
            checked={knowsRisk}
            onChange={value => handleKnowsRisk(value)}
            slippage={d(slippage).mul(100).toNumber()}
            tipType={d(slippage).gte(0.1) ? 'error' : 'warning'}
          />
        )}
        <VStack
          p={!!+fromAmount && !!+toAmount ? '0 8px 12px' : '0 8px'}
          w="100%"
          gap="8px"
          border="1px solid"
          borderColor="border"
          borderRadius="20px"
          bg="swap_card_bg"
        >
          <Button
            w="calc(100% + 18px)"
            h="52px"
            margin="-1px"
            fontSize="18px"
            fontWeight="500"
            borderRadius="12px"
            isDisabled={findRouterLoading || btnDisabled || (showRiskConfirm && !knowsRisk)}
            isLoading={findRouterLoading}
            onClick={() => {
              if (currentAccount) {
                if (routerData) {
                  openConfirmModelClick(routerData)
                }
              } else {
                setIsOpen(false)
                onWalletModal(true)
              }
            }}
          >
            {[fromCoin, toCoin]?.filter(Boolean).length < 2 ? 'Select a token' : btnText}
          </Button>
          {!!+fromAmount && !!+toAmount && (
            <VStack w="100%" gap="12px">
              <PriceRatio
                isWidget={true}
                bg="swap_card_bg_2"
                findRouterLoading={findRouterLoading}
                routerData={routerData}
                fromCoin={fromCoin}
                toCoin={toCoin}
              />
              <HTextLabelBox
                isLoading={findRouterLoading}
                label={byAmountIn ? 'Minimum Received' : 'Maximum Sold'}
                value={`${formatNumber(amountLimit, byAmountIn ? toCoin?.decimals : fromCoin?.decimals, false, Decimal.ROUND_DOWN)} ${byAmountIn ? toCoin?.symbol : fromCoin?.symbol}`}
                labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '12px' }}
                valueStyle={{ fontWeight: 500, fontSize: '12px' }}
                skeletonStyle={{
                  valueW: '128px'
                }}
                wrapStyle={{
                  p: '0 8px',
                  minH: '20px'
                }}
              />

              <SwapRoutes
                handleSwapWidgetRouterClick={handleSwapWidgetRouterClick}
                allProviders={allProviders}
                findRouterLoading={findRouterLoading}
                fromAmount={fromAmount}
                toAmount={toAmount}
                fromCoin={fromCoin}
                toCoin={toCoin}
                isSwapWidget={true}
              />
            </VStack>
          )}
        </VStack>
      </VStack>
    )
  }
)

SwapTrade.displayName = 'SwapTrade'
