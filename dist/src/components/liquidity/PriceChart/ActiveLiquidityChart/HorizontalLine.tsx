import { formatNumber } from '@cetus/utils'
import { ScaleLinear } from 'd3'

interface HorizontalLineProps {
  value: number
  yScale: ScaleLinear<number, number>
  width: number
  height: number
  axisLabelPaneWidth: number
  color: string
  strokeWidth: number
  strokeDasharray?: string
  showPriceLabel?: boolean
  showTriangle?: boolean
}

export const HorizontalLine = ({
  value,
  yScale,
  width,
  height,
  axisLabelPaneWidth,
  color,
  strokeWidth,
  strokeDasharray,
  showPriceLabel = true,
  showTriangle = false
}: HorizontalLineProps) => {
  const y = yScale(value)

  // 确保线始终在可见区域内，即使超出边界也要显示
  const clampedY = Math.max(0, Math.min(y, height))

  return (
    <g>
      <line
        x1={axisLabelPaneWidth}
        y1={clampedY}
        x2={width - axisLabelPaneWidth}
        y2={clampedY}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        pointerEvents="none"
      />

      {/* 价格标签 - 根据 showPriceLabel 属性控制显示 */}
      {showPriceLabel && (
        <text x={width - axisLabelPaneWidth + 10} y={clampedY - 5} fontSize="12px" fill={color} textAnchor="start">
          {formatNumber(value, 4)}
        </text>
      )}

      {/* 白色三角形图标 - 位于线的左侧 */}
      {/* {showTriangle && <path
        d={`M ${axisLabelPaneWidth - 2} ${clampedY - 5} L ${axisLabelPaneWidth + 6} ${clampedY} L ${axisLabelPaneWidth - 2} ${clampedY + 5} Z`}
        fill="white"
        stroke="none"
        pointerEvents="none"
      />} */}

      {showTriangle && <circle cx={axisLabelPaneWidth + 4} cy={clampedY} fill="#fff" r="4" />}
    </g>
  )
}
