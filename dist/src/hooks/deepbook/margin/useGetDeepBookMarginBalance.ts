import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import { useAccountStore } from '@cetus/stores'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { bnToAmount, d } from '@cetus/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { mainnetCoins, testnetCoins } from '../useGetDeepBookPools'
import useDeepBookMarginPrices from './useDeepBookMarginPrices'
import useMarginLockedBalance from './useMarginLockedBalance'
import useMarginOrderUtils from './useMarginOrderUtils'

// 批量获取所有 margin 池子的余额数据
async function fetchAllMarginPoolsBalance(
  marginUtils: any,
  accountAddress: string,
  marginManagerByAccount: any[],
  deepBookPools: any[],
  setMarginBalance: any,
  setBalanceFetching: any,
  setMarginBalanceData: any,
  getMarginBalanceData: any,
  getMarginPrice: any,
  deepCoin: any,
  deepBookOpenOrders: any[],
  marginSettleList: any[]
) {
  if (!accountAddress || !marginManagerByAccount || marginManagerByAccount.length === 0) {
    return
  }

  // 并行获取所有 margin 池子的余额
  const balancePromises = marginManagerByAccount.map(async (manager: any) => {
    const poolAddress = manager.deepbook_pool_id
    const managerId = manager.margin_manager_id

    if (!poolAddress || !managerId) {
      return null
    }

    // 查找对应的池子信息
    const pool = deepBookPools.find((p: any) => p.address === poolAddress)
    if (!pool || !pool.baseAssets?.coin_type || !pool.quoteAssets?.coin_type) {
      return null
    }

    // 检查是否正在请求中
    // const store = useMarginStore.getState()
    // console.log('🚀🚀🚀 ~ useGetDeepBookMarginBalance.ts:52 ~ fetchAllMarginPoolsBalance ~ store.isBalanceFetching(accountAddress, poolAddress):', store.isBalanceFetching(accountAddress, poolAddress))
    // if (store.isBalanceFetching(accountAddress, poolAddress)) {
    //   return null
    // }

    // 检查是否已有有效数据（检查 marginBalanceData，而不仅仅是 marginBalance）
    // 使用 managerId 来区分不同的 Manager
    const existingBalanceData = getMarginBalanceData(accountAddress, poolAddress, managerId)
    const hasValidData =
      existingBalanceData.totalCollateralValue !== '0' || existingBalanceData.baseFreeBalance !== '0' || existingBalanceData.quoteFreeBalance !== '0'
    if (hasValidData) {
      return null
    }

    // 标记正在请求中
    setBalanceFetching(accountAddress, poolAddress, true)

    try {
      const { base, quote, deep } = await fetchSingleMarginManagerBalance(
        marginUtils,
        accountAddress,
        managerId,
        pool.baseAssets.coin_type,
        pool.quoteAssets.coin_type,
        pool.baseAssets.decimals || 0,
        pool.quoteAssets.decimals || 0,
        deepCoin.decimals
      )

      // 存储余额
      setMarginBalance(accountAddress, poolAddress, base, quote, deep)

      // 获取价格（直接从 store 读取最新状态，确保获取到最新的价格数据）
      const { basePrice, quotePrice } = getMarginPrice(poolAddress)

      // 计算 USD 价值
      const baseMarginBalanceUSD = basePrice && base !== '0' ? d(base).mul(basePrice).toString() : '0'
      const quoteMarginBalanceUSD = quotePrice && quote !== '0' ? d(quote).mul(quotePrice).toString() : '0'
      // 获取 locked balance - 从 deepBookOpenOrders 中计算该池子的 locked balance
      let baseLockedBalance = '0'
      let quoteLockedBalance = '0'
      const poolOrders = (deepBookOpenOrders || []).filter((order: any) => order.address === poolAddress && order.instrument === 'Margin')

      poolOrders.forEach((order: any) => {
        const remainingQuantity = d(order.originalQuantity || '0').sub(order.filledQuantity || '0')
        if (order.side === 'Buy' || order.side === 'Long') {
          // 买单/Long锁定 quote asset
          quoteLockedBalance = d(quoteLockedBalance)
            .add(remainingQuantity.mul(order.price || '0'))
            .toString()
        } else {
          // 卖单/Short锁定 base asset
          baseLockedBalance = d(baseLockedBalance).add(remainingQuantity).toString()
        }
      })

      const baseLockedBalanceUSD = basePrice && baseLockedBalance !== '0' ? d(baseLockedBalance).mul(basePrice).toString() : '0'
      const quoteLockedBalanceUSD = quotePrice && quoteLockedBalance !== '0' ? d(quoteLockedBalance).mul(quotePrice).toString() : '0'

      // 获取 settled balance - 从 marginSettleList 中获取
      const settled = (marginSettleList || []).find((item: any) => item.address === poolAddress)
      const baseSettledBalance = settled?.baseSettle || '0'
      const quoteSettledBalance = settled?.quoteSettle || '0'
      const baseSettledBalanceUSD = basePrice && baseSettledBalance !== '0' ? d(baseSettledBalance).mul(basePrice).toString() : '0'
      const quoteSettledBalanceUSD = quotePrice && quoteSettledBalance !== '0' ? d(quoteSettledBalance).mul(quotePrice).toString() : '0'

      // 计算 total balance
      const baseTotalBalance = d(base).add(baseLockedBalance).add(baseSettledBalance).toString()
      const quoteTotalBalance = d(quote).add(quoteLockedBalance).add(quoteSettledBalance).toString()
      const baseTotalBalanceUSD = d(baseMarginBalanceUSD).add(baseLockedBalanceUSD).add(baseSettledBalanceUSD).toString()
      const quoteTotalBalanceUSD = d(quoteMarginBalanceUSD).add(quoteLockedBalanceUSD).add(quoteSettledBalanceUSD).toString()

      // 计算 total collateral value
      const totalCollateralValue = d(baseTotalBalanceUSD).add(quoteTotalBalanceUSD).toString()

      // 存储完整的 balance 数据（使用 managerId 区分不同的 Manager）
      setMarginBalanceData(accountAddress, poolAddress, managerId, {
        baseFreeBalance: base,
        quoteFreeBalance: quote,
        baseLockedBalance,
        quoteLockedBalance,
        baseSettledBalance,
        quoteSettledBalance,
        baseTotalBalance,
        quoteTotalBalance,
        baseMarginBalanceUSD,
        quoteMarginBalanceUSD,
        baseLockedBalanceUSD,
        quoteLockedBalanceUSD,
        baseSettledBalanceUSD,
        quoteSettledBalanceUSD,
        baseTotalBalanceUSD,
        quoteTotalBalanceUSD,
        totalCollateralValue,
        basePrice: basePrice || null,
        quotePrice: quotePrice || null
      })

      return { poolAddress, success: true }
    } catch (error) {
      console.error(`Failed to fetch balance for pool ${poolAddress}:`, error)
      setMarginBalance(accountAddress, poolAddress, '0', '0', '0')
      return { poolAddress, success: false }
    } finally {
      setBalanceFetching(accountAddress, poolAddress, false)
    }
  })

  await Promise.all(balancePromises)
}

/**
 * 获取指定 margin manager 的余额（纯函数，不依赖 React hooks）
 * @param marginUtils MarginUtils 实例
 * @param account 账户地址
 * @param managerId margin manager ID
 * @param baseCoinType base 币种类型
 * @param quoteCoinType quote 币种类型
 * @param baseDecimals base 币种精度
 * @param quoteDecimals quote 币种精度
 * @returns Promise<{ base: string; quote: string }>
 */
export async function fetchSingleMarginManagerBalance(
  marginUtils: any,
  account: string,
  managerId: string,
  baseCoinType: string,
  quoteCoinType: string,
  baseDecimals: number,
  quoteDecimals: number,
  deepDecimals: number
): Promise<{ base: string; quote: string; deep: string }> {
  try {
    const params = {
      account,
      marginManager: managerId,
      baseCoinType,
      quoteCoinType
    }

    const [baseBalanceRaw, quoteBalanceRaw, deepBalanceRaw] = await Promise.all([
      marginUtils.getBaseBalance(params).catch(() => '0'),
      marginUtils.getQuoteBalance(params).catch(() => '0'),
      marginUtils.getDeepBalance(params).catch(() => '0')
    ])

    const baseBalanceFormatted = bnToAmount(baseBalanceRaw, baseDecimals).toString()
    const quoteBalanceFormatted = bnToAmount(quoteBalanceRaw, quoteDecimals).toString()
    const deepBalanceFormatted = bnToAmount(deepBalanceRaw, deepDecimals).toString()
    return {
      base: baseBalanceFormatted,
      quote: quoteBalanceFormatted,
      deep: deepBalanceFormatted
    }
  } catch (error) {
    console.error(`Failed to get margin balance for manager ${managerId}:`, error)
    return { base: '0', quote: '0', deep: '0' }
  }
}

export default function useGetDeepBookMarginBalance(managerId?: string | null, poolAddress?: string | null) {
  // 使用 selector 精确订阅，只订阅需要的字段，避免对象引用变化导致重新渲染
  const currentAccountAddress = useAccountStore((state: any) => state.currentAccount?.address)
  const currentAccount = useAccountStore((state: any) => state.currentAccount)
  const deepBookPools = useDeepBookStore((state: any) => state.deepBookPools)

  // 使用 selector 精确订阅池子地址和 isMarginPool，而不是整个对象
  const currentDeepBookPoolAddress = useDeepBookStore((state: any) => state.currentDeepBookPool?.address)
  const currentDeepBookPoolIsMarginPool = useDeepBookStore((state: any) => state.currentDeepBookPool?.isMarginPool)
  // 仍然需要整个对象用于获取 baseAssets 和 quoteAssets
  const currentDeepBookPool = poolAddress
    ? deepBookPools.find((pool: any) => pool.address === poolAddress)
    : useDeepBookStore((state: any) => state.currentDeepBookPool)

  const { getMarginUtils } = useMarginOrderUtils()

  // 使用 selector 精确订阅 store 中的值
  const marginManagerByAccountOwner = useMarginStore((state: any) => state.marginManagerByAccountOwner)
  // 订阅当前选择的 manager，当用户选择不同的 manager 时触发重新计算
  const currentSelectedManagerInfo = useMarginStore((state: any) => {
    if (!currentAccountAddress) return null
    return state.getCurrentMarginManagerInfo(currentAccountAddress)
  })

  const marginManagerByAccount = useMarginStore((state: any) => state.marginManagerByAccount)
  const setMarginBalance = useMarginStore((state: any) => state.setMarginBalance)
  const setBalanceFetching = useMarginStore((state: any) => state.setBalanceFetching)
  const isBalanceFetching = useMarginStore((state: any) => state.isBalanceFetching)
  const setLockedOrdersFetching = useMarginStore((state: any) => state.setLockedOrdersFetching)
  const setMarginBalanceData = useMarginStore((state: any) => state.setMarginBalanceData)
  const getMarginBalanceData = useMarginStore((state: any) => state.getMarginBalanceData)
  const getMarginPrice = useMarginStore((state: any) => state.getMarginPrice)
  const marginPrices = useMarginStore((state: any) => {
    return state.marginPrices
  })
  const setBatchBalanceFetching = useMarginStore((state: any) => state.setBatchBalanceFetching)
  const isBatchBalanceFetching = useMarginStore((state: any) => state.isBatchBalanceFetching)

  // 使用 selector 订阅特定账户和池子的余额，确保组件能响应更新
  const marginBalance = useMarginStore((state: any) => {
    if (!currentAccountAddress || !currentDeepBookPoolAddress) {
      return { base: '0', quote: '0', deep: '0' }
    }
    // 直接从 marginBalances 读取，更符合 zustand 的用法
    const key = `${currentAccountAddress}-${currentDeepBookPoolAddress}`
    return state.marginBalances[key] || { base: '0', quote: '0', deep: '0' }
  })

  const baseMarginBalance = marginBalance.base
  const quoteMarginBalance = marginBalance.quote
  const deepMarginBalance = marginBalance.deep

  // 延迟价格获取，不在顶层获取，避免价格更新导致整个 hook 重新执行
  // const { basePrice, quotePrice } = useDeepBookMarginPrices()
  // 使用 ref 跟踪上一次的 managerId，避免重复触发
  const prevManagerIdRef = useRef<string | null>(null)

  // 获取 locked balance
  const { baseLockedBalance, quoteLockedBalance, baseLockedBalanceUSD, quoteLockedBalanceUSD, refreshMarginLockedOrders } = useMarginLockedBalance()

  // 获取 margin settle list
  const marginSettleList = useMarginStore((state: any) => state.marginSettleList)

  // 计算当前池子的 settled balance（直接计算，不需要缓存）
  const settled =
    currentDeepBookPoolAddress && marginSettleList?.length > 0
      ? marginSettleList.find((item: any) => item.address === currentDeepBookPoolAddress)
      : null
  const baseSettledBalance = settled?.baseSettle || '0'
  const quoteSettledBalance = settled?.quoteSettle || '0'

  // 延迟获取价格，只在计算 USD 价值时获取，避免价格更新导致整个 hook 重新执行
  const { basePrice, quotePrice } = useDeepBookMarginPrices(poolAddress as string)

  // 计算 settled balance 的 USD 价值（直接计算，不需要缓存）
  const baseSettledBalanceUSD =
    !basePrice || !baseSettledBalance || baseSettledBalance === '0' ? '0' : d(baseSettledBalance).mul(basePrice).toString()

  const quoteSettledBalanceUSD =
    !quotePrice || !quoteSettledBalance || quoteSettledBalance === '0' ? '0' : d(quoteSettledBalance).mul(quotePrice).toString()

  const [marginManagerId, setMarginManagerId] = useState<string | null>(null)

  // 使用 ref 记录上一个账户地址，用于检测账户切换
  const prevAccountRef = useRef<string | undefined>(currentAccountAddress)

  // 监听账户变化，切换账户时清空余额缓存并强制刷新
  useEffect(() => {
    const prevAccount = prevAccountRef.current

    // 如果账户发生变化（从有账户切换到另一个账户，或从有账户切换到无账户）
    if (prevAccount !== undefined && prevAccount !== currentAccountAddress) {
      // 如果当前有池子地址，清空旧账户的余额缓存
      if (currentDeepBookPoolAddress && prevAccount) {
        setMarginBalance(prevAccount, currentDeepBookPoolAddress, '0', '0', '0')
      }
      // 账户切换时，清空新账户的缓存数据（避免显示旧数据）
      if (currentAccountAddress && currentDeepBookPoolAddress) {
        const store = useMarginStore.getState()
        const newAccountBalance = store.getMarginBalance(currentAccountAddress, currentDeepBookPoolAddress)
        if (newAccountBalance.base !== '0' || newAccountBalance.quote !== '0') {
          setMarginBalance(currentAccountAddress, currentDeepBookPoolAddress, '0', '0', '0')
        }
        setBalanceFetching(currentAccountAddress, currentDeepBookPoolAddress, false)
      }
      // 账户切换时，重置 prevManagerIdRef
      prevManagerIdRef.current = null
    }

    // 更新 ref
    prevAccountRef.current = currentAccountAddress
  }, [currentAccountAddress, currentDeepBookPoolAddress, setMarginBalance, setBalanceFetching])

  // 使用 useGetTokenBalance 获取钱包余额
  const { balanceInfo: baseBalanceInfo, fetchCoinBalance: fetchBaseBalance } = useGetTokenBalance(currentDeepBookPool?.baseAssets)
  const { balanceInfo: quoteBalanceInfo, fetchCoinBalance: fetchQuoteBalance } = useGetTokenBalance(currentDeepBookPool?.quoteAssets)

  // 创建 DEEP coin 对象用于获取余额（直接使用，不需要缓存）
  const DeepCoin = envConfigs.env == 'testnet' ? testnetCoins['DEEP'] : mainnetCoins[0]
  const deepCoin = {
    coin_type: DeepCoin.coin_type,
    decimals: DeepCoin.decimals,
    symbol: DeepCoin.symbol,
    name: DeepCoin.name,
    address: (DeepCoin as any)?.address || DeepCoin.coin_type
  }
  const { balanceInfo: deepBalanceInfo, fetchCoinBalance: fetchDeepBalance } = useGetTokenBalance(deepCoin)

  // 获取 margin manager ID（如果传入了 managerId 参数则使用传入的，否则从 store 中的 marginManagerByAccount 获取）
  useEffect(() => {
    // 如果传入了 managerId 参数，直接使用
    if (managerId !== undefined) {
      setMarginManagerId(managerId || null)
      return
    }

    // 否则从 store 中查找
    if (!currentAccountAddress || !currentDeepBookPoolAddress || !currentDeepBookPoolIsMarginPool) {
      setMarginManagerId(null)
      return
    }

    try {
      // 从 store 获取最新数据并验证
      const store = useMarginStore.getState()
      const latestMarginManagerByAccount = store.marginManagerByAccount
      const marginManagerByAccountOwner = store.marginManagerByAccountOwner
      // 获取当前选择的 manager，用于触发重新计算
      const currentSelectedManager = store.getCurrentMarginManagerInfo(currentAccountAddress)

      // 验证：确保 marginManagerByAccount 属于当前账户
      // 如果 marginManagerByAccountOwner 为 null，说明数据还在加载中，等待更新
      if (marginManagerByAccountOwner === null) {
        setMarginManagerId(null)
        return
      }

      // 如果 marginManagerByAccountOwner 不等于当前账户，说明是旧账户的数据，不更新
      if (marginManagerByAccountOwner !== currentAccountAddress) {
        setMarginManagerId(null)
        return
      }

      if (latestMarginManagerByAccount && latestMarginManagerByAccount.length > 0) {
        // 优先使用用户选择的 manager
        const selectedManagerInfo = store.getCurrentMarginManagerInfo(currentAccountAddress)

        let marginManager: any = null
        let foundManagerId: string | null = null

        // 如果用户选择了 manager，验证它是否属于当前池子
        if (selectedManagerInfo?.margin_manager_id && currentDeepBookPoolAddress) {
          const selectedManager = (latestMarginManagerByAccount as any[]).find(
            (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPoolAddress
          )
          if (selectedManager) {
            marginManager = selectedManager
            foundManagerId = selectedManagerInfo.margin_manager_id
          }
        }

        // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找
        if (!foundManagerId) {
          marginManager = (latestMarginManagerByAccount as any[]).find((m: any) => m?.deepbook_pool_id === currentDeepBookPoolAddress)
          foundManagerId = marginManager?.margin_manager_id || null
        }

        setMarginManagerId(foundManagerId)
      } else {
        setMarginManagerId(null)
      }
    } catch (error) {
      console.error('Failed to get margin manager:', error)
      setMarginManagerId(null)
    }
  }, [
    managerId,
    currentAccountAddress,
    currentDeepBookPoolAddress,
    currentDeepBookPoolIsMarginPool,
    marginManagerByAccountOwner,
    currentSelectedManagerInfo?.margin_manager_id // 当用户选择不同的 manager 时触发重新计算
  ])

  // 使用 ref 存储 fetchMarginBalances，避免 useEffect 依赖导致循环
  const fetchMarginBalancesRef = useRef<((managerIdOverride?: string | null) => Promise<void>) | null>(null)

  // 使用 ref 保存请求 key，用于去重
  const lastBalanceRequestKeyRef = useRef<string | null>(null)

  // 获取 margin trading 余额的函数
  // 支持传入 managerId 参数，用于刷新时使用最新的 managerId
  // 从 store 获取最新值，避免闭包问题
  const fetchMarginBalances = useCallback(
    async (managerIdOverride?: string | null) => {
      // 从 store 获取最新值，避免闭包问题
      const accountAddress = useAccountStore.getState().currentAccount?.address
      const pool = useDeepBookStore.getState().currentDeepBookPool
      const marginManagerByAccount = useMarginStore.getState().marginManagerByAccount

      if (!accountAddress || !pool?.address) {
        return
      }

      // 从 marginManagerByAccount 计算最新的 marginManagerId（先计算，用于生成请求 key）
      let managerIdToUse = managerIdOverride
      if (managerIdToUse === undefined) {
        if (marginManagerByAccount?.length > 0) {
          // 优先使用用户选择的 manager
          const store = useMarginStore.getState()
          const selectedManagerInfo = store.getCurrentMarginManagerInfo(accountAddress)

          // 如果用户选择了 manager，验证它是否属于当前池子
          if (selectedManagerInfo?.margin_manager_id) {
            const selectedManager = (marginManagerByAccount as any[]).find(
              (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === pool.address
            )
            if (selectedManager) {
              managerIdToUse = selectedManagerInfo.margin_manager_id
            }
          }

          // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找
          if (!managerIdToUse) {
            const marginManager = (marginManagerByAccount as any[]).find((m: any) => m?.deepbook_pool_id === pool.address)
            managerIdToUse = marginManager?.margin_manager_id || null
          }
        } else {
          managerIdToUse = null
        }
      }

      if (!managerIdToUse || !pool?.baseAssets?.coin_type || !pool?.quoteAssets?.coin_type) {
        // 更新全局 store
        setMarginBalance(accountAddress, pool.address, '0', '0', '0')
        return
      }

      // 生成请求 key，用于去重
      const requestKey = `${accountAddress}-${pool.address}-${managerIdToUse}`

      // 如果正在请求相同的 key，直接返回
      if (lastBalanceRequestKeyRef.current === requestKey && isBalanceFetching(accountAddress, pool.address)) {
        return
      }

      // 防重复请求：检查 store 中是否正在请求中（全局状态）
      if (isBalanceFetching(accountAddress, pool.address)) {
        return
      }

      // 请求开始前再次验证账户是否还是当前账户（防止在计算 managerId 过程中账户切换）
      const currentAccountBeforeRequest = useAccountStore.getState().currentAccount?.address
      const currentPoolBeforeRequest = useDeepBookStore.getState().currentDeepBookPool?.address
      if (accountAddress !== currentAccountBeforeRequest || pool.address !== currentPoolBeforeRequest) {
        // 账户或池子已切换，不发起请求
        return
      }

      // 再次从 store 获取最新的 marginManagerByAccount，确保使用的是当前账户的数据
      const store = useMarginStore.getState()
      const latestMarginManagerByAccount = store.marginManagerByAccount
      const marginManagerByAccountOwner = store.marginManagerByAccountOwner

      // 如果 marginManagerByAccount 为空或 undefined，说明还在加载中，等待更新完成
      if (latestMarginManagerByAccount === undefined) {
        return
      }

      // 验证：确保 marginManagerByAccount 属于当前账户
      // 如果 marginManagerByAccountOwner 为 null，说明数据还在加载中，等待更新
      if (marginManagerByAccountOwner === null) {
        return
      }

      // 如果 marginManagerByAccountOwner 不等于当前账户，说明是旧账户的数据，不更新
      if (marginManagerByAccountOwner !== accountAddress) {
        return
      }

      // 如果 marginManagerByAccount 为空数组，说明当前账户没有 margin manager
      if (latestMarginManagerByAccount.length === 0) {
        setMarginBalance(accountAddress, pool.address, '0', '0', '0')
        return
      }

      let finalManagerIdToUse = managerIdOverride
      if (finalManagerIdToUse === undefined) {
        // 优先使用用户选择的 manager
        const selectedManagerInfo = store.getCurrentMarginManagerInfo(accountAddress)

        // 如果用户选择了 manager，验证它是否属于当前池子
        if (selectedManagerInfo?.margin_manager_id) {
          const selectedManager = (latestMarginManagerByAccount as any[]).find(
            (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === pool.address
          )
          if (selectedManager) {
            finalManagerIdToUse = selectedManagerInfo.margin_manager_id
          }
        }

        // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找
        if (!finalManagerIdToUse) {
          const marginManager = (latestMarginManagerByAccount as any[]).find((m: any) => m?.deepbook_pool_id === pool.address)
          finalManagerIdToUse = marginManager?.margin_manager_id || null
        }
      }

      if (!finalManagerIdToUse) {
        setMarginBalance(accountAddress, pool.address, '0', '0', '0')
        return
      }

      // 验证：确保 managerId 确实存在于当前账户的 marginManagerByAccount 中
      // 这是一个额外的安全检查，防止使用旧账户的 managerId
      const managerExists = (latestMarginManagerByAccount as any[]).some(
        (m: any) => m?.margin_manager_id === finalManagerIdToUse && m?.deepbook_pool_id === pool.address
      )

      if (!managerExists) {
        setMarginBalance(accountAddress, pool.address, '0', '0', '0')
        return
      }

      // 保存请求开始时的所有值，确保整个请求过程使用一致的值
      const requestAccountAddress = accountAddress
      const requestPoolAddress = pool.address
      const requestManagerId = finalManagerIdToUse
      const requestBaseCoinType = pool.baseAssets.coin_type
      const requestQuoteCoinType = pool.quoteAssets.coin_type
      const requestBaseDecimals = pool.baseAssets.decimals || 0
      const requestQuoteDecimals = pool.quoteAssets.decimals || 0

      // 生成最终的请求 key（使用 finalManagerIdToUse）
      const finalRequestKey = `${requestAccountAddress}-${requestPoolAddress}-${requestManagerId}`

      // 标记正在请求中（全局状态）
      setBalanceFetching(requestAccountAddress, requestPoolAddress, true)

      // 保存请求 key
      lastBalanceRequestKeyRef.current = finalRequestKey

      try {
        const marginUtils = getMarginUtils()

        const {
          base: baseBalanceFormatted,
          quote: quoteBalanceFormatted,
          deep: deepBalanceFormatted
        } = await fetchSingleMarginManagerBalance(
          marginUtils,
          requestAccountAddress,
          requestManagerId,
          requestBaseCoinType,
          requestQuoteCoinType,
          requestBaseDecimals,
          requestQuoteDecimals,
          deepCoin.decimals
        )

        // 请求完成时，严格检查账户和池子是否还是请求开始时的值
        const currentAccountAddress = useAccountStore.getState().currentAccount?.address
        const currentPoolAddress = useDeepBookStore.getState().currentDeepBookPool?.address

        // 再次验证请求 key 是否还匹配
        const currentRequestKey = `${currentAccountAddress}-${currentPoolAddress}-${requestManagerId}`

        if (requestAccountAddress === currentAccountAddress && requestPoolAddress === currentPoolAddress && currentRequestKey === finalRequestKey) {
          setMarginBalance(requestAccountAddress, requestPoolAddress, baseBalanceFormatted, quoteBalanceFormatted, deepBalanceFormatted)
        }
      } catch (error) {
        console.error('Failed to get margin balances:', error)
        // 请求完成时，严格检查账户和池子是否还是请求开始时的值
        const currentAccountAddress = useAccountStore.getState().currentAccount?.address
        const currentPoolAddress = useDeepBookStore.getState().currentDeepBookPool?.address
        if (requestAccountAddress === currentAccountAddress && requestPoolAddress === currentPoolAddress) {
          setMarginBalance(requestAccountAddress, requestPoolAddress, '0', '0', '0')
        }
      } finally {
        // 请求完成，重置标记（全局状态）
        // 只有在账户和池子还是请求开始时的值时才重置
        const currentAccountAddress = useAccountStore.getState().currentAccount?.address
        const currentPoolAddress = useDeepBookStore.getState().currentDeepBookPool?.address
        const currentRequestKey = `${currentAccountAddress}-${currentPoolAddress}-${requestManagerId}`

        if (requestAccountAddress === currentAccountAddress && requestPoolAddress === currentPoolAddress && currentRequestKey === finalRequestKey) {
          setBalanceFetching(requestAccountAddress, requestPoolAddress, false)
          // 清除请求 key
          if (lastBalanceRequestKeyRef.current === finalRequestKey) {
            lastBalanceRequestKeyRef.current = null
          }
        }
      }
    },
    [getMarginUtils, setMarginBalance, setBalanceFetching, isBalanceFetching]
  )

  // 当选择的 manager 变化时，清除旧数据并重新获取余额
  useEffect(() => {
    if (!currentAccountAddress || !currentDeepBookPoolAddress || !currentDeepBookPoolIsMarginPool || !marginManagerId) {
      prevManagerIdRef.current = null
      return
    }

    // 如果 managerId 变化了，清除旧的余额数据并重新获取
    if (prevManagerIdRef.current !== null && prevManagerIdRef.current !== marginManagerId) {
      // 注意：不同 ManagerId 的数据是分开存储的，不需要清除旧数据
      setMarginBalance(currentAccountAddress, currentDeepBookPoolAddress, '0', '0', '0')

      // 清除请求 key，允许立即重新请求
      lastBalanceRequestKeyRef.current = null

      // 重新获取余额
      if (fetchMarginBalancesRef.current) {
        fetchMarginBalancesRef.current(marginManagerId)
      }
    }

    // 更新 ref
    prevManagerIdRef.current = marginManagerId
  }, [
    currentSelectedManagerInfo?.margin_manager_id,
    currentAccountAddress,
    currentDeepBookPoolAddress,
    currentDeepBookPoolIsMarginPool,
    marginManagerId,
    setMarginBalance
  ])

  // 更新 ref，确保总是使用最新的函数
  fetchMarginBalancesRef.current = fetchMarginBalances

  // 获取 margin trading 余额
  // 直接依赖值的变化，React 会自动处理去重
  useEffect(() => {
    if (!currentAccountAddress || !currentDeepBookPoolAddress || !currentDeepBookPoolIsMarginPool) {
      return
    }

    // 从 store 获取最新状态
    const store = useMarginStore.getState()
    const marginManagerByAccount = store.marginManagerByAccount
    const latestMarginManagerByAccountOwner = store.marginManagerByAccountOwner

    // 如果 latestMarginManagerByAccountOwner 为 null，说明数据还在加载中，等待更新
    if (latestMarginManagerByAccountOwner === null) {
      return
    }

    // 如果 latestMarginManagerByAccountOwner 不等于当前账户，说明是旧账户的数据，等待更新
    if (latestMarginManagerByAccountOwner !== currentAccountAddress) {
      return
    }

    // 如果还在加载中，等待
    if (marginManagerByAccount === undefined) {
      return
    }

    // marginManagerId 为空且已明确为空数组，设置为0
    if (!marginManagerId && marginManagerByAccount.length === 0) {
      const existingBalance = store.getMarginBalance(currentAccountAddress, currentDeepBookPoolAddress)
      if (existingBalance.base !== '0' || existingBalance.quote !== '0') {
        setMarginBalance(currentAccountAddress, currentDeepBookPoolAddress, '0', '0', '0')
      }
      return
    }

    // marginManagerId 有值，获取余额
    if (marginManagerId && fetchMarginBalancesRef.current) {
      // 生成请求 key
      const requestKey = `${currentAccountAddress}-${currentDeepBookPoolAddress}-${marginManagerId}`

      // 严格去重检查：如果正在请求相同的 key，直接返回
      if (lastBalanceRequestKeyRef.current === requestKey) {
        return
      }

      // 检查是否正在请求中（全局状态）
      if (isBalanceFetching(currentAccountAddress, currentDeepBookPoolAddress)) {
        return
      }

      // 检查是否已经有有效数据
      const existingBalance = store.getMarginBalance(currentAccountAddress, currentDeepBookPoolAddress)
      const hasValidData = existingBalance.base !== '0' || existingBalance.quote !== '0'

      // 如果没有有效数据，则触发请求
      if (!hasValidData) {
        fetchMarginBalancesRef.current()
      }
    }
  }, [
    marginManagerId,
    currentAccountAddress,
    currentDeepBookPoolAddress,
    currentDeepBookPoolIsMarginPool,
    marginManagerByAccountOwner,
    setMarginBalance,
    isBalanceFetching
  ])

  // 批量获取所有 margin 池子的余额数据
  useEffect(() => {
    if (!currentAccountAddress || !marginManagerByAccount || marginManagerByAccount.length === 0) {
      return
    }

    // 检查 marginManagerByAccountOwner 是否匹配当前账户
    const store = useMarginStore.getState()
    const latestMarginManagerByAccountOwner = store.marginManagerByAccountOwner

    if (latestMarginManagerByAccountOwner === null || latestMarginManagerByAccountOwner !== currentAccountAddress) {
      return
    }

    // 检查是否正在批量获取中（使用 store 中的全局状态防止多个 hook 实例重复请求）
    if (isBatchBalanceFetching(currentAccountAddress)) {
      return
    }

    // 检查是否有池子需要获取数据（检查 marginBalanceData，而不仅仅是 marginBalance）
    const needsFetch = marginManagerByAccount.some((manager: any) => {
      const poolAddress = manager.deepbook_pool_id
      const managerId = manager.margin_manager_id
      if (!poolAddress || !managerId) return false
      // 使用 managerId 来区分不同的 Manager
      const existingBalanceData = store.getMarginBalanceData(currentAccountAddress, poolAddress, managerId)
      return (
        existingBalanceData.totalCollateralValue === '0' &&
        existingBalanceData.baseFreeBalance === '0' &&
        existingBalanceData.quoteFreeBalance === '0'
      )
    })

    if (!needsFetch) {
      return
    }

    // 标记正在批量获取（使用 store 中的全局状态）
    setBatchBalanceFetching(currentAccountAddress, true)

    // 异步获取所有池子的余额
    const fetchAll = async () => {
      try {
        const marginUtils = getMarginUtils()
        const deepCoin = envConfigs.env == 'testnet' ? testnetCoins['DEEP'] : mainnetCoins[0]
        const deepBookOpenOrders = useDeepBookStore.getState().deepBookOpenOrders || []
        const marginSettleList = store.marginSettleList || []
        await fetchAllMarginPoolsBalance(
          marginUtils,
          currentAccountAddress,
          marginManagerByAccount,
          deepBookPools || [],
          setMarginBalance,
          setBalanceFetching,
          setMarginBalanceData,
          getMarginBalanceData,
          getMarginPrice,
          deepCoin,
          deepBookOpenOrders,
          marginSettleList
        )
      } catch (error) {
        console.error('Failed to fetch all margin pools balance:', error)
      } finally {
        // 清除标记（使用 store 中的全局状态）
        setBatchBalanceFetching(currentAccountAddress, false)
      }
    }

    fetchAll()
  }, [
    currentAccountAddress,
    marginManagerByAccount,
    marginManagerByAccountOwner,
    deepBookPools,
    setMarginBalance,
    setBalanceFetching,
    setMarginBalanceData,
    getMarginBalanceData,
    getMarginPrice,
    getMarginUtils,
    setBatchBalanceFetching,
    isBatchBalanceFetching
  ])

  // 注意：baseMarginBalance 和 quoteMarginBalance 是从 store 读取的
  // 当 store 更新时，hook 会重新执行，组件会自动重新渲染
  // 不需要额外的 useEffect，因为 store 的更新会触发组件重新渲染

  // 刷新所有余额的方法
  // 不依赖 marginManagerId 的变化，总是从最新的 marginManagerByAccount 获取 managerId
  const refreshMarginBalances = useCallback(async () => {
    // 清除请求 key，允许立即重新请求
    lastBalanceRequestKeyRef.current = null

    // 总是从最新的 marginManagerByAccount 获取 managerId，不依赖状态
    let managerIdToUse: string | null = null

    // 如果传入了 managerId 参数，优先使用传入的
    if (managerId !== undefined && managerId) {
      managerIdToUse = managerId
    }
    // 否则从最新的 marginManagerByAccount 获取
    else {
      const store = useMarginStore.getState()
      const latestMarginManagerByAccount = store.marginManagerByAccount
      if (latestMarginManagerByAccount && latestMarginManagerByAccount.length > 0 && currentDeepBookPoolAddress) {
        // 优先使用用户选择的 manager
        const selectedManagerInfo = store.getCurrentMarginManagerInfo(currentAccountAddress || '')

        // 如果用户选择了 manager，验证它是否属于当前池子
        if (selectedManagerInfo?.margin_manager_id) {
          const selectedManager = (latestMarginManagerByAccount as any[]).find(
            (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPoolAddress
          )
          if (selectedManager) {
            managerIdToUse = selectedManagerInfo.margin_manager_id
          }
        }

        // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找
        if (!managerIdToUse) {
          const marginManager = (latestMarginManagerByAccount as any[]).find((m: any) => m?.deepbook_pool_id === currentDeepBookPoolAddress)
          managerIdToUse = marginManager?.margin_manager_id || null
        }
      }
      // 最后回退到状态中的 marginManagerId
      else if (marginManagerId) {
        managerIdToUse = marginManagerId
      }
    }

    // 清除 balance 和 locked orders 的请求状态，确保刷新时去重状态同步清除
    if (currentAccountAddress && currentDeepBookPoolAddress && managerIdToUse) {
      const balanceRequestKey = `${currentAccountAddress}-${currentDeepBookPoolAddress}`
      const lockedOrdersRequestKey = `${currentAccountAddress}-${currentDeepBookPoolAddress}-${managerIdToUse}`

      // 清除 balance 的请求状态
      setBalanceFetching(balanceRequestKey.split('-')[0], balanceRequestKey.split('-')[1], false)

      // 清除 locked orders 的请求状态
      setLockedOrdersFetching(lockedOrdersRequestKey, false)
    }

    if (currentAccountAddress) {
      await Promise.all([
        currentDeepBookPool?.baseAssets?.coin_type && fetchBaseBalance(currentAccountAddress, currentDeepBookPool.baseAssets.coin_type),
        currentDeepBookPool?.quoteAssets?.coin_type && fetchQuoteBalance(currentAccountAddress, currentDeepBookPool.quoteAssets.coin_type),
        deepCoin?.coin_type && fetchDeepBalance(currentAccountAddress, deepCoin.coin_type),
        // 传入 managerIdToUse 给 fetchMarginBalances，确保使用最新的 managerId
        managerIdToUse && fetchMarginBalancesRef.current ? fetchMarginBalancesRef.current(managerIdToUse) : Promise.resolve(),
        // 刷新 locked orders 数据
        currentDeepBookPoolIsMarginPool && refreshMarginLockedOrders ? refreshMarginLockedOrders() : Promise.resolve()
      ])
    } else {
      if (managerIdToUse && fetchMarginBalancesRef.current) {
        await fetchMarginBalancesRef.current(managerIdToUse)
      }
      // 如果当前池子是 margin pool，也刷新 locked orders
      if (currentDeepBookPoolIsMarginPool && refreshMarginLockedOrders) {
        await refreshMarginLockedOrders()
      }
    }
  }, [
    currentAccountAddress,
    currentDeepBookPoolAddress,
    currentDeepBookPoolIsMarginPool,
    currentDeepBookPool?.baseAssets?.coin_type,
    currentDeepBookPool?.quoteAssets?.coin_type,
    deepCoin?.coin_type,
    marginManagerId,
    managerId,
    fetchBaseBalance,
    fetchQuoteBalance,
    fetchDeepBalance,
    refreshMarginLockedOrders,
    setBalanceFetching,
    setLockedOrdersFetching
    // 注意：不直接依赖 fetchMarginBalances，使用 ref 避免循环
  ])

  // 合并钱包余额和 margin trading 余额（直接计算，不需要缓存）
  const allBaseBalance = d(baseBalanceInfo?.balanceFormat || '0')
    .add(baseMarginBalance || '0')
    .toString()
  const allQuoteBalance = d(quoteBalanceInfo?.balanceFormat || '0')
    .add(quoteMarginBalance || '0')
    .toString()

  // 计算 base 和 quote 的美元价值（直接计算，不需要缓存）
  const baseMarginBalanceUSD = !basePrice || !baseMarginBalance || baseMarginBalance === '0' ? '0' : d(baseMarginBalance).mul(basePrice).toString()

  const quoteMarginBalanceUSD =
    !quotePrice || !quoteMarginBalance || quoteMarginBalance === '0' ? '0' : d(quoteMarginBalance).mul(quotePrice).toString()

  // 计算总抵押品价值（美元）- 包含 free + locked + settled（直接计算，不需要缓存）
  // 使用 ?? 而不是 ||，确保只有 null/undefined 时才使用默认值，'0' 字符串不会被替换
  const freeValue = d(baseMarginBalanceUSD ?? '0').add(quoteMarginBalanceUSD ?? '0')
  const lockedValue = d(baseLockedBalanceUSD ?? '0').add(quoteLockedBalanceUSD ?? '0')
  const settledValue = d(baseSettledBalanceUSD ?? '0').add(quoteSettledBalanceUSD ?? '0')
  const totalCollateralValue = freeValue.add(lockedValue).add(settledValue).toString()

  const baseTotalBalance = d(baseMarginBalance ?? '0')
    .add(baseLockedBalance ?? '0')
    .add(baseSettledBalance ?? '0')
    .toString()

  const quoteTotalBalance = d(quoteMarginBalance ?? '0')
    .add(quoteLockedBalance ?? '0')
    .add(quoteSettledBalance ?? '0')
    .toString()
  // 计算 total balance 的 USD 价值（直接计算，不需要缓存）
  // 确保 locked balance USD 值不会被错误替换：只有当值确实不存在时才使用 '0'
  const baseTotalBalanceUSD = d(baseMarginBalanceUSD ?? '0')
    .add(baseLockedBalanceUSD ?? '0')
    .add(baseSettledBalanceUSD ?? '0')
    .toString()

  const quoteTotalBalanceUSD = d(quoteMarginBalanceUSD ?? '0')
    .add(quoteLockedBalanceUSD ?? '0')
    .add(quoteSettledBalanceUSD ?? '0')
    .toString()

  // 将完整的 balance 数据存储到 store 中，确保页面刷新后也能使用
  useEffect(() => {
    if (currentAccountAddress && currentDeepBookPoolAddress && marginManagerId) {
      setMarginBalanceData(currentAccountAddress, currentDeepBookPoolAddress, marginManagerId, {
        baseFreeBalance: baseMarginBalance,
        quoteFreeBalance: quoteMarginBalance,
        baseLockedBalance,
        quoteLockedBalance,
        baseSettledBalance,
        quoteSettledBalance,
        baseTotalBalance,
        quoteTotalBalance,
        baseMarginBalanceUSD,
        quoteMarginBalanceUSD,
        baseLockedBalanceUSD,
        quoteLockedBalanceUSD,
        baseSettledBalanceUSD,
        quoteSettledBalanceUSD,
        baseTotalBalanceUSD,
        quoteTotalBalanceUSD,
        totalCollateralValue,
        basePrice: basePrice || null,
        quotePrice: quotePrice || null
      })
    }
  }, [
    currentAccountAddress,
    currentDeepBookPoolAddress,
    marginManagerId,
    baseMarginBalance,
    quoteMarginBalance,
    baseLockedBalance,
    quoteLockedBalance,
    baseSettledBalance,
    quoteSettledBalance,
    baseTotalBalance,
    quoteTotalBalance,
    baseMarginBalanceUSD,
    quoteMarginBalanceUSD,
    baseLockedBalanceUSD,
    quoteLockedBalanceUSD,
    baseSettledBalanceUSD,
    quoteSettledBalanceUSD,
    baseTotalBalanceUSD,
    quoteTotalBalanceUSD,
    totalCollateralValue,
    basePrice,
    quotePrice,
    setMarginBalanceData
  ])

  // 使用 useMemo 包装返回对象，确保当依赖值变化时返回新对象，触发组件重新渲染
  return useMemo(() => {
    // 调试：验证返回值中的 totalCollateralValue
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('[useGetDeepBookMarginBalance] 返回值 totalCollateralValue:', totalCollateralValue, {
    //     baseMarginBalanceUSD,
    //     quoteMarginBalanceUSD,
    //     baseLockedBalanceUSD,
    //     quoteLockedBalanceUSD,
    //     // 重新计算以验证一致性
    //     recalculated: d(baseMarginBalanceUSD || '0')
    //       .add(quoteMarginBalanceUSD || '0')
    //       .add(baseLockedBalanceUSD || '0')
    //       .add(quoteLockedBalanceUSD || '0')
    //       .add(baseSettledBalanceUSD || '0')
    //       .add(quoteSettledBalanceUSD || '0')
    //       .toString()
    //   })
    // }

    return {
      baseFreeBalance: baseMarginBalance, // margin trading 中的 base 余额
      quoteFreeBalance: quoteMarginBalance, // margin trading 中的 quote 余额
      baseBalance: baseBalanceInfo, // 钱包中的 base 余额（根据 network 参数）
      quoteBalance: quoteBalanceInfo, // 钱包中的 quote 余额（根据 network 参数）
      deepBalance: deepBalanceInfo, // 钱包中的 DEEP 余额（根据 network 参数）
      deepFreeBalance: deepMarginBalance, // DEEP 币种的 free balance（margin trading 中暂时等于钱包余额）
      allBaseBalance, // 钱包余额（根据 network 参数）+ margin trading 余额
      allQuoteBalance, // 钱包余额（根据 network 参数）+ margin trading 余额
      refreshMarginBalances, // 手动刷新所有余额的方法
      refreshMarginLockedOrders, // 手动刷新 locked orders 的方法
      // 用于显示 Total Collateral 的数据
      baseMarginBalanceUSD, // base 资产的美元价值（free）
      quoteMarginBalanceUSD, // quote 资产的美元价值（free）
      totalCollateralValue, // 总抵押品价值（美元）- 包含 free + locked + settled
      basePrice, // base 资产价格
      quotePrice, // quote 资产价格
      // 新增：locked balance
      baseLockedBalance, // 锁定的 base 资产数量
      quoteLockedBalance, // 锁定的 quote 资产数量
      baseLockedBalanceUSD, // 锁定的 base 资产美元价值
      quoteLockedBalanceUSD, // 锁定的 quote 资产美元价值
      // 新增：settled balance
      baseSettledBalance, // settled 的 base 资产数量
      quoteSettledBalance, // settled 的 quote 资产数量
      baseSettledBalanceUSD, // settled 的 base 资产美元价值
      quoteSettledBalanceUSD, // settled 的 quote 资产美元价值
      // 新增：total balance（free + locked + settled）
      baseTotalBalance, // base 总资产数量
      quoteTotalBalance, // quote 总资产数量
      baseTotalBalanceUSD, // base 总资产美元价值
      quoteTotalBalanceUSD // quote 总资产美元价值
    }
  }, [
    baseMarginBalance,
    quoteMarginBalance,
    baseBalanceInfo,
    quoteBalanceInfo,
    deepBalanceInfo,
    deepMarginBalance,
    allBaseBalance,
    allQuoteBalance,
    refreshMarginBalances,
    baseMarginBalanceUSD,
    quoteMarginBalanceUSD,
    totalCollateralValue,
    basePrice,
    quotePrice,
    baseLockedBalance,
    quoteLockedBalance,
    baseLockedBalanceUSD,
    quoteLockedBalanceUSD,
    baseSettledBalance,
    quoteSettledBalance,
    baseSettledBalanceUSD,
    quoteSettledBalanceUSD,
    baseTotalBalance,
    quoteTotalBalance,
    baseTotalBalanceUSD,
    quoteTotalBalanceUSD,
    refreshMarginLockedOrders
  ])
}
