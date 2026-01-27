// hooks/useVaultFarmingOverview.ts
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsPoolContractStore from '@/store/vaults-v2/useVaultsPoolContract'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import { useEffect, useMemo } from 'react'
import useCurrentVaults from '../vault-v2/useCurrentVaults'
import useVaultHoadings from '../vault-v2/useVaultsHoldings'
import useCalculateVaultFarmingApr from './useCalculateVaultFarmingApr'
import useCalculateVaultFarmingRewardUSD from './useCalculateVaultFarmingRewardUSD'
import useCurrentVaultsFarm from './useCurrentVaultsFarm'
import useGetStakedVaultFarmingTvl from './useGetStakedVaultFarmingTvl'
import { useVaultFarmingPage } from './useVaultFarmingPage'

export default function useVaultFarmingOverview(vaultId: string) {
  const { currentAccount } = useAccountStore()
  const { currentVaults } = useCurrentVaults(vaultId)

  const { currentVaultsFarm, isActiveVaultsFarming } = useCurrentVaultsFarm(vaultId)
  const { vaultsFarmingStaked, vaultsFarmingRewards, vaultsFarmingStakeLoading, vaultsFarmingRewardsLoading, clearVaultsFarmingInfo } =
    useVaultsFarmingStore()
  // farming当前质押
  const currentVaultsFarmingStaked: any = useMemo(() => {
    return vaultsFarmingStaked[currentVaults?.vaultId]
  }, [vaultsFarmingStaked, currentVaults?.vaultId])
  // farming奖励
  const currentVaultsFarmingAvailableRewards = useMemo(() => {
    return vaultsFarmingRewards[currentVaults?.vaultId]
  }, [vaultsFarmingRewards, currentVaults?.vaultId])
  // vault、clmm合约信息
  const { haedalVaultContractInfoObj, vaultClmmPoolContractInfoObj, vaultDlmmPoolContractInfoObj, dlmmVaultContractInfoObj } =
    useVaultsPoolContractStore()
  const { currentVaultPosition, currentVaultPositionLoading } = useVaultsPositionStore()
  const { vaultsFarmObj } = useVaultsFarmingStore()

  const currentVaultContractInfo = useMemo(
    () =>
      currentVaults?.category == 'haedal' ? haedalVaultContractInfoObj[currentVaults?.vaultId] : dlmmVaultContractInfoObj[currentVaults?.vaultId],
    [currentVaults?.vaultId, haedalVaultContractInfoObj, dlmmVaultContractInfoObj, currentVaults?.category]
  )

  const currentVaultClmmContractInfo = useMemo(
    () => vaultClmmPoolContractInfoObj[currentVaults?.clmmPoolAddress],
    [currentVaults?.clmmPoolAddress, vaultClmmPoolContractInfoObj]
  )

  const currentVaultDlmmContractInfo = useMemo(
    () => vaultDlmmPoolContractInfoObj[currentVaults?.dlmmPoolAddress],
    [currentVaults?.dlmmPoolAddress, vaultDlmmPoolContractInfoObj]
  )

  const { vaultFarmingAprDisplay, farmingTvlDisplay, vaultFarmingApr, farmingTvl, vaultFarmingLoading } =
    useCalculateVaultFarmingApr(currentVaultsFarm)

  const { stakeVaultFarmingTvl, stakeVaultFarmingTvlLoading, setStakeVaultFarmingTvlLoading } = useGetStakedVaultFarmingTvl(
    currentVaultContractInfo,
    currentVaults?.category == 'haedal' ? currentVaultClmmContractInfo : currentVaultDlmmContractInfo,
    currentVaultsFarmingStaked,
    currentVaults
  )

  const { vaultFarmingRewardAmountUSD, vaultFarmingRewardAmount } = useCalculateVaultFarmingRewardUSD(currentVaultsFarmingAvailableRewards)

  const currentVaultPositionInfo = useMemo(() => currentVaultPosition, [currentVaultPosition, currentVaults?.vaultId])
  const { holdingAmountDisplay, holdCoinAValue, holdCoinBValue, holdingVaultAmountDisplay } = useVaultHoadings(
    currentVaultPosition?.displayAmountA,
    currentVaultPosition?.displayAmountB,
    currentVaultPosition?.displayCoinTypeA,
    currentVaultPosition?.displayCoinTypeB,
    currentVaultPosition?.displayVaultAmountA,
    currentVaultPosition?.displayVaultAmountB,
    currentVaults?.category as string
  )

  const currentVaultsFarming = useMemo(() => vaultsFarmObj[currentVaults?.vaultId], [vaultsFarmObj, currentVaults?.vaultId])

  const { farmClaimAction, isLoading: farmClaimLoading } = useVaultFarmingPage(
    currentVaultPosition?.vaultId,
    currentVaultsFarming,
    currentVaultsFarmingStaked
  )

  const stakeButtonDisabled = useMemo(() => {
    return d(currentVaultPosition?.vaultBalance || '0').lte(0)
  }, [currentVaultPosition])

  const claimButtonDisabled = useMemo(() => {
    const result =
      (currentVaultsFarmingAvailableRewards && currentVaultsFarmingAvailableRewards?.filter(reward => d(reward?.rewardAmount || '0').gt(0))) || []
    return result && result.length <= 0
  }, [currentVaultsFarmingAvailableRewards])

  const unStakeButtonDisabled = useMemo(() => {
    return d(currentVaultsFarmingStaked?.stakedBalance || '0').lte(0)
  }, [currentVaultsFarmingStaked?.stakedBalance])

  useEffect(() => {
    if (!currentAccount?.address) {
      clearVaultsFarmingInfo()
    }
  }, [currentAccount?.address])

  return {
    vaultFarmingApr,
    vaultFarmingAprDisplay,
    vaultFarmingLoading,
    farmingTvl,
    farmingTvlDisplay,
    stakeVaultFarmingTvl,
    stakeVaultFarmingTvlLoading,
    vaultFarmingRewardAmountUSD,
    vaultFarmingRewardLoading: vaultsFarmingRewardsLoading,
    holdingAmountDisplay,
    holdCoinAValue,
    holdCoinBValue,
    farmClaimAction,
    farmClaimLoading,
    vaultsFarmingStakeLoading,
    vaultsFarmingStaked: currentVaultsFarmingStaked,
    currentVaultPositionLoading,
    currentVaultPositionInfo,
    vaultsFarmingRewards: currentVaultsFarmingAvailableRewards,
    vaultsFarmingRewardsLoading,
    stakeButtonDisabled,
    claimButtonDisabled,
    unStakeButtonDisabled,
    holdingVaultAmountDisplay,
    vaultFarmingRewardAmount,
    currentVaultsFarm,
    currentVaultsFarmingStaked,
    isActiveVaultsFarming
  }
}
