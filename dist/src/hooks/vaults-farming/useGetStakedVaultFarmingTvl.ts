import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d } from '@cetus/utils'
import { buildVaultsBalance, buildVaultsBalanceV2 } from 'haedal-vault-sdk'
import { useCallback, useEffect, useState } from 'react'

// 获取用户质押vaults farming的价值
export default function useGetStakedVaultFarmingTvl(
  currentVaultContractInfo: any,
  currentVaultClmmContractInfo: any,
  vaultsFarmingStaked: any,
  apiVaultInfo: any
) {
  const { getTokenAmountValue } = useTokenPrice()
  const [stakeVaultFarmingTvl, setStakeVaultFarmingTvl] = useState('')
  const [stakeVaultFarmingTvlLoading, setStakeVaultFarmingTvlLoading] = useState(true)
  const { volatileVaultsSdk } = usePeripherySDKStore()
  const { currentAccount } = useAccountStore()
  const fetchTvl = useCallback(async () => {
    if (!currentAccount?.address) {
      setStakeVaultFarmingTvl('--')
      setStakeVaultFarmingTvlLoading(false)
      return
    }
    if (
      !currentVaultContractInfo ||
      (apiVaultInfo?.category == 'haedal' && !currentVaultClmmContractInfo) ||
      // !isAvailableObject(vaultsFarmingStaked) ||
      !apiVaultInfo
    ) {
      setStakeVaultFarmingTvl('')
      return
    }

    setStakeVaultFarmingTvlLoading(true)

    try {
      const { tokenA, tokenB, category } = apiVaultInfo
      const coin_type_a = currentVaultClmmContractInfo?.coin_type_a || apiVaultInfo?.tokenA?.coin_type
      const coin_type_b = currentVaultClmmContractInfo?.coin_type_b || apiVaultInfo?.tokenB?.coin_type

      let user_amount_a = '0'
      let user_amount_b = '0'
      if (category === 'haedal') {
        const positionInfo = buildVaultsBalance('', vaultsFarmingStaked.stakedBalance, currentVaultContractInfo, currentVaultClmmContractInfo)
        user_amount_a = positionInfo.amount_a
        user_amount_b = positionInfo.amount_b
      } else {
        const positionInfo = await buildVaultsBalanceV2(
          volatileVaultsSdk,
          vaultsFarmingStaked.stakedBalance,
          currentVaultContractInfo?.id || '',
          currentAccount?.address || ''
        )
        user_amount_a = positionInfo.amount_a
        user_amount_b = positionInfo.amount_b
      }

      const stakeTokenA = d(user_amount_a)
        .div(10 ** (tokenA?.decimals ?? 0))
        .toString()

      const stakeTokenB = d(user_amount_b)
        .div(10 ** (tokenB?.decimals ?? 0))
        .toString()

      const stakeTokenAUSD = getTokenAmountValue(coin_type_a, stakeTokenA)
      const stakeTokenBUSD = getTokenAmountValue(coin_type_b, stakeTokenB)

      const total = d(stakeTokenAUSD).add(stakeTokenBUSD)

      setStakeVaultFarmingTvl(total.toString())
      setStakeVaultFarmingTvlLoading(false)
    } catch (err) {
      console.error('Failed to calculate stakeVaultFarmingTvl:', err)
      setStakeVaultFarmingTvl('0')
      setStakeVaultFarmingTvlLoading(false)
    }
  }, [
    currentAccount?.address,
    currentVaultContractInfo,
    currentVaultClmmContractInfo,
    vaultsFarmingStaked,
    apiVaultInfo,
    volatileVaultsSdk,
    getTokenAmountValue
  ])
  useEffect(() => {
    fetchTvl()
  }, [fetchTvl])

  return {
    stakeVaultFarmingTvl,
    stakeVaultFarmingTvlLoading,
    setStakeVaultFarmingTvlLoading
  }
}
