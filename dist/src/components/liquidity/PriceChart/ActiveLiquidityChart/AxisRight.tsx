import { formatPriceUseInAxis } from '@cetus/utils'
import { ScaleLinear } from 'd3'

interface AxisRightProps {
  yScale: ScaleLinear<number, number>
  width: number
  height: number
  axisLabelPaneWidth: number
  min: number
  max: number
}

export const AxisRight = ({ yScale, width, height, axisLabelPaneWidth, min, max }: AxisRightProps) => {
  // Generate tick values - 使用更智能的刻度生成策略
  const generateTickValues = () => {
    const range = max - min
    const targetTickCount = 5 // 目标刻度数量
    const tickValues = []

    // 生成刻度值
    for (let i = 0; i < targetTickCount; i++) {
      const ratio = i / (targetTickCount - 1)
      tickValues.push(min + ratio * range)
    }

    // 检查可见性并过滤
    const margin = 8
    const visibleTicks = tickValues.filter(value => {
      const y = yScale(value)
      return y >= margin && y <= height - margin
    })

    // 如果可见刻度少于4个，尝试增加刻度数量
    if (visibleTicks.length < 4) {
      const extendedTickCount = 7
      const extendedTicks = []
      for (let i = 0; i < extendedTickCount; i++) {
        const ratio = i / (extendedTickCount - 1)
        extendedTicks.push(min + ratio * range)
      }

      const extendedVisibleTicks = extendedTicks.filter(value => {
        const y = yScale(value)
        return y >= margin && y <= height - margin
      })

      return extendedVisibleTicks.length >= 4 ? extendedTicks : tickValues
    }

    return tickValues
  }

  const tickValues = generateTickValues()

  return (
    <g>
      {/* 隐藏轴线，只保留数字标签 */}
      {/* <line
        x1={axisLabelPaneWidth}
        y1={0}
        x2={axisLabelPaneWidth}
        y2={height}
        stroke="#e2e8f0"
        strokeWidth={1}
      /> */}

      {/* Ticks and labels */}
      {tickValues.map((value, index) => {
        const y = yScale(value)

        // 检查标签是否在可见区域内，避免显示不完整的标签
        const labelHeight = 12 // 字体大小
        const margin = 8 // 增加一些边距，让标签显示更宽松
        const isLabelVisible = y >= margin && y <= height - margin

        // 如果标签不在可见区域内，不渲染
        if (!isLabelVisible) return null

        return (
          <g key={`tick-${index}`}>
            {/* 隐藏刻度线，只保留数字标签 */}
            {/* <line
              x1={axisLabelPaneWidth}
              y1={y}
              x2={axisLabelPaneWidth + 5}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
            /> */}

            {/* Label */}
            <text x={axisLabelPaneWidth + 10} y={y} fontSize="12px" fill="#909CA4" textAnchor="start" alignmentBaseline="middle">
              {formatPriceUseInAxis(String(value))}
              {/* {value} */}
            </text>
          </g>
        )
      })}
    </g>
  )
}
