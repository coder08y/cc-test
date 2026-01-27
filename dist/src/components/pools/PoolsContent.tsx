import PoolsFilter from '@/components/pools/PoolsFilter'
import useNavigateToLiquidity from '@/hooks/clmm/useNavigateToLiquidity'
import useFavoritePool, { GetFavoritePoolListProps } from '@/hooks/pool/useFavoritePool'
import useGetPoolList from '@/hooks/pool/useGetPoolList'
import useStatistics from '@/hooks/stats/useStatistics'
import useGetVaultsFarmingApiInfo from '@/hooks/vaults-farming/useGetVaultsFarmingApiInfo'
import useCommonGlobalStore from '@/store/common/global'
import usePoolsStore from '@/store/pool'
import useVaultsFarmingStore from '@/store/vaults-farming'
import { PoolApiInfo } from '@/types'
import { SortDropBlock, TableSortTh, useGlobalToast } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CommonTypeInfo, ToastType, Token } from '@cetus/types'
import { NoData, VirtualTable } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { isAvailableObject } from '@cetus/utils'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useRequest } from 'ahooks'
import { uniqBy } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import CoinPairInfo from '../common/CoinPairInfo'
import FarmingIcon from '../common/FarmingIcon'
import MiningIcon from '../common/MiningIcon'
import WarningIcon from '../common/WarningIcon'
import AprTooltip from '../common/aprTooltip'
import ActionsBlock from './ActionsBlock'
import RewardsBlock from './RewardsBlock'

export type sortRule = 'desc' | 'asc'
export type poolListType = {
  label: 'Liquidity' | 'Volume (24H)' | 'Volume (7D)' | 'Fees (24H)' | 'APR (24H)'
  value: 'tvl' | 'vol' | 'vol7d' | 'fees' | 'totalApr'
}

interface fetchPoolsDataProps extends GetFavoritePoolListProps {
  isWatchList?: boolean
  isListLoading?: boolean
  isAutoRefresh?: boolean // 标识是否为自动刷新
  coin_type?: string // 用于自动刷新时锁定coin_type
  display_all_pools?: boolean // 用于自动刷新时锁定display_all_pools
  isIncentivizedOnly?: boolean // 用于自动刷新时锁定isIncentivizedOnly
}

interface PoolsContentProps {
  isRefreshed: boolean
  handleIsRefreshed: (isFreshed: boolean) => void
  onRefreshHandlerRegistered?: (handler: () => Promise<void>) => void
  onManualRefresh?: () => void
  setPaginationLoading?: (loading: boolean) => void
}

function PoolsContent({ isRefreshed, handleIsRefreshed, onRefreshHandlerRegistered, onManualRefresh, setPaginationLoading }: PoolsContentProps) {
  const { getStatistics } = useStatistics()
  const { setIsTopProgressLoading } = useCommonGlobalStore()
  const {
    poolRefreshStatus,
    setPoolRefreshStatus,
    setPoolListLength,
    poolFavoriteIds,
    isWatchList,
    setIsWatchList,
    isIncentivizedOnly,
    setIsIncentivizedOnly,
    isAllPools,
    setIsAllPools,
    poolFavoriteIdsChange,
    setPoolFavoriteIdsChange
  } = usePoolsStore()
  const { getPoolList } = useGetPoolList()
  const { getFavoritePoolList } = useFavoritePool()
  const { goLiquidity } = useNavigateToLiquidity()
  const [params, setParams] = useState<Record<string, any>>({
    is_vaults: false,
    display_all_pools: false,
    has_mining: true,
    has_farming: true,
    no_incentives: true,
    order_by: '-vol',
    limit: 20,
    offset: 0,
    coin_type: '',
    pool: ''
  })

  const onParamsChange = (_params: Record<string, any>) => {
    setParams(prev => ({ ...prev, isListLoading: true, ..._params }))
  }

  const onClickIncentiveTypes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target?.checked
    onParamsChange({
      offset: 0,
      isIncentivizedOnly: checked
    })
    setIsIncentivizedOnly(checked)
    setIsAllPools(false)
  }

  const handleIsDisplayChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target?.checked
    onParamsChange({
      offset: 0,
      display_all_pools: checked
    })
    setIsAllPools(checked)
    setIsWatchList(false)
    setIsIncentivizedOnly(false)
  }

  const handleIsWatchList = () => {
    const newWatchList = !isWatchList
    onParamsChange({
      offset: 0,
      isWatchList: newWatchList
    })
    setIsAllPools(false)
    setIsWatchList(newWatchList)
    setPoolFavoriteIdsChange(false)
  }
  useEffect(() => {
    // 监听添加移除收藏的操作
    // console.log('🚀 ~ useEffect ~ poolFavoriteIds:', poolFavoriteIdsChange, poolFavoriteIds)
    if (isWatchList && poolFavoriteIdsChange) {
      setPoolFavoriteIdsChange(false)
      // console.log('🚀 ~ useEffect ~ isWatchList:', isWatchList)
      onParamsChange({
        offset: 0
      })
      setIsWatchList(true)
    }
  }, [poolFavoriteIds?.length, poolFavoriteIdsChange])

  const timer = useRef<any>(null)

  const handleRefresh = () => {
    if (onManualRefresh) {
      onManualRefresh()
    }
    // console.log('🚀 ~ handleRefresh ~ handleRefresh:')
    handleIsRefreshed(false)
    setPoolRefreshStatus('pending')
    setCurrentPage(1)
    loadedPagesRef.current = [1] // 重置已加载页码
    onParamsChange({ offset: 0, isListLoading: false })
    timer.current = setTimeout(() => {
      // console.log('🚀 ~ timer.current=setTimeout ~ poolRefreshStatus:', poolRefreshStatus)
      if (poolRefreshStatus == 'pending') {
        setPoolRefreshStatus('timeout')
      }
    }, 10000)
    getStatistics()
  }

  // const [selectCoinList, setSelectCoinList] = useState<Token[]>([])
  const { selectCoinList, setSelectCoinList } = usePoolsStore()
  const onClickSelectCoinList = (tokenInfo: Token) => {
    // console.log('🚀 ~ onClickSelectCoinList ~ tokenInfo:', tokenInfo)
    const newList = [...selectCoinList, tokenInfo]
    setSelectCoinList(newList)
    // 同步更新 params 中的 coin_type
    const coinType = newList.length == 2 ? `${newList[0]?.coin_type},${newList[1]?.coin_type}` : newList.length == 1 ? `${newList[0]?.coin_type}` : ''
    onParamsChange({ coin_type: coinType, offset: 0 })
  }
  const onDeleteSelectCoinList = (tokenInfo: Token) => {
    const newList = selectCoinList.filter(ele => ele?.coin_type !== tokenInfo?.coin_type)
    setSelectCoinList(newList)
    // 同步更新 params 中的 coin_type
    const coinType = newList.length == 2 ? `${newList[0]?.coin_type},${newList[1]?.coin_type}` : newList.length == 1 ? `${newList[0]?.coin_type}` : ''
    onParamsChange({ coin_type: coinType, offset: 0 })
  }
  const onSetSelectCoinList = (tokens: Token[]) => {
    setSelectCoinList(tokens)
    // 同步更新 params 中的 coin_type
    const coinType = tokens.length == 2 ? `${tokens[0]?.coin_type},${tokens[1]?.coin_type}` : tokens.length == 1 ? `${tokens[0]?.coin_type}` : ''
    onParamsChange({ coin_type: coinType, offset: 0 })
  }

  const pageSize = 20
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [sortRule, setSortRule] = useState<sortRule>('desc')
  const [sortBy, setSortBy] = useState<poolListType>({ label: 'Volume (24H)', value: 'vol' })
  const [list, setList] = useState<PoolApiInfo[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // 记录已加载的页码
  const loadedPagesRef = useRef<number[]>([1])
  // 标记是否正在自动刷新，用于阻止分页触发
  const isAutoRefreshingRef = useRef(false)

  const fetchPoolsData = async (params: fetchPoolsDataProps) => {
    const isListLoading = params?.isListLoading ?? true
    const isAutoRefresh = params?.isAutoRefresh ?? false

    // 自动刷新时使用传入的参数中的状态，避免读取闭包变量导致的不一致
    // 非自动刷新时使用组件当前状态
    const isWatch = params?.isWatchList !== undefined ? params.isWatchList : isWatchList
    const coin =
      params?.coin_type !== undefined
        ? params.coin_type
        : selectCoinList.length == 2
          ? `${selectCoinList[0]?.coin_type},${selectCoinList[1]?.coin_type}`
          : selectCoinList.length == 1
            ? `${selectCoinList[0]?.coin_type}`
            : ''
    const isAll = params?.display_all_pools !== undefined ? params.display_all_pools : (isAllPools ?? true)
    const isIncentivized = params?.isIncentivizedOnly !== undefined ? params.isIncentivizedOnly : isIncentivizedOnly

    const { offset = 0 } = params

    if (offset == 0 && !isAutoRefresh) {
      setCurrentPage(1)
      loadedPagesRef.current = [1]
    } else if (offset > 0 && !isAutoRefresh) {
      // 加载更多时，记录当前页码
      const pageNumber = Math.floor(offset / pageSize) + 1
      if (!loadedPagesRef.current.includes(pageNumber)) {
        loadedPagesRef.current.push(pageNumber)
        // 保持页码有序
        loadedPagesRef.current.sort((a, b) => a - b)
      }
    }

    if (isAutoRefresh) {
    } else {
      if (Number(offset) >= pageSize) {
        setIsLoadMoreLoading(true)
      } else {
        setIsLoading(isListLoading)
      }

      if (offset === 0) {
        setIsTopProgressLoading(true)
      }
    }
    const _incentiveTypes = isIncentivized ? ['mining', 'farming'] : ['mining', 'farming', 'noIncentives']
    const query: Record<string, any> = {
      ...params,
      coin_type: coin,
      display_all_pools: isWatch ? true : isAll,
      offset,
      has_mining: _incentiveTypes.includes('mining'),
      has_farming: _incentiveTypes.includes('farming'),
      no_incentives: _incentiveTypes.includes('noIncentives')
    }
    // console.log('🚀 ~ fetchDatafetchPoolsData ~ query:', query, isAllPools)
    let result: any
    try {
      if (isWatch) {
        query['pools'] = poolFavoriteIds
        result = await getFavoritePoolList(query)
      } else {
        result = await getPoolList(query)
      }
      // console.log('🚀 ~  ~ result:', result)
      if (result) {
        // console.log('🚀 ~ fetchDatafetchPoolsData ~ result:', result)
        if (result?.isLocal) {
          setPoolRefreshStatus('error')
          setList(result.list)
          setTotal(result.total)
          setPoolListLength(result.total || '0')
          setCurrentPage(1)
        } else {
          if (isAutoRefresh) {
            if (Number(offset) === 0) {
              // Incremental Updates
              setList(prev => {
                const newMap = new Map(result.list.map((item: PoolApiInfo) => [item.poolAddress, item]))
                const updated = prev.map(item => {
                  const newItem = newMap.get(item.poolAddress)
                  if (newItem) {
                    return newItem
                  }
                  return item
                })

                const newItems = result.list.filter((item: PoolApiInfo) => !prev.some(p => p.poolAddress === item.poolAddress))

                return newItems.length > 0 ? [...updated, ...newItems] : updated
              })
            } else {
              const pageIndex = offset / pageSize
              setList(prev => {
                const beforePageLength = pageIndex * pageSize
                const beforePages = prev.slice(0, beforePageLength)
                const afterPages = prev.slice(beforePageLength + pageSize)
                // Incremental Updates
                const currentPages = prev.slice(beforePageLength, beforePageLength + pageSize)
                const newMap = new Map(result.list.map((item: PoolApiInfo) => [item.poolAddress, item]))
                const updatedCurrentPages = currentPages.map(item => {
                  const newItem = newMap.get(item.poolAddress)
                  return (newItem || item) as PoolApiInfo
                })
                const newItems = result.list.filter((item: PoolApiInfo) => !currentPages.some(p => p.poolAddress === item.poolAddress))
                const updatedCurrentPagesWithNew: PoolApiInfo[] = [...updatedCurrentPages, ...newItems]
                return uniqBy([...beforePages, ...updatedCurrentPagesWithNew, ...afterPages], 'poolAddress')
              })
            }
          } else {
            if (Number(offset) >= pageSize) {
              setList(prev => uniqBy(prev.concat(result.list), 'poolAddress'))
              const pageNumber = Math.floor(offset / pageSize) + 1
              if (!loadedPagesRef.current.includes(pageNumber)) {
                loadedPagesRef.current.push(pageNumber)
                loadedPagesRef.current.sort((a, b) => a - b)
              }
            } else {
              setList(result.list)
            }
          }
          setTotal(result.total)
          setPoolListLength((result.total || 0).toString())
          setPoolRefreshStatus('success')
        }
        if (!isAutoRefresh) {
          setIsLoading(false)
          setIsLoadMoreLoading(false)
          if (offset === 0) {
            setIsTopProgressLoading(false)
          }
        }
      }
    } catch (error) {
      // console.log('🚀 ~  ~ error:', error)
      if ((error as any)?.list && (error as any)?.list?.length > 0) {
        setPoolRefreshStatus('error')
        setList((error as any).list)
        setTotal((error as any).total)
        setPoolListLength('')
        if (!isAutoRefresh) {
          setIsLoading(false)
          setIsLoadMoreLoading(false)
          if (offset === 0) {
            setIsTopProgressLoading(false)
          }
        }
      }
    }
  }

  // 初始化时同步 isAllPools, isIncentivizedOnly, isWatchList, selectCoinList 到 params
  useEffect(() => {
    const updates: Record<string, any> = {}
    if (params.display_all_pools !== isAllPools) {
      updates.display_all_pools = isAllPools
    }
    if (params.isIncentivizedOnly !== isIncentivizedOnly) {
      updates.isIncentivizedOnly = isIncentivizedOnly
    }
    if (params.isWatchList !== isWatchList && isWatchList !== undefined) {
      updates.isWatchList = isWatchList
    }
    // 同步 selectCoinList 到 coin_type
    const coinType =
      selectCoinList.length == 2
        ? `${selectCoinList[0]?.coin_type},${selectCoinList[1]?.coin_type}`
        : selectCoinList.length == 1
          ? `${selectCoinList[0]?.coin_type}`
          : ''
    if (params.coin_type !== coinType) {
      updates.coin_type = coinType
    }
    if (Object.keys(updates).length > 0) {
      setParams(prev => ({ ...prev, ...updates }))
    }
  }, [
    isAllPools,
    isIncentivizedOnly,
    isWatchList,
    selectCoinList,
    params.display_all_pools,
    params.isIncentivizedOnly,
    params.isWatchList,
    params.coin_type
  ])

  useRequest(() => fetchPoolsData(params), {
    refreshDeps: [params, selectCoinList, isWatchList, isAllPools, isIncentivizedOnly],
    manual: false,
    debounceWait: 150
  })

  const { failedTsToast } = useGlobalToast()
  useEffect(() => {
    // console.log('🚀 ~ PoolsContent ~ poolRefreshStatus:', poolRefreshStatus)
    if (poolRefreshStatus !== 'pending') {
      const info: ToastType = {
        linkLabel: '',
        getShowInfo: () => {
          const info: CommonTypeInfo = {
            toastTitleText: poolRefreshStatus == 'error' ? 'Request Error' : poolRefreshStatus == 'timeout' ? 'Please check the network status.' : ''
          }
          return info
        }
      }
      if (poolRefreshStatus == 'success' || poolRefreshStatus == 'error') {
        clearTimeout(timer.current)
      }
      if (poolRefreshStatus == 'error' || poolRefreshStatus == 'timeout') {
        failedTsToast(info)
      }
      handleIsRefreshed(true)
    }
  }, [poolRefreshStatus])
  const { isApp } = useWindowWidth()
  const clickSort = (item: poolListType) => {
    // console.log('🚀 ~ clickSort ~ item:', item)
    const scrollElement = document.querySelector('.scroll-container') as HTMLElement | null
    scrollElement?.scrollTo({ top: 0, behavior: 'auto' })
    if (isApp) {
      if (item?.value !== sortBy?.value) {
        onParamsChange({ offset: 0, order_by: `-${item?.value}` })
        setSortRule('desc')
        setSortBy(item)
      }
    } else {
      if (item?.value == sortBy?.value) {
        onParamsChange({ offset: 0, order_by: sortRule == 'desc' ? `${item?.value}` : `-${item?.value}` })
        const rule = sortRule == 'desc' ? 'asc' : 'desc'
        setSortRule(rule)
      } else {
        onParamsChange({ offset: 0, order_by: `-${item?.value}` })
        setSortRule('desc')
        setSortBy(item)
      }
    }
  }

  const sortByList = [
    { label: 'Liquidity', value: 'tvl' },
    { label: 'Volume (24H)', value: 'vol' },
    { label: 'Fees (24H)', value: 'fees' },
    { label: 'APR', value: 'totalApr' }
  ]
  const sortByObject = sortByList.reduce((obj: any, item) => {
    obj[item.value] = item
    return obj
  }, {})

  const changeCurrentPage = async (current: number) => {
    if (setPaginationLoading) {
      setPaginationLoading(true)
    }

    if (!loadedPagesRef.current.includes(current)) {
      loadedPagesRef.current.push(current)
    }

    const pageOffset = current * pageSize
    try {
      await fetchPoolsData({ ...params, offset: pageOffset })
      setCurrentPage(prev => prev + 1)
    } finally {
      if (setPaginationLoading) {
        setPaginationLoading(false)
      }
    }
  }

  const hasLoadMore = useMemo(() => {
    const currentSize = (currentPage - 1) * pageSize + list?.length
    return poolRefreshStatus !== 'error' && Number(total) > currentSize
  }, [total, currentPage, pageSize, poolRefreshStatus, list?.length])

  useEffect(() => {
    if (onRefreshHandlerRegistered) {
      const handler = async () => {
        isAutoRefreshingRef.current = true

        try {
          const pages = [...loadedPagesRef.current].sort((a, b) => a - b)
          const currentParams = params

          // 重新请求所有已加载的页
          for (const page of pages) {
            const offset = (page - 1) * pageSize
            // 计算coin_type，优先使用params中的coin_type
            const coinType =
              currentParams?.coin_type !== undefined
                ? currentParams.coin_type
                : selectCoinList.length == 2
                  ? `${selectCoinList[0]?.coin_type},${selectCoinList[1]?.coin_type}`
                  : selectCoinList.length == 1
                    ? `${selectCoinList[0]?.coin_type}`
                    : ''

            await fetchPoolsData({
              ...currentParams,
              offset,
              isListLoading: false,
              isAutoRefresh: true,
              isWatchList,
              coin_type: coinType,
              display_all_pools: isWatchList ? true : isAllPools,
              isIncentivizedOnly
            })

            if (poolRefreshStatus === 'error') {
              break
            }
          }
        } finally {
          isAutoRefreshingRef.current = false
        }
      }
      onRefreshHandlerRegistered(handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, selectCoinList, isWatchList, isAllPools, isIncentivizedOnly, onRefreshHandlerRegistered, pageSize])

  useEffect(() => {
    getStatistics()
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [])

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let observer: IntersectionObserver | null = null

    if (!isLoading && loadMoreRef.current) {
      observer = new IntersectionObserver(
        entries => {
          if (isAutoRefreshingRef.current) {
            return
          }
          const entry = entries[0]
          if (entry && entry.isIntersecting && hasLoadMore && !isLoadMoreLoading) {
            // console.log('🚀 ~ useEffect ~ entry:', entry)
            changeCurrentPage(currentPage)
          }
        },
        { threshold: 0.5, rootMargin: '100px' }
      )
      observer.observe(loadMoreRef.current!)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [isLoading, currentPage, hasLoadMore, isLoadMoreLoading])

  const columns = getColumns(sortRule, sortBy, clickSort, sortByObject, isApp)
  const { setBackUrl } = useCommonGlobalStore()

  const { getHaedalFarmingList } = useGetVaultsFarmingApiInfo()
  const { vaultsFarmObj } = useVaultsFarmingStore()
  useEffect(() => {
    if (!isAvailableObject(vaultsFarmObj)) {
      getHaedalFarmingList()
    }
  }, [vaultsFarmObj])

  return (
    <VStack gap={isApp ? '0' : '16px'} w={{ base: '100%', lg: '1160px' }} background="bg_primary">
      <PoolsFilter
        handleIsDisplayChecked={handleIsDisplayChecked}
        handleIsWatchList={handleIsWatchList}
        onClickIncentiveTypes={onClickIncentiveTypes}
        handleRefresh={handleRefresh}
        selectCoinList={selectCoinList}
        onClickSelectCoinList={onClickSelectCoinList}
        onDeleteSelectCoinList={onDeleteSelectCoinList}
        onSetSelectCoinList={onSetSelectCoinList}
        isRefreshed={isRefreshed}
        sortDropBlock={
          <SortDropBlock
            useDrawer={true}
            sortText="Sort by"
            wrapStyle={{
              borderRadius: { base: '8px', lg: '12px' },
              height: '20px !important'
            }}
            mainStyle={{
              flexDirection: 'row-reverse',
              p: '0 0px 0 10px',
              gap: '8px'
            }}
            iconSize="32px"
            iconStyle={{
              fontSize: '16px'
            }}
            iconBoxStyle={{
              border: '0',
              borderRadius: 0,
              borderLeft: ' 1px solid',
              borderColor: 'border !important',
              height: '16px',
              ml: 0,
              w: '16px',
              minW: '32px'
            }}
            hideButtonText={true}
            minW="max-content"
            currentSort={sortBy}
            sortByList={sortByList}
            onSortByChange={clickSort as any}
            xlinkHref={sortRule == 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
            iconOnClick={() => {
              onParamsChange({ offset: 0, order_by: sortRule == 'desc' ? `${sortBy?.value}` : `-${sortBy?.value}` })
              const rule = sortRule == 'desc' ? 'asc' : 'desc'
              setSortRule(rule)
            }}
          />
        }
      />
      {!isApp && <Box h="1px" w="100%" bg="border" />}
      <VStack w="100%" position="relative" gap={{ base: '0', lg: '20px' }} mb={{ base: '-40px', lg: '0' }}>
        {!isLoading && list?.length == 0 ? (
          <NoData
            type="nodata"
            text="No pools found"
            sx={{
              ...(isApp && {
                border: 'none',
                bg: 'transparent'
              })
            }}
            children={
              <Text mt="4px" textAlign="center">
                Try adjusting your search or filter settings.
              </Text>
            }
          />
        ) : isApp ? (
          <VStack w="100%" gap="4px" px="12px">
            {/* <HStack w="100%" justify="space-between">
              <Text fontSize="24px" color="text_caption">
                Pools
              </Text>
              <SortDropBlock
                sortText="Sort by"
                minW="168px"
                currentSort={sortBy}
                sortByList={sortByList}
                onSortByChange={clickSort as any}
                xlinkHref={sortRule == 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
                iconOnClick={() => {
                  onParamsChange({ offset: 0, order_by: sortRule == 'desc' ? `${sortBy?.value}` : `-${sortBy?.value}` })
                  const rule = sortRule == 'desc' ? 'asc' : 'desc'
                  setSortRule(rule)
                }}
              />
            </HStack> */}
            <H5MapTable<PoolApiInfo>
              rowKey="poolAddress"
              dataSource={list}
              columns={columns}
              loading={isLoading}
              itemSkeletonLength={7}
              itemHeight="16px"
              wrapStyle={{
                gap: '16px',
                sx: {
                  '& > div > div': {
                    gap: '12px'
                  }
                }
              }}
              rowStyle={(_, index) => ({
                w: '100%',
                p: '0px',
                mt: '0px',
                gap: '12px'
              })}
              onRowClick={item => {
                console.log(item, 'itemitemitem')
                setBackUrl('/pools')
                // navigate(`/liquidity?poolAddress=${item.poolAddress}`)
                goLiquidity(`/clmm?poolAddress=${item.poolAddress}`, item)
              }}
            />
          </VStack>
        ) : (
          <VirtualTable<PoolApiInfo>
            columns={columns}
            data={list}
            stickyHeaderTop="80px"
            rowKey="poolAddress"
            rowHeight={80} // 保留你之前的行高
            gridTemplateColumns="minmax(0px, 3.48fr) minmax(0px, 1.5fr) minmax(0px, 1.5fr) minmax(0px, 1.3fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(142px, 1.72fr)"
            columnGap="12px"
            px="0 16px"
            bg="bg_primary"
            isApp={isApp}
            justify="flex-end"
            isLoading={isLoading}
            onRowClick={item => {
              setBackUrl('/pools')
              goLiquidity(`/clmm?poolAddress=${item.poolAddress}`, item)
            }}
            rowStyle={{
              _hover: {
                '.clmm_fee': {
                  borderColor: 'token_inactive_border'
                }
              }
            }}
          />
        )}
        <Box ref={loadMoreRef}>{isLoadMoreLoading ? <Spinner size="sm" color="text_caption" /> : ''}</Box>
      </VStack>
    </VStack>
  )
}

const getColumns = (sortRule: string, sortBy: poolListType, clickSort: (value: poolListType) => void, sortByObject: any, isApp: boolean) => {
  return [
    {
      title: <Text fontSize="14px">Pools</Text>,
      key: 'pool',
      thConfig: {
        w: '30%'
      },
      showLabel: false,
      render: (item: any) => {
        return (
          <HStack justify="space-between">
            <HStack gap={isApp ? '4px' : '8px'}>
              <CoinPairInfo
                poolInfo={{ ...item, poolType: 'clmm' }}
                symbolEllipsesDecimals={10}
                type="row"
                {...(isApp && {
                  imgStyle: { w: '20px', h: '20px', showTagWidth: '10px', showTagHeight: '10px' },
                  padding: '0'
                })}
              />
              {item?.haveFarming && <FarmingIcon />}
              {item?.haveMining && <MiningIcon />}

              {/* {(item?.isVaults || item?.isUnstableVault) && <VaultsIcon />} */}
              {/* {(!item?.tokenA?.is_verified || !item?.tokenB?.is_verified) && <WarningIcon />} */}
              <WarningIcon
                coinTypeA={item?.tokenA?.coin_type}
                coinTypeB={item?.tokenB?.coin_type}
                w={{ base: '14px', lg: '16px' }}
                h={{ base: '14px', lg: '16px' }}
              />
            </HStack>
            {isApp && <ActionsBlock poolInfo={item} />}
          </HStack>
        )
      }
    },
    {
      title: (
        <TableSortTh labelInfo={sortByObject['tvl']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolListType) => clickSort(value)} />
      ),
      key: 'tvlDisplay'
    },
    {
      title: (
        <TableSortTh labelInfo={sortByObject['vol']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolListType) => clickSort(value)} />
      ),
      key: 'volume24Display'
    },
    {
      title: (
        <TableSortTh labelInfo={sortByObject['fees']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolListType) => clickSort(value)} />
      ),
      key: 'fees24Display'
    },

    {
      title: <Text textAlign="right">Rewards</Text>,
      key: 'rewards',
      hidden: ({ miningRewardList, farmsRewarderList }: { miningRewardList: any; farmsRewarderList: any }) => {
        return miningRewardList && miningRewardList?.length <= 0 && farmsRewarderList && farmsRewarderList?.length <= 0
      },
      render: ({ miningRewardList, farmsRewarderList }: { miningRewardList: any; farmsRewarderList: any }) => {
        return <RewardsBlock miningRewardList={miningRewardList} farmsRewarderList={farmsRewarderList} />
      }
    },
    {
      title: (
        <TableSortTh
          labelInfo={sortByObject['totalApr']}
          sortRule={sortRule}
          sortBy={sortBy}
          tooltip={{
            content: 'Estimated according to trading activity in the past 24 hours plus mining and farming rewards.',
            description: 'Estimated APR = [(24h fees + 24h rewards) × 365 / TVL] × 100%'
          }}
          clickSort={(value: poolListType) => clickSort(value)}
          justifyContent="flex-end"
          tooltipStyle={{
            maxW: {
              base: '300px',
              lg: '400px'
            }
          }}
        />
      ),
      key: 'apr24h',
      render: (item: any) => {
        return <AprTooltip poolInfo={item} showAprSize={isApp ? '12px' : '14px'} placement={isApp ? 'auto-start' : 'top'} />
      }
    },
    {
      title: <Text textAlign="right">Actions</Text>,
      showLabel: false,
      key: 'actions',
      hidden: isApp,
      render: (item: any) => {
        return <ActionsBlock poolInfo={item} />
      }
    }
  ]
}

export default PoolsContent
