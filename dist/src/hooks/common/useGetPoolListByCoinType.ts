import useGlobalStore from '@/store/common/global'
import { GetPoolListParams } from '../pool/type'
import useGetPoolList from '../pool/useGetPoolList'

export function useGetPoolListByCoinType(useLocal: boolean = true) {
  const { poolApiMap, setPoolApiMap } = useGlobalStore()
  const { getPoolList, getLocalJsonPoolList, getLocalJsonPoolAddress } = useGetPoolList()

  const getPoolListByCoinType = async (fromCoin: string, toCoin: string) => {
    if (fromCoin && toCoin) {
      const sortedTypes = [fromCoin, toCoin].sort()
      const cacheKey = `${sortedTypes[0]}_${sortedTypes[1]}`
      const cacheValue = poolApiMap[cacheKey]
      if (cacheValue) {
        return cacheValue
      }
      const params: GetPoolListParams = {
        coin_type: `${fromCoin},${toCoin}`,
        display_all_pools: true,
        offset: 0,
        limit: 100,
        order_by: '-tvl',
        no_incentives: true,
        has_farming: true,
        has_mining: true
      }

      let res = useLocal ? await getLocalJsonPoolList(params) : undefined

      if (res === undefined || res.list.length === 0) {
        res = await getPoolList(params)
      }
      const poolApiList = res.list
      if (poolApiList.length > 0) {
        poolApiMap[cacheKey] = poolApiList
        setPoolApiMap(cacheKey, poolApiList)
        return poolApiList
      }
    }

    return []
  }

  const getPoolAddressByCoinType = async (fromCoin: string, toCoin: string) => {
    if (fromCoin && toCoin) {
      const sortedTypes = [fromCoin, toCoin].sort()
      const cacheKey = `${sortedTypes[0]}_${sortedTypes[1]}`
      if (useLocal) {
        const localList = await getLocalJsonPoolAddress(fromCoin, toCoin)

        if (!localList || localList.length === 0) {
          const cacheValue = poolApiMap[cacheKey]
          if (cacheValue) {
            return cacheValue.map(pool => pool.poolAddress)
          }
        } else {
          return localList
        }
      }

      const params: GetPoolListParams = {
        coin_type: `${fromCoin},${toCoin}`,
        display_all_pools: true,
        offset: 0,
        limit: 100,
        order_by: '-tvl',
        no_incentives: true,
        has_farming: true,
        has_mining: true
      }

      const res = await getPoolList(params)
      if (res) {
        const poolApiList = res.list
        if (poolApiList.length > 0) {
          poolApiMap[cacheKey] = poolApiList
          setPoolApiMap(cacheKey, poolApiList)
          return poolApiList.map(pool => pool.poolAddress)
        }
      }
    }

    return []
  }

  return {
    getPoolListByCoinType,
    getPoolAddressByCoinType
  }
}
