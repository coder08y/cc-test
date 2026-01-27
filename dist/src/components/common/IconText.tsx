import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { HStack, Text } from '@chakra-ui/react'

export const IconText = ({
  text,
  xlinkHref,
  isDisabled = false,
  svgFill = 'text_paragraph',
  onClick,
  svgSize = '20px',
  svgMl = '0px'
}: {
  text: string
  isDisabled?: boolean
  xlinkHref?: string
  onClick: () => void
  svgFill?: string
  svgSize?: string
  svgMl?: string
}) => {
  return (
    <HStack
      w="100%"
      cursor="pointer"
      bg="menu_item_bg"
      borderRadius="8px"
      padding="11px"
      _hover={{
        svg: {
          fill: 'primary'
        },
        p: {
          color: isDisabled ? 'text_paragraph' : 'primary'
        }
      }}
      onClick={(e: any) => {
        cancelBubble(e)
        onClick()
      }}
    >
      {xlinkHref && (
        <Icon svgFill={svgFill} xlinkHref={xlinkHref} svgHover="primary" svgW={svgSize} svgH={svgSize} minW={svgSize} minH={svgSize} ml={svgMl} />
      )}
      <Text fontSize="13px">{text}</Text>
    </HStack>
  )
}
