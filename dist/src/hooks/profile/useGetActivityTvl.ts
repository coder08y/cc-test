import useLimitListStore from '@/store/limit/useLimitList'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import { LimitOrderInfo } from '@/types/limit'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import { useMemo } from 'react'

export function useGetActivityTvl() {
  const { currentAccount } = useAccountStore()
  const { orderListLoading, myOrderList } = useLimitListStore()
  const { isAutoRefresh, dcaOrderListLoading, dcaActiveOrderList } = useActiveOrdersStore()

  const { getTokenAmountValue, coinPriceObj } = useTokenPrice()

  const limitTotalTvl = useMemo(() => {
    let total = d(0)
    if (isAutoRefresh || !orderListLoading) {
      if (myOrderList?.length > 0 && currentAccount?.address) {
        myOrderList.forEach((ele: LimitOrderInfo) => {
          //剩余未成交资产+成交未claim资产
          const { pay_coin, target_coin, un_claimed_amount, remaining_amount } = ele

          const remainingAmountValue = getTokenAmountValue(pay_coin.coin_type, remaining_amount)
          const unClaimedAmountValue = getTokenAmountValue(target_coin.coin_type, un_claimed_amount)

          total = d(total).plus(remainingAmountValue).plus(unClaimedAmountValue)
          console.log('🚀 ~ myOrderList.forEach ~ limitTotalTvl:', total.toString())
        })
        return total.toString()
      } else {
        return '0'
      }
    }
    return undefined
  }, [isAutoRefresh, myOrderList, currentAccount?.address, orderListLoading, coinPriceObj])

  const dcaTotalTvl = useMemo(() => {
    let total = d(0)
    if (isAutoRefresh || !dcaOrderListLoading) {
      if (dcaActiveOrderList?.length > 0 && currentAccount?.address) {
        dcaActiveOrderList.forEach((ele: any) => {
          //剩余未成交资产+成交未claim资产
          const { inBalance, inCoin, outBalance, outCoin } = ele

          const remainingAmountValue = getTokenAmountValue(inCoin.coin_type, inBalance)
          const unClaimedAmountValue = getTokenAmountValue(outCoin.coin_type, outBalance)

          total = d(total).plus(remainingAmountValue).plus(unClaimedAmountValue)
          console.log('🚀 ~ dcaActiveOrderList.forEach ~ total:', total.toString())
        })
        return total
      } else {
        return '0'
      }
    }
    return undefined
  }, [isAutoRefresh, dcaActiveOrderList, currentAccount?.address, dcaOrderListLoading, coinPriceObj])

  const orderTotalTvl = useMemo(() => {
    console.log('🚀 ~ useGetActivityTvl ~ dcaTotalTvl, limitTotalTvl:', dcaTotalTvl, limitTotalTvl)
    if (dcaTotalTvl && limitTotalTvl) {
      let total = d(0)

      total = d(total).plus(dcaTotalTvl).plus(limitTotalTvl)

      return total.toString()
    }
    return '--'
  }, [dcaTotalTvl, limitTotalTvl])

  return {
    limitTotalTvl,
    dcaTotalTvl,
    orderTotalTvl
  }
}
