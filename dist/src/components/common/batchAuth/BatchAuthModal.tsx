import { BatchAuthOptions } from '@cetus/types/src/common-types'
import { HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, VStack } from '@chakra-ui/react'
import { AuthHeader } from './AuthHeader'
import { AuthStep } from './AuthStep'

type TransactionProps = {
  isOpen: boolean
  onClose: (isManual: boolean) => void
  options: BatchAuthOptions
}

export default function BatchAuthModal(props: TransactionProps) {
  const { isOpen, onClose, options } = props
  const { status, title, steps } = options
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={() => onClose(false)} isCentered>
      <ModalOverlay />
      <ModalContent>
        {/* 标题 */}
        <ModalCloseButton onClick={() => onClose(true)} />
        <ModalBody>
          <VStack gap="4px" pb="40px" pt="28px" w="100%">
            {/* 标题 */}
            <AuthHeader status={status} title={title} />
            <VStack h="40px" />
            {/* 步骤 */}
            <HStack justify="center">
              <HStack flex="1" justify="center" h="100%">
                <VStack align="start" gap="0px">
                  {steps.map(step => (
                    <AuthStep step={step} showLine={step.index !== steps.length} />
                  ))}
                </VStack>
              </HStack>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
