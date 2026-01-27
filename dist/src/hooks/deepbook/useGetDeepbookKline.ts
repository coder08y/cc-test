import envConfigs from '@cetus/types/src/config/envConfigs'
import { d, sleepTime } from '@cetus/utils'
import { useEffect, useRef } from 'react'
import { v4 } from 'uuid'
import useDeepbookWebSocket from './useDeepbookWebsocket'

const dateType: any = {
  '1': '1min',
  '10': '10min',
  '15': '15min',
  '30': '30min',
  '60': 'hour',
  '240': '4hour',
  '1D': 'day',
  '1W': 'week'
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

export default function useGetDeepbookKlineData() {
  // const { setCoinBvPrice } = useProStore()
  const currentPoolId = useRef<any>()
  const currentResolution = useRef<string>()
  const currentCallback = useRef<any>()
  const unsubscribeRef = useRef<() => void>()
  const { subscribe, send, disconnect, addReconnectCompensation, removeReconnectCompensation } = useDeepbookWebSocket({
    autoConnect: true,
    maxReconnectAttempts: 5
  })

  // 重连补偿机制 - 获取缺失的K线数据
  const compensationCallback = useRef<(disconnectStartTime: number, disconnectEndTime: number) => void>()
  const isCompensatingRef = useRef(false) // 防止重复执行补偿

  // 初始化重连补偿回调
  useEffect(() => {
    compensationCallback.current = async (disconnectStartTime: number, disconnectEndTime: number) => {
      // 防止重复执行
      if (isCompensatingRef.current) {
        return
      }

      if (!currentPoolId.current || !currentResolution.current || !currentCallback.current) {
        return
      }

      // 检查断开时间是否有效（断开时间应该小于当前时间）
      const now = Date.now()
      if (disconnectStartTime >= now || disconnectEndTime > now) {
        return
      }

      // 检查断开时间范围是否合理（断开时间应该小于等于重连时间）
      if (disconnectStartTime > disconnectEndTime) {
        return
      }

      isCompensatingRef.current = true

      try {
        // 计算需要补偿的时间范围（精确的断开时间段）
        const startTimestamp = Math.floor(disconnectStartTime / 1000)
        const endTimestamp = Math.floor(disconnectEndTime / 1000)

        // 通过API获取补偿数据
        const type = dateType[currentResolution.current as keyof typeof dateType]
        const apiUrl = `${envConfigs?.cetus_api}/v3/sui/deepbookv3/prices?date_type=${type}&start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}&address=${currentPoolId.current}`

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data?.code === 0 && data?.data?.lists && Array.isArray(data.data.lists)) {
          const compensationData = data.data.lists
            .map((item: any) => ({
              time: d(item.timestamp).mul(1000).toNumber(),
              high: Number(item.high),
              low: Number(item.low),
              open: Number(item.open),
              close: Number(item.settle)
            }))
            // 过滤：只保留时间在断开期间内的数据，且时间不能早于断开开始时间
            .filter((item: Bar) => {
              return item.time >= disconnectStartTime && item.time <= disconnectEndTime
            })

          // 按时间排序，确保数据顺序正确
          compensationData.sort((a: Bar, b: Bar) => a.time - b.time)

          // 调用回调函数处理补偿数据（只处理有效的数据）
          if (compensationData.length > 0) {
            compensationData.forEach((item: Bar) => {
              // 再次验证时间，确保不会触发时间顺序违反错误
              if (item.time >= disconnectStartTime && item.time <= disconnectEndTime) {
                currentCallback.current(item)
              }
            })
          }
        }
      } catch (error) {
        console.error('🔄 Compensation failed:', error)
      } finally {
        // 延迟重置标志，防止短时间内重复执行
        setTimeout(() => {
          isCompensatingRef.current = false
        }, 1000)
      }
    }

    // 注册重连补偿回调
    addReconnectCompensation(compensationCallback.current)

    // 清理函数
    return () => {
      isCompensatingRef.current = false
      if (compensationCallback.current) {
        removeReconnectCompensation(compensationCallback.current)
      }
    }
  }, [addReconnectCompensation, removeReconnectCompensation])

  // 获取历史数据
  const getDeepbookHistoricalData = async ({
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
    // 对接ws后打开
    // if (currentPoolId.current && currentPoolId.current !== poolId) {
    //   send('UNSUBSCRIBE_OHLCV')
    // }
    currentPoolId.current = poolId

    // 生成当前请求的唯一标识
    const requestId = v4()
    latestRequestId = requestId // 更新全局变量，表明这是最新的请求

    const type = dateType[resolution as keyof typeof dateType]

    const apiUrl = `${envConfigs?.cetus_api}/v3/sui/deepbookv3/prices?date_type=${type}&start_timestamp=${from}&end_timestamp=${to}&address=${poolId}`

    // 内部请求函数
    const fetchData = async (): Promise<Bar[] | null> => {
      try {
        // const response = await fetch(apiUrl, {
        //   method: 'GET',
        //   headers: {
        //     accept: 'application/json'
        //   }
        // })
        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data?.code === 500) {
          throw new Error('Server Error: 500')
        }

        if (data?.code === 0 && data?.data?.length === 0) {
          return null
        }

        const list = data?.data?.lists || []
        const result = list?.map((item: any) => ({
          time: d(item.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
          high: Number(item.high),
          low: Number(item.low),
          open: Number(item.open),
          close: Number(item.settle)
          // volume: item.volume
        }))

        return result || []
      } catch (error) {
        console.error('getDeepbookHistoricalData 🚀 ~ fetchData Error:', error)

        // 检查当前请求是否是最新请求
        if (latestRequestId !== requestId) {
          // console.log('🚀 ~ Request aborted due to poolId change.')
          return [] // 如果不是最新请求，直接返回空数组
        }

        // console.log('Retrying in 5 seconds...')
        await sleepTime(5000) // 等待 5 秒后重试

        if (latestRequestId !== requestId) {
          // console.log('🚀 ~ Request aborted due to poolId change.')
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

  // 订阅交易数据
  const subscribeKlineData = ({
    poolId,
    resolution,
    callback,
    onPriceChange
  }: { poolId: string; resolution: string; callback: any; onPriceChange: any }) => {
    // console.log(`🚀 ~ subscribeKlineData ~ { poolId, resolution, callback }:`, { poolId, resolution, callback })

    if (!resolution || !dateType?.[resolution] || !poolId) return () => {}

    // 保存当前订阅信息，供补偿机制使用
    currentPoolId.current = poolId
    currentResolution.current = resolution
    currentCallback.current = callback

    const op = unsubscribeRef.current ? 'change_sub' : 'subscribe'
    // 先取消之前的订阅
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    // 设置新的订阅 - 订阅 'pool-price' 类型的消息
    unsubscribeRef.current = subscribe('pool-price', (data: any) => {
      // console.log('Received pool-price message:', data)

      // 检查消息是否包含相关数据
      if (!data?.body || data?.op !== 'data') {
        // console.log('Message does not contain valid list data')
        return
      }

      const value = data?.body
      if (!value) {
        // console.log('No valid data in list')
        return
      }

      // 检查池ID是否匹配
      // if (fixCoinType(poolId) !== data?.sub_addr) {
      if (!data?.sub_addr?.includes(poolId)) {
        // console.log('Pool ID mismatch:', { poolId, messageTokenId: data?.sub_addr })
        return
      }

      const result = {
        time: d(value.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
        high: Number(value.high),
        low: Number(value.low),
        open: Number(value.open),
        close: Number(value.settle)
        // volume: value.volume
      }

      callback(result)
      if (onPriceChange) {
        onPriceChange({
          poolId,
          price: String(result?.close) || ''
        })
      }
    })

    // 发送订阅消息到WebSocket服务器
    const subscribeMsg = {
      op,
      source: 'deepbookv3',
      category: 'pool-price',
      sub_addr: poolId,
      data_types: [dateType[resolution]]
    }

    const success = send(subscribeMsg, { isSubscription: true })
    if (success) {
      // console.log('Successfully sent subscription message for pool:', poolId)
    } else {
      console.error('Failed to send subscription message for pool:', poolId)
    }

    // 返回取消订阅函数
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = undefined
      }
      // 清除当前订阅信息
      currentPoolId.current = undefined
      currentResolution.current = undefined
      currentCallback.current = undefined
    }
  }

  const getLatestKlineData = async ({
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
    try {
      const type = dateType[resolution as keyof typeof dateType]
      // 替换为你的 API 地址
      const apiUrl = `${envConfigs?.cetus_api}/v3/sui/deepbookv3/prices?date_type=${type}&start_timestamp=${from}&end_timestamp=${to}&address=${poolId}`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          accept: 'application/json'
          // 'x-api-key': '2uZYBhmZMcACCbGxbFLbf5R6QCb'
        }
      })
      const data = await response.json()

      const value = data?.data?.lists?.[data?.data?.lists?.length - 1]
      if (!value) return []
      const result = {
        time: d(value.timestamp).mul(1000).toNumber(), // 转换为毫秒级时间戳
        high: Number(value.high),
        low: Number(value.low),
        open: Number(value.open),
        close: Number(value.settle)
      }

      return [result]
    } catch (error) {
      console.log('🚀 ~ getLatestKlineData ~ error:', error)
      return []
    }
  }

  return {
    getDeepbookHistoricalData,
    subscribeKlineData,
    getLatestKlineData,
    disconnectDeepbookWs: disconnect
  }
}
