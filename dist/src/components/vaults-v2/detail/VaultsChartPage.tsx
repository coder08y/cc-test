import { VStack } from '@chakra-ui/react'
import ApyAndFeesChartBlock from '../detail/chart/ApyAndFeesChartBlock'
import PriceRangeChartPageBlock from '../detail/chart/PriceRangeChartPageBlock'
import VaultsChartTvlAndFee from './VaultsChartTvlAndFee'

type VaultsChartPageProps = {
  apiVaultInfo?: any
  chartRefresh: boolean
  vaultContractInfo?: any
  currentVaultPool?: any
  category: string
  vaultTvl: string
}

export default function VaultsChartPage({
  apiVaultInfo,
  chartRefresh,
  vaultContractInfo,
  category,
  currentVaultPool,
  vaultTvl
}: VaultsChartPageProps) {
  return (
    <VStack w="100%" p="0px" gap={{ base: '12px', lg: '16px' }} align="flex-start">
      <VaultsChartTvlAndFee
        apiVaultInfo={apiVaultInfo}
        chartRefresh={chartRefresh}
        vaultContractInfo={vaultContractInfo}
        category={category}
        currentVaultPool={currentVaultPool}
        vaultTvl={vaultTvl}
      />
      <ApyAndFeesChartBlock
        isRefresh={chartRefresh}
        vaultsId={apiVaultInfo?.vaultId}
        category={apiVaultInfo?.category}
        positionId={'all'}
        vaultId={apiVaultInfo?.vaultId}
        sunsetTime={apiVaultInfo?.sunsetTime}
      />
      {apiVaultInfo?.category !== 'haevault_v2' && (
        <PriceRangeChartPageBlock
          isRefresh={chartRefresh}
          vaultsId={apiVaultInfo?.vaultId}
          posId={'all'}
          poolId={currentVaultPool?.dlmmPoolAddress}
          isReverse={apiVaultInfo?.isReverse}
          category={apiVaultInfo?.category}
          tokenA={apiVaultInfo?.displayTokenA}
          tokenB={apiVaultInfo?.displayTokenB}
        />
      )}
    </VStack>
  )
}
