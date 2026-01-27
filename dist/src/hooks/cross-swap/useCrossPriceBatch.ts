import { useSdk } from '@cetus/sdk-factory'
import { fetchGet } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { CrossSwapPlatform, CrossSwapToken, generateTokenKey } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'
import { addresses } from '@mayanfinance/swap-sdk'
import { QueryFunctionContext, useQueries, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

export interface MayanPriceResponse {
  price: number
}

export interface MayanPriceData {
  price: number | null
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

// 缓存配置
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000,
  refetchInterval: 60 * 1000,
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
}

/**
 * Hook for fetching multiple cross prices using React Query with enhanced caching
 * @param platform - The cross swap platform
 * @param tokens - Array of tokens to fetch prices for
 * @param cacheConfig - Cache configuration options
 * @param enabled - Whether to enable the query (default: true)
 * @returns MayanPriceBatchHookResult
 */
export function useCrossPriceBatch(platform: CrossSwapPlatform, tokens: CrossSwapToken[], enabled: boolean = true, only_use_cache: boolean = false) {
  const queryClient = useQueryClient()
  const config = { ...CACHE_CONFIG }
  const sdk = useSdk('crossSwap')

  const generateQueryKey = useCallback((token: CrossSwapToken) => {
    if (token.type === ChainType.MVM) {
      return ['cross-price', fixCoinType(token.address, false), token.chain_id, token.coingecko_id]
    }
    return ['cross-price', token.address, token.chain_id, token.coingecko_id]
  }, [])

  // 获取缓存数据
  const getCachedPrice = useCallback(
    (token?: CrossSwapToken): number | null => {
      if (!token) return null

      const queryKey = generateQueryKey(token)
      const price = queryClient.getQueryData<number>(queryKey)

      return price || null
    },
    [queryClient, generateQueryKey]
  )

  const queries = useQueries({
    queries: tokens.map(token => ({
      queryKey: generateQueryKey(token),
      queryFn: async (context: QueryFunctionContext) => {
        const [, address, chain_id, coingecko_id] = context.queryKey
        if (address === undefined || chain_id === undefined || coingecko_id === undefined) {
          throw new Error('Missing required parameters: address or chain_id')
        }
        const startTime = performance.now()
        try {
          let price: number | null = null

          if (platform === CrossSwapPlatform.MAYAN) {
            const cachedPrice = getCachedPrice(token)
            if (cachedPrice !== null && only_use_cache) {
              return cachedPrice
            }
            const response: MayanPriceResponse = await fetchGet(`${addresses.PRICE_URL}/price?id=${coingecko_id}`)
            if (response && typeof response.price === 'number' && response.price > 0) {
              price = response.price
            }
          } else {
            if (only_use_cache) {
              return Number(token.price_usd || 0)
            }
            const response = await sdk!.getCrossSwapToken(platform, chain_id as any, address as string, true)
            if (response) {
              price = Number(response.price_usd)
            }
          }

          if (price) {
            const duration = performance.now() - startTime
            console.debug(`Price fetched for ${address}: ${price} (${duration.toFixed(2)}ms)`)
            return price
          } else {
            throw new Error(`Invalid price data received for ${address}`)
          }
        } catch (error) {
          const duration = performance.now() - startTime
          console.error(`Failed to fetch price for ${address} (${duration.toFixed(2)}ms):`, error)
          throw error
        }
      },
      select: (data: number) => ({
        price: data,
        loading: false,
        error: null,
        lastUpdated: null
      }),
      enabled: enabled && Boolean(sdk),
      staleTime: config.staleTime,
      refetchInterval: config.refetchInterval,
      retryDelay: config.retryDelay,
      retry: (failureCount: number, error: any) => {
        if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
          return failureCount < config.retry
        }
        if (error?.message?.includes('Invalid price data')) {
          return false
        }
        return failureCount < config.retry
      }
    }))
  })

  const result = useMemo(() => {
    const pricesMap: Record<string, MayanPriceData> = {}
    let hasErrorFlag = false
    let isLoading = false

    queries.forEach((query, index) => {
      const token = tokens[index]
      if (!token) return

      // 处理查询状态
      const hasQueryError = !!query.error
      const isQueryLoading = query.isLoading

      if (hasQueryError) {
        hasErrorFlag = true
      }
      if (isQueryLoading) {
        isLoading = true
      }

      const tokenKey = generateTokenKey(token)
      if (query.data) {
        pricesMap[tokenKey] = query.data
      } else {
        pricesMap[tokenKey] = {
          price: null,
          loading: isQueryLoading,
          error: hasQueryError ? (query.error as Error).message : null,
          lastUpdated: null
        }
      }
    })

    return {
      prices: pricesMap,
      loading: isLoading,
      hasError: hasErrorFlag
    }
  }, [queries])

  const getPrice = useCallback(
    (token?: CrossSwapToken): number | null => {
      if (!token) return null

      // 优先获取缓存价格
      const cachedPrice = getCachedPrice(token)
      if (cachedPrice !== null) {
        return cachedPrice
      }
      const tokenKey = generateTokenKey(token)
      // 如果缓存没有值，则使用查询结果
      return result.prices[tokenKey]?.price || null
    },
    [result.prices, tokens, getCachedPrice]
  )

  const refetch = useCallback(
    async (token?: CrossSwapToken) => {
      if (token) {
        const queryIndex = tokens?.findIndex(t => t.address === token.address && t.chain_id === token.chain_id)
        if (queryIndex !== undefined && queryIndex >= 0) {
          await queries[queryIndex].refetch()
        }
      } else {
        await Promise.all(queries.map(query => query.refetch()))
      }
    },
    [queries, tokens]
  )

  return {
    prices: result.prices,
    loading: result.loading,
    hasError: result.hasError,
    refetch,
    getPrice,
    getCachedPrice
  }
}

/**
 * 用于单个 token 价格查询
 * @param token - The token to fetch price for
 * @param platform - The cross swap platform
 * @param cacheConfig - Cache configuration options
 * @param enabled - Whether to enable the query (default: true)
 * @returns 单个 token 的价格数据
 */
export function useCrossPrice(platform: CrossSwapPlatform, token?: CrossSwapToken, enabled: boolean = true, only_use_cache: boolean = false) {
  // 使用 useMemo 稳定 tokens 数组引用
  const tokens = useMemo(() => {
    return token ? [token] : []
  }, [token?.address, token?.chain_id, token?.symbol])

  const { prices, loading, hasError, refetch, getPrice, getCachedPrice } = useCrossPriceBatch(
    platform || CrossSwapPlatform.MAYAN,
    tokens,
    enabled,
    only_use_cache
  )

  const price = useMemo(() => {
    if (!token) return null

    const cachedPrice = getCachedPrice(token)
    if (cachedPrice !== null) {
      return cachedPrice
    }

    return getPrice(token)
  }, [token?.address, token?.chain_id, platform, enabled, only_use_cache, getCachedPrice, getPrice])

  return {
    price,
    refetch: () => (token ? refetch(token) : Promise.resolve()),
    getCachedPrice: () => getCachedPrice(token)
  }
}

export default useCrossPriceBatch
