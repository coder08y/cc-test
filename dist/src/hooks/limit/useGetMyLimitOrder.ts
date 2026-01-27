import useLimitListStore from '@/store/limit/useLimitList'
import { LimitOrderInfo } from '@/types/limit'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { LimitOrder, LimitOrderStatus, LimitOrderUtils } from '@cetusprotocol/limit-sdk'

export default function useGetMyLimitOrder() {
  const { currentAccount, addressChangeVersion } = useAccountStore()
  const limitSdk = useSdk('limit')
  const { setOrderListLoading, setMyOrderList, myOrderList, orderListLoading } = useLimitListStore()
  const { getTokenListInfo } = useGetToken()

  const fetchMyLimitOrder = async (account = currentAccount?.address, isLoading?: boolean) => {
    console.log('🚀 ~ fetchMyLimitOrder ~ account:', account)
    try {
      if (!account) {
        setOrderListLoading(false)
        setMyOrderList([])
        return
      }
      if (isLoading) {
        setOrderListLoading(true)
      }
      // TODO 该方法获取的是 用户的所有订单，在筛选出，未成交和部分成交订单
      const res = await limitSdk!.LimitOrder.getOwnerLimitOrderList(account, 'all')
      const list = await formatLimitOrderList(
        res.data.filter(item => item.status === LimitOrderStatus.PartialCompleted || item.status === LimitOrderStatus.Running)
      )
      setMyOrderList(list)
      console.log('🚀 ~ fetchMyLimitOrder ~ list:', list)
    } catch (error) {
      console.log('🚀 ~ fetchMyLimitOrder ~ error:', error)
    } finally {
      setOrderListLoading(false)
    }
  }

  const formatLimitOrderList = async (list: LimitOrder[]): Promise<LimitOrderInfo[]> => {
    const orderList: LimitOrderInfo[] = []
    const coinTypeList: string[] = []
    for (const item of list) {
      coinTypeList.push(item.pay_coin_type)
      coinTypeList.push(item.target_coin_type)
    }
    const tokenMap = await getTokenListInfo(coinTypeList)
    for (const item of list) {
      const [payCoin, targetCoin] = [tokenMap?.get(item.pay_coin_type), tokenMap?.get(item.target_coin_type)]
      if (payCoin && targetCoin) {
        const { total_pay_amount, pay_balance, rate, obtained_amount, claimed_amount, target_balance, created_ts, expire_ts, status, id } = item

        const total_pay_amount_f = fromDecimalsAmount(total_pay_amount, payCoin.decimals).toString()
        const pay_balance_f = fromDecimalsAmount(pay_balance, payCoin.decimals).toString()
        const obtained_amount_f = fromDecimalsAmount(obtained_amount, targetCoin.decimals).toString()
        const claimed_amount_f = fromDecimalsAmount(claimed_amount, targetCoin.decimals).toString()
        const target_balance_f = fromDecimalsAmount(target_balance, targetCoin.decimals).toString()

        const price = LimitOrderUtils.rateToPrice(rate.toString(), payCoin.decimals, targetCoin.decimals)
        const reseverPrice = d(1).div(price).toString()
        const deal_amount = fromDecimalsAmount(d(total_pay_amount).sub(pay_balance).toFixed(0), payCoin.decimals).toString()

        const info: LimitOrderInfo = {
          order_id: id,
          pay_coin: payCoin,
          target_coin: targetCoin,
          price,
          reseverPrice,
          total_pay_amount: total_pay_amount_f,
          expect_obtain_amount: d(total_pay_amount_f).mul(price).toString(),
          remaining_amount: pay_balance_f,
          deal_amount,
          deal_rate: d(deal_amount).div(total_pay_amount_f).toString(),
          obtained_amount: obtained_amount_f,
          claimed_amount: claimed_amount_f,
          un_claimed_amount: d(target_balance_f).sub(claimed_amount_f).toString(),
          created_ts,
          expire_ts,
          status
        }

        orderList.push(info)
      }
    }

    return orderList.sort((a, b) => b.created_ts - a.created_ts)
  }

  return {
    fetchMyLimitOrder,
    formatLimitOrderList,
    orderListLoading,
    myOrderList
  }
}
