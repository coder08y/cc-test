import useGetPythLastPrice from '@/hooks/vault-v2/pyth-price/useGetPythLastPrice'
import useCurrentVaultDetail from '@/hooks/vault-v2/useCurrentVaultDetail'
import useGetVaultsPosition from '@/hooks/vault-v2/useGetVaultsPosition'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPoolStore from '@/store/vaults-v2/useVaultsPool'
import { useAccountBalance, useInterval } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { VaulDrawer } from '@cetus/ui-kit'
import { isAvailableObject } from '@cetus/utils'
import { HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PoweredByHaedal from '../common/PoweredByHaedal'
import VaultsAction from '../detail/VaultsAction'
import VaultInfo from './VaultInfo'

type VaultModalProps = {
  isOpen: boolean
  setIsOpen: (status: boolean) => void
  displayTokenA?: Token | undefined
  displayTokenB?: Token | undefined
  feeDisplay: string
  clmmPool: string
  vaultId: string
  isReverse: boolean
  category: string
  setIsOpenFarmingModal: (status: boolean) => void
  setFarmingModalAction: (value: string) => void
  isVaultsFarming?: boolean
  onClose: () => void
}
function VaultModal(props: VaultModalProps) {
  const { currentAccount } = useAccountStore()
  const { getVaultPositionsV2 } = useGetVaultsPosition()
  const {
    isOpen,
    setIsOpen,
    vaultId,
    category,
    displayTokenA,
    displayTokenB,
    feeDisplay,
    clmmPool,
    isReverse,
    setIsOpenFarmingModal,
    setFarmingModalAction,
    onClose
  } = props
  const { isOpenWalletModal } = useAccountStore()
  const { getCurrentVaultDetail, getCurrentVaultContractInfo } = useCurrentVaultDetail()
  const { clearVaultsActionData } = useVaultsActionStore()
  const { fetchAccountBalance } = useAccountBalance()

  const navigate = useNavigate()
  const { vaultsPoolObj } = useVaultsPoolStore()

  const currentVaultPool = useMemo(() => {
    return vaultsPoolObj[vaultId as string]
  }, [vaultsPoolObj, vaultId])

  const { vaultsFarmObj } = useVaultsFarmingStore()
  useEffect(() => {
    if (vaultId && isAvailableObject(vaultsFarmObj)) {
      getCurrentVaultDetail(vaultId as string)
    }
  }, [currentAccount?.address, vaultId, vaultsFarmObj])

  const { getPythLastPrice } = useGetPythLastPrice()

  const isMountedRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearVaultsActionData()
    }
  }, [])

  useEffect(() => {
    if (currentVaultPool?.displayCoinTypeA && currentVaultPool?.displayCoinTypeB) {
      getPythLastPrice([currentVaultPool?.displayCoinTypeA, currentVaultPool?.displayCoinTypeB], currentVaultPool?.category)
    }
  }, [currentVaultPool?.displayCoinTypeA, currentVaultPool?.displayCoinTypeB])

  useInterval({
    interval: 20 * 1000,
    callback: () => {
      if (isMountedRef.current && (category == 'haedal' || category == 'haevault_v2')) {
        getPythLastPrice([currentVaultPool?.displayCoinTypeA, currentVaultPool?.displayCoinTypeB], currentVaultPool?.category)
      }
    }
  })

  const autoRefresh = () => {
    console.log('🚀🚀🚀 ~ q223VaultsDetailPage.tsx:142 ~ autoRefresh ~ autoRefresh:')
    if (currentAccount?.address) {
      // 刷新余额
      fetchAccountBalance()
      getCurrentVaultDetail(vaultId as string, true)
    } else {
      getCurrentVaultContractInfo(vaultId as string)
    }
  }

  const { vaultListObj } = useVaultsListV2Store()

  const apiVaultInfo = useMemo(() => {
    if (isAvailableObject(vaultListObj) && vaultId) {
      return vaultListObj[vaultId]
    }
    return
  }, [vaultListObj, vaultId])

  // 每次打开auto弹框时候重新请求一下vault 仓位数据
  useEffect(() => {
    if (currentAccount?.address && apiVaultInfo?.vaultId && isAvailableObject(vaultsFarmObj)) {
      getVaultPositionsV2(currentAccount?.address, [apiVaultInfo], vaultsFarmObj)
    }
  }, [apiVaultInfo?.vaultId, vaultsFarmObj, currentAccount?.address])
  const { minPrice, maxPrice, currentPrice } = useMemo(() => {
    if (currentVaultPool && currentVaultPool.positionList && currentVaultPool.positionList.length > 0) {
      return {
        minPrice: currentVaultPool.positionList[0].minPrice,
        maxPrice: currentVaultPool.positionList[0].maxPrice,
        currentPrice: currentVaultPool.positionList[0].currentPrice
      }
    }

    return {
      minPrice: undefined,
      maxPrice: undefined,
      currentPrice: undefined
    }
  }, [currentVaultPool])

  const { isApp } = useWindowWidth()

  const Container = isApp ? VaultsDrawer : VaultsModal

  return (
    <Container isOpen={isOpen} onClose={onClose} isOpenWalletModal={isOpenWalletModal}>
      <VStack
        width="100%"
        overflow="auto"
        gap="0px"
        pb={{ base: '12px', lg: '0' }}
        maxH={{ base: '90vh', lg: '100%' }}
        sx={{
          ...(isApp && {
            '&::-webkit-scrollbar': { display: 'none' }
          })
        }}
      >
        <VStack
          width="100%"
          p={{ base: '6px 12px 6px', lg: '6px 16px 16px' }}
          mb={{ base: '0' }}
          gap="0"
          borderRadius="16px"
          sx={{
            backgroundImage: "url('/images/vault_modal_bg@2x.png')",
            backgroundPosition: 'top center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 320px'
          }}
        >
          <HStack h="36px" w="100%" mb={{ base: '12px', lg: '12px' }}>
            <Text color="text_caption" fontWeight="500" fontSize={{ base: '14px', lg: '16px' }} pt={{ base: '16px', lg: '0' }}>
              Auto Vault
            </Text>
            {!isApp && <ModalCloseButton />}
          </HStack>
          <VaultInfo
            displayTokenA={displayTokenA}
            displayTokenB={displayTokenB}
            feeDisplay={feeDisplay}
            clmmPool={clmmPool}
            isReverse={isReverse}
            minPrice={minPrice}
            maxPrice={maxPrice}
            currPrice={currentPrice}
            category={category}
            vaultId={vaultId}
            apiVaultInfo={apiVaultInfo}
            binStep={apiVaultInfo?.binStep}
            poolCount={apiVaultInfo?.poolCount}
          />
          <VaultsAction
            vaultId={vaultId as string}
            isModal={true}
            autoRefresh={autoRefresh}
            setIsOpenFarmingModal={setIsOpenFarmingModal}
            setFarmingModalAction={setFarmingModalAction}
            setIsOpenPre={setIsOpen}
          />
        </VStack>

        <HStack
          borderTop="1px solid"
          borderColor={{ base: 'transparent', lg: 'border' }}
          width="100%"
          padding={{ base: '4px 12px 4px', lg: '12px 16px 4px' }}
          justifyContent={category == 'haedal' ? 'space-between' : 'center'}
        >
          <PoweredByHaedal mt="0" category={category} />
          <Text
            fontSize="12px"
            _hover={{ color: 'primary' }}
            whiteSpace="nowrap"
            cursor="pointer"
            onClick={() => {
              if (category && vaultId) {
                clearVaultsActionData()
                onClose()
                navigate(`/vaults/${vaultId}`)
              }
            }}
          >
            Vault Details &gt;
          </Text>
        </HStack>
      </VStack>
    </Container>
  )
}
export default VaultModal

type VaultsModalProps = {
  isOpen: boolean
  onClose: () => void
  isOpenWalletModal: boolean
  children: React.ReactNode
}

const VaultsModal = ({ isOpen, onClose, isOpenWalletModal, children }: VaultsModalProps) => {
  return (
    <Modal
      isCentered
      isOpen={isOpen && !isOpenWalletModal}
      onClose={() => {
        onClose()
      }}
    >
      <ModalOverlay />
      <ModalContent width={{ base: '100%', lg: '420px' }}>
        <ModalBody p="0 0 8px">{children}</ModalBody>
      </ModalContent>
    </Modal>
  )
}

type VaultsDrawerProps = {
  children: React.ReactNode
  isOpen: boolean
  isOpenWalletModal: boolean
  onClose: () => void
}

const VaultsDrawer = ({ children, isOpen, isOpenWalletModal, onClose }: VaultsDrawerProps) => {
  return (
    <VaulDrawer isAllScreen isOpen={isOpen && !isOpenWalletModal} onClose={onClose} padding="0">
      {children}
    </VaulDrawer>
  )
}
