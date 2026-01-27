import { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { getRelatedDisplayChartPrice } from '@/utils/dlmm'
import { Token } from '@cetus/types'
import { d } from '@cetusprotocol/common-sdk'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'

export const adjustReferBinId = (minBinId: number, maxBinId: number, inputBinId: number, isInputMin: boolean, referBinId?: number) => {
  if (isInputMin) {
    if (referBinId && inputBinId > referBinId) {
      let _binId = inputBinId + 48
      if (_binId < minBinId) {
        _binId = minBinId
      }
      if (_binId > maxBinId) {
        _binId = maxBinId
      }
      return _binId
    }
  } else {
    if (referBinId && inputBinId < referBinId) {
      let _binId = inputBinId - 48
      if (_binId < minBinId) {
        _binId = minBinId
      }
      if (_binId > maxBinId) {
        _binId = maxBinId
      }
      return _binId
    }
  }
  return referBinId
}

export function useMinMaxBinIdByAmount(isAutoFill: boolean, fromToken?: Token, tokenA?: Token, fromAmount?: string, toAmount?: string) {
  /**
   * 根据numBinsNum和activeId计算最小和最大binId
   * @param numBinsNum
   * @param activeId
   * @returns { minBinId, maxBinId }
   */
  const formatMinMaxBinId = (numBinsNum: number, activeId: number) => {
    if (!fromToken) return
    let minBinId
    let maxBinId
    if (!isAutoFill) {
      const coinAmountA = fromToken?.coin_type === tokenA?.coin_type ? fromAmount : toAmount
      const coinAmountB = fromToken?.coin_type === tokenA?.coin_type ? toAmount : fromAmount

      const isInputAmountA = d(coinAmountA || 0).gt(0)
      const isInputAmountB = d(coinAmountB || 0).gt(0)

      if (isInputAmountA && !isInputAmountB) {
        minBinId = activeId
        maxBinId = minBinId + numBinsNum - 1
        return { minBinId, maxBinId }
      } else if (!isInputAmountA && isInputAmountB) {
        maxBinId = activeId
        minBinId = maxBinId - numBinsNum + 1
        return { minBinId, maxBinId }
      }
    }

    let leftBins: number
    let rightBins: number

    if (numBinsNum % 2 === 1) {
      // 奇数情况：active bin在中间，左右各分配 (numBins-1)/2 个bins
      const half = Math.floor((numBinsNum - 1) / 2)
      leftBins = half
      rightBins = half
    } else {
      // 偶数情况：active bin右偏，左侧比右侧多1个bin
      const half = numBinsNum / 2
      leftBins = half
      rightBins = half - 1
    }

    // 计算最小和最大binId
    minBinId = activeId - leftBins
    maxBinId = activeId + rightBins

    return { minBinId, maxBinId }
  }
  return { formatMinMaxBinId }
}

export function useMinMaxPriceData(tokenA?: Token, tokenB?: Token, binStep?: number) {
  const buildPriceData = (binId: number, isMin: boolean): RangePriceType | undefined => {
    if (!tokenA || !tokenB || !binStep) return
    const price = BinUtils.getPriceFromBinId(binId, binStep, tokenA.decimals, tokenB.decimals)
    const [displayPrice, reversePrice, displayReversePrice] = getRelatedDisplayChartPrice(price)
    return {
      tokenA,
      tokenB,
      binId,
      price,
      displayPrice,
      reversePrice,
      displayReversePrice,
      type: isMin ? 'lower' : 'upper',
      actionSource: 'user',
      triggerFrom: 'input'
    }
  }

  const formatMinMaxPriceData = (minBinId: number, maxBinId: number) => {
    if (!tokenA || !tokenB || !binStep) return

    const minPriceData = buildPriceData(minBinId, true)
    const maxPriceData = buildPriceData(maxBinId, false)

    return { minPriceData, maxPriceData }
  }
  return { formatMinMaxPriceData, buildPriceData }
}
