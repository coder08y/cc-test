import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { useCallback, useEffect, useRef } from 'react'

export default function useDeepBookMarginPrices() {
  const currentDeepBookPool = useDeepBookStore((state: any) => state.currentDeepBookPool)
  const deepBookSDK = usePeripherySDKStore((state: any) => state.deepBookSDK)

  // 从 store 读取价格（优化选择器，直接返回基本类型值而不是对象）
  const basePrice = useMarginStore((state: any) => {
    if (!currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginPrice(currentDeepBookPool.address).basePrice
  })

  const quotePrice = useMarginStore((state: any) => {
    if (!currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginPrice(currentDeepBookPool.address).quotePrice
  })

  // 使用 ref 存储最新的 fetchPrices，避免 useEffect 依赖问题
  const fetchPricesRef = useRef<() => Promise<void>>()

  // 获取价格
  const fetchPrices = useCallback(async () => {
    if (
      !currentDeepBookPool?.address ||
      !currentDeepBookPool?.baseAssets?.coin_type ||
      !currentDeepBookPool?.quoteAssets?.coin_type ||
      !deepBookSDK
    ) {
      if (currentDeepBookPool?.address) {
        useMarginStore.getState().setMarginPrice(currentDeepBookPool.address, null, null)
      }
      return
    }

    // 防重复请求：检查是否正在请求中
    if (useMarginStore.getState().isPriceFetching(currentDeepBookPool.address)) {
      return
    }

    try {
      const baseFeed = currentDeepBookPool.baseAssets.feed
      const quoteFeed = currentDeepBookPool.quoteAssets.feed

      if (!baseFeed || !quoteFeed) {
        console.warn('Feed not found for coins:', {
          base: currentDeepBookPool.baseAssets.coin_type,
          quote: currentDeepBookPool.quoteAssets.coin_type
        })
        useMarginStore.getState().setMarginPrice(currentDeepBookPool.address, null, null)
        return
      }

      // 标记正在请求中
      useMarginStore.getState().setPriceFetching(currentDeepBookPool.address, true)

      const coinList = [
        {
          coinType: currentDeepBookPool.baseAssets.coin_type,
          feed: baseFeed
        },
        {
          coinType: currentDeepBookPool.quoteAssets.coin_type,
          feed: quoteFeed
        }
      ]

      const priceRes: any = await (deepBookSDK as any).PythPrice?.getLatestPrice(coinList)

      if (priceRes) {
        // priceRes 应该是一个对象，key 是 coinType，value 包含 price
        // 尝试多种可能的 key 格式
        const baseCoinType = currentDeepBookPool.baseAssets.coin_type
        const quoteCoinType = currentDeepBookPool.quoteAssets.coin_type

        const basePriceValue =
          priceRes[baseCoinType]?.price || priceRes[coinList[0].coinType]?.price || (Array.isArray(priceRes) && priceRes[0]?.price)
        const quotePriceValue =
          priceRes[quoteCoinType]?.price || priceRes[coinList[1].coinType]?.price || (Array.isArray(priceRes) && priceRes[1]?.price)

        // 更新到 store
        useMarginStore
          .getState()
          .setMarginPrice(
            currentDeepBookPool.address,
            basePriceValue ? Number(basePriceValue) : null,
            quotePriceValue ? Number(quotePriceValue) : null
          )
      } else {
        useMarginStore.getState().setMarginPrice(currentDeepBookPool.address, null, null)
      }
    } catch (error) {
      console.error('Failed to get prices:', error)
      if (currentDeepBookPool?.address) {
        useMarginStore.getState().setMarginPrice(currentDeepBookPool.address, null, null)
      }
    } finally {
      // 请求完成，重置标记
      if (currentDeepBookPool?.address) {
        useMarginStore.getState().setPriceFetching(currentDeepBookPool.address, false)
      }
    }
  }, [currentDeepBookPool?.address, currentDeepBookPool?.baseAssets?.coin_type, currentDeepBookPool?.quoteAssets?.coin_type, deepBookSDK])

  // 更新 ref，确保总是使用最新的 fetchPrices
  fetchPricesRef.current = fetchPrices

  // 自动获取价格（默认行为）
  // 当池子切换时，自动获取新池子的价格
  useEffect(() => {
    if (
      !currentDeepBookPool?.address ||
      !currentDeepBookPool?.baseAssets?.coin_type ||
      !currentDeepBookPool?.quoteAssets?.coin_type ||
      !deepBookSDK
    ) {
      return
    }

    // 先检查 store 中是否已有当前池子的有效数据
    const existingPrice = useMarginStore.getState().getMarginPrice(currentDeepBookPool.address)
    const hasValidData = existingPrice.basePrice !== null && existingPrice.quotePrice !== null

    // 如果没有有效数据，则请求
    if (!hasValidData && fetchPricesRef.current) {
      fetchPricesRef.current()
    }
  }, [
    currentDeepBookPool?.address,
    currentDeepBookPool?.baseAssets?.coin_type,
    currentDeepBookPool?.quoteAssets?.coin_type,
    deepBookSDK
    // 注意：不直接依赖 fetchPrices，使用 ref 避免频繁触发
  ])

  return {
    basePrice, // base token price
    quotePrice, // quote token price
    fetchPrices // 暴露 fetchPrices 方法供外部调用（用于强制刷新）
  }
}
