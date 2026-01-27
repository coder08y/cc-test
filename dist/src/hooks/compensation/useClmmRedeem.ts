import { ClmmVestRedeemPayloadParams } from '@/types/vest'
import { useSdk } from '@cetus/sdk-factory'
import { Transaction } from '@mysten/sui/transactions'

export default function useClmmVestRedeem() {
  const clmmSdk = useSdk('clmm')
  const getClmmVestRedeemPayload = (params: ClmmVestRedeemPayloadParams[], tx: Transaction) => {
    const options = params.map(item => {
      const { clmmPoolId, clmmPositionId, period, coinTypeA, coinTypeB } = item
      return {
        clmm_pool_id: clmmPoolId,
        clmm_position_id: clmmPositionId,
        period,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB
      }
    })
    clmmSdk?.Vest.buildRedeemPayload(options, tx)
    return {
      params: options,
      type: 'clmm'
    }
  }
  return { getClmmVestRedeemPayload }
}
