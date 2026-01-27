import { VaultPerformanceHistogram, VaultV2PerformanceHistogram } from '@/apis/path'
import { dayStrZeroPadding } from '@/utils/api-data-utils'
import { useFetch } from '@cetus/hooks'
import { d, formatTimestamp } from '@cetus/utils'
import { identity, pickBy } from 'lodash-es'

export type GetPerformanceParams = {
  poolId?: string
  vaultId?: string
  dateType?: 'hour'
  beginTimestamp: number | string
  endTimestamp: number | string
}

export type PerformanceItem = {
  hae_vault_strategy: string
  token_pair: string
  token_a: string
  token_b: string
  date: number
  xAxis: string
  tooltipTime: string
  hour: number
}

export type PerformanceData = {
  hold_line_usd: PerformanceItem[]
  hold_line_quote: PerformanceItem[]
}

export default function useGetPerformance(category: string) {
  const { fetchByApi } = useFetch()

  const getGetPerformanceData = async (params: GetPerformanceParams): Promise<PerformanceData> => {
    const data: PerformanceData = {
      hold_line_usd: [],
      hold_line_quote: []
    }
    try {
      const options = pickBy(params, identity)

      console.log('🚀🚀🚀 ~ getGetPerformanceData ~ options:', {
        options
      })

      const res = await fetchByApi(category === 'haevault_v2' ? VaultV2PerformanceHistogram : VaultPerformanceHistogram, 'GET', options)

      const { hodl_line_usd, hodl_line_sui } = res

      if (!hodl_line_usd || !hodl_line_sui) return data

      hodl_line_usd.forEach((item: any, index: number) => {
        const timestampMs = item.time * 1000
        const date = new Date(timestampMs)
        const useData: PerformanceItem = {
          hae_vault_strategy: d(item.vs).mul(100).toString(),
          token_pair: d(item.p).mul(100).toString(),
          token_a: d(item.a).mul(100).toString(),
          token_b: d(item.b).mul(100).toString(),
          date: item.time,
          xAxis: dayStrZeroPadding(date.toISOString().slice(0, 10)),
          tooltipTime: formatTimestamp(timestampMs),
          hour: date.getHours()
        }

        const itemSui = hodl_line_sui[index]
        const timestampMsSui = itemSui.time * 1000
        const dateSui = new Date(timestampMsSui)

        const suiData: PerformanceItem = {
          hae_vault_strategy: d(itemSui.vs).mul(100).toString(),
          token_pair: d(itemSui.p).mul(100).toString(),
          token_a: d(itemSui.a).mul(100).toString(),
          token_b: d(itemSui.b).mul(100).toString(),
          date: item.time,
          xAxis: dayStrZeroPadding(dateSui.toISOString().slice(0, 10)),
          tooltipTime: formatTimestamp(timestampMsSui),
          hour: dateSui.getHours()
        }
        data.hold_line_usd.push(useData)
        data.hold_line_quote.push(suiData)
        console.log('🚀🚀🚀 ~ getGetPerformanceData ~ data:', data)
      })
      return data
    } catch (error) {
      console.error('🚀🚀🚀 ~ getGetPerformanceData  Error:', error)
      return data
    }
  }

  return { getGetPerformanceData }
}
