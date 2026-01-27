import BinRangeSelectChart from '@/components/chart/dlmmChart/BinRangeSelectChart'
import CurrentLiquidityChart from '@/components/chart/dlmmChart/CurrentLiquidityChart'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { CurrentBinChartData, MaxBinRangeChartData } from '@/types/dlmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { BinAmount } from '@cetusprotocol/dlmm-sdk'
import { VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

const width = 652
function DlmmRangeChart({
  direct,
  currentLiquidityBins,
  currentLiquidityBinsLoading,
  activeId,
  maxBinRangeData,
  handleRangeChange,
  isReverse,
  otherPosBinObj,
  maxBinLoading = false,
  tokenAPrice,
  tokenBPrice,
  tokenAPythPrice,
  tokenBPythPrice,
  strategy,
  chartBinsData
}: {
  direct: boolean
  isReverse: boolean
  currentLiquidityBins?: CurrentBinChartData
  currentLiquidityBinsLoading?: boolean
  maxBinRangeData?: MaxBinRangeChartData
  maxBinLoading: boolean
  handleRangeChange: (min: any, max: any) => void
  activeId?: number
  otherPosBinObj?: Record<string, BinAmount>
  tokenAPrice?: any
  tokenBPrice?: any
  tokenAPythPrice?: any
  tokenBPythPrice?: any
  strategy?: any
  chartBinsData?: any
}) {
  const { minPriceData, maxPriceData } = useAddDlmmLiquidityStore()

  const { windowWidth, isApp } = useWindowWidth()

  const width = useMemo(() => {
    if (windowWidth < 810) {
      return windowWidth - 60
    }
    return 652
  }, [windowWidth])

  return (
    <VStack position="relative" w="100%" h={isApp ? '278px' : '288px'} gap={isApp ? '12px' : '8px'}>
      <CurrentLiquidityChart
        data={currentLiquidityBins}
        activeBin={Number(activeId)}
        width={isApp ? '100%' : width}
        height={162}
        direct={direct}
        isReverse={isReverse}
        type="simulation"
        onChangeRange={handleRangeChange}
        // isShowSlider={activeId !== undefined && maxBinRangeData?.list && maxBinRangeData?.list?.length > 0}
        isShowSlider={!maxBinLoading || maxBinRangeData?.list?.length > 0}
        tokenAPrice={tokenAPrice}
        tokenBPrice={tokenBPrice}
        strategy={strategy}
        chartBinsData={chartBinsData}
        dataLoading={currentLiquidityBinsLoading}
      />
      <BinRangeSelectChart
        activeBin={Number(activeId)}
        data={maxBinRangeData}
        width={width}
        height={76}
        type="liquidity"
        onChangeRange={handleRangeChange}
        minBinId={minPriceData?.binId}
        maxBinId={maxPriceData?.binId}
        currentLiquidityBins={currentLiquidityBins}
        otherPosBinObj={otherPosBinObj}
        isReverse={isReverse}
        direct={direct}
        maxBinLoading={maxBinLoading}
        tokenAPythPrice={tokenAPythPrice}
        tokenBPythPrice={tokenBPythPrice}
      />
    </VStack>
  )
}

export default DlmmRangeChart
