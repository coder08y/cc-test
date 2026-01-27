import useXCetusStore from '@/store/xcetus/useXCetus'
import { HighlightText } from '@cetus/design/src/components/common'
import { CheckBox } from '@cetus/ui-kit'
import { Button, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

type VaultsAddConfirmModelProps = {
  isOpen: boolean
  onClose: () => void
  onSubmitClick: () => void
}

export default function XCetusConvertConfirmModel(props: VaultsAddConfirmModelProps) {
  const { isOpen, onClose, onSubmitClick } = props
  const { setShowConvertModel } = useXCetusStore()

  const [isCheck, setIsCheck] = useState<boolean>(false)

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px" />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <VStack w="100%" gap="20px" p="20px" pb="90px" pos="relative">
            <HighlightText
              text_color="text_caption"
              text_size="14px"
              text={` Please note that after conversion, if you want to convert xCETUS back to CETUS, a vesting period will be applied & different vesting
              durations correspond to different redeem ratios. Learn more`}
              keywords={['Learn more']}
              onKeywordClick={() => {
                window.open('https://cetus-1.gitbook.io/cetus-docs/tokenomics/xcetus', '_blank')
              }}
            />

            <HStack>
              <CheckBox
                checked={isCheck}
                onClick={() => {
                  setIsCheck(!isCheck)
                }}
              />
              <Text color="text_caption">Do not remind again.</Text>
            </HStack>

            <Button
              pos="absolute"
              bottom="0px"
              mt="4px"
              w="100%"
              h="52px"
              borderRadius="12px"
              fontSize="16px"
              fontWeight="500"
              onClick={() => {
                setShowConvertModel(!isCheck)
                onSubmitClick()
              }}
            >
              Convert
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
