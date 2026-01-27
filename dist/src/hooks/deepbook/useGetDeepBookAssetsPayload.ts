import useDeepBookStore from '@/store/deepbook'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export default function useGetDeepBookAssetsPayload() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { getCurrentBalanceManagerInfo } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { getBalanceManagerInfo } = useGetDeepBookManagerBalance()
  // 存款
  const getDeepBookAssetsDepositPayload = async (poolInfo: any, quantity: string, tokenInfo: any) => {
    const pool = getRequestPool(poolInfo)
    let deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
    if (!deepBookAccount) {
      const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
      if (accounts?.length > 0) {
        deepBookAccount = accounts?.[0]?.balanceManager
      }
    }
    const account = currentAccount?.address as string

    // 判断是 base、quote 还是 DEEP
    const baseCoinType = poolInfo?.baseAssets?.coin_type
    const quoteCoinType = poolInfo?.quoteAssets?.coin_type
    const tokenCoinType = tokenInfo?.coin_type

    let coin: any
    if (tokenCoinType === baseCoinType) {
      coin = pool.baseCoin
    } else if (tokenCoinType === quoteCoinType) {
      coin = pool.quoteCoin
    } else {
      // DEEP 代币（第三种情况）
      coin = {
        coinType: tokenCoinType,
        decimals: tokenInfo?.decimals
      }
    }

    let tx: any = null
    if (deepBookAccount) {
      tx = deepBookSDK.DeepbookUtils.depositIntoManager({
        account,
        balanceManager: deepBookAccount,
        coin,
        amountToDeposit: quantity
      })
    } else {
      tx = deepBookSDK.DeepbookUtils.createAndDepsit({
        account,
        coin,
        amountToDeposit: quantity
      })
    }

    console.log('toDeposit tx:', tx)

    return tx
  }

  // 提取
  const getDeepBookAssetsWithdrawPayload = async (poolInfo: any, quantity: string, tokenInfo: any) => {
    const pool = getRequestPool(poolInfo)
    let deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
    if (!deepBookAccount) {
      const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
      if (accounts?.length > 0) {
        deepBookAccount = accounts?.[0]?.balanceManager
      }
    }
    const account = currentAccount?.address as string

    // 判断是 base、quote 还是 DEEP
    const baseCoinType = poolInfo?.baseAssets?.coin_type
    const quoteCoinType = poolInfo?.quoteAssets?.coin_type
    const tokenCoinType = tokenInfo?.coin_type

    let coin: any
    if (tokenCoinType === baseCoinType) {
      coin = pool.baseCoin
    } else if (tokenCoinType === quoteCoinType) {
      coin = pool.quoteCoin
    } else {
      // DEEP 代币（第三种情况）
      coin = {
        coinType: tokenCoinType,
        decimals: tokenInfo?.decimals
      }
    }

    if (!deepBookAccount) {
      throw new Error('Balance manager not found. Please deposit first.')
    }

    const tx = deepBookSDK.DeepbookUtils.withdrawFromManager({
      account,
      balanceManager: deepBookAccount,
      coin,
      amountToWithdraw: quantity
    })

    return tx
  }

  return {
    getDeepBookAssetsDepositPayload,
    getDeepBookAssetsWithdrawPayload
  }
}
