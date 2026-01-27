import { DLMMStatsPoolsPath } from '@/apis/path'
import useDlmmPoolsStore from '@/store/pool/useDlmmPoolStore'
import { useGlobalToast } from '@cetus/design'
import { useFetch } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { CommonTypeInfo, ToastType } from '@cetus/types'
import { GetPoolListParams } from './type'
import useGetDlmmPoolList from './useGetDlmmPoolList'
import useWrapDlmmPoolData from './useWrapDlmmPoolData'
import useWrapPoolData from './useWrapPoolData'
import { wrapGetDlmmPoolParams } from './utils'

export interface GetFavoriteDlmmPoolListProps extends GetPoolListParams {
  pools?: string[]
  needLocalData?: boolean
}
export default function useFavoriteDlmmPool() {
  const { fetchByApi } = useFetch()
  const dlmmSdk = useSdk('dlmm')
  const { getLocalJsonPoolList } = useGetDlmmPoolList()
  const { wrapDLmmPoolData } = useWrapPoolData()
  const { wrapDlmmGroupedPoolData } = useWrapDlmmPoolData()
  const { dlmmPoolFavoriteIds, setDlmmPoolFavoriteId, setDlmmPoolFavoriteIds, setDlmmPoolFavoriteIdsChange } = useDlmmPoolsStore()
  const { successTsToast, failedTsToast } = useGlobalToast()
  const addFavorites = (id: string) => {
    const info: ToastType = {
      linkLabel: '',
      getShowInfo: () => {
        const info: CommonTypeInfo = {
          toastTitleText: dlmmPoolFavoriteIds.length >= 100 ? 'Watchlist exceeds the maximum limit' : 'Added to Watchlist'
        }
        return info
      }
    }
    if (dlmmPoolFavoriteIds.length >= 100) {
      failedTsToast(info)
    } else {
      setDlmmPoolFavoriteId(id)
      setDlmmPoolFavoriteIdsChange(true)
      successTsToast(info)
    }
  }

  const removeFavorites = (id: string) => {
    const newList = dlmmPoolFavoriteIds?.filter((item: string) => item !== id)
    setDlmmPoolFavoriteIds(newList)
    setDlmmPoolFavoriteIdsChange(true)
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
  const getFavoritePoolList = async (params: any) => {
    // toDo: 请求后端新接口，传入收藏列表，返回池子列表, 最终数据要包装的和poolList一样
    const { needLocalData = true } = params
    const pools = params?.pools || []
    const wrapApiParams = wrapGetDlmmPoolParams(params)

    if (pools.length > 0) {
      try {
        const res = await fetchByApi(DLMMStatsPoolsPath, 'POST', wrapApiParams)
        if (res?.data?.list) {
          const poolList = res?.data?.list?.map(item => wrapDLmmPoolData(item))
          return {
            list: poolList?.map(item => ({
              ...item,
              showTokenName: true
            })),
            total: res?.data?.total
          }
        }
      } catch (error) {
        if (needLocalData) {
          const res = await getLocalJsonPoolList(params, false)
          console.log('🚀 ~ getFavoritePoolList ~ localList:', res)
          return {
            list: res.list,
            total: res.total
          }
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
