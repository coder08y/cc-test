import useDeepBookStore from '@/store/deepbook'
import useDeepBookMarginStore from '@/store/deepbook/margin'
import { CheckBox } from '@cetus/ui-kit'
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'

export default function EnableMarginTradingModal() {
  const { enableMarginTradingModalOpen, setEnableMarginTradingModalOpen, setMarginTradingEnabled } = useDeepBookMarginStore()
  const { currentDeepBookPool, setTradeType } = useDeepBookStore()
  const [isChecked, setIsChecked] = useState(false)

  //当 modal 打开时，重置复选框状态
  useEffect(() => {
    if (enableMarginTradingModalOpen) {
      setIsChecked(false)
    }
  }, [enableMarginTradingModalOpen])

  const handleClose = useCallback(() => {
    setEnableMarginTradingModalOpen(false)
    setIsChecked(false)
  }, [setEnableMarginTradingModalOpen])

  const handleEnableMarginTrading = useCallback(() => {
    setMarginTradingEnabled(true)
    setEnableMarginTradingModalOpen(false)
    setIsChecked(false)
    // 确认后自动切换到 Margin
    if (currentDeepBookPool?.address) {
      setTradeType(currentDeepBookPool.address, 'Margin')
    }
  }, [setMarginTradingEnabled, setEnableMarginTradingModalOpen, currentDeepBookPool?.address, setTradeType])

  return (
    <Modal isOpen={enableMarginTradingModalOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="448px" w="90%" borderRadius="16px">
        <ModalHeader
          sx={{
            p: '16px 16px 0'
          }}
        >
          <Text fontSize="16px" color="text_caption" fontWeight="500">
            Risk Acknowledgement
          </Text>
        </ModalHeader>
        <ModalCloseButton h="28px" />
        <ModalBody p="16px">
          <VStack gap="16px" alignItems="flex-start" w="100%">
            <VStack alignItems="flex-start" w="100%">
              <Text fontSize="14px" lineHeight="18px" color="text_caption">
                DeepBook Margin Trading is provided by DeepBook. Cetus serves as an interface for accessing this service.
              </Text>
              <Text fontSize="14px" lineHeight="18px" color="text_caption">
                DeepBook margin trading allows you to borrow assets to increase exposure. While leverage can amplify gains, it also increases the risk
                of loss.
              </Text>
            </VStack>

            <VStack alignItems="flex-start" gap="12px" w="100%">
              <Text fontSize="14px" lineHeight="18px" fontWeight="500" color="text_caption">
                Important Characteristics & Risks
              </Text>
              {/* <Text as="span" fontSize="14px" lineHeight="18px" color="text_caption">
                    3. Interest Accrues Continuously :
                  </Text>{' '} */}
              <VStack gap="6px" alignItems="flex-start" w="100%">
                <Text fontSize="14px" lineHeight="18px" fontWeight="500" color="text_caption">
                  Market-Isolated Accounts
                </Text>
                <Text fontSize="14px" lineHeight="18px">
                  Each margin account is isolated by market. Collateral, debt, and liquidation risk are calculated independently for each trading pair
                  and are not shared across markets.
                </Text>
              </VStack>
              <VStack gap="6px" alignItems="flex-start" w="100%">
                <Text fontSize="14px" lineHeight="18px" fontWeight="500" color="text_caption">
                  Liquidation Risk
                </Text>
                <Text fontSize="14px" lineHeight="18px">
                  If your account margin risk level falls below the liquidation threshold, your position may be partially or fully liquidated,
                  potentially resulting in asset loss and penalties.
                </Text>
              </VStack>
              <VStack gap="6px" alignItems="flex-start" w="100%">
                <Text fontSize="14px" lineHeight="18px" fontWeight="500" color="text_caption">
                  Open Order Risk
                </Text>
                <Text fontSize="14px" lineHeight="18px">
                  Open orders lock part of your balance. During rapid price movements, this may increase liquidation risk.
                </Text>
              </VStack>
              <VStack gap="6px" alignItems="flex-start" w="100%">
                <Text fontSize="14px" lineHeight="18px" fontWeight="500" color="text_caption">
                  Interest Accrual
                </Text>
                <Text fontSize="14px" lineHeight="18px">
                  Borrowed assets accrue interest continuously, increasing debt over time and potentially worsening account margin risk level even
                  without price changes.
                </Text>
              </VStack>
              <Text fontSize="14px" lineHeight="18px">
                This acknowledgement supplements the Cetus Terms of Use, which remain fully applicable.
              </Text>
            </VStack>

            <Box w="100%" p="12px" borderRadius="8px" bg="primary_opacity.10" cursor="pointer" onClick={() => setIsChecked(!isChecked)}>
              <HStack gap="8px">
                <CheckBox
                  checked={isChecked}
                  onClick={() => setIsChecked(!isChecked)}
                  wrapStyle={{
                    width: '16px',
                    height: '16px',
                    minW: '16px',
                    borderColor: 'primary',
                    bg: isChecked ? 'primary' : 'transparent',
                    sx: {
                      '& svg': {
                        w: '12px',
                        h: '12px',
                        fill: isChecked ? '#000 !important' : 'transparent !important'
                      }
                    }
                  }}
                />
                <Text fontSize="14px" color={'primary'} lineHeight="20px">
                  I understand the risks and agree to proceed.
                </Text>
              </HStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter p="16px" pt="0px !important">
          <Button
            w="100%"
            h="40px"
            borderRadius="8px"
            fontSize="14px"
            fontWeight="500"
            onClick={handleEnableMarginTrading}
            bg="primary"
            color="bg_secondary"
            _hover={{ bg: 'primary_hover' }}
            isDisabled={!isChecked}
          >
            Enable Margin Trading
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
