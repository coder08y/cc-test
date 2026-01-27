import BinRangeSelectChart from '@/components/chart/dlmmChart/BinRangeSelectChart'
import CurrentLiquidityChart from '@/components/chart/dlmmChart/CurrentLiquidityChart'
import useDlmmCreatChart from '@/hooks/create-pool/useDlmmCreatChart'
import useCreateDlmmPoolStore from '@/store/pool/createDlmmPool'
import { VStack } from '@chakra-ui/react'

const width = 476
export default function CreateDlMMChart({ direct }: { direct: boolean }) {
  const { currentLiquidityBins, activeId, maxBinRangeData, handleRangeChange } = useDlmmCreatChart(direct)
  const { minPriceData, maxPriceData } = useCreateDlmmPoolStore()
  // const handleRangeChange = (minBin: number, maxBin: number) => {
  //   console.log('🚀 DLMMChart ~ handleRangeChange ~ minBin:', minBin)
  //   console.log('🚀 DLMMChart ~ handleRangeChange ~ maxBin:', maxBin)
  // }

  return (
    <VStack position="relative" width={`${width}px`} w="100%" h="200px">
      <CurrentLiquidityChart data={currentLiquidityBins} activeBin={Number(activeId)} width={width} height={162} direct={direct} />
      {maxBinRangeData && maxBinRangeData?.list?.length > 0 && (
        <BinRangeSelectChart
          activeBin={Number(activeId)}
          data={maxBinRangeData}
          width={width}
          height={0}
          type="liquidity"
          noToolTip={true}
          onChangeRange={handleRangeChange}
          minBinId={minPriceData?.binId}
          maxBinId={maxPriceData?.binId}
          direct={direct}
        />
      )}
    </VStack>
  )
}
