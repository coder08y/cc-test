import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { OrderType, TIF_TO_ORDER_TYPE } from '@/types/deepbook'
import { useAccountBalance } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { Decimal, d } from '@cetus/utils'
import { Transaction } from '@mysten/sui/transactions'
import { useCallback, useState } from 'react'
import useTransaction from '../../common/useTransaction'
import useGetDeepBookOpenOrders from '../useGetDeepBookOpenOrders'
import useGetDeepBookOrderBook from '../useGetDeepBookOrderBook'
import { useCalculateRiskRatio } from './useCalculateRiskRatio'
import useDeepBookMarginManager from './useDeepBookMarginManager'
import useDeepBookMarginPrices from './useDeepBookMarginPrices'
import useDeepbookMarginDebt from './useDeepbookMarginDebt'
import useGetDeepBookMarginBalance from './useGetDeepBookMarginBalance'
import useMarginOrderHelpers from './useMarginOrderHelpers'
import useMarginOrderPayloads from './useMarginOrderPayloads'
import useMarginOrderUtils from './useMarginOrderUtils'
import useMarginSettleList from './useMarginSettleList'
export enum SelfMatchingOption {
  SELF_MATCHING_ALLOWED = 0,
  CANCEL_TAKER = 1,
  CANCEL_MAKER = 2
}

export default function usePlaceMarginOrder() {
  const { deepBookSDK } = usePeripherySDKStore()
  const { currentDeepBookPool, isCheckedAllMarkets, orderTab } = useDeepBookStore()
  const { setMarginClaimSettleLoading, marginManagerByAccount } = useMarginStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice, deepBookSlippage } = useGlobalStore()
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const { refreshMarginBalances } = useGetDeepBookMarginBalance()
  const { getMarginManagerByAccount } = useDeepBookMarginManager()
  const { getDeepBookOpenOrdersCombined, getDeepBookAllOpenOrdersCombined } = useGetDeepBookOpenOrders()
  const { refreshMarginDebt } = useDeepbookMarginDebt()
  const { fetchPrices } = useDeepBookMarginPrices()
  const { calculateRiskRatio } = useCalculateRiskRatio()
  const { currentAccount } = useAccountStore()
  const [isLoading, setIsLoading] = useState(false)
  const { getSettleList: getMarginSettleList } = useMarginSettleList()

  // 使用工具函数和辅助函数
  const { getMarginUtils, getMarginManagerId } = useMarginOrderUtils()

  const { handleBorrow } = useMarginOrderHelpers()

  const { getModifyMarginOrderPayload, getCancelMarginOrderPayload, getCancelAllMarginOrdersPayload } = useMarginOrderPayloads()

  // 刷新数据（交易成功后）
  const refreshDataAfterOrder = useCallback(async () => {
    // 先刷新 margin manager 信息
    await getMarginManagerByAccount()

    // 等待一小段时间确保 store 更新完成
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 然后刷新所有余额、债务、价格和订单列表
    await Promise.all([
      // 刷新订单列表（使用 combined 方法一次获取 spot + margin）
      isCheckedAllMarkets
        ? getDeepBookAllOpenOrdersCombined(marginManagerByAccount, false, undefined, false)
        : getDeepBookOpenOrdersCombined(marginManagerByAccount, currentDeepBookPool, currentAccount?.address as string),
      fetchAccountBalance(),
      refreshMarginBalances(),
      refreshMarginDebt(),
      fetchPrices(),
      calculateRiskRatio()
    ])
  }, [
    getMarginManagerByAccount,
    fetchAccountBalance,
    refreshMarginBalances,
    refreshMarginDebt,
    fetchPrices,
    getDeepBookOpenOrdersCombined,
    getDeepBookAllOpenOrdersCombined,
    isCheckedAllMarkets,
    currentDeepBookPool,
    marginManagerByAccount,
    currentAccount?.address
  ])

  // 构建 toast 信息
  const buildToastInfo = useCallback(
    (action: 'Place order' | 'Modify order' | 'Cancel order' | 'Cancel all orders', orderType?: 'Limit' | 'Market') => {
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
              info.modalDescriptionText = 'Place limit order failed'
              info.toastTitleText = 'Place order failed'
              info.toastDescriptionContent = 'Failed to place limit order.'
            } else if (action === 'Place order' && orderType === 'Market') {
              info.modalTitleText = 'Transaction failed'
              info.modalDescriptionText = 'Place market order failed'
              info.toastTitleText = 'Place order failed'
              info.toastDescriptionContent = 'Failed to place market order.'
            }
          }
          return info
        }
      }
    },
    []
  )

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
        console.log('🚀🚀🚀 ~ useMarginOrderActions.ts:159 ~ usePlaceMarginOrder ~ res:', res)
        setTimeout(async () => {
          await refreshDataAfterOrder()
        }, 2000)
        onSuccess?.()
      }

      return res
    },
    [signAndExecuteTransaction, mevProtect, transactionMode, maxCapForGas, customGasPrice, refreshDataAfterOrder]
  )

  /**
   * 执行限价单下单
   * @param collateralAmounts - 用户输入的抵押品数量 { base: string, quote: string }
   * @param borrowAmount - 需要借贷的数量（quote token 计价）
   * @param leverage - 杠杆倍数
   */
  const placeMarginLimitOrder = useCallback(
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
      onSuccess?: () => void,
      borrowAmount?: string,
      leverage?: string,
      maxFee?: string
    ) => {
      try {
        setIsLoading(true)

        const toastInfo = buildToastInfo('Place order', 'Limit')
        transactionConfirmation(toastInfo)

        const managerId = marginManagerId || getMarginManagerId()
        if (!managerId) {
          throw new Error('Margin manager not found. Please initialize first.')
        }

        const marginUtils = getMarginUtils()
        const tx = new Transaction()

        // 1. 处理借贷（如果需要）
        // 根据订单方向决定借贷哪种 token：
        // - Long 订单：借 quote token
        // - Short 订单：借 base token
        if (borrowAmount && d(borrowAmount).gt(0)) {
          console.log('=== Step 1: Handle Borrow ===')
          console.log('Borrow amount:', borrowAmount, isBid ? '(quote token)' : '(base token)')
          console.log('Leverage:', leverage)
          await handleBorrow(tx, marginUtils, managerId, poolInfo, borrowAmount, priceInput, isBid, leverage)
          console.log('Borrow operations completed')
        } else {
          console.log('无需借贷（borrowAmount 为 0 或未提供）')
        }

        // 2. 构建下单参数并添加到 transaction
        const pool = getRequestPool(poolInfo)
        const baseDecimals = poolInfo.baseAssets.decimals

        // quantity 必须是 lotSize 的整倍数
        const lotSize = d(poolInfo.lotSize).mul(10 ** baseDecimals)

        console.log('=== Limit Order: Quantity 计算 ===')
        console.log('quantityInput (传入的 base token 数量):', quantityInput)
        console.log('baseDecimals:', baseDecimals)
        console.log('poolInfo.lotSize:', poolInfo.lotSize)

        // quantity 直接对应 quantityInput（即 amount）
        const quantityRaw = d(quantityInput).mul(10 ** baseDecimals)
        console.log('quantityRaw (原始单位):', quantityRaw.toString())

        const lotSizeRaw = lotSize.toString()
        console.log('lotSize (原始单位):', lotSizeRaw)

        const quantity = quantityRaw.div(lotSize).floor().mul(lotSize).toString()

        console.log('quantity (lotSize 处理后的原始单位):', quantity)
        console.log(
          'quantity (人类可读):',
          d(quantity)
            .div(10 ** baseDecimals)
            .toString()
        )

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
          orderType: postOnly ? OrderType.POST_ONLY : TIF_TO_ORDER_TYPE[timeInForce],
          selfMatchingOption,
          priceInput,
          // quantity 是 base token 数量（已考虑杠杆和抵押物），必须是 lotSize 的整倍数
          // 使用 toString() 保留精度，而不是 toFixed(0)
          quantity: d(quantity)
            .div(10 ** baseDecimals)
            .toString(),
          isBid,
          payWithDeep
        }

        console.log('=== Step 2: Place Limit Order ===')
        console.log('orderParams', orderParams)

        await marginUtils.placeMarginLimitOrder(orderParams, tx)
        console.log('Order placement operation completed', tx)

        // 3. 执行合并后的 transaction
        return await executeOrderTransaction(tx, toastInfo, onSuccess)
      } catch (error) {
        console.error('placeMarginLimitOrder error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [buildToastInfo, transactionConfirmation, getMarginManagerId, getMarginUtils, handleBorrow, getRequestPool, executeOrderTransaction]
  )

  /**
   * 执行市价单下单
   * @param borrowAmount - 需要借贷的数量
   * @param leverage - 杠杆倍数
   * @param priceInput - 订单价格（用于借贷计算）
   */
  const placeMarginMarketOrder = useCallback(
    async (
      poolInfo: any,
      quantityInput: string,
      isBid: boolean,
      payWithDeep: boolean = false,
      selfMatchingOption: SelfMatchingOption = SelfMatchingOption.SELF_MATCHING_ALLOWED,
      marginManagerId?: string,
      onSuccess?: () => void,
      borrowAmount?: string,
      leverage?: string,
      priceInput?: string
      // maxFee?: string
    ) => {
      try {
        setIsLoading(true)

        const toastInfo = buildToastInfo('Place order', 'Market')
        transactionConfirmation(toastInfo)

        const managerId = marginManagerId || getMarginManagerId()
        console.log('🚀🚀🚀 ~ useMarginOrderActions.ts:300 ~ usePlaceMarginOrder ~ managerId:', managerId, marginManagerId, getMarginManagerId())
        if (!managerId) {
          throw new Error('Margin manager not found. Please initialize first.')
        }

        const marginUtils = getMarginUtils()
        const tx = new Transaction()

        // 1. 处理借贷（如果需要）
        // 根据订单方向决定借贷哪种 token：
        // - Long 订单：借 quote token
        // - Short 订单：借 base token
        const marketPrice = priceInput || '0'
        const isBuyMinSizeBase = isBid && d(quantityInput).equals(d(poolInfo.minSize))
        let buyMinSizeBorrowMorePart = '0'
        if (borrowAmount && d(borrowAmount).gt(0) && marketPrice && d(marketPrice).gt(0)) {
          console.log('=== Step 1: Handle Borrow (Market) ===')
          console.log('Borrow amount:', borrowAmount, isBid ? '(quote token)' : '(base token)')
          buyMinSizeBorrowMorePart = d(borrowAmount).mul(0.002).toString()
          const haveBorrowAmount = isBuyMinSizeBase
            ? d(borrowAmount)
                .mul(1 + 0.002)
                .toString()
            : borrowAmount
          await handleBorrow(tx, marginUtils, managerId, poolInfo, haveBorrowAmount, marketPrice, isBid, leverage)
          console.log('Borrow operations completed')
        } else {
          console.log('无需借贷（borrowAmount 为 0 或未提供，或价格无效）')
        }

        // 2. 构建下单参数并添加到 transaction
        const pool = getRequestPool(poolInfo)

        const baseDecimals = poolInfo.baseAssets.decimals
        const quoteDecimals = poolInfo.quoteAssets.decimals
        const lotSize = d(poolInfo.lotSize).mul(10 ** baseDecimals)

        console.log('=== Market Order: 参数计算 ===')
        console.log('quantityInput (传入的 base token 数量):', quantityInput)

        // 计算 base amount（经过 lotSize 处理）
        const baseAmountRaw = d(quantityInput).mul(10 ** baseDecimals)
        const baseAmount = baseAmountRaw.div(lotSize).floor().mul(lotSize).toString()

        console.log('baseAmount (原始单位，lotSize 处理后):', baseAmount)
        console.log(
          'baseAmount (人类可读):',
          d(baseAmount)
            .div(10 ** baseDecimals)
            .toString()
        )

        let quantity: string
        let amountLimit: string

        // 计算滑点（deepBookSlippage 是字符串，例如 "0.005" 表示 0.5%）
        const slippage = d(deepBookSlippage || '0.005')
        const slippageMultiplier = d(1).sub(slippage)

        if (isBid) {
          // Buy 订单 (isBid=true)
          // quantity: 消耗的 coin = quote amount
          // 计算 quote amount = base amount × marketPrice
          const baseAmountHuman = d(baseAmount).div(10 ** baseDecimals)
          const quoteAmountHuman = baseAmountHuman.mul(d(marketPrice))
          const quoteAmount = quoteAmountHuman
            .plus(isBuyMinSizeBase ? buyMinSizeBorrowMorePart : '0')
            .mul(10 ** quoteDecimals)
            .toDP(0, Decimal.ROUND_UP)
            .toString()

          // quantity 是 quote amount（使用 quote decimals）
          quantity = !isBuyMinSizeBase ? quoteAmount : baseAmount

          // amountLimit: 得到的 coin = base amount * (1-滑点)
          // 使用 base coin decimals
          amountLimit = !isBuyMinSizeBase ? d(baseAmount).mul(slippageMultiplier).toDP(0, Decimal.ROUND_DOWN).toString() : quoteAmount

          console.log('=== Buy 订单 ===')
          console.log('quoteAmount (quote decimals):', quoteAmount)
          console.log('quantity (quote decimals, 消耗的 coin):', quantity)
          console.log('amountLimit (base decimals, base amount * (1-slippage), 得到的 coin):', amountLimit)
        } else {
          // Sell 订单 (isBid=false)
          // quantity: 消耗的 coin = base amount
          // 使用 base coin decimals
          quantity = baseAmount

          // amountLimit: 得到的 coin = quote amount * (1-滑点)
          // 计算 quote amount = base amount × marketPrice
          const baseAmountHuman = d(baseAmount).div(10 ** baseDecimals)
          const quoteAmountHuman = baseAmountHuman.mul(d(marketPrice))
          const quoteAmountWithSlippage = quoteAmountHuman.mul(slippageMultiplier)
          // amountLimit 是 quote amount（使用 quote decimals）
          amountLimit = quoteAmountWithSlippage
            .mul(10 ** quoteDecimals)
            .toDP(0, Decimal.ROUND_DOWN)
            .toString()

          console.log('=== Sell 订单 ===')
          console.log('quantity (base decimals, 消耗的 coin):', quantity)
          console.log('quoteAmount (quote decimals):', quoteAmountWithSlippage.mul(10 ** quoteDecimals).toString())
          console.log('amountLimit (quote decimals, quote amount * (1-slippage), 得到的 coin):', amountLimit)
        }

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
          quantity: quantity,
          amountLimit: amountLimit,
          isBid,
          payWithDeep,
          selfMatchingOption: SelfMatchingOption.SELF_MATCHING_ALLOWED,
          exactBase: isBuyMinSizeBase ? true : undefined
        }

        console.log('orderParams', orderParams)

        // SDK 支持传入 Transaction，直接合并到同一个 transaction
        await marginUtils.placeMarginMarketOrder(orderParams, tx)

        // 3. 执行合并后的 transaction
        return await executeOrderTransaction(tx, toastInfo, onSuccess)
      } catch (error) {
        console.error('placeMarginMarketOrder error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [buildToastInfo, transactionConfirmation, getMarginManagerId, getMarginUtils, handleBorrow, getRequestPool, executeOrderTransaction]
  )

  /**
   * 执行修改订单
   */
  const modifyMarginOrder = useCallback(
    async (poolInfo: any, orderId: string, newQuantityInput: string, marginManagerId?: string, onSuccess?: () => void) => {
      try {
        setIsLoading(true)

        const toastInfo = buildToastInfo('Modify order')
        transactionConfirmation(toastInfo)

        const result = await getModifyMarginOrderPayload(poolInfo, orderId, newQuantityInput, marginManagerId)

        return await executeOrderTransaction(result?.tx, toastInfo, onSuccess)
      } catch (error) {
        console.error('modifyMarginOrder error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [
      buildToastInfo,
      transactionConfirmation,
      getModifyMarginOrderPayload,
      signAndExecuteTransaction,
      mevProtect,
      transactionMode,
      maxCapForGas,
      customGasPrice,
      refreshDataAfterOrder
    ]
  )

  /**
   * 执行取消订单
   */
  const cancelMarginOrder = useCallback(
    async (poolInfo: any, orderId: string, marginManagerId?: string, onSuccess?: () => void) => {
      try {
        setIsLoading(true)

        const toastInfo = buildToastInfo('Cancel order')
        transactionConfirmation(toastInfo)

        const result = await getCancelMarginOrderPayload(poolInfo, orderId, marginManagerId)

        if (!result?.tx) {
          throw new Error('Failed to create transaction')
        }

        return await executeOrderTransaction(result?.tx, toastInfo, onSuccess)
      } catch (error) {
        console.error('cancelMarginOrder error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [
      buildToastInfo,
      transactionConfirmation,
      getCancelMarginOrderPayload,
      signAndExecuteTransaction,
      mevProtect,
      transactionMode,
      maxCapForGas,
      customGasPrice,
      refreshDataAfterOrder
    ]
  )

  /**
   * 执行取消所有订单
   */
  const cancelAllMarginOrders = useCallback(
    async (poolInfo: any, marginManagerId?: string, onSuccess?: () => void) => {
      try {
        setIsLoading(true)

        const toastInfo = buildToastInfo('Cancel all orders')
        transactionConfirmation(toastInfo)

        const result = await getCancelAllMarginOrdersPayload(poolInfo, marginManagerId)

        if (!result?.tx) {
          throw new Error('Failed to create transaction')
        }

        return await executeOrderTransaction(result?.tx, toastInfo, onSuccess)
      } catch (error) {
        console.error('cancelAllMarginOrders error:', error)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [
      buildToastInfo,
      transactionConfirmation,
      getCancelAllMarginOrdersPayload,
      signAndExecuteTransaction,
      mevProtect,
      transactionMode,
      maxCapForGas,
      customGasPrice,
      refreshDataAfterOrder
    ]
  )

  // Claim settled amounts for margin trading
  const marginClaimSettled = useCallback(async () => {
    try {
      setMarginClaimSettleLoading(true)
      const toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = 'Claiming settled'
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = 'Claimed settled successfully'
            info.modalDescriptionText = description
            info.toastTitleText = 'Claim settle Successful'
          }
          return info
        }
      }
      transactionConfirmation(toastInfo)

      const marginUtils = getMarginUtils()
      const marginManagerId = getMarginManagerId()

      if (!marginManagerId) {
        throw new Error('Margin manager not found')
      }

      const poolInfoRaw = getRequestPool(currentDeepBookPool, 'margin')
      if (!poolInfoRaw?.baseCoin?.coinType || !poolInfoRaw?.quoteCoin?.coinType) {
        throw new Error('Invalid pool info')
      }

      // 构建 poolInfo，确保包含 address 字段（withdrawSettledAmounts 需要）
      const poolInfo = {
        ...poolInfoRaw,
        address: currentDeepBookPool?.address
      }

      const tx = new Transaction()
      marginUtils.withdrawSettledAmounts(
        {
          poolInfo,
          marginManager: marginManagerId
        },
        tx
      )

      console.log(
        {
          poolInfo,
          marginManager: marginManagerId
        },
        'marginClaimSettled'
      )

      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })

      if (res) {
        // 刷新数据
        await Promise.all([fetchAccountBalance(), refreshMarginBalances(), getMarginSettleList()])
      }
    } catch (error) {
      console.error('marginClaimSettled error:', error)
      throw error
    } finally {
      setTimeout(() => {
        setMarginClaimSettleLoading(false)
      }, 2000)
    }
  }, [
    setMarginClaimSettleLoading,
    transactionConfirmation,
    getMarginUtils,
    getMarginManagerId,
    getRequestPool,
    currentDeepBookPool,
    signAndExecuteTransaction,
    mevProtect,
    transactionMode,
    maxCapForGas,
    customGasPrice,
    fetchAccountBalance,
    refreshMarginBalances,
    getMarginSettleList
  ])

  return {
    refreshDataAfterOrder,
    // Payload 生成函数（用于需要自定义执行流程的场景）
    getModifyMarginOrderPayload,
    getCancelMarginOrderPayload,
    getCancelAllMarginOrdersPayload,
    // 执行函数（包含交易确认和执行）
    placeMarginLimitOrder,
    placeMarginMarketOrder,
    modifyMarginOrder,
    cancelMarginOrder,
    cancelAllMarginOrders,
    marginClaimSettled,
    // Loading 状态
    isLoading
  }
}
