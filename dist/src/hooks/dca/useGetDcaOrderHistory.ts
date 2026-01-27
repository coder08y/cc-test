import { DcaOrderHistoryPath } from '@/apis/path'
import useDcaStore from '@/store/dca'
import { useFetch } from '@cetus/hooks'

export default function useGetDcaOrderHistory() {
  const { fetchByApi } = useFetch()
  const { setOrderHistoryObj } = useDcaStore()

  // 没有coin详情，相关信息需要在UI层处理
  const getDcaOrderHistory = async ({ orderId, limit, offset }: { orderId: string; limit: number; offset: number }) => {
    const res = await fetchByApi(DcaOrderHistoryPath, 'GET', {
      order_id: orderId,
      limit,
      offset
    })
    console.log('🚀 ~ file: useGetDcaOrderHistory.ts:16 ~ useGetDcaOrderHistory ~ res:', res)
    if (res?.list) {
      const result = {
        [orderId]: {
          list:
            res?.list?.map((item: any) => {
              return {
                inAmount: item?.in_amount,
                outAmount: item?.out_amount,
                inCoinType: item?.in_coin,
                outCoinType: item?.out_coin,
                time: item?.execution_at,
                tx: item?.tx
              }
            }) || [],
          total: res?.total || 0
        }
      }

      setOrderHistoryObj(result)
      return result
    }
  }

  return {
    getDcaOrderHistory
  }
}
