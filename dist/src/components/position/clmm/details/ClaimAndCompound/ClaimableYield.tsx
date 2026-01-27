import usePositionCompoundStore from '@/store/position/compound'
import { formatCurrency } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import DailyYield from '../DailyYield'
import ModalTable from './ModalTable'

type ClaimableYieldProps = {
  isShowMergeable: boolean
  isShowCompound: boolean
  totalYield: string
}

function ClaimableYield({ isShowCompound, isShowMergeable, totalYield }: ClaimableYieldProps) {
  const { clmmRewardList, clmmFeeList, mergeableRewards, compoundableRewards, mergeToToken } = usePositionCompoundStore()
  return (
    <VStack w="100%" align="flex-start" bg="rgba(180,216,240,0.06)" borderRadius="12px" p={{ base: '16px 12px', lg: '20px 16px' }}>
      <Text>Claimable Yield</Text>
      <HStack>
        <Text fontSize="20px" color="text_caption">
          {formatCurrency(totalYield, 2)}
        </Text>
        <DailyYield totalYield={totalYield} />
      </HStack>
      <Box h="1px" borderBottom="1px dotted" borderColor="border" w="100%" mt="12px" />
      {clmmFeeList?.length > 0 && (
        <VStack w="100%" align="flex-start" gap="0" mt="12px">
          <Text mb="-4px">Fees</Text>
          <ModalTable
            list={clmmFeeList}
            toToken={mergeToToken}
            isShowMergeable={isShowMergeable}
            isShowCompound={isShowCompound}
            allowList={isShowCompound ? compoundableRewards : mergeableRewards}
          />
        </VStack>
      )}
      {clmmRewardList?.length > 0 && (
        <VStack w="100%" align="flex-start" gap="0" mt="12px">
          <Text mb="-4px">Mining Rewards</Text>
          <ModalTable
            list={clmmRewardList}
            toToken={mergeToToken}
            isShowMergeable={isShowMergeable}
            isShowCompound={isShowCompound}
            allowList={isShowCompound ? compoundableRewards : mergeableRewards}
          />
        </VStack>
      )}
    </VStack>
  )
}

export default ClaimableYield
