import { aprProcessing } from '@/utils/api-data-utils'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { symbolDataDisplayProcessing } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { useEffect, useState } from 'react'

// 计算 vaults farming apr
export default function useCalculateVaultFarmingApr(currentVaultsFarm: any) {
  const { getTokenAmountValue } = useTokenPrice()
  const [vaultFarmingAprDisplay, setVaultFarmingAprDisplay] = useState('')
  const [farmingTvlDisplay, setFarmingTvlDisplay] = useState('')
  const [vaultFarmingApr, setVaultFarmingApr] = useState('')
  const [farmingTvl, setFarmingTvl] = useState('')
  const [vaultFarmingLoading, setVaultFarmingLoading] = useState(true)

  useEffect(() => {
    if (!currentVaultsFarm) {
      setVaultFarmingAprDisplay('')
      setFarmingTvlDisplay('')
      setVaultFarmingApr('')
      setFarmingTvl('')
      return
    }

    setVaultFarmingLoading(true)

    try {
      const { farmingPoolAmountA, farmingPoolAmountB, coinTypeA, coinTypeB, rewardList, tvl } = currentVaultsFarm

      // const farmingPoolAmountAUSD = getTokenAmountValue(coinTypeA, farmingPoolAmountA)
      // const farmingPoolAmountBUSD = getTokenAmountValue(coinTypeB, farmingPoolAmountB)
      // const tvl = d(farmingPoolAmountAUSD).add(farmingPoolAmountBUSD)
      setFarmingTvl(tvl.toString())
      setFarmingTvlDisplay(symbolDataDisplayProcessing(tvl.toString(), '$'))

      let totalRewardUSD = d(0)
      for (const item of rewardList) {
        totalRewardUSD = totalRewardUSD.add(getTokenAmountValue(item.rewardCoinType, item.rewardItemRate))
      }

      if (totalRewardUSD.eq(0) || d(tvl).eq(0)) {
        setVaultFarmingAprDisplay('0%')
        setVaultFarmingApr('0')
        setVaultFarmingLoading(false)
      } else {
        const apr = totalRewardUSD.div(tvl).mul(365).toString()
        setVaultFarmingApr(apr)
        setVaultFarmingAprDisplay(aprProcessing(apr, true))
      }
      setVaultFarmingLoading(false)
    } catch (err) {
      console.error('[VaultFarming] APR calculation error:', err)
      setVaultFarmingAprDisplay('')
      setVaultFarmingLoading(false)
    }
  }, [currentVaultsFarm, getTokenAmountValue])

  return {
    vaultFarmingApr,
    vaultFarmingAprDisplay,
    farmingTvl,
    farmingTvlDisplay,
    vaultFarmingLoading
  }
}
