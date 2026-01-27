import useDeepBookStore from '@/store/deepbook'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { useGetCoin } from '../common/useCoin'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookSettleList from './useGetDeepBookSettleList'

export default function useAssetsActionRefresh() {
  const { currentDeepBookPool, balanceManagerList } = useDeepBookStore()
  const { currentAccount } = useAccountStore()

  const deepCoin = useGetCoin('0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP')

  const { getManagerBalance, getAllManagerBalances } = useGetDeepBookManagerBalance()

  const { getSettleList } = useGetDeepBookSettleList()

  const { fetchAccountBalance } = useAccountBalance()

  // 如果是 margin pool，需要刷新 margin balance
  // const { refreshMarginBalances } = useGetDeepBookMarginBalance()

  const currentBalanceManagerInfo = useDeepBookStore((state: any) => {
    const address = currentAccount?.address
    if (!address) return null
    return state.currentBalanceManagerInfoMap[address] || null
  })

  const handleRefresh = async () => {
    if (currentDeepBookPool?.address && currentAccount?.address && deepCoin) {
      // 刷新当前激活账户的余额
      if (currentBalanceManagerInfo?.balanceManager) {
        getManagerBalance(
          [
            { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
            { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
            { coin_type: deepCoin?.coin_type, decimals: deepCoin?.decimals }
          ],
          currentAccount?.address,
          currentBalanceManagerInfo?.balanceManager
        )
      }

      // 如果有多个账户，刷新所有账户的余额
      if (balanceManagerList && balanceManagerList.length > 1) {
        const coins = [
          { coinType: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
          { coinType: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
          { coinType: deepCoin?.coin_type, decimals: deepCoin?.decimals }
        ]
        getAllManagerBalances(balanceManagerList, coins, currentAccount?.address)
      }

      // 刷新 settled balance
      getSettleList()

      // 刷新钱包余额
      fetchAccountBalance()

      // 如果是 margin pool，刷新 margin balance（包括 locked orders）
      // if (currentDeepBookPool?.isMarginPool) {
      //   await refreshMarginBalances()
      // }
    }
  }
  return {
    handleRefresh
  }
}
