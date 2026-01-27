import useGetPriceKlineData from '@/hooks/pro/useGetPriceKlineData'
import useProStore from '@/store/pro'
import { Token } from '@cetus/types'
import { addComma, d, fixDown, formatNumberWithDown, formatTvMarkDate, formatUSDPrice } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, HStack, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { CandlestickData, CandlestickSeries, ColorType, IChartApi, ISeriesApi, LineSeries, UTCTimestamp, createChart } from 'lightweight-charts'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface TradingViewChartProps {
  token: Token | undefined
  tokenPriceUnit: string
  onChartReady?: () => void
  onChangePrice?: (data: { coinType: string; price: string }) => void
}

// 时间间隔选项
// type Resolution = '1' | '5' | '15' | '60' | '240' | '1D' | '1W' | '1M'
type Resolution = '1' | '15' | '60' | '240' | '1D' | '1W'
type ChartType = 'candlestick' | 'line'

const RESOLUTION_OPTIONS: { value: Resolution; label: string }[] = [
  { value: '1', label: '1m' },
  // { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1h' },
  { value: '240', label: '4h' },
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' }
  // { value: '1M', label: '1M' }
]

// 时间间隔到 API resolution 的映射
const dateType: any = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
  '1W': '1w',
  '1M': '1M'
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ token, onChartReady, tokenPriceUnit, onChangePrice }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null)
  const isMounted = useRef<boolean>(false)
  const [, setIsInitialized] = useState(false)
  const initializedPoolRef = useRef<string>('')
  const marksOverlayRef = useRef<HTMLDivElement | null>(null)

  // 工具栏状态
  const [resolution, setResolution] = useState<Resolution>('15')
  const [chartType, setChartType] = useState<ChartType>('candlestick')

  const { getHistoricalData, subscribeKlineData, proTransactionList } = useGetPriceKlineData()
  const { setCoinBvPrice } = useProStore()

  // 使用 ref 存储函数引用
  const getHistoricalDataRef = useRef(getHistoricalData)
  const subscribeKlineDataRef = useRef(subscribeKlineData)
  const onChangePriceRef = useRef(onChangePrice)

  useEffect(() => {
    isMounted.current = true
    getHistoricalDataRef.current = getHistoricalData
    subscribeKlineDataRef.current = subscribeKlineData
    onChangePriceRef.current = onChangePrice
  }, [getHistoricalData, subscribeKlineData, onChangePrice])

  // 将 bar 格式转换为 Lightweight Charts 格式
  const convertBarToCandlestick = (bar: any): CandlestickData | null => {
    try {
      let timeValue: UTCTimestamp
      if (typeof bar.time === 'number') {
        if (bar.time > 1000000000000) {
          timeValue = Math.floor(bar.time / 1000) as UTCTimestamp
        } else {
          timeValue = bar.time as UTCTimestamp
        }
      } else {
        return null
      }

      const open = Number(bar.open)
      const high = Number(bar.high)
      const low = Number(bar.low)
      const close = Number(bar.close)

      if (!timeValue || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
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
      console.error('Error converting bar to candlestick:', error)
      return null
    }
  }

  // 将 bar 转换为折线图数据格式
  const convertBarToLine = (bar: any) => {
    try {
      let timeValue: UTCTimestamp
      if (typeof bar.time === 'number') {
        if (bar.time > 1000000000000) {
          timeValue = Math.floor(bar.time / 1000) as UTCTimestamp
        } else {
          timeValue = bar.time as UTCTimestamp
        }
      } else {
        return null
      }

      const value = Number(bar.close)
      if (!timeValue || isNaN(value)) {
        return null
      }

      return {
        time: timeValue,
        value
      }
    } catch (error) {
      console.error('Error converting bar to line:', error)
      return null
    }
  }

  // 切换时间间隔
  const handleResolutionChange = useCallback(
    (newResolution: Resolution) => {
      if (newResolution === resolution) return
      setResolution(newResolution)
      initializedPoolRef.current = ''
    },
    [resolution]
  )

  // 切换图表类型
  const handleChartTypeChange = useCallback(
    (newType: ChartType) => {
      if (newType === chartType) return
      setChartType(newType)
      initializedPoolRef.current = ''
    },
    [chartType]
  )

  useEffect(() => {
    if (!chartContainerRef.current || !token?.coin_type || !tokenPriceUnit) {
      return
    }

    const chartKey = `${token.coin_type}::${tokenPriceUnit}::${resolution}::${chartType}`
    if (initializedPoolRef.current === chartKey && chartRef.current) {
      return
    }

    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      seriesRef.current = null
    }

    // subscribeKlineData 内部会自动取消之前的订阅，无需手动管理

    initializedPoolRef.current = chartKey

    const container = chartContainerRef.current!
    let containerWidth = container.clientWidth || container.offsetWidth
    let containerHeight = container.clientHeight || container.offsetHeight

    if (containerWidth === 0 || containerHeight === 0) {
      const timer = setTimeout(() => {
        containerWidth = container.clientWidth || container.offsetWidth || 800
        containerHeight = container.clientHeight || container.offsetHeight || 460

        if (containerWidth > 0 && containerHeight > 0 && initializedPoolRef.current !== chartKey) {
          initializedPoolRef.current = ''
        }
      }, 200)
      return () => clearTimeout(timer)
    }

    containerWidth = containerWidth || 800
    containerHeight = containerHeight || 460

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

      // 创建系列
      let currentSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>

      if (chartType === 'candlestick') {
        currentSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#68FFD8',
          downColor: '#FF5073',
          borderVisible: false,
          wickUpColor: '#68FFD8',
          wickDownColor: '#FF5073',
          priceFormat: {
            type: 'price',
            precision: Number(tokenPriceUnit) || 2,
            minMove: 0.01
          }
        }) as ISeriesApi<'Candlestick'>
      } else {
        currentSeries = chart.addSeries(LineSeries, {
          color: '#68FFD8',
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: Number(tokenPriceUnit) || 2,
            minMove: 0.01
          }
        }) as ISeriesApi<'Line'>
      }

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
      const now = Math.floor(Date.now() / 1000)
      let from = now - 7 * 24 * 60 * 60 // 默认7天

      // 根据时间间隔计算起始时间
      if (resolution === '1') {
        from = now - 4 * 60 * 60 // 4小时
      } else if (resolution === '15') {
        from = now - 7 * 24 * 60 * 60 // 7天
      } else if (resolution === '60' || resolution === '240') {
        from = now - 30 * 24 * 60 * 60 // 30天
      } else if (resolution === '1D') {
        from = now - 365 * 24 * 60 * 60 // 1年
      } else if (resolution === '1W') {
        from = now - 730 * 24 * 60 * 60 // 2年
      } else if (resolution === '1M') {
        from = now - 1095 * 24 * 60 * 60 // 3年
      }

      const apiResolution = dateType[resolution]

      getHistoricalDataRef.current({
        poolId: token.coin_type,
        resolution: apiResolution,
        from,
        to: now,
        callback: (bars: any[], { noData }: { noData: boolean }) => {
          try {
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

                if (candlestickData.length > 0) {
                  ;(currentSeries as ISeriesApi<'Candlestick'>).setData(candlestickData)

                  // 通知价格变化 - 使用 setTimeout 避免在渲染过程中更新状态
                  if (onChangePriceRef.current) {
                    setTimeout(() => {
                      onChangePriceRef.current?.({
                        coinType: token.coin_type,
                        price: String(bars[bars.length - 1].close || '')
                      })
                    }, 0)
                  }
                }
              } else {
                const lineData = bars
                  .map(convertBarToLine)
                  .filter(
                    (item): item is { time: UTCTimestamp; value: number } => item !== null && item.time !== undefined && item.value !== undefined
                  )

                if (lineData.length > 0) {
                  ;(currentSeries as ISeriesApi<'Line'>).setData(lineData)

                  // 通知价格变化 - 使用 setTimeout 避免在渲染过程中更新状态
                  if (onChangePriceRef.current) {
                    setTimeout(() => {
                      onChangePriceRef.current?.({
                        coinType: token.coin_type,
                        price: String(bars[bars.length - 1].close || '')
                      })
                    }, 0)
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error processing chart data:', error)
          }
        },
        onErrorCallback: (error: string) => {
          console.error('Error loading historical data:', error)
        },
        firstDataRequest: true
      })

      // 订阅实时数据
      const currentChartType = chartType
      subscribeKlineDataRef.current({
        poolId: token.coin_type,
        resolution: apiResolution,
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

              // 通知价格变化 - 使用 setTimeout 避免在渲染过程中更新状态
              if (onChangePriceRef.current) {
                setTimeout(() => {
                  onChangePriceRef.current?.({
                    coinType: token.coin_type,
                    price: String(bar.close || '')
                  })
                }, 0)
              }
            } catch (error) {
              console.error('Error updating chart data:', error)
            }
          }
        }
      })

      setIsInitialized(true)
      onChartReady?.()
    } catch (error) {
      console.error('Error initializing chart:', error)
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
      // subscribeKlineData 内部会自动处理取消订阅，无需手动清理
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }
      setIsInitialized(false)
      initializedPoolRef.current = ''
    }
  }, [token?.coin_type, tokenPriceUnit, resolution, chartType, onChartReady])

  // 渲染交易标记
  useDeepCompareEffect(() => {
    if (!chartRef.current || !token?.coin_type || !chartContainerRef.current) return

    const chart = chartRef.current
    const transactions = proTransactionList.filter(item => fixCoinType(item.currentCoin.coin_type) === fixCoinType(token.coin_type))

    // 创建标记容器
    if (!marksOverlayRef.current && chartContainerRef.current) {
      marksOverlayRef.current = document.createElement('div')
      marksOverlayRef.current.id = 'transaction-marks-overlay'
      marksOverlayRef.current.style.position = 'absolute'
      marksOverlayRef.current.style.top = '0'
      marksOverlayRef.current.style.left = '0'
      marksOverlayRef.current.style.width = '100%'
      marksOverlayRef.current.style.height = '100%'
      marksOverlayRef.current.style.pointerEvents = 'none'
      marksOverlayRef.current.style.zIndex = '20'
      if (window.getComputedStyle(chartContainerRef.current).position === 'static') {
        chartContainerRef.current.style.position = 'relative'
      }
      chartContainerRef.current.appendChild(marksOverlayRef.current)
    }

    const container = marksOverlayRef.current
    if (!container) return

    // 存储标记元素的 Map，key 为交易 ID
    const marksMap = new Map<string, HTMLElement>()

    // 更新标记位置的函数
    const updateMarks = () => {
      if (!chart || !container || !chartContainerRef.current) return

      const priceRange = chart.priceScale('right').getVisibleRange()
      const timeRange = chart.timeScale().getVisibleRange()
      if (!priceRange || !timeRange) return

      const containerRect = chartContainerRef.current.getBoundingClientRect()
      const { from: minPrice, to: maxPrice } = priceRange
      const { from: minTime, to: maxTime } = timeRange
      const priceRangeSize = maxPrice - minPrice
      const timeRangeSize = (maxTime as number) - (minTime as number)

      if (priceRangeSize <= 0 || timeRangeSize <= 0) return

      // 清理不在可见范围内的标记
      marksMap.forEach((mark, id) => {
        const transaction = transactions.find(t => `pro_mark_${transactions.indexOf(t)}` === id)
        if (!transaction) {
          mark.remove()
          marksMap.delete(id)
          return
        }

        const transactionTime = Number(fixDown(d(transaction.time).div(1000).toNumber(), 0))
        if (transactionTime < (minTime as number) || transactionTime > (maxTime as number)) {
          mark.style.display = 'none'
        }
      })

      // 创建或更新标记
      transactions.forEach((item, index) => {
        const transactionTime = Number(fixDown(d(item.time).div(1000).toNumber(), 0))
        const transactionPrice = Number(item.price)
        const markId = `pro_mark_${index}`

        // 检查交易是否在可见范围内
        if (transactionTime < (minTime as number) || transactionTime > (maxTime as number)) {
          const existingMark = marksMap.get(markId)
          if (existingMark) {
            existingMark.style.display = 'none'
          }
          return
        }

        // 计算位置
        const timeRatio = (transactionTime - (minTime as number)) / timeRangeSize
        const priceRatio = (transactionPrice - minPrice) / priceRangeSize

        const x = containerRect.width * timeRatio
        const y = containerRect.height * (1 - priceRatio) // 反转 Y 轴

        // 获取或创建标记元素
        let mark = marksMap.get(markId)
        if (!mark) {
          mark = document.createElement('div')
          mark.style.position = 'absolute'
          mark.style.transform = 'translate(-50%, -50%)'
          mark.style.width = '20px'
          mark.style.height = '20px'
          mark.style.borderRadius = '50%'
          mark.style.backgroundColor = item.type === 'Buy' ? '#68FFD8' : '#FF5073'
          mark.style.border = '2px solid #fff'
          mark.style.cursor = 'pointer'
          mark.style.pointerEvents = 'auto'
          mark.style.zIndex = '21'
          mark.style.display = 'flex'
          mark.style.alignItems = 'center'
          mark.style.justifyContent = 'center'
          mark.style.fontSize = '10px'
          mark.style.fontWeight = 'bold'
          mark.style.color = '#000'

          const label = document.createElement('span')
          label.textContent = item.type === 'Buy' ? 'B' : 'S'
          mark.appendChild(label)

          // 添加提示信息
          const amount = formatNumberWithDown(item.amount, item.currentCoin.decimals, true)
          const currentCoinPrice = item?.price
          const amountValue = d(currentCoinPrice).mul(amount).toString()
          const symbol = item.currentCoin.symbol

          mark.title =
            item.type === 'Buy'
              ? `Bought ${amount} ${symbol}($${addComma(formatUSDPrice(amountValue, true))}) at $${addComma(formatUSDPrice(currentCoinPrice))} on ${formatTvMarkDate(item.time)}`
              : `Sold ${amount} ${symbol}($${addComma(formatUSDPrice(amountValue, true))}) at $${addComma(formatUSDPrice(currentCoinPrice))} on ${formatTvMarkDate(item.time)}`

          container.appendChild(mark)
          marksMap.set(markId, mark)
        }

        // 更新位置
        mark.style.left = `${x}px`
        mark.style.top = `${y}px`
        mark.style.display = 'flex'
      })
    }

    // 初始渲染
    updateMarks()

    // 订阅图表变化事件
    chart.subscribeCrosshairMove(updateMarks)
    chart.timeScale().subscribeVisibleTimeRangeChange(updateMarks)
    // 价格范围变化通过时间范围变化和交叉线移动来触发更新

    return () => {
      // 取消订阅图表事件
      chart.unsubscribeCrosshairMove(updateMarks)
      chart.timeScale().unsubscribeVisibleTimeRangeChange(updateMarks)
      // 清理标记
      marksMap.forEach(mark => mark.remove())
      marksMap.clear()
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [proTransactionList, token?.coin_type])

  return (
    <VStack spacing={0} w="100%" h="100%">
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
      <Box flex={1} w="100%" position="relative" minH="460px">
        <div id="tv_chart_container" ref={chartContainerRef} style={{ width: '100%', height: '100%', minHeight: '460px', position: 'relative' }} />
      </Box>
    </VStack>
  )
}

export default TradingViewChart
