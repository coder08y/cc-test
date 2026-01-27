import { VAULT_FILTER } from '@cetus/types/src/env'
import { VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import TvlChartPageBlock from '../detail/chart/TvlChartPageBlock'
import PerformanceChartPageBlock from './chart/PerformanceChartPageBlock'

type VaultsChartTvlAndFeeProps = {
  apiVaultInfo?: any
  chartRefresh: boolean
  vaultContractInfo?: any
  currentVaultPool?: any
  category: string
  vaultTvl?: string
}

const chartTypeList = [
  {
    label: 'TVL'
  },
  {
    label: 'Performance'
  }
]

export default function VaultsChartTvlAndFee({
  apiVaultInfo,
  chartRefresh,
  vaultContractInfo,
  category,
  currentVaultPool,
  vaultTvl
}: VaultsChartTvlAndFeeProps) {
  const [chartType, setChartType] = useState<'TVL' | 'Performance'>('TVL')

  useEffect(() => {
    setChartType('TVL')
  }, [apiVaultInfo?.vaultId])

  return (
    <VStack w="100%" p="0px" gap="0px" align="flex-start">
      {chartType === 'TVL' && (
        <TvlChartPageBlock
          chartTypeList={!VAULT_FILTER ? chartTypeList : []}
          isRefresh={chartRefresh}
          vaultsId={apiVaultInfo?.vaultId || ''}
          category={apiVaultInfo?.category || ''}
          positionId={'all'}
          onTabChange={setChartType}
          vaultTvl={vaultTvl}
        />
      )}

      {category !== 'cetus' && chartType === 'Performance' && !VAULT_FILTER && (
        <PerformanceChartPageBlock
          isRefresh={chartRefresh}
          vaultId={apiVaultInfo?.vaultId || ''}
          poolId={currentVaultPool?.dlmmPoolAddress || apiVaultInfo?.vaultId}
          displayCoinA={apiVaultInfo?.displayTokenA}
          displayCoinB={apiVaultInfo?.displayTokenB}
          category={category}
          isReverse={apiVaultInfo?.isReverse}
          onTabChange={setChartType}
          status={apiVaultInfo?.status}
          sunsetTime={apiVaultInfo?.sunsetTime}
        />
      )}
    </VStack>
  )
}
