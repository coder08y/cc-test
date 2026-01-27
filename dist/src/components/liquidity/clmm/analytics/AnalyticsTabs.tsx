import { HStack, Text } from '@chakra-ui/react'

export default function AnalyticsTabs({
  tabList,
  currentTab,
  setCurrentTab
}: {
  tabList: any[]
  currentTab: string
  setCurrentTab: (tab: string) => void
}) {
  return (
    <HStack w="100%" justify="flex-start" p="12px">
      {tabList.map(item => (
        <Text
          sx={{
            fontSize: '14px',
            h: '28px',
            lineHeight: '28px',
            px: '6px',
            borderRadius: '6px',
            fontWeight: '500',
            ...(currentTab === item.value && {
              color: 'primary',
              bg: 'primary_opacity.10'
            })
          }}
          key={item.value}
          onClick={() => setCurrentTab(item.value)}
        >
          {item.label}
        </Text>
      ))}
    </HStack>
  )
}
