import useDcaStore from '@/store/dca'
import { Block } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { Icon } from '@cetus/ui-kit'
import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react'
import DetailsContent from './DetailsContent'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  toOpenDca: () => void
  confirmData: any
  toOpenDcaLoading: boolean
}

const ConfirmModal = ({ confirmData, isOpen, onClose, toOpenDca, toOpenDcaLoading }: ConfirmModalProps) => {
  const { sellCoin, buyCoin } = useDcaStore()
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
            <Block borderRadius="12px" position="relative" p="0 12px">
              <HStack w="100%" justify="space-between">
                <VStack align="flex-start" w="calc(50% - 24px)">
                  <Text>Sell</Text>
                  <SingleTokenInfo token={sellCoin} haveName={false} symbolEllipsesDecimals={10} />
                </VStack>
                <Box w="1px" h="100px" bg="border" />
                <VStack align="flex-end" w="calc(50% - 24px)">
                  <Text>Buy</Text>
                  <SingleTokenInfo token={buyCoin} haveName={false} symbolEllipsesDecimals={10} />
                </VStack>
              </HStack>
              <Center
                w="36px"
                h="36px"
                borderRadius="50%"
                position="absolute"
                left="calc(50% - 18px)"
                top="calc(50% - 18px)"
                border="1px solid"
                borderColor="border"
                boxShadow="trade_icon_shadow"
                bg="input_bg"
              >
                <Icon mt="-1px" svgW="12px" svgH="12px" xlinkHref="#icon-a-icon_trade" svgFill="text_caption" transform="rotate(-90deg)" />
              </Center>
            </Block>
            <DetailsContent detailsData={confirmData} isConfirm />
            <Button
              mt="12px"
              onClick={() => {
                toOpenDca()
                onClose()
              }}
              isDisabled={toOpenDcaLoading}
              w="calc(100% + 32px)"
              mb="-30px"
              h="52px"
              fontWeight="500"
            >
              Create DCA Order
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmModal
