import PoolsFilter from '@/components/pools/PoolsFilter'
import useNavigateToLiquidity from '@/hooks/clmm/useNavigateToLiquidity'
import useFavoriteDlmmPool from '@/hooks/pool/useFavoriteDlmmPool'
import { GetFavoritePoolListProps } from '@/hooks/pool/useFavoritePool'
import useGetDlmmPoolList from '@/hooks/pool/useGetDlmmPoolList'
import useStatistics from '@/hooks/stats/useStatistics'
import useCommonGlobalStore from '@/store/common/global'
import useDlmmPoolsStore from '@/store/pool/useDlmmPoolStore'
import { DlmmApiPoolGroupItem } from '@/types/dlmm'
import { SortDropBlock, useGlobalToast } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useGlobalStore from '@cetus/stores/src/global'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { CommonTypeInfo, ToastType, Token } from '@cetus/types'
import { NoData, Table, VirtualTable } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { useRequest } from 'ahooks'
import { uniqBy } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import H5Pools from './H5Pools'
import PoolsItem from './PoolsItem'
import { getColumns } from './columns'

type sortRule = 'desc' | 'asc'
export type poolListType = {
  label: 'Liquidity' | 'Volume (24H)' | 'Volume (7D)' | 'Fees (24H)' | 'APR (24H)'
  value: 'tvl' | 'vol' | 'vol7d' | 'fees' | 'totalApr'
}

interface FetchPoolsDataProps extends GetFavoritePoolListProps {
  isWatchList?: boolean
  isListLoading?: boolean
  isAutoRefresh?: boolean
  coin_type?: string
  display_all_pools?: boolean
  isIncentivizedOnly?: boolean
}

interface DLMMPoolsProps {
  isRefreshed: boolean
  handleIsRefreshed: (isFreshed: boolean) => void
  onRefreshHandlerRegistered?: (handler: () => Promise<void>) => void
  onManualRefresh?: () => void
  setPaginationLoading?: (loading: boolean) => void
}

function DLMMPools({ isRefreshed, handleIsRefreshed, onRefreshHandlerRegistered, onManualRefresh, setPaginationLoading }: DLMMPoolsProps) {
  const { isTerm } = useWebConfigStore()
  const { getStatistics } = useStatistics()
  const { setIsTopProgressLoading } = useCommonGlobalStore()
  const { goDlmmLiquidity } = useNavigateToLiquidity()
  const { getDlmmPoolList } = useGetDlmmPoolList()
  const { getFavoritePoolList } = useFavoriteDlmmPool()
  const {
    dlmmPoolRefreshStatus,
    setDlmmPoolRefreshStatus,
    setDlmmPoolListLength,
    tutorialOpen,
    dlmmPoolListLength,
    isDlmmWatchList,
    setIsDlmmWatchList,
    isDlmmAllPools,
    setIsDlmmAllPools,
    isDlmmIncentivizedOnly,
    setIsDlmmIncentivizedOnly,
    setDlmmPoolFavoriteIdsChange,
    dlmmPoolFavoriteIdsChange,
    dlmmPoolFavoriteIds,
    dlmmSelectCoinList,
    setDlmmSelectCoinList
  } = useDlmmPoolsStore()
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

  const [openPoolsGroup, setOpenPoolsGroup] = useState<Record<string, boolean>>({})

  const onParamsChange = (_params: Record<string, any>) => {
    setParams(prev => ({ ...prev, isListLoading: true, ..._params }))
  }

  const onClickIncentiveTypes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target?.checked
    onParamsChange({
      offset: 0,
      isIncentivizedOnly: checked
    })
    setIsDlmmIncentivizedOnly(checked)
    setIsDlmmAllPools(false)
    list?.forEach(item => {
      onOpenPoolsGroup(item?.id, false)
    })
  }

  const handleIsDisplayChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target?.checked
    onParamsChange({
      offset: 0,
      display_all_pools: checked
    })
    setIsDlmmAllPools(checked)
    setIsDlmmWatchList(false)
    setIsDlmmIncentivizedOnly(false)
    setIsLoading(true)
  }

  const handleIsWatchList = () => {
    const newWatchList = !isDlmmWatchList
    onParamsChange({
      offset: 0,
      isWatchList: newWatchList
    })
    setIsDlmmAllPools(false)
    setIsDlmmWatchList(newWatchList)
    setDlmmPoolFavoriteIdsChange(false)
    setIsLoading(true)
  }

  useEffect(() => {
    // 监听添加移除收藏的操作
    // console.log('🚀 ~ useEffect ~ poolFavoriteIds:', dlmmPoolFavoriteIdsChange, dlmmPoolFavoriteIds)
    if (isDlmmWatchList && dlmmPoolFavoriteIdsChange) {
      setDlmmPoolFavoriteIdsChange(false)
      onParamsChange({
        offset: 0
      })
      setIsDlmmWatchList(true)
    }
  }, [dlmmPoolFavoriteIds?.length, dlmmPoolFavoriteIdsChange])

  const timer = useRef<any>(null)

  const handleRefresh = () => {
    if (onManualRefresh) {
      onManualRefresh()
    }
    // console.log('🚀 ~ handleRefresh ~ handleRefresh:')
    handleIsRefreshed(false)
    setDlmmPoolRefreshStatus('pending')
    setCurrentPage(1)
    loadedPagesRef.current = [1] // 重置已加载页码
    onParamsChange({ offset: 0, isListLoading: false })
    timer.current = setTimeout(() => {
      // console.log('🚀 ~ timer.current=setTimeout ~ poolRefreshStatus:', dlmmPoolRefreshStatus)
      if (dlmmPoolRefreshStatus == 'pending') {
        setDlmmPoolRefreshStatus('timeout')
      }
    }, 10000)
    getStatistics()
  }
  const onClickSelectCoinList = (tokenInfo: Token) => {
    const newList = [...dlmmSelectCoinList, tokenInfo]
    setDlmmSelectCoinList(newList)
    // 同步更新 params 中的 coin_type
    const coinType = newList.length == 2 ? `${newList[0]?.coin_type},${newList[1]?.coin_type}` : newList.length == 1 ? `${newList[0]?.coin_type}` : ''
    onParamsChange({ coin_type: coinType, offset: 0 })
    setList([])
    setIsLoading(true)
  }
  const onDeleteSelectCoinList = (tokenInfo: Token) => {
    const newList = dlmmSelectCoinList.filter(ele => ele?.coin_type !== tokenInfo?.coin_type)
    setDlmmSelectCoinList(newList)
    // 同步更新 params 中的 coin_type
    const coinType = newList.length == 2 ? `${newList[0]?.coin_type},${newList[1]?.coin_type}` : newList.length == 1 ? `${newList[0]?.coin_type}` : ''
    onParamsChange({ coin_type: coinType, offset: 0 })
    setList([])
    setIsLoading(true)
  }
  const onSetSelectCoinList = (tokens: Token[]) => {
    setDlmmSelectCoinList(tokens)
    // 同步更新 params 中的 coin_type
    const coinType = tokens.length == 2 ? `${tokens[0]?.coin_type},${tokens[1]?.coin_type}` : tokens.length == 1 ? `${tokens[0]?.coin_type}` : ''
    onParamsChange({ coin_type: coinType, offset: 0 })
    setList([])
    setIsLoading(true)
  }

  const pageSize = 20
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const [sortRule, setSortRule] = useState<sortRule>('desc')
  const [sortBy, setSortBy] = useState<poolListType>({ label: 'Volume (24H)', value: 'vol' })
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [list, setList] = useState<Array<DlmmApiPoolGroupItem>>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadedPagesRef = useRef<number[]>([1])
  const isAutoRefreshingRef = useRef(false)

  useEffect(() => {
    return () => {
      setList([])
    }
  }, [])

  const getPoolList = async (params: FetchPoolsDataProps) => {
    const isListLoading = params?.isListLoading ?? true
    const isAutoRefresh = params?.isAutoRefresh ?? false

    const isWatch = params?.isWatchList !== undefined ? params.isWatchList : isDlmmWatchList
    const coin =
      params?.coin_type !== undefined
        ? params.coin_type
        : dlmmSelectCoinList.length == 2
          ? `${dlmmSelectCoinList[0]?.coin_type},${dlmmSelectCoinList[1]?.coin_type}`
          : dlmmSelectCoinList.length == 1
            ? `${dlmmSelectCoinList[0]?.coin_type}`
            : ''
    const isAll = params?.display_all_pools !== undefined ? params.display_all_pools : (isDlmmAllPools ?? true)
    const isIncentivized = params?.isIncentivizedOnly !== undefined ? params.isIncentivizedOnly : isDlmmIncentivizedOnly

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

      // 只有非 loadMore 的请求才显示顶部加载条
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
    let result: any
    try {
      if (isWatch) {
        query['pools'] = dlmmPoolFavoriteIds?.filter(Boolean)
        result = await getFavoritePoolList(query)
      } else {
        result = await getDlmmPoolList(query)
      }

      if (result) {
        // console.log('🚀 ~ fetchDatafetchPoolsData ~ result:', result)
        if (result?.isLocal) {
          setDlmmPoolRefreshStatus('error')
          setList(result?.list)
          setTotal(result.total)
          if (isWatch) {
            setDlmmPoolListLength(result?.total || '0')
          } else {
            setDlmmPoolListLength(
              result.list?.reduce(
                (sum, current) =>
                  d(sum)
                    .plus(current?.pools?.length || 0)
                    .toString(),
                '0'
              ) || '0'
            )
          }

          setCurrentPage(1)
        } else {
          if (isAutoRefresh) {
            if (Number(offset) === 0) {
              // Incremental Updates
              setList(prev => {
                const newMap = new Map(result.list.map((item: DlmmApiPoolGroupItem) => [item.id, item]))
                // Keep original order, only update existing data items
                const updated = prev.map(item => {
                  const newItem = newMap.get(item.id)
                  if (newItem) {
                    return newItem
                  }
                  return item
                })

                const newItems = result.list.filter((item: DlmmApiPoolGroupItem) => !prev.some(p => p.id === item.id))

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
                const newMap = new Map(result.list.map((item: DlmmApiPoolGroupItem) => [item.id, item]))
                const updatedCurrentPages = currentPages.map(item => {
                  const newItem = newMap.get(item.id)
                  return (newItem || item) as DlmmApiPoolGroupItem
                })
                const newItems = result.list.filter((item: DlmmApiPoolGroupItem) => !currentPages.some(p => p.id === item.id))
                const updatedCurrentPagesWithNew: DlmmApiPoolGroupItem[] = [...updatedCurrentPages, ...newItems]
                return uniqBy([...beforePages, ...updatedCurrentPagesWithNew, ...afterPages], 'id')
              })
            }
            if (dlmmPoolListLength === '') {
              setTotal(result.total)
              setDlmmPoolListLength(result?.total)
            }
            if (dlmmPoolListLength !== '' && result?.total > 0) {
              setTotal(result.total)
              setDlmmPoolListLength(result?.total)
            }
          } else {
            if (Number(offset) >= pageSize) {
              setList(prev => uniqBy(prev.concat(result.list), 'id'))
              // Update loaded page number record
              const pageNumber = Math.floor(offset / pageSize) + 1
              if (!loadedPagesRef.current.includes(pageNumber)) {
                loadedPagesRef.current.push(pageNumber)
                loadedPagesRef.current.sort((a, b) => a - b)
              }
              if (dlmmPoolListLength === '') {
                setTotal(result.total)
                setDlmmPoolListLength(result?.total)
              }
              if (dlmmPoolListLength !== '' && result?.total > 0) {
                setTotal(result.total)
                setDlmmPoolListLength(result?.total)
              }
            } else {
              setList(result.list)
              setTotal(result.total)
              setDlmmPoolListLength(result?.total)
            }
          }

          setDlmmPoolRefreshStatus('success')
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
        setDlmmPoolRefreshStatus('error')
        setList((error as any).list)
        setTotal((error as any).total)
        setDlmmPoolListLength('')
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

  // 初始化时同步 isDlmmAllPools, isDlmmIncentivizedOnly, isDlmmWatchList, selectCoinList 到 params
  useEffect(() => {
    const updates: Record<string, any> = {}
    if (params.display_all_pools !== isDlmmAllPools) {
      updates.display_all_pools = isDlmmAllPools
    }
    if (params.isIncentivizedOnly !== isDlmmIncentivizedOnly) {
      updates.isIncentivizedOnly = isDlmmIncentivizedOnly
    }
    if (params.isWatchList !== isDlmmWatchList && isDlmmWatchList !== undefined) {
      updates.isWatchList = isDlmmWatchList
    }
    // 同步 selectCoinList 到 coin_type
    const coinType =
      dlmmSelectCoinList.length == 2
        ? `${dlmmSelectCoinList[0]?.coin_type},${dlmmSelectCoinList[1]?.coin_type}`
        : dlmmSelectCoinList.length == 1
          ? `${dlmmSelectCoinList[0]?.coin_type}`
          : ''
    if (params.coin_type !== coinType) {
      updates.coin_type = coinType
    }
    if (Object.keys(updates).length > 0) {
      setParams(prev => ({ ...prev, ...updates }))
    }
  }, [
    isDlmmAllPools,
    isDlmmIncentivizedOnly,
    isDlmmWatchList,
    dlmmSelectCoinList,
    params.display_all_pools,
    params.isIncentivizedOnly,
    params.isWatchList,
    params.coin_type
  ])

  useRequest(() => getPoolList(params), {
    refreshDeps: [params, dlmmSelectCoinList, isDlmmWatchList, isDlmmAllPools, isDlmmIncentivizedOnly],
    manual: false,
    debounceWait: 150
  })

  // useEffect(() => {
  //   if (isLoadMoreLoading) {
  //     setIsLoadMoreLoading(false)
  //   }
  // }, [list?.length])

  const { failedTsToast } = useGlobalToast()

  useEffect(() => {
    // console.log('🚀 ~ PoolsContent ~ poolRefreshStatus:', dlmmPoolRefreshStatus)
    if (dlmmPoolRefreshStatus !== 'pending') {
      const info: ToastType = {
        linkLabel: '',
        getShowInfo: () => {
          const info: CommonTypeInfo = {
            toastTitleText:
              dlmmPoolRefreshStatus == 'error' ? 'Request Error' : dlmmPoolRefreshStatus == 'timeout' ? 'Please check the network status.' : ''
          }
          return info
        }
      }
      if (dlmmPoolRefreshStatus == 'success' || dlmmPoolRefreshStatus == 'error') {
        clearTimeout(timer.current)
      }
      if (dlmmPoolRefreshStatus == 'error' || dlmmPoolRefreshStatus == 'timeout') {
        failedTsToast(info)
      }
      handleIsRefreshed(true)
    }
  }, [dlmmPoolRefreshStatus])

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
      await getPoolList({ ...params, offset: pageOffset })
      setCurrentPage(prev => prev + 1)
    } finally {
      if (setPaginationLoading) {
        setPaginationLoading(false)
      }
    }
  }

  const hasLoadMore = useMemo(() => {
    const currentSize = (currentPage - 1) * pageSize + list?.length
    return dlmmPoolRefreshStatus !== 'error' && Number(total) > currentSize
  }, [total, currentPage, pageSize, dlmmPoolRefreshStatus, list?.length])

  useEffect(() => {
    if (onRefreshHandlerRegistered) {
      const handler = async () => {
        isAutoRefreshingRef.current = true

        try {
          const pages = [...loadedPagesRef.current].sort((a, b) => a - b)

          for (const page of pages) {
            const offset = (page - 1) * pageSize
            // 计算coin_type，优先使用params中的coin_type
            const coinType =
              params?.coin_type !== undefined
                ? params.coin_type
                : dlmmSelectCoinList.length == 2
                  ? `${dlmmSelectCoinList[0]?.coin_type},${dlmmSelectCoinList[1]?.coin_type}`
                  : dlmmSelectCoinList.length == 1
                    ? `${dlmmSelectCoinList[0]?.coin_type}`
                    : ''

            await getPoolList({
              ...params,
              offset,
              isListLoading: false,
              isAutoRefresh: true,
              isWatchList: isDlmmWatchList,
              coin_type: coinType,
              display_all_pools: isDlmmWatchList ? true : isDlmmAllPools,
              isIncentivizedOnly: isDlmmIncentivizedOnly
            })

            if (dlmmPoolRefreshStatus === 'error') {
              break
            }
          }
        } finally {
          isAutoRefreshingRef.current = false
        }
      }
      onRefreshHandlerRegistered(handler)
    }
  }, [
    params,
    dlmmSelectCoinList,
    isDlmmWatchList,
    isDlmmAllPools,
    isDlmmIncentivizedOnly,
    onRefreshHandlerRegistered,
    pageSize,
    dlmmPoolRefreshStatus
  ])

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

    // 清理函数
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [isLoading, currentPage, hasLoadMore, isLoadMoreLoading])

  const columns = getColumns(sortRule, sortBy, clickSort, sortByObject, isApp)

  // const { stepMap, dlmmTutorialStep, onTutorialExit, onTutorialNext, onTutorialPrevious, onStepDuration, showPoolsTutorial } = useTutorial()

  // useEffect(() => {
  //   onStepDuration()
  // }, [onStepDuration])

  const onOpenPoolsGroup = (groupId: string, isOpen: boolean) => {
    if (isOpen) {
      // 展开新列表时，收起其他所有列表
      setOpenPoolsGroup({ [groupId]: true })
    } else {
      // 收起列表时，只更新当前列表状态
      setOpenPoolsGroup(pre => ({ ...pre, [groupId]: false }))
    }
  }
  const { setBackUrl } = useCommonGlobalStore()
  const { dlmmTutorialStep } = useGlobalStore()

  return (
    <>
      <VStack gap={isApp ? '0' : '16px'} w="100%" background="bg_primary" mb={{ base: '-40px', lg: '0' }}>
        <PoolsFilter
          handleIsDisplayChecked={handleIsDisplayChecked}
          handleIsWatchList={handleIsWatchList}
          onClickIncentiveTypes={onClickIncentiveTypes}
          handleRefresh={handleRefresh}
          selectCoinList={dlmmSelectCoinList}
          onClickSelectCoinList={onClickSelectCoinList}
          onDeleteSelectCoinList={onDeleteSelectCoinList}
          onSetSelectCoinList={onSetSelectCoinList}
          isRefreshed={isRefreshed}
          isDlmmPools={true}
          isPools={false}
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
        <Box h="1px" w="100%" bg="border" sx={{ ...(isApp && { display: 'none' }) }} />
        <VStack w="100%" position="relative" gap="20px">
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
            <VStack w="100%" gap="4px">
              {/* <HStack w="100%" justify="space-between" mb="12px">
                <Text fontSize="24px" color="text_caption">
                  Pools
                </Text>
                <SortDropBlock
                  sortText="Sort by"
                  minW="180px"
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
              <H5Pools
                rowKey="id"
                isWatch={isDlmmWatchList}
                dataSource={list}
                columns={columns}
                loading={isLoading}
                itemSkeletonLength={7}
                itemHeight="16px"
                goLiquidity={goDlmmLiquidity}
                openPoolsGroup={openPoolsGroup}
                onOpenPoolsGroup={onOpenPoolsGroup}
              />
            </VStack>
          ) : isLoading ? (
            <Table<any>
              rowKey="id"
              columns={columns}
              dataSource={list}
              skeletonLength={10}
              loading={isLoading}
              rowStyle={{ h: '80px', cursor: 'pointer' }}
            />
          ) : isDlmmWatchList ? (
            <VirtualTable<any>
              columns={columns}
              data={list}
              stickyHeaderTop="80px"
              rowKey="id"
              rowHeight={80} // 保留你之前的行高
              gridTemplateColumns="minmax(0px, 3.48fr) minmax(0px, 1.5fr) minmax(0px, 1.5fr) minmax(0px, 1.3fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(142px, 1.72fr)"
              columnGap="12px"
              px="0 16px"
              bg="bg_primary"
              isApp={isApp}
              justify="flex-end"
              isLoading={isLoading}
              onRowClick={item => {
                setBackUrl('/pools?tab=dlmm_pools')
                goDlmmLiquidity(`/dlmm?poolId=${item.poolId}`, item)
              }}
            />
          ) : (
            <VStack w="100%" gap="0">
              <Box
                as="div"
                display="grid"
                w="1160px"
                gridTemplateColumns="1fr 128px 148px 128px 90px 120px 158px"
                h="36px"
                columnGap="12px"
                p="0 16px"
                position="sticky"
                top="80px"
                bg="background"
                zIndex={99}
              >
                {columns?.map((col, index) => (
                  <Flex key={col.key} as="div" align="center" justify={index === 0 ? 'flex-start' : 'flex-end'}>
                    {col.title}
                  </Flex>
                ))}
              </Box>
              <Box w="100%">
                {list?.map((item, index) => {
                  return (
                    <PoolsItem
                      key={item?.id}
                      item={item}
                      columns={columns}
                      goLiquidity={goDlmmLiquidity}
                      // sort={index}
                      // tutorialOpen={tutorialOpen}
                      isOpen={openPoolsGroup?.[item?.id]}
                      onOpen={onOpenPoolsGroup}
                    />
                  )
                })}
              </Box>
            </VStack>
          )}
          {d(dlmmPoolListLength).gt(list?.reduce((acc, cur) => acc + (cur?.list?.length ?? 0), 0)) && (
            <Box ref={loadMoreRef}>{isLoadMoreLoading ? <Spinner size="sm" color="text_caption" /> : ''}</Box>
          )}
        </VStack>
      </VStack>
      {/* {dlmmTutorialStep < 2 && isTerm && <DlmmTutorial />} */}
    </>
  )
}

export default DLMMPools
