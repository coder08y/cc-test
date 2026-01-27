import PositionPriceBar from '@/components/position/list/PositionPriceRangeBar'
import usePosHelper from '@/hooks/position/usePosHelper'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { AddressCopyLink, CetusTooltip, CopyButton } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { cancelBubble, formatSmallPrice, isAvailableObject, removeComma } from '@cetus/utils'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import StatusPosition from '../../common/StatusPosition'

function PositionPriceRange({
  positionInfo,
  tokenName,
  priceDirect,
  isShowIcon
}: {
  positionInfo: PosBaseInfo
  tokenName: string | undefined
  priceDirect?: boolean
  isShowIcon?: boolean
}) {
  const { getPosIsActive } = usePosHelper()
  const { posPoolsRelatedData, posPoolsOriginalData } = usePositionStore()
  const currentPosPoolsRelatedData = posPoolsRelatedData[positionInfo?.posId]

  // const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'
  const isActive = useMemo(() => {
    return getPosIsActive(positionInfo as PosBaseInfo, posPoolsOriginalData?.[positionInfo?.clmmPool || '']?.current_sqrt_price)
  }, [positionInfo, posPoolsOriginalData])

  const { isApp } = useWindowWidth()

  const minPrice = useMemo(() => {
    return currentPosPoolsRelatedData?.minPriceOrigin
  }, [currentPosPoolsRelatedData])

  const maxPrice = useMemo(() => {
    return currentPosPoolsRelatedData?.maxPriceOrigin
  }, [currentPosPoolsRelatedData])

  const currPrice = useMemo(() => {
    return currentPosPoolsRelatedData?.currentPriceOrigin
  }, [currentPosPoolsRelatedData])

  const { getExplorerUrl } = useExplorer()
  return (
    <VStack align={{ base: 'flex-end', lg: 'flex-start' }} gap={{ base: '4px', lg: '8px' }} w="100%" maxW="100%">
      <HStack
        justify={{ base: 'flex-end', lg: 'flex-start' }}
        maxW="100%"
        w={{ base: '100%', lg: 'unset' }}
        borderRadius="12px"
        pr={{ base: '0', lg: '16px' }}
      >
        <Skeleton isLoaded={!!currentPosPoolsRelatedData?.minPrice && !!currentPosPoolsRelatedData?.maxPrice} borderRadius="4px">
          {priceDirect ? (
            <Text
              lineHeight="1"
              fontSize="14px"
              color="text_caption"
              textAlign={{ base: 'right', lg: 'left' }}
              whiteSpace={{ base: 'wrap', lg: 'nowrap' }}
            >
              {`${isNaN(Number(currentPosPoolsRelatedData?.minPrice)) ? currentPosPoolsRelatedData?.minPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPrice))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPrice)) ? currentPosPoolsRelatedData?.maxPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPrice))}`}
            </Text>
          ) : (
            <Text
              lineHeight="1"
              fontSize="14px"
              color="text_caption"
              textAlign={{ base: 'right', lg: 'left' }}
              whiteSpace={{ base: 'wrap', lg: 'nowrap' }}
            >
              {`${isNaN(Number(currentPosPoolsRelatedData?.minPriceResever)) ? currentPosPoolsRelatedData?.minPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPriceResever))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPriceResever)) ? currentPosPoolsRelatedData?.maxPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPriceResever))}`}
            </Text>
          )}
        </Skeleton>
        {!isApp && (
          <StatusPosition
            isActive={isActive}
            isLoading={!isAvailableObject(positionInfo) || !isAvailableObject(posPoolsOriginalData?.[positionInfo?.clmmPool || ''])}
          />
        )}
        {/* isShowIcon &&  */}
        {!isApp && (
          <HStack onClick={e => cancelBubble(e)}>
            <CetusTooltip
              placement="top"
              maxW="unset"
              tooltip={
                <HStack flexDirection={{ base: 'column', lg: 'row' }} w={{ base: '100%', lg: 'unset' }}>
                  <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
                    <Text fontSize={{ base: '14px', lg: '12px' }}>Position ID</Text>
                    <Skeleton isLoaded={!!tokenName}>
                      <Text whiteSpace="nowrap" fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                        {tokenName?.split('|')[1]}
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
        {isApp && (
          <StatusPosition
            isActive={isActive}
            isLoading={!isAvailableObject(positionInfo) || !isAvailableObject(posPoolsOriginalData?.[positionInfo?.clmmPool || ''])}
          />
        )}
        <PositionPriceBar minPrice={minPrice} maxPrice={maxPrice} currPrice={currPrice} isActive={isActive} priceDirect={priceDirect} />
      </HStack>
    </VStack>
  )
}

export default PositionPriceRange
