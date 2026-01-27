import useActiveOrdersStore from '@/store/profile/activeOrders'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { getObjectFields, getPackagerConfigs } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { normalizeSuiAddress } from '@mysten/sui/utils'

export function useRefreshCoinPriceInfo() {
  const { getTokenPrice, fetchTokenPrices } = useTokenPrice()

  const refreshCoinPriceInfo = async (coinTypeList: string[], verifyPriceChange: boolean = false, forceFetch: boolean = false) => {
    const notFetchCoinList: Set<string> = new Set()
    if (!forceFetch) {
      // 第一次尝试获取已缓存的价格
      coinTypeList.forEach(coin_type => {
        // 1分钟缓存
        const price = getTokenPrice(coin_type, 60 * 1000)
        if (price) {
          if (verifyPriceChange && !price.price_change) {
            notFetchCoinList.add(coin_type)
          }
        } else {
          notFetchCoinList.add(coin_type)
        }
      })
    }

    console.log('🚀 ~ refreshCoinPriceInfo ~ notFetchCoinList:', {
      notFetchCoinList,
      coinTypeList
    })

    // 如果有未获取到价格的代币，则进行批量获取
    if (notFetchCoinList.size > 0) {
      await fetchTokenPrices(Array.from(notFetchCoinList), true, false)
    }
  }

  return {
    refreshCoinPriceInfo
  }
}

/**
 * 获取订单用户索引器
 */
export function useGetOrderUserIndexer() {
  const { limitUserIndexerObj, setLimitUserIndexerObj, dcaUserIndexerObj, setDcaUserIndexerObj } = useActiveOrdersStore()
  const limitSdk = useSdk('limit')
  const dcaSdk = useSdk('dca')

  /**
   * 获取限价订单用户索引器
   * @param owner
   * @returns
   */
  const getLimitUserIndexer = async (owner: string) => {
    const cacheIndexer = limitUserIndexerObj[owner]
    if (cacheIndexer) {
      return cacheIndexer
    }

    try {
      const tx = new Transaction()
      limitSdk?.LimitOrder.buildGetUserIndexerHandle(owner, tx)
      const res = await limitSdk!.FullClient.devInspectTransactionBlock({ transactionBlock: tx, sender: normalizeSuiAddress('0x0') })
      const useIndexHandle = limitSdk?.LimitOrder.parsedQueryUserIndexerEvent(res)
      if (useIndexHandle) {
        setLimitUserIndexerObj(owner, useIndexHandle)
        return useIndexHandle as string
      }
    } catch (error) {
      console.log('🚀 ~ getLimitUserIndexer ~ error:', error)
      // throw error
    }
    return undefined
  }

  /**
   * 获取DCA订单用户索引器
   * @param owner
   * @returns
   */
  const getDcaUserIndexer = async (owner: string) => {
    const cacheIndexer = dcaUserIndexerObj[owner]
    if (cacheIndexer) {
      return cacheIndexer
    }

    try {
      const { dca } = dcaSdk!.sdkOptions
      const { user_indexer_id } = getPackagerConfigs(dca)
      const res = await dcaSdk!.FullClient.getDynamicFieldObject({
        parentId: user_indexer_id,
        name: {
          type: 'address',
          value: owner
        }
      })

      const useIndexHandle = getObjectFields(res).value.fields.id.id
      if (useIndexHandle) {
        setDcaUserIndexerObj(owner, useIndexHandle)
        return useIndexHandle as string
      }
    } catch (error) {
      console.log('🚀 ~ getDcaUserIndexer ~ error:', error)
      // throw error
    }
    return undefined
  }

  return {
    getLimitUserIndexer,
    getDcaUserIndexer
  }
}
