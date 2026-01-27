// components/DeepbookTradingViewChart.tsx
import useDeepBookOrderActions from '@/hooks/deepbook/useDeepBookOrderActions'
import useGetDeepbookKlineData from '@/hooks/deepbook/useGetDeepbookKline'
import useDeepBookStore from '@/store/deepbook'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, HStack, VStack } from '@chakra-ui/react'
import { CandlestickData, CandlestickSeries, ColorType, IChartApi, ISeriesApi, LineSeries, UTCTimestamp, createChart } from 'lightweight-charts'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLightweightChartOrderMarkers } from './useLightweightChartOrderMarkers'

interface TradingViewChartProps {
  poolId: string
  poolPriceUnit: string
  onChangePrice: (data: { poolId: string; price: string }) => void
  onChartReady?: () => void
}

// 时间间隔选项
type Resolution = '1' | '10' | '15' | '30' | '60' | '1W'
type ChartType = 'candlestick' | 'line'

const RESOLUTION_OPTIONS: { value: Resolution; label: string }[] = [
  { value: '1', label: '1m' },
  { value: '10', label: '10m' },
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '60', label: '1h' },
  { value: '1W', label: '1W' }
]

const DeepbookTradingViewChart: React.FC<TradingViewChartProps> = ({ poolId, onChartReady, poolPriceUnit, onChangePrice }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null)
  const isMounted = useRef<boolean>(false)
  const [, setIsInitialized] = useState(false)
  const [currentPoolId, setCurrentPoolId] = useState('')
  const initializedPoolRef = useRef<string>('')
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // 工具栏状态
  const [resolution, setResolution] = useState<Resolution>('15')
  const [chartType, setChartType] = useState<ChartType>('candlestick')

  const { getDeepbookHistoricalData, subscribeKlineData, disconnectDeepbookWs } = useGetDeepbookKlineData()
  const { deepBookOpenOrders, orderTab } = useDeepBookStore()
  const { cancelOrder } = useDeepBookOrderActions()
  const { isApp } = useWindowWidth()

  // 使用 ref 存储函数引用，避免作为依赖项导致重复渲染
  const getDeepbookHistoricalDataRef = useRef(getDeepbookHistoricalData)
  const subscribeKlineDataRef = useRef(subscribeKlineData)
  const onChangePriceRef = useRef(onChangePrice)
  const disconnectDeepbookWsRef = useRef(disconnectDeepbookWs)

  // 更新 ref 的值
  useEffect(() => {
    getDeepbookHistoricalDataRef.current = getDeepbookHistoricalData
    subscribeKlineDataRef.current = subscribeKlineData
    onChangePriceRef.current = onChangePrice
    disconnectDeepbookWsRef.current = disconnectDeepbookWs
  }, [getDeepbookHistoricalData, subscribeKlineData, onChangePrice, disconnectDeepbookWs])

  // 转换订单数据为 marker
  const orderMarkers = useMemo(() => {
    const actualPoolAddress = poolId.includes('::') ? poolId.split('::')[1] : poolId
    return deepBookOpenOrders
      .filter((order: any) => order.address === actualPoolAddress && order.baseAssets && order.quoteAssets)
      .map((order: any) => {
        const isMarginOrder = order.side === 'Long' || order.side === 'Short'
        let side: 'Buy' | 'Sell' | 'Long' | 'Short' = order.side as 'Buy' | 'Sell' | 'Long' | 'Short'

        return {
          orderId: order.orderId,
          side,
          price: Number(order.price),
          quantity: Number(order.originalQuantity),
          filledQuantity: Number(order.filledQuantity),
          symbol: order.baseAssets?.symbol || order.baseAsset || 'SUI',
          poolInfo: {
            address: order.address,
            baseAssets: order.baseAssets,
            quoteAssets: order.quoteAssets
          },
          order,
          orderType: isMarginOrder ? 'margin' : ('spot' as 'spot' | 'margin')
        }
      })
  }, [deepBookOpenOrders, poolId])

  useEffect(() => {
    isMounted.current = true
    return () => {
      disconnectDeepbookWsRef.current()
    }
  }, [])

  // 将 TradingView 的 bar 格式转换为 Lightweight Charts 格式
  const convertBarToCandlestick = (bar: any): CandlestickData | null => {
    try {
      // bar.time 已经是毫秒级时间戳，需要转换为秒级
      let timeValue: UTCTimestamp
      if (typeof bar.time === 'number') {
        // 如果是毫秒级时间戳（大于1000000000000），转换为秒级
        if (bar.time > 1000000000000) {
          timeValue = Math.floor(bar.time / 1000) as UTCTimestamp
        } else {
          // 如果已经是秒级，直接使用
          timeValue = bar.time as UTCTimestamp
        }
      } else {
        console.warn('Invalid time format:', bar.time)
        return null
      }

      const open = Number(bar.open)
      const high = Number(bar.high)
      const low = Number(bar.low)
      const close = Number(bar.close)

      // 验证数据有效性
      if (!timeValue || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
        console.warn('Invalid bar data:', bar)
        return null
      }

      return {
        time: timeValue,
        open,
        high,
        low,
        close
      }
    } catch (error) {
      console.error('Error converting bar to candlestick:', error, bar)
      return null
    }
  }

  // 将 bar 转换为折线图数据格式
  const convertBarToLine = (bar: any) => {
    try {
      let timeValue: UTCTimestamp
      if (typeof bar.time === 'number') {
        // 如果是毫秒级时间戳（大于1000000000000），转换为秒级
        if (bar.time > 1000000000000) {
          timeValue = Math.floor(bar.time / 1000) as UTCTimestamp
        } else {
          // 如果已经是秒级，直接使用
          timeValue = bar.time as UTCTimestamp
        }
      } else {
        console.warn('Invalid time format:', bar.time)
        return null
      }

      const value = Number(bar.close)
      if (!timeValue || isNaN(value)) {
        console.warn('Invalid bar data for line:', bar)
        return null
      }

      return {
        time: timeValue,
        value
      }
    } catch (error) {
      console.error('Error converting bar to line:', error, bar)
      return null
    }
  }

  // 切换时间间隔
  const handleResolutionChange = useCallback(
    (newResolution: Resolution) => {
      console.log('🚀 ~ DeepbookTradingViewChart ~ newResolution:', newResolution)
      if (newResolution === resolution) return
      setResolution(newResolution)
      initializedPoolRef.current = '' // 重置初始化状态，触发重新加载
    },
    [resolution]
  )

  // 切换图表类型
  const handleChartTypeChange = useCallback(
    (newType: ChartType) => {
      if (newType === chartType) return
      setChartType(newType)
      initializedPoolRef.current = '' // 重置初始化状态，触发重新加载
    },
    [chartType]
  )

  useEffect(() => {
    if (!chartContainerRef.current || !poolId || !poolPriceUnit) {
      console.log('Chart initialization skipped:', { hasContainer: !!chartContainerRef.current, poolId, poolPriceUnit })
      return
    }

    const poolKey = `${poolId}::${poolPriceUnit}::${resolution}::${chartType}`
    if (initializedPoolRef.current === poolKey && chartRef.current) {
      return
    }

    console.log('Initializing chart for:', poolKey)

    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      seriesRef.current = null
    }

    // 取消之前的订阅
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    setCurrentPoolId(poolId)
    initializedPoolRef.current = poolKey

    // 确保容器有尺寸
    const container = chartContainerRef.current!
    let containerWidth = container.clientWidth || container.offsetWidth
    let containerHeight = container.clientHeight || container.offsetHeight

    // 如果容器还没有尺寸，等待一下
    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('Chart container has zero size, waiting for resize...', {
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight
      })

      // 延迟初始化，等待容器有尺寸
      const timer = setTimeout(() => {
        containerWidth = container.clientWidth || container.offsetWidth || 800
        containerHeight = container.clientHeight || container.offsetHeight || 600

        if (containerWidth > 0 && containerHeight > 0 && initializedPoolRef.current !== poolKey) {
          // 重新触发初始化
          initializedPoolRef.current = ''
        }
      }, 200)
      return () => clearTimeout(timer)
    }

    // 确保有最小尺寸
    containerWidth = containerWidth || 800
    containerHeight = containerHeight || 600

    let resizeObserver: ResizeObserver | null = null

    try {
      // 创建图表
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: '#0F0F0F' },
          textColor: '#D9D9D9'
        },
        grid: {
          vertLines: { color: '#1A1A1A' },
          horzLines: { color: '#1A1A1A' }
        },
        width: containerWidth,
        height: containerHeight,
        timeScale: {
          timeVisible: true,
          secondsVisible: false
        },
        rightPriceScale: {
          borderColor: '#2A3238',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1
          }
        }
      })

      chartRef.current = chart
      console.log('Chart created successfully', { width: containerWidth, height: containerHeight })

      // 创建 K 线系列 - 使用正确的 API
      if (!CandlestickSeries) {
        throw new Error('CandlestickSeries is not imported correctly')
      }

      // 根据图表类型创建不同的系列
      let currentSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>

      if (chartType === 'candlestick') {
        console.log('Adding candlestick series...', { CandlestickSeries: typeof CandlestickSeries })
        currentSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#68FFD8',
          downColor: '#FF5073',
          borderVisible: false,
          wickUpColor: '#68FFD8',
          wickDownColor: '#FF5073',
          priceFormat: {
            type: 'price',
            precision: Number(poolPriceUnit) || 2,
            minMove: 0.01
          }
        }) as ISeriesApi<'Candlestick'>
      } else {
        console.log('Adding line series...')
        currentSeries = chart.addSeries(LineSeries, {
          color: '#68FFD8',
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: Number(poolPriceUnit) || 2,
            minMove: 0.01
          }
        }) as ISeriesApi<'Line'>
      }

      console.log('Series created:', currentSeries)
      seriesRef.current = currentSeries

      // 处理图表大小调整
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          const width = chartContainerRef.current.clientWidth
          const height = chartContainerRef.current.clientHeight
          if (width > 0 && height > 0) {
            chartRef.current.applyOptions({
              width,
              height
            })
          }
        }
      }

      resizeObserver = new ResizeObserver(handleResize)
      if (container) {
        resizeObserver.observe(container)
      }

      // 加载历史数据
      const actualPoolId = poolId.includes('::') ? poolId.split('::')[1] : poolId
      const now = Math.floor(Date.now() / 1000)

      // 根据时间间隔计算起始时间
      let from = now - 7 * 24 * 60 * 60 // 默认7天
      if (resolution === '1') {
        // 1分钟数据只加载最近4小时，避免数据量过大
        from = now - 4 * 60 * 60 // 4小时
      } else if (resolution === '10') {
        from = now - 24 * 60 * 60 // 1天
      } else if (resolution === '15' || resolution === '30') {
        from = now - 7 * 24 * 60 * 60 // 7天
      } else if (resolution === '60') {
        from = now - 30 * 24 * 60 * 60 // 30天
      } else if (resolution === '1W') {
        from = now - 90 * 24 * 60 * 60 // 90天
      }

      console.log('Loading historical data:', { resolution, from, to: now, timeRange: now - from })

      getDeepbookHistoricalDataRef.current({
        poolId: actualPoolId,
        resolution,
        from,
        to: now,
        callback: (bars: any[], { noData }: { noData: boolean }) => {
          try {
            console.log('Historical data callback:', {
              resolution,
              noData,
              barsLength: bars?.length,
              firstBar: bars?.[0],
              lastBar: bars?.[bars?.length - 1]
            })

            if (!noData && bars && bars.length > 0) {
              if (chartType === 'candlestick') {
                const candlestickData = bars
                  .map(convertBarToCandlestick)
                  .filter(
                    (item): item is CandlestickData =>
                      item !== null &&
                      item.time !== undefined &&
                      item.open !== undefined &&
                      item.high !== undefined &&
                      item.low !== undefined &&
                      item.close !== undefined
                  )

                console.log('Candlestick data after conversion:', {
                  original: bars.length,
                  filtered: candlestickData.length,
                  sample: candlestickData[0]
                })

                if (candlestickData.length > 0) {
                  ;(currentSeries as ISeriesApi<'Candlestick'>).setData(candlestickData)
                  console.log('Chart data loaded successfully:', candlestickData.length, 'candles')

                  // 通知价格变化
                  if (onChangePriceRef.current) {
                    onChangePriceRef.current({
                      poolId: actualPoolId,
                      price: String(bars[bars.length - 1].close || '')
                    })
                  }
                } else {
                  console.warn('No valid candlestick data after conversion', {
                    barsSample: bars.slice(0, 3)
                  })
                }
              } else {
                const lineData = bars
                  .map(convertBarToLine)
                  .filter(
                    (item): item is { time: UTCTimestamp; value: number } => item !== null && item.time !== undefined && item.value !== undefined
                  )

                console.log('Line data after conversion:', {
                  original: bars.length,
                  filtered: lineData.length,
                  sample: lineData[0]
                })

                if (lineData.length > 0) {
                  ;(currentSeries as ISeriesApi<'Line'>).setData(lineData)
                  console.log('Chart data loaded successfully:', lineData.length, 'points')

                  // 通知价格变化
                  if (onChangePriceRef.current) {
                    onChangePriceRef.current({
                      poolId: actualPoolId,
                      price: String(bars[bars.length - 1].close || '')
                    })
                  }
                } else {
                  console.warn('No valid line data after conversion', {
                    barsSample: bars.slice(0, 3)
                  })
                }
              }
            } else {
              console.warn('No data received or noData flag is true', {
                noData,
                barsLength: bars?.length,
                resolution,
                from,
                to: now
              })
            }
          } catch (error) {
            console.error('Error processing chart data:', error, {
              resolution,
              barsLength: bars?.length
            })
          }
        },
        onErrorCallback: (error: string) => {
          console.error('Error loading historical data:', error, {
            resolution,
            from,
            to: now,
            poolId: actualPoolId
          })
        },
        firstDataRequest: true
      })

      // 订阅实时数据
      const currentChartType = chartType // 保存当前图表类型
      unsubscribeRef.current = subscribeKlineDataRef.current({
        poolId: actualPoolId,
        resolution,
        callback: (bar: any) => {
          if (bar && currentSeries) {
            try {
              if (currentChartType === 'candlestick') {
                const candleData = convertBarToCandlestick(bar)
                if (candleData) {
                  ;(currentSeries as ISeriesApi<'Candlestick'>).update(candleData)
                }
              } else {
                const linePointData = convertBarToLine(bar)
                if (linePointData) {
                  ;(currentSeries as ISeriesApi<'Line'>).update(linePointData)
                }
              }

              // 通知价格变化
              if (onChangePriceRef.current) {
                onChangePriceRef.current({
                  poolId: actualPoolId,
                  price: String(bar.close || '')
                })
              }
            } catch (error) {
              console.error('Error updating chart data:', error)
            }
          }
        },
        onPriceChange: onChangePriceRef.current
      })

      setIsInitialized(true)
      onChartReady?.()
    } catch (error) {
      console.error('Error initializing chart:', error)
      // 清理资源
      if (chartRef.current) {
        try {
          chartRef.current.remove()
        } catch (e) {
          // 忽略清理错误
        }
        chartRef.current = null
        seriesRef.current = null
      }
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }
      setIsInitialized(false)
      initializedPoolRef.current = ''
    }
  }, [poolId, poolPriceUnit, resolution, chartType, onChartReady])

  // hook 渲染 marker (只在蜡烛图模式下显示)
  const orderType = orderTab === 'margin' ? 'margin' : 'spot'
  // 注意：订单标记目前只支持蜡烛图，折线图模式下不显示
  // 使用条件渲染，只在蜡烛图模式下调用 hook
  const candlestickSeriesRef = useMemo(() => {
    if (chartType === 'candlestick' && seriesRef.current) {
      return seriesRef as React.MutableRefObject<ISeriesApi<'Candlestick'> | null>
    }
    return { current: null } as React.MutableRefObject<ISeriesApi<'Candlestick'> | null>
  }, [chartType, seriesRef.current])

  console.log('🚀🚀🚀 ~ h5Index.tsx:551 ~ orderType:', orderType)

  useLightweightChartOrderMarkers(chartRef, candlestickSeriesRef, chartType === 'candlestick' ? orderMarkers : [], cancelOrder, poolId, orderType)

  return (
    <VStack w="100%" h="100%" px={isApp ? '0px' : '4px'} bg={'bg_secondary'} spacing={0}>
      {/* 工具栏 */}
      <Box
        w="100%"
        px="10px"
        py="8px"
        bg="#0F0F0F"
        borderBottom="1px solid #1A1A1A"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap="8px"
      >
        {/* 时间间隔选择 */}
        <HStack spacing="4px" flexWrap="wrap">
          {RESOLUTION_OPTIONS.map(option => (
            <Box
              key={option.value}
              as="button"
              px="12px"
              py="4px"
              fontSize="12px"
              fontWeight={resolution === option.value ? '600' : '400'}
              color={resolution === option.value ? 'primary' : 'text_paragraph'}
              bg={resolution === option.value ? 'rgba(104, 255, 216, 0.1)' : 'transparent'}
              border="1px solid"
              borderColor={resolution === option.value ? 'primary' : 'border'}
              borderRadius="4px"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                borderColor: '#68FFD8',
                bg: 'rgba(104, 255, 216, 0.05)'
              }}
              onClick={() => handleResolutionChange(option.value)}
            >
              {option.label}
            </Box>
          ))}
        </HStack>

        {/* 图表类型切换 */}
        {/* <HStack spacing="4px">
          <Box
            as="button"
            px="12px"
            py="4px"
            fontSize="12px"
            fontWeight={chartType === 'candlestick' ? '600' : '400'}
            color={chartType === 'candlestick' ? '#68FFD8' : '#D9D9D9'}
            bg={chartType === 'candlestick' ? 'rgba(104, 255, 216, 0.1)' : 'transparent'}
            border="1px solid"
            borderColor={chartType === 'candlestick' ? '#68FFD8' : '#2A3238'}
            borderRadius="4px"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: '#68FFD8',
              bg: 'rgba(104, 255, 216, 0.05)'
            }}
            onClick={() => handleChartTypeChange('candlestick')}
          >
            蜡烛图
          </Box>
          <Box
            as="button"
            px="12px"
            py="4px"
            fontSize="12px"
            fontWeight={chartType === 'line' ? '600' : '400'}
            color={chartType === 'line' ? '#68FFD8' : '#D9D9D9'}
            bg={chartType === 'line' ? 'rgba(104, 255, 216, 0.1)' : 'transparent'}
            border="1px solid"
            borderColor={chartType === 'line' ? '#68FFD8' : '#2A3238'}
            borderRadius="4px"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: '#68FFD8',
              bg: 'rgba(104, 255, 216, 0.05)'
            }}
            onClick={() => handleChartTypeChange('line')}
          >
            折线图
          </Box>
        </HStack> */}
      </Box>

      {/* 图表容器 */}
      <Box flex={1} w="100%" position="relative">
        <div
          id="tv_chart_container"
          ref={chartContainerRef}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '400px',
            position: 'relative',
            zIndex: 10
          }}
        />
      </Box>
    </VStack>
  )
}

export default DeepbookTradingViewChart
