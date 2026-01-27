import { AllStatsTvlPath, DLMMHistogramPath, HistogramPathTotalVolV3, HistogramPathV3 } from '@/apis/path'
import { dayStrZeroPadding } from '@/utils/api-data-utils'
import { useFetch } from '@cetus/hooks'
import { d } from '@cetusprotocol/common-sdk'
import { identity, pickBy } from 'lodash-es'
import { Month } from '../common/useChartTime'

export type GetHistogramDataParams = {
  type: 'vol' | 'tvl' | 'fee'
  date_type?: 'day' | 'wek' | 'mon'
  limit?: number
  address?: string
}

export default function useGetHistogramData() {
  const { fetchByApi } = useFetch()

  const getHistogramData = async (params: GetHistogramDataParams) => {
    const { type, date_type = 'day', limit, address = 'all' } = params
    console.log('🚀 ~ getHistogramData ~ limit:', type, date_type, limit)
    const isTotalVol = address == 'all' && type == 'vol'

    const dateTypeMap: Record<string, string> = { day: 'day', wek: 'week', mon: 'month' }
    const resolvedDateType = dateTypeMap[date_type]

    // 计算 beginTimestamp
    const now = Date.now()
    const oneDay = 86400 // 1 天的秒数
    const oneWeek = 604800 // 7 天的秒数
    const oneMonth = 2592000 // 30 天的秒数
    const timeLimit = !limit ? undefined : date_type == 'day' ? limit * oneDay : date_type == 'wek' ? limit * oneWeek : limit * oneMonth
    const beginTimestamp = !timeLimit ? 0 : String(Math.floor(now / 1000 - timeLimit))

    const requestParams: Record<string, any> = isTotalVol
      ? { dataType: type, dateType: resolvedDateType, beginTimestamp }
      : { dataType: type, dateType: resolvedDateType, address, beginTimestamp }

    const options = pickBy(requestParams, identity)
    const apiPath = isTotalVol ? HistogramPathTotalVolV3 : HistogramPathV3

    const res = await fetchByApi(apiPath, 'GET', options)
    console.log('🚀 ~ getHistogramData response:', res)

    const result = (res?.list || []).map((item: any) => {
      const dateTime = new Date(item.timestamp * 1000).toISOString().split('.')[0] + 'Z'

      const monthIndex = Number(dateTime.slice(5, 7))
      const mDateValue = Month[monthIndex]

      return {
        num: Number(item.value),
        date: dateTime,
        xAxis: date_type === 'mon' ? mDateValue : dayStrZeroPadding(dateTime)
      }
    })

    const returnArr = [...result].reverse()
    console.log('🚀 ~ getHistogramData ~ isPureTvl:', returnArr)
    return returnArr
  }

  const getDlmmHistogramData = async (params: GetHistogramDataParams) => {
    const { type, date_type = 'day', limit, address = 'all' } = params
    console.log('🚀 ~ getHistogramData ~ limit:', type, date_type, limit)
    const isTotalVol = address == 'all' && type == 'vol'

    const dateTypeMap: Record<string, string> = { day: 'day', wek: 'week', mon: 'month' }
    const resolvedDateType = dateTypeMap[date_type]

    // 计算 beginTimestamp
    const now = Date.now()
    const oneDay = 86400 // 1 天的秒数
    const oneWeek = 604800 // 7 天的秒数
    const oneMonth = 2592000 // 30 天的秒数
    const timeLimit = !limit ? undefined : date_type == 'day' ? limit * oneDay : date_type == 'wek' ? limit * oneWeek : limit * oneMonth
    const beginTimestamp = !timeLimit ? 0 : String(Math.floor(now / 1000 - timeLimit))

    const requestParams: Record<string, any> = isTotalVol
      ? { dataType: type, dateType: resolvedDateType, beginTimestamp }
      : { dataType: type, dateType: resolvedDateType, address, beginTimestamp }

    const options = pickBy(requestParams, identity)

    const res = await fetchByApi(DLMMHistogramPath, 'GET', options)
    console.log('🚀 ~ getHistogramData response:', res)

    const result = (res?.list || []).map((item: any) => {
      const dateTime = new Date(item.timestamp * 1000).toISOString().split('.')[0] + 'Z'

      const monthIndex = Number(dateTime.slice(5, 7))
      const mDateValue = Month[monthIndex]

      return {
        num: Number(item.value),
        date: dateTime,
        xAxis: date_type === 'mon' ? mDateValue : dayStrZeroPadding(dateTime)
      }
    })

    const returnArr = [...result].reverse()
    console.log('🚀 ~ getHistogramData ~ isPureTvl:', returnArr)
    return returnArr
  }

  const getAllTvData = async (params: { date_type: 'day' | 'wek' | 'mon'; limit?: number }) => {
    const { date_type = 'day', limit } = params

    const dateTypeMap: Record<string, string> = { day: 'day', wek: 'week', mon: 'month' }
    const resolvedDateType = dateTypeMap[date_type]

    // 计算 beginTimestamp
    const now = Date.now()
    const oneDay = 86400 // 1 天的秒数
    const oneWeek = 604800 // 7 天的秒数
    const oneMonth = 2592000 // 30 天的秒数
    const timeLimit = !limit ? undefined : date_type == 'day' ? limit * oneDay : date_type == 'wek' ? limit * oneWeek : limit * oneMonth
    const beginTimestamp = !timeLimit ? 0 : String(Math.floor(now / 1000 - timeLimit))

    const requestParams: Record<string, any> = { dateType: resolvedDateType, beginTimestamp, endTimestamp: now }

    const options = pickBy(requestParams, identity)

    const res = await fetchByApi(AllStatsTvlPath, 'GET', options)
    console.log('🚀 ~ getHistogramData response:', res)

    const result = (res?.list || []).map((item: any) => {
      const dateTime = new Date(item.timestamp * 1000).toISOString().split('.')[0] + 'Z'

      const monthIndex = Number(dateTime.slice(5, 7))
      const mDateValue = Month[monthIndex]

      return {
        clmm: Number(item.clmm),
        dlmm: Number(item?.dlmm),
        total: d(item?.clmm ?? 0)
          .plus(item?.dlmm ?? 0)
          .toNumber(),
        date: dateTime,
        xAxis: date_type === 'mon' ? mDateValue : dayStrZeroPadding(dateTime)
      }
    })

    const returnArr = [...result].reverse()
    console.log('🚀 ~ getHistogramData ~ isPureTvl:', returnArr)
    return returnArr
  }

  return { getHistogramData, getDlmmHistogramData, getAllTvData }
}
