import PoolTag from '@/components/common/PoolTag'
import { Block } from '@cetus/design'
import { Token } from '@cetus/types'
import { CoinPairImage } from '@cetus/ui-kit'
import { Button, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'

type CreateSuccessModalProps = {
  isOpen: boolean
  onClose: () => void
  data: {
    baseToken: Token
    quoteToken: Token
    feeDisplay?: string
  }
}

export default function CreateSuccessModal(props: CreateSuccessModalProps) {
  const { isOpen, onClose, data } = props
  const { baseToken, quoteToken, feeDisplay } = data

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        {/* 标题 */}
        <ModalHeader />
        <ModalCloseButton />
        <ModalBody>
          <VStack gap="8px" pb="8px" pt="28px" w="100%">
            {/* 描述 */}
            <VStack gap="8px">
              <Image src="/images/img_transactionsuccess@2x.png" w="200px" h="200px" alt="icon" />

              <VStack mt="-155px" gap="10px">
                <HStack>
                  <CoinPairImage
                    coinACoinType={baseToken?.coin_type}
                    coinBCoinType={quoteToken?.coin_type}
                    coinAIconUrl={baseToken?.logo_url}
                    coinBIconUrl={quoteToken?.logo_url}
                    imageStyle={{
                      w: '24px',
                      h: '24px'
                    }}
                    imgBoxStyle={{
                      w: '24px',
                      h: '24px'
                    }}
                  />

                  <Text fontSize="14px" color="text_caption">
                    {`${baseToken?.symbol} - ${quoteToken?.symbol}`}
                  </Text>
                </HStack>
                <PoolTag poolType="clmm" displayFee={feeDisplay || '--'} />
              </VStack>

              <Block mt="80px" borderRadius="16px" padding="16px">
                <Text color="primary_gray" fontSize="12px" lineHeight="20px">
                  The pool has been created. It will usually take up to 3 min for a new pool to be presented in front end interface. Thanks for
                  creating this pool
                </Text>
              </Block>

              <Button
                mt="16px"
                fontSize="14px"
                w="100%"
                onClick={() => {
                  onClose()
                }}
              >
                OK
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
