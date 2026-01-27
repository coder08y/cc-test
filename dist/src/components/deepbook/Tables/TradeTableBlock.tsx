import useTabAutoScroll from '@/hooks/common/useTabAutoScroll'
import useDeepBookOrderActions from '@/hooks/deepbook/useDeepBookOrderActions'
import useGetDeepBookCount from '@/hooks/deepbook/useGetDeepBookCount'
import useGetDeepBookOpenOrders from '@/hooks/deepbook/useGetDeepBookOpenOrders'
import useGetDeepBookOrderHistory from '@/hooks/deepbook/useGetDeepBookOrderHistory'
import useGetDeepBookTradeHistory from '@/hooks/deepbook/useGetDeepBookTradeHistory'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { Block, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { CheckBox } from '@cetus/ui-kit'
import { isAvailableObject } from '@cetus/utils'
import { Box, HStack, StackProps, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import CombinedFilter from '../../common/CombinedFilter'
import LiquidationRecordTableBlock from './LiquidationRecordTableBlock'
import OpenOrdersTableBlock from './OpenOrdersTableBlock'
import OrderHistoryTableBlock from './OrderHistoryTableBlock'
import PositionsTableBlock from './PositionsTableBlock'
import TradeHistoryTableBlock from './TradeHistoryTableBlock'

const ActionContent = ({
  isShowAllMarkets,
  isCheckedAllMarkets,
  setIsCheckedAllMarkets,
  isShowCancelAll,
  cancelAllOrder,
  wrapStyle
}: {
  isShowAllMarkets: boolean
  isCheckedAllMarkets: boolean
  setIsCheckedAllMarkets: (isChecked: boolean) => void
  isShowCancelAll: boolean
  cancelAllOrder: () => void
  wrapStyle: StackProps
}) => {
  return (
    <HStack gap="12px" w={{ base: '100%', lg: 'auto' }} {...wrapStyle}>
      {isShowAllMarkets && (
        <HStack _hover={{ cursor: 'pointer', _sx: { '& > p': { color: 'text_caption' } } }}>
          <CheckBox
            checked={isCheckedAllMarkets}
            onClick={() => setIsCheckedAllMarkets(!isCheckedAllMarkets)}
            wrapStyle={{
              width: '16px',
              height: '16px',
              sx: {
                '& svg': {
                  w: '12px',
                  h: '12px',
                  fill: isCheckedAllMarkets ? '#000 !important' : 'transparent !important'
                }
              }
            }}
          />
          <Text whiteSpace="nowrap" fontSize="12px" color="text_caption" onClick={() => setIsCheckedAllMarkets(!isCheckedAllMarkets)}>
            All Markets
          </Text>
          {/* <Switch isChecked={isCheckedAllMarkets} onChange={() => setIsCheckedAllMarkets(!isCheckedAllMarkets)} /> */}
        </HStack>
      )}
      {/* {isShowCancelAll && (
        <Text
          border="1px solid"
          borderColor="border"
          borderRadius="6px"
          p="4px 6px"
          whiteSpace="nowrap"
          fontSize="12px"
          _hover={{ cursor: 'pointer', color: 'text_caption' }}
          onClick={() => cancelAllOrder()}
        >
          Cancel All
        </Text>
      )} */}
    </HStack>
  )
}

const TradeTableTab = ({
  tabList,
  currentTab,
  setCurrentTab,
  isCheckedAllMarkets,
  setIsCheckedAllMarkets,
  isShowCancelAll,
  cancelAllOrder,
  isShowAllMarkets,
  sideType,
  setSideType,
  statusType,
  setStatusType,
  instrumentType,
  setInstrumentType
}: {
  tabList: any[]
  currentTab: any
  setCurrentTab: (tab: any) => void
  isCheckedAllMarkets: boolean
  setIsCheckedAllMarkets: (isChecked: boolean) => void
  isShowCancelAll: boolean
  cancelAllOrder: () => void
  isShowAllMarkets: boolean
  sideType: string
  setSideType: (val: string) => void
  statusType: string
  setStatusType: (val: string) => void
  instrumentType: string
  setInstrumentType: (val: string) => void
}) => {
  const { isApp } = useWindowWidth()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ==================== Tab 自动滚动逻辑 ====================
  // H5 移动端右侧有固定过滤器按钮（62px），需要确保最后一个 tab 完全可见
  useTabAutoScroll({
    scrollContainerRef,
    currentTabValue: currentTab,
    firstTabValue: 'Open Orders',
    lastTabValue: 'Liquidation Record',
    padding: 12,
    rightOffset: isApp ? 62 : 0
  })

  return (
    <Box position="relative" bg={'bg_secondary'}>
      <HStack
        ref={scrollContainerRef}
        p="0 12px"
        overflowX="auto"
        overflowY="visible"
        minW={{ base: '320px', lg: 'auto' }}
        w="100%"
        borderBottom="1px solid"
        borderColor="border"
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <SelectTab<any, any>
          type="borderTab"
          tabList={tabList}
          currentTab={currentTab}
          handleChangeTab={tab => setCurrentTab(tab?.label)}
          activeColor="primary"
          wrapStyle={{
            w: '100%',
            minW: 'fit-content',
            h: '44px',
            border: 'none',
            gap: '24px',
            bg: 'bg_secondary',
            mr: '48px'
            // pr: isApp ? '0' : '0'
          }}
          itemStyle={{
            h: '100%',
            borderRadius: '4px',
            gap: '0px',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}
          selectTabItemTextStyle={
            {
              color: 'text_paragraph',
              sx: {
                '&[data-active=true]': {
                  color: 'primary'
                }
              }
            } as any
          }
        />
        {!isApp && (
          <ActionContent
            isShowAllMarkets={isShowAllMarkets}
            isCheckedAllMarkets={isCheckedAllMarkets}
            setIsCheckedAllMarkets={setIsCheckedAllMarkets}
            isShowCancelAll={isShowCancelAll}
            cancelAllOrder={cancelAllOrder}
            wrapStyle={{}}
          />
        )}
      </HStack>
      {isApp && (
        <Box
          position="absolute"
          right="0"
          top="0"
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="62px"
          pointerEvents="none"
          h="44px"
        >
          <Box
            w="100%"
            h="38px"
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            px="12px"
            background="linear-gradient( 90deg, rgba(15,15,15,0) 0%, #0F0F0F 30%)"
            pointerEvents="auto"
          >
            {currentTab === 'Order Histroy' ? (
              <CombinedFilter
                menuWidth={'134px'}
                autoApply={false}
                filterGroups={[
                  {
                    label: 'Side',
                    type: sideType,
                    setType: setSideType,
                    filterList: ['All', 'Buy', 'Sell'],
                    singleSelect: true
                  },
                  {
                    label: 'Status',
                    type: statusType,
                    setType: setStatusType,
                    filterList: ['Pending', 'Partially Filled', 'Filled', 'Cancelled', 'Expired']
                  }
                ]}
              />
            ) : currentTab === 'Open Orders' ? (
              <CombinedFilter
                menuWidth={'94px'}
                // autoApply={true}
                autoApply={false}
                filterGroups={[
                  {
                    label: 'Side',
                    type: sideType,
                    setType: setSideType,
                    filterList: ['All', 'Buy', 'Sell'],
                    singleSelect: true
                  },
                  {
                    label: 'Instrument',
                    type: instrumentType,
                    setType: setInstrumentType,
                    filterList: ['All', 'Spot', 'Margin'],
                    singleSelect: true
                  }
                ]}
              />
            ) : (
              <CombinedFilter
                menuWidth={'94px'}
                // autoApply={true}
                autoApply={false}
                filterGroups={[
                  {
                    label: '',
                    type: sideType,
                    setType: setSideType,
                    filterList: ['All', 'Buy', 'Sell'],
                    singleSelect: true
                  }
                ]}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function TradeTableBlock() {
  const {
    isCheckedAllMarkets,
    setIsCheckedAllMarkets,
    deepBookOpenOrders,
    // deepBookPools,
    // deepBookOrderHistory,
    currentDeepBookPool,
    orderListLoading,
    deepBookOrderHistoryLoading,
    showOpenOrdersNum,
    showDeepBookOrderHistoryNum,
    showDeepBookTradeHistoryNum,
    showOpenOrdersNumSpot,
    showOpenOrdersNumMargin,
    showDeepBookOrderHistoryNumSpot,
    showDeepBookOrderHistoryNumMargin,
    showDeepBookTradeHistoryNumSpot,
    showDeepBookTradeHistoryNumMargin,
    showPositionsNum,
    deepBookTradeHistoryLoading,
    setDeepBookOpenOrders,
    setDeepBookOrderHistory,
    setDeepBookTradeHistory,
    setShowOpenOrdersNumSpot,
    setShowOpenOrdersNumMargin,
    setShowDeepBookOrderHistoryNumSpot,
    setShowDeepBookOrderHistoryNumMargin,
    setShowDeepBookTradeHistoryNumSpot,
    setShowDeepBookTradeHistoryNumMargin,
    setOrderListLoading
  } = useDeepBookStore()
  const { showDeepBookLiquidationRecordsNum, deepBookLiquidationRecordsLoading, marginManagerByAccount } = useMarginStore()

  const { cancelAllOrder } = useDeepBookOrderActions()
  const { getDeepBookOpenOrdersCombined, getDeepBookAllOpenOrdersCombined } = useGetDeepBookOpenOrders()
  const { getDeepBookOrderHistory } = useGetDeepBookOrderHistory()
  const { getDeepBookTradeHistory } = useGetDeepBookTradeHistory()
  const { getDeepBookCount } = useGetDeepBookCount()

  const { currentAccount } = useAccountStore()
  // 初始 tab：如果是 Margin 模式则显示 Positions，否则显示 Open Orders
  const tradeTypeByPool = useDeepBookStore(state => state.tradeTypeByPool)

  const getInitialTab = () => {
    const poolAddress = currentDeepBookPool?.address
    const currentTradeType = poolAddress ? tradeTypeByPool[poolAddress] || 'Spot' : 'Spot'
    return currentTradeType === 'Margin' ? 'Positions' : 'Open Orders'
  }
  const [currentTab, setCurrentTab] = useState<any>(getInitialTab())
  const { isApp } = useWindowWidth()
  const prevTabRef = useRef<string | null>(null)
  const prevEffectiveOrderTypeRef = useRef<'spot' | 'margin' | null>(null)
  const prevPoolAddressForDataRef = useRef<string | undefined>(undefined) // 用于数据获取的池子地址跟踪
  const prevIsCheckedAllMarketsRef = useRef<boolean | null>(null)
  const prevAccountAddressRef = useRef<string | undefined>(undefined)
  const prevMarginManagerByAccountRef = useRef<any>(undefined)

  // 筛选状态 - 默认显示全部
  const [sideType, setSideType] = useState('All,Buy,Sell')
  const [instrumentType, setInstrumentType] = useState('All,Spot,Margin')
  const [statusType, setStatusType] = useState('')
  // const [isMargin, setIsMargin] = useState(false)

  const getTradeType = useDeepBookStore(state => state.getTradeType)

  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool])

  // 当 tradeType 切换时，自动切换 tab（只在 tradeType 真正变化时执行，不在用户手动切换 tab 时执行）
  const prevTradeTypeForTabRef = useRef<string | null>(null)

  useEffect(() => {
    if (!poolAddress) return

    const currentTradeType = tradeTypeByPool[poolAddress] || 'Spot'
    const prevTradeType = prevTradeTypeForTabRef.current

    // 只在 tradeType 真正变化时才自动切换
    if (prevTradeType !== null && prevTradeType !== currentTradeType) {
      // 从 Margin 切换到 Spot 时，如果当前 tab 是 Positions，自动切换到 Open Orders
      if (currentTradeType === 'Spot') {
        setCurrentTab((prevTab: string) => {
          if (prevTab === 'Positions') {
            return 'Open Orders'
          }
          return prevTab
        })
      }
      // 从 Spot 切换到 Margin 时，如果当前 tab 不是 Positions，自动切换到 Positions
      else if (currentTradeType === 'Margin') {
        setCurrentTab((prevTab: string) => {
          if (prevTab !== 'Positions') {
            return 'Positions'
          }
          return prevTab
        })
      }
    }

    // 更新 prevTradeTypeForTabRef
    prevTradeTypeForTabRef.current = currentTradeType
  }, [poolAddress, tradeTypeByPool])

  // 本地状态管理表格的 Spot/Margin 切换，不影响全局
  const [localOrderTab, setLocalOrderTab] = useState<'spot' | 'margin'>(() => {
    if (!poolAddress) return 'spot'
    const currentTradeType = tradeTypeByPool[poolAddress] || 'Spot'
    return currentTradeType === 'Margin' ? 'margin' : 'spot'
  })

  const prevPoolAddressForOrderTabRef = useRef<string | undefined>(undefined) // 用于同步 localOrderTab 的池子地址跟踪
  const prevTradeTypeRef = useRef<'Spot' | 'Margin' | undefined>(poolAddress ? getTradeType(poolAddress) : undefined)

  // 当切换池子或全局 tradeTypeByPool 变化时，同步更新本地状态（单向：全局 -> 本地）
  useEffect(() => {
    if (!poolAddress) return

    const savedTradeType = getTradeType(poolAddress)
    const targetOrderTab = savedTradeType === 'Margin' ? 'margin' : 'spot'

    // 池子切换时，重置本地状态
    if (prevPoolAddressForOrderTabRef.current !== poolAddress) {
      prevPoolAddressForOrderTabRef.current = poolAddress
      prevTradeTypeRef.current = savedTradeType
      setLocalOrderTab(targetOrderTab)
      return
    }

    // 全局 tradeTypeByPool 变化时，同步更新本地状态
    if (prevTradeTypeRef.current !== savedTradeType) {
      prevTradeTypeRef.current = savedTradeType
      setLocalOrderTab(targetOrderTab)
    }
  }, [poolAddress, tradeTypeByPool, getTradeType])

  // 使用本地状态计算 effectiveOrderType，只影响表格显示
  const effectiveOrderType = useMemo(() => {
    return localOrderTab
  }, [localOrderTab])

  // 统一的数据获取逻辑：监听所有可能触发数据请求的变化
  useEffect(() => {
    if (!currentAccount?.address) {
      // 账号未连接时，清空 refs，等待账号连接后重新请求
      prevTabRef.current = null
      prevEffectiveOrderTypeRef.current = null
      prevPoolAddressForDataRef.current = undefined
      prevIsCheckedAllMarketsRef.current = null
      prevAccountAddressRef.current = undefined
      // 清空所有订单数据和计数
      setDeepBookOpenOrders([])
      setDeepBookOrderHistory([])
      setDeepBookTradeHistory([])
      setShowOpenOrdersNumSpot(0)
      setShowOpenOrdersNumMargin(0)
      setShowDeepBookOrderHistoryNumSpot(0)
      setShowDeepBookOrderHistoryNumMargin(0)
      setShowDeepBookTradeHistoryNumSpot(0)
      setShowDeepBookTradeHistoryNumMargin(0)
      setOrderListLoading(false)
      return
    }

    if (!isAvailableObject(currentDeepBookPool)) {
      return
    }

    // 检测是否为首次渲染（所有 refs 都未初始化）
    const isInitialRender =
      prevTabRef.current === null &&
      prevEffectiveOrderTypeRef.current === null &&
      prevPoolAddressForDataRef.current === undefined &&
      prevIsCheckedAllMarketsRef.current === null &&
      prevAccountAddressRef.current === undefined &&
      prevMarginManagerByAccountRef.current === undefined

    // 检测各种变化
    const tabChanged = prevTabRef.current !== null && prevTabRef.current !== currentTab
    const orderTypeChanged = prevEffectiveOrderTypeRef.current !== null && prevEffectiveOrderTypeRef.current !== effectiveOrderType
    const poolChanged = prevPoolAddressForDataRef.current !== undefined && prevPoolAddressForDataRef.current !== poolAddress
    const allMarketsChanged = prevIsCheckedAllMarketsRef.current !== null && prevIsCheckedAllMarketsRef.current !== isCheckedAllMarkets
    const marginMarginManagerChanged =
      prevMarginManagerByAccountRef.current !== undefined && String(prevIsCheckedAllMarketsRef.current) !== String(marginManagerByAccount)
    // 账号变化：包括从断开状态连接到新钱包（prevAccountAddressRef.current === undefined -> currentAccount.address 存在）
    // 以及从一个账号切换到另一个账号
    const accountChanged =
      (prevAccountAddressRef.current === undefined && currentAccount.address) ||
      (prevAccountAddressRef.current !== undefined && prevAccountAddressRef.current !== currentAccount.address) ||
      marginMarginManagerChanged

    // 初始化 refs（首次渲染时）
    if (prevTabRef.current === null) {
      prevTabRef.current = currentTab
    }
    if (prevEffectiveOrderTypeRef.current === null) {
      prevEffectiveOrderTypeRef.current = effectiveOrderType
    }
    if (prevPoolAddressForDataRef.current === undefined) {
      prevPoolAddressForDataRef.current = poolAddress
    }
    if (prevIsCheckedAllMarketsRef.current === null) {
      prevIsCheckedAllMarketsRef.current = isCheckedAllMarkets
    }
    if (prevAccountAddressRef.current === undefined) {
      prevAccountAddressRef.current = currentAccount.address
    }

    if (prevMarginManagerByAccountRef.current === undefined) {
      prevMarginManagerByAccountRef.current = marginManagerByAccount
    }

    // 如果是首次渲染或有任何变化，触发数据请求
    if (isInitialRender || tabChanged || orderTypeChanged || poolChanged || allMarketsChanged || accountChanged) {
      // 在请求新数据前，先清空旧数据（避免显示混乱）
      // 注意：allMarketsChanged 时也需要清空，因为切换 All Markets 会改变数据源
      if (tabChanged || orderTypeChanged || poolChanged || allMarketsChanged || accountChanged) {
        // 账号切换时，清空所有订单数据和计数
        if (accountChanged) {
          setDeepBookOpenOrders([])
          setDeepBookOrderHistory([])
          setDeepBookTradeHistory([])
          setShowOpenOrdersNumSpot(0)
          setShowOpenOrdersNumMargin(0)
          setShowDeepBookOrderHistoryNumSpot(0)
          setShowDeepBookOrderHistoryNumMargin(0)
          setShowDeepBookTradeHistoryNumSpot(0)
          setShowDeepBookTradeHistoryNumMargin(0)
        } else {
          // 其他变化时，只清空当前 tab 的数据
          if (currentTab === 'Open Orders') {
            setDeepBookOpenOrders([])
            // 立即清空对应的计数，避免显示错误的数据
            if (orderTypeChanged) {
              if (effectiveOrderType === 'margin') {
                setShowOpenOrdersNumMargin(0)
              } else {
                setShowOpenOrdersNumSpot(0)
              }
            }
          } else if (currentTab === 'Order Histroy') {
            setDeepBookOrderHistory([])
          } else if (currentTab === 'Trade History') {
            setDeepBookTradeHistory([])
          }
        }
      }

      // 更新所有 refs
      if (tabChanged) {
        prevTabRef.current = currentTab
      }
      if (orderTypeChanged) {
        prevEffectiveOrderTypeRef.current = effectiveOrderType
      }
      if (poolChanged) {
        prevPoolAddressForDataRef.current = poolAddress
      }
      if (allMarketsChanged) {
        prevIsCheckedAllMarketsRef.current = isCheckedAllMarkets
      }
      if (accountChanged) {
        prevAccountAddressRef.current = currentAccount.address
      }

      const isMargin = effectiveOrderType === 'margin'

      // 账号切换时，无论当前在哪个tab，都请求当前tab的数据
      // 其他tab的数据会在用户切换到对应tab时自动请求（通过tabChanged触发）
      if (accountChanged) {
        // 请求当前 tab 的数据
        if (currentTab === 'Open Orders' || currentTab === 'Positions') {
          // Open Orders 一次请求同时获取 spot + margin 数据
          if (isCheckedAllMarkets) {
            getDeepBookAllOpenOrdersCombined(marginManagerByAccount, false, undefined, false)
          } else {
            getDeepBookOpenOrdersCombined(marginManagerByAccount, currentDeepBookPool, currentAccount.address)
          }
        } else if (currentTab === 'Order Histroy') {
          const params: any = {
            isMargin
          }
          if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
            params.poolId = currentDeepBookPool.address
          }
          getDeepBookOrderHistory(params)
        } else if (currentTab === 'Trade History') {
          const params: any = {
            isMargin
          }
          if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
            params.poolId = currentDeepBookPool.address
          }
          getDeepBookTradeHistory(params)
        }
        // LiquidationRecordTableBlock 有自己的 useEffect 监听账号变化，会自动请求数据
      } else {
        // 非账号切换时，根据当前 tab 请求对应的数据
        if (currentTab === 'Open Orders' || currentTab === 'Positions') {
          // Open Orders 一次请求同时获取 spot + margin 数据
          if (isCheckedAllMarkets) {
            getDeepBookAllOpenOrdersCombined(marginManagerByAccount, false, undefined, false)
          } else {
            getDeepBookOpenOrdersCombined(marginManagerByAccount, currentDeepBookPool, currentAccount.address)
          }
        } else if (currentTab === 'Order Histroy') {
          const params: any = {
            isMargin
          }
          if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
            params.poolId = currentDeepBookPool.address
          }
          getDeepBookOrderHistory(params)
        } else if (currentTab === 'Trade History') {
          const params: any = {
            isMargin
          }
          if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
            params.poolId = currentDeepBookPool.address
          }
          getDeepBookTradeHistory(params)
        }
      }

      // 同时获取订单统计数据（统一接口，同时获取 spot 和 margin 的计数）
      getDeepBookCount({ poolId: isCheckedAllMarkets ? null : poolAddress })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentTab,
    effectiveOrderType,
    currentAccount?.address,
    poolAddress,
    isCheckedAllMarkets,
    marginManagerByAccount
    // 注意：以下函数已从依赖数组中移除，因为：
    // 1. Zustand setter 函数（setDeepBookOpenOrders 等）是稳定的，不需要监听
    // 2. 数据获取函数（getDeepBookOpenOrders 等）虽然可能重新创建，但它们的逻辑是相同的
    // 3. 数据获取应该由业务状态变化触发（tab、订单类型、池地址等），而不是函数引用变化
    // 4. 如果监听这些函数，会导致 useEffect 频繁执行（因为函数每次渲染都可能重新创建）
    // getDeepBookOpenOrders,
    // getDeepBookAllOpenOrders,
    // getDeepBookOrderHistory,
    // getDeepBookTradeHistory,
    // getDeepBookCount,
    // setDeepBookOpenOrders,
    // setDeepBookOrderHistory,
    // setDeepBookTradeHistory
  ])

  const tradeTableTabList = useMemo(() => {
    const currentTradeType = poolAddress ? tradeTypeByPool[poolAddress] || 'Spot' : 'Spot'
    // tab 上的 number 显示 spot + margin 的总和
    const openOrdersTotal = (showOpenOrdersNumSpot || 0) + (showOpenOrdersNumMargin || 0)
    const orderHistoryTotal = (showDeepBookOrderHistoryNumSpot || 0) + (showDeepBookOrderHistoryNumMargin || 0)
    const tradeHistoryTotal = (showDeepBookTradeHistoryNumSpot || 0) + (showDeepBookTradeHistoryNumMargin || 0)

    const tabs = []

    // 只在 Margin 模式下显示 Positions tab
    if (currentTradeType === 'Margin') {
      tabs.push({
        label: 'Positions',
        num: showPositionsNum > 0 ? showPositionsNum : undefined
      })
    }

    tabs.push(
      {
        label: 'Open Orders',
        num: openOrdersTotal > 0 ? openOrdersTotal : undefined
      },
      {
        label: 'Order Histroy',
        num: orderHistoryTotal > 0 ? orderHistoryTotal : undefined
      },
      {
        label: 'Trade History',
        num: tradeHistoryTotal > 0 ? tradeHistoryTotal : undefined
      }
    )

    // 只在 Margin 模式下显示清算列表 tab
    if (currentTradeType === 'Margin') {
      tabs.push({
        label: 'Liquidation History',
        num:
          showDeepBookLiquidationRecordsNum > 0 && currentAccount?.address && !deepBookLiquidationRecordsLoading
            ? showDeepBookLiquidationRecordsNum
            : undefined
      })
    }

    return tabs

    // {
    //   label: 'Settled Balance',
    //   tooltip:
    //     'Settled balance will be claimed automatically to your free balance if you conduct new actions in the same pool. Or you could manually claim it from here.',
    //   afterIcon: { xlinkHref: '#icon-icon_tips', fontSize: '20px' },
    //   tooltipPlacement: 'top'
    // }
  }, [
    currentAccount?.address,
    currentTab,
    orderListLoading,
    deepBookOrderHistoryLoading,
    showOpenOrdersNumSpot,
    showOpenOrdersNumMargin,
    showDeepBookOrderHistoryNumSpot,
    showDeepBookOrderHistoryNumMargin,
    showDeepBookTradeHistoryNumSpot,
    showDeepBookTradeHistoryNumMargin,
    deepBookTradeHistoryLoading,
    showDeepBookLiquidationRecordsNum,
    deepBookLiquidationRecordsLoading,
    poolAddress,
    tradeTypeByPool,
    effectiveOrderType
  ])

  // 注意：不再监听 deepBookOpenOrders 来更新计数，因为：
  // 1. 计数应该由数据获取函数（useGetDeepBookOpenOrders）直接设置
  // 2. 这个 useEffect 可能导致竞态条件：当切换类型时，旧的 deepBookOpenOrders 可能还包含旧类型的数据
  // 3. 数据获取函数已经根据 isMarginPool 正确设置了对应的 spot/margin 计数

  const orderTabList = useMemo(() => {
    const result = [
      {
        label: 'Spot',
        active: localOrderTab === 'spot',
        onClick: () => {
          setLocalOrderTab('spot')
        }
      }
    ]
    console.log('🚀🚀🚀 ~ TradeTableBlock.tsx:621 ~ TradeTableBlock ~ currentDeepBookPool:', currentDeepBookPool)

    if (currentDeepBookPool?.isMarginPool || isCheckedAllMarkets) {
      result.push({
        label: 'Margin',
        active: localOrderTab === 'margin',
        onClick: () => {
          setLocalOrderTab('margin')
        }
      })
    } else {
      return []
    }

    return result
  }, [localOrderTab, currentDeepBookPool?.address, isCheckedAllMarkets])

  const isShowSpotOrMarginTab = useMemo(() => {
    // Open Orders 下不显示 Spot/Margin 切换 tab
    if (currentTab === 'Open Orders' || currentTab === 'Positions') {
      return false
    }
    return (
      (currentDeepBookPool.enabled || isCheckedAllMarkets) &&
      currentTab != 'Liquidation Record' &&
      currentTab !== 'Liquidation History' &&
      orderTabList?.length > 0
    )
  }, [currentDeepBookPool, isCheckedAllMarkets, currentTab, orderTabList])

  return (
    <Block bg={'bg_secondary'} p="0px" h="100%" borderRadius="8px" border="none" overflow="visible">
      <TradeTableTab
        tabList={tradeTableTabList}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isCheckedAllMarkets={isCheckedAllMarkets}
        setIsCheckedAllMarkets={setIsCheckedAllMarkets}
        isShowCancelAll={currentTab == 'Open Orders' && deepBookOpenOrders?.length > 0}
        isShowAllMarkets={currentTab !== 'Settled Balance' && currentTab !== 'Liquidation History'}
        cancelAllOrder={() => cancelAllOrder(deepBookOpenOrders, effectiveOrderType)}
        sideType={sideType}
        setSideType={setSideType}
        instrumentType={instrumentType}
        setInstrumentType={setInstrumentType}
        statusType={statusType}
        setStatusType={setStatusType}
      />
      {/* {!isApp && renderTradeTableTab()} */}
      <HStack w="100%" justifyContent={isShowSpotOrMarginTab ? 'space-between' : 'flex-end'} mb={{ base: '-12px', lg: '0' }}>
        {isShowSpotOrMarginTab && (
          <HStack w="calc(100% - 24px)" h="38px" gap="24px" borderBottom={{ base: 'none', lg: '1px solid #2A3238' }} py="12px" mx="12px">
            {orderTabList.map(item => (
              <Text
                as="div"
                key={item.label}
                fontSize="14px"
                fontWeight="500"
                color={item.active ? 'primary' : 'text_paragraph'}
                onClick={item.onClick}
                _hover={{ cursor: 'pointer', color: 'primary' }}
              >
                {item.label}

                {/* 这里显示当前状态下（根据 currentTab 和 item.label）的订单数量 */}
                {(() => {
                  const isSpot = item.label === 'Spot'
                  let currentNum = 0
                  if (currentTab === 'Open Orders') {
                    currentNum = isSpot ? showOpenOrdersNumSpot : showOpenOrdersNumMargin
                  } else if (currentTab === 'Order Histroy') {
                    currentNum = isSpot ? showDeepBookOrderHistoryNumSpot : showDeepBookOrderHistoryNumMargin
                  } else if (currentTab === 'Trade History') {
                    currentNum = isSpot ? showDeepBookTradeHistoryNumSpot : showDeepBookTradeHistoryNumMargin
                  }
                  return currentNum > 0 ? (
                    <Text
                      as="span"
                      fontSize="12px"
                      color="primary"
                      ml="8px"
                      bg="bg_secondary"
                      p="2px 6px"
                      borderRadius="8px"
                      border="1px solid"
                      borderColor="border"
                    >
                      {currentNum}
                    </Text>
                  ) : null
                })()}
              </Text>
            ))}
          </HStack>
        )}
        {isApp && (
          <Box h="38px" display="flex" alignItems="center">
            <ActionContent
              isShowAllMarkets={currentTab !== 'Settled Balance' && currentTab !== 'Liquidation History'}
              isCheckedAllMarkets={isCheckedAllMarkets}
              setIsCheckedAllMarkets={setIsCheckedAllMarkets}
              isShowCancelAll={currentTab == 'Open Orders' && deepBookOpenOrders?.length > 0}
              cancelAllOrder={() => cancelAllOrder(deepBookOpenOrders, effectiveOrderType)}
              wrapStyle={{
                justifyContent: 'space-between',
                w: 'auto',
                pr: '12px'
                // pt: isShowSpotOrMarginTab,
              }}
            />
          </Box>
        )}
      </HStack>

      <VStack w="100%" h={{ lg: 'calc(100% - 44px - 48px)' }} gap={{ base: '0', lg: '8px' }}>
        {currentTab == 'Positions' && poolAddress && tradeTypeByPool[poolAddress] === 'Margin' && (
          <PositionsTableBlock sideType={sideType} setSideType={setSideType} instrumentType={instrumentType} setInstrumentType={setInstrumentType} />
        )}
        {currentTab == 'Open Orders' && (
          <OpenOrdersTableBlock
            cancelAllOrder={() => cancelAllOrder(deepBookOpenOrders, effectiveOrderType)}
            isShowCancelAll={currentTab == 'Open Orders' && deepBookOpenOrders?.length > 0}
            sideType={sideType}
            setSideType={setSideType}
            instrumentType={instrumentType}
            setInstrumentType={setInstrumentType}
            orderType={effectiveOrderType}
          />
        )}
        {currentTab == 'Trade History' && <TradeHistoryTableBlock sideType={sideType} setSideType={setSideType} orderType={effectiveOrderType} />}
        {currentTab == 'Order Histroy' && (
          <OrderHistoryTableBlock
            orderType={effectiveOrderType}
            sideType={sideType}
            setSideType={setSideType}
            statusType={statusType}
            setStatusType={setStatusType}
          />
        )}
        {currentTab == 'Liquidation History' && tradeTypeByPool[poolAddress] === 'Margin' && <LiquidationRecordTableBlock />}
      </VStack>
    </Block>
  )
}

export default TradeTableBlock
