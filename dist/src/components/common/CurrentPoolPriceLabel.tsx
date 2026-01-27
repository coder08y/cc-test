import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'

function CurrentPoolPriceLabel({ label = 'Current Pool Price' }: { label?: string }) {
  const { isApp } = useWindowWidth()
  return (
    <CetusTooltip
      tooltip={
        <Text lineHeight="20px" fontSize="12px">
          Current price within the pool may differ from market price. Verify with the market rate before providing liquidity to reduce arbitrage risk
        </Text>
      }
    >
      <HStack
        gap="2px"
        cursor="pointer"
        _hover={{
          p: {
            color: 'text_caption'
          },
          svg: {
            fill: 'text_caption'
          }
        }}
      >
        <Text fontSize={isApp ? '12px' : '14px'} whiteSpace="nowrap">
          {label}
        </Text>
        <Icon fontSize={isApp ? '16px' : '18px'} xlinkHref="#icon-icon_tips" />
      </HStack>
    </CetusTooltip>
  )
}

export default CurrentPoolPriceLabel
