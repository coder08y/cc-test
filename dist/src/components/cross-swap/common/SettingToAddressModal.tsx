// import { validate as validateBtcAddress } from 'bitcoin-address-validation' // 需先安装依赖
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { SettingToAddressModalData } from '@/types/cross_swap'
import ErrorTips from '@cetus/design/src/components/common/ErrorTips'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { Chain } from '@cetusprotocol/cross-swap-sdk'
import {
  Button,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
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
import { isValidSuiAddress } from '@mysten/sui/utils'
import { PublicKey } from '@solana/web3.js'
import { isAddress as isEvmAddress } from 'ethers'
import { memo, useMemo, useState } from 'react'

export interface SettingToAddressModalProps {
  isOpen: boolean
  onClose: () => void
  handleChangeWallet: () => void
  data: SettingToAddressModalData
}

function SettingToAddressModal({ isOpen, onClose, data, handleChangeWallet }: SettingToAddressModalProps) {
  const { chain } = data
  const { setToAddressObj } = useCrossSwapWalletStore()
  const [step, setStep] = useState<'connect' | 'input'>('connect')

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered={true} autoFocus={false}>
      <ModalOverlay />
      <ModalContent overflow="hidden" minW="400px">
        <ModalHeader>
          {step === 'connect' ? (
            <Heading fontWeight="500" fontSize="16px">
              Connect Destination Wallet
            </Heading>
          ) : (
            <HStack position="relative" w="100%" justify="space-between">
              <Icon
                ml="-10px"
                xlinkHref="#icon-icon_descending_nor"
                cursor="pointer"
                fontSize="26px"
                transform="rotate(90deg)"
                onClick={() => setStep('connect')}
              />
              <Heading fontWeight="500" fontSize="16px" position="absolute" left="50%" transform="translateX(-50%)">
                Send to Address
              </Heading>
            </HStack>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" paddingBottom="16px">
          <VStack>
            {step === 'connect' && (
              <SettingToAddressModalConnect
                handleChangeWallet={() => {
                  handleChangeWallet()
                  onClose()
                }}
                jumpToInput={() => {
                  setStep('input')
                }}
              />
            )}
            {step === 'input' && (
              <SettingToAddressModalInput
                chain={chain}
                handleConfirm={inputValue => {
                  setToAddressObj(chain.type, { manual_address: inputValue })
                  onClose()
                }}
              />
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(SettingToAddressModal)

export function SettingToAddressModalConnect({ handleChangeWallet, jumpToInput }: { handleChangeWallet: () => void; jumpToInput: () => void }) {
  return (
    <VStack gap="16px" w="100%">
      <Button
        fontSize="14px"
        color="#000"
        fontWeight="500"
        borderRadius="12px"
        width="100%"
        h="50px"
        onClick={() => {
          handleChangeWallet()
        }}
      >
        Connect Wallet
      </Button>
      <HStack
        mt="8px"
        mb="8px"
        gap="2px"
        alignItems="center"
        cursor="pointer"
        onClick={() => {
          jumpToInput()
        }}
      >
        <Text fontSize="12px">Send to another address</Text>
        <Icon xlinkHref="#icon-detail" boxW="14px" boxH="14px" />
      </HStack>
    </VStack>
  )
}

export function SettingToAddressModalInput({ chain, handleConfirm }: { chain: Chain; handleConfirm: (address: string) => void }) {
  const [inputValue, setInputValue] = useState('')

  const btnDisabled = useMemo(() => {
    if (!inputValue) {
      return true
    }
    switch (chain.type) {
      case ChainType.EVM:
        return !isEvmAddress(inputValue)
      case ChainType.SVM:
        try {
          new PublicKey(inputValue)
          return false
        } catch {
          return true
        }
      case ChainType.MVM:
        return !isValidSuiAddress(inputValue)
      case ChainType.UTXO:
        const isBtcAddress =
          /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(inputValue) || // Legacy (P2PKH)
          /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(inputValue) || // P2SH
          /^bc1[ac-hj-np-z02-9]{11,71}$/.test(inputValue) // Bech32 (P2WPKH)

        return !isBtcAddress
      default:
        return true
    }
  }, [inputValue, chain.type])

  return (
    <VStack gap="8px" w="100%">
      <InputGroup>
        <Input
          pl="34px"
          pr="34px"
          fontSize="14px"
          w="100%"
          h="42px"
          value={inputValue}
          borderRadius="12px"
          placeholder="Enter Destination Address"
          variant="outline"
          onChange={e => setInputValue(e.target.value)}
        />

        <InputLeftElement ml="10px" h="100%" display="flex" alignItems="center">
          <SingleCoinImage imageUrl={chain.logo_url} w="18px" h="18px" margin="auto" />
        </InputLeftElement>

        <InputRightElement>
          {inputValue ? (
            <Icon
              xlinkHref="#icon-icon_close"
              position="absolute"
              top="12px"
              right={'8px'}
              onClick={e => {
                setInputValue('')
              }}
            />
          ) : null}
        </InputRightElement>
      </InputGroup>

      <ErrorTips
        tipsFontSize="12px"
        tipsLineHeight="15px"
        alignItems="start"
        tips="Make sure the address is correct and not from an exchange. Tokens sent to the wrong address cannot be recovered"
        type="warning"
      />
      <Button
        isDisabled={btnDisabled}
        mt="8px"
        fontSize="14px"
        color="#000"
        fontWeight="500"
        borderRadius="12px"
        width="100%"
        h="50px"
        onClick={() => {
          handleConfirm(inputValue)
        }}
      >
        Confirm
      </Button>
    </VStack>
  )
}
