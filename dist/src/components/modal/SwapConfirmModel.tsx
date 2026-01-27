import useProStore from '@/store/pro'
import useSwapStore from '@/store/swap/swap'
import { SwapRfqData, SwapRouterData } from '@/types/swap'
import { Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import SwapConfirmBlock from '../swap/SwapConfirmBlock'
import { RfqLogoTitle } from '../swap/rfq/RfqLogoTitle'

type SwapConfirmModelProps = {
  data: SwapRouterData | SwapRfqData
  isOpen: boolean
  onClose: (isManualClose?: boolean) => void
  rftCountdownFlagRef?: React.MutableRefObject<number | undefined>
  handleRouterSwap: (data: SwapRouterData | SwapRfqData) => void
}

export default function SwapConfirmModel(props: SwapConfirmModelProps) {
  const { isOpen, onClose, data, handleRouterSwap, rftCountdownFlagRef } = props
  const { fromCoin, toCoin, routerData, userSelectQuoteMode } = useSwapStore()
  const { isProMode } = useProStore()

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={() => onClose(false)} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {userSelectQuoteMode === 'rfq' ? (
            <RfqLogoTitle />
          ) : (
            <Heading fontWeight="500" fontSize="16px">
              {isProMode ? 'Trade' : 'Swap'}
            </Heading>
          )}
        </ModalHeader>
        <ModalCloseButton onClick={() => onClose(true)} />
        <ModalBody textAlign="center" p="0px">
          <SwapConfirmBlock
            rftCountdownFlagRef={rftCountdownFlagRef}
            handleRouterSwap={handleRouterSwap}
            onClose={onClose}
            data={data}
            lastRouterData={routerData}
            fromCoin={fromCoin!}
            toCoin={toCoin!}
            isWidget={false}
            isSelectedRfq={userSelectQuoteMode === 'rfq'}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
