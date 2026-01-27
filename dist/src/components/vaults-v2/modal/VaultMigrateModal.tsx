import { PoolShowInfo } from '@/components/common/CoinPairInfo'
import Slippage from '@/components/common/Slippage'
import { MigrateWithdrawResult } from '@/types/vaults-v2'
import { Block } from '@cetus/design'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { d, formatCurrency, formatCurrencyUSD, formatNumber, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PriceRangeChartPageBlock from '../detail/chart/PriceRangeChartPageBlock'
import { VaultMigrateCurrent } from './VaultMigrateCurrent'
import { VaultMigrateTarget } from './VaultMigrateTarget'

export type VaultMigrateModalOptions = {
  currentVaultApiInfo: any
  currentVaultContractInfo: any
  targetVaultApiInfo: any
  targetVaultContractInfo: any
  currentVaultPosition: any
}

type VaultMigrateModalProps = {
  isOpen: boolean
  onClose: () => void
  removePercent: number
  preCalculateResult?: MigrateWithdrawResult
  preCalculateLoading: boolean
  migrateSubmitLoading: boolean
  isSameTokenPair: boolean
  vaultFarmingRewardAmountUSD: string
  isVaultsFarming: boolean
  options: VaultMigrateModalOptions
  vaultsFarmingRewards: any[]
  handlePercentInputChange: (value: number) => void
  preCalculateMigrate: () => void
  handleMigrate: () => void
}
function VaultMigrateModal(props: VaultMigrateModalProps) {
  const {
    isOpen,
    onClose,
    options,
    removePercent,
    handlePercentInputChange,
    preCalculateResult,
    preCalculateLoading,
    preCalculateMigrate,
    handleMigrate,
    migrateSubmitLoading,
    vaultsFarmingRewards,
    vaultFarmingRewardAmountUSD,
    isVaultsFarming,
    isSameTokenPair
  } = props
  const { currentVaultApiInfo, currentVaultContractInfo, targetVaultApiInfo, targetVaultContractInfo, currentVaultPosition } = options
  const navigate = useNavigate()
  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      <ModalOverlay />
      <ModalContent minWidth={{ base: '100%', lg: '820px' }} maxHeight="calc(100vh - 80px)" display="flex" flexDirection="column">
        <HStack w="100%" justifyContent="space-between">
          <ModalHeader fontSize="16px" fontWeight="500" flexShrink={0} pt="20px">
            Migrate
          </ModalHeader>
          <HStack gap="0px" pt="14px">
            {!isSameTokenPair && <Slippage isModal={false} slippageType="liquidity" showNewTolerance={true} />}
            <Box w="40px" />
            <ModalCloseButton pt="14px" />
          </HStack>
        </HStack>

        <ModalBody p="0px" overflowY="auto" flex="1" minH="0">
          <Flex
            w="100%"
            gap={{ base: '16px', lg: '2px' }}
            p="16px"
            pt="4px"
            alignItems="start"
            flexDirection={{ base: 'column', lg: 'row' }}
            flexWrap="nowrap"
          >
            <VaultMigrateCurrent
              currentVaultApiInfo={currentVaultApiInfo}
              currentVaultContractInfo={currentVaultContractInfo}
              removePercent={removePercent}
              handlePercentInputChange={handlePercentInputChange}
              preCalculateLoading={preCalculateLoading}
              withdraw={preCalculateResult?.withdraw}
            />
            <Flex
              w="20px"
              h="20px"
              justifyContent="center"
              alignItems="center"
              position="relative"
              mt={{ base: '0px', lg: '100px' }}
              mx={{ base: 'auto', lg: '0px' }}
              transform={{ base: 'rotate(90deg)', lg: 'rotate(0deg)' }}
              flexShrink={0}
            >
              <Icon position="absolute" top="0px" left="0px" fontSize="20px" xlinkHref="#icon-icon_arrow1" />
              <Icon position="absolute" top="0px" left="0px" fontSize="20px" xlinkHref="#icon-icon_arrow_1" svgFill="#ffffff" />
            </Flex>
            <VaultMigrateTarget
              isSameTokenPair={isSameTokenPair}
              isVaultsFarming={isVaultsFarming}
              vaultFarmingRewardAmountUSD={vaultFarmingRewardAmountUSD}
              currentVaultApiInfo={targetVaultApiInfo}
              currentVaultContractInfo={targetVaultContractInfo}
              preCalculateLoading={preCalculateLoading}
              deposit={preCalculateResult?.deposit}
              swap_results={preCalculateResult?.swap_results}
              preCalculateMigrate={preCalculateMigrate}
              handleMigrate={handleMigrate}
              migrateSubmitLoading={migrateSubmitLoading}
              vaultsFarmingRewards={vaultsFarmingRewards}
              handleJumpUrl={() => {
                onClose()
                navigate(`/vaults/${targetVaultApiInfo?.vaultId}`, { replace: true })
              }}
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default VaultMigrateModal
