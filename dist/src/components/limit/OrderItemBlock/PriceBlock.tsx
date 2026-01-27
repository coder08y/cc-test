import useTokenRank from '@/hooks/common/useTokenRank'
import { LimitOrderInfo } from '@/types/limit'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble, formatNumber } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export const PriceBlock = ({ info, isProfile = false }: { info: LimitOrderInfo; isProfile?: boolean }) => {
  const [priceDirect, setPriceDirect] = useState<boolean>(true)
  const { getTokenRank } = useTokenRank()
  useEffect(() => {
    const direct = getTokenRank(info?.pay_coin, info?.target_coin)
    console.log('🚀 ~ useEffect PriceBlock ~ direct:', direct)
    setPriceDirect(direct)
  }, [info?.pay_coin, info?.target_coin])
  const { pay_coin, target_coin, price, reseverPrice } = info
  const fontSize = isProfile ? '12px' : '14px'
  return (
    <VStack flexDirection={isProfile ? 'column' : 'row'} justify="flex-end" align={isProfile ? 'flex-end' : 'center'} gap={isProfile ? '0px' : '8px'}>
      {isProfile &&
        (priceDirect ? (
          <Text color="text_caption" lineHeight="16px" h="16px">
            {formatNumber(price)}
          </Text>
        ) : (
          <Text color="text_caption" lineHeight="16px" h="16px">
            {formatNumber(reseverPrice)}
          </Text>
        ))}
      <HStack justifyContent="end">
        {priceDirect ? (
          <HStack flexWrap="wrap" justify="flex-end">
            {!isProfile && (
              <Text color="text_caption" lineHeight="1">
                {formatNumber(price)}
              </Text>
            )}
            <Text fontSize={fontSize} color={isProfile ? 'text_paragraph' : 'text_caption'} whiteSpace="nowrap" lineHeight="1">
              {target_coin?.symbol} per {pay_coin?.symbol}
            </Text>
          </HStack>
        ) : (
          <HStack flexWrap="wrap" justify="flex-end">
            {!isProfile && <Text color="text_caption">{formatNumber(reseverPrice)}</Text>}
            <Text fontSize={fontSize} color={isProfile ? 'text_paragraph' : 'text_caption'} whiteSpace="nowrap" lineHeight="1">
              {pay_coin?.symbol} per {target_coin?.symbol}
            </Text>
          </HStack>
        )}
        <Icon
          xlinkHref="#icon-icon_swap1"
          svgW="14px"
          svgH="14px"
          ml="-6px"
          onClick={e => {
            cancelBubble(e)
            setPriceDirect(!priceDirect)
          }}
        />
      </HStack>
    </VStack>
  )
}
