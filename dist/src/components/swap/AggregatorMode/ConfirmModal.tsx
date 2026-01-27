import { Icon } from '@cetus/ui-kit'
import { Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'

interface ConfirmModalProps {
  isOpen: boolean
  onOk: () => void
  onClose: () => void
}

function ConfirmModal({ isOpen, onOk, onClose }: ConfirmModalProps) {
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Tips</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack>
            <Icon xlinkHref="#icon-icon_tips" svgHover="text_paragraph" cursor="default" />
            <Text color="text_caption">Do you want to save your changes?</Text>
          </HStack>
        </ModalBody>

        <ModalFooter gap="16px">
          <Button flex="1" onClick={onOk} h="40px" borderRadius="8px">
            Confirm
          </Button>
          <Button flex="1" variant="outline" h="40px" borderRadius="8px" onClick={onClose}>
            No
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmModal
