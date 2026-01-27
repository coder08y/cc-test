import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, Stack, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import CommunityToolsEntry from '../../common/CommunityToolsEntry'
import RecentTransaction from '../recentTransactions'
import AnalyticsCharts from './AnalyticsCharts'
import AnalyticsTabs from './AnalyticsTabs'
import BurnedLiquidity from './BurnedLiquidity'
import PoolInfo from './PoolInfo'

const tabList = [
  { label: 'Overview', value: 'overview' },
  { label: 'Stats', value: 'stats' },
  { label: 'Transactions', value: 'transactions' }
]

function PoolsAnalytics() {
  const { isApp } = useWindowWidth()
  const [currentTab, setCurrentTab] = useState<string>('overview')
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
      </Stack>

      <BurnedLiquidity isShow={(isApp && currentTab === 'overview') || !isApp} />
      {isApp && (
        <Box
          display={{
            base: currentTab === 'overview' ? 'block' : 'none',
            lg: 'flex'
          }}
          w="100%"
        >
          <CommunityToolsEntry />
        </Box>
      )}

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
