import { POS_HANDLE } from '@/constant/position-handle-mainnet'
import { PosBaseInfo } from '@/types'
import { useSdk } from '@cetus/sdk-factory'
import { PositionVesting } from '@cetusprotocol/sui-clmm-sdk'

export default function useGetPosInfoList() {
  const clmmSdk = useSdk('clmm')

  function toCamelCase(str: string) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  }

  function parseObjectKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(parseObjectKeysToCamelCase)
    } else if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj).reduce(
        (acc, [key, value]) => {
          const newKey = toCamelCase(key)
          acc[newKey] = parseObjectKeysToCamelCase(value)
          return acc
        },
        {} as Record<string, any>
      )
    }
    return obj
  }
  // 从positon拿仓位信息（因为nft中裁剪过的仓位的liquidity无变化，但position中的liquitiy有变化）
  const getPositionInfoList = async (posBaseList: PosBaseInfo[], vestingList: PositionVesting[], isFetchAll?: boolean) => {
    try {
      const posBaseObj = Object.fromEntries(posBaseList?.map((item: PosBaseInfo) => [item.posId, item]))
      const vestingObj = Object.fromEntries(vestingList?.map(item => [item.position_id, item]))

      const vestingListWithAddPool = vestingList.map(item => {
        return {
          ...item,
          clmm_pool: posBaseObj?.[item?.position_id]?.clmmPool
        }
      })

      const vestingGroupByPool: any = {}

      // toDo: 临时调整
      if (isFetchAll) {
        for (let i = 0; i < posBaseList?.length; i++) {
          const item = posBaseList[i]
          if (vestingGroupByPool?.[item?.clmmPool]?.position_ids?.length > 0) {
            vestingGroupByPool[item?.clmmPool].position_ids.push(item?.posId)
          } else {
            vestingGroupByPool[item?.clmmPool] = {
              position_ids: [item?.posId],
              position_handle: POS_HANDLE[item?.clmmPool]
            }
          }
        }
      } else {
        for (let i = 0; i < vestingListWithAddPool?.length; i++) {
          const item = vestingListWithAddPool[i]
          if (vestingGroupByPool?.[item?.clmm_pool]?.position_ids?.length > 0) {
            vestingGroupByPool[item?.clmm_pool].position_ids.push(item?.position_id)
          } else {
            vestingGroupByPool[item?.clmm_pool] = {
              position_ids: [item?.position_id],
              position_handle: POS_HANDLE[item?.clmm_pool]
            }
          }
        }
      }

      console.log('🚀 ~ getPositionInfoList ~ vestingGroupByPool:', vestingGroupByPool)
      const params = Object.values(vestingGroupByPool)

      const res = await clmmSdk!.Position.getPositionInfoList(params)
      console.log('🚀 ~ getPositionInfoList ~ res:', res)

      const positionInfoObj = Object.fromEntries(res?.map(item => [item.pos_object_id, item]))
      console.log('🚀 ~ getPositionInfoList ~ positionInfoObj:', positionInfoObj)
      console.log('🚀 ~ getPositionInfoList ~ posBaseList:', posBaseList)

      const newPosBaseList = posBaseList.map(item => {
        if (positionInfoObj?.[item?.posId]) {
          return {
            ...item,
            liquidity: positionInfoObj?.[item?.posId]?.liquidity,
            vestData: parseObjectKeysToCamelCase(vestingObj?.[item?.posId])
          }
        }
        return item
      })
      console.log('🚀 ~ getPositionInfoList ~ newPosBaseList:', newPosBaseList)

      return newPosBaseList
    } catch (error) {
      console.log('🚀 ~ getPositionInfoList ~ error:', error)
      return []
    }
  }
  return {
    getPositionInfoList,
    parseObjectKeysToCamelCase
  }
}
