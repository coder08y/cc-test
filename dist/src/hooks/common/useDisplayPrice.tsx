import { formatNumber } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'

export default function useDisplayPrice(props: { price?: string; changeSide: boolean }) {
  const { price, changeSide } = props
  const displayPrice = useMemo(() => {
    if (price) {
      if (changeSide) {
        return formatNumber(d(1).div(price).toString(), 10, true).toString()
      } else {
        return price
      }
    }
    return undefined
  }, [price, changeSide])

  return {
    displayPrice
  }
}
