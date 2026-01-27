import { useGetCoin } from '@/hooks/common/useCoin'
import useTransaction from '@/hooks/common/useTransaction'
import { aggregatorPartner } from '@/hooks/swap/useSwap'
import useGlobalStore from '@/store/common/global'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { formatDescription } from '@/utils'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import useClmmSDKStore from '@cetus/stores/src/useClmmSDKStore'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { BalanceChanges, CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { d, fixDown, getBalanceChanges, isSuiCoin } from '@cetus/utils'
import { Transaction } from '@mysten/sui/transactions'
import { useEffect, useState } from 'react'
import useDeepBookMarginPools from './useDeepbookMarginPools'

export default function useMarginPoolsAction(marginPool: any, onClose: () => void) {
  const { fetchAccountBalance } = useAccountBalance()
  const { getDeepBookMarginPools } = useDeepBookMarginPools()

  const { signAndExecuteTransaction, transactionRejected, transactionConfirmation } = useTransaction()
  const { slippage, mevProtect, maxCapForGas, transactionMode, customGasPrice, mergeSwapSlippage } = useGlobalStore()

  const currentToken = marginPool?.tokenInfo

  const { deepBookSDK } = usePeripherySDKStore()

  const { currentAccount } = useAccountStore()

  const marginPoolCap = useDeepBookMarginPoolStore(state => state.marginPoolCap)
  const isAutoSwap = useDeepBookMarginPoolStore(state => state.isAutoSwap)
  const inputValue = useDeepBookMarginPoolStore(state => state.inputValue)
  const routerData = useDeepBookMarginPoolStore(state => state.routerData)
  const setToToken = useDeepBookMarginPoolStore(state => state.setToToken)

  const usdcCoinType = '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC'
  const usdcCoinMainnet = useGetCoin(usdcCoinType)
  useEffect(() => {
    if (currentToken?.coin_type) {
      const token = isSuiCoin(currentToken?.coin_type) ? usdcCoinMainnet : envConfigs?.sui_coin
      setToToken(token)
    }
  }, [currentToken])

  const [isLoading, setIsLoading] = useState(false)

  const toDeposit = async () => {
    onClose()
    setIsLoading(true)
    try {
      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges: Record<string, BalanceChanges>) => {
          const description = `Deposit ${formatDescription(inputValue, marginPool?.tokenInfo?.symbol)}`
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            const amount = getBalanceChanges(balanceChanges, marginPool?.tokenInfo) || inputValue
            const description = 'Deposit ' + formatDescription(amount, marginPool?.tokenInfo?.symbol)
            info.toastDescriptionContent = 'Deposit successful'
            info.modalDescriptionText = description
            info.toastTitleText = description
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)

      console.log('🚀 ~ toDeposit ~ supplyParams.marginPool:', marginPool)

      let tx = new Transaction()
      const amount = fixDown(
        d(inputValue || '0')
          .mul(Math.pow(10, marginPool?.tokenInfo?.decimals))
          .toNumber(),
        0
      )

      let params: any = { marginPool: marginPool?.objectId, supplyCoinType: marginPool?.tokenInfo?.coin_type, amount }
      if (marginPoolCap) {
        params['supplierCap'] = marginPoolCap
        params['tx'] = tx
      }

      console.log('🚀 ~ toDeposit ~ params:', marginPool, params)
      tx = marginPoolCap ? await deepBookSDK.MarginUtils.supply(params) : await deepBookSDK.MarginUtils.mintSupplierCapAndSupply(params)
      console.log('🚀 ~ toDeposit ~ tx:', tx)

      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      console.log('🚀 ~ toDeposit ~ res:', tx, res)

      if (res) {
        // 重新拿数据
        fetchAccountBalance()
        setTimeout(() => {
          getDeepBookMarginPools(currentAccount?.address)
        }, 2000)
      }

      setIsLoading(false)
    } catch (error) {
      const errorInfo: ToastType = {
        getShowInfo: (status: TransactionStatusType): CommonTypeInfo => {
          const info: CommonTypeInfo = {}
          info['modalDescriptionText'] = 'Transaction failed'
          return info
        }
      }
      transactionRejected(errorInfo)
      console.log('🚀 ~ toDeposit ~ error:', error)
      setIsLoading(false)
    }
  }

  const { aggregatorSDK } = useClmmSDKStore()

  // 提交swap交易
  const handleSwapSubmit = async (routerData: any, inputCoin: any, txc: Transaction) => {
    try {
      const tx = txc || new Transaction()
      let txb: () => Promise<Transaction>

      const sdkParams: any = {
        router: routerData!.routerData,
        partner: aggregatorPartner,
        txb: tx,
        slippage: Number(slippage),
        inputCoin: inputCoin
      }
      console.log('🚀 ~ handleRouterSwap ~ sdkParams:', routerData, sdkParams)

      const swapOutCoin: any = await aggregatorSDK!.routerSwap(sdkParams)
      tx.transferObjects([swapOutCoin], currentAccount?.address as string)
      return tx
    } catch (error) {
      console.log('🚀 ~ handleSwapSubmit ~ error:', error)
    }
  }

  const userInfo = useDeepBookMarginPoolStore(state => state.userInfo)
  const currentPoolInfo = userInfo[marginPool?.objectId]

  const toWithdraw = async (isWithdrawAll = false) => {
    console.log('🚀 ~ toWithdraw ~ isWithdrawAll:', isWithdrawAll)
    onClose()
    setIsLoading(true)
    try {
      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges: Record<string, BalanceChanges>) => {
          const description = `Withdraw ${formatDescription(inputValue, marginPool?.tokenInfo?.symbol)}`
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            const amount = getBalanceChanges(balanceChanges, marginPool?.tokenInfo) || inputValue
            const description = 'Withdraw ' + formatDescription(amount, marginPool?.tokenInfo?.symbol)
            info.toastDescriptionContent = 'Withdraw successful'
            info.modalDescriptionText = description
            info.toastTitleText = description
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)

      let tx: any = new Transaction()

      const amount = fixDown(
        d(inputValue || '0')
          .mul(Math.pow(10, marginPool?.tokenInfo?.decimals))
          .toNumber(),
        0
      )

      let params: any = {
        marginPool: marginPool?.objectId,
        withdrawCoinType: marginPool?.tokenInfo?.coin_type,
        amount,
        supplierCapId: marginPoolCap,
        // 新增
        withdrawAll: d(inputValue)?.eq(currentPoolInfo?.userSupplied) || isWithdrawAll
      }
      if (isAutoSwap) {
        params['hasSwap'] = true
        params['tx'] = tx
      }

      console.log('🚀 ~ toWithdraw ~ params:', marginPoolCap, params)
      let txb: any
      if (isAutoSwap) {
        const withdrawCoin = await deepBookSDK.MarginUtils.supplierWithdraw(params)
        txb = await handleSwapSubmit(routerData, withdrawCoin, params.tx)
      } else {
        txb = await deepBookSDK.MarginUtils.supplierWithdraw(params)
      }

      const res = await signAndExecuteTransaction(txb, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      console.log('🚀 ~ toWithdraw ~ res:', res)

      if (res) {
        // 重新拿数据
        fetchAccountBalance()
        setTimeout(() => {
          getDeepBookMarginPools(currentAccount?.address)
        }, 2000)
      }

      setIsLoading(false)
    } catch (error) {
      console.log('🚀 ~ toDeposit ~ error:', error)
      const errorInfo: ToastType = {
        getShowInfo: (status: TransactionStatusType): CommonTypeInfo => {
          const info: CommonTypeInfo = {}
          info['modalDescriptionText'] = 'Transaction failed'
          return info
        }
      }
      transactionRejected(errorInfo)
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    toDeposit,
    toWithdraw
  }
}
