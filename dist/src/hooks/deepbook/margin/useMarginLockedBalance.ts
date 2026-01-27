import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d } from '@cetus/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useGetDeepBookOrderBook from '../useGetDeepBookOrderBook'
import useDeepBookMarginPrices from './useDeepBookMarginPrices'

/**
 * 计算 Margin Pool 的 Locked Balance（从 Open Orders 中锁定的资产）
 * 参考 AssetsInfo.tsx 的 lockInfo 计算逻辑
 *
 * 独立获取并保存订单数据，不依赖外部的 deepBookOpenOrders，避免受 orderTab 等外部参数影响
 */
export default function useMarginLockedBalance() {
  // 使用 selector 精确订阅，只订阅需要的字段，避免对象引用变化导致重新渲染
  const currentDeepBookPoolAddress = useDeepBookStore((state: any) => state.currentDeepBookPool?.address)
  const currentDeepBookPoolIsMarginPool = useDeepBookStore((state: any) => state.currentDeepBookPool?.isMarginPool)
  const currentDeepBookPool = useDeepBookStore((state: any) => state.currentDeepBookPool)

  // 延迟价格获取，不在顶层获取，避免价格更新导致整个 hook 重新执行
  // const { basePrice, quotePrice } = useDeepBookMarginPrices()

  // 使用 selector 精确订阅 store 值
  const marginManagerByAccountOwner = useMarginStore((state: any) => state.marginManagerByAccountOwner)
  const setLockedOrdersFetching = useMarginStore((state: any) => state.setLockedOrdersFetching)
  const isLockedOrdersFetching = useMarginStore((state: any) => state.isLockedOrdersFetching)

  // 使用 selector 精确订阅账户地址
  const currentAccountAddress = useAccountStore((state: any) => state.currentAccount?.address)
  const currentAccount = useAccountStore((state: any) => state.currentAccount)

  // deepBookSDK 通常比较稳定，但使用 selector 更安全
  const deepBookSDK = usePeripherySDKStore((state: any) => state.deepBookSDK)

  // getRequestPool 函数应该是稳定的，但使用 ref 保存更安全
  const { getRequestPool } = useGetDeepBookOrderBook()

  // 独立的订单数据和加载状态
  const [marginOpenOrders, setMarginOpenOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 使用 ref 避免重复请求和竞态条件
  const requestAbortControllerRef = useRef<AbortController | null>(null)

  // 包装 SDK 返回的订单数据
  const wrapMarginOrder = useCallback((item: any, poolInfo: any) => {
    try {
      const { order_id, isBid, price, quantity, filled_quantity } = item

      // 处理 BigInt 类型的数据
      const quantityStr = typeof quantity === 'bigint' ? quantity.toString() : String(quantity || '0')
      const priceStr = typeof price === 'bigint' ? price.toString() : String(price || '0')
      const filledQuantityStr = typeof filled_quantity === 'bigint' ? filled_quantity.toString() : String(filled_quantity || '0')

      const { baseAssets, quoteAssets, address } = poolInfo
      const quoteDecimals = quoteAssets.decimals
      const baseDecimals = baseAssets.decimals

      const originalQuantity = d(quantityStr).div(Math.pow(10, baseDecimals)).toString()
      const filledQuantity = d(filledQuantityStr).div(Math.pow(10, baseDecimals)).toString()
      const minSize = poolInfo?.minSize
      const lotSize = poolInfo?.lotSize

      return {
        orderId: order_id,
        side: isBid ? 'Long' : 'Short', // margin pool 使用 Long/Short
        baseAsset: poolInfo.baseAssets.symbol,
        quoteAsset: poolInfo.quoteAssets.symbol,
        price: d(priceStr)
          .div(Math.pow(10, quoteDecimals - baseDecimals + 9))
          .toString(),
        originalQuantity,
        filledQuantity,
        baseAssets,
        quoteAssets,
        address,
        minSize,
        lotSize
      }
    } catch (error) {
      console.error('wrapMarginOrder error:', error, item)
      return null
    }
  }, [])

  // 使用 ref 保存函数引用，避免依赖变化
  const getRequestPoolRef = useRef(getRequestPool)
  const wrapMarginOrderRef = useRef(wrapMarginOrder)

  // 更新 ref
  useEffect(() => {
    getRequestPoolRef.current = getRequestPool
    wrapMarginOrderRef.current = wrapMarginOrder
  }, [getRequestPool, wrapMarginOrder])

  // 使用 ref 保存关键值，避免依赖变化导致重复调用
  const currentDeepBookPoolRef = useRef(currentDeepBookPool)
  const currentAccountRef = useRef(currentAccount)

  // 使用 ref 保存关键值的字符串形式，用于比较
  const poolAddressRef = useRef<string | undefined>(currentDeepBookPoolAddress)
  const isMarginPoolRef = useRef<boolean | undefined>(currentDeepBookPoolIsMarginPool)
  const accountAddressRef = useRef<string | undefined>(currentAccountAddress)
  const marginManagerByAccountOwnerRef = useRef<string | null | undefined>(marginManagerByAccountOwner)

  // 使用 ref 保存 deepBookSDK，避免依赖变化导致函数重新创建
  const deepBookSDKRef = useRef(deepBookSDK)

  // 更新 ref
  useEffect(() => {
    currentDeepBookPoolRef.current = currentDeepBookPool
    currentAccountRef.current = currentAccount
    deepBookSDKRef.current = deepBookSDK
  }, [currentDeepBookPool, currentAccount, deepBookSDK])

  // 获取订单数据的函数 - 不依赖外部值，从 store 直接读取
  const fetchMarginOpenOrders = useCallback(async () => {
    // 从 store 获取最新值
    const marginStore = useMarginStore.getState()
    const latestMarginManagerByAccount = marginStore.marginManagerByAccount
    const latestMarginManagerByAccountOwner = marginStore.marginManagerByAccountOwner
    const currentPool = currentDeepBookPoolRef.current
    const currentAccountAddress = currentAccountRef.current?.address
    const deepBookSDK = deepBookSDKRef.current

    // 检查条件
    if (
      !currentPool?.address ||
      !currentPool?.isMarginPool ||
      !currentAccountAddress ||
      !latestMarginManagerByAccount ||
      latestMarginManagerByAccount.length === 0 ||
      latestMarginManagerByAccountOwner !== currentAccountAddress
    ) {
      setMarginOpenOrders([])
      return
    }

    // 获取 margin manager ID
    const marginManager = (latestMarginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === currentPool.address)

    if (!marginManager?.margin_manager_id) {
      setMarginOpenOrders([])
      return
    }

    // 保存请求开始时的所有值，确保整个请求过程使用一致的值
    const requestAccountAddress = currentAccountAddress
    const requestPoolAddress = currentPool.address
    const requestManagerId = marginManager.margin_manager_id
    const finalRequestKey = `${requestAccountAddress}-${requestPoolAddress}-${requestManagerId}`

    // 如果正在请求相同的 key，直接返回（使用全局 store 去重）
    if (isLockedOrdersFetching(finalRequestKey)) {
      return
    }

    // 如果正在加载中，取消之前的请求
    if (requestAbortControllerRef.current) {
      requestAbortControllerRef.current.abort()
    }

    // 创建新的 AbortController
    const abortController = new AbortController()
    requestAbortControllerRef.current = abortController

    // 标记正在请求中（全局状态）
    setLockedOrdersFetching(finalRequestKey, true)
    setIsLoading(true)

    try {
      // 再次检查是否还是当前池子和账户（防止在请求过程中切换）
      const currentPoolNow = currentDeepBookPoolRef.current
      const currentAccountNow = currentAccountRef.current?.address
      if (currentPoolNow?.address !== requestPoolAddress || currentAccountNow !== requestAccountAddress) {
        // 如果已经切换，清除请求状态
        setLockedOrdersFetching(finalRequestKey, false)
        setIsLoading(false)
        return
      }

      // 验证 currentDeepBookPool 的必需字段
      if (!currentPool?.baseAssets?.coin_type || !currentPool?.quoteAssets?.coin_type) {
        setMarginOpenOrders([])
        setLockedOrdersFetching(finalRequestKey, false)
        setIsLoading(false)
        return
      }

      // 使用 ref 获取函数，避免依赖变化
      const poolInfoRaw = getRequestPoolRef.current(currentPool)

      // 确保 poolInfo 格式正确
      const poolInfo = {
        ...poolInfoRaw,
        id: poolInfoRaw?.id || poolInfoRaw?.address || currentPool?.address,
        address: poolInfoRaw?.address || currentPool?.address
      }

      // 验证 poolInfo 参数
      if (!poolInfo || !poolInfo.baseCoin?.coinType || !poolInfo.quoteCoin?.coinType) {
        setMarginOpenOrders([])
        setLockedOrdersFetching(finalRequestKey, false)
        setIsLoading(false)
        return
      }

      // 验证 marginManager.margin_manager_id
      if (!marginManager.margin_manager_id || typeof marginManager.margin_manager_id !== 'string') {
        setMarginOpenOrders([])
        setLockedOrdersFetching(finalRequestKey, false)
        setIsLoading(false)
        return
      }

      // 验证 deepBookSDK.MarginUtils（从 ref 获取）
      if (!deepBookSDK?.MarginUtils || typeof deepBookSDK.MarginUtils.getAccountOpenOrders !== 'function') {
        setMarginOpenOrders([])
        setLockedOrdersFetching(finalRequestKey, false)
        setIsLoading(false)
        return
      }

      // 参考 useGetDeepBookOpenOrders.ts line 195-196，单个池子使用 getAccountOpenOrders
      const orders = await deepBookSDK.MarginUtils.getAccountOpenOrders({
        poolInfo,
        marginManager: marginManager.margin_manager_id
      })

      // 检查请求是否被取消
      if (abortController.signal.aborted) {
        return
      }

      // 请求完成时，严格检查账户和池子是否还是请求开始时的值
      const currentPoolAfterRequest = currentDeepBookPoolRef.current
      const currentAccountAfterRequest = currentAccountRef.current?.address

      // 再次验证请求 key 是否还匹配
      const currentRequestKey = `${currentAccountAfterRequest}-${currentPoolAfterRequest?.address}-${requestManagerId}`

      if (
        currentPoolAfterRequest?.address !== requestPoolAddress ||
        currentAccountAfterRequest !== requestAccountAddress ||
        currentRequestKey !== finalRequestKey
      ) {
        // 如果上下文已变化，不更新数据，但需要清除请求状态
        return
      }

      // 转换订单格式
      const wrappedOrders: any[] = []
      for (const item of orders) {
        const wrapped = wrapMarginOrderRef.current(item, currentPool)
        if (wrapped) {
          wrappedOrders.push(wrapped)
        }
      }

      // 再次检查是否被取消，并验证上下文是否仍然有效
      if (!abortController.signal.aborted && currentRequestKey === finalRequestKey) {
        setMarginOpenOrders(wrappedOrders)
      }
    } catch (error: any) {
      // 如果请求被取消，不处理错误
      if (error.name === 'AbortError') {
        return
      }
      console.error('fetchMarginOpenOrders error:', error)

      // 请求完成时，严格检查账户和池子是否还是请求开始时的值
      const currentAccountAfterError = currentAccountRef.current?.address
      const currentPoolAfterError = currentDeepBookPoolRef.current?.address
      const currentRequestKeyAfterError = `${currentAccountAfterError}-${currentPoolAfterError}-${requestManagerId}`

      // 发生错误时，只有在上下文仍然有效时才设置为空数组
      if (
        !abortController.signal.aborted &&
        currentAccountAfterError === requestAccountAddress &&
        currentPoolAfterError === requestPoolAddress &&
        currentRequestKeyAfterError === finalRequestKey
      ) {
        setMarginOpenOrders([])
      }
    } finally {
      // 请求完成，重置标记（全局状态）
      // 只有在账户和池子还是请求开始时的值时才重置
      const currentAccountAfterRequest = currentAccountRef.current?.address
      const currentPoolAfterRequest = currentDeepBookPoolRef.current?.address
      const currentRequestKey = `${currentAccountAfterRequest}-${currentPoolAfterRequest}-${requestManagerId}`

      if (
        currentAccountAfterRequest === requestAccountAddress &&
        currentPoolAfterRequest === requestPoolAddress &&
        currentRequestKey === finalRequestKey
      ) {
        setLockedOrdersFetching(finalRequestKey, false)
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }

      if (requestAbortControllerRef.current === abortController) {
        requestAbortControllerRef.current = null
      }
    }
  }, [])

  // 使用 ref 保存 fetchMarginOpenOrders 函数引用
  const fetchMarginOpenOrdersRef = useRef(fetchMarginOpenOrders)

  // 更新 ref
  useEffect(() => {
    fetchMarginOpenOrdersRef.current = fetchMarginOpenOrders
  }, [fetchMarginOpenOrders])

  // 自动获取订单数据 - 使用值比较，只在值真正变化时触发
  useEffect(() => {
    // 从 store 获取最新状态
    const store = useMarginStore.getState()
    const latestMarginManagerByAccount = store.marginManagerByAccount
    const latestMarginManagerByAccountOwner = store.marginManagerByAccountOwner
    const currentPoolAddress = currentDeepBookPoolAddress
    const currentIsMarginPool = currentDeepBookPoolIsMarginPool

    // 检查值是否真正变化（使用值比较而不是引用比较）
    const poolAddressChanged = poolAddressRef.current !== currentPoolAddress
    const isMarginPoolChanged = isMarginPoolRef.current !== currentIsMarginPool
    const accountAddressChanged = accountAddressRef.current !== currentAccountAddress
    const marginManagerOwnerChanged = marginManagerByAccountOwnerRef.current !== latestMarginManagerByAccountOwner

    // 检查 marginManagerByAccountOwner 是否从 null 变为实际值（数据加载完成）
    const marginManagerOwnerLoaded = marginManagerByAccountOwnerRef.current === null && latestMarginManagerByAccountOwner !== null

    // 检查是否满足条件
    if (!currentPoolAddress || !currentIsMarginPool || !currentAccountAddress) {
      setMarginOpenOrders([])
      return
    }

    // 如果 marginManagerByAccountOwner 为 null，说明数据还在加载中，等待更新
    if (latestMarginManagerByAccountOwner === null) {
      return
    }

    // 如果 marginManagerByAccountOwner 不等于当前账户，说明是旧账户的数据，等待更新
    if (latestMarginManagerByAccountOwner !== currentAccountAddress) {
      return
    }

    // 如果还在加载中，等待
    if (latestMarginManagerByAccount === undefined) {
      return
    }

    // 如果没有 margin manager，清空订单
    if (latestMarginManagerByAccount.length === 0) {
      setMarginOpenOrders([])
      return
    }

    // 检查是否有对应的 margin manager
    const marginManager = (latestMarginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === currentPoolAddress)

    if (!marginManager?.margin_manager_id) {
      setMarginOpenOrders([])
      return
    }

    // 生成请求 key
    const requestKey = `${currentAccountAddress}-${currentPoolAddress}-${marginManager.margin_manager_id}`

    // 检查是否正在请求中（全局状态）
    if (isLockedOrdersFetching(requestKey)) {
      return
    }

    // 检查是否已经有有效数据（与 useGetDeepBookMarginBalance 保持一致）
    const hasValidData = marginOpenOrders && marginOpenOrders.length > 0

    // 只有在以下情况才触发请求：
    // 1. 没有有效数据
    // 2. 关键值真正变化（池子地址、isMarginPool、账户地址、marginManagerOwner）
    const shouldFetch =
      !hasValidData || poolAddressChanged || isMarginPoolChanged || accountAddressChanged || marginManagerOwnerChanged || marginManagerOwnerLoaded

    if (shouldFetch) {
      // 满足所有条件，触发获取订单
      fetchMarginOpenOrdersRef.current()
    }

    // 更新 ref 值，在 effect 末尾更新（在检查之后），确保下次比较时能检测到变化
    poolAddressRef.current = currentPoolAddress
    isMarginPoolRef.current = currentIsMarginPool
    accountAddressRef.current = currentAccountAddress
    marginManagerByAccountOwnerRef.current = latestMarginManagerByAccountOwner
  }, [
    currentDeepBookPoolAddress,
    currentDeepBookPoolIsMarginPool,
    currentAccountAddress,
    marginManagerByAccountOwner,
    isLockedOrdersFetching,
    marginOpenOrders?.length
  ])

  // 暴露刷新方法
  const refreshMarginLockedOrders = useCallback(async () => {
    // 从 store 获取最新值，不使用 ref，确保获取最新值
    const marginStore = useMarginStore.getState()
    const currentPool = useDeepBookStore.getState().currentDeepBookPool
    const currentAccountAddress = useAccountStore.getState().currentAccount?.address

    if (!currentPool?.address || !currentAccountAddress) {
      return
    }

    const latestMarginManagerByAccount = marginStore.marginManagerByAccount
    const latestMarginManagerByAccountOwner = marginStore.marginManagerByAccountOwner

    // 验证：确保 marginManagerByAccount 属于当前账户
    if (!latestMarginManagerByAccount || latestMarginManagerByAccount.length === 0) {
      return
    }

    // 验证：确保 marginManagerByAccount 属于当前账户
    if (latestMarginManagerByAccountOwner !== currentAccountAddress) {
      return
    }

    const marginManager = (latestMarginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === currentPool.address)
    if (!marginManager?.margin_manager_id) {
      return
    }

    // 生成请求 key
    const requestKey = `${currentAccountAddress}-${currentPool.address}-${marginManager.margin_manager_id}`

    // 清除全局请求状态，允许立即重新请求
    setLockedOrdersFetching(requestKey, false)
    await fetchMarginOpenOrdersRef.current()
  }, [setLockedOrdersFetching])

  // 计算 locked balance（token 数量）
  const lockedBalance = useMemo(() => {
    const result = {
      baseLockedBalance: '0',
      quoteLockedBalance: '0'
    }

    if (!marginOpenOrders || marginOpenOrders.length === 0 || !currentDeepBookPoolAddress) {
      return result
    }

    let baseLock = '0'
    let quoteLock = '0'

    marginOpenOrders.forEach((item: any) => {
      // 只计算当前池子的订单（双重检查）
      if (currentDeepBookPoolAddress === item?.address) {
        // 计算未成交的数量
        const remainingQuantity = d(item.originalQuantity || '0').sub(d(item.filledQuantity || '0'))

        if (item?.side === 'Buy' || item?.side === 'Long') {
          // 买单/Long锁定 quote asset (需要用 quote 购买 base)
          // locked quote = remaining quantity × price
          quoteLock = d(quoteLock)
            .add(remainingQuantity.mul(item.price || '0'))
            .toString()
        } else {
          // 卖单/Short锁定 base asset (需要卖出 base)
          // locked base = remaining quantity
          baseLock = d(baseLock).add(remainingQuantity).toString()
        }
      }
    })
    result.baseLockedBalance = baseLock
    result.quoteLockedBalance = quoteLock

    return result
  }, [marginOpenOrders, currentDeepBookPoolAddress])

  // 延迟获取价格，只在计算 USD 价值时获取，避免价格更新导致整个 hook 重新执行
  const { basePrice, quotePrice } = useDeepBookMarginPrices()

  // 计算 locked balance 的 USD 价值
  const baseLockedBalanceUSD = useMemo(() => {
    if (!basePrice || !lockedBalance.baseLockedBalance || lockedBalance.baseLockedBalance === '0') {
      return '0'
    }
    return d(lockedBalance.baseLockedBalance).mul(basePrice).toString()
  }, [lockedBalance.baseLockedBalance, basePrice])

  const quoteLockedBalanceUSD = useMemo(() => {
    if (!quotePrice || !lockedBalance.quoteLockedBalance || lockedBalance.quoteLockedBalance === '0') {
      return '0'
    }
    return d(lockedBalance.quoteLockedBalance).mul(quotePrice).toString()
  }, [lockedBalance.quoteLockedBalance, quotePrice])

  // 使用 useMemo 包装返回对象，确保依赖值未变化时返回相同引用，避免不必要的重新渲染
  return useMemo(() => {
    const result = {
      baseLockedBalance: lockedBalance.baseLockedBalance,
      quoteLockedBalance: lockedBalance.quoteLockedBalance,
      baseLockedBalanceUSD,
      quoteLockedBalanceUSD,
      refreshMarginLockedOrders // 暴露刷新方法
    }
    return result
  }, [lockedBalance.baseLockedBalance, lockedBalance.quoteLockedBalance, baseLockedBalanceUSD, quoteLockedBalanceUSD, refreshMarginLockedOrders])
}
