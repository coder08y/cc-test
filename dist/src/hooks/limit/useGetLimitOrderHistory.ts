import { LimitOrderHistoryPath } from '@/apis/path'
import { LimitOrderEvent, LimitOrderInfo } from '@/types/limit'
import { useFetch } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useAccountStore } from '@cetus/stores'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { LimitOrderStatus, LimitOrderUtils } from '@cetusprotocol/limit-sdk'
import { useEffect, useState } from 'react'

export default function useGetLimitOrderHistory() {
  const { fetchByApi } = useFetch()
  const { getTokenListInfo } = useGetToken()
  const { currentAccount } = useAccountStore()
  const [historyOrderLoading, setHistoryOrderLoading] = useState<boolean>(true)
  const [historyOrderList, setHistoryOrderList] = useState<LimitOrderInfo[]>([])
  useEffect(() => {
    // 切换钱包的时候清空数据
    setHistoryOrderList([])
  }, [currentAccount?.address])
  const getLimitOrderHistory = async (account: string, isLoading?: boolean) => {
    try {
      if (isLoading) {
        setHistoryOrderLoading(true)
      }
      const res = await fetchByApi(LimitOrderHistoryPath, 'GET', {
        wallet_address: account
      })
      console.log(res, 'getLimitOrderHistory')
      if (res?.list && res?.list?.length > 0) {
        const formatList = await formatLimitOrderList(res?.list || [])
        setHistoryOrderList(formatList)
        console.log('🚀 ~ file: useGetLimitOrderHistory.ts:10 ~ getLimitOrderHistory ~ res:', formatList)
        return formatList
      }
      return []
    } catch (error) {
      console.log('getLimitOrderHistory ~ error:', error)
      return []
    } finally {
      setHistoryOrderLoading(false)
    }
  }

  const formatLimitOrderList = async (list: any[]): Promise<LimitOrderInfo[]> => {
    const orderList: LimitOrderInfo[] = []
    const coinTypeList: string[] = []
    for (const item of list) {
      coinTypeList.push(item.pay_coin)
      coinTypeList.push(item.target_coin)
    }
    const tokenMap = await getTokenListInfo(coinTypeList)
    for (const item of list) {
      const [payCoin, targetCoin] = [tokenMap?.get(item.pay_coin), tokenMap?.get(item.target_coin)]
      if (payCoin && targetCoin) {
        const {
          total_pay_amount,
          remaining_amount,
          rate,
          obtained_amount,
          claimed_amount,
          target_balance,
          created_ts,
          expire_ts,
          cancel_reason,
          events
        } = item

        const eventList: LimitOrderEvent[] = events
        console.log('🚀 ~ formatLimitOrderList ~ eventList:', item, eventList)
        eventList.sort((a, b) => b.block_time - a.block_time)

        const total_pay_amount_f = fromDecimalsAmount(total_pay_amount, payCoin.decimals).toString()
        const price = LimitOrderUtils.rateToPrice(rate.toString(), payCoin.decimals, targetCoin.decimals)
        const reseverPrice = d(1).div(price).toString()
        console.log('🚀 ~ formatLimitOrderList ~ reseverPrice:', price, reseverPrice)
        const deal_amount = fromDecimalsAmount(d(total_pay_amount).sub(remaining_amount).toFixed(0), payCoin.decimals).toString()

        const info: LimitOrderInfo = {
          order_id: item.order_id,
          pay_coin: payCoin,
          target_coin: targetCoin,
          price,
          reseverPrice,
          total_pay_amount: total_pay_amount_f,
          remaining_amount,
          deal_amount,
          deal_rate: d(deal_amount).div(total_pay_amount_f).toString(),
          expect_obtain_amount: d(total_pay_amount_f).mul(price).toString(),
          obtained_amount,
          claimed_amount,
          un_claimed_amount: '0',
          created_ts,
          expire_ts,
          status: Number(cancel_reason) === 0 ? LimitOrderStatus.Completed : LimitOrderStatus.Cancelled,
          events: eventList
        }
        console.log('🚀 ~ formatLimitOrderList ~ info:', info)
        orderList.push(info)
      }
    }

    // 按照创建时间排序

    orderList.sort((a, b) => (b.created_ts = a.created_ts))

    return orderList
  }

  return {
    getLimitOrderHistory,
    historyOrderLoading,
    historyOrderList
  }
}
