import { Token } from '@cetus/types'
import { formatNumberWithDown, textEllipses } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import TokenAmountItem from '../common/TokenAmountItem'

export default function TokenAmountAndAfter({
  isBase = true,
  token,
  amount,
  afterAmount,
  isLoading
}: {
  isBase?: boolean
  token: Token
  amount: string
  afterAmount: string
  isLoading?: boolean
}) {
  return (
    <VStack align={{ base: 'flex-end', lg: 'flex-start' }} gap={{ base: '12px', lg: '12px' }} w={{ base: '100%', lg: 'calc(50% - 4px)' }}>
      <HStack w="100%" justifyContent="space-between" alignItems="flex-start" flexDirection={{ base: 'row', lg: 'column' }} gap="12px">
        <TokenAmountItem token={token} amount={amount} />
      </HStack>
      {afterAmount !== '' && afterAmount && (
        <HStack
          background="linear-gradient(270deg, rgba(117,200,255,0.1) 0%, rgba(117,200,255,0) 100%)"
          p="4px 12px 4px 0px"
          h="28px"
          align="center"
          borderRadius="0px 14px 14px 0px"
        >
          <Text color="primary" fontSize="16px">
            After
          </Text>
          <Box width="1px" height="12px" bg="primary_opacity.50" />
          <Text color="primary">{formatNumberWithDown(afterAmount)}</Text>
          <Text color="primary" fontSize={{ base: '14px', lg: '16px' }}>
            {textEllipses(token?.symbol)}
          </Text>
        </HStack>
      )}
    </VStack>
  )
}
