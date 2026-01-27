import { formatNumberWithKMB, formatPercentage } from '@cetus/utils'

// 自定义 X 轴刻度组件
const CustomizedXAxisTick = ({ x, y, payload, index, total, isShowYAxis, fontSize = 12, isApp = false }: any) => {
  const isLastTick = index === total - 1
  const dy = isShowYAxis ? 24 : 16
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={dy} textAnchor={isLastTick ? 'end' : 'middle'} fill="#909CA4" fontSize={fontSize} fontFamily="Inter">
        {payload.value}
      </text>
    </g>
  )
}

const CustomizedYAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(0,${y})`}>
      <text x={0} y={0} dy={16} textAnchor="start" fill="#909CA4" fontSize={12} fontFamily="Inter">
        ${formatNumberWithKMB(payload.value)}
      </text>
    </g>
  )
}

const CustomizedVaultYAxisTick = ({ x, y, payload, category }: any) => {
  return (
    <g transform={`translate(24,${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#909CA4" fontSize={12} fontFamily="Inter">
        {formatNumberWithKMB(payload.value, category == 'cetus' ? 4 : 2)}
      </text>
    </g>
  )
}

const CustomizedVaultV2UsdYAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(24,${y})`}>
      <text x={payload.value && payload.value > 10 ? 0 : 0} y={0} dy={16} textAnchor="middle" fill="#909CA4" fontSize={12} fontFamily="Inter">
        {formatPercentage(payload.value, 2)}
      </text>
    </g>
  )
}

const CustomizedApyAndFeesYAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(24,${y})`}>
      <text x={0} y={0} dy={4} textAnchor="middle" fill="#909CA4" fontSize={12} fontFamily="Inter">
        {formatNumberWithKMB(payload.value, 0, true)}%
      </text>
    </g>
  )
}
const CustomizedApyAndFeesRightYAxisTick = ({ x, y, payload, isRight = false, symbol, isApp, category, precisionFee }: any) => {
  const value = formatNumberWithKMB(payload.value, 2, true)
  return (
    <text
      x={x + (isRight ? (category == 'cetus' ? 6 : value.length > 6 ? -6 : 6) : -10)} // 直接在 `x` 基础上调整偏移，而不是 `transform`
      y={y} // 直接使用传入的 y
      dy={4} // 微调文本垂直对齐
      textAnchor={isRight ? 'start' : 'end'} // 右侧对齐方式
      fill="#909CA4"
      fontSize={12}
      fontFamily="Inter"
    >
      {formatNumberWithKMB(payload.value, Number(precisionFee), true)} {symbol}
    </text>
  )
}

export {
  CustomizedApyAndFeesRightYAxisTick,
  CustomizedApyAndFeesYAxisTick,
  CustomizedVaultV2UsdYAxisTick,
  CustomizedVaultYAxisTick,
  CustomizedXAxisTick,
  CustomizedYAxisTick
}
