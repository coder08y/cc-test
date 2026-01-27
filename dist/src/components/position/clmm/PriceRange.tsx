import PositionPriceBar from '@/components/position/list/PositionPriceRangeBar'
import usePosHelper from '@/hooks/position/usePosHelper'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { ReactNode, useMemo, useState } from 'react'
import RangeValue from './RangeValue'

function PriceRange({
  positionInfo,
  symbolEllipsesDecimals = 0,
  labelInfo,
  children
}: {
  positionInfo: PosBaseInfo
  symbolEllipsesDecimals?: number
  labelInfo?: { text: string; style?: any }
  children?: ReactNode
}) {
  const { posPoolsRelatedData, posPoolsOriginalData } = usePositionStore()
  const currentPosPoolsRelatedData = posPoolsRelatedData[positionInfo?.posId]
  const { getPosIsActive } = usePosHelper()
  // const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'
  const isActive = useMemo(() => {
    return getPosIsActive(positionInfo as PosBaseInfo, posPoolsOriginalData?.[positionInfo?.clmmPool || '']?.current_sqrt_price)
  }, [positionInfo, posPoolsOriginalData])

  const { isApp } = useWindowWidth()

  const [priceDirect, setPriceDirect] = useState(true)
  console.log('🚀🚀🚀 ~ PriceRange.tsx:32 ~ priceDirect:', priceDirect)
  return (
    <VStack w={{ base: '100%', lg: '480px' }} maxW={{ base: '100%', lg: '480px' }} height="100%" alignItems="flex-start" justifyContent="center">
      {/* <HStack maxW="100%" w={{ base: '100%', lg: 'auto' }} height="100%" borderRadius="12px" bg="position_status_bg"  alignItems="center"> */}
      <HStack
        justifyContent="flex-start"
        height={{ base: 'auto', lg: '60px' }}
        p={{ base: '12px', lg: '16px' }}
        borderRadius="12px"
        bg="position_status_bg"
        alignItems={{
          base: 'flex-start',
          lg: 'center'
        }}
        w={{ base: '100%', lg: 'auto' }}
        flexDirection={{
          base: 'column',
          lg: 'row'
        }}
        gap={{ base: '12px', lg: '8px' }}
      >
        {!isApp && (
          <PositionPriceBar
            minPrice={currentPosPoolsRelatedData?.minPrice}
            maxPrice={currentPosPoolsRelatedData?.maxPrice}
            currPrice={currentPosPoolsRelatedData?.currentPrice}
            isActive={isActive}
            isShowActive={true}
            priceDirect={priceDirect}
            wrapStyle={{
              flexDirection: {
                base: 'row-reverse',
                lg: 'column'
              }
            }}
          />
        )}

        <VStack
          align="flex-start"
          gap={{ base: '12px', lg: '4px' }}
          width={{
            lg: '100%'
          }}
          justifyContent={{
            lg: 'space-between'
          }}
        >
          <HStack
            width={{
              base: '100%'
            }}
            justifyContent={{
              base: 'space-between'
            }}
          >
            <Skeleton isLoaded={!!labelInfo?.text}>
              <Text fontSize="12px" color="primary_gray" {...labelInfo?.style}>
                {labelInfo?.text}
              </Text>
            </Skeleton>
            {children}
          </HStack>
          {isApp && (
            <PositionPriceBar
              minPrice={currentPosPoolsRelatedData?.minPrice}
              maxPrice={currentPosPoolsRelatedData?.maxPrice}
              currPrice={currentPosPoolsRelatedData?.currentPrice}
              isActive={isActive}
              priceDirect={priceDirect}
              isShowActive={true}
              wrapStyle={{
                flexDirection: {
                  base: 'row-reverse',
                  lg: 'column'
                }
              }}
            />
          )}
          <RangeValue
            symbolEllipsesDecimals={symbolEllipsesDecimals}
            displayTokenA={positionInfo?.displayTokenA}
            displayTokenB={positionInfo?.displayTokenB}
            setPriceDirect={setPriceDirect}
            priceInfo={{
              minPrice: currentPosPoolsRelatedData?.minPrice,
              maxPrice: currentPosPoolsRelatedData?.maxPrice,
              minPriceResever: currentPosPoolsRelatedData?.minPriceResever,
              maxPriceResever: currentPosPoolsRelatedData?.maxPriceResever
            }}
          />
          {/* {isApp && children} */}
        </VStack>
      </HStack>
      {/* </HStack> */}
    </VStack>
  )
}

export default PriceRange
