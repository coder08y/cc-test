import { CollectDlmmRewardAndFeeParams, CollectDlmmRewardPayloadParams } from '@/types/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { Transaction } from '@mysten/sui/transactions'

export default function useDlmmPosCollect() {
  const dlmmSdk = useSdk('dlmm')

  const collectRewardPayload = (params: CollectDlmmRewardPayloadParams[], tx?: Transaction) => {
    const collectDlmmRewardParams = params.map(param => {
      const { dlmmPool, positionId, rewardCoins, coinTypeA, coinTypeB } = param

      return {
        pool_id: dlmmPool,
        position_id: positionId,
        reward_coins: rewardCoins,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB
      }
    })
    const payload = dlmmSdk?.Position.collectRewardPayload(collectDlmmRewardParams, tx)
    return payload
  }

  const collectRewardAndFeePayload = (params: CollectDlmmRewardAndFeeParams[], tx?: Transaction) => {
    const collectDlmmRewardAndFee = params.map(param => {
      const { dlmmPool, positionId, rewardCoins, coinTypeA, coinTypeB } = param

      return {
        pool_id: dlmmPool,
        position_id: positionId,
        reward_coins: rewardCoins,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB
      }
    })

    const payload = dlmmSdk!.Position.collectRewardAndFeePayload(collectDlmmRewardAndFee, tx)
    return payload
  }

  return { collectRewardPayload, collectRewardAndFeePayload }
}
