import useProStore from '@/store/pro'
import { CheckBox } from '@cetus/ui-kit'
import { Button, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
type TermConditionsProps = {
  website: string
  isOpen: boolean
  onClose: () => void
}
export default function TokenDisclaimerModal({ isOpen, onClose, website }: TermConditionsProps) {
  const { setProceedTokenDisclaimerObj } = useProStore()
  const [isChecked, setIsChecked] = useState(false)
  const handleContinue = () => {
    const addressObj = {
      [website]: true
    }
    setProceedTokenDisclaimerObj(addressObj)
    window.open(website)
    onClose()
  }

  return (
    <Modal autoFocus={false} closeOnOverlayClick={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        {/* 标题 */}
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            You're leaving the Cetus Website
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={{ base: '8px 12px !important', lg: '8px 12px !important' }}>
          <VStack w="100%" userSelect="none" p={{ base: '0', lg: '0 8px' }}>
            <Text fontSize="14px" lineHeight="20px" color="text_caption">
              By clicking “Process”, you will be redirected to a third party website. Please do your own research before actually interacting with it.
            </Text>
            <HStack w="100%" justify="center">
              <Text
                textAlign="center"
                w="80%"
                h="40px"
                borderRadius="8px"
                lineHeight="40px"
                bg="primary_opacity.10"
                fontSize="14px"
                color="primary_gray"
                margin="12px 0"
              >
                {website}
              </Text>
            </HStack>
            <HStack w="100%" justify="center">
              <CheckBox
                checked={isChecked}
                onClick={() => {
                  setIsChecked(!isChecked)
                }}
              />
              <Text fontSize="14px" color="primary_gray">
                l understand, do not show me this disclaimer again
              </Text>
            </HStack>
            <HStack w="100%" justify="space-between" mt="20px" mb="8px">
              <Button variant="outline" fontWeight="500" fontSize="14px" w="50%" onClick={onClose}>
                Close
              </Button>
              <Button isDisabled={!isChecked} fontWeight="500" fontSize="14px" w="50%" onClick={handleContinue}>
                Proceed
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
