import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, formatNumber } from '@cetus/utils'
import { memo, useMemo, useState } from 'react'
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import CustomPirceRangeTooltip from './CustomPriceRangeTooltip'
import { CustomizedVaultYAxisTick } from './CustomizedAxisTick'
import { ZoomController } from './ZoomController'

type PriceRangeChartProps = {
  data: any
  dateType: string
  isTabLoading: boolean
  category: string
  vaultId?: string
  tokenA?: any
  tokenB?: any
}

const arePropsEqual = (prevProps: PriceRangeChartProps, nextProps: PriceRangeChartProps) => {
  // 比较 data 的引用，如果引用不同说明数据已更新
  // 同时比较第一个和最后一个元素的关键字段，确保数据真正变化
  const dataChanged =
    prevProps.data !== nextProps.data ||
    (prevProps.data?.length > 0 &&
      nextProps.data?.length > 0 &&
      (prevProps.data[0]?.date !== nextProps.data[0]?.date ||
        prevProps.data[prevProps.data.length - 1]?.date !== nextProps.data[nextProps.data.length - 1]?.date))

  return (
    !dataChanged &&
    prevProps.vaultId === nextProps.vaultId &&
    prevProps?.isTabLoading === nextProps?.isTabLoading &&
    prevProps.dateType === nextProps.dateType &&
    prevProps.tokenA?.coinType === nextProps.tokenA?.coinType &&
    prevProps.tokenB?.coinType === nextProps.tokenB?.coinType
  )
}

function PriceRangeChart({ data = [], dateType, isTabLoading, category, tokenA, tokenB }: PriceRangeChartProps) {
  const slicedData = useMemo(() => data, [data])
  const [hidden, setHidden] = useState({ lower: false, upper: false, real: false })

  const ticks = useMemo(() => {
    if (slicedData.length) {
      let min = Math.min(...slicedData.map((item: any) => item.lower))
      let max = Math.max(...slicedData.map((item: any) => item.upper))

      if (min === max) {
        min = 0
      }

      const tick4 = category == 'haedal' ? d(max).mul(1.1) : d(max).mul(1.001)
      const tick0 = category == 'haedal' ? d(min).mul(0.9) : d(min).mul(0.999)
      const interval = tick4.sub(tick0).div(4)
      return Array.from({ length: 5 }, (_, i) => tick0.add(interval.mul(i)).toNumber())
    }
    return []
  }, [slicedData])

  const getXData = (dataLength: number, value: any) => {
    const date = new Date(value * 1000)
    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    const day = date.getUTCDate()
    const month = date.getUTCMonth() + 1

    if (dataLength < 24 || dateType === '24H') {
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
    }
    return `${month}/${day}`
  }

  const { isApp } = useWindowWidth()

  const ZoomableLineChart = useMemo(() => {
    return ZoomController(LineChart)
  }, [])

  const getCustomTicks = (data: any[]) => {
    if (!data?.length) return []

    const lastTimestamp = data[data.length - 1].date // 假设 data[i].date 是时间戳（秒）
    const sixHours = 6 * 60 * 60 // 6 小时的秒数

    // 生成当前时间、-6h、-12h、-18h、-24h
    const ticks = [0, 6, 12, 18, 24].map(h => lastTimestamp - h * 60 * 60)

    // 只保留数据范围内的刻度（避免超出）
    const minTime = data[0].date

    return ticks.filter(t => t >= minTime)
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ZoomableLineChart data={slicedData} margin={{ top: 0, left: 10, right: 28, bottom: 5 }} height={260} zoomHeight={260}>
        {slicedData?.length >= 1440 && dateType === '24H' ? (
          <XAxis
            dataKey="date"
            fontSize="12px"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#909CA4' }}
            dy={0}
            tickFormatter={value => (isTabLoading ? '' : getXData(slicedData.length, value))}
            // 如果大于 1440 点（24 小时），每 6 小时显示一个刻度
            ticks={getCustomTicks(slicedData)} // ✅ 自定义 5 个刻度
          />
        ) : (
          <XAxis
            dataKey="date"
            fontSize="12px"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#909CA4' }}
            dy={16}
            tickFormatter={value => (isTabLoading ? '' : getXData(slicedData.length, value))}
            minTickGap={slicedData?.length > 8 ? 36 : undefined}
            interval={slicedData?.length > 0 && slicedData?.length <= 8 ? 0 : 'preserveEnd'}
          />
        )}

        <YAxis
          fontSize="12px"
          ticks={ticks}
          domain={[ticks[0], ticks[ticks.length - 1]]}
          axisLine={false}
          tickLine={false}
          tickFormatter={value => formatNumber(value, 4)}
          tick={<CustomizedVaultYAxisTick category={category} />}
        />
        <Tooltip content={<CustomPirceRangeTooltip tokenA={tokenA} tokenB={tokenB} />} />
        <Legend
          align="right"
          verticalAlign="top"
          layout="horizontal"
          wrapperStyle={{ top: isApp ? -8 : -41, right: isApp ? 4 : 100, fontSize: 12, width: 'auto' }}
          formatter={value => {
            const labelMap: Record<string, string> = { lower: 'Price Range', upper: 'Price Range', real: 'Pool Price' }
            return labelMap[value as string] || value
          }}
        />
        <Line
          type="monotone"
          dataKey="real"
          stroke="#07EBAD"
          activeDot={{ r: 4, stroke: '#07EBAD' }}
          hide={hidden.real}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="lower"
          stroke="#6FBCF0"
          activeDot={{ r: 4, stroke: '#6FBCF0' }}
          dot={false}
          hide={hidden.lower}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="upper"
          stroke="#6FBCF0"
          activeDot={{ r: 4, stroke: '#6FBCF0' }}
          legendType="none"
          dot={false}
          hide={hidden.upper}
          isAnimationActive={false}
        />
      </ZoomableLineChart>
    </ResponsiveContainer>
  )
}

export default memo(PriceRangeChart, arePropsEqual)
