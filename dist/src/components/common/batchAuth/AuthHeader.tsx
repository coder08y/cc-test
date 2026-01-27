import { Text, VStack } from '@chakra-ui/react'

type AuthHeaderProps = {
  status: 'pending' | 'success' | 'failed'
  title: string
}

export function AuthHeader(props: AuthHeaderProps) {
  const { status, title } = props

  return (
    <VStack gap="8px">
      {status === 'pending' && (
        <Text color="text_caption" fontSize="16px">
          Confirm Transactions
        </Text>
      )}

      {status === 'success' && (
        <Text color="text_caption" fontSize="16px">
          Transactions Completed
        </Text>
      )}

      {status === 'failed' && (
        <Text color="primary_red" fontSize="16px">
          Transactions Failed
        </Text>
      )}

      <Text fontSize="14px">{title}</Text>
    </VStack>
  )
}
