import { HStack, Text } from '@chakra-ui/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Bar, BarChart, Brush, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const BarChartWidth = 652

enum StrategyType {
  Spot = 'Spot',
  Curve = 'Curve',
  BidAsk = 'BidAsk'
}

type RangeDataItem = {
  bin: number
  liquidity: number
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getMaxBinRangeData() {
  // const activeBin = -4787
  // const data = []

  // for (let i = activeBin - 34; i <= activeBin + 34; i++) {
  //   const randomInt = getRandomInt(10000, 20000)
  //   data.push({
  //     bin: i,
  //     liquidity: randomInt
  //   })
  // }
  // return data
  return [
    { bin: -4821, liquidity: 12789 },
    { bin: -4820, liquidity: 10112 },
    { bin: -4819, liquidity: 11612 },
    { bin: -4818, liquidity: 19832 },
    { bin: -4817, liquidity: 17090 },
    { bin: -4816, liquidity: 12878 },
    { bin: -4815, liquidity: 18001 },
    { bin: -4814, liquidity: 15450 },
    { bin: -4813, liquidity: 12145 },
    { bin: -4812, liquidity: 16025 },
    { bin: -4811, liquidity: 17644 },
    { bin: -4810, liquidity: 12043 },
    { bin: -4809, liquidity: 18405 },
    { bin: -4808, liquidity: 18097 },
    { bin: -4807, liquidity: 11798 },
    { bin: -4806, liquidity: 14314 },
    { bin: -4805, liquidity: 19947 },
    { bin: -4804, liquidity: 19773 },
    { bin: -4803, liquidity: 17392 },
    { bin: -4802, liquidity: 11263 },
    { bin: -4801, liquidity: 10466 },
    { bin: -4800, liquidity: 14047 },
    { bin: -4799, liquidity: 18950 },
    { bin: -4798, liquidity: 12466 },
    { bin: -4797, liquidity: 14931 },
    { bin: -4796, liquidity: 17491 },
    { bin: -4795, liquidity: 15817 },
    { bin: -4794, liquidity: 16792 },
    { bin: -4793, liquidity: 18381 },
    { bin: -4792, liquidity: 16478 },
    { bin: -4791, liquidity: 14828 },
    { bin: -4790, liquidity: 16604 },
    { bin: -4789, liquidity: 16159 },
    { bin: -4788, liquidity: 12349 },
    { bin: -4787, liquidity: 18842 },
    { bin: -4786, liquidity: 19518 },
    { bin: -4785, liquidity: 17422 },
    { bin: -4784, liquidity: 13194 },
    { bin: -4783, liquidity: 19142 },
    { bin: -4782, liquidity: 11459 },
    { bin: -4781, liquidity: 16268 },
    { bin: -4780, liquidity: 11607 },
    { bin: -4779, liquidity: 11138 },
    { bin: -4778, liquidity: 19061 },
    { bin: -4777, liquidity: 10147 },
    { bin: -4776, liquidity: 18575 },
    { bin: -4775, liquidity: 11247 },
    { bin: -4774, liquidity: 15465 },
    { bin: -4773, liquidity: 17212 },
    { bin: -4772, liquidity: 13302 },
    { bin: -4771, liquidity: 10682 },
    { bin: -4770, liquidity: 14714 },
    { bin: -4769, liquidity: 14162 },
    { bin: -4768, liquidity: 12849 },
    { bin: -4767, liquidity: 19939 },
    { bin: -4766, liquidity: 12338 },
    { bin: -4765, liquidity: 16601 },
    { bin: -4764, liquidity: 12214 },
    { bin: -4763, liquidity: 17379 },
    { bin: -4762, liquidity: 14502 },
    { bin: -4761, liquidity: 11942 },
    { bin: -4760, liquidity: 19370 },
    { bin: -4759, liquidity: 15461 },
    { bin: -4758, liquidity: 17568 },
    { bin: -4757, liquidity: 10193 },
    { bin: -4756, liquidity: 17198 },
    { bin: -4755, liquidity: 16177 },
    { bin: -4754, liquidity: 15628 },
    { bin: -4753, liquidity: 15676 }
  ]
}

function getCurrentRangeData(params: { minBin: number; maxBin: number; activeBin: number; type: StrategyType }) {
  const { minBin, maxBin, activeBin, type } = params
  const data = []
  if (type === StrategyType.Spot) {
    for (let i = minBin; i <= maxBin; i++) {
      data.push({
        bin: i,
        liquidity: 100
      })
    }
    return data
  }

  if (type === StrategyType.Curve) {
    const t = 340
    const leftUnit = t / (activeBin - minBin)
    const rightUnit = t / (maxBin - activeBin)

    for (let i = minBin; i < activeBin; i++) {
      data.push({
        bin: i,
        liquidity: i * leftUnit
      })
    }

    for (let i = activeBin; i <= maxBin; i++) {
      data.push({
        bin: i,
        liquidity: i * rightUnit
      })
    }

    return data
  }

  if (type === StrategyType.BidAsk) {
    const t = 340
    const leftUnit = t / (activeBin - minBin)
    const rightUnit = t / (maxBin - activeBin)

    for (let i = maxBin; i < activeBin; i--) {
      data.push({
        bin: i,
        liquidity: i * rightUnit
      })
    }

    for (let i = activeBin; i >= minBin; i--) {
      data.push({
        bin: i,
        liquidity: i * leftUnit
      })
    }

    return data.reverse()
  }
}

const activeBin = -4787

// 手柄类型
type HandleType = 'start' | 'end' | null

const LeftColor = '#00D8B6'
const RightColor = '#3B82F6'

// 自定义高尔夫球杆手柄组件
const GolfClubHandle: React.FC<{
  x: number
  y: number
  width: number
  height: number
  activeHandle: HandleType
  isDragging: boolean
  isLeft: boolean
}> = ({ x, y, width, height, activeHandle, isDragging, isLeft }) => {
  // 定义手柄颜色方案
  const colors = isLeft
    ? {
        primary: '#00D8B6',
        secondary: '#00B894',
        grip: '#8B4513'
      }
    : {
        primary: '#3B82F6',
        secondary: '#2563EB',
        grip: '#1E3A8A'
      }

  // 当前颜色根据拖动状态变化
  const currentColor = isDragging ? colors.secondary : colors.primary

  return (
    <g>
      {/* 杆身 */}
      {/* <rect x={x + width / 2 - 1} y={y - 15} width={2} height={height + 15} fill={currentColor} /> */}
      <rect x={isLeft ? x + 1 : x + 15} y={y - 15} width={2} height={height + 15} fill={currentColor} />

      {/* 杆头 */}
      <rect x={isLeft ? x - 7 : x + 15} y={y} width={10} height={16} rx={2} fill={currentColor} />

      {/* 握把标记 */}
      <rect x={isLeft ? x - 3 : x + 19} y={y + 5} width={2} height={6} fill="#fff" />
    </g>
  )
}

const BarChartWithCustomBrush: React.FC = () => {
  const brushRef = useRef<any>(null)
  const [brushIndexes, setBrushIndexes] = useState({ startIndex: 0, endIndex: 0 })
  const [activeHandle, setActiveHandle] = useState<HandleType>(null)
  const [type, setType] = useState<StrategyType>(StrategyType.Spot)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
  const [maxBinRangeData, setMaxBinRangeData] = useState<RangeDataItem[]>([])
  const [currentRangeData, setCurrentRangeData] = useState<RangeDataItem[]>([])

  useEffect(() => {
    const data = getMaxBinRangeData()
    if (data) {
      setMaxBinRangeData(data)
    }
  }, [])

  // 自定义旅行者（手柄）组件
  const renderTraveller = (props: { x: number; y: number; width: number; height: number; onBrushStart: (value: string) => void }) => {
    const { x, y, width, height, onBrushStart } = props

    // 获取 Brush 的当前范围
    const brush = brushRef.current
    const brushStartX = brush?.state?.startX || 0
    const brushEndX = brush?.state?.endX || 0

    // 通过比较 x 坐标来判断是左边还是右边的手柄
    const isLeftTraveller = Math.abs(x - brushStartX) < Math.abs(x - brushEndX)

    const handleWidth = 20

    return (
      <g>
        {/* 左侧绿色手柄 */}
        {isLeftTraveller && (
          // <g onMouseDown={() => onBrushStart('start')}>
          <g>
            <GolfClubHandle
              x={x}
              y={y}
              width={handleWidth}
              height={height}
              activeHandle={activeHandle as HandleType}
              isDragging={activeHandle === 'start'}
              isLeft={true}
            />
          </g>
        )}

        {/* 右侧蓝色手柄 */}
        {!isLeftTraveller && (
          // <g onMouseDown={() => onBrushStart('end')}>
          <g>
            <GolfClubHandle
              x={x + width - handleWidth}
              y={y}
              width={handleWidth}
              height={height}
              activeHandle={activeHandle as HandleType}
              isDragging={activeHandle === 'end'}
              isLeft={false}
            />
          </g>
        )}
      </g>
    )
  }

  const handleBrushChange = (e: { startIndex?: number; endIndex?: number }) => {
    console.log('handleBrushChange###e###: ', e)

    if (e.startIndex !== undefined && e.endIndex !== undefined) {
      setBrushIndexes({
        startIndex: Math.max(0, Math.min(e.startIndex, maxBinRangeData.length - 1)),
        endIndex: Math.max(e.startIndex, Math.min(e.endIndex, maxBinRangeData.length - 1))
      })
    }
  }

  const toGetCurrentRangeData = useCallback(
    (minBin: number, maxBin: number) => {
      const data = getCurrentRangeData({
        minBin,
        maxBin,
        activeBin,
        type
      })
      console.log('🚀 ~ toGetCurrentRangeData data:', data)
      if (data) {
        setCurrentRangeData(data)
      }
    },
    [type, activeBin]
  )

  useEffect(() => {
    console.log('watch range change ###brushIndexes.startIndex: ', brushIndexes.startIndex)
    console.log('watch range change ###brushIndexes.endIndex: ', brushIndexes.endIndex)
    const minBin = maxBinRangeData[brushIndexes.startIndex]?.bin
    const maxBin = maxBinRangeData[brushIndexes.endIndex]?.bin
    if (minBin !== undefined && maxBin !== undefined) {
      toGetCurrentRangeData(minBin, maxBin)
    }
  }, [brushIndexes.startIndex, brushIndexes.endIndex])

  useEffect(() => {
    if (brushIndexes?.startIndex === 0 && brushIndexes?.endIndex === 0 && maxBinRangeData?.length > 0) {
      setBrushIndexes({ startIndex: 5, endIndex: 7 })
    }
  }, [maxBinRangeData?.length, brushIndexes?.startIndex, brushIndexes?.endIndex])

  // Tooltip测试
  const [tooltipData, setTooltipData] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Bar 的鼠标移入事件
  const handleBarMouseEnter = (data, index, e) => {
    setTooltipData({
      bin: data.bin,
      liquidity: data.liquidity
    })
    setTooltipPos({
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY
    })
  }

  // 自定义 Tooltip 组件
  const CustomTooltip = () => {
    if (!tooltipData) return null

    return (
      <div
        style={{
          position: 'fixed',
          left: tooltipPos.x + 10,
          top: tooltipPos.y - 40,
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '8px',
          borderRadius: '4px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <div>Bin: {tooltipData?.bin}</div>
        <div>Liquidity: {tooltipData?.liquidity}</div>
      </div>
    )
  }

  return (
    <div style={{ width: `${BarChartWidth}px` }}>
      <style>{`
        .recharts-brush-slide { display: none; }
        .recharts-brush-traveller { outline: none !important; }
        .recharts-brush rect:first-child {
          pointer-events: none;
        }
      `}</style>

      <Text fontSize="18px" color="#fff">
        DLMM Chart Test
      </Text>

      {/* 模拟策略选择 */}
      <HStack mt="20px">
        {Object.values(StrategyType).map(value => {
          return (
            <Text cursor="pointer" color={type === value ? 'primary' : '#ccc'} onClick={() => setType(value)}>
              {value}
            </Text>
          )
        })}
      </HStack>
      <ResponsiveContainer width={BarChartWidth} height={192}>
        <BarChart data={currentRangeData} margin={{ top: 50, right: 0, left: 0, bottom: 50 }}>
          {/* 定义渐变 */}
          <defs>
            <linearGradient id="splitGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="50%" stopColor={LeftColor} />
              <stop offset="50%" stopColor={RightColor} />
            </linearGradient>
          </defs>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey="bin" />
          {/* <YAxis /> */}
          <Tooltip />
          {/* <Legend /> */}
          <Bar dataKey="liquidity">
            {currentRangeData.map((entry, index) => {
              // 根据liquidity值选择颜色或渐变
              const fill =
                entry.bin === activeBin
                  ? 'url(#splitGradient)' // 引用渐变
                  : entry.bin < activeBin
                    ? LeftColor
                    : RightColor

              return <Cell key={`cell-${index}`} fill={fill} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {maxBinRangeData?.length > 0 && (
        <ResponsiveContainer width={BarChartWidth} height={100}>
          <BarChart data={maxBinRangeData} margin={{ top: 0, right: 0, left: 0, bottom: 50 }}>
            <Brush
              ref={brushRef}
              dataKey="bin"
              height={80}
              startIndex={brushIndexes.startIndex}
              endIndex={brushIndexes.endIndex}
              onDragEnd={handleBrushChange}
              traveller={renderTraveller}
              travellerWidth={13.7}
              fill="rgba(0,0,0,0)"
              stroke="rgba(0,0,0,0)"
              // pointerEvents="none"
            >
              <BarChart data={maxBinRangeData} height={80}>
                <Tooltip wrapperStyle={{ zIndex: 100 }} />
                <Bar
                  dataKey="liquidity"
                  fill="rgba(255,255,255,0.15)"
                  isAnimationActive={false}
                  barSize={13.7}
                  onMouseEnter={handleBarMouseEnter}
                  onMouseLeave={() => setTooltipData(null)}
                />
              </BarChart>
            </Brush>
          </BarChart>
        </ResponsiveContainer>
      )}

      <CustomTooltip />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Value: ${payload[0].value}`}</p>
        <p className="desc">{`Bin: ${label}`}</p>
      </div>
    )
  }
  return null
}

export default BarChartWithCustomBrush
