import React from 'react'
import { Cell, Pie, PieChart } from 'recharts'

type LiquidityInfoPieChartProps = {
  percentage: number // 0-100
  size?: number // 图表尺寸
  gapAngle?: number // 缝隙大小（角度）
  usedColor?: string
  remainingColor?: string
}

export const LiquidityInfoPieChart: React.FC<LiquidityInfoPieChartProps> = ({
  percentage,
  size = 108,
  gapAngle = 8,
  usedColor = '#8884d8',
  remainingColor = '#e0e0e0'
}) => {
  const totalAngle = 360
  const gapValue = 1 // 每个 gap 的权重（值大小不重要，只要能占个角度）

  // 总占比角度可用的比例
  const availableAngle = totalAngle - gapAngle * 2

  // 用角度分配 value（比例 × 可用角度）
  const usedAngle = availableAngle * (percentage / 100)
  const remainingAngle = availableAngle - usedAngle

  const data = [
    { name: 'Used', value: usedAngle, fill: usedColor },
    { name: 'Gap1', value: gapAngle, fill: 'transparent' },
    { name: 'Remaining', value: remainingAngle, fill: remainingColor },
    { name: 'Gap2', value: gapAngle, fill: 'transparent' }
  ]

  return (
    <PieChart width={size} height={size}>
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        innerRadius={size * 0.36}
        outerRadius={size * 0.46}
        startAngle={90}
        endAngle={-270}
        stroke="none"
        isAnimationActive={false}
        labelLine={false}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
        ))}
      </Pie>
    </PieChart>
  )
}
