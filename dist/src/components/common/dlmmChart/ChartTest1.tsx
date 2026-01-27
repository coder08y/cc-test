import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import React, { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

interface DataType {
  name: string
  value: number // 原始高度值
  animatedValue: number // 动态控制动画的高度
}

const initialData: DataType[] = [
  { name: '1', value: 30, animatedValue: 0 },
  { name: '2', value: 20, animatedValue: 0 },
  { name: '3', value: 50, animatedValue: 0 },
  { name: '4', value: 40, animatedValue: 0 },
  { name: '5', value: 60, animatedValue: 0 },
  { name: '6', value: 70, animatedValue: 0 },
  { name: '7', value: 80, animatedValue: 0 },
  { name: '8', value: 90, animatedValue: 0 },
  { name: '9', value: 100, animatedValue: 0 },
  { name: '10', value: 110, animatedValue: 0 },
  { name: '11', value: 120, animatedValue: 0 },
  { name: '12', value: 130, animatedValue: 0 }
]

const App: React.FC = () => {
  const [range, setRange] = useState<[number, number]>([0, initialData.length - 1])
  const [animatedData, setAnimatedData] = useState<DataType[]>(initialData)

  // 动画逻辑：动态更新选中和未选中的柱子高度
  useEffect(() => {
    const [start, end] = range

    const interval = setInterval(() => {
      setAnimatedData(prevData =>
        prevData.map((item, index) => {
          if (index >= start && index <= end) {
            // 选中区间：高度逐渐增加到原始值
            if (item.animatedValue < item.value) {
              return { ...item, animatedValue: Math.min(item.animatedValue + 5, item.value) }
            }
          } else {
            // 未选中区间：高度逐渐减少到 0
            if (item.animatedValue > 0) {
              return { ...item, animatedValue: Math.max(item.animatedValue - 5, 0) }
            }
          }
          return item // 保持当前状态
        })
      )
    }, 30) // 每 10ms 更新一次动画

    return () => clearInterval(interval) // 清除动画定时器
  }, [range])

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Recharts Two-layer Overlapping BarChart with Animation</h2>

      {/* 柱状图 */}
      <BarChart
        width={700}
        height={400}
        data={animatedData}
        barSize={20}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        barCategoryGap={0}
        barGap={0}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        <Bar dataKey="value" fill="#00ff00" animationDuration={0} zIndex={1} margin={{ left: -10, right: -10 }} />

        {/* 顶层柱状图：动态动画，选中区间高亮 */}
        <Bar dataKey="animatedValue" barSize={-20} animationDuration={0} zIndex={2} fill="red">
          {/* {animatedData.map((entry, index) => (
            <rect
              className="test-react"
              key={`bar-${index}`}
              x={index * 50 + 10}
              y={400 - entry.animatedValue}
              width={40}
              height={entry.animatedValue}
              fill={index >= range[0] && index <= range[1] ? '#ff0000' : '#0000ff'}
            />
          ))} */}
        </Bar>
      </BarChart>

      {/* 双边滑动杆 */}
      <div style={{ marginTop: '20px' }}>
        <Slider
          range
          min={0}
          max={initialData.length - 1}
          value={range}
          onChange={newRange => setRange(newRange as [number, number])} // 更新选中区间
          marks={initialData.reduce(
            (acc, cur, idx) => {
              acc[idx] = cur.name // 为滑动杆添加刻度
              return acc
            },
            {} as Record<number, string>
          )}
          step={1}
        />
      </div>
    </div>
  )
}

export default App
