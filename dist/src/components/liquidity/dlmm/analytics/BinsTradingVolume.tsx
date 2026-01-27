import ActionButton from '@/components/liquidity/common/ActionButton'
import { DateTabsEnum, DateTypes } from '@/hooks/clmm/useAnalyticChart'
import useBinsTrade from '@/hooks/dlmm/useBinsTrade'
import { SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData } from '@cetus/ui-kit'
import { Box, Center, HStack, Heading, Spinner, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import BinsTradingVolumeChart from './BinsTradeVolumeChart'

function BinsTradingVolume({ priceDirect }: { priceDirect: boolean }) {
  const { handleDateTabChange, dateTypes, chartLoading, binsTradeData, hoverData, setHoverData, currentDateType, currentDateTypeLabel } =
    useBinsTrade(priceDirect)
  const { isApp } = useWindowWidth()

  const [maxBinsLength, setMaxBinsLength] = useState(251)

  useEffect(() => {
    setMaxBinsLength(isApp ? 61 : 251)
  }, [isApp])

  const handleAdd = () => {
    if (maxBinsLength <= 19) return
    const newLength = Math.max(Math.min(binsTradeData?.length, maxBinsLength) - 8, 19)
    setMaxBinsLength(newLength)
  }

  const handleSub = () => {
    if (maxBinsLength >= binsTradeData?.length) return
    const newLength = Math.min(maxBinsLength + 8, binsTradeData?.length)
    setMaxBinsLength(newLength)
  }

  return (
    <VStack
      w="100%"
      gap={isApp ? '12px' : '20px'}
      p={{ base: '32px 12px 12px', lg: '20px' }}
      borderRadius="16px"
      border="1px solid"
      borderColor={isApp ? 'transparent' : 'border'}
      bg={isApp ? 'transparent' : 'bg_secondary'}
    >
      <HStack
        w="100%"
        justify={isApp ? 'flex-start' : 'space-between'}
        flexDirection={isApp ? 'column' : 'row'}
        align={isApp ? 'flex-start' : 'center'}
      >
        <Heading fontSize={{ base: '14px', lg: '16px' }} fontWeight={{ base: '500', lg: '400' }}>
          Bins Trading Vol {!isApp && `ume`}({currentDateTypeLabel})
        </Heading>
        <HStack flex="1" justify={isApp ? 'space-between' : 'flex-end'} w="100%">
          {binsTradeData && (
            <HStack>
              <ActionButton
                type="Sub"
                onClick={handleSub}
                disabled={maxBinsLength >= binsTradeData?.length}
                wrapStyle={{ minW: '22px', w: '22px', h: '22px' }}
              />
              <ActionButton
                type="Add"
                onClick={handleAdd}
                disabled={maxBinsLength <= 19 || binsTradeData?.length <= 19}
                wrapStyle={{ minW: '22px', w: '22px', h: '22px' }}
              />
            </HStack>
          )}
          <SelectTab<DateTypes, DateTabsEnum>
            type="outlineTab"
            tabList={dateTypes}
            currentTab={currentDateType}
            handleChangeTab={handleDateTabChange}
            wrapStyle={{
              h: isApp ? '22px' : '24px',
              p: '1px',
              borderRadius: isApp ? '6px' : '8px',
              flex: { base: '0 0 92px', lg: '0 0 101px' }
            }}
            itemStyle={{
              fontSize: '10px',
              flex: 1,
              borderRadius: { base: '4px', lg: '6px' }
            }}
          />
        </HStack>
      </HStack>
      {chartLoading && binsTradeData?.length === 0 && (
        <Center h={isApp ? '158px' : '140px'}>
          <Spinner />
        </Center>
      )}
      {!chartLoading && binsTradeData && binsTradeData?.length === 0 && <NoData bg="none" type="nodata" border="none" p="20px" />}
      {!chartLoading && binsTradeData?.length > 0 && (
        <Box w="100%" h={isApp ? '158px' : '140px'}>
          <BinsTradingVolumeChart data={binsTradeData} onChangeValue={data => setHoverData(data)} maxBinsLength={maxBinsLength} />
        </Box>
      )}
    </VStack>
  )
}

export default BinsTradingVolume
