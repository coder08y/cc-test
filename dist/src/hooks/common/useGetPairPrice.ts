import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'
// 从市场价  计算交易对的价格
export function useGetPairPrice(baseCoinType?: string, quoteCoinType?: string) {
  const { getTokenPrice } = useTokenPrice()

  const basePrice = getTokenPrice(baseCoinType)
  const quotePrice = getTokenPrice(quoteCoinType)

  const priceInfo = useMemo(() => {
    if (basePrice && quotePrice) {
      const price = d(basePrice.price).div(quotePrice.price).toString()
      const displayPrice = price.toString()
      return {
        price,
        displayPrice
      }
    }
    return undefined
  }, [basePrice, quotePrice])

  const getPrice = (baseCoinType?: string, quoteCoinType?: string) => {
    const basePrice = getTokenPrice(baseCoinType)
    const quotePrice = getTokenPrice(quoteCoinType)
    if (basePrice && quotePrice) {
      const price = d(basePrice.price).div(quotePrice.price).toString()
      return price
    }
  }

  return {
    price: priceInfo?.price,
    displayPrice: priceInfo?.displayPrice,
    getPrice
  }
}
