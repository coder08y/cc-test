import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { MarginPoolInfo } from '@cetusprotocol/deepbook-utils'
import { Transaction } from '@mysten/sui/transactions'
import useMarginOrderUtils from './margin/useMarginOrderUtils'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export default function useGetCancelOrderPayload() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { getCurrentBalanceManagerInfo } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { marginManagerByAccount } = useMarginStore()
  const { getMarginUtils, getMarginManagerId } = useMarginOrderUtils()

  const getCancelOrderPayload = async (poolInfo: any, orderId: string, orderType: 'spot' | 'margin') => {
    const pool = getRequestPool(poolInfo, orderType)
    let deepBookAccount = null

    if (orderType === 'margin') {
      deepBookAccount =
        getMarginManagerId() || (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === poolInfo?.address)?.margin_manager_id
    } else {
      deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
    }
    const payload =
      orderType == 'spot'
        ? await deepBookSDK.DeepbookUtils.cancelOrders(
            [
              {
                orderId,
                poolInfo: pool
              }
            ],
            deepBookAccount
          )
        : await deepBookSDK.MarginUtils.cancelMarginOrder({
            marginManager: deepBookAccount,
            poolInfo: pool as MarginPoolInfo,
            orderId
          })
    return payload
  }

  const getcancellAllOrderPayload = async (orderList: any[], orderType: 'spot' | 'margin', tx = new Transaction()) => {
    const list = orderList.map((item: any) => {
      return {
        orderId: item.orderId,
        poolInfo: getRequestPool(item, orderType)
      }
    })

    let payload = null

    if (orderType === 'margin') {
      list.forEach((item: any) => {
        const deepBookAccount = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === item?.poolInfo?.id)?.margin_manager_id

        payload = deepBookSDK.MarginUtils.cancelAllMarginOrders(
          {
            marginManager: deepBookAccount,
            poolInfo: item.poolInfo as MarginPoolInfo
          },
          tx
        )
      })
    } else {
      const deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
      payload = await deepBookSDK.DeepbookUtils.cancelOrders(list, deepBookAccount, tx)
    }
    return payload
  }

  return { getCancelOrderPayload, getcancellAllOrderPayload }
}
