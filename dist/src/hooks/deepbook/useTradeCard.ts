import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountBalance } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { abbreviateTokenName, d } from '@cetus/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGetCoin } from '../common/useCoin'
import useTransaction from '../common/useTransaction'
import useGetDeepBookBalance from './useGetDeepBookBalance'
import useGetDeepBookEstFee from './useGetDeepBookEstFee'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOpenOrders from './useGetDeepBookOpenOrders'
import useGetDeepBookOrderHistory from './useGetDeepBookOrderHistory'
import useGetDeepBookSettleList from './useGetDeepBookSettleList'
import useGetDeepBookTradeHistory from './useGetDeepBookTradeHistory'
import useGetOrderBestPrice from './useGetOrderBestPrice'
import useGetPlaceLimitOrderPayload from './usePlaceLimitOrder'
import usePlaceMarketOrder from './usePlaceMarketOrder'

export function getDecimalPlaces(num: number): number {
  const decimalPart = num.toString().split('.')[1]
  if (!decimalPart) return 0
  return decimalPart ? decimalPart.length : 0
}

export default function useTradeCard() {
  const {
    currentDeepBookPool,
    managerBalanceObjs,
    getCurrentBalanceManagerInfo,
    currentBalanceManagerInfoMap,
    isCheckedAllMarkets,
    deepBookAskList,
    deepBookBidList,
    balanceManagerList,
    deepBookPools,
    deepBookSettleList,
    orderTab
  } = useDeepBookStore()
  const { marginManagerByAccount } = useMarginStore()
  const { currentAccount } = useAccountStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { getEstimatedMaxFee, getEstimatedFees } = useGetDeepBookEstFee()
  const { getPlaceMarketOrderPayload } = usePlaceMarketOrder()
  const { getOrderBestPrice } = useGetOrderBestPrice()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { deepBookSlippage } = useGlobalStore()
  const { baseFreeBalance, quoteFreeBalance, baseBalance, quoteBalance, allBaseBalance, allQuoteBalance, deepFreeBalance, deepBalance } =
    useGetDeepBookBalance(currentDeepBookPool?.address)
  const { transactionConfirmation, transactionRejected } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const { getManagerBalance, getAllManagerBalances } = useGetDeepBookManagerBalance()
  const { getPlaceLimitOrderPayload } = useGetPlaceLimitOrderPayload()
  const { getDeepBookOpenOrdersCombined, getDeepBookAllOpenOrdersCombined } = useGetDeepBookOpenOrders()
  const { getSettleList } = useGetDeepBookSettleList()
  const { getDeepBookOrderHistory } = useGetDeepBookOrderHistory()
  const { getDeepBookTradeHistory } = useGetDeepBookTradeHistory()
  const deepCoin = useGetCoin('0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP')

  const [tradeType, setTradeType] = useState<'Buy' | 'Sell'>('Buy')
  // const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market')
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false)
  // const [price, setPlaceOrderPrice] = useState('')
  const { placeOrderPrice, setPlaceOrderPrice, orderType, setOrderType, deepbookPrice, isPriceLocked, lockPrice, unlockPrice, getTradeType } =
    useDeepBookStore()
  const [amount, setAmount] = useState('')
  const [postOnly, setPostOnly] = useState(false)
  const [payWithDeep, setPayWithDeep] = useState(false) // 是否用 DEEP 支付手续费
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC') // Time In Force，默认 GTC
  const amoutRef = useRef('')
  const placeOrderPriceRef = useRef('')

  // 获取当前 pool 的 settled balance
  const currentSettledBalance = useMemo(() => {
    if (!currentDeepBookPool?.address || !deepBookSettleList?.length) {
      return { baseSettle: '0', quoteSettle: '0', canClaim: false }
    }
    const settled = deepBookSettleList.find((item: any) => item.address === currentDeepBookPool.address)
    return settled || { baseSettle: '0', quoteSettle: '0', canClaim: false }
  }, [deepBookSettleList, currentDeepBookPool?.address])

  useEffect(() => {
    amoutRef.current = amount
    placeOrderPriceRef.current = placeOrderPrice
  }, [amount, placeOrderPrice])

  const currentBalanceManagerInfo = useMemo(() => {
    if (currentAccount?.address) {
      return getCurrentBalanceManagerInfo(currentAccount?.address)
    }
    return null
  }, [currentAccount?.address, currentBalanceManagerInfoMap])

  const isShowOrderVolumeError = useMemo(() => {
    return d(amount || '0').gt('0') && d(amount).lt(currentDeepBookPool?.minSize)
  }, [amount, currentDeepBookPool?.address])

  // 数量不能被lotSize整除
  const isShowLotSizeError = useMemo(() => {
    if (Number(currentDeepBookPool?.lotSize) < 10) return false
    return d(amount || '0').gt('0') && Number(amount) % Number(currentDeepBookPool?.lotSize) !== 0
  }, [amount, currentDeepBookPool?.address])

  // 池子切换或订单类型切换时重置输入和锁定状态
  useEffect(() => {
    if (currentDeepBookPool?.address) {
      setAmount('')
      unlockPrice() // 重置锁定状态
      setPlaceOrderPrice((deepbookPrice as any)?.price || currentDeepBookPool?.price)
      // 根据池子类型设置默认费率支付方式
      // Permissioned 池子（inWhiteList = true）: 默认使用 input token (payWithDeep = false)
      // Permissionless 池子（inWhiteList = false）: 固定使用 DEEP (payWithDeep = true)
      // if (!currentDeepBookPool?.inWhiteList) {
      //   setPayWithDeep(true)
      // } else {
      //   setPayWithDeep(false)
      // }
    }
  }, [currentDeepBookPool?.address, orderType, unlockPrice]) // 移除 deepbookPrice 依赖，避免价格更新时清空输入

  // 单独监听价格变化，只在价格未锁定时才自动更新价格
  // useEffect(() => {
  //   // 如果价格已被用户锁定，不自动更新
  //   if (isPriceLocked) {
  //     return
  //   }
  //   if ((deepbookPrice as any)?.poolId === currentDeepBookPool?.address && (deepbookPrice as any)?.price) {
  //     setPlaceOrderPrice((deepbookPrice as any).price)
  //   }
  // }, [deepbookPrice, currentDeepBookPool?.address, isPriceLocked])

  const estTotal = useMemo(() => {
    if (amount && d(amount).gt('0')) {
      return d(amount || '0')
        .mul(placeOrderPrice || '0')
        .toString()
    }
    return '--'
  }, [amount, currentDeepBookPool?.price])

  const marketTotal = useMemo(() => {
    if (orderType == 'Market') {
      const isBid = tradeType === 'Buy'

      const price = getOrderBestPrice(isBid ? 'bid' : 'ask')
      // const price = placeOrderPrice

      if (price && amount) {
        const tValue = d(price).mul(amount)
        return isBid ? tValue.add(tValue.mul(deepBookSlippage)).toString() : tValue.sub(tValue.mul(deepBookSlippage)).toString()
      } else if (!amount) {
        return '0'
      } else {
        return '--'
      }
    }
  }, [placeOrderPrice, orderType, amount, deepBookSlippage, tradeType, deepBookAskList, deepBookBidList, placeOrderPrice])

  const limitTotal = useMemo(() => {
    if (placeOrderPrice !== '--') {
      const result = d(amount || 0).mul(placeOrderPrice || 0)
      const totalNum = result
      return totalNum.toString()
    } else {
      if (!amount) {
        return '0'
      }
      return '--'
    }
  }, [placeOrderPrice, amount])

  const total = useMemo(() => {
    // console.log('🚀🚀🚀 ~ useTradeCard.ts:159 ~ useTradeCard ~ marketTotal:', marketTotal)
    return orderType === 'Market' ? marketTotal : limitTotal
  }, [orderType, marketTotal, limitTotal, deepBookAskList, deepBookBidList])

  const estTotalUsd = getTokenAmountValue(currentDeepBookPool?.quoteAssets?.coin_type, total)

  const available = useMemo(() => {
    return tradeType === 'Buy' ? allQuoteBalance : allBaseBalance
  }, [tradeType, allBaseBalance, allQuoteBalance])

  const [maxFee, setMaxFee] = useState('0') // 显示值
  const [maxFeeRaw, setMaxFeeRaw] = useState('0') // SDK 返回的原始值（用于交易）
  const [takerFee, setTakerFee] = useState('0') // SDK 原始值（用于交易）
  const [makerFee, setMakerFee] = useState('0') // SDK 原始值（用于交易）
  const [takerFeeDisplay, setTakerFeeDisplay] = useState('0') // 显示值
  const [makerFeeDisplay, setMakerFeeDisplay] = useState('0') // 显示值
  const [feeType, setFeeType] = useState('')
  const [maxFeeIsLoading, setMaxFeeIsLoading] = useState(false)

  const shouldAddFeeToAmount = useMemo(() => {
    return !currentDeepBookPool?.inWhiteList
  }, [currentDeepBookPool?.inWhiteList])

  useEffect(() => {
    // 如果 amount 为空，只在关键参数变化时更新 feeType，不进行费用计算
    // 避免订单簿每 10 秒刷新时触发不必要的更新
    if (!amount || d(amount).lte(0)) {
      const newFeeType = payWithDeep
        ? currentDeepBookPool?.baseAssets?.coin_type?.includes('DEEP') || currentDeepBookPool?.quoteAssets?.coin_type?.includes('DEEP')
          ? currentDeepBookPool?.baseAssets?.coin_type?.includes('DEEP')
            ? currentDeepBookPool?.baseAssets?.coin_type
            : currentDeepBookPool?.quoteAssets?.coin_type
          : '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP' // DEEP coin type
        : tradeType === 'Buy'
          ? currentDeepBookPool?.quoteAssets?.coin_type
          : currentDeepBookPool?.baseAssets?.coin_type

      setFeeType(newFeeType || '')
      setMaxFee('0')
      setMaxFeeRaw('0')
      setTakerFee('0')
      setMakerFee('0')
      setTakerFeeDisplay('0')
      setMakerFeeDisplay('0')
      return
    }

    const hasValidInputs = d(placeOrderPrice || '0').gt(0) && d(amount || '0').gt(0)
    console.log('🚀🚀🚀 ~ useTradeCard.ts:201 ~ useTradeCard ~ maxFee:', maxFee)
    // debugger
    if (hasValidInputs) {
      if (shouldAddFeeToAmount && maxFee === '0') {
        setMaxFeeIsLoading(true)
      }
      getEstimatedFees(currentDeepBookPool, amount, placeOrderPrice, tradeType === 'Buy' ? 'bid' : 'ask', payWithDeep, orderType === 'Limit').then(
        res => {
          if (amoutRef.current && placeOrderPriceRef.current) {
            // 保存 SDK 返回的原始值（用于交易）
            setTakerFee(res.takerFee)
            setMakerFee(res.makerFee)
            setMaxFeeRaw(res.takerFee) // 用 takerFee 预留

            // 保存转换后的值（用于显示）
            setTakerFeeDisplay(res.takerFeeDisplay)
            setMakerFeeDisplay(res.makerFeeDisplay)
            setFeeType(res.feeType)
            setMaxFee(res.takerFeeDisplay) // 显示用
          }
          setMaxFeeIsLoading(false)
        }
      )
    } else if (d(placeOrderPrice || '0').gt(0) && currentDeepBookPool?.minSize) {
      // 当只有价格没有 amount 时，使用 minSize 计算示例费用，让切换更丝滑
      if (shouldAddFeeToAmount && maxFee === '0') {
        setMaxFeeIsLoading(true)
      }
      getEstimatedFees(
        currentDeepBookPool,
        currentDeepBookPool.minSize, // 使用最小单位作为示例
        placeOrderPrice,
        tradeType === 'Buy' ? 'bid' : 'ask',
        payWithDeep,
        orderType === 'Limit'
      ).then(res => {
        // 只更新 feeType，不更新实际费用值（因为没有真实 amount）
        setFeeType(res.feeType)
        setMaxFee('0')
        setMaxFeeRaw('0')
        setTakerFee('0')
        setMakerFee('0')
        setTakerFeeDisplay('0')
        setMakerFeeDisplay('0')
        setMaxFeeIsLoading(false)
      })
    }
  }, [placeOrderPrice, amount, tradeType, deepBookAskList, deepBookBidList, payWithDeep, orderType, currentDeepBookPool, shouldAddFeeToAmount])

  // 计算总 DEEP 余额（DeepBook + 钱包）
  const allDeepBalance = useMemo(() => {
    return d(deepFreeBalance || '0')
      .add(deepBalance?.balanceFormat ?? 0)
      .toString()
  }, [deepFreeBalance, deepBalance])

  const btnInfo = useMemo(() => {
    if (isShowOrderVolumeError || !+placeOrderPrice || !total || !+total || maxFeeIsLoading) {
      return {
        text: '',
        disabled: true,
        insufficientDeep: false
      }
    }

    // 检查 DEEP 余额是否足够支付手续费（当 payWithDeep 为 true 时）
    if (payWithDeep) {
      const feeAmount = maxFeeIsLoading ? '0' : maxFee
      if (d(feeAmount).gt(0) && d(allDeepBalance).lt(d(feeAmount))) {
        return {
          text: '',
          disabled: true,
          insufficientDeep: true
        }
      }
    }

    // 确定需要检查的余额和金额
    const isBuy = tradeType === 'Buy'
    const feeAmount = maxFeeIsLoading ? 0 : maxFee
    console.log('🚀🚀🚀 ~ useTradeCard.ts:303 ~ useTradeCard ~ maxFee:', maxFee)
    const requiredBalance = isBuy ? allQuoteBalance : allBaseBalance

    // 判断是否需要将手续费加到所需金额中：
    // 1. 白名单池子（inWhiteList = true）：手续费为0，不需要加
    // 2. 用 DEEP 支付手续费时：不从交易资产中扣除，不需要加
    // 3. 其他情况：需要从交易资产中扣除手续费

    const requiredAmount = isBuy
      ? d(total || '0')
          .add(shouldAddFeeToAmount && !payWithDeep ? d(feeAmount) : 0)
          .toString()
      : d(amount)
          .add(shouldAddFeeToAmount && !payWithDeep ? d(feeAmount) : 0)
          .toString()

    // 检查余额是否不足
    console.log('🚀🚀🚀 ~ useTradeCard.ts:319 ~ useTradeCard ~ requiredAmount:', { requiredAmount, requiredBalance, feeAmount })
    if (requiredAmount !== '--' && total !== '--' && d(requiredAmount).gt(requiredBalance ?? 0)) {
      const insufficientSymbol = isBuy
        ? abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)
        : abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)

      return {
        text: `Insufficient ${insufficientSymbol} balance`,
        disabled: true,
        insufficientDeep: false
      }
    }

    // Market 订单且金额为空的情况
    if (orderType === 'Market' && (!amount || amount === '0' || !placeOrderPrice || placeOrderPrice === '0')) {
      return {
        text: '',
        disabled: true,
        insufficientDeep: false
      }
    }
    if (orderType === 'Limit' && (!placeOrderPrice || placeOrderPrice === '0' || !amount || amount === '0')) {
      return {
        text: '',
        disabled: true,
        insufficientDeep: false
      }
    }

    return {
      text: '',
      disabled: false,
      insufficientDeep: false
    }
  }, [
    isShowOrderVolumeError,
    estTotal,
    amount,
    tradeType,
    orderType,
    allQuoteBalance,
    allBaseBalance,
    currentDeepBookPool,
    total,
    maxFee,
    maxFeeIsLoading,
    payWithDeep,
    feeType,
    allDeepBalance
  ])

  const getOrders = () => {
    const tradeType = getTradeType(currentDeepBookPool?.address)
    const isMargin = tradeType === 'Margin'
    // 刷新 Open Orders（使用 combined 方法一次获取 spot + margin）
    if (isCheckedAllMarkets) {
      getDeepBookAllOpenOrdersCombined(marginManagerByAccount, false, undefined, false)
    } else {
      getDeepBookOpenOrdersCombined(marginManagerByAccount, currentDeepBookPool, currentAccount?.address as string)
    }
    // 刷新 Order History 和 Trade History（使用 tradeType 而不是全局的 orderTab）
    getDeepBookOrderHistory(isCheckedAllMarkets ? { isMargin } : { poolId: currentDeepBookPool?.address, isMargin })
    getDeepBookTradeHistory(isCheckedAllMarkets ? { isMargin } : { poolId: currentDeepBookPool?.address, isMargin })
  }

  // 完整的余额刷新逻辑（与 AssetsInfo 保持一致）
  const refreshBalancesAfterOrder = () => {
    if (!currentDeepBookPool?.address || !currentAccount?.address || !deepCoin) {
      return
    }

    const coins = [
      { coinType: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
      { coinType: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
      { coinType: deepCoin?.coin_type, decimals: deepCoin?.decimals }
    ]

    // 优先刷新所有 balance manager 的余额
    if (balanceManagerList && balanceManagerList.length > 0) {
      // 同时调用 SDK 方法作为备用
      getAllManagerBalances(balanceManagerList, coins, currentAccount?.address)
    }

    // 刷新当前激活账户的余额
    if (currentBalanceManagerInfo?.balanceManager) {
      getManagerBalance(
        [
          { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
          { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
          { coin_type: deepCoin?.coin_type, decimals: deepCoin?.decimals }
        ],
        currentAccount?.address,
        currentBalanceManagerInfo?.balanceManager
      )
    }

    // 刷新 settled balance
    // if (deepBookPools?.length > 0) {
    getSettleList()
    // }

    // 刷新钱包余额
    fetchAccountBalance()
  }

  const placeMarketOrder = async () => {
    setPlaceOrderLoading(true)

    let toastInfo = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = 'Creating order'
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }
        if (status === 'success') {
          info.toastDescriptionContent = 'Order placed successfully'
          info.modalDescriptionText = description
          info.toastTitleText = 'Place order Successful'
        }
        return info
      }
    }
    try {
      transactionConfirmation(toastInfo)
      // console.log('🚀🚀🚀 ~ useTradeCard.ts:225 ~ placeMarketOrder ~ marketTotal:', marketTotal)

      const settledBalances = {
        base: d(currentSettledBalance?.baseSettle)
          .mul(d(Math.pow(10, currentDeepBookPool?.baseAssets?.decimals)))
          .toString(),
        quote: d(currentSettledBalance?.quoteSettle)
          .mul(d(Math.pow(10, currentDeepBookPool?.quoteAssets?.decimals)))
          .toString()
      }
      console.log('🚀 ~ placeMarketOrder ~ settledBalances:', currentDeepBookPool, settledBalances)

      const result = await getPlaceMarketOrderPayload(
        currentDeepBookPool,
        amount,
        tradeType === 'Buy',
        marketTotal as string,
        shouldAddFeeToAmount ? maxFeeRaw : '0', // 使用原始值用于交易
        payWithDeep,
        settledBalances
      )
      if (!result?.tx) throw new Error('Failed to create transaction')
      const { tx } = result
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      // console.log('🚀🚀🚀 ~ useTradeCard.ts:135 ~ placeMarketOrder ~ res:', res)
      // 重新拿数据 - 使用完整的刷新逻辑
      if (res) {
        setAmount('')

        refreshBalancesAfterOrder()
        getOrders()
        setTimeout(() => {
          // 避免延迟 5s 后再取一次
          refreshBalancesAfterOrder()
          getOrders()
        }, 5000)
      }
      setPlaceOrderLoading(false)
    } catch (error) {
      transactionRejected(toastInfo)
      console.log('🚀🚀🚀 ~ useTradeCard.ts:90 ~ getPlaceMarketOrderPayload ~ error:', error)
      setPlaceOrderLoading(false)
    }
  }

  const placeLimitOrder = async () => {
    setPlaceOrderLoading(true)

    let toastInfo = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = 'Creating order'
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }

        // console.log('🚀🚀🚀 ~ useTradeCard.ts:446 ~ toastInfo.getShowInfo ~ status:', status)

        if (status === 'success') {
          info.toastDescriptionContent = 'Order placed successfully'
          info.modalDescriptionText = description
          info.toastTitleText = 'Place order Successful'
        } else if (status === 'rejected') {
          // 根据订单类型设置订单执行失败的错误消息
          // 注意：这些消息只在订单执行失败时显示，钱包拒绝时会由 handleError 覆盖
          // Post-only-GTC
          if (postOnly && timeInForce === 'GTC') {
            info.modalTitleText = 'Transaction failed'
            info.modalDescriptionText = 'Place post-only order failed'
            info.toastTitleText = 'Place order failed'
            info.toastDescriptionContent = 'Post-only order cannot be placed because it would execute immediately.'
          }
          // IOC
          else if (timeInForce === 'IOC') {
            info.modalTitleText = 'Transaction failed'
            info.modalDescriptionText = 'Place IOC order failed'
            info.toastTitleText = 'Place order failed'
            info.toastDescriptionContent = 'IOC order cannot be placed because immediate execution is not available.'
          }
          // FOK
          else if (timeInForce === 'FOK') {
            info.modalTitleText = 'Transaction failed'
            info.modalDescriptionText = 'Place FOK order failed'
            info.toastTitleText = 'Place order failed'
            info.toastDescriptionContent = 'FOK order cannot be placed because it cannot be filled entirely and immediately.'
          }
          // GTC（非 Post-only）或其他情况，不设置自定义消息，由 handleError 统一处理
          // 这样钱包拒绝时会显示默认的 "User rejected the request"，订单执行失败时会显示 "Transaction failed"
        }
        return info
      }
    }
    try {
      transactionConfirmation(toastInfo)

      const result = await getPlaceLimitOrderPayload(
        currentDeepBookPool,
        placeOrderPrice,
        amount,
        tradeType === 'Buy',
        shouldAddFeeToAmount ? maxFeeRaw : '0', // 使用原始值用于交易
        payWithDeep,
        postOnly,
        timeInForce
      )
      if (!result?.tx) throw new Error('Failed to create transaction')
      const { tx } = result
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })
      if (res) {
        // 重新拿数据 - 使用完整的刷新逻辑
        setAmount('')

        refreshBalancesAfterOrder()
        getOrders()
        setTimeout(() => {
          // 避免延迟 5s 后再取一次
          refreshBalancesAfterOrder()
          getOrders()
          console.log('🚀🚀🚀 ~ useTradeCard.ts:472 ~ setTimeout 5s ~ getOrders:')
        }, 5000)
      }
      setPlaceOrderLoading(false)
    } catch (error) {
      transactionRejected(toastInfo)
      console.log('🚀🚀🚀 ~ useTradeCard.ts:173 ~ placeLimitOrder ~ error:', error)
    }
  }

  const tickSizeUnit = useMemo(() => {
    const tickSize = currentDeepBookPool?.tickSize
    if (tickSize) {
      const unit = getDecimalPlaces(tickSize)
      return unit
    }
    return 0
  }, [currentDeepBookPool?.address])

  const minSizeUnit = useMemo(() => {
    const minSize = currentDeepBookPool?.lotSize
    if (minSize) {
      const unit = getDecimalPlaces(minSize)
      return unit
    }
    return 0
  }, [currentDeepBookPool?.address])

  // 检查 FOK 订单是否可以在当前价格立即成交
  // Buy 订单需要检查 ask 列表（卖单），Sell 订单需要检查 bid 列表（买单）
  const isFOKOrderCanBeFilledImmediately = useMemo(() => {
    if (!placeOrderPrice || placeOrderPrice === '' || orderType !== 'Limit') {
      return true // 非 Limit 订单或没有价格时不检查
    }

    try {
      const targetPrice = d(placeOrderPrice)
      if (!targetPrice.isFinite() || targetPrice.lte(0)) {
        return true // 无效价格时不检查
      }

      const listToCheck = tradeType === 'Buy' ? deepBookAskList : deepBookBidList

      // 检查列表中是否有匹配的价格
      // 使用 Decimal 进行数值比较，避免字符串格式差异导致匹配失败
      const hasMatch = listToCheck.some((item: any) => {
        if (!item?.price) return false
        try {
          return d(item.price).eq(targetPrice)
        } catch {
          return false
        }
      })

      return hasMatch
    } catch (error) {
      console.error('FOK order validation error:', error)
      return true // 出错时默认返回 true，避免阻止正常订单
    }
  }, [deepBookAskList, deepBookBidList, placeOrderPrice, orderType, tradeType, timeInForce])

  // 判断是否显示 FOK 订单错误提示
  const showFOKOrderError = useMemo(() => {
    return orderType === 'Limit' && timeInForce === 'FOK' && !isFOKOrderCanBeFilledImmediately && placeOrderPrice && placeOrderPrice !== ''
  }, [orderType, timeInForce, isFOKOrderCanBeFilledImmediately, placeOrderPrice])

  return {
    currentSettledBalance,
    setMaxFeeIsLoading,
    currentDeepBookPool,
    tradeType,
    setTradeType,
    orderType,
    setOrderType,
    price: placeOrderPrice,
    setPrice: setPlaceOrderPrice,
    lockPrice, // 锁定价格的函数
    amount,
    setAmount,
    isShowOrderVolumeError,
    isShowLotSizeError,
    estTotal,
    estTotalUsd,
    available,
    maxFee, // 显示值
    maxFeeRaw, // 原始值（用于交易）
    takerFee, // 原始值（用于交易）
    makerFee, // 原始值（用于交易）
    takerFeeDisplay, // 显示值
    makerFeeDisplay, // 显示值
    feeType,
    maxFeeIsLoading,
    btnInfo,
    getPlaceMarketOrderPayload,
    placeMarketOrder,
    baseFreeBalance,
    quoteFreeBalance,
    placeOrderLoading,
    placeLimitOrder,
    total,
    tickSizeUnit,
    minSizeUnit,
    postOnly,
    setPostOnly,
    payWithDeep,
    setPayWithDeep,
    timeInForce,
    setTimeInForce,
    insufficientDeep: btnInfo?.insufficientDeep || false,
    isFOKOrderCanBeFilledImmediately,
    showFOKOrderError
  }
}
