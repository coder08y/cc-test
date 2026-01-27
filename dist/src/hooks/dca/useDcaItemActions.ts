import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { isAvailableObject } from '@cetus/utils'
import { useState } from 'react'
import useTransaction from '../common/useTransaction'
import useDcaCancel from './useDcaCancel'
import useDcaClaim from './useDcaClaim'
import useGetDcaOrderHistory from './useGetDcaOrderHistory'
import { useGetDcaOrderList } from './useGetDcaOrderList'

export default function useDcaItemActions() {
  const [isClaimLoading, setIsClaimLoading] = useState(false)
  const [isCloseLoading, setIsCloseLoading] = useState(false)
  const [orderHistoryListLoading, setOrderHistoryListLoading] = useState(false)
  const [orderHistoryList, setOrderHistoryList] = useState([])
  const [total, setTotal] = useState(0)

  const { currentAccount } = useAccountStore()
  const { dcaWithdrawPayload } = useDcaClaim()
  const { fetchCoinBalance } = useAccountBalance()
  const { signAndExecuteTransaction } = useTransaction()
  const { getDcaOrderList } = useGetDcaOrderList()
  const { dcaCloseOrderPayload } = useDcaCancel()
  const { getDcaOrderHistory } = useGetDcaOrderHistory()

  const toClaim = async (orderInfo: any) => {
    setIsClaimLoading(true)
    try {
      console.log('🚀 ~ closeOrder ~ orderInfo:', orderInfo)
      const paramsArr: any = []
      const claimOrderParams = {
        order_id: orderInfo?.orderID,
        in_coin_type: orderInfo?.inCoin.coin_type,
        out_coin_type: orderInfo?.outCoin.coin_type
      }
      paramsArr.push(claimOrderParams)
      console.log('🚀 ~ toClaim ~ claimOrderParams:', paramsArr)
      const tx = await dcaWithdrawPayload(paramsArr)
      const res = await signAndExecuteTransaction(tx, {
        getShowInfo: (status: TransactionStatusType) => {
          const info: CommonTypeInfo = {
            modalDescriptionText: `${orderInfo?.outCoin?.symbol} Claimed`,
            toastTitleText: `${orderInfo?.outCoin?.symbol} Claimed`
          }
          if (status === 'success') {
            info.toastDescriptionContent = ''
          }

          return info
        }
      })
      if (res) {
        console.log('🚀 ~ toClaim ~ res:', res)
        // 重新拿数据
        setTimeout(() => {
          fetchCoinBalance(currentAccount?.address, orderInfo?.outCoin.coin_type)
          getDcaOrderList(currentAccount?.address, true)
        }, 2000)
      }
      setIsClaimLoading(false)
    } catch (error) {
      console.log('🚀 ~ toClaim ~ error:', error)
      setIsClaimLoading(false)
    }
  }

  const closeOrderAction = async (orderInfo: any) => {
    setIsCloseLoading(true)
    try {
      console.log('🚀 ~ closeOrder ~ orderInfo:', orderInfo)
      const closeOrderParams = [
        {
          order_id: orderInfo?.orderID,
          in_coin_type: orderInfo?.inCoin.coin_type,
          out_coin_type: orderInfo?.outCoin.coin_type
        }
      ]
      console.log('🚀🚀🚀 ~ file: dca-order-card.vue:280 ~ closeOrder ~ closeOrderParams:', closeOrderParams)
      const tx = await dcaCloseOrderPayload(closeOrderParams)
      const res = await signAndExecuteTransaction(tx, {
        getShowInfo: (status: TransactionStatusType) => {
          const info: CommonTypeInfo = {
            modalDescriptionText: `Closing DCA order`,
            toastTitleText: 'Closing DCA order'
          }
          if (status === 'success') {
            info.modalDescriptionText = 'DCA Order Closed'
            info.toastDescriptionContent = ''
            info.toastTitleText = 'DCA Order Closed'
          }

          return info
        }
      })
      console.log('🚀 ~ closeOrder ~ res:', res)
      if (res) {
        // 重新拿数据
        setTimeout(() => {
          fetchCoinBalance()
          getDcaOrderList(currentAccount?.address, true)
        }, 2000)
      }
      setIsCloseLoading(false)
    } catch (error) {
      console.log('🚀 ~ closeOrder ~ error:', error)
      setIsCloseLoading(false)
    }
  }

  const handleGetDcaOrderHistory = async (orderId: string, limit: number, offset: number, loading: boolean = false) => {
    console.log('🚀 ~ handleGetDcaOrderHistory ~ loading:', loading)
    setOrderHistoryListLoading(loading)
    const res: any = await getDcaOrderHistory({
      orderId,
      limit,
      offset
    })
    console.log('🚀 ~ handleGetDcaOrderHistory ~ res?.list:', res)
    if (isAvailableObject(res) && res[orderId]?.list) {
      setOrderHistoryList(res[orderId]?.list)
    }
    if (isAvailableObject(res) && res[orderId]?.total) {
      setTotal(res[orderId]?.total)
    }
    setOrderHistoryListLoading(false)
    console.log('🚀 ~ file: TestData.tsx:170 ~ handleGetDcaOrderHistory ~ res:', res)
  }
  return { toClaim, closeOrderAction, isCloseLoading, isClaimLoading, total, orderHistoryList, handleGetDcaOrderHistory, orderHistoryListLoading }
}
