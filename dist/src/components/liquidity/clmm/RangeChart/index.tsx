import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { forwardRef, useCallback, useMemo, useRef } from 'react'
import { Chart } from './Chart'
import { FeeAmount } from './types'
// import { saturate } from 'polished'
import { Bound, ZOOM_LEVELS, ZoomLevels } from './types'
// import StatusImage from '../StatusImge'
// import { isDirect } from 'kk-v3-sdk'
// import useDepthChartData from '@/hooks/liquidity/useDepthChartData'

import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { d, removeComma } from '@cetus/utils'
import { format } from 'd3'

interface ChartRangeInputParams {
  chartId?: string
  isSorted: boolean
  contractPoolInfo: any
  currencyA: Token | undefined
  currencyB: Token | undefined
  feeAmount: FeeAmount
  ticksAtLimit?: { [bound in Bound]?: boolean | undefined }
  price: number | undefined
  priceLower?: any // 待定
  priceUpper?: any // 待定
  onLeftRangeInput: (typedValue: string) => void
  onRightRangeInput: (typedValue: string) => void
  onBothRangeInput: ({ leftTypedValue, rightTypedValue }: { leftTypedValue: string; rightTypedValue: string }) => void
  handleClickRefresh: () => void
  interactive?: boolean
  data: {
    formatPriceData: any
    ticksPool: any
    formatPriceDataIsLoading: boolean
  }
  readonly?: boolean
  zoomLevel?: ZoomLevels
  isPosition?: boolean
  hideBrush?: boolean
  isReverse?: boolean
  isFrom?: string
  dashedMarkerLine?: any
  currentRange?: any
}
const LiquidityChartRangeInput = forwardRef(function LiquidityChartRangeInput(
  {
    chartId,
    isFrom,
    isSorted,
    contractPoolInfo,
    currencyA,
    currencyB,
    feeAmount,
    ticksAtLimit = {
      [Bound.LOWER]: undefined,
      [Bound.UPPER]: undefined
    },
    price,
    priceLower,
    priceUpper,
    onLeftRangeInput,
    onRightRangeInput,
    onBothRangeInput,
    handleClickRefresh,
    interactive = true,
    data,
    readonly,
    zoomLevel,
    isPosition,
    hideBrush,
    isReverse,
    dashedMarkerLine,
    currentRange
  }: ChartRangeInputParams,
  ref: any
) {
  const { formatPriceData, ticksPool, formatPriceDataIsLoading } = data

  const error = false
  const isLoading = useMemo(() => {
    if (formatPriceData && !formatPriceDataIsLoading) return false
    return true
  }, [formatPriceData])

  const seriesData = useMemo(() => {
    let result: any
    if (isSorted) {
      result = formatPriceData
    } else {
      result = formatPriceData?.map((item: any) => {
        return {
          ...item,
          price: d(1).div(item?.price)?.toString()
        }
      })
    }
    return result
  }, [isSorted, formatPriceData])

  const constantPrice = useMemo(() => {
    if (isSorted) {
      return ticksPool?.price
    } else {
      return ticksPool?.reversePrice
    }
  }, [ticksPool?.id, isSorted])

  const onBrushDomainChangeEnded = useCallback(
    (domain: [number, number], mode: string | undefined) => {
      if (!mode) return
      const leftRangeValue = Number(domain[0])
      const rightRangeValue = Number(domain[1])

      // if (leftRangeValue <= 0) {
      //   leftRangeValue = 1 / 10 ** 6
      // }

      const updateLeft = (!ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] || mode === 'handle' || mode === 'reset') && leftRangeValue >= 0
      const updateRight = (!ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || mode === 'reset') && rightRangeValue > 0 && rightRangeValue < 1e35

      if (updateLeft && updateRight) {
        const parsedLeftRangeValue = parseFloat(leftRangeValue.toFixed(20))
        const parsedRightRangeValue = parseFloat(rightRangeValue.toFixed(20))

        if (parsedLeftRangeValue >= 0 && parsedRightRangeValue > 0 && parsedLeftRangeValue < parsedRightRangeValue) {
          onBothRangeInput({
            leftTypedValue: d(leftRangeValue).toString(),
            rightTypedValue: d(rightRangeValue).toString()
          })
        }
      } else if (updateLeft) {
        onLeftRangeInput(d(leftRangeValue).toString())
      } else if (updateRight) {
        onRightRangeInput(d(rightRangeValue).toString())
      }
    },
    [isSorted, onBothRangeInput, onLeftRangeInput, onRightRangeInput, ticksAtLimit]
  )

  const brushDomain: [number, number] | undefined = useMemo(() => {
    const leftPrice = isSorted ? removeComma(priceLower?.price) : removeComma(priceLower?.reversePrice)
    const rightPrice = isSorted ? removeComma(priceUpper?.price) : removeComma(priceUpper?.reversePrice)

    if (rightPrice !== '∞') {
      return leftPrice && rightPrice ? [Number(leftPrice), Number(rightPrice)] : undefined
    }
    return undefined
  }, [isSorted, priceLower?.displayPrice, priceUpper?.displayPrice, price])

  const brushLabelValue = useCallback(
    (dd: 'w' | 'e', x: number) => {
      if (!price) return ''

      if (dd === 'w' && (ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] || !brushDomain)) return '0'
      if (dd === 'e' && (ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || !brushDomain)) return '∞'

      const percent = (d(x).lt(price) ? -1 : 1) * ((Math.max(Number(x), Number(price)) - Math.min(Number(x), Number(price))) / Number(price)) * 100

      // console.log('🚀 ~ percent:', percent)

      return Number(price) ? `${format(Math.abs(percent) > 1 ? '.2~s' : '.2~f')(percent)}%` : ''
      // return `${formatNumberWithDown(percent, 1)}%`
    },
    [isSorted, price, ticksAtLimit, brushDomain]
  )

  const isUninitialized = !currencyA || !currencyB || (seriesData === undefined && !isLoading)

  const testWidthRef = useRef<HTMLDivElement | null>(null)

  // useImperativeHandle(ref, () => ({
  //   depthChartRefreshData: handleRefresh
  // }))

  const { isApp, windowWidth } = useWindowWidth()

  return (
    // <VStack gap="14px" minHeight="200px" width="100%" marginBottom="16px">
    <VStack w="100%" h="100%" flex={1} gap="14px" position="relative" ref={testWidthRef}>
      {/* {isUninitialized ? (
        <Flex direction="column" h={isFrom == 'position' ? '60px' : '150px'} justify="flex-end">
          <Text textAlign="center">Your position will appear here.</Text>
        </Flex>
      ) :  */}
      {isUninitialized || isLoading || !seriesData || !price ? (
        <Box h="100%" pt={isFrom == 'position' ? '30px' : '150px'}>
          <Spinner />
        </Box>
      ) : error && (!seriesData || seriesData.length === 0) ? (
        <Flex direction="column" h={isFrom == 'position' ? '50px' : '150px'} justify="flex-end">
          <Text textAlign="center">Liquidity data not available.</Text>
        </Flex>
      ) : (
        // : seriesData.length === 0 ? (
        //   // 无数据站位
        //   <Box  w="100%" h="100%" pt="16px">
        //     <NoLiquidityData isFrom={isFrom} />
        //   </Box>

        // )
        <Flex
          w="100%"
          h="100%"
          position="relative"
          justify="center"
          align="center"
          pt={isApp && isFrom !== 'position' ? (isApp ? '0px' : '40px') : '0px'}
        >
          {/* {testWidthRef?.current?.clientWidth ? ( */}
          <Chart
            id={chartId}
            key={`${feeAmount ?? FeeAmount.MEDIUM}`}
            data={{ series: seriesData, current: price }}
            dimensions={{
              // width: 660,
              // width: isFrom == 'position' && !isApp ? 200 : testWidthRef?.current?.clientWidth,
              // 为了使图表在下划线显示居中，微调了position 模式下的宽度
              // width: isFrom == 'position' ? (!isApp ? 270 : 300) : testWidthRef?.current?.clientWidth || 498,
              width: isFrom == 'position' ? (!isApp ? 270 : 300) : isApp ? windowWidth - 40 : isFrom === 'rebalance' ? 430 : 498,
              // height: 180
              height: isFrom == 'position' ? 146 : !isApp ? 230 : 200
            }}
            margins={{ top: 10, right: 20, bottom: isFrom == 'position' ? 50 : 20, left: 10 }}
            styles={{
              area: {
                // selection: theme.colors.text
                selection: 'var(--chakra-colors-text_caption)'
              },
              brush: {
                handle: {
                  // west: saturate(0.1, tokenAColor) ?? theme.colors.text,
                  // east: saturate(0.1, tokenBColor) ?? theme.colors.text
                  // west: 'var(--chakra-colors-primary)',
                  // east: 'var(--chakra-colors-primary)'
                  west: '#30D4B7',
                  east: '#6297EA'
                }
              }
            }}
            interactive={interactive}
            brushLabels={brushLabelValue}
            brushDomain={brushDomain}
            onBrushDomainChange={onBrushDomainChangeEnded}
            zoomLevels={zoomLevel ?? ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM]}
            ticksAtLimit={ticksAtLimit}
            isPosition={isFrom === 'position'}
            isFrom={isFrom}
            hideBrush={hideBrush}
            isReverse={isReverse}
            isSorted={isSorted}
            readonly={readonly}
            dashedMarkerLine={dashedMarkerLine}
            handleClickRefresh={handleClickRefresh}
            currentRange={currentRange}
            constantPrice={constantPrice}
            isApp={isApp}
          />
          {/* ) : (
            <Box h="100%" pt={isFrom == 'position' ? '30px' : '150px'}>
              <Spinner />
            </Box>
          )} */}
        </Flex>
      )}
    </VStack>
  )
})

export default LiquidityChartRangeInput
