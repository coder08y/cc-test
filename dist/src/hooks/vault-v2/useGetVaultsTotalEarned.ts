import { VaultTotalEarned } from '@/apis/path'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import { useFetch } from '@cetus/hooks'
import { d, formatCurrency } from '@cetus/utils'

export default function useGetVaultsTotalEarned() {
  const { fetchByApi } = useFetch()
  const { setVaultsTotalEarnedDisplay } = useVaultsListV2Store()

  const getVaultsTotalEarned = async () => {
    try {
      const res = await fetchByApi(VaultTotalEarned, 'GET')
      console.log('1208###🚀 ~ getVaultsTotalEarned ~ res:', res)
      if (res) {
        const cetusTotalFee = res?.cetus_total_fee || '0'
        const cetusTotalHarvest = res?.cetus_total_harvest || '0'
        const haevaultTotalFee = res?.haevault_total_fee || '0'
        const haevaultTotalHarvest = res?.haevault_total_harvest || '0'
        const haevaultV2TotalFee = res?.haevault_v2_total_fee || '0'
        const haevaultV2TotalHarvest = res?.haevault_v2_total_harvest || '0'

        console.log('1208###🚀 ~ getVaultsTotalEarned ~ cetusTotalFee:', cetusTotalFee)
        console.log('1208###🚀 ~ getVaultsTotalEarned ~ cetusTotalHarvest:', cetusTotalHarvest)
        console.log('1208###🚀 ~ getVaultsTotalEarned ~ haevaultTotalFee:', haevaultTotalFee)
        console.log('1208###🚀 ~ getVaultsTotalEarned ~ haevaultTotalHarvest:', haevaultTotalHarvest)
        console.log('1208###🚀 ~ getVaultsTotalEarned ~ haevaultV2TotalFee:', haevaultV2TotalFee)
        console.log('1208###🚀 ~ getVaultsTotalEarned ~ haevaultV2TotalHarvest:', haevaultV2TotalHarvest)

        const total = d(cetusTotalFee)
          .add(cetusTotalHarvest)
          .add(haevaultTotalFee)
          .add(haevaultTotalHarvest)
          .add(haevaultV2TotalFee)
          .add(haevaultV2TotalHarvest)
          .toString()
        setVaultsTotalEarnedDisplay(formatCurrency(total, 2))

        return total
      }

      setVaultsTotalEarnedDisplay('--')
      return '--'
    } catch (error) {
      console.error('🚀 ~ useGetVaultsTotalEarned ~ getVaultsTotalEarned Error:', error)
      setVaultsTotalEarnedDisplay('--')
      return undefined
    }
  }

  return {
    getVaultsTotalEarned
  }
}
