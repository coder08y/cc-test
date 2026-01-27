import useDlmmPositionStore from '@/store/dlmm-position'
import { PosFee, PosReward } from '@/types'
import { DlmmPoolData, DlmmPosBaseInfo } from '@/types/dlmm'
import { spitClaimDlmmPosList } from '@/utils/dlmm'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { CoinType, Token } from '@cetus/types'
import { bnToAmount } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { CollectRewardAndFeeOption } from '@cetusprotocol/dlmm-sdk'

export default function useGetDlmmPosFeeAndReward() {
  const dlmmSdk = useSdk('dlmm')
  const { getTokenListInfo } = useGetToken()
  const { setDlmmPosFeeData, setDlmmPosRewardsData, setDlmmPosFeeAndRewardsLoading } = useDlmmPositionStore()

  const getDlmmPosFeeAndReward = async (positionBaseList: DlmmPosBaseInfo[], posPoolsOriginalData: Record<string, DlmmPoolData>) => {
    const batchPosList = spitClaimDlmmPosList(positionBaseList, 2000)
    const batches: CollectRewardAndFeeOption[][] = []
    batchPosList.forEach(batch => {
      const options: CollectRewardAndFeeOption[] = []
      batch.forEach(position => {
        const poolInfo = posPoolsOriginalData?.[position.dlmmPool]
        options.push({
          pool_id: position.dlmmPool,
          position_id: position.id,
          reward_coins: poolInfo.reward_manager.rewards.map(r => r.reward_coin),
          coin_type_a: position.coinTypeA,
          coin_type_b: position.coinTypeB
        })
      })
      batches.push(options)
    })

    setDlmmPosFeeAndRewardsLoading(true)
    try {
      let res: any
      // 分批处理所有批次
      if (batches.length > 1) {
        // 多个批次，需要合并结果
        const allResults = []
        for (const batch of batches) {
          const batchRes = await dlmmSdk?.Position.fetchPositionFeeAndReward(batch)
          allResults.push(batchRes)
        }

        // 合并所有批次的结果
        res = {
          feeData: {},
          rewardData: {}
        }

        allResults.forEach(batchRes => {
          if (batchRes?.feeData) {
            Object.assign(res.feeData, batchRes.feeData)
          }
          if (batchRes?.rewardData) {
            Object.assign(res.rewardData, batchRes.rewardData)
          }
        })

        console.log('🚀 ~ getDlmmPosFeeAndReward ~ merged res:', res)
      } else {
        // 只有一个批次，直接处理
        res = await dlmmSdk?.Position.fetchPositionFeeAndReward(batches[0])
        console.log('🚀 ~ getDlmmPosFeeAndReward ~ res:', res)
      }

      /** 处理 Fee 数据 */
      if (res?.feeData) {
        const dlmmPosFeeData: Record<string, PosFee> = Object.fromEntries(
          positionBaseList.map(position => {
            const feeItem = res.feeData[position.id]
            const [feeA, feeB] = !position.isReverse ? [feeItem.fee_owned_a, feeItem.fee_owned_b] : [feeItem.fee_owned_b, feeItem.fee_owned_a]

            return [
              position.id,
              {
                displayFeeOwedA: bnToAmount(feeA.toString(), position?.displayTokenA?.decimals || 0),
                displayFeeOwedB: bnToAmount(feeB.toString(), position?.displayTokenB?.decimals || 0),
                feeOwedA: feeItem.fee_owned_a,
                feeOwedB: feeItem.fee_owned_b
              }
            ]
          })
        )
        setDlmmPosFeeData(dlmmPosFeeData)
        console.log('🚀 ~ getDlmmPosFeeAndReward ~ dlmmPosFeeData:', dlmmPosFeeData)
      }

      /** 处理 Reward 数据 */
      if (res?.rewardData) {
        // 提取 coinType 并去重
        const coinTypeList = [
          ...new Set(
            Object.values(res.rewardData)
              .flatMap((item: any) => item.rewards.map((r: any) => fixCoinType(r.coin_type, false) as CoinType))
              .filter(Boolean)
          )
        ]

        const tokenMap = await getTokenListInfo(coinTypeList)

        const dlmmPosRewardsData: Record<string, PosReward[]> = Object.fromEntries(
          Object.values(res.rewardData).map((item: any) => {
            const rewardList: PosReward[] = item.rewards.map((rewarder: any) => {
              const rewardCoinType = fixCoinType(rewarder.coin_type, false) as CoinType
              const token = tokenMap?.get(rewardCoinType) as Token
              return {
                ...rewarder,
                display_amount_owed: bnToAmount(rewarder.reward_owned.toString(), token?.decimals || 0),
                amount_owed: rewarder.reward_owned.toString(),
                token,
                coin_address: rewardCoinType
              }
            })
            return [item.position_id, rewardList]
          })
        )
        console.log('🚀 ~ getDlmmPosFeeAndReward ~ dlmmPosRewardsData:', dlmmPosRewardsData)
        setDlmmPosRewardsData(dlmmPosRewardsData)
      }
    } catch (error) {
      console.log('🚀 ~ getDlmmPosFeeAndReward ~ error:', error)
    } finally {
      setDlmmPosFeeAndRewardsLoading(false)
    }
  }

  return { getDlmmPosFeeAndReward }
}
