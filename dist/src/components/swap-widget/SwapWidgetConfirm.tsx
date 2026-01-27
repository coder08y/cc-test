import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import { SwapRfqData, SwapRouterData } from '@/types/swap'
import { VStack } from '@chakra-ui/react'
import SwapConfirmBlock from '../swap/SwapConfirmBlock'
import SwapWidgetBack from './SwapWidgetBack'

type SwapWidgetConfirmProps = {
  data: SwapRouterData | SwapRfqData
  onClose: () => void
  handleRouterSwap: (data: SwapRouterData | SwapRfqData) => void
}

export default function SwapWidgetConfirm(props: SwapWidgetConfirmProps) {
  const { onClose, data, handleRouterSwap } = props
  const { fromCoin, toCoin, routerData } = useSwapWidgetStore()

  return (
    <VStack w="100%" gap="12px">
      <SwapWidgetBack title="Review your order" onBackClick={onClose} />
      <SwapConfirmBlock
        handleRouterSwap={handleRouterSwap}
        onClose={onClose}
        data={data}
        lastRouterData={routerData}
        isSelectedRfq={false}
        fromCoin={fromCoin!}
        toCoin={toCoin!}
        isWidget={true}
      />
    </VStack>
  )
}
