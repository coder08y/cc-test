import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { Decimal } from '@cetus/utils'
import { d } from '@cetusprotocol/deepbook-utils'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'

export type EstimatedFeeResult = {
  takerFee: string
  makerFee: string
  takerFeeDisplay: string
  makerFeeDisplay: string
  feeType: string
}

export default function useGetDeepBookEstFee() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { getRequestPool } = useGetDeepBookOrderBook()

  const getEstimatedFees = async (
    poolInfo: any,
    quantityInput: string,
    priceInput: string,
    orderType: 'bid' | 'ask',
    payWithDeep: boolean = false,
    isLimit: boolean = true
  ): Promise<EstimatedFeeResult> => {
    // console.log('🚀🚀🚀 ~ getEstimatedFees params: ', { poolInfo, quantityInput, priceInput, orderType, payWithDeep, isLimit })

    // 如果没有费率，返回零费用
    if (d(poolInfo.takerFeeRate || '0').lte(0) && d(poolInfo.makerFeeRate || '0').lte(0)) {
      const feeType = orderType === 'bid' ? poolInfo.quoteAssets.coin_type : poolInfo.baseAssets.coin_type
      return {
        takerFee: '0',
        makerFee: '0',
        takerFeeDisplay: '0',
        makerFeeDisplay: '0',
        feeType
      }
    }

    const pool = {
      ...getRequestPool(poolInfo),
      taker_fee: poolInfo.takerFeeRate,
      maker_fee: poolInfo.makerFeeRate
    }
    const baseDecimals = poolInfo.baseAssets.decimals
    const quoteDecimals = poolInfo.quoteAssets.decimals
    const lotSize = d(poolInfo.lotSize).mul(10 ** baseDecimals)
    const quantity = d(quantityInput)
      .mul(10 ** baseDecimals)
      .div(lotSize)
      .toDP(0, Decimal.ROUND_HALF_UP)
      .mul(lotSize)
      .toString()

    try {
      const res = await deepBookSDK.DeepbookUtils.estimatedMaxFee(pool, quantity, priceInput, payWithDeep, orderType === 'bid', isLimit, priceInput)

      // console.log('🚀🚀🚀 ~ getEstimatedFees Res: ', res)

      return {
        takerFee: (res as any)?.takerFee || '0',
        makerFee: (res as any)?.makerFee || '0',
        takerFeeDisplay: (res as any)?.takerFeeDisplay || '0',
        makerFeeDisplay: (res as any)?.makerFeeDisplay || '0',
        feeType: (res as any).feeType || (orderType === 'bid' ? poolInfo.quoteAssets.coin_type : poolInfo.baseAssets.coin_type)
      }
    } catch (error) {
      console.error('getEstimatedFees error:', error)
      const feeType = orderType === 'bid' ? poolInfo.quoteAssets.coin_type : poolInfo.baseAssets.coin_type
      return {
        takerFee: '0',
        makerFee: '0',
        takerFeeDisplay: '0',
        makerFeeDisplay: '0',
        feeType
      }
    }
  }

  // 保持向后兼容的函数，返回显示用的 takerFeeDisplay
  const getEstimatedMaxFee = async (poolInfo: any, quantityInput: string, priceInput: string, orderType: 'bid' | 'ask') => {
    const result = await getEstimatedFees(poolInfo, quantityInput, priceInput, orderType, false, true)
    return result.takerFeeDisplay
  }

  return { getEstimatedMaxFee, getEstimatedFees }
}
