import useDlmmPositionStore from '@/store/dlmm-position'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import usePositionList from '../position/usePositionList'
import useWrapPosData from '../position/useWrapPosData'

export default function useGetDlmmCurrentPos() {
  const dlmmSdk = useSdk('dlmm')

  const { dlmmPosBaseList, setCurrentPosBaseInfo, setDlmmCurrentPosBaseInfoLoading } = useDlmmPositionStore()
  const { wrapDlmmPosBaseInfo } = useWrapPosData()
  const { getPosDlmmRelatedData } = usePositionList()

  const getDlmmCurrentPosBaseInfo = async (account: string, id: string, isForceRefresh: boolean = false) => {
    console.log('🚀🚀🚀 ~ useGetDlmmCurrentPos.ts:15 ~ getDlmmCurrentPosBaseInfo ~ getDlmmCurrentPosBaseInfo:', getDlmmCurrentPosBaseInfo)
    setDlmmCurrentPosBaseInfoLoading(true)

    const posBaseInfoFrom = dlmmPosBaseList.find((item: DlmmPosBaseInfo) => item.id === id)
    console.log('🚀🚀🚀 ~ useGetDlmmCurrentPos.ts:19 ~ getDlmmCurrentPosBaseInfo ~ posBaseInfoFrom:', posBaseInfoFrom)
    let posInfo: DlmmPosBaseInfo | null = null
    if (posBaseInfoFrom && !isForceRefresh) {
      posInfo = posBaseInfoFrom
    }

    if (!posInfo || isForceRefresh) {
      posInfo = await getDlmmCurrentPosByPosId(account, id)
    }

    console.log('getCurrentPosBaseInfo ~ posInfo:', dlmmPosBaseList, posInfo)

    setCurrentPosBaseInfo(posInfo)

    if (posInfo) {
      getPosDlmmRelatedData([posInfo])
    }
    return posInfo
  }

  const getDlmmCurrentPosByPosId = async (account: string, id: string) => {
    const ownerRes = await dlmmSdk!.FullClient.getOwnedObjectsByPage(account, {
      options: { showType: true, showContent: true, showOwner: true },
      filter: {
        ObjectId: id
      }
    })

    if (ownerRes && ownerRes.data.length > 0) {
      console.log('🚀🚀🚀 ~ useGetDlmmCurrentPos.ts:45 ~ getDlmmCurrentPosByPosId ~ ownerRes:', ownerRes)
      const posRes: DlmmPosBaseInfo = await wrapDlmmPosBaseInfo(ownerRes.data[0])
      return posRes
    }
    return null
  }

  return {
    getDlmmCurrentPosBaseInfo,
    getDlmmCurrentPosByPosId
  }
}
