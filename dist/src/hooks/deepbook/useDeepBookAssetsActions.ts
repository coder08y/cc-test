import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import { useAccountBalance } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { d } from '@cetus/utils'
import useTransaction from '../common/useTransaction'
import useGetDeepBookAssetsPayload from './useGetDeepBookAssetsPayload'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'

export default function useDeepBookAssetsActions() {
  const { currentDeepBookPool, setDepositAssetsLoading, setWithdrawAssetsLoading, getCurrentBalanceManagerInfo } = useDeepBookStore()
  const { getDeepBookAssetsDepositPayload, getDeepBookAssetsWithdrawPayload } = useGetDeepBookAssetsPayload()
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { getManagerBalance } = useGetDeepBookManagerBalance()
  const { currentAccount } = useAccountStore()

  const deposit = async (amount: string, isBaseAsset: boolean, tokenInfo?: any) => {
    try {
      setDepositAssetsLoading(true)
      // 如果没有传入 tokenInfo，使用 isBaseAsset 判断
      const currentTokenInfo = tokenInfo || (isBaseAsset ? currentDeepBookPool?.baseAssets : currentDeepBookPool?.quoteAssets)
      const quantity = d(amount)
        .mul(d(Math.pow(10, currentTokenInfo?.decimals)))
        .toString()

      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = `Deposit ${amount} ${currentTokenInfo?.symbol}`
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = `Deposit ${amount} ${currentTokenInfo?.symbol}`
            info.modalDescriptionText = `Deposit ${amount} ${currentTokenInfo?.symbol}`
            info.toastTitleText = `Deposit successful`
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)
      const tx = await getDeepBookAssetsDepositPayload(currentDeepBookPool, quantity, currentTokenInfo)
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      console.log('🚀🚀🚀 ~ useTradeCard.ts:135 ~ placeMarketOrder ~ res:', res)
      if (res) {
        // 重新拿数据
        fetchAccountBalance()
        const coinsToRefresh = [
          { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
          { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals }
        ]
        // 如果存入的是 DEEP 代币（第三种情况），也需要刷新 DEEP 代币余额
        if (
          currentTokenInfo?.coin_type &&
          currentTokenInfo?.coin_type !== currentDeepBookPool?.baseAssets?.coin_type &&
          currentTokenInfo?.coin_type !== currentDeepBookPool?.quoteAssets?.coin_type
        ) {
          coinsToRefresh.push({
            coin_type: currentTokenInfo.coin_type,
            decimals: currentTokenInfo.decimals
          })
        }
        getManagerBalance(
          coinsToRefresh,
          currentAccount?.address as string,
          getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
        )
      }
      setTimeout(() => {
        setDepositAssetsLoading(false)
      }, 2000)
    } catch (error) {
      console.log('🚀🚀🚀 ~ useDeepBookAssetsActions.ts:70 ~ deposit ~ error:', error)
      setDepositAssetsLoading(false)
    }
  }

  const withdraw = async (amount: string, isBaseAsset: boolean, tokenInfo?: any) => {
    try {
      setWithdrawAssetsLoading(true)
      // 如果没有传入 tokenInfo，使用 isBaseAsset 判断
      const currentTokenInfo = tokenInfo || (isBaseAsset ? currentDeepBookPool?.baseAssets : currentDeepBookPool?.quoteAssets)
      console.log('🚀🚀🚀 ~ useDeepBookAssetsActions.ts:80 ~ withdraw ~ tokenInfo:', currentTokenInfo)
      const quantity = d(amount)
        .mul(d(Math.pow(10, currentTokenInfo?.decimals)))
        .toString()

      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = `Withdraw ${amount} ${currentTokenInfo?.symbol}`
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = 'Withdraw successful'
            info.modalDescriptionText = `Withdraw ${amount} ${currentTokenInfo?.symbol}`
            info.toastTitleText = `Withdraw ${amount} ${currentTokenInfo?.symbol}`
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)
      console.log('🚀🚀🚀 ~ useDeepBookAssetsActions.ts:100 ~ withdraw ~ currentDeepBookPool:', {
        currentDeepBookPool,
        quantity,
        tokenInfo: currentTokenInfo
      })
      const tx = await getDeepBookAssetsWithdrawPayload(currentDeepBookPool, quantity, currentTokenInfo)
      console.log('🚀🚀🚀 ~ useDeepBookAssetsActions.ts:101 ~ withdraw ~ tx:', tx)
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      console.log('🚀🚀🚀 ~ useTradeCard.ts:135 ~ placeMarketOrder ~ res:', res)
      if (res) {
        // 重新拿数据
        fetchAccountBalance()
        const coinsToRefresh = [
          { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
          { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals }
        ]
        // 如果提现的是 DEEP 代币（第三种情况），也需要刷新 DEEP 代币余额
        if (
          currentTokenInfo?.coin_type &&
          currentTokenInfo?.coin_type !== currentDeepBookPool?.baseAssets?.coin_type &&
          currentTokenInfo?.coin_type !== currentDeepBookPool?.quoteAssets?.coin_type
        ) {
          coinsToRefresh.push({
            coin_type: currentTokenInfo.coin_type,
            decimals: currentTokenInfo.decimals
          })
        }
        getManagerBalance(
          coinsToRefresh,
          currentAccount?.address as string,
          getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
        )
      }
      setTimeout(() => {
        setWithdrawAssetsLoading(false)
      }, 2000)
    } catch (error) {
      console.log('🚀🚀🚀 ~ useDeepBookAssetsActions.ts:131 ~ withdraw ~ error:', error)
      setWithdrawAssetsLoading(false)
    }
  }

  return {
    deposit,
    withdraw
  }
}
