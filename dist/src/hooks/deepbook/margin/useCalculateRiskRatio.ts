import useDeepBookStore from '@/store/deepbook'
// import useDeepBookMarginManager from './useDeepBookMarginManager'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import useDeepBookMarginPrices from './useDeepBookMarginPrices'
import useDeepbookMarginDebt from './useDeepbookMarginDebt'
import useMarginOrderUtils from './useMarginOrderUtils'

export type CalculateRiskRatioParams = {
  // deposit/withdraw/repay 操作类型
  action?: 'deposit' | 'withdraw' | 'repay'
  // 操作的 token 类型，true 为 base，false 为 quote
  isBase?: boolean
  // 操作的数量（已格式化的字符串，如 "100"）
  amount?: string
}

export type RiskRatioResult = {
  riskRatio: string
  totalAssetsValue: string
  totalDebtValue: string
  baseAssetValue: string
  quoteAssetValue: string
  baseDebtValue: string
  quoteDebtValue: string
  baseAsset: string
  quoteAsset: string
  baseDebt: string
  quoteDebt: string
  borrowLimit: string
}

/**
 * 计算风险率的工具函数
 * totalAssetsValue / totalDebtValue = riskRatio
 */

export const calculateRiskRatioValue = ({ totalAssetsValue, totalDebtValue }: { totalAssetsValue: string; totalDebtValue: string }) => {
  // 如果资产为 0，返回 0
  if (d(totalAssetsValue).eq(0)) {
    return '0'
  }
  // 如果负债为 0 但资产不为 0，返回 Infinity（表示无穷大）
  if (d(totalDebtValue).eq(0)) {
    return 'Infinity'
  }
  const riskRatio = d(totalAssetsValue).div(d(totalDebtValue)).toString()
  return riskRatio
}

export function useCalculateRiskRatio() {
  const { currentDeepBookPool } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { getMarginManagerId } = useMarginOrderUtils()
  const { baseDebt, quoteDebt, baseDebtUSD, quoteDebtUSD, totalDebtValue: totalDebtValueFromStore } = useDeepbookMarginDebt()
  const { basePrice, quotePrice } = useDeepBookMarginPrices()

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
  const baseTotalBalance = balanceData.baseTotalBalance
  const quoteTotalBalance = balanceData.quoteTotalBalance
  const baseLockedBalance = balanceData.baseLockedBalance
  const quoteLockedBalance = balanceData.quoteLockedBalance
  const baseSettledBalance = balanceData.baseSettledBalance
  const quoteSettledBalance = balanceData.quoteSettledBalance

  // 订阅 marginManagerByAccountOwner，确保当它变化时能重新触发计算
  const marginManagerByAccountOwner = useMarginStore((state: any) => state.marginManagerByAccountOwner)

  // 从 store 读取风险率计算结果（响应式）
  const storeRiskRatio = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return null
    }
    return state.getRiskRatio(currentAccount.address, currentDeepBookPool.address)
  })

  // 获取 store 的方法
  // const setRiskRatio = useMarginStore((state: any) => state.setRiskRatio)
  // const setRiskRatioCalculating = useMarginStore((state: any) => state.setRiskRatioCalculating)
  // const isRiskRatioCalculating = useMarginStore((state: any) => state.isRiskRatioCalculating)

  // 使用 store 中的风险率数据作为基础值
  const currentRiskRatio = useMemo<RiskRatioResult>(() => {
    if (storeRiskRatio) {
      return storeRiskRatio
    }
    return {
      riskRatio: '0',
      totalAssetsValue: '0',
      totalDebtValue: '0',
      baseAssetValue: '0',
      quoteAssetValue: '0',
      baseDebtValue: '0',
      quoteDebtValue: '0',
      baseAsset: '0',
      quoteAsset: '0',
      baseDebt: '0',
      quoteDebt: '0',
      borrowLimit: '0'
    }
  }, [storeRiskRatio])

  // 获取 margin manager ID
  const marginManagerId = getMarginManagerId()

  // 计算风险率（支持 deposit/withdraw 参数）
  const calculateRiskRatio = useCallback(
    async (params?: CalculateRiskRatioParams): Promise<RiskRatioResult> => {
      // 1. 获取全部资产（包含 free + locked + settled）
      // 优先使用 total balance（如果可用），否则回退到 free balance（向后兼容）
      const baseTotal = baseTotalBalance || baseFreeBalance || '0'
      const quoteTotal = quoteTotalBalance || quoteFreeBalance || '0'

      // 获取 locked 和 settled 部分（用于计算，但不参与 deposit/withdraw 调整）
      const baseLocked = baseLockedBalance || '0'
      const quoteLocked = quoteLockedBalance || '0'
      const baseSettled = baseSettledBalance || '0'
      const quoteSettled = quoteSettledBalance || '0'

      // 初始资产 = total balance（包含 free + locked + settled）
      let baseAsset = baseTotal
      let quoteAsset = quoteTotal

      // 计算 repay 操作的实际还款金额
      // 负债扣除金额：可以从钱包还超过 freeBalance 的部分，所以是 min(repayAmount, debt)
      // 资产扣除金额：只能从 free balance 扣除，所以是 min(actualDebtDeductionAmount, freeBalance)
      let actualAssetDeductionAmount: string | undefined = undefined // 从 free balance 扣除的金额（影响 Total Collateral）
      let actualDebtDeductionAmount: string | undefined = undefined // 实际还款金额（影响 Total Debt）
      if (params?.action === 'repay' && params?.amount && params?.amount !== '0') {
        const repayAmount = d(params.amount)
        const debtAmount = params.isBase ? d(baseDebt || '0') : d(quoteDebt || '0')
        const freeAmount = params.isBase ? d(baseFreeBalance || '0') : d(quoteFreeBalance || '0')

        // 先计算实际还款金额 = min(repayAmount, debt)（可以从钱包还超过 freeBalance 的部分）
        actualDebtDeductionAmount = repayAmount.lt(debtAmount) ? repayAmount.toString() : debtAmount.toString()

        // 然后计算从 free balance 扣除的金额 = min(actualDebtDeductionAmount, freeBalance)
        const debtDeduction = d(actualDebtDeductionAmount)
        actualAssetDeductionAmount = debtDeduction.lt(freeAmount) ? debtDeduction.toString() : freeAmount.toString()
      }

      // 如果有 deposit/withdraw 操作，只调整 free balance 部分
      // locked 和 settled balance 保持不变（因为它们不能用于 deposit/withdraw）
      if (params?.action && params?.amount && params?.amount !== '0') {
        // 对于 repay 操作，使用从 free balance 扣除的金额（影响 Total Collateral）
        // 其他操作使用原始金额
        const amount = params.action === 'repay' && actualAssetDeductionAmount ? actualAssetDeductionAmount : params.amount
        if (params.isBase) {
          if (params.action === 'deposit') {
            // deposit: total = (free + amount) + locked + settled
            baseAsset = d(baseFreeBalance || '0')
              .add(amount)
              .add(baseLocked)
              .add(baseSettled)
              .toString()
          } else if (params.action === 'withdraw' || params.action === 'repay') {
            // withdraw/repay: total = (free - amount) + locked + settled
            baseAsset = d(baseFreeBalance || '0')
              .sub(amount)
              .add(baseLocked)
              .add(baseSettled)
              .toString()
            // 确保不为负数
            if (d(baseAsset).lt(0)) {
              baseAsset = d(baseLocked).add(baseSettled).toString()
            }
          }
        } else {
          if (params.action === 'deposit') {
            // deposit: total = (free + amount) + locked + settled
            quoteAsset = d(quoteFreeBalance || '0')
              .add(amount)
              .add(quoteLocked)
              .add(quoteSettled)
              .toString()
          } else if (params.action === 'withdraw' || params.action === 'repay') {
            // withdraw/repay: total = (free - amount) + locked + settled
            quoteAsset = d(quoteFreeBalance || '0')
              .sub(amount)
              .add(quoteLocked)
              .add(quoteSettled)
              .toString()
            // 确保不为负数
            if (d(quoteAsset).lt(0)) {
              quoteAsset = d(quoteLocked).add(quoteSettled).toString()
            }
          }
        }
      }

      // 处理 repay 操作的负债计算
      let calculatedBaseDebt = baseDebt || '0'
      let calculatedQuoteDebt = quoteDebt || '0'
      let calculatedBaseDebtUSD = baseDebtUSD || '0'
      let calculatedQuoteDebtUSD = quoteDebtUSD || '0'
      let totalDebtValue = totalDebtValueFromStore

      if (params?.action === 'repay' && params?.amount && params?.amount !== '0' && basePrice && quotePrice && actualDebtDeductionAmount) {
        // 使用实际还款金额（可以从钱包还超过 freeBalance 的部分）
        const repayAmount = d(actualDebtDeductionAmount)

        if (params.isBase) {
          // 还款 base token，减少 baseDebt
          // 还款金额转换为 USD 价值
          const repayAmountUSD = repayAmount.mul(basePrice)
          // 计算还款后的 baseDebt（不能为负数）
          const newBaseDebt = d(calculatedBaseDebt).sub(repayAmount)
          calculatedBaseDebt = newBaseDebt.gte(0) ? newBaseDebt.toString() : '0'
          // 计算还款后的 baseDebtUSD
          const newBaseDebtUSD = d(calculatedBaseDebtUSD).sub(repayAmountUSD)
          calculatedBaseDebtUSD = newBaseDebtUSD.gte(0) ? newBaseDebtUSD.toString() : '0'
        } else {
          // 还款 quote token，减少 quoteDebt
          // 还款金额转换为 USD 价值
          const repayAmountUSD = repayAmount.mul(quotePrice)
          // 计算还款后的 quoteDebt（不能为负数）
          const newQuoteDebt = d(calculatedQuoteDebt).sub(repayAmount)
          calculatedQuoteDebt = newQuoteDebt.gte(0) ? newQuoteDebt.toString() : '0'
          // 计算还款后的 quoteDebtUSD
          const newQuoteDebtUSD = d(calculatedQuoteDebtUSD).sub(repayAmountUSD)
          calculatedQuoteDebtUSD = newQuoteDebtUSD.gte(0) ? newQuoteDebtUSD.toString() : '0'
        }

        // 重新计算总负债
        totalDebtValue = d(calculatedBaseDebtUSD).add(calculatedQuoteDebtUSD).toString()
      }

      // 3. 获取价格并计算全部资产的价值
      if (!basePrice || !quotePrice) {
        return {
          riskRatio: '0',
          totalAssetsValue: '0',
          totalDebtValue,
          baseAssetValue: '0',
          quoteAssetValue: '0',
          baseDebtValue: calculatedBaseDebtUSD,
          quoteDebtValue: calculatedQuoteDebtUSD,
          baseAsset,
          quoteAsset,
          baseDebt: calculatedBaseDebt,
          quoteDebt: calculatedQuoteDebt,
          borrowLimit: '0'
        }
      }

      // 计算资产价值（美元）
      const baseAssetValue = d(baseAsset).mul(basePrice).toString()
      const quoteAssetValue = d(quoteAsset).mul(quotePrice).toString()
      const totalAssetsValue = d(baseAssetValue).add(quoteAssetValue).toString()

      // 4. 计算风险率：riskRatio = totalAssetsValue / totalDebtValue
      const riskRatio = calculateRiskRatioValue({
        totalAssetsValue,
        totalDebtValue
      })

      // console.log('riskRatio', riskRatio) // result: Infinity

      // 5. 计算可借贷金额（Borrow Limit）
      // 获取 minBorrowRiskRatio，如果不存在则使用默认值 1.25
      const minBorrowRiskRatio = currentDeepBookPool?.minBorrowRiskRatio || '1.25'

      // 计算 ΔA（deposit 时增加的资产价值）
      let deltaA = '0'
      if (params?.action === 'deposit' && params?.amount && params?.amount !== '0' && basePrice && quotePrice) {
        if (params.isBase) {
          // base token deposit: ΔA = amount * basePrice
          deltaA = d(params.amount).mul(basePrice).toString()
        } else {
          // quote token deposit: ΔA = amount * quotePrice
          deltaA = d(params.amount).mul(quotePrice).toString()
        }
      }

      // 计算 Borrow Limit
      // 公式：BorrowLimit = (C + ΔC - MBR ⋅ D) / (MBR - 1)
      // 其中：
      //   C = total asset (totalAssetsValue)
      //   ΔC = 新增 Asset (deposit 时增加的资产价值，即 deltaA)
      //   MBR = min borrow ratio (minBorrowRiskRatio)
      //   D = total debt (totalDebtValue)
      const assetsValueForBorrowLimit = d(totalAssetsValue).add(deltaA).toString()
      let borrowLimit = '0'

      // 检查 MBR > 1，确保分母 (MBR - 1) > 0
      if (d(minBorrowRiskRatio).gt(1)) {
        // 计算分子：C + ΔC - MBR ⋅ D
        const numerator = d(assetsValueForBorrowLimit).sub(d(minBorrowRiskRatio).mul(totalDebtValue))
        // 计算分母：MBR - 1
        const denominator = d(minBorrowRiskRatio).sub(1)

        // 计算 Borrow Limit
        borrowLimit = numerator.div(denominator).toFixed(4)

        // 如果计算结果为负数，则设为 0
        if (d(borrowLimit).lt(0)) {
          borrowLimit = '0'
        }
      }

      return {
        riskRatio,
        totalAssetsValue,
        totalDebtValue,
        baseAssetValue,
        quoteAssetValue,
        baseDebtValue: calculatedBaseDebtUSD,
        quoteDebtValue: calculatedQuoteDebtUSD,
        baseAsset,
        quoteAsset,
        baseDebt: calculatedBaseDebt,
        quoteDebt: calculatedQuoteDebt,
        borrowLimit
      }
    },
    [
      baseFreeBalance,
      quoteFreeBalance,
      baseTotalBalance,
      quoteTotalBalance,
      baseLockedBalance,
      quoteLockedBalance,
      baseSettledBalance,
      quoteSettledBalance,
      baseDebt,
      quoteDebt,
      baseDebtUSD,
      quoteDebtUSD,
      totalDebtValueFromStore,
      basePrice,
      quotePrice,
      currentDeepBookPool?.minBorrowRiskRatio
    ]
  )

  // 使用 ref 存储最新的计算函数，避免 useEffect 依赖问题
  const calculateRiskRatioRef = useRef<() => Promise<RiskRatioResult>>()
  calculateRiskRatioRef.current = calculateRiskRatio

  // 使用 ref 记录上一个账户地址，用于检测账户切换
  const prevAccountRef = useRef<string | undefined>(currentAccount?.address)

  // 监听账户变化，切换账户时清空旧账户的风险率数据
  useEffect(() => {
    const prevAccount = prevAccountRef.current
    const currentAccountAddress = currentAccount?.address

    // 如果账户发生变化（从有账户切换到另一个账户，或从有账户切换到无账户）
    if (prevAccount !== undefined && prevAccount !== currentAccountAddress) {
      const store = useMarginStore.getState()
      // 如果当前有池子地址，清空旧账户的风险率数据
      if (currentDeepBookPool?.address && prevAccount) {
        store.setRiskRatio(prevAccount, currentDeepBookPool.address, {
          riskRatio: '0',
          totalAssetsValue: '0',
          totalDebtValue: '0',
          baseAssetValue: '0',
          quoteAssetValue: '0',
          baseDebtValue: '0',
          quoteDebtValue: '0',
          baseAsset: '0',
          quoteAsset: '0',
          baseDebt: '0',
          quoteDebt: '0',
          borrowLimit: '0'
        })
      }
    }

    // 更新 ref
    prevAccountRef.current = currentAccountAddress
  }, [currentAccount?.address, currentDeepBookPool?.address])

  // 自动更新 store 中的风险率（默认不传参数）
  // 只在依赖项变化时计算，避免重复计算和无限循环
  useEffect(() => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return
    }

    const store = useMarginStore.getState()

    // 如果正在计算中，跳过
    if (store.isRiskRatioCalculating(currentAccount.address, currentDeepBookPool.address)) {
      return
    }

    // 如果 marginManagerByAccountOwner 为 null 或不等于当前账户，说明数据还在加载中或不是当前账户的数据，等待更新
    // 如果缺少必要数据，清空 store 中的风险率
    if (
      marginManagerByAccountOwner === null ||
      marginManagerByAccountOwner !== currentAccount.address ||
      !marginManagerId ||
      !basePrice ||
      !quotePrice
    ) {
      // 清空 store 中的风险率，避免显示旧数据
      store.setRiskRatio(currentAccount.address, currentDeepBookPool.address, {
        riskRatio: '0',
        totalAssetsValue: '0',
        totalDebtValue: '0',
        baseAssetValue: '0',
        quoteAssetValue: '0',
        baseDebtValue: '0',
        quoteDebtValue: '0',
        baseAsset: '0',
        quoteAsset: '0',
        baseDebt: '0',
        quoteDebt: '0',
        borrowLimit: '0'
      })
      return
    }

    // 异步计算并更新 store
    const updateRiskRatio = async () => {
      // 再次检查是否正在计算中（防止并发）
      if (store.isRiskRatioCalculating(currentAccount.address, currentDeepBookPool.address)) {
        return
      }
      // 标记正在计算中
      store.setRiskRatioCalculating(currentAccount.address, currentDeepBookPool.address, true)

      try {
        if (calculateRiskRatioRef.current) {
          const result = await calculateRiskRatioRef.current()
          // console.log('useCalculateRiskRatio: 计算完成', result)
          // 更新 store
          store.setRiskRatio(currentAccount.address, currentDeepBookPool.address, result)
        } else {
          // console.warn('useCalculateRiskRatio: calculateRiskRatioRef.current 为空')
        }
      } catch (error) {
        console.error('Failed to calculate risk ratio:', error)
      } finally {
        // 重置计算状态
        store.setRiskRatioCalculating(currentAccount.address, currentDeepBookPool.address, false)
      }
    }

    updateRiskRatio()
  }, [
    currentAccount?.address,
    currentDeepBookPool?.address,
    marginManagerId,
    basePrice,
    quotePrice,
    baseFreeBalance,
    quoteFreeBalance,
    baseTotalBalance,
    quoteTotalBalance,
    baseLockedBalance,
    quoteLockedBalance,
    baseSettledBalance,
    quoteSettledBalance,
    baseDebt,
    quoteDebt,
    baseDebtUSD,
    quoteDebtUSD,
    totalDebtValueFromStore,
    marginManagerByAccountOwner
  ])

  return {
    // 当前风险率（自动更新，默认不传参数）
    riskRatio: Number(currentRiskRatio.riskRatio),
    totalAssetsValue: currentRiskRatio.totalAssetsValue,
    totalDebtValue: currentRiskRatio.totalDebtValue,
    baseAssetValue: currentRiskRatio.baseAssetValue,
    quoteAssetValue: currentRiskRatio.quoteAssetValue,
    baseDebtValue: currentRiskRatio.baseDebtValue,
    quoteDebtValue: currentRiskRatio.quoteDebtValue,
    baseAsset: currentRiskRatio.baseAsset,
    quoteAsset: currentRiskRatio.quoteAsset,
    baseDebt: currentRiskRatio.baseDebt,
    quoteDebt: currentRiskRatio.quoteDebt,
    borrowLimit: currentRiskRatio.borrowLimit,
    // 计算风险率的方法（支持传入 deposit/withdraw/repay 参数）
    calculateRiskRatio
  }
}
