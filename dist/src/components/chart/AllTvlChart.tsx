import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

import { useMemo } from 'react'
import { CustomAllTvlTooltip } from './CustomTooltip'
import { CustomizedXAxisTick } from './CustomizedAxisTick'
import EmptyTooltip from './EmptyTooltip'

type TvlChartProps = {
  isShowYAxis?: boolean
  data: any
  onChangeValue: (data: any) => void
  toolTipsType?: string
  currentTime: string
}
const AllTvlChart = (props: TvlChartProps) => {
  const { data, onChangeValue, isShowYAxis, toolTipsType, currentTime } = props
  // console.log('🚀🚀🚀 ~ TvlChart.tsx:15 ~ TvlChart ~ data:', data)
  const handleMouseMove = (e: any) => {
    if (e && e.activePayload && e.activePayload.length) {
      // console.log('🚀 ~ handleMouseMove ~ e.activePayload[0]:', e.activePayload[0])
      onChangeValue(e.activePayload[0].payload)
    }
  }

  const handleMouseLeave = () => {
    onChangeValue(null)
  }

  const xData = useMemo(() => {
    if (data?.length > 0) {
      const res = data.filter((item: any) => {
        return item.xAxis !== ''
      })
      // console.log('🚀 ~ xData ~ res:', data?.length, res)
      return res
    }
    return []
  }, [data])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <defs>
          <linearGradient id="colorTvlArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#76C8FF" />
            <stop offset="100%" stopColor="rgba(22,22,22,0)" />
          </linearGradient>
        </defs>

        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis
          type="category"
          dataKey="xAxis"
          minTickGap={xData?.length > 8 ? 36 : undefined}
          interval={xData?.length <= 8 ? 0 : undefined}
          tickLine={false}
          axisLine={false}
          tick={({ x, y, payload, index }) => (
            <CustomizedXAxisTick x={x} y={y} payload={payload} index={index} total={data.length} isShowYAxis={isShowYAxis} />
          )}
        />
        {data?.length > 0 && (
          <Tooltip
            content={!toolTipsType ? <EmptyTooltip /> : <CustomAllTvlTooltip currentTime={currentTime} />}
            cursor={{ stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
        )}

        <Area type="monotone" dataKey="total" stroke="#76C8FF" fill="url(#colorTvlArea)" stackId={1} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default AllTvlChart
