import useGetDeepBookPools from '@/hooks/deepbook/useGetDeepBookPools'

import { useDeepBookFilteredPools } from '@/hooks/deepbook/useDeepBookPoolsManage'
import useDeepBookStore from '@/store/deepbook'
import { Block, SelectTab, type Tab, useGlobalToast } from '@cetus/design'
import { useDebounceFunction } from '@cetus/hooks'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenStore from '@cetus/stores/src/token'
import { Token } from '@cetus/types'
import { CoinPairImage, Icon, NoData, SearchInput, SingleCoinImage, Table, VaulDrawer } from '@cetus/ui-kit'
import { DEEPBOOK_POOL_FAVORITE_LIST, VariousTokensTable, abbreviateTokenName } from '@cetus/utils'
import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList, Skeleton, Switch, Text } from '@chakra-ui/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SortField, SortType, getColumns } from './GetColumns'
import { LeverageTag } from './Margin/LeverageTag'

// 快捷 token symbol 列表 'CETUS'下掉
const QUICK_TOKEN_SYMBOLS = ['SUI', 'USDC', 'DEEP', 'WAL', 'xBTC', 'ETH']

const ManagePoolComponent = ({ isStuck }: { isStuck: boolean }) => {
  const [isHover, setIsHover] = useState(false)
  const navigate = useNavigate()
  const getStoreState = useCallback(() => useDeepBookStore.getState(), [])
  const setStoreSearchText = useDeepBookStore(state => state.setSearchText)
  const setStoreIsAllPools = useDeepBookStore(state => state.setIsAllPools)

  // 只订阅地址，地址不变就不重渲染
  const currentPoolAddress = useDeepBookStore(state => state.currentDeepBookPool?.address)

  // 只订阅收藏列表和加载状态（这两个会影响列表的显示）
  const deepBookPoolFavoriteIds = useDeepBookStore(state => state.deepBookPoolFavoriteIds)
  const queryDeepBookPoolLoading = useDeepBookStore(state => state.queryDeepBookPoolLoading)
  const setQueryDeepBookPoolLoading = useDeepBookStore(state => state.setQueryDeepBookPoolLoading)

  // 添加选中池子地址的订阅
  const selectedPoolAddress = useDeepBookStore(state => state.selectedPoolAddress)
  const setSelectedPoolAddress = useDeepBookStore(state => state.setSelectedPoolAddress)

  // 用于触发按钮显示的当前池子信息（只在地址变化时重新计算）
  const currentDeepBookPool = useMemo(() => {
    const pool = useDeepBookStore.getState().currentDeepBookPool
    if (!pool) return null
    return {
      address: pool.address,
      baseAssets: pool.baseAssets,
      quoteAssets: pool.quoteAssets,
      marginRate: pool?.marginRate || null
    } as any
  }, [currentPoolAddress])

  const isOpen = useDeepBookStore(state => state.managePoolModalOpen)
  const setManagePoolModalOpen = useDeepBookStore(state => state.setManagePoolModalOpen)

  // 创建稳定的回调函数
  const handleOpen = useCallback(() => {
    setManagePoolModalOpen(true)
  }, [setManagePoolModalOpen])

  const handleClose = useCallback(() => {
    setManagePoolModalOpen(false)
  }, [setManagePoolModalOpen])

  // 使用 ref 来引用 MenuList，用于检查点击是否在内部
  const menuListRef = useRef<HTMLDivElement>(null)
  // 保存搜索前的 tab，用于搜索清空后恢复
  const previousTabRef = useRef<string | null>(null)

  const { isApp } = useWindowWidth()

  // 手动处理点击外部关闭逻辑（仅用于桌面端 Menu）
  useEffect(() => {
    if (!isOpen) return
    // 移动端使用 VaulDrawer，它自己处理点击外部关闭，不需要这个逻辑
    if (isApp) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // 检查点击是否在 MenuList 内
      if (menuListRef.current && menuListRef.current.contains(target)) {
        return
      }

      // 检查点击是否在 tooltip/popover 内
      const isInTooltip =
        target.closest('[role="tooltip"]') ||
        target.closest('.chakra-popover') ||
        target.closest('[id*="popover-content"]') ||
        target.closest('[id*="popover-body"]') ||
        target.closest('.chakra-popover__popper') ||
        target.closest('.chakra-popover__popper__css')

      if (isInTooltip) {
        return // 如果点击在 tooltip 内，不关闭 Menu
      }

      // 检查点击是否在 MenuButton 内（点击按钮应该打开/关闭 Menu）
      const isInMenuButton = target.closest('button[aria-haspopup="menu"]') || target.closest('[data-menu-button]')

      if (isInMenuButton) {
        return // 如果点击在 MenuButton 内，不关闭（让按钮的 onClick 处理）
      }

      // 其他情况，关闭 Menu
      handleClose()
    }

    // 使用捕获阶段，确保在其他事件处理之前执行
    document.addEventListener('mousedown', handleClickOutside, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [isOpen, handleClose, isApp])
  const { showCommonToast } = useGlobalToast()
  const { queryDeepBookPoolByValue, getAllDeepBookPools } = useGetDeepBookPools()

  const [inputValue, setInputValue] = useState('')
  const [sortField, setSortField] = useState<SortField>('vol24h')
  const [sortType, setSortType] = useState<SortType>('desc')
  const [isAllPools, setIsAllPools] = useState(false)
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string | null>(null)
  const [quickTokens, setQuickTokens] = useState<Map<string, Token>>(new Map())

  const debouncedQueryDeepBookPool = useDebounceFunction((value: string) => {
    if (value) {
      queryDeepBookPoolByValue(value, true, true)
    }
  }, 300)

  const handleInputChange = (value: string) => {
    const regValue = value.replace(/[^[a-zA-Z0-9\s]+$/g, '')
    const wasEmpty = inputValue === ''
    const isEmpty = regValue === ''

    // 如果从空变为非空（开始搜索），保存当前的 tab
    if (wasEmpty && !isEmpty && !previousTabRef.current) {
      previousTabRef.current = deepbookSelectedTab
    }

    setInputValue(regValue)
    // 同步到 store
    setStoreSearchText(regValue)
    if (regValue) {
      setQueryDeepBookPoolLoading(true)
      debouncedQueryDeepBookPool(regValue)
    } else {
      getStoreState().setQueryDeepBookPools([])
      // 恢复到搜索前的 tab，如果没有保存的 tab 则使用默认值
      if (previousTabRef.current) {
        setDeepbookSelectedTab(previousTabRef.current)
        previousTabRef.current = null // 清空保存的 tab
      } else {
        // 如果没有保存的 tab（可能是在没有 tab 的情况下清空），使用默认值
        setDeepbookSelectedTab('deepbook-tokens-tab-default')
      }
      setSelectedTokenSymbol(null)
    }
  }
  // 初始化 selectedTab 为 default
  const [deepbookSelectedTab, setDeepbookSelectedTab] = useState('deepbook-tokens-tab-default')

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      // 找到 Table 内部真正滚动的容器
      const tableScrollEl = document.querySelector('.chakra-table__container') as HTMLDivElement | null

      if (tableScrollEl) {
        tableScrollEl.scrollTop = 0
      }
    })
  }

  // 初始化时获取所有池子，当 isAllPools 改变时重新获取
  // Watchlist tab 需要加载所有池子，不受 All Pools 开关影响
  // Default tab 根据 isAllPools 决定
  // 注意：getAllDeepBookPools 已用 useCallback 包装，功能稳定，不需要加入依赖项
  useEffect(() => {
    if (isOpen) {
      // Watchlist tab 始终加载所有池子；Default tab 根据 isAllPools 决定
      const shouldLoadAllPools = deepbookSelectedTab === 'deepbook-tokens-tab-watchlist' ? true : isAllPools
      getAllDeepBookPools(shouldLoadAllPools)
      scrollToTop()
    }
  }, [isOpen, isAllPools, deepbookSelectedTab])

  // 同步 isAllPools 到 store
  useEffect(() => {
    setStoreIsAllPools(isAllPools)
  }, [isAllPools, setStoreIsAllPools])

  // 从 IndexedDB 加载快捷 token 信息
  const verifiedTokenMap = useTokenStore(state => state.verifiedTokenMap)

  useEffect(() => {
    const loadQuickTokens = async () => {
      try {
        const tokenMap = new Map<string, Token>()
        const quickTokenSymbolsUpper = QUICK_TOKEN_SYMBOLS.map(s => s.toUpperCase())

        // 首先从 verifiedTokenMap 查找（这些 token 通常已经加载，性能更好）
        if (verifiedTokenMap && verifiedTokenMap.size > 0) {
          verifiedTokenMap.forEach((token, coinType) => {
            if (token?.symbol) {
              const symbolUpper = token.symbol.toUpperCase()
              // 使用大写比较，确保匹配
              if (quickTokenSymbolsUpper.includes(symbolUpper)) {
                if (!tokenMap.has(symbolUpper)) {
                  tokenMap.set(symbolUpper, token)
                }
              }
            }
          })
        }

        setQuickTokens(tokenMap)
      } catch (error) {
        console.error('Failed to load quick tokens from IndexedDB:', error)
      }
    }

    loadQuickTokens()
  }, [verifiedTokenMap])

  // 处理排序点击 - 使用 useCallback 稳定引用
  const handleSort = useCallback(
    (field: SortField) => {
      console.log('🚀🚀🚀 ~ ManagePool.tsx:230 ~ ManagePoolComponent ~ sortField:', sortField)
      if (sortField === field) {
        if (sortType === 'desc') {
          setSortType('asc')
        } else if (sortType === 'asc') {
          setSortType('desc')
        }
      } else {
        setSortField(field)
        setSortType('desc')
      }
    },
    [sortField, sortType]
  )

  // 当切换tab时，重置为默认排序（vol24h降序）
  useEffect(() => {
    setSortField('vol24h')
    setSortType('desc')
  }, [deepbookSelectedTab])

  // 收藏/取消收藏
  const handleToggleFavorite = useCallback(
    (e: React.SyntheticEvent, poolAddress?: string) => {
      e.stopPropagation()
      e.preventDefault()

      if (!poolAddress) {
        return
      }

      const store = getStoreState()
      const isFavorited = store.deepBookPoolFavoriteIds.includes(poolAddress)
      let newIds: string[]

      if (isFavorited) {
        // 取消收藏
        newIds = store.removeDeepBookPoolFavoriteId(poolAddress)
        VariousTokensTable.setItem(DEEPBOOK_POOL_FAVORITE_LIST, newIds)
        showCommonToast('Removed', 'success')
      } else {
        // 添加收藏
        newIds = store.setDeepBookPoolFavoriteId(poolAddress)
        VariousTokensTable.setItem(DEEPBOOK_POOL_FAVORITE_LIST, newIds)
        showCommonToast('Added', 'success')
      }

      const deepBookPools = store.deepBookPools
      if (Array.isArray(deepBookPools) && deepBookPools.length) {
        const newPools = (deepBookPools as any[]).map((pool: any) => (pool?.address === poolAddress ? { ...pool, isFavorite: !isFavorited } : pool))
        store.setDeepBookPools(newPools)
      }

      const currentPool = store.currentDeepBookPool
      if (currentPool?.address === poolAddress) {
        store.setCurrentDeepBookPool({
          ...currentPool,
          isFavorite: !isFavorited
        })
      }
    },
    [getStoreState, showCommonToast]
  )

  // const isShowSunsetTab = useMemo(() => {
  //   return currentDeepBookPool?.isMarginPool && isApp ? false : true
  // }, [currentDeepBookPool?.isMarginPool, isApp])

  const tabList: Tab[] = [
    {
      label: (
        <Icon
          xlinkHref="#icon-icon_star_sel"
          fontSize="20px"
          sx={{
            position: 'relative',
            top: '2px'
          }}
          svgFill={deepbookSelectedTab === 'deepbook-tokens-tab-watchlist' ? 'primary' : 'text_paragraph'}
          svgHover="primary"
        />
      ),
      value: 'Watchlist',
      key: 'deepbook-tokens-tab-watchlist'
    },
    { label: 'Default', value: 'Default', key: 'deepbook-tokens-tab-default' }
  ]

  const filteredPools = useDeepBookFilteredPools({
    inputValue,
    key: deepbookSelectedTab,
    // sortField: inputValue ? null : sortField,
    // sortType: inputValue ? 'none' : sortType,
    sortField: sortField,
    sortType: sortType,
    // Watchlist tab 不受 All Pools 开关影响，始终显示所有收藏的池子
    // Default tab 根据 isAllPools 开关决定
    isAllPools:
      deepbookSelectedTab === 'deepbook-tokens-tab-default'
        ? isAllPools
        : deepbookSelectedTab === 'deepbook-tokens-tab-watchlist'
          ? true
          : isAllPools,
    // selectedTokenSymbol
    selectedTokenSymbol: inputValue ? null : selectedTokenSymbol
  })

  // 处理快捷 token 选择
  const handleTokenClick = useCallback(
    (tokenSymbol: string) => {
      if (selectedTokenSymbol === tokenSymbol) {
        // 如果点击已选中的 token，取消选择
        setSelectedTokenSymbol(null)
      } else {
        setSelectedTokenSymbol(tokenSymbol)
      }
    },
    [selectedTokenSymbol]
  )

  useEffect(() => {
    if (!isOpen) {
      // 关闭 modal 时只重置临时状态，保留 text 和 allPools 状态以便下次打开时恢复
      setInputValue('')
      // 设置默认 tab 为 default
      setDeepbookSelectedTab('deepbook-tokens-tab-default')
      setSortField('vol24h')
      setSortType('desc')
      setSelectedPoolAddress(null) // 清空选中状态
      setSelectedTokenSymbol(null)
      previousTabRef.current = null // 重置保存的 tab
      // 注意：不重置 isAllPools 和 store 中的 searchText、isAllPools，以便下次打开时恢复
    } else {
      // 打开 modal 时，从 store 恢复状态
      const storeState = getStoreState()
      setInputValue(storeState.searchText || '')
      setIsAllPools(storeState.isAllPools || false)
      // 设置默认 tab 为 default
      setDeepbookSelectedTab('deepbook-tokens-tab-default')
    }
  }, [isOpen, setSelectedPoolAddress, getStoreState])

  const isCurrentPoolFavorited = currentDeepBookPool?.address ? deepBookPoolFavoriteIds.includes(currentDeepBookPool.address) : false

  const { getExplorerUrl } = useExplorer()

  // 使用 useMemo 缓存 columns，避免每次渲染都重新创建
  const columns = useMemo(
    () =>
      getColumns(
        isApp,
        handleToggleFavorite,
        undefined,
        undefined,
        inputValue !== '',
        deepbookSelectedTab,
        queryDeepBookPoolLoading,
        inputValue ? null : sortField,
        inputValue ? 'none' : sortType,
        handleSort,
        selectedPoolAddress,
        setSelectedPoolAddress
      ),
    [
      isApp,
      handleToggleFavorite,
      inputValue,
      deepbookSelectedTab,
      queryDeepBookPoolLoading,
      sortField,
      sortType,
      handleSort,
      selectedPoolAddress,
      setSelectedPoolAddress
    ]
  )

  const tableContainerWrapStyle = useMemo(
    () =>
      isApp
        ? {
            minH: '200px',
            w: '100%',
            overflowX: 'hidden' as const,
            maxH: '100%'
          }
        : {
            minH: '200px',
            w: '100%',
            overflowX: 'hidden' as const
          },
    [isApp]
  )

  // 稳定 onRowClick 回调
  const handleRowClick = useCallback(
    (item: any) => {
      const store = getStoreState()
      store.setCurrentDeepBookPool(item)
      store.setDeepbookPrice({ poolId: item.address, price: item.price })
      navigate(`/deepbook/${item.address}`)
      handleClose()
    },
    [getStoreState, navigate, handleClose]
  )

  // 缓存 rowStyle
  const rowStyle = useMemo(
    () => ({
      h: isApp ? 'auto' : '40px',
      cursor: 'pointer',
      position: 'relative' as const,
      borderRadius: '0 !important',
      _hover: { bg: !isApp ? 'primary_opacity.10 !important' : 'none !important' },
      sx: {
        'td:first-of-type, td:last-of-type': {
          borderRadius: '0 !important'
        },
        '&:hover .tooltip-icon': {
          visibility: 'visible !important',
          pointerEvents: 'auto !important'
        },
        '.tooltip-icon': {
          visibility: isApp ? 'visible' : 'hidden',
          pointerEvents: isApp ? 'auto' : 'none'
        },
        '&:hover .actions-container': {
          display: 'flex !important'
        },
        '.actions-container': {
          display: 'none'
        }
      }
    }),
    [isApp]
  )

  const renderPoolTable = (maxHeight?: string | number) => (
    <Table
      noData={
        filteredPools.length === 0 && !queryDeepBookPoolLoading ? (
          <NoData type="nodata" text="No pools found" noBorder bg="none" imgSize="80px" />
        ) : undefined
      }
      rowKey="address"
      columns={columns}
      headBg={'bg_secondary'}
      fixedHeader
      maxHeight={maxHeight}
      dataSource={filteredPools}
      skeletonLength={3}
      loading={queryDeepBookPoolLoading}
      trPadding={isApp ? '12px 0' : '12px'}
      w="100%"
      tableContainerWrapStyle={{
        ...tableContainerWrapStyle,
        pb: '50px'
      }}
      sx={{
        tableLayout: isApp ? 'auto' : 'fixed',
        w: '100%',
        ...(inputValue && {
          'thead tr > th:nth-of-type(4)': {
            pr: '12px !important'
          }
        }),
        ...(isApp && {
          'tbody tr > td:first-of-type, tbody tr > td:last-of-type': {
            px: '0 !important'
          },
          'thead tr > th:first-of-type, thead tr > th:last-of-type': {
            px: '0 !important'
          },

          mr: '4px'
        })
      }}
      onRowClick={handleRowClick}
      rowStyle={rowStyle}
    />
  )

  const triggerContent = (
    <Skeleton isLoaded={!!currentDeepBookPool?.address}>
      <HStack align="center" gap={isApp ? '4px' : '8px'}>
        <CoinPairImage
          coinACoinType={currentDeepBookPool?.baseAssets?.coin_type}
          coinBCoinType={currentDeepBookPool?.quoteAssets?.coin_type}
          coinAIconUrl={currentDeepBookPool?.baseAssets?.icon_url}
          coinBIconUrl={currentDeepBookPool?.quoteAssets?.icon_url}
          w={isApp ? '22px' : '24px'}
          h={isApp ? '22px' : '24px'}
        />
        <Text fontSize="16px" color="text_caption" fontWeight="500">
          {`${abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)} - ${abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)}`}
        </Text>
        {currentDeepBookPool?.marginRate ? <LeverageTag leverage={currentDeepBookPool?.marginRate} showTooltip={true} /> : null}
        <Icon
          fontSize="12px"
          xlinkHref="#icon-icon_arrow"
          transition="transform 0.5s"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          svgFill={isHover ? 'text_caption' : 'text_paragraph'}
        />
      </HStack>
    </Skeleton>
  )

  // 渲染 All Pools 开关组件
  const renderAllPoolsSwitch = () => {
    // 只在 Default tab 显示 All Pools 开关
    if (deepbookSelectedTab !== 'deepbook-tokens-tab-default') {
      return null
    }
    return (
      <Box display="flex" alignItems="center" gap="8px">
        <Text fontSize="12px" whiteSpace="nowrap">
          All Pools
        </Text>
        <Switch
          size="sm"
          isChecked={isAllPools}
          onChange={e => {
            const checked = e.target.checked
            setIsAllPools(checked)
            // 同步到 store
            setStoreIsAllPools(checked)
          }}
          sx={{
            '.chakra-switch__track': {
              w: '20px',
              h: '10px'
            },
            '.chakra-switch__thumb': {
              w: '12px',
              h: '12px',
              mt: '-1px',
              ml: '-1px'
            }
          }}
        />
      </Box>
    )
  }

  const renderQuickTokenSelect = () => {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        p="12px 12px 0px"
        overflowX="auto"
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none'
        }}
      >
        {QUICK_TOKEN_SYMBOLS.map(symbol => {
          const token = quickTokens.get(symbol.toUpperCase())
          const isSelected = selectedTokenSymbol?.toUpperCase() === symbol.toUpperCase()
          return (
            <Box
              key={symbol}
              display="flex"
              alignItems="center"
              justifyContent="center"
              p="6px"
              borderRadius="6px"
              bg={isSelected ? 'primary_opacity.20' : 'bg_primary'}
              border={'1px solid'}
              borderColor={isSelected ? 'primary' : 'border'}
              cursor="pointer"
              onClick={() => handleTokenClick(symbol)}
              position="relative"
              sx={{
                flexShrink: 0,
                _hover: {
                  bg: isSelected ? 'primary_opacity.20' : 'primary_opacity.10',
                  '& .token-symbol-text': {
                    ...(!isApp && {
                      opacity: 1,
                      maxWidth: '100px',
                      visibility: 'visible'
                    })
                  },
                  '& .token-symbol-container': {
                    gap: !isApp ? '4px' : '0px'
                  }
                },
                '& .token-symbol-container': {
                  gap: isSelected && !isApp ? '4px' : '0px'
                },
                '& .token-symbol-text': {
                  display: isApp ? 'none' : 'block',
                  opacity: isSelected ? 1 : 0,
                  maxWidth: isSelected ? '100px' : '0px',
                  visibility: isSelected ? 'visible' : 'hidden',
                  transition: 'opacity 0.2s ease-in-out, max-width 0.2s ease-in-out, visibility 0.2s ease-in-out',
                  overflow: 'hidden'
                }
              }}
            >
              <HStack className="token-symbol-container">
                <SingleCoinImage imageUrl={token?.logo_url || token?.iconUrl} coinType={token?.coin_type} w={'16px'} h={'16px'} showTag={false} />
                {!isApp && (
                  <Text fontSize="12px" className="token-symbol-text" color="text_caption" whiteSpace="nowrap">
                    {symbol}
                  </Text>
                )}
              </HStack>
            </Box>
          )
        })}
      </Box>
    )
  }

  const setIsOpenCreateModal = useDeepBookStore(state => state.setIsOpenCreateModal)
  const CreatePool = () => {
    return (
      <Block
        w={{ base: 'calc(100vw - 24px)', lg: '100%' }}
        pb={{ base: '16px', lg: '0' }}
        borderRadius="none"
        cursor="pointer"
        p="0"
        border="none"
        h={{ base: '66px', lg: '50px' }}
        lineHeight={{ base: '50px', lg: '50px' }}
        position="fixed"
        bottom="0"
        onClick={e => {
          setIsOpenCreateModal(true)
          handleClose()
        }}
      >
        <HStack justify="center" w="100%" gap="4px">
          <Icon xlinkHref="#icon-a-icon_add1" svgFill="primary" svgHover="primary" fontSize="14px" />
          <Text color="primary">Create a new pool</Text>
        </HStack>
      </Block>
    )
  }

  return (
    <HStack
      w={{ base: 'auto', lg: 'auto' }}
      position={isApp ? 'relative' : 'static'}
      zIndex="100"
      cursor="pointer"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      sx={{
        flexDirection: isApp ? 'row-reverse' : 'row',
        w: isApp ? '100%' : 'auto',
        // 在 Safari 中，避免创建新的定位上下文
        ...(!isApp && {
          isolation: 'auto'
        })
      }}
    >
      <HStack
        flex={isApp ? '1' : 'auto'}
        justify="flex-end"
        sx={{
          ...(isApp && {
            position: 'relative',
            right: '-4px'
          })
        }}
      >
        {isStuck ? null : (
          <>
            <Box
              onMouseDown={e => {
                e.stopPropagation()
                e.preventDefault()
              }}
              onTouchStart={e => {
                e.stopPropagation()
                e.preventDefault()
              }}
              onClick={e => {
                handleToggleFavorite?.(e, currentDeepBookPool?.address)
              }}
              sx={{
                bg: isApp ? 'transparent' : isCurrentPoolFavorited ? 'primary_opacity.10' : 'background',
                w: '24px',
                h: '24px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon
                xlinkHref={isCurrentPoolFavorited ? '#icon-icon_star_sel' : '#icon-icon_star'}
                fontSize="18px"
                svgFill={isCurrentPoolFavorited ? 'primary' : 'text_paragraph'}
                svgHover="primary"
              />
            </Box>
          </>
        )}
      </HStack>
      {isApp ? (
        <>
          <Button variant="unstyled" p="0" onClick={handleOpen} w="100%" h="40px" display="flex" alignItems="center" justifyContent="flex-start">
            {triggerContent}
          </Button>
          {isApp && (
            <VaulDrawer
              key={`drawer-bottom-${isApp ? 'mobile' : 'desktop'}`}
              isOpen={isOpen}
              onClose={handleClose}
              placement="bottom"
              padding="0"
              wrapStyle={{
                w: '100%',
                h: '90vh',
                bg: '#0F0F0F'
              }}
            >
              <Box display="flex" flexDirection="column" position="relative" h="100%">
                <Box
                  w="100%"
                  sx={{
                    input: {
                      borderRadius: '8px',
                      fontSize: isApp ? '12px' : '14px',
                      h: '32px'
                    }
                  }}
                  p="12px 12px 0"
                >
                  <SearchInput
                    placeholder="Search by token or pool address"
                    searchText={inputValue}
                    onChange={(value: string) => handleInputChange(value)}
                    iconSize="16px"
                    h="32px"
                    iconMt="8px"
                  />
                </Box>
                {!inputValue && (
                  <>
                    {/* 快捷 token 选择 */}
                    {renderQuickTokenSelect()}
                    <Box
                      position="relative"
                      sx={{
                        ':before': {
                          content: '""',
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          height: '1px',
                          backgroundColor: 'white_color_opacity.10'
                        }
                      }}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      w="100%"
                      gap="0"
                      p="0 12px"
                    >
                      <SelectTab
                        type="borderTab"
                        wrapStyle={{
                          w: '100%',
                          h: '38px',
                          bg: 'none',
                          border: 'none',
                          padding: '0'
                        }}
                        itemStyle={{
                          marginRight: '23px',
                          fontSize: '14px',
                          position: 'relative',
                          minW: 'max-content',
                          fontWeight: '500',
                          sx: {
                            '&:first-of-type': {
                              maxW: '20px'
                            }
                          }
                        }}
                        tabList={tabList}
                        currentTab={deepbookSelectedTab as string}
                        activeColor="primary"
                        handleChangeTab={item => {
                          setDeepbookSelectedTab(item.key)
                          setSelectedTokenSymbol(null)
                        }}
                      />
                      {renderAllPoolsSwitch()}
                    </Box>
                  </>
                )}
                <Box
                  pl={'12px'}
                  pr={'12px'}
                  flex="1"
                  overflowY="auto"
                  sx={{
                    '&::-webkit-scrollbar': {
                      display: 'none !important',
                      width: '0 !important',
                      height: '0 !important'
                    },
                    scrollbarWidth: 'none !important',
                    msOverflowStyle: 'none !important'
                  }}
                  overflowX="hidden"
                  minH="0"
                  display="flex"
                  flexDirection="column"
                >
                  <Box pb="16px" flex="1">
                    {renderPoolTable()}
                  </Box>
                  <CreatePool />
                </Box>
              </Box>
            </VaulDrawer>
          )}
        </>
      ) : (
        <>
          <Menu
            isOpen={isOpen}
            onClose={handleClose}
            closeOnBlur={false}
            closeOnSelect={false}
            autoSelect={false}
            placement="bottom-start"
            gutter={8}
            strategy="fixed"
          >
            <MenuButton
              as={Button}
              bg="none"
              _hover={{ bg: 'none' }}
              _active={{ bg: 'none' }}
              p="0"
              onClick={handleOpen}
              w={{ base: 'auto', lg: 'auto' }}
              h="40px"
            >
              {triggerContent}
            </MenuButton>
            <MenuList
              ref={menuListRef}
              w={{ base: '370px', lg: '550px' }}
              borderRadius="12px"
              p="0px"
              mt="0"
              zIndex="9999"
              ml="-30px"
              maxH="400px"
              overflow="hidden"
              boxShadow="0px 4px 20px rgba(0, 0, 0, 0.15)"
              onClick={e => {
                // 阻止事件冒泡到遮罩层
                e.stopPropagation()
              }}
              onMouseDown={e => {
                // 也阻止 mousedown 事件
                e.stopPropagation()
              }}
              position="relative"
            >
              <Box
                w="100%"
                px="12px"
                pt="12px"
                sx={{
                  input: {
                    borderRadius: '8px',
                    fontSize: '14px',
                    h: '32px'
                  }
                }}
              >
                <SearchInput
                  placeholder="Search by token or pool address"
                  searchText={inputValue}
                  onChange={(value: string) => handleInputChange(value)}
                  iconSize="16px"
                  h="32px"
                  iconMt="8px"
                />
              </Box>
              {!inputValue && (
                <>
                  {renderQuickTokenSelect()}
                  <Box
                    position="relative"
                    sx={{
                      ':before': {
                        content: '""',
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        width: '100%',
                        height: '1px',
                        backgroundColor: 'white_color_opacity.10'
                      }
                    }}
                    px="12px"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    w="100%"
                  >
                    <SelectTab
                      type="borderTab"
                      wrapStyle={{
                        w: { base: '100%', lg: 'unset' },
                        h: '38px',
                        bg: 'none',
                        border: 'none',
                        padding: '0'
                      }}
                      itemStyle={{
                        marginRight: { base: '0', lg: '24px' },
                        fontSize: '14px',
                        position: 'relative',
                        flex: 1,
                        minW: 'max-content',
                        fontWeight: '500',
                        sx: {
                          '&:first-of-type': {
                            maxW: '20px'
                          }
                        }
                      }}
                      tabList={tabList}
                      currentTab={deepbookSelectedTab as string}
                      activeColor="primary"
                      handleChangeTab={item => {
                        setDeepbookSelectedTab(item.key)
                      }}
                    />
                    {renderAllPoolsSwitch()}
                  </Box>
                </>
              )}
              <MenuItem closeOnSelect={false} p="0" w="100%">
                <Box w="100%" maxH="276px" p="0" overflow="hidden" pr={inputValue ? '0' : '0'}>
                  {renderPoolTable('276px')}
                </Box>
              </MenuItem>
              <CreatePool />
            </MenuList>
          </Menu>
        </>
      )}
    </HStack>
  )
}

const ManagePool = memo(ManagePoolComponent)
export default ManagePool
