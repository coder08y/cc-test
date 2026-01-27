import useProHelper from '@/hooks/pro/useProHelper'
import useProListStore from '@/store/pro/list'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { RefreshButton } from '@cetus/ui-kit'
import { Box, HStack } from '@chakra-ui/react'
import { useCallback } from 'react'
import ProSearch from './ProSearch'

const tabList: Tab[] = [{ label: 'Trending' }, { label: 'Top' }, { label: 'Gainers' }, { label: 'Losers' }, { label: 'New' }, { label: 'Watchlist' }]

function ProTab({ isApp, handleRefresh }: { isApp: boolean; handleRefresh: () => void }) {
  const { volumeMin, dateType, currentProTab, setCurrentSortTab, setCurrentProTab, setProListParams, proListParams, isRefreshing } = useProListStore()
  const { getVolumeMin } = useProHelper()
  const getTabParams = (tab: string) => {
    switch (tab) {
      case 'Trending':
        return {
          sorted_by: 'rank',
          desc: false,
          tag: 'trending'
        }
        break
      case 'Top':
        return {
          sorted_by: 'volume',
          desc: true,
          tag: 'top'
        }
        break
      case 'Gainers':
        return {
          sorted_by: 'change',
          desc: true,
          tag: 'gainer'
        }
        break
      case 'Losers':
        return {
          sorted_by: 'change',
          desc: false,
          tag: 'loser'
        }
      case 'New':
        return {
          sorted_by: 'age',
          desc: true,
          tag: 'new'
        }
        break
    }
  }

  const setParams = useCallback(
    (params: Record<string, any>) => {
      setProListParams({
        ...proListParams,
        ...params,
        offset: 0
      })
    },
    [proListParams, setProListParams]
  )

  const handleChange = (value: string) => {
    setCurrentProTab(value)
    const volume_min = getVolumeMin(volumeMin, dateType)

    if (value === 'Top' || value === 'Gainers' || value === 'Losers') {
      setParams({
        volume_min: value === 'Top' ? volume_min : '',
        volume_max: '',
        liqidity_min: '10000',
        liqidity_max: '',
        market_cap_min: '10000',
        market_cap_max: '',
        ...getTabParams(value)
      })
    } else {
      setParams({
        volume_min: '',
        volume_max: '',
        liqidity_min: '',
        liqidity_max: '',
        market_cap_min: '',
        market_cap_max: '',
        ...getTabParams(value)
      })
    }
  }

  return (
    <HStack w="100%" overflow="auto" justify="space-between" borderBottom="1px solid" borderColor="border">
      <SelectTab
        type="borderTab"
        wrapStyle={{
          w: { base: '100%', lg: 'unset' },
          h: isApp ? '36px' : '54px',
          bg: 'none',
          border: 'none'
        }}
        itemStyle={{
          marginRight: { base: '24px', lg: '40px' },
          fontSize: '16px',
          position: 'relative',
          flex: isApp ? '1' : 'auto'
        }}
        tabList={tabList}
        currentTab={currentProTab}
        handleChangeTab={item => handleChange(item.label as string)}
      />
      <Box flex="1" />
      {!isApp && <ProSearch />}
      {!isApp && <RefreshButton handleRefresh={handleRefresh} w="32px" h="32px" innerStyle={{ bg: 'bg_secondary' }} isRefreshed={isRefreshing} />}
    </HStack>
  )
}

export default ProTab
