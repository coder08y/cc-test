import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import { useAccountBalance } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { Transaction } from '@mysten/sui/transactions'
import { useMemo } from 'react'
import useTransaction from '../common/useTransaction'
import useGetDeepBookMarginBalance from './margin/useGetDeepBookMarginBalance'
import useMarginOrderActions from './margin/useMarginOrderActions'
import useGetCancelOrderPayload from './useGetCancelOrderPayload'
import useGetDeepBookClaimSettlePayload from './useGetDeepBookClaimSettlePayload'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOpenOrders from './useGetDeepBookOpenOrders'
import useGetDeepBookSettleList from './useGetDeepBookSettleList'

export default function useDeepBookOrderActions() {
  const { getCancelOrderPayload, getcancellAllOrderPayload } = useGetCancelOrderPayload()
  const {
    currentDeepBookPool,
    cancelOrderLoading,
    setCancelOrderLoading,
    deepBookOpenOrders,
    setDeepBookOpenOrders,
    setClaimSettleLoading,
    setCancelAllOrderLoading
  } = useDeepBookStore()
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { getManagerBalance } = useGetDeepBookManagerBalance()
  const { currentAccount } = useAccountStore()
  const { getCurrentBalanceManagerInfo, currentBalanceManagerInfoMap } = useDeepBookStore()
  const { getDeepBookOpenOrders } = useGetDeepBookOpenOrders()
  const { getClaimSettlePayload } = useGetDeepBookClaimSettlePayload()
  const { getSettleList } = useGetDeepBookSettleList()
  const { refreshMarginBalances } = useGetDeepBookMarginBalance()
  const { refreshDataAfterOrder } = useMarginOrderActions()
  const currentBalanceManagerInfo = useMemo(() => {
    if (currentAccount?.address) {
      return getCurrentBalanceManagerInfo(currentAccount?.address)
    }
    return null
  }, [currentAccount?.address, currentBalanceManagerInfoMap])

  const cancelOrder = async (poolInfo: any, orderId: string, orderType: 'spot' | 'margin') => {
    // console.log('🚀🚀🚀 ~ useDeepBookOrderActions.ts:48 ~ cancelOrder ~ poolInfo:', poolInfo)
    console.log('🚀🚀🚀 ~ useDeepBookOrderActions.ts:48 ~ cancelOrder ~ orderType:', orderType)
    console.log(
      '🚀🚀🚀 ~ useDeepBookOrderActions.ts:48 ~ cancelOrder ~ orderId:',
      orderType === 'margin'
        ? 'Order has been canceled, but the borrowed amount created by this order is still active. Please repay your debt in Margin Account promptly'
        : 'Canceling order'
    )
    try {
      setCancelOrderLoading(orderId)
      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = 'Canceling order'
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = 'Order canceled successfully'
            // info.modalDescriptionText = description
            info.modalDescriptionText =
              orderType === 'margin'
                ? 'Order has been canceled, but the borrowed amount created by this order is still active. Please repay your debt in Margin Account promptly'
                : 'Canceling order'
            if (orderType === 'margin') {
              info.modalDescriptionTextColor = 'text_paragraph'
            }
            info.toastTitleText = 'Cancel order Successful'
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)
      const tx = await getCancelOrderPayload(poolInfo, orderId, poolInfo.instrument == 'Margin' ? 'margin' : 'spot')
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      console.log('🚀🚀🚀 ~ useTradeCard.ts:135 ~ placeMarketOrder ~ res:', res)
      if (res) {
        if (poolInfo?.instrument === 'Margin') {
          refreshMarginBalances()
          await refreshDataAfterOrder()
        } else {
          // 重新拿数据
          fetchAccountBalance()
          getManagerBalance(
            [
              { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
              { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals }
            ],
            currentAccount?.address as string,
            currentBalanceManagerInfo?.balanceManager
          )
        }
      }
      setTimeout(() => {
        // 使用传入的 orderType 参数
        getDeepBookOpenOrders(poolInfo, currentAccount?.address as string, poolInfo?.instrument == 'Margin')
      }, 2000)
    } catch (error) {
      setCancelOrderLoading(null)
      console.log('🚀🚀🚀 ~ useOrderActions.ts:10 ~ cancelOrder ~ error:', error)
    }
  }

  const cancelAllOrder = async (orderList = deepBookOpenOrders, orderType: 'spot' | 'margin') => {
    console.log('🚀🚀🚀 ~ useDeepBookOrderActions.ts:111 ~ cancelAllOrder ~ orderList:', orderList)
    try {
      setCancelAllOrderLoading(true)
      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = 'Canceling All Order'
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = 'Order canceled successfully'
            info.modalDescriptionText = description
            info.toastTitleText = 'Cancel order Successful'
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)
      const tx = new Transaction()
      const spotOrder = orderList.filter(ele => ele.instrument === 'Spot')
      console.log('🚀🚀🚀 ~ useDeepBookOrderActions.ts:133 ~ cancelAllOrder ~ spotOrder:', spotOrder)
      await getcancellAllOrderPayload(spotOrder, 'spot', tx)
      const marginOrder = orderList.filter(ele => ele.instrument === 'Margin')
      await getcancellAllOrderPayload(marginOrder, 'margin', tx)

      console.log('🚀🚀🚀 ~ useDeepBookOrderActions.ts:132 ~ cancelAllOrder ~ tx:', tx)
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      console.log('🚀🚀🚀 ~ useTradeCard.ts:135 ~ placeMarketOrder ~ res:', res)
      if (res) {
        if (orderType === 'margin') {
          setTimeout(async () => {
            refreshMarginBalances()
            await refreshDataAfterOrder()
          })
        } else {
          // 重新拿数据
          fetchAccountBalance()
          getManagerBalance(
            [
              { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
              { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals }
            ],
            currentAccount?.address as string,
            currentBalanceManagerInfo?.balanceManager
          )
        }

        setDeepBookOpenOrders([])
      }

      setTimeout(() => {
        setCancelOrderLoading(null)
        setCancelAllOrderLoading(false)
      }, 2000)
    } catch (error) {
      setCancelAllOrderLoading(false)
      console.log('🚀🚀🚀 ~ useOrderActions.ts:10 ~ cancelOrder ~ error:', error)
    }
  }

  const claimSettled = async () => {
    try {
      setClaimSettleLoading(true)
      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = 'Claiming settled'
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = 'Claimed settled successfully'
            info.modalDescriptionText = description
            info.toastTitleText = 'Claim settled Successful'
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)
      const tx = await getClaimSettlePayload()
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
        getManagerBalance(
          [
            { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
            { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals }
          ],
          currentAccount?.address as string,
          currentBalanceManagerInfo?.balanceManager
        )
        getSettleList()
      }
      setTimeout(() => {
        setClaimSettleLoading(false)
      }, 2000)
    } catch (error) {}
  }
  return { cancelOrder, cancelAllOrder, claimSettled }
}
