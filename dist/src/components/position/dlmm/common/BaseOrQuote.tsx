import { Box, HStack, StackProps, Text } from '@chakra-ui/react'

type BaseQuoteProps = {
  text: string
  textSize?: string
  wrapStyle: StackProps
  boxStyle: StackProps
  isBase: boolean
}

export default function BaseOrQuote(props: BaseQuoteProps) {
  const { text, textSize = '12px', isBase, boxStyle, wrapStyle } = props
  return (
    <HStack {...wrapStyle}>
      <Box {...boxStyle} bg={isBase ? 'dlmm_green' : 'bg_ten'} borderRadius="2px" />
      <Text fontSize={textSize}>{text}</Text>
    </HStack>
  )
}
