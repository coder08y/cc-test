import usePositionStore from '@/store/position'
import { PoolContractInfo, PosBaseInfo, PosReward } from '@/types'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { CoinType, Token } from '@cetus/types'
import { bnToAmount } from '@cetus/utils'

export default function useGetPosRewards() {
  const clmmSdk = useSdk('clmm')
  const { getTokenListInfo } = useGetToken()
  const { setPosRewardsData, setPosRewardsDataLoading } = usePositionStore()

  const getPosRewardsData = async (positionBaseList: PosBaseInfo[], posPoolsOriginalData: Record<string, PoolContractInfo>) => {
    console.log('🚀 ~ getPosRewardsData ~ positionBaseList:', positionBaseList)
    setPosRewardsDataLoading(true)
    const batchFetchPosRewardersAmountParams: any = positionBaseList
      ?.filter((item: PosBaseInfo) => item.posType !== 'farms')
      .map((item: PosBaseInfo) => {
        const poolInfo = posPoolsOriginalData[item.clmmPool]
        return {
          pool_id: item.clmmPool,
          position_id: item.posId,
          coin_type_a: item.coinTypeA,
          coin_type_b: item.coinTypeB,
          rewarder_types: poolInfo?.rewarder_infos?.map(item => item.coinAddress)
        }
      })

    console.log('🚀 ~ file: useGetPosRewards.ts:15 ~ getPosRewardsData ~ batchFetchPosRewardersAmountParams:', batchFetchPosRewardersAmountParams)

    let posRewardsData: Record<string, PosReward[]> = {}

    if (batchFetchPosRewardersAmountParams && batchFetchPosRewardersAmountParams.length > 0) {
      try {
        const res = await clmmSdk!.Rewarder.fetchPosRewardersAmount(batchFetchPosRewardersAmountParams)
        console.log('🚀🚀🚀 ~ useGetPosRewards.ts:36 ~ getPosRewardsData ~ res:', res)
        const coinTypeList = res
          ?.map(item => {
            return item.rewarder_amounts.map(item => {
              return item.coin_type as CoinType
            })
          })
          .flat()
        const tokenMap = await getTokenListInfo(coinTypeList)

        let newRewarderAmount: PosReward[]
        posRewardsData = Object.fromEntries(
          res.map((item, key) => {
            newRewarderAmount = []
            for (const rewarder of item.rewarder_amounts) {
              const { amount_owned, coin_type } = rewarder
              const token = tokenMap?.get(coin_type as CoinType) as Token
              newRewarderAmount.push({
                ...rewarder,
                display_amount_owed: bnToAmount(amount_owned.toString(), token?.decimals || 0),
                amount_owed: amount_owned.toString(),
                token,
                coin_address: coin_type
              })
            }
            return [item.position_id, newRewarderAmount]
          })
        )
        console.log('getPosRewardsData ~ posRewardsData:', posRewardsData)
      } catch (error) {
        console.log('getPosRewardsData ~ error:', error)
      }
    }

    setPosRewardsData(posRewardsData)
    setPosRewardsDataLoading(false)
  }

  const formatPosRewardsData = async (res: any) => {
    let posRewardsData: Record<string, PosReward[]> = {}

    const coinTypeList = res
      ?.map((item: any) => {
        return item.rewarderAmountOwed.map((item: any) => {
          return item.coin_address
        })
      })
      .flat()
    const tokenMap = await getTokenListInfo(coinTypeList)
    posRewardsData = Object.fromEntries(
      res.map((item: any) => {
        for (const rewarder of item.rewarderAmountOwed) {
          const { amount_owed, coin_address } = rewarder
          const token = tokenMap?.get(coin_address)
          rewarder.display_amount_owed = bnToAmount(amount_owed.toString(), token?.decimals || 0)
          rewarder.amount_owed = amount_owed.toString()
          rewarder.token = token
        }
        return [item.positionId, item.rewarderAmountOwed]
      })
    )

    return posRewardsData
  }

  return {
    formatPosRewardsData,
    getPosRewardsData
  }
}
