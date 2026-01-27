import AprTooltip from '@/components/common/aprTooltip'
import { DLMMPoolApiInfo } from '@/types/pool'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { formatSmallPrice } from '@cetus/utils'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import StatsInfo from './StatsInfo'

type DLMMPoolsStatsProps = {
  apiPoolInfo: DLMMPoolApiInfo
  apiPoolInfoLoading: boolean
  tvlLoading: boolean
  totalTvl: string
}

function PoolsStats({ apiPoolInfo, apiPoolInfoLoading, tvlLoading, totalTvl }: DLMMPoolsStatsProps) {
  const cursorStyle = useMemo(() => {
    if (apiPoolInfo?.haveFarming || (apiPoolInfo?.miningAprList && apiPoolInfo?.miningAprList.length > 0)) {
      return 'help'
    }
    return 'text'
  }, [apiPoolInfo])
  const { isApp } = useWindowWidth()
  return (
    <Stack flexDir={'row'} gap={{ base: '4px', lg: '28px' }} sx={{ ...(isApp && { w: 'max-content' }) }}>
      <StatsInfo
        label="Pool APR"
        value={
          <AprTooltip poolInfo={apiPoolInfo} placement={isApp ? 'bottom-end' : 'bottom'}>
            <HStack justify="flex-end" align="flex-end" gap="4px" lineHeight="14px" h="14px">
              <Text
                as="span"
                fontSize={isApp ? '12px' : '14px'}
                color={cursorStyle == 'help' ? 'primary' : 'text_caption'}
                fontWeight="500"
                cursor={cursorStyle}
                // textUnderlineOffset="2px"
                // textDecoration={cursorStyle == 'help' ? 'underline dotted' : 'none'}
                pos="relative"
              >
                {apiPoolInfo?.feeAndMiningAprDisplay !== '' ? apiPoolInfo?.feeAndMiningAprDisplay : '--'}
                {cursorStyle == 'help' && <Box w="100%" borderBottom="1px dotted" borderColor="primary" pos="absolute" bottom="-1px" />}
              </Text>

              {apiPoolInfo?.haveFarming && (
                <Text fontSize="12px" lineHeight="12px" h="12px" color="primary" fontWeight="500">
                  +{apiPoolInfo?.farmingAprDisplay}
                </Text>
              )}
            </HStack>
          </AprTooltip>
        }
      />
      <StatsInfo
        label="TVL"
        value={totalTvl && totalTvl !== '--' ? `$${formatSmallPrice(totalTvl, 2)}` : '--'}
        loading={apiPoolInfoLoading || tvlLoading}
      />
      <StatsInfo label="Volume (24H)" value={apiPoolInfo?.volume24Display || '--'} loading={!apiPoolInfo || !apiPoolInfo?.volume24Display} />
      <StatsInfo label="Fees (24H)" value={apiPoolInfo?.fees24Display || '--'} loading={!apiPoolInfo || !apiPoolInfo?.fees24Display} />
    </Stack>
  )
}

export default PoolsStats
