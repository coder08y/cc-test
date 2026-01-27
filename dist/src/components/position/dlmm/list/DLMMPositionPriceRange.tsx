import useDlmmPositionStore from '@/store/dlmm-position'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { AddressCopyLink, CetusTooltip, CopyButton } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { cancelBubble, d, formatSmallPrice, removeComma } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import StatusPosition from '../../common/StatusPosition'

function DLMMPositionPriceRange({
  positionInfo,
  tokenName,
  priceDirect,
  isShowIcon
}: {
  positionInfo: DlmmPosBaseInfo
  tokenName: string | undefined
  priceDirect?: boolean
  isShowIcon?: boolean
}) {
  const { dlmmPosPoolsRelatedData } = useDlmmPositionStore()
  const currentPosPoolsRelatedData = dlmmPosPoolsRelatedData[positionInfo?.id]
  const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'
  const { isApp } = useWindowWidth()

  const minPrice = useMemo(() => {
    return removeComma(priceDirect ? (currentPosPoolsRelatedData?.minPrice ?? '0') : (currentPosPoolsRelatedData?.minPriceResever ?? '0'))
  }, [currentPosPoolsRelatedData, priceDirect])

  const maxPrice = useMemo(() => {
    return removeComma(priceDirect ? (currentPosPoolsRelatedData?.maxPrice ?? '0') : (currentPosPoolsRelatedData?.maxPriceResever ?? '0'))
  }, [currentPosPoolsRelatedData, priceDirect])

  const currPrice = useMemo(() => {
    return removeComma(priceDirect ? (currentPosPoolsRelatedData?.currentPrice ?? '0') : (currentPosPoolsRelatedData?.currentPriceReverse ?? '0'))
  }, [currentPosPoolsRelatedData, priceDirect])

  const [elementWidth, setElementWidth] = useState<number>(0)
  const elementRef = useRef<HTMLDivElement>(null)

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

  const sliderML = useMemo(() => {
    if (maxPrice === '∞') return '0px'
    if (currPrice && minPrice && maxPrice && elementWidth !== undefined) {
      if (d(currPrice).lt(maxPrice) && d(currPrice).gt(minPrice)) {
        const relativePosition = d(currPrice)
          .sub(minPrice)
          .div(d(maxPrice).sub(d(minPrice)))
          .toString()

        return `${d(relativePosition).mul(100).toFixed(2)}%`
      }
      if (d(minPrice).eq(maxPrice) && d(minPrice).eq(currPrice)) {
        return '50%'
      }
      if (d(currPrice).lt(minPrice)) {
        return '-6px'
      }
      if (d(currPrice).gt(maxPrice)) {
        return 'calc(100% + 6px)'
      }
      if (d(currPrice).eq(minPrice) && d(currPrice).lt(maxPrice)) {
        return '0px'
      }
      if (d(currPrice).eq(maxPrice) && d(currPrice).gt(minPrice)) {
        return 'calc(100% - 1px)'
      }
    }
    return '0px'
  }, [currPrice, minPrice, maxPrice, elementWidth, currentPosPoolsRelatedData])

  const { getExplorerUrl } = useExplorer()

  const onlyOneBin = useMemo(() => {
    return minPrice === maxPrice
  }, [minPrice, maxPrice])
  return (
    <VStack align={{ base: 'flex-end', lg: 'flex-start' }} gap={{ base: '4px', lg: '8px' }} w="100%" maxW="100%">
      <HStack
        justify={{ base: 'flex-end', lg: 'flex-start' }}
        maxW="100%"
        w={{ base: '100%', lg: 'unset' }}
        borderRadius="12px"
        pr={{ base: '0', lg: '16px' }}
        flexWrap="nowrap"
      >
        <Skeleton isLoaded={!!currentPosPoolsRelatedData?.minPrice && !!currentPosPoolsRelatedData?.maxPrice} borderRadius="4px">
          {priceDirect ? (
            <Text lineHeight="1" fontSize="14px" color="text_caption" textAlign="right" whiteSpace={{ base: 'wrap', lg: 'nowrap' }}>
              {onlyOneBin
                ? `${isNaN(Number(currentPosPoolsRelatedData?.minPrice)) ? currentPosPoolsRelatedData?.minPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPrice))}`
                : `${isNaN(Number(currentPosPoolsRelatedData?.minPrice)) ? currentPosPoolsRelatedData?.minPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPrice))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPrice)) ? currentPosPoolsRelatedData?.maxPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPrice))}`}
            </Text>
          ) : (
            <Text lineHeight="1" fontSize="14px" color="text_caption" textAlign="right" whiteSpace={{ base: 'wrap', lg: 'nowrap' }}>
              {onlyOneBin
                ? `${isNaN(Number(currentPosPoolsRelatedData?.minPriceResever)) ? currentPosPoolsRelatedData?.minPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPriceResever))}`
                : `${isNaN(Number(currentPosPoolsRelatedData?.minPriceResever)) ? currentPosPoolsRelatedData?.minPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPriceResever))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPriceResever)) ? currentPosPoolsRelatedData?.maxPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPriceResever))}`}
            </Text>
          )}
        </Skeleton>
        {!isApp && <StatusPosition isActive={isActive} isLoading={currentPosPoolsRelatedData?.currentStatus == ''} />}
        {/* isShowIcon &&  */}
        {!isApp && (
          <HStack onClick={e => cancelBubble(e)}>
            <CetusTooltip
              placement="top"
              maxW="400px"
              tooltip={
                <HStack flexDirection={{ base: 'column', lg: 'row' }} w={{ base: '100%', lg: 'unset' }}>
                  <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
                    <Text fontSize={{ base: '14px', lg: '12px' }}>Position ID</Text>
                    <Skeleton isLoaded={!!tokenName}>
                      <Text fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                        {tokenName}
                      </Text>
                    </Skeleton>
                  </HStack>
                  <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
                    <Text fontSize={{ base: '14px', lg: '12px' }} ml={{ base: '0', lg: '8px' }}>
                      Position Address
                    </Text>
                    <AddressCopyLink
                      fontWeight="500"
                      color="text_caption"
                      address={positionInfo?.id}
                      showLink={false}
                      fontSize={{ base: '14px', lg: '12px' }}
                      onClickLink={() => {
                        window.open(getExplorerUrl(positionInfo?.id, 'nftAddress'), '_blank')
                      }}
                    />
                  </HStack>
                </HStack>
              }
            >
              <CopyButton text={positionInfo?.id} copyText="Position address copied" />
            </CetusTooltip>
            {/* <CetusTooltip placement='top' maxW='unset' tooltip={<Text fontSize='12px'>Copy the Position Address</Text>}>
              <CopyButton text={positionInfo?.id} />
            </CetusTooltip> */}
          </HStack>
        )}
      </HStack>
      <HStack>
        {isApp && <StatusPosition isActive={isActive} isLoading={currentPosPoolsRelatedData?.currentStatus == ''} />}
        <Skeleton h="6px" isLoaded={!!currentPosPoolsRelatedData?.currentPrice} borderRadius="4px">
          <Box w="88px" h="6px" bgImage={maxPrice === '∞' ? 'none' : "url('/images/img_inactive_bg@2x.png')"} bgSize="88px 6px">
            <Box
              w={maxPrice === '∞' ? '88px' : '56px'}
              h={maxPrice === '∞' ? '2px' : '6px'}
              position="relative"
              ref={elementRef}
              background={
                maxPrice === '∞' ? 'linear-gradient(135deg, #68FFD8 0%, #0091FF 100%)' : isActive ? "url('/images/img_range@2x.png')" : 'none'
              }
              ml={maxPrice === '∞' ? '0px' : '16px'}
              bgSize="100% 6px"
              bgPosition="center"
              bgRepeat="no-repeat"
            >
              {maxPrice !== '∞' && (
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
      </HStack>
    </VStack>
  )
}

export default DLMMPositionPriceRange
