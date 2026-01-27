import { useFormatSwapRouter } from '@/hooks/swap/useSwapHelper'
import { useSwapRouter } from '@/hooks/swap/useSwapRouter'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import { SwapRouterData, SwapWidgetStep } from '@/types/swap'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useTransactionStore } from '@cetus/stores/src/transaction'
import { Token } from '@cetus/types'
import { VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SwapTrade, SwapTradeRef } from './SwapTrade'
import SwapTradeStatus from './SwapTradeStatus'
import SwapWidgetConfirm from './SwapWidgetConfirm'
import SwapWidgetRoutes from './SwapWidgetRoutes'
import SwapWidgetSelectToken from './SwapWidgetSelectToken'
import SwapWidgetSetting from './SwapWidgetSetting'
import SwapWidgetSlippageSetting from './SwapWidgetSlippageSetting'

type SwapIndexProps = {
  showTopMask: boolean
}

export function SwapIndex(props: SwapIndexProps) {
  const { showTopMask } = props
  const { isOpen } = useSwapWidgetConfigStore()
  const { routerData, fromCoin, toCoin } = useSwapWidgetStore()
  const [currStep, setCurrStep] = useState<SwapWidgetStep>(SwapWidgetStep.TradeInputPage)
  const [confirmRouterData, setConfirmRouterData] = useState<SwapRouterData | undefined>()
  const { transactionModalVisible, transactionData, setTransactionModalVisible } = useTransactionStore()
  const { formatSwapRouter } = useFormatSwapRouter(routerData)
  const [isSelectFrom, setIsSelectFrom] = useState<boolean>(true)
  const { isApp } = useWindowWidth()
  const { allProviders } = useSwapRouter(routerData, fromCoin?.coin_type, toCoin?.coin_type)

  const swapTradeRef = useRef<SwapTradeRef>(null)

  // 打开确认弹窗
  const openConfirmModelClick = (routerData: SwapRouterData) => {
    setConfirmRouterData(routerData)
    setCurrStep(SwapWidgetStep.TradeConfirmPage)
  }

  // 点击router
  const handleSwapWidgetRouterClick = () => {
    setCurrStep(SwapWidgetStep.RoutePage)
  }

  // 点击选择token
  const openSelectTokenModal = (isSelectFrom: boolean) => {
    setIsSelectFrom(isSelectFrom)
    setCurrStep(SwapWidgetStep.SelectTokenPage)
  }

  const backTradeInputPage = () => {
    setCurrStep(SwapWidgetStep.TradeInputPage)
  }

  useEffect(() => {
    if (!isOpen) {
      setCurrStep(SwapWidgetStep.TradeInputPage)
    }
  }, [isOpen])

  const showTradeStatusPage = useMemo(() => {
    return currStep === SwapWidgetStep.TradeStatus && transactionData && transactionData.isSwapWidget && transactionModalVisible
  }, [currStep, transactionData, transactionModalVisible])

  return (
    <VStack bg="swap_bg_primary" w="100%" borderRadius="16px" p="0px">
      {/* 交易输入页面 */}
      <SwapTrade
        ref={swapTradeRef}
        openSelectTokenModal={openSelectTokenModal}
        formatSwapRouter={formatSwapRouter}
        handleSwapWidgetRouterClick={handleSwapWidgetRouterClick}
        currStep={currStep}
        openConfirmModelClick={openConfirmModelClick}
        handleSettingClick={() => {
          setCurrStep(SwapWidgetStep.TradeSetting)
        }}
        handleSlippageClick={() => {
          setCurrStep(SwapWidgetStep.SlippageSetting)
        }}
      />
      {/* 交易确认页面 */}
      {currStep === SwapWidgetStep.TradeConfirmPage && confirmRouterData && (
        <SwapWidgetConfirm
          data={confirmRouterData}
          onClose={backTradeInputPage}
          handleRouterSwap={(data: SwapRouterData) => {
            setTimeout(() => {
              setCurrStep(SwapWidgetStep.TradeStatus)
            }, 500)
            swapTradeRef.current?.handleTradeSubmit(data)
          }}
        />
      )}
      {/* 交易状态页面 */}
      {showTradeStatusPage && (
        <SwapTradeStatus
          data={transactionData!}
          onClose={() => {
            setTransactionModalVisible(false)
            backTradeInputPage()
          }}
        />
      )}

      {/* 路由页面 */}
      {currStep === SwapWidgetStep.RoutePage && allProviders?.length > 0 && (
        <SwapWidgetRoutes allProviders={allProviders} onClose={backTradeInputPage} data={routerData} />
      )}

      {/* 设置页面 */}
      {currStep === SwapWidgetStep.TradeSetting && <SwapWidgetSetting onClose={backTradeInputPage} />}

      {/* 选择Token页面 */}
      {currStep === SwapWidgetStep.SelectTokenPage && (
        <SwapWidgetSelectToken
          onClose={backTradeInputPage}
          currToken={isSelectFrom ? fromCoin : toCoin}
          onSelectCall={(token: Token) => {
            swapTradeRef.current?.handleSelectToken(isSelectFrom, token)
            backTradeInputPage()
          }}
        />
      )}

      {currStep === SwapWidgetStep.SlippageSetting && (
        <SwapWidgetSlippageSetting onCloseModal={backTradeInputPage} tokenA={fromCoin} tokenB={toCoin} />
      )}
    </VStack>
  )
}
