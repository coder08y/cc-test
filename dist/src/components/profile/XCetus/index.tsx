import { useXCetus } from '@/hooks/xcetus/useXCetus'
import useProfileXCetusStore from '@/store/profile/xcetus'
import { Block } from '@cetus/design'
import { HStack, VStack } from '@chakra-ui/react'
import CetusHolding from './CetusHolding'
import RedeemList from './RedeemList'
import Rewards from './Rewards'
import XCetusHolding from './XCetusHolding'
import XCetusModal from './XCetusModal'

function XCetus() {
  const { isXCetusModalOpen, setIsXCetusModalOpen } = useProfileXCetusStore()
  const { availableXCetusAmount, totalRewardValue, rewardList, summaryRewardList } = useXCetus()
  return (
    <Block mt={{ base: '-6px', lg: '0' }} p={{ base: '8px 0px', lg: '12px 0px' }} border="none" w="100%" bg="none" backdropFilter="blur(20px)">
      <VStack w="100%" gap="20px">
        <HStack w="100%" gap="10px" flexDirection={{ base: 'column', lg: 'row' }}>
          <XCetusHolding availableXCetusAmount={availableXCetusAmount} />
          <CetusHolding />
          <Rewards totalRewardValue={totalRewardValue} rewardList={rewardList} summaryRewardList={summaryRewardList} />
        </HStack>
        <RedeemList />
        {isXCetusModalOpen && (
          <XCetusModal isOpen={isXCetusModalOpen} onClose={() => setIsXCetusModalOpen(false)} availableXCetusAmount={availableXCetusAmount} />
        )}
      </VStack>
    </Block>
  )
}

export default XCetus
