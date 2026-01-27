import { formatPercentage } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'

export default function PerformanceChartTooltip({ payload, label, labelList }: any) {
  if (payload.length === 0 || !payload[0].payload) return null
  const data = payload[0].payload

  return (
    data && (
      <VStack
        padding="16px"
        bg="bg_secondary"
        borderRadius="12px"
        minW="220px"
        border="1px"
        gap="16px"
        borderStyle="solid"
        borderColor="border"
        justifyContent="flex-start"
        alignItems="left"
      >
        <Text mb="4px" fontSize="12px">
          {payload[0].payload.tooltipTime}
        </Text>
        {labelList
          .filter((item: any) => item.isShow)
          .map((item: any, index: number) => (
            <HStack key={item.label} justify="space-between" w="100%">
              <Text color={item.color} fontSize="12px">
                {item.label}
              </Text>
              {index === 0 && (
                <Text color={item.color} fontSize="12px">
                  {formatPercentage(data.hae_vault_strategy, 2)}
                </Text>
              )}
              {index === 1 && (
                <Text color={item.color} fontSize="12px">
                  {formatPercentage(data.token_pair, 2)}
                </Text>
              )}
              {index === 2 && (
                <Text color={item.color} fontSize="12px">
                  {formatPercentage(data.token_a, 2)}
                </Text>
              )}
              {index === 3 && (
                <Text color={item.color} fontSize="12px">
                  {formatPercentage(data.token_b, 2)}
                </Text>
              )}
            </HStack>
          ))}
      </VStack>
    )
  )
}
