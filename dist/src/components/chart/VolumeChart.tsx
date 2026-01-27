import { Month } from '@/hooks/common/useChartTime'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { isCurrentDayIncomplete } from '@cetus/utils'
import { useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CustomBar from './CustomBar'
import { CustomizedXAxisTick } from './CustomizedAxisTick'
import EmptyTooltip from './EmptyTooltip'

const VolumeChart = ({
  data,
  onChangeValue,
  noXAxis,
  pageFrom = 'stats'
}: {
  data: any
  onChangeValue: (data: any) => void
  noXAxis?: boolean
  pageFrom?: 'stats' | 'pools'
}) => {
  const { isApp } = useWindowWidth()
  const [hoverTime, setHoverTime] = useState('')

  const handleMouseMove = (e: any) => {
    if (e && e.activePayload && e.activePayload.length) {
      const date = e.activePayload[0].payload.date
      onChangeValue(e.activePayload[0].payload)
      const months = date.slice(5, 7)
      const value = Month[Number(months)]
      const day = date.slice(8, 10)
      const month = value
      const year = date.slice(0, 4)
      setHoverTime(day + ' ' + month + ' ' + year)
    }
  }

  const handleMouseLeave = () => {
    onChangeValue(null)
  }

  const minValue = data?.length > 0 ? Math.floor(Math.min(...data.map((item: any) => item.num))) : 0
  const maxValue = Math.ceil(Math.max(...data.map((item: any) => item.num)))

  const renderCustomBar = (props: any) => {
    const { payload, fill, x, y, width, height } = props
    const isCurrentDay = isCurrentDayIncomplete(payload?.date)

    return (
      <CustomBar payload={payload} fill={fill} x={x} y={y} width={width} height={height} isCurrentDay={isCurrentDay} isIncomplete={isCurrentDay} />
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        barCategoryGap="24%"
        data={data}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        maxBarSize={24}
        margin={isApp ? { top: 0, right: 0, bottom: pageFrom === 'pools' ? 12 : 0, left: 0 } : { top: 5, right: 5, bottom: 5, left: 5 }}
      >
        {!noXAxis && (
          <XAxis
            type="category"
            dataKey="xAxis"
            minTickGap={18}
            tickLine={false}
            axisLine={false}
            height={isApp ? 28 : undefined}
            tick={({ x, y, payload, index }) => <CustomizedXAxisTick x={x} y={y} payload={payload} index={index} fontSize={12} isApp={isApp} />}
          />
        )}
        {maxValue && <YAxis domain={[0, maxValue * 1.05]} hide={true} axisLine={false} tickLine={false} />}
        {/* <Tooltip content={<EmptyTooltip value={pageFrom !== 'stats' ? hoverTime : ''} />} cursor={{ fill: 'rgba(118,200,255,0.5)' }} /> */}
        <Tooltip content={<EmptyTooltip value={pageFrom !== 'stats' ? hoverTime : ''} />} cursor={<CustomizedCursor />} />
        {/* <Bar dataKey="num" fill="#75C8FF" activeBar={<Rectangle stroke="rgba(0,0,0,0)" />} isAnimationActive={false} /> */}
        <Bar dataKey="num" fill="#75C8FF" isAnimationActive={false} shape={renderCustomBar} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default VolumeChart

function CustomizedCursor(params: any) {
  const { x, y, width, height, payload } = params

  if (!payload || !payload?.[0] || !payload?.[0]?.payload?.num) return

  const v = width > 192 ? width / 2 : width > 96 ? width / 2.5 : width > 48 ? width / 3 : width > 24 ? width / 4 : width / 8

  return (
    <g>
      <rect width={width - v} height={height} x={x + v / 2} fill="rgba(118,200,255,0.5)" y={y + 1} />
    </g>
  )
}
