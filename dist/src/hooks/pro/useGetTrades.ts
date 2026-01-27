import useWebSocket from '@/hooks/common/useWebSocket'
import useGetApiData from '@/hooks/pro/useGetApiData'
import { sleepTime } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import useWrapProData from './useWrapProData'

export default function useGetTrades() {
  const { getCoinTrades } = useGetApiData()
  const { wrapCoinTrades } = useWrapProData()
  const realTimeData = useRef<any>({
    list: [],
    nextPageCursor: '',
    isFirstPage: true
  })
  const [noRealTimeData, setNoRealTimeData] = useState<any>({
    list: [],
    nextPageCursor: '',
    isFirstPage: true
  })
  const [displayRealData, setDisplayRealData] = useState<any>({
    list: [],
    nextPageCursor: '',
    isFirstPage: true
  })
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  // const [currentParams, setCurrentParams] = useState<any>(null)
  const currentParams = useRef<any>(null)
  const pauseWs = useRef<any>(false)

  const setPauseWs = (value: boolean) => {
    pauseWs.current = value
  }

  const getTrades = async (params: { coinType: string; type?: string; maker?: string; isRealTime?: boolean; cursor?: string; limit?: number }) => {
    const haveUnSubscribe =
      (currentParams.current?.coinType && fixCoinType(params?.coinType) !== fixCoinType(currentParams.current?.coinType)) ||
      (currentParams.current?.type && params?.type !== currentParams.current?.type) ||
      (currentParams.current?.maker && params?.maker !== currentParams.current?.maker)

    const isFirstSubscribe = !currentParams.current

    const { coinType, type, maker, isRealTime, cursor, limit } = params
    // setCurrentParams(params)
    currentParams.current = params
    setLoading(true)
    try {
      const res: any = await getCoinTrades({
        coinType,
        type,
        sender: maker,
        limit: limit || 10,
        cursor
      })

      if (isRealTime) {
        setDisplayRealData({
          list: res?.list || [],
          nextPageCursor: res?.nextPageCursor,
          isFirstPage: res?.isFirstPage
        })
        realTimeData.current = {
          list: res?.list || [],
          nextPageCursor: res?.nextPageCursor,
          isFirstPage: res?.isFirstPage
        }
      } else {
        setNoRealTimeData((prevData: any) => {
          return res?.isFirstPage
            ? {
                list: res?.list,
                nextPageCursor: res?.nextPageCursor,
                isFirstPage: res?.isFirstPage
              }
            : {
                ...prevData,
                list: [...prevData?.list, ...res?.list],
                nextPageCursor: res?.nextPageCursor,
                isFirstPage: res?.isFirstPage
              }
        })
      }

      // 第一次订阅，之前没有任何订阅
      if (isFirstSubscribe) {
        handleSubScribe(coinType, type, maker)
      }

      // 之前有过订阅，需要切换订阅
      if (haveUnSubscribe) {
        handleUnSubScribe()
        handleSubScribe(coinType, type, maker)
      }
    } catch (error) {
      if (isRealTime) {
        setDisplayRealData({
          list: [],
          nextPageCursor: '',
          isFirstPage: true
        })
        realTimeData.current = {
          list: [],
          nextPageCursor: '',
          isFirstPage: true
        }
      } else {
        setNoRealTimeData({
          list: [],
          nextPageCursor: '',
          isFirstPage: true
        })
      }
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const { subscribe, send, isConnected } = useWebSocket()

  useEffect(() => {
    // 订阅 TRADE_DATA 消息
    const unsubscribe = subscribe('TRADE_DATA', (data: any) => {
      if (!data || pauseWs.current) return
      if (currentParams.current?.type && currentParams.current?.type?.indexOf(data?.type) < 0) return
      const updatedItem = wrapCoinTrades([data], true)
      // 推送一些早于原来的数据放弃存储
      if (realTimeData.current?.list?.[0] && updatedItem?.[0] && updatedItem?.[0]?.timestamp < realTimeData.current?.list?.[0]?.timestamp) {
        return
      }

      // const newList = [...updatedItem, ...realTimeData.current?.list]?.slice(0, 30)?.sort((a: any, b: any) => b?.timestamp - a?.timestamp)
      const newList = [...updatedItem, ...realTimeData.current?.list?.slice(0, 30)]
      realTimeData.current = {
        ...realTimeData.current,
        list: [...newList]
      }
    })

    return unsubscribe
  }, [subscribe, send])

  const handleSubScribe = async (coinType: string, type?: string, maker?: string) => {
    const data: any = {
      tokenId: coinType
    }
    if (type) {
      data['tradeType'] = type
    }
    if (maker) {
      data['maker'] = maker
    }

    const res = send('SUBSCRIBE_TRADES', data, { isSubscription: true })

    if (!res) {
      await sleepTime(1000)
      handleSubScribe(coinType, type, maker)
    }
  }

  const handleUnSubScribe = () => {
    send('UNSUBSCRIBE_TRADES')
  }

  // 稳定的定时器（完全不依赖rawData变化）
  useEffect(() => {
    const timer = setInterval(() => {
      // 直接从ref获取最新数据，避免闭包问题
      if (pauseWs.current) {
        setDisplayRealData((prev: any) => {
          return { ...prev }
        })
        return
      }
      const listMap = Object.fromEntries(displayRealData?.list?.map((item: any) => [item?.id, item]))
      const fList = realTimeData.current?.list?.map((item: any, index: number) => {
        if (!listMap?.[item?.id] && item?.isWsData) {
          return {
            ...item,
            haveAnimation: true
          }
        } else {
          return {
            ...item,
            haveAnimation: false
          }
        }
      })
      setDisplayRealData({ ...realTimeData.current, list: [...fList] })
    }, 1000) // 严格的1秒间隔

    return () => clearInterval(timer)
  }, [pauseWs.current]) // 空依赖数组确保定时器只设置一次

  const data = useMemo(() => {
    return currentParams.current?.isRealTime ? displayRealData : noRealTimeData
  }, [noRealTimeData, displayRealData, currentParams.current?.isRealTime])

  return {
    data,
    loading,
    error,
    isConnected,
    getTrades,
    setPauseWs,
    pauseWs: pauseWs.current
  }
}
