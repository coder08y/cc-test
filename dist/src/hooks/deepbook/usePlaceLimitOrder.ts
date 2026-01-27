import useDeepBookStore from '@/store/deepbook'
import { OrderType, TIF_TO_ORDER_TYPE } from '@/types/deepbook'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d } from '@cetusprotocol/deepbook-utils'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export default function useGetPlaceLimitOrderPayload() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { currentAccount } = useAccountStore()
  const { getCurrentBalanceManagerInfo } = useDeepBookStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { getBalanceManagerInfo } = useGetDeepBookManagerBalance()

  const getPlaceLimitOrderPayload = async (
    poolInfo: any,
    priceInput: string,
    quantityInput: string,
    isBid: boolean,
    maxFee: string,
    payWithDeep: boolean = false,
    postOnly: boolean = false,
    timeInForce: 'GTC' | 'IOC' | 'FOK' = 'GTC',
    balanceManager?: string
  ) => {
    try {
      // 将currentDeepBookPool转换为sdk需要的格式
      const pool = getRequestPool(poolInfo)
      const baseDecimals = poolInfo.baseAssets.decimals
      let tx
      let deepBookAccount = balanceManager ? balanceManager : getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager

      if (!deepBookAccount) {
        const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
        if (accounts?.length > 0) {
          deepBookAccount = accounts?.[0]?.balanceManager
        }
      }

      const lotSize = d(poolInfo.lotSize).mul(10 ** baseDecimals)
      const quantity = d(quantityInput)
        .mul(10 ** baseDecimals)
        .div(lotSize)
        .floor()
        .mul(lotSize)
        .toString()

      // 确定 orderType (TIF)
      const orderType = postOnly ? OrderType.POST_ONLY : TIF_TO_ORDER_TYPE[timeInForce]
      console.log(
        '🚀🚀🚀 ~ usePlaceLimitOrder.ts:52 ~ getPlaceLimitOrderPayload ~ params:',
        JSON.stringify({
          balanceManager: deepBookAccount,
          poolInfo: pool,
          priceInput,
          quantity,
          isBid,
          orderType,
          maxFee,
          account: currentAccount?.address as string,
          payWithDeep
        })
      )
      if (deepBookAccount) {
        tx = await (deepBookSDK.DeepbookUtils.placeLimitOrder as any)({
          balanceManager: deepBookAccount,
          poolInfo: pool,
          priceInput,
          quantity,
          isBid,
          orderType,
          maxFee,
          account: currentAccount?.address as string,
          payWithDeep
        })
      } else {
        tx = await (deepBookSDK.DeepbookUtils.createDepositThenPlaceLimitOrder as any)({
          poolInfo: pool,
          priceInput,
          quantity,
          orderType,
          isBid,
          maxFee,
          account: currentAccount?.address as string,
          payWithDeep
        })
      }

      return { tx }
    } catch (error) {
      console.log('🚀 ~ file: usePlaceLimitOrder.ts ~ placeLimitOrder ~ error:', error)
    }
  }

  return { getPlaceLimitOrderPayload }
}
