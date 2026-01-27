import { useCalculateRiskRatio } from '@/hooks/deepbook/margin/useCalculateRiskRatio'
import useDeepbookMarginDebt from '@/hooks/deepbook/margin/useDeepbookMarginDebt'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { d, formatNumber } from '@cetus/utils'
import { Text } from '@chakra-ui/react'
import { useMemo } from 'react'

export default function LiquidationPriceWarning() {
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const { currentAccount } = useAccountStore()
  const deepBookOpenOrders = useDeepBookStore(state => state.deepBookOpenOrders)

  // 从 store 读取 balance 数据
  const balanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return state.getMarginBalanceData('', '')
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address)
  })

  const baseFreeBalance = balanceData.baseFreeBalance
  const quoteFreeBalance = balanceData.quoteFreeBalance
  const { baseDebt, quoteDebt } = useDeepbookMarginDebt()
  const { riskRatio } = useCalculateRiskRatio()

  const marginBalanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address)
  })

  const lockInfo = useMemo(() => {
    const result = {
      baseLock: '0',
      quoteLock: '0',
      deepLock: '0'
    }

    // 如果是 margin pool，从 marginBalanceData 中获取 lock balance
    if (currentDeepBookPool?.isMarginPool && marginBalanceData) {
      result['baseLock'] = marginBalanceData.baseLockedBalance || '0'
      result['quoteLock'] = marginBalanceData.quoteLockedBalance || '0'
      return result
    }

    // 否则，从 deepBookOpenOrders 中计算（spot orders）
    if (deepBookOpenOrders?.length > 0) {
      let baseLock = '0'
      let quoteLock = '0'
      deepBookOpenOrders.forEach((item: any) => {
        if (currentDeepBookPool?.address === item?.address) {
          if (item?.side == 'Buy') {
            // 买单锁定 quote asset (需要用 quote 购买 base)
            quoteLock = d(quoteLock)
              .add(d(item.originalQuantity).sub(d(item.filledQuantity)).mul(item.price))
              .toString()
          } else {
            // 卖单锁定 base asset (需要卖出 base)
            baseLock = d(baseLock)
              .add(d(item.originalQuantity).sub(d(item.filledQuantity)))
              .toString()
          }
        }
      })

      result['baseLock'] = baseLock
      result['quoteLock'] = quoteLock
    }

    return result
  }, [deepBookOpenOrders, currentDeepBookPool, marginBalanceData])

  // 计算清算价格信息
  const liquidationInfo = useMemo(() => {
    // 检查必要数据是否存在
    if (
      !currentDeepBookPool?.price ||
      !currentDeepBookPool?.liquidationRiskRatio ||
      !currentDeepBookPool?.baseAssets ||
      !currentDeepBookPool?.quoteAssets
    ) {
      return null
    }

    const LR = d(currentDeepBookPool.liquidationRiskRatio)
    const Price_mark = d(currentDeepBookPool.price) // Oracle Price
    const Collateral_base = d(baseFreeBalance || '0').add(lockInfo.baseLock)
    const Collateral_quote = d(quoteFreeBalance || '0').add(lockInfo.quoteLock)
    const Debt_base = d(baseDebt || '0')
    const Debt_quote = d(quoteDebt || '0')

    // 判断 Collateral 和 Debt 中是否有不同 token
    // 如果 Collateral 和 Debt 为完全相同 token（都只有 base 或都只有 quote），则不显示（不存在价格风险，仅为数量风险）
    const hasBaseCollateral = Collateral_base.gt(0)
    const hasQuoteCollateral = Collateral_quote.gt(0)
    const hasBaseDebt = Debt_base.gt(0)
    const hasQuoteDebt = Debt_quote.gt(0)

    // 检查是否有债务，如果没有债务则不需要显示
    if (!hasBaseDebt && !hasQuoteDebt) {
      return null
    }

    // 检查 Collateral 和 Debt 是否完全相同的 token
    // 情况1：Collateral 只有 base 且 Debt 只有 base -> 不显示
    // 情况2：Collateral 只有 quote 且 Debt 只有 quote -> 不显示
    const isOnlyBase = hasBaseCollateral && !hasQuoteCollateral && hasBaseDebt && !hasQuoteDebt
    const isOnlyQuote = !hasBaseCollateral && hasQuoteCollateral && !hasBaseDebt && hasQuoteDebt

    // 如果 Collateral 和 Debt 为完全相同 token，则不显示
    if (isOnlyBase || isOnlyQuote) {
      return null
    }

    // 计算清算价格
    // 根据用户需求，优先处理 quote debt，如果没有 quote debt 则处理 base debt
    let Price_liq: ReturnType<typeof d> | null = null
    let isDebtQuote = false

    // 情况1：Debt 为 quote token
    // 清算条件：(Collateral_quote + Collateral_base * Price_liq) / Debt_quote = LR
    // 推导：Price_liq = (LR * Debt_quote - Collateral_quote) / Collateral_base
    if (Debt_quote.gt(0) && Collateral_base.gt(0)) {
      const numerator = LR.mul(Debt_quote).sub(Collateral_quote)
      // 放宽检查条件：允许计算，无效值会在后续检查中被过滤
      Price_liq = numerator.div(Collateral_base)
      isDebtQuote = true
    }

    // 情况2：Debt 为 base token（如果没有 quote debt 或计算失败）
    // 清算条件：(Collateral_quote + Collateral_base * Price_liq) / (Debt_base * Price_liq) = LR
    // 推导：Price_liq = Collateral_quote / (LR * Debt_base - Collateral_base)
    // 注意：即使 Collateral_quote = 0，如果 Collateral_base > 0，也应该能计算
    // 但公式需要 Collateral_quote，所以如果 Collateral_quote = 0，Price_liq = 0，会在后续被过滤
    if (!Price_liq && Debt_base.gt(0)) {
      const denominator = LR.mul(Debt_base).sub(Collateral_base)
      // 放宽检查条件：允许计算，无效值会在后续检查中被过滤
      // 如果 denominator = 0 或 Collateral_quote = 0，Price_liq 会是 0 或 Infinity，会在后续被过滤
      if (!denominator.eq(0)) {
        Price_liq = Collateral_quote.div(denominator)
        isDebtQuote = false
      }
    }

    // 如果没有有效的清算价格，不显示
    if (!Price_liq || Price_liq.lte(0) || Price_liq.isNaN() || !Price_liq.isFinite()) {
      return null
    }

    // 计算距离清算价的百分比
    // Distance = |Price_mark - Price_liq| / Price_mark
    const distance = Price_mark.sub(Price_liq).abs().div(Price_mark).mul(100)

    if (distance.isNaN() || !distance.isFinite() || distance.lte(0)) {
      return null
    }

    // 根据清算价与市场价的比较决定价格变化方向
    // 清算价低于市场价格 -> 价格下跌 (drops)
    // 清算价高于市场价格 -> 价格上涨 (rises)
    const isPriceDrop = Price_liq.lt(Price_mark)

    return {
      liquidationPrice: Price_liq.toString(),
      distance: distance.toString(),
      isDebtQuote,
      isPriceDrop,
      baseTokenSymbol: currentDeepBookPool.baseAssets.symbol || 'Base token',
      quoteTokenSymbol: currentDeepBookPool.quoteAssets.symbol || 'Quote token'
    }
  }, [
    currentDeepBookPool?.price,
    currentDeepBookPool?.liquidationRiskRatio,
    currentDeepBookPool?.baseAssets,
    currentDeepBookPool?.quoteAssets,
    baseFreeBalance,
    quoteFreeBalance,
    baseDebt,
    quoteDebt,
    riskRatio,
    lockInfo
  ])

  // 如果没有清算信息，不显示
  if (!liquidationInfo) {
    return null
  }

  // 格式化清算价格（使用合适的小数位数）
  const formattedLiquidationPrice = formatNumber(liquidationInfo.liquidationPrice, 4)
  const formattedDistance = formatNumber(liquidationInfo.distance, 2)

  // 确定价格变化方向和主句动词（根据清算价与市场价的比较）
  // 清算价低于市场价格 -> 价格下跌 (drops)
  // 清算价高于市场价格 -> 价格上涨 (rises)
  const priceChangeDirection = liquidationInfo.isPriceDrop ? 'drops by' : 'rises by'
  const mainVerb = liquidationInfo.isPriceDrop ? 'drops to' : 'rises to'

  return (
    <Text fontSize="12px" lineHeight="16px" color="text_paragraph" p="6px 8px" bg="primary_opacity.10" borderRadius="8px" my="4px">
      If {liquidationInfo.baseTokenSymbol} price {mainVerb}
      <Text as="span" color="text_caption" fontSize="12px" lineHeight="16px">
        &nbsp;{formattedLiquidationPrice}&nbsp;{liquidationInfo.quoteTokenSymbol}
      </Text>{' '}
      ({priceChangeDirection}&nbsp;
      {formattedDistance}%), your position may be liquidated.
    </Text>
  )
}
