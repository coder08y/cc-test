import { TooltipIcon } from '@cetus/design'
import { HStack, Image, Text } from '@chakra-ui/react'
import { FC } from 'react'

interface RfqLogoTitleProps {
  title?: string
  marginTop?: string
  showTooltipIcon?: boolean
  bg_color?: string
  tx_bg_color?: string
  font_size?: string
}

export const RfqLogoTitle: FC<RfqLogoTitleProps> = ({
  title = 'Cetus Tide',
  marginTop = '0px',
  showTooltipIcon = false,
  bg_color = 'transparent',
  tx_bg_color,
  font_size = '14px'
}) => {
  return (
    <HStack bg={bg_color} p="0px" pr="6px" borderRadius="12px">
      <TooltipIcon
        tooltipCon="Cetus Tide enables zero-slippage swaps through a unique RFQ model powered by pro market makers. It compares quotes with aggregator prices and pops up when offering a better rate."
        showTooltipIcon={showTooltipIcon}
        children={
          <HStack gap="4px" mt={marginTop} cursor="pointer" mr="5px">
            <Image src="/images/rfq_logo@2x.png" boxSize="24px" />
            <Text
              textColor="text_caption"
              fontSize={font_size}
              fontWeight="500"
              whiteSpace="nowrap"
              bgGradient={tx_bg_color}
              bgClip={tx_bg_color ? 'text' : 'transparent'}
            >
              {title}
            </Text>
          </HStack>
        }
      />
    </HStack>
  )
}
