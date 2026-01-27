import useDlmmPositionStore from '@/store/dlmm-position'
import { AddressCopyLink } from '@cetus/design'
import { HTextLabelBox } from '@cetus/ui-kit'
import { Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import DlmmPositionStatus from '../common/DlmmPositionStatus'

export default function DlmmPositionInfo() {
  const { dlmmCurrentPosBaseInfo, dlmmPosPoolsRelatedData } = useDlmmPositionStore()
  const currentPosRelatedData = useMemo(() => {
    return dlmmPosPoolsRelatedData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosPoolsRelatedData])
  return (
    <VStack width="100%" gap="16px" justifyContent="flex-start" alignItems="flex-start">
      <Text fontSize="16px" color="caption">
        Your Liquidity
      </Text>
      <DlmmPositionStatus isActive />
      <HTextLabelBox
        label="Position ID"
        value={dlmmCurrentPosBaseInfo?.tokenName}
        wrapStyle={{
          mt: '8px'
        }}
        labelStyle={{
          fontSize: '14px'
        }}
        valueStyle={{
          fontSize: '14px'
        }}
      />
      <HTextLabelBox
        label="Position NFT"
        labelStyle={{
          fontSize: '14px'
        }}
        value={<AddressCopyLink address={dlmmCurrentPosBaseInfo?.id} showLink={false} fontSize="14px" color="capiton" onClickLink={() => {}} />}
      />
      <HTextLabelBox
        label="Price Range"
        value={`${currentPosRelatedData?.minPrice} - ${currentPosRelatedData?.maxPrice} ${dlmmCurrentPosBaseInfo?.displayTokenB?.symbol}/${dlmmCurrentPosBaseInfo?.displayTokenA?.symbol}`}
        labelStyle={{
          fontSize: '14px'
        }}
        valueStyle={{
          fontSize: '14px',
          whiteSpace: 'nowrap'
        }}
      />
    </VStack>
  )
}
