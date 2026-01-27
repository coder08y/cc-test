import { usePoolActiveLiquidity } from '@/hooks/clmm/usePoolTickData'
import { PoolContractInfo } from '@/types'
import { useCallback, useMemo } from 'react'

enum FeeAmount {
  LOWEST = '100',
  LOW = '500',
  MEDIUM = '2500',
  HIGH = '10000'
}

interface ChartEntry {
  price: number
  depth: number
}

interface TickProcessed {
  tick: number
  liquidityActive: bigint
  liquidityNet: bigint
  price0: string
}

export default function useDepthChartData({
  contractPoolInfo,
  currencyA,
  currencyB,
  feeAmount
}: {
  contractPoolInfo: PoolContractInfo | undefined
  currencyA: any
  currencyB: any
  feeAmount: FeeAmount
}) {
  const { isLoading, error, data, handleRefresh } = usePoolActiveLiquidity(contractPoolInfo, currencyA, currencyB, feeAmount)
  const formatData = useCallback(() => {
    console.log('🚀 ~ file: useDepthChartData.ts:38 ~ formatData ~ data:', data)
    if (!data || !data?.length) {
      return []
    }

    const newData: ChartEntry[] = []

    for (let i = 0; i < data.length; i++) {
      const t: TickProcessed = data[i]

      const chartEntry = {
        depth: parseFloat(t.liquidityActive.toString()),
        price: parseFloat(t.price0)
      }

      if (chartEntry.depth >= 0) {
        newData.push(chartEntry)
      }
    }

    console.log('🚀 ~ file: useDepthChartData.ts:38 ~ formatData ~ newData:', newData)

    return newData
  }, [data])
  return useMemo(() => {
    return {
      isLoading,
      error,
      formattedData: !isLoading ? formatData() : undefined,
      handleRefresh
    }
  }, [isLoading, error, formatData])
}
