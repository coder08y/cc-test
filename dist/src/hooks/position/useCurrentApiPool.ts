import { useMemo } from 'react'

export default function useCurrentApiPool(currentPosBaseInfo: any, posApiPoolData: any) {
  const currentApiPoolInfo = useMemo(() => {
    if (currentPosBaseInfo?.clmmPool) {
      return posApiPoolData?.[currentPosBaseInfo?.clmmPool]
    }
    return undefined
  }, [currentPosBaseInfo?.clmmPool, posApiPoolData])

  return {
    currentApiPoolInfo
  }
}
