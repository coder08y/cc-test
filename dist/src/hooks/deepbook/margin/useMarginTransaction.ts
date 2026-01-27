import useTransaction from '@/hooks/common/useTransaction'
import useGlobalStore from '@/store/common/global'
import { useAccountBalance } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { addComma } from '@cetus/utils'
import { Transaction } from '@mysten/sui/transactions'
import { useCallback } from 'react'
import useDeepBookMarginManager from './useDeepBookMarginManager'
import useDeepBookMarginPrices from './useDeepBookMarginPrices'
import useDeepbookMarginDebt from './useDeepbookMarginDebt'
import useGetDeepBookMarginBalance from './useGetDeepBookMarginBalance'

/**
 * Margin 交易执行 Hook
 * 提供通用的交易执行和刷新逻辑
 */
export default function useMarginTransaction() {
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { getMarginManagerByAccount } = useDeepBookMarginManager()
  const { refreshMarginBalances } = useGetDeepBookMarginBalance()
  const { refreshMarginDebt } = useDeepbookMarginDebt()
  const { fetchPrices } = useDeepBookMarginPrices()

  // 刷新数据（交易成功后）
  const refreshDataAfterTransaction = useCallback(async () => {
    console.log('refreshDataAfterTransaction start')

    // 先刷新 margin manager 信息
    await getMarginManagerByAccount()
    console.log('refreshDataAfterTransaction: margin manager refreshed')

    // 等待一小段时间确保 store 更新完成
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 第一次刷新余额、债务和价格
    await Promise.all([fetchAccountBalance(), refreshMarginBalances(), refreshMarginDebt(), fetchPrices()])
    console.log('refreshDataAfterTransaction: first refresh completed')

    // 等待一段时间后再次刷新（确保链上数据已更新）
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 再次刷新 margin manager 信息（确保获取到最新数据）
    await getMarginManagerByAccount()

    // 第二次刷新余额、债务和价格
    await Promise.all([fetchAccountBalance(), refreshMarginBalances(), refreshMarginDebt(), fetchPrices()])
    console.log('refreshDataAfterTransaction: second refresh completed')
  }, [getMarginManagerByAccount, fetchAccountBalance, refreshMarginBalances, refreshMarginDebt, fetchPrices])

  // 构建 toast 信息（用于资产操作：Deposit, Withdraw, Repay）
  const buildToastInfo = useCallback(
    (amount: string, tokenSymbol: string, action: 'Deposit' | 'Withdraw' | 'Repay' = 'Deposit', isInitialize: boolean = false) => {
      const actionText = isInitialize ? 'Initialize & Deposit' : action
      const description = `${actionText} ${addComma(amount)} ${tokenSymbol}`

      return {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            let successMessage = ''
            if (isInitialize) {
              successMessage = `Successfully initialized margin account and deposited ${addComma(amount)} ${tokenSymbol}`
            } else if (action === 'Deposit') {
              successMessage = `Deposit ${addComma(amount)} ${tokenSymbol}`
            } else if (action === 'Withdraw') {
              successMessage = `Withdraw ${addComma(amount)} ${tokenSymbol}`
            } else if (action === 'Repay') {
              successMessage = `Repay ${addComma(amount)} ${tokenSymbol}`
            }
            info.toastDescriptionContent = successMessage
            info.modalDescriptionText = successMessage
            info.toastTitleText = isInitialize ? 'Initialize & Deposit successful' : `${action} successful`
          }
          return info
        }
      }
    },
    []
  )

  // 执行交易的通用逻辑
  const executeTransaction = useCallback(
    async (tx: Transaction, toastInfo: ReturnType<typeof buildToastInfo>) => {
      transactionConfirmation(toastInfo)

      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })

      // 刷新数据在后台异步执行，不阻塞弹窗关闭
      if (res) {
        refreshDataAfterTransaction().catch(error => {
          console.error('Failed to refresh data after transaction:', error)
        })
      }

      return res
    },
    [
      transactionConfirmation,
      signAndExecuteTransaction,
      mevProtect,
      transactionMode,
      maxCapForGas,
      customGasPrice,
      refreshDataAfterTransaction,
      buildToastInfo
    ]
  )

  return {
    executeTransaction,
    refreshDataAfterTransaction,
    buildToastInfo
  }
}
