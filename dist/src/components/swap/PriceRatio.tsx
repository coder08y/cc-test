import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import { SwapRouterData } from '@/types'
import { CurrentPrice } from '@cetus/design'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import PriceImpact from './PriceImpact'

type PriceRatioProps = {
  fromCoin?: Token
  toCoin?: Token
  routerData?: SwapRouterData
  findRouterLoading: boolean
  isWidget?: boolean
  bg?: string
}

function PriceRatio(props: PriceRatioProps) {
  const { fromCoin, toCoin, findRouterLoading, isWidget = false, routerData, bg = 'primary_opacity.10' } = props

  const { marketPrice, priceImpact, sources, priceImpactTextInfo, showIncalculable } = usePriceImpact(
    fromCoin,
    toCoin,
    routerData?.fromAmountUi,
    routerData?.toAmountUi
  )
  return (
    <VStack w="100%" p="8px" gap="8px" bg={bg} borderRadius="12px" align="flex-start">
      <CurrentPrice
        fromToken={fromCoin as Token}
        toToken={toCoin as Token}
        fromValue={routerData?.fromAmountUi}
        toValue={routerData?.toAmountUi}
        isLoading={findRouterLoading}
        color="text_caption"
        fontSize={isWidget ? '12px' : '14px'}
      />

      {!showIncalculable && d(priceImpact).lte(-30) && (
        <HStack w="100%" justify="flex-start">
          <Icon xlinkHref="#icon-warning" svgFill="primary_red" svgHover="primary_red" fontSize="16px" />
          <Text color="primary_red" fontSize="12px" lineHeight="20px" fontWeight="500">
            High price difference. Be cautious before submitting your order.
          </Text>
        </HStack>
      )}

      <PriceImpact
        fromToken={fromCoin as Token}
        isWidget={isWidget}
        toToken={toCoin as Token}
        marketPrice={marketPrice}
        priceImpact={priceImpactTextInfo}
        isLoading={findRouterLoading}
        sources={sources}
        showIncalculable={showIncalculable}
      />
    </VStack>
  )
}

export default PriceRatio
