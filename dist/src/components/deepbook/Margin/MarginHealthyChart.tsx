import { colorMap } from '@/constant/deepbook'
import { CetusTooltip } from '@cetus/design'
import { d, formatNumberFloor } from '@cetus/utils'
import { Box, Text, VStack } from '@chakra-ui/react'
import * as d3 from 'd3'
import { useMemo } from 'react'

type MarginHealthyChartProps = {
  value: number // 健康度值，范围 1-4
  status?: string // 状态文本，如 "Healthy"
  afterValue?: number // 操作后的健康度值
  actionType?: 'Deposit' | 'Withdraw' | 'Repay' // 操作类型
  minBorrowRatio?: number // 最小借贷风险比率，默认 1.25
  minWithdrawRatio?: number // 最小提取风险比率，默认 2
  tooltip?: string // 提示文本
  isNoMarginManager?: boolean // 是否没有 margin manager
}

// 颜色插值函数
const interpolateColor = (color1: string, color2: string, ratio: number): string => {
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')
  const r1 = parseInt(hex1.substring(0, 2), 16)
  const g1 = parseInt(hex1.substring(2, 4), 16)
  const b1 = parseInt(hex1.substring(4, 6), 16)
  const r2 = parseInt(hex2.substring(0, 2), 16)
  const g2 = parseInt(hex2.substring(2, 4), 16)
  const b2 = parseInt(hex2.substring(4, 6), 16)

  const r = Math.round(r1 + (r2 - r1) * ratio)
  const g = Math.round(g1 + (g2 - g1) * ratio)
  const b = Math.round(b1 + (b2 - b1) * ratio)

  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}

// 根据值获取颜色配置
const getColorForValue = (val: number, minBorrowRatio: number, minWithdrawRatio: number): { color: string; bg: string } => {
  const clamped = Math.max(1, Math.min(4, val))
  // 如果 minWithdrawRatio <= minBorrowRatio，使用默认值 2 以确保 Medium risk 区间存在
  const effectiveMinWithdrawRatio = minWithdrawRatio > minBorrowRatio ? minWithdrawRatio : Math.max(2, minBorrowRatio + 0.1)
  if (clamped <= minBorrowRatio) return colorMap[1] // Risky - 红色
  if (clamped < effectiveMinWithdrawRatio) return colorMap[2] // Medium risk - 黄色
  return colorMap[3] // Healthy - 绿色
}

// 根据值获取状态文本
const getStatusForValue = (val: number, minBorrowRatio: number, minWithdrawRatio: number): string => {
  const clamped = Math.max(1, Math.min(4, val))
  // 如果 minWithdrawRatio <= minBorrowRatio，使用默认值 2 以确保 Medium risk 区间存在
  const effectiveMinWithdrawRatio = minWithdrawRatio > minBorrowRatio ? minWithdrawRatio : Math.max(2, minBorrowRatio + 0.1)
  if (clamped <= minBorrowRatio) return 'Risky'
  if (clamped < effectiveMinWithdrawRatio) return 'Medium risk'
  return 'Low risk'
}

// 将值 1-4 映射到角度 180-0（半圆）
const getAngleForValue = (val: number): number => {
  const clamped = Math.max(1, Math.min(4, val))
  return 180 - ((clamped - 1) / 3) * 180
}

// 角度转弧度
const degToRad = (deg: number): number => (deg * Math.PI) / 180

function TriangleArrow({ color, rotation = 0 }: { color: string; rotation?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="8px"
      height="8px"
      viewBox="0 0 8 8"
      version="1.1"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
          <stop stopColor={color} stopOpacity="0.6" offset="0%" />
          <stop stopColor={color} stopOpacity="0.3" offset="100%" />
        </linearGradient>
      </defs>
      <g id="DEEPBOOK-Margin" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Margin-Deposit" transform="translate(-757, -474)" fill="url(#linearGradient-1)" fillRule="nonzero">
          <g id="编组-71" transform="translate(544, 333)">
            <g id="编组-25备份-6" transform="translate(16, 52)">
              <g id="编组" transform="translate(16, 20)">
                <g transform="translate(76, -0.1139)" id="编组-73">
                  <g transform="translate(71, 58.3518)">
                    <g id="编组-66" transform="translate(38, 14.7621) rotate(-90) translate(-38, -14.7621)translate(34, 10.7621)">
                      <path
                        d="M0.252667575,0.126351785 C0.531715415,-0.0829331229 0.927588112,-0.0263801432 1.13687399,0.252666401 L3.66317804,3.62105615 C3.83159831,3.84561547 3.83159831,4.15438453 3.66317804,4.37894385 L1.13687399,7.7473336 C0.927588112,8.02638014 0.531715415,8.08293312 0.252667575,7.87364822 C-0.0263802657,7.66436331 -0.0829335082,7.26849245 0.126352372,6.98944591 L2.36886827,4 L0.126352372,1.01055409 C-0.0639075191,0.756875419 -0.0344656559,0.406647722 0.182112578,0.187827628 L0.252667575,0.126351785 Z M4.46317433,0.126351785 C4.74222217,-0.0829331229 5.13809487,-0.0263801432 5.34738075,0.252666401 L7.8736848,3.62105615 C8.04210507,3.84561547 8.04210507,4.15438453 7.8736848,4.37894385 L5.34738075,7.7473336 C5.13809487,8.02638014 4.74222217,8.08293312 4.46317433,7.87364822 C4.18412649,7.66436331 4.12757324,7.26849245 4.33685912,6.98944591 L6.57937502,4 L4.33685912,1.01055409 C4.14659923,0.756875419 4.1760411,0.406647722 4.39261933,0.187827628 L4.46317433,0.126351785 Z"
                        id="形状结合"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

const MarginHealthyChart = ({
  value,
  afterValue,
  actionType,
  minBorrowRatio = 1.25,
  minWithdrawRatio = 2,
  tooltip = '',
  isNoMarginManager = false
}: MarginHealthyChartProps) => {
  const width = 200
  const height = 120
  const cx = width / 2 // 居中
  const cy = height - 10
  const innerRadius = 70
  const outerRadius = 78
  const labelRadius = outerRadius + 12 // 调整标签距离，使其与线段有更合适的间距
  const spacingWidth = 2 // 2px间距宽度

  // 处理 value 本身是无穷大的情况
  const isValueInfinity = value === Number.POSITIVE_INFINITY || value === Infinity || !isFinite(value)
  const clampedValue = isValueInfinity ? 4 : Math.max(1, Math.min(4, value))

  // 处理无穷大的情况
  const isAfterValueInfinity =
    afterValue === Number.POSITIVE_INFINITY || afterValue === Infinity || (afterValue !== undefined && !isFinite(afterValue))
  // 当 afterValue = 0 时，clampedAfterValue 应该设置为 0（用于显示），但用于指针位置时，getAngleForValue(0) 会自动 clamp 到 1
  const clampedAfterValue = isAfterValueInfinity
    ? undefined
    : afterValue !== undefined
      ? afterValue === 0
        ? 0
        : Math.max(1, Math.min(4, afterValue))
      : undefined
  const hasAfterValue = (afterValue !== undefined || isAfterValueInfinity) && actionType !== undefined

  // 定义颜色
  const primaryRed = '#FF5073'
  const primaryYellow = '#FFCA68'
  const primaryGreen = '#68FFD8'
  const unfillColor = 'rgba(117, 200, 255, 0.1)'
  const spacingColor = '#000000' // 黑色间距

  // 创建段数据，并将每个段细分成多个小片段以实现沿弧线的渐变
  const segments = useMemo(() => {
    const mainSegments = Array.from({ length: 6 }, (_, index) => {
      const segmentStartValue = 1 + index * 0.5
      const segmentEndValue = segmentStartValue + 0.5

      let startColor: string
      let endColor: string

      if (index === 0) {
        // 第一段（1.0-1.5）：红色到橙黄色渐变
        startColor = primaryRed
        endColor = interpolateColor(primaryRed, primaryYellow, 0.8)
      } else if (index === 1) {
        // 第二段（1.5-2.0）：橙黄色到绿色渐变
        const segment1EndColor = interpolateColor(primaryRed, primaryYellow, 0.7)
        startColor = segment1EndColor
        endColor = primaryGreen
      } else {
        // 第三段（2.0-2.5）及之后：全部绿色
        startColor = primaryGreen
        endColor = primaryGreen
      }

      return {
        index,
        segmentStartValue,
        segmentEndValue,
        startColor,
        endColor
      }
    })

    // 将每个主段细分成小片段以实现平滑的沿弧线渐变
    const subSegmentsPerSegment = 10 // 每个段细分成10个小片段
    const allSubSegments: any[] = []

    mainSegments.forEach(mainSeg => {
      const valueRange = mainSeg.segmentEndValue - mainSeg.segmentStartValue
      const subSegmentValue = valueRange / subSegmentsPerSegment

      for (let i = 0; i < subSegmentsPerSegment; i++) {
        const subStart = mainSeg.segmentStartValue + i * subSegmentValue
        const subEnd = subStart + subSegmentValue
        const ratio = i / (subSegmentsPerSegment - 1)

        // 计算这个小片段的颜色（沿着主段的渐变）
        const color = interpolateColor(mainSeg.startColor, mainSeg.endColor, ratio)

        allSubSegments.push({
          index: mainSeg.index,
          subIndex: i,
          segmentStartValue: subStart,
          segmentEndValue: subEnd,
          color,
          isFirstSubSegment: i === 0 && mainSeg.index === 0
        })
      }
    })

    return allSubSegments
  }, [])

  // 不再需要渐变定义，因为每个小片段使用单一颜色

  // 计算原指针位置和旋转角度（在圆环中心位置）
  const pointerAngle = getAngleForValue(clampedValue)
  const pointerRad = degToRad(pointerAngle)
  // 指针在圆环中心，不是外圆弧上
  const pointerMidRadius = (innerRadius + outerRadius) / 2
  const pointerX = cx + pointerMidRadius * Math.cos(pointerRad)
  const pointerY = cy - pointerMidRadius * Math.sin(pointerRad)
  // 指针长方形沿径向方向，指向圆心
  // 反向旋转：270度 - 当前角度
  const pointerRotation = 270 - pointerAngle

  // 计算新指针位置（如果有 afterValue）
  // 如果是无穷大，指针显示在最大值 4 的位置
  // 当 afterValue = 0 时，使用 0，getAngleForValue(0) 会自动 clamp 到 1，指针会在起始位置
  const afterValueForPointer = isAfterValueInfinity ? 4 : afterValue !== undefined ? afterValue : undefined
  const afterPointerAngle = afterValueForPointer !== undefined ? getAngleForValue(afterValueForPointer) : undefined
  const afterPointerRad = afterPointerAngle !== undefined ? degToRad(afterPointerAngle) : undefined
  const afterPointerX = afterPointerRad !== undefined ? cx + pointerMidRadius * Math.cos(afterPointerRad) : undefined
  const afterPointerY = afterPointerRad !== undefined ? cy - pointerMidRadius * Math.sin(afterPointerRad) : undefined
  const afterPointerRotation = afterPointerAngle !== undefined ? 270 - afterPointerAngle : undefined

  // 计算新填充的起始和结束值
  const getNewFillRange = () => {
    if (!hasAfterValue) return null

    // 如果是无穷大，填充到最大值 4
    const endValue = isAfterValueInfinity ? 4 : clampedAfterValue
    if (!endValue) return null

    if (actionType === 'Deposit' || actionType === 'Repay') {
      // Deposit/Repay: 从当前值到新值（或最大值 4）
      return {
        start: clampedValue,
        end: endValue
      }
    } else if (actionType === 'Withdraw') {
      // Withdraw: 从 0 到新值（实际是从 1 开始，因为最小值是 1）
      return {
        start: 1,
        end: endValue
      }
    }
    return null
  }

  const newFillRange = getNewFillRange()

  const labels = [1, 1.5, 2, 2.5, 3, 3.5, 4]

  const arcGen = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)

  const toD3Angle = (angle: number) => degToRad(90 - angle)

  return (
    <VStack gap="0" alignItems="center" w={`${width}px`} h={`${height}px`} position="relative">
      <Box position="relative" w={`${width}px`} h={`${height}px`}>
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
          <g transform={`translate(${cx}, ${cy})`}>
            {/* 绘制整个半圆背景（两端圆角） */}
            <path
              d={
                d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(4).startAngle(toD3Angle(180)).endAngle(toD3Angle(0))(
                  null as any
                ) || ''
              }
              fill={unfillColor}
              stroke="none"
            />

            {/* 绘制原始填充部分（每个小片段使用单一颜色，实现沿弧线渐变） */}
            {segments.map((segment, segIndex) => {
              const segmentStart = segment.segmentStartValue
              const segmentEnd = segment.segmentEndValue

              // 判断这个段是否需要填充
              if (clampedValue <= segmentStart) {
                return null // 完全不填充
              }

              let startAngle = getAngleForValue(segmentStart)
              let endAngle: number

              if (clampedValue >= segmentEnd) {
                // 完全填充这个小片段
                endAngle = getAngleForValue(segmentEnd)
              } else {
                // 部分填充
                endAngle = getAngleForValue(clampedValue)
              }

              // 判断是否需要绘制圆角
              // 原始填充始终有圆角（第一个小片段）
              const shouldDrawCorner = segment.isFirstSubSegment

              if (shouldDrawCorner) {
                // 第一个小片段：带圆角并稍微延伸
                endAngle = endAngle - 2
              }

              const d3Start = toD3Angle(startAngle)
              const d3End = toD3Angle(endAngle)

              // 第一个小片段需要圆角（除非新填充从 1 开始）
              const arc = d3
                .arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .cornerRadius(shouldDrawCorner ? 4 : 0)

              const path = arc({ startAngle: d3Start, endAngle: d3End } as any)

              return (
                <path
                  key={`fill-${segment.index}-${segment.subIndex}`}
                  d={path || ''}
                  fill={segment.color}
                  stroke="none"
                  style={hasAfterValue ? { filter: 'brightness(0.5)' } : undefined}
                />
              )
            })}

            {/* 绘制新的填充部分（操作后的值） */}
            {newFillRange &&
              segments.map(segment => {
                const segmentStart = segment.segmentStartValue
                const segmentEnd = segment.segmentEndValue

                // 判断这个段是否在新填充范围内
                if (newFillRange.end <= segmentStart || newFillRange.start >= segmentEnd) {
                  return null // 不在新填充范围内
                }

                // 计算实际填充的起始和结束值
                const fillStart = Math.max(segmentStart, newFillRange.start)
                const fillEnd = Math.min(segmentEnd, newFillRange.end)

                if (fillStart >= fillEnd) {
                  return null
                }

                let startAngle = getAngleForValue(fillStart)
                let endAngle = getAngleForValue(fillEnd)

                // 判断是否需要圆角
                // Withdraw: 如果从 1 开始（第一个主段的第一个子段），需要圆角
                // Deposit/Repay: 从当前值开始，不需要圆角（因为衔接在原始填充上）
                const needsCornerRadius = actionType === 'Withdraw' ? segment.isFirstSubSegment && Math.abs(fillStart - 1) < 0.01 : false

                if (needsCornerRadius) {
                  // 第一个片段需要稍微延伸以显示圆角效果
                  endAngle = endAngle - 2
                }

                const d3Start = toD3Angle(startAngle)
                const d3End = toD3Angle(endAngle)

                const arc = d3
                  .arc()
                  .innerRadius(innerRadius)
                  .outerRadius(outerRadius)
                  .cornerRadius(needsCornerRadius ? 4 : 0)

                const path = arc({ startAngle: d3Start, endAngle: d3End } as any)

                return <path key={`new-fill-${segment.index}-${segment.subIndex}`} d={path || ''} fill={segment.color} stroke="none" />
              })}

            {/* 绘制主段之间的黑色间距 */}
            {[1, 2, 3, 4, 5].map(boundaryIndex => {
              // 在每个主段的结尾绘制2px黑色间距
              const boundaryValue = 1 + boundaryIndex * 0.5
              const boundaryAngle = getAngleForValue(boundaryValue)

              // 计算2px对应的角度
              const spacingAngleRad = spacingWidth / outerRadius

              const d3Center = toD3Angle(boundaryAngle)
              const d3Start = d3Center - spacingAngleRad / 3
              const d3End = d3Center + spacingAngleRad / 3

              const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(0)

              const path = arc({ startAngle: d3Start, endAngle: d3End } as any)

              return <path key={`spacing-${boundaryIndex}`} d={path || ''} fill={spacingColor} stroke="none" />
            })}
          </g>

          {/* 原始白色圆角长方形指针 (4x12) */}
          {value > 0 && (
            <rect
              x={pointerX - 1.5}
              y={pointerY - 6}
              width={4}
              height={12}
              rx={1.5}
              ry={1.5}
              fill="white"
              stroke="none"
              opacity={hasAfterValue ? 0.5 : 1}
              transform={`rotate(${pointerRotation}, ${pointerX}, ${pointerY})`}
            />
          )}

          {/* 新的白色圆角长方形指针 (4x12) - 操作后的值 */}
          {hasAfterValue && afterPointerX !== undefined && afterPointerY !== undefined && afterPointerRotation !== undefined && (
            <rect
              x={afterPointerX - 1.5}
              y={afterPointerY - 6}
              width={4}
              height={12}
              rx={1.5}
              ry={1.5}
              fill="white"
              stroke="none"
              transform={`rotate(${afterPointerRotation}, ${afterPointerX}, ${afterPointerY})`}
            />
          )}

          {/* 刻度标签 */}
          {labels.map(label => {
            const angle = getAngleForValue(label)
            const radian = degToRad(angle)
            const labelX = cx + labelRadius * Math.cos(radian)
            const labelY = cy - labelRadius * Math.sin(radian)

            // 对于两端的标签（1和4），向上微调位置
            let adjustedY = labelY
            if (label === 1 || label === 4) {
              adjustedY = labelY - 5
            }

            return (
              <text key={label} x={labelX} y={adjustedY} fill="#909CA4" fontSize="10px" textAnchor="middle" dominantBaseline="middle">
                {label}
              </text>
            )
          })}
        </svg>
      </Box>
      {value > 0 && afterValue !== 0 && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -30%)"
          bg={
            hasAfterValue && (isAfterValueInfinity || clampedAfterValue !== undefined)
              ? isAfterValueInfinity
                ? getColorForValue(4, minBorrowRatio, minWithdrawRatio).bg // 无穷大时使用最高值的背景色（绿色）
                : getColorForValue(clampedAfterValue!, minBorrowRatio, minWithdrawRatio).bg
              : getColorForValue(clampedValue, minBorrowRatio, minWithdrawRatio).bg
          }
          px="4px"
          py="2px"
          borderRadius="4px"
          zIndex={1}
        >
          <Text
            fontSize="10px"
            lineHeight="14px"
            color={
              hasAfterValue && (isAfterValueInfinity || clampedAfterValue !== undefined)
                ? isAfterValueInfinity
                  ? getColorForValue(4, minBorrowRatio, minWithdrawRatio).color // 无穷大时使用最高值的颜色（绿色）
                  : getColorForValue(clampedAfterValue!, minBorrowRatio, minWithdrawRatio).color
                : getColorForValue(clampedValue, minBorrowRatio, minWithdrawRatio).color
            }
            fontWeight="500"
          >
            {hasAfterValue && (isAfterValueInfinity || clampedAfterValue !== undefined)
              ? isAfterValueInfinity
                ? 'Low risk'
                : getStatusForValue(clampedAfterValue!, minBorrowRatio, minWithdrawRatio)
              : status || getStatusForValue(clampedValue, minBorrowRatio, minWithdrawRatio)}
          </Text>
        </Box>
      )}

      <Box position="absolute" display="flex" alignItems="center" gap="4px" top="50%" left="50%" transform="translate(-50%, 65%)" zIndex={10}>
        <Text
          fontSize="20px"
          lineHeight="24px"
          color={
            value > 0
              ? afterValue === 0
                ? 'white'
                : hasAfterValue && (isAfterValueInfinity || clampedAfterValue !== undefined)
                  ? isAfterValueInfinity
                    ? getColorForValue(4, minBorrowRatio, minWithdrawRatio).color // 无穷大时使用最高值的颜色（绿色）
                    : getColorForValue(clampedAfterValue!, minBorrowRatio, minWithdrawRatio).color
                  : getColorForValue(clampedValue, minBorrowRatio, minWithdrawRatio).color
              : 'white'
          }
          fontWeight="bold"
        >
          {isValueInfinity || value <= 0
            ? '∞'
            : hasAfterValue && (isAfterValueInfinity || afterValue !== undefined)
              ? isAfterValueInfinity
                ? '∞'
                : afterValue === 0
                  ? '--'
                  : d(afterValue || '0').gt(d(1000))
                    ? '1000'
                    : formatNumberFloor(afterValue!)
              : d(value || '0').gt(d(1000))
                ? '1000'
                : formatNumberFloor(value)}
        </Text>
        {/* 三角箭头 */}
        {hasAfterValue &&
          !isAfterValueInfinity &&
          clampedAfterValue !== undefined &&
          afterValue !== undefined &&
          afterValue !== 0 &&
          Math.abs(afterValue - value) > 0.01 && (
            <TriangleArrow
              color={getColorForValue(clampedAfterValue, minBorrowRatio, minWithdrawRatio).color}
              rotation={afterValue < value ? 180 : 0}
            />
          )}
        {/* 三角箭头 - end */}
      </Box>

      <Box position="absolute" bottom="0" left="50%" transform="translate(-48%, -30%)" zIndex={1}>
        <CetusTooltip
          tooltip={
            <Text fontSize="12px" lineHeight="16px" color="text_paragraph">
              {tooltip}
            </Text>
          }
        >
          <Text fontSize="10px" lineHeight="16px" textDecoration={'underline dotted'} color="text_paragraph">
            Margin Risk Level
          </Text>
        </CetusTooltip>
      </Box>
    </VStack>
  )
}

export default MarginHealthyChart
