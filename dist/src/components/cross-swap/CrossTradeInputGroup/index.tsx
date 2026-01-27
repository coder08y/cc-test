import { CrossTradeInputGroupProps } from '@/types/cross_swap'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Center, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import CrossTradeInput from '../CrossTradeInput'

export default function CrossTradeInputGroup(props: CrossTradeInputGroupProps) {
  const { wrapStyle, from, to, onClick } = props
  const { isApp } = useWindowWidth()
  const [tradeIcon, setTradeIcon] = useState('#icon-a-icon_trade')
  const onTradeIconMouseEnter = () => {
    setTradeIcon('#icon-icon_swap1')
  }

  const onTradeIconMouseLeave = () => {
    setTradeIcon('#icon-a-icon_trade')
  }

  return (
    <VStack gap="8px" w="100%" position="relative" {...wrapStyle}>
      <CrossTradeInput {...from} />
      <CrossTradeInput {...to} />
      <Center
        zIndex={999}
        w="36px"
        h="36px"
        borderRadius="50%"
        position="absolute"
        top={'calc(50% - 18px)'}
        left="calc(50% - 18px)"
        border="1px solid"
        borderColor="token_inactive_border"
        boxShadow={'trade_icon_shadow'}
        bg={'input_bg'}
        onClick={onClick}
        onMouseEnter={isApp ? () => {} : onTradeIconMouseEnter}
        onMouseLeave={isApp ? () => {} : onTradeIconMouseLeave}
        sx={{
          _hover: isApp
            ? {}
            : {
                cursor: 'pointer',
                borderColor: 'token_active_border',
                boxShadow: '0px 0px 6px 0px #0067AD'
              }
        }}
      >
        <Icon
          fontSize={tradeIcon === '#icon-a-icon_trade' ? '12px' : '16px'}
          xlinkHref={tradeIcon}
          svgFill="text_caption"
          transform={tradeIcon === '#icon-a-icon_trade' ? '' : 'rotate(90deg)'}
        />
      </Center>
    </VStack>
  )
}
