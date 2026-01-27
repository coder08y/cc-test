import useWebSocket from '@/hooks/common/useWebSocket'
import useProStore from '@/store/pro'
import { d, getTimestampMinusHours, sleepTime } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useRef } from 'react'
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

export default function useGetPriceKlineData() {
  const { setCoinBvPrice, proTransactionList } = useProStore()
  const currentPoolId = useRef<any>()
  const unsubscribeRef = useRef<() => void>()
  const { subscribe, send } = useWebSocket()
  // 获取历史数据
  const getHistoricalData = async ({
    poolId,
    resolution,
    from,
    to,
    firstDataRequest,
    callback,
    onErrorCallback
  }: {
    poolId: string
    resolution: string
    from: number
    to: number
    callback: any
    onErrorCallback: any
    firstDataRequest?: boolean
  }) => {
    console.log('useGetPriceKlineData 🚀 ~ getHistoricalData ~ params poolId:', poolId)
    console.log('useGetPriceKlineData 🚀 ~ getHistoricalData ~ params resolution:', resolution)
    console.log('useGetPriceKlineData 🚀 ~ getHistoricalData ~ params from:', from)
    console.log('useGetPriceKlineData 🚀 ~ getHistoricalData ~ params to:', to)
    if (currentPoolId.current && currentPoolId.current !== poolId) {
      send('UNSUBSCRIBE_OHLCV')
    }
    currentPoolId.current = poolId

    // 生成当前请求的唯一标识
    const requestId = v4()
    latestRequestId = requestId // 更新全局变量，表明这是最新的请求

    const token = `0x${fixCoinType(poolId)}`

    let start = from

    // toDo: 由于接口限制了不同间隔数据的最大周期，超过会报错，所以加了详细的判断
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
      callback([], { noData: true })
      return
    } else if (resolution === '5m' && from < getTimestampMinusHours(24) && !firstDataRequest) {
      callback([], { noData: true })
      return
    } else if (resolution === '15m' && from < getTimestampMinusHours(168) && !firstDataRequest) {
      callback([], { noData: true })
      return
    } else if ((resolution === '1h' || resolution === '4h') && from < getTimestampMinusHours(720) && !firstDataRequest) {
      callback([], { noData: true })
      return
    } else if (resolution === '1d' && from < getTimestampMinusHours(7200) && !firstDataRequest) {
      callback([], { noData: true })
      return
    } else if (resolution === '1w' && from < getTimestampMinusHours(50400) && !firstDataRequest) {
      callback([], { noData: true })
      return
    } else if (resolution === '1M' && from < getTimestampMinusHours(216000) && !firstDataRequest) {
      callback([], { noData: true })
      return
    }
    if (start < 0) {
      callback([], { noData: true })
      return
    }

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

    const list = await fetchData() // 开始请求数据
    if (list) {
      callback(list, { noData: false })
    } else {
      callback([], { noData: true })
    }
  }

  const handleSend = async (action: string, data: any) => {
    const res = send(action, data, { isSubscription: true })

    if (!res) {
      await sleepTime(1000)
      handleSend(action, data)
    }
  }

  // 订阅交易数据
  const subscribeKlineData = ({ poolId, resolution, callback }: { poolId: string; resolution: string; callback: any }) => {
    // console.log(`🚀 ~ subscribeKlineData ~ { poolId, resolution, callback }:`, { poolId, resolution, callback })
    // 先取消之前的订阅
    if (unsubscribeRef.current) {
      // send('UNSUBSCRIBE_OHLCV')
      unsubscribeRef.current()
    }

    // 设置新的订阅
    unsubscribeRef.current = subscribe('OHLCV_DATA', (data: any) => {
      const value = data?.list?.[data?.list?.length - 1]
      if (!value) return []
      if (fixCoinType(poolId) !== fixCoinType(data?.tokenId)) return []
      const result = {
        time: d(value.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
        high: Number(value.high),
        low: Number(value.low),
        open: Number(value.open),
        close: Number(value.close),
        volume: value.volume
      }

      if (result) {
        callback(result)
        setCoinBvPrice({
          coinType: data?.tokenId,
          // price: formatSmallPrice(data?.price, 16)
          price: String(result?.close) || ''
        })
      }
    })

    const data = {
      tokenId: poolId,
      interval: resolution
    }
    // console.log('🚀 ~ subscribeKlineData ~ data:', data)

    // 可以在这里发送初始请求
    handleSend('SUBSCRIBE_OHLCV', data)
  }

  return {
    getHistoricalData,
    subscribeKlineData,
    proTransactionList
  }
}
