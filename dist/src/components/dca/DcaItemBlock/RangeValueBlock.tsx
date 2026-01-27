import useTokenRank from '@/hooks/common/useTokenRank'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble, textEllipses } from '@cetus/utils'
import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

function RangeValueBlock({ orderInfo, isProfile = false, isRank = false }: { orderInfo: any; isRank?: boolean; isProfile?: boolean }) {
  const fontWeight = '400'
  const priceInfo = useMemo(() => {
    return {
      minPrice: orderInfo?.minPrice,
      maxPrice: orderInfo?.maxPrice,
      minPriceResever: orderInfo?.minPriceResever,
      maxPriceResever: orderInfo?.maxPriceResever
    }
  }, [orderInfo])

  const displayTokenA = useMemo(() => {
    return orderInfo?.outCoin
  }, [orderInfo])

  const displayTokenB = useMemo(() => {
    return orderInfo?.inCoin
  }, [orderInfo])

  const [isDirect, setIsDirect] = useState(true)

  const { getTokenRank } = useTokenRank()
  useEffect(() => {
    if (isRank) {
      const direct = getTokenRank(displayTokenA, displayTokenB)
      console.log('🚀 ~ useEffect ~ direct:', direct)
      setIsDirect(direct)
    }
  }, [isRank, displayTokenA?.coin_type, displayTokenB?.coin_type])
  const fontSize = isProfile ? '14px' : '12px'
  const color = isProfile ? 'text_paragraph' : 'primary_gray'
  return (
    <HStack mt={isProfile ? '0px' : '3px'} justify={isProfile ? 'flex-end' : 'flex-start'}>
      <Skeleton isLoaded={!!priceInfo?.minPrice && !!displayTokenA && !!displayTokenB}>
        <HStack flexWrap="wrap" gap="4px" justify="flex-start" align={isProfile ? 'flex-end' : 'center'} flexDirection={isProfile ? 'column' : 'row'}>
          <Text lineHeight="16px" h="16px" fontSize={fontSize} fontWeight={fontWeight} color="text_caption" whiteSpace="nowrap">
            {isDirect ? `${priceInfo?.minPrice} - ${priceInfo?.maxPrice}` : `${priceInfo?.minPriceResever} - ${priceInfo?.maxPriceResever}`}
          </Text>

          <HStack gap="4px">
            <HStack gap="0">
              <Text fontSize="12px" fontWeight={fontWeight} color={color}>
                {textEllipses(isDirect ? displayTokenB?.symbol : displayTokenA?.symbol, 10)}
              </Text>
              <Text fontSize="12px" fontWeight={fontWeight} color={color}>
                &nbsp;per&nbsp;
              </Text>
              <Text fontSize="12px" fontWeight={fontWeight} color={color}>
                {textEllipses(isDirect ? displayTokenA?.symbol : displayTokenB?.symbol, 10)}
              </Text>
            </HStack>
            <Icon
              xlinkHref="#icon-icon_swap1"
              w="14px"
              h="14px"
              onClick={(e: any) => {
                cancelBubble(e)
                setIsDirect(!isDirect)
              }}
            />
          </HStack>
        </HStack>
      </Skeleton>
    </HStack>
  )
}

export default RangeValueBlock
