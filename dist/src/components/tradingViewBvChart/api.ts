import { d, getTimestampMinusHours, sleepTime } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { v4 } from 'uuid'
// const bvHost = 'https://sui-mainnet.blockvision.org'
const bvHost = 'https://api-sui-cf.cetus.zone/proxy'

export interface Bar {
  time: number // 时间戳 (秒级)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 定义一个全局变量来存储当前的最新请求 ID
let latestRequestId: string | null = null

/**
 * 获取历史 K 线数据
 * @param poolId 交易对，例如 "BTC/USDT"
 * @param resolution 时间周期，例如 "1"（1分钟）
 * @param from 起始时间戳（秒级）
 * @param to 结束时间戳（秒级）
 * @returns Bar 数据数组
 */
export const getHistoricalData = async (poolId: string, resolution: string, from: number, to: number, firstDataRequest?: boolean): Promise<Bar[]> => {
  console.log('bv 🚀 ~ getHistoricalData ~ params poolId:', poolId)
  console.log('bv 🚀 ~ getHistoricalData ~ params resolution:', resolution)
  console.log('bv 🚀 ~ getHistoricalData ~ params from:', from)
  console.log('bv 🚀 ~ getHistoricalData ~ params to:', to)

  // 生成当前请求的唯一标识
  const requestId = v4()
  latestRequestId = requestId // 更新全局变量，表明这是最新的请求

  const token = `0x${fixCoinType(poolId)}`
  console.log('bv 🚀 ~ getHistoricalData ~ token:', token)
  // const start = d(from).mul(1000).toNumber()
  const fromSecond = d(from).mul(1000).toNumber()
  console.log('bv 🚀 ~ getHistoricalData ~ fromSecond:', fromSecond)
  let start = from
  if (firstDataRequest) {
    if (resolution === '30s' || resolution === '1m') {
      start = Math.max(from, getTimestampMinusHours(4))
    } else if (resolution === '5m') {
      start = Math.max(from, getTimestampMinusHours(24))
    } else if (resolution === '15m') {
      start = Math.max(from, getTimestampMinusHours(168))
    } else if (resolution === '1h' || resolution === '4h') {
      start = Math.max(from, getTimestampMinusHours(720))
    }
  } else if ((resolution === '30s' || resolution === '1m') && from < getTimestampMinusHours(4) && !firstDataRequest) {
    return []
  } else if (resolution === '5m' && from < getTimestampMinusHours(24) && !firstDataRequest) {
    return []
  } else if (resolution === '15m' && from < getTimestampMinusHours(168) && !firstDataRequest) {
    return []
  } else if ((resolution === '1h' || resolution === '4h') && from < getTimestampMinusHours(720) && !firstDataRequest) {
    return []
  } else if (resolution === '1d' && from < getTimestampMinusHours(7200) && !firstDataRequest) {
    return []
  } else if (resolution === '1w' && from < getTimestampMinusHours(50400) && !firstDataRequest) {
    return []
  } else if (resolution === '1M' && from < getTimestampMinusHours(216000) && !firstDataRequest) {
    return []
  }
  if (start < 0) return []

  console.log('bv 🚀 ~ getHistoricalData ~ start:', start)

  // 替换为你的 API 地址
  // const apiUrl = `https://api-sui.cetus.zone/v3/sui/coin/k_line_pair?date_type=${resolution}&begin_timestamp=${from}&end_timestamp=${to}&base_coin=${base_coin}&quote_coin=${quote_coin}`
  const apiUrl = `${bvHost}/api/v1/coin/ohlcv?token=${token}&interval=${resolution}&start=${start}`
  // 内部请求函数
  const fetchData = async (): Promise<Bar[] | null> => {
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          accept: 'application/json'
          // 'x-api-key': '2uZYBhmZMcACCbGxbFLbf5R6QCb'
        }
      })
      const data = await response.json()
      console.log('🚀 ~ fetchData ~ data:', data)

      if (data?.code === 500) {
        throw new Error('Server Error: 500')
      }

      if (data?.code === 0 && data?.data?.list?.length === 0) {
        return null
      }

      const result = data?.result?.ohlcs?.map((item: any) => ({
        time: d(item.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
        high: Number(item.high),
        low: Number(item.low),
        open: Number(item.open),
        close: Number(item.close),
        volume: item.volume
      }))

      console.log('bv 🚀 ~ getHistoricalData ~ result:', result)
      return result || []
    } catch (error) {
      console.error('bv 🚀 ~ fetchData Error:', error)

      // 检查当前请求是否是最新请求
      if (latestRequestId !== requestId) {
        console.log('bv 🚀 ~ Request aborted due to poolId change.')
        return [] // 如果不是最新请求，直接返回空数组
      }

      console.log('Retrying in 5 seconds...')
      await sleepTime(5000) // 等待 5 秒后重试

      if (latestRequestId !== requestId) {
        console.log('bv 🚀 ~ Request aborted due to poolId change.')
        return [] // 如果不是最新请求，直接返回空数组
      }

      return await fetchData() // 递归调用
    }
  }

  return await fetchData() // 开始请求数据
}

/**
 * 获取最新 K 线数据
 * @param poolId 交易对，例如 "BTC-USDT"
 * @param resolution 时间周期，例如 "1"（1分钟）
 * @param from 起始时间戳（秒级）
 * @param to 结束时间戳（秒级）
 * @returns Bar 数据数组
 */
export const getLatestKlineData = async (poolId: string, resolution: string): Promise<Bar[]> => {
  console.log('bv 🚀 ~ getLatestKlineData ~ poolId:', poolId)
  console.log('bv 🚀 ~ getLatestKlineData ~ resolution:', resolution)
  try {
    const token = `0x${fixCoinType(poolId)}`
    // 替换为你的 API 地址
    const apiUrl = `${bvHost}/api/v1/price/latest/ohlc?token=${token}&interval=${resolution}`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        accept: 'application/json'
        // 'x-api-key': '2uZYBhmZMcACCbGxbFLbf5R6QCb'
      }
    })
    const data = await response.json()
    console.log('bv 🚀 ~ getLatestKlineData ~ data:', data)

    const value = data?.result?.[data?.result?.length - 1]
    console.log('🚀 ~ getLatestKlineData ~ value:', value)
    if (!value) return []
    const result = {
      time: d(value.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
      high: Number(value.high),
      low: Number(value.low),
      open: Number(value.open),
      close: Number(value.close),
      volume: value.volume
    }

    console.log('bv 🚀 ~ getLatestKlineData ~ result:', result)

    return [result]
  } catch (error) {
    console.log('bv 🚀 ~ getLatestKlineData ~ error:', error)
    return []
  }
}
