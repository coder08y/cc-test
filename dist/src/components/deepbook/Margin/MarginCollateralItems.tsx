import { SingleCoinImage } from '@cetus/ui-kit'
import { formatNumber, formatUSDPrice } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'

export interface CollateralItem {
  label?: string
  balance: string
  balanceUSD: string
  iconUrl?: string
  symbol: string
  decimals?: number
}

interface MarginCollateralItemsProps {
  items: CollateralItem[]
  showLabels?: boolean // 是否显示 label（如 "Collateral 1", "Collateral 2"）
}

export default function MarginCollateralItems({ items, showLabels = true }: MarginCollateralItemsProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <VStack gap="4px" alignItems="flex-start" w="100%">
      {items.map((item, index) => (
        <VStack w="100%" key={item.symbol || index} gap="4px" alignItems="flex-start">
          <HStack minW="185px" bg="bg_primary" p="8px" rounded="6px" w="100%" justifyContent="space-between" alignItems="center">
            <HStack gap="4px">
              {item.iconUrl && <SingleCoinImage imageUrl={item.iconUrl} w="20px" h="20px" />}
              <Text fontSize="12px" lineHeight="16px">
                {item.symbol}
              </Text>
            </HStack>
            <HStack gap="2px">
              <Text fontSize="12px" lineHeight="16px" color="text_caption">
                {formatNumber(item.balance, item.decimals || 6)}
              </Text>
              <Text fontSize="12px" lineHeight="16px" color="text_paragraph">
                (${formatUSDPrice(item.balanceUSD, true)})
              </Text>
            </HStack>
          </HStack>
        </VStack>
      ))}
    </VStack>
  )
}
