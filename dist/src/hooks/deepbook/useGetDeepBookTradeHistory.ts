import { DeepBookMarginTradeHistoryPath, DeepBookTradeHistoryPath } from '@/apis/path'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useFetch } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import { useMemo } from 'react'
import useGetDeepBookPools from './useGetDeepBookPools'

export default function useGetDeepBookTradeHistory() {
  const { fetchByApi } = useFetch()
  const { currentAccount } = useAccountStore()
  const { deepBookPoolsObj, setDeepBookTradeHistoryLoading, setDeepBookTradeHistory, getCurrentBalanceManagerInfo, currentDeepBookPool } =
    useDeepBookStore()
  const { queryDeepBookPoolByValue } = useGetDeepBookPools()

  const { marginManagerByAccount } = useMarginStore()

  // 缓存已查询的池信息，避免重复请求
  const poolInfoCache = useMemo(() => new Map(), [])
  const currentSelectedManagerInfo = useMarginStore((state: any) => {
    if (!currentAccount?.address) return null
    return state.getCurrentMarginManagerInfo(currentAccount?.address)
  })

  const getDeepBookTradeHistory = async (params?: {
    poolId?: string
    side?: string
    limit?: number
    eventCursor?: string
    isLoadMore?: boolean
    isMargin: boolean
  }) => {
    try {
      // 只有非加载更多时才设置全局 loading（显示骨架屏）
      if (!params?.isLoadMore) {
        setDeepBookTradeHistoryLoading(true)
      }

      // 根据 params?.isMargin 获取对应的 balance manager
      let balanceManagerId: string | string[] | null = null
      if (params?.isMargin) {
        // margin 模式：使用 margin_manager_id
        if (params?.poolId) {
          // 指定了 poolId：获取单个匹配的 margin_manager_id
          balanceManagerId =
            currentSelectedManagerInfo?.margin_manager_id ||
            (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === params.poolId)?.margin_manager_id ||
            null
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
          setDeepBookTradeHistory([])
        }
        setDeepBookTradeHistoryLoading(false)
        return { list: [], cursor: null, hasMore: false }
      }

      // 构建查询参数
      const queryParams: any = {
        limit: params?.limit || 20
      }

      // 确定使用的 API 路径
      let apiPath = DeepBookTradeHistoryPath

      if (params?.isMargin) {
        apiPath = DeepBookMarginTradeHistoryPath
        // margin 模式：根据是单个还是多个 ID 使用不同的参数名和路径
        if (Array.isArray(balanceManagerId)) {
          // 多个 ID（allmarket 场景）：使用新路径和 balance_manager_owners（复数），值用逗号分隔
          queryParams['balance_manager_owners'] = balanceManagerId.join(',')
          // allmarket 场景不传 pool_id
        } else {
          // 单个 ID：使用原路径和 balance_manager_owners（单数）
          queryParams['balance_manager_owners'] = balanceManagerId
          // 如果指定了 poolId，可以传 pool_id
          if (params?.poolId) {
            queryParams.pool_id = params.poolId
          }
        }
      } else {
        // spot 模式：使用 balance_manager_id
        queryParams['balance_manager_id'] = balanceManagerId
        if (params?.poolId) {
          queryParams.pool_id = params.poolId
        }
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

      // 如果提供了游标
      if (params?.eventCursor) {
        queryParams.event_cursor = params.eventCursor
      }

      const res = await fetchByApi(apiPath, 'GET', queryParams)

      console.log('🚀🚀🚀 ~ useGetDeepBookTradeHistory ~ res:', res)

      if (!res?.list || res.list.length === 0) {
        if (!params?.isLoadMore) {
          setDeepBookTradeHistory([])
        }
        setDeepBookTradeHistoryLoading(false)
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

      const list: any[] = []
      for (let i = 0; i < res.list.length; i++) {
        const item = res.list[i]
        const history = wrapDeepBookTradeHistory(item, params?.isMargin)
        if (history) {
          list.push(history)
        }
      }

      // 如果是加载更多，不在这里设置数据，由组件处理
      if (!params?.isLoadMore) {
        setDeepBookTradeHistory(list)
      }
      setDeepBookTradeHistoryLoading(false)

      // 返回数据、游标和是否还有更多数据
      // 如果返回的数据量小于 limit，说明没有更多数据了，hasMore 应为 false
      // 只有当返回的数据量等于 limit 时，才认为可能还有更多数据

      const hasMore = res.list.length === (queryParams?.limit || 20)
      return { list, cursor: res.cursor || null, hasMore }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetDeepBookTradeHistory ~ error:', error)
      setDeepBookTradeHistoryLoading(false)
      return { list: [], cursor: null, hasMore: false }
    }
  }

  const wrapDeepBookTradeHistory = (history: any, isMargin?: boolean) => {
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

      // 解析成交数量
      const quantity = d(history.quantity).div(Math.pow(10, baseDecimals)).toString()

      // 解析手续费
      // 买单（buy/bid）：手续费用 quote 币种支付，除以 quoteDecimals
      // 卖单（sell/ask）：手续费用 base 币种支付，除以 baseDecimals

      // !!! todo 感觉这里返回数据的decimal有点问题，暂时用反方向的decimal来计算手续费
      const isBuy = history.side === 'buy'
      // const feeDecimals = isBuy ? baseDecimals : quoteDecimals
      const fee = history.fee || 0
      // d(history.fee || 0)
      //   .div(Math.pow(10, feeDecimals))
      //   .toString()

      // 保存原始时间戳，用于时区转换
      const timestamp = history.timestamp || null

      // 根据 isMargin 转换 side 字段：margin 模式使用 'Long'/'Short'，spot 模式使用 'Buy'/'Sell'
      const side = isMargin ? (isBuy ? 'Buy' : 'Sell') : isBuy ? 'Buy' : 'Sell'

      return {
        baseAssets,
        quoteAssets,
        timestamp,
        side,
        price,
        total: quantity, // 成交数量
        fee,
        feeCoinSymbol: isBuy ? quoteAssets.symbol : baseAssets.symbol, // 手续费币种
        poolId: history.pool_id,
        tx: history.tx,
        eventCursor: history.event_cursor,
        orderStatus: 'Success' // 交易历史都是成功的
      }
    } catch (error) {
      console.error('🚀🚀🚀 ~ wrapDeepBookTradeHistory ~ error:', error, history)
      return null
    }
  }

  return { getDeepBookTradeHistory }
}
