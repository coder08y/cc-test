import { VaultStableLpFeeHistogram, VaultUnStableLpFeeHistogram, VaultV2UnStableLpFeeHistogram, VaultV2UnStableLpFeeHistogramV2 } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import { formatTimestamp } from '@cetus/utils'
import { identity, pickBy } from 'lodash-es'

export type GetVaultApyAndFeesHistogramParams = {
  vaultID?: string
  positionID?: string
  poolID?: string
  beginTimestamp: number | string
  endTimestamp: number | string
}

// 获取Vault的apy和fees的histogram数据
export default function useGetVaultApyAndFeesHistogram(category: string) {
  const { fetchByApi } = useFetch()

  const getVaultApyAndFeesHistogram = async (params: GetVaultApyAndFeesHistogramParams) => {
    console.log('🚀 ~ getVaultHistogram ~ params:', params)
    const requestParams: any = { ...params }
    requestParams['dateType'] = 'hour'
    try {
      const options = pickBy(requestParams, identity)

      let path: string = ''
      if (category === 'haevault_v2') {
        if (params.poolID) {
          path = VaultV2UnStableLpFeeHistogramV2
        } else {
          path = VaultV2UnStableLpFeeHistogram
        }
      } else {
        path = category == 'haedal' ? VaultUnStableLpFeeHistogram : VaultStableLpFeeHistogram
      }
      const res = await fetchByApi(path, 'GET', options)

      console.log('🚀 ~ getVaultApyAndFeesHistogram ~ res:', res)

      if (!res?.list) return []

      const list = res?.list.map((item: any, index: number) => {
        const timestampMs = item.Timestamp * 1000
        const date = new Date(timestampMs)
        const monthIndex = Number(date.toISOString().slice(5, 7)) // 获取月份

        return {
          apy: +item.value.apy * 100, // 快速转换为数字
          lp_fee: +item.value.lp_fee, // 快速转换为数字
          date: item.Timestamp,
          tooltipTime: formatTimestamp(timestampMs)
        }
      })
      return {
        list,
        quote_type: res?.quote_type
      }
    } catch (error) {
      console.error('🚀 ~ useGetHistogramData ~ getHistogramData Error:', error)
      return []
    }
  }

  return { getVaultApyAndFeesHistogram }
}
