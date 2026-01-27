import { PoolApiInfo } from '@/types'
import { useEffect, useState } from 'react'
import { useGetPoolListByCoinType } from '../common/useGetPoolListByCoinType'

export function useGetTvlTopPool(coinTypeA?: string, coinTypeB?: string) {
  const { getPoolListByCoinType } = useGetPoolListByCoinType(false)
  const [poolLoading, setPoolLoading] = useState<boolean>(false)
  const [topPool, setTopPool] = useState<PoolApiInfo | undefined>(undefined)

  useEffect(() => {
    if (coinTypeA && coinTypeB) {
      setPoolLoading(true)
      getPoolListByCoinType(coinTypeA, coinTypeB)
        .then(poolList => {
          if (poolList.length > 0) {
            setTopPool(poolList[0])
          } else {
            setTopPool(undefined)
          }
        })
        .finally(() => {
          setPoolLoading(false)
        })
    }
  }, [coinTypeA, coinTypeB])

  return {
    poolLoading,
    setPoolLoading,
    topPool
  }
}
