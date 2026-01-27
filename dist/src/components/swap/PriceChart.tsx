import { d, formatPrice } from '@cetus/utils'
import dayjs from 'dayjs'
import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { CategoricalChartProps } from 'recharts/types/chart/generateCategoricalChart'

// 自定义 Tooltip 内容
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#121212',
          border: '1px solid',
          borderColor: '#2A3238',
          padding: '12px',
          borderRadius: '8px',
          position: 'relative',
          left: '0px', // 控制位置
          top: '-30px', // 控制位置
          fontSize: '12px',
          textAlign: 'left'
        }}
      >
        <p style={{ color: '#909CA4' }}>{dayjs.unix(payload[0]?.payload?.timestamp).format('MM/DD HH:mm')}</p>
        <p style={{ color: '#fff', marginTop: '8px' }}>${formatPrice(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function PriceChart({ data = [] }: { data: CategoricalChartProps['data'] }) {
  const min = d(Math.min(...data.map((item: any) => item.price)))
    .mul(0.99999)
    .toNumber()

  const max = d(Math.max(...data.map((item: any) => item.price)))
    .mul(1.00001)
    .toNumber()
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={180}
        height={48}
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: 20,
          bottom: 5
        }}
      >
        <defs>
          <linearGradient id="priceLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(117, 200, 255, 1)" />
            <stop offset="100%" stopColor="rgba(104, 255, 216, 1)" />
          </linearGradient>
        </defs>
        <YAxis hide domain={[min, max]} />
        <Tooltip cursor={false} content={<CustomTooltip />} />
        <Line type="linear" dot={false} dataKey="price" stroke="url(#priceLine)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
