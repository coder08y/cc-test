import { d } from '@cetus/utils'
import useGetDeepBookOrderBook from '../useGetDeepBookOrderBook'
import useMarginOrderUtils from './useMarginOrderUtils'

/**
 * Margin Order Payload 生成 Hook
 * 用于生成各种订单操作的 transaction payload
 */
export default function useMarginOrderPayloads() {
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { getMarginUtils, getMarginManagerId } = useMarginOrderUtils()

  /**
   * 获取修改订单的 payload
   * @param poolInfo - 池子信息
   * @param orderId - 订单 ID
   * @param newQuantityInput - 新数量（base token 数量）
   * @param marginManagerId - margin manager ID（可选，如果不提供则从 store 获取）
   */
  const getModifyMarginOrderPayload = async (poolInfo: any, orderId: string, newQuantityInput: string, marginManagerId?: string) => {
    try {
      const marginUtils = getMarginUtils()
      const managerId = marginManagerId || getMarginManagerId()

      if (!managerId) {
        throw new Error('Margin manager not found. Please initialize first.')
      }

      if (!poolInfo?.baseAssets || !poolInfo?.quoteAssets) {
        throw new Error('Pool assets are missing')
      }

      const pool = getRequestPool(poolInfo)
      const baseDecimals = poolInfo.baseAssets.decimals

      // 处理数量：转换为原始单位
      const newQuantity = d(newQuantityInput)
        .mul(10 ** baseDecimals)
        .toString()

      const params = {
        marginManager: managerId,
        poolInfo: {
          id: pool.address,
          baseCoin: {
            coinType: poolInfo.baseAssets.coin_type,
            decimals: baseDecimals
          },
          quoteCoin: {
            coinType: poolInfo.quoteAssets.coin_type,
            decimals: poolInfo.quoteAssets.decimals
          }
        },
        orderId,
        newQuantity
      }

      const payload = await marginUtils.modifyMarginOrder(params)
      return { tx: payload }
    } catch (error) {
      console.error('getModifyMarginOrderPayload error:', error)
      throw error
    }
  }

  /**
   * 获取取消订单的 payload
   * @param poolInfo - 池子信息
   * @param orderId - 订单 ID
   * @param marginManagerId - margin manager ID（可选，如果不提供则从 store 获取）
   */
  const getCancelMarginOrderPayload = async (poolInfo: any, orderId: string, marginManagerId?: string) => {
    try {
      const marginUtils = getMarginUtils()
      const managerId = marginManagerId || getMarginManagerId()

      if (!managerId) {
        throw new Error('Margin manager not found. Please initialize first.')
      }

      if (!poolInfo?.baseAssets || !poolInfo?.quoteAssets) {
        throw new Error('Pool assets are missing')
      }

      const pool = getRequestPool(poolInfo)

      const params = {
        marginManager: managerId,
        poolInfo: {
          id: pool.address,
          baseCoin: {
            coinType: poolInfo.baseAssets.coin_type,
            decimals: poolInfo.baseAssets.decimals
          },
          quoteCoin: {
            coinType: poolInfo.quoteAssets.coin_type,
            decimals: poolInfo.quoteAssets.decimals
          }
        },
        orderId
      }

      const payload = await marginUtils.cancelMarginOrder(params)
      return { tx: payload }
    } catch (error) {
      console.error('getCancelMarginOrderPayload error:', error)
      throw error
    }
  }

  /**
   * 获取取消所有订单的 payload
   * @param poolInfo - 池子信息
   * @param marginManagerId - margin manager ID（可选，如果不提供则从 store 获取）
   */
  const getCancelAllMarginOrdersPayload = async (poolInfo: any, marginManagerId?: string) => {
    try {
      const marginUtils = getMarginUtils()
      const managerId = marginManagerId || getMarginManagerId()

      if (!managerId) {
        throw new Error('Margin manager not found. Please initialize first.')
      }

      if (!poolInfo?.baseAssets || !poolInfo?.quoteAssets) {
        throw new Error('Pool assets are missing')
      }

      const pool = getRequestPool(poolInfo)

      const params = {
        marginManager: managerId,
        poolInfo: {
          id: pool.address,
          baseCoin: {
            coinType: poolInfo.baseAssets.coin_type,
            decimals: poolInfo.baseAssets.decimals
          },
          quoteCoin: {
            coinType: poolInfo.quoteAssets.coin_type,
            decimals: poolInfo.quoteAssets.decimals
          }
        }
      }

      const payload = await marginUtils.cancelAllMarginOrders(params)
      return { tx: payload }
    } catch (error) {
      console.error('getCancelAllMarginOrdersPayload error:', error)
      throw error
    }
  }

  return {
    getModifyMarginOrderPayload,
    getCancelMarginOrderPayload,
    getCancelAllMarginOrdersPayload
  }
}
