import useDeepBookStore from '@/store/deepbook'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d } from '@cetus/utils'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export default function useGetDeepBookSettleList() {
  const { currentAccount } = useAccountStore()
  const { setDeepBookSettleList, setDeepBookSettleListLoading, getCurrentBalanceManagerInfo, currentDeepBookPool } = useDeepBookStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { deepBookSDK } = usePeripherySDKStore()
  const { getBalanceManagerInfo } = useGetDeepBookManagerBalance()
  const getSettleList = async () => {
    setDeepBookSettleListLoading(true)
    try {
      let deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
      const pools = getRequestPool(currentDeepBookPool)

      if (!deepBookAccount) {
        const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
        if (accounts?.length > 0) {
          deepBookAccount = accounts?.[0]?.balanceManager
        }
      }

      const res = await deepBookSDK.DeepbookUtils.getAccount(deepBookAccount, [pools])
      if (!res) {
        setDeepBookSettleList([])
        setDeepBookSettleListLoading(false)
        return
      }
      // console.log('🚀🚀🚀 ~ useGetDeepBookSettleList.ts:27 ~ getSettleList ~ res:', res)

      const list = res?.map((item: any) => {
        return wrapSettle(item)
      })

      setDeepBookSettleList(list)
      setDeepBookSettleListLoading(false)
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetDeepBookSettleList.ts:58 ~ getSettleList ~ error:', error)
      setDeepBookSettleList([])
      setDeepBookSettleListLoading(false)
    }
  }

  const wrapSettle = (item: any) => {
    const { baseAssets, quoteAssets, address } = currentDeepBookPool
    const baseSettle = d(item?.settled_balances?.base)
      .div(10 ** baseAssets?.decimals)
      .toString()
    const quoteSettle = d(item?.settled_balances?.quote)
      .div(10 ** quoteAssets?.decimals)
      .toString()
    const deepSettle = d(item?.settled_balances?.deep)
      .div(10 ** 6)
      .toString()
    const canClaim = d(baseSettle).gt(0) || d(quoteSettle).gt(0)
    return {
      address,
      baseAssets,
      quoteAssets,
      baseSettle,
      quoteSettle,
      deepSettle,
      canClaim
    }
  }
  return { getSettleList }
}
