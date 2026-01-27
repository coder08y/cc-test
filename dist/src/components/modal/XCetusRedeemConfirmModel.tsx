import { TradeConfirmAmountInfo } from '@cetus/design/src/components/common'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { Button, HStack, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'

type RedeemConfirmModelProps = {
  inputAmountFrom: string
  inputAmountTo: string
  day: number
  isOpen: boolean
  onClose: () => void
  onSubmitClick: () => void
}

export default function XCetusRedeemConfirmModel(props: RedeemConfirmModelProps) {
  const { inputAmountFrom, inputAmountTo, day, isOpen, onClose, onSubmitClick } = props

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Redeem
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center" p="0px">
          <VStack w="100%" gap="20px" p="0 20px" pb="72px" pos="relative">
            <TradeConfirmAmountInfo
              bg={'bg_primary'}
              coinA={{
                amount: inputAmountFrom || '0',
                ...(envConfigs.x_cetus_coin as Token)
              }}
              iconParams={{
                xlinkHref: '#icon-a-icon_trade',
                svgFill: 'text_caption',
                fontSize: '12px'
              }}
              coinB={{
                amount: inputAmountTo || '0',
                ...(envConfigs.cetus_coin as Token)
              }}
            />
            <HStack w="100%" justify="space-between">
              <Text>Vesting duration </Text>
              <Text color="text_caption">{day} days</Text>
            </HStack>
            <Button
              pos="absolute"
              bottom="0px"
              w="100%"
              h="52px"
              borderRadius="12px"
              fontSize="16px"
              fontWeight="500"
              onClick={() => {
                onSubmitClick()
              }}
            >
              Confirm Redeem
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
