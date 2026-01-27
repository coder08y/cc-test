import PositionCurrentPrice from '@/components/position/common/PositionCurrentPrice'
import StatusPosition from '@/components/position/common/StatusPosition'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { isAvailableObject } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import PriceBlock from '../PriceBlock'

type PriceRangeBlockProps = {}

function PriceRangeBlock({}: PriceRangeBlockProps) {
  const { posPoolsRelatedData, currentPosBaseInfo } = usePositionStore()

  const currentPosPoolsRelatedData = useMemo(() => {
    return posPoolsRelatedData[currentPosBaseInfo?.posId]
  }, [posPoolsRelatedData, currentPosBaseInfo?.posId])

  const hasStatus = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus !== undefined
  }, [currentPosPoolsRelatedData])

  const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'

  const { isDirect, setIsDirect, isPriceDirect, setIsPriceDirect } = usePositionDetailStore()

  const onReverseClick = () => {
    setIsDirect(!isDirect)
    setIsPriceDirect(isPriceDirect == undefined ? false : !isPriceDirect)
  }
  return (
    <VStack w="100%" align="flex-start" bg="rgba(180,216,240,0.06)" borderRadius="12px" p={{ base: '16px 12px', lg: '20px 16px' }}>
      <HStack w="100%" justify="space-between">
        <HStack w="100%" justify="space-between">
          <Text color="text_caption" fontSize="16px">
            Price Range
          </Text>
          {hasStatus && (
            <StatusPosition isActive={isActive} isLoading={!currentPosPoolsRelatedData && !isAvailableObject(currentPosPoolsRelatedData)} />
          )}
        </HStack>
        {/* <RangeTab itemStyle={{ fontSize: '12px' }} /> */}
      </HStack>
      <HStack mt="8px" align={{ base: 'center', lg: 'center' }} h={{ base: 'unset', lg: '14px' }}>
        <PositionCurrentPrice
          posId={currentPosBaseInfo?.posId || ''}
          displayTokenA={currentPosBaseInfo?.displayTokenA}
          displayTokenB={currentPosBaseInfo?.displayTokenB}
          isChangeDirect={isPriceDirect}
          handleDirect={onReverseClick}
          iconStyle={{
            w: { base: '24px', lg: '32px' },
            h: { base: '16px', lg: '32px' }
          }}
        />
      </HStack>
      <PriceBlock isCompoundModal={true} isShowPriceBar={true} />
    </VStack>
  )
}

export default PriceRangeBlock
