import WithTooltipInfo from '@/components/common/WithTooltipInfo'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { showNewVersionApr } from '@/types'
import { formatNumber } from '@cetus/utils'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import PositionCurrentPrice from '../../common/PositionCurrentPrice'
import PositionChartBlock from './PositionChartBlock'
import PriceBlock from './PriceBlock'
import RangeTab from './RangeTab'

function PositionChartInfo({ positionApr, isAprLoading }: { positionApr: any; isAprLoading: boolean }) {
  const { currentPosBaseInfo, posPoolsRelatedData, posPoolsOriginalData, poolRangeObj, posApiPoolData, posLiquidityData } = usePositionStore()
  const { isPriceDirect } = usePositionDetailStore()
  const posPoolInfo = posApiPoolData[currentPosBaseInfo?.clmmPool as string]
  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId as string]

  const leverage = useMemo(() => {
    console.log('🚀 ~ leverage ~ currentPosPoolsRelatedData:', currentPosPoolsRelatedData)
    const minPrice = currentPosPoolsRelatedData?.minPriceOrigin
    const maxPrice = currentPosPoolsRelatedData?.maxPriceOrigin
    if (minPrice !== '0' && maxPrice !== '∞') {
      return formatNumber(1 / (1 - Number((minPrice / maxPrice) ** 0.25)), 2) + 'x'
    } else {
      return '1x'
    }
  }, [currentPosPoolsRelatedData?.minPriceOrigin, currentPosPoolsRelatedData?.maxPriceOrigin])

  const [tab, setTab] = useState({ type: '30D', key: 'month' })

  return (
    <VStack w="100%" align="flex-start" p={{ base: '12px 8px', lg: '20px' }} bg="bg_secondary" borderRadius="16px">
      <HStack w="100%" justify="space-between">
        <Text color="text_caption" fontSize="16px" whiteSpace="nowrap">
          Price range
        </Text>

        <RangeTab />
      </HStack>
      <HStack
        gap={{ base: '20px', lg: '40px' }}
        w="100%"
        align="flex-end"
        justify="space-between"
        p="8px 0"
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <VStack w={{ base: '100%', lg: 'unset' }} align="center" justify="center" pb="2px">
          <PositionChartBlock tab={tab} />
        </VStack>
        <VStack w={{ base: '100%', lg: 'calc(100% - 220px)' }} gap={{ base: '16px', lg: '20px' }}>
          <HStack mt="8px" align={{ base: 'center', lg: 'flex-start' }}>
            <PositionCurrentPrice
              posId={currentPosBaseInfo?.posId || ''}
              displayTokenA={currentPosBaseInfo?.displayTokenA}
              displayTokenB={currentPosBaseInfo?.displayTokenB}
              isChangeDirect={isPriceDirect}
              haveChangeIcon={false}
            />
          </HStack>
          <PriceBlock />
          <HStack w="100%" flexDirection={{ base: 'column', lg: 'row' }} justify="space-between">
            {/* {showNewVersionApr && (
              <EstimatedApr
                tab={tab}
                showFarmingApr={false}
                setTab={setTab}
                ranges={ranges}
                currentPosPoolsRelatedData={currentPosPoolsRelatedData}
                posPoolInfo={posPoolInfo}
                isActive={isActive}
                flexDirection="row"
                isFarms={currentPosBaseInfo?.posType == 'farms'}
                currentPosTvl={currentPosTvl}
                isPosition={true}
              />
            )} */}
            {showNewVersionApr && (
              <WithTooltipInfo
                label="APR"
                tooltip="APR based on the daily yield accrued by this position. Past performance is not indicative of future results. Calculations are an estimate and only for reference."
                wrapStyle={{
                  flexDir: { base: 'row', lg: 'column' },
                  align: { base: 'center', lg: 'flex-start' },
                  width: { base: '100%', lg: 'unset' },
                  gap: '2px'
                }}
              >
                <Skeleton isLoaded={!!currentPosPoolsRelatedData} h="14px">
                  <Text color="primary" fontSize={{ base: '12px', lg: '14px' }}>
                    {positionApr ?? '--'}
                  </Text>
                </Skeleton>
              </WithTooltipInfo>
            )}

            <WithTooltipInfo
              label="Leverage"
              tooltip="This parameter indicates the concentration rate of your liquidity relative to a full range position."
              wrapStyle={
                showNewVersionApr
                  ? {
                      flexDir: { base: 'row', lg: 'column' },
                      align: { base: 'center', lg: 'flex-end' },
                      width: { base: '100%', lg: 'unset' },
                      gap: '2px'
                    }
                  : {
                      flexDir: { base: 'row', lg: 'column' },
                      align: { base: 'center', lg: 'center' },
                      justify: { base: 'space-between', lg: 'center' },
                      mt: '-4px',
                      width: { base: '100%', lg: '100%' },
                      gap: '8px'
                    }
              }
            >
              <Skeleton isLoaded={!!leverage && !!currentPosPoolsRelatedData}>
                <Text color="primary" fontSize={{ base: '12px', lg: '14px' }}>
                  {leverage}
                </Text>
              </Skeleton>
            </WithTooltipInfo>
          </HStack>
        </VStack>
      </HStack>
    </VStack>
  )
}
export default PositionChartInfo
