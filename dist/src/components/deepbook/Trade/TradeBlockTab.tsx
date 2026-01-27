import { CetusTooltip } from '@cetus/design'
import { HStack, Text } from '@chakra-ui/react'

export const TradeBlockTab = ({
  currentTab,
  setCurrentTab,
  tabList
}: {
  currentTab: string
  setCurrentTab: (tab: string) => void
  tabList: { label: string; tooltip?: string | React.ReactNode; tooltipPlacement?: string; disabled?: boolean }[]
}) => {
  const disabledStyle = {
    bg: { base: 'transparent', lg: 'bg_secondary' },
    color: 'text_paragraph',
    opacity: 0.7,
    _hover: {
      bg: { base: 'transparent', lg: 'bg_secondary' }
    }
  }

  const renderText = (tab: { label: string; tooltip?: string | React.ReactNode; tooltipPlacement?: string; disabled?: boolean }) => {
    return (
      <Text
        fontSize="14px"
        fontWeight="500"
        color={currentTab === tab.label ? 'background' : 'text_paragraph'}
        w="100%"
        h="100%"
        textAlign="center"
        lineHeight="22px"
      >
        {tab.label}
      </Text>
    )
  }

  return (
    <HStack w="100%" h="36px" minH="36px" border="1px solid" borderColor="border" borderRadius="8px" gap="4px" p="2px">
      {tabList.map((tab, index) => (
        <HStack
          flex="1"
          justify="center"
          align="center"
          h="100%"
          key={tab.label}
          onClick={() => !tab.disabled && setCurrentTab(tab.label)}
          cursor="pointer"
          bg={currentTab === tab.label ? (index === 0 ? 'primary_green' : 'primary_red') : 'transparent'}
          borderRadius="6px"
          p="4px 8px"
          gap="4px"
          justifyContent="center"
          alignItems="center"
          sx={{
            ...(tab.disabled ? disabledStyle : {}),
            '& > button': {
              w: '100%',
              h: '100%'
            }
          }}
        >
          {tab.disabled ? <CetusTooltip tooltip={tab.tooltip}>{renderText(tab)}</CetusTooltip> : renderText(tab)}
        </HStack>
      ))}
    </HStack>
  )
}
