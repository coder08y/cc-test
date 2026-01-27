import useCreatePoolStore from '@/store/pool/useCreatePool'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType, Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useCallback, useEffect } from 'react'

export default function useQuoteWhiteTokenList() {
  const { quoteWhiteTokenList, setQuoteWhiteTokenList } = useCreatePoolStore()
  const { getTokenListInfo } = useGetToken()

  useEffect(() => {
    fetchQuoteWhiteTokenList()
  }, [])

  /**
   * 获取创建池子quote list 白名单
   * @returns
   */
  const fetchQuoteWhiteTokenList = async () => {
    const coinTypeList = envConfigs?.create_pool_quote_coin_list?.map(coinType => coinType)
    const tokenMap = await getTokenListInfo(coinTypeList as CoinType[])
    const list = envConfigs.create_pool_quote_coin_list.map(coinType => tokenMap?.get(coinType as CoinType))
    setQuoteWhiteTokenList(list.filter(item => !!item) as Token[])
  }

  const isWhiteQuoteToken = useCallback(
    (coinType?: string) => {
      if (coinType) {
        return quoteWhiteTokenList.find(token => fixCoinType(token.coin_type) === fixCoinType(coinType)) !== undefined
      }

      return false
    },
    [quoteWhiteTokenList]
  )

  return {
    isWhiteQuoteToken,
    quoteWhiteTokenList
  }
}
