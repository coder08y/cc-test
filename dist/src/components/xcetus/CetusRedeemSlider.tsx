import { SelectTab } from '@cetus/design'
import { Box, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

export function CetusRedeemSlider(props: { day: string | number; onChange: (value: string | number) => void }) {
  const { day, onChange } = props

  const currentTab = useMemo(() => {
    return `${day}D`
  }, [day])

  const tabList = [{ label: '15D' }, { label: '30D' }, { label: '90D' }, { label: '180D' }]
  return (
    <Box>
      <HStack w="100%" justifyContent="space-between" m="10px 0">
        <Text fontSize="16px" color="text_caption" whiteSpace="nowrap">
          {day} Days
        </Text>
        <SelectTab
          type="outlineTab"
          tabList={tabList}
          currentTab={currentTab}
          handleChangeTab={tab => {
            if (tab.label === 'MAX') {
              onChange(100)
            } else {
              onChange(tab.label.replace('D', ''))
            }
          }}
          wrapStyle={{
            flex: '1',
            maxW: '300px',
            h: '32px',
            p: '3px',
            borderRadius: '8px'
          }}
          itemStyle={{
            flex: '1',
            fontSize: '12px',
            margin: '0px'
          }}
        />
      </HStack>
      <Slider aria-label="slider-ex-1" min={15} max={180} focusThumbOnChange={false} value={Number(day)} onChange={value => onChange(value)}>
        <SliderTrack h="8px">
          <SliderFilledTrack h="4px" />
        </SliderTrack>
        <SliderThumb />
      </Slider>
    </Box>
  )
}
