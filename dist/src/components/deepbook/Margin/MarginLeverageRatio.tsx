// import { useCalculateRiskRatio } from '@/hooks/deepbook/margin/useCalculateRiskRatio'
import useMarginTrade from '@/hooks/deepbook/margin/useMarginTrade'
import useDeepBookStore from '@/store/deepbook'
import { NumericFormatInput } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { HStack, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

export default function MarginLeverageRatio() {
  const { leverageRatio, setLeverageRatio } = useMarginTrade()
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  // const { riskRatio } = useCalculateRiskRatio()
  const minValue = 1.1

  const minBorrowRiskRatio = currentDeepBookPool?.minBorrowRiskRatio || 1.25

  const poolMaxLeverage = useMemo(() => {
    const maxLeverage = minBorrowRiskRatio ? d(minBorrowRiskRatio).div(d(minBorrowRiskRatio).sub(1)).toNumber() : 4
    return maxLeverage
  }, [minBorrowRiskRatio])

  // const maxValue = poolMaxLeverage

  // 将字符串转换为数字，如果无效则使用默认值
  const sliderValue = useMemo(() => {
    if (!leverageRatio) return minValue
    const value = parseFloat(leverageRatio) || minValue
    return Math.max(minValue, Math.min(poolMaxLeverage, value))
  }, [leverageRatio, minValue, poolMaxLeverage])

  const handleSliderChange = (value: number) => {
    setLeverageRatio(value.toFixed(1))
  }

  return (
    <HStack gap="12px" w={'97%'} justifyContent="space-between" ml="-1.5%">
      <HStack gap="4px" bg="bg_primary" border="1px solid" borderColor="border" borderRadius="6px" p="4px 6px" maxW="50px" h="24px">
        <NumericFormatInput
          value={leverageRatio}
          onChange={(value: string) => {
            const numValue = parseFloat(value)
            if (value && !isNaN(numValue) && numValue < minValue) {
              setLeverageRatio(minValue.toFixed(1))
            } else {
              setLeverageRatio(value)
            }
          }}
          minValue={minValue}
          maxValue={poolMaxLeverage}
          style={{
            width: 'calc(100% - 8px)',
            background: 'none',
            whiteSpace: 'nowrap',
            opacity: 1,
            outline: 'none',
            color: 'var(--chakra-colors-text_caption)',
            fontSize: '12px',
            height: '16px',
            lineHeight: '16px',
            touchAction: 'manipulation',
            transition: 'all 0.3s',
            fontWeight: '500',
            textAlign: 'left'
          }}
        />
        <Text fontSize="12px" lineHeight="16px" position="relative" top="0.5px">
          x
        </Text>
      </HStack>
      <Slider aria-label="slider-ex-1" value={sliderValue} onChange={handleSliderChange} min={minValue} max={poolMaxLeverage} step={0.1}>
        {/* 首部标记 - 实心 */}
        <SliderMark value={minValue} ml="-4px" mt="-4px" w="8px" h="8px" borderRadius="50%" bg="primary" border="0" zIndex="100" />
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        {/* 尾部标记 - 空心 */}
        <SliderMark
          value={poolMaxLeverage}
          ml="-4px"
          mt="-4px"
          w="8px"
          h="8px"
          borderRadius="50%"
          bg="bg_secondary"
          border="1px solid"
          borderColor="#2A3238"
          zIndex="100"
        />
        <SliderThumb bg="#fff" border="0" _before={{ bg: '#fff' }} zIndex="101" />
      </Slider>
    </HStack>
  )
}
