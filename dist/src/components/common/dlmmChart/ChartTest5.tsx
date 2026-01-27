import React, { useRef } from 'react'
import { Area, AreaChart, Brush, CartesianGrid, XAxis, YAxis } from 'recharts'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1000 }
]

const CustomBrush = () => {
  const brushRef = useRef<any>(null)
  const [startIndex, setStartIndex] = React.useState(0)
  const [endIndex, setEndIndex] = React.useState(data.length - 1)

  // 自定义旅行者（手柄）组件
  const renderTraveller = (props: { x: number; y: number; width: number; height: number }) => {
    const { x, y, width, height } = props

    // 获取 Brush 的当前范围
    const brush = brushRef.current
    const brushStartX = brush?.state?.startX || 0
    const brushEndX = brush?.state?.endX || 0

    // 通过比较 x 坐标来判断是左边还是右边的手柄
    const isLeftTraveller = Math.abs(x - brushStartX) < Math.abs(x - brushEndX)

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={isLeftTraveller ? '#ff7300' : '#387908'} stroke="#333" strokeWidth={1} rx={2} />
      </g>
    )
  }

  return (
    <AreaChart width={600} height={400} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
      <Brush
        ref={brushRef}
        dataKey="name"
        height={30}
        stroke="#8884d8"
        traveller={renderTraveller}
        travellerWidth={10}
        startIndex={startIndex}
        endIndex={endIndex}
        onChange={e => {
          if (e.startIndex !== undefined && e.endIndex !== undefined) {
            setStartIndex(e.startIndex)
            setEndIndex(e.endIndex)
          }
        }}
      />
    </AreaChart>
  )
}

export default CustomBrush
