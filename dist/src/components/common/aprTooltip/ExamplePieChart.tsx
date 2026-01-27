import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useCallback } from 'react'
import { Cell, Legend, Pie, PieChart } from 'recharts'

const ExamplePieChart = ({ originData }: { originData: any }) => {
  const renderLegend = useCallback(
    (props: any) => {
      const { payload } = props
      return (
        <VStack w="calc(100% - 72px)" align="flex-start" justify="center" gap="12px">
          {payload.map((entry, index) => (
            <HStack w="100%" key={`item-${index}`} gap="0px">
              {/* 图例颜色 */}
              <Box
                style={{
                  width: '12px',
                  height: '12px',
                  minWidth: '12px',
                  minHeight: '12px',
                  backgroundColor: entry.color,
                  marginRight: '8px',
                  borderRadius: '50%'
                }}
              />
              {/* 名称和数值 */}
              <HStack w="100%" justify="space-between">
                <Text fontSize="14px" whiteSpace="nowrap">
                  {entry.value}
                </Text>
                <Text fontSize="14px" color="text_caption" textAlign="right">
                  {originData?.[index]?.displayValue}
                </Text>
              </HStack>
            </HStack>
          ))}
        </VStack>
      )
    },
    [originData]
  )

  return (
    <PieChart width={320} height={originData.length <= 3 ? 70 : 70 + (originData?.length - 3) * 25}>
      <Pie
        data={originData}
        cx="10%"
        cy="50%"
        innerRadius={20} // 设置内半径，创建空心效果
        outerRadius={32}
        fill="#8884d8"
        dataKey="value"
        strokeWidth={0}
        isAnimationActive={false}
      >
        {originData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry?.color} />
        ))}
      </Pie>
      <Legend
        content={renderLegend}
        layout="horizontal" // Set layout to horizontal
        align="center" // Align the Legend to the center
        verticalAlign="middle"
        wrapperStyle={{ left: '80px' }}
      />
    </PieChart>
  )
}

export default ExamplePieChart
