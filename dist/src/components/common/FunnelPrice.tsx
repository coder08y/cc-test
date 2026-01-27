import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Box, HStack, Skeleton, Text } from '@chakra-ui/react'
import CurrentPoolPriceLabel from './CurrentPoolPriceLabel'

type FunnelPriceProps = {
  label?: string
  price?: string
  perText?: string
  showIcon?: boolean
  showPriceTooltip?: boolean
}

function FunnelPrice({ label = 'Current Pool Price', price, perText, showIcon = true, showPriceTooltip = false }: FunnelPriceProps) {
  const { isApp } = useWindowWidth()
  return (
    <HStack gap="4px">
      {showIcon && (
        <Box p="2px" borderRadius="4px" bg="white_color_opacity.10" mr="4px">
          <Icon xlinkHref="#icon-funnel" svgFill="text_caption" fontSize={isApp ? '12px' : '16px'} />
        </Box>
      )}

      {showPriceTooltip ? <CurrentPoolPriceLabel label={label} /> : <Text fontSize={isApp ? '12px' : '14px'}>{label}</Text>}
      {price && (
        <>
          <Text color="text_caption" fontSize={isApp ? '12px' : '14px'}>
            {price}
          </Text>
          <Text fontSize={isApp ? '12px' : '14px'}>{perText}</Text>
        </>
      )}
      {!price && <Skeleton w="66px" h="14px" display="inline-block" />}
    </HStack>
  )
}

export default FunnelPrice
