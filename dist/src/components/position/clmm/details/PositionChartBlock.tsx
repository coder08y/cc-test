import RangeChart from '@/components/liquidity/clmm/RangeChart'
import useGetCurrentPrice from '@/hooks/clmm/useGetCurrentPrice'
import useGetTicksChartData from '@/hooks/clmm/useGetTicksChartData'
import useLiquidityStore from '@/store/clmm'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { PoolApiInfo } from '@/types'
import { getReversePrice } from '@/utils/pool'
import { formatNumberWithDown, formatPrice, isAvailableObject } from '@cetus/utils'
import { TickMath, TickUtil, d, fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, Center, Divider, Flex, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'

function PositionChartBlock({ tab }: { tab: any }) {
  const { currentPosBaseInfo, poolRangeObj, posPoolsRelatedData } = usePositionStore()
  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId as string]
  const { currentPosPoolInfo, curPosContractPoolInfo, isDirect } = usePositionDetailStore()
  const { setContractPoolInfo, setApiPoolInfo, contractPoolInfo, apiPoolInfo } = useLiquidityStore()
  const [posLowerTickData, setPosLowerTickData] = useState<any>(null)
  const [posUpperTickData, setPosUpperTickData] = useState<any>(null)

  useDeepCompareEffect(() => {
    if (!currentPosPoolInfo || !apiPoolInfo || fixCoinType(currentPosPoolInfo?.poolAddress) !== fixCoinType(apiPoolInfo?.poolAddress || '')) {
      setApiPoolInfo(currentPosPoolInfo)
    }
  }, [currentPosPoolInfo, apiPoolInfo])
  useEffect(() => {
    return () => {
      setApiPoolInfo(null)
      setContractPoolInfo(null)
    }
  }, [])

  const handleSetTickData = (tick: number, type: 'lower' | 'upper', poolApiInfo: PoolApiInfo) => {
    const decimalsA = poolApiInfo?.tokenA?.decimals
    const decimalsB = poolApiInfo?.tokenB?.decimals
    let price

    if (Math.abs(tick) == Math.abs(TickUtil.getMinIndex(Number(poolApiInfo.tickSpacing)))) {
      price = type === 'lower' ? '0' : '∞'
    } else {
      price = TickMath.tickIndexToPrice(tick, decimalsA, decimalsB).toString()
    }

    const displayPrice = price === '∞' ? '∞' : formatNumberWithDown(price, 6)
    const reversePrice = getReversePrice(price)
    const displayReversePrice = reversePrice === '∞' ? '∞' : formatNumberWithDown(reversePrice, 6)

    const data = {
      id: type,
      tokenA: poolApiInfo?.tokenA,
      tokenB: poolApiInfo?.tokenB,
      tick,
      price,
      displayPrice,
      reversePrice,
      displayReversePrice,
      tickSpacing: poolApiInfo?.tickSpacing,
      pool: poolApiInfo?.poolAddress
    }

    if (type === 'lower') {
      setPosLowerTickData({ ...data })
    } else {
      setPosUpperTickData({ ...data })
    }
  }

  const { getCurrentPrice } = useGetCurrentPrice()

  useEffect(() => {
    if (
      currentPosPoolInfo?.poolAddress &&
      curPosContractPoolInfo?.poolAddress === currentPosBaseInfo?.clmmPool &&
      currentPosBaseInfo?.lowerTick !== undefined &&
      curPosContractPoolInfo?.current_sqrt_price !== undefined
    ) {
      handleSetTickData(currentPosBaseInfo?.lowerTick, 'lower', { ...currentPosPoolInfo, tickSpacing: curPosContractPoolInfo.tickSpacing })
      handleSetTickData(currentPosBaseInfo?.upperTick, 'upper', { ...currentPosPoolInfo, tickSpacing: curPosContractPoolInfo.tickSpacing })

      getCurrentPrice(curPosContractPoolInfo?.current_sqrt_price, currentPosPoolInfo, curPosContractPoolInfo?.current_tick_index)
      setContractPoolInfo(curPosContractPoolInfo)
    }
  }, [currentPosBaseInfo?.lowerTick, curPosContractPoolInfo?.current_sqrt_price, currentPosPoolInfo?.poolAddress])

  const { isPosDetailRefresh } = usePositionDetailStore()
  const { getFormattedData } = useGetTicksChartData()

  const [formatPriceData, setFormatPriceData] = useState<any>(null)
  const [ticksPool, setTicksPool] = useState<any>(null)
  const [formatPriceDataIsLoading, setFormatPriceDataIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // if (isPosDetailRefresh) {
    if (contractPoolInfo?.poolAddress && contractPoolInfo?.poolAddress === apiPoolInfo?.poolAddress) {
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
          console.log('🚀 ~ PositionChartBlock ~ res:', res)
          setTicksPool(res?.tiksPoolData ? { ...res.tiksPoolData } : {})
          setFormatPriceData(res?.formatPriceData ? res.formatPriceData : [])
        })
        .catch(error => {
          setTicksPool({})
          setFormatPriceData([])
        })
        .finally(() => {
          setFormatPriceDataIsLoading(false)
        })
    }
    // }
  }, [isPosDetailRefresh, contractPoolInfo?.poolAddress, apiPoolInfo?.poolAddress])

  const canDisplay = useMemo(() => {
    return currentPosBaseInfo?.posId && posLowerTickData && posUpperTickData && formatPriceData && ticksPool
  }, [posLowerTickData?.pool, posUpperTickData?.pool, currentPosBaseInfo?.posId, formatPriceData, ticksPool])

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

  // 图表相关
  const innerRef = useRef<any>(null)

  // 销毁时清空画图数据避免缓存
  useEffect(() => {
    return () => {
      setFormatPriceData(null)
      setTicksPool(null)
      setFormatPriceDataIsLoading(true)
      setPosLowerTickData(null)
      setPosUpperTickData(null)
    }
  }, [])

  return (
    <VStack w={{ base: '100%', lg: 'unset' }} align="center" justify="center" pb="2px">
      <Box className="chart-block" w="260px" h="104px" mb="8px" overflow="hidden">
        {canDisplay ? (
          <Flex w="100%" h="100%">
            <RangeChart
              chartId={`positionRangeChart-${apiPoolInfo?.poolAddress}`}
              isFrom="position"
              ref={innerRef}
              isSorted={!!isDirect}
              contractPoolInfo={contractPoolInfo}
              currencyA={apiPoolInfo?.tokenA}
              currencyB={apiPoolInfo?.tokenB}
              feeAmount={100 as any}
              price={!!isDirect ? currentPosPoolsRelatedData?.contractCurrentPrice : currentPosPoolsRelatedData?.contractCurrentPriceReverse}
              priceLower={isDirect ? posLowerTickData : posUpperTickData}
              priceUpper={isDirect ? posUpperTickData : posLowerTickData}
              isReverse={apiPoolInfo?.isReverse}
              readonly={true}
              dashedMarkerLine={[minPriceForDate, maxPriceForDate]}
              onBothRangeInput={() => {}}
              onLeftRangeInput={() => {}}
              onRightRangeInput={() => {}}
              handleClickRefresh={() => {}}
              data={{ formatPriceData, ticksPool, formatPriceDataIsLoading }}
            />
          </Flex>
        ) : (
          // <Flex justify="center" align="center">
          //   <Image src={NoChartDataImg} w="100px" h="100px" />
          // </Flex>
          <Center w="100%" h="100%" mt="20px">
            <Spinner />
          </Center>
        )}
      </Box>
      <HStack>
        <Center borderRadius="4px" border="1px solid" borderColor="border" w="20px" h="20px" color="text_caption">
          <Divider w="14px" border="1px dashed" />
        </Center>
        <Text color="primary_gray" fontSize="12px">
          {tab?.type} Price Range
        </Text>
      </HStack>
      <Text color="text_caption" textAlign="center" fontSize="12px" lineHeight="12px">
        {isDirect ? minPriceForDate : maxPriceForDate}&nbsp;-&nbsp;
        {isDirect ? maxPriceForDate : minPriceForDate}
      </Text>
    </VStack>
  )
}
export default PositionChartBlock
