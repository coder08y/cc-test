import { Box, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Cell, Pie, PieChart, Sector } from 'recharts'

export type LpBreakdownDataItem = {
  color: string
  percent: string
}

type LpBreakdownPieChartProps = {
  data: LpBreakdownDataItem[]
  width?: number
  innerRadius?: number
  outerRadius?: number
  onHover?: (index: number | null) => void
}

export default function LpBreakdownPieChart({ data, width = 100, innerRadius = 35, outerRadius = 45, onHover }: LpBreakdownPieChartProps) {
  const pieSize = 120
  const shadowData = [{ value: 1 }]
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // 将 percent 字符串转换为数值
  const chartData = data.map(item => ({
    ...item,
    value: parseFloat(item.percent?.toString().replace('%', '') || '0')
  }))

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index)
    onHover?.(index)
  }

  const handleMouseLeave = () => {
    setActiveIndex(null)
    onHover?.(null)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
    return <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 3} startAngle={startAngle} endAngle={endAngle} fill={fill} />
  }
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // 只移除饼图容器相关的焦点
    if (chartContainerRef.current) {
      const svgElement = chartContainerRef.current.querySelector('svg')
      if (svgElement) {
        svgElement.blur()
        ;(svgElement as any).style.outline = 'none'
        ;(svgElement as any).style.border = 'none'
        ;(svgElement as any).style.boxShadow = 'none'
      }
      chartContainerRef.current.blur()
      // 只移除饼图容器内的焦点元素
      const activeElement = document.activeElement
      if (activeElement && chartContainerRef.current.contains(activeElement)) {
        ;(activeElement as HTMLElement).blur()
      }
    }
  }

  // 处理触摸事件，用于移动端
  const handleTouchStart = (e: React.TouchEvent) => {
    // 防止双击缩放
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 只移除饼图容器内的焦点
    if (chartContainerRef.current) {
      const activeElement = document.activeElement
      if (activeElement && chartContainerRef.current.contains(activeElement)) {
        ;(activeElement as HTMLElement).blur()
      }
    }
  }

  // 处理点击饼图扇形区域（移动端和桌面端）
  const handlePieClick = (data: any, index: number, e: any) => {
    e?.stopPropagation()
    if (activeIndex === index) {
      // 如果点击的是当前激活的扇形，则取消激活
      setActiveIndex(null)
      onHover?.(null)
    } else {
      // 否则激活该扇形
      setActiveIndex(index)
      onHover?.(index)
    }
  }

  useEffect(() => {
    // 监听点击事件，移除焦点和处理空白区域点击
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement

      // 如果点击的是空白区域（不在饼图容器内），重置activeIndex
      if (chartContainerRef.current && !chartContainerRef.current.contains(target)) {
        setActiveIndex(null)
        onHover?.(null)
      }

      // 只移除饼图容器内的焦点
      if (chartContainerRef.current) {
        const svgElement = chartContainerRef.current.querySelector('svg')
        if (svgElement) {
          setTimeout(() => {
            svgElement.blur()
            ;(svgElement as any).style.outline = 'none'
            ;(svgElement as any).style.border = 'none'
            ;(svgElement as any).style.boxShadow = 'none'
          }, 0)
        }
        // 只移除饼图容器内的焦点元素
        const activeElement = document.activeElement
        if (activeElement && chartContainerRef.current.contains(activeElement)) {
          ;(activeElement as HTMLElement).blur()
        }
      }
    }

    // 监听文档点击和触摸事件，用于处理点击空白区域
    document.addEventListener('click', handleClick as EventListener)
    document.addEventListener('touchend', handleClick as EventListener, { passive: true })

    const container = chartContainerRef.current
    if (container) {
      container.addEventListener('click', handleClick as EventListener)
      return () => {
        document.removeEventListener('click', handleClick as EventListener)
        document.removeEventListener('touchend', handleClick as EventListener)
        container.removeEventListener('click', handleClick as EventListener)
      }
    }

    return () => {
      document.removeEventListener('click', handleClick as EventListener)
      document.removeEventListener('touchend', handleClick as EventListener)
    }
  }, [onHover])

  // 处理VStack空白区域点击
  const handleVStackClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // 如果点击的是VStack本身（不是饼图容器内的元素），重置状态
    if (target === e.currentTarget) {
      setActiveIndex(null)
      onHover?.(null)
    }
  }

  return (
    <VStack
      align="center"
      gap="16px"
      onClick={handleVStackClick}
      onTouchEnd={e => {
        const target = e.target as HTMLElement
        // 如果触摸结束在VStack本身（不是饼图容器内的元素），重置状态
        if (target === e.currentTarget) {
          setActiveIndex(null)
          onHover?.(null)
        }
      }}
    >
      {/* 饼图 */}
      <Box
        ref={chartContainerRef}
        outline="none"
        border="none"
        _focus={{ outline: 'none', border: 'none', boxShadow: 'none' }}
        _focusVisible={{ outline: 'none', border: 'none', boxShadow: 'none' }}
        _active={{ outline: 'none', border: 'none', boxShadow: 'none' }}
        tabIndex={-1}
        display="inline-block"
        onMouseDown={handleMouseDown}
        onClick={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{
          touchAction: 'manipulation', // 防止双击缩放
          WebkitTouchCallout: 'none', // 禁用长按菜单
          WebkitUserSelect: 'none', // 禁用选择
          userSelect: 'none',
          '& svg': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important',
            touchAction: 'manipulation'
          },
          '& svg:focus': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important'
          },
          '& svg:focus-visible': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important'
          },
          '& svg:active': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important'
          },
          '& *': {
            outline: 'none !important'
          },
          '& *:focus': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important'
          },
          '& *:focus-visible': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important'
          }
        }}
      >
        <PieChart
          width={pieSize}
          height={pieSize}
          style={{
            outline: 'none',
            border: 'none',
            boxShadow: 'none'
          }}
        >
          {/* 内部阴影圆环 */}
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius - 4}
            outerRadius={innerRadius}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={false}
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={`shadow-${index}`} fill={entry.color} opacity={0.2} />
            ))}
          </Pie>

          {/* 内边框 - 距离阴影圆环内侧3px */}
          <Pie
            data={shadowData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius - 8}
            outerRadius={innerRadius - 7}
            fill="#23252C"
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={false}
          />

          {/* 主饼图 */}
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={false}
            startAngle={90}
            endAngle={-270}
            activeIndex={activeIndex ?? undefined}
            activeShape={renderActiveShape}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handlePieClick}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry?.color}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Pie>

          {/* 外层边框圆环 - 位于主饼图外侧6px处，宽度1px */}
          <Pie
            data={shadowData}
            cx="50%"
            cy="50%"
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 7}
            fill="#23252C"
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={false}
          />
        </PieChart>
      </Box>
    </VStack>
  )
}
