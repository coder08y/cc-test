import { d, sleepTime } from '@cetus/utils'
import { v4 } from 'uuid'

function toLongCoinType(coinType: string): string {
  const arr = coinType.split('::')
  const shortAddress = arr[0]

  // 移除 0x 前缀
  const addressWithoutPrefix = shortAddress.startsWith('0x') ? shortAddress.slice(2) : shortAddress

  // 检查是否是有效的 16 进制地址
  if (!/^[0-9a-fA-F]+$/.test(addressWithoutPrefix)) {
    // toDo: 这里coinType可能为空, 先临时处理一下
    // throw new Error('Invalid Sui address: not a valid hex string')
  }

  // 填充前导零，确保长度为 64
  const longAddress = addressWithoutPrefix.padStart(64, '0')

  // 加回 0x 前缀
  return `0x${longAddress}::${arr[1]}::${arr[2]}`
}

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
export const getHistoricalData = async (poolId: string, resolution: string, from: number, to: number): Promise<Bar[]> => {
  console.log('🚀 ~ getHistoricalData ~ params poolId:', poolId)
  console.log('🚀 ~ getHistoricalData ~ params resolution:', resolution)
  console.log('🚀 ~ getHistoricalData ~ params from:', from)
  console.log('🚀 ~ getHistoricalData ~ params to:', to)

  // 生成当前请求的唯一标识
  const requestId = v4()
  latestRequestId = requestId // 更新全局变量，表明这是最新的请求

  const arr = poolId.split('-')
  const base_coin = toLongCoinType(arr?.[0]) || ''
  const quote_coin = toLongCoinType(arr?.[1]) || ''

  console.log('🚀 ~ getHistoricalData ~ base_coin:', base_coin)
  console.log('🚀 ~ getHistoricalData ~ quote_coin:', quote_coin)

  // 替换为你的 API 地址
  const apiUrl = `https://api-sui.cetus.zone/v3/sui/coin/k_line_pair?date_type=${resolution}&begin_timestamp=${from}&end_timestamp=${to}&base_coin=${base_coin}&quote_coin=${quote_coin}`

  // 内部请求函数
  const fetchData = async (): Promise<Bar[] | null> => {
    try {
      const response = await fetch(apiUrl)
      const data = await response.json()
      console.log('🚀 ~ fetchData ~ data:', data)

      if (data?.code === 500) {
        throw new Error('Server Error: 500')
      }

      if (data?.code === 0 && data?.data?.list?.length === 0) {
        return null
      }

      const result = data?.data?.list?.map((item: any) => ({
        time: d(item.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
        high: Number(item.value.high),
        low: Number(item.value.low),
        open: Number(item.value.open),
        close: Number(item.value.close)
        // volume: item.volume
      }))

      console.log('🚀 ~ getHistoricalData ~ result:', result)
      return result || []
    } catch (error) {
      console.error('🚀 ~ fetchData Error:', error)

      // 检查当前请求是否是最新请求
      if (latestRequestId !== requestId) {
        console.log('🚀 ~ Request aborted due to poolId change.')
        return [] // 如果不是最新请求，直接返回空数组
      }

      console.log('Retrying in 5 seconds...')
      await sleepTime(5000) // 等待 5 秒后重试

      if (latestRequestId !== requestId) {
        console.log('🚀 ~ Request aborted due to poolId change.')
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
  console.log('🚀 ~ getLatestKlineData ~ poolId:', poolId)
  console.log('🚀 ~ getLatestKlineData ~ resolution:', resolution)
  try {
    const arr = poolId.split('-')
    const base_coin = toLongCoinType(arr?.[0]) || ''
    const quote_coin = toLongCoinType(arr?.[1]) || ''
    // 替换为你的 API 地址
    // const apiUrl = `https://api.example.com/market_data?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`
    // const apiUrl = `https://api-sui.cetus.zone/v3/sui/deepbookv3/prices?date_type=${resolution}&start_timestamp=${from}&end_timestamp=${to}&address=${poolId}`
    const apiUrl = `https://api-sui.cetus.zone/v3/sui/coin/latest_k_line_pair?date_type=${resolution}&base_coin=${base_coin}&quote_coin=${quote_coin}`
    const response = await fetch(apiUrl)
    const data = await response.json()
    console.log('🚀 ~ getLatestKlineData ~ data:', data)

    // const result = data?.data?.value?.map((item: any) => ({
    //   time: d(item.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
    //   high: Number(item.value.high),
    //   low: Number(item.value.low),
    //   open: Number(item.value.open),
    //   close: Number(item.value.close)
    //   // volume: item.volume
    // }))
    const value = data?.data?.value
    console.log('🚀 ~ getLatestKlineData ~ value:', value)
    if (!value) return []
    const result = {
      time: d(value.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
      high: Number(value.value.high),
      low: Number(value.value.low),
      open: Number(value.value.open),
      close: Number(value.value.close),
      volume: 0
    }

    console.log('🚀 ~ getLatestKlineData ~ result:', result)

    return [result]
  } catch (error) {
    console.log('🚀 ~ getLatestKlineData ~ error:', error)
    return []
  }
}
