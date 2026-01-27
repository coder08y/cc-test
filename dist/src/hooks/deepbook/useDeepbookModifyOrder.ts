import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountBalance } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { d } from '@cetus/utils'
import { MarginPoolInfo } from '@cetusprotocol/deepbook-utils'
import { useMemo } from 'react'
import useTransaction from '../common/useTransaction'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOpenOrders from './useGetDeepBookOpenOrders'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export default function useDeepbookModifyOrder() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const {
    getCurrentBalanceManagerInfo,
    currentBalanceManagerInfoMap,
    setModifyOrderLoading,
    currentDeepBookPool,
    deepBookOpenOrders,
    setDeepBookOpenOrders,
    orderTab
  } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { getManagerBalance } = useGetDeepBookManagerBalance()
  const { getDeepBookOpenOrders } = useGetDeepBookOpenOrders()
  const { marginManagerByAccount } = useMarginStore()
  const currentBalanceManagerInfo = useMemo(() => {
    if (currentAccount?.address) {
      return getCurrentBalanceManagerInfo(currentAccount?.address)
    }
    return null
  }, [currentAccount?.address, currentBalanceManagerInfoMap, getCurrentBalanceManagerInfo])

  const getModifyOrderPayload = async (poolInfo: any, orderId: string, newOrderQuantity: string, orderType: 'spot' | 'margin') => {
    console.log('🚀🚀🚀 ~ useDeepbookModifyOrder.ts:45 ~ getModifyOrderPayload ~ orderType:', orderType)

    let deepBookAccount = null
    if (orderType === 'margin') {
      deepBookAccount = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === poolInfo?.address)?.margin_manager_id
    } else {
      deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
    }

    const pool = getRequestPool(poolInfo, orderType)

    const quantityWithDecimals = d(newOrderQuantity).mul(Math.pow(10, poolInfo.baseAssets.decimals)).toFixed(0)
    console.log('🚀🚀🚀 ~ useDeepbookModifyOrder.ts:60 ~ getModifyOrderPayload ~ quantityWithDecimals:', quantityWithDecimals)

    console.log('🚀🚀🚀 ~ getModifyOrderPayload ~ deepBookAccount:', {
      marginManager: deepBookAccount,
      poolInfo: pool as MarginPoolInfo,
      orderId,
      newQuantity: quantityWithDecimals
    })

    if (orderType === 'margin') {
      return deepBookSDK.MarginUtils.modifyMarginOrder({
        marginManager: deepBookAccount,
        poolInfo: pool as MarginPoolInfo,
        orderId,
        newQuantity: newOrderQuantity
      })
    } else {
      return deepBookSDK.DeepbookUtils.modifyOrder({
        balanceManager: deepBookAccount,
        poolInfo: pool,
        orderId,
        newOrderQuantity: quantityWithDecimals
      })
    }
  }

  const modifyOrder = async (poolInfo: any, orderId: string, newOrderQuantity: string, orderType: 'spot' | 'margin') => {
    try {
      setModifyOrderLoading(true)
      let toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = 'Modifying order'
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = 'Order modified successfully'
            info.modalDescriptionText = description
            info.toastTitleText = 'Modify order Successful'
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)
      const tx = await getModifyOrderPayload(poolInfo, orderId, newOrderQuantity, orderType)

      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      if (res) {
        fetchAccountBalance()
        getManagerBalance(
          [
            { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
            {
              coin_type: currentDeepBookPool?.quoteAssets.coin_type,
              decimals: currentDeepBookPool?.quoteAssets.decimals
            }
          ],
          currentAccount?.address as string,
          currentBalanceManagerInfo?.balanceManager
        )

        // 增量更新订单列表
        const updatedOrders = deepBookOpenOrders.map((order: any) => {
          if (order.orderId === orderId) {
            return {
              ...order,
              originalQuantity: newOrderQuantity
            }
          }
          return order
        })
        setDeepBookOpenOrders(updatedOrders)
      }
      setTimeout(() => {
        // 使用传入的 orderType 参数，而不是全局的 orderTab
        getDeepBookOpenOrders(poolInfo, currentAccount?.address as string, orderType === 'margin')
      }, 2000)
    } catch (error) {
      console.log('🚀 modifyOrder ~ error:', error)
    } finally {
      setTimeout(() => {
        setModifyOrderLoading(false)
      }, 500)
    }
  }

  return { modifyOrder }
}
