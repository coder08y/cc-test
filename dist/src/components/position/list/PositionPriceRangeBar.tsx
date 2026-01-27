import { removeComma } from '@cetus/utils/src/common'
import { d } from '@cetusprotocol/common-sdk'
import { Box, BoxProps, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface Props {
  minPrice: string
  maxPrice: string
  currPrice: string
  isActive: boolean
  wrapStyle?: BoxProps
  isShowActive?: boolean
  priceDirect?: boolean
}
export default function PositionPriceBar({ minPrice, maxPrice, currPrice, isActive, wrapStyle, isShowActive = false, priceDirect = true }: Props) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [elementWidth, setElementWidth] = useState<number>(0)

  useEffect(() => {
    const updateWidths = () => {
      if (elementRef.current) setElementWidth(elementRef.current.offsetWidth)
    }
    const resizeObserver = new ResizeObserver(updateWidths)
    if (elementRef.current) resizeObserver.observe(elementRef.current)
    return () => {
      if (elementRef.current) resizeObserver.unobserve(elementRef.current)
    }
  }, [minPrice, maxPrice, currPrice])

  const displayMinPrice = useMemo(() => {
    return priceDirect ? minPrice : maxPrice == '∞' ? '∞' : d(1).div(removeComma(maxPrice)).toString()
  }, [priceDirect, minPrice, maxPrice])

  const displayMaxPrice = useMemo(() => {
    return priceDirect ? maxPrice : d(1).div(removeComma(minPrice)).toString()
  }, [priceDirect, minPrice, maxPrice])

  const displayCurrPrice = useMemo(() => {
    return priceDirect ? currPrice : d(1).div(removeComma(currPrice)).toString()
  }, [currPrice, priceDirect])

  const isInfinityRange = useMemo(() => {
    return displayMaxPrice === '∞' || displayMinPrice === '∞'
  }, [displayMaxPrice, displayMinPrice])

  const sliderML = useMemo(() => {
    if (isInfinityRange) return '0px'
    if (displayCurrPrice && displayMinPrice && displayMaxPrice && elementWidth) {
      if (d(displayCurrPrice).lessThanOrEqualTo(displayMaxPrice) && d(displayCurrPrice).greaterThanOrEqualTo(displayMinPrice)) {
        const relative = d(displayCurrPrice).sub(displayMinPrice).div(d(displayMaxPrice).sub(displayMinPrice)).toString()
        return `${d(elementWidth).mul(relative).toFixed(0)}px`
      }
      if (d(displayCurrPrice).lt(displayMinPrice)) return '-6px'
      if (d(displayCurrPrice).gt(displayMaxPrice)) return 'calc(100% + 6px)'
    }
    return '0px'
  }, [displayCurrPrice, displayMinPrice, displayMaxPrice, elementWidth, isInfinityRange])

  return (
    <VStack height="100%" justifyContent="space-between" {...wrapStyle}>
      <Skeleton h="6px" isLoaded={!!currPrice} borderRadius="4px">
        <Box w="88px" h="6px" bgImage={isInfinityRange ? 'none' : "url('/images/img_inactive_bg@2x.png')"} bgSize="88px 6px" {...wrapStyle}>
          <Box
            w={isInfinityRange ? '88px' : '56px'}
            h={isInfinityRange ? '2px' : '6px'}
            position="relative"
            ref={elementRef}
            background={isInfinityRange ? 'linear-gradient(135deg, #68FFD8 0%, #0091FF 100%)' : isActive ? "url('/images/img_range@2x.png')" : 'none'}
            ml={isInfinityRange ? '0px' : '16px'}
            bgSize="100% 6px"
            bgPosition="center"
            bgRepeat="no-repeat"
          >
            {!isInfinityRange && (
              <Box
                w="2px"
                h="8px"
                bg="#fff"
                borderRadius="8px"
                position="absolute"
                top="50%"
                left={sliderML}
                transform="translateY(-50%)"
                zIndex="5"
              />
            )}
          </Box>
        </Box>
      </Skeleton>
      {isShowActive && (
        <Text fontSize="12px" color={isActive ? 'primary' : 'primary_gray'} fontWeight="500">
          {isActive ? 'Active' : 'Inactive'}
        </Text>
      )}
    </VStack>
  )
}
