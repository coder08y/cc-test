import { HStack, Image, Text } from '@chakra-ui/react'

type PoweredByHaedalProps = {
  color?: string
  fontSize?: string
  imgW?: string
  imgH?: string
  mt?: string
  category: string
  hideProvider?: boolean
}

function PoweredByHaedal(props: PoweredByHaedalProps) {
  const { color, imgW, imgH, fontSize, mt = '-4px', category, hideProvider = false } = props
  return (
    <HStack w="100%" mt={mt} lineHeight="20px" gap="6px" userSelect="none">
      {!hideProvider && (
        <Text fontSize={fontSize || '12px'} color="text_paragraph" whiteSpace="nowrap">
          Provider
        </Text>
      )}
      <Image
        decoding="async"
        src={category === 'cetus' ? '/images/cetus-logo@2x.png' : '/images/haedal-logo@2x.png'}
        w={imgW || '16px'}
        h={imgH || '16px'}
      />

      <Text fontSize={fontSize || '12px'} color="text_paragraph" whiteSpace="nowrap">
        {category === 'cetus' ? 'Cetus' : 'Haedal'} Protocol
      </Text>
    </HStack>
  )
}
export default PoweredByHaedal
