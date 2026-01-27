import { Box, HStack, Text } from '@chakra-ui/react'

const LeftColor = '#00D8B6'
const RightColor = '#4A9AEF'

export default function DlmmLegend({ baseSymbol, quoteSymbol }: { baseSymbol: string; quoteSymbol: string }) {
  return (
    <HStack gap="12px">
      <LegendBlock symbol={baseSymbol} color={RightColor} />
      <LegendBlock symbol={quoteSymbol} color={LeftColor} />
    </HStack>
  )
}

function LegendBlock({ symbol, color }: { symbol: string; color: string }) {
  return (
    <HStack gap="8px">
      <Box w="8px" h="8px" bg={color} borderRadius="2px" />
      <Text fontSize="12px">{symbol}</Text>
    </HStack>
  )
}
