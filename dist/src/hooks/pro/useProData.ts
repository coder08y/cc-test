import useProStore from '@/store/pro'
import useGetApiData from './useGetApiData'

export default function useProData() {
  const {
    getCoinDetail,
    getCoinMarketData,
    getCoinBvPrice,
    getCoinAuditCheck,
    getProTokenListInModal,
    getCoinTrades,
    getTopHolders,
    getCoinTransactionBlocks
  } = useGetApiData()
  const { currTradeTab } = useProStore()
  const getCoinRelatedData = (coinType: string, isRefresh?: boolean) => {
    getCoinDetail(coinType)
    getCoinMarketData(coinType)
    // getTopHolders(coinType)
    getCoinBvPrice(coinType)
    getCoinAuditCheck(coinType)
    // getProTokenListInModal('vol_24')
    if (isRefresh) {
      const PAGE_SIZE = 10
      console.log('🚀 ~ getCoinRelatedData ~ currTradeTab:', currTradeTab)
      switch (currTradeTab) {
        case 'Trades':
          getCoinTrades({
            coinType: coinType,
            sender: '',
            type: undefined,
            cursor: '',
            limit: PAGE_SIZE
          })
          return
        case 'Holders':
          getTopHolders(coinType, 1, PAGE_SIZE)
          return
        case 'Transaction Blocks':
          getCoinTransactionBlocks(coinType, '', PAGE_SIZE)
          return
      }
    }
  }

  return {
    getCoinRelatedData
  }
}
