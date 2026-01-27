import { HStack, StackProps, Text } from '@chakra-ui/react'

export default function RouterStatus({ tag, wrapStyle }: { tag?: string; wrapStyle: StackProps }) {
  return (
    tag && (
      <HStack w="100%" height="100%" {...wrapStyle}>
        <Text color="primary" fontSize="12px">
          {tag}
        </Text>
      </HStack>
    )
  )
}
