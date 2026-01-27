import LiquidityRangeChart from '@/components/liquidity/clmm/LiquidityRangeChart'
import usePriceRange from '@/hooks/clmm/usePriceRange'
import usePriceRangeStore from '@/store/clmm/priceRange'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { formatPrice, isAvailableObject } from '@cetus/utils'
import { TickMath, d } from '@cetusprotocol/common-sdk'
import { Box, VStack } from '@chakra-ui/react'
import { memo, useEffect, useMemo, useState } from 'react'

function ChartBlock({ tab, currentRange, liquidityChartTab }: { tab: any; currentRange?: string; liquidityChartTab?: string }) {
  const { currentPosBaseInfo, poolRangeObj } = usePositionStore()
  const { isDirect } = usePositionDetailStore()
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const { handleInitTickData } = usePriceRange()

  // useEffect(() => {
  //   if (isAvailableObject(currentPosPoolInfo) && currentPosPoolInfo?.tokenA && currentPosPoolInfo?.tokenB) {
  //     handleInitTickData(currentPosPoolInfo?.farmsEffectiveTickLower, currentPosPoolInfo?.farmsEffectiveTickUpper, curPosContractPoolInfo)
  //   }
  // }, [currentPosPoolInfo?.poolAddress])

  const canDisplay = useMemo(() => {
    return currentPosBaseInfo?.posId && lowerTickData?.pool && upperTickData?.pool
  }, [lowerTickData?.pool, upperTickData?.pool, currentPosBaseInfo?.posId])

  const [minPriceForDate, setMinPriceForDate] = useState('')
  const [maxPriceForDate, setMaxPriceForDate] = useState('')

  useEffect(() => {
    let _min = ''
    let _max = ''
    if (isAvailableObject(poolRangeObj) && isAvailableObject(currentPosBaseInfo) && isAvailableObject(tab)) {
      const rangArr = poolRangeObj[currentPosBaseInfo?.clmmPool as string]?.ranges
      console.log('🚀🚀🚀 ~ PositionChartInfo.tsx:94 ~ useEffect ~ rangArr:', rangArr)
      if (!rangArr) return
      const rangesWithDateTypeMap = Object.fromEntries(
        rangArr?.map((item: any) => [
          item?.dateType,
          [
            TickMath.tickIndexToPrice(
              item?.lower,
              currentPosBaseInfo?.tokenA!.decimals as number,
              currentPosBaseInfo?.tokenB!.decimals as number
            ).toString(),
            TickMath.tickIndexToPrice(
              item?.upper,
              currentPosBaseInfo?.tokenA!.decimals as number,
              currentPosBaseInfo?.tokenB!.decimals as number
            ).toString()
          ]
        ])
      )
      const lowest = (rangesWithDateTypeMap as any)[tab?.key]?.[0]
      const lowValue = isDirect ? lowest : d(1).div(lowest).toString()
      const highest = (rangesWithDateTypeMap as any)[tab?.key]?.[1]
      const highValue = isDirect ? highest : d(1).div(highest).toString()
      _min = formatPrice(lowValue, 6)
      _max = formatPrice(highValue, 6)
    } else {
      _min = '-'
      _max = '-'
    }
    setMinPriceForDate(_min)
    setMaxPriceForDate(_max)
  }, [isDirect, tab.key, poolRangeObj, currentPosBaseInfo])

  return (
    <VStack w={{ base: '100%', lg: '100%' }} align="center" justify="center" pb="2px">
      {canDisplay && (
        <Box w="100%" h="238px">
          <LiquidityRangeChart
            handleClickRefresh={() => {}}
            direct={!!isDirect}
            minPriceData={isDirect ? lowerTickData : upperTickData}
            maxPriceData={isDirect ? upperTickData : lowerTickData}
            dashedMarkerLine={[minPriceForDate, maxPriceForDate]}
            currentRange={currentRange}
            liquidityChartTab={liquidityChartTab}
            isFrom="rebalance"
          />
        </Box>
      )}
    </VStack>
  )
}
export default memo(ChartBlock)
