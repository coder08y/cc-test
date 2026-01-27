import { POS_HANDLE } from '@/constant/position-handle-mainnet'
import { PosBaseInfo } from '@/types/position'
import { useSdk } from '@cetus/sdk-factory'
import { GetPositionVestOption, PositionVesting } from '@cetusprotocol/sui-clmm-sdk'

export default function useGetPosVesting() {
  const clmmSdk = useSdk('clmm')

  const getPosGroupByPool = (posBaseList: PosBaseInfo[]) => {
    const posGroupByPool: any = {}
    posBaseList.forEach((item: PosBaseInfo) => {
      if (posGroupByPool?.[item?.clmmPool]?.clmm_position_ids?.length > 0) {
        posGroupByPool?.[item?.clmmPool]?.clmm_position_ids.push(item.posId)
      } else {
        posGroupByPool[item?.clmmPool] = {
          clmm_position_ids: [item?.posId],
          clmm_pool_id: item?.clmmPool,
          coin_type_a: item?.coinTypeA,
          coin_type_b: item?.coinTypeB
          // vest_coin_type: clmmSdk?.sdkOptions.clmm_vest?.config?.cetus_coin_type
        }
      }
    })
    return posGroupByPool
  }
  const getVestingList = async (posBaseList: PosBaseInfo[]): Promise<PositionVesting[]> => {
    try {
      console.log('🚀 ~ getVestingList ~ posBaseList:', posBaseList)
      const posGroupByPool: any = getPosGroupByPool(posBaseList)

      console.log('🚀 ~ getVestingList ~ posGroupByPool:', posGroupByPool)

      const list = Object.values(posGroupByPool)

      // toDo: 上线时要去掉
      const vestPools = Object.keys(POS_HANDLE)
      const params = list.filter(item => {
        return vestPools?.includes(item?.clmm_pool_id)
      })
      console.log('🚀🚀🚀 ~ useGetPosVesting.ts:35 ~ getVestingList ~ params:', params)

      if (params?.length > 0) {
        const res = await clmmSdk!.Vest.getPositionVesting(params as GetPositionVestOption[])
        console.log('🚀 ~ getVestingList ~ res:', res)
        return res
      }

      return []
    } catch (error) {
      console.log('🚀 ~ getVestingList ~ error:', error)
      return []
    }
  }

  return {
    getVestingList,
    getPosGroupByPool
  }
}
