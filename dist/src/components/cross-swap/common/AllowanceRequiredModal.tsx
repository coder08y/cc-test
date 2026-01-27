import { Box, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'

type TransactionProps = {
  isOpen: boolean
  onClose: (isManual: boolean) => void
  step: 1 | 2
  swapText: string
  approveSymbol: string
}

export default function AllowanceRequiredModal(props: TransactionProps) {
  const { isOpen, onClose, step, swapText, approveSymbol } = props
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={() => onClose(false)} isCentered>
      <ModalOverlay />
      <ModalContent>
        {/* 标题 */}
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            {'Waiting for Confirmation'}
          </Heading>
        </ModalHeader>
        <ModalCloseButton onClick={() => onClose(true)} />
        <ModalBody>
          <VStack gap="24px" pb="24px" pt="28px" w="100%">
            {/* 步骤进度条 */}
            <VStack gap="0" align="flex-start">
              {/* Step 1 */}
              <HStack>
                {step === 1 ? (
                  <Box position="relative" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="12" fill="#2A3238" />
                      <path d="M12 2 A10 10 0 0 1 12 22" stroke="#75C8FF" strokeWidth="2" fill="none" />
                    </svg>
                    <Text position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" color="primary" fontWeight="500" fontSize="14px">
                      1
                    </Text>
                  </Box>
                ) : (
                  <Box position="relative" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="12" fill="#2A3238" />
                    </svg>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
                    >
                      <path d="M4 8.5L7 11.5L12 5.5" stroke="#75C8FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Box>
                )}
                <Text ml="12px" fontWeight={500} color={step === 2 ? 'text_paragraph' : 'primary'} fontSize="14px">
                  Approve {approveSymbol} spending in your wallet
                </Text>
              </HStack>
              {/* 竖线：灰色 */}
              <Box ml="12px" mt="4px" h="20px" borderLeft="2px solid #2A3238" />
              {/* Step 2 */}
              <HStack mt="4px">
                {step === 2 ? (
                  <Box position="relative" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="12" fill="#2A3238" />
                      <path d="M12 2 A10 10 0 0 1 12 22" stroke="#75C8FF" strokeWidth="2" fill="none" />
                    </svg>
                    <Text position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" color="#75C8FF" fontWeight={500} fontSize="14px">
                      2
                    </Text>
                  </Box>
                ) : (
                  <Box position="relative" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="11" stroke="#2A3238" strokeWidth="2" fill="transparent" />
                    </svg>
                    <Text
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      color="text_paragraph"
                      fontWeight={500}
                      fontSize="14px"
                    >
                      2
                    </Text>
                  </Box>
                )}
                <Text ml="12px" fontWeight={500} color={step === 2 ? 'primary' : 'text_paragraph'} fontSize="14px">
                  Confirm this transaction in your wallet
                </Text>
              </HStack>
            </VStack>
            {/* swap 信息 */}
            <Text mt="20px" color="#fff" fontSize="14px" pt="12px" w="100%" textAlign="center">
              {swapText}
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
