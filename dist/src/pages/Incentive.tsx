import AddIncentive from '@/components/incentive/AddIncentive'
import ReleaseInfo from '@/components/incentive/ReleaseInfo'
import RewardTokenAndDuration from '@/components/incentive/RewardTokenAndDuration'
import useGetIncentiveConfig from '@/hooks/incentive/useGetIncentiveConfig'
import useGetIncentivePoolInfo from '@/hooks/incentive/useGetIncentivePoolInfo'
import useIncentiveStore from '@/store/incentive'
import { IncentiveRewardInfo } from '@/types/incentive'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { BackButton } from '@cetus/ui-kit'
import { d, isAvailableObject, removeComma } from '@cetus/utils'
import { Box, HStack, VStack } from '@chakra-ui/react'
import { useInterval } from 'ahooks'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Incentive() {
  const { poolAddress } = useQueryParams()
  const { getIncentivePoolInfo } = useGetIncentivePoolInfo()
  const { getDlmmWhiteTokenList } = useGetIncentiveConfig()
  const [rewardList, setRewardList] = useState<IncentiveRewardInfo[]>([{}])
  const { setIncentiveApiPoolInfo, setIncentiveContractPoolInfo } = useIncentiveStore()
  const { isApp } = useWindowWidth()
  const navigate = useNavigate()
  useEffect(() => {
    console.log('🚀 ~ Incentive ~ poolAddress:', poolAddress)
    if (poolAddress) {
      getIncentivePoolInfo(poolAddress)
    }
  }, [poolAddress])

  useInterval(() => {
    getDlmmWhiteTokenList()
  }, 60 * 1000)

  const showReleaseInfo = rewardList?.some(
    item =>
      item?.startTime &&
      item?.endTime &&
      item?.rewardNum &&
      item?.releaseRate &&
      isAvailableObject(item?.rewardCoin) &&
      d(removeComma(item?.releaseRate + '')).gte(d(1).div(d(10).pow(item?.rewardCoin?.decimals)))
  )

  useEffect(() => {
    return () => {
      setIncentiveApiPoolInfo(undefined)
      setIncentiveContractPoolInfo(undefined)
    }
  }, [])

  return (
    <VStack w={{ base: '100%', lg: showReleaseInfo ? '1016px' : '540px' }} align="flex-start" mt="20px" gap="16px">
      <BackButton onClick={() => navigate(`/dlmm?poolId=${poolAddress}`)} />
      <HStack flexDirection={{ base: 'column', lg: 'row' }} w="100%" align="flex-start" justify={showReleaseInfo ? 'space-between' : 'center'}>
        <VStack w="100%" flex={{ base: '0 0 1', lg: '0 0 540px' }}>
          <AddIncentive />
          <RewardTokenAndDuration
            rewardList={rewardList}
            changeRewardList={(item: any) => {
              setRewardList(item)
            }}
          />
        </VStack>
        {showReleaseInfo && !isApp && (
          <Box flex="0 0 460px">
            <ReleaseInfo rewardList={rewardList} />
          </Box>
        )}
      </HStack>
    </VStack>
  )
}
