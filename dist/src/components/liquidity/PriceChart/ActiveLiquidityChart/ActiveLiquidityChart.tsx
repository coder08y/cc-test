import { scaleLinear } from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Area } from './Area'
import { AxisRight } from './AxisRight'
import { Brush } from './Brush'
import { HorizontalLine } from './HorizontalLine'
import { TickTooltip } from './TickTooltip'

interface ActiveLiquidityChartProps {
  id?: string
  quoteCurrency: any
  baseCurrency: any
  data: any
  dimensions: {
    width: number
    height: number
    contentWidth: number
    axisLabelPaneWidth: number
  }
  brushDomain?: [number, number]
  onBrushDomainChange: (domain: [number, number], mode?: string) => void
  disableBrush?: boolean
  disableRightAxis?: boolean
  disableBrushInteraction?: boolean
  showDiffIndicators?: boolean
  isMobile?: boolean
  barColor?: string
  hideLiquidityBars?: boolean
  dashedMarkerLine?: number[]
  currentPrice?: number
  showTriangle?: boolean
  isFullRange?: boolean
  isBrushInstance?: boolean // 新增标记，用于区分brush实例
}

const xAccessor = (d: any) => d.activeLiquidity || d.depth // x轴是流动性深度
const yAccessor = (d: any) => d.price0 || d.price // y轴是价格

export function ActiveLiquidityChart({
  id = 'ActiveLiquidityChart',
  quoteCurrency,
  baseCurrency,
  data: { series, current, min, max },
  dimensions: { width, height, contentWidth, axisLabelPaneWidth },
  brushDomain,
  onBrushDomainChange,
  disableBrush = false,
  disableRightAxis = false,
  disableBrushInteraction = false,
  showDiffIndicators = false,
  isMobile = false,
  barColor = '#8884d8',
  hideLiquidityBars = false,
  dashedMarkerLine,
  currentPrice,
  showTriangle = false,
  isFullRange = false,
  isBrushInstance = false
}: ActiveLiquidityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [brushExtent, setBrushExtent] = useState<[number, number]>(brushDomain || [min || 0, max || 1])
  const [isDragging, setIsDragging] = useState(false)

  // Filter and sort data
  const chartData = useMemo(() => {
    if (!series || series.length === 0) return []

    // 处理数据：保留所有数据，但处理极端值
    const processedData = series
      .map((entry: any) => {
        const activeLiquidity = xAccessor(entry) // x轴是流动性深度
        const price = yAccessor(entry) // y轴是价格

        // 处理极端价格值，而不是过滤掉
        let processedPrice = price
        if (price < 1e-10) {
          // 如果价格极小，设置为一个很小的合理值
          processedPrice = 1e-10
        } else if (price > 1e10) {
          // 如果价格极大，设置为一个很大的合理值
          processedPrice = 1e10
        }

        return {
          ...entry,
          price0: processedPrice,
          activeLiquidity: activeLiquidity > 0 ? activeLiquidity : 0
        }
      })
      .filter((entry: any) => {
        const activeLiquidity = xAccessor(entry)
        const price = yAccessor(entry)

        // 只过滤掉真正无效的数据
        return activeLiquidity >= 0 && isFinite(price) && isFinite(activeLiquidity)
      })

    return processedData.sort((a: any, b: any) => yAccessor(a) - yAccessor(b)) // 按价格排序
  }, [series, min, max])

  // Calculate scales using D3.js scaleLinear
  const scales = useMemo(() => {
    // if (chartData.length === 0) return null

    const maxLiquidity = Math.max(...chartData.map(xAccessor))
    const priceRange = (max || 1) - (min || 0)

    // Create D3.js scales - y轴是价格，x轴是流动性深度，从右向左画
    const xScale = scaleLinear()
      .domain([0, maxLiquidity]) // x轴是流动性深度
      .range([contentWidth, 0]) // 从右向左画

    const yScale = scaleLinear()
      .domain([min || 0, max || 1]) // y轴是价格范围
      .range([height, 0])

    return { xScale, yScale, maxLiquidity, priceRange }
  }, [chartData, min, max, height, contentWidth])

  // 移除 brushDomain 的 useEffect，让 Brush 组件完全自主管理状态
  // 避免状态循环更新导致回弹问题
  // useEffect(() => {
  //   if (brushDomain && !isDragging) {
  //     setBrushExtent(brushDomain)
  //   }
  // }, [brushDomain, isDragging])

  // 添加这个 useEffect 来监听 brushDomain 变化，更新 brush 滑杆位置
  useEffect(() => {
    if (brushDomain && !isDragging) {
      setBrushExtent(brushDomain)
    }
  }, [brushDomain, isDragging])

  // Handle brush changes
  const handleBrushChange = (extent: [number, number], mode?: string) => {
    if (mode === 'drag') {
      setIsDragging(true)
    } else {
      setIsDragging(false)
    }
    setBrushExtent(extent)
    onBrushDomainChange(extent, mode)
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      {isFullRange && (
        <div
          style={{
            width: `${width - 53}px`,
            height: '100%',
            background: 'rgba(59,130,246,0.15)',
            position: 'absolute',
            left: '0px',
            top: '0px'
          }}
        ></div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          overflow: 'hidden',
          // Safari兼容性：确保SVG正确渲染
          display: 'block'
        }}
        // Safari兼容性：添加viewBox确保正确的坐标系统
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Define clipping path to prevent elements from going outside chart area */}
        {isBrushInstance && (
          <defs>
            <clipPath id={`${id}-chart-clip`}>
              <rect x="0" y="0" width={isBrushInstance ? width - 53 : width} height={height} />
            </clipPath>
          </defs>
        )}

        {/* Background */}
        <rect width={width} height={height} fill="transparent" />

        {/* Liquidity area - using area chart like RangeChart */}
        <g clipPath={`url(#${id}-chart-clip)`}>
          {!hideLiquidityBars && scales && chartData.length > 0 && (
            <Area series={chartData} xScale={scales.xScale} yScale={scales.yScale} xValue={xAccessor} yValue={yAccessor} fill="#185880" opacity={1} />
          )}
        </g>

        {/* Chart content with clipping - only for bars */}
        <g clipPath={`url(#${id}-chart-clip)`}>
          {/* Brush domain indicators */}
          {brushDomain && showDiffIndicators && (
            <>
              <HorizontalLine
                value={brushDomain[0]}
                yScale={scales.yScale}
                width={width}
                height={height}
                axisLabelPaneWidth={axisLabelPaneWidth}
                color="var(--chakra-colors-text_caption)"
                strokeWidth={2}
                strokeDasharray="4,3"
              />
              <HorizontalLine
                value={brushDomain[1]}
                yScale={scales.yScale}
                width={width}
                height={height}
                axisLabelPaneWidth={axisLabelPaneWidth}
                color="var(--chakra-colors-text_caption)"
                strokeWidth={2}
                strokeDasharray="4,3"
              />
            </>
          )}
        </g>

        {/* Current price line - outside clipping to ensure it's always visible */}
        {current && (
          <g clipPath={`url(#${id}-chart-clip)`}>
            <HorizontalLine
              value={current}
              yScale={scales.yScale}
              width={width}
              height={height}
              axisLabelPaneWidth={axisLabelPaneWidth}
              color="#ccc"
              strokeWidth={1}
              strokeDasharray="4,3"
              showPriceLabel={false}
              // showTriangle={showTriangle}
            />
          </g>
        )}

        {/* Dashed marker lines - outside clipping to ensure they're always visible */}
        {/* {dashedMarkerLine && Array.isArray(dashedMarkerLine) && dashedMarkerLine.map((value, index) => (
          <HorizontalLine
            key={`dashed-marker-${index}`}
            value={value}
            yScale={scales.yScale}
            width={width}
            height={height}
            axisLabelPaneWidth={axisLabelPaneWidth}
            color="var(--chakra-colors-text_caption)"
            strokeWidth={1}
            strokeDasharray="4,3"
            showPriceLabel={false}
          />
        ))} */}

        {/* Brush component - with clipping */}
        {!disableBrush && scales && (
          <g clipPath={`url(#${id}-chart-clip)`}>
            <Brush
              id={id}
              yScale={scales.yScale}
              interactive={!disableBrushInteraction}
              brushExtent={brushExtent}
              setBrushExtent={handleBrushChange}
              width={width}
              height={height}
              currentPrice={currentPrice}
            />
          </g>
        )}

        {/* Right axis */}
        {!disableRightAxis && (
          <AxisRight yScale={scales.yScale} width={width} height={height} axisLabelPaneWidth={axisLabelPaneWidth} min={min || 0} max={max || 1} />
        )}
      </svg>

      {/* Tooltip */}
      <TickTooltip data={chartData} current={current} quoteCurrency={quoteCurrency} baseCurrency={baseCurrency} isMobile={isMobile} />
    </div>
  )
}
