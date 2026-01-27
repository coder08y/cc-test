import useDeepBookStore from '@/store/deepbook'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export default function useGetDeepBookClaimSettlePayload() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { getCurrentBalanceManagerInfo, currentDeepBookPool } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { getBalanceManagerInfo } = useGetDeepBookManagerBalance()
  const getClaimSettlePayload = async () => {
    let deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
    if (!deepBookAccount) {
      const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
      if (accounts?.length > 0) {
        deepBookAccount = accounts?.[0]?.balanceManager
      }
    }
    const pool = getRequestPool(currentDeepBookPool)

    return deepBookSDK.DeepbookUtils.withdrawSettledAmounts({
      poolInfo: pool,
      balanceManager: deepBookAccount
    })
  }
  return { getClaimSettlePayload }
}
