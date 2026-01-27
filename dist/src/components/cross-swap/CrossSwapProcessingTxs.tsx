import {
  Button,
  HStack,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react'

type CrossSwapProcessingTxsProps = {
  isOpen: boolean
  onClose: () => void
}
export default function CrossSwapProcessingTxs(props: CrossSwapProcessingTxsProps) {
  const { isOpen, onClose } = props
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={'460px'}>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Processing Transaction
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px 16px 32px" minH="300px">
          <VStack maxW="300px" margin="28px auto 0">
            <Image src="/images/img_transactionsubmitted@2x.png" w="150px" h="150px" />
            <Text color="text_caption">Swapping 50.678 SUI for 1.2 SOL</Text>
            <Text lineHeight="17px">You may close the window and view details in your transaction history</Text>
            <HStack mt="20px">
              <Button
                w="204px"
                fontWeight="400"
                bg="none"
                border="1px solid"
                borderColor="primary"
                color="primary"
                fontSize="14px"
                _hover={{
                  color: 'block_color',
                  bg: 'primary'
                }}
              >
                View on Explorer
              </Button>
              <Button w="204px" fontWeight="500" fontSize="14px">
                Close
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
