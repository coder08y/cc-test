import { HStack, Text, VStack } from '@chakra-ui/react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const BarChartWidth = 652

enum StrategyType {
  Spot = 'Spot',
  Curve = 'Curve',
  BidAsk = 'BidAsk'
}

const LeftColor = '#00D8B6'
const RightColor = '#3B82F6'

type RangeDataItem = {
  bin: number
  liquidity: number
  animatedValue?: number
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getMaxBinRangeData() {
  const activeBin = -4787
  const data = []

  for (let i = activeBin - 34; i <= activeBin + 34; i++) {
    const randomInt = getRandomInt(10000, 20000)
    data.push({
      bin: i,
      liquidity: randomInt
    })
  }
  return data
  // const list = [
  //   { bin: -4821, liquidity: 12789 },
  //   { bin: -4820, liquidity: 10112 },
  //   { bin: -4819, liquidity: 11612 },
  //   { bin: -4818, liquidity: 19832 },
  //   { bin: -4817, liquidity: 17090 },
  //   { bin: -4816, liquidity: 12878 },
  //   { bin: -4815, liquidity: 18001 },
  //   { bin: -4814, liquidity: 15450 },
  //   { bin: -4813, liquidity: 12145 },
  //   { bin: -4812, liquidity: 16025 },
  //   { bin: -4811, liquidity: 17644 },
  //   { bin: -4810, liquidity: 12043 },
  //   { bin: -4809, liquidity: 18405 },
  //   { bin: -4808, liquidity: 18097 },
  //   { bin: -4807, liquidity: 11798 },
  //   { bin: -4806, liquidity: 14314 },
  //   { bin: -4805, liquidity: 19947 },
  //   { bin: -4804, liquidity: 19773 },
  //   { bin: -4803, liquidity: 17392 },
  //   { bin: -4802, liquidity: 11263 },
  //   { bin: -4801, liquidity: 10466 },
  //   { bin: -4800, liquidity: 14047 },
  //   { bin: -4799, liquidity: 18950 },
  //   { bin: -4798, liquidity: 12466 },
  //   { bin: -4797, liquidity: 14931 },
  //   { bin: -4796, liquidity: 17491 },
  //   { bin: -4795, liquidity: 15817 },
  //   { bin: -4794, liquidity: 16792 },
  //   { bin: -4793, liquidity: 18381 },
  //   { bin: -4792, liquidity: 16478 },
  //   { bin: -4791, liquidity: 14828 },
  //   { bin: -4790, liquidity: 16604 },
  //   { bin: -4789, liquidity: 16159 },
  //   { bin: -4788, liquidity: 12349 },
  //   { bin: -4787, liquidity: 18842 },
  //   { bin: -4786, liquidity: 19518 },
  //   { bin: -4785, liquidity: 17422 },
  //   { bin: -4784, liquidity: 13194 },
  //   { bin: -4783, liquidity: 19142 },
  //   { bin: -4782, liquidity: 11459 },
  //   { bin: -4781, liquidity: 16268 },
  //   { bin: -4780, liquidity: 11607 },
  //   { bin: -4779, liquidity: 11138 },
  //   { bin: -4778, liquidity: 19061 },
  //   { bin: -4777, liquidity: 10147 },
  //   { bin: -4776, liquidity: 18575 },
  //   { bin: -4775, liquidity: 11247 },
  //   { bin: -4774, liquidity: 15465 },
  //   { bin: -4773, liquidity: 17212 },
  //   { bin: -4772, liquidity: 13302 },
  //   { bin: -4771, liquidity: 10682 },
  //   { bin: -4770, liquidity: 14714 },
  //   { bin: -4769, liquidity: 14162 },
  //   { bin: -4768, liquidity: 12849 },
  //   { bin: -4767, liquidity: 19939 },
  //   { bin: -4766, liquidity: 12338 },
  //   { bin: -4765, liquidity: 16601 },
  //   { bin: -4764, liquidity: 12214 },
  //   { bin: -4763, liquidity: 17379 },
  //   { bin: -4762, liquidity: 14502 },
  //   { bin: -4761, liquidity: 11942 },
  //   { bin: -4760, liquidity: 19370 },
  //   { bin: -4759, liquidity: 15461 },
  //   { bin: -4758, liquidity: 17568 },
  //   { bin: -4757, liquidity: 10193 },
  //   { bin: -4756, liquidity: 17198 },
  //   { bin: -4755, liquidity: 16177 },
  //   { bin: -4754, liquidity: 15628 },
  //   { bin: -4753, liquidity: 15676 }
  // ]

  // return list
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
    console.log('🚀 ~ getCurrentRangeData ~ minBin:', minBin)
    console.log('🚀 ~ getCurrentRangeData ~ maxBin:', maxBin)
    console.log('🚀 ~ getCurrentRangeData ~ activeBin:', activeBin)

    const rightUnit = t / (maxBin - activeBin)

    console.log('🚀 ~ getCurrentRangeData ~ leftUnit:', leftUnit)
    console.log('🚀 ~ getCurrentRangeData ~ rightUnit:', rightUnit)

    let leftIndex = 0
    for (let i = minBin; i < activeBin; i++) {
      leftIndex++
      data.push({
        bin: i,
        liquidity: leftIndex * leftUnit
      })
    }

    let rightIndex = maxBin - activeBin
    for (let i = activeBin; i <= maxBin; i++) {
      data.push({
        bin: i,
        liquidity: rightIndex * rightUnit
      })
      rightIndex--
    }

    return data
  }

  if (type === StrategyType.BidAsk) {
    const t = 340
    const leftUnit = t / (activeBin - minBin)
    const rightUnit = t / (maxBin - activeBin)

    let leftIndex = activeBin - minBin + 1
    for (let i = minBin; i < activeBin; i++) {
      leftIndex--
      data.push({
        bin: i,
        liquidity: leftIndex * leftUnit
      })
    }

    let rightIndex = 0
    for (let i = activeBin; i <= maxBin; i++) {
      rightIndex++
      data.push({
        bin: i,
        liquidity: rightIndex * rightUnit
      })
    }

    return data
  }
}

const activeBin = -4787

const App: React.FC = () => {
  const [maxBinRangeData, setMaxBinRangeData] = useState<RangeDataItem[]>([])
  const [currentRangeData, setCurrentRangeData] = useState<RangeDataItem[]>([])
  const [range, setRange] = useState<[number, number]>([0, 68])
  const [rangeData, setRangeData] = useState([])
  const [type, setType] = useState<StrategyType>(StrategyType.Spot)

  useEffect(() => {
    const data = getMaxBinRangeData()
    if (data) {
      setMaxBinRangeData(data)
    }
  }, [])

  const marks = useMemo(() => {
    const unit = parseInt(String(maxBinRangeData?.length / 9))
    const result = maxBinRangeData.map((item, index) => {
      if (index % unit === 0 && index !== 0) {
        return item.bin
      }
      return ''
    })
    console.log('🚀 ~ marks ~ result:', result)
    return result
  }, [maxBinRangeData])

  useEffect(() => {
    console.log('🚀 ~ range range:', range)
    // const timer = setTimeout(() => {
    const data = maxBinRangeData.map((item, index) => {
      if (index < range[0] || index > range[1]) {
        return {
          ...item,
          liquidity: 0
        }
      }
      return item
    })
    console.log('🚀 ~ data ~ data:', data)

    setRangeData(data)
    // }, 300)

    // return () => clearTimeout(timer)
  }, [range])

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
    if (range?.[0] === undefined || range?.[1] === undefined) return
    const minBin = maxBinRangeData[range[0]]?.bin
    const maxBin = maxBinRangeData[range[1]]?.bin
    if (minBin !== undefined && maxBin !== undefined) {
      toGetCurrentRangeData(minBin, maxBin)
    }
  }, [range])

  return (
    <div style={{ padding: '0px', width: '625px', margin: '0 auto' }}>
      <style>{`
        .rc-slider-handle:after {
          content: '';
          width: 2px;
          height: 6px;
          background: #fff;
          position: absolute;
          left: 4px;
          top: 3px;
        }
        .rc-slider-handle-dragging.rc-slider-handle-dragging.rc-slider-handle-dragging {
          box-shadow: none;
          border-color: #fff!important;
        }
      `}</style>

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

      {/* 当前要添加的流动性分布图 */}
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

      <div style={{ padding: '0px', width: '625px', height: '120px', margin: '0 auto', position: 'relative' }}>
        {/* 下方灰色柱状图 */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
          <BarChart width={625} height={120} data={maxBinRangeData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap={0} barGap={0}>
            <XAxis dataKey="bin" hide={true} />
            <YAxis hide={true} />
            <Bar dataKey="liquidity" barSize={20} fill="#222C35" animationDuration={0} />
          </BarChart>
        </div>

        {/* 选中区间动画柱状图 */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'auto' }}>
          <BarChart width={625} height={120} data={rangeData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap={0} barGap={0}>
            <XAxis dataKey="bin" hide={true} />
            <YAxis hide={true} />
            {/* <Tooltip
            itemStyle={{
              fontSize: 14, // 文字大小
              fontFamily: 'Arial', // 字体
              color: '#333', // 文字颜色
              padding: '4px 0', // 内边距
              borderBottom: '1px solid #eee' // 底部分隔线
            }}
          /> */}

            <Bar
              dataKey="liquidity"
              barSize={20}
              fill="#354F62"
              isAnimationActive={true}
              // 动画持续时间（单位：毫秒，默认300ms）
              animationDuration={800}
              // 动画缓动函数（可选：ease-in, ease-out, ease-in-out等）
              animationEasing="ease-in-out"
            />

            {/* 顶层柱状图：动态动画，选中区间高亮 */}
            {/* <Bar dataKey="animatedValue" barSize={-20} animationDuration={0} fill="red"></Bar> */}
          </BarChart>
        </div>

        {/* 标识当前bin和为了tooltip做的透明柱状图*/}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
          <BarChart width={625} height={120} data={maxBinRangeData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barCategoryGap={0} barGap={0}>
            <XAxis dataKey="bin" hide={true} />
            <YAxis hide={true} />
            <Tooltip
              cursor={false} // 禁用全屏竖线背景
              content={<CustomTooltip />}
            />

            <Bar
              dataKey="liquidity"
              barSize={20}
              fill="rgba(0,0,0,0)"
              animationDuration={0}
              activeBar={{
                fill: '#76C8FF' // 悬停时的高亮颜色
                // cursor: 'pointer'
              }}
            />
          </BarChart>
        </div>

        {/* 双边滑动杆 */}
        <div style={{ width: '625px', position: 'absolute', left: 0, bottom: '-8px' }}>
          <Slider
            range
            min={0}
            max={maxBinRangeData.length - 1}
            value={range}
            onChange={newRange => setRange(newRange as [number, number])} // 更新选中区间
            marks={marks}
            step={1}
            dots={false}
            dotStyle={{ display: 'none' }}
            handleStyle={[
              {
                // 左侧滑块样式
                borderColor: '#00D8B6', // 蓝色边框
                backgroundColor: '#00D8B6',
                borderRadius: '4px 2px 2px 4px',
                width: 14,
                height: 16,
                opacity: 1
              },
              {
                // 右侧滑块样式
                borderColor: '#4A9AEF', // 蓝色边框
                backgroundColor: '#4A9AEF',
                borderRadius: '2px 4px 4px 2px',
                width: 14,
                height: 16,
                opacity: 1
              }
            ]}
            trackStyle={[
              {
                backgroundColor: '#568BB0', // 选中轨道颜色（默认蓝色）
                height: 6, // 轨道高度
                borderRadius: 3 // 轨道圆角
              }
            ]}
            railStyle={{
              backgroundColor: '#222C35', // 外部轨道颜色（默认浅灰色）
              height: 6, // 轨道高度
              borderRadius: 3 // 轨道圆角
            }}
          />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  console.log('🚀 ~ CustomTooltip ~ active:', active)
  console.log('🚀 ~ CustomTooltip ~ payload:', payload)
  if (!active) return null

  return (
    <VStack minW="256px" bg="#141618" borderRadius="6px" border="1px solid" borderColor="#2A3238" padding="8px" gap="4px">
      <HStack w="100%" justify="space-between">
        <Text fontSize="14px" color="text_paragraph">
          Bin Price
        </Text>
        <Text fontSize="14px" color="text_caption">
          1.135
        </Text>
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text fontSize="14px" color="text_paragraph">
          SUI
        </Text>
        <Text fontSize="14px" color="text_caption">
          20.66
        </Text>
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text fontSize="14px" color="text_paragraph">
          Your new % of SUI in this bin
        </Text>
        <Text fontSize="14px" color="text_caption">
          99.99%
        </Text>
      </HStack>
    </VStack>
  )
}

export default App
