import { Block, TradeConfirmAmountInfo } from '@cetus/design'
import { d, formatNumber } from '@cetus/utils'
import {
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  VStack
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { PriceBlock } from './OrderItemBlock/PriceBlock'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  handleSubmitOrder: () => void
  confirmData: any
  submitOrderLoading: boolean
}

const ConfirmModal = ({ confirmData, isOpen, onClose, handleSubmitOrder, submitOrderLoading }: ConfirmModalProps) => {
  const { payAmount, targetAmount, payCoin, targetCoin, inputPrice, expiresIn, quoteToken } = confirmData

  const price = useMemo(() => {
    console.log('🚀 ~ price ~ inputPrice:', inputPrice)
    if (inputPrice) {
      return quoteToken?.coin_type?.toLowerCase() == targetCoin?.coin_type?.toLowerCase() ? inputPrice : d(1).div(inputPrice).toString()
    }
    return ''
  }, [quoteToken, targetCoin, inputPrice])

  const reseverPrice = useMemo(() => {
    if (inputPrice) {
      return quoteToken?.coin_type?.toLowerCase() == targetCoin?.coin_type?.toLowerCase() ? d(1).div(inputPrice).toString() : inputPrice
    }
    return ''
  }, [quoteToken, targetCoin, inputPrice])

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Review your order
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <VStack w="100%" gap="16px" p="16px">
            <TradeConfirmAmountInfo
              coinA={{
                amount: formatNumber(payAmount, payCoin?.decimals).toString() || '0',
                ...payCoin
              }}
              iconParams={{
                xlinkHref: '#icon-a-icon_trade',
                svgFill: 'text_caption',
                fontSize: '12px'
              }}
              coinB={{
                amount: formatNumber(targetAmount, targetCoin?.decimals).toString() || '0',
                ...targetCoin
              }}
            />
            <HStack w="100%" justify="space-between">
              <Text>Price</Text>
              <Skeleton isLoaded={!!inputPrice}>
                <PriceBlock info={{ pay_coin: payCoin, target_coin: targetCoin, price, reseverPrice }} />
              </Skeleton>
            </HStack>
            <HStack w="100%" justify="space-between">
              <Text>Expires in</Text>
              <Text color="text_caption">{expiresIn}</Text>
            </HStack>
            <Block borderRadius="12px" p="8px">
              <Text lineHeight="20px" textAlign="left" fontSize="12px">
                You will receive exactly what you have specified if your order is fully filled in the end.
              </Text>
            </Block>
            <Block borderRadius="12px" p="8px">
              <Text lineHeight="20px" textAlign="left" fontSize="12px">
                Please note that your order may not be filled immediately after the price is triggered, depending on pending sequence and liquidity
                depth.
              </Text>
            </Block>
            <Button
              onClick={() => {
                handleSubmitOrder()
                onClose()
              }}
              isDisabled={submitOrderLoading}
              w="calc(100% + 32px)"
              mb="-30px"
              h="52px"
              fontWeight="500"
            >
              Place Order
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmModal
