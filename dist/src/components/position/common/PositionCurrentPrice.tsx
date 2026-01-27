import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import { TooltipIcon } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble, formatSmallPrice, removeComma, textEllipses } from '@cetus/utils'
import { Center, HStack, Skeleton, StackProps, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

function PositionCurrentPrice({
  posId,
  displayTokenA,
  displayTokenB,
  symbolEllipsesDecimals = 6, //symbol超出位数后是否展示...
  handleDirect,
  isChangeDirect = undefined,
  haveChangeIcon = true,
  tooltip,
  iconStyle = {
    w: { base: '20px', lg: '32px' },
    h: { base: '20px', lg: '32px' }
  },
  wrapStyle = {
    mr: { base: '0px', lg: '4px' },
    w: 'unset',
    justify: 'flex-start',
    flexWrap: { base: 'wrap', lg: 'nowrap' }
  }
}: {
  posId: string
  displayTokenA: Token
  displayTokenB: Token
  symbolEllipsesDecimals?: number
  tooltip?: string
  haveChangeIcon?: boolean
  isChangeDirect?: boolean
  handleDirect?: () => void
  wrapStyle?: StackProps
  iconStyle: any
}) {
  const [isDirect, setIsDirect] = useState(true)
  const { posPoolsRelatedData } = usePositionStore()
  const { dlmmPosPoolsRelatedData } = useDlmmPositionStore()
  const currentPosPoolsRelatedData = posPoolsRelatedData[posId] || dlmmPosPoolsRelatedData[posId]
  const { isApp } = useWindowWidth()

  useEffect(() => {
    console.log('🚀 ~ PositionCurrentPrice ~ isChangeDirect:', isChangeDirect)
    if (typeof isChangeDirect == 'boolean') {
      setIsDirect(isChangeDirect)
    } else {
      setIsDirect(true)
    }
  }, [isChangeDirect])
  return (
    <HStack {...wrapStyle}>
      <HStack gap="2px" flexWrap="nowrap">
        <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }} whiteSpace="nowrap">
          Current Pool Price
        </Text>
        {tooltip && <TooltipIcon tooltipCon={tooltip} />}
      </HStack>
      <HStack
        gap="8px"
        cursor={haveChangeIcon ? 'pointer' : 'default'}
        onClick={(e: any) => {
          cancelBubble(e)
          if (haveChangeIcon) {
            setIsDirect(!isDirect)
            if (handleDirect) {
              handleDirect()
            }
          }
        }}
        sx={{
          '&:hover .swap_icon svg ': {
            fill: 'text_caption'
          }
        }}
      >
        <Skeleton isLoaded={!!currentPosPoolsRelatedData?.currentPrice}>
          <Text
            color="text_caption"
            maxW="200px"
            wordBreak="break-all"
            whiteSpace="nowrap"
            fontSize={{ base: '12px', lg: '14px' }}
            lineHeight={{ base: '16px', lg: '20px' }}
          >
            {isDirect
              ? formatSmallPrice(removeComma(currentPosPoolsRelatedData?.currentPrice))
              : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.currentPriceReverse))}
          </Text>
        </Skeleton>
        <HStack gap="0">
          {currentPosPoolsRelatedData?.currentPrice && (
            <HStack gap="0" flexWrap="nowrap">
              <Text color="primary_gray" whiteSpace="nowrap" fontSize={{ base: '12px', lg: '14px' }}>
                {textEllipses(isDirect ? displayTokenB?.symbol : displayTokenA?.symbol, symbolEllipsesDecimals)}
              </Text>
              <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
                /
              </Text>
              <Text color="primary_gray" whiteSpace="nowrap" fontSize={{ base: '12px', lg: '14px' }}>
                {textEllipses(isDirect ? displayTokenA?.symbol : displayTokenB?.symbol, symbolEllipsesDecimals)}
              </Text>
            </HStack>
          )}
          {haveChangeIcon && (
            <Center {...iconStyle}>
              <Icon className="swap_icon" xlinkHref="#icon-icon_swap1" fontSize={isApp ? '14px' : '16px'} />
            </Center>
          )}
        </HStack>
      </HStack>
    </HStack>
  )
}

export default PositionCurrentPrice
