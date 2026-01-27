import { BothAndZapTabAction } from '@/types/dlmm'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { VStack } from '@chakra-ui/react'

type BothAndZapTabItemMeta = {
  action: BothAndZapTabAction
}

type BothAndZapTabProps = {
  currentTab: BothAndZapTabAction
  tabList: Tab<BothAndZapTabItemMeta>[]
  onSelectTab: (tab: BothAndZapTabAction) => void
}

export function BothAndZapTab({ currentTab, tabList, onSelectTab }: BothAndZapTabProps) {
  return (
    <VStack w="100%">
      <SelectTab<BothAndZapTabItemMeta, BothAndZapTabAction>
        wrapStyle={{
          w: '100%',
          h: { base: '36px', lg: '42px' },
          borderRadius: { base: '8px', lg: '12px' },
          p: { base: '1px', lg: '3px' }
        }}
        itemStyle={{
          w: '50%',
          fontSize: { base: '12px', lg: '14px' },
          borderRadius: { base: '6px', lg: '8px' },
          fontWeight: '500'
        }}
        type="outlineTab"
        currentTab={currentTab}
        tabList={tabList}
        handleChangeTab={(item: Tab<BothAndZapTabItemMeta>) => {
          onSelectTab(item.action)
        }}
      />
    </VStack>
  )
}
