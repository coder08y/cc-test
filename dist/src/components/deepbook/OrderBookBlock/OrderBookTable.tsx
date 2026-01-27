import useDeepBookStore from '@/store/deepbook'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { abbreviateTokenName, formatNumber, formatNumberWithKMB } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// 常量定义
const ANIMATION_DURATION = 1000
const ROW_HEIGHT = 20
const ROW_SPACING = 4

const OrderBookTable = ({
  orderBookTab,
  tickSize,
  defaultVisibleRows,
  visibleRows
}: { orderBookTab: string; tickSize: string; defaultVisibleRows: number; visibleRows: number }) => {
  const { deepBookAskList, deepBookBidList, deepBookOrderBookLoading, currentDeepBookPool, setPlaceOrderPrice, orderType, deepbookPrice, lockPrice } =
    useDeepBookStore()
  const [changedOrders, setChangedOrders] = useState<Set<string>>(new Set())
  const [hoveredRow, setHoveredRow] = useState<{ isAsk: boolean; index: number } | null>(null)
  const { isApp } = useWindowWidth()

  // 使用 useRef 来跟踪上一次的数据，避免重复检测
  const prevDataRef = useRef<{ asks: any[]; bids: any[] }>({ asks: [], bids: [] })
  const isFirstRenderRef = useRef(true)

  // 添加滚动容器的 ref
  const askScrollRef = useRef<HTMLDivElement>(null)
  const bidScrollRef = useRef<HTMLDivElement>(null)
  const askScrollRefMobile = useRef<HTMLDivElement>(null)
  const bidScrollRefMobile = useRef<HTMLDivElement>(null)

  // 创建订单数据哈希
  const createDataHash = useCallback((order: any) => {
    return `${order.price}-${order.total}-${order.quantity}`
  }, [])

  // 直接使用真实数据
  const orderBookData = useMemo(
    () => ({
      asks: deepBookAskList.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)).reverse() || [],
      bids: deepBookBidList.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)) || []
    }),
    [deepBookAskList, deepBookBidList]
  )

  // 优化数据变化检测 - 使用数据哈希映射
  useEffect(() => {
    if (orderBookData.asks.length === 0 && orderBookData.bids.length === 0) {
      return
    }
    if (isFirstRenderRef.current) {
      // 首次渲染，不触发动画
      prevDataRef.current = orderBookData
      isFirstRenderRef.current = false
      return
    }

    const changed = new Set<string>()

    // 创建哈希映射对象
    const createHashMap = (orders: any[]) => {
      const hashMap = new Map<string, any>()
      orders.forEach(order => {
        const hash = createDataHash(order)
        hashMap.set(hash, order)
      })
      return hashMap
    }

    // 创建当前和上一次的哈希映射
    const currentAsksHashMap = createHashMap(orderBookData.asks)
    const currentBidsHashMap = createHashMap(orderBookData.bids)
    const prevAsksHashMap = createHashMap(prevDataRef.current.asks)
    const prevBidsHashMap = createHashMap(prevDataRef.current.bids)

    // 检查 asks 变化和新增
    currentAsksHashMap.forEach((currentAsk, hash) => {
      const prevAsk = prevAsksHashMap.get(hash)
      if (!prevAsk) {
        // 数据不存在，说明是新增的
        changed.add(`ask-${hash}`)
      }
    })

    // 检查 bids 变化和新增
    currentBidsHashMap.forEach((currentBid, hash) => {
      const prevBid = prevBidsHashMap.get(hash)
      if (!prevBid) {
        // 数据不存在，说明是新增的
        changed.add(`bid-${hash}`)
      }
    })

    if (changed.size > 0) {
      setChangedOrders(changed)
      const timer = setTimeout(() => {
        setChangedOrders(new Set())
      }, ANIMATION_DURATION)
      prevDataRef.current = orderBookData
      return () => clearTimeout(timer)
    }
  }, [orderBookData, createDataHash])

  useEffect(() => {
    if (currentDeepBookPool?.address) {
      prevDataRef.current = { asks: [], bids: [] }
      isFirstRenderRef.current = true
    }
  }, [currentDeepBookPool?.address])

  // 优化表格内容渲染 - 分离依赖项
  const asksToShow = useMemo(() => orderBookData.asks.slice(0, defaultVisibleRows).reverse(), [orderBookData.asks, defaultVisibleRows])
  const bidsToShow = useMemo(() => orderBookData.bids.slice(0, defaultVisibleRows), [orderBookData.bids, defaultVisibleRows])

  // 卖盘滚动到底部（显示最优价格）
  useEffect(() => {
    if (askScrollRef.current) {
      askScrollRef.current.scrollTop = askScrollRef.current.scrollHeight
    }
    if (askScrollRefMobile.current) {
      askScrollRefMobile.current.scrollTop = askScrollRefMobile.current.scrollHeight
    }
  }, [asksToShow.length, orderBookTab])

  // 买盘保持在顶部（默认位置）
  useEffect(() => {
    if (bidScrollRef.current) {
      bidScrollRef.current.scrollTop = 0
    }
    if (bidScrollRefMobile.current) {
      bidScrollRefMobile.current.scrollTop = 0
    }
  }, [bidsToShow.length, orderBookTab])

  // 计算最大总量用于深度显示
  const maxTotal = useMemo(() => {
    const askMax = asksToShow.length > 0 ? Math.max(...asksToShow.map(ask => ask.total || 0)) : 0
    const bidMax = bidsToShow.length > 0 ? Math.max(...bidsToShow.map(bid => bid.total || 0)) : 0
    return Math.max(askMax, bidMax)
  }, [asksToShow, bidsToShow])

  // 计算深度百分比
  const calculateDepthPercentage = useCallback((total: number, maxTotal: number) => {
    if (maxTotal === 0) return 0
    return (total / maxTotal) * 100
  }, [])

  // 计算聚合统计数据 - 从最优价格到当前价格的累计深度
  const calculateAggregatedStats = useCallback((currentIndex: number, isAsk: boolean, orders: any[]) => {
    if (!orders || orders.length === 0) {
      return { avgPrice: 0, sumQuote: 0, sumBase: 0 }
    }

    let totalQuantity = 0 // Sum(Base) - 累计数量
    let totalValue = 0 // Sum(price * quantity) = Sum(Quote) - 累计总价值

    if (isAsk) {
      // 卖单累计逻辑：
      // asksToShow 排列：[索引0=最高价(顶部), ..., 索引n=最低价(底部)]
      // 应该从最低价（最优价）累计到当前hover的价格
      // 即：从数组末尾向前累计到 currentIndex
      for (let i = orders.length - 1; i >= currentIndex; i--) {
        const order = orders[i]
        const price = parseFloat(order.price)
        const quantity = parseFloat(order.quantity)

        totalQuantity += quantity
        totalValue += price * quantity
      }
    } else {
      // 买单累计逻辑：
      // bidsToShow 排列：[索引0=最高价(顶部), ..., 索引n=最低价(底部)]
      // 应该从最高价（最优价）累计到当前hover的价格
      // 即：从索引0向后累计到 currentIndex
      for (let i = 0; i <= currentIndex; i++) {
        const order = orders[i]
        const price = parseFloat(order.price)
        const quantity = parseFloat(order.quantity)

        totalQuantity += quantity
        totalValue += price * quantity
      }
    }

    // 平均价格 = 总价值 / 总数量
    const avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0

    return {
      avgPrice,
      sumQuote: totalValue,
      sumBase: totalQuantity
    }
  }, [])

  // 计算 Spread
  const spread = useMemo(() => {
    if (deepbookPrice && deepbookPrice?.price && deepbookPrice?.poolId == currentDeepBookPool?.address) {
      return deepbookPrice?.price
    }
    return ''
  }, [currentDeepBookPool?.address, deepbookPrice])

  // 渲染空状态
  const renderEmptyState = useCallback((text: string) => {
    return (
      <Box w="100%" h="100%" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="12px" color="text_paragraph" fontWeight="400">
          {text}
        </Text>
      </Box>
    )
  }, [])

  // 判断当前行是否应该被高亮（在累计范围内）
  const isRowHighlighted = useCallback((isAsk: boolean, index: number, hoveredRow: { isAsk: boolean; index: number } | null) => {
    if (!hoveredRow) return false
    if (hoveredRow.isAsk !== isAsk) return false

    if (isAsk) {
      // 卖单：从数组末尾（最低价）向前累计到 hoveredRow.index
      // 需要高亮从 index 到数组末尾的所有行
      return index >= hoveredRow.index
    } else {
      // 买单：从索引0（最高价）向后累计到 hoveredRow.index
      // 需要高亮从索引0到 index 的所有行
      return index <= hoveredRow.index
    }
  }, [])

  // 判断是否是边界行（需要显示虚线）
  const isBoundaryRow = useCallback((isAsk: boolean, index: number, hoveredRow: { isAsk: boolean; index: number } | null) => {
    if (!hoveredRow) return false
    if (hoveredRow.isAsk !== isAsk) return false
    return index === hoveredRow.index
  }, [])

  // 优化 renderOrderRow - 使用哈希作为标识符
  const renderOrderRow = useCallback(
    (order: any, isAsk: boolean, index: number, isApp: boolean) => {
      const depthPercentage = calculateDepthPercentage(order.total || 0, maxTotal)
      const depthColor = isAsk ? 'rgba(255, 80, 116, 0.1)' : 'rgba(103, 255, 216, 0.1)'
      const priceColor = isAsk ? '#FF5074' : '#67FFD8'

      const dataHash = createDataHash(order)
      const orderKey = `${isAsk ? 'ask' : 'bid'}-${dataHash}`
      const isChanged = changedOrders.has(orderKey)
      const isHighlighted = isRowHighlighted(isAsk, index, hoveredRow)
      const isBoundary = isBoundaryRow(isAsk, index, hoveredRow)

      const rowContent = (
        <HStack
          as="div"
          role="group"
          w="100%"
          h="20px"
          overflow="hidden"
          cursor="pointer"
          position="relative"
          spacing={0}
          justify="space-between"
          // p="0 1px"
          transition="all 0.3s ease-in-out"
          // _hover={{ bg: 'rgba(118,200,255,0.05)' }}
          onClick={() => {
            // 支持 spot 和 margin pool
            if (orderType == 'Limit') {
              setPlaceOrderPrice(order.price)
              lockPrice() // 点击订单簿价格时锁定价格
            }
          }}
          onMouseEnter={() => setHoveredRow({ isAsk, index })}
          onMouseLeave={() => setHoveredRow(null)}
          flexShrink={0}
        >
          {/* 深度背景 */}
          <Box
            position="absolute"
            top="0"
            bottom="0"
            h="20px"
            bg={depthColor}
            width={`calc(${depthPercentage}% - 2px)`}
            zIndex="0"
            transition="all 0.3s ease-in-out"
            _groupHover={{
              bg: isAsk ? 'rgba(255, 80, 116, 0.2)' : 'rgba(103, 255, 216, 0.2)'
            }}
            // H5端买单区域深度在右边，卖单区域深度在左边
            left={isApp && !isAsk ? 'auto' : '0px'}
            right={isApp && !isAsk ? '0px' : 'auto'}
          />

          {/* 变化时显示插入效果 */}
          {isChanged && (
            <Box
              position="absolute"
              top="0"
              bottom="0"
              h="20px"
              bg={isAsk ? 'rgba(255, 80, 116, 0.2)' : 'rgba(103, 255, 216, 0.2)'}
              zIndex="0"
              animation="slideIn 0.5s ease-out"
              // H5端买单区域深度在右边，卖单区域深度在左边
              left={isApp && !isAsk ? 'auto' : '0px'}
              right={isApp && !isAsk ? '0px' : 'auto'}
            />
          )}

          {/* Hover 时的高亮蒙层 */}
          {isHighlighted && (
            <Box
              position="absolute"
              top="0"
              bottom="0"
              left="0"
              right="0"
              h="20px"
              bg="rgba(144,156,164,0.1)"
              zIndex="0"
              transition="all 0.2s ease-in-out"
              mr="0"
            />
          )}

          {/* 在app版本中调整顺序：Size在前，Price在后 */}
          {isApp && !isAsk ? (
            <>
              {/* Size */}
              <Text
                position="relative"
                zIndex="1"
                fontSize="12px"
                color="text_caption"
                textAlign="left"
                flex="1"
                // pl={isAsk ? '0px' : '16px'}
                transition="all 0.3s ease-in-out"
              >
                {formatNumber(order.quantity || 0, 2)}
              </Text>

              {/* Price */}
              <Text
                position="relative"
                zIndex="1"
                fontSize="12px"
                fontWeight="500"
                color={priceColor}
                textAlign="right"
                flex="1"
                pr={isAsk ? '16px' : '0px'}
                transition="all 0.3s ease-in-out"
                // _groupHover={{
                //   textDecoration: orderType == 'Limit' ? 'underline' : 'none'
                // }}
              >
                {formatNumber(order.price || 0, 6)}
              </Text>
            </>
          ) : (
            <>
              {/* Price */}
              <Text
                position="relative"
                zIndex="1"
                // pl={{ base: '0px', lg: '16px' }}
                fontSize="12px"
                fontWeight="500"
                color={priceColor}
                textAlign="left"
                flex="1"
                transition="all 0.3s ease-in-out"
                // _groupHover={{
                //   textDecoration: orderType == 'Limit' ? 'underline' : 'none'
                // }}
              >
                {formatNumber(order.price || 0, 6)}
              </Text>

              {/* Size */}
              <Text
                position="relative"
                // pr={{ base: '16px', lg: '0px' }}
                zIndex="1"
                fontSize="12px"
                color="text_caption"
                textAlign="right"
                flex="1"
                transition="all 0.3s ease-in-out"
              >
                {formatNumber(order.quantity || 0, 2)}
              </Text>
              {/* Total */}
              {!isApp && (
                <Box zIndex="1" flex="1" display="flex" alignItems="center" justifyContent="flex-end">
                  {/* 虚线分割线 - 卖单在顶部，买单在底部 */}
                  {isBoundary && (
                    <Box
                      position="absolute"
                      left="0"
                      right="0"
                      top={isAsk ? '0' : 'auto'}
                      bottom={isAsk ? 'auto' : '0'}
                      h="1px"
                      borderTop={isAsk ? '1px dashed #909CA4' : 'none'}
                      borderBottom={isAsk ? 'none' : '1px dashed #909CA4'}
                      pointerEvents="none"
                    />
                  )}
                  <Text flex={1} fontSize="12px" color="text_caption" textAlign="right" transition="all 0.3s ease-in-out">
                    {formatNumberWithKMB(order.total || 0, 4)}
                  </Text>
                </Box>
              )}
            </>
          )}
        </HStack>
      )

      // 实时计算 Tooltip 内容 - 显示深度累计信息
      const getTooltipContent = () => {
        const orders = isAsk ? asksToShow : bidsToShow
        // 根据当前 order 找到在数组中的索引
        const currentIndex = orders.findIndex(o => o.price === order.price && o.quantity === order.quantity)

        if (currentIndex === -1) {
          return null
        }

        // 计算从最优价格到当前价格的累计统计
        const stats = calculateAggregatedStats(currentIndex, isAsk, orders)

        return (
          <VStack spacing="4px" align="flex-start" lineHeight="16px">
            {[
              {
                label: 'Avg. Price',
                value: formatNumber(stats.avgPrice, 6) // 平均成交价
              },
              {
                label: `Sum (${abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol) || 'Base'})`,
                value: formatNumber(stats.sumBase, 2) // 累计数量
              },
              {
                label: `Sum (${abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol) || 'Quote'})`,
                value: formatNumber(stats.sumQuote, 2) // 累计总价值
              }
            ].map(item => (
              <HStack w="100%" gap="32px" justify="space-between" key={item.label}>
                <Text fontSize="12px">{item.label}</Text>
                <Text fontSize="12px" color="text_caption">
                  {item.value}
                </Text>
              </HStack>
            ))}
          </VStack>
        )
      }

      return (
        <Box key={`${orderKey}-${order.size}-${order.total}`} w="100%">
          <CetusTooltip
            tooltip={getTooltipContent()}
            placement="left"
            maxW="280px"
            bodyPadding="8px"
            gutter={8}
            triggerStyle={{ w: '100%', h: '20px', display: 'flex', overflow: 'hidden' }}
          >
            {rowContent}
          </CetusTooltip>
        </Box>
      )
    },
    [
      calculateDepthPercentage,
      maxTotal,
      changedOrders,
      orderType,
      setPlaceOrderPrice,
      asksToShow,
      bidsToShow,
      calculateAggregatedStats,
      currentDeepBookPool,
      createDataHash,
      isApp,
      hoveredRow,
      isRowHighlighted,
      isBoundaryRow
    ]
  )

  // 渲染 Spread 组件
  const renderSpread = useCallback(
    () => (
      <HStack
        w="100%"
        h="30px"
        flexShrink={0}
        justify="flex-start"
        mt="8px"
        p="8px 16px 8px 0"
        gap="4px"
        // bg="card_bg"
        // m={orderBookTab == 'all' ? '4px 0' : orderBookTab == 'bid' ? '4px 0 0 0' : '0'}
        // gap="4px"
      >
        {!currentDeepBookPool?.price ? (
          <Skeleton isLoaded={!currentDeepBookPool} w="50%" h="26px" />
        ) : (
          <>
            <Text fontSize="18px" fontWeight="500" color={currentDeepBookPool?.priceChange?.includes('-') ? 'primary_red' : 'primary_green'}>
              {formatNumber(spread, 6)}
            </Text>
            <Icon
              sx={{ cursor: 'unset' }}
              xlinkHref="#icon-icon_arrow"
              boxW="12px"
              boxH="12px"
              svgHover={currentDeepBookPool?.priceChange?.includes('-') ? 'primary_red' : 'primary_green'}
              svgFill={currentDeepBookPool?.priceChange?.includes('-') ? 'primary_red' : 'primary_green'}
              transform={currentDeepBookPool?.priceChange?.includes('-') ? 'rotate(0deg)' : 'rotate(180deg)'}
            />
          </>
        )}
      </HStack>
    ),
    [spread, currentDeepBookPool]
  )

  const renderTableContent = useMemo(() => {
    if (orderBookTab === 'all') {
      // H5端并列显示买单卖单
      if (isApp) {
        return (
          <HStack w="100%" maxH="300px" spacing="0" h="100%" justify="space-between" gap="8px">
            {/* 买单区域 - 添加滚动容器 */}
            <Box ref={bidScrollRefMobile} w="50%" h="100%" overflowY="auto" className="orderbook-scroll-container">
              <VStack w="100%" spacing="0px" height="100%">
                {deepBookOrderBookLoading ? (
                  Array.from({ length: visibleRows }, (_, index) => <Skeleton key={`empty-bid-${index}`} w="calc(100%)" h="20px" mb="1px" />)
                ) : bidsToShow.length === 0 ? (
                  <Box w="100%" h="100%">
                    {renderEmptyState('No Bid')}
                  </Box>
                ) : (
                  bidsToShow.map((bid, index) => renderOrderRow(bid, false, index, isApp))
                )}
              </VStack>
            </Box>

            {/* 卖单区域 - 添加滚动容器 */}
            <Box ref={askScrollRefMobile} w="50%" h="100%" overflowY="auto" className="orderbook-scroll-container">
              <VStack w="100%" spacing="0px" h="100%">
                {deepBookOrderBookLoading ? (
                  Array.from({ length: visibleRows }, (_, index) => <Skeleton key={`empty-ask-${index}`} w="calc(100%)" h="20px" mb="1px" />)
                ) : asksToShow.length === 0 ? (
                  <Box w="100%" h="100%">
                    {renderEmptyState('No Ask')}
                  </Box>
                ) : (
                  asksToShow.map((ask, index) => renderOrderRow(ask, true, index, isApp))
                )}
              </VStack>
            </Box>
          </HStack>
        )
      }

      // PC端保持原有布局
      return (
        <VStack w="100%" spacing="0px" h="100%" pb="8px">
          {/* Asks (卖单) - 添加滚动容器 */}
          <Box ref={askScrollRef} w="100%" flex="1" h="100%" minH="0" className="orderbook-scroll-container" overflowY="auto">
            <VStack
              w="100%"
              spacing="0px"
              height={visibleRows < asksToShow.length ? 'unset' : `100%`}
              justifyContent={visibleRows < asksToShow.length ? 'unset' : 'flex-end'}
            >
              {deepBookOrderBookLoading ? (
                Array.from({ length: visibleRows }, (_, index) => <Skeleton key={`empty-ask-${index}`} w="calc(100%)" h="18.8px" mb="1px" />)
              ) : asksToShow.length === 0 ? (
                <Box w="100%" h="100%" display={'flex'} alignItems={'center'}>
                  {renderEmptyState('No Ask')}
                </Box>
              ) : (
                asksToShow.map((ask, index) => renderOrderRow(ask, true, index, isApp))
              )}
            </VStack>
          </Box>

          {/* Spread */}
          {renderSpread()}

          {/* Bids (买单) - 添加滚动容器 */}
          <Box ref={bidScrollRef} w="100%" flex="1" overflowY="auto" minH="0" className="orderbook-scroll-container">
            <VStack w="100%" spacing="0px" height="100%">
              {deepBookOrderBookLoading ? (
                Array.from({ length: visibleRows }, (_, index) => <Skeleton key={`empty-bid-${index}`} w="calc(100%)" h="18.8px" mb="1px" />)
              ) : bidsToShow.length === 0 ? (
                <Box w="100%" h="100%">
                  {renderEmptyState('No Bid')}
                </Box>
              ) : (
                bidsToShow.map((bid, index) => renderOrderRow(bid, false, index, isApp))
              )}
            </VStack>
          </Box>
        </VStack>
      )
    } else if (orderBookTab === 'bid') {
      return (
        <VStack w="100%" spacing="0px" h="100%">
          {/* Spread */}
          {renderSpread()}

          {/* 买单显示更多数据 - 添加滚动容器 */}
          <Box ref={bidScrollRef} w="100%" flex="1" overflowY="auto" minH="0" className="orderbook-scroll-container">
            <VStack w="100%" spacing="0px" h="100%">
              {deepBookOrderBookLoading ? (
                Array.from({ length: visibleRows }, (_, index) => <Skeleton key={`empty-bid-${index}`} w="calc(100%)" h="18.8px" mb="1px" />)
              ) : bidsToShow.length === 0 ? (
                <Box w="100%" h="100%">
                  {renderEmptyState('No Bid')}
                </Box>
              ) : (
                bidsToShow.map((bid, index) => renderOrderRow(bid, false, index, isApp))
              )}
            </VStack>
          </Box>
        </VStack>
      )
    } else if (orderBookTab === 'ask') {
      return (
        <VStack w="100%" spacing="0px" h="100%">
          {/* 卖单显示更多数据 - 添加滚动容器 */}
          <Box ref={askScrollRef} w="100%" flex="1" overflowY="auto" minH="0" className="orderbook-scroll-container">
            <VStack w="100%" spacing="0px" h="100%">
              {deepBookOrderBookLoading ? (
                Array.from({ length: visibleRows }, (_, index) => <Skeleton key={`empty-ask-${index}`} w="calc(100%)" h="18.8px" mb="1px" />)
              ) : asksToShow.length === 0 ? (
                <Box w="100%" h="100%">
                  {renderEmptyState('No Ask')}
                </Box>
              ) : (
                asksToShow.map((ask, index) => renderOrderRow(ask, true, index, isApp))
              )}
            </VStack>
          </Box>

          {/* Spread */}
          {renderSpread()}
        </VStack>
      )
    }
  }, [
    orderBookTab,
    asksToShow,
    bidsToShow,
    defaultVisibleRows,
    visibleRows,
    renderOrderRow,
    renderSpread,
    deepBookOrderBookLoading,
    isApp,
    renderEmptyState
  ])

  return (
    <Box w="100%" h="100%" overflow="hidden" display="flex" flexDirection="column">
      {/* CSS Animations - 只保留插入效果 */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(-10px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      {/* Header */}
      {!isApp && (
        // 12px 4px
        <HStack w="100%" spacing={0} justify="space-between" p="4px 0px" bg="bg_secondary" position="relative" zIndex="99" flexShrink={0}>
          <Text flex={1} fontSize="12px" w="100%" color="primary_gray" fontWeight="500" whiteSpace="nowrap">
            Price ({abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol) || '--'})
          </Text>
          <Text flex={1} fontSize="12px" w="100%" color="primary_gray" fontWeight="500" textAlign="right" whiteSpace="nowrap">
            Amt. ({abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol) || '--'})
          </Text>
          <Text flex={1} fontSize="12px" textAlign="right" w="100%" color="primary_gray" fontWeight="500" whiteSpace="nowrap">
            Total ({abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol) || '--'})
          </Text>
        </HStack>
      )}

      {isApp && (
        <HStack w="100%" spacing={0} gap="8px" justify="space-between" p="10px 0px" position="relative" zIndex="99" flexShrink={0}>
          <HStack w="50%" justifyContent="space-between">
            <Text fontSize="12px" w="100%" color="primary_gray" fontWeight="500">
              Amt. ({abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol) || '--'})
            </Text>
            <Text fontSize="12px" w="100%" color="primary_gray" fontWeight="500" textAlign="right">
              Price ({abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol) || '--'})
            </Text>
          </HStack>
          <HStack w="50%" justifyContent="space-between">
            <Text fontSize="12px" w="100%" color="primary_gray" fontWeight="500">
              Price ({abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol) || '--'})
            </Text>
            <Text fontSize="12px" textAlign="right" w="100%" color="primary_gray" fontWeight="500">
              Amt. ({abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol) || '--'})
            </Text>
          </HStack>
        </HStack>
      )}

      {/* Content */}
      <Box w="100%" flex="1" minH="0">
        {renderTableContent}
      </Box>
    </Box>
  )
}

export default OrderBookTable
