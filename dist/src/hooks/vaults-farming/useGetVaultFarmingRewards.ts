import useVaultsFarmingStore from '@/store/vaults-farming'
import { RewardItem } from '@/types/vaults-farming'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d } from '@cetusprotocol/common-sdk'
import { RewardOptions } from 'haedal-farm-sdk'

// 获取vaults farming奖励
export default function useGetVaultFarmingRewards() {
  const { haedalFarmSdk } = usePeripherySDKStore()
  const { setVaultsFarmingRewardsLoading, setVaultsFarmingRewards, vaultsFarmObj } = useVaultsFarmingStore()
  const { currentAccount } = useAccountStore()

  const getVaultFarmingRewards = async (params: RewardOptions, vaultId: string, haedalFarmingInfo?: any) => {
    try {
      const res = await haedalFarmSdk.Farms.getAvailableRewards(params)
      const wrapRes: RewardItem[] = wrapVaultFarmingReward(res, vaultId, haedalFarmingInfo, haedalFarmSdk.senderAddress)

      setVaultsFarmingRewards({
        [vaultId]: wrapRes
      })
      setVaultsFarmingRewardsLoading(false)
      return wrapRes
    } catch (error) {
      console.error('[VaultFarming] Error fetching rewards:', error)
      setVaultsFarmingRewards([]) // fallback 防止 UI 卡死
      setVaultsFarmingRewardsLoading(false)
    }
  }

  const wrapVaultFarmingReward = (rewardInfo: any, vaultId: string, haedalFarmingInfo?: any, account?: string) => {
    const currentVaultFarm = vaultsFarmObj[vaultId] || haedalFarmingInfo
    return (
      currentVaultFarm.rewardConfigs
        // .filter((item: any) => d(item.rate).gt(0))
        .map((item: any) => {
          const rewardAmount = rewardInfo?.[item.rewardCoinType] ?? '0'
          const rewardAmountDisplay = d(rewardAmount)
            .div(10 ** (item.coinDetail?.decimals ?? 0))
            .toString()

          return {
            ...item,
            rewardAmount,
            rewardAmountDisplay,
            ownerAddress: account || ''
          }
        })
    )
  }

  return { getVaultFarmingRewards }
}
