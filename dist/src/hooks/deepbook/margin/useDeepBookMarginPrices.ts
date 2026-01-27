import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { useCallback, useEffect, useRef } from 'react'

export default function useDeepBookMarginPrices(poolAddress?: string) {
  const currentDeepBookPool = useDeepBookStore((state: any) => state.currentDeepBookPool)
  const deepBookPools = useDeepBookStore((state: any) => state.deepBookPools)
  const deepBookSDK = usePeripherySDKStore((state: any) => state.deepBookSDK)

  // 从 store 读取价格（优化选择器，直接返回基本类型值而不是对象）
  const basePrice = useMarginStore((state: any) => {
    if (!poolAddress || !currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginPrice(poolAddress || currentDeepBookPool.address).basePrice
  })

  const quotePrice = useMarginStore((state: any) => {
    if (!poolAddress || !currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginPrice(poolAddress || currentDeepBookPool.address).quotePrice
  })

  // 使用 ref 存储最新的 fetchPrices，避免 useEffect 依赖问题
  const fetchPricesRef = useRef<() => Promise<void>>()

  // 获取所有 margin pool 的价格
  const fetchPrices = useCallback(async () => {
    if (!deepBookSDK || !deepBookPools || deepBookPools.length === 0) {
      return
    }

    // 获取所有 margin pools
    const marginPools = (deepBookPools || []).filter((pool: any) => pool.isMarginPool === true)

    if (marginPools.length === 0) {
      return
    }

    // 收集所有需要获取价格的 coinType 和 feed（去重）
    const coinMap = new Map<string, { coinType: string; feed: string }>()

    marginPools.forEach((pool: any) => {
      if (pool.baseAssets?.coin_type && pool.baseAssets?.feed) {
        coinMap.set(pool.baseAssets.coin_type, {
          coinType: pool.baseAssets.coin_type,
          feed: pool.baseAssets.feed
        })
      }
      if (pool.quoteAssets?.coin_type && pool.quoteAssets?.feed) {
        coinMap.set(pool.quoteAssets.coin_type, {
          coinType: pool.quoteAssets.coin_type,
          feed: pool.quoteAssets.feed
        })
      }
    })

    const coinList = Array.from(coinMap.values())

    if (coinList.length === 0) {
      return
    }

    // 检查是否正在批量请求中（使用一个全局标记）
    const store = useMarginStore.getState()
    const isAnyFetching = marginPools.some((pool: any) => store.isPriceFetching(pool.address))
    if (isAnyFetching) {
      return
    }

    // 标记所有池子正在请求中
    marginPools.forEach((pool: any) => {
      store.setPriceFetching(pool.address, true)
    })

    try {
      const priceRes: any = await (deepBookSDK as any).PythPrice?.getLatestPrice(coinList)

      if (priceRes) {
        // 为每个 margin pool 设置价格
        marginPools.forEach((pool: any) => {
          const baseCoinType = pool.baseAssets?.coin_type
          const quoteCoinType = pool.quoteAssets?.coin_type

          if (!baseCoinType || !quoteCoinType) {
            store.setMarginPrice(pool.address, null, null)
            return
          }

          // 尝试多种可能的 key 格式获取价格
          const baseCoin = coinList.find((c: any) => c.coinType === baseCoinType)
          const quoteCoin = coinList.find((c: any) => c.coinType === quoteCoinType)

          const basePriceValue = priceRes[baseCoinType]?.price || (baseCoin ? priceRes[baseCoin.coinType]?.price : null) || null

          const quotePriceValue = priceRes[quoteCoinType]?.price || (quoteCoin ? priceRes[quoteCoin.coinType]?.price : null) || null

          // 更新到 store
          store.setMarginPrice(pool.address, basePriceValue ? Number(basePriceValue) : null, quotePriceValue ? Number(quotePriceValue) : null)
        })
      } else {
        // 如果获取失败，将所有池子价格设为 null
        marginPools.forEach((pool: any) => {
          store.setMarginPrice(pool.address, null, null)
        })
      }
    } catch (error) {
      console.error('Failed to get prices for all margin pools:', error)
      // 出错时将所有池子价格设为 null
      marginPools.forEach((pool: any) => {
        store.setMarginPrice(pool.address, null, null)
      })
    } finally {
      // 请求完成，重置所有池子的标记
      marginPools.forEach((pool: any) => {
        store.setPriceFetching(pool.address, false)
      })
    }
  }, [deepBookPools, deepBookSDK])

  // 更新 ref，确保总是使用最新的 fetchPrices
  fetchPricesRef.current = fetchPrices

  // 自动获取所有 margin pool 的价格（默认行为）
  // 当 deepBookPools 加载完成时，自动获取所有 margin pool 的价格
  useEffect(() => {
    if (!deepBookPools || deepBookPools.length === 0 || !deepBookSDK) {
      return
    }

    // 检查是否有 margin pool 需要获取价格
    const marginPools = deepBookPools.filter((pool: any) => pool.isMarginPool === true)
    if (marginPools.length === 0) {
      return
    }

    // 检查是否有池子需要获取价格（至少有一个池子没有价格数据）
    const store = useMarginStore.getState()
    const needsFetch = marginPools.some((pool: any) => {
      const existingPrice = store.getMarginPrice(pool.address)
      return existingPrice.basePrice === null || existingPrice.quotePrice === null
    })

    // 如果有需要获取价格的池子，则请求
    if (needsFetch && fetchPricesRef.current) {
      fetchPricesRef.current()
    }
  }, [
    deepBookPools,
    deepBookSDK
    // 注意：不直接依赖 fetchPrices，使用 ref 避免频繁触发
  ])

  return {
    basePrice, // base token price
    quotePrice, // quote token price
    fetchPrices // 暴露 fetchPrices 方法供外部调用（用于强制刷新）
  }
}
