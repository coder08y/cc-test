import useProListStore from '@/store/pro/list'
import { Block } from '@cetus/design'
import { CheckBox } from '@cetus/ui-kit'
import { Button, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
type ProTokenRiskProps = {
  isOpen: boolean
  onClose: () => void
}
export default function ProTokenRiskModal({ isOpen, onClose }: ProTokenRiskProps) {
  const { setIsShowTokenRickModal } = useProListStore()
  const [isChecked, setIsChecked] = useState(false)
  const [isNoShowAgainChecked, setIsNoShowAgainChecked] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const handleContinue = () => {
    setIsShowTokenRickModal(!isNoShowAgainChecked)
    navigate('/pro')
    onClose()
  }
  const handleClose = () => {
    setIsChecked(false)
    setIsNoShowAgainChecked(false)
    // if (!isChecked && pathname?.includes('/pro')) {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/swap')
    }
    // }
    onClose()
  }

  return (
    <Modal autoFocus={false} closeOnOverlayClick={false} returnFocusOnClose={false} isOpen={isOpen} onClose={() => handleClose()} isCentered>
      <ModalOverlay />
      <ModalContent>
        {/* 标题 */}
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Risk Acknowledgement
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={{ base: '8px 12px !important', lg: '8px 12px !important' }}>
          <VStack w="100%" userSelect="none" gap="12px" p={{ base: '0', lg: '0 8px' }}>
            <Text fontSize="14px" lineHeight="20px" color="text_caption">
              Cetus Pro aggregates market data for a wide range of tokens. Inclusion on the dashboard does not imply verification or endorsement.
            </Text>{' '}
            <Text fontSize="14px" lineHeight="20px" color="text_caption">
              Please do your own research before interacting with any token.
            </Text>
            <Block borderRadius="12px" p="16px" mt="8px">
              <HStack
                w="100%"
                _hover={{ p: { color: 'text_caption' } }}
                cursor="pointer"
                onClick={() => {
                  setIsChecked(!isChecked)
                }}
              >
                <CheckBox
                  checked={isChecked}
                  onClick={() => {
                    setIsChecked(!isChecked)
                  }}
                />
                <Text fontSize="14px" color="text_caption">
                  I acknowledge the risk
                </Text>
              </HStack>
              <HStack
                w="100%"
                mt="16px"
                _hover={{ p: { color: 'text_caption' } }}
                cursor="pointer"
                onClick={() => {
                  setIsNoShowAgainChecked(!isNoShowAgainChecked)
                }}
              >
                <CheckBox
                  checked={isNoShowAgainChecked}
                  onClick={() => {
                    setIsNoShowAgainChecked(!isNoShowAgainChecked)
                  }}
                />
                <Text fontSize="12px" color={isNoShowAgainChecked ? 'text_caption' : 'text_paragraph'}>
                  Don't show this alert again
                </Text>
              </HStack>
            </Block>
            <HStack w="100%" justify="space-between" mt="4px" mb="8px">
              {/* <Button variant="outline" fontWeight="500" fontSize="14px" w="50%" onClick={() => handleClose()}>
                Close
              </Button> */}
              <Button isDisabled={!isChecked} fontWeight="500" fontSize="14px" w="100%" onClick={handleContinue}>
                Continue
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
