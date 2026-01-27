import { VaultDailyYieldPerLp, VaultV2DailyYieldPerLp } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import { d } from '@cetusprotocol/common-sdk'
import { identity, pickBy } from 'lodash-es'

export default function useGetVaultDailyYield() {
  const { fetchByApi } = useFetch()

  const getVaultDailyYield = async (vaultID: string, category: string) => {
    try {
      let options = pickBy(category === 'haevault_v2' ? { vaultID } : { vault_id: vaultID }, identity)
      const res = await fetchByApi(category === 'haevault_v2' ? VaultV2DailyYieldPerLp : VaultDailyYieldPerLp, 'GET', options)
      console.log('🚀🚀🚀 ~ useGetVaultDailyYield.ts:12 ~ getVaultDailyYield ~ res:', res)
      return category === 'haevault_v2'
        ? res.daily_yield_per_lp
        : d(res.farm_reward_per_lp || 0)
            .add(res.fee_and_mining_per_lp || 0)
            .toString()
    } catch (error) {
      console.error('🚀 ~ useGetVaultDailyYield ~ getVaultDailyYield Error:', error)
      return undefined
    }
  }

  return { getVaultDailyYield }
}
