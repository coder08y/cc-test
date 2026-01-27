import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { DLMMPoolApiInfo } from '@/types'
import { getRelatedDisplayChartPrice } from '@/utils/dlmm'
import { Token } from '@cetus/types'
import { d } from '@cetus/utils'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { useCallback } from 'react'
import useCreatePriceBin from './useCreatePriceBin'

function useInitDlmmPoolPriceRange() {
  const { getDefaultBinPriceAndId } = useCreatePriceBin()
  const { currentBinStep, currentPrice, dlmmApiPoolInfo, dlmmContractPoolInfo } = useDlmmLiquidityStore()
  const { setMaxPriceData, setMinPriceData, maxPriceData, minPriceData } = useAddDlmmLiquidityStore()

  const initPriceRange = useCallback(
    (lower_bin_id: number, upper_bin_id: number, binStep: number, tokenA: Token, tokenB: Token, isUserChange = false) => {
      if (!tokenA || !tokenB || !binStep || lower_bin_id === undefined || upper_bin_id === undefined) return
      const lower_price = BinUtils.getPriceFromBinId(lower_bin_id, binStep, tokenA?.decimals, tokenB?.decimals)
      const upper_price = BinUtils.getPriceFromBinId(upper_bin_id, binStep, tokenA?.decimals, tokenB?.decimals)
      const [displayUpperPrice, reverseUpperPrice, displayReverseUpperPrice] = getRelatedDisplayChartPrice(upper_price)

      setMaxPriceData({
        tokenA: tokenA!,
        tokenB: tokenB!,
        binId: upper_bin_id,
        price: upper_price,
        displayPrice: displayUpperPrice,
        reversePrice: reverseUpperPrice,
        displayReversePrice: displayReverseUpperPrice,
        type: 'upper',
        triggerFrom: 'init',
        actionSource: isUserChange ? 'user' : 'system'
      })

      const [displayLowerPrice, reverseLowerPrice, displayReverseLowerPrice] = getRelatedDisplayChartPrice(lower_price)

      setMinPriceData({
        tokenA: tokenA!,
        tokenB: tokenB!,
        binId: lower_bin_id,
        price: lower_price,
        displayPrice: displayLowerPrice,
        reversePrice: reverseLowerPrice,
        displayReversePrice: displayReverseLowerPrice,
        type: 'lower',
        triggerFrom: 'init',
        actionSource: isUserChange ? 'user' : 'system'
      })
    },
    []
  )

  const handleInitPriceRange = useCallback(
    (poolInfo?: DLMMPoolApiInfo, price?: string, forceRefresh = false) => {
      if (minPriceData !== null && maxPriceData !== null && !forceRefresh) {
        return
      }

      const _binStep = poolInfo?.binStep ?? currentBinStep
      const _price = price ?? currentPrice
      const decimalA = poolInfo?.tokenA?.decimals ?? dlmmApiPoolInfo?.tokenA?.decimals
      const decimalB = poolInfo?.tokenB?.decimals ?? dlmmApiPoolInfo?.tokenB?.decimals
      const activeId = poolInfo?.activeId ?? dlmmContractPoolInfo?.activeId
      const tokenA = poolInfo?.tokenA || dlmmApiPoolInfo?.tokenA
      const tokenB = poolInfo?.tokenB || dlmmApiPoolInfo?.tokenB
      if (_binStep && d(_price).gt(0) && tokenA && tokenB && activeId !== undefined) {
        const { lower_bin_id, upper_bin_id, lower_price, upper_price } = getDefaultBinPriceAndId(_binStep as number, activeId, decimalA, decimalB)

        initPriceRange(lower_bin_id, upper_bin_id, _binStep as number, tokenA!, tokenB!, true)
      }
    },
    [currentBinStep, dlmmApiPoolInfo?.tokenA?.coinType, dlmmApiPoolInfo?.tokenB?.coinType, currentPrice, dlmmContractPoolInfo?.activeId]
  )
  return { handleInitPriceRange, initPriceRange }
}

export default useInitDlmmPoolPriceRange
