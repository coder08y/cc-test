import { Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import RouterList from './RouterList'

type CrossSelectRouterProps = {
  onClose: () => void
  isOpenSelectRouter: boolean
}
export default function CrossSelectRouterModal(props: CrossSelectRouterProps) {
  const { onClose, isOpenSelectRouter } = props

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpenSelectRouter} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={'100%'} minH={'130px'} maxH={`calc(100vh - 64px)`}>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Select Router
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" pb="16px" pt="0px" minH={'130px'} overflowY={'auto'}>
          <RouterList isOpenSelectRouter={isOpenSelectRouter} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
