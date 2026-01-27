// import { useConnectWallet, useWallets } from '@mysten/dapp-kit'
import { btcWalletList } from '@/config/cross-swap/btcWalletList'
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { useConnect as useBigmiConnect } from '@bigmi/react'
import { useGlobalToast } from '@cetus/design/src/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CommonTypeInfo, TransactionStatusType, WalletInfo } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { isWalletInstalled } from '@cetus/utils/src/isWalletInstalled'
import {
  Grid,
  GridItem,
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
import { ChainType } from '@lifi/sdk'
import { memo } from 'react'

type ConnectWalletModalProps = {
  isOpen: boolean
  onClose: () => void
}

function ConnectBtcWalletModal(props: ConnectWalletModalProps) {
  const { isOpen, onClose } = props
  const { connectors: bigmiConnectors } = useBigmiConnect()
  const { setFromAddressObj, setToAddressObj } = useCrossSwapWalletStore()

  const { isApp } = useWindowWidth()

  const { customToast, successTsToast } = useGlobalToast()

  const showInstallWalletToast = (wallet: WalletInfo) => {
    customToast(
      <VStack gap="8px" alignItems="start">
        <HStack>
          <Icon xlinkHref="#icon-icon_close" variant="error" />
          <Heading fontSize="14px" fontWeight="400" whiteSpace="nowrap" color="primary_red">
            Wallet Not Ready Error
          </Heading>
        </HStack>

        <HStack>
          <Text fontSize="14px" color="primary_gray" wordBreak="break-all">
            Please install
          </Text>
          <Text
            cursor="pointer"
            fontSize="14px"
            color="primary"
            wordBreak="break-all"
            onClick={() => {
              window.open(wallet.url, '_blank')
            }}
          >
            {wallet.name}
          </Text>
          <Text fontSize="14px" color="primary_gray" wordBreak="break-all">
            extension first
          </Text>
        </HStack>
      </VStack>
    )
  }

  const handleConnectWallet = async (wallet: WalletInfo) => {
    const walletObj = bigmiConnectors.find(item => item.name === wallet.name)

    console.log('🚀 ~ file: ConnectWalletModal.tsx:30 ~ ConnectWalletModal ~ supportWalletList:', {
      btcWalletList,
      wallet,
      walletObj
    })

    const isInstalled = isWalletInstalled(walletObj?.id ?? '')

    if (!walletObj || !isInstalled) {
      showInstallWalletToast(wallet)
      return
    }

    try {
      const res = await walletObj.connect()
      setFromAddressObj(ChainType.UTXO, { chain_address: res.accounts[0] })
      setToAddressObj(ChainType.UTXO, { chain_address: res.accounts[0] })
      console.log('🚀 ~ file: ConnectWalletModal.tsx:90 ~ handleConnectWallet ~ res:', res)
      successTsToast({
        getShowInfo: (_: TransactionStatusType): CommonTypeInfo => {
          const info: CommonTypeInfo = {
            iconUrl: wallet.icon.startsWith('http') || wallet.icon.startsWith('data:image') ? wallet.icon : `/images/wallet/${wallet.icon}.png`,
            toastTitleText: `Wallet Connected`
          }
          return info
        }
      })
      onClose()
    } catch (error) {
      console.log('🚀 ~ file: ConnectWalletMode.tsx:29 ~ handleConnectWallet ~ onError:', {
        error
      })
      if (String(error).includes('MetaMask not detected')) {
        showInstallWalletToast(wallet)
      }
    }
  }
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent minW={isApp ? '300px' : '552px'}>
        <ModalHeader>Connect a Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody p="16px" textAlign="center">
          <VStack>
            <Grid templateColumns={isApp ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'} gap={13} w="100%">
              {btcWalletList.map(item => (
                <GridItem key={item.name} colSpan={1}>
                  <HStack
                    p="0 12px"
                    h="60px"
                    bg="bg_six"
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="border"
                    cursor="pointer"
                    _hover={{
                      p: { color: 'primary' }
                    }}
                    onClick={() => {
                      handleConnectWallet(item)
                    }}
                  >
                    <Image
                      src={item.icon.startsWith('http') || item.icon.startsWith('data:image') ? item.icon : `/images/wallet/${item.icon}.png`}
                      alt="SVG Image"
                      boxSize={{ base: '28px', lg: '36px' }}
                      objectFit="cover"
                      borderRadius="8px"
                      loading="lazy"
                    />
                    <VStack align="flex-start" gap="4px">
                      {item.name == 'SuiMetaMaskSnap' ? (
                        <VStack align="flex-start" gap="0px">
                          <Text color="text_caption" textAlign="left">
                            Sui
                          </Text>
                          <Text textAlign="left" color="text_caption">
                            MetaMask
                          </Text>
                          <Text textAlign="left" color="text_caption">
                            Snap
                          </Text>
                        </VStack>
                      ) : (
                        <Text
                          lineHeight="16px"
                          textAlign="left"
                          color="text_caption"
                          whiteSpace="normal"
                          wordBreak="break-word"
                          overflowWrap="break-word"
                        >
                          {item.name}
                        </Text>
                      )}
                      {item.name == 'Binance' && (
                        <Text
                          fontWeight="500"
                          fontSize="10px"
                          p="2px 6px"
                          textAlign="center"
                          borderRadius="4px"
                          bg="primary_opacity.10"
                          color="primary"
                        >
                          Mobile
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </GridItem>
              ))}
            </Grid>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(ConnectBtcWalletModal)
