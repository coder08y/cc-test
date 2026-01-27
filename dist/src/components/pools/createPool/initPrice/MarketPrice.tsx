import { CetusTooltip } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { d, formatPercentage, formatPrice } from '@cetus/utils'
import { Center, HStack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import UseMarketPrice from './UseMarketPrice'

type MarketPriceProps = {
  inputPrice?: string
  marketPrice: string
  perText: string
  onClick: () => void
}

function MarketPrice({ inputPrice, marketPrice, perText, onClick }: MarketPriceProps) {
  const deviationRatio = useMemo(() => {
    return inputPrice && marketPrice && d(inputPrice).gt(0) ? d(inputPrice).sub(marketPrice).div(marketPrice).toString() : '0'
  }, [inputPrice, marketPrice])

  const showDeviation = useMemo(() => {
    return d(deviationRatio).gt(0.0001) || d(deviationRatio).lt(-0.0001)
  }, [deviationRatio])

  const deviationPercentage = useMemo(() => {
    return showDeviation ? (d(deviationRatio).gt(100) ? '> 10,000%' : formatPercentage(d(deviationRatio).mul(100).toString(), 2)) : ''
  }, [deviationRatio, showDeviation])

  return (
    <HStack p="4px 0" w="100%" justify="space-between" flexWrap="wrap">
      <HStack flexWrap="wrap">
        <HStack gap="4px">
          {showDeviation && (
            <HStack gap="4px">
              <Text color="primary_yellow" fontSize="12px">
                {['>', '-'].some(item => deviationPercentage.startsWith(item)) ? deviationPercentage : '+' + deviationPercentage}
              </Text>
              <Text fontSize="12px" color="text_paragraph">
                from
              </Text>
            </HStack>
          )}
          <Text fontSize="12px" color="text_paragraph" whiteSpace="nowrap">
            Market Price
          </Text>
        </HStack>
        <Text color="text_caption" fontSize="12px" whiteSpace="nowrap">
          {formatPrice(marketPrice)} {perText}
        </Text>

        <CetusTooltip tooltip={<Text fontSize="12px">Market Price Source: Pyth Network</Text>}>
          <Center>
            <Icon xlinkHref="#icon-icon_tips" fontSize="18px" />
          </Center>
        </CetusTooltip>
      </HStack>
      <UseMarketPrice onClick={onClick} />
    </HStack>
  )
}

export default MarketPrice
