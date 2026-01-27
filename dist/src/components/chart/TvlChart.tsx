import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'
import { CustomTvlTooltip } from './CustomTooltip'
import { CustomizedXAxisTick, CustomizedYAxisTick } from './CustomizedAxisTick'
import EmptyTooltip from './EmptyTooltip'

type TvlChartProps = {
  isShowYAxis?: boolean
  data: any
  onChangeValue: (data: any) => void
  toolTipsType?: string
}
const TvlChart = (props: TvlChartProps) => {
  const { isApp } = useWindowWidth()
  const { data, onChangeValue, isShowYAxis, toolTipsType } = props
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

  const ticks = useMemo(() => {
    if (data && data?.length) {
      const min = Math.min(...data?.map((item: any) => item.num))
      const max = Math.max(...data?.map((item: any) => item.num))
      const tick4 = d(max).mul(1.01)
      const tick0 = d(min)
      const interval = tick4.sub(tick0).div(4)
      const tick1 = tick0.add(interval.mul(1))
      const tick2 = tick0.add(interval.mul(2))
      const tick3 = tick0.add(interval.mul(3))
      const tickList = [tick0.toNumber(), tick1.toNumber(), tick2.toNumber(), tick3.toNumber(), tick4.toNumber()]
      // console.log('🚀🚀🚀 ~ PriceRangeChart.tsx:57 ~ ticks ~ tickList:', tickList)
      return tickList
    }
    return []
  }, [data])

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

  const isAllDataZero = useMemo(() => {
    if (data?.length > 0) {
      const res = data.filter((item: any) => {
        return item.num !== 0
      })
      return res.length === 0
    }
    return true
  }, [data])
  console.log('🚀 ~ isAllDataZero ~ isAllDataZero:', xData)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={isAllDataZero ? [] : data}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
      >
        <defs>
          <linearGradient id="colorTvlArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0080FF" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#17181D" stopOpacity={0.2} />
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
            <CustomizedXAxisTick x={x} y={y} payload={payload} index={index} total={data.length} isShowYAxis={isShowYAxis} isApp={isApp} />
          )}
        />
        {isShowYAxis && (
          <YAxis
            type="number"
            domain={[ticks, ticks[ticks.length - 1]]}
            axisLine={false}
            tickLine={false}
            ticks={ticks}
            tick={<CustomizedYAxisTick />}
          />
        )}
        {data?.length > 0 && (
          <Tooltip
            content={!toolTipsType ? <EmptyTooltip /> : <CustomTvlTooltip />}
            cursor={{ stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
        )}

        <Area type="monotone" dataKey="num" stroke="#76C8FF" fill="url(#colorTvlArea)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default TvlChart
