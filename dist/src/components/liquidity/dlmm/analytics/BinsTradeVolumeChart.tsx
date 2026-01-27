import { CustomizedXAxisTick } from '@/components/chart/CustomizedAxisTick'
import EmptyTooltip from '@/components/chart/EmptyTooltip'
import CustomBar from '@/components/chart/dlmmChart/CustomBar'
import useDlmmLiquidityStore from '@/store/dlmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { formatNumber, removeComma, symbolDataDisplayProcessing } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function BinsTradingVolumeChart({
  data,
  onChangeValue,
  noXAxis,
  maxBinsLength = 251
}: {
  data: any
  onChangeValue: (data: any) => void
  noXAxis?: boolean
  maxBinsLength: number
}) {
  const [hoverValue, setHoverValue] = useState('')
  const [hoverPrice, setHoverPrice] = useState('')
  const [currentPriceBin, setCurrentPriceBin] = useState<number | undefined>()
  const { dlmmContractPoolInfo, dlmmApiPoolInfo } = useDlmmLiquidityStore()
  const handleMouseMove = (e: any) => {
    if (e && e.activePayload && e.activePayload.length) {
      const { value, price, binId } = e.activePayload[0].payload
      onChangeValue(e.activePayload[0].payload)
      setHoverValue(formatNumber(value, 2))
      setHoverPrice(price)
      if (binId === dlmmContractPoolInfo?.activeId) {
        setCurrentPriceBin(binId)
      } else {
        setCurrentPriceBin(undefined)
      }
    }
  }

  const handleMouseLeave = () => {
    onChangeValue(null)
  }

  const showData = useMemo(() => {
    if (data?.length <= 19) {
      return data
    } else {
      const currentPriceIndex = data.findIndex(item => item.binId === dlmmContractPoolInfo?.activeId)
      const half = Math.floor(maxBinsLength / 2)
      let startIndex = Math.max(currentPriceIndex - half, 0)
      let endIndex = Math.min(currentPriceIndex + half + 1, data.length)
      const leftGap = currentPriceIndex - startIndex
      const rightGap = endIndex - currentPriceIndex
      if (leftGap < rightGap) {
        endIndex = endIndex + rightGap - leftGap
      }
      if (rightGap < leftGap) {
        startIndex = Math.max(0, startIndex - leftGap + rightGap)
      }

      return data.slice(startIndex, endIndex)
    }
  }, [data, dlmmContractPoolInfo?.activeId, maxBinsLength])

  const minValue = useMemo(() => {
    return showData?.length > 0 ? Math.floor(Math.min(...showData.map((item: any) => item.value))) : 0
  }, [showData])
  const maxValue = useMemo(() => {
    return Math.ceil(Math.max(...showData.map((item: any) => item.value)))
  }, [showData])

  const { isApp } = useWindowWidth()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        barCategoryGap="25%"
        data={showData}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        maxBarSize={24}
        margin={isApp ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: 5, right: 5, bottom: 5, left: 5 }}
      >
        {!noXAxis && (
          <XAxis
            type="category"
            dataKey="price"
            minTickGap={18}
            tickLine={false}
            axisLine={false}
            tick={({ x, y, payload, index }) => <CustomizedXAxisTick x={x} y={y} payload={payload} index={index} fontSize={12} isApp={isApp} />}
          />
        )}
        {maxValue && <YAxis domain={[0, maxValue * 1.05]} hide={true} axisLine={false} tickLine={false} />}
        {/* <Tooltip content={<EmptyTooltip value={pageFrom !== 'stats' ? hoverTime : ''} />} cursor={{ fill: 'rgba(118,200,255,0.5)' }} /> */}
        <Tooltip
          content={
            <EmptyTooltip
              value={
                <VStack align="flex-start" gap="4px">
                  {currentPriceBin !== undefined && (
                    <Text fontSize="12px" lineHeight="16px">
                      Active Bin
                    </Text>
                  )}
                  <HStack>
                    <Text fontSize="12px" lineHeight="16px">
                      Bin Price
                    </Text>
                    <Text fontSize="12px" color="text_caption" lineHeight="16px">
                      {hoverPrice}
                    </Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="12px" lineHeight="16px">
                      Volume
                    </Text>
                    <Text fontSize="12px" color="text_caption" lineHeight="16px">
                      {symbolDataDisplayProcessing(removeComma(hoverValue), '$', 2, false, false)}
                    </Text>
                  </HStack>
                </VStack>
              }
            />
          }
          cursor={<CustomizedCursor />}
        />
        {/* <Bar dataKey="num" fill="#75C8FF" activeBar={<Rectangle stroke="rgba(0,0,0,0)" />} isAnimationActive={false} /> */}
        <Bar dataKey="value" isAnimationActive={false} shape={<CustomBar />}>
          {showData?.map((entry, index) => (
            <Cell key={entry?.binId} fill={entry?.binId === dlmmContractPoolInfo?.activeId ? '#76C8FF' : 'rgba(117,200,255,0.5)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
export default BinsTradingVolumeChart

function CustomizedCursor(params: any) {
  const { x, y, width, height, payload } = params

  if (!payload || !payload?.[0] || !payload?.[0]?.payload?.num) return

  const v = width > 192 ? width / 1.2 : width > 96 ? width / 1.5 : width > 48 ? width / 2 : width > 24 ? width / 4 : width / 8

  return (
    <g>
      <rect width={width - v} height={height} x={x + v / 2} fill="rgba(118,200,255,0.5)" y={y + 1} />
    </g>
  )
}
