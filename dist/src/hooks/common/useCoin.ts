import { Token } from '@cetus/types'
import { useEffect, useState } from 'react'
export function useGetCoin(coinType: string) {
  const [coin, setCoin] = useState<Token | undefined>()
  useEffect(() => {
    const fetchCoin = async () => {
      const { AllTokensTable } = await import('@cetus/utils')

      const allTokens = await AllTokensTable.getAllItems<Token>()
      if (allTokens) {
        const coinKeys = Array.from(allTokens.keys()).filter(key => key === coinType)
        if (coinKeys.length > 0) {
          for (const key of coinKeys) {
            const token = allTokens.get(key)
            if (token?.coin_type === coinType) {
              setCoin(token)
              return
            }
          }
        }
      }
    }
    fetchCoin()
  }, [])

  return coin
}
