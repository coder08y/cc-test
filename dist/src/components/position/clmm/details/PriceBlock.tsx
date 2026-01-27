import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { Token } from '@cetus/types'
import { formatSmallPrice, removeComma, textEllipses } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import PriceRangeBar from './ClaimAndCompound/PriceRangeBar'

function PriceBlock({ isCompoundModal = false, isShowPriceBar = false }: { isCompoundModal?: boolean; isShowPriceBar?: boolean }) {
  const { currentPosBaseInfo, posPoolsRelatedData } = usePositionStore()
  const { isPriceDirect, isDirect } = usePositionDetailStore()
  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId as string]

  // 计算价格显示文本 Calculate price display text
  const perText = useMemo(() => {
    if (!currentPosBaseInfo?.tokenA || !currentPosBaseInfo?.tokenB) return ''
    return isDirect
      ? `${textEllipses(currentPosBaseInfo?.tokenB?.symbol, 10)}/${textEllipses(currentPosBaseInfo?.tokenA?.symbol, 10)}`
      : `${textEllipses(currentPosBaseInfo?.tokenA?.symbol, 10)}/${textEllipses(currentPosBaseInfo?.tokenB?.symbol, 10)}`
  }, [isDirect, currentPosBaseInfo?.tokenA as Token, currentPosBaseInfo?.tokenB as Token])

  const minPrice = useMemo(() => {
    return isPriceDirect || isPriceDirect == undefined ? `${currentPosPoolsRelatedData?.minPrice}` : `${currentPosPoolsRelatedData?.minPriceResever}`
  }, [isPriceDirect, currentPosPoolsRelatedData])

  const currentPrice = useMemo(() => {
    return isPriceDirect || isPriceDirect == undefined
      ? `${currentPosPoolsRelatedData?.currentPriceReverse}`
      : `${currentPosPoolsRelatedData?.currentPrice}`
  }, [isPriceDirect, currentPosPoolsRelatedData])

  const maxPrice = useMemo(() => {
    return isPriceDirect || isPriceDirect == undefined ? `${currentPosPoolsRelatedData?.maxPrice}` : `${currentPosPoolsRelatedData?.maxPriceResever}`
  }, [isPriceDirect, currentPosPoolsRelatedData])

  const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'
  return (
    <VStack w="100%" gap="20px" mt={isShowPriceBar ? '48px' : '0'}>
      {isShowPriceBar && (
        <Box w="100%">
          <PriceRangeBar
            minPrice={currentPosPoolsRelatedData?.minPrice}
            maxPrice={currentPosPoolsRelatedData?.maxPrice}
            currPrice={currentPosPoolsRelatedData?.currentPrice}
            isActive={isActive}
            moveLength="25px"
            priceDirect={isPriceDirect == undefined ? true : isPriceDirect}
            showRatio={true}
            infinityW="100%"
            commonW="68.75%"
            commonH="8px"
          />
        </Box>
      )}
      <HStack w="100%" justify="space-between" align="stretch" bg={!isCompoundModal ? 'card_bg' : 'none'} borderRadius="12px">
        <VStack w="50%" bg={!isCompoundModal ? 'card_bg' : 'blue_bg'} borderRadius="12px" p={!isCompoundModal ? '16px 20px' : '12px'}>
          <Text color="primary_gray" fontSize="12px">
            Min Price
          </Text>
          <Skeleton isLoaded={!!currentPosPoolsRelatedData?.minPrice && !!currentPosPoolsRelatedData?.minPriceResever}>
            <Text color="text_caption" whiteSpace="nowrap" textAlign={'center'}>
              {formatSmallPrice(removeComma(minPrice))}
            </Text>
          </Skeleton>
          <Text color="primary_gray" fontSize="12px" textAlign={'center'}>
            {perText}
          </Text>
        </VStack>
        {/* {isCompoundModal && (
          <VStack w="50%" bg={!isCompoundModal ? 'card_bg' : 'blue_bg'} borderRadius="12px" p={!isCompoundModal ? '16px 20px' : '12px'}>
            <Text color="primary" fontSize="12px">
              Current Price
            </Text>
            <Skeleton isLoaded={!!currentPosPoolsRelatedData?.minPrice && !!currentPosPoolsRelatedData?.minPriceResever}>
              <Text color="text_caption" whiteSpace="nowrap" textAlign="center">
                {currentPrice}
              </Text>
            </Skeleton>
            <Text color="primary_gray" fontSize="12px" textAlign="center">
              {perText}
            </Text>
          </VStack>
        )} */}
        <VStack
          w="50%"
          bg={!isCompoundModal ? 'card_bg' : 'blue_bg'}
          borderRadius="12px"
          p={!isCompoundModal ? '16px 20px' : '12px'}
          align={'center'}
        >
          <Text color="primary_gray" fontSize="12px">
            Max Price
          </Text>
          <Skeleton isLoaded={!!currentPosPoolsRelatedData?.maxPrice && !!currentPosPoolsRelatedData?.maxPriceResever}>
            <Text color="text_caption" whiteSpace="nowrap" textAlign={'center'}>
              {formatSmallPrice(removeComma(maxPrice))}
            </Text>
          </Skeleton>
          <Text color="primary_gray" fontSize="12px" textAlign={'center'}>
            {perText}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  )
}
export default PriceBlock
