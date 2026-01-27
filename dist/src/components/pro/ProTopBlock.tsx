import useProListStore from '@/store/pro/list'
import { RefreshButton } from '@cetus/ui-kit'
import { Box, HStack, VStack } from '@chakra-ui/react'
import ProQuickBuySelect from './ProQuickBuySelect'
import ProRangeSelect from './ProRangeSelect'
import ProSearch from './ProSearch'
import ProTab from './ProTab'
import ProTimeSelect from './ProTimeSelect'

export default function ProTopBlock({ isApp, handleRefresh }: { isApp: boolean; handleRefresh: () => void }) {
  const { currentProTab, isRefreshing } = useProListStore()
  return !isApp ? (
    <VStack w="100%" gap="9px">
      <ProTab handleRefresh={handleRefresh} isApp={isApp} />
      <HStack w="100%" justify="flex-start">
        {/* {currentProTab === 'Trending' && <ProSortTab />} */}
        {currentProTab !== 'Watchlist' && <ProRangeSelect />}
        <Box flex={1} />
        <ProTimeSelect />
        <ProQuickBuySelect />
      </HStack>
    </VStack>
  ) : (
    <VStack w="100%" align="flex-start">
      <HStack w="100%" justify="space-between" mt={{ base: '0px', lg: '20px' }}>
        <ProSearch />
        <RefreshButton handleRefresh={handleRefresh} w="36px" h="36px" innerStyle={{ bg: 'bg_secondary' }} isRefreshed={isRefreshing} />
      </HStack>

      <ProTab handleRefresh={handleRefresh} isApp={isApp} />
      {/* <Box h="4px" /> */}
      {/* {currentProTab === 'Trending' && <ProSortTab isApp={isApp} />} */}
      {currentProTab !== 'Watchlist' && <ProRangeSelect isApp={isApp} />}
      <HStack w="100%" justify="flex-start" mt={{ base: '0', lg: '4px' }}>
        <ProTimeSelect isApp={isApp} />
        <Box flex="1">
          <ProQuickBuySelect isApp={isApp} />
        </Box>
      </HStack>
    </VStack>
  )
}
