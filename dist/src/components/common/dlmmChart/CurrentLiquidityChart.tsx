import { HStack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

const LeftColor = '#00D8B6'
const RightColor = '#3B82F6'
export default function CurrentLiquidityChart({ width, data, activeBin }: { width: number; data: any[]; activeBin: number }) {
  const renderCustomBar = useCallback((props: any) => {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const { x, y, width, height, payload, index } = props
    const isHovered = index === hoveredIndex

    return (
      <g onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={payload.bin === activeBin ? 'url(#splitGradient)' : payload.bin < activeBin ? LeftColor : RightColor}
        />
        {isHovered && <rect x={x} y={y} width={width} height={height} fill="rgba(0,0,0,0.3)" />}
        {payload.bin === activeBin && (
          <g>
            {/* 竖线 */}
            <line x1={x + width / 2} y1={40} x2={x + width / 2} y2={112} stroke="#fff" strokeWidth={2} />
            {/* 倒三角 */}
            <path d={`M${x + width / 2 - 5},${38} L${x + width / 2},${45} L${x + width / 2 + 5},${38} Z`} fill="#fff" />
          </g>
        )}
      </g>
    )
  }, [])

  return (
    <VStack gap="0px" p="0px" width={width} height={192} position="relative">
      {!!data && data?.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 50, right: 0, left: 0, bottom: 50 }}>
            {/* 定义渐变 */}
            <defs>
              <linearGradient id="splitGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="50%" stopColor={LeftColor} />
                <stop offset="50%" stopColor={RightColor} />
              </linearGradient>
            </defs>
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="bin" tick={{ fill: '#909CA4' }} />
            {/* <YAxis /> */}
            <Tooltip cursor={false} content={<CustomTooltip />} />
            {/* <Legend /> */}
            {/* <Bar dataKey="liquidity">
            {data.map((entry, index) => {
              // 根据liquidity值选择颜色或渐变
              const fill =
                entry.bin === activeBin
                  ? 'url(#splitGradient)' // 引用渐变
                  : entry.bin < activeBin
                    ? LeftColor
                    : RightColor

              return <Cell key={`cell-${index}`} fill={fill}></Cell>
            })}
          </Bar> */}
            <Bar dataKey="liquidity" shape={renderCustomBar} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
      {/* 当前要添加的流动性分布图 */}
    </VStack>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active) return null

  return (
    <VStack minW="122px" bg="#141618" borderRadius="6px" border="1px solid" borderColor="#2A3238" padding="8px" gap="4px">
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
    </VStack>
  )
}

const NoData = () => {
  return (
    <VStack
      w="100%"
      h="100%"
      gap="8px"
      bg="rgba(129,133,139,0.04)"
      alignItems="center"
      justify="center"
      position="absolute"
      left="0px"
      top="0px"
      backdropFilter="blur(2px)"
    >
      <Text color="text_caption" fontSize="14px">
        Preview your liquidity position
      </Text>
      <Text color="text_paragraph" fontSize="12px">
        Please enter deposit amount and select price range
      </Text>
    </VStack>
  )
}
