import PriceImpact from '@/components/swap/PriceImpact'
import { useCrossPriceImpact } from '@/hooks/cross-swap/useCrossPriceImpact'
import { CurrentPrice } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { CrossSwapPlatform, CrossSwapQuote } from '@cetusprotocol/cross-swap-sdk'
import { HStack, Text, VStack } from '@chakra-ui/react'

type PriceRatioProps = {
  platform: CrossSwapPlatform
  findRouterLoading: boolean
  quote?: CrossSwapQuote
  bg?: string
}

function CrossPriceRatio(props: PriceRatioProps) {
  const { platform, findRouterLoading, quote, bg = 'primary_opacity.10' } = props
  const { marketPrice, priceImpact, sources, priceImpactTextInfo, showIncalculable } = useCrossPriceImpact(
    platform,
    quote?.from_token,
    quote?.to_token,
    quote?.amount_in_formatted,
    quote?.amount_out_formatted
  )

  return (
    <VStack w="100%" p="8px" gap="8px" bg={bg} borderRadius="12px" align="flex-start">
      <CurrentPrice
        fromToken={quote?.from_token as any}
        toToken={quote?.to_token as any}
        fromValue={quote?.amount_in_formatted}
        toValue={quote?.amount_out_formatted}
        isLoading={findRouterLoading}
        color="text_caption"
        fontSize={'14px'}
      />

      {!showIncalculable && d(priceImpact).lte(-30) && !findRouterLoading && (
        <HStack w="100%" justify="flex-start">
          <Icon xlinkHref="#icon-warning" svgFill="primary_red" svgHover="primary_red" fontSize="16px" />
          <Text color="primary_red" fontSize="12px" lineHeight="20px" fontWeight="500">
            High price difference. Be cautious before submitting your order.
          </Text>
        </HStack>
      )}

      <PriceImpact
        fromToken={quote?.from_token as any}
        toToken={quote?.to_token as any}
        isWidget={false}
        marketPrice={marketPrice}
        priceImpact={priceImpactTextInfo}
        isLoading={findRouterLoading}
        sources={sources}
        showIncalculable={showIncalculable}
      />
    </VStack>
  )
}

export default CrossPriceRatio
