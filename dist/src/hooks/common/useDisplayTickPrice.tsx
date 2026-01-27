import { formatNumber } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'

export default function useDisplayTickPrice(props: { minPrice?: string; maxPrice?: string; changeSide: boolean }) {
  const { minPrice, maxPrice, changeSide } = props

  const displayMinPrice = useMemo(() => {
    if (minPrice && maxPrice) {
      if (changeSide) {
        if (minPrice === '0') {
          return '0'
        }
        if (minPrice === '∞') {
          return '0'
        }
        return formatNumber(d(1).div(maxPrice).toString(), 10, true).toString()
      } else {
        return minPrice
      }
    }
    return undefined
  }, [minPrice, maxPrice, changeSide])

  const displayMaxPrice = useMemo(() => {
    if (minPrice && maxPrice) {
      if (changeSide) {
        if (maxPrice === '0') {
          return '∞'
        }
        if (maxPrice === '∞') {
          return '∞'
        }
        return formatNumber(d(1).div(minPrice).toString(), 10, true).toString()
      } else {
        return maxPrice
      }
    }
    return undefined
  }, [minPrice, maxPrice, changeSide])

  return {
    displayMinPrice,
    displayMaxPrice
  }
}
