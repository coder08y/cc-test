import useVaultsFarmingStore from '@/store/vaults-farming'
import { VaultStakedInfo } from '@/types/vaults-farming'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { Decimal, formatNumber } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { StakedOptions } from 'haedal-farm-sdk'
import { useEffect, useRef } from 'react'
import useGetVaultFarmingRewards from './useGetVaultFarmingRewards'

// 获取vaults farming质押
export default function useGetVaultFarmingStaked() {
  const { haedalFarmSdk } = usePeripherySDKStore()

  const {
    setVaultsFarmingStakeLoading,
    setVaultsFarmingStaked,
    setVaultsFarmingRewardsLoading,
    vaultsFarmObj,
    vaultsFarmingStaked,
    vaultsFarmingStakeLoading
  } = useVaultsFarmingStore()
  const { getVaultFarmingRewards } = useGetVaultFarmingRewards()
  const { currentAccount } = useAccountStore()

  const currentAcc = useRef(currentAccount?.address)
  useEffect(() => {
    currentAcc.current = currentAccount?.address
  }, [currentAccount?.address])

  const getVaultsFarmingStaked = async (params: StakedOptions, vaultId: string, haedalFarmingInfo?: any) => {
    const currentVaultStaked = vaultsFarmingStaked[vaultId]

    if ((!currentVaultStaked || currentVaultStaked.ownerAddress != currentAcc.current) && !vaultsFarmingStakeLoading) {
      setVaultsFarmingStakeLoading(true)
      setVaultsFarmingRewardsLoading(true)
    }
    try {
      haedalFarmSdk.senderAddress = currentAcc.current
      const res = await haedalFarmSdk.Farms.getFarmDeposit(params)
      if (currentAccount?.address == currentAcc.current) {
        const warpRes: VaultStakedInfo = warpVaultsFarmingStaked(res, vaultId, haedalFarmingInfo, currentAcc.current)
        setVaultsFarmingStaked({
          [vaultId]: warpRes
        })

        if (warpRes?.stakeObjectId) {
          getVaultFarmingRewards(
            {
              stakeCoinType: params.stakeCoinType,
              poolId: params.poolId,
              stakeObjectId: warpRes?.stakeObjectId as string
            },
            vaultId,
            haedalFarmingInfo
          )
        }

        setVaultsFarmingRewardsLoading(false)
        setVaultsFarmingStakeLoading(false)
        return warpRes
      } else {
        setVaultsFarmingRewardsLoading(false)
        setVaultsFarmingStakeLoading(false)
      }
    } catch (error) {
      console.error('[VaultFarming] Failed to fetch staked info:', error)
      setVaultsFarmingStaked({
        [vaultId]: undefined
      })
      setVaultsFarmingRewardsLoading(false)
      setVaultsFarmingStakeLoading(false)
    }
  }

  const warpVaultsFarmingStaked = (stakedInfo: any, vaultsId: string, haedalFarmingInfo?: any, account?: string) => {
    const currentVaultFarm = vaultsFarmObj[vaultsId] || haedalFarmingInfo
    const { stakedBalance, stakeObjectId } = stakedInfo || {}
    const { coinDetail, rewardConfigs } = currentVaultFarm || {}

    const stakedBalanceFormat = d(stakedBalance)
      .div(10 ** (coinDetail?.decimals ?? 0))
      .toString()

    return {
      poolId: currentVaultFarm.poolId,
      stakeObjectId,
      stakedBalance,
      stakedBalanceFormat,
      stakedBalanceDisplay: formatNumber(stakedBalanceFormat, undefined, undefined, Decimal.ROUND_DOWN).toString(),
      coinDetail,
      stakeCoinType: currentVaultFarm.stakeCoinType,
      // rewardConfigs: (rewardConfigs ?? []).filter(ele => d(ele.rate).gt(0)),
      rewardConfigs,
      ownerAddress: account || ''
    }
  }

  return { getVaultsFarmingStaked }
}
