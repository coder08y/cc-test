import useProListStore from '@/store/pro/list'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { VStack } from '@chakra-ui/react'

function ProSortTab({ isApp }: { isApp?: boolean }) {
  const {
    volumeMax,
    liquidityMin,
    mcMin,
    volumeMin,
    liquidityMax,
    mcMax,
    currentSortTab,
    setCurrentSortTab,
    setProListParams,
    proListParams,
    dateType
  } = useProListStore()
  const tabList: Tab[] = [
    {
      label: 'Hot Trading',
      beforeIcon: { xlinkHref: '#icon-icon_hot', fontSize: '16px', activeColor: '#75C8FF', activeHoverColor: '#75C8FF', svgHover: '#75C8FF' }
    },
    {
      label: 'Gainers',
      beforeIcon: { xlinkHref: '#icon-icon_gainers', fontSize: '16px', activeColor: '#75C8FF', activeHoverColor: '#75C8FF', svgHover: '#75C8FF' }
    },
    {
      label: 'Losers',
      beforeIcon: { xlinkHref: '#icon-icon_loser', fontSize: '16px', activeColor: '#75C8FF', activeHoverColor: '#75C8FF', svgHover: '#75C8FF' }
    }
  ]

  const handleChange = (value: string) => {
    console.log('ProSortTab 🚀 ~ handleChange ~ value:', value)
    setCurrentSortTab(value)
    const liqidity_min = liquidityMin ? liquidityMin : '10000'
    const market_cap_min = mcMin ? mcMin : '10000'
    let volume_min = volumeMin
    if (!volume_min) {
      if (dateType === 'hour24') {
        volume_min = '10000'
      } else if (dateType === 'hour4') {
        volume_min = '2000'
      } else if (dateType === 'hour1') {
        volume_min = '500'
      } else if (dateType === 'm30') {
        volume_min = '200'
      }
    }
    if (value === 'Hot Trading') {
      setProListParams({
        ...proListParams,
        sorted_by: 'volume',
        desc: true,
        tag: 'trending',
        volume_min,
        volume_max: volumeMax,
        liqidity_min,
        liqidity_max: liquidityMax,
        market_cap_min,
        market_cap_max: mcMax,
        offset: 0,
        filter_by: 'hot_trading'
      })
    } else {
      setProListParams({
        ...proListParams,
        sorted_by: 'change',
        desc: value === 'Losers' ? false : true,
        tag: 'trending',
        volume_min,
        volume_max: volumeMax,
        liqidity_min,
        liqidity_max: liquidityMax,
        market_cap_min,
        market_cap_max: mcMax,
        offset: 0,
        filter_by: value === 'Losers' ? 'loser' : 'gainers'
      })
    }
  }

  return (
    <VStack borderRight="1px solid" borderColor={isApp ? 'rgba(0,0,0,0)' : 'border'} gap="0px">
      <SelectTab
        type="outlineTab"
        wrapStyle={{
          w: {
            base: '100%',
            lg: '282px'
          },
          h: '16px',
          bg: 'none',
          border: 'none'
        }}
        itemStyle={{
          marginRight: {
            base: '24px',
            lg: '20px'
          },
          fontSize: isApp ? '14px' : '13px',
          position: 'relative'
        }}
        selectTabItemTextStyle={{
          ml: '4px'
        }}
        tabList={tabList}
        currentTab={currentSortTab}
        noActiveBg={true}
        handleChangeTab={item => {
          handleChange(item.label as string)
        }}
      />
    </VStack>
  )
}

export default ProSortTab
