import useVaultsFarmingStore from '@/store/vaults-farming'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetusprotocol/common-sdk'
import { useEffect, useState } from 'react'

// 计算vaults farming reward奖励价值
export default function useCalculateVaultFarmingRewardUSD(vaultsFarmingRewards: any[]) {
  const { getTokenAmountValue } = useTokenPrice()
  const { setVaultsFarmingRewardsLoading, vaultsFarmingRewardsLoading } = useVaultsFarmingStore()

  const [vaultFarmingRewardAmountUSD, setVaultFarmingRewardAmountUSD] = useState('0')
  const [vaultFarmingRewardAmount, setVaultFarmingRewardAmount] = useState('0')
  const { currentAccount } = useAccountStore()
  useEffect(() => {
    const calculate = async () => {
      if (!currentAccount?.address) {
        setVaultFarmingRewardAmountUSD('--')
        setVaultsFarmingRewardsLoading(false)
        return
      }
      if (!vaultsFarmingRewards || vaultsFarmingRewards.length === 0) {
        setVaultFarmingRewardAmountUSD('0')
        setVaultsFarmingRewardsLoading(false)
        return
      }

      if (vaultsFarmingRewards.some((item: any) => item.ownerAddress != currentAccount?.address)) {
        // setVaultFarmingRewardAmountUSD('0')
        setVaultsFarmingRewardsLoading(false)
        return
      }

      setVaultsFarmingRewardsLoading(true)
      try {
        let totalUSD = d(0)
        let totalAmount = d(0)
        for (const item of vaultsFarmingRewards) {
          const amountUSD = getTokenAmountValue(item.rewardCoinType, item.rewardAmountDisplay)
          totalUSD = totalUSD.add(amountUSD)
          totalAmount = totalAmount.add(item.rewardAmountDisplay)
        }
        setVaultFarmingRewardAmountUSD(totalUSD.toString())
        setVaultFarmingRewardAmount(totalAmount.toString())
      } catch (err) {
        console.error('Error calculating vault farming reward USD:', err)
        setVaultFarmingRewardAmountUSD('0')
      } finally {
        setVaultsFarmingRewardsLoading(false)
      }
    }

    calculate()
  }, [vaultsFarmingRewards, getTokenAmountValue, currentAccount?.address])

  return { vaultFarmingRewardAmountUSD, vaultsFarmingRewardsLoading, setVaultsFarmingRewardsLoading, vaultFarmingRewardAmount }
}
