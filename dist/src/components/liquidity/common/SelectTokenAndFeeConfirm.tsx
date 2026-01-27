import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VaulDrawer } from '@cetus/ui-kit'
import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalOverlay, Text, VStack } from '@chakra-ui/react'

interface SelectTokenAndFeeConfirmProps {
  title: string
  subTitle?: string
  btnText: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

function SelectTokenAndFeeConfirm({ title, subTitle, btnText, isOpen, onClose, onConfirm }: SelectTokenAndFeeConfirmProps) {
  const { isApp } = useWindowWidth()
  const Container = isApp ? SelectTokenAndFeeConfirmDrawer : SelectTokenAndFeeConfirmModal

  return <Container title={title} subTitle={subTitle} btnText={btnText} isOpen={isOpen} onClose={onClose} onConfirm={onConfirm} />
}

type SelectTokenAndFeeConfirmContentProps = {
  title: string
  subTitle?: string
  btnText: string
  onClose: () => void
  onConfirm: () => void
}

const SelectTokenAndFeeConfirmContent = ({ title, subTitle, btnText, onClose, onConfirm }: SelectTokenAndFeeConfirmContentProps) => {
  return (
    <VStack gap="20px" p={{ base: '20px 16px', lg: '20px 16px' }}>
      <Box w="140px" h="140px" bg="center / contain no-repeat url('/images/img_pool@2x.png')" />
      <Text h="20px" lineHeight="20px" fontSize="14px" color="text_caption" fontWeight="500">
        {title}
      </Text>
      {subTitle && <Text fontSize="14px">{subTitle}</Text>}
      <Button
        w="100%"
        h="40px"
        borderRadius="12px"
        colorScheme="blue"
        fontSize="16px"
        fontWeight="500"
        onClick={() => {
          onClose()
          onConfirm()
        }}
      >
        {btnText}
      </Button>
    </VStack>
  )
}

type SelectTokenAndFeeConfirmModalProps = SelectTokenAndFeeConfirmProps

const SelectTokenAndFeeConfirmModal = ({ title, subTitle, btnText, isOpen, onClose, onConfirm }: SelectTokenAndFeeConfirmModalProps) => {
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody p="20px 16px">
          <VStack>
            <Box w="140px" h="140px" bg="center / contain no-repeat url('/images/img_pool@2x.png')" />
            <Text h="20px" lineHeight="20px" fontSize="14px" color="text_caption" fontWeight="500">
              {title}
            </Text>
            {subTitle && <Text fontSize="14px">{subTitle}</Text>}
          </VStack>
        </ModalBody>

        <ModalFooter p="0 16px 16px">
          <Button
            w="100%"
            h="40px"
            borderRadius="12px"
            colorScheme="blue"
            fontSize="16px"
            fontWeight="500"
            onClick={() => {
              onClose()
              onConfirm()
            }}
          >
            {btnText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

type SelectTokenAndFeeConfirmDrawerProps = SelectTokenAndFeeConfirmProps

const SelectTokenAndFeeConfirmDrawer = ({ title, subTitle, btnText, isOpen, onClose, onConfirm }: SelectTokenAndFeeConfirmDrawerProps) => {
  return (
    <VaulDrawer isOpen={isOpen} onClose={onClose} padding="0 0 8px">
      <SelectTokenAndFeeConfirmContent title={title} subTitle={subTitle} btnText={btnText} onClose={onClose} onConfirm={onConfirm} />
    </VaulDrawer>
  )
}

export default SelectTokenAndFeeConfirm
