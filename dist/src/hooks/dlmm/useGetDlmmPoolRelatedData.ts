import useDlmmLiquidityStore from '@/store/dlmm'
import { textEllipses } from '@cetus/utils'
import { useCallback } from 'react'

function useGetDlmmPoolRelatedData() {
  const { dlmmApiPoolInfo } = useDlmmLiquidityStore()

  const getPerText = useCallback(
    (direct?: boolean) => {
      return direct
        ? `${textEllipses(dlmmApiPoolInfo?.displayTokenB?.symbol, 8)}/${textEllipses(dlmmApiPoolInfo?.displayTokenA?.symbol, 8)}`
        : `${textEllipses(dlmmApiPoolInfo?.displayTokenA?.symbol, 8)}/${textEllipses(dlmmApiPoolInfo?.displayTokenB?.symbol, 8)}`
    },
    [dlmmApiPoolInfo]
  )

  return { getPerText }
}

export default useGetDlmmPoolRelatedData
