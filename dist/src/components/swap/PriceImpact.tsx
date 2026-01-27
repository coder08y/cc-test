import { CetusTooltip, CurrentPrice, MarketSource, MarketType } from '@cetus/design'
import { MarketSourceMap } from '@cetus/design/src/components/common/MarketSource'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { Center, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'

type PriceImpactProps = {
  fromToken: Token
  toToken: Token
  marketPrice?: string
  priceImpact?: {
    priceImpactText?: string
    textColor: string
  }
  isLoading?: boolean
  isWidget?: boolean
  sources: string[]
  showIncalculable: boolean
}

export default function PriceImpact(props: PriceImpactProps) {
  const { showIncalculable, fromToken, toToken, marketPrice, priceImpact, sources = [], isWidget = false, isLoading } = props

  return (
    <HStack justify="space-between" w="100%" gap="4px" flexWrap="wrap">
      <HStack w="132px" alignItems="end" gap="4px">
        <Text whiteSpace="nowrap" fontSize={isWidget ? '12px' : '14px'} h="20px" lineHeight="20px" fontWeight="500">
          Price Difference
        </Text>

        <CetusTooltip
          tooltip={
            <PriceImpactTips
              marketPrice={marketPrice}
              sources={sources}
              fromToken={fromToken}
              toToken={toToken}
              showIncalculable={showIncalculable}
            />
          }
        >
          <Center>
            <Icon xlinkHref="#icon-icon_tips" svgW="20px" svgH="20px" />
          </Center>
        </CetusTooltip>
      </HStack>
      <Skeleton isLoaded={!isLoading} h="20px">
        <HStack justify="flex-end" h="20px">
          <Text
            maxW={isWidget ? `calc(90vw - 56px - ${24 * (sources?.length || 0)}px)` : `unset`}
            flex="1"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            color={priceImpact?.textColor}
            fontWeight="500"
            fontSize={isWidget ? '12px' : '14px'}
          >
            {priceImpact?.priceImpactText}
          </Text>
          {!showIncalculable &&
            sources?.map(source => {
              return source === 'LI.FI' ? null : <MarketSource key={source} market={source as MarketType} />
            })}
        </HStack>
      </Skeleton>
    </HStack>
  )
}

type PriceImpactTipsProps = {
  fromToken: Token
  toToken: Token
  marketPrice?: string
  sources: string[]
  showIncalculable: boolean
}

export function PriceImpactTips(props: PriceImpactTipsProps) {
  const { marketPrice, sources, fromToken, toToken, showIncalculable } = props
  return (
    <VStack className="no-close-widget-flag" w="100%" align="flex-start" gap="12px">
      <Text color="content_text" fontSize="12px" lineHeight="20px" textAlign="start">
        The difference between the market price and estimated price due to trade size.
      </Text>
      {!showIncalculable && (
        <VStack w="100%" align="flex-start">
          <Text fontSize="12px" color="text_caption">
            Market price sources:
          </Text>
          {marketPrice ? (
            <CurrentPrice fontSize="12px" fromToken={fromToken!} toToken={toToken!} fromValue="1" toValue={marketPrice} color="text_caption" />
          ) : (
            <Text color="primary_yellow" fontSize="12px">
              Price is unknown
            </Text>
          )}
        </VStack>
      )}

      {marketPrice && !showIncalculable && (
        <HStack w="100%">
          <Text color="content_text" fontSize="12px" mt="5px" whiteSpace="pre">
            Market price sources:
          </Text>
          <Text color="content_text" fontSize="12px" mt="5px" whiteSpace="pre">
            {sources.map(item => MarketSourceMap[item] + '  ')}
          </Text>
        </HStack>
      )}
    </VStack>
  )
}
