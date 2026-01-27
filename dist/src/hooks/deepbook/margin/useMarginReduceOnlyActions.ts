import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import { OrderType, TIF_TO_ORDER_TYPE } from '@/types/deepbook'
import { useAccountBalance } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { d } from '@cetus/utils'
import { Transaction } from '@mysten/sui/transactions'
import { useCallback, useState } from 'react'
import useTransaction from '../../common/useTransaction'
import useGetDeepBookOpenOrders from '../useGetDeepBookOpenOrders'
import useGetDeepBookOrderBook from '../useGetDeepBookOrderBook'
import useDeepBookMarginManager from './useDeepBookMarginManager'
import useDeepBookMarginPrices from './useDeepBookMarginPrices'
import useDeepbookMarginDebt from './useDeepbookMarginDebt'
import useGetDeepBookMarginBalance from './useGetDeepBookMarginBalance'
import useMarginOrderUtils from './useMarginOrderUtils'

export enum SelfMatchingOption {
  SELF_MATCHING_ALLOWED = 0,
  CANCEL_TAKER = 1,
  CANCEL_MAKER = 2
}

/**
 * Reduce-only 模式的交易 Actions Hook
 * 专门用于处理 reduce-only 模式下的下单操作
 */
export default function useMarginReduceOnlyActions() {
  const { currentDeepBookPool, isCheckedAllMarkets } = useDeepBookStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const { refreshMarginBalances } = useGetDeepBookMarginBalance()
  const { getMarginManagerByAccount } = useDeepBookMarginManager()
  const { getDeepBookOpenOrdersCombined, getDeepBookAllOpenOrdersCombined } = useGetDeepBookOpenOrders()
  const { refreshMarginDebt } = useDeepbookMarginDebt()
  const { fetchPrices } = useDeepBookMarginPrices()

  const [isLoading, setIsLoading] = useState(false)

  // 使用工具函数
  const { convertAmountToRawUnits, getMarginUtils, getMarginManagerId } = useMarginOrderUtils()

  // 刷新数据（交易成功后）
  const refreshDataAfterOrder = useCallback(async () => {
    // 先刷新 margin manager 信息
    await getMarginManagerByAccount()

    // 等待一小段时间确保 store 更新完成
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 然后刷新所有余额、债务和价格
    await Promise.all([fetchAccountBalance(), refreshMarginBalances(), refreshMarginDebt(), fetchPrices()])

    // 延迟后再刷新一次，确保数据同步
    setTimeout(async () => {
      await Promise.all([fetchAccountBalance(), refreshMarginBalances(), refreshMarginDebt(), fetchPrices()])
    }, 5000)
  }, [getMarginManagerByAccount, fetchAccountBalance, refreshMarginBalances, refreshMarginDebt, fetchPrices])

  // 构建 toast 信息
  const buildToastInfo = useCallback((action: 'Place order', orderType?: 'Limit' | 'Market') => {
    return {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = action === 'Place order' ? `Creating ${orderType?.toLowerCase() || ''} order`.trim() : action
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }
        if (status === 'success') {
          info.toastDescriptionContent = `${action} successfully`
          info.modalDescriptionText = description
          info.toastTitleText = `${action} Successful`
        } else if (status === 'rejected') {
          // 根据订单类型设置错误消息
          if (action === 'Place order' && orderType === 'Limit') {
            info.modalTitleText = 'Transaction failed'
            info.modalDescriptionText = 'Place reduce-only limit order failed'
            info.toastTitleText = 'Place order failed'
            info.toastDescriptionContent = 'Failed to place reduce-only limit order.'
          } else if (action === 'Place order' && orderType === 'Market') {
            info.modalTitleText = 'Transaction failed'
            info.modalDescriptionText = 'Place reduce-only market order failed'
            info.toastTitleText = 'Place order failed'
            info.toastDescriptionContent = 'Failed to place reduce-only market order.'
          }
        }
        return info
      }
    }
  }, [])

  /**
   * 执行交易并刷新数据
   */
  const executeOrderTransaction = useCallback(
    async (tx: Transaction, toastInfo: ReturnType<typeof buildToastInfo>, onSuccess?: () => void) => {
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })

      if (res) {
        await refreshDataAfterOrder()
        onSuccess?.()
      }

      return res
    },
    [signAndExecuteTransaction, mevProtect, transactionMode, maxCapForGas, customGasPrice, refreshDataAfterOrder]
  )

  /**
   * 执行 reduce-only 限价单下单
   */
  const placeReduceOnlyLimitOrder = useCallback(
    async (
      poolInfo: any,
      priceInput: string,
      quantityInput: string,
      isBid: boolean,
      payWithDeep: boolean = false,
      postOnly: boolean = false,
      timeInForce: 'GTC' | 'IOC' | 'FOK' = 'GTC',
      selfMatchingOption: SelfMatchingOption = SelfMatchingOption.SELF_MATCHING_ALLOWED,
      marginManagerId?: string,
      onSuccess?: () => void
    ) => {
      try {
        setIsLoading(true)

        const toastInfo = buildToastInfo('Place order', 'Limit')
        transactionConfirmation(toastInfo)

        const managerId = marginManagerId || getMarginManagerId()
        if (!managerId) {
          throw new Error('Margin manager not found. Please initialize first.')
        }

        // 获取 margin pool ID
        // 根据订单方向确定使用哪个 margin pool
        // Long (Buy) 订单：借 quote token，使用 quoteMarginPool
        // Short (Sell) 订单：借 base token，使用 baseMarginPool
        const marginPoolId = isBid ? poolInfo.quoteMarginPool : poolInfo.baseMarginPool

        if (!marginPoolId) {
          throw new Error('Margin pool ID not found')
        }

        const marginUtils = getMarginUtils()
        const tx = new Transaction()
        const pool = getRequestPool(poolInfo)

        // 处理 quantity（转换为原始单位并处理 lotSize）
        const baseDecimals = poolInfo.baseAssets.decimals
        const quoteDecimals = poolInfo.quoteAssets.decimals
        const lotSize = d(poolInfo.lotSize).mul(10 ** baseDecimals)
        const quantityRaw = d(quantityInput).mul(10 ** baseDecimals)
        const quantity = quantityRaw.div(lotSize).floor().mul(lotSize).toString()

        // 确定 orderType
        const orderType = postOnly ? OrderType.POST_ONLY : TIF_TO_ORDER_TYPE[timeInForce]

        // 计算过期时间戳（默认 30 天后）
        const expirationTimestamp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

        // 转换 priceInput 为原始单位
        // placeReduceOnlyLimitOrder 期望 priceInput 是原始单位（u64）
        // 转换公式：priceInput * 10^(quoteDecimals - baseDecimals + 9)
        // 这与 placeMarginLimitOrder 中的转换方式一致
        const priceInputRaw = d(priceInput)
          .mul(10 ** (quoteDecimals - baseDecimals + 9))
          .toFixed(0)

        // 构建下单参数
        // priceInput 和 quantity 都应该是原始单位（u64）
        const orderParams = {
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
          marginPoolId,
          orderType,
          selfMatchingOption,
          priceInput: priceInputRaw, // 原始单位（u64）
          quantity, // 已经是原始单位（u64），经过 lotSize 处理
          isBid,
          payWithDeep,
          expirationTimestamp
        }

        console.log('=== Place Reduce-Only Limit Order ===')
        console.log('orderParams', orderParams)

        await marginUtils.placeReduceOnlyLimitOrder(orderParams, tx)

        return await executeOrderTransaction(tx, toastInfo, onSuccess)
      } catch (error) {
        console.error('placeReduceOnlyLimitOrder error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [buildToastInfo, transactionConfirmation, getMarginManagerId, getMarginUtils, getRequestPool, executeOrderTransaction]
  )

  /**
   * 执行 reduce-only 市价单下单
   */
  const placeReduceOnlyMarketOrder = useCallback(
    async (
      poolInfo: any,
      quantityInput: string,
      isBid: boolean,
      payWithDeep: boolean = false,
      selfMatchingOption: SelfMatchingOption = SelfMatchingOption.SELF_MATCHING_ALLOWED,
      marginManagerId?: string,
      onSuccess?: () => void
    ) => {
      try {
        setIsLoading(true)

        const toastInfo = buildToastInfo('Place order', 'Market')
        transactionConfirmation(toastInfo)

        const managerId = marginManagerId || getMarginManagerId()
        if (!managerId) {
          throw new Error('Margin manager not found. Please initialize first.')
        }

        // 获取 margin pool ID
        // 根据订单方向确定使用哪个 margin pool
        // Long (Buy) 订单：借 quote token，使用 quoteMarginPool
        // Short (Sell) 订单：借 base token，使用 baseMarginPool
        const marginPoolId = isBid ? poolInfo.quoteMarginPool : poolInfo.baseMarginPool

        if (!marginPoolId) {
          throw new Error('Margin pool ID not found')
        }

        const marginUtils = getMarginUtils()
        const tx = new Transaction()
        const pool = getRequestPool(poolInfo)

        // 处理 quantity（转换为原始单位并处理 lotSize）
        const baseDecimals = poolInfo.baseAssets.decimals
        const lotSize = d(poolInfo.lotSize).mul(10 ** baseDecimals)
        const quantityRaw = d(quantityInput).mul(10 ** baseDecimals)
        const quantity = quantityRaw.div(lotSize).floor().mul(lotSize).toString()

        // 构建下单参数
        // placeReduceOnlyMarketOrder 期望 quantity 是原始单位（u64）
        const orderParams = {
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
          marginPoolId,
          selfMatchingOption,
          quantity, // 已经是原始单位（u64），经过 lotSize 处理
          isBid,
          payWithDeep
        }

        console.log('=== Place Reduce-Only Market Order ===')
        console.log('orderParams', orderParams)

        await marginUtils.placeReduceOnlyMarketOrder(orderParams, tx)

        return await executeOrderTransaction(tx, toastInfo, onSuccess)
      } catch (error) {
        console.error('placeReduceOnlyMarketOrder error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [buildToastInfo, transactionConfirmation, getMarginManagerId, getMarginUtils, getRequestPool, executeOrderTransaction]
  )

  return {
    // Reduce-only 下单函数
    placeReduceOnlyLimitOrder,
    placeReduceOnlyMarketOrder,
    // Loading 状态
    isLoading
  }
}
