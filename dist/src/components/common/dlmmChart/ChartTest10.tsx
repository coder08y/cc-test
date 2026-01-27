import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

const renderCustomBar = props => {
  const { x, y, width, height, payload } = props

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={payload.current ? '#ff7300' : '#8884d8'} />
      {payload.current && (
        <g>
          {/* 竖线 */}
          <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y - 20} stroke="#ff7300" strokeWidth={2} />
          {/* 倒三角 */}
          <path d={`M${x + width / 2 - 5},${y - 20} L${x + width / 2},${y - 30} L${x + width / 2 + 5},${y - 20} Z`} fill="#ff7300" />
        </g>
      )}
    </g>
  )
}

const data = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 200, current: true }, // 标记当前价格
  { name: 'D', value: 500 }
]

const ChartWithCustomBar = () => {
  return (
    <BarChart width={500} height={300} data={data} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" shape={renderCustomBar} />
    </BarChart>
  )
}

export default ChartWithCustomBar
