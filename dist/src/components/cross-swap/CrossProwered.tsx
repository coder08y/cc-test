import { HStack, Image, Text } from '@chakra-ui/react'

export default function CrossProwered({ crossPlatform }: { crossPlatform: string }) {
  return (
    <HStack mt="8px" gap="4px">
      <Text>Powered by</Text>
      <Image src={crossPlatform == 'li.fi' ? '/images/lifi.png' : '/images/mayan.png'} w="20px" h="20px" />
      <Text color="text_caption" fontWeight="400">
        {crossPlatform == 'li.fi' ? 'LI.FI' : 'Mayan'}
      </Text>
    </HStack>
  )
}
