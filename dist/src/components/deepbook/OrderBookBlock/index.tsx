import useGetDeepBookOrderBook, { OrderType } from '@/hooks/deepbook/useGetDeepBookOrderBook'
import useDeepBookStore from '@/store/deepbook'
import { SelectTab } from '@cetus/design'
import { useDebounceFunction, useInterval } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d } from '@cetus/utils'
import { Box, HStack, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import OrderBookTab from './OrderBookTab'
import OrderBookTable from './OrderBookTable'
import RecentTradesTable from './RecentTradesTable'
import TickSizeSelect from './TickSizeSelect'

export default function OrderBookBlock({ isOpenCard, ct = 'Orderbook' }: { isOpenCard?: boolean; ct?: 'Orderbook' | 'RecentTrades' }) {
  const { currentDeepBookPool } = useDeepBookStore()

  const [orderBookTab, setOrderBookTab] = useState<OrderType>('all')
  const tickSizeList = useMemo(() => {
    if (currentDeepBookPool?.address) {
      const tickSize = currentDeepBookPool.tickSize
      return [d(tickSize).toString(), d(tickSize).mul(10).toString(), d(tickSize).mul(100).toString(), d(tickSize).mul(1000).toString()]
    } else {
      return [d(0.0001).toString(), d(0.001).toString(), d(0.01).toString()]
    }
  }, [currentDeepBookPool?.address])
  const [defaultTickSize, setDefaultTickSize] = useState('0.0001')
  useEffect(() => {
    if (currentDeepBookPool?.address) {
      setDefaultTickSize(currentDeepBookPool.tickSize)
    }
  }, [currentDeepBookPool?.address])
  const orderBookBlockRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  // 使用 useRef 避免重复创建防抖函数
  const lastHeightRef = useRef(0)

  // 6舍7入
  function roundWith67Rule(num: number): number {
    const integer = Math.floor(num)
    const decimal = (num - integer) * 10

    if (decimal >= 7) {
      return integer + 1
    } else if (decimal >= 6) {
      return integer // 舍去
    } else {
      return Math.round(num)
    }
  }

  const { isApp } = useWindowWidth()

  // // 固定渲染100条数据，支持滚动查看
  // const visibleRows = useMemo(() => {
  //   // 固定渲染100条数据
  //   return 100
  // }, [])

  // 创建防抖函数 - 使用 useCallback 优化
  const debouncedSetHeight = useCallback(
    useDebounceFunction((height: number) => {
      // console.log('🚀🚀🚀 ~ index.tsx:76 ~ OrderBookBlock ~ height:', height)
      // 添加阈值检查，避免微小变化触发更新
      const heightDiff = Math.abs(height - lastHeightRef.current)
      if (heightDiff > 2) {
        // 只有高度变化超过2px才更新
        setContainerHeight(height)
        lastHeightRef.current = height
      }
    }, 300),
    []
  )

  // 监听容器高度变化
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = Math.round(entry.contentRect.height)
        debouncedSetHeight(height)
      }
    })

    if (orderBookBlockRef.current) {
      resizeObserver.observe(orderBookBlockRef.current)
      const initialHeight = Math.round(orderBookBlockRef.current.clientHeight)
      // console.log('🚀🚀🚀 ~ index.tsx:100 ~ OrderBookBlock ~ initialHeight:', initialHeight)
      setContainerHeight(initialHeight)
      lastHeightRef.current = initialHeight
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [debouncedSetHeight, isOpenCard])

  const { getOrderBook } = useGetDeepBookOrderBook()

  // console.log('🚀🚀🚀 ~ index.tsx:110 ~ OrderBookBlock ~ currentDeepBookPool:', currentDeepBookPool)

  const [refreshCount, setRefreshCount] = useState<number>(0)
  // testnet暂时注释
  useInterval({
    interval: 300,
    callback: () => {
      setRefreshCount(refreshCount + 1)
      if (refreshCount >= 10) {
        setRefreshCount(0)
        if (currentDeepBookPool?.address) {
          getOrderBook(orderBookTab, defaultTickSize, false)
        }
      }
    }
  })

  const tabs = [
    {
      label: 'Order Book',
      key: 'Orderbook'
    },
    {
      label: 'Recent Trades',
      key: 'RecentTrades'
    }
  ]

  const [currentTab, setCurrentTab] = useState<string>(ct as string)

  // 计算可见行数 如果可见行数大于已有条数 则无需滚动条
  const visibleRows = useMemo(() => {
    if (!containerHeight) return 6 // 默认值

    // 计算可用高度 (减去header和spread的高度)
    const headerHeight = isApp ? 22 : 32 // 头部高度
    const spreadHeight = isApp ? 0 : 30 // spread区域高度

    const availableHeight = containerHeight - headerHeight - spreadHeight

    // 计算每边可以显示的行数 (每行高度20px + 间距4px)
    const rowHeight = 20 // 20px高度
    const rowsPerSide = Math.max(5, roundWith67Rule(availableHeight / (2 * rowHeight))) // 最少显示1行

    return orderBookTab !== 'all' ? rowsPerSide * 2 : isApp ? rowsPerSide * 2 : rowsPerSide
  }, [containerHeight, orderBookTab, isApp])

  return (
    <VStack bg={'bg_secondary'} w="100%" h="100%" borderRadius="8px" gap="0px">
      {!isApp && (
        <VStack w="100%" justifyContent="space-between" flexShrink={0}>
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
                backgroundColor: 'border'
              }
            }}
            w="100%"
            px={'12px'}
          >
            <SelectTab
              type="borderTab"
              wrapStyle={{
                w: { base: '100%', lg: 'unset' },
                h: '38px',
                bg: 'none',
                border: 'none'
              }}
              itemStyle={{
                marginRight: '24px',
                fontSize: '14px',
                position: 'relative',
                fontWeight: '500',
                // flex: isApp ? '1' : 'auto',
                sx: {
                  '&[data-active=true]': {
                    color: 'primary'
                  }
                }
              }}
              tabList={tabs as any}
              currentTab={currentTab}
              activeColor="primary"
              handleChangeTab={item => {
                setCurrentTab(item.key as string)
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
          </Box>
        </VStack>
      )}

      {/* Orderbook Tab Content */}
      <VStack w="100%" flex="1" minH="0" display={currentTab === 'Orderbook' ? 'flex' : 'none'}>
        <HStack display="flex" alignItems="center" mt={'12px'} px={'12px'} w="100%" flexShrink={0}>
          {!isApp && (
            <HStack flex={1}>
              <OrderBookTab orderBookTab={orderBookTab} setOrderBookTab={setOrderBookTab} />
            </HStack>
          )}
          <TickSizeSelect
            orderBookTab={orderBookTab}
            tickSizeList={tickSizeList}
            defaultTickSize={defaultTickSize}
            setDefaultTickSize={setDefaultTickSize}
          />
        </HStack>
        {/* OrderBook Table */}
        <Box w="100%" flex="1" minH="0" px={'12px'} pb="4px" ref={orderBookBlockRef}>
          <OrderBookTable orderBookTab={orderBookTab} tickSize={defaultTickSize} defaultVisibleRows={100} visibleRows={visibleRows} />
        </Box>
      </VStack>

      {/* Recent Trades Tab Content */}
      <Box w="100%" flex="1" minH="0" pb="4px" display={currentTab === 'RecentTrades' ? 'block' : 'none'}>
        <RecentTradesTable currentDeepBookPool={currentDeepBookPool} refreshTrigger={refreshCount} currentTab={currentTab} />
      </Box>
    </VStack>
  )
}
