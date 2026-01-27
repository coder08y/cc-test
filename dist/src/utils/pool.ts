import { SupportedTickSpacings } from '@/constant/pool'
import { suiPriorityConfigs } from '@/constant/sui-priority'
import { PoolPercent } from '@/types'
import { d, fixRounding, formatNumberWithDown } from '@cetus/utils'
import { TickUtil, fixCoinType } from '@cetusprotocol/common-sdk'

export function getPoolDirection(coinTypeA: string, coinTypeB: string): boolean {
  const coinAWeight = suiPriorityConfigs[coinTypeA]
  const coinBWeight = suiPriorityConfigs[coinTypeB]

  if (coinAWeight === undefined && coinBWeight === undefined) {
    return true
  }

  if (coinAWeight !== undefined && coinBWeight === undefined) {
    return false
  }

  if (coinAWeight === undefined && coinBWeight !== undefined) {
    return true
  }

  // 权重越小，越靠前
  return coinAWeight < coinBWeight
}

// 计算coinA,coinB占比
export const calcCoinProportion = (amountA: string | number, amountB: string | number, currentPrice: string, isFullRange: boolean): PoolPercent => {
  if (isFullRange) {
    return {
      percentA: '50',
      percentB: '50'
    }
  }
  const isAmountAZero = d(amountA).eq(0)
  const isAmountBZero = d(amountB).eq(0)
  if (isAmountAZero && !isAmountBZero) {
    return {
      percentA: '0',
      percentB: '100'
    }
  }
  if (!isAmountAZero && isAmountBZero) {
    return {
      percentA: '100',
      percentB: '0'
    }
  }
  const isCurrentPriceZero = d(currentPrice || '0').eq(0)
  if ((isAmountAZero && isAmountBZero) || isCurrentPriceZero) {
    return {
      percentA: '0',
      percentB: '0'
    }
  }

  const totalAmount = d(amountB).plus(d(amountA).mul(currentPrice))
  const originPercentB = d(amountB).div(totalAmount).mul(100)
  const originPercentA = d(100).sub(originPercentB)
  const percentA = originPercentA.lt(0.01) && originPercentA.gt(0) ? '<0.01' : fixRounding(originPercentA.toString(), 2)
  const percentB = originPercentB.lt(0.01) && originPercentB.gt(0) ? '<0.01' : fixRounding(originPercentB.toString(), 2)
  return {
    percentA,
    percentB
  }
}

// 格式化请求池子列表时的cointype参数
export const formatCoinTypesParams = (coinTypes: string | undefined) => {
  if (!coinTypes) return ''
  const coinTypeArr = coinTypes?.split(',')
  const result = coinTypeArr?.map((item: string) => fixCoinType(item, false))?.join(',')
  return result
}

// 获取反向价格
export const getReversePrice = (price: string) => {
  if (price === '∞') return ''
  const reversePrice = price === '0' || !price ? '∞' : price === '∞' ? '0' : d(1).div(price).toString()
  return reversePrice
}

export const getDisplayPrice = (price: string) => {
  return price === '∞' ? '∞' : formatNumberWithDown(price, 6)
}

export const getDisplayReversePrice = (price: string) => {
  return getDisplayPrice(getReversePrice(price))
}

export const checkIsMinOrMaxIndex = (index: number, type: 'min' | 'max') => {
  for (let i = 0; i < SupportedTickSpacings.length; i++) {
    const item = SupportedTickSpacings[i]
    if (type === 'min') {
      if (index == TickUtil.getMinIndex(item)) {
        return true
      }
    } else {
      if (index == TickUtil.getMaxIndex(item)) {
        return true
      }
    }
  }
  return false
}

export const checkFullRange = (lowerTick: number, upperTick: number) => {
  const isMinTick = checkIsMinOrMaxIndex(lowerTick, 'min')
  const isMaxTick = checkIsMinOrMaxIndex(upperTick, 'max')
  if (isMinTick && isMaxTick) return true
  return false
}
