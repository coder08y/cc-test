import useDeepBookStore from '@/store/deepbook'
import { useFetch } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d } from '@cetus/utils'
import { useEffect, useRef } from 'react'
import useGetDeepBookManagerBalance from './useGetDeepBookManagerBalance'
import useGetDeepBookOrderBook from './useGetDeepBookOrderBook'
import useGetDeepBookPools from './useGetDeepBookPools'

const getDecimalPlaces = (value?: string | number) => {
  if (!value && value !== 0) return 0
  const normalized = typeof value === 'number' ? value.toString() : value
  if (!normalized) return 0
  const decimalPart = normalized.split('.')[1]
  return decimalPart ? decimalPart.length : 0
}

export default function useGetDeepBookOpenOrders() {
  const {
    currentDeepBookPool,
    getCurrentBalanceManagerInfo,
    setDeepBookOpenOrders,
    deepBookPools,
    setOrderListLoading,
    isCheckedAllMarkets,
    setCancelOrderLoading,
    deepBookPoolsObj,
    setShowOpenOrdersNum,
    setShowOpenOrdersNumSpot,
    setShowOpenOrdersNumMargin,
    orderTab
  } = useDeepBookStore()
  // const { marginManagerByAccount } = useMarginStore()
  const { currentAccount } = useAccountStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { deepBookSDK } = usePeripherySDKStore()
  const { getBalanceManagerInfo } = useGetDeepBookManagerBalance()
  const { fetchByApi } = useFetch()
  const { queryDeepBookPoolByValue } = useGetDeepBookPools()
  const isCheckedAllMarketsRef = useRef(false)

  // 用于防止竞态条件：跟踪当前最新的请求标识
  const currentRequestIdRef = useRef<string | null>(null)

  // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:42 ~ marginManagerByAccount:', marginManagerByAccount)

  useEffect(() => {
    isCheckedAllMarketsRef.current = isCheckedAllMarkets
  }, [isCheckedAllMarkets])

  // const currentBalanceManagerInfo = useMemo(() => {
  //   if (orderTab == 'margin') {
  //     return (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === currentDeepBookPool?.address)?.margin_manager_id
  //   }
  //   return getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
  // }, [orderTab, marginManagerByAccount, currentDeepBookPool, currentAccount])
  // // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:55 ~ useGetDeepBookOpenOrders ~ currentBalanceManagerInfo:', currentBalanceManagerInfo)

  // const currentBalanceManagerInfoRef = useRef(currentBalanceManagerInfo)

  // useEffect(() => {
  //   currentBalanceManagerInfoRef.current = currentBalanceManagerInfo
  // }, [currentBalanceManagerInfo])

  // const getDeepBookOpenOrders = async (
  //   poolInfo = currentDeepBookPool,
  //   account?: string,
  //   isMarginPool = false,
  //   isRefresh = false,
  //   eventCursor?: string,
  //   isLoadMore = false
  // ) => {
  //   // 生成当前请求的唯一标识（用于防止竞态条件）
  //   const requestId = `${poolInfo?.address || 'all'}-${isMarginPool ? 'margin' : 'spot'}-${currentAccount?.address || 'no-account'}-${Date.now()}`
  //   currentRequestIdRef.current = requestId

  //   try {
  //     // 只有非加载更多时才设置全局 loading（显示骨架屏）自动刷新不需要loading
  //     if (!isRefresh && !isLoadMore) {
  //       setOrderListLoading(true)
  //     }

  //     let deepBookAccount = null
  //     if (isMarginPool) {
  //       // margin 模式：使用 margin manager
  //       deepBookAccount = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === poolInfo?.address)?.margin_manager_id
  //     } else {
  //       // spot 模式：使用 balance manager
  //       deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
  //       if (!deepBookAccount) {
  //         const accounts = await deepBookSDK.DeepbookUtils.getBalanceManager(currentAccount?.address as string)
  //         if (accounts?.length > 0) {
  //           deepBookAccount = accounts?.[0]?.balanceManager
  //         }
  //       }
  //     }

  //     if (!deepBookAccount) {
  //       setOrderListLoading(false)
  //       if (!isLoadMore) {
  //         setDeepBookOpenOrders([])
  //       }
  //       return { list: [] }
  //     }

  //     // 优先使用 API 获取数据
  //     try {
  //       const queryParams: any = isMarginPool ? { balance_manager_owners: deepBookAccount } : { balance_manager_id: deepBookAccount }

  //       // 如果指定了 poolInfo，添加 pool_id 参数
  //       if (poolInfo?.address) {
  //         queryParams.pool_id = poolInfo.address
  //       }

  //       // 如果提供了游标
  //       if (eventCursor) {
  //         queryParams.event_cursor = eventCursor
  //       }

  //       const res = await fetchByApi(DeepBookOpenOrdersPath, 'GET', queryParams)

  //       if (res?.list && res.list.length > 0) {
  //         // 处理 API 返回的数据
  //         const result = []
  //         for (const item of res.list) {
  //           // 获取池信息
  //           let pool = poolInfo
  //           if (!pool || pool.address !== item.pool_id) {
  //             // 从 store 中获取池信息
  //             const poolsObj = deepBookPoolsObj as Record<string, any>
  //             pool = poolsObj[item.pool_id]
  //             // 如果 store 中没有，尝试查询
  //             if (!pool) {
  //               const poolList = await queryDeepBookPoolByValue(item.pool_id)
  //               if (poolList && poolList.length > 0) {
  //                 pool = poolList[0]
  //               }
  //             }
  //           }

  //           if (pool) {
  //             const wrapped = wrapDeepBookOpenOrdersFromApi(item, pool, isMarginPool)
  //             if (wrapped) {
  //               result.push(wrapped)
  //             }
  //           }
  //         }

  //         // 如果不是加载更多，直接设置数据
  //         // 检查请求 ID 是否仍然匹配（防止竞态条件）
  //         if (deepBookAccount && !isLoadMore && currentRequestIdRef.current === requestId) {
  //           setDeepBookOpenOrders(result)
  //           setOrderListLoading(false)
  //           // 根据 isMarginPool 设置对应的计数（通过 SDK 获取时，计算所有订单的 length）
  //           if (isMarginPool) {
  //             setShowOpenOrdersNumMargin(result.length)
  //           } else {
  //             setShowOpenOrdersNumSpot(result.length)
  //           }
  //         }
  //         setCancelOrderLoading(null)

  //         return { list: result }
  //       } else {
  //         // API 返回空列表
  //         // 检查请求 ID 是否仍然匹配（防止竞态条件）
  //         if (deepBookAccount && !isLoadMore && currentRequestIdRef.current === requestId) {
  //           setDeepBookOpenOrders([])
  //           setOrderListLoading(false)
  //           // 根据 isMarginPool 设置对应的计数为 0
  //           if (isMarginPool) {
  //             setShowOpenOrdersNumMargin(0)
  //           } else {
  //             setShowOpenOrdersNumSpot(0)
  //           }
  //         }
  //         setCancelOrderLoading(null)
  //         return { list: [] }
  //       }
  //     } catch (apiError) {
  //       // API 失败，回退到 SDK 方式
  //       // 注意：这里应该调用 getDeepBookOpenOrdersBySdk，而不是直接使用 SDK
  //       // 因为 getDeepBookOpenOrdersBySdk 已经处理了 margin 和 spot 的逻辑
  //       // 传递 requestId 以确保使用同一个请求标识
  //       return await getDeepBookOpenOrdersBySdk(poolInfo, account, isMarginPool, requestId)
  //     }
  //   } catch (error) {
  //     setOrderListLoading(false)
  //     // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:29 ~ getDeepBookOpenOrders ~ error:', error)
  //     return { list: [] }
  //   }
  // }

  // 新增：一次请求同时获取 spot + margin 数据
  const getDeepBookOpenOrdersCombined = async (marginManagerByAccount: any, poolInfo = currentDeepBookPool, account?: string, requestId?: string) => {
    const pool = getRequestPool(poolInfo)

    // 如果没有传入 requestId，生成一个新的（用于防止竞态条件）
    const currentRequestId = requestId || `${poolInfo?.address || 'all'}-combined-${currentAccount?.address || 'no-account'}-${Date.now()}`
    if (!requestId) {
      currentRequestIdRef.current = currentRequestId
    }

    try {
      setOrderListLoading(true)

      // 同时获取 spot 和 margin 数据
      const spotAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
      let spotAccountInfo = spotAccount
      if (!spotAccountInfo) {
        const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
        if (accounts?.length > 0) {
          spotAccountInfo = accounts[0].balanceManager
        }
      }

      const marginAccount = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === poolInfo?.address)?.margin_manager_id

      // 并行请求 spot 和 margin 数据
      console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:225 ~ getDeepBookOpenOrdersCombined ~ spotAccountInfo:', spotAccountInfo)
      const [spotOrderList, marginOrderList] = await Promise.all([
        spotAccountInfo
          ? deepBookSDK.DeepbookUtils.getOpenOrder(pool, currentAccount?.address as string, spotAccountInfo).catch(() => [])
          : Promise.resolve([]),
        marginAccount
          ? deepBookSDK.MarginUtils.getAccountOpenOrders({ poolInfo: pool as any, marginManager: marginAccount }).catch(() => [])
          : Promise.resolve([])
      ])

      // 处理 spot 数据
      const spotList: any[] = []
      console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:233 ~ getDeepBookOpenOrdersCombined ~ spotOrderList:', spotOrderList)
      if (spotOrderList && spotOrderList.length > 0) {
        const spotData = spotOrderList.map((item: any) => ({
          ...item,
          side: item.isBid ? 'buy' : 'sell',
          instrument: 'Spot'
        }))

        for (const item of spotData) {
          const wrapped = wrapDeepBookOpenOrdersFromApi(item, poolInfo, false)
          if (wrapped) {
            spotList.push(wrapped)
          }
        }
      }

      // 处理 margin 数据
      const marginList: any[] = []
      if (marginOrderList && marginOrderList.length > 0) {
        const marginData = marginOrderList.map((item: any) => ({
          ...item,
          side: item.isBid ? 'buy' : 'sell',
          instrument: 'Margin'
        }))

        for (const item of marginData) {
          const wrapped = wrapDeepBookOpenOrdersFromApi(item, poolInfo, true)
          if (wrapped) {
            marginList.push(wrapped)
          }
        }
      }

      // 合并 spot + margin 数据
      const combinedList = [...spotList, ...marginList]

      // 检查请求 ID 是否仍然匹配（防止竞态条件）
      if (currentRequestIdRef.current === currentRequestId) {
        setDeepBookOpenOrders(combinedList)
        setOrderListLoading(false)
        setShowOpenOrdersNum(combinedList.length)
        setShowOpenOrdersNumSpot(spotList.length)
        setShowOpenOrdersNumMargin(marginList.length)
      }

      return { list: combinedList }
    } catch (error) {
      console.error('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts ~ getDeepBookOpenOrdersCombined ~ error:', error)
      setOrderListLoading(false)
      return { list: [] }
    }
  }

  const getDeepBookOpenOrdersBySdk = async (
    marginManagerByAccount: any,
    poolInfo = currentDeepBookPool,
    account?: string,
    isMarginPool = false,
    requestId?: string
  ) => {
    const pool = getRequestPool(poolInfo)

    // 如果没有传入 requestId，生成一个新的（用于防止竞态条件）
    const currentRequestId =
      requestId || `${poolInfo?.address || 'all'}-${isMarginPool ? 'margin' : 'spot'}-${currentAccount?.address || 'no-account'}-${Date.now()}`
    if (!requestId) {
      currentRequestIdRef.current = currentRequestId
    }

    try {
      let deepBookAccount = null

      if (isMarginPool) {
        deepBookAccount = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === currentDeepBookPool?.address)?.margin_manager_id
      } else {
        deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager

        if (!deepBookAccount) {
          const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
          if (accounts?.length > 0) {
            deepBookAccount = accounts[0].balanceManager
          }
        }
      }
      // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:177 ~ getDeepBookOpenOrdersBySdk ~ deepBookAccount:', deepBookAccount)

      console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:319 ~ getDeepBookOpenOrdersBySdk ~ deepBookAccount:', deepBookAccount)
      if (!deepBookAccount) {
        setOrderListLoading(false)
        setShowOpenOrdersNum(0)
        // 根据 isMarginPool 设置对应的计数为 0
        if (isMarginPool) {
          setShowOpenOrdersNumMargin(0)
        } else {
          setShowOpenOrdersNumSpot(0)
        }
        setDeepBookOpenOrders([])
        return { list: [] }
      }

      const orderList = isMarginPool
        ? await deepBookSDK.MarginUtils.getAccountOpenOrders({ poolInfo: pool as any, marginManager: deepBookAccount })
        : await deepBookSDK.DeepbookUtils.getOpenOrder(pool, currentAccount?.address as string, deepBookAccount)

      console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:178 ~ getDeepBookOpenOrdersBySdk ~ warpToApiOrderList:', orderList)
      const warpToApiOrderList = orderList.map((item: any) => ({
        ...item,
        side: item.isBid ? 'buy' : 'sell',
        instrument: isMarginPool ? 'Margin' : 'Spot'
      }))

      const poolsObj = deepBookPoolsObj as Record<string, any>
      const poolCache = new Map<string, any>()
      const list: any[] = []

      for (const item of warpToApiOrderList) {
        if (poolInfo) {
          const wrapped = wrapDeepBookOpenOrdersFromApi(item, poolInfo, isMarginPool)
          console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:194 ~ getDeepBookOpenOrdersBySdk ~ wrapped:', wrapped)
          if (wrapped) {
            list.push(wrapped)
          }
        }
      }

      // console.log(
      //   '🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:215 ~ getDeepBookOpenOrdersBySdk ~ deepBookAccount:',
      //   deepBookAccount,
      //   'isMarginPool:',
      //   isMarginPool
      // )
      // 直接设置数据，因为 deepBookAccount 已经根据 isMarginPool 正确获取了
      // 这里不再依赖全局的 orderTab，而是根据传入的参数来决定
      // 检查请求 ID 是否仍然匹配（防止竞态条件）
      if (deepBookAccount && currentRequestIdRef.current === currentRequestId) {
        setDeepBookOpenOrders(list)
        // setOrderListLoading(false)
        setShowOpenOrdersNum(list.length)
        // 根据 isMarginPool 设置对应的计数（通过 SDK 获取时，计算所有订单的 length）
        if (isMarginPool) {
          setShowOpenOrdersNumMargin(list.length)
        } else {
          setShowOpenOrdersNumSpot(list.length)
        }
      }

      return { list }
    } catch (error) {
      console.error('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:156 ~ getDeepBookOpenOrdersBySdk ~ error:', error)
      return []
    }
  }

  // 包装 SDK 返回的数据
  const wrapDeepBookOpenOrders = (item: any, poolInfo: any) => {
    const { order_id, isBid, price, quantity, filled_quantity } = item
    const { baseAssets, quoteAssets, address } = poolInfo
    const quoteDecimals = quoteAssets.decimals
    const baseDecimals = baseAssets.decimals
    const originalQuantity = d(quantity).div(Math.pow(10, baseDecimals)).toString()
    const filledQuantity = d(filled_quantity).div(Math.pow(10, baseDecimals)).toString()
    const minSize = poolInfo?.minSize
    const lotSize = poolInfo?.lotSize
    const isMarginPool = orderTab === 'margin'

    return {
      orderId: order_id,
      side: isMarginPool ? (isBid ? 'Long' : 'Short') : isBid ? 'Buy' : 'Sell',
      baseAsset: poolInfo.baseAssets.symbol,
      quoteAsset: poolInfo.quoteAssets.symbol,
      price: d(price.toString())
        .div(Math.pow(10, quoteDecimals - baseDecimals + 9))
        .toString(),
      originalQuantity,
      filledQuantity,
      baseAssets,
      quoteAssets,
      address,
      minSize,
      lotSize,
      // 产品要求基于lotSize
      amountDecimals: getDecimalPlaces(lotSize)
    }
  }

  // 包装 API 返回的数据
  const wrapDeepBookOpenOrdersFromApi = (item: any, poolInfo: any, isMarginPool: boolean = false) => {
    try {
      const { order_id, side, price, quantity, filled, event_cursor, expire_timestamp, filled_quantity } = item
      const { baseAssets, quoteAssets, address } = poolInfo
      const quoteDecimals = quoteAssets.decimals
      const baseDecimals = baseAssets.decimals
      const originalQuantity = d(quantity).div(Math.pow(10, baseDecimals)).toString()
      // const filledQuantity = d(filled).div(Math.pow(10, baseDecimals)).toString()
      const filledQuantity = d(filled_quantity).div(Math.pow(10, baseDecimals)).toString()
      const minSize = poolInfo?.minSize
      const lotSize = poolInfo?.lotSize

      return {
        orderId: order_id,
        side: isMarginPool ? (side === 'buy' ? 'Buy' : 'Sell') : side === 'buy' ? 'Buy' : 'Sell',
        instrument: isMarginPool ? 'Margin' : 'Spot',
        baseAsset: poolInfo.baseAssets.symbol,
        quoteAsset: poolInfo.quoteAssets.symbol,
        price: d(price)
          .div(Math.pow(10, quoteDecimals - baseDecimals + 9))
          .toString(),
        originalQuantity,
        filledQuantity,
        baseAssets,
        quoteAssets,
        address,
        minSize,
        lotSize,
        // 产品要求基于lotSize
        amountDecimals: getDecimalPlaces(lotSize),
        eventCursor: event_cursor,
        expireTimestamp: expire_timestamp
      }
    } catch (error) {
      console.error('🚀🚀🚀 ~ wrapDeepBookOpenOrdersFromApi ~ error:', error, item)
      return null
    }
  }

  // const getDeepBookAllOpenOrdersByApi = async (isRefresh = true, eventCursor?: string, isLoadMore = false) => {
  //   try {
  //     // 只有非加载更多时才设置全局 loading（显示骨架屏）自动刷新不需要loading
  //     if (!isRefresh && !isLoadMore) {
  //       setOrderListLoading(true)
  //     }
  //     let deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager
  //     if (!deepBookAccount) {
  //       const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
  //       if (accounts?.length > 0) {
  //         deepBookAccount = accounts?.[0]?.balanceManager
  //       }
  //     }

  //     if (!deepBookAccount) {
  //       setOrderListLoading(false)
  //       if (!isLoadMore) {
  //         setDeepBookOpenOrders([])
  //       }
  //       return { list: [] }
  //     }

  //     // 优先使用 API 获取所有市场的订单
  //     try {
  //       const queryParams: any = {
  //         balance_manager_id: deepBookAccount
  //       }

  //       // 如果提供了游标
  //       if (eventCursor) {
  //         queryParams.event_cursor = eventCursor
  //       }

  //       const res = await fetchByApi(DeepBookOpenOrdersPath, 'GET', queryParams)

  //       if (res?.list && res.list.length > 0) {
  //         // 处理 API 返回的数据
  //         const allList = []
  //         const poolsObj = deepBookPoolsObj as Record<string, any>
  //         const poolCache = new Map<string, any>()

  //         for (const item of res.list) {
  //           // 获取池信息
  //           let pool = poolsObj[item.pool_id]
  //           if (!pool) {
  //             // 检查缓存
  //             if (poolCache.has(item.pool_id)) {
  //               pool = poolCache.get(item.pool_id)
  //             } else {
  //               // 从 deepBookPools 中查找
  //               pool = deepBookPools.find((p: any) => p.address === item.pool_id)
  //               if (!pool) {
  //                 // 如果都没有，尝试查询
  //                 const poolList = await queryDeepBookPoolByValue(item.pool_id)
  //                 if (poolList && poolList.length > 0) {
  //                   pool = poolList[0]
  //                   poolCache.set(item.pool_id, pool)
  //                 }
  //               } else {
  //                 poolCache.set(item.pool_id, pool)
  //               }
  //             }
  //           }

  //           if (pool) {
  //             const wrapped = wrapDeepBookOpenOrdersFromApi(item, pool, false) // getDeepBookAllOpenOrdersByApi 是 spot 的 API
  //             if (wrapped) {
  //               allList.push(wrapped)
  //             }
  //           }
  //         }

  //         // 注意：getDeepBookAllOpenOrdersByApi 只用于 spot，不应该在 margin 模式下调用
  //         // 这里保留检查是为了向后兼容，但实际上应该总是使用 getDeepBookAllOpenOrdersBySdk
  //         if (isCheckedAllMarketsRef.current && deepBookAccount == currentBalanceManagerInfoRef.current && !isLoadMore) {
  //           setDeepBookOpenOrders(allList)
  //           setOrderListLoading(false)
  //         }
  //         return { list: allList }
  //       } else {
  //         // API 返回空列表
  //         if (isCheckedAllMarketsRef.current && deepBookAccount == currentBalanceManagerInfoRef.current && !isLoadMore) {
  //           setDeepBookOpenOrders([])
  //           setOrderListLoading(false)
  //         }
  //         return { list: [] }
  //       }
  //     } catch (apiError) {
  //       // API 失败，回退到 SDK 方式
  //       const allList = []
  //       for (let i = 0; i < deepBookPools.length; i++) {
  //         const pool = deepBookPools[i]
  //         const poolInfo = getRequestPool(pool)
  //         const list = await deepBookSDK.DeepbookUtils.getOpenOrder(poolInfo, currentAccount?.address as string, deepBookAccount)
  //         const result = list.map((item: any) => {
  //           return wrapDeepBookOpenOrders(item, pool)
  //         })
  //         allList.push(...result)
  //       }
  //       if (isCheckedAllMarketsRef.current && deepBookAccount == currentBalanceManagerInfoRef.current && !isLoadMore) {
  //         setDeepBookOpenOrders(allList)
  //         setOrderListLoading(false)
  //       }
  //       // SDK 方式没有游标，返回所有数据
  //       return { list: allList }
  //     }
  //   } catch (error) {
  //     setOrderListLoading(false)
  //     // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:85 ~ getDeepBookAllOpenOrders ~ error:', error)
  //     return { list: [] }
  //   }
  // }

  const getDeepBookAllOpenOrdersBySdk = async (
    marginManagerByAccount: any,
    isRefresh = false,
    eventCursor?: string,
    isLoadMore = false,
    isMarginPool = false
  ) => {
    // 生成当前请求的唯一标识（用于防止竞态条件）
    const requestId = `all-${isMarginPool ? 'margin' : 'spot'}-${currentAccount?.address || 'no-account'}-${Date.now()}`
    currentRequestIdRef.current = requestId

    try {
      // 自动刷新不需要loading
      if (!isRefresh) {
        setOrderListLoading(true)
      }

      let deepBookAccount = null

      if (isMarginPool) {
        deepBookAccount = (marginManagerByAccount as any[]).find((m: any) => m.deepbook_pool_id === currentDeepBookPool?.address)?.margin_manager_id
      } else {
        deepBookAccount = getCurrentBalanceManagerInfo(currentAccount?.address as string)?.balanceManager

        if (!deepBookAccount) {
          const accounts = await getBalanceManagerInfo(currentAccount?.address as string)
          if (accounts?.length > 0) {
            deepBookAccount = accounts[0].balanceManager
          }
        }
      }
      if (!deepBookAccount && !isMarginPool) {
        setDeepBookOpenOrders([])
        // setOrderListLoading(false)
        setShowOpenOrdersNum(0)
        return { list: [] }
      }

      const pools = (deepBookPools as any[])
        .filter(item => item?.baseMarginPool && item?.quoteMarginPool)
        .map((item: any) => {
          return {
            ...getRequestPool(item),
            margin_manager_id: (marginManagerByAccount as any[]).find(
              (m: any) => m.deepbook_pool_id === item?.address && m.owner === currentAccount?.address
            )?.margin_manager_id
          }
        })

      const orderList = isMarginPool
        ? await deepBookSDK.MarginUtils.getAccountAllMarketsOpenOrders(currentAccount?.address as string, pools)
        : await deepBookSDK.DeepbookUtils.getAllMarketsOpenOrders(currentAccount?.address as string, deepBookAccount)
      // console.log('getDeepBookOpenOrdersBySdk ~ orderList:', orderList)

      const warpToApiOrderList = orderList.map((item: any) => ({
        ...item,
        side: item.isBid ? 'buy' : 'sell',
        instrument: isMarginPool ? 'Margin' : 'Spot'
      }))

      const poolsObj = deepBookPoolsObj as Record<string, any>
      const poolCache = new Map<string, any>()
      const allList: any[] = []

      // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:470 ~ getDeepBookAllOpenOrdersBySdk ~ warpToApiOrderList:', warpToApiOrderList)
      for (const item of warpToApiOrderList) {
        let pool = poolsObj[item.pool.address || item.pool.pool_id]

        if (!pool) {
          if (poolCache.has(item.pool.address || item.pool.pool_id)) {
            pool = poolCache.get(item.pool.address || item.pool.pool_id)
          } else {
            pool = deepBookPools.find((p: any) => {
              return p.address === item.pool.pool_id
            })

            if (!pool) {
              const poolList = await queryDeepBookPoolByValue(item.pool.address || item.pool.pool_id)
              if (poolList?.length > 0) {
                pool = poolList[0]
              }
            }

            if (pool) {
              poolCache.set(item.pool.address || item.pool.pool_id, pool)
            }
          }
        }

        // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:485 ~ getDeepBookAllOpenOrdersBySdk ~ pool:', pool)
        if (pool) {
          const wrapped = wrapDeepBookOpenOrdersFromApi(item, pool, isMarginPool)
          // console.log('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:487 ~ getDeepBookAllOpenOrdersBySdk ~ wrapped:', wrapped)
          if (wrapped) {
            allList.push(wrapped)
          }
        }
      }

      // console.log(
      //   '🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:498 ~ getDeepBookAllOpenOrdersBySdk ~ deepBookAccount:',
      //   deepBookAccount,
      //   'isMarginPool:',
      //   isMarginPool,
      //   'isCheckedAllMarketsRef.current:',
      //   isCheckedAllMarketsRef.current
      // )
      // 直接设置数据，因为 deepBookAccount 已经根据 isMarginPool 正确获取了
      // 这里不再依赖全局的 orderTab，而是根据传入的参数来决定
      // 检查请求 ID 是否仍然匹配（防止竞态条件）

      if (isCheckedAllMarketsRef.current && (deepBookAccount || isMarginPool) && currentRequestIdRef.current === requestId) {
        setDeepBookOpenOrders(allList)
        // setOrderListLoading(false)
        setShowOpenOrdersNum(allList.length)
        // 根据 isMarginPool 设置对应的计数（通过 SDK 获取时，计算所有订单的 length）
        if (isMarginPool) {
          setShowOpenOrdersNumMargin(allList.length)
        } else {
          setShowOpenOrdersNumSpot(allList.length)
        }
      }

      return { list: allList }
    } catch (error) {
      console.error('🚀🚀🚀 ~ useGetDeepBookOpenOrders.ts:589 ~ getDeepBookAllOpenOrdersBySdk ~ error:', error)
      // setOrderListLoading(false)
      return { list: [] }
    }
  }

  return {
    getDeepBookOpenOrders: getDeepBookOpenOrdersBySdk,
    getDeepBookAllOpenOrders: getDeepBookAllOpenOrdersBySdk,
    getDeepBookOpenOrdersCombined,
    getDeepBookAllOpenOrdersCombined: async (marginManagerByAccount: any, isRefresh = false, eventCursor?: string, isLoadMore = false) => {
      // All markets combined：一次请求同时获取 spot + margin
      // 并行请求 spot 和 margin 数据
      const [spotResult, marginResult] = await Promise.all([
        getDeepBookAllOpenOrdersBySdk(marginManagerByAccount, isRefresh, eventCursor, isLoadMore, false),
        getDeepBookAllOpenOrdersBySdk(marginManagerByAccount, isRefresh, eventCursor, isLoadMore, true)
      ])

      // 合并结果

      const combinedList = [...(spotResult?.list || []), ...(marginResult?.list || [])]

      console.log('combinedList: ', combinedList)

      // 更新全局状态
      if (isCheckedAllMarketsRef.current) {
        setDeepBookOpenOrders(combinedList)
        setOrderListLoading(false)
        setShowOpenOrdersNum(combinedList.length)
        setShowOpenOrdersNumSpot(spotResult?.list?.length || 0)
        setShowOpenOrdersNumMargin(marginResult?.list?.length || 0)
      }

      return { list: combinedList }
    }
  }
}
