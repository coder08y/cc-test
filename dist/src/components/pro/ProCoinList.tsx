import useGetApiData from '@/hooks/pro/useGetApiData'
import useProHelper from '@/hooks/pro/useProHelper'
import useWrapProData from '@/hooks/pro/useWrapProData'
import useCommonGlobalStore from '@/store/common/global'
import useProListStore from '@/store/pro/list'
import { ProCoinListFetchParams } from '@/types/pro'
import { TableSortTh, useTokenSelect } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Token } from '@cetus/types'
import { NoData, VirtualTable } from '@cetus/ui-kit'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useDebounceEffect, useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import ProAuditTips from './ProAuditTips'
import ProCoinBlock from './ProCoinBlock'
import QuickBuyAction from './QuickBuyAction'

type SortRule = 'desc' | 'asc'
export type proListType = {
  label: string
  value: string
}

const PAGE_SIZE = 20

function ProCoinList({ refreshInfo }: { refreshInfo: any }) {
  const { getProCoinList, getProCoinListWithCoins } = useGetApiData()
  const { isApp } = useWindowWidth()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>()
  const [watchList, setWatchList] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  // 延迟显示 NoData，避免切换 tab 时闪烁
  const [showNoData, setShowNoData] = useState(false)

  const {
    quickCoin,
    quickAmount,
    searchText,
    currentProTab,
    displayDateType,
    resetProListStoreData,
    proListParams,
    setProListParams,
    dateType,
    isRefreshing,
    setIsRefreshing,
    setTabCache,
    getTabCache,
    isTabCacheValid
  } = useProListStore()
  const { setIsTopProgressLoading } = useCommonGlobalStore()

  const isFirst = useRef(true)
  const isWatchlistFirst = useRef(true)
  // 用 Map 存储每个 tab 的数据，key 为 cacheKey，value 为 list
  const tabDataMapRef = useRef<Record<string, any[]>>({})

  const { goToken } = useProHelper()
  const { userCollectObj } = useTokenSelectStore()
  const { getUserCollectList } = useTokenSelect()
  const { wrapProCoinMarketData } = useWrapProData()
  const { currentAccount, onWalletModal } = useAccountStore()

  const [sortRule, setSortRule] = useState<SortRule>('desc')
  const [sortBy, setSortBy] = useState<proListType>({ label: 'Rank', value: 'rank' })

  const sortByList = useMemo(
    () => [
      { label: `Price/${displayDateType}%`, value: 'price/change' },
      { label: `Price`, value: 'price' },
      { label: `${displayDateType}%`, value: 'change' },
      { label: `Volume (${displayDateType})`, value: 'volume' },
      { label: `MC/FDV`, value: 'market_cap/fdv' },
      { label: `MC`, value: 'market_cap' },
      { label: `FDV`, value: 'fdv' },
      { label: `Liquidity`, value: 'liquidity' },
      { label: `Holders`, value: 'holders' },
      { label: `Age`, value: 'age' }
    ],
    [displayDateType]
  )

  const sortByObject = useMemo(
    () =>
      sortByList.reduce((obj: any, item) => {
        obj[item.value] = item
        return obj
      }, {}),
    [sortByList]
  )

  const onParamsChange = (params: Record<string, any>) => {
    setProListParams({ ...params })
    setHasMore(true) // Reset hasMore when params change
  }

  // 生成缓存 key（排除 offset，只缓存第一页）
  const getCacheKey = (params: ProCoinListFetchParams) => {
    const { offset, ...restParams } = params
    return `${currentProTab}_${JSON.stringify(restParams)}`
  }

  // 从 tabDataMapRef 中读取当前 tab 的数据
  const currentCacheKey = getCacheKey(proListParams)
  const currentTabData = tabDataMapRef.current[currentCacheKey] || []

  // 使用 data 状态来触发重新渲染，但实际数据从 tabDataMapRef 读取
  const list = useMemo(() => tabDataMapRef.current[currentCacheKey] || [], [currentCacheKey, data])
  const showList = useMemo(
    () => (currentProTab === 'Watchlist' ? watchList : tabDataMapRef.current[currentCacheKey] || []),
    [currentProTab, currentCacheKey, watchList, data]
  )

  const fetchProData = async (params: ProCoinListFetchParams, isNoLoading = false, limit?: number, isAuto?: boolean) => {
    if (currentProTab === 'Watchlist') {
      return
    }

    const cacheKey = getCacheKey(params)
    const isCacheValid = isTabCacheValid(cacheKey, 60000) // 60秒内缓存有效

    // 如果是初始加载（offset=0）且有有效缓存，先显示缓存数据
    if (!params?.offset && isCacheValid) {
      const cache = getTabCache(cacheKey)
      if (cache?.data) {
        // 保存到 tabDataMapRef，隔离各 tab 的数据
        tabDataMapRef.current[cacheKey] = cache.data
        setData({ list: cache.data }) // 触发重新渲染
        setIsLoading(false)
        // 后台静默更新，不显示 loading
        isNoLoading = true
      }
    }

    // 决定是否显示 loading：
    // 1. 如果是自动刷新且已有数据，不显示loading（无感知更新）
    // 2. 如果没有有效缓存且不是loadMore，显示loading
    if (!params?.offset && !isNoLoading && !isCacheValid) {
      // 如果是自动刷新且已有数据，不改变loading状态
      const hasExistingData = tabDataMapRef.current[cacheKey]?.length > 0
      if (!(isAuto && hasExistingData)) {
        setIsLoading(true)
      }
    }

    // 只有非 loadMore 的请求才显示顶部加载条
    if (!params?.offset) {
      setIsTopProgressLoading(true)
    }

    try {
      const res = await getProCoinList({ ...params, limit: limit || PAGE_SIZE }, isAuto)
      // console.log('🚀 ~ fetchProData ~ params:', params)

      // 从 tabDataMapRef 中读取该 tab 的当前数据，进行拼接
      const currentTabList = tabDataMapRef.current[cacheKey] || []
      const newList = params?.offset !== 0 ? currentTabList.concat(res.list) : res.list

      // 保存到 tabDataMapRef，隔离各 tab 的数据
      tabDataMapRef.current[cacheKey] = newList
      setData({ list: newList }) // 触发重新渲染

      // 只缓存初始数据（offset=0），不缓存加载更多的数据
      if (params?.offset === 0) {
        setTabCache(cacheKey, res.list)
      }

      setHasMore(limit && limit % 20 === 0 ? true : res.list.length === PAGE_SIZE)
      setIsLoading(false)
      setIsRefreshing(true)
      if (!params?.offset) {
        setIsTopProgressLoading(false)
      }
    } catch (err) {
      // console.log('🚀 ~ fetchProData ~ err:', err)
      setIsLoading(false)
      setIsRefreshing(true)
      if (!params?.offset) {
        setIsTopProgressLoading(false)
      }
    } finally {
      if (isFirst.current) isFirst.current = false
      setTimeout(() => {
        loadingRef.current = false
      }, 300)
    }
  }

  // 👇 Watchlist 独立 useEffect
  const fetchWatchList = async (isAuto = true) => {
    const cacheKey = `Watchlist_${proListParams?.date_type}_${proListParams?.text}`
    const isCacheValid = isTabCacheValid(cacheKey, 60000)

    // 如果有有效缓存，先显示缓存数据
    if (isCacheValid) {
      const cache = getTabCache(cacheKey)
      if (cache?.data) {
        setWatchList(cache.data)
        setIsLoading(false)
      }
    } else {
      // 如果是自动刷新且已有数据，不显示loading（无感知更新）
      const hasExistingData = watchList?.length > 0
      if (!(isAuto && hasExistingData)) {
        setIsLoading(true)
      }
    }

    // 每次请求都显示顶部加载条
    setIsTopProgressLoading(true)

    try {
      const coins = Object.keys(userCollectObj || {})
      const res = await getProCoinListWithCoins(coins, proListParams?.date_type, proListParams?.text, isAuto)
      setWatchList(res)

      // 更新缓存
      setTabCache(cacheKey, res)

      setIsLoading(false)
      setIsRefreshing(true)
      setIsTopProgressLoading(false)
    } catch (err) {
      setIsLoading(false)
      setIsRefreshing(true)
      setIsTopProgressLoading(false)
    }
    isWatchlistFirst.current = false
  }

  useEffect(() => {
    if (currentProTab !== 'Watchlist') return

    // 在发起请求前，立即检查是否有缓存，如果没有就显示loading，避免闪烁"无数据"
    const cacheKey = `Watchlist_${proListParams?.date_type}_${proListParams?.text}`
    const isCacheValid = isTabCacheValid(cacheKey, 60000)
    if (!isCacheValid && watchList?.length === 0) {
      setIsLoading(true)
    }

    fetchWatchList()
  }, [currentProTab, proListParams?.date_type, proListParams?.text])

  useEffect(() => {
    if (currentProTab !== 'Watchlist' || isWatchlistFirst?.current) return
    fetchWatchList()
  }, [userCollectObj, isWatchlistFirst])

  // 👇 通用数据请求
  useDeepCompareEffect(() => {
    if (currentProTab !== 'Watchlist') {
      // 在发起请求前，立即检查是否有缓存，如果没有就显示loading，避免闪烁"无数据"
      const cacheKey = getCacheKey(proListParams)
      const isCacheValid = isTabCacheValid(cacheKey, 60000)
      if (!proListParams?.offset && !isCacheValid && !tabDataMapRef.current[cacheKey]?.length) {
        setIsLoading(true)
      }
      fetchProData(proListParams)
    }
  }, [proListParams, currentProTab])

  // 👇 搜索防抖
  useDebounceEffect(
    () => {
      if (isFirst?.current) return
      const searchParams = { ...proListParams, text: searchText || '' }
      setProListParams(searchParams)
    },
    [searchText],
    { wait: 500 }
  )

  // 👇 load more
  const loadingRef = useRef(false)

  const clickSort = (item: proListType) => {
    loadingRef.current = true

    const scrollElement = document.querySelector('.scroll-container') as HTMLElement | null
    scrollElement?.scrollTo({ top: 0, behavior: 'auto' })

    if (item?.value === sortBy?.value) {
      onParamsChange({
        offset: 0,
        sorted_by: item.value,
        desc: sortRule === 'desc' ? false : true
      })
      setSortRule(sortRule === 'desc' ? 'asc' : 'desc')
    } else {
      onParamsChange({ offset: 0, sorted_by: item.value, desc: true })
      setSortRule('desc')
      setSortBy(item)
    }
  }

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadMoreFun = () => {
    loadingRef.current = true
    const nextOffset = list.length
    fetchProData({ ...proListParams, offset: nextOffset })
  }

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading || currentProTab === 'Watchlist' || !list || list?.length == 0) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingRef.current) {
          loadMoreFun()
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.5 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore, isLoading, list?.length, currentProTab, proListParams])

  useEffect(() => {
    if (isFirst?.current) return
    if (currentProTab !== 'Watchlist') {
      if (refreshInfo?.refreshTrigger && !loadingRef.current) {
        fetchProData({ ...proListParams, offset: 0 }, true, list?.length, refreshInfo?.isAuto)
      }
    } else {
      if (refreshInfo?.refreshTrigger) {
        fetchWatchList(refreshInfo?.isAuto)
      }
    }
  }, [refreshInfo?.refreshTrigger])

  useEffect(() => {
    if (currentProTab === 'Watchlist') {
      setSortBy({} as any)
      setProListParams({ ...proListParams, sorted_by: '' })
    } else {
      const sortByItem = sortByObject?.[proListParams.sorted_by]
      setSortBy(sortByItem || {})
      setSortRule(proListParams.desc ? 'desc' : 'asc')
    }
  }, [currentProTab, proListParams?.sorted_by, proListParams?.desc])

  // const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    // setIsMounted(true)
    return () => resetProListStoreData()
  }, [])

  // useEffect(() => {
  //   if (isMounted) {
  //     getUserCollectList()
  //   }
  // }, [isMounted])

  // 延迟显示 NoData，避免切换 tab 时闪烁
  useEffect(() => {
    // 如果正在加载或有数据，立即隐藏 NoData
    if (isLoading || showList?.length > 0) {
      setShowNoData(false)
      return
    }

    // 如果没有数据且不在加载中，延迟 300ms 后显示 NoData
    // 这样如果数据快速加载完成，NoData 就不会闪现
    const timer = setTimeout(() => {
      if (!isLoading && showList?.length === 0 && isRefreshing) {
        setShowNoData(true)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [isLoading, showList?.length, isRefreshing])

  const columns = getColumns(
    quickCoin,
    quickAmount,
    sortBy,
    sortRule,
    clickSort,
    isApp,
    currentAccount,
    sortByObject,
    onWalletModal,
    currentProTab,
    dateType,
    wrapProCoinMarketData
  )

  const gridTemplateColumns = isApp
    ? '162px minmax(90px, 1.3fr) minmax(120px, 1.3fr) minmax(90px, 0.8fr) minmax(60px, 0.8fr) minmax(60px, 0.7fr) minmax(60px,  0.5fr) 60px minmax(28px, 0.35fr)'
    : 'minmax(0px, 2fr) minmax(120px, 1.6fr) minmax(90px, 1.6fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(90px, 0.7fr) minmax(90px, 0.8fr) 60px minmax(60px, 0.8fr)'

  return (
    <VStack w="100%" position="relative">
      {showNoData ? (
        <Box w={{ base: '100%', lg: '1160px' }}>
          <NoData
            type="nodata"
            text={currentProTab === 'Watchlist' ? 'No tokens in your watchlist.' : 'No Coins found'}
            children={
              currentProTab === 'Watchlist' ? null : (
                <Text mt="4px" textAlign="center">
                  Try adjusting your search or filter settings.
                </Text>
              )
            }
          />
        </Box>
      ) : (
        // opacity={isRefreshing ? 0.8 : 1}
        <Box w="100%" transition="opacity 0.2s">
          <VirtualTable
            columns={columns}
            data={showList}
            rowHeight={66}
            isApp={isApp}
            isLoading={isLoading || !isRefreshing}
            gridTemplateColumns={gridTemplateColumns}
            stickyHeaderTop="120px"
            onRowClick={(item: any) => goToken(quickCoin?.coin_type, item?.coin_type)}
          />
          {!isLoading && currentProTab !== 'Watchlist' && (
            <Box ref={loadMoreRef} py={4} justifyContent="center" display="flex" mt="0.5rem">
              {hasMore ? (
                <Spinner size="sm" color="text_caption" />
              ) : (
                showList?.length > 0 && <Text fontSize="12px">You've reached the end of the list.</Text>
              )}
            </Box>
          )}
        </Box>
      )}
    </VStack>
  )
}

const getColumns = (
  quickCoin: Token & { limitBuy: number },
  quickAmount: string,
  sortBy: proListType,
  sortRule: SortRule,
  clickSort: (value: proListType) => void,
  isApp: boolean,
  currentAccount: any,
  sortByObject: any,
  onWalletModal: any,
  currentProTab: string,
  dateType: string,
  wrapProCoinMarketData: (rowItem: any, dateType: string) => void
) => {
  return [
    {
      title: <Text fontSize="12px">Token</Text>,
      key: 'token',
      sticky: true,
      thConfig: {
        w: '20%'
      },
      showLabel: false,
      render: (item: any) => {
        return <ProCoinBlock info={item} />
      }
    },
    {
      title: (
        <TableSortTh
          showSortIcon={currentProTab !== 'Watchlist' && currentProTab !== 'Trending'}
          labelFontSize="12px"
          appShowIcon={true}
          labelInfo={sortByObject['price/change']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: proListType) => clickSort(value)}
        />
      ),
      key: 'change',
      render: (item: any) => {
        const priceChange = currentProTab == 'Trending' ? wrapProCoinMarketData(item, dateType)?.priceChange : item?.priceChange
        return (
          <VStack gap="4px" align="flex-start">
            <Text fontSize="14px" color="text_caption">
              {item?.price}
            </Text>
            <Text
              fontSize="12px"
              color={priceChange == '--' || Number(priceChange) === 0 ? 'text_caption' : priceChange?.includes('-') ? 'primary_red' : 'primary_green'}
            >
              {priceChange}
            </Text>
          </VStack>
        )
      }
    },
    {
      title: (
        <TableSortTh
          showSortIcon={currentProTab !== 'Watchlist' && currentProTab !== 'Trending'}
          appShowIcon={true}
          labelFontSize="12px"
          labelInfo={sortByObject['volume']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: proListType) => clickSort(value)}
        />
      ),
      key: 'volume',
      render: (item: any) => {
        const volume = currentProTab == 'Trending' ? wrapProCoinMarketData(item, dateType)?.volume : item?.volume
        const buyVolume = currentProTab == 'Trending' ? wrapProCoinMarketData(item, dateType)?.buyVolume : item?.buyVolume
        const sellVolume = currentProTab == 'Trending' ? wrapProCoinMarketData(item, dateType)?.sellVolume : item?.sellVolume
        return (
          <VStack align="flex-start" gap="4px" w="100%">
            <Text fontSize="14px" color="text_caption">
              {volume}
            </Text>
            <HStack gap="0px" justify="flex-start">
              <Text fontSize="12px" color="primary_green">
                {buyVolume}
              </Text>
              <Text fontSize="12px" color="text_paragraph">
                /
              </Text>
              <Text fontSize="12px" color="primary_red">
                {sellVolume}
              </Text>
            </HStack>
          </VStack>
        )
      }
    },
    {
      title: (
        <TableSortTh
          showSortIcon={currentProTab !== 'Watchlist' && currentProTab !== 'Trending'}
          appShowIcon={true}
          labelFontSize="12px"
          labelInfo={sortByObject['market_cap/fdv']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: proListType) => clickSort(value)}
        />
      ),
      key: 'fdv',
      render: (item: any) => {
        return (
          <VStack gap="4px" align="flex-start">
            <Text fontSize="14px" color="text_caption">
              {item?.mc}
            </Text>
            <Text fontSize="12px" color="text_paragraph">
              {item?.fdv}
            </Text>
          </VStack>
        )
      }
    },
    {
      title: (
        <TableSortTh
          showSortIcon={currentProTab !== 'Watchlist' && currentProTab !== 'Trending'}
          appShowIcon={true}
          labelFontSize="12px"
          labelInfo={sortByObject['liquidity']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: proListType) => clickSort(value)}
        />
      ),
      key: 'liquidity'
    },
    {
      title: (
        <TableSortTh
          showSortIcon={currentProTab !== 'Watchlist' && currentProTab !== 'Trending'}
          appShowIcon={true}
          labelFontSize="12px"
          labelInfo={sortByObject['holders']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: proListType) => clickSort(value)}
        />
      ),
      key: 'holders'
    },
    {
      title: (
        <TableSortTh
          showSortIcon={currentProTab !== 'Watchlist' && currentProTab !== 'Trending'}
          appShowIcon={true}
          labelFontSize="12px"
          labelInfo={sortByObject['age']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: proListType) => clickSort(value)}
        />
      ),
      key: 'age'
    },
    {
      title: <Text fontSize="12px">Audit</Text>,
      key: 'audit',
      render: (item: any) => {
        return item?.auditTotal === '--' && item?.auditWarningNum == '--' ? (
          <Text fontSize="14px">--</Text>
        ) : (
          <ProAuditTips coinAuditCheckData={item} warningNum={item?.auditWarningNum} total={item?.auditTotal} coinAuditCheckLoading={false} />
        )
      }
    },
    {
      title: (
        <Text fontSize="12px" textAlign="right">
          {isApp ? 'Buy' : 'Quick Buy'}
        </Text>
      ),
      showLabel: false,
      sticky: true,
      key: 'actions',
      render: (item: any) => {
        return (
          <QuickBuyAction quickCoin={quickCoin} quickAmount={quickAmount} info={item} currentAccount={currentAccount} onWalletModal={onWalletModal} />
        )
      }
    }
  ]
}

export default ProCoinList
