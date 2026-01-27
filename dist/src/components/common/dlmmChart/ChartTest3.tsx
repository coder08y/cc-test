//toDo: 尝试使用Brush实现功能

import { useState } from 'react'
import { Bar, BarChart, Brush, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1000 },
  { name: 'Aug', value: 400 },
  { name: 'Sep', value: 700 },
  { name: 'Oct', value: 500 },
  { name: 'Nov', value: 300 },
  { name: 'Dec', value: 800 }
]

const BarChartWithBrush = () => {
  const [brushIndexes, setBrushIndexes] = useState({ startIndex: 0, endIndex: data.length - 1 })

  const handleBrushChange = ({ startIndex, endIndex }: { startIndex?: number; endIndex?: number }) => {
    if (startIndex !== undefined && endIndex !== undefined) {
      setBrushIndexes({ startIndex, endIndex })
    }
  }

  const displayedData = data.slice(brushIndexes.startIndex, brushIndexes.endIndex + 1)

  return (
    <div style={{ width: '100%', height: 500 }}>
      <h2>Main Bar Chart with Brush</h2>
      <ResponsiveContainer width="100%" height="70%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
          <Brush
            dataKey="name"
            height={30}
            stroke="#8884d8"
            startIndex={brushIndexes.startIndex}
            endIndex={brushIndexes.endIndex}
            onChange={handleBrushChange}
            alwaysShowText={true}
          >
            {/* This is the mini-bar chart inside the brush */}
            <BarChart data={data}>
              <Bar dataKey="value" fill="#8884d8" isAnimationActive={false} />
            </BarChart>
          </Brush>
        </BarChart>
      </ResponsiveContainer>

      {/* <h3>Zoomed Area Preview</h3>
      <ResponsiveContainer width="100%" height="20%">
        <BarChart data={displayedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer> */}
    </div>
  )
}

export default BarChartWithBrush
