import { VaultStablePriceRangeHistogram, VaultUnstablePriceRangeHistogram, VaultV2PriceRangeHistogram } from '@/apis/path'
import { dayStrZeroPadding } from '@/utils/api-data-utils'
import { useFetch } from '@cetus/hooks'
import { formatTimestamp } from '@cetus/utils'
import { identity, pickBy } from 'lodash-es'

export type GetPriceRangeDataParams = {
  vaultID?: string
  posId?: string
  poolId?: string
  dateType?: 'hour' | 'min'
  beginTimestamp: number | string
  endTimestamp: number | string
}

export default function useGetPriceRangeData(category: string) {
  const { fetchByApi } = useFetch()

  const getPriceRangeData = async (params: GetPriceRangeDataParams) => {
    try {
      let path
      let options: any = {}

      if (category === 'haevault_v2') {
        path = VaultV2PriceRangeHistogram
        options = pickBy(
          {
            vaultId: params.vaultID,
            positionId: params.posId || 'all',
            poolId: params.poolId,
            dateType: params.dateType,
            beginTimestamp: params.beginTimestamp,
            endTimestamp: params.endTimestamp
          },
          identity
        )
      } else {
        options = pickBy(params, identity)
        path = category == 'haedal' ? VaultUnstablePriceRangeHistogram : VaultStablePriceRangeHistogram
      }

      console.log('🚀 ~ getPriceRangeData ~ options:', {
        options,
        path
      })
      const res = await fetchByApi(path, 'GET', options)

      if (!res?.list) return []

      return res.list.map((item: any) => {
        const timestampMs = item.Timestamp * 1000
        const date = new Date(timestampMs)
        return {
          lower: item.value.lower,
          upper: item.value.upper,
          real: item.value.real,
          date: item.Timestamp,
          xAxis: dayStrZeroPadding(date.toISOString().slice(0, 10)), // 只取 YYYY-MM-DD
          tooltipTime: formatTimestamp(timestampMs),
          hour: date.getHours()
        }
      })
    } catch (error) {
      console.error('🚀 ~ useGetPriceRangeData ~ getPriceRangeData Error:', error)
      return []
    }
  }

  return { getPriceRangeData }
}
