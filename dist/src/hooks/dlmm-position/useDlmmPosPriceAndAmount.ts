import useDlmmPositionStore from '@/store/dlmm-position'
import { useEffect, useMemo, useState } from 'react'

export default function useDlmmPosPriceAndAmount() {
  const { dlmmCurrentPosBaseInfo, dlmmPosLiquidityData, dlmmPosPoolsOriginalData, dlmmPosPoolsRelatedData } = useDlmmPositionStore()

  const currentPosPoolsRelatedData = useMemo(() => {
    return dlmmPosPoolsRelatedData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmPosPoolsRelatedData])

  const currentPosLiquidityData = useMemo(() => {
    return dlmmPosLiquidityData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosLiquidityData])

  const isReverse = useMemo(() => {
    return dlmmCurrentPosBaseInfo.isReverse
  }, [dlmmCurrentPosBaseInfo])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [tokenBalanceA, setTokenBalanceA] = useState('')
  const [tokenBalanceB, setTokenBalanceB] = useState('')
  const initMinMaxPriceAndAmount = () => {
    setMinPrice(isReverse ? currentPosPoolsRelatedData.minPriceResever : currentPosPoolsRelatedData.minPrice)
    setMaxPrice(isReverse ? currentPosPoolsRelatedData.maxPriceResever : currentPosPoolsRelatedData.maxPrice)
    setTokenBalanceA(currentPosLiquidityData?.displayCoinAmountA)
    setTokenBalanceB(currentPosLiquidityData?.displayCoinAmountB)
  }

  const [isInitPrice, setIsInitPrice] = useState(false)
  useEffect(() => {
    if (currentPosPoolsRelatedData && currentPosLiquidityData && !isInitPrice) {
      initMinMaxPriceAndAmount()
      setIsInitPrice(true)
    }
  }, [currentPosPoolsRelatedData, isReverse, currentPosLiquidityData])
  return { minPrice, maxPrice, tokenBalanceA, tokenBalanceB }
}
