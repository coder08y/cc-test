import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, formatNumberWithDown } from '@cetus/utils'
import { Box, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Skeleton, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

type VaultPositionRangeProps = {
  minPrice?: string
  maxPrice?: string
  currPrice?: string
}
function VaultPositionRange(props: VaultPositionRangeProps) {
  const { minPrice, maxPrice, currPrice } = props
  const [elementWidth, setElementWidth] = useState<number>(0)
  const [currPriceWidth, setCurrPriceWidth] = useState<number>(0)
  const elementRef = useRef<HTMLDivElement>(null)
  const currPriceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateWidths = () => {
      if (elementRef.current) setElementWidth(elementRef.current.offsetWidth)
      if (currPriceRef.current) setCurrPriceWidth(currPriceRef.current.offsetWidth)
    }

    const resizeObserver = new ResizeObserver(updateWidths)
    const priceResizeObserver = new ResizeObserver(updateWidths)

    if (elementRef.current) resizeObserver.observe(elementRef.current)
    if (currPriceRef.current) priceResizeObserver.observe(currPriceRef.current)

    return () => {
      if (elementRef.current) resizeObserver.unobserve(elementRef.current)
      if (currPriceRef.current) priceResizeObserver.unobserve(currPriceRef.current)
    }
  }, [minPrice, maxPrice, currPrice])

  const sliderML = useMemo(() => {
    if (maxPrice === '∞') return '0px'
    if (currPrice && minPrice && maxPrice && elementWidth) {
      if (d(currPrice).lessThanOrEqualTo(maxPrice) && d(currPrice).greaterThanOrEqualTo(minPrice)) {
        const relativePosition = d(currPrice)
          .sub(minPrice)
          .div(d(maxPrice).sub(d(minPrice)))
          .toString()
        return `${d(elementWidth).mul(relativePosition).toFixed(0)}px`
      }
      if (d(currPrice).lt(minPrice)) {
        return '-36px'
      }
      if (d(currPrice).gt(maxPrice)) {
        return 'calc(100% + 36px)'
      }
    }
    return '0px'
  }, [currPrice, minPrice, maxPrice, elementWidth])

  const priceLeft = useMemo(() => {
    const left = sliderML.replace('px', '')
    return Number(left) - currPriceWidth / 2 + 'px'
  }, [sliderML, currPriceWidth])

  const { isApp } = useWindowWidth()
  return (
    <>
      {minPrice !== undefined && maxPrice !== undefined && currPrice !== undefined ? (
        <HStack w="100%" height="60px" background="primary_opacity.10" borderRadius="16px" p="0px 0px 8px" key={sliderML}>
          <Box
            w="100%"
            padding={{
              base: minPrice && d(currPrice).lt(minPrice) ? '0 12px 0 18px' : maxPrice && d(currPrice).gt(maxPrice) ? '0 18px 0 12px' : '0 12px',
              lg: minPrice && d(currPrice).lt(minPrice) ? '0 40px 0 60px' : maxPrice && d(currPrice).gt(maxPrice) ? '0 60px 0 40px' : '0 40px'
            }}
            position="relative"
          >
            <Text
              whiteSpace="nowrap"
              position="absolute"
              top="20px"
              left={{ base: minPrice && d(currPrice).lt(minPrice) ? '18px' : '12px', lg: minPrice && d(currPrice).lt(minPrice) ? '60px' : '40px' }}
              fontSize="12px"
              color="text_caption"
            >
              {formatNumberWithDown(minPrice)}
            </Text>
            <Box
              w="100%"
              position="relative"
              height={{ base: '10px', lg: '14px' }}
              ref={elementRef}
              bgImage="url('/images/img_range@2x.png')"
              bgSize={{ base: '100% 10px', lg: '100% 14px' }}
              bgPosition="center"
            >
              <Popover isLazy placement="top" trigger={isApp ? 'click' : 'hover'} autoFocus={false} returnFocusOnClose={false} gutter={4}>
                <PopoverTrigger>
                  <Box as="button">
                    <Box
                      bg="#fff"
                      borderRadius="8px"
                      w="4px"
                      height={{ base: '10px', lg: '15px' }}
                      position="absolute"
                      top="50%"
                      transform="translateY(-50%)"
                      left={sliderML}
                      ml="-2px"
                      zIndex="5"
                    />
                  </Box>
                </PopoverTrigger>
                <PopoverContent
                  w="fit-content"
                  bg="none"
                  border="none"
                  ref={currPriceRef}
                  position="absolute"
                  top="-32px !important"
                  left={priceLeft}
                  zIndex="5"
                >
                  <PopoverBody fontSize="12px" w="fit-content" bg="none" border="none">
                    <Text whiteSpace="nowrap" fontSize="12px" color="primary">
                      {formatNumberWithDown(currPrice)}
                    </Text>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Box>
            <Text
              whiteSpace="nowrap"
              position="absolute"
              top="20px"
              right={{ base: maxPrice && d(currPrice).gt(maxPrice) ? '18px' : '12px', lg: maxPrice && d(currPrice).gt(maxPrice) ? '60px' : '40px' }}
              fontSize="12px"
              color="text_caption"
            >
              {formatNumberWithDown(maxPrice)}
            </Text>
          </Box>
        </HStack>
      ) : (
        <HStack w="100%" height="60px" background="primary_opacity.10" borderRadius="16px" p={{ base: '0 12px', lg: '0 40px' }}>
          <Skeleton w="100%" h="20px" />
        </HStack>
      )}
    </>
  )
}
export default VaultPositionRange
