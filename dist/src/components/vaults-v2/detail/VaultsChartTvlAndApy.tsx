import { VAULT_FILTER } from '@cetus/types/src/env'
import { BoxProps, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import ApyAndFeesChartBlock from './chart/ApyAndFeesChartBlock'
import PerformanceChartPageBlock from './chart/PerformanceChartPageBlock'
import TvlChartPageBlock from './chart/TvlChartPageBlock'

type VaultsChartTvlAndApyProps = {
  apiVaultInfo?: any
  chartRefresh: boolean
  currentVaultPool?: any
  category: string
  vaultTvl?: string
  positionId?: string
  blockStyle?: BoxProps
  poolId?: string
}

const chartTypeList = [
  {
    label: 'APY'
  },
  {
    label: 'TVL'
  }
]

export default function VaultsChartTvlAndApy({
  apiVaultInfo,
  chartRefresh,
  category,
  currentVaultPool,
  vaultTvl,
  positionId,
  blockStyle,
  poolId
}: VaultsChartTvlAndApyProps) {
  const [chartType, setChartType] = useState<'TVL' | 'APY'>('APY')

  useEffect(() => {
    setChartType('APY')
  }, [apiVaultInfo?.vaultId])

  return (
    <VStack w="100%" p="0px" gap="0px" align="flex-start">
      {chartType === 'TVL' && (
        <TvlChartPageBlock
          blockStyle={blockStyle}
          chartTypeList={chartTypeList}
          isRefresh={chartRefresh}
          vaultsId={apiVaultInfo?.vaultId || ''}
          category={apiVaultInfo?.category || ''}
          positionId={positionId || 'all'}
          poolId={poolId}
          onTabChange={setChartType}
          vaultTvl={vaultTvl}
        />
      )}

      {chartType === 'APY' && (
        <ApyAndFeesChartBlock
          blockStyle={blockStyle}
          chartTypeList={chartTypeList}
          onTabChange={setChartType}
          isRefresh={chartRefresh}
          vaultsId={apiVaultInfo?.vaultId}
          category={apiVaultInfo?.category}
          poolId={poolId}
          positionId={positionId || 'all'}
          vaultId={apiVaultInfo?.vaultId}
          sunsetTime={apiVaultInfo?.sunsetTime}
        />
      )}
    </VStack>
  )
}
