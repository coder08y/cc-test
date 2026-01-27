import { useDebounceValue } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { Decimal, formatNumber } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'
import useGetPythTokenPrice from '../vault-v2/pyth-price/useGetPythTokenPrice'
import { useGetSwapPrice } from './useSwapHelper'

export function usePriceImpact(fromToken?: Token, toToken?: Token, fromValue?: string, toValue?: string, verifyPrice = false, usePyth = false) {
  const { getTokenPrice } = useTokenPrice()
  const { getTokenPriceByPyth } = useGetPythTokenPrice()

  const fromTokenPrice: any = usePyth
    ? getTokenPriceByPyth(fromToken?.coin_type)
    : getTokenPrice(fromToken?.coin_type, verifyPrice ? 10 * 1000 * 60 : undefined)
  const toTokenPrice: any = usePyth
    ? getTokenPriceByPyth(toToken?.coin_type)
    : getTokenPrice(toToken?.coin_type, verifyPrice ? 10 * 1000 * 60 : undefined)

  /**
   * 兑换价格
   */
  const swapPrice = useGetSwapPrice(fromValue, toValue)

  /**
   * 市场价格
   */
  const marketPrice = useMemo(() => {
    if (usePyth) {
      if (fromTokenPrice && toTokenPrice) {
        return d(fromTokenPrice).div(toTokenPrice).toString()
      }
      return undefined
    }
    if (toTokenPrice && fromTokenPrice) {
      return d(fromTokenPrice.price).div(toTokenPrice.price).toString()
    }
    return undefined
  }, [fromTokenPrice?.price, toTokenPrice?.price])

  const debouncedMarketPrice = useDebounceValue(marketPrice ?? '', 300)
  const debouncedSwapPrice = useDebounceValue(swapPrice ?? '', 300)

  /**
   * 价差
   */
  const priceImpact = useMemo(() => {
    if (debouncedMarketPrice && +debouncedSwapPrice) {
      return d(debouncedSwapPrice).sub(debouncedMarketPrice).div(debouncedMarketPrice).mul(100).toFixed(10)
    }

    return undefined
  }, [debouncedMarketPrice, debouncedSwapPrice])

  const priceImpactBasedOnMarket = useMemo(() => {
    if (debouncedMarketPrice && +debouncedSwapPrice) {
      return d(debouncedSwapPrice).sub(debouncedMarketPrice).div(debouncedMarketPrice).mul(100).toFixed(10)
    }
    return undefined
  }, [debouncedMarketPrice, debouncedSwapPrice])

  /**
   * 价格提供源
   */
  const sources = useMemo(() => {
    const list: Set<string> = new Set()
    if (usePyth) {
      return ['pyth']
    }
    if (fromTokenPrice && fromTokenPrice.market !== 'cetus') {
      list.add(fromTokenPrice.market)
    }

    if (toTokenPrice && toTokenPrice.market !== 'cetus') {
      list.add(toTokenPrice.market)
    }

    return Array.from(list)
  }, [fromTokenPrice?.market, toTokenPrice?.market])

  const showIncalculable = useMemo(() => {
    if (!fromTokenPrice || !toTokenPrice) {
      return true
    }
    if (usePyth) {
      return false
    }
    if (fromTokenPrice.market === 'cetus' || toTokenPrice.market === 'cetus') {
      return true
    }
    return false
  }, [fromTokenPrice, toTokenPrice])

  /**
   * 是否展示提示
   */
  const showPriceImpactTips = useMemo(() => {
    if (showIncalculable) {
      return false
    }
    if (priceImpact && d(priceImpact).lt(0)) {
      return d(priceImpact).abs().gt(5)
    }
    return false
  }, [priceImpact])

  /**
   * 是否展示警告
   */
  const showPriceImpactWarn = useMemo(() => {
    if (showIncalculable) {
      return false
    }
    if (priceImpact && d(priceImpact).lt(0)) {
      return d(priceImpact).abs().gt(10)
    }
    return false
  }, [priceImpact, showIncalculable])

  const priceImpactTextInfo = useMemo(() => {
    let priceImpactText = undefined
    let textColor = 'primary_yellow'

    if (showIncalculable) {
      return {
        priceImpactText: 'Incalculable',
        textColor: 'primary_yellow'
      }
    }

    if (priceImpact) {
      // 大于0
      if (d(priceImpact).gt(0)) {
        textColor = 'primary_green'
        // < 0.1%
        if (d(priceImpact).lt(0.1)) {
          priceImpactText = '< 0.1% better than'
        } else {
          // > 0.1%
          priceImpactText = `${formatNumber(priceImpact, 2, true, Decimal.ROUND_UP)}% better than`
        }
      } else if (d(priceImpact).eq(0)) {
        // 等于0
        priceImpactText = '0%'
        textColor = 'primary_green'
      } else {
        // 小于0
        const priceImpactAbs = d(priceImpact).abs()
        if (priceImpactAbs.lte(5)) {
          // [-5%,0%)
          textColor = 'primary_green'
          priceImpactText = `Within ${formatNumber(priceImpactAbs.toString(), 2, true, Decimal.ROUND_UP)}%`
        } else if (priceImpactAbs.lte(10)) {
          // [-10%,-5%)
          textColor = 'primary_yellow'
          priceImpactText = `${formatNumber(priceImpactAbs.toString(), 2, true, Decimal.ROUND_UP)}% away from`
        } else if (priceImpactAbs.lte(100)) {
          // [-100%,-10%)
          textColor = 'primary_red'
          priceImpactText = `${formatNumber(priceImpactAbs.toString(), 2, true, Decimal.ROUND_UP)}% away from`
        } else {
          // < -100%
          textColor = 'primary_red'
          priceImpactText = `> 100% away from`
        }
      }
    }
    return {
      priceImpactText,
      textColor
    }
  }, [priceImpact, showIncalculable])

  return {
    swapPrice,
    marketPrice,
    priceImpact,
    sources,
    showPriceImpactTips,
    showPriceImpactWarn,
    priceImpactTextInfo,
    priceImpactBasedOnMarket,
    showIncalculable
  }
}
