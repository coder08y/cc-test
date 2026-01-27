import useLimitListStore from '@/store/limit/useLimitList'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { CoinType } from '@cetus/types'
import { SuiAddressType, extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { LimitOrder, LimitOrderStatus, LimitOrderUtils } from '@cetusprotocol/limit-sdk'
import { useEffect, useRef } from 'react'
import { useGetDcaOrderList } from '../dca/useGetDcaOrderList'
import useGetMyLimitOrder from '../limit/useGetMyLimitOrder'
import { useGetOrderUserIndexer, useRefreshCoinPriceInfo } from './useProfileHelper'
export function useActiveOrders() {
  const { currentAccount } = useAccountStore()
  const { getTokenListInfo } = useGetToken<CoinType>()
  const { getLimitUserIndexer, getDcaUserIndexer } = useGetOrderUserIndexer()
  const { setOrderListLoading, setMyOrderList } = useLimitListStore()
  const { setDcaOrderListLoading, setDcaActiveOrderList, setDcaPastOrderList } = useActiveOrdersStore()
  const { refreshCoinPriceInfo } = useRefreshCoinPriceInfo()
  const { buildDcaOrderList } = useGetDcaOrderList()

  const limitSdk = useSdk('limit')
  const dcaSdk = useSdk('dca')

  const { formatLimitOrderList } = useGetMyLimitOrder()
  const addressRef = useRef(currentAccount?.address)

  useEffect(() => {
    addressRef.current = currentAccount?.address
  }, [currentAccount?.address])

  /**
   * 获取限价订单ID
   */
  const fetchUserLimitOrderIds = async () => {
    if (currentAccount) {
      setOrderListLoading(true)
      const indexer = await getLimitUserIndexer(currentAccount.address)
      console.log('🚀 ~ fetchUserLimitOrderIds ~ indexer:', indexer)

      if (indexer) {
        try {
          const res = await limitSdk!.FullClient.getDynamicFieldsByPage(indexer)
          const orderIds = res.data.map(item => item.name.value)
          return orderIds
        } catch (error) {
          console.log('🚀 ~ fetchUserLimitOrderIds ~ error:', error)
        }
      }
    }
    return []
  }

  /**
   * 获取DCA订单ID
   */
  const fetchUserDacOrderIds = async () => {
    if (currentAccount) {
      setDcaOrderListLoading(true)
      const indexer = await getDcaUserIndexer(currentAccount.address)
      console.log('🚀 ~ fetchUserDacOrderIds ~ indexer:', indexer)

      if (indexer) {
        try {
          const res = await dcaSdk!.FullClient.getDynamicFieldsByPage(indexer)
          const orderIds = res.data.map(item => item.name.value)
          return orderIds
        } catch (error) {
          console.log('🚀 ~ fetchUserDacOrderIds ~ error:', error)
        }
      }
    }
    return []
  }

  /**
   * 获取订单列表
   */
  const fetchActiveOrderList = async () => {
    try {
      const limitOrderIds = await fetchUserLimitOrderIds()
      const dcaOrderIds = await fetchUserDacOrderIds()

      // 对订单进行合并请求
      const objectRes = await limitSdk!.FullClient.batchGetObjects([...limitOrderIds, ...dcaOrderIds], {
        showType: true,
        showContent: true
      })

      const orderObjectRes = objectRes.filter(item => item.data?.type?.includes('limit_order::LimitOrder'))
      const dcaObjectRes = objectRes.filter(item => item.data?.type?.includes('order::Order'))

      // 对数据进行初步处理
      const allLimitOrderList = orderObjectRes
        .map(item => LimitOrderUtils.buildLimitOrderInfo(item))
        .filter(info => info !== undefined) as LimitOrder[]
      const filterLimitOrderList = allLimitOrderList.filter(
        item => item.status === LimitOrderStatus.PartialCompleted || item.status === LimitOrderStatus.Running
      )
      const dcaOrderList = dcaObjectRes.map((item: any) => {
        const type = extractStructTagFromType(item.data?.type || '')
        const in_coin_type: SuiAddressType = type.type_arguments[0]
        const out_coin_type: SuiAddressType = type.type_arguments[1]
        return {
          in_coin_type,
          out_coin_type,
          ...item.data?.content?.fields,
          id: item.data?.content?.fields?.id?.id,
          version: item.data?.version
        }
      })

      // 对token信息请求做聚合请求准备
      const coinTypeSet: Set<string> = new Set()

      for (const item of filterLimitOrderList) {
        coinTypeSet.add(item.pay_coin_type)
        coinTypeSet.add(item.target_coin_type)
      }
      for (const item of dcaOrderList) {
        coinTypeSet.add(item.in_coin_type)
        coinTypeSet.add(item.out_coin_type)
      }
      await getTokenListInfo(Array.from(coinTypeSet) as CoinType[])

      // 格式化订单 存入store
      const limitOrderList = await formatLimitOrderList(filterLimitOrderList)
      setMyOrderList(limitOrderList)

      // 格式化DCA订单 存入store
      const { activeResult, pastResult } = await buildDcaOrderList(dcaOrderList)

      if (addressRef.current === currentAccount?.address) {
        setDcaActiveOrderList(activeResult)
        setDcaPastOrderList(pastResult)
        console.log('🚀 ~ fetchActiveOrderList ~ limitOrderList:', limitOrderList)
        console.log('🚀 ~ fetchActiveOrderList ~ dcaOrderList:', dcaOrderList)
      }

      // 异步更新价格
      refreshCoinPriceInfo(Array.from(coinTypeSet) as CoinType[])
    } catch (error) {
      console.log('🚀 ~ fetchActiveOrderList ~ error:', error)
    } finally {
      setOrderListLoading(false)
      setDcaOrderListLoading(false)
    }
  }

  const resetUserData = () => {
    console.log('🚀 ~ resetUserData ~ resetUserData')
    setMyOrderList([])
    setDcaActiveOrderList([])
    setDcaPastOrderList([])
  }

  return { fetchActiveOrderList, resetUserData }
}
