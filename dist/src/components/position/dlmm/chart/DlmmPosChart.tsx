import BinRangeSelectChart from '@/components/chart/dlmmChart/BinRangeSelectChart'
import CurrentLiquidityChart from '@/components/chart/dlmmChart/CurrentLiquidityChart'
import useDlmmPosChart from '@/hooks/dlmm-position/useDlmmPosChart'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { BinAmount } from '@cetusprotocol/dlmm-sdk'
import { VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

export default function DlmmPosChart({
  direct,
  isReverse,
  poolAllBinObjCallback
}: {
  direct: boolean
  isReverse: boolean
  poolAllBinObjCallback: (binList: BinAmount[]) => void
}) {
  const { currentLiquidityBins, activeBin, maxBinRangeData, handleRangeChange, maxBinLoading, tokenAPrice, tokenBPrice } = useDlmmPosChart(
    isReverse,
    direct,
    poolAllBinObjCallback
  )
  const { windowWidth } = useWindowWidth()
  const width = useMemo(() => {
    if (windowWidth < 810) {
      return windowWidth - 44
    }
    return 652
  }, [windowWidth])

  return (
    // <VStack gap="10px" pb={maxBinRangeData ? '0px' : '20px'}>
    <VStack gap="8px" h="260px">
      {/* {activeBin !== undefined ? ( */}
      <CurrentLiquidityChart
        width={width}
        activeBin={Number(activeBin)}
        data={currentLiquidityBins}
        height={162}
        fromPosition={true}
        direct={direct}
        isReverse={isReverse}
        tokenAPrice={tokenAPrice}
        tokenBPrice={tokenBPrice}
      />
      {/* ) : (
        <Center h="160px">
          <Spinner size="sm" color="text_caption" />
        </Center>
      )} */}
      {/* {maxBinRangeData && maxBinRangeData?.list?.length > 0 ? ( */}
      <BinRangeSelectChart
        activeBin={Number(activeBin)}
        data={maxBinRangeData}
        width={width}
        height={60}
        isSimple={true}
        onChangeRange={handleRangeChange}
        type="row"
        isReverse={isReverse}
        currentLiquidityBins={currentLiquidityBins}
        maxBinLoading={maxBinLoading}
      />
      {/* ) : (
        <Center h="90px">
          <Spinner size="sm" color="text_caption" />
        </Center>
      )} */}
    </VStack>
  )
}
