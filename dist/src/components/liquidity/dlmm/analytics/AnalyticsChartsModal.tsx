import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react'
import AnalyticsCharts from './AnalyticsCharts'

function AnalyticsChartsModal({ poolInfo, isOpen, onClose }: { poolInfo: any; isOpen: boolean; onClose: () => void }) {
  return (
    <Modal autoFocus={false} closeOnOverlayClick={true} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent border="none !important" minW={{ base: '100%', lg: '600px' }}>
        <ModalCloseButton top="18px" right="12px" />
        <ModalBody p="0px !important">
          <AnalyticsCharts poolInfo={poolInfo} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AnalyticsChartsModal
