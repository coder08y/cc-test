import { getChainLink } from '@/hooks/cross-swap/useCrossHelper'
import { useWalletIconFromChain } from '@/hooks/cross-swap/useWalletIcon'
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { CrossWalletModalData } from '@/types/cross_swap'
import { CetusTooltip, CopyButton } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { addressAbridge } from '@cetus/utils/src/common'
import { Button, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { ChainType } from '@lifi/sdk'
import { memo } from 'react'

export interface CrossAccountModalProps {
  isOpen: boolean
  onClose: () => void
  handleChangeWallet: () => void
  handleDisconnectWallet: () => void
  data: CrossWalletModalData
}

function CrossAccountModal({ isOpen, onClose, data, handleDisconnectWallet, handleChangeWallet }: CrossAccountModalProps) {
  const { address, chain, isFrom, isManualAddress } = data
  const { setToAddressObj } = useCrossSwapWalletStore()
  const walletIcon = useWalletIconFromChain(chain)

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered={true} autoFocus={false}>
      <ModalOverlay />
      <ModalContent overflow="hidden" minW="400px">
        <ModalHeader>{isFrom ? 'Source Wallet' : 'Destination Wallet'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" paddingBottom="16px">
          <VStack gap="16px">
            <Image
              w="56px"
              h="56px"
              borderRadius="50%"
              src={isManualAddress ? chain.logo_url : walletIcon || chain.logo_url}
              alt={chain.chain_name}
            />
            <HStack gap="8px">
              {/* 展示钱包地址 */}
              <Text fontSize="18px" color="text_caption" fontWeight={500}>
                {addressAbridge(address)}
              </Text>
              {/* 拷贝和跳转 */}
              <HStack gap="6px">
                <CetusTooltip children={<CopyButton svgW="18px" svgH="18px" text={address} />} tooltip="Copy address" placement="top" />
                <CetusTooltip
                  children={
                    <Icon
                      xlinkHref="#icon-icon_link3"
                      fontSize="18px"
                      onClick={() => {
                        window.open(getChainLink(address, chain, 'address'), '_blank')
                      }}
                    />
                  }
                  tooltip="View on Explorer"
                  placement="top"
                />
              </HStack>
            </HStack>

            <HStack mt="12px" w="100%" gap="8px" justifyContent="space-between">
              {chain.type !== ChainType.EVM && (
                <Button
                  leftIcon={<Icon xlinkHref="#icon-icon_swap1" svgW="18px" svgH="18px" svgFill="primary" svgHover="primary" mr="-6px" />}
                  fontSize="14px"
                  borderColor="primary"
                  w="100%"
                  fontWeight={500}
                  variant="outline"
                  onClick={() => {
                    handleChangeWallet()
                    // 如果切换钱包，则清空手动输入的地址
                    if (isManualAddress) {
                      setToAddressObj(chain.type, { manual_address: undefined })
                    }
                    onClose()
                  }}
                >
                  Change Wallet
                </Button>
              )}
              <Button
                w="100%"
                fontSize="14px"
                fontWeight={500}
                leftIcon={<Icon xlinkHref="#icon-icon_dis" svgW="18px" svgH="18px" svgFill="block_color" svgHover="block_color" mr="-6px" />}
                colorScheme="blue"
                onClick={() => {
                  if (isManualAddress) {
                    setToAddressObj(chain.type, { manual_address: undefined })
                  } else {
                    handleDisconnectWallet()
                  }
                  onClose()
                }}
              >
                {isManualAddress ? 'Clear' : 'Disconnect'}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(CrossAccountModal)
