import { DcaConfigPath } from '@/apis/path'
import useDcaStore from '@/store/dca'
import { DcaConfig } from '@/types/dca'
import { useFetch } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'

export default function useDcaConfig() {
  const { fetchByApi } = useFetch()
  const dcaSdk = useSdk('dca')
  const { setDcaConfig } = useDcaStore()

  const getDcaConfigFromApi = async () => {
    const res = await fetchByApi(DcaConfigPath, 'GET')
    return res || null
  }

  const getDcaConfigFromContract = async () => {
    const data = await dcaSdk!.Dca.getDcaGlobalConfig()
    return data
  }

  const getDcaConfig = async () => {
    const dcaConfig: DcaConfig = {}
    try {
      const apiConfig = await getDcaConfigFromApi()
      if (apiConfig) {
        dcaConfig['minCycleAmountInUsd'] = apiConfig?.min_amount_in_usd
      }
    } catch (error) {
      console.log('🚀 ~ file: useDcaConfig.ts:22 ~ getDcaConfig ~ error:', error)
    }

    try {
      const contractConfig = await getDcaConfigFromContract()
      dcaConfig['minCycleCount'] = contractConfig?.min_cycle_count
      dcaConfig['minCycleFrequency'] = contractConfig?.min_cycle_frequency
      dcaConfig['whitelistMode'] = contractConfig?.whitelist_mode
    } catch (error) {
      console.log('🚀 ~ file: useDcaConfig.ts:32 ~ getDcaConfig ~ error:', error)
    }

    console.log('🚀🚀🚀 ~ file: useDcaConfig.ts:45 ~ getDcaConfig ~ dcaConfig:', dcaConfig)
    setDcaConfig(dcaConfig)
    return dcaConfig
  }

  return {
    getDcaConfig
  }
}
