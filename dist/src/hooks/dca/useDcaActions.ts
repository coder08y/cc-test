import useActiveOrdersStore from '@/store/profile/activeOrders'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { useState } from 'react'
import useTransaction from '../common/useTransaction'
import useDcaCancel from './useDcaCancel'
import useDcaClaim from './useDcaClaim'
import { useGetDcaOrderList } from './useGetDcaOrderList'

export default function useDcaActions() {
  const [isClaimAllLoading, setIsClaimAllLoading] = useState(false)
  const [isCloseAllLoading, setIsCloseAllLoading] = useState(false)
  const { dcaWithdrawPayload } = useDcaClaim()
  const { dcaCloseOrderPayload } = useDcaCancel()
  const { signAndExecuteTransaction } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const { currentAccount } = useAccountStore()
  const { getDcaOrderList } = useGetDcaOrderList()
  const { setDcaActiveOrderList } = useActiveOrdersStore()

  const closeAll = async (pageList: any) => {
    setIsCloseAllLoading(true)
    try {
      const closeOrderParams: any = pageList?.map((orderInfo: any) => ({
        order_id: orderInfo?.orderID,
        in_coin_type: orderInfo?.inCoin.coin_type,
        out_coin_type: orderInfo?.outCoin.coin_type
      }))
      console.log('🚀 ~ const closeOrderParams:any=pageList.map ~ closeOrderParams:', closeOrderParams)

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
      console.log('🚀 ~ closeAll ~ res:', res)
      if (res) {
        // 清空activeOrderList
        setDcaActiveOrderList([])
        // 重新拿数据
        setTimeout(() => {
          fetchAccountBalance()
          getDcaOrderList(currentAccount?.address, true)
        }, 2000)
      }
      setIsCloseAllLoading(false)
    } catch (error) {
      console.log('🚀 ~ closeAll ~ error:', error)
      setIsCloseAllLoading(false)
    }
  }

  const claimAll = async (pageList: any) => {
    setIsClaimAllLoading(true)
    try {
      const claimOrderParams: any = pageList?.map((orderInfo: any) => ({
        order_id: orderInfo?.orderID,
        in_coin_type: orderInfo?.inCoin.coin_type,
        out_coin_type: orderInfo?.outCoin.coin_type
      }))
      console.log('🚀 ~ const claimOrderParams:any=pageList.map ~ claimOrderParams:', claimOrderParams)

      const tx = await dcaWithdrawPayload(claimOrderParams)
      const res = await signAndExecuteTransaction(tx, {
        getShowInfo: (status: TransactionStatusType) => {
          const info: CommonTypeInfo = {
            modalDescriptionText: `DCA Order Claimed`,
            toastTitleText: 'DCA Order Claimed'
          }
          if (status === 'success') {
            info.toastDescriptionContent = ''
          }

          return info
        }
      })
      console.log('🚀 ~ claimAll ~ res:', res)
      if (res) {
        // 重新拿数据
        setTimeout(() => {
          fetchAccountBalance()
          getDcaOrderList(currentAccount?.address, true)
        }, 2000)
      }
      setIsClaimAllLoading(false)
    } catch (error) {
      console.log('🚀 ~ claimAll ~ error:', error)
      setIsClaimAllLoading(false)
    }
  }
  return { closeAll, claimAll, isClaimAllLoading, isCloseAllLoading }
}
