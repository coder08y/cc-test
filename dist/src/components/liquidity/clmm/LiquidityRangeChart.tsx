import useGetTicksChartData from '@/hooks/clmm/useGetTicksChartData'
import usePriceRange from '@/hooks/clmm/usePriceRange'
import useLiquidityStore from '@/store/clmm'
import useDepthChartStore from '@/store/clmm/chart'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { d, formatNumberWithDown } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'
import { Box, Center, Spinner, VStack } from '@chakra-ui/react'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { LiquidityRangeInput } from '../PriceChart'
import RangeChart from './RangeChart'
import { Bound, FeeAmount } from './RangeChart/types'

const MAX_TICK_INDEX = 443636

const MIN_TICK_INDEX = -443636

const LiquidityRangeChart = forwardRef(function LiquidityRangeChart(
  props: {
    handleClickRefresh: any
    minPriceData: any
    maxPriceData: any
    direct: boolean
    readonly?: boolean
    isFrom?: string
    dashedMarkerLine?: any
    currentRange?: any
    isRefresh?: boolean
    liquidityChartTab?: string
  },
  ref: any
) {
  const { formatPriceData, ticksPool, formatPriceDataIsLoading, setFormatPriceData, setFormatPriceDataIsLoading, setTicksPool } = useDepthChartStore()
  const { handleClickRefresh, minPriceData, maxPriceData, direct, readonly, isFrom, dashedMarkerLine, currentRange, liquidityChartTab } = props
  const { contractPoolInfo, apiPoolInfo, currentPriceData } = useLiquidityStore()

  const { posLowerTickData, posUpperTickData, lowerTickData: lowerTickDataStore, upperTickData: upperTickDataStore } = usePriceRangeStore()

  const lowerTickData = useMemo(() => {
    if (isFrom == 'position') return posLowerTickData
    return lowerTickDataStore
  }, [isFrom, lowerTickDataStore, posLowerTickData])

  const upperTickData = useMemo(() => {
    if (isFrom == 'position') return posUpperTickData
    return upperTickDataStore
  }, [isFrom, upperTickDataStore, posUpperTickData])

  const { setTickDataBasedOnPrice } = usePriceRange()

  const currentFeeTier = '100'

  const tickSpaceLimits: {
    [bound in Bound]: number | undefined
  } = useMemo(() => {
    if (currentFeeTier && Number(currentFeeTier) && contractPoolInfo?.tickSpacing) {
      const fee = currentFeeTier as FeeAmount
      return {
        [Bound.LOWER]: currentFeeTier ? TickMath.getInitializeTickIndex(MAX_TICK_INDEX, Number(contractPoolInfo?.tickSpacing)) : undefined,
        [Bound.UPPER]: currentFeeTier ? TickMath.getInitializeTickIndex(MIN_TICK_INDEX, Number(contractPoolInfo?.tickSpacing)) : undefined
      }
    }
    return {
      [Bound.LOWER]: undefined,
      [Bound.UPPER]: undefined
    }
  }, [currentFeeTier])

  const ticksAtLimit: any = useMemo(() => {
    return {
      [Bound.LOWER]: currentFeeTier && lowerTickData.tick === tickSpaceLimits.LOWER,
      [Bound.UPPER]: currentFeeTier && upperTickData?.tick === tickSpaceLimits.UPPER
    }
  }, [tickSpaceLimits, lowerTickData, upperTickData, currentFeeTier])

  const interactive = true

  const zoomLevel = undefined

  const onChangeMinPrice = (value: string) => {
    console.log('🚀 ~ file: LiquidityRangeChart.tsx:67 ~ onChangeMinPrice ~ value:', value)
  }

  const onChangeMaxPrice = (value: string) => {
    console.log('🚀 ~ file: LiquidityRangeChart.tsx:71 ~ onChangeMaxPrice ~ value:', value)
  }

  const onBothRangeInput = ({ leftTypedValue, rightTypedValue }: { leftTypedValue: string; rightTypedValue: string }) => {
    if (formatNumberWithDown(leftTypedValue, 6) !== (direct ? lowerTickData?.displayPrice : upperTickData?.displayReversePrice)) {
      // setIsShowMinMaxDist(true)
      setTickDataBasedOnPrice(direct ? lowerTickData : upperTickData, direct ? leftTypedValue : d(1).div(leftTypedValue).toString())
    }
    if (formatNumberWithDown(rightTypedValue, 6) !== (direct ? upperTickData?.displayPrice : lowerTickData.displayReversePrice)) {
      // setIsShowMinMaxDist(true)
      setTickDataBasedOnPrice(direct ? upperTickData : lowerTickData, direct ? rightTypedValue : d(1).div(rightTypedValue).toString())
    }
  }

  const onLeftRangeInput = (typedValue: string) => {
    console.log('🚀 ~ file: LiquidityRangeChart.tsx:88 ~ onLeftRangeInput ~ typedValue:', typedValue)
    // if (typedValue !== minPriceData?.fixsUiPrice) {
    //   setIsShowMinMaxDist(true)
    //   onChangeMinPrice(typedValue)
    // }
  }

  const onRightRangeInput = (typedValue: string) => {
    console.log('🚀 ~ file: LiquidityRangeChart.tsx:96 ~ onRightRangeInput ~ typedValue:', typedValue)
    // if (typedValue !== maxPriceData?.fixsUiPrice) {
    //   setIsShowMinMaxDist(true)
    //   onChangeMaxPrice(typedValue)
    // }
  }

  const innerRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    depthChartRefreshData: innerRef.current?.depthChartRefreshData
  }))

  // 测试新的图表数据获取 0207
  const { getFormattedData } = useGetTicksChartData()
  const [positionLoading, setPositionLoading] = useState<boolean>(true)
  useEffect(() => {
    if (contractPoolInfo?.poolAddress && contractPoolInfo?.poolAddress === apiPoolInfo?.poolAddress) {
      setFormatPriceDataIsLoading(true)
      getFormattedData({
        poolAddress: contractPoolInfo?.poolAddress,
        tokenA: apiPoolInfo?.tokenA,
        tokenB: apiPoolInfo?.tokenB,
        tickSpacing: contractPoolInfo?.tickSpacing,
        currentTickIndex: contractPoolInfo?.current_tick_index,
        liquidity: contractPoolInfo?.liquidity,
        // feeRate: contractPoolInfo?.fee_rate
        feeRate: d(apiPoolInfo?.feeRate).mul(100).toString() || contractPoolInfo?.fee_rate
      })
        .then(res => {
          setTicksPool({ ...res.tiksPoolData })
          setFormatPriceData(res.formatPriceData)
        })
        .catch(error => {
          setTicksPool({})
          setFormatPriceData([])
        })
        .finally(() => {
          setFormatPriceDataIsLoading(false)
        })
    }
  }, [contractPoolInfo?.poolAddress, apiPoolInfo?.poolAddress])

  useEffect(() => {
    if (isFrom === 'position' && !formatPriceDataIsLoading && formatPriceData?.length > 0) {
      setPositionLoading(false)
    }
  }, [isFrom, formatPriceDataIsLoading, formatPriceData?.length])
  const onPoolPriceChangeMin = (value?: number) => {
    if (value !== undefined && formatNumberWithDown(value, 6) !== (direct ? lowerTickData?.displayPrice : upperTickData?.displayReversePrice)) {
      // setIsShowMinMaxDist(true)
      setTickDataBasedOnPrice(direct ? lowerTickData : upperTickData, direct ? String(value) : d(1).div(value).toString())
    }
  }

  const onPoolPriceChangeMax = (value?: number) => {
    if (value !== undefined && formatNumberWithDown(value, 6) !== (direct ? upperTickData?.displayPrice : lowerTickData.displayReversePrice)) {
      // setIsShowMinMaxDist(true)
      setTickDataBasedOnPrice(direct ? upperTickData : lowerTickData, direct ? String(value) : d(1).div(value).toString())
    }
  }

  // mounted and destoryed
  useEffect(() => {
    setFormatPriceDataIsLoading(true)
    return () => {
      setFormatPriceDataIsLoading(false)
    }
  }, [])
  return (
    <VStack w="100%" h="100%" position="relative">
      {readonly && <Box w="100%" h="100%" position="absolute" left="0px" top="0px" bg="rgba(0,0,0,0)" zIndex="99999" />}
      {((!positionLoading && isFrom === 'position') || (!formatPriceDataIsLoading && isFrom !== 'position')) &&
      minPriceData?.id &&
      maxPriceData?.id ? (
        <VStack w="100%" h="100%" gap="0px">
          {liquidityChartTab === 'prices' ? (
            <Box position="relative" zIndex={1000} w="100%" h="100%" pt={{ base: '0px', lg: '16px' }}>
              <LiquidityRangeInput
                isSorted={direct}
                isReverse={!!apiPoolInfo?.isReverse}
                quoteCurrency={apiPoolInfo?.tokenB}
                baseCurrency={apiPoolInfo?.tokenA}
                poolId={apiPoolInfo?.poolAddress || ''}
                currentPrice={direct ? currentPriceData.currentPrice : currentPriceData.reverseCurrentPrice}
                priceLower={minPriceData}
                priceUpper={maxPriceData}
                setMinPrice={onPoolPriceChangeMin}
                setMaxPrice={onPoolPriceChangeMax}
                setFallbackRangePrices={() => {}}
                currentRange={currentRange}
                dashedMarkerLine={dashedMarkerLine?.filter((line: string) => line !== '-')}
                data={{ formatPriceData, ticksPool, formatPriceDataIsLoading }}
              />
            </Box>
          ) : (
            <RangeChart
              chartId={`liquidityRangeChart-${apiPoolInfo?.poolAddress}`}
              isFrom={isFrom}
              ref={innerRef}
              isSorted={direct}
              contractPoolInfo={contractPoolInfo}
              currencyA={apiPoolInfo?.tokenA}
              currencyB={apiPoolInfo?.tokenB}
              feeAmount={currentFeeTier as FeeAmount}
              ticksAtLimit={ticksAtLimit}
              price={direct ? currentPriceData.currentPrice : currentPriceData.reverseCurrentPrice}
              priceLower={minPriceData}
              priceUpper={maxPriceData}
              interactive={interactive}
              zoomLevel={zoomLevel}
              isReverse={apiPoolInfo?.isReverse}
              readonly={readonly}
              dashedMarkerLine={dashedMarkerLine?.filter((line: string) => line !== '-')}
              onBothRangeInput={onBothRangeInput}
              onLeftRangeInput={onLeftRangeInput}
              onRightRangeInput={onRightRangeInput}
              handleClickRefresh={handleClickRefresh}
              currentRange={currentRange}
              data={{ formatPriceData, ticksPool, formatPriceDataIsLoading }}
            />
          )}
        </VStack>
      ) : (
        <Center w="100%" h="100%" mt="20px">
          <Spinner />
        </Center>
      )}
    </VStack>
  )
})

export default LiquidityRangeChart
