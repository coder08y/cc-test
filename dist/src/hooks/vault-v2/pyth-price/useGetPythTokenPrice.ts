import useVaultsPythPriceStore from '@/store/vaults-v2/useVaultsPythPrice'
import { isAvailableObject, suiAddressShortToLong } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { useCallback, useMemo } from 'react'

export default function useGetPythTokenPrice() {
  const { pythPriceMap } = useVaultsPythPriceStore()
  const priceMap = useMemo(() => {
    return pythPriceMap
  }, [pythPriceMap])

  const getTokenAmountValueByPyth = useCallback(
    (coinType?: string, amount?: string, defaultReturn?: string) => {
      const defReturn = Number(amount) == 0 ? '0' : defaultReturn
      if (amount && coinType && +amount && isAvailableObject(priceMap)) {
        const price = priceMap[suiAddressShortToLong(coinType)]?.price

        if (price) {
          const value = d(amount).mul(price).toString()
          return value
        }
      }

      return defReturn
    },
    [priceMap]
  )

  const getTokenPriceByPyth = useCallback(
    (coinType?: string) => {
      if (coinType && isAvailableObject(priceMap)) {
        return priceMap[suiAddressShortToLong(coinType)]?.price
      }
      return 0
    },
    [priceMap]
  )
  return { getTokenAmountValueByPyth, getTokenPriceByPyth, priceMap }
}
