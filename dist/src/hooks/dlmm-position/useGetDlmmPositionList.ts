import useDlmmPositionStore from '@/store/dlmm-position'
import { useSdk } from '@cetus/sdk-factory'
import usePositionList from '../position/usePositionList'
import useWrapPosData from '../position/useWrapPosData'

export default function useGetDlmmPositionList() {
  const dlmmSdk = useSdk('dlmm')
  const { setDlmmPosBaseListLoading, setDlmmPosBaseList } = useDlmmPositionStore()
  const { wrapDlmmPosBaseInfo } = useWrapPosData()
  const { getPosDlmmRelatedData } = usePositionList()

  const getDlmmPositionBaseList = async (account: string) => {
    console.log('🚀🚀🚀 ~ useGetDlmmPositionList.ts:9 ~ getDlmmPositionBaseList ~ account:', account)
    setDlmmPosBaseListLoading(true)
    try {
      const res = await dlmmSdk?.Position.getOwnerPositionList(account)
      const dlmmPosBaseList: any = []
      for (const item of res as any[]) {
        const info = await wrapDlmmPosBaseInfo(item)
        if (!info?.displayTokenA || !info?.displayTokenB) continue
        if (info) {
          dlmmPosBaseList.push(info)
        }
      }
      setDlmmPosBaseList(dlmmPosBaseList)
      getPosDlmmRelatedData(dlmmPosBaseList)
      console.log('🚀🚀🚀 ~ useGetDlmmPositionList.ts:23 ~ getDlmmPositionBaseList ~ dlmmPosBaseList:', res, dlmmPosBaseList)
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetDlmmPositionList.ts:13 ~ getDlmmPositionBaseList ~ error:', error)
    } finally {
      setDlmmPosBaseListLoading(false)
    }
  }

  return { getDlmmPositionBaseList }
}
