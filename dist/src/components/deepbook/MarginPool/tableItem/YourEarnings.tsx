import { Text, VStack } from '@chakra-ui/react'

export default function YourEarnings({ item }: { item: any }) {
  return (
    <VStack gap="4px" align="flex-end">
      <Text color="text_caption" lineHeight="14px">
        {item?.displayUnsettledEarning} {item?.tokenInfo?.symbol}
      </Text>
      <Text fontSize="12px" lineHeight="12px" color="primary_gray">
        {item?.displayUnsettledValue}
      </Text>
    </VStack>
  )
}
