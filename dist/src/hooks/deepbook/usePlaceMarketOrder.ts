import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d, fixD } from '@cetus/utils'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export default function usePlaceMarketOrder() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { getCurrentBalanceManagerInfo } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { deepBookSlippage } = useGlobalStore()
  const { getBalanceManagerInfo } = useGetDeepBookManagerBalance()

  const getPlaceMarketOrderPayload = async (
    poolInfo: any,
    quantityInput: string,
    isBid: boolean,
    slippageQuoteValue: string,
    maxFee: string,
    payWithDeep = false,
    settledBalances: any = { base: '0', quote: '0' }
  ) => {
    // console.log('🚀🚀🚀 ~ usePlaceMarketOrder.ts:23 ~ getPlaceMarketOrderPayload ~ quantityInput:', { quantityInput, slippageQuoteValue })
    try {
      let deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string).balanceManager
      if (!deepBookAccount) {
        const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
        if (accounts?.length > 0) {
          deepBookAccount = accounts?.[0]?.balanceManager
        }
      }

      const pool = getRequestPool(poolInfo)
      // console.log('🚀🚀🚀 ~ usePlaceMarketOrder.ts:31 ~ getPlaceMarketOrderPayload ~ poolInfo:', poolInfo)
      const baseDecimals = poolInfo.baseAssets.decimals
      const quoteDecimals = poolInfo.quoteAssets.decimals
      const lotSize = d(poolInfo.lotSize).mul(10 ** baseDecimals)
      // 对数量按lotSize的倍数做四舍五入处理
      const quantity = d(quantityInput)
        .mul(10 ** baseDecimals)
        .div(lotSize)
        .floor()
        .mul(lotSize)
        .toString()

      console.log('🚀🚀🚀 ~ usePlaceMarketOrder.ts:50 ~ getPlaceMarketOrderPayload ~ deepBookSlippage:', deepBookSlippage, slippageQuoteValue)
      const quoteQuantity = fixD(
        d(slippageQuoteValue)
          .mul(10 ** quoteDecimals)
          .toString(),
        0
      )

      // console.log('🚀 usePlaceMarketOrder ~ params:', { isBid, maxFee, payWithDeep })

      console.log('1🚀 usePlaceMarketOrder ~ params:', {
        balanceManager: deepBookAccount,
        poolInfo: pool,
        baseQuantity: quantity,
        quoteQuantity: String(quoteQuantity),
        isBid,
        maxFee,
        account: currentAccount?.address as string,
        payWithDeep,
        slippage: Number(deepBookSlippage) / 100,
        settled_balances: settledBalances
      })

      let tx
      if (deepBookAccount) {
        tx = await (deepBookSDK.DeepbookUtils.placeMarketOrder as any)({
          balanceManager: deepBookAccount,
          poolInfo: pool,
          baseQuantity: quantity,
          quoteQuantity: String(quoteQuantity),
          isBid,
          maxFee,
          account: currentAccount?.address as string,
          payWithDeep,
          slippage: Number(deepBookSlippage),
          settled_balances: settledBalances
        })
      } else {
        tx = await (deepBookSDK.DeepbookUtils.createDepositThenPlaceMarketOrder as any)({
          poolInfo: pool,
          quantity,
          isBid,
          maxFee,
          account: currentAccount?.address as string,
          payWithDeep,
          slippage: Number(deepBookSlippage)
        })
      }

      return { tx }
    } catch (error) {
      console.log('placeMarketOrder error: ', error)
    }
  }

  return { getPlaceMarketOrderPayload }
}
