import useDlmmGetAllBinWithPool from '@/hooks/dlmm/useDlmmGetAllBinWithPool'
import useDlmmLiquidityStore from '@/store/dlmm'
import { ChartBinItem, MaxBinRangeChartData } from '@/types/dlmm'
import { getMaxBinRangeData } from '@/utils/dlmm'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk, useSdkStore } from '@cetus/sdk-factory'
import { isEmptyObj } from '@cetus/utils'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useState } from 'react'

export default function useDlmmPoolLiquidityDistribution(maxBinsLength?: number, direct?: boolean) {
  const dlmmSdk = useSdk('dlmm')
  const { dlmmApiPoolInfo, currentBinStep, currentPrice, dlmmContractPoolInfo } = useDlmmLiquidityStore()
  const { isInitialized } = useSdkStore()
  const [maxBinRangeData, setMaxBinRangeData] = useState<MaxBinRangeChartData>()
  const { getBinsInfoByPool } = useDlmmGetAllBinWithPool()
  const [poolAllBinObj, setPoolAllBinObj] = useState<Record<string, ChartBinItem>>({})
  const { poolId } = useQueryParams()
  const [isLoading, setIsLoading] = useState(true)

  const { getTokenPrice } = useTokenPrice()

  const tokenAPriceInfo = getTokenPrice(dlmmApiPoolInfo?.tokenA?.coin_type)
  const tokenBPriceInfo = getTokenPrice(dlmmApiPoolInfo?.tokenB?.coin_type)

  useEffect(() => {
    if (isInitialized && dlmmContractPoolInfo?.bin_manager?.bin_manager_handle && dlmmApiPoolInfo?.id === dlmmContractPoolInfo?.id) {
      setIsLoading(true)
      getBinsInfoByPool(
        {
          pool_id: dlmmContractPoolInfo!.id,
          coin_type_a: dlmmContractPoolInfo!.coin_type_a,
          coin_type_b: dlmmContractPoolInfo!.coin_type_b
        },
        dlmmApiPoolInfo?.tokenA?.decimals,
        dlmmApiPoolInfo?.tokenB?.decimals
      )
        .then(res => {
          setPoolAllBinObj(res.allBinObj)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [dlmmApiPoolInfo?.id, isInitialized, dlmmContractPoolInfo?.id])

  useDeepCompareEffect(() => {
    if (
      dlmmContractPoolInfo?.activeId !== undefined &&
      dlmmContractPoolInfo?.id &&
      dlmmApiPoolInfo?.poolId === dlmmContractPoolInfo?.poolAddress &&
      !isEmptyObj(poolAllBinObj)
    ) {
      const list = getMaxBinRangeData({
        activeBin: dlmmContractPoolInfo?.activeId,
        allBins: poolAllBinObj,
        binStep: dlmmContractPoolInfo?.binStep,
        baseToken: dlmmApiPoolInfo?.tokenA,
        quoteToken: dlmmApiPoolInfo?.tokenB,
        maxBinsLength,
        direct: dlmmApiPoolInfo?.isReverse !== direct
      })
      console.log('0829###🚀 ~ useDlmmPoolLiquidityDistribution ~ list:', list)
      setMaxBinRangeData(list)
    }
  }, [dlmmContractPoolInfo?.activeId, dlmmApiPoolInfo, poolAllBinObj, maxBinsLength, direct])

  const activeBin = useMemo(() => {
    return dlmmContractPoolInfo?.activeId
  }, [dlmmContractPoolInfo?.activeId])

  const allBinsLength = useMemo(() => {
    return Object.keys(poolAllBinObj).length
  }, [poolAllBinObj])

  return {
    activeBin,
    maxBinRangeData,
    allBinsLength,
    isLoading,
    tokenAPrice: tokenAPriceInfo?.price,
    tokenBPrice: tokenBPriceInfo?.price
  }
}
