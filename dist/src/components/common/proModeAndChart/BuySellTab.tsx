import useProStore from '@/store/pro'
import SelectTab from '@cetus/design/src/components/common/SelectTab'

function BuySellTab() {
  const { currentProTab, setCurrentProTab } = useProStore()
  const tabList = [
    {
      label: 'Buy',
      value: 'buy'
    },
    {
      label: 'Sell',
      value: 'Sell'
    }
  ]
  return (
    <SelectTab<any, any>
      type="outlineTab"
      tabList={tabList}
      currentTab={currentProTab}
      handleChangeTab={tab => setCurrentProTab(tab?.label, 'buySellTab')}
      wrapStyle={{
        w: '100%',
        h: '48px',
        p: '4px',
        border: '1px solid',
        borderColor: 'border',
        borderRadius: '16px',
        gap: '4px',
        zIndex: '99',
        m: '8px 0 0px'
      }}
      itemStyle={{
        w: '50%',
        h: '100%',
        p: '4px 8px',
        borderRadius: '12px',
        gap: '4px',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500',
        // 使用 Chakra UI 的 sx 支持条件样式
        sx: {
          '&[data-active="true"]': {
            backgroundColor: currentProTab == 'Buy' ? 'primary_green_opacity.10' : 'primary_red_opacity.10',
            color: currentProTab == 'Buy' ? 'primary_green' : 'primary_red'
          }
        }
      }}
      selectTabItemTextStyle={{
        color: 'primary_gray',
        sx: {
          '&[data-active="true"]': {
            color: currentProTab == 'Buy' ? 'primary_green' : 'primary_red'
          }
        }
      }}
    />
  )
}

export default BuySellTab
