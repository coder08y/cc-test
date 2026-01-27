import useLiquidityStore from '@/store/clmm'
import useDepositStore from '@/store/clmm/deposit'
import { Block, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import Icon from '@cetus/ui-kit/src/components/Icon'
import { d, formatPoolPirceChartTime, formatSmallPrice, removeComma } from '@cetus/utils'
import { Box, Center, Divider, HStack, Portal, Spinner, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import NoLiquidityData from '../clmm/RangeChart/NoLiquidityData'
import { ActiveLiquidityChart } from './ActiveLiquidityChart'
import { useRangeInputSizes } from './constants'
import usePriceChartData from './usePriceChartData'

const DurationTabList = [
  {
    label: '1D',
    key: '24H'
  },
  {
    label: '7D',
    key: '7D'
  },
  {
    label: '30D',
    key: '30D'
  }
  // {
  //   label: '1Y',
  //   key: '365D'
  // }
]

interface LiquidityRangeInputProps {
  quoteCurrency: any
  baseCurrency: any
  poolId: string
  currentPrice?: number
  currentRange?: string
  priceLower?: any
  priceUpper?: any
  disableBrushInteraction?: boolean
  setMinPrice: (value?: number) => void
  setMaxPrice: (value?: number) => void
  isSorted: boolean
  setFallbackRangePrices: () => void
  isReverse: boolean
  data: {
    formatPriceData: any
    ticksPool: any
    formatPriceDataIsLoading: boolean
  }
  dashedMarkerLine?: any
}

const MIN_DATA_POINTS = 0

// Tooltip constants
const TOOLTIP_WIDTH = 180
const TOOLTIP_HEIGHT = 80
const TOOLTIP_TOLERANCE = 0.15 // 15% of chart height
const TOOLTIP_MARGIN = 12

export function LiquidityRangeInput({
  quoteCurrency,
  baseCurrency,
  poolId,
  currentPrice,
  priceLower,
  priceUpper,
  setMinPrice,
  setMaxPrice,
  disableBrushInteraction = false,
  isSorted,
  setFallbackRangePrices,
  isReverse,
  data,
  currentRange,
  dashedMarkerLine
}: LiquidityRangeInputProps) {
  const { isApp } = useWindowWidth()
  const containerRef = useRef<HTMLDivElement>(null)
  const sizes = useRangeInputSizes(containerRef.current?.clientWidth)
  const { setCurrentRange } = useLiquidityStore()
  const { recommendRangesInfo } = useDepositStore()
  const [selectedHistoryDuration, setSelectedHistoryDuration] = useState<string>('30D')
  const [zoomFactor, setZoomFactor] = useState(1)
  const [boundaryPrices, setBoundaryPrices] = useState<[number, number]>()
  const [midPrice, setMidPrice] = useState<number | undefined>(currentPrice)
  const [showDiffIndicators, setShowDiffIndicators] = useState(false)

  // 添加 Y 轴滚动的状态
  const [yAxisOffset, setYAxisOffset] = useState(0)
  const [yAxisZoom, setYAxisZoom] = useState(1)

  // Tooltip state management
  const [tooltipData, setTooltipData] = useState<{
    x: number
    y: number
    data: {
      timestamp: number
      close: number
      high?: number
      low?: number
    }
  } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Hover marker state
  const [hoverMarker, setHoverMarker] = useState<{
    x: number
    y: number
    price: number
  } | null>(null)

  const { poolPriceData, poolPriceDataLoading, getPoolPriceData } = usePriceChartData()

  // Memoize mouse move handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!chartRef.current || !poolPriceData?.length || !boundaryPrices) return

      const rect = chartRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const chartWidth = rect.width
      const chartHeight = rect.height

      // Account for chart margins (consistent with AreaChart margin)
      const marginLeft = 0
      const marginRight = sizes.rightAxisWidth + sizes.liquidityChartWidth + 20
      const effectiveChartWidth = chartWidth - marginLeft - marginRight
      const effectiveX = x - marginLeft

      // Check if X axis is within valid range
      if (effectiveX < 0 || effectiveX > effectiveChartWidth) {
        setTooltipData(null)
        return
      }

      // Calculate data index corresponding to mouse position
      const dataIndex = Math.round((effectiveX / effectiveChartWidth) * (poolPriceData.length - 1))

      if (dataIndex >= 0 && dataIndex < poolPriceData.length) {
        // Get price at current data point
        const currentPrice = poolPriceData[dataIndex].close

        // Calculate Y coordinate position of this price on the chart
        const priceRange = boundaryPrices[1] - boundaryPrices[0]
        const priceRatio = (currentPrice - boundaryPrices[0]) / priceRange
        const priceY = chartHeight * (1 - priceRatio) // Y axis is inverted

        // Check if mouse is near the price line (with tolerance)
        const tolerance = chartHeight * TOOLTIP_TOLERANCE
        const isNearPriceLine = Math.abs(y - priceY) < tolerance

        if (isNearPriceLine) {
          // Calculate Tooltip position, smart boundary detection
          const screenWidth = window.innerWidth

          const adjustedX = e.clientX + TOOLTIP_WIDTH > screenWidth ? e.clientX - TOOLTIP_WIDTH - TOOLTIP_MARGIN : e.clientX + TOOLTIP_MARGIN
          const adjustedY = e.clientY - TOOLTIP_HEIGHT < 0 ? e.clientY + TOOLTIP_MARGIN : e.clientY - TOOLTIP_HEIGHT - TOOLTIP_MARGIN

          setTooltipData({
            x: adjustedX,
            y: adjustedY,
            data: poolPriceData[dataIndex]
          })

          // Set hover marker position
          setHoverMarker({
            x,
            y: priceY,
            price: currentPrice
          })
        } else {
          // Mouse is too far from price line, hide Tooltip and marker
          setTooltipData(null)
          setHoverMarker(null)
        }
      } else {
        setTooltipData(null)
        setHoverMarker(null)
      }
    },
    [poolPriceData, boundaryPrices, sizes.rightAxisWidth, sizes.liquidityChartWidth]
  )

  useEffect(() => {
    getPoolPriceData(poolId, selectedHistoryDuration, isSorted, baseCurrency, quoteCurrency)
  }, [poolId, isSorted])

  useEffect(() => {
    const handleScroll = () => {
      setTooltipData(null)
      setHoverMarker(null)
    }

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const handleChangeDuration = useCallback(
    (tab: any) => {
      setSelectedHistoryDuration(tab.key)
      getPoolPriceData(poolId, tab.key, isSorted, baseCurrency, quoteCurrency)
    },
    [getPoolPriceData, poolId, isSorted, baseCurrency, quoteCurrency]
  )

  useEffect(() => {
    console.log('🚀 ~ LiquidityRangeInput ~ currentRange:', currentRange)
    if (currentRange) {
      const key = currentRange == 'day' ? '24H' : currentRange == 'week' ? '7D' : '30D'
      setSelectedHistoryDuration(key)
      getPoolPriceData(poolId, key, isSorted, baseCurrency, quoteCurrency)
    }
  }, [currentRange])

  const { formatPriceData, ticksPool, formatPriceDataIsLoading } = data

  const isLoading = useMemo(() => {
    if (formatPriceData && !formatPriceDataIsLoading && !poolPriceDataLoading) return false
    return true
  }, [formatPriceData, formatPriceDataIsLoading, poolPriceDataLoading])

  const seriesData = useMemo(() => {
    let result: any
    if (isSorted) {
      result = formatPriceData?.map((item: any) => {
        return {
          ...item,
          price: Number(item?.price)
        }
      })
    } else {
      result = formatPriceData?.map((item: any) => {
        return {
          ...item,
          price: d(1).div(item?.price)?.toNumber()
        }
      })
    }
    return result
  }, [isSorted, formatPriceData])

  const isNoLiquidityData = useMemo(() => {
    if (!formatPriceDataIsLoading && !seriesData?.length) return true
    return false
  }, [seriesData?.length, formatPriceDataIsLoading])

  const isNoPoolPriceData = useMemo(() => {
    if (!poolPriceData?.length) return true
    return false
  }, [poolPriceData?.length])

  const currentMinPrice = isSorted ? removeComma(priceLower?.displayPrice) : removeComma(priceLower?.displayReversePrice)
  const currentMaxPrice = isSorted ? removeComma(priceUpper?.displayPrice) : removeComma(priceUpper?.displayReversePrice)
  const isFullRange = currentMinPrice === '∞' || currentMaxPrice === '∞'

  // 计算共用的价格范围，确保价格图表和流动性密度使用相同的Y轴
  const commonPriceRange = useMemo(() => {
    // if (!seriesData || seriesData.length === 0) {
    //   return { min: 0, max: 1 }
    // }

    if (!poolPriceData || poolPriceData.length === 0) return { min: 0, max: 1 }

    // if (currentMinPrice === '∞' || currentMaxPrice==='∞') return null

    // 获取流动性数据的价格范围
    const poolPriceChartMin = Math.min(...poolPriceData.map((d: any) => d.close))

    const poolPriceChartMax = Math.max(...poolPriceData.map((d: any) => d.close))

    // 获取价格图表的范围（基于当前价格）
    const currentPriceValue = currentPrice || 1
    const priceChartRange = 0.3 // 当前价格的 ±30%
    const priceChartMin = currentPriceValue * (1 - priceChartRange)
    const priceChartMax = currentPriceValue * (1 + priceChartRange)

    // 合并两个范围，确保覆盖所有数据
    // const combinedMin = Math.min(poolPriceChartMin, priceChartMin, d(currentMinPrice === '∞' ? priceChartMin : currentMinPrice).mul(0.95).toNumber())
    // const combinedMax = Math.max(poolPriceChartMax, priceChartMax, d(currentMaxPrice === '∞' ? priceChartMax : currentMaxPrice).mul(1.05).toNumber())

    const minMaxPriceGap = isFullRange ? 0 : d(currentMaxPrice).minus(currentMinPrice).div(4).toNumber()
    const combinedMin = Math.min(poolPriceChartMin, d(currentMinPrice === '∞' ? priceChartMin : d(currentMinPrice).minus(minMaxPriceGap)).toNumber())
    const combinedMax = Math.max(poolPriceChartMax, d(currentMaxPrice === '∞' ? priceChartMax : d(currentMaxPrice).plus(minMaxPriceGap)).toNumber())
    // 添加一些边距
    const margin = (combinedMax - combinedMin) * 0.1
    const baseMin = Math.max(0, combinedMin - margin)
    const baseMax = combinedMax + margin

    // 应用 Y 轴缩放和偏移
    const range = baseMax - baseMin
    const zoomedRange = range / yAxisZoom
    const center = (baseMin + baseMax) / 2 + yAxisOffset

    const data = {
      min: Math.max(0, center - zoomedRange / 2),
      max: center + zoomedRange / 2
    }

    return data
  }, [poolPriceData, currentPrice, yAxisOffset, yAxisZoom, currentMinPrice, currentMaxPrice, isFullRange])

  // 设置边界价格为共用的价格范围
  useEffect(() => {
    if (commonPriceRange) {
      setBoundaryPrices([commonPriceRange.min, commonPriceRange.max])
    }
  }, [commonPriceRange])

  const showChartErrorView =
    !poolPriceData ||
    poolPriceData.length < MIN_DATA_POINTS ||
    (!isLoading && !seriesData) ||
    (!isLoading && seriesData && seriesData.length < MIN_DATA_POINTS)

  useEffect(() => {
    if (showChartErrorView && !disableBrushInteraction && priceLower === undefined && priceUpper === undefined) {
      setFallbackRangePrices()
    }
  }, [showChartErrorView, disableBrushInteraction, priceLower, priceUpper, setFallbackRangePrices])

  const handleBrushChange = (brushData: any) => {
    if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      const startPrice = poolPriceData[brushData.startIndex]?.value
      const endPrice = poolPriceData[brushData.endIndex]?.value

      if (startPrice && endPrice) {
        const min = Math.min(startPrice, endPrice)
        const max = Math.max(startPrice, endPrice)
        setMinPrice(min)
        setMaxPrice(max)
      }
    }
  }

  const handleZoomIn = () => {
    setZoomFactor(prev => {
      const newZoom = prev / 1.2
      // 将zoomFactor应用到yAxisZoom
      setYAxisZoom(newZoom)
      return newZoom
    })
  }

  const handleZoomOut = () => {
    setZoomFactor(prev => {
      const newZoom = prev * 1.2
      // 将zoomFactor应用到yAxisZoom
      setYAxisZoom(newZoom)
      return newZoom
    })
  }

  const handleReset = () => {
    setSelectedHistoryDuration('7D')
    setZoomFactor(1)
    setBoundaryPrices(undefined)
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setMidPrice(currentPrice)
    // 重置 Y 轴滚动状态
    setYAxisOffset(0)
    setYAxisZoom(1)
    setCurrentRange(recommendRangesInfo?.type === 'unstable' ? 'active' : 'default')
  }

  // 处理鼠标滚轮事件，控制 Y 轴滚动和缩放 (实际嵌入项目中效果不太理想，暂时注释)
  // const handleWheel = (event: React.WheelEvent) => {
  //   event.preventDefault()

  //   const delta = event.deltaY

  //   // 判断滚轮方向
  //   if (event.ctrlKey || event.metaKey) {
  //     // Ctrl/Cmd + 滚轮 = 缩放
  //     const zoomFactor = delta > 0 ? 0.95 : 1.05
  //     const newZoom = Math.max(0.2, Math.min(5, yAxisZoom * zoomFactor))
  //     setYAxisZoom(newZoom)
  //   } else {
  //     // 普通滚轮 = 平移
  //     const scrollSpeed = 0.0005 // 调整滚动灵敏度，使其更平滑
  //     const newOffset = yAxisOffset + delta * scrollSpeed

  //     // 限制偏移范围，防止过度滚动
  //     const maxOffset = 2 // 最大偏移量
  //     const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, newOffset))
  //     setYAxisOffset(clampedOffset)
  //   }
  // }

  const dateSelectType = useMemo(() => {
    return { type: selectedHistoryDuration, key: selectedHistoryDuration }
  }, [selectedHistoryDuration])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
          // overflow: 'hidden'
        }}
        onMouseEnter={() => setShowDiffIndicators(true)}
        onMouseLeave={() => setShowDiffIndicators(false)}
      >
        <div className="relative" style={{ height: sizes.chartHeight + sizes.bottomAxisHeight, width: '100%', position: 'relative' }}>
          {/* <HStack
          as="button"
          gap="2px"
          pos="absolute"
          top={{ base: '-288px', lg: '-74px' }}
          left={{ base: '100px', lg: '-8px' }}
          _hover={{ p: { color: 'text_caption' }, svg: { fill: 'text_caption' } }}
          cursor="pointer"
          onClick={handleReset}
        >
          <Icon xlinkHref="#icon-reset" fontSize="14px" />
          <Text fontSize="12px">Reset</Text>
        </HStack> */}
          {/* Main Price Chart - Full width but with right margin for liquidity chart */}

          {!isNoPoolPriceData && (
            <HStack
              w="100%"
              justify={{ base: 'space-between', lg: 'flex-end' }}
              position="absolute"
              gap={{ base: '4px', lg: '8px' }}
              {...(isApp ? { bottom: '-32px', right: 0 } : { bottom: '-36px', right: 'calc(50% - 90px)' })}
            >
              <SelectTab<any, any>
                type="outlineTab"
                tabList={DurationTabList}
                currentTab={selectedHistoryDuration}
                handleChangeTab={handleChangeDuration}
                wrapStyle={{
                  h: '28px',
                  p: '3px',
                  border: '1px solid',
                  borderColor: 'border',
                  borderRadius: '8px',
                  gap: '4px',
                  zIndex: '99'
                }}
                itemStyle={{
                  h: '20px',
                  p: '4px 12px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  gap: '4px'
                }}
              />
              <HStack
                gap="0"
                h="28px"
                borderRadius="8px"
                border="1px solid"
                borderColor="border"
                bg="bg_nine"
                flexDir={{ base: 'row-reverse', lg: 'row' }}
              >
                <Center w="28px" h="26px">
                  <Icon xlinkHref="#icon-a-icon_zoomout" onClick={handleZoomOut} />
                </Center>
                <Divider orientation="vertical" h="16px" />
                <Center w="28px" h="26px">
                  <Icon xlinkHref="#icon-a-icon_zoomin" onClick={handleZoomIn} />
                </Center>
              </HStack>
            </HStack>
          )}

          {!poolPriceDataLoading && !isNoPoolPriceData && (
            <Box
              w="100%"
              h={sizes.chartHeight + sizes.bottomAxisHeight}
              overflow="hidden"
              // onWheel={handleWheel}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={poolPriceData} margin={{ top: 0, left: 0, right: sizes.rightAxisWidth + sizes.liquidityChartWidth + 20, bottom: 0 }}>
                  <XAxis
                    dataKey="timestamp"
                    fontSize="12px"
                    axisLine={{
                      stroke: '#2B3239',
                      strokeWidth: 2
                    }}
                    tickLine={false}
                    tick={{ fill: '#909CA4' }}
                    minTickGap={25}
                    tickFormatter={value => {
                      const date = new Date(value)
                      return formatPoolPirceChartTime(date, selectedHistoryDuration === '24H' ? 'timeOnly' : 'day')
                    }}
                  />

                  <YAxis domain={boundaryPrices ? [boundaryPrices[0], boundaryPrices[1]] : undefined} hide={true} allowDataOverflow={true} />

                  {/* <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: any) => [formatNumber(value, 4), 'Price']}
              /> */}
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#75C8FF"
                    strokeWidth={2}
                    fill="url(#priceAreaGradient)"
                    fillOpacity={0.3}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <defs>
                    <linearGradient id="priceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#75C8FF" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#68FFD8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Active Liquidity Chart Overlay - Positioned absolutely on the right */}
          {!poolPriceDataLoading && !isNoPoolPriceData && boundaryPrices && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: sizes.liquidityChartWidth + sizes.rightAxisWidth,
                height: sizes.chartHeight + sizes.bottomAxisHeight,
                pointerEvents: 'auto',
                zIndex: 2
              }}
              // onWheel={handleWheel}
            >
              {/* Active Liquidity Chart */}

              <ActiveLiquidityChart
                data={{
                  series: seriesData,
                  current: currentPrice ?? poolPriceData[poolPriceData.length - 1]?.close,
                  min: boundaryPrices[0],
                  max: boundaryPrices[1]
                }}
                disableBrush={true}
                disableRightAxis={false}
                disableBrushInteraction={true}
                showDiffIndicators={false}
                showTriangle={false}
                dimensions={{
                  width: sizes.liquidityChartWidth + sizes.rightAxisWidth,
                  height: sizes.chartHeight,
                  contentWidth: sizes.liquidityChartWidth,
                  axisLabelPaneWidth: sizes.rightAxisWidth
                }}
                onBrushDomainChange={() => {
                  // 第一个实例不处理 brush 变化，避免状态冲突
                  return
                }}
                quoteCurrency={quoteCurrency}
                baseCurrency={baseCurrency}
                isMobile={isApp}
              />

              {/* Debug info - 已隐藏，因为盖住了图表 */}
              {/* <div
            style={{
              position: 'absolute',
              top: 10,
              right: sizes.rightAxisWidth + 10,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px',
              fontSize: '12px',
              borderRadius: '4px',
              zIndex: 10,
            }}
          >
            <div>Data: {sortedFormattedData?.length || 0}</div>
            <div>Boundary: {boundaryPrices ? `${boundaryPrices[0].toFixed(4)} - ${boundaryPrices[1].toFixed(4)}` : 'Not set'}</div>
            <div>Loading: {liquidityDataLoading ? 'Yes' : 'No'}</div>
          </div> */}
            </div>
          )}

          {/* Hover Marker - Shows position on price line */}
          {hoverMarker && (
            <div
              style={{
                position: 'absolute',
                left: `${hoverMarker.x}px`,
                top: `${hoverMarker.y}px`,
                width: '8px',
                height: '8px',
                backgroundColor: '#75C8FF',
                border: '2px solid white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            />
          )}

          {/* Vertical line indicator */}
          {hoverMarker && (
            <div
              style={{
                position: 'absolute',
                left: `${hoverMarker.x}px`,
                top: '0px',
                width: '1px',
                height: `${sizes.chartHeight}px`,
                opacity: 0.5,
                zIndex: 3,
                pointerEvents: 'none',
                borderLeft: '1px dashed #75C8FF',
                backgroundColor: 'transparent'
              }}
            />
          )}

          {/* Global Brush Overlay - Covers the entire chart area */}
          {!poolPriceDataLoading && !isNoPoolPriceData && boundaryPrices && (
            <div
              ref={chartRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: sizes.chartHeight,
                pointerEvents: 'auto',
                zIndex: 3,
                overflow: 'hidden'
                // background: 'pink'
              }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                setTooltipData(null)
                setHoverMarker(null)
              }}
              // onWheel={handleWheel}
            >
              <ActiveLiquidityChart
                data={{
                  series: seriesData,
                  current: currentPrice ?? poolPriceData[poolPriceData.length - 1]?.close,
                  min: boundaryPrices[0],
                  max: boundaryPrices[1]
                }}
                disableRightAxis={true}
                disableBrushInteraction={disableBrushInteraction}
                showDiffIndicators={false}
                hideLiquidityBars={true}
                dimensions={{
                  width: sizes.chartContainerWidth,
                  height: sizes.chartHeight,
                  contentWidth: sizes.chartContainerWidth,
                  axisLabelPaneWidth: 0
                }}
                brushDomain={[Number(currentMinPrice), Number(currentMaxPrice)]}
                onBrushDomainChange={(domain: [number, number], mode?: string) => {
                  // 只有全局 brush 实例处理状态更新
                  if (domain[0] < 0) {
                    return
                  }
                  // Filter out auto range suggestions while scrolling
                  const rejectAutoRangeSuggestion =
                    priceUpper !== undefined && priceLower !== undefined && priceLower.displayPrice >= 0 && priceUpper.displayPrice >= 0
                  if (!mode && rejectAutoRangeSuggestion) {
                    return
                  }
                  setMinPrice(domain[0])
                  setMaxPrice(domain[1])
                }}
                quoteCurrency={quoteCurrency}
                baseCurrency={baseCurrency}
                isMobile={isApp}
                dashedMarkerLine={dashedMarkerLine}
                currentPrice={currentPrice}
                showTriangle={true}
                disableBrush={isFullRange}
                isFullRange={isFullRange}
                isBrushInstance={true}
              />
            </div>
          )}

          {/* {(isNoLiquidityData || isNoPoolPriceData) && <Box w="100%" h={sizes.chartHeight + 14 + 'px'} position="absolute" top="-1" left="0" zIndex={99999999}><NoLiquidityData isFrom="liquidity" text={isNoPoolPriceData ? 'Historical price data unavailable.' : 'There is no liquidity data.'}/></Box>} */}
          {!poolPriceDataLoading && isNoPoolPriceData && (
            <Box w="100%" h={sizes.chartHeight + 20 + 'px'} position="absolute" top="0px" left="0" zIndex={99999999}>
              <NoLiquidityData isFrom="liquidity" text={isNoPoolPriceData ? 'Historical price data unavailable.' : 'There is no liquidity data.'} />
            </Box>
          )}

          {isLoading && (
            <Center w="100%" h={sizes.chartHeight + sizes.bottomAxisHeight} position="absolute" top="0" left="0" zIndex={99999999}>
              <Spinner />
            </Center>
          )}
        </div>

        {/* Portal Tooltip - Not restricted by z-index layers */}
        {tooltipData && (
          <Portal>
            <Block
              position="fixed"
              left={`${tooltipData.x}px`}
              top={`${tooltipData.y}px`}
              zIndex={99999999}
              fontSize="12px"
              p="8px 12px"
              borderRadius="12px"
              pointerEvents="none"
              transition="all 0.1s ease"
              w="auto"
            >
              <VStack align="flex-start" spacing="4px">
                <Text color="text_secondary" fontSize="12px">
                  {formatPoolPirceChartTime(new Date(tooltipData.data.timestamp), selectedHistoryDuration === '24H' ? 'second' : 'hour')}
                </Text>
                <Text color="text_secondary" fontWeight="500" fontSize="12px">
                  Price: {formatSmallPrice(tooltipData.data.close)}
                </Text>
              </VStack>
            </Block>
          </Portal>
        )}
      </div>
    </>
  )
}
