import useTransaction from '@/hooks/common/useTransaction'
import { LimitOrderInfo } from '@/types/limit'
import { useAccountBalance } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types'
import { CancelOrderByOwnerParams } from '@cetusprotocol/limit-sdk'
import { useState } from 'react'
import useGetMyLimitOrder from './useGetMyLimitOrder'

export default function useLimitCancelAction() {
  const { fetchAccountBalance } = useAccountBalance()
  const { fetchMyLimitOrder } = useGetMyLimitOrder()
  const { signAndExecuteTransaction } = useTransaction()
  const limitSdk = useSdk('limit')

  const [cancelOrderLoading, setCancelOrderLoading] = useState<boolean>(false)

  const { transactionConfirmation } = useTransaction()
  const handleCancelOrder = async (orderList: LimitOrderInfo[]) => {
    setCancelOrderLoading(true)
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType) => {
        const description = `Canceling order`

        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }

        if (status === 'success') {
          info.toastDescriptionContent = 'Order cancelled successfully'
          info.modalDescriptionText = 'Order cancelled successfully'
          info.toastTitleText = 'Order cancelled'
        }

        return info
      }
    }
    transactionConfirmation(toastInfo)
    const params = orderList.map(order => {
      const info: CancelOrderByOwnerParams = {
        pay_coin_type: order.pay_coin.coin_type,
        target_coin_type: order.target_coin.coin_type,
        order_id: order.order_id
      }
      return info
    })

    const txb = await limitSdk!.LimitOrder.cancelOrdersByOwner(params)

    const res = await signAndExecuteTransaction(txb, toastInfo)
    setCancelOrderLoading(false)

    if (res) {
      setTimeout(() => {
        // 刷新余额
        fetchAccountBalance()
        // 刷新订单
        fetchMyLimitOrder()
      }, 2000)
    }
  }

  return {
    handleCancelOrder,
    cancelOrderLoading
  }
}
