import { usePreviousValue } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { BrushBehavior, D3BrushEvent, ScaleLinear, brushX, select } from 'd3'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { brushHandleAccentPath, brushHandlePath } from './svg'

const theme = {
  colors: {
    background: 'var(--chakra-colors-card_bg)',
    // secondary: 'var(--chakra-colors-primary)'
    secondary: '#30D4B7',
    leftHandle: '#30D4B7',
    rightHandle: '#6297EA'
  }
}

const Handle = styled.path<{ color: string }>`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 3;
  stroke: ${({ color }) => color};
  fill: ${({ color }) => color};
`

const HandleAccent = styled.path`
  cursor: ew-resize;
  pointer-events: none;

  stroke-width: 1.5;
  stroke: #fff;
  opacity: ${theme.colors.background};
  fill: ${theme.colors.background};
`

const LabelGroup = styled.g<{ visible: boolean }>`
  opacity: ${({ visible }) => (visible ? '1' : '0')};
  transition: opacity 300ms;
`

const TooltipBackground = styled.rect`
  fill: #192128;
`

const TooltipLeftBackground = styled.rect`
  fill: #0f0f0f;
  stroke: #2a3238;
  stroke-width: 1;
`

const TooltipRightBackground = styled.rect`
  fill: #0f0f0f;
  stroke: #2a3238;
  stroke-width: 1;
`

const Tooltip = styled.text`
  text-anchor: middle;
  font-size: 13px;
  fill: #fff;
`

// flips the handles draggers when close to the container edges
// 当靠近容器边缘时翻转手柄拖动器
const FLIP_HANDLE_THRESHOLD_PX = 20

// margin to prevent tick snapping from putting the brush off screen
// 边距以防止蜱虫折断使画笔离开屏幕
const BRUSH_EXTENT_MARGIN_PX = 2

/**
 * Returns true if every element in `a` maps to the
 * same pixel coordinate as elements in `b`
 */
/**
 * 如果 `a` 中的每个元素都映射到
 * 与“b”中元素相同的像素坐标
 */
const compare = (a: [number, number], b: [number, number], xScale: ScaleLinear<number, number>): boolean => {
  // normalize pixels to 1 decimals
  const aNorm = a.map(x => xScale(x).toFixed(11))
  const bNorm = b.map(x => xScale(x).toFixed(11))
  return aNorm.every((v, i) => v === bNorm[i])
}

// Normalize extent to ensure [min, max] order
const normalizeExtent = (extent: [number, number]): [number, number] => (extent[0] < extent[1] ? extent : [extent[1], extent[0]])

export const Brush = memo(
  ({
    id,
    xScale,
    interactive,
    brushLabelValue,
    brushExtent,
    setBrushExtent,
    innerWidth,
    innerHeight,
    westHandleColor,
    eastHandleColor,
    readonly,
    isSorted,
    isFullRange
  }: {
    id: string
    xScale: ScaleLinear<number, number>
    interactive: boolean
    brushLabelValue: (d: 'w' | 'e', x: number) => string
    brushExtent: [number, number]
    setBrushExtent: (extent: [number, number], mode: string | undefined) => void
    innerWidth: number
    innerHeight: number
    westHandleColor: string
    eastHandleColor: string
    readonly?: boolean
    isSorted: boolean
    isFullRange?: boolean
  }) => {
    // const { theme } = useTheme()
    const brushRef = useRef<SVGGElement | null>(null)
    const brushBehavior = useRef<BrushBehavior<SVGGElement> | null>(null)

    // only used to drag the handles on brush for performance
    const [localBrushExtent, setLocalBrushExtent] = useState<[number, number] | null>(brushExtent)
    const [showLabels, setShowLabels] = useState(false)
    const [hovering, setHovering] = useState(false)

    const previousBrushExtent = usePreviousValue(brushExtent)

    // keep local and external brush extent in sync
    // i.e. snap to ticks on brush end
    const brushInProgressRef = useRef(false)

    // keep local and external brush extent in sync
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

      // 如果正在拖动中，不要重新初始化brush
      if (brushInProgressRef.current) {
        return
      }

      const normalizedExtent = normalizeExtent(brushExtent)

      // 确保 extent 的计算是安全的，即使 xScale domain 不包含 0
      const xDomain = xScale.domain()
      const xMin = Math.min(xDomain[0], 0)
      const xMinPixel = Math.max(0 + BRUSH_EXTENT_MARGIN_PX, xScale(xMin))

      brushBehavior.current = brushX<SVGGElement>()
        .extent([
          [xMinPixel, 0],
          [innerWidth - BRUSH_EXTENT_MARGIN_PX, innerHeight]
        ])
        .handleSize(30)
        .filter(() => interactive)
        .on('brush', (event: D3BrushEvent<unknown>) => {
          const { selection } = event
          brushInProgressRef.current = true

          if (!selection) {
            setLocalBrushExtent(null)
            return
          }

          // Update only the local extent during dragging
          const scaled = normalizeExtent((selection as [number, number]).map(xScale.invert) as [number, number])
          setLocalBrushExtent(scaled)
        })
        .on('end', (event: D3BrushEvent<unknown>) => {
          const { selection, mode } = event
          console.log('1210###🚀 ~ selection:', selection)

          if (!selection) {
            setLocalBrushExtent(null)
            brushInProgressRef.current = false
            return
          }

          // 检查selection是否包含无效值
          const selectionArray = selection as [number, number]
          if (selectionArray?.includes(NaN) || selectionArray?.includes(Infinity) || selectionArray?.includes(-Infinity)) {
            console.warn('Invalid selection values detected:', selection)
            brushInProgressRef.current = false
            return
          }

          // Finalize state update on end
          const scaled = normalizeExtent((selection as [number, number]).map(xScale.invert) as [number, number])

          // 更严格的比较：检查价格差异是否足够大才触发更新
          let hasSignificantChange = !localBrushExtent
          if (localBrushExtent) {
            const priceThreshold = localBrushExtent[0] > 0.0001 ? 0.00001 : localBrushExtent[0] * 0.01 // 价格差异阈值
            hasSignificantChange =
              Math.abs(scaled[0] - localBrushExtent[0]) > priceThreshold || Math.abs(scaled[1] - localBrushExtent[1]) > priceThreshold
          }

          if (hasSignificantChange) {
            console.log('🚀 ~ RangeChart Brush ~ significant change detected:', { old: normalizedExtent, new: scaled })
            setBrushExtent(scaled, mode)
          } else {
            console.log('🚀 ~ RangeChart Brush ~ no significant change, skipping update')
          }
          setLocalBrushExtent(scaled)
          brushInProgressRef.current = false
        })

      brushBehavior.current(select(brushRef.current))

      // 确保 brush 有初始的 extent，即使 series 为空也能正常工作
      if (brushExtent && brushExtent.length === 2 && isFinite(brushExtent[0]) && isFinite(brushExtent[1])) {
        try {
          const brushPixels = normalizeExtent(brushExtent).map(xScale)
          if (brushPixels.every(p => isFinite(p))) {
            if (previousBrushExtent && compare(brushExtent, previousBrushExtent, xScale)) {
              select(brushRef.current)
                .transition()
                .call(brushBehavior.current.move as any, brushPixels)
            } else {
              // 如果没有 previousBrushExtent，直接设置初始位置
              select(brushRef.current).call(brushBehavior.current.move as any, brushPixels)
            }
          }
        } catch (error) {
          console.warn('Failed to set initial brush extent:', error)
        }
      } else {
        // 如果 brushExtent 无效，使用 xScale 的 domain 作为默认值，确保 brush 可以被拖动
        try {
          const xDomain = xScale.domain()
          if (xDomain.length === 2 && isFinite(xDomain[0]) && isFinite(xDomain[1])) {
            const defaultExtent: [number, number] = [xDomain[0], xDomain[1]]
            const brushPixels = normalizeExtent(defaultExtent).map(xScale)
            if (brushPixels.every(p => isFinite(p))) {
              select(brushRef.current).call(brushBehavior.current.move as any, brushPixels)
            }
          }
        } catch (error) {
          console.warn('Failed to set default brush extent:', error)
        }
      }

      // brush linear gradient
      select(brushRef.current).selectAll('.selection').attr('stroke', 'none').attr('fill', 'rgba(118, 200, 255, 0.4)')
    }, [brushExtent, id, innerHeight, innerWidth, interactive, previousBrushExtent, xScale, setBrushExtent])

    // respond to xScale changes only
    useEffect(() => {
      if (!brushRef.current || !brushBehavior.current) {
        return
      }

      // 如果正在拖动中，不要响应外部的brushExtent变化
      if (brushInProgressRef.current) {
        return
      }

      brushBehavior.current.move(select(brushRef.current) as any, normalizeExtent(brushExtent as [number, number]).map(xScale) as any)
    }, [brushExtent, xScale])

    // show labels when local brush changes
    // 局部画笔更改时显示标签
    useEffect(() => {
      setShowLabels(true)
      const timeout = setTimeout(() => setShowLabels(false), 1500)
      return () => clearTimeout(timeout)
    }, [localBrushExtent])

    // variables to help render the SVGs
    const normalizedBrushExtent = normalizeExtent(localBrushExtent ?? brushExtent)
    const flipWestHandle = xScale(normalizedBrushExtent[0]) > FLIP_HANDLE_THRESHOLD_PX
    const flipEastHandle = xScale(normalizedBrushExtent[1]) > innerWidth - FLIP_HANDLE_THRESHOLD_PX

    const showWestArrow = xScale(normalizedBrushExtent[0]) < 0 || xScale(normalizedBrushExtent[1]) < 0
    const showEastArrow = xScale(normalizedBrushExtent[0]) > innerWidth || xScale(normalizedBrushExtent[1]) > innerWidth

    const westHandleInView = isFullRange ? true : xScale(normalizedBrushExtent[0]) >= 0 && xScale(normalizedBrushExtent[0]) <= innerWidth
    const eastHandleInView = isFullRange ? true : xScale(normalizedBrushExtent[1]) >= 0 && xScale(normalizedBrushExtent[1]) <= innerWidth

    const { isApp } = useWindowWidth()
    return useMemo(
      () => (
        <>
          <defs>
            <linearGradient id={`${id}-gradient-selection`} x1="0%" y1="100%" x2="100%" y2="100%">
              <stop stopColor={westHandleColor} />
              <stop stopColor={eastHandleColor} offset="1" />
            </linearGradient>

            {/* clips at exactly the svg area */}
            <clipPath id={`${id}-brush-clip`}>
              <rect x="0" y="0" width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>

          {/* will host the d3 brush */}
          <g ref={brushRef} clipPath={`url(#${id}-brush-clip)`} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)} />

          {/* custom brush handles */}
          {normalizedBrushExtent && !readonly && (
            <>
              {/* west handle */}
              {!readonly && westHandleInView ? (
                <g transform={`translate(${Math.max(0, xScale(normalizedBrushExtent[0]))}, 0), scale(${flipWestHandle ? '-1' : '1'}, 1)`}>
                  <g>
                    {/* <Handle color={theme.colors.secondary} d={brushHandlePath(innerHeight)} /> */}
                    {/* <Handle color={isSorted ? theme.colors.leftHandle : theme.colors.rightHandle} d={brushHandlePath(innerHeight)} /> */}
                    <Handle color={theme.colors.leftHandle} d={brushHandlePath(innerHeight)} />
                    <HandleAccent d={brushHandleAccentPath()} />
                  </g>

                  {/* {!isFullRange && ( */}
                  <LabelGroup
                    transform={`translate(${isApp ? '10 35' : '50,0'}), scale(${flipWestHandle ? '1' : '-1'}, 1)`}
                    visible={showLabels || hovering}
                  >
                    <TooltipBackground y="0" x="-30" height="28" width="60" rx="8" />
                    {isSorted ? (
                      <TooltipLeftBackground y="0" x="-30" height="28" width="60" rx="8" />
                    ) : (
                      <TooltipRightBackground y="0" x="-30" height="28" width="60" rx="8" />
                    )}
                    <Tooltip transform="scale(-1, 1)" y="15" dominantBaseline="middle">
                      {isFullRange ? '0' : brushLabelValue('w', normalizedBrushExtent[0])}
                    </Tooltip>
                  </LabelGroup>
                  {/* )} */}
                </g>
              ) : null}

              {/* east handle */}
              {!readonly && eastHandleInView ? (
                <g transform={`translate(${xScale(normalizedBrushExtent[1])}, 0), scale(${flipEastHandle ? '-1' : '1'}, 1)`}>
                  <g>
                    {/* <Handle color={theme.colors.secondary} d={brushHandlePath(innerHeight)} /> */}
                    {/* <Handle color={isSorted ? theme.colors.rightHandle : theme.colors.leftHandle} d={brushHandlePath(innerHeight)} /> */}
                    <Handle color={theme.colors.rightHandle} d={brushHandlePath(innerHeight)} />
                    <HandleAccent d={brushHandleAccentPath()} />
                  </g>

                  {/* {!isFullRange && ( */}
                  <LabelGroup
                    transform={`translate(${isApp ? '10 35' : '50,0'}), scale(${flipEastHandle ? '-1' : '1'}, 1)`}
                    visible={showLabels || hovering}
                  >
                    <TooltipBackground y="0" x="-30" height="28" width="60" rx="8" />
                    {isSorted ? (
                      <TooltipRightBackground y="0" x="-30" height="28" width="60" rx="8" />
                    ) : (
                      <TooltipLeftBackground y="0" x="-30" height="28" width="60" rx="8" />
                    )}
                    <Tooltip y="15" dominantBaseline="middle">
                      {isFullRange ? '∞' : brushLabelValue('e', normalizedBrushExtent[1])}
                    </Tooltip>
                  </LabelGroup>
                  {/* )} */}
                </g>
              ) : null}

              {/* {showWestArrow && <OffScreenHandle color={westHandleColor} />}

              {showEastArrow && (
                <g transform={`translate(${innerWidth}, 0) scale(-1, 1)`}>
                  <OffScreenHandle color={eastHandleColor} />
                </g>
              )} */}
            </>
          )}
        </>
      ),
      [
        brushLabelValue,
        eastHandleColor,
        eastHandleInView,
        flipEastHandle,
        flipWestHandle,
        hovering,
        id,
        theme,
        innerHeight,
        innerWidth,
        normalizedBrushExtent,
        showEastArrow,
        showLabels,
        showWestArrow,
        westHandleColor,
        westHandleInView,
        xScale,
        isApp
      ]
    )
  }
)
