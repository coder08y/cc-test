import { SelectTab } from '@cetus/design'
import { Box } from '@chakra-ui/react'
import { useMemo } from 'react'

export default function ZapTabs({ tokens, current, onSelect }: { tokens: any; current: any; onSelect: (value: string) => void }) {
  const zapTabList = useMemo(() => {
    return tokens?.map((item: any) => {
      return {
        label: item?.symbol,
        value: item?.coin_type
      }
    })
  }, [tokens])

  const currentTab = useMemo(() => {
    return zapTabList?.filter((item: any) => item?.value === current?.coin_type)?.[0]
  }, [zapTabList, current?.coin_type])

  const handleChangeTab = (item: any) => {
    const currentToken = tokens?.filter((token: any) => token?.coin_type === item?.value)?.[0]
    onSelect(currentToken)
  }

  return (
    <Box w="100%" mb="8px">
      <SelectTab
        wrapStyle={{
          w: '100%',
          h: { base: '36px', lg: '48px' },
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
        currentTab={currentTab?.label}
        tabList={zapTabList}
        handleChangeTab={handleChangeTab}
      />
    </Box>
  )
}
