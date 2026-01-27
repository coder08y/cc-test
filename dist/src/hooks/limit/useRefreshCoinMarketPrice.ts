import useLimitActionStore from '@/store/limit/useLimitAction'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'

// 刷新token的市场价格
export default function useRefreshCoinMarketPrice() {
  const { payCoin, targetCoin, setRefreshPriceLoading } = useLimitActionStore()
  const { fetchTokenPrices } = useTokenPrice()
  const refreshCoinMarketPrice = () => {
    const list = []
    if (payCoin) {
      list.push(payCoin.coin_type)
    }

    if (targetCoin) {
      list.push(targetCoin.coin_type)
    }

    if (list.length > 0) {
      setRefreshPriceLoading(true)
      fetchTokenPrices(list).finally(() => {
        setRefreshPriceLoading(false)
      })
    }
  }
  return { refreshCoinMarketPrice }
}
