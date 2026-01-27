import { VStack } from '@chakra-ui/react'
import { ZoomTransform, max, scaleLinear } from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bound } from './types'

import { getRangeChartGap } from '@/utils/clmm'
import { d, removeComma } from '@cetus/utils'
import { Area } from './Area3'
import { AxisBottom } from './AxisBottom'
import { Brush } from './Brush'
import { BrushH5 } from './BrushH5'
import { DashedLine } from './DashedLine'
import { Line } from './Line'
import Zoom, { ZoomOverlay } from './Zoom'
import { ChartEntry, LiquidityChartRangeInputProps } from './types'

const xAccessor = (d: ChartEntry) => d?.price
const yAccessor = (d: ChartEntry) => d?.depth

function getSeriesWithRegion(series: any, xRange: any) {
  return series?.filter((item: any) => d(item.price).gte(xRange[0]) && d(item.price).lte(xRange[1]))
}

export function Chart({
  id = 'liquidityChartRangeInput',
  data: { series, current },
  ticksAtLimit,
  styles,
  dimensions: { width, height },
  margins,
  interactive = true,
  brushDomain,
  brushLabels,
  onBrushDomainChange,
  handleClickRefresh,
  zoomLevels,
  showZoomButtons = true,
  isPosition = false,
  hideBrush = false,
  isReverse = false,
  isSorted = true,
  readonly = false,
  dashedMarkerLine = [],
  currentRange = '',
  constantPrice,
  isApp,
  isFrom
}: LiquidityChartRangeInputProps) {
  const zoomRef = useRef<SVGRectElement | null>(null)

  const [zoom, setZoom] = useState<ZoomTransform | null>(null)
  const [innerHeight, innerWidth] = useMemo(
    () => [height - margins.top - margins.bottom, width - margins.left - margins.right],
    [width, height, margins]
  )

  const { xScale, yScale } = useMemo(() => {
    const xInitialRange = [constantPrice * zoomLevels.initialMin, constantPrice * zoomLevels.initialMax]
    // const xInitialRange = [1, 10]
    let xRange = xInitialRange

    if (brushDomain && String(brushDomain?.[0]) !== '∞' && String(brushDomain?.[1]) !== '∞') {
      if (brushDomain?.[0] === brushDomain?.[1]) {
        xRange = [Number(brushDomain?.[0]) - brushDomain?.[0] * 0.01, Number(brushDomain?.[0]) + brushDomain?.[0] * 0.01]
      } else {
        const brushDomainGap = getRangeChartGap(brushDomain)

        if (isPosition) {
          if (d(constantPrice).lt(brushDomain[0])) {
            xRange = [d(constantPrice).minus(brushDomainGap).toNumber(), d(brushDomain[1]).plus(brushDomainGap).toNumber()]
          } else if (d(constantPrice).gt(brushDomain[1])) {
            xRange = [d(brushDomain[0]).minus(brushDomainGap).toNumber(), d(constantPrice).plus(d(brushDomainGap).mul(1.5)).toNumber()]
          } else {
            xRange = [d(brushDomain[0]).minus(brushDomainGap).toNumber(), d(brushDomain[1]).plus(brushDomainGap).toNumber()]
          }
        } else {
          xRange = [d(brushDomain[0]).minus(brushDomainGap).toNumber(), d(brushDomain[1]).plus(brushDomainGap).toNumber()]
        }
      }
    } else {
      // full range处理
      if ((Number(constantPrice) / 10, Number(constantPrice) - constantPrice * 2 > 0)) {
        xRange = [
          Math.max(d(0).add(d(constantPrice).div(10)).toNumber(), d(constantPrice).minus(d(constantPrice).mul(2)).toNumber()),
          d(constantPrice).add(d(constantPrice).mul(2)).toNumber()
        ]
      } else {
        xRange = [0, d(constantPrice).mul(2).toNumber()]
      }
    }

    // 确保 xRange 是有效的，避免 brush 无法工作
    if (!xRange[0] || !xRange[1] || xRange[0] >= xRange[1] || !isFinite(xRange[0]) || !isFinite(xRange[1])) {
      xRange = xInitialRange
    }

    // 当 series 为空时，给 yScale 一个默认的 domain，避免 undefined 导致的问题
    const maxDepth = series && series.length > 0 ? max(series, yAccessor) : 1
    const yDomain: [number, number] = [0, maxDepth ?? 1]

    const scales: any = {
      xScale: scaleLinear().domain(xRange).range([0, innerWidth]),
      yScale: scaleLinear().domain(yDomain).range([innerHeight, 0])
    }

    if (zoom) {
      const newXscale = zoom.rescaleX(scales.xScale)
      scales.xScale.domain(newXscale.domain())
    }

    return scales
  }, [constantPrice, zoomLevels.initialMin, zoomLevels.initialMax, innerWidth, series, innerHeight, zoom, brushDomain])

  useEffect(() => {
    setZoom(null)
  }, [zoomLevels, currentRange])

  useEffect(() => {
    if (!brushDomain) {
      onBrushDomainChange(xScale.domain() as [number, number], undefined)
    }
  }, [brushDomain, onBrushDomainChange, xScale])

  const [zoomRefValue, setZoomRefValue] = useState<any>(undefined)
  useEffect(() => {
    setZoomRefValue(zoomRef.current)
  }, [zoomRef.current])

  return (
    <VStack
      w="100%"
      h="100%"
      sx={{
        '@media screen and (max-width: 1000px)': {
          display: 'block'
        }
      }}
    >
      {/* {showZoomButtons && ( */}

      {!isPosition && zoomRefValue && !isApp && (
        <Zoom
          svg={zoomRefValue}
          xScale={xScale}
          setZoom={setZoom}
          width={innerWidth}
          height={
            // allow zooming inside the x-axis
            height
          }
          resetBrush={() => {
            onBrushDomainChange([constantPrice * zoomLevels.initialMin, constantPrice * zoomLevels.initialMax] as [number, number], 'reset')
          }}
          showResetButton={Boolean(ticksAtLimit[Bound.LOWER] || ticksAtLimit[Bound.UPPER])}
          zoomLevels={zoomLevels}
          isFrom={isFrom}
          currentRange={currentRange}
          handleClickRefresh={handleClickRefresh}
          isApp={isApp}
        />
      )}
      {/* )} */}
      {/* <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}> */}
      <svg width="100%" height="245px" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
            {/* <stop offset="5%" stopColor={theme.colors.success} stopOpacity={1} />
            <stop offset="100%" stopColor={theme.colors.success} stopOpacity={0.2} /> */}
            <stop offset="5%" stopColor="var(--chakra-colors-range_chart_bg)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--chakra-colors-range_chart_bg)" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
            {/* <stop offset="5%" stopColor={theme.colors.failure} stopOpacity={1} />
            <stop offset="100%" stopColor={theme.colors.failure} stopOpacity={0.2} /> */}
            <stop offset="5%" stopColor="var(--chakra-colors-range_chart_bg)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--chakra-colors-range_chart_bg)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <defs>
          <clipPath id={`${id}-chart-clip`}>
            <rect x="0" y="0" width={innerWidth} height={height} />
          </clipPath>

          {brushDomain && (
            // mask to highlight selected area
            <mask id={`${id}-chart-area-mask`}>
              <rect
                // fill="white"
                fill="red"
                x={xScale(brushDomain[0])}
                y="0"
                width={xScale(brushDomain[1]) - xScale(brushDomain[0])}
                height={innerHeight}
              />
            </mask>
          )}
        </defs>

        <g transform={`translate(${margins.left},${margins.top})`}>
          <g clipPath={`url(#${id}-chart-clip)`}>
            <Area series={series} xScale={xScale} yScale={yScale} xValue={xAccessor} yValue={yAccessor} opacity={1} fill="#195780" />
            {/* <Area series={leftSeries} xScale={xScale} yScale={yScale} xValue={xAccessor} yValue={yAccessor} opacity={1} fill="#195780" />
            <Area series={rightSeries} xScale={xScale} yScale={yScale} xValue={xAccessor} yValue={yAccessor} opacity={1} fill="#195780" /> */}

            {/* <Area
              series={series}
              xScale={xScale}
              yScale={yScale}
              xValue={xAccessor}
              yValue={yAccessor}
              opacity={1}
              fill="var(--chakra-colors-range_chart_bg)"
              isSorted={isSorted}
            /> */}

            {/* {brushDomain && (
              // duplicate area chart with mask for selected area
              <g mask={`url(#${id}-chart-area-mask)`}>
                <Area opacity={0.1} series={series} xScale={xScale} yScale={yScale} xValue={xAccessor} yValue={yAccessor} fill="white" />
              </g>
            )} */}

            <Line value={current} xScale={xScale} innerHeight={innerHeight} />

            {dashedMarkerLine?.map((item: any, index: number) => {
              return <DashedLine key={item + index} value={Number(removeComma(item))} xScale={xScale} innerHeight={innerHeight} />
            })}

            <AxisBottom xScale={xScale} innerHeight={innerHeight} isPosition={isPosition} />
          </g>

          <ZoomOverlay className="zoom-overlay" width={innerWidth} height={height} ref={zoomRef} />
          {/* {!hideBrush ? ( */}
          {isApp ? (
            <BrushH5
              id={id}
              xScale={xScale}
              interactive={interactive}
              brushLabelValue={brushLabels}
              brushExtent={brushDomain ?? (xScale.domain() as [number, number])}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
              setBrushExtent={onBrushDomainChange}
              westHandleColor={styles.brush.handle.west}
              eastHandleColor={styles.brush.handle.east}
              readonly={readonly}
              isSorted={isSorted}
              isFullRange={!brushDomain}
            />
          ) : (
            <Brush
              id={id}
              xScale={xScale}
              interactive={interactive}
              brushLabelValue={brushLabels}
              brushExtent={brushDomain ?? (xScale.domain() as [number, number])}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
              setBrushExtent={onBrushDomainChange}
              westHandleColor={styles.brush.handle.west}
              eastHandleColor={styles.brush.handle.east}
              readonly={readonly}
              isSorted={isSorted}
              isFullRange={!brushDomain}
            />
          )}
          {/* ) : null} */}
        </g>
      </svg>
    </VStack>
  )
}
