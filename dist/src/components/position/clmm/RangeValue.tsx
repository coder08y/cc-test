import useTokenRank from '@/hooks/common/useTokenRank'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble, textEllipses } from '@cetus/utils'
import { HStack, Skeleton, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

function RangeValue({
  priceInfo,
  displayTokenA,
  displayTokenB,
  fontSize = '12px',
  fontWeight = '400',
  color = 'primary_gray',
  isRank = false,
  justify = 'flex-start',
  symbolEllipsesDecimals = 10, //symbol超出多少位数后是否展示...
  setPriceDirect
}: {
  priceInfo: { minPrice: string; maxPrice: string; minPriceResever: string; maxPriceResever: string }
  displayTokenA: Token
  displayTokenB: Token
  fontSize?: string
  fontWeight?: string
  color?: string
  isRank?: boolean
  justify?: string
  symbolEllipsesDecimals?: number
  setPriceDirect?: (status: boolean) => void
}) {
  const [isDirect, setIsDirect] = useState(true)

  const { getTokenRank } = useTokenRank()
  useEffect(() => {
    if (isRank) {
      const direct = getTokenRank(displayTokenA, displayTokenB)
      console.log('🚀 ~ useEffect ~ direct:', direct)
      setIsDirect(direct)
    }
  }, [isRank, displayTokenA?.coin_type, displayTokenB?.coin_type])

  return (
    <HStack mt="3px">
      <Skeleton isLoaded={!!priceInfo?.minPrice && !!displayTokenA && !!displayTokenB}>
        <HStack>
          <HStack flexWrap="wrap" gap="4px" justify={justify}>
            <Text lineHeight="1" fontSize={fontSize} fontWeight={fontWeight} color="text_caption" wordBreak="break-all">
              {isDirect ? `${priceInfo?.minPrice} - ${priceInfo?.maxPrice}` : `${priceInfo?.minPriceResever} - ${priceInfo?.maxPriceResever}`}
            </Text>

            <HStack gap="0">
              <Text fontSize={fontSize} fontWeight={fontWeight} color={color}>
                {textEllipses(isDirect ? displayTokenB?.symbol : displayTokenA?.symbol, symbolEllipsesDecimals)}
              </Text>
              <Text fontSize={fontSize} fontWeight={fontWeight} color={color}>
                &nbsp;per&nbsp;
              </Text>
              <Text fontSize={fontSize} fontWeight={fontWeight} color={color}>
                {textEllipses(isDirect ? displayTokenA?.symbol : displayTokenB?.symbol, symbolEllipsesDecimals)}
              </Text>
            </HStack>
          </HStack>

          <Icon
            xlinkHref="#icon-icon_swap1"
            w="16px"
            h="16px"
            onClick={(e: any) => {
              cancelBubble(e)
              setIsDirect(!isDirect)
              setPriceDirect?.(!isDirect)
            }}
          />
        </HStack>
      </Skeleton>
    </HStack>
  )
}

export default RangeValue
