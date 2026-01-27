import { VaultStableHistogram, VaultUnstableHistogram, VaultV2UnstableHistogram, VaultV2UnstableHistogramV2 } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import { formatTimestamp } from '@cetus/utils'
import { identity, pickBy } from 'lodash-es'

export type GetHistogramDataParams = {
  vaultID?: string
  positionID?: string
  poolID?: string
  dateType?: 'hour' | 'min' | 'day' | 'week' | 'month'
  beginTimestamp: number | string
  endTimestamp: number | string
}

export default function useGetVaultHistogram(category: string) {
  const { fetchByApi } = useFetch()

  const getVaultHistogram = async (params: GetHistogramDataParams) => {
    console.log('🚀 ~ getVaultHistogram ~ params:', params)
    const requestParams: any = { ...params }
    const dateType = params.dateType == 'day' || params.dateType == 'week' ? 'hour' : 'day'
    requestParams['dateType'] = dateType
    delete requestParams['type']
    try {
      let options = pickBy(requestParams, identity)
      let path: string = ''
      if (category === 'haevault_v2') {
        if (params.poolID) {
          path = VaultV2UnstableHistogramV2
        } else {
          path = VaultV2UnstableHistogram
        }
      } else {
        path = category == 'haedal' ? VaultUnstableHistogram : VaultStableHistogram
      }
      const res = await fetchByApi(path, 'GET', options)

      if (!res?.list) return []

      return res?.list.map((item: any, index: number) => {
        const timestampMs = item.Timestamp * 1000
        const date = new Date(timestampMs)
        const monthIndex = Number(date.toISOString().slice(5, 7)) // 获取月份

        const xAxis = getXData(res?.list?.length, date, params?.dateType, index)

        return {
          num: +item.value, // 快速转换为数字
          date: item.Timestamp,
          // xAxis: params.dateType === 'mon' ? Month[monthIndex] : dayStrZeroPadding(date.toISOString().slice(0, 10)),
          xAxis,
          tooltipTime: formatTimestamp(timestampMs)
        }
      })
    } catch (error) {
      console.error('🚀 ~ useGetHistogramData ~ getHistogramData Error:', error)
      return []
    }
  }
  const getXData = (dataLength: number, value: any, type: string = 'D', index: number) => {
    const dateType = type == 'D' || type == 'day' ? 'D' : type == 'W' || type == 'week' ? 'W' : 'M'
    const date = value
    const noShowHours = date.getUTCHours()
    let hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    const day = date.getUTCDate()
    const month = date.getUTCMonth() + 1 // 月份从 0 开始

    const period = hours > 12 || hours === 0 ? 'PM' : 'AM'

    hours = hours % 12 || 12 // 0 变为 12，13 变为 1
    if (dateType == 'D') {
      // dateType为天的话，显示具体 UTC 时间 (06:00, 12:00, 18:00, 00:00)
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
    } else {
      if (dateType == 'M') {
        // dateType为月的话，显示具体的天
        return `${month}/${day}`
      } else {
        console.log('🚀 ~ getXData ~ noShowHours:', noShowHours)
        // 如果数据为周,那么小于一天，展示平均两个点，大于一天小于五天，每天展示两个点，大于等于5天，每天展示一个点
        if (dataLength < 24) {
          const step = Math.floor(dataLength / 2)
          console.log('🚀 ~ getXData ~ step:', dataLength, index, index % step === 0, step)
          if (index % step === 0) {
            return `${month}/${day}`
          }
        }
        if (dataLength >= 24 && dataLength < 120) {
          if (noShowHours === 0 || noShowHours === 12) {
            return `${month}/${day}`
          }
        }
        if (dataLength >= 120) {
          if (noShowHours === 0 && minutes === 0) {
            return `${month}/${day}`
          }
        }
      }
    }
    return '' // 其他时间点不显示
  }

  return { getVaultHistogram }
}
