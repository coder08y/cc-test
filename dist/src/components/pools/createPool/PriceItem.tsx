import { Text, VStack } from '@chakra-ui/react'
function PriceItem({ title, price, perText }: { title: string; price: string; perText: string }) {
  return (
    <VStack flex="1">
      <Text>{title}</Text>
      <Text color="text_caption">{price}</Text>
      <Text>{perText?.replace('/', ' per ')}</Text>
    </VStack>
  )
}

export default PriceItem
