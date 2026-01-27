import { useCallback, useRef, useState } from 'react'

import { DeepBookRecentTradesPath } from '@/apis/path'
import { DEEPBOOK_INDEXER_BASE_URL } from '@/constant/deepbook'
import { useFetch } from '@cetus/hooks'
export interface RecentTrade {
  event_digest: string
  digest: string
  maker_order_id: string
  taker_balance_manager_id: string
  price: number
  type: 'buy' | 'sell'
  taker_is_bid: boolean
  timestamp: number
  quote_volume: number
  taker_fee_is_deep: boolean
  maker_fee_is_deep: boolean
  taker_order_id: string
  taker_fee: number
  base_volume: number
  maker_fee: number
  trade_id: string
  maker_balance_manager_id: string
}

export default function useGetDeepBookRecentTrades() {
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const currentPoolNameRef = useRef<string>('')
  const isRequestingRef = useRef<boolean>(false)
  const isFirstLoadRef = useRef<boolean>(true)
  const { fetchByApi } = useFetch()

  const getRecentTrades = useCallback(async (poolId: string) => {
    console.log(poolId, 'poolId ---')
    if (!poolId) return

    if (isRequestingRef.current && currentPoolNameRef.current === poolId) {
      return
    }

    const isPoolNameChanged = currentPoolNameRef.current !== poolId
    if (isPoolNameChanged) {
      setRecentTrades([])
      setInitialized(false)
      isFirstLoadRef.current = true
      currentPoolNameRef.current = poolId
    }

    const isFirstLoad = isFirstLoadRef.current

    try {
      isRequestingRef.current = true
      if (isFirstLoad) {
        setLoading(true)
      }

      // 计算最近24小时的时间戳
      const endTime = Math.floor(Date.now() / 1000) // 当前时间的秒级时间戳
      const startTime = endTime - 24 * 60 * 60 // 24小时前

      // const url = `${DEEPBOOK_INDEXER_BASE_URL}/trades/${poolName}?limit=50&start_time=${startTime}&end_time=${endTime}`
      // const res = await fetchByApi(`${DeepBookRecentTradesPath}?pool_id=${poolId}&limit=50&start_time=${startTime}&end_time=${endTime}`, 'GET')
      const res = await fetchByApi(`${DeepBookRecentTradesPath}?pool_id=${poolId}&limit=100`, 'GET')

      console.log(res, 'res ---')

      // const response = await fetch(url)

      // if (!response.ok) {
      //   throw new Error(`Failed to fetch recent trades: ${response.statusText}`)
      // }

      // const data = await response.json()
      setRecentTrades(res.list || [])
      setInitialized(true)
      // 首次加载完成后，标记为非首次加载
      if (isFirstLoad) {
        isFirstLoadRef.current = false
      }
    } catch (error) {
      console.error('Error fetching recent trades:', error)
      setRecentTrades([])
      setInitialized(true)
      // 首次加载完成后，标记为非首次加载
      if (isFirstLoad) {
        isFirstLoadRef.current = false
      }
    } finally {
      // 只在首次加载时更新 loading 状态
      if (isFirstLoad) {
        setLoading(false)
      }
      isRequestingRef.current = false
    }
  }, [])

  return {
    recentTrades,
    loading,
    initialized,
    getRecentTrades
  }
}
