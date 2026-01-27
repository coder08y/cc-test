import { useFetch } from '@cetus/hooks'
import { Token } from '@cetus/types'
import { useDeepCompareEffect } from 'ahooks'
import { useState } from 'react'

/**
 * token 风险提示检查
 * @returns
 */
export default function useCheckTokenScamsAlert(coinList: Token[]) {
  const { fetchByApi } = useFetch()
  const [scamsCoinList, setScamsCoinList] = useState<Token[]>([])

  const checkIsScamsCoin = async (coinList: Token[]) => {
    const filterCoinList = coinList.filter(coin => !(coin.is_verified === undefined ? coin.is_trusted : coin.is_verified))

    try {
      const coinTypes = filterCoinList.map(coin => coin.coin_type).join(',')
      const { coins } = await fetchByApi(`/router_v3/honey_pot_check?coins=${coinTypes}`, 'GET')
      console.log('🚀🚀🚀 ~ useCheckTokenScamsAlert.ts:23 ~ checkIsScamsCoin ~ coins:', coins)
      if (coins && coins.length > 0) {
        const scamsCoinList = coins.filter(coin => coin.is_honey_pot_scam)
        return scamsCoinList
      }

      return []
    } catch (error) {
      console.log('🚀 ~ file: useCheckTokenScamsAlert.ts:19 ~ checkTokenScams ~ error:', error)
    }

    return []
  }

  useDeepCompareEffect(() => {
    setScamsCoinList([])
    if (coinList.length > 0) {
      checkIsScamsCoin(coinList).then(res => {
        setScamsCoinList(res)
      })
    }
  }, [coinList])

  return {
    scamsCoinList
  }
}
