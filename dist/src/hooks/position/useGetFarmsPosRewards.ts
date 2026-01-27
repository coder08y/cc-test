import usePositionStore from '@/store/position'
import { PosBaseInfo, PosReward } from '@/types'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { bnToAmount } from '@cetus/utils'

export default function useGetFarmsPosRewards() {
  const farmsSdk = useSdk('farms')
  const { getTokenListInfo } = useGetToken()
  const { setFarmsPosRewardsData, setFarmsPosRewardsDataLoading } = usePositionStore()

  const getFarmsRewardsData = async (positionBaseList: PosBaseInfo[]) => {
    console.log('🚀 ~ getFarmsRewardsData ~ positionBaseList:', positionBaseList)
    setFarmsPosRewardsDataLoading(true)
    const batchFetchPosRewardersAmountParams = positionBaseList
      ?.filter((item: any) => item.posType === 'farms')
      .map((item: any) => {
        return {
          pool_id: item.farmsPool,
          position_nft_id: item.id
        }
      })
    try {
      let posFarmsRewardsObj: Record<string, PosReward[]> = {}
      if (batchFetchPosRewardersAmountParams && batchFetchPosRewardersAmountParams.length > 0) {
        const res = await farmsSdk!.Farms.calculateFarmingRewards(batchFetchPosRewardersAmountParams)
        console.log('🚀 ~ getFarmsRewardsData ~ res:', res, farmsSdk!.getSenderAddress(), batchFetchPosRewardersAmountParams)
        if (res) {
          const resArr = Object.entries(res).map(([id, value]) => ({
            id,
            rewarderAmountOwed: value
          }))

          console.log('🚀 ~ file: useGetFarmsPosRewards.ts:27 ~ resArr ~ resArr:', resArr)
          const coinTypeList = resArr
            .map((item: any) => {
              return item.rewarderAmountOwed.map((rewarder: any) => rewarder.rewarder_type)
            })
            .flat()
          const tokenMap = await getTokenListInfo(coinTypeList)
          posFarmsRewardsObj = Object.fromEntries(
            resArr.map((item: any, key) => {
              for (const rewarder of item.rewarderAmountOwed) {
                const { rewarder_amount, rewarder_type } = rewarder
                const token = tokenMap?.get(rewarder_type)
                rewarder.display_amount_owed = bnToAmount(rewarder_amount.toString(), token?.decimals || 0)
                rewarder.amount_owed = rewarder_amount.toString()
                rewarder.token = token
              }
              return [item.id, item.rewarderAmountOwed]
            })
          )
        }
      }

      console.log('getFarmsRewardsData ~ posFarmsRewardsObj:', posFarmsRewardsObj)
      setFarmsPosRewardsData(posFarmsRewardsObj)
    } catch (error) {
      console.log('🚀 ~ getPosFarmsRewards ~ error:', error)
    }
  }

  const formatFarmsRewardsData = async (res: any) => {
    let posFarmsRewardsObj: Record<string, PosReward[]> = {}
    const resArr = Object.entries(res).map(([id, value]) => ({
      id,
      rewarderAmountOwed: value
    }))

    console.log('🚀 ~ file: useGetFarmsPosRewards.ts:27 ~ resArr ~ resArr:', resArr)
    const coinTypeList = resArr
      .map((item: any) => {
        return item.rewarderAmountOwed.map((rewarder: any) => rewarder.rewarder_type)
      })
      .flat()
    const tokenMap = await getTokenListInfo(coinTypeList)
    posFarmsRewardsObj = Object.fromEntries(
      resArr.map((item: any, key) => {
        for (const rewarder of item.rewarderAmountOwed) {
          const { rewarder_amount, rewarder_type } = rewarder
          const token = tokenMap?.get(rewarder_type)
          rewarder.display_amount_owed = bnToAmount(rewarder_amount.toString(), token?.decimals || 0)
          rewarder.amount_owed = rewarder_amount.toString()
          rewarder.token = token
        }
        return [item.id, item.rewarderAmountOwed]
      })
    )
    return posFarmsRewardsObj
  }

  return {
    getFarmsRewardsData,
    formatFarmsRewardsData
  }
}
