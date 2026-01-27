import { colorMap } from '@/constant/deepbook'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { useDebounceFunction } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { d, formatNumber } from '@cetus/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useGetDeepBookEstFee from '../useGetDeepBookEstFee'
import useGetOrderBestPrice from '../useGetOrderBestPrice'
import { getDecimalPlaces } from '../useTradeCard'
import { useCalculateRiskRatio } from './useCalculateRiskRatio'
import useDeepBookMarginPrices from './useDeepBookMarginPrices'
import useDeepbookMarginDebt from './useDeepbookMarginDebt'
import useGetDeepBookMarginBalance from './useGetDeepBookMarginBalance'

// Collateral 输入项类型
export interface CollateralInputItem {
  id: string // '1' 对应 baseAssets, '2' 对应 quoteAssets
  amount: string // 输入的金额
}

// 健康度状态类型
export type HealthFactorStatus = {
  status: 'Liquidated' | 'Liquid' | 'Risky' | 'Medium risk' | 'Low risk'
  color: string
  bg: string
} | null

// 错误状态类型
export type ErrorState = {
  type:
    | 'borrow_too_high_risk'
    | 'order_size_too_small'
    | 'insufficient_deep'
    | 'borrow_too_small'
    | 'borrow_too_large'
    | 'insufficient_balance'
    | 'margin_level_too_low'
    | 'insufficient_fee'
  variant: 'red' | 'yellow' | 'blue'
  text: string
} | null

// | 'not_lotsize_multiple'

// 风险数据快照类型（用于缓存异步获取的数据）
interface RiskDataSnapshot {
  totalAssetsValue: string
  totalDebtValue: string
}

// 获取健康度状态的工具函数
const getHealthFactorStatus = (
  value: number | '∞' | null,
  liquidationRiskRatio?: string,
  minBorrowRiskRatio?: string,
  minWithdrawRiskRatio?: string
): HealthFactorStatus => {
  if (value === null) {
    return null
  }

  // 使用池子返回的风险比率值，如果不存在则使用默认值
  const lr = liquidationRiskRatio ? Number(liquidationRiskRatio) : 1.25
  const mcr = minBorrowRiskRatio ? Number(minBorrowRiskRatio) : 1.5
  const mwr = minWithdrawRiskRatio ? Number(minWithdrawRiskRatio) : 2

  // 判断逻辑：
  // 1. value <= lr → 红色 - Liquidated
  // 2. lr < value < mcr → 深黄色 - Liquid
  // 3. mcr <= value < mwr → 黄色 - Risky
  // 4. value >= mwr → 绿色 - Safe

  if (value === '∞') {
    return {
      status: 'Low risk',
      color: colorMap[3].color,
      bg: colorMap[3].bg
    }
  } else if (value <= lr) {
    return {
      status: 'Liquid',
      color: colorMap[1].color,
      bg: colorMap[1].bg
    }
  } else if (value < mcr) {
    return {
      status: 'Risky',
      color: colorMap[1].color,
      bg: colorMap[1].bg
    }
  } else if (value < mwr) {
    return {
      status: 'Medium risk',
      color: colorMap[2].color,
      bg: colorMap[2].bg
    }
  } else {
    return {
      status: 'Low risk',
      color: colorMap[3].color,
      bg: colorMap[3].bg
    }
  }
}

export default function useMarginTrade() {
  const { currentDeepBookPool, orderType, setOrderType, placeOrderPrice, setPlaceOrderPrice, lockPrice, isOpenAssetsActionModal } = useDeepBookStore()
  const { setMarginLeverageRatio, getMarginTradeType, setMarginTradeType } = useMarginStore()
  // 获取盘口买一价格
  const { getOrderBestPrice } = useGetOrderBestPrice()
  // 从 store 获取 tradeType，如果没有则默认为 Long
  const poolAddress = currentDeepBookPool?.address || ''
  const storedTradeType = getMarginTradeType(poolAddress)
  const tradeType = (storedTradeType || DeepBookPoolMarginTabs.Long) as DeepBookPoolMarginTabs
  const deepBookMarginPools = useDeepBookMarginPoolStore(state => state.deepBookMarginPools)

  // console.log(deepBookMarginPools, 'deepBookMarginPoolsdeepBookMarginPoolsdeepBookMarginPoolsdeepBookMarginPoolsdeepBookMarginPools')

  // 如果 store 中没有值，初始化默认值
  useEffect(() => {
    if (poolAddress && !storedTradeType) {
      setMarginTradeType(poolAddress, DeepBookPoolMarginTabs.Long)
    }
  }, [poolAddress, storedTradeType, setMarginTradeType])

  // 使用 selector 订阅杠杆率变化，确保组件能响应 store 更新
  const marginLeverageRatio = useMarginStore(state => (poolAddress ? state.marginLeverageRatioByPool[poolAddress] || '1.1' : '1.1'))

  // 如果 store 中没有值，初始化默认值（检查 store 中是否真的存在这个 key）
  useEffect(() => {
    if (poolAddress) {
      const store = useMarginStore.getState()
      if (!store.marginLeverageRatioByPool[poolAddress]) {
        setMarginLeverageRatio(poolAddress, '1.1')
      }
    }
  }, [poolAddress, setMarginLeverageRatio])

  // 包装函数用于设置当前池子的杠杆率
  const setLeverageRatio = useCallback(
    (value: string) => {
      if (poolAddress) {
        setMarginLeverageRatio(poolAddress, value)
      }
    },
    [poolAddress, setMarginLeverageRatio]
  )

  const setTradeType = (type: DeepBookPoolMarginTabs) => {
    if (poolAddress) {
      setMarginTradeType(poolAddress, type)
    }
  }
  const { basePrice, quotePrice } = useDeepBookMarginPrices()

  // 获取风险率计算 hook
  const { calculateRiskRatio, riskRatio } = useCalculateRiskRatio()

  // 缓存异步获取的风险数据快照，避免每次输入变化都调用 calculateRiskRatio
  const [riskDataSnapshot, setRiskDataSnapshot] = useState<RiskDataSnapshot | null>(null)

  const { currentAccount } = useAccountStore()

  // 获取当前池子的 managerId
  const managerId = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return ''
    }
    const marginManagerByAccount = state.marginManagerByAccount
    const selectedManagerInfo = state.getCurrentMarginManagerInfo(currentAccount.address)

    // 优先使用用户选择的 manager
    if (selectedManagerInfo?.margin_manager_id && currentDeepBookPool.address) {
      const selectedManager = (marginManagerByAccount as any[])?.find(
        (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPool.address
      )
      if (selectedManager) {
        return selectedManagerInfo.margin_manager_id
      }
    }

    // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找
    const marginManager = (marginManagerByAccount as any[])?.find((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
    return marginManager?.margin_manager_id || ''
  })

  // 从 store 读取 balance 数据
  const balanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return state.getMarginBalanceData('', '', '')
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address, managerId)
  })

  // 从 store 数据中提取需要的值
  const baseFreeBalance = balanceData.baseFreeBalance
  const quoteFreeBalance = balanceData.quoteFreeBalance
  const baseMarginBalanceUSD = balanceData.baseMarginBalanceUSD
  const quoteMarginBalanceUSD = balanceData.quoteMarginBalanceUSD
  const baseTotalBalanceUSD = balanceData.baseTotalBalanceUSD
  const quoteTotalBalanceUSD = balanceData.quoteTotalBalanceUSD

  // deepFreeBalance 需要从 hook 获取（因为 store 中没有存储 deepBalanceInfo 对象）
  // 同时确保 hook 被调用以更新 store（hook 内部会更新 store）
  const { deepFreeBalance } = useGetDeepBookMarginBalance()

  // 获取债务信息
  const { totalDebtValue } = useDeepbookMarginDebt()

  // 手续费计算 hook
  const { getEstimatedFees } = useGetDeepBookEstFee()

  // 手续费相关状态
  const [payWithDeep, setPayWithDeep] = useState(false)
  const [maxFee, setMaxFee] = useState('0')
  const [maxFeeIsLoading, setMaxFeeIsLoading] = useState(false)
  const [takerFeeDisplay, setTakerFeeDisplay] = useState('0')
  const [makerFeeDisplay, setMakerFeeDisplay] = useState('0')
  const [feeType, setFeeType] = useState('')

  // Amount 状态（实际下单数量，base token）
  const [amount, setAmount] = useState<string>('')

  // Est.Value 状态（总敞口，类似 longShortSize）
  const [estValue, setEstValue] = useState<string>('')

  // 用于追踪用户是否正在编辑 Est.Value（用于 Limit 模式）
  const [isEditingEstValue, setIsEditingEstValue] = useState<boolean>(false)

  // 用于追踪最后一次手动输入的字段（用于 Limit 模式的三向计算）
  const [lastInputField, setLastInputField] = useState<'amount' | 'price' | 'estValue'>('amount')

  // 记录上一次的弹窗状态，用于检测弹窗关闭
  const prevIsOpenAssetsActionModalRef = useRef<boolean>(false)
  // 根据交易方向确定需要借贷的 token symbol
  // Long: 借 quote token, Short: 借 base token
  const borrowTokenSymbol = useMemo(() => {
    return tradeType === DeepBookPoolMarginTabs.Long ? currentDeepBookPool?.quoteAssets?.symbol || '' : currentDeepBookPool?.baseAssets?.symbol || ''
  }, [tradeType, currentDeepBookPool?.quoteAssets?.symbol, currentDeepBookPool?.baseAssets?.symbol])

  // 根据交易方向确定借贷 token 的价格
  // Long: 借 quote token，使用 quotePrice
  // Short: 借 base token，使用 basePrice
  const borrowTokenPrice = useMemo(() => {
    return tradeType === DeepBookPoolMarginTabs.Long ? quotePrice : basePrice
  }, [tradeType, quotePrice, basePrice])

  const tickSizeUnit = useMemo(() => {
    const tickSize = currentDeepBookPool?.tickSize
    if (tickSize) {
      const unit = getDecimalPlaces(tickSize)
      return unit
    }
    return 0
  }, [currentDeepBookPool?.address])

  // 获取有效的 base 到 quote 转换价格
  // Limit 订单：优先使用 placeOrderPrice（用户输入的价格），如果不可用则回退到池子价格或 Pyth 价格
  // Market 订单：优先使用 basePrice / quotePrice 计算正确的 base/quote 汇率，如果不可用则回退到池子价格
  const baseToQuotePrice = useMemo(() => {
    if (orderType === 'Limit') {
      return placeOrderPrice
    } else {
      // Market 订单：优先使用 basePrice / quotePrice 计算正确的 base/quote 汇率
      // 这样可以确保 Est.Value 的计算基于准确的 USD 价格
      // if (basePrice && quotePrice && d(basePrice).gt(0) && d(quotePrice).gt(0)) {
      //   const calculatedPrice = d(basePrice).div(d(quotePrice))
      //   console.log('🚀🚀🚀 ~ useMarginTrade.ts:207 ~ useMarginTrade ~ quotePrice:', { basePrice, quotePrice, calculatedPrice: calculatedPrice.toString() })
      //   return calculatedPrice.toString()
      // }
      // 回退到池子的盘口价格
      if (tradeType === DeepBookPoolMarginTabs.Long) {
        return getOrderBestPrice('bid')
      } else {
        return getOrderBestPrice('ask')
      }
      // getOrderBestPrice -- 盘口价格
      // return currentDeepBookPool?.price
    }
  }, [placeOrderPrice, orderType, tradeType, getOrderBestPrice])

  // ========== 根据 Amount 和杠杆计算抵押品和借贷数量 ==========

  // 1. 计算 MaxBorrowUSD（最大可借金额，USD）
  // 公式：MaxBorrowUSD = Min[C * (L - 1) - D, (C - MBR ⋅ D) / (MBR - 1)]
  // 其中：
  //   C = total asset (包括 free + locked + settled balance 的 USD 价值)
  //   L = leverage ratio (marginLeverageRatio)
  //   MBR = min borrow ratio (minBorrowRiskRatio)
  //   D = total debt (totalDebtValue)
  const maxBorrowUSD = useMemo(() => {
    // 计算 total balance 的 USD 价值（包括 free + locked + settled）
    // 优先使用 total balance USD（如果可用），否则回退到 free balance USD（向后兼容）
    const totalBalanceUSD = d(baseTotalBalanceUSD || baseMarginBalanceUSD || '0').add(quoteTotalBalanceUSD || quoteMarginBalanceUSD || '0')

    // 获取 minBorrowRiskRatio，如果不存在则使用默认值 1.25
    const minBorrowRiskRatio = currentDeepBookPool?.minBorrowRiskRatio || '1.25'
    const leverage = d(marginLeverageRatio || '1')
    const debtValue = d(totalDebtValue || '0')

    // 计算第一个值：C * (L - 1) - D
    let maxBorrowByLeverage = d('0')
    if (leverage.gt(1)) {
      const leverageMultiplier = leverage.sub(1) // (L - 1)
      maxBorrowByLeverage = d(totalBalanceUSD).mul(leverageMultiplier) //.sub(debtValue)
      // 如果为负数，设为 0
      if (maxBorrowByLeverage.lt(0)) {
        maxBorrowByLeverage = d('0')
      }
    }

    // 计算第二个值：(C - MBR ⋅ D) / (MBR - 1)
    let maxBorrowByMBR = d('0')
    // 检查 MBR > 1，确保分母 (MBR - 1) > 0
    if (d(minBorrowRiskRatio).gt(1)) {
      // 计算分子：C - MBR ⋅ D
      const numerator = d(totalBalanceUSD).sub(d(minBorrowRiskRatio).mul(debtValue))
      // 计算分母：MBR - 1
      const denominator = d(minBorrowRiskRatio).sub(1)
      // 计算 MaxBorrowUSD by MBR
      maxBorrowByMBR = numerator.div(denominator)
      // 如果为负数，设为 0
      if (maxBorrowByMBR.lt(0)) {
        maxBorrowByMBR = d('0')
      }
    }

    // 取两者的最小值
    const maxBorrow = maxBorrowByLeverage.lt(maxBorrowByMBR) ? maxBorrowByLeverage : maxBorrowByMBR

    // console.log('[maxBorrowUSD] 计算详情:', {
    //   totalBalanceUSD: totalBalanceUSD.toString(),
    //   leverage: marginLeverageRatio,
    //   minBorrowRiskRatio,
    //   totalDebtValue: totalDebtValue || '0',
    //   maxBorrowByLeverage: maxBorrowByLeverage.toString(),
    //   maxBorrowByMBR: maxBorrowByMBR.toString(),
    //   maxBorrow: maxBorrow.toString(),
    //   result: maxBorrow.gt(0) ? maxBorrow.toString() : '0'
    // })

    // 返回最小值（如果为负数或0，则返回 '0'）
    return maxBorrow.gt(0) ? maxBorrow.toString() : '0'
  }, [
    baseTotalBalanceUSD,
    baseMarginBalanceUSD,
    quoteTotalBalanceUSD,
    quoteMarginBalanceUSD,
    marginLeverageRatio,
    currentDeepBookPool?.minBorrowRiskRatio,
    totalDebtValue
  ])

  // 2. 计算 Available（支付币数量）
  // 注意：Available 只包含 free balance + 可借金额，不包含 locked balance
  // 因为 locked balance 已经在 open orders 中，不能用于新的下单
  //
  // Long（买入base，支付quote）:
  //   AvailableQuote = free_quote + MaxBorrowUSD / P_quote
  //   能拿来"支付"的 quote 来自两部分：collateral里的free quote + 允许借出的quote
  //
  // Short（卖出base，支付base）:
  //   AvailableBase = free_base + MaxBorrowUSD / P_base
  //   能拿来"支付"的 base 来自两部分：collateral里的free base + 可借出的base
  const available = useMemo(() => {
    if (!basePrice || !quotePrice || d(basePrice).lte(0) || d(quotePrice).lte(0)) {
      return '0'
    }

    if (tradeType === DeepBookPoolMarginTabs.Long) {
      // Long: 支付quote（例如：Long SUI，支付USDC）
      // AvailableUSDC = free USDC + MaxBorrowUSD / P_quote
      const maxBorrowQuote = d(maxBorrowUSD).div(quotePrice)
      if (maxBorrowQuote.lte(0)) {
        return '0'
      }
      const result = d(quoteFreeBalance || '0')
        .add(maxBorrowQuote)
        .toString()

      // // 调试日志
      // console.log('[Available] Long (支付quote):', {
      //   freeQuote: quoteFreeBalance,
      //   maxBorrowUSD,
      //   quotePrice,
      //   maxBorrowQuote: maxBorrowQuote.toString(),
      //   available: result,
      //   leverage: marginLeverageRatio
      // })

      return result
    } else {
      // Short: 支付base（例如：Short SUI，支付SUI）
      // AvailableBase = free_base + MaxBorrowUSD / P_base
      const maxBorrowBase = d(maxBorrowUSD).div(basePrice)
      if (maxBorrowBase.lte(0)) {
        return '0'
      }
      const result = d(baseFreeBalance || '0')
        .add(maxBorrowBase)
        .toString()

      // // 调试日志
      // console.log('[Available] Short (支付base):', {
      //   freeBase: baseFreeBalance,
      //   maxBorrowUSD,
      //   basePrice,
      //   maxBorrowBase: maxBorrowBase.toString(),
      //   available: result,
      //   leverage: marginLeverageRatio
      // })

      return result
    }
  }, [tradeType, baseFreeBalance, quoteFreeBalance, maxBorrowUSD, basePrice, quotePrice, marginLeverageRatio])

  // 3. 计算 Available 的 USD 价值
  // Long: available 是 quote token 数量，乘以 quotePrice 得到 USD 价值
  // Short: available 是 base token 数量，乘以 basePrice 得到 USD 价值
  // 注意：available = free_balance + maxBorrowUSD / price
  // 所以 availableUSD = available × price = (free_balance + maxBorrowUSD / price) × price
  // 即：availableUSD = free_balance × price + maxBorrowUSD
  // 即：availableUSD = quoteMarginBalanceUSD + maxBorrowUSD (Long) 或 baseMarginBalanceUSD + maxBorrowUSD (Short)
  const availableUSD = useMemo(() => {
    if (!available || d(available).lte(0)) {
      return '0'
    }

    if (tradeType === DeepBookPoolMarginTabs.Long) {
      // Long: available 是 quote token，使用 quotePrice
      if (!quotePrice || d(quotePrice).lte(0)) {
        return '0'
      }
      // availableUSD = available × quotePrice
      // 展开：availableUSD = (quoteFreeBalance + maxBorrowUSD / quotePrice) × quotePrice
      //      = quoteFreeBalance × quotePrice + maxBorrowUSD
      //      = quoteMarginBalanceUSD + maxBorrowUSD
      const result = d(available).mul(quotePrice).toString()

      // console.log('[AvailableUSD] Long (支付quote):', {
      //   available,
      //   quotePrice,
      //   availableUSD: result,
      //   quoteFreeBalance,
      //   maxBorrowUSD,
      //   quoteMarginBalanceUSD,
      //   expected: d(quoteMarginBalanceUSD || '0')
      //     .add(maxBorrowUSD || '0')
      //     .toString()
      // })

      return result
    } else {
      // Short: available 是 base token，使用 basePrice
      if (!basePrice || d(basePrice).lte(0)) {
        return '0'
      }
      // availableUSD = available × basePrice
      // 展开：availableUSD = (baseFreeBalance + maxBorrowUSD / basePrice) × basePrice
      //      = baseFreeBalance × basePrice + maxBorrowUSD
      //      = baseMarginBalanceUSD + maxBorrowUSD
      const result = d(available).mul(basePrice).toString()

      // console.log('[AvailableUSD] Short (支付base):', {
      //   available,
      //   basePrice,
      //   availableUSD: result,
      //   baseFreeBalance,
      //   maxBorrowUSD,
      //   baseMarginBalanceUSD,
      //   expected: d(baseMarginBalanceUSD || '0')
      //     .add(maxBorrowUSD || '0')
      //     .toString()
      // })

      return result
    }
  }, [
    available,
    tradeType,
    basePrice,
    quotePrice,
    marginLeverageRatio,
    baseFreeBalance,
    quoteFreeBalance,
    maxBorrowUSD,
    baseMarginBalanceUSD,
    quoteMarginBalanceUSD
  ])

  // 4. 计算 Max Buy/Sell（base token 单位）
  //
  // Long（买入base，支付quote）:
  //   Max Buy = AvailableQuote / best_bid_price（盘口买一价格）
  //   例如：AvailableUSDC = 130 USDC, best_bid_price = 1 USDC/SUI → Max Buy = 130 SUI
  //
  // Short（卖出base，支付base）:
  //   Max Short = AvailableBase
  //   例如：AvailableSUI = 5 SUI → Max Short = 5 SUI
  const maxAmount = useMemo(() => {
    // 检查 available 是否有效
    if (!available || d(available).lte(0)) {
      return '0'
    }

    if (tradeType === DeepBookPoolMarginTabs.Long) {
      // Long: 使用盘口买一价格来计算 Max Buy
      const bestBidPrice = getOrderBestPrice('bid')
      if (!bestBidPrice || d(bestBidPrice).lte(0)) {
        return '0'
      }
      // Max Buy = AvailableQuote / best_bid_price
      // 例如：130 USDC / 1 USDC/SUI = 130 SUI
      return d(available).div(bestBidPrice).toString()
    } else {
      // Short: 直接返回 available（base token 数量），不需要价格转换
      // Max Short = AvailableBase
      // 例如：5 SUI = 5 SUI
      return available
    }
  }, [available, tradeType, getOrderBestPrice, marginLeverageRatio])

  // 5. 根据 Amount 计算需要的抵押品
  // 在杠杆交易中：
  // - 订单总价值 = amount × price
  // - 需要的抵押品 = 订单总价值 / L（L 是杠杆率）
  const requiredCollateral = useMemo(() => {
    if (!amount || d(amount).lte(0) || !baseToQuotePrice || d(baseToQuotePrice).lte(0)) {
      return { requiredQuote: '0', requiredBase: '0' }
    }

    const amountDecimal = d(amount)
    const leverage = d(marginLeverageRatio || '1')

    // 订单总价值
    const orderTotalValue = amountDecimal.mul(d(baseToQuotePrice))

    // 需要的抵押品 = 订单总价值 / 杠杆率
    const requiredCollateralValue = orderTotalValue.div(leverage)

    if (tradeType === DeepBookPoolMarginTabs.Long) {
      // Long: 需要的抵押品是 quote token
      return {
        requiredQuote: requiredCollateralValue.toString(),
        requiredBase: '0'
      }
    } else {
      // Short: 需要的抵押品是 base token
      // 注意：Short 时，订单总价值是 base token 数量，需要除以杠杆率
      const requiredBase = amountDecimal.div(leverage)
      return {
        requiredQuote: '0',
        requiredBase: requiredBase.toString()
      }
    }
  }, [amount, tradeType, baseToQuotePrice, marginLeverageRatio])

  // 6. 计算借贷数量
  // 在杠杆交易中，借贷数量由两部分组成：
  // 1. 杠杆部分（超过1的杠杆部分）：订单总价值 × (L-1) / L（这是固定的，必须借）
  // 2. 抵押品缺口：如果账户余额 < 需要的抵押品，需要补足 = 需要的抵押品 - 账户余额
  // 实际借贷 = 杠杆部分借贷 + max(0, 抵押品缺口)
  // 但不能超过最大可借限制 maxBorrowUSD
  const calculatedBorrowAmount = useMemo(() => {
    if (amount === '' || amount === '0') {
      return d('0')
    }

    // 如果杠杆 <= 1，不需要借贷
    if (!marginLeverageRatio || d(marginLeverageRatio).lte(1)) {
      return d('0')
    }

    // 需要检查价格是否有效
    if (!basePrice || !quotePrice || d(basePrice).lte(0) || d(quotePrice).lte(0)) {
      return d('0')
    }

    const leverage = d(marginLeverageRatio)

    if (tradeType === DeepBookPoolMarginTabs.Long) {
      // Long: 借 quote token
      // 订单总价值（quote token 数量）
      // const orderTotalValue = d(amount).mul(d(baseToQuotePrice))
      // console.log('orderTotalValue##', orderTotalValue.toString())

      // // 杠杆部分借贷 = 订单总价值 × (L-1) / L（超过1的杠杆部分，必须借）
      // const leverageBorrow = orderTotalValue.mul(leverage.sub(1)).div(leverage)

      // // 需要的抵押品（quote token 数量）
      // const requiredQuote = d(requiredCollateral.requiredQuote)
      // const currentQuoteFree = d(quoteFreeBalance || '0')

      // // 抵押品缺口 = max(0, 需要的抵押品 - 账户余额)
      // const collateralGap = requiredQuote.sub(currentQuoteFree).gt(0) ? requiredQuote.sub(currentQuoteFree) : d('0')

      // // 实际借贷 = 杠杆部分借贷 + 抵押品缺口
      // const totalBorrow = leverageBorrow.add(collateralGap)

      // // 最大可借数量（USD 转换为 quote token 数量）
      // const maxBorrowQuote = d(maxBorrowUSD).div(quotePrice)

      // // 取两者中的较小值，确保不超过最大可借限制
      // const borrowQuote = totalBorrow.gt(maxBorrowQuote) ? maxBorrowQuote : totalBorrow

      // Long: 借 quote token
      // 订单总价值（quote token 数量）
      const orderTotalValue = !payWithDeep ? d(amount).mul(d(baseToQuotePrice)).add(d(maxFee)) : d(amount).mul(d(baseToQuotePrice))

      // 杠杆部分借贷 = 订单总价值 × (L-1) / L（超过1的杠杆部分，必须借）
      const leverageBorrow = orderTotalValue.mul(leverage.sub(1)).div(leverage)

      // 需要的抵押品（quote token 数量）
      const requiredQuote = d(requiredCollateral.requiredQuote)
      const currentQuoteFree = d(quoteFreeBalance || '0')

      // 抵押品缺口 = max(0, 需要的抵押品 - 账户余额)
      // const collateralGap = requiredQuote.sub(currentQuoteFree).gt(0) ? requiredQuote.sub(currentQuoteFree) : d('0')

      const totalBorrow = orderTotalValue.sub(currentQuoteFree)

      // 最大可借数量（USD 转换为 quote token 数量）
      const maxBorrowQuote = d(maxBorrowUSD).div(quotePrice)

      // 取两者中的较小值，确保不超过最大可借限制
      const borrowQuote = totalBorrow.gt(0) ? (totalBorrow.gt(maxBorrowQuote) ? maxBorrowQuote : totalBorrow) : d('0')

      // console.log('[calculatedBorrowAmount] Long - 计算借贷数量:', {
      //   orderTotalValue: orderTotalValue.toString(),
      //   leverage: marginLeverageRatio,
      //   leverageBorrow: leverageBorrow.toString(),
      //   requiredQuote: requiredQuote.toString(),
      //   currentQuoteFree: currentQuoteFree.toString(),
      //   collateralGap: collateralGap.toString(),
      //   totalBorrow: totalBorrow.toString(),
      //   maxBorrowUSD,
      //   maxBorrowQuote: maxBorrowQuote.toString(),
      //   borrowQuote: borrowQuote.toString()
      // })

      return borrowQuote.gt(0) ? borrowQuote : d('0')
    } else {
      // Short: 借 base token
      // 订单总价值（base token 数量）= amount
      const orderTotalValue = !payWithDeep ? d(amount).add(d(maxFee)) : d(amount)

      // 杠杆部分借贷 = 订单总价值 × (L-1) / L（超过1的杠杆部分，必须借）
      // const leverageBorrow = orderTotalValue.mul(leverage.sub(1)).div(leverage)

      // 需要的抵押品（base token 数量）
      const requiredBase = d(requiredCollateral.requiredBase)
      const currentBaseFree = d(baseFreeBalance || '0')

      // 抵押品缺口 = max(0, 需要的抵押品 - 账户余额)
      // const collateralGap = requiredBase.sub(currentBaseFree).gt(0) ? requiredBase.sub(currentBaseFree) : d('0')

      // 实际借贷 = 杠杆部分借贷 + 抵押品缺口
      const totalBorrow = currentBaseFree.sub(orderTotalValue).gt(0) ? d('0') : currentBaseFree.sub(orderTotalValue).abs()

      // 最大可借数量（USD 转换为 base token 数量）
      const maxBorrowBase = d(maxBorrowUSD).div(basePrice)

      // 取两者中的较小值，确保不超过最大可借限制
      const borrowBase = totalBorrow.gt(maxBorrowBase) ? maxBorrowBase : totalBorrow

      // console.log('[calculatedBorrowAmount] Short - 计算借贷数量:', {
      //   orderTotalValue: orderTotalValue.toString(),
      //   leverage: marginLeverageRatio,
      //   leverageBorrow: leverageBorrow.toString(),
      //   requiredBase: requiredBase.toString(),
      //   currentBaseFree: currentBaseFree.toString(),
      //   collateralGap: collateralGap.toString(),
      //   totalBorrow: totalBorrow.toString(),
      //   maxBorrowUSD,
      //   maxBorrowBase: maxBorrowBase.toString(),
      //   borrowBase: borrowBase.toString()
      // })

      return borrowBase.gt(0) ? borrowBase : d('0')
    }
  }, [
    requiredCollateral,
    tradeType,
    marginLeverageRatio,
    baseFreeBalance,
    quoteFreeBalance,
    maxBorrowUSD,
    basePrice,
    quotePrice,
    amount,
    baseToQuotePrice,
    maxFee,
    payWithDeep
  ])

  // 在 borrowAmountInUSD 之前定义，确保可以在依赖项中使用
  const borrowAmountStr = useMemo(() => calculatedBorrowAmount.toString(), [calculatedBorrowAmount])

  // 计算借款金额的 USD 价值
  const borrowAmountInUSD = useMemo(() => {
    if (d(calculatedBorrowAmount).lte(0) || !basePrice || !quotePrice) {
      return d('0')
    }

    // Long: borrowAmount 是 quote token 数量，用 quotePrice 转换
    // Short: borrowAmount 是 base token 数量，用 basePrice 转换
    const price = tradeType === DeepBookPoolMarginTabs.Long ? quotePrice : basePrice
    const result = d(calculatedBorrowAmount).mul(price)

    // console.log(
    //   '[borrowAmountInUSD]',
    //   tradeType === DeepBookPoolMarginTabs.Long ? 'Long' : 'Short',
    //   '借款金额:',
    //   calculatedBorrowAmount.toString(),
    //   '价格:',
    //   price,
    //   'USD价值:',
    //   result.toString()
    // )

    return result
  }, [borrowAmountStr, quotePrice, basePrice, tradeType]) // ✅ 使用字符串作为依赖项，避免 Decimal 对象引用变化

  // 使用 useRef 保存取消标志和最新的回调，避免闭包问题
  const riskDataCancelRef = useRef(false)
  const fetchRiskDataRef = useRef<() => Promise<void>>()

  // 创建 fetchRiskData 函数（不使用防抖，在 useEffect 中手动防抖）
  const fetchRiskData = useCallback(async () => {
    // 只有当池子和价格数据都准备好时才获取风险数据
    if (!currentDeepBookPool || !basePrice || !quotePrice) {
      setRiskDataSnapshot(null)
      return
    }

    riskDataCancelRef.current = false

    try {
      const riskData = await calculateRiskRatio()

      // 检查请求是否已被取消（防止竞态条件）
      if (!riskDataCancelRef.current) {
        setRiskDataSnapshot({
          totalAssetsValue: riskData.totalAssetsValue,
          totalDebtValue: riskData.totalDebtValue
        })
      }
    } catch (error) {
      console.error('Failed to fetch risk data:', error)
      if (!riskDataCancelRef.current) {
        setRiskDataSnapshot(null)
      }
    }
  }, [currentDeepBookPool, basePrice, quotePrice, calculateRiskRatio])

  fetchRiskDataRef.current = fetchRiskData

  const debouncedFetchRiskData = useDebounceFunction(async () => {
    if (fetchRiskDataRef.current) {
      await fetchRiskDataRef.current()
    }
  }, 300)

  // 异步获取风险数据快照
  // 分离数据获取和计算，避免在每次输入变化时都调用 calculateRiskRatio
  useEffect(() => {
    debouncedFetchRiskData()
    return () => {
      riskDataCancelRef.current = true
    }
  }, [debouncedFetchRiskData])

  const borrowAmountInUSDStr = useMemo(() => borrowAmountInUSD.toString(), [borrowAmountInUSD])
  const riskDataSnapshotKey = useMemo(
    () => (riskDataSnapshot ? `${riskDataSnapshot.totalAssetsValue},${riskDataSnapshot.totalDebtValue}` : null),
    [riskDataSnapshot?.totalAssetsValue, riskDataSnapshot?.totalDebtValue]
  )

  // 同步计算健康度（纯派生计算，基于缓存的风险数据）
  // Margin Risk Level = (A + newAssetValue) / (D + borrowAmount)
  // 其中：
  // - A = Total Asset (从缓存的 riskDataSnapshot 获取，基于当前 margin balance 中的资产)
  // - newAssetValue = 新买入资产的价值（订单执行后会获得的新资产）
  // - D = Total Debt (从缓存的 riskDataSnapshot 获取)
  // - borrowAmount = 计算的借贷数量（USD）
  const healthFactorValue = useMemo(() => {
    // 如果没有输入 amount 或没有风险数据快照，返回 null
    if (!amount || d(amount).lte(0) || !riskDataSnapshot) {
      return null
    }

    // 1. 计算新买入资产的价值
    // 在杠杆交易中，订单总价值分为两部分：
    // - 抵押品部分（1倍）= 订单总价值 / L（被消耗用于支付订单）
    // - 借款部分（(L-1)倍）= 订单总价值 × (L-1) / L（通过借款获得）
    // 净增加的资产价值 = 借款部分，因为抵押品被消耗用于支付订单，不会增加净资产
    // 所以：newAssetValueUSD = borrowAmountInUSD（借款对应的资产部分）
    const newAssetValueUSD = borrowAmountInUSD

    // 2. 计算新的总资产和总负债
    // 新总资产 = 当前总资产 + 新买入资产的价值
    const newTotalAsset = d(riskDataSnapshot.totalAssetsValue).add(newAssetValueUSD)
    // 新总负债 = 当前总负债 + 新借款
    const newTotalDebt = d(riskDataSnapshot.totalDebtValue).add(borrowAmountInUSD)

    console.log('[healthFactorValue] 计算详情:')
    console.log('  当前总资产(USD)=', riskDataSnapshot.totalAssetsValue)
    console.log('  新买入资产价值(USD)=', newAssetValueUSD.toString())
    console.log('  新总资产(USD)=', newTotalAsset.toString())
    console.log('  当前总负债(USD)=', riskDataSnapshot.totalDebtValue)
    console.log('  需借款(USD)=', borrowAmountInUSD.toString())
    console.log('  新总负债(USD)=', newTotalDebt.toString())

    // 如果总负债为 0 或负数，返回 ∞
    if (newTotalDebt.lte(0)) {
      return '∞'
    }

    // 计算健康度 = (A + newAssetValue) / (D + borrowAmount)
    const healthFactor = newTotalAsset.div(newTotalDebt).toNumber()
    // console.log('  健康度=', healthFactor)

    return healthFactor
  }, [amount, borrowAmountInUSDStr, riskDataSnapshotKey, basePrice, quotePrice, tradeType, baseToQuotePrice])

  // 计算健康度状态（纯派生计算）
  const healthFactorStatus = useMemo(() => {
    return getHealthFactorStatus(
      healthFactorValue,
      currentDeepBookPool?.liquidationRiskRatio,
      currentDeepBookPool?.minBorrowRiskRatio,
      currentDeepBookPool?.minWithdrawRiskRatio
    )
  }, [
    healthFactorValue,
    currentDeepBookPool?.liquidationRiskRatio,
    currentDeepBookPool?.minBorrowRiskRatio,
    currentDeepBookPool?.minWithdrawRiskRatio
  ])

  // 计算原始健康度（基于当前账户状态，不包含新的挂单）
  // 如果 totalDebtValue > 0，说明已开仓，使用 riskRatio 作为原始值
  // 如果 totalDebtValue <= 0，说明首次开仓，返回 null
  const healthFactorOriginal = useMemo(() => {
    if (d(totalDebtValue || '0').gt(0) && riskRatio > 0) {
      return riskRatio
    }
    return null
  }, [riskRatio, totalDebtValue])

  // 计算原始健康度状态
  const healthFactorOriginalStatus = useMemo(() => {
    return getHealthFactorStatus(
      healthFactorOriginal,
      currentDeepBookPool?.liquidationRiskRatio,
      currentDeepBookPool?.minBorrowRiskRatio,
      currentDeepBookPool?.minWithdrawRiskRatio
    )
  }, [
    healthFactorOriginal,
    currentDeepBookPool?.liquidationRiskRatio,
    currentDeepBookPool?.minBorrowRiskRatio,
    currentDeepBookPool?.minWithdrawRiskRatio
  ])

  // 计算 total（quote token 数量）= amount × baseToQuotePrice
  const total = useMemo(() => {
    if (!amount || d(amount).lte(0) || !baseToQuotePrice || d(baseToQuotePrice).lte(0)) {
      return '0'
    }
    // total = amount (base token) × baseToQuotePrice = quote token 数量
    return d(amount).mul(d(baseToQuotePrice)).toString()
  }, [amount, baseToQuotePrice])

  // 计算 estTotalUsd（USD 价值）= total × quotePrice
  const estTotalUsd = useMemo(() => {
    // 先计算 total（quote token 数量）
    if (!amount || d(amount).lte(0) || !baseToQuotePrice || d(baseToQuotePrice).lte(0)) {
      return '0'
    }
    const totalValue = d(amount).mul(d(baseToQuotePrice)).toString()
    // 使用 quotePrice 直接计算 USD 价值：total × quotePrice
    if (!totalValue || d(totalValue).lte(0) || !quotePrice || d(quotePrice).lte(0)) {
      return '0'
    }
    return d(totalValue).mul(d(quotePrice)).toString()
  }, [amount, baseToQuotePrice, quotePrice])

  // 判断是否需要将手续费加到所需金额中
  const shouldAddFeeToAmount = useMemo(() => {
    return !currentDeepBookPool?.inWhiteList
  }, [currentDeepBookPool?.inWhiteList])

  const getFeeType = useCallback((payWithDeep: boolean, tradeType: DeepBookPoolMarginTabs, pool?: any): string => {
    if (payWithDeep) {
      // 用 DEEP 支付手续费
      if (pool?.baseAssets?.coin_type?.includes('DEEP') || pool?.quoteAssets?.coin_type?.includes('DEEP')) {
        return pool?.baseAssets?.coin_type?.includes('DEEP') ? pool.baseAssets.coin_type : pool.quoteAssets.coin_type
      }
      // 默认 DEEP coin type
      return '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'
    } else {
      // 根据交易方向决定手续费币种
      return tradeType === DeepBookPoolMarginTabs.Long ? pool?.quoteAssets?.coin_type || '' : pool?.baseAssets?.coin_type || ''
    }
  }, [])

  // 使用 ref 存储所有依赖项，避免依赖项变化导致函数重新创建
  const handleFeeCalculationDepsRef = useRef({
    shouldAddFeeToAmount,
    maxFee,
    tradeType,
    currentDeepBookPool,
    payWithDeep,
    orderType,
    getEstimatedFees
  })

  // 错误检查逻辑
  // 优先级：红色警告 > 黄色警告
  // 检查余额不足：
  // - 市价单：下单数量不能大于最大可下单数量（基于 base token 数量）
  // - 限价单：订单价值（Est.Value 的 USD 价值）不能大于可用资金（availableUSD）
  // amount 是 base token 数量，maxAmount 是最大可下单数量（base token 单位）
  const insufficientBalanceError = useMemo((): ErrorState | null => {
    if (!amount || d(amount).lte(0)) {
      return null
    }
    const deps = handleFeeCalculationDepsRef.current

    const orderTypeParam = deps.tradeType === DeepBookPoolMarginTabs.Long ? 'bid' : 'ask'

    const _error = {
      type: 'insufficient_balance',
      variant: 'red',
      text: `Order size exceeds maximum available amount`
    } as ErrorState

    // 市价单：检查 amount > maxAmount（基于 base token 数量）
    if (orderType === 'Market') {
      if (!maxAmount) {
        return null
      }
      if (d(amount).gt(d(maxAmount)) || d(maxAmount).lte(0)) {
        return _error
      }
    }

    // 限价单：检查 estTotalUsd > availableUSD（基于 USD 价值）
    if (orderType === 'Limit' && orderTypeParam == 'bid') {
      if (!estTotalUsd || !availableUSD) {
        return null
      }
      if (d(estTotalUsd).gt(d(availableUSD)) || d(availableUSD).lte(0)) {
        return _error
      }
    }
    return null
  }, [amount, maxAmount, orderType, estTotalUsd, availableUSD])

  const errorState = useMemo((): ErrorState => {
    // 如果没有池子数据，返回 null
    if (!currentDeepBookPool) {
      return null
    }

    // 0. 优先检查余额不足
    if (insufficientBalanceError) {
      return insufficientBalanceError
    }

    const minSize = currentDeepBookPool.minSize || '0'

    // 2. 检查实际下单数量是否小于 minSize
    if (minSize && d(minSize).gt(0) && amount && d(amount).gt(0)) {
      if (d(amount).lt(d(minSize))) {
        const baseSymbol = currentDeepBookPool.baseAssets?.symbol || ''
        return {
          type: 'order_size_too_small',
          variant: 'yellow',
          text: `Order size must be at least ${formatNumber(minSize)} ${baseSymbol}`
        }
      }
    }

    // 3. 检查健康度是否过低（红色警告）
    // 如果健康度 <= minBorrowRiskRatio，说明借款金额过大，有清算风险

    const minBorrowRiskRatio = currentDeepBookPool.minBorrowRiskRatio ? Number(currentDeepBookPool.minBorrowRiskRatio) : 0
    // 0121沟通小于等于 改成小于禁止下单
    if (healthFactorValue !== null && healthFactorValue !== '∞' && minBorrowRiskRatio > 0 && healthFactorValue < minBorrowRiskRatio) {
      return {
        type: 'borrow_too_high_risk',
        variant: 'red',
        // text: 'Borrow amount too high. The debt may cause liquidation risk, try adjust'
        text: `Your Margin Risk Level must stay above ${minBorrowRiskRatio?.toFixed(2)} to place a margin order`
      }
    }

    // 4. 检查借款金额是否过小（低于 margin pool 的 min borrow）（黄色警告）
    // Long: 借 quote token，与 quote_min_borrow 比较
    // Short: 借 base token，与 base_min_borrow 比较

    const quotePool = deepBookMarginPools.find((pool: any) => pool.coinType === currentDeepBookPool?.quoteAssets?.coin_type) as any
    const basePool = deepBookMarginPools.find((pool: any) => pool.coinType === currentDeepBookPool?.baseAssets?.coin_type) as any

    const quoteMinBorrow =
      quotePool?.minBorrow && currentDeepBookPool?.quoteAssets?.decimals
        ? d(quotePool.minBorrow).div(10 ** Number(currentDeepBookPool.quoteAssets.decimals))
        : null
    const baseMinBorrow =
      basePool?.minBorrow && currentDeepBookPool?.baseAssets?.decimals
        ? d(basePool.minBorrow).div(10 ** Number(currentDeepBookPool.baseAssets.decimals))
        : null

    const minBorrow = tradeType === DeepBookPoolMarginTabs.Long ? quoteMinBorrow : baseMinBorrow

    if (
      calculatedBorrowAmount &&
      amount &&
      d(amount).gt(0) &&
      minBorrow &&
      d(calculatedBorrowAmount).gt(0) &&
      d(calculatedBorrowAmount).lt(minBorrow)
    ) {
      return {
        type: 'borrow_too_small',
        variant: 'yellow',
        text: `Borrow amount too small. The margin pool requires a minimum borrow amount of ${formatNumber(minBorrow.toString())} ${borrowTokenSymbol}`
      }
    }

    // 5. 检查借款金额是否过大, 借款后margin pool超出其Max Utilization Rate（黄色警告）
    const targetPool = tradeType === DeepBookPoolMarginTabs.Long ? quotePool : basePool

    if (targetPool && calculatedBorrowAmount && d(calculatedBorrowAmount).gt(0)) {
      // 使用 API 返回的 remainToBorrow 作为剩余可借量
      const maxBorrowableAmount = d(targetPool.remainToBorrow || '0')

      // 检查借款金额是否超过剩余可借量
      if (d(calculatedBorrowAmount).gt(maxBorrowableAmount)) {
        const maxBorrowableDisplay = formatNumber(maxBorrowableAmount.toString(), 2)
        return {
          type: 'borrow_too_large',
          variant: 'yellow',
          text: `Insufficient liquidity in the margin pool. Maximum borrowable amount is ${maxBorrowableDisplay} ${borrowTokenSymbol}.`
        }
      }
    }

    // 6. 检查 DEEP 余额是否足够支付手续费（黄色警告）
    // 当用户选择用 DEEP 支付手续费时，检查 DEEP 余额是否足够
    if (payWithDeep && !maxFeeIsLoading) {
      const feeAmount = d(maxFee || '0')
      // deepFreeBalance 是字符串，不是对象
      const deepFreeBalanceValue = typeof deepFreeBalance === 'string' ? deepFreeBalance : (deepFreeBalance?.balanceFormat ?? '0')
      if (feeAmount.gt(0) && d(deepFreeBalanceValue || '0').lt(feeAmount)) {
        return {
          type: 'insufficient_deep',
          variant: 'yellow',
          text: 'Insufficient DEEP to cover the fee'
        }
      }
    } else if (!payWithDeep) {
      const feeAmount = d(maxFee || '0')
      if (tradeType === DeepBookPoolMarginTabs.Long) {
        if (d(quoteFreeBalance).lt(feeAmount)) {
          return {
            type: 'insufficient_fee',
            variant: 'yellow',
            text: `Insufficient  ${currentDeepBookPool?.quoteAssets.symbol} to cover the fee`
          }
        }
      } else {
        if (d(baseFreeBalance).lt(feeAmount)) {
          return {
            type: 'insufficient_fee',
            variant: 'yellow',
            text: `Insufficient ${currentDeepBookPool?.baseAssets.symbol} to cover the fee`
          }
        }
      }
    }

    // 7. 检查保证金水平是否过低（蓝色警告）
    // Short: available < min order size
    // Long: margin risk level ≤ min borrow risk ratio
    if (tradeType === DeepBookPoolMarginTabs.Short) {
      // Short: 检查 available < min order size
      // if (available && d(available).gt(0) && minSize && d(minSize).gt(0) && d(available).lt(d(minSize))) {
      // available小于0时应该也提示
      if (minSize && d(minSize).gt(0) && d(available).lt(d(minSize))) {
        return {
          type: 'margin_level_too_low',
          variant: 'blue',
          text: 'Your margin risk level is too low.\nPlease repay debt or deposit more collateral before trading to reduce liquidation risk'
        }
      }
    } else if (tradeType === DeepBookPoolMarginTabs.Long) {
      // Long: 检查 margin risk level ≤ min borrow risk ratio
      if (
        healthFactorOriginal !== null &&
        typeof healthFactorOriginal === 'number' &&
        minBorrowRiskRatio > 0 &&
        healthFactorOriginal <= minBorrowRiskRatio
      ) {
        return {
          type: 'margin_level_too_low',
          variant: 'blue',
          text: 'Your margin risk level is too low.\nPlease repay debt or deposit more collateral before trading to reduce liquidation risk'
        }
      }
    }

    return null
  }, [
    insufficientBalanceError, // 新增的余额不足检查
    healthFactorValue,
    healthFactorOriginal,
    currentDeepBookPool,
    amount, // 使用新的 amount 而不是 longShortSize
    borrowAmountStr,
    deepFreeBalance,
    payWithDeep,
    maxFee,
    maxFeeIsLoading,
    marginLeverageRatio,
    deepBookMarginPools,
    tradeType,
    calculatedBorrowAmount,
    available
  ])

  const feeCancelRef = useRef(false)

  // 同步更新依赖项 ref
  useEffect(() => {
    handleFeeCalculationDepsRef.current = {
      shouldAddFeeToAmount,
      maxFee,
      tradeType,
      currentDeepBookPool,
      payWithDeep,
      orderType,
      getEstimatedFees
    }
  }, [shouldAddFeeToAmount, maxFee, tradeType, currentDeepBookPool, payWithDeep, orderType, getEstimatedFees])

  // 统一处理 getEstimatedFees 调用和状态更新
  const handleFeeCalculation = useCallback((quantity: string, priceForFee: string, updateFeeValues: boolean = true) => {
    const deps = handleFeeCalculationDepsRef.current

    if (deps.shouldAddFeeToAmount && deps.maxFee === '0') {
      setMaxFeeIsLoading(true)
    }

    feeCancelRef.current = false

    // Long 对应 bid（买入），Short 对应 ask（卖出）
    const orderTypeParam = deps.tradeType === DeepBookPoolMarginTabs.Long ? 'bid' : 'ask'

    deps
      .getEstimatedFees(deps.currentDeepBookPool, quantity, priceForFee, orderTypeParam, deps.payWithDeep, deps.orderType === 'Limit')
      .then(res => {
        // 检查请求是否已被取消（防止竞态条件）
        if (!feeCancelRef.current) {
          if (updateFeeValues) {
            // 保存转换后的值（用于显示）
            setTakerFeeDisplay(res.takerFeeDisplay)
            setMakerFeeDisplay(res.makerFeeDisplay)
            setFeeType(res.feeType)
            setMaxFee(res.takerFeeDisplay) // 显示用
          } else {
            // 只更新 feeType，不更新实际费用值（因为没有真实 longShortSize）
            setFeeType(res.feeType)
            setMaxFee('0')
            setTakerFeeDisplay('0')
            setMakerFeeDisplay('0')
          }
          setMaxFeeIsLoading(false)
        }
      })
      .catch(error => {
        console.error('Error calculating fees:', error)
        if (!feeCancelRef.current) {
          setMaxFeeIsLoading(false)
        }
      })
  }, []) // 空依赖数组，所有值都通过 ref 访问

  const calculateFeesRef = useRef<() => void>()

  // 使用 ref 存储 calculateFees 的依赖项
  const calculateFeesDepsRef = useRef({
    amount, // 使用新的 amount 而不是 longShortSize
    payWithDeep,
    tradeType,
    currentDeepBookPool,
    orderType,
    baseToQuotePrice,
    placeOrderPrice,
    handleFeeCalculation,
    getFeeType
  })

  // 同步更新依赖项 ref
  useEffect(() => {
    calculateFeesDepsRef.current = {
      amount, // 使用新的 amount 而不是 longShortSize
      payWithDeep,
      tradeType,
      currentDeepBookPool,
      orderType,
      baseToQuotePrice,
      placeOrderPrice,
      handleFeeCalculation,
      getFeeType
    }
  }, [amount, payWithDeep, tradeType, currentDeepBookPool, orderType, baseToQuotePrice, placeOrderPrice, handleFeeCalculation, getFeeType])

  // 创建计算手续费的函数（不使用防抖，在 useEffect 中手动防抖）
  const calculateFees = useCallback(() => {
    const deps = calculateFeesDepsRef.current

    // 如果 amount 为空或为0，重置手续费
    if (!deps.amount || d(deps.amount).lte(0)) {
      const newFeeType = deps.getFeeType(deps.payWithDeep, deps.tradeType, deps.currentDeepBookPool)
      setFeeType(newFeeType || '')
      setMaxFee('0')
      setTakerFeeDisplay('0')
      setMakerFeeDisplay('0')
      setMaxFeeIsLoading(false)
      return
    }

    // 对于 Market 订单，使用 baseToQuotePrice；对于 Limit 订单，使用 placeOrderPrice
    const priceForFee = deps.orderType === 'Market' ? deps.baseToQuotePrice || deps.currentDeepBookPool?.price || '0' : deps.placeOrderPrice || '0'

    const hasValidInputs = d(priceForFee || '0').gt(0) && d(deps.amount || '0').gt(0)

    if (hasValidInputs) {
      deps.handleFeeCalculation(deps.amount, priceForFee, true)
    } else if (d(priceForFee || '0').gt(0) && deps.currentDeepBookPool?.minSize) {
      // 当只有价格没有 amount 时，使用 minSize 计算示例费用
      deps.handleFeeCalculation(deps.currentDeepBookPool.minSize, priceForFee, false)
    }
  }, []) // 空依赖数组，所有值都通过 ref 访问

  // 更新 ref，确保总是使用最新的函数
  calculateFeesRef.current = calculateFees

  // 创建一个稳定的回调函数用于防抖
  const stableCalculateFeesCallback = useCallback(() => {
    if (calculateFeesRef.current) {
      calculateFeesRef.current()
    }
  }, []) // 空依赖数组，因为函数内部使用 ref 访问

  // 创建防抖的手续费计算函数（使用 ref 存储，避免依赖项变化）
  const debouncedCalculateFeesRef = useRef<() => void>()
  const debouncedCalculateFees = useDebounceFunction(stableCalculateFeesCallback, 300) // 300ms 防抖延迟
  debouncedCalculateFeesRef.current = debouncedCalculateFees

  // 计算手续费 - 依赖实际需要触发计算的原始值，而不是防抖函数本身
  useEffect(() => {
    // 调用防抖函数
    if (debouncedCalculateFeesRef.current) {
      debouncedCalculateFeesRef.current()
    }

    // 清理函数：取消过期的异步请求
    return () => {
      feeCancelRef.current = true
    }
  }, [amount, placeOrderPrice, baseToQuotePrice, orderType, payWithDeep, tradeType, currentDeepBookPool?.address]) // 依赖实际需要触发计算的原始值（使用 amount 而不是 longShortSize）

  // 当 priceStatus 为 false 时，不支持 DEEP 支付手续费
  useEffect(() => {
    if (currentDeepBookPool?.priceStatus === false) {
      setPayWithDeep(false)
    }
  }, [currentDeepBookPool?.priceStatus])

  // 创建包装的 input handlers，用于追踪输入来源
  const handleAmountChange = useCallback((value: string) => {
    setLastInputField('amount')
    setAmount(value)
  }, [])

  const handlePriceChange = useCallback(
    (value: string) => {
      setLastInputField('price')
      setPlaceOrderPrice(value)
    },
    [setPlaceOrderPrice]
  )

  const handleEstValueChange = useCallback((value: string) => {
    setLastInputField('estValue')
    setIsEditingEstValue(true)
    setEstValue(value)
  }, [])

  // Limit 模式下的三向自动计算逻辑
  // 自动检测：哪两个字段有值就用它们计算第三个
  useEffect(() => {
    if (orderType !== 'Limit') return

    const hasAmount = amount && d(amount).gt(0)
    const hasPrice = placeOrderPrice && d(placeOrderPrice).gt(0)
    const hasEstValue = estValue && d(estValue).gt(0)

    // 统计有值的字段数量
    const filledCount = [hasAmount, hasPrice, hasEstValue].filter(Boolean).length

    if (filledCount >= 2) {
      try {
        // 根据最后输入的字段，决定计算哪个字段
        if (lastInputField === 'amount' && hasPrice) {
          // Amount + Price → Est.Value
          const calculated = d(amount).mul(placeOrderPrice).toString()
          if (calculated !== estValue) {
            setEstValue(calculated)
          }
        } else if (lastInputField === 'price' && hasAmount) {
          // Price + Amount → Est.Value
          const calculated = d(amount).mul(placeOrderPrice).toString()
          if (calculated !== estValue) {
            setEstValue(calculated)
          }
        } else if (lastInputField === 'estValue' && hasPrice && d(placeOrderPrice).gt(0)) {
          // Est.Value + Price → Amount (向下 fill lot size)
          const calculatedAmount = d(estValue).div(placeOrderPrice)
          const lotSize = currentDeepBookPool?.lotSize || '1'
          const roundedAmount = d(Math.floor(calculatedAmount.div(lotSize).toNumber()))
            .mul(lotSize)
            .toString()
          if (roundedAmount !== amount && d(roundedAmount).gte(0)) {
            setAmount(roundedAmount)
          }
        } else if (lastInputField === 'estValue' && hasAmount && d(amount).gt(0)) {
          // Est.Value + Amount → Price
          const calculated = d(estValue).div(amount).toString()
          if (calculated !== placeOrderPrice) {
            setPlaceOrderPrice(calculated)
          }
        }
      } catch (error) {
        console.error('Error in limit mode calculation:', error)
      }
    }
  }, [orderType, amount, placeOrderPrice, estValue, lastInputField, currentDeepBookPool?.lotSize, setPlaceOrderPrice])

  // 当不在编辑 Est.Value 时，自动更新 Est.Value 为 amount × price
  // 这确保当 Amount 变化时（比如通过 Est.Value 计算出的 Amount 被向下取整），Est.Value 会自动向下调节
  useEffect(() => {
    if (orderType !== 'Limit' || isEditingEstValue) return
    // 当用户不在编辑 Est.Value 时，自动更新 Est.Value 为 amount × price
    // 这包括两种情况：
    // 1. 用户输入 Amount 或 Price 后，Est.Value 应该更新
    // 2. 用户输入 Est.Value 后，Amount 被向下取整，当用户 blur 时，Est.Value 应该更新为新的 amount × price
    if (amount && placeOrderPrice && d(amount).gt(0) && d(placeOrderPrice).gt(0)) {
      const calculated = d(amount).mul(placeOrderPrice).toString()
      if (calculated !== estValue) {
        setEstValue(calculated)
      }
    }
  }, [orderType, amount, placeOrderPrice, isEditingEstValue, estValue])

  // 当切换订单类型或交易方向时，重置 Est.Value && amount
  useEffect(() => {
    setEstValue('')
    setAmount('')
    setIsEditingEstValue(false)
  }, [orderType, tradeType])

  // 当存款/提现弹窗关闭时（操作成功完成），清空输入框
  useEffect(() => {
    // 检测弹窗从打开变为关闭（true → false）
    if (prevIsOpenAssetsActionModalRef.current === true && isOpenAssetsActionModal === false) {
      setAmount('')
      setEstValue('')
      setIsEditingEstValue(false)
    }
    // 更新上一次的状态
    prevIsOpenAssetsActionModalRef.current = isOpenAssetsActionModal
  }, [isOpenAssetsActionModal])

  // 获取 Available 的币种符号
  const availableSymbol = useMemo(() => {
    if (tradeType === DeepBookPoolMarginTabs.Long) {
      return currentDeepBookPool?.quoteAssets?.symbol || ''
    } else {
      return currentDeepBookPool?.baseAssets?.symbol || ''
    }
  }, [tradeType, currentDeepBookPool?.quoteAssets?.symbol, currentDeepBookPool?.baseAssets?.symbol])

  return {
    tradeType,
    setTradeType,
    orderType,
    setOrderType,
    price: placeOrderPrice,
    setPrice: setPlaceOrderPrice,
    tickSizeUnit,
    lockPrice,

    // ========== 健康度和风险 ==========
    healthFactorValue,
    healthFactorStatus,
    healthFactorOriginal,
    healthFactorOriginalStatus,
    errorState,

    // ========== 手续费相关 ==========
    payWithDeep,
    setPayWithDeep,
    maxFee,
    setMaxFee,
    maxFeeIsLoading,
    setMaxFeeIsLoading,
    takerFeeDisplay,
    makerFeeDisplay,
    feeType,

    // ========== 新增：Amount 输入相关（主要逻辑）==========
    amount, // 实际下单数量（base token）
    setAmount,
    handleAmountChange, // 包装的 Amount 输入 handler（用于追踪输入来源）
    handlePriceChange, // 包装的 Price 输入 handler（用于追踪输入来源）
    handleEstValueChange, // 包装的 Est.Value 输入 handler（用于追踪输入来源）
    available, // Available（支付币数量）
    availableSymbol, // Available 的币种符号
    availableUSD, // Available 的 USD 价值（available × 对应价格）
    maxAmount, // Amount 最大可输入数量（base token 单位）

    calculatedBorrowAmount: calculatedBorrowAmount.toString(), // 计算的借贷数量

    // ========== Est.Value 计算 ==========
    total, // total = amount (base token) × baseToQuotePrice = quote token 数量
    estTotalUsd, // estTotalUsd = total × quotePrice = USD 价值

    // ========== 借贷 token 相关信息 ==========
    borrowTokenSymbol, // 需要借贷的 token symbol（Long: quote, Short: base）
    borrowTokenPrice, // 借贷 token 的价格（Long: quotePrice, Short: basePrice）

    estValue,
    setEstValue,
    isEditingEstValue,
    setIsEditingEstValue,

    // ========== 杠杆率相关 ==========
    leverageRatio: marginLeverageRatio, // 当前池子的杠杆率
    setLeverageRatio // 设置当前池子的杠杆率
  }
}
