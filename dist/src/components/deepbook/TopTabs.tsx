import useDeepBookStore from '@/store/deepbook'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, HStack, Text } from '@chakra-ui/react'

export default function TopTabs() {
  const { deepbookTopTab, setDeepbookTopTab } = useDeepBookStore()
  const { isApp } = useWindowWidth()
  const tabs = [
    {
      label: 'Trade',
      value: 'trade'
      // isNew: true
    },
    {
      label: 'Margin Pools',
      value: 'margin_pools',
      isComingSoon: false
    }
  ]
  const handleChangeTab = (tab: any) => {
    setDeepbookTopTab(tab.value)
  }

  // 确保默认选中 Trade 放到DeepBook Page里面
  // useEffect(() => {
  //   if (!deepbookTopTab || (deepbookTopTab !== 'trade' && deepbookTopTab !== 'margin_pools')) {
  //     setDeepbookTopTab('trade')
  //   }
  // }, [deepbookTopTab, setDeepbookTopTab])

  // 使用计算值确保默认值为 'trade'
  const currentTab = deepbookTopTab || 'trade'

  // console.log(deepbookTopTab, 'deepbookTopTab')

  return (
    <HStack w="100%" h="56px" minH="56px" bg={{ base: 'transparent', lg: 'bg_secondary' }} borderRadius="8px" px="12px" gap="48px">
      {tabs.map(tab => {
        const tabContent = (
          <Box
            key={`deepbook_top_tab_${tab.value}`}
            cursor="pointer"
            position="relative"
            role="group"
            onClick={() => !tab.isComingSoon && handleChangeTab(tab)}
          >
            <Text
              fontSize="16px"
              lineHeight="24px"
              fontWeight="500"
              color={currentTab === tab.value ? 'primary' : 'text_paragraph'}
              _hover={{ color: tab.isComingSoon ? 'text_paragraph' : 'primary' }}
            >
              {tab.label}
            </Text>
            {/* {tab.isNew && <Image src={newIcon} position="absolute" top="-6px" right="-8px" w="28px" h="12px" />} */}

            {currentTab === tab.value && !isApp && (
              <Box position="absolute" bottom="-16px" left="50%" transform="translateX(-50%)" w="24px" h="2px" bg="primary" />
            )}
          </Box>
        )

        return tab.isComingSoon ? (
          <CetusTooltip
            key={`deepbook_top_tab_${tab.value}`}
            tooltip={
              <Text fontSize="12px" lineHeight="16px" color="text_paragraph">
                Coming Soon
              </Text>
            }
            placement="top"
          >
            {tabContent}
          </CetusTooltip>
        ) : (
          tabContent
        )
      })}
    </HStack>
  )
}
