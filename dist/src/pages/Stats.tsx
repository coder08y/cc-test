import icon_pools from '@/assets/images/icon_clmm.png'
import icon_tokens from '@/assets/images/icon_tokens@2x.png'
import icon_transactions from '@/assets/images/icon_transactions@2x.png'
import PoolsTable from '@/components/stats/PoolsTable'
import Statistics from '@/components/stats/Statistics'
import TokensTable from '@/components/stats/TokensTable'
import TransactionsTable from '@/components/stats/TransactionsTable'
import TvlChartPageBlock from '@/components/stats/TvlChartPageBlock'
import VolChartPageBlock from '@/components/stats/VolChartPageBlock'
import useStatistics from '@/hooks/stats/useStatistics'
import useStatsStore from '@/store/stats'
import { SelectTab } from '@cetus/design'
import { RefreshButton } from '@cetus/ui-kit'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function Stats() {
  const [currentTab, setCurrentTab] = useState('Pools')
  const [currentTabVal, setCurrentTabVal] = useState<'transactions' | 'tokens' | 'pools'>('pools')
  const tabList = [
    {
      label: 'Pools',
      value: 'pools',
      imgInfo: {
        src: icon_pools,
        w: '22px',
        h: '22px'
      }
    },
    {
      label: 'Tokens',
      value: 'tokens',
      imgInfo: {
        src: icon_tokens,
        w: '22px',
        h: '22px'
      }
    },
    {
      label: 'Transactions',
      value: 'transactions',
      imgInfo: {
        src: icon_transactions,
        w: '22px',
        h: '22px'
      }
    }
  ]
  //统计总数据
  const { getStatistics } = useStatistics()
  const [isLoading, setIsLoading] = useState(true)
  const { statisticsData } = useStatsStore()
  const fetStatisticsData = async () => {
    const result = await getStatistics()
    if (result) {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetStatisticsData()
  }, [])
  const [isRefresh, setIsRefresh] = useState(false)
  const handleRefresh = () => {
    fetStatisticsData()
    setIsRefresh(true)
    setTimeout(() => {
      setIsRefresh(false)
    }, 1000)
  }
  return (
    <VStack pt="40px" w="100%" align="flex-start">
      <HStack mb="8px" gap="12px">
        <Text fontSize="24px" color="text_caption" fontWeight="500">
          Stats
        </Text>
        <RefreshButton handleRefresh={handleRefresh} w="28px" h="28px" innerStyle={{ bg: 'none' }} />
      </HStack>
      <HStack w="100%" gap="20px" flexDirection={{ base: 'column', lg: 'row' }}>
        <TvlChartPageBlock statisticsData={statisticsData} isRefresh={isRefresh} />
        <VolChartPageBlock statisticsData={statisticsData} isRefresh={isRefresh} />
      </HStack>
      <Statistics statisticsData={statisticsData} isRefresh={isRefresh} />
      <Box h="40px" />
      <HStack w="100%">
        <SelectTab
          type="borderTab"
          wrapStyle={{
            w: {
              base: '100%',
              lg: '480px'
            },
            h: '60px',
            pl: {
              base: '16px',
              lg: '40px'
            }
          }}
          itemStyle={{
            fontSize: '16px',
            mr: {
              base: '28px',
              lg: '48px'
            }
          }}
          tabList={tabList}
          currentTab={currentTab}
          handleChangeTab={(item: any) => {
            setCurrentTab(item.label)
            setCurrentTabVal(item.value)
          }}
        />
      </HStack>
      {currentTabVal == 'pools' && <PoolsTable isRefresh={isRefresh} />}
      {currentTabVal == 'tokens' && <TokensTable isRefresh={isRefresh} />}
      {currentTabVal == 'transactions' && <TransactionsTable isRefresh={isRefresh} />}
    </VStack>
  )
}
