import { d } from '@cetus/utils'
import { BrushBehavior, D3BrushEvent, ScaleLinear, brushY, format, select } from 'd3'
import { useEffect, useMemo, useRef, useState } from 'react'
import { OffScreenHandle } from '../svg'

// flips the handles draggers when close to the container edges
const FLIP_HANDLE_THRESHOLD_PX = 20

// margin to prevent tick snapping from putting the brush off screen
const BRUSH_EXTENT_MARGIN_PX = 2

/**
 * Returns true if every element in `a` maps to the
 * same pixel coordinate as elements in `b`
 */
// eslint-disable-next-line max-params
const compare = (a: [number, number], b: [number, number], yScale: ScaleLinear<number, number>): boolean => {
  // normalize pixels to 1 decimals
  const aNorm = a.map(y => yScale(y).toFixed(1))
  const bNorm = b.map(y => yScale(y).toFixed(1))
  return aNorm.every((v, i) => v === bNorm[i])
}

// Convert [minPrice, maxPrice] to [yMax, yMin]
const toYScale = (extent: [number, number], yScale: ScaleLinear<number, number>): [number, number] => {
  return [yScale(extent[1]), yScale(extent[0])]
}

// Convert [yMax, yMin] to [minPrice, maxPrice]
const toPriceExtent = (selection: [number, number], yScale: ScaleLinear<number, number>): [number, number] => {
  return [yScale.invert(selection[1]), yScale.invert(selection[0])]
}

// Calculate percentage difference between current price and target price
const calculatePercentageDiff = (currentPrice: number, targetPrice: number): string => {
  if (!currentPrice || !targetPrice) return ''

  const percent =
    (d(targetPrice).lt(currentPrice) ? -1 : 1) *
    ((Math.max(Number(targetPrice), Number(currentPrice)) - Math.min(Number(targetPrice), Number(currentPrice))) / Number(currentPrice)) *
    100
  // console.log('🚀 ~ percent:', percent)

  return Number(currentPrice) ? `${format(Math.abs(percent) > 1 ? '.2~s' : '.2~f')(percent)}%` : ''

  // 直接计算百分比差异：(目标价格 - 当前价格) / 当前价格 * 100
  //   const percent = ((targetPrice - currentPrice) / currentPrice) * 100

  // 格式化显示，保留整数
  //   return `${percent >= 0 ? '' : ''}${percent.toFixed(0)}%`
}

const normalizeExtent = (extent: [number, number]): [number, number] => (extent[0] < extent[1] ? extent : [extent[1], extent[0]])

export const Brush = ({
  id,
  yScale,
  interactive,
  brushExtent,
  setBrushExtent,
  hideHandles,
  width,
  height,
  currentPrice
}: {
  id: string
  yScale: ScaleLinear<number, number>
  interactive: boolean
  // [min, max] price values
  brushExtent: [number, number]
  setBrushExtent: (extent: [number, number], mode: string | undefined) => void
  width: number
  height: number
  hideHandles?: boolean
  currentPrice?: number
}) => {
  const brushRef = useRef<SVGGElement | null>(null)
  const brushBehavior = useRef<BrushBehavior<SVGGElement> | null>(null)

  // only used to drag the handles on brush for performance
  const [localBrushExtent, setLocalBrushExtent] = useState<[number, number] | null>(brushExtent)

  // keep local and external brush extent in sync
  // i.e. snap to ticks on brush end
  const brushInProgressRef = useRef(false)

  useEffect(() => {
    if (brushInProgressRef.current) {
      return
    }

    setLocalBrushExtent(brushExtent)
  }, [brushExtent])

  // initialize the brush
  useEffect(() => {
    if (!brushRef.current) {
      return
    }

    const normalizedExtent = normalizeExtent(brushExtent)
    const scaledExtent = toYScale(normalizedExtent, yScale)

    brushBehavior.current = brushY<SVGGElement>()
      .extent([
        // x0, y0 (top left)
        [0, BRUSH_EXTENT_MARGIN_PX],
        // x1, y1 (bottom right)
        [width, height - BRUSH_EXTENT_MARGIN_PX]
      ])
      .handleSize(30)
      .filter(() => interactive)
      .filter(event => {
        // Allow interactions only if the event target is part of the brush selection or handles
        const target = event.target as SVGElement
        return target.classList.contains('selection') || target.classList.contains('handle')
      })
      .on('brush', (event: D3BrushEvent<unknown>) => {
        const { selection } = event
        brushInProgressRef.current = true

        if (!selection) {
          setLocalBrushExtent(null)
          return
        }

        // Update only the local extent during dragging
        const priceExtent = normalizeExtent(toPriceExtent(selection as [number, number], yScale))
        setLocalBrushExtent(priceExtent)
      })
      .on('end', (event: D3BrushEvent<unknown>) => {
        const { selection, mode } = event
        console.log('1009##🚀 ~ Brush ~ selection:', selection)

        if (!selection) {
          setLocalBrushExtent(null)
          brushInProgressRef.current = false
          return
        }

        // 检查selection是否包含无效值
        if (selection?.includes(NaN) || selection?.includes(Infinity) || selection?.includes(-Infinity)) {
          console.warn('Invalid selection values detected:', selection)
          brushInProgressRef.current = false
          return
        }

        // Finalize state update on end
        const priceExtent = normalizeExtent(toPriceExtent(selection as [number, number], yScale))

        // 更严格的比较：检查价格差异是否足够大才触发更新
        const priceThreshold = localBrushExtent[0] > 0.0001 ? 0.0001 : localBrushExtent[0] * 0.01 // 价格差异阈值
        const hasSignificantChange =
          !localBrushExtent ||
          Math.abs(priceExtent[0] - localBrushExtent[0]) > priceThreshold ||
          Math.abs(priceExtent[1] - localBrushExtent[1]) > priceThreshold

        if (hasSignificantChange) {
          console.log('🚀 ~ Brush ~ significant change detected:', { old: normalizedExtent, new: priceExtent })
          setBrushExtent(priceExtent, mode)
        } else {
          console.log('🚀 ~ Brush ~ no significant change, skipping update')
        }

        setLocalBrushExtent(priceExtent)
        brushInProgressRef.current = false
      })

    brushBehavior.current(select(brushRef.current))

    select(brushRef.current).selectAll('.overlay').attr('cursor', 'default')

    // brush linear gradient
    select(brushRef.current)
      .selectAll('.selection')
      .attr('stroke', 'none')
      .attr('fill-opacity', '0.15')
      .attr('fill', `url(#${id}-gradient-selection)`)
      .attr('cursor', 'grab')
  }, [brushExtent, id, height, interactive, yScale, width, setBrushExtent])

  // respond to yScale changes only
  useEffect(() => {
    if (!brushRef.current || !brushBehavior.current) {
      return
    }

    brushBehavior.current.move(select(brushRef.current) as any, normalizeExtent(toYScale(brushExtent as [number, number], yScale)))
  }, [brushExtent, yScale])

  const normalizedBrushExtent = normalizeExtent(localBrushExtent ?? brushExtent)
  const flipNorthHandle = yScale(normalizedBrushExtent[1]) < FLIP_HANDLE_THRESHOLD_PX
  const flipSouthHandle = yScale(normalizedBrushExtent[0]) > height - FLIP_HANDLE_THRESHOLD_PX

  const showNorthArrow = yScale(normalizedBrushExtent[0]) < 0 || yScale(normalizedBrushExtent[1]) < 0
  const showSouthArrow = yScale(normalizedBrushExtent[0]) > height || yScale(normalizedBrushExtent[1]) > height

  const southHandleInView = yScale(normalizedBrushExtent[0]) >= 0 && yScale(normalizedBrushExtent[0]) <= height
  const northHandleInView = yScale(normalizedBrushExtent[1]) >= 0 && yScale(normalizedBrushExtent[1]) <= height

  return useMemo(
    () => (
      <>
        <defs>
          <linearGradient id={`${id}-gradient-selection`} x1="0%" y1="100%" x2="100%" y2="100%">
            <stop stopColor="#3B82F6" />
            <stop stopColor="#3B82F6" offset="1" />
          </linearGradient>

          {/* clips at exactly the svg area */}
          <clipPath id={`${id}-brush-clip`}>
            <rect x={0} y="0" width={width} height={height} />
          </clipPath>
        </defs>

        {/* will host the d3 brush */}
        <g ref={brushRef} clipPath={`url(#${id}-brush-clip)`} />

        {/* custom brush handles */}
        {!hideHandles && (
          <>
            {northHandleInView ? (
              <g
                // transform={`translate(0, ${Math.max(0, yScale(normalizedBrushExtent[1]))}), scale(1, ${
                //   flipNorthHandle ? '1' : '-1'
                // })`}

                transform={`translate(0, ${Math.max(0, yScale(normalizedBrushExtent[1]))})`}
                cursor={interactive ? 'ns-resize' : 'default'}
                pointerEvents="none"
              >
                <g>
                  {/* 细线手柄 */}
                  <line x1={0} y1={0} x2={width} y2={0} stroke="#3EC6FF" strokeWidth={2} />
                  {/* 百分比标签 */}
                  {currentPrice && (
                    <g>
                      <rect x={0} y={-8} width={60} height={16} fill="#374151" rx={8} />
                      <text x={30} y={0} fill="#fff" fontSize={10} textAnchor="middle" alignmentBaseline="middle">
                        {calculatePercentageDiff(currentPrice, normalizedBrushExtent[1])}
                      </text>
                    </g>
                  )}

                  {/* 长方形背景 */}
                  <rect x={width / 2 - 8} y={-4} width={16} height={8} fill="#3EC6FF" rx={2} />
                  {/* 向上尖号指示器 */}
                  <path d={`M ${width / 2 - 3} 1.2 L ${width / 2} -1.2 L ${width / 2 + 3} 1.2`} stroke="#000" strokeWidth={1} fill="none" />
                </g>
              </g>
            ) : null}

            {southHandleInView ? (
              <g transform={`translate(0, ${yScale(normalizedBrushExtent[0])})`} cursor={interactive ? 'ns-resize' : 'default'} pointerEvents="none">
                <g>
                  {/* 细线手柄 */}
                  <line x1={0} y1={0} x2={width} y2={0} stroke="#3EFFDD" strokeWidth={2} />

                  {/* 百分比标签 */}
                  {currentPrice && (
                    <g>
                      <rect x={0} y={-8} width={60} height={16} fill="#374151" rx={8} />
                      <text x={30} y={0} fill="#fff" fontSize={10} textAnchor="middle" alignmentBaseline="middle">
                        {calculatePercentageDiff(currentPrice, normalizedBrushExtent[0])}
                      </text>
                    </g>
                  )}

                  {/* 长方形背景 */}
                  <rect x={width / 2 - 8} y={-4} width={16} height={8} fill="#3EFFDD" rx={2} />
                  {/* 向下尖号指示器 */}
                  <path d={`M ${width / 2 - 3} -1.2 L ${width / 2} 1.2 L ${width / 2 + 3} -1.2`} stroke="#000" strokeWidth={1} fill="none" />
                </g>
              </g>
            ) : null}

            {showNorthArrow && (
              <g transform="translate(18, 16) scale(1,-1)">
                <OffScreenHandle color="rgba(59, 130, 246, 1)" />
                <text x={14} y={-3} fill="rgba(59, 130, 246, 1)" fontSize={10} alignmentBaseline="middle" transform="scale(1,-1)">
                  Out of view
                </text>
              </g>
            )}
            {showSouthArrow && (
              <g transform={`translate(18, ${height - 16}) `}>
                <OffScreenHandle color="rgba(59, 130, 246, 1)" />
                {!showNorthArrow && (
                  <text x={14} y={5} fill="rgba(59, 130, 246, 1)" fontSize={10} alignmentBaseline="middle">
                    Out of view
                  </text>
                )}
              </g>
            )}
          </>
        )}
      </>
    ),
    [
      id,
      width,
      height,
      normalizedBrushExtent,
      hideHandles,
      northHandleInView,
      yScale,
      flipNorthHandle,
      interactive,
      southHandleInView,
      flipSouthHandle,
      showNorthArrow,
      showSouthArrow,
      currentPrice
    ]
  )
}
