import { StatsPoolsPath } from '@/apis/path'
import usePoolsStore from '@/store/pool'
import { useGlobalToast } from '@cetus/design'
import { useFetch } from '@cetus/hooks'
import { CommonTypeInfo, ToastType } from '@cetus/types'
import { GetPoolListParams } from './type'
import useGetPoolList from './useGetPoolList'
import useWrapPoolData from './useWrapPoolData'

export interface GetFavoritePoolListProps extends GetPoolListParams {
  pools?: string[]
  needLocalData?: boolean
}
export default function useFavoritePool() {
  const { fetchByApi } = useFetch()
  const { getLocalJsonPoolList, wrapGetPoolParams } = useGetPoolList()
  const { wrapPoolDataV2 } = useWrapPoolData()
  const { poolFavoriteIds, setPoolFavoriteId, setPoolFavoriteIds, setPoolFavoriteIdsChange } = usePoolsStore()
  const { successTsToast, failedTsToast } = useGlobalToast()
  const addFavorites = (id: string) => {
    const info: ToastType = {
      linkLabel: '',
      getShowInfo: () => {
        const info: CommonTypeInfo = {
          toastTitleText: poolFavoriteIds.length >= 100 ? 'Watchlist exceeds the maximum limit' : 'Added to Watchlist'
        }
        return info
      }
    }
    if (poolFavoriteIds.length >= 100) {
      failedTsToast(info)
    } else {
      setPoolFavoriteId(id)
      setPoolFavoriteIdsChange(true)
      successTsToast(info)
    }
  }

  const removeFavorites = (id: string) => {
    const newList = poolFavoriteIds?.filter((item: string) => item !== id)
    setPoolFavoriteIds(newList)
    setPoolFavoriteIdsChange(true)
    const info: ToastType = {
      linkLabel: '',
      getShowInfo: () => {
        const info: CommonTypeInfo = {
          toastTitleText: 'Removed from Watchlist'
        }
        return info
      }
    }
    successTsToast(info)
  }
  const getFavoritePoolList = async (params: GetFavoritePoolListProps) => {
    // toDo: 请求后端新接口，传入收藏列表，返回池子列表, 最终数据要包装的和poolList一样
    const { needLocalData = true } = params
    const pools = params?.pools || []
    const warapApiParams = wrapGetPoolParams(params)
    if (pools.length > 0) {
      try {
        const res = await fetchByApi(StatsPoolsPath, 'POST', warapApiParams)
        if (res?.data) {
          console.log('🚀 ~ getFavoritePoolList ~ res?.data:', res?.data)
          const poolList = res?.data?.list?.map((item: any) => {
            return wrapPoolDataV2(item)
          })
          return {
            list: poolList,
            total: res?.data?.total
          }
        }
      } catch (error) {
        console.log('🚀 ~ getFavoritePoolList ~ error:', error)
        if (needLocalData) {
          return await getLocalJsonPoolList(params)
        }
      }
    }
    return {
      list: [],
      total: 0
    }
  }
  return {
    addFavorites,
    removeFavorites,
    getFavoritePoolList
  }
}
