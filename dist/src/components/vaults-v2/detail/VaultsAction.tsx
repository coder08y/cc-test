import Slippage from '@/components/common/Slippage'
import { useVaultsMigrate } from '@/hooks/vault-v2/useVaultsMigrate'
import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPoolStore from '@/store/vaults-v2/useVaultsPool'
import { Block, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { RefreshButton } from '@cetus/ui-kit'
import { HStack, Switch, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import FarmingIncentives from '../farming/FarmingIncentives'
import { MigrateSuccessModal } from '../modal/MigrateSuccessModal'
import VaultMigrateModal from '../modal/VaultMigrateModal'
import VaultsAdd from './VaultsAdd'
import VaultsRemove from './VaultsRemove'

const tabList = [
  {
    label: 'Deposit',
    value: 'Deposit'
  },
  {
    label: 'Withdraw',
    value: 'Withdraw'
  }
]
// Vault 操作部分 弹窗详情共用 isModal参数区分
export default function VaultsAction({
  vaultId,
  autoRefresh,
  isRefresh,
  isModal,
  setIsOpenFarmingModal,
  setIsOpenPre,
  setFarmingModalAction
}: {
  vaultId: string
  autoRefresh: () => void
  isModal: boolean
  isRefresh?: boolean
  setIsOpenFarmingModal: (status: boolean) => void
  setIsOpenPre: (status: boolean) => void
  setFarmingModalAction: (value: string) => void
}) {
  const {
    setAmountInputA,
    setAmountInputB,
    currTab,
    setCurrTab,
    setIsCheckedZAP,
    setAssetAction,
    setVaultsZapProps,
    isCheckedZAP,
    fromToken,
    toToken
  } = useVaultsActionStore()

  const {
    migrateModalOptions,
    showMigrateTips,
    removePercent,
    preCalculateResult,
    preCalculateLoading,
    handlePercentInputChange,
    resetMigrateData,
    preCalculateMigrate,
    handleMigrateSubmit,
    migrateSubmitLoading,
    migrateSuccessResult,
    setMigrateSuccessResult,
    vaultFarmingRewardAmountUSD,
    vaultsFarmingRewards,
    isSameTokenPair
  } = useVaultsMigrate(vaultId)
  const { vaultListObj, lpTokenInfoObj } = useVaultsListV2Store()
  const { vaultsPoolObj } = useVaultsPoolStore()
  const currentVaultPoolApiInfo = useMemo(() => {
    return vaultListObj[vaultId as string]
  }, [vaultListObj, vaultId])
  const currentVaultPoolContractInfo = useMemo(() => {
    return vaultsPoolObj[vaultId as string]
  }, [vaultsPoolObj])

  const lpTokenInfo = useMemo(() => {
    return lpTokenInfoObj[currentVaultPoolApiInfo?.lpTokenType]
  }, [lpTokenInfoObj, currentVaultPoolApiInfo?.lpTokenType])

  const [isModalRefresh, setIsModalRefresh] = useState(false)

  const handleRefresh = () => {
    autoRefresh()
    setIsModalRefresh(prev => !prev)
  }

  const { autoClaimStakeFarming, setAutoClaimStakeFarming } = useVaultsFarmingStore()

  const { currentVaultsFarm, isVaultsFarming, isActiveVaultsFarming } = useCurrentVaultsFarm(currentVaultPoolApiInfo?.vaultId)

  const { vaultsFarmingStaked, autoClaimFarmingReward, setAutoCliamFarmingReward } = useVaultsFarmingStore()

  const { currentAccount } = useAccountStore()

  const currentVaultsFarmingStaked: any = useMemo(() => {
    return vaultsFarmingStaked[currentVaultPoolApiInfo?.vaultId]
  }, [vaultsFarmingStaked, currentVaultPoolApiInfo?.vaultId])

  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false)

  useEffect(() => {
    if (migrateSuccessResult) {
      setIsMigrateModalOpen(false)
    }
  }, [migrateSuccessResult])

  useEffect(() => {
    return () => {
      setCurrTab('Deposit')
      setIsCheckedZAP(false)
      setAssetAction('both')
      setVaultsZapProps(undefined)
    }
  }, [])

  useEffect(() => {
    return () => {
      setVaultsZapProps(undefined)
    }
  }, [currTab])

  useEffect(() => {
    if (currentVaultPoolApiInfo?.status === 'sunset' || currentVaultPoolApiInfo?.status === 'sunsetSoon') {
      setCurrTab('Withdraw')
    }
  }, [currentVaultPoolApiInfo?.status])

  useEffect(() => {
    if (isMigrateModalOpen) {
      handlePercentInputChange(100)
    } else {
      resetMigrateData()
    }
  }, [isMigrateModalOpen])
  const { isApp } = useWindowWidth()
  return (
    <VStack w={{ base: '100%', lg: '100%' }} justifyContent="start" gap={isModal ? '8px' : '12px'}>
      {showMigrateTips && migrateModalOptions && (
        <Block mt="16px" mb="-14px" borderRadius="12px" bg="text_highlight_opacity.10" p="12px" border="0px solid">
          <Text lineHeight="20px" fontSize="14px" color="primary_gray">
            {showMigrateTips}
            <Text
              as="span"
              lineHeight="16px"
              fontSize="12px"
              ml="6px"
              fontWeight={600}
              color="primary"
              cursor="pointer"
              onClick={() => setIsMigrateModalOpen(true)}
            >
              Migrate →
            </Text>
          </Text>
        </Block>
      )}
      {/* 切换Tab */}
      {/* <Block p="0" borderRadius="12px" bg="bg_six" borderColor="border_secondary"> */}
      <HStack w="100%" borderBottom={{ base: '1px solid', lg: 'none' }} borderColor={'border'}>
        <SelectTab
          type="borderTab"
          wrapStyle={{
            w: '100%',
            h: isModal ? (isApp ? '38px' : '54px') : isApp ? '42px' : '60px',
            border: 'none',
            bg: 'transparent'
          }}
          itemStyle={{
            fontSize: isModal ? '14px' : isApp ? '14px' : '16px',
            fontWeight: 500,
            mr: '28px'
          }}
          tabList={
            currentVaultPoolApiInfo?.status === 'sunset' || currentVaultPoolApiInfo?.status === 'sunsetSoon'
              ? [{ label: 'Withdraw', value: 'Withdraw' }]
              : tabList
          }
          currentTab={currTab}
          handleChangeTab={(item: any) => {
            setAmountInputA('')
            setAmountInputB('')
            setCurrTab(item?.value)
            setAssetAction('both')
            setIsCheckedZAP(false)
            if (item.value == 'Withdraw') {
              setAutoCliamFarmingReward(true)
            } else {
              setAutoCliamFarmingReward(true)
            }
          }}
        />
        <HStack gap={{ base: '4px', lg: '8px' }}>
          {(currTab !== 'Deposit' || currentVaultPoolApiInfo?.category !== 'vaults') && (
            //弹框中的滑点设置不用modal形式
            <Slippage isModal={!isModal} slippageType="liquidity" showNewTolerance={isCheckedZAP} tokenA={fromToken} tokenB={toToken} />
          )}
          {isModal && (
            <RefreshButton
              handleRefresh={() => handleRefresh()}
              isAutoRefresh={true}
              refreshInterval={20}
              innerStyle={{ bg: 'bg_secondary' }}
              w="28px"
              h="28px"
              borderRadius="8px"
              bg="bg_secondary"
            />
          )}
        </HStack>
      </HStack>

      {/* {currentVaultPoolApiInfo?.status === 'sunset' && (
        <HStack w="100%" p="12px 20px" borderRadius="8px" bg="primary_gray_opacity.10">
          <Text w="100%" fontSize={{ base: '12px', lg: '14px' }} lineHeight="20px" color="primary_gray">
            This vault has been sunset. Please withdraw your assets at earliest convenience.
          </Text>
        </HStack>
      )} */}

      {currTab === 'Deposit' && (
        <VaultsAdd
          category={currentVaultPoolApiInfo?.category}
          isReverse={currentVaultPoolApiInfo?.isReverse}
          vaultId={currentVaultPoolApiInfo?.vaultId || vaultId}
          showPoolTag={currentVaultPoolApiInfo?.poolCount === 1}
          currentActionTab="Deposit"
          totalSupply={currentVaultPoolContractInfo?.totalSupply}
          lpTokenInfo={lpTokenInfo}
          feeTier={currentVaultPoolApiInfo?.feeDisplay}
          isModal={isModal}
          binStep={currentVaultPoolApiInfo?.binStep}
          isAutoRefresh={isModal ? isModalRefresh : isRefresh}
          currentVaultsFarm={currentVaultsFarm}
          vaultsFarmingStaked={currentVaultsFarmingStaked}
          autoStakeBlockUI={
            currTab === 'Deposit' &&
            isActiveVaultsFarming && (
              <HStack p="8px 12px" bg="primary_opacity.10" borderRadius="8px" w="100%">
                <Text w="100%" fontSize="12px" lineHeight="16px" color="primary">
                  Automatically stake LP tokens into 3rd-party incentive pools to boost your yield.
                </Text>
                <Switch isChecked={autoClaimStakeFarming} onChange={() => setAutoClaimStakeFarming(!autoClaimStakeFarming)} />
              </HStack>
            )
          }
        />
      )}
      {currTab === 'Withdraw' && (
        <VaultsRemove
          category={currentVaultPoolApiInfo?.category}
          isReverse={currentVaultPoolApiInfo?.isReverse}
          vaultId={currentVaultPoolApiInfo?.vaultId}
          currentActionTab="Withdraw"
          lpTokenInfo={lpTokenInfo}
          isModal={isModal}
          autoStakeBlockUI={
            currTab === 'Withdraw' &&
            isVaultsFarming &&
            currentVaultsFarmingStaked?.stakedBalance > 0 && (
              <HStack w="100%" p="8px 12px" bg="primary_opacity.10" borderRadius="8px" fontSize="12px" color="primary" justifyContent="space-between">
                <Text fontSize="12px" color="primary">
                  Automatically claim pending rewards.
                </Text>
                <Switch isChecked={autoClaimFarmingReward} onChange={() => setAutoCliamFarmingReward(!autoClaimFarmingReward)} />
              </HStack>
            )
          }
        />
      )}
      {/* {currTab === 'Deposit' && isActiveVaultsFarming && (
        <HStack p="8px 12px" bg="primary_opacity.10" borderRadius="8px">
          <Text w="100%" fontSize="12px" lineHeight="16px" color="primary">
            Automatically stake LP tokens into 3rd-party incentive pools to boost your yield.
          </Text>
          <Switch isChecked={autoClaimStakeFarming} onChange={() => setAutoClaimStakeFarming(!autoClaimStakeFarming)} />
        </HStack>
      )} */}

      {/* {currTab === 'Withdraw' && isVaultsFarming && currentVaultsFarmingStaked?.stakedBalance > 0 && (
        <HStack w="100%" p="8px 12px" bg="primary_opacity.10" borderRadius="8px" fontSize="12px" color="primary" justifyContent="space-between">
          <Text fontSize="12px"> Automatically claim pending rewards.</Text>
          <Switch isChecked={autoClaimFarmingReward} onChange={() => setAutoCliamFarmingReward(!autoClaimFarmingReward)} />
        </HStack>
      )} */}

      {isModal && isVaultsFarming && currentAccount?.address && (
        <FarmingIncentives
          apiVaultInfo={currentVaultPoolApiInfo}
          setIsOpenFarmingModal={setIsOpenFarmingModal}
          setIsOpenPre={setIsOpenPre}
          setFarmingModalAction={setFarmingModalAction}
        />
      )}

      {isMigrateModalOpen && migrateModalOptions && (
        <VaultMigrateModal
          isSameTokenPair={isSameTokenPair}
          isOpen={isMigrateModalOpen}
          options={migrateModalOptions}
          removePercent={removePercent}
          vaultsFarmingRewards={vaultsFarmingRewards}
          preCalculateResult={preCalculateResult}
          preCalculateLoading={preCalculateLoading}
          vaultFarmingRewardAmountUSD={vaultFarmingRewardAmountUSD}
          handlePercentInputChange={handlePercentInputChange}
          preCalculateMigrate={preCalculateMigrate}
          handleMigrate={handleMigrateSubmit}
          isVaultsFarming={isVaultsFarming}
          migrateSubmitLoading={migrateSubmitLoading}
          onClose={() => {
            setIsMigrateModalOpen(false)
          }}
        />
      )}

      {migrateSuccessResult && (
        <MigrateSuccessModal
          isOpen={true}
          onClose={() => {
            setMigrateSuccessResult(undefined)
          }}
          data={migrateSuccessResult}
        />
      )}
    </VStack>
  )
}
