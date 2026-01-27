import { FrozenPools } from '@/constant/pool'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { PosBaseInfo } from '@/types'
import { useSdk } from '@cetus/sdk-factory'
import useGetPosInfoList from './useGetPosInfoList'
import useGetPositionVesting from './useGetPosVesting'
import usePositionList from './usePositionList'
import useWrapPosData from './useWrapPosData'

export default function useCurrentPos() {
  const clmmSdk = useSdk('clmm')

  const { posBaseList, setCurrentPosBaseInfo, setCurrentPosBaseInfoLoading } = usePositionStore()
  const { setCurPosHistoryList, setIsPosHistoryLoading } = usePositionDetailStore()
  const { buildPosBaseInfo } = useWrapPosData()
  const { getPosRelatedData } = usePositionList()
  const { getVestingList } = useGetPositionVesting()
  const { getPositionInfoList } = useGetPosInfoList()

  const getCurrentPosBaseInfo = async (account: string, id: string, isForceRefresh: boolean = false) => {
    console.log('🚀 ~ getCurrentPosBaseInfo ~ id:', id)
    setCurrentPosBaseInfoLoading(true)

    const posBaseInfoFrom = posBaseList.find((item: PosBaseInfo) => item.id === id)
    let posInfo: PosBaseInfo | null
    if (posBaseInfoFrom && !isForceRefresh) {
      posInfo = posBaseInfoFrom
    } else {
      posInfo = await getCurrentPosByPosId(account, id)
    }

    console.log('getCurrentPosBaseInfo ~ posInfo:', posBaseList, posInfo)
    if (posInfo) {
      posInfo['isFrozen'] = FrozenPools.includes(posInfo!.clmmPool)
    }

    setCurrentPosBaseInfo(posInfo)

    if (posInfo) {
      getPosRelatedData([posInfo])
    }
  }

  const getCurrentPosByPosId = async (account: string, id: string) => {
    const ownerRes = await clmmSdk!.FullClient.getOwnedObjectsByPage(account, {
      options: { showType: true, showContent: true, showOwner: true },
      filter: {
        ObjectId: id
      }
    })

    if (ownerRes && ownerRes.data && ownerRes.data.length > 0) {
      let posRes = await buildPosBaseInfo(ownerRes.data[0])
      if (posRes?.posId) {
        const vestingList = await getVestingList([posRes])
        console.log('🚀 ~ getCurrentPosByPosId ~ vestingList:', vestingList)
        if (vestingList?.length > 0) {
          const list = await getPositionInfoList([posRes], vestingList)
          console.log('🚀 ~ getCurrentPosByPosId ~ list:', list)

          if (list?.length > 0) {
            posRes = list[0]
          }
        }

        // const list = await getPositionInfoList([posRes], [], true)
        // console.log('🚀 ~ getCurrentPosByPosId ~ list:', list)

        // if (list?.length > 0) {
        //   posRes = list[0]
        // }
      }

      console.log('🚀 ~ getCurrentPosByPosId ~ posRes:', posRes)
      return posRes
    }
    return null
  }

  const fetchPositionHistory = async (posId: string, originPosId: string) => {
    const rpcList = ['https://mainnet.suiet.app:443', 'https://rpc-mainnet.suiscan.xyz:443']
    for (const rpc of rpcList) {
      try {
        const response = await clmmSdk!.Position.getPositionTransactionList({
          pos_id: posId,
          full_rpc_url: rpc,
          origin_pos_id: originPosId,
          order: 'descending'
        })
        console.log('🚀 ~ getCurrentPosHistory ~ response?.data:', response?.data, rpc)
        if (response?.data?.length > 0) {
          return response.data
        }
      } catch (error) {
        console.error(`Error fetching data from ${rpc}:`, error)
      }
    }
    return []
  }

  const getCurrentPosHistory = async (id: string, posId: string) => {
    // posId为clmm id 也就是原始id（originPosId）
    console.log('🚀 ~ getCurrentPosHistory ~ posId:', id, posId)
    setIsPosHistoryLoading(true)

    const clmmHistory = await fetchPositionHistory(id, posId)
    const otherHistory = id.toLowerCase() !== posId.toLowerCase() ? await fetchPositionHistory(posId, posId) : []

    console.log('🚀 ~ getCurrentPosHistory ~ clmmHistory:', clmmHistory, otherHistory, [...clmmHistory, ...otherHistory])
    const combinedHistory = [...clmmHistory, ...otherHistory]
    const sortedHistory = combinedHistory.sort((a: any, b: any) => b?.timestampMs - a?.timestampMs)

    setCurPosHistoryList(sortedHistory)
    setIsPosHistoryLoading(false)

    console.log('🚀 ~ getCurrentPosHistory ~ result:', sortedHistory)
  }

  const getPoolLiquiditySnapshot = async (pos: PosBaseInfo) => {
    const poolSnaps = await clmmSdk!.Pool.getPoolLiquiditySnapshot(pos.clmmPool)
    console.log('getPoolLiquiditySnapshot poolSnaps: ', poolSnaps)

    const posSnap = await clmmSdk!.Pool.getPositionSnapshot(poolSnaps.snapshots.id, [pos.posId])
    console.log('getPoolLiquiditySnapshot posSnap: ', posSnap)
  }
  return {
    getCurrentPosBaseInfo,
    getCurrentPosHistory,
    getCurrentPosByPosId,
    getPoolLiquiditySnapshot
  }
}
