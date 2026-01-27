import useDlmmGetAllBinWithPool from '@/hooks/dlmm/useDlmmGetAllBinWithPool'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { ChartBinItem, CurrentBinChartData, MaxBinRangeChartData } from '@/types/dlmm'
import { formatPriceFromBin, getRelatedDisplayPrice } from '@/utils/dlmm'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdkStore } from '@cetus/sdk-factory'
import { Token } from '@cetus/types'
import { bnToAmount, d, isEmptyObj, removeComma } from '@cetus/utils'
import { BinAmount, BinUtils } from '@cetusprotocol/dlmm-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useState } from 'react'

export const getCombineBins = (
  originBins: BinAmount[],
  newBins: BinAmount[],
  baseToken: Token,
  quoteToken: Token,
  currentTab: string,
  binStep?: number,
  activeBin?: number,
  isReverse?: boolean,
  direct?: boolean
) => {
  if (!originBins || originBins?.length === 0 || !binStep || !baseToken || !quoteToken) return []

  const isIncreaseTab = currentTab === 'increase'
  const newBinsList = newBins || []
  const baseDecimal = baseToken?.decimals
  const quoteDecimal = quoteToken?.decimals

  const newBinsObj = Object.fromEntries(
    newBinsList?.map(item => [
      String(item.bin_id),
      {
        ...item,
        isIncrease: isIncreaseTab,
        baseAmount: bnToAmount(item?.amount_a, baseDecimal),
        quoteAmount: bnToAmount(item?.amount_b, quoteDecimal)
      }
    ])
  )

  const noRadius = originBins?.length > 150

  let max = 0

  const createBinData = (item: BinAmount, newBinInfo: BinAmount | undefined, isIncreaseTab: boolean) => {
    const liquidity = d(item?.liquidity).div(Math.pow(10, 10)).toNumber()
    const newBinLiquidity = newBinInfo?.liquidity ? d(newBinInfo.liquidity).div(Math.pow(10, 10)).toNumber() : 0
    const totalLiquidity = isIncreaseTab ? d(liquidity).add(newBinLiquidity).toNumber() : liquidity

    max = Math.max(max, totalLiquidity)

    const price = removeComma(formatPriceFromBin(item?.bin_id, binStep, baseToken?.decimals, quoteToken?.decimals))
    const reversePrice = d(1).div(price).toString()
    const baseAmount = bnToAmount(item?.amount_a, baseDecimal)
    const quoteAmount = bnToAmount(item?.amount_b, quoteDecimal)

    let quantityA, quantityB, newBinQuantityA, newBinQuantityB
    if (item?.bin_id === activeBin) {
      const total = d(baseAmount).mul(price).add(quoteAmount)
      quantityA = d(baseAmount).mul(price).div(total).toString()
      quantityB = d(quoteAmount).div(total).toString()

      const newBinBaseAmount = bnToAmount(newBinInfo?.amount_a, baseDecimal)
      const newBinQuoteAmount = bnToAmount(newBinInfo?.amount_b, quoteDecimal)
      const newBinTotal = d(newBinBaseAmount).mul(price).add(newBinQuoteAmount)

      newBinQuantityA = d(newBinBaseAmount).mul(price).div(newBinTotal).toString()
      newBinQuantityB = d(newBinQuoteAmount).div(newBinTotal).toString()
    }

    const priceDisplay = isReverse ? reversePrice : price

    return {
      ...item,
      liquidity,
      totalLiquidity,
      totalAmountA: isIncreaseTab && newBinInfo?.amount_a ? d(item.amount_a).add(newBinInfo.amount_a).toString() : item.amount_a,
      totalAmountB: isIncreaseTab && newBinInfo?.amount_b ? d(item.amount_b).add(newBinInfo.amount_b).toString() : item.amount_b,
      newBins: {
        ...newBinInfo,
        liquidity: newBinLiquidity,
        ...(item?.bin_id === activeBin && {
          quantityA: newBinQuantityA,
          quantityB: newBinQuantityB
        })
      },
      price: direct ? priceDisplay : d(1).div(priceDisplay).toString(),
      type: currentTab,
      baseSymbol: baseToken?.symbol,
      quoteSymbol: quoteToken?.symbol,
      baseLogo: baseToken?.logo_url,
      quoteLogo: quoteToken?.logo_url,
      baseAmount,
      quoteAmount,
      quantityA,
      quantityB,
      noRadius
    }
  }

  const newList = originBins.map(item => createBinData(item, newBinsObj?.[String(item?.bin_id)], isIncreaseTab))
  // console.log('🚀 ~ getCombineBins ~ newList:', newList)

  if (activeBin !== undefined && binStep !== undefined && newList?.[0]?.bin_id > activeBin) {
    const price = removeComma(formatPriceFromBin(activeBin, binStep, baseDecimal, quoteDecimal))
    const reversePrice = d(1).div(price).toString()
    const priceDisplay = isReverse ? reversePrice : price
    newList.unshift({
      // ...sortList?.[0],
      bin_id: activeBin,
      price: direct || direct === undefined ? priceDisplay : d(1).div(priceDisplay).toString(),
      liquidity: undefined
    })
  }

  if (activeBin !== undefined && binStep !== undefined && newList?.[newList?.length - 1]?.bin_id < activeBin) {
    const price = removeComma(formatPriceFromBin(activeBin, binStep, baseDecimal, quoteDecimal))
    const reversePrice = d(1).div(price).toString()
    const priceDisplay = isReverse ? reversePrice : price
    newList.push({
      // ...sortList?.[sortList?.length - 1],
      bin_id: activeBin,
      price: direct || direct === undefined ? priceDisplay : d(1).div(priceDisplay).toString(),
      liquidity: undefined
    })
  }

  const sortList = newList.sort((a, b) => Number(a?.price) - Number(b?.price)) as any
  let activeBinItem = newList.find(item => item?.bin_id === activeBin)
  return {
    list: sortList,
    max,
    active: activeBinItem
  }
}

export default function useDlmmPosChart(isReverse: boolean, direct = true, poolAllBinObjCallback: (binList: BinAmount[]) => void) {
  const { dlmmCurrentPosBaseInfo, dlmmPosPoolsOriginalData, dlmmPosLiquidityData, posChartRefreshTrigger } = useDlmmPositionStore()
  const [originPosBins, setOriginPosBins] = useState<ChartBinItem[]>([])
  const { isInitialized } = useSdkStore()
  const { binInfos: liquidityInfo, currentPosDetailTab, setMinPriceData, setMaxPriceData, setShowPositionSelectRange } = useDlmmPosDetailStore()

  const [currentLiquidityBins, setCurrentLiquidityBins] = useState<CurrentBinChartData>()
  const [maxBinRangeData, setMaxBinRangeData] = useState<MaxBinRangeChartData>()
  const [maxBinLoading, setMaxBinLoading] = useState<boolean>(false)
  const { getBinsInfoByPool } = useDlmmGetAllBinWithPool()
  const [poolAllBinObj, setPoolAllBinObj] = useState<Record<string, ChartBinItem>>({})

  const { getTokenPrice } = useTokenPrice()

  const tokenAPriceInfo = getTokenPrice(dlmmCurrentPosBaseInfo?.tokenA?.coin_type)
  const tokenBPriceInfo = getTokenPrice(dlmmCurrentPosBaseInfo?.tokenB?.coin_type)

  const currentPosPool = useMemo(() => {
    return dlmmPosPoolsOriginalData?.[dlmmCurrentPosBaseInfo?.dlmmPool]
  }, [dlmmCurrentPosBaseInfo?.dlmmPool, dlmmPosPoolsOriginalData])

  useDeepCompareEffect(() => {
    if (dlmmCurrentPosBaseInfo?.id && dlmmPosLiquidityData?.[dlmmCurrentPosBaseInfo?.id]) {
      const liquidityData = dlmmPosLiquidityData?.[dlmmCurrentPosBaseInfo?.id]?.binInfos
      const list = liquidityData?.bins || []
      setOriginPosBins(list)
    }
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosLiquidityData])

  useDeepCompareEffect(() => {
    if (originPosBins?.length > 0 && dlmmCurrentPosBaseInfo?.id) {
      const res = getCombineBins(
        originPosBins,
        liquidityInfo?.bins,
        dlmmCurrentPosBaseInfo?.tokenA,
        dlmmCurrentPosBaseInfo?.tokenB,
        currentPosDetailTab,
        currentPosPool?.bin_step,
        currentPosPool?.active_id,
        isReverse,
        direct
      )
      setCurrentLiquidityBins(res)
    }
  }, [originPosBins, liquidityInfo?.bins, dlmmCurrentPosBaseInfo, currentPosDetailTab, direct, isReverse, currentPosPool?.active_id])

  useEffect(() => {
    if (isInitialized && currentPosPool?.bin_manager?.bin_manager_handle && currentPosPool?.id === dlmmCurrentPosBaseInfo?.dlmmPool) {
      setMaxBinLoading(true)
      getBinsInfoByPool(
        {
          pool_id: currentPosPool!.id,
          coin_type_a: currentPosPool!.coin_type_a,
          coin_type_b: currentPosPool!.coin_type_b
        },
        dlmmCurrentPosBaseInfo?.tokenA?.decimals,
        dlmmCurrentPosBaseInfo?.tokenB?.decimals
      )
        .then(res => {
          setPoolAllBinObj(res.allBinObj)
          poolAllBinObjCallback(res.binList)
        })
        .finally(() => {
          setMaxBinLoading(false)
        })
    }
  }, [currentPosPool?.id, dlmmCurrentPosBaseInfo?.dlmmPool, isInitialized, posChartRefreshTrigger])

  useDeepCompareEffect(() => {
    if (
      currentPosPool?.active_id !== undefined &&
      currentPosPool?.id &&
      currentPosPool?.id === dlmmCurrentPosBaseInfo?.dlmmPool &&
      !isEmptyObj(poolAllBinObj)
    ) {
      const list: any = []
      const lower = dlmmCurrentPosBaseInfo?.lowerBinId
      console.log('0829 pos test###🚀 ~ useDlmmPosChart ~ lower:', lower)
      const upper = dlmmCurrentPosBaseInfo?.upperBinId
      console.log('0829 pos test###🚀 ~ useDlmmPosChart ~ upper:', upper)
      const binStep = currentPosPool?.binStep
      const baseToken = dlmmCurrentPosBaseInfo?.tokenA
      const quoteToken = dlmmCurrentPosBaseInfo?.tokenB

      let max = 0
      for (let i = lower; i <= upper; i += 1) {
        const item = poolAllBinObj?.[String(i)]
        const price = removeComma(formatPriceFromBin(i, binStep, baseToken?.decimals, quoteToken?.decimals))
        const priceDisplay = isReverse ? d(1).div(price).toString() : price
        const liquidity = d(item?.liquidity || '0')
          .div(Math.pow(10, 10))
          .toNumber()
        list.push({
          amount_a: item?.amount_a || '0',
          amount_b: item?.amount_b || '0',
          bin_id: i,
          liquidity,
          price: direct ? priceDisplay : d(1).div(priceDisplay).toString(),
          priceOrigin: direct ? Number(priceDisplay) : Number(d(1).div(priceDisplay).toString()),
          price_per_lamport: item?.price_per_lamport || '',
          baseSymbol: baseToken?.symbol,
          quoteSymbol: quoteToken?.symbol,
          baseAmount: bnToAmount(item?.amount_a, baseToken?.decimals),
          quoteAmount: bnToAmount(item?.amount_b, quoteToken?.decimals),
          baseLogo: baseToken?.logo_url,
          quoteLogo: quoteToken?.logo_url
        })
        max = Math.max(max, liquidity)
      }

      // console.log('0711useDlmmPosChart###🚀 ~ useDeepCompareEffect ~ list:', list)
      if (list && list?.length === 1) {
        setShowPositionSelectRange(false)
      }

      const sortList = list.sort((a: any, b: any) => Number(a?.priceOrigin) - Number(b?.priceOrigin)) as any

      setMaxBinRangeData({
        list: sortList,
        max
      })
    }
  }, [currentPosPool?.active_id, dlmmCurrentPosBaseInfo?.dlmmPool, poolAllBinObj, direct, isReverse])

  const handleRangeChange = (minBin: number, maxBin: number) => {
    const binStep = currentPosPool?.bin_step
    const baseDecimal = dlmmCurrentPosBaseInfo?.tokenA?.decimals
    const quoteDecimal = dlmmCurrentPosBaseInfo?.tokenB?.decimals
    if (binStep !== undefined && baseDecimal !== undefined && quoteDecimal !== undefined && minBin !== undefined && maxBin !== undefined) {
      const minPrice = BinUtils.getPriceFromBinId(minBin, binStep, baseDecimal, quoteDecimal)
      const [displayMinPrice, reverseMinPrice, displayReverseMinPrice] = getRelatedDisplayPrice(minPrice)
      const maxPrice = BinUtils.getPriceFromBinId(maxBin, binStep, baseDecimal, quoteDecimal)
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
        displayReversePrice: displayReverseMaxPrice
      }

      setMinPriceData(minPriceData)
      setMaxPriceData(maxPriceData)
    }
  }

  const activeBin = useMemo(() => {
    return currentPosPool?.active_id
  }, [currentPosPool?.active_id])

  return {
    currentLiquidityBins,
    activeBin,
    maxBinRangeData,
    handleRangeChange,
    maxBinLoading,
    tokenAPrice: tokenAPriceInfo?.price,
    tokenBPrice: tokenBPriceInfo?.price
  }
}
