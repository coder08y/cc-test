import useDeepBookStore from '@/store/deepbook'
import { isTrustedToken } from '@/utils'
import { useGlobalToast } from '@cetus/design'
import useTokenStore from '@cetus/stores/src/token'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// 排序类型定义
export type SortType = 'none' | 'asc' | 'desc'
export type SortField = '24hChg' | 'vol24h' | null

export function useDeepBookFilteredPools({
  inputValue,
  key,
  sortField = 'vol24h',
  sortType = 'desc',
  isAllPools = false,
  selectedTokenSymbol = null
}: {
  inputValue: string
  key: string
  sortField?: SortField
  sortType?: SortType
  isAllPools?: boolean
  selectedTokenSymbol?: string | null
}) {
  const deepBookPools = useDeepBookStore(state => {
    return state.deepBookPools
  })
  // console.log('🚀🚀🚀 ~ useDeepBooKPools.ts:29 ~ useDeepBookFilteredPools ~ deepBookPools:', deepBookPools)
  const deepBookPoolFavoriteIds = useDeepBookStore(state => state.deepBookPoolFavoriteIds)
  const queryDeepBookPools = useDeepBookStore(state => state.queryDeepBookPools)
  const verifiedTokenMap = useTokenStore(state => state.verifiedTokenMap)

  const filteredPools = useMemo(() => {
    // 如果有搜索输入，使用查询结果（即使是空数组也要使用）；否则使用本地数据
    // 确保查询结果也包含收藏状态
    let pools = inputValue
      ? queryDeepBookPools.map((pool: any) => ({
          ...pool,
          isFavorite: deepBookPoolFavoriteIds.includes(pool.address)
        }))
      : deepBookPools

    // 根据 address 去重，保留第一个出现的池子
    const uniquePools = pools.reduce((acc: any[], pool: any) => {
      if (!acc.some((p: any) => p.address === pool.address)) {
        acc.push(pool)
      }
      return acc
    }, [])
    // console.log('🚀🚀🚀 ~ useDeepBooKPools.ts:50 ~ useDeepBookFilteredPools ~ uniquePools:', uniquePools)

    let filteredData: any[]

    // 获取认证 token 列表
    const verifiedTokenList = Array.from(verifiedTokenMap.values())

    // 根据 tab 筛选（使用去重后的数据）
    // 如果有搜索输入，直接返回所有搜索结果，不根据 tab 过滤
    if (inputValue) {
      filteredData = uniquePools
    } else {
      switch (key) {
        case 'deepbook-tokens-tab-watchlist':
          // Watchlist tab：显示所有被收藏的池子（spot 或 margin），不应用 all pools 开关
          filteredData = uniquePools.filter((pool: any) => pool.isFavorite)
          break
        case 'deepbook-tokens-tab-spot':
          // Spot tab：只显示 spot 类型池子（isMarginPool !== true），应用 all pools 开关
          let spotPools = uniquePools.filter((pool: any) => pool.isMarginPool !== true)
          if (isAllPools) {
            // 打开 All pools：显示所有 spot 池子
            filteredData = spotPools
          } else {
            // 关闭 All pools：只显示认证 token 的 spot 池子，排除 sunset
            filteredData = spotPools.filter((pool: any) => {
              // 排除 sunset 池子
              if (pool.isAbandoned) {
                return false
              }
              // 检查 base 和 quote token 是否都是认证 token
              const baseToken = pool.baseAssets
              const quoteToken = pool.quoteAssets
              const isBaseVerified = isTrustedToken(baseToken, verifiedTokenList)
              const isQuoteVerified = isTrustedToken(quoteToken, verifiedTokenList)
              return isBaseVerified && isQuoteVerified
            })
          }
          break
        case 'deepbook-tokens-tab-margin':
          // Margin tab：只显示 margin 池子（isMarginPool === true），应用 all pools 开关
          let marginPools = uniquePools.filter((pool: any) => pool.isMarginPool === true)
          if (isAllPools) {
            // 打开 All pools：显示所有 margin 池子
            filteredData = marginPools
          } else {
            // 关闭 All pools：只显示认证 token 的 margin 池子，排除 sunset
            filteredData = marginPools.filter((pool: any) => {
              // 排除 sunset 池子
              if (pool.isAbandoned) {
                return false
              }
              // 检查 base 和 quote token 是否都是认证 token
              const baseToken = pool.baseAssets
              const quoteToken = pool.quoteAssets
              const isBaseVerified = isTrustedToken(baseToken, verifiedTokenList)
              const isQuoteVerified = isTrustedToken(quoteToken, verifiedTokenList)
              return isBaseVerified && isQuoteVerified
            })
          }
          break
        case 'deepbook-tokens-tab-default':
          // Default tab：显示所有池子（spot 和 margin），应用 all pools 开关
          if (isAllPools) {
            // 打开 All pools：显示所有池子
            filteredData = uniquePools
          } else {
            // 关闭 All pools：只显示认证 token 的池子，排除 sunset
            filteredData = uniquePools.filter((pool: any) => {
              // 排除 sunset 池子
              if (pool.isAbandoned) {
                return false
              }
              // 检查 base 和 quote token 是否都是认证 token
              const baseToken = pool.baseAssets
              const quoteToken = pool.quoteAssets
              const isBaseVerified = isTrustedToken(baseToken, verifiedTokenList)
              const isQuoteVerified = isTrustedToken(quoteToken, verifiedTokenList)
              return isBaseVerified && isQuoteVerified
            })
          }
          break

        default:
          filteredData = uniquePools
          break
      }
    }

    // 如果没输入search且选择了 token，进一步过滤包含该 token 的池子
    if (!inputValue && selectedTokenSymbol) {
      filteredData = filteredData.filter((pool: any) => {
        const baseSymbol = pool.baseAssets?.symbol?.toUpperCase()
        const quoteSymbol = pool.quoteAssets?.symbol?.toUpperCase()
        const tokenSymbolUpper = selectedTokenSymbol.toUpperCase()
        return baseSymbol === tokenSymbolUpper || quoteSymbol === tokenSymbolUpper
      })
    }

    // 排序逻辑（对筛选后的数据进行排序）
    if (sortField && sortType !== 'none') {
      filteredData = [...filteredData].sort((a: any, b: any) => {
        // 优先处理 Sunset 类型的池子，始终排在最后
        const aIsAbandoned = a.isAbandoned || false
        const bIsAbandoned = b.isAbandoned || false

        // 如果一个是 Sunset，另一个不是，Sunset 排在后面
        if (aIsAbandoned && !bIsAbandoned) {
          return 1
        }
        if (!aIsAbandoned && bIsAbandoned) {
          return -1
        }
        // 如果两个都是或都不是 Sunset，按照原来的排序逻辑
        // 如果两个都是 Sunset，保持原有顺序（稳定排序）
        if (aIsAbandoned && bIsAbandoned) {
          return 0
        }

        let aValue = 0
        let bValue = 0

        if (sortField === 'vol24h') {
          // 按24h交易量排序（换算为市值）
          aValue = parseFloat(a.vol24hUsdDisplay || '0')
          bValue = parseFloat(b.vol24hUsdDisplay || '0')
        } else if (sortField === '24hChg') {
          // 按24h价格变化排序
          const aChange = a.priceChange ? parseFloat(a.priceChange.replace('%', '').replace('-', '')) * (a.priceChange.includes('-') ? -1 : 1) : 0
          const bChange = b.priceChange ? parseFloat(b.priceChange.replace('%', '').replace('-', '')) * (b.priceChange.includes('-') ? -1 : 1) : 0
          aValue = aChange
          bValue = bChange
        }

        if (sortType === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
    } else {
      // 即使没有排序，也要确保 Sunset 类型的池子排在最后
      filteredData = [...filteredData].sort((a: any, b: any) => {
        const aIsAbandoned = a.isAbandoned || false
        const bIsAbandoned = b.isAbandoned || false

        if (aIsAbandoned && !bIsAbandoned) {
          return 1
        }
        if (!aIsAbandoned && bIsAbandoned) {
          return -1
        }
        return 0
      })
    }

    return filteredData
  }, [
    deepBookPools,
    queryDeepBookPools,
    key,
    inputValue,
    deepBookPoolFavoriteIds,
    sortField,
    sortType,
    isAllPools,
    selectedTokenSymbol,
    verifiedTokenMap
  ])

  return filteredPools
}

export const useImportDeepBookPool = (inputValue: string, setInputValue: (value: string) => void) => {
  const { deepBookPools, setDeepBookPools, queryDeepBookPools, setQueryDeepBookPools } = useDeepBookStore()
  const { localDeepBookPools, setLocalDeepBookPools } = useDeepBookStore()
  const { currentDeepBookPool, setCurrentDeepBookPool } = useDeepBookStore()
  const { setDeepbookPrice } = useDeepBookStore()
  const { showCommonToast } = useGlobalToast()
  const navigate = useNavigate()

  const importDeepBookPool = useCallback(
    (pool: any) => {
      // 检查是否已经在 deepBookPools 中
      const existsInDeepBookPools = deepBookPools.some((item: any) => item.address === pool.address)
      const existsInLocalPools = localDeepBookPools.some((item: any) => item.address === pool.address)

      // 如果已存在于 deepBookPools，只更新 isLocal 状态；否则添加到列表开头
      let newPools: any[]
      if (existsInDeepBookPools) {
        newPools = deepBookPools.map((item: any) => (item.address === pool.address ? { ...item, isLocal: true } : item))
      } else {
        newPools = [{ ...pool, isLocal: true }, ...deepBookPools]
      }
      setDeepBookPools(newPools)

      // 如果不在 localDeepBookPools 中，添加进去；避免重复
      let newLocalPools: any[]
      if (existsInLocalPools) {
        newLocalPools = localDeepBookPools.map((item: any) => (item.address === pool.address ? { ...item, isLocal: true } : item))
      } else {
        newLocalPools = [{ ...pool, isLocal: true }, ...localDeepBookPools]
      }
      setLocalDeepBookPools(newLocalPools)

      setCurrentDeepBookPool({ ...pool, isLocal: true })
      setDeepbookPrice({ poolId: pool.address, price: pool.price })
      showCommonToast('Added', 'success')

      if (inputValue) {
        const newQueryDeepBookPools = queryDeepBookPools.map((item: any) => {
          if (item.address == pool.address) {
            return { ...item, isLocal: true }
          }
          return item
        })
        setQueryDeepBookPools(newQueryDeepBookPools)
      }
    },
    [
      deepBookPools,
      localDeepBookPools,
      inputValue,
      queryDeepBookPools,
      setDeepBookPools,
      setLocalDeepBookPools,
      setCurrentDeepBookPool,
      setDeepbookPrice,
      setQueryDeepBookPools,
      showCommonToast
    ]
  )

  const removeDeepBookPool = useCallback(
    (pool: any) => {
      const newLocalPools = localDeepBookPools.filter((item: any) => item.address !== pool.address)
      setLocalDeepBookPools(newLocalPools)

      let newPools: any[]
      if (pool.inWhiteList) {
        newPools = deepBookPools.map((item: any) => (item.address === pool.address ? { ...item, isLocal: false } : item))
      } else {
        newPools = deepBookPools.filter((item: any) => item.address !== pool.address)
      }
      setDeepBookPools(newPools)

      if (currentDeepBookPool?.address === pool.address) {
        const nextPool = newPools.find((p: any) => p.inWhiteList) || newPools[0]
        if (nextPool) {
          setCurrentDeepBookPool(nextPool)
          setDeepbookPrice({ poolId: nextPool.address, price: nextPool.price })
          navigate(`/deepbook/${nextPool.address}`, { replace: true })
        } else {
          setCurrentDeepBookPool({})
          navigate(`/deepbook`, { replace: true })
        }
      }

      if (inputValue) {
        const newQueryDeepBookPools = queryDeepBookPools.map((item: any) => {
          if (item.address === pool.address) {
            return { ...item, isLocal: false }
          }
          return item
        })
        setQueryDeepBookPools(newQueryDeepBookPools)
      }
      showCommonToast('Removed', 'success')
    },
    [
      deepBookPools,
      localDeepBookPools,
      currentDeepBookPool,
      inputValue,
      navigate,
      queryDeepBookPools,
      setDeepBookPools,
      setLocalDeepBookPools,
      setCurrentDeepBookPool,
      setDeepbookPrice,
      setQueryDeepBookPools,
      showCommonToast
    ]
  )

  return { importDeepBookPool, removeDeepBookPool }
}
