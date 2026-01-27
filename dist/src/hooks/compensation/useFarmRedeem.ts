import { FarmRedeemGroupedParam } from '@/types/vest'
import { useSdk } from '@cetus/sdk-factory/src'
import { useAccountStore } from '@cetus/stores'
import { RedeemOption } from '@cetusprotocol/sui-clmm-sdk'
import { Transaction } from '@mysten/sui/transactions'

// 已下掉的farms
const droppedFarms = [
  '0xa528b26eae41bcfca488a9feaa3dca614b2a1d9b9b5c78c256918ced051d4c50',
  '0x6c545e78638c8c1db7a48b282bb8ca79da107993fcb185f75cedc1f5adb2f535',
  '0xf26ad51dc0cf90a4c66ad82a24f66ecf9852547310d123147ed94d72f6c24865'
]

export default function useFarmRedeem() {
  const clmmSdk = useSdk('clmm')
  const farmsSdk = useSdk('farms')

  const { currentAccount } = useAccountStore()

  const getFarmVestRedeemPayload = async (params: FarmRedeemGroupedParam, tx: Transaction) => {
    console.log('🚀🚀🚀 ~ useFarmRedeem.ts:13 ~ getFarmVestRedeemPayload ~ params:', JSON.stringify(params))

    // Step 1: 退出 Farming Pool
    const withdrawParams = {
      pool_id: params?.farmingPoolId,
      position_nft_id: params?.farmPositionId
    }
    const pos = await farmsSdk!.Farms.withdrawReturnPayload(withdrawParams, tx)
    console.log('🚀 ~ getFarmVestRedeemPayload ~ pos:', pos, tx)

    // await sleepTime(500)
    const redeemParms: RedeemOption[] = []
    params?.period.forEach(periodItem => {
      const { clmmPoolId, coinTypeA, coinTypeB } = params
      // 提取公共字段
      redeemParms.push({
        clmm_pool_id: clmmPoolId,
        clmm_position_id: pos,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        period: periodItem
      })
    })

    // // Step 2: 赎回 Vesting 奖励
    clmmSdk!.Vest.buildRedeemPayload(redeemParms, tx)

    // // Step 3: 重新注入 Farming Pool
    const depositParams = {
      clmm_pool_id: params?.clmmPoolId,
      clmm_position_id: pos,
      coin_type_a: params?.coinTypeA,
      coin_type_b: params?.coinTypeB,
      pool_id: params?.farmingPoolId
    }

    // toDo: 已下掉的farms和liquidity为0的不再deposit到farms
    if (droppedFarms.includes(params?.clmmPoolId) || params?.liquidity === '0') {
      tx.transferObjects([pos], tx.pure.address(currentAccount?.address as string))
    } else {
      farmsSdk!.Farms.depositPayload(depositParams, tx)
    }

    return {
      params: {
        withdrawParams,
        redeemParms,
        depositParams
      },
      type: 'farms'
    }
  }

  return { getFarmVestRedeemPayload }
}
