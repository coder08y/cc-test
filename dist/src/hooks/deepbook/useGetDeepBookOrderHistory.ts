import { DeepBookOrderHistoryPath } from '@/apis/path'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useFetch } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import { useMemo } from 'react'
import useGetDeepBookPools from './useGetDeepBookPools'

// 状态映射：前端标签 -> API status code
const STATUS_MAP: { [key: string]: number } = {
  Pending: 0, // 新建
  'Partially Filled': 1, // 部分成交
  Filled: 2, // 完全成交
  Cancelled: 3, // 已取消
  Expired: 4 // 已过期
}

// 反向映射：API status code -> 前端标签
const STATUS_LABEL_MAP: { [key: number]: string } = {
  0: 'Pending',
  1: 'Partially Filled',
  2: 'Filled',
  3: 'Cancelled',
  4: 'Expired'
}

export default function useGetDeepBookOrderHistory() {
  const { fetchByApi } = useFetch()
  const { currentAccount } = useAccountStore()
  const { deepBookPoolsObj, setDeepBookOrderHistoryLoading, setDeepBookOrderHistory, getCurrentBalanceManagerInfo, currentDeepBookPool } =
    useDeepBookStore()
  const { queryDeepBookPoolByValue } = useGetDeepBookPools()
  const { marginManagerByAccount } = useMarginStore()

  // 缓存已查询的池信息，避免重复请求
  const poolInfoCache = useMemo(() => new Map(), [])

  const getDeepBookOrderHistory = async (params?: {
    poolId?: string
    side?: string
    status?: string
    limit?: number
    eventCursor?: string
    isLoadMore?: boolean
    isMargin?: boolean
  }) => {
    console.log('🚀🚀🚀 ~ useGetDeepBookOrderHistory.ts:38 ~ getDeepBookOrderHistory ~ poolId:', params?.isMargin)
    try {
      // 只有非加载更多时才设置全局 loading（显示骨架屏）
      if (!params?.isLoadMore) {
        setDeepBookOrderHistoryLoading(true)
      }

      // 根据 params?.isMargin 获取对应的 balance manager
      let balanceManagerId: string | string[] | null = null
      if (params?.isMargin) {
        // margin 模式：使用 margin_manager_id
        if (params?.poolId) {
          // 指定了 poolId：获取单个匹配的 margin_manager_id
          balanceManagerId = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === params.poolId)?.margin_manager_id || null
        } else {
          // 未指定 poolId（All market）：获取所有的 margin_manager_id
          const allMarginManagerIds = (marginManagerByAccount as any[])
            .map((m: any) => m?.margin_manager_id)
            .filter((id: any) => id != null) as string[]
          balanceManagerId = allMarginManagerIds.length > 0 ? allMarginManagerIds : null
        }
      } else {
        // spot 模式：使用 balanceManager
        balanceManagerId = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager || null
      }

      if (!balanceManagerId || (Array.isArray(balanceManagerId) && balanceManagerId.length === 0)) {
        if (!params?.isLoadMore) {
          setDeepBookOrderHistory([])
        }
        setDeepBookOrderHistoryLoading(false)
        return { list: [], cursor: null, hasMore: false }
      }

      // 构建查询参数
      const queryParams: any = {
        limit: params?.limit || 20
      }

      console.log('🚀🚀🚀 ~ useGetDeepBookOrderHistory.ts:81 ~ getDeepBookOrderHistory ~ params?.isMargin:', params?.isMargin)
      if (params?.isMargin) {
        // margin 模式：根据是单个还是多个 ID 使用不同的参数名
        if (Array.isArray(balanceManagerId)) {
          // 多个 ID：使用 balance_manager_owners（复数），值用逗号分隔
          queryParams['balance_manager_owners'] = balanceManagerId.join(',')
        } else {
          // 单个 ID：使用 balance_manager_owner（单数）
          queryParams['balance_manager_owners'] = balanceManagerId
        }
        console.log('🚀🚀🚀 ~ useGetDeepBookOrderHistory.ts:84 ~ getDeepBookOrderHistory ~ queryParams:', queryParams)
      } else {
        queryParams['balance_manager_id'] = balanceManagerId
      }

      // 如果指定了 poolId
      if (params?.poolId) {
        queryParams.pool_id = params.poolId
      }

      // 如果指定了 side (buy/sell 或 Long/Short)
      if (params?.side && params.side !== 'All') {
        // 如果是 margin 模式，需要将 'Long'/'Short' 转换为 'buy'/'sell'
        if (params?.isMargin) {
          if (params.side === 'Long') {
            queryParams.side = 'buy'
          } else if (params.side === 'Short') {
            queryParams.side = 'sell'
          } else {
            queryParams.side = params.side.toLowerCase()
          }
        } else {
          queryParams.side = params.side.toLowerCase()
        }
      }

      // 处理 status 参数：将前端标签转换为 API status code
      if (params?.status) {
        const statusLabels = params.status.split(',').filter(Boolean)
        if (statusLabels.length > 0 && statusLabels.length < 5) {
          // 如果不是选择全部5个状态，则传递 status 参数
          // 多个状态用逗号分隔的数字，例如: "0,1,2"
          const statusCodes = statusLabels.map(label => STATUS_MAP[label]).filter(code => code !== undefined)
          if (statusCodes.length > 0) {
            queryParams.status = statusCodes.join(',')
          }
        }
        // 如果选择了全部5个状态或没有选择，使用默认值 -1 (全部)
        if (statusLabels.length === 0 || statusLabels.length === 5) {
          queryParams.status = -1
        }
      } else {
        queryParams.status = -1 // 默认全部
      }

      // 如果提供了游标
      if (params?.eventCursor) {
        queryParams.event_cursor = params.eventCursor
      }
      console.log('🚀🚀🚀 ~ useGetDeepBookOrderHistory.ts:119 ~ getDeepBookOrderHistory ~ queryParams:', queryParams)

      const res = await fetchByApi(DeepBookOrderHistoryPath, 'GET', queryParams)

      console.log('🚀🚀🚀 ~ useGetDeepBookOrderHistory.ts:98 ~ getDeepBookOrderHistory ~ res:', res)

      if (!res?.list || res.list.length === 0) {
        if (!params?.isLoadMore) {
          setDeepBookOrderHistory([])
        }
        setDeepBookOrderHistoryLoading(false)
        return { list: [], cursor: null, hasMore: false }
      }

      // 预处理：收集所有需要查询的 pool_id
      const poolIdsToQuery = new Set<string>()
      res.list.forEach((item: any) => {
        const poolId = item.pool_id as string
        const poolsObj = deepBookPoolsObj as Record<string, any>
        if (!poolsObj[poolId] && !poolInfoCache.has(poolId)) {
          poolIdsToQuery.add(poolId)
        }
      })

      // 批量查询缺失的池信息
      if (poolIdsToQuery.size > 0) {
        const poolIdsArray = Array.from(poolIdsToQuery)

        // 批量查询池信息
        for (const poolId of poolIdsArray) {
          try {
            const poolInfo = await queryDeepBookPoolByValue(poolId)
            if (poolInfo && poolInfo.length > 0) {
              poolInfoCache.set(poolId, poolInfo[0])
            }
          } catch (error) {
            console.error(`search poolId: ${poolId}`, error)
          }
        }
      }

      // 处理订单历史数据
      const list: any[] = []
      for (let i = 0; i < res.list.length; i++) {
        const item = res.list[i]
        const history = wrapDeepBookOrderHistory(item, params?.isMargin || false)
        if (history) {
          list.push(history)
        } else {
          console.warn('⚠️ ~ order history data processing failed, skipped:', item)
        }
      }

      // 如果是加载更多，不在这里设置数据，由组件处理
      if (!params?.isLoadMore) {
        setDeepBookOrderHistory(list)
      }
      setDeepBookOrderHistoryLoading(false)

      // 返回数据、游标和是否还有更多数据
      // 如果返回的数据量小于 limit，说明没有更多数据了，hasMore 应为 false
      // 只有当返回的数据量等于 limit 时，才认为可能还有更多数据
      const limit = params?.limit || 20
      const hasMore = res.list.length === limit
      return { list, cursor: res.cursor || null, hasMore }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetDeepBookOrderHistory ~ error:', error)
      setDeepBookOrderHistoryLoading(false)
      return { list: [], cursor: null, hasMore: false }
    }
  }

  const wrapDeepBookOrderHistory = (history: any, isMargin: boolean = false) => {
    try {
      const poolId = history.pool_id as string
      const poolsObj = deepBookPoolsObj as Record<string, any>

      // 优先从 store 中获取
      let poolInfo = poolsObj[poolId]
      // 如果 store 中没有，从缓存中获取
      if (!poolInfo) {
        poolInfo = poolInfoCache.get(poolId)
      }

      // 如果缓存中也没有，说明这个池信息在批量查询时失败了，跳过这条记录
      if (!poolInfo) {
        return null
      }

      const { baseAssets, quoteAssets } = poolInfo
      const quoteDecimals = quoteAssets.decimals
      const baseDecimals = baseAssets.decimals

      // 解析价格
      const price = d(history.price)
        .div(Math.pow(10, quoteDecimals - baseDecimals + 9))
        .toString()

      // 解析数量
      const originalQuantity = d(history.quantity).div(Math.pow(10, baseDecimals)).toString()

      // 解析已成交数量
      const filledQuantity = d(history.filled).div(Math.pow(10, baseDecimals)).toString()

      // 计算已成交金额 (filled * price)
      const total = d(filledQuantity).mul(d(price)).toString()

      // 将 API 的 status code 转换为前端标签
      const orderStatus = STATUS_LABEL_MAP[history.status] || 'Unknown'

      // 保存原始时间戳，用于时区转换
      const timestamp = history.timestamp || null

      // 根据 isMargin 转换 side 字段：margin 模式使用 'Long'/'Short'，spot 模式使用 'Buy'/'Sell'
      const isBuy = history.side === 'buy'
      const side = isMargin ? (isBuy ? 'Buy' : 'Sell') : isBuy ? 'Buy' : 'Sell'

      return {
        baseAssets,
        quoteAssets,
        timestamp,
        side,
        price,
        originalQuantity, // 订单总数量
        filledQuantity, // 已成交数量
        total, // 已成交金额
        orderStatus,
        poolId: history.pool_id,
        orderId: history.order_id,
        eventCursor: history.event_cursor
      }
    } catch (error) {
      console.error('🚀🚀🚀 ~ wrapDeepBookOrderHistory ~ error:', error, history)
      return null
    }
  }

  return { getDeepBookOrderHistory }
}
