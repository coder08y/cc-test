import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import useFavoritePool from '../pool/useFavoritePool'

export default function useGetPosApiPoolData() {
  const { setPosApiPoolData } = usePositionStore()
  const { getFavoritePoolList } = useFavoritePool()

  const getPosApiPoolData = async (positionBaseList: PosBaseInfo[]) => {
    try {
      console.log('🚀 ~ getPosApiPoolData ~ positionBaseList:', positionBaseList)
      const queryPool = Array.from(new Set(positionBaseList?.map(item => item.clmmPool)))
      const params = {
        needLocalData: false,
        pools: queryPool,
        display_all_pools: true,
        no_incentives: true,
        has_mining: true,
        has_farming: true
      }
      console.log('🚀 ~ getPosApiPoolData ~ params:', params)

      const res = (await getFavoritePoolList(params)) || []
      console.log('🚀 ~ getPosApiPoolData ~ res:', res)
      const obj = res?.list.reduce((acc, item) => {
        acc[item.poolAddress] = item // 假设你想要将整个 item 对象作为值
        return acc
      }, {})
      setPosApiPoolData(obj)
    } catch (error) {
      console.log('🚀 ~ getPosApiPoolData ~ error:', error)
    }
  }

  return {
    getPosApiPoolData
  }
}
