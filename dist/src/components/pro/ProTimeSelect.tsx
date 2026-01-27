import useProHelper from '@/hooks/pro/useProHelper'
import useProListStore from '@/store/pro/list'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useState } from 'react'

export enum DateTabsEnum {
  m30 = '30M',
  hour1 = '1H',
  hour4 = '4H',
  hour24 = '24H'
}

function getKeyByValue(value: string): keyof typeof DateTabsEnum | undefined {
  return Object.keys(DateTabsEnum).find(key => DateTabsEnum[key as keyof typeof DateTabsEnum] === value) as keyof typeof DateTabsEnum | undefined
}

export type DateTypes = { label: DateTabsEnum }

export default function ProTimeSelect({ isApp }: { isApp?: boolean }) {
  const { volumeMin, volumeMax, liquidityMax, liquidityMin, mcMin, mcMax, currentProTab, setDateType, setProListParams, currentSortTab } =
    useProListStore()
  const { getVolumeMin } = useProHelper()
  const dateTypes = Object.values(DateTabsEnum).map(value => ({
    label: value
  }))

  const [currentDateType, setCurrentDateType] = useState<DateTabsEnum>(DateTabsEnum.hour24)

  const handleDateTabChange = (item: Tab<DateTypes>) => {
    console.log('🚀 ~ handleDateTabChange ~ item:', currentProTab, item)
    setCurrentDateType(item.label)
    const value = getKeyByValue(item.label) as string
    setDateType(value, item?.label)
    // 这段限制只限用Top
    const liqidity_min = liquidityMin ? liquidityMin : '10000'
    const market_cap_min = mcMin ? mcMin : '10000'
    if (currentProTab === 'Top') {
      const volume_min = getVolumeMin(volumeMin, value)
      setProListParams({
        // sorted_by: 'volume',
        // desc: true,
        tag: 'Top',
        volume_min,
        volume_max: volumeMax,
        liqidity_min,
        liqidity_max: liquidityMax,
        market_cap_min,
        market_cap_max: mcMax,
        offset: 0,
        date_type: value
      })
    } else {
      if (currentProTab !== 'Trending') {
        setProListParams({
          date_type: value,
          offset: 0
        })
      }
    }
  }

  return (
    <SelectTab<DateTypes, DateTabsEnum>
      type="outlineTab"
      tabList={dateTypes}
      currentTab={currentDateType}
      handleChangeTab={handleDateTabChange}
      wrapStyle={{
        height: '36px',
        p: '3px',
        borderRadius: '8px',
        flex: '0 0 128px'
      }}
      itemStyle={{
        fontSize: '12px',
        flex: 1,
        borderRadius: '6px',
        w: isApp ? '40px' : '48px'
      }}
    />
  )
}
