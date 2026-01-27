import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { d, findMinimumUniquePrecision, formatNumber, getNumberUnit } from '@cetus/utils'
import { memo, useMemo, useState } from 'react'
import { Bar, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ApyAndFeesChartTooltip } from './CustomTooltip'
import { CustomizedApyAndFeesRightYAxisTick, CustomizedApyAndFeesYAxisTick } from './CustomizedAxisTick'
import { ZoomController } from './ZoomController'
type ApyAndFeesChartProps = {
  data: any
  dateType: string
  quoteCoin?: Token
  category: string
  vaultId?: string
}

const arePropsEqual = (prevProps: ApyAndFeesChartProps, nextProps: ApyAndFeesChartProps) => {
  return (
    prevProps.data?.length === nextProps.data?.length &&
    prevProps.vaultId === nextProps.vaultId &&
    prevProps.quoteCoin?.symbol === nextProps.quoteCoin?.symbol
  )
}

function ApyAndFeesChart({ data = [], dateType, quoteCoin, category }: ApyAndFeesChartProps) {
  const [hidden, setHidden] = useState<{ apy: boolean; lp_fee: boolean }>({
    apy: false, // 控制 `Bar` 是否隐藏
    lp_fee: false // 控制 `Line` 是否隐藏
  })
  const handleLegendClick = (e: any) => {
    setHidden(prev => ({ ...prev, [e.id]: !prev[e.id] }))
  }
  const legendPayload = [
    { value: 'Cumulative Yields', type: 'line', id: 'lp_fee', color: '#07EBAD' }, // 对应折线图
    { value: 'APY', type: 'line', id: 'apy', color: '#75C8FF' } // 对应柱状图
  ]

  const ticks = useMemo(() => {
    if (data.length) {
      const min = Math.min(...data.map((item: any) => item.apy))
      const max = Math.max(...data.map((item: any) => item.apy))
      if (min === 0 && max === 0) {
        return [] // 数据全为 0
      }
      const tick4 = category == 'haedal' || category == 'haedal_v2' ? d(max).mul(1.05) : d(max).mul(1.0001)
      const tick0 = d(min)
      const interval = tick4.sub(tick0).div(4)
      return Array.from({ length: 5 }, (_, i) => tick0.add(interval.mul(i)).toString())
    }
    return []
  }, [data])

  /**
   * min/max 区间智能取整 + 10% padding
   * 根据各自的位数确定化整倍数：
   * - n位数：化整至10^(n-2)的倍数
   * - 例如：6位数->10000, 4位数->100, 3位数->10
   */
  function getRangeWithPadding(min: number, max: number) {
    if (min < 0 || max < 0) throw new Error('min/max must be >= 0')
    if (min > max) throw new Error('min cannot be greater than max')
    // padding
    const padding = d(max).sub(d(min)).mul(0.1).toNumber()
    // 先计算加上padding后的max和减去padding后的min
    const paddedMax = d(max).add(padding).toNumber()
    const paddedMin = Math.max(0, d(min).sub(padding).toNumber())
    /**
     * 计算化整倍数
     * 规则：n位数化整到10^(n-2)
     * - 如果数字 >= 1：根据整数部分的位数确定倍数
     * - 如果数字 < 1：先找到第一个非零位，将数字标准化后计算位数
     */
    function getRoundMultiple(value: number): number {
      if (value === 0) return 1

      if (value >= 1) {
        // 整数部分 >= 1，计算整数位数
        const intPart = Math.floor(value)
        const digits = Math.floor(Math.log10(intPart)) + 1
        // n位数化整到10^(n-2)
        return Math.pow(10, Math.max(0, digits - 2))
      } else {
        // 小数 < 1，找到第一个非零小数位的位置n
        let n = 0
        let multiplied = value
        while (multiplied < 1 && n < 20) {
          multiplied *= 10
          n++
        }
        // 将第一个非零位移到整数部分，计算标准化后的位数
        const normalizedIntPart = Math.floor(multiplied)
        const normalizedDigits = Math.floor(Math.log10(normalizedIntPart)) + 1
        // n位数化整到10^(n-2)，然后还原到原始小数位
        const baseMultiple = Math.pow(10, Math.max(0, normalizedDigits - 2))
        return baseMultiple / Math.pow(10, n)
      }
    }
    const maxRoundMultiple = getRoundMultiple(paddedMax)
    const minRoundMultiple = getRoundMultiple(paddedMin)
    // Max向上化整至maxRoundMultiple的倍数
    const finalMax = Math.ceil(paddedMax / maxRoundMultiple) * maxRoundMultiple
    // Min向下化整至minRoundMultiple的倍数
    const finalMin = Math.floor(paddedMin / minRoundMultiple) * minRoundMultiple

    return {
      min: finalMin,
      max: finalMax
    }
  }

  const { ticks: ticksFee, precision: precisionFee } = useMemo(() => {
    if (data.length) {
      const min = Math.min(...data.map((item: any) => item.lp_fee))
      const max = Math.max(...data.map((item: any) => item.lp_fee))
      if (min === 0 && max === 0) {
        return { ticks: [], precision: 2 } // 数据全为 0
      }

      const unit = getNumberUnit(max)

      // const tick4 = category == 'haedal' || category == 'haedal_v2' ? d(max).mul(1.05) : d(max).mul(1.0001)

      const { min: finalMin, max: finalMax } = getRangeWithPadding(min, max)
      const tick4 = finalMax
      const tick0 = finalMin
      const interval = d(tick4).sub(d(tick0)).div(4)
      const ticks = Array.from({ length: 5 }, (_, i) => d(tick0).add(interval.mul(i)).toString())

      const precision = findMinimumUniquePrecision(ticks, unit)
      console.log('🚀 ~ getRangeWithPadding ~ finalMin, finalMax1 :', {
        ticks,
        precision,
        min,
        max,
        finalMin,
        finalMax
      })

      return { ticks, precision }
    }
    return { ticks: [], precision: 2 }
  }, [data])

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
    return ZoomController(ComposedChart)
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ZoomableLineChart data={data} margin={{ top: 0, left: 10, right: 28, bottom: 5 }} height={260} zoomHeight={260}>
        <XAxis
          dataKey="date"
          fontSize="12px"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#909CA4' }}
          dy={16}
          tickFormatter={value => getXData(data.length, value)}
          minTickGap={data?.length > 8 ? 36 : undefined}
          interval={data?.length <= 8 ? 0 : undefined}
        />
        <YAxis
          yAxisId="bar"
          // xAxisId="x"
          fontSize="12px"
          orientation="left"
          width={50}
          tickLine={false}
          // position="insideRight"
          // ticks={ticks.length > 0 ? ticks : [0]}
          // domain={ticks.length > 0 ? [Number(ticks[0]), Number(ticks[ticks.length - 1])] : [0, 1]}
          tickFormatter={value => {
            return formatNumber(value, 2) // 需要 return
          }}
          tick={<CustomizedApyAndFeesYAxisTick />}
        />
        <YAxis
          yAxisId="line"
          orientation="right"
          fontSize="12px"
          tickLine={false}
          ticks={ticksFee.length > 0 ? ticksFee : [0]}
          domain={ticksFee.length > 0 ? [Number(ticksFee[0]), Number(ticksFee[ticksFee.length - 1])] : [0, 1]}
          tick={
            <CustomizedApyAndFeesRightYAxisTick
              precisionFee={precisionFee}
              isRight={true}
              isApp={isApp}
              symbol={quoteCoin?.symbol}
              category={category}
            />
          }
        />

        <Tooltip content={<ApyAndFeesChartTooltip symbol={quoteCoin?.symbol} />} trigger="hover" />
        <Legend
          align="right"
          verticalAlign="top"
          layout="horizontal"
          wrapperStyle={{ top: -32, right: 0, fontSize: 12 }}
          payload={legendPayload}
          // onClick={handleLegendClick}
        />
        <Bar yAxisId="bar" barSize={1} dataKey="apy" fill="#75C8FF" isAnimationActive={false} hide={hidden.apy} />

        {/* 折线图 */}
        <Line
          yAxisId="line"
          type="monotone"
          dataKey="lp_fee"
          stroke="#07EBAD"
          activeDot={{ r: 4, stroke: '#07EBAD' }}
          dot={false}
          isAnimationActive={false}
          hide={hidden.lp_fee}
        />
      </ZoomableLineChart>
    </ResponsiveContainer>
  )
}

export default memo(ApyAndFeesChart, arePropsEqual)
