// import V3Router from '@/components/swap/V3Router'
import useCustomizeRouting from '@/hooks/swap/useCustomizeRouting'
import { useFindRfqRouting } from '@/hooks/swap/useFindRfqRouting'
import { useSwapHook } from '@/hooks/swap/useSwap'
import { useSwapButtonStatus } from '@/hooks/swap/useSwapButtonStatus'
import { useGetRfqData } from '@/hooks/swap/useSwapHelper'
import { useSwapRouter } from '@/hooks/swap/useSwapRouter'
import useGlobalStore from '@/store/common/global'
import useProStore from '@/store/pro'
import useSwapStore from '@/store/swap/swap'
import useSwapConfigStore from '@/store/swap/swapConfig'
import { CetusTooltip, IconBg, TradeInputGroup } from '@cetus/design'
import WarningTokenTipsModal from '@cetus/design/src/components/common/WarningTokenTipModal'
import { useAccountBalance, useCountdownTimer } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { HTextLabelBox } from '@cetus/ui-kit'
import { Decimal, d, formatNumber } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, Button, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import RiskConfirm from '../common/RiskConfirm'
import Slippage from '../common/Slippage'
import SwapConfirmModel from '../modal/SwapConfirmModel'
import AggregatorMode from './AggregatorMode'
import FreshProgressV2, { FreshProgressRef } from './FreshProgressV2'
import PriceRatio from './PriceRatio'
import PriceReference from './PriceReference'
import ScamsAlert from './ScamsAlert'
import SwapRoutes from './SwapRoutes'
import { RfqBottomWidget } from './rfq/RfqBottomWidget'
import { RfqRightWidget } from './rfq/RfqRightWidget'
// const FreshProgressV2 = lazy(() => import('./FreshProgressV2'))
// const PriceReference = lazy(() => import('./PriceReference'))

function Swap() {
  const rftCountdownFlagRef = useRef<number | undefined>(undefined)
  const swapStore = useSwapStore()
  const { fromCoin, toCoin, byAmountIn, setUserSelectQuoteMode, findRouterLoading, rfqData, routerData, userSelectQuoteMode } = swapStore
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
    getSwapSecondaryData,
    handleRouterSwap,
    reCalculateRouteData,
    scamsText,
    refreshMarketPrice,
    isOpenConfirmModel,
    setIsOpenConfirmModel,
    resetInputAmount,
    onReverseClick,
    showRiskConfirm,
    slippage,
    knowsRisk,
    handleKnowsRisk
  } = useSwapHook(swapStore, false, rftCountdownFlagRef)

  const { showTokenInfo, isProMode, currentProTab, currentProTabUpdateWith } = useProStore()
  useEffect(() => {
    console.log('Swap 🚀 ~ useEffect ~ currentProTabUpdateWith:', currentProTabUpdateWith)
    if (currentProTabUpdateWith === 'toggleBtn' || !currentProTabUpdateWith) return

    if (showTokenInfo?.coin_type && toCoin?.coin_type && fromCoin?.coin_type) {
      if (
        (currentProTab == 'Buy' && fixCoinType(showTokenInfo?.coin_type) !== fixCoinType(toCoin?.coin_type)) ||
        (currentProTab == 'Sell' && fixCoinType(showTokenInfo?.coin_type) !== fixCoinType(fromCoin?.coin_type))
      ) {
        // return
        onReverseClick(!isAllowInputReceiveSide)
      }
    } else if (showTokenInfo?.coin_type && fromCoin?.coin_type && !toCoin?.coin_type) {
      onReverseClick(!isAllowInputReceiveSide)
    } else if (showTokenInfo?.coin_type && !fromCoin?.coin_type && toCoin?.coin_type) {
      onReverseClick(!isAllowInputReceiveSide)
    }
  }, [currentProTab])

  const { currentAccount, onWalletModal } = useAccountStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { isOpenRfqSwitch, rfqConfigs } = useSwapConfigStore()
  const { fetchRfqConfigs } = useFindRfqRouting()

  useEffect(() => {
    if (currentAccount?.address) {
      fetchAccountBalance()
    }
    // 获取rfq配置信息
    fetchRfqConfigs()
  }, [])
  // Swap 按钮状态
  const { btnText, btnDisabled } = useSwapButtonStatus(fromAmount, toAmount, fromBalanceInfo?.balanceFormat, fromCoin, toCoin, routerData)
  const progressRef = useRef<FreshProgressRef>(null)

  const { allProviders } = useSwapRouter(routerData)
  const { isOpenAggregatorMode, isAllowInputReceiveSide } = useCustomizeRouting(true)

  const isOpenConfirmModelRef = useRef<boolean>(isOpenConfirmModel)

  const bestRfqData = useGetRfqData(rfqData, routerData)

  useCountdownTimer({
    initialCount: bestRfqData?.rfqQuote?.total_countdown || 0,
    expired_at: bestRfqData?.rfqQuote?.expired_at || '0',
    onTick: (currentAccount: number) => {
      if (findRouterLoading) {
        rftCountdownFlagRef.current = undefined
        return
      }
      rftCountdownFlagRef.current = currentAccount
      if (currentAccount === 0) {
        if (!isOpenConfirmModelRef.current) {
          reCalculateRouteData()
        }
      }
    }
  })

  useEffect(() => {
    isOpenConfirmModelRef.current = isOpenConfirmModel
  }, [isOpenConfirmModel])

  const handleReset = () => {
    progressRef.current?.reset()
  }

  const handleRefresh = (refreshRfq = true) => {
    rftCountdownFlagRef.current = undefined
    //刷新Router
    reCalculateRouteData(refreshRfq)

    //刷新余额
    fetchAccountBalance()
    // 刷新市场价格
    refreshMarketPrice()
  }

  // TODO 如果有修改，重置定时器
  useEffect(() => {
    handleReset()
  }, [toAmount, fromAmount, fromCoin?.coin_type, toCoin?.coin_type])

  useEffect(() => {
    if (!byAmountIn) {
      handleRefresh()
    }
  }, [fromCoin?.coin_type, toCoin?.coin_type])

  // 切换开关 情况输入
  useEffect(() => {
    resetInputAmount(false) // 只清空输出
  }, [isOpenAggregatorMode])

  const warningTokenList = useMemo(() => {
    const list: Token[] = []
    if (fromCoin) {
      list.push(fromCoin)
    }

    if (toCoin) {
      list.push(toCoin)
    }

    return list
  }, [fromCoin, toCoin])

  const [tradeIcon, setTradeIcon] = useState('#icon-a-icon_trade')

  const onTradeIconMouseEnter = () => {
    setTradeIcon('#icon-icon_swap1')
  }

  const onTradeIconMouseLeave = () => {
    setTradeIcon('#icon-a-icon_trade')
  }
  const { isApp, windowWidth } = useWindowWidth()
  const { isShowTradeChart, setIsShowTradeChart, isShowTradeOrders, setIsShowTradeOrders } = useGlobalStore()

  const tradeInputStyle = {
    h: '122px',
    p: '16px',
    borderRadius: '16px'
  }

  return (
    <HStack position="relative" w="100%">
      <VStack gap="8px" w={{ base: '100%', lg: isProMode ? '380px' : '470px' }}>
        <HStack w="100%" justify="space-between">
          <AggregatorMode showRfqSwitch={true} />
          <HStack>
            <Slippage tokenA={fromCoin} tokenB={toCoin} showNewTolerance />
            {/* <MEVProtect /> */}
            {!isProMode && (
              <CetusTooltip
                showTooltip={isApp ? false : true}
                placement="bottom-end"
                tooltip={<Text fontSize="12px">{isShowTradeChart ? 'Hide reference price' : 'View reference price'}</Text>}
              >
                <Center>
                  <IconBg
                    w="28px"
                    h="28px"
                    iconStyle={{ fontSize: '20px' }}
                    borderRadius="8px"
                    variant=""
                    xlinkHref="#icon-icon_kline"
                    svgFill={isShowTradeChart ? 'primary' : ''}
                    svgHover={isShowTradeChart ? 'primary' : isApp ? 'text_paragraph' : 'text_caption'}
                    onClick={() => setIsShowTradeChart(!isShowTradeChart)}
                  />
                </Center>
              </CetusTooltip>
            )}
            {/* <Suspense fallback={<div />}> */}

            <FreshProgressV2
              // toDo: 为了调试新的路径弹框暂时调整自动刷新时间区间，后面要改回
              callbackInterval={isOpenConfirmModel ? 5 : 10}
              // callbackInterval={isOpenConfirmModel ? 5 : 99999999999}
              ref={progressRef}
              min={0}
              max={10}
              // max={99999999999}
              onClick={() => {
                // 如果当前打开二次确认弹窗，且选择的是rfq,则不自动刷新
                if (isOpenConfirmModel && userSelectQuoteMode === 'rfq') {
                  return
                }
                // 如果当前打开router二次确认弹窗，则不刷新rfq，此时rfq相关数据会被清空
                handleRefresh(!isOpenConfirmModel)
              }}
              size="18px"
              w="28px"
              h="28px"
              borderRadius="8px"
            />
            {/* </Suspense> */}
          </HStack>
        </HStack>
        <Box w="100%">
          <TradeInputGroup
            // h5去掉背景图
            // wrapStyle={isApp && !isShowTradeChart ? { bg: "center / cover no-repeat url('/images/swap_bg.png')" } : {}}
            wrapStyle={{ gap: '8px', mt: '4px' }}
            onClick={() => onReverseClick(!isOpenAggregatorMode, true)}
            from={{
              wrapStyle: tradeInputStyle,
              title: 'You Pay',
              balance: fromBalanceInfo?.balanceFormat || '',
              value: fromAmount,
              amountValue: !byAmountIn && findRouterLoading ? '' : fromAmountValue,
              loading: !byAmountIn && findRouterLoading,
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
              },
              onTokenChange: (token: any) => {
                handleSelectToken(token, true)
              }
            }}
            to={{
              wrapStyle: tradeInputStyle,
              title: 'You Receive',
              balance: toBalanceInfo?.balanceFormat || '',
              value: toAmount,
              // amountValue: byAmountIn && findRouterLoading ? '' : toAmountValue,
              amountValue: toAmountValue,
              loading: byAmountIn && findRouterLoading,
              loadingType: toAmount ? 'color' : 'skeleton',
              onFocusChange: (focus: boolean) => {
                if (focus && +toAmount && byAmountIn) {
                  handleAmountChange(toAmount, false)
                }
              },
              onTokenChange: (token: any) => {
                handleSelectToken(token, false)
              },
              inputAllowed: isAllowInputReceiveSide,
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

        {/* Token 警告弹窗 */}
        {(fromCoin || toCoin) && (
          <WarningTokenTipsModal
            addToken
            tokensInfo={warningTokenList}
            waringModalCancel={(tokenInfo: Token[]) => {
              tokenInfo.forEach(coin => {
                const hasFind = coin.coin_type === fromCoin?.coin_type || coin.coin_type === toCoin?.coin_type
                if (hasFind) {
                  handleSelectToken(undefined, coin.coin_type === fromCoin?.coin_type)
                }
              })
            }}
          />
        )}
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
          bg="bg_secondary"
        >
          <Button
            w="calc(100% + 18px)"
            h="52px"
            margin="-1px"
            fontSize="18px"
            fontWeight="500"
            borderRadius="12px"
            variant={isProMode ? `solid-${currentProTab?.toLocaleLowerCase()}` : 'solid'}
            // variant="solid"
            isDisabled={findRouterLoading || btnDisabled || (showRiskConfirm && !knowsRisk)}
            isLoading={findRouterLoading}
            onClick={() => {
              if (currentAccount) {
                setUserSelectQuoteMode('router')
                setIsOpenConfirmModel(true)
              } else {
                onWalletModal(true)
              }
            }}
          >
            {[fromCoin, toCoin]?.filter(Boolean).length < 2 ? 'Select a token' : isProMode && btnText == 'Swap' ? currentProTab : btnText}
          </Button>
          {!!+fromAmount && !!+toAmount && (
            <VStack w="100%" gap="12px">
              <PriceRatio findRouterLoading={findRouterLoading} routerData={routerData} fromCoin={fromCoin} toCoin={toCoin} />
              <HTextLabelBox
                isLoading={findRouterLoading}
                label={byAmountIn ? 'Minimum Received' : 'Maximum Sold'}
                value={`${formatNumber(amountLimit, byAmountIn ? toCoin?.decimals : fromCoin?.decimals, false, Decimal.ROUND_DOWN)} ${byAmountIn ? toCoin?.symbol : fromCoin?.symbol}`}
                labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
                valueStyle={{ fontWeight: 500, fontSize: '14px' }}
                skeletonStyle={{
                  valueW: '128px'
                }}
                wrapStyle={{
                  p: '0 8px',
                  minH: '20px'
                }}
              />

              <SwapRoutes
                allProviders={allProviders}
                findRouterLoading={findRouterLoading}
                fromAmount={fromAmount}
                toAmount={toAmount}
                fromCoin={fromCoin}
                toCoin={toCoin}
                data={routerData}
              />
            </VStack>
          )}
        </VStack>
        {/* 底部RFQ展示 */}
        {(isApp || isShowTradeChart || isProMode) && (
          <RfqBottomWidget
            rftCountdownFlagRef={rftCountdownFlagRef}
            findRouterLoading={findRouterLoading}
            isShowRfqWidget={bestRfqData?.rfqQuote !== undefined && !findRouterLoading}
            rfqData={bestRfqData}
            fromCoin={fromCoin}
            toCoin={toCoin}
            onTrade={() => {
              setUserSelectQuoteMode('rfq')
              setIsOpenConfirmModel(true)
            }}
          />
        )}

        {(!isShowTradeChart || isProMode) && (
          // <Suspense fallback={<div />}>
          <PriceReference fromCoin={fromCoin} toCoin={toCoin} />
          // </Suspense>
        )}
        {isApp && <Box h="0px" mt="-4px" />}

        {/* 交易确认弹窗 */}
        {isOpenConfirmModel && (
          <SwapConfirmModel
            rftCountdownFlagRef={rftCountdownFlagRef}
            data={getSwapSecondaryData()}
            isOpen={isOpenConfirmModel}
            handleRouterSwap={data => {
              handleRouterSwap(data)
            }}
            onClose={(isManualClose = false) => {
              setIsOpenConfirmModel(false)
              console.log('🚀 ~ onClose ~ userSelectQuoteMode:', userSelectQuoteMode, rftCountdownFlagRef.current)

              // 如果当前打开的是rfq，若超时 若已前端自动触发刷新当前报价
              if (userSelectQuoteMode === 'rfq' && rftCountdownFlagRef.current === 0) {
                reCalculateRouteData()
              }

              // 如果当前打开的是router，用户关闭弹框后, 若rfq开关打开，且有rfq provider，并且超时，则刷新当前报价
              if (userSelectQuoteMode === 'router' && isOpenRfqSwitch && rfqConfigs?.enable && rftCountdownFlagRef.current === 0) {
                reCalculateRouteData()
              }
            }}
          />
        )}

        {/* <V3Router data={routerData} /> */}
      </VStack>
      {/* 右边RFQ展示 */}
      {!isShowTradeChart && !isApp && !isProMode && (
        <RfqRightWidget
          rftCountdownFlagRef={rftCountdownFlagRef}
          findRouterLoading={findRouterLoading}
          isShowRfqWidget={bestRfqData?.rfqQuote !== undefined && !findRouterLoading}
          rfqData={bestRfqData}
          fromCoin={fromCoin}
          toCoin={toCoin}
          onTrade={() => {
            setUserSelectQuoteMode('rfq')
            setIsOpenConfirmModel(true)
          }}
        />
      )}
    </HStack>
  )
}

export default Swap
