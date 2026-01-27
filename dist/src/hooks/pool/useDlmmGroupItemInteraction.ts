import useCommonGlobalStore from '@/store/common/global'
import { DlmmApiPoolGroupItem, DlmmPoolData } from '@/types/dlmm'
import { cancelBubble } from '@cetus/utils'
import { useMemo } from 'react'
function useDlmmGroupItemInteraction({
  data,
  isOpen,
  onOpen,
  goLiquidity,
  pageSize = 10
}: {
  data: DlmmApiPoolGroupItem
  isOpen: boolean
  onOpen: (groupId: string, isOpen: boolean) => void
  goLiquidity: (url: string, poolApiInfo: any) => void
  pageSize?: number
}) {
  const { setBackUrl } = useCommonGlobalStore()
  const allData = data?.list
  const lessData = data?.list?.slice(0, pageSize)

  const onExpand = (e: any) => {
    cancelBubble(e)
    onOpen(data?.id, !!!isOpen)
  }

  const isOnlyOneData = useMemo(() => allData?.length === 1, [allData?.length])

  const onClick = (e: any) => {
    if (isOnlyOneData) {
      setBackUrl('/pools?tab=dlmm_pools')
      goLiquidity(`/dlmm?poolId=${allData?.[0]?.poolId}`, data)
    } else {
      onExpand(e)
    }
  }

  const onPoolItemClick = <T>(value: DlmmPoolData, poolInfo: T) => {
    setBackUrl('/pools?tab=dlmm_pools')
    goLiquidity(`/dlmm?poolId=${value.poolId}`, poolInfo)
  }

  return {
    allData,
    lessData,
    onExpand,
    isOnlyOneData,
    onClick,
    onPoolItemClick
  }
}

export default useDlmmGroupItemInteraction
