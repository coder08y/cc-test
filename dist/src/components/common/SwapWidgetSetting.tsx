import { Icon } from '@cetus/ui-kit'
import { HStack } from '@chakra-ui/react'

type SwapWidgetSettingProps = {
  handleSettingClick: () => void
}

function SwapWidgetSetting({ handleSettingClick }: SwapWidgetSettingProps) {
  return (
    <HStack
      onClick={handleSettingClick}
      h="28px"
      w="28px"
      borderRadius="8px"
      border="1px solid"
      justifyContent="center"
      alignItems="center"
      borderColor="border"
      bg="bg_secondary"
      cursor="pointer"
      sx={{
        _hover: {
          p: {
            color: 'text_caption'
          },
          svg: {
            fill: 'text_caption'
          }
        }
      }}
    >
      <Icon xlinkHref="#icon-icon_settings1" variant="gray" />
    </HStack>
  )
}

export default SwapWidgetSetting
