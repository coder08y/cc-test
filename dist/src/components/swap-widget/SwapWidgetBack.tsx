import { Block } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'

type SwapWidgetBackProps = {
  title: string
  onBackClick: () => void
}

export default function SwapWidgetBack(props: SwapWidgetBackProps) {
  const { title, onBackClick } = props

  return (
    <HStack position="relative" w="100%" mt="12px">
      {/* 返回按钮靠左 */}
      <Block
        ml="12px"
        cursor="pointer"
        left="0"
        w="74px"
        h="32px"
        lineHeight="32px"
        p="0"
        bg="swap_bg_secondary"
        borderRadius="8px"
        onClick={onBackClick}
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
        <HStack justify="center" gap="4px">
          <Icon ml="-10px" xlinkHref="#icon-icon_ascending_nor" transform="rotate(-90deg)" />
          <Text fontSize="12px">Back</Text>
        </HStack>
      </Block>

      {/* 标题居中 */}
      <Text color="text_caption" fontSize="16px" position="absolute" left="50%" transform="translateX(-50%)">
        {title}
      </Text>
    </HStack>
  )
}
