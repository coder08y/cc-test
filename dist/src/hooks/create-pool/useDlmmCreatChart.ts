import useCreateDlmmPoolStore from '@/store/pool/createDlmmPool'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import { ChartBinItem, CurrentBinChartData, MaxBinRangeChartData } from '@/types/dlmm'
import { defaultBinsNum, formatBinList, formatPriceFromBin, getRelatedDisplayPrice } from '@/utils/dlmm'
import { d, formatPrice } from '@cetus/utils'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { useCallback, useEffect, useState } from 'react'

export default function useDlmmCreatChart(direct: boolean) {
  const { activeId, createBinInfos, binStep, setMinPriceData, setMaxPriceData, minPriceData, maxPriceData } = useCreateDlmmPoolStore()
  const { baseToken, quoteToken } = useCreatePoolStore()
  const [currentLiquidityBins, setCurrentLiquidityBins] = useState<CurrentBinChartData>()
  const [maxBinRangeData, setMaxBinRangeData] = useState<MaxBinRangeChartData>()

  // const getMaxBinRangeData = useCallback(({activeBin, binStep, baseDecimal, quoteDecimal, direct = true, minBin, maxBin}: {activeBin: number; binStep: number; baseDecimal: number; quoteDecimal: number; direct: boolean; minBin: number; maxBin: number}) => {
  //   let i = activeBin
  //   const list: ChartBinItem[] = []

  //   const minBinNum = minBin !== undefined && activeBin - minBin > 34 ? minBin : activeBin - 34
  //   while (i >= minBinNum) {
  //     const price = formatPriceFromBin(i, binStep, baseDecimal, quoteDecimal)
  //     list.push({
  //       amount_a: '0',
  //       amount_b: '0',
  //       bin_id: i,
  //       liquidity: '100',
  //       price: formatPrice(direct ? price : d(1).div(price).toString(), 6),
  //       price_per_lamport: ''
  //     })
  //     i--
  //   }

  //   let j = activeBin
  //   const maxBinNum = maxBin !== undefined && maxBin - activeBin > 34 ? maxBin : activeBin + 34
  //   while (j < maxBinNum) {
  //     j++
  //     const price = formatPriceFromBin(j, binStep, baseDecimal, quoteDecimal)
  //     list.push({
  //       amount_a: '0',
  //       amount_b: '0',
  //       bin_id: j,
  //       liquidity: '100',
  //       price: formatPrice(direct ? price : d(1).div(price).toString(), 6),
  //       price_per_lamport: ''
  //     })
  //   }

  //   const sortList = list.sort((a: ChartBinItem, b: ChartBinItem) => {
  //     const priceA = Number(a.price)
  //     const priceB = Number(b.price)
  //     return priceA - priceB
  //   })
  //   console.log('🚀 ~ getMaxBinRangeData ~ sortList:', sortList)

  //   return {
  //     list: sortList,
  //     max: 100
  //   }
  // }, [])
  const getMaxBinRangeData = useCallback(
    ({
      activeBin,
      binStep,
      baseDecimal,
      quoteDecimal,
      direct = true,
      minBin,
      maxBin
    }: {
      activeBin: number
      binStep: number
      baseDecimal: number
      quoteDecimal: number
      direct: boolean
      minBin: number
      maxBin: number
    }) => {
      const createBinItem = (binId: number): ChartBinItem => {
        const price = formatPriceFromBin(binId, binStep, baseDecimal, quoteDecimal)
        return {
          amount_a: '0',
          amount_b: '0',
          bin_id: binId,
          liquidity: '100',
          price: formatPrice(direct ? price : d(1).div(price).toString(), 6),
          price_per_lamport: ''
        }
      }

      const generateBins = (start: number, end: number, step: number) => {
        const bins: ChartBinItem[] = []
        for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
          bins.push(createBinItem(i))
        }
        return bins
      }

      const half = d(defaultBinsNum).sub(2).div(2).toNumber()

      const minBinNum = minBin !== undefined && activeBin - minBin > half ? minBin : activeBin - half
      const maxBinNum = maxBin !== undefined && maxBin - activeBin > half ? maxBin : activeBin + half

      const lowerBins = generateBins(activeBin, minBinNum, -1)
      const upperBins = generateBins(activeBin + 1, maxBinNum, 1)

      const sortList = [...lowerBins, ...upperBins].sort((a, b) => Number(a.price) - Number(b.price))

      return {
        list: sortList,
        max: 100
      }
    },
    []
  )

  useDeepCompareEffect(() => {
    if (
      createBinInfos &&
      createBinInfos?.bins?.length > 0 &&
      baseToken?.coin_type &&
      quoteToken?.coin_type &&
      activeId !== undefined &&
      binStep?.binStep !== undefined
    ) {
      const list = formatBinList(createBinInfos.bins, baseToken, quoteToken, direct, activeId, binStep?.binStep)
      setCurrentLiquidityBins(list)
    }
  }, [createBinInfos, baseToken?.coin_type, quoteToken?.coin_type, direct, activeId, binStep])

  useEffect(() => {
    if (
      activeId !== undefined &&
      binStep !== undefined &&
      baseToken?.coin_type &&
      quoteToken?.coin_type &&
      minPriceData?.binId !== undefined &&
      maxPriceData?.binId !== undefined
    ) {
      const list = getMaxBinRangeData({
        activeBin: Number(activeId),
        binStep: binStep.binStep,
        baseDecimal: baseToken.decimals,
        quoteDecimal: quoteToken.decimals,
        direct,
        minBin: minPriceData?.binId,
        maxBin: maxPriceData?.binId
      })

      setMaxBinRangeData(list)
    }
  }, [binStep?.binStep, baseToken?.coin_type, quoteToken?.coin_type, activeId, direct, minPriceData?.binId, maxPriceData?.binId])

  const handleRangeChange = (minBin: number, maxBin: number) => {
    if (
      binStep?.binStep !== undefined &&
      baseToken?.decimals !== undefined &&
      quoteToken?.decimals !== undefined &&
      minBin !== undefined &&
      maxBin !== undefined
    ) {
      const minPrice = BinUtils.getPriceFromBinId(minBin, binStep?.binStep, baseToken?.decimals, quoteToken?.decimals)
      const [displayMinPrice, reverseMinPrice, displayReverseMinPrice] = getRelatedDisplayPrice(minPrice)
      const maxPrice = BinUtils.getPriceFromBinId(maxBin, binStep?.binStep, baseToken?.decimals, quoteToken?.decimals)
      const [displayMaxPrice, reverseMaxPrice, displayReverseMaxPrice] = getRelatedDisplayPrice(maxPrice)

      const minPriceData = {
        binId: minBin,
        price: minPrice,
        displayPrice: displayMinPrice,
        reversePrice: reverseMinPrice,
        displayReversePrice: displayReverseMinPrice,
        type: 'lower'
      }

      const maxPriceData = {
        binId: maxBin,
        price: maxPrice,
        displayPrice: displayMaxPrice,
        reversePrice: reverseMaxPrice,
        displayReversePrice: displayReverseMaxPrice,
        type: 'upper'
      }

      setMinPriceData({ ...minPriceData, type: 'lower' as const })
      setMaxPriceData({ ...maxPriceData, type: 'upper' as const })
    }
  }

  return {
    currentLiquidityBins,
    activeId,
    maxBinRangeData,
    handleRangeChange
  }
}
