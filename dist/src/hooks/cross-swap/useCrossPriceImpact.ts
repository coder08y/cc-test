import { Decimal, formatNumber } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { useMemo } from 'react'
import { useGetSwapPrice } from '../swap/useSwapHelper'

export function useCrossPriceImpact(
  platform: CrossSwapPlatform,
  fromToken?: CrossSwapToken,
  toToken?: CrossSwapToken,
  fromValue?: string,
  toValue?: string
) {
  const fromTokenPrice = fromToken?.price_usd
  const toTokenPrice = toToken?.price_usd

  /**
   * 兑换价格
   */
  const swapPrice = useGetSwapPrice(fromValue, toValue)

  /**
   * 市场价格
   */
  const marketPrice = useMemo(() => {
    if (toTokenPrice && fromTokenPrice) {
      return d(fromTokenPrice).div(toTokenPrice).toString()
    }
    return undefined
  }, [fromTokenPrice, toTokenPrice])

  /**
   * 价差
   */
  const priceImpact = useMemo(() => {
    if (marketPrice && +swapPrice) {
      return d(swapPrice).sub(marketPrice).div(marketPrice).mul(100).toFixed(10)
    }

    return undefined
  }, [marketPrice, swapPrice])

  const priceImpactBasedOnMarket = useMemo(() => {
    if (marketPrice && +swapPrice) {
      return d(swapPrice).sub(marketPrice).div(marketPrice).mul(100).toFixed(10)
    }
    return undefined
  }, [marketPrice, swapPrice])

  /**
   * 价格提供源
   */
  const sources = useMemo(() => {
    const list: string[] = []
    if (platform === CrossSwapPlatform.MAYAN) {
      list.push('coingecko')
    } else {
      list.push('LI.FI')
    }
    if (fromTokenPrice) {
      // list.push(fromTokenPrice.market)
    }

    // if (toTokenPrice && !list.includes(toTokenPrice.market)) {
    //   list.push(toTokenPrice.market)
    // }

    return list
  }, [fromTokenPrice, toTokenPrice])

  const showIncalculable = useMemo(() => {
    if (!fromTokenPrice || !toTokenPrice) {
      return true
    }
    // if (fromTokenPrice.market === 'cetus' || toTokenPrice.market === 'cetus') {
    //   return true
    // }
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
          priceImpactText = platform === CrossSwapPlatform.LI_FI ? '< 0.1% better than Market' : '< 0.1% better than'
        } else {
          // > 0.1%
          priceImpactText =
            platform === CrossSwapPlatform.LI_FI
              ? `${formatNumber(priceImpact, 2, true, Decimal.ROUND_UP)}% better than Market`
              : `${formatNumber(priceImpact, 2, true, Decimal.ROUND_UP)}% better than`
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
          priceImpactText =
            platform === CrossSwapPlatform.LI_FI
              ? `${formatNumber(priceImpactAbs.toString(), 2, true, Decimal.ROUND_UP)}% away from Market`
              : `${formatNumber(priceImpactAbs.toString(), 2, true, Decimal.ROUND_UP)}% away from`
        } else if (priceImpactAbs.lte(100)) {
          // [-100%,-10%)
          textColor = 'primary_red'
          priceImpactText =
            platform === CrossSwapPlatform.LI_FI
              ? `${formatNumber(priceImpactAbs.toString(), 2, true, Decimal.ROUND_UP)}% away from Market`
              : `${formatNumber(priceImpactAbs.toString(), 2, true, Decimal.ROUND_UP)}% away from`
        } else {
          // < -100%
          textColor = 'primary_red'
          priceImpactText = platform === CrossSwapPlatform.LI_FI ? `> 100% better than Market` : `> 100% away from`
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
