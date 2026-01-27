import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { bnToAmount, d } from '@cetus/utils'
import { calc100PercentRepay } from '@cetusprotocol/deepbook-utils'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import useMarginOrderUtils from './useMarginOrderUtils'

// 批量获取所有 margin pool 的债务数据
async function fetchAllMarginPoolsDebt(
  marginUtils: any,
  accountAddress: string,
  marginManagerByAccount: any[],
  deepBookPools: any[],
  setMarginDebt: any,
  setDebtFetching: any,
  getMarginPrice: any
) {
  if (!accountAddress || !marginManagerByAccount || marginManagerByAccount.length === 0) {
    return
  }

  // 并行获取所有 margin 池子的债务
  const debtPromises = marginManagerByAccount.map(async (manager: any) => {
    const poolAddress = manager.deepbook_pool_id
    const managerId = manager.margin_manager_id

    if (!poolAddress || !managerId) {
      return null
    }

    // 查找对应的池子信息
    const pool = deepBookPools.find((p: any) => p.address === poolAddress)
    if (!pool || !pool.isMarginPool || !pool.baseAssets?.coin_type || !pool.quoteAssets?.coin_type) {
      return null
    }

    // 检查是否正在请求中
    const store = useMarginStore.getState()
    if (store.isDebtFetching(accountAddress, poolAddress)) {
      return null
    }

    // 检查是否已有有效数据（如果已有数据，跳过）
    const existingDebt = store.getMarginDebt(accountAddress, poolAddress)
    const hasValidData = existingDebt.baseDebt !== '0' || existingDebt.quoteDebt !== '0'
    if (hasValidData) {
      return null
    }

    // 标记正在请求中
    setDebtFetching(accountAddress, poolAddress, true)

    try {
      const borrowedAmountRes = await marginUtils.getBorrowedAmount({
        account: accountAddress,
        marginManager: managerId,
        baseCoinType: pool.baseAssets.coin_type,
        quoteCoinType: pool.quoteAssets.coin_type,
        baseMarginPool: pool.baseMarginPool,
        quoteMarginPool: pool.quoteMarginPool
      })

      // 处理返回的数据
      const baseBorrowedAmountRaw = borrowedAmountRes?.baseBorrowedAmount || '0'
      const quoteBorrowedAmountRaw = borrowedAmountRes?.quoteBorrowedAmount || '0'

      const debtIsBase = d(baseBorrowedAmountRaw).gt(0) ? true : false
      const poolState = await marginUtils.getMarginPoolStateForInterest(debtIsBase ? pool.baseMarginPool : pool.quoteMarginPool)
      const chainTimestamp = await marginUtils.getChainTimestamp()
      const repayAmount = calc100PercentRepay(
        BigInt(debtIsBase ? baseBorrowedAmountRaw : quoteBorrowedAmountRaw),
        poolState.poolState,
        poolState.interestConfig,
        chainTimestamp
      )

      // 转换为格式化的余额（除以 decimals）
      const baseDecimals = pool.baseAssets.decimals || 0
      const quoteDecimals = pool.quoteAssets.decimals || 0

      const baseDebtFormatted = debtIsBase
        ? bnToAmount(repayAmount, baseDecimals).toString()
        : bnToAmount(baseBorrowedAmountRaw, baseDecimals).toString()
      const quoteDebtFormatted = !debtIsBase
        ? bnToAmount(repayAmount, quoteDecimals).toString()
        : bnToAmount(quoteBorrowedAmountRaw, quoteDecimals).toString()

      // 计算美元价值（从 store 读取最新价格）
      const { basePrice, quotePrice } = getMarginPrice(poolAddress)

      const baseDebtUSD = basePrice && baseDebtFormatted !== '0' ? d(baseDebtFormatted).mul(basePrice).toString() : '0'
      const quoteDebtUSD = quotePrice && quoteDebtFormatted !== '0' ? d(quoteDebtFormatted).mul(quotePrice).toString() : '0'
      const totalDebtValue = d(baseDebtUSD).add(quoteDebtUSD).toString()

      // 存储债务数据
      setMarginDebt(accountAddress, poolAddress, {
        baseDebt: baseDebtFormatted,
        quoteDebt: quoteDebtFormatted,
        baseDebtUSD,
        quoteDebtUSD,
        totalDebtValue
      })

      return { poolAddress, success: true }
    } catch (error) {
      console.error(`Failed to fetch debt for pool ${poolAddress}:`, error)
      setMarginDebt(accountAddress, poolAddress, {
        baseDebt: '0',
        quoteDebt: '0',
        baseDebtUSD: '0',
        quoteDebtUSD: '0',
        totalDebtValue: '0'
      })
      return { poolAddress, success: false }
    } finally {
      setDebtFetching(accountAddress, poolAddress, false)
    }
  })

  await Promise.all(debtPromises)
}

export default function useDeepbookMarginDebt(deepBookPoolAddress?: string) {
  const { currentDeepBookPool } = useDeepBookStore()
  const deepBookPools = useDeepBookStore((state: any) => state.deepBookPools)
  const { currentAccount } = useAccountStore()
  const { getMarginUtils } = useMarginOrderUtils()

  // 从 store 直接获取 marginManagerByAccount 和 marginManagerByAccountOwner
  const marginManagerByAccount = useMarginStore((state: any) => state.marginManagerByAccount)
  const marginManagerByAccountOwner = useMarginStore((state: any) => state.marginManagerByAccountOwner)
  const setMarginDebt = useMarginStore((state: any) => state.setMarginDebt)
  const setDebtFetching = useMarginStore((state: any) => state.setDebtFetching)
  const getMarginDebt = useMarginStore((state: any) => state.getMarginDebt)
  const getMarginPrice = useMarginStore((state: any) => state.getMarginPrice)

  // 从 store 读取债务数据（响应式）- 分别订阅每个字段避免返回新对象
  const baseDebt = useMarginStore((state: any) => {
    if (!currentAccount?.address || !deepBookPoolAddress || !currentDeepBookPool?.address) return '0'
    const key = `${currentAccount.address}-${deepBookPoolAddress || currentDeepBookPool.address}`
    return state.marginDebts[key]?.baseDebt || '0'
  })

  const quoteDebt = useMarginStore((state: any) => {
    if (!currentAccount?.address || !deepBookPoolAddress || !currentDeepBookPool?.address) return '0'
    const key = `${currentAccount.address}-${deepBookPoolAddress || currentDeepBookPool.address}`
    return state.marginDebts[key]?.quoteDebt || '0'
  })

  const baseDebtUSD = useMarginStore((state: any) => {
    if (!currentAccount?.address || !deepBookPoolAddress || !currentDeepBookPool?.address) return '0'
    const key = `${currentAccount.address}-${deepBookPoolAddress || currentDeepBookPool.address}`
    return state.marginDebts[key]?.baseDebtUSD || '0'
  })

  const quoteDebtUSD = useMarginStore((state: any) => {
    if (!currentAccount?.address || !deepBookPoolAddress || !currentDeepBookPool?.address) return '0'
    const key = `${currentAccount.address}-${deepBookPoolAddress || currentDeepBookPool.address}`
    return state.marginDebts[key]?.quoteDebtUSD || '0'
  })

  const totalDebtValue = useMarginStore((state: any) => {
    if (!currentAccount?.address || !deepBookPoolAddress || !currentDeepBookPool?.address) return '0'
    const key = `${currentAccount.address}-${deepBookPoolAddress || currentDeepBookPool.address}`
    return state.marginDebts[key]?.totalDebtValue || '0'
  })

  // 计算当前池子的 margin manager ID
  // 注意：依赖 marginManagerByAccountOwner，确保当它从 null 变为当前账户时，marginManagerId 会重新计算
  const marginManagerId = useMemo(() => {
    if (!currentDeepBookPool?.address || !currentAccount?.address) {
      return null
    }

    // 从 store 获取最新数据并验证
    const store = useMarginStore.getState()
    const latestMarginManagerByAccount = store.marginManagerByAccount
    const marginManagerByAccountOwner = store.marginManagerByAccountOwner

    // 如果 marginManagerByAccountOwner 为 null，说明数据还在加载中，返回 null
    if (marginManagerByAccountOwner === null) {
      return null
    }

    // 验证：确保 marginManagerByAccount 属于当前账户
    if (marginManagerByAccountOwner !== currentAccount.address) {
      return null
    }

    if (!latestMarginManagerByAccount || latestMarginManagerByAccount.length === 0) {
      return null
    }

    const marginManager = (latestMarginManagerByAccount as any[]).find(
      (m: any) => m?.deepbook_pool_id === deepBookPoolAddress || currentDeepBookPool.address
    )
    return marginManager?.margin_manager_id || null
  }, [currentDeepBookPool?.address, currentAccount?.address, marginManagerByAccountOwner])

  // 使用 ref 存储最新的 fetchMarginDebt，避免 useEffect 依赖问题
  const fetchMarginDebtRef = useRef<() => Promise<void>>()

  // 使用 ref 记录上一个账户地址，用于检测账户切换
  const prevAccountRef = useRef<string | undefined>(currentAccount?.address)
  // 使用 ref 记录是否已经初始化过（用于页面刷新后的首次加载）
  const hasInitializedRef = useRef<boolean>(false)

  // 监听账户变化，切换账户时清空旧账户的债务数据
  useEffect(() => {
    const prevAccount = prevAccountRef.current
    const currentAccountAddress = currentAccount?.address

    // 如果账户发生变化（从有账户切换到另一个账户，或从有账户切换到无账户）
    if (prevAccount !== undefined && prevAccount !== currentAccountAddress) {
      const store = useMarginStore.getState()
      // 如果当前有池子地址，清空旧账户的债务数据
      if (currentDeepBookPool?.address && prevAccount) {
        store.setMarginDebt(prevAccount, currentDeepBookPool.address, {
          baseDebt: '0',
          quoteDebt: '0',
          baseDebtUSD: '0',
          quoteDebtUSD: '0',
          totalDebtValue: '0'
        })
      }
      // 账户切换时，清空新账户的缓存数据（避免显示旧数据）
      if (currentAccountAddress && currentDeepBookPool?.address) {
        const newAccountDebt = store.getMarginDebt(currentAccountAddress, currentDeepBookPool.address)
        if (newAccountDebt.baseDebt !== '0' || newAccountDebt.quoteDebt !== '0') {
          store.setMarginDebt(currentAccountAddress, currentDeepBookPool.address, {
            baseDebt: '0',
            quoteDebt: '0',
            baseDebtUSD: '0',
            quoteDebtUSD: '0',
            totalDebtValue: '0'
          })
        }
        store.setDebtFetching(currentAccountAddress, currentDeepBookPool.address, false)
      }
      // 重置初始化标记，确保新账户会触发首次加载
      hasInitializedRef.current = false
    }

    // 更新 ref
    prevAccountRef.current = currentAccountAddress
  }, [currentAccount?.address, currentDeepBookPool?.address])

  const fetchMarginDebt = useCallback(async () => {
    // 从 store 获取最新值
    const accountAddress = useAccountStore.getState().currentAccount?.address
    const pool = useDeepBookStore.getState().currentDeepBookPool
    const marginManagerByAccount = useMarginStore.getState().marginManagerByAccount

    if (!accountAddress || !pool?.address) {
      return
    }

    const store = useMarginStore.getState()

    // 如果不是 margin pool，清空数据
    if (!pool?.isMarginPool) {
      store.setMarginDebt(accountAddress, pool.address, {
        baseDebt: '0',
        quoteDebt: '0',
        baseDebtUSD: '0',
        quoteDebtUSD: '0',
        totalDebtValue: '0'
      })
      return
    }

    // 防重复请求：检查是否正在请求中
    if (store.isDebtFetching(accountAddress, pool.address)) {
      return
    }

    // 验证：确保 marginManagerByAccount 属于当前账户
    const marginManagerByAccountOwner = store.marginManagerByAccountOwner
    // 如果 marginManagerByAccountOwner 为 null，说明数据还在加载中，等待更新
    if (marginManagerByAccountOwner === null) {
      return
    }
    // 如果 marginManagerByAccountOwner 不等于当前账户，说明是旧账户的数据，不更新
    if (marginManagerByAccountOwner !== accountAddress) {
      return
    }

    // 检查 marginManagerByAccount 状态
    if (marginManagerByAccount === undefined) {
      // 还在加载中，等待更新
      return
    }

    if (marginManagerByAccount.length === 0) {
      // 当前账户没有 margin manager
      return
    }

    // 从 marginManagerByAccount 计算最新的 marginManagerId
    let managerIdToUse = null
    const marginManager = (marginManagerByAccount as any[]).find((m: any) => m?.deepbook_pool_id === pool.address)
    managerIdToUse = marginManager?.margin_manager_id || null

    // 如果缺少 marginManagerId，等待而不是清空数据
    if (!managerIdToUse) {
      return
    }

    try {
      if (pool?.baseAssets && pool?.quoteAssets) {
        // 标记正在请求中
        store.setDebtFetching(accountAddress, pool.address, true)

        try {
          const marginUtils = getMarginUtils()

          const borrowedAmountRes = await marginUtils.getBorrowedAmount({
            account: accountAddress,
            marginManager: managerIdToUse,
            baseCoinType: pool.baseAssets.coin_type,
            quoteCoinType: pool.quoteAssets.coin_type,
            baseMarginPool: pool.baseMarginPool,
            quoteMarginPool: pool.quoteMarginPool
          })

          // 处理返回的数据
          const baseBorrowedAmountRaw = borrowedAmountRes?.baseBorrowedAmount || '0'
          const quoteBorrowedAmountRaw = borrowedAmountRes?.quoteBorrowedAmount || '0'

          const debtIsBase = d(baseBorrowedAmountRaw).gt(0) ? true : false
          const poolState = await marginUtils.getMarginPoolStateForInterest(debtIsBase ? pool.baseMarginPool : pool.quoteMarginPool)
          const chainTimestamp = await marginUtils.getChainTimestamp()
          // const debtDetail = calcDebtDetail(BigInt(baseBorrowedAmountRaw), poolState.poolState, poolState.interestConfig, chainTimestamp)
          const repayAmount = calc100PercentRepay(
            BigInt(debtIsBase ? baseBorrowedAmountRaw : quoteBorrowedAmountRaw),
            poolState.poolState,
            poolState.interestConfig,
            chainTimestamp
          )

          // 转换为格式化的余额（除以 decimals）
          const baseDecimals = pool.baseAssets.decimals || 0
          const quoteDecimals = pool.quoteAssets.decimals || 0

          const baseDebtFormatted = debtIsBase
            ? bnToAmount(repayAmount, baseDecimals).toString()
            : bnToAmount(baseBorrowedAmountRaw, baseDecimals).toString()
          const quoteDebtFormatted = !debtIsBase
            ? bnToAmount(repayAmount, quoteDecimals).toString()
            : bnToAmount(quoteBorrowedAmountRaw, quoteDecimals).toString()

          // 计算美元价值（从 store 读取最新价格，确保使用最新值）
          const currentPrice = store.getMarginPrice(pool.address)
          const currentBasePrice = currentPrice.basePrice
          const currentQuotePrice = currentPrice.quotePrice

          const baseDebtUSD = currentBasePrice && baseDebtFormatted !== '0' ? d(baseDebtFormatted).mul(currentBasePrice).toString() : '0'
          const quoteDebtUSD = currentQuotePrice && quoteDebtFormatted !== '0' ? d(quoteDebtFormatted).mul(currentQuotePrice).toString() : '0'
          const totalDebtValue = d(baseDebtUSD).add(quoteDebtUSD).toString()

          // 请求完成时，检查账户和池子是否还是请求开始时的值
          const currentAccountAddress = useAccountStore.getState().currentAccount?.address
          const currentPoolAddress = useDeepBookStore.getState().currentDeepBookPool?.address
          if (accountAddress === currentAccountAddress && pool.address === currentPoolAddress) {
            // 更新到 store
            store.setMarginDebt(accountAddress, pool.address, {
              baseDebt: baseDebtFormatted,
              quoteDebt: quoteDebtFormatted,
              baseDebtUSD,
              quoteDebtUSD,
              totalDebtValue
            })
          }
        } catch (error) {
          console.error('Failed to get margin utils:', error)
          const currentAccountAddress = useAccountStore.getState().currentAccount?.address
          const currentPoolAddress = useDeepBookStore.getState().currentDeepBookPool?.address
          if (accountAddress === currentAccountAddress && pool.address === currentPoolAddress) {
            store.setMarginDebt(accountAddress, pool.address, {
              baseDebt: '0',
              quoteDebt: '0',
              baseDebtUSD: '0',
              quoteDebtUSD: '0',
              totalDebtValue: '0'
            })
          }
        } finally {
          // 请求完成，重置标记
          const currentAccountAddress = useAccountStore.getState().currentAccount?.address
          const currentPoolAddress = useDeepBookStore.getState().currentDeepBookPool?.address
          if (accountAddress === currentAccountAddress && pool.address === currentPoolAddress) {
            store.setDebtFetching(accountAddress, pool.address, false)
          }
        }
      }
    } catch (error) {
      console.error('Failed to get margin debt:', error)
      const currentAccountAddress = useAccountStore.getState().currentAccount?.address
      const currentPoolAddress = useDeepBookStore.getState().currentDeepBookPool?.address
      if (accountAddress === currentAccountAddress && pool.address === currentPoolAddress) {
        store.setMarginDebt(accountAddress, pool.address, {
          baseDebt: '0',
          quoteDebt: '0',
          baseDebtUSD: '0',
          quoteDebtUSD: '0',
          totalDebtValue: '0'
        })
        store.setDebtFetching(accountAddress, pool.address, false)
      }
    }
  }, [getMarginUtils])

  // 更新 ref，确保总是使用最新的 fetchMarginDebt
  fetchMarginDebtRef.current = fetchMarginDebt

  // 自动获取债务（默认行为）
  // 只依赖 marginManagerId 的变化，避免循环依赖
  useEffect(() => {
    if (!currentAccount?.address || !currentDeepBookPool?.address || !currentDeepBookPool?.isMarginPool) {
      return
    }

    const store = useMarginStore.getState()
    const latestMarginManagerByAccount = store.marginManagerByAccount
    const latestMarginManagerByAccountOwner = store.marginManagerByAccountOwner

    // 如果 marginManagerByAccountOwner 为 null，说明数据还在加载中，等待更新
    if (latestMarginManagerByAccountOwner === null) {
      return
    }

    // 如果 marginManagerByAccountOwner 不等于当前账户，说明是旧账户的数据，等待更新
    if (latestMarginManagerByAccountOwner !== currentAccount.address) {
      return
    }

    // 如果还在加载中，等待
    if (latestMarginManagerByAccount === undefined) {
      return
    }

    // marginManagerId 为空且已明确为空数组，设置为0
    if (!marginManagerId && latestMarginManagerByAccount.length === 0) {
      const existingDebt = store.getMarginDebt(currentAccount.address, currentDeepBookPool.address)
      if (existingDebt.baseDebt !== '0' || existingDebt.quoteDebt !== '0') {
        store.setMarginDebt(currentAccount.address, currentDeepBookPool.address, {
          baseDebt: '0',
          quoteDebt: '0',
          baseDebtUSD: '0',
          quoteDebtUSD: '0',
          totalDebtValue: '0'
        })
      }
      return
    }

    // marginManagerId 有值，获取债务
    if (marginManagerId && fetchMarginDebtRef.current) {
      const existingDebt = store.getMarginDebt(currentAccount.address, currentDeepBookPool.address)
      const isFetching = store.isDebtFetching(currentAccount.address, currentDeepBookPool.address)

      // 页面刷新后首次加载，或者债务数据为空时，需要获取
      // 检查是否正在请求中，避免重复请求
      const shouldFetch =
        !isFetching &&
        (!hasInitializedRef.current || // 首次加载
          (existingDebt.baseDebt === '0' && existingDebt.quoteDebt === '0')) // 数据为空

      if (shouldFetch) {
        hasInitializedRef.current = true
        fetchMarginDebtRef.current()
      }
    }
  }, [marginManagerId, currentAccount?.address, currentDeepBookPool?.address, currentDeepBookPool?.isMarginPool, marginManagerByAccountOwner])

  // 当价格变化时，重新计算美元价值
  // 注意：即使价格是 null，也要检查是否需要更新（当价格从 null 变为有效值时）
  // 使用 selector 订阅价格变化，确保价格更新时能触发重新计算
  // 分别订阅 basePrice 和 quotePrice，避免每次返回新对象导致无限渲染
  const marginPriceBasePrice = useMarginStore((state: any) => {
    if (!currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginPrice(currentDeepBookPool.address).basePrice
  })

  const marginPriceQuotePrice = useMarginStore((state: any) => {
    if (!currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginPrice(currentDeepBookPool.address).quotePrice
  })

  useEffect(() => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return
    }

    const store = useMarginStore.getState()

    // 从 store 获取当前的债务数据（不能从 marginDebtData 读取，会导致循环依赖）
    const currentDebt = store.getMarginDebt(currentAccount.address, currentDeepBookPool.address)

    // 从 store 获取当前价格（确保使用最新的价格）
    const currentPrice = store.getMarginPrice(currentDeepBookPool.address)
    const currentBasePrice = currentPrice.basePrice
    const currentQuotePrice = currentPrice.quotePrice

    // 只有当有债务数据时才重新计算美元价值
    if (currentDebt.baseDebt !== '0' || currentDebt.quoteDebt !== '0') {
      // 计算美元价值（即使价格是 null，也要计算，这样当价格加载完成后会自动更新）
      const baseDebtUSD = currentBasePrice && currentDebt.baseDebt !== '0' ? d(currentDebt.baseDebt).mul(currentBasePrice).toString() : '0'
      const quoteDebtUSD = currentQuotePrice && currentDebt.quoteDebt !== '0' ? d(currentDebt.quoteDebt).mul(currentQuotePrice).toString() : '0'
      const totalDebtValue = d(baseDebtUSD).add(quoteDebtUSD).toString()

      // 只有当计算结果与当前值不同时才更新
      // 这样可以处理：1. 价格从 null 变为有效值 2. 价格变化
      // 注意：即使当前值是 '0'，如果计算结果也是 '0'，也要更新（确保数据同步）
      // 特别处理：如果价格有效但美元价值是 '0'，说明需要更新
      const shouldUpdate =
        currentDebt.baseDebtUSD !== baseDebtUSD ||
        currentDebt.quoteDebtUSD !== quoteDebtUSD ||
        currentDebt.totalDebtValue !== totalDebtValue ||
        // 如果价格有效但美元价值是 '0'，说明需要更新
        (currentBasePrice &&
          currentQuotePrice &&
          currentDebt.baseDebtUSD === '0' &&
          currentDebt.quoteDebtUSD === '0' &&
          (currentDebt.baseDebt !== '0' || currentDebt.quoteDebt !== '0'))

      if (shouldUpdate) {
        store.setMarginDebt(currentAccount.address, currentDeepBookPool.address, {
          ...currentDebt,
          baseDebtUSD,
          quoteDebtUSD,
          totalDebtValue
        })
      }
    }
  }, [marginPriceBasePrice, marginPriceQuotePrice, currentAccount?.address, currentDeepBookPool?.address])

  // 使用 ref 防止重复批量请求
  const batchDebtFetchingRef = useRef<string | null>(null)

  // 批量获取所有 margin 池子的债务数据
  useEffect(() => {
    if (!currentAccount?.address || !marginManagerByAccount || marginManagerByAccount.length === 0) {
      return
    }

    // 检查 marginManagerByAccountOwner 是否匹配当前账户
    const store = useMarginStore.getState()
    const latestMarginManagerByAccountOwner = store.marginManagerByAccountOwner

    if (latestMarginManagerByAccountOwner === null || latestMarginManagerByAccountOwner !== currentAccount.address) {
      return
    }

    // 检查是否正在批量获取中（使用 ref 防止重复请求）
    const batchFetchKey = `batch-debt-${currentAccount.address}`
    if (batchDebtFetchingRef.current === batchFetchKey) {
      return
    }

    // 检查是否有池子需要获取数据（检查 marginDebts，而不仅仅是当前池子）
    const needsFetch = marginManagerByAccount.some((manager: any) => {
      const poolAddress = manager.deepbook_pool_id
      if (!poolAddress) return false
      const existingDebt = store.getMarginDebt(currentAccount.address, poolAddress)
      return existingDebt.baseDebt === '0' && existingDebt.quoteDebt === '0'
    })

    if (!needsFetch) {
      return
    }

    // 标记正在批量获取
    batchDebtFetchingRef.current = batchFetchKey

    // 异步获取所有池子的债务
    const fetchAll = async () => {
      try {
        const marginUtils = getMarginUtils()
        await fetchAllMarginPoolsDebt(
          marginUtils,
          currentAccount.address,
          marginManagerByAccount,
          deepBookPools || [],
          setMarginDebt,
          setDebtFetching,
          getMarginPrice
        )
      } catch (error) {
        console.error('Failed to fetch all margin pools debt:', error)
      } finally {
        // 清除标记
        if (batchDebtFetchingRef.current === batchFetchKey) {
          batchDebtFetchingRef.current = null
        }
      }
    }

    fetchAll()
  }, [
    currentAccount?.address,
    marginManagerByAccount,
    marginManagerByAccountOwner,
    deepBookPools,
    setMarginDebt,
    setDebtFetching,
    getMarginPrice,
    getMarginUtils
  ])

  // 强制刷新债务的方法
  const refreshMarginDebt = useCallback(async () => {
    if (fetchMarginDebtRef.current) {
      await fetchMarginDebtRef.current()
    }
  }, [])

  return {
    marginDebt: totalDebtValue, // 向后兼容
    baseDebt,
    quoteDebt,
    baseDebtUSD,
    quoteDebtUSD,
    totalDebtValue,
    fetchMarginDebt, // 保留原有方法
    refreshMarginDebt // 新增：强制刷新方法
  }
}
