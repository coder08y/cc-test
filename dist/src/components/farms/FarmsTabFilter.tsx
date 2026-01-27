import { SelectTab, SortDropBlock } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { SortDropType } from '@cetus/design/src/components/common/SortDropBlock'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { RefreshButton } from '@cetus/ui-kit'
import { HStack } from '@chakra-ui/react'
export type sortRule = 'desc' | 'asc'
export type TabFilterProps = {
  sortByList: SortDropType[]
  currTab: Tab<object>
  tabList: Tab<object>[]
  currSortType: SortDropType
  sortRule: sortRule
  handleChangeTab: (tab: Tab<object>) => void
  onSortByChange: (type: SortDropType) => void
  handleChangeSortRule: (sortRule: sortRule) => void
  handleRefresh: () => void
}

export function FarmsTabFilter(props: TabFilterProps) {
  const { sortByList, currTab, tabList, handleChangeTab, currSortType, onSortByChange, sortRule, handleRefresh, handleChangeSortRule } = props
  const { isApp } = useWindowWidth()

  return (
    <HStack
      w="100%"
      mt={{ base: '20px', lg: '40px' }}
      justify="space-between"
      flexDirection={{
        base: 'column',
        lg: 'row'
      }}
    >
      {/* 切换Tab */}
      <SelectTab
        type="borderTab"
        wrapStyle={{
          w: {
            base: '100%',
            lg: '415px'
          },
          h: '46px',
          borderRadius: { base: '8px', lg: '12px' }
        }}
        itemStyle={{
          w: '50%',
          fontSize: '16px'
        }}
        tabList={tabList}
        currentTab={currTab.label}
        handleChangeTab={handleChangeTab}
      />
      <HStack w={{ base: '100%', lg: 'unset' }}>
        {/* 选择排序类型 */}
        <SortDropBlock
          showArrow
          sortText="Sort by"
          xlinkHref={sortRule == 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
          iconOnClick={() => {
            if (sortRule === 'asc') {
              handleChangeSortRule('desc')
            } else {
              handleChangeSortRule('asc')
            }
          }}
          minW={isApp ? 'calc(100vw - 126px)' : '120px'}
          currentSort={currSortType}
          sortByList={sortByList}
          onSortByChange={onSortByChange}
          wrapStyle={{
            borderRadius: { base: '8px', lg: '12px' }
          }}
        />
        {/* <IconBg
          xlinkHref={sortRule == 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
          borderRadius={{ base: '8px', lg: '12px' }}
          onClick={() => {
            if (sortRule === 'asc') {
              handleChangeSortRule('desc')
            } else {
              handleChangeSortRule('asc')
            }
          }}
        /> */}
        <RefreshButton handleRefresh={handleRefresh} borderRadius={{ base: '8px', lg: '12px' }} />
      </HStack>
    </HStack>
  )
}
