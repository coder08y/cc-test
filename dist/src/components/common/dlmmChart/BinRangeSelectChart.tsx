import { HStack, Text, VStack } from '@chakra-ui/react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from 'recharts'

export default function BinRangeSelectChart({
  activeBin,
  maxBinRangeData,
  onChangeRange
}: {
  activeBin: number
  maxBinRangeData: any
  onChangeRange: (min: any, max: any) => void
}) {
  const [range, setRange] = useState<[number, number]>([0, 68])
  const [rangeData, setRangeData] = useState([])

  const marks = useMemo(() => {
    const unit = parseInt(String(maxBinRangeData?.length / 9))
    const result = maxBinRangeData.map((item: any, index: number) => {
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
    const data = maxBinRangeData.map((item: any, index: number) => {
      if (index < range[0] || index > range[1]) {
        return {
          ...item,
          liquidity: 0
        }
      }
      return item
    })
    console.log('🚀 ~ data ~ data123:', data)

    setRangeData(data)
    // }, 300)

    // return () => clearTimeout(timer)
  }, [range])

  const [hoveredIndex, setHoveredIndex] = useState(null)

  const handleChangeComplete = useCallback(
    (value: any) => {
      console.log('🚀 ~ handleChangeComplete ~ value:', value)
      const minBin = maxBinRangeData[value[0]].bin
      const maxBin = maxBinRangeData[value[1]].bin
      console.log('🚀 ~ handleChangeComplete ~ min data: minBin: ', minBin)
      console.log('🚀 ~ handleChangeComplete ~ min data: maxBin: ', maxBin)
      onChangeRange(minBin, maxBin)
    },
    [maxBinRangeData]
  )

  return (
    <div style={{ padding: '0px', width: '625px', height: '120px', margin: '0 auto', position: 'relative' }}>
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

          {/* <Bar
            dataKey="liquidity"
            barSize={20}
            fill="rgba(0,0,0,0)"
            animationDuration={0}
            activeBar={{
              fill: '#76C8FF' // 悬停时的高亮颜色
              // cursor: 'pointer'
            }}
          /> */}
          <Bar dataKey="liquidity" onMouseEnter={(e, index) => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
            {maxBinRangeData.map((entry: any, index: number) => {
              // 根据liquidity值选择颜色或渐变
              const fill =
                index === hoveredIndex
                  ? '#76C8FF'
                  : entry.bin === activeBin
                    ? '#568BB0' // 引用渐变
                    : 'rgba(0,0,0,0)'

              return <Cell key={`cell-${index}`} fill={fill} />
            })}
          </Bar>
        </BarChart>
      </div>

      {/* 双边滑动杆 */}
      <div style={{ width: '100%', position: 'absolute', left: 0, bottom: '-8px' }}>
        <Slider
          range
          min={0}
          max={maxBinRangeData.length - 1}
          value={range}
          onChange={newRange => setRange(newRange as [number, number])} // 更新选中区间
          onChangeComplete={handleChangeComplete} // 更新选中区间
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
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active) return null

  return (
    <VStack minW="256px" bg="#141618" borderRadius="6px" border="1px solid" borderColor="#2A3238" padding="8px" gap="4px">
      <HStack w="100%" justify="space-between">
        <Text fontSize="14px" color="text_paragraph">
          Active Bin
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
