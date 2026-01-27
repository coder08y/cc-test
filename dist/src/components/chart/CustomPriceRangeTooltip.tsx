import { d, formatNumber } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

export default function CustomPirceRangeTooltip({ payload, label, tokenA, tokenB }: any) {
  const lowerPriceSize = payload?.[0]?.payload && formatNumber(d(payload[0].payload.lower).div(payload[0].payload.real).sub(1).mul(100).toString(), 2)
  const upperPriceSize = payload?.[0]?.payload && formatNumber(d(payload[0].payload.upper).div(payload[0].payload.real).sub(1).mul(100).toString(), 2)

  const symbol = useMemo(() => {
    return tokenA?.symbol && tokenB?.symbol ? tokenB?.symbol + '/' + tokenA?.symbol : ''
  }, [tokenA?.symbol, tokenB?.symbol])

  return (
    payload &&
    payload.length && (
      <VStack
        padding="16px"
        bg="bg_secondary"
        borderRadius="12px"
        border="1px"
        borderStyle="solid"
        borderColor="border"
        justifyContent="flex-start"
        alignItems="left"
      >
        <Text fontSize="12px">{payload[0].payload.tooltipTime}</Text>
        <HStack textAlign="left">
          <Text color="#68FFD8" fontSize="12px">
            Pool Price
          </Text>
          <Text color="#68FFD8" fontSize="12px">
            {formatNumber(payload[0].payload.real)} {symbol}
          </Text>
        </HStack>
        <HStack alignItems="flex-start">
          <Text color="#6FBCF0" fontSize="12px">
            Price Range
          </Text>
          {/* <Text color="#6FBCF0" fontSize="12px">
            {formatNumber(payload[0].payload.lower)}-{formatNumber(payload[0].payload.upper)}
          </Text> */}
          <HStack gap="2px">
            <VStack gap="4px" bg="primary_opacity.10" p="4px" borderRadius="4px">
              <Text color="#6FBCF0" fontSize="12px">
                {formatNumber(payload[0].payload.lower)}
              </Text>
              <Text fontSize="12px" transform="scale(0.9)">
                ({lowerPriceSize}%)
              </Text>
            </VStack>
            <Text color="#6FBCF0" fontSize="12px">
              -
            </Text>
            <VStack gap="4px" bg="primary_opacity.10" p="4px" borderRadius="4px">
              <Text color="#6FBCF0" fontSize="12px">
                {formatNumber(payload[0].payload.upper)}
              </Text>
              <Text fontSize="12px" transform="scale(0.9)">
                ({upperPriceSize}%)
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </VStack>
    )
  )
}
