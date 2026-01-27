import { BurnVestRedeemPayloadParams } from '@/types/vest'
import { useSdk } from '@cetus/sdk-factory'
import { clmmConfig } from '@cetus/types'
import { Transaction } from '@mysten/sui/transactions'

export default function useBurnPosRedeem() {
  const burnSdk = useSdk('burn')
  const getBurnPosRedeemPayload = (params: BurnVestRedeemPayloadParams[], tx: Transaction) => {
    console.log('🚀🚀🚀 ~ useBurnRedeem.ts:8 ~ getBurnPosRedeemPayload ~ params:', params)
    const options = params.map(item => {
      const { clmmPoolId, clmmPositionId, period, coinTypeA, coinTypeB, posId } = item
      return {
        clmm_versioned_id: clmmConfig.clmm_vest?.config?.versioned_id,
        clmm_vester_id: clmmConfig.clmm_vest?.config?.clmm_vest_id,
        clmm_pool_id: clmmPoolId,
        burn_position_id: posId,
        period,
        clmm_position_id: clmmPositionId,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB
        // vest_coin_type: clmmConfig.clmm_vest?.config?.cetus_coin_type
      }
    })
    console.log('🚀🚀🚀 ~ useBurnRedeem.ts:27 ~ getBurnPosRedeemPayload ~ options:', options)
    burnSdk?.Burn.redeemVestPayload(options, tx)
    return {
      params: options,
      claimType: 'burn'
    }
  }
  return { getBurnPosRedeemPayload }
}
