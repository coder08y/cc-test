import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { useAccountBalance } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { abbreviateTokenName, d } from '@cetus/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGetCoin } from '../../common/useCoin'
import useGetDeepBookEstFee from '../useGetDeepBookEstFee'
import useGetOrderBestPrice from '../useGetOrderBestPrice'
import useGetDeepBookMarginBalance from './useGetDeepBookMarginBalance'

export function getDecimalPlaces(num: number): number {
  const decimalPart = num.toString().split('.')[1]
  if (!decimalPart) return 0
  return decimalPart ? decimalPart.length : 0
}

/**
 * 专门用于 reduce-only 模式的交易 hook
 * 区别于现货交易的 useTradeCard，使用 margin 相关的余额和逻辑
 * @param tradeType - 交易方向（Long/Short），用于确定 bid/ask 和 available 余额
 */
export default function useMarginReduceOnlyTrade(tradeType?: DeepBookPoolMarginTabs) {
  const { currentDeepBookPool, deepBookAskList, deepBookBidList } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { getEstimatedFees } = useGetDeepBookEstFee()
  const { getOrderBestPrice } = useGetOrderBestPrice()
  const { deepBookSlippage } = useGlobalStore()

  // 从 store 读取 balance 数据
  const balanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return state.getMarginBalanceData('', '')
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address)
  })

  // 保留 hook 调用以获取 deepFreeBalance 和 deepBalance 对象，以及 baseBalance 和 quoteBalance 对象（用于计算 allBaseBalance 和 allQuoteBalance）
  const { deepFreeBalance, deepBalance, baseBalance, quoteBalance } = useGetDeepBookMarginBalance()

  // 计算 allBaseBalance 和 allQuoteBalance（钱包余额 + margin trading 余额）
  const allBaseBalance = useMemo(() => {
    const walletBase = d(baseBalance?.balanceFormat || '0')
    const marginBase = d(balanceData.baseFreeBalance || '0')
    return walletBase.add(marginBase).toString()
  }, [baseBalance?.balanceFormat, balanceData.baseFreeBalance])

  const allQuoteBalance = useMemo(() => {
    const walletQuote = d(quoteBalance?.balanceFormat || '0')
    const marginQuote = d(balanceData.quoteFreeBalance || '0')
    return walletQuote.add(marginQuote).toString()
  }, [quoteBalance?.balanceFormat, balanceData.quoteFreeBalance])

  const { fetchAccountBalance } = useAccountBalance()
  const deepCoin = useGetCoin('0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP')

  const { placeOrderPrice, setPlaceOrderPrice, orderType, setOrderType, deepbookPrice, isPriceLocked, lockPrice, unlockPrice } = useDeepBookStore()
  const [amount, setAmount] = useState('')
  const [postOnly, setPostOnly] = useState(false)
  const [payWithDeep, setPayWithDeep] = useState(false) // 是否用 DEEP 支付手续费
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC') // Time In Force，默认 GTC
  const amoutRef = useRef('')
  const placeOrderPriceRef = useRef('')

  useEffect(() => {
    amoutRef.current = amount
    placeOrderPriceRef.current = placeOrderPrice
  }, [amount, placeOrderPrice])

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
    }
  }, [currentDeepBookPool?.address, orderType, unlockPrice])

  // 计算总金额（根据订单类型）
  const limitTotal = useMemo(() => {
    if (placeOrderPrice !== '--') {
      const result = d(amount || 0).mul(placeOrderPrice || 0)
      return result.toString()
    } else {
      if (!amount) {
        return '0'
      }
      return '--'
    }
  }, [placeOrderPrice, amount])

  // 根据 tradeType 确定是 bid 还是 ask
  const isBid = useMemo(() => {
    return tradeType === DeepBookPoolMarginTabs.Long
  }, [tradeType])

  const marketTotal = useMemo(() => {
    if (orderType === 'Market') {
      const price = getOrderBestPrice(isBid ? 'bid' : 'ask')

      if (price && amount) {
        const tValue = d(price).mul(amount)
        return isBid ? tValue.add(tValue.mul(deepBookSlippage)).toString() : tValue.sub(tValue.mul(deepBookSlippage)).toString()
      } else if (!amount) {
        return '0'
      } else {
        return '--'
      }
    }
  }, [orderType, amount, deepBookSlippage, isBid, deepBookAskList, deepBookBidList])

  const total = useMemo(() => {
    return orderType === 'Market' ? marketTotal : limitTotal
  }, [orderType, marketTotal, limitTotal, deepBookAskList, deepBookBidList])

  const estTotalUsd = getTokenAmountValue(currentDeepBookPool?.quoteAssets?.coin_type, total)

  // 在 reduce-only 模式下，available 应该根据交易方向来确定
  // Long (Buy) 需要 quote balance，Short (Sell) 需要 base balance
  const available = useMemo(() => {
    if (tradeType === DeepBookPoolMarginTabs.Long) {
      return allQuoteBalance
    } else if (tradeType === DeepBookPoolMarginTabs.Short) {
      return allBaseBalance
    }
    // 默认返回 quote balance
    return allQuoteBalance
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

  // 计算费用（需要 tradeType 参数，但这里暂时使用默认逻辑）
  // 实际使用时，tradeType 应该从外部传入或通过其他方式确定
  useEffect(() => {
    // 如果 amount 为空，只在关键参数变化时更新 feeType，不进行费用计算
    if (!amount || d(amount).lte(0)) {
      const newFeeType = payWithDeep
        ? currentDeepBookPool?.baseAssets?.coin_type?.includes('DEEP') || currentDeepBookPool?.quoteAssets?.coin_type?.includes('DEEP')
          ? currentDeepBookPool?.baseAssets?.coin_type?.includes('DEEP')
            ? currentDeepBookPool?.baseAssets?.coin_type
            : currentDeepBookPool?.quoteAssets?.coin_type
          : '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP' // DEEP coin type
        : tradeType === DeepBookPoolMarginTabs.Long
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
    if (hasValidInputs) {
      if (shouldAddFeeToAmount && maxFee === '0') {
        setMaxFeeIsLoading(true)
      }
      getEstimatedFees(currentDeepBookPool, amount, placeOrderPrice, isBid ? 'bid' : 'ask', payWithDeep, orderType === 'Limit').then(res => {
        if (amoutRef.current && placeOrderPriceRef.current) {
          setTakerFee(res.takerFee)
          setMakerFee(res.makerFee)
          setMaxFeeRaw(res.takerFee)
          setTakerFeeDisplay(res.takerFeeDisplay)
          setMakerFeeDisplay(res.makerFeeDisplay)
          setFeeType(res.feeType)
          setMaxFee(res.takerFeeDisplay)
        }
        setMaxFeeIsLoading(false)
      })
    } else if (d(placeOrderPrice || '0').gt(0) && currentDeepBookPool?.minSize) {
      if (shouldAddFeeToAmount && maxFee === '0') {
        setMaxFeeIsLoading(true)
      }
      getEstimatedFees(
        currentDeepBookPool,
        currentDeepBookPool.minSize,
        placeOrderPrice,
        isBid ? 'bid' : 'ask',
        payWithDeep,
        orderType === 'Limit'
      ).then(res => {
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
  }, [placeOrderPrice, amount, deepBookAskList, deepBookBidList, payWithDeep, orderType, currentDeepBookPool, shouldAddFeeToAmount, isBid])

  // 计算总 DEEP 余额（DeepBook + 钱包）
  const allDeepBalance = useMemo(() => {
    const deepFreeBalanceValue = typeof deepFreeBalance === 'string' ? deepFreeBalance : (deepFreeBalance?.balanceFormat ?? '0')
    const deepBalanceValue = typeof deepBalance === 'string' ? deepBalance : (deepBalance?.balanceFormat ?? '0')
    return d(deepFreeBalanceValue).add(deepBalanceValue).toString()
  }, [deepFreeBalance, deepBalance])

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
  const isFOKOrderCanBeFilledImmediately = useMemo(() => {
    if (!placeOrderPrice || placeOrderPrice === '' || orderType !== 'Limit') {
      return true
    }

    try {
      const targetPrice = d(placeOrderPrice)
      if (!targetPrice.isFinite() || targetPrice.lte(0)) {
        return true
      }

      // 在 reduce-only 模式下，根据交易方向确定检查哪个列表
      // Long (Buy) 需要检查 ask 列表，Short (Sell) 需要检查 bid 列表
      const listToCheck = isBid ? deepBookAskList : deepBookBidList

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
      return true
    }
  }, [deepBookAskList, deepBookBidList, placeOrderPrice, orderType, isBid])

  // 判断是否显示 FOK 订单错误提示
  const showFOKOrderError = useMemo(() => {
    return orderType === 'Limit' && timeInForce === 'FOK' && !isFOKOrderCanBeFilledImmediately && placeOrderPrice && placeOrderPrice !== ''
  }, [orderType, timeInForce, isFOKOrderCanBeFilledImmediately, placeOrderPrice])

  return {
    setMaxFeeIsLoading,
    currentDeepBookPool,
    orderType,
    setOrderType,
    price: placeOrderPrice,
    setPrice: setPlaceOrderPrice,
    lockPrice,
    unlockPrice,
    amount,
    setAmount,
    isShowOrderVolumeError,
    isShowLotSizeError,
    estTotalUsd,
    total,
    available,
    maxFee,
    maxFeeRaw,
    takerFee,
    makerFee,
    takerFeeDisplay,
    makerFeeDisplay,
    feeType,
    maxFeeIsLoading,
    tickSizeUnit,
    minSizeUnit,
    postOnly,
    setPostOnly,
    payWithDeep,
    setPayWithDeep,
    timeInForce,
    setTimeInForce,
    isFOKOrderCanBeFilledImmediately,
    showFOKOrderError
  }
}
