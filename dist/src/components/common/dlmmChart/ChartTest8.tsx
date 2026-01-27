import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useEffect, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Tooltip, XAxis, YAxis } from 'recharts'

const data = Array.from({ length: 70 }, (_, i) => ({
  bin: i,
  liquidity: Math.floor(Math.random() * 100) + 10
}))

const COLOR_IN_RANGE = '#1E40AF' // 深蓝色（区间内）
const COLOR_OUT_RANGE = '#93C5FD' // 浅蓝色（区间外）

const App = () => {
  const [selectedRange, setSelectedRange] = useState([10, 50])
  const [animationStates, setAnimationStates] = useState({})
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false // 组件卸载时标记
    }
  }, [])

  // 处理滑块变化
  const handleRangeChange = newRange => {
    setSelectedRange(newRange)

    // 创建动画效果
    const animateColorChange = () => {
      const newStates = { ...animationStates }

      // 为所有柱子创建初始动画状态
      data.forEach((_, index) => {
        const isInRange = index >= newRange[0] && index <= newRange[1]
        newStates[index] = {
          inRange: isInRange,
          progress: isInRange ? 0 : 1 // 初始状态
        }
      })

      setAnimationStates(newStates)

      // 开始动画
      data.forEach((_, index) => {
        animateSingleBar(index, newStates[index].inRange)
      })
    }

    animateColorChange()
  }

  // 动画单个柱子
  const animateSingleBar = (index, isInRange) => {
    let startTime = null
    const duration = 500 // 动画持续时间（毫秒）

    const animate = timestamp => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 组件卸载时停止动画
      if (!isMounted.current) return

      // 更新动画状态
      setAnimationStates(prev => {
        if (!prev[index]) return prev

        return {
          ...prev,
          [index]: {
            ...prev[index],
            progress: isInRange ? progress : 1 - progress
          }
        }
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  // 生成渐变ID
  const getGradientId = index => {
    const state = animationStates[index] || { inRange: false, progress: 0 }
    return `gradient-${index}-${state.inRange ? 'in' : 'out'}`
  }

  // 生成渐变定义
  const renderGradients = () => {
    // 创建一个集合，确保每个渐变只生成一次
    const gradientSet = new Set()
    const gradients = []

    data.forEach((_, index) => {
      const state = animationStates[index] || { inRange: false, progress: 0 }
      const gradientId = getGradientId(index)

      if (!gradientSet.has(gradientId)) {
        gradientSet.add(gradientId)

        gradients.push(
          <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            {/* 顶部颜色 */}
            <stop offset="0%" stopColor={state.inRange ? COLOR_IN_RANGE : COLOR_OUT_RANGE} />

            {/* 中间过渡点 */}
            <stop offset={`${state.progress * 100}%`} stopColor={state.inRange ? COLOR_IN_RANGE : COLOR_OUT_RANGE} />
            <stop offset={`${state.progress * 100}%`} stopColor={state.inRange ? COLOR_OUT_RANGE : COLOR_IN_RANGE} />

            {/* 底部颜色 */}
            <stop offset="100%" stopColor={state.inRange ? COLOR_OUT_RANGE : COLOR_IN_RANGE} />
          </linearGradient>
        )
      }
    })

    return gradients
  }

  return (
    <div className="container" style={{ width: '90%', margin: '0 auto' }}>
      <h3>流动性分布区间选择</h3>

      <BarChart width={800} height={400} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {/* 渐变定义 */}
        <defs>{renderGradients()}</defs>

        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bin" tick={{ fontSize: 10 }} tickInterval={5} />
        <YAxis />
        <Tooltip itemStyle={{ fontSize: 14 }} labelStyle={{ fontWeight: 'bold' }} />
        <Legend />

        {/* 柱状图配置 */}
        <Bar dataKey="liquidity" fill={COLOR_OUT_RANGE} barSize={12} minPointSize={2} animationDuration={500} animationEasing="ease-out" unit=" ETH">
          {/* 为每个柱子应用自定义渐变 */}
          {data.map((entry, index) => {
            const gradientId = getGradientId(index)

            return <Cell key={index} fill={`url(#${gradientId})`} style={{ transition: 'fill 0.3s ease-out' }} />
          })}
        </Bar>
      </BarChart>

      {/* 滑块控件 */}
      <div style={{ width: '800px', margin: '20px auto' }}>
        <Slider
          range
          min={0}
          max={69}
          step={1}
          defaultValue={[10, 50]}
          value={selectedRange}
          onChange={handleRangeChange}
          handleStyle={[
            {
              width: 18,
              height: 18,
              borderRadius: '50%',
              borderColor: COLOR_IN_RANGE,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 3px rgba(0,0,0,0.2)'
            },
            {
              width: 18,
              height: 18,
              borderRadius: '50%',
              borderColor: COLOR_IN_RANGE,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 3px rgba(0,0,0,0.2)'
            }
          ]}
          trackStyle={[
            {
              backgroundColor: COLOR_IN_RANGE,
              height: 6,
              borderRadius: 3
            }
          ]}
          railStyle={{
            backgroundColor: '#E5E7EB',
            height: 6,
            borderRadius: 3
          }}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
        选中区间: {selectedRange[0]} - {selectedRange[1]}
      </div>
    </div>
  )
}

export default App
