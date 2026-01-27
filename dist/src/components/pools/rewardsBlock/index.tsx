import { CetusTooltip } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { SingleCoinImage } from '@cetus/ui-kit'
import { Box, Center, HStack, Skeleton, SkeletonCircle } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { Suspense, lazy, useState } from 'react'
const RewardsTooltip = lazy(() => import('./RewardsContent'))

function RewardsBlock({ miningRewardList, farmsRewarderList }: { miningRewardList: any; farmsRewarderList: any }) {
  const { getTokenListInfo } = useGetToken()
  const [rewardsList, setRewardsList] = useState<any>([])
  const fetchData = async () => {
    if (miningRewardList?.length > 0 || farmsRewarderList?.length > 0) {
      try {
        let miningList: any = []
        let farmingList: any = []
        if (miningRewardList?.length > 0) {
          const coinTypeList = miningRewardList?.map((item: any) => item?.coinType)
          const tokenMap = await getTokenListInfo(coinTypeList)
          miningList = miningRewardList.map((item: any) => {
            const tokenInfo = tokenMap?.get(item?.coinType)
            return { ...item, tokenInfo, isMining: true }
          })
        }
        if (farmsRewarderList?.length > 0) {
          const coinTypeList = farmsRewarderList?.map((item: any) => item?.coinType)
          const tokenMap = await getTokenListInfo(coinTypeList)
          farmingList = farmsRewarderList.map((item: any) => {
            const tokenInfo = tokenMap?.get(item?.coinType)
            return { ...item, tokenInfo, isFarming: true }
          })
        }
        console.log('🚀 ~ list:', miningList.concat(farmingList), miningList, farmingList)
        setRewardsList(miningList.concat(farmingList))
      } catch (error) {
        console.error('Error processing list:', error)
      }
    }
  }

  useDeepCompareEffect(() => {
    fetchData()
  }, [miningRewardList, farmsRewarderList])

  return (
    <HStack w="100%" justify="flex-end">
      {rewardsList.map((item: any) => (
        <Box key={item?.coinType} onClick={(e: any) => e.stopPropagation()}>
          <CetusTooltip
            placement="top"
            tooltip={
              <Suspense
                fallback={
                  <HStack>
                    <SkeletonCircle w="24px" h="24px" />
                    <Skeleton w="200px" h="14px" />
                  </HStack>
                }
              >
                <RewardsTooltip item={item} />
              </Suspense>
            }
          >
            <Center as="button">
              <SingleCoinImage imageUrl={item?.tokenInfo?.logo_url} w="24px" h="24px" />
            </Center>
          </CetusTooltip>
        </Box>
      ))}
    </HStack>
  )
}
export default RewardsBlock
