import useDlmmLiquidityStore from '@/store/dlmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { Box, Stack, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import AnalyticsTabs from '../../clmm/analytics/AnalyticsTabs'
import CommunityToolsEntry from '../../common/CommunityToolsEntry'
import RecentTransaction from '../recentTransactions'
import AnalyticsCharts from './AnalyticsCharts'
import BinsTradingVolume from './BinsTradingVolume'
import PoolInfo from './PoolInfo'
import PoolLiquidityDistribution from './PoolLiquidityDistribution'
import RewardDistribution from './RewardDistribution'

const tabList = [
  { label: 'Overview', value: 'overview', show: true },
  { label: 'Stats', value: 'stats', show: true },
  { label: 'Transactions', value: 'transactions', show: true }
]

function PoolsAnalytics({ priceDirect }: { priceDirect: boolean }) {
  const { isApp } = useWindowWidth()
  const [currentTab, setCurrentTab] = useState<string>('overview')

  const { dlmmContractPoolInfo } = useDlmmLiquidityStore()

  const showRewardList = useMemo(() => {
    return (
      dlmmContractPoolInfo?.reward_manager &&
      dlmmContractPoolInfo?.reward_manager?.rewards &&
      dlmmContractPoolInfo?.reward_manager?.rewards.length > 0
    )
  }, [dlmmContractPoolInfo?.reward_manager])

  return (
    <VStack w="100%" gap={isApp ? '8px' : '16px'} minW={{ base: '100%', lg: '1024px' }}>
      {isApp && <AnalyticsTabs tabList={tabList} currentTab={currentTab} setCurrentTab={setCurrentTab} />}
      <Stack
        display={{ base: currentTab === 'stats' || currentTab === 'overview' ? 'flex' : 'none', lg: 'flex' }}
        flexDir={{ base: 'column', lg: 'row' }}
        w="100%"
        gap="16px"
      >
        <Box
          display={{
            base: currentTab === 'stats' ? 'block' : 'none',
            lg: 'flex'
          }}
          flex="1"
        >
          <VStack w="100%">
            <AnalyticsCharts />
            {!isApp && <CommunityToolsEntry />}
          </VStack>
        </Box>
        <Box
          display={{
            base: currentTab === 'overview' ? 'block' : 'none',
            lg: 'flex'
          }}
        >
          <PoolInfo />
        </Box>
        <Box
          display={{
            base: currentTab === 'overview' ? 'block' : 'none',
            lg: 'flex'
          }}
        >
          {isApp && <CommunityToolsEntry />}
        </Box>
      </Stack>
      {showRewardList && envConfigs.show_incentive_page && (
        <Box
          display={{
            base: currentTab === 'stats' ? 'block' : 'none',
            lg: 'flex'
          }}
          w="100%"
        >
          <RewardDistribution />
        </Box>
      )}
      <Box
        display={{
          base: currentTab === 'stats' ? 'block' : 'none',
          lg: 'flex'
        }}
        w="100%"
      >
        <PoolLiquidityDistribution priceDirect={priceDirect} />
      </Box>
      <Box
        display={{
          base: currentTab === 'stats' ? 'block' : 'none',
          lg: 'flex'
        }}
        w="100%"
      >
        <BinsTradingVolume priceDirect={priceDirect} />
      </Box>
      <Box
        display={{
          base: currentTab === 'transactions' ? 'block' : 'none',
          lg: 'flex'
        }}
        w="100%"
      >
        <RecentTransaction />
      </Box>
    </VStack>
  )
}

export default PoolsAnalytics
