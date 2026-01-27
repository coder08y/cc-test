import { useGlobalToast } from '@cetus/design'
import { useAccountBalance } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType, CommonTypeInfo, ToastType } from '@cetus/types'

export default function useInsufficientBalanceToast() {
  const { failedTsToast } = useGlobalToast()
  const { getTokenInfo } = useGetToken()
  const { fetchAccountBalance } = useAccountBalance()

  const fetchToken = async (coinType: string) => {
    if (!coinType) return
    try {
      const coinInfo = await getTokenInfo(coinType as CoinType)
      return coinInfo
    } catch (error) {
      console.error('Error fetching token info:', error)
    }
  }

  const showInsufficientBalanceToast = async (errorInfo: string) => {
    console.log('🚀 ~ showInsufficientBalanceToast ~ errorInfo:', errorInfo.toString())
    const coinType = errorInfo.match(/0x[a-fA-F0-9]+::\w+::\w+/)
    const tokenInfo = coinType ? await fetchToken(coinType[0]) : undefined
    const info: ToastType = {
      linkLabel: '',
      getShowInfo: () => {
        const info: CommonTypeInfo = {
          toastTitleText: tokenInfo ? `Insufficient ${tokenInfo?.symbol} balance` : 'Insufficient balance'
        }
        return info
      }
    }
    if (errorInfo.includes('Insufficient balance')) {
      fetchAccountBalance()
      failedTsToast(info)
    }
  }
  return {
    showInsufficientBalanceToast
  }
}
