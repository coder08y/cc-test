import { DeepBookCountAllPath } from '@/apis/path'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useFetch } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { useCallback } from 'react'

export default function useGetDeepBookCount() {
  const { fetchByApi } = useFetch()
  const { currentAccount } = useAccountStore()
  const {
    getCurrentBalanceManagerInfo,
    // setShowOpenOrdersNum,
    setShowDeepBookOrderHistoryNum,
    setShowDeepBookTradeHistoryNum,
    // setShowOpenOrdersNumSpot,
    // setShowOpenOrdersNumMargin,
    setShowDeepBookOrderHistoryNumSpot,
    setShowDeepBookOrderHistoryNumMargin,
    setShowDeepBookTradeHistoryNumSpot,
    setShowDeepBookTradeHistoryNumMargin,
    orderTab
  } = useDeepBookStore()

  const { marginManagerByAccount } = useMarginStore()

  const getDeepBookCount = useCallback(
    async (params?: { poolId?: string | null }) => {
      try {
        // 获取 spot 的 balance_manager_id
        const spotBalanceManagerId = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager

        if (!spotBalanceManagerId) {
          // 如果没有 spot balance manager，重置所有计数为 0
          // setShowOpenOrdersNumSpot(0)
          // setShowOpenOrdersNumMargin(0)
          setShowDeepBookOrderHistoryNumSpot(0)
          // setShowDeepBookOrderHistoryNumMargin(0)
          setShowDeepBookTradeHistoryNumSpot(0)
          // setShowDeepBookTradeHistoryNumMargin(0)
          setShowDeepBookOrderHistoryNum(0)
          setShowDeepBookTradeHistoryNum(0)
          return
        }

        // 获取 margin 的 margin_manager_id(s)
        let marginManagerIds: string[] = []
        if (params?.poolId) {
          // 单个池子：查找匹配的 margin_manager_id
          const marginManager = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === params.poolId)
          if (marginManager?.margin_manager_id) {
            marginManagerIds = [marginManager.margin_manager_id]
          }
        } else {
          // All Market：获取所有的 margin_manager_id
          marginManagerIds = (marginManagerByAccount as any[]).map((m: any) => m?.margin_manager_id).filter((id: any) => id != null) as string[]
        }

        // 构建查询参数
        const queryParams: any = {
          balance_manager_id: spotBalanceManagerId
        }

        // 如果有 margin manager IDs，添加 balance_manager_owners 参数（逗号分割）
        if (marginManagerIds.length > 0) {
          queryParams.balance_manager_owners = marginManagerIds.join(',')
        }

        // 单个池子场景：添加 pool_id
        if (params?.poolId) {
          queryParams.pool_id = params.poolId
        }

        // 调用新的统一 API
        const res = await fetchByApi(DeepBookCountAllPath, 'GET', queryParams)

        // 处理返回数据
        if (res?.count_map) {
          const {
            // order_open_spot_count = 0,
            // order_open_margin_count = 0,
            // order_open_count = 0,
            order_his_spot_count = 0,
            order_his_margin_count = 0,
            // order_his_count = 0,
            trade_his_spot_count = 0,
            trade_his_margin_count = 0
            // trade_his_count = 0
          } = res.count_map

          // 更新 spot 和 margin 的分别计数
          // setShowOpenOrdersNumSpot(order_open_spot_count)
          // setShowOpenOrdersNumMargin(order_open_margin_count)
          setShowDeepBookOrderHistoryNumSpot(order_his_spot_count)
          setShowDeepBookOrderHistoryNumMargin(order_his_margin_count)
          setShowDeepBookTradeHistoryNumSpot(trade_his_spot_count)
          setShowDeepBookTradeHistoryNumMargin(trade_his_margin_count)

          // 为了向后兼容，也设置旧的计数字段（使用当前 orderTab 的值）
          if (orderTab === 'margin') {
            setShowDeepBookOrderHistoryNum(order_his_margin_count)
            setShowDeepBookTradeHistoryNum(trade_his_margin_count)
          } else {
            setShowDeepBookOrderHistoryNum(order_his_spot_count)
            setShowDeepBookTradeHistoryNum(trade_his_spot_count)
          }
        } else {
          // 如果没有返回数据，重置所有计数为 0
          // setShowOpenOrdersNumSpot(0)
          // setShowOpenOrdersNumMargin(0)
          setShowDeepBookOrderHistoryNumSpot(0)
          setShowDeepBookOrderHistoryNumMargin(0)
          setShowDeepBookTradeHistoryNumSpot(0)
          setShowDeepBookTradeHistoryNumMargin(0)
          setShowDeepBookOrderHistoryNum(0)
          setShowDeepBookTradeHistoryNum(0)
        }
      } catch (error) {
        console.error('🚀🚀🚀 ~ useGetDeepBookCount ~ error:', error)
        // 出错时重置所有计数为 0
        // setShowOpenOrdersNumSpot(0)
        // setShowOpenOrdersNumMargin(0)
        setShowDeepBookOrderHistoryNumSpot(0)
        setShowDeepBookOrderHistoryNumMargin(0)
        setShowDeepBookTradeHistoryNumSpot(0)
        setShowDeepBookTradeHistoryNumMargin(0)
        setShowDeepBookOrderHistoryNum(0)
        setShowDeepBookTradeHistoryNum(0)
      }
    },
    [
      currentAccount?.address,
      getCurrentBalanceManagerInfo,
      // setShowOpenOrdersNumSpot,
      // setShowOpenOrdersNumMargin,
      setShowDeepBookOrderHistoryNumSpot,
      setShowDeepBookOrderHistoryNumMargin,
      setShowDeepBookTradeHistoryNumSpot,
      setShowDeepBookTradeHistoryNumMargin,
      setShowDeepBookOrderHistoryNum,
      setShowDeepBookTradeHistoryNum,
      fetchByApi,
      marginManagerByAccount,
      orderTab
    ]
  )

  return { getDeepBookCount }
}
