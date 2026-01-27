import useTransaction from '@/hooks/common/useTransaction'
import { LimitOrderInfo } from '@/types/limit'
import { useAccountBalance } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { d, formatNumber } from '@cetus/utils'
import { ClaimTargetCoinParams } from '@cetusprotocol/limit-sdk'
import { useState } from 'react'
import useGetMyLimitOrder from './useGetMyLimitOrder'

export default function useLimitClaimAction() {
  const { fetchAccountBalance } = useAccountBalance()
  const { fetchMyLimitOrder } = useGetMyLimitOrder()
  const { signAndExecuteTransaction } = useTransaction()
  const limitSdk = useSdk('limit')

  const [claimLoading, setClaimLoading] = useState<boolean>(false)

  const [isClaimHistoryLoading, setIsClaimHistoryLoading] = useState<boolean>(false)

  const getLimitOrderClaimHistory = async (order: LimitOrderInfo) => {
    console.log('🚀 ~ getLimitOrderClaimHistory ~ order:', order)
    setIsClaimHistoryLoading(true)
    const result = await limitSdk!.LimitOrder.getLimitOrderClaimLogs(order.order_id)
    console.log('🚀 ~ getLimitOrderClaimHistory ~ result:', order, result)
    if (result) {
      setIsClaimHistoryLoading(false)
      return result.map(history => {
        const claimed_amount = d(history.parsed_json.claimed_amount).div(Math.pow(10, order.target_coin?.decimals))
        // const claimed_amount = fromDecimalsAmount(history.parsedJson.claimed_amount, order.target_coin.decimals).toString()
        return {
          ...history,
          ...history.parsed_json,
          claimed_amount
        }
      })
    }
    return []
  }

  const handleClaimOrder = async (orderInfo: LimitOrderInfo, claimValue?: string | number) => {
    console.log('🚀 ~ handleClaimOrder ~ info:', orderInfo)
    setClaimLoading(true)

    const params: ClaimTargetCoinParams = {
      pay_coin_type: orderInfo.pay_coin.coin_type,
      target_coin_type: orderInfo.target_coin.coin_type,
      order_id: orderInfo.order_id
    }

    const txb = await limitSdk!.LimitOrder.claimTargetCoin(params)

    const res = await signAndExecuteTransaction(txb, {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        // todo
        const description = `Claim ${formatNumber(claimValue)} ${orderInfo?.target_coin?.symbol}`

        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }
        if (status === 'success') {
          //   console.log('🚀 ~ handleClaimOrder ~ balanceChanges:', balanceChanges)
          //   let amountVal = claimValue
          //   if (balanceChanges) {
          //     amountVal = getBalanceChanges(balanceChanges, orderInfo?.target_coin) || claimValue
          //   }
          info.toastDescriptionContent = ''
          info.modalDescriptionText = ''
          info.toastTitleText = 'Claim successfully'
        }

        return info
      }
    })
    setClaimLoading(false)

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
    handleClaimOrder,
    getLimitOrderClaimHistory,
    isClaimHistoryLoading,
    claimLoading
  }
}
