import useBurn from '@/hooks/burn/useBurn'
import useDlmmPosCollect from '@/hooks/dlmm-position/useDlmmPosCollect'
import { MsafeTransactionSubType, PosBaseInfo, PosReward } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { deleteOx } from '@/utils/contract-helper'
import { spitClaimDlmmPosList } from '@/utils/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { CollectRewardAndFeeOption } from '@cetusprotocol/dlmm-sdk'
import { HarvestFeeAndClmmRewarderParams } from '@cetusprotocol/farms-sdk'
import { CollectRewarderParams } from '@cetusprotocol/sui-clmm-sdk'
import useFarms from '../farms/useFarms'

export default function usePosClaimFeeAndReward() {
  const clmmSdk = useSdk('clmm')
  const dlmmSdk = useSdk('dlmm')
  const farmsSdk = useSdk('farms')
  const burnSdk = useSdk('burn')
  const { getBurnClaimTxPayload } = useBurn()
  const { getHarvestFarmsTxPayload } = useFarms()
  const { collectRewardAndFeePayload } = useDlmmPosCollect()

  /**
   * 收割仓位的fee和reward，支持clmm, farms, burn
   * @param params
   * @returns
   */
  interface RewardTxPayloadProps {
    posType: 'clmm' | 'farms' | 'burn'
    id: string
    clmmPool: string
    coinTypeA: string
    coinTypeB: string
    rewarderCoinTypes?: any
    account?: string
    dlmmPool?: string
  }
  const getPosClaimFeeAndRewardTxPayload = async (params: RewardTxPayloadProps) => {
    const { posType, id, clmmPool, coinTypeA, coinTypeB, rewarderCoinTypes, account, dlmmPool } = params
    let tx, msafeParams
    if (posType === 'clmm') {
      const parameter = {
        pool_id: clmmPool,
        pos_id: id,
        rewarder_coin_types: rewarderCoinTypes,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        collect_fee: true
      }

      tx = await clmmSdk!.Rewarder.collectRewarderPayload(parameter)

      msafeParams = {
        action: MsafeTransactionSubType.ClaimFeeAndMining,
        txbParams: parameter
      }
    } else if (posType === 'farms') {
      const parameter = {
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        clmm_pool_id: clmmPool,
        position_nft_id: id,
        clmm_rewarder_types: rewarderCoinTypes,
        collect_fee: true
      }

      tx = await farmsSdk!.Farms.claimFeeAndClmmReward(parameter)

      msafeParams = {
        action: 'FarmingClaimFeeAndReward',
        txbParams: parameter
      }
    } else if (posType === 'burn') {
      const parameter = {
        poolAddress: clmmPool,
        posId: id,
        coinTypeA,
        coinTypeB,
        account: account as string,
        rewarderCoinTypes
      }

      tx = getBurnClaimTxPayload(parameter)
    } else if (posType === 'dlmm') {
      const parameter = {
        pool_id: dlmmPool,
        pos_id: id,
        rewarder_coin_types: rewarderCoinTypes,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB
      }
      const params: any = {
        dlmmPool,
        positionId: id,
        rewardCoins: rewarderCoinTypes,
        coinTypeA,
        coinTypeB
      }

      tx = collectRewardAndFeePayload([params])

      msafeParams = {
        action: 'DlmmClaimFeeAndReward',
        txbParams: parameter
      }
    }

    return {
      tx,
      msafeParams
    }
  }

  /**
   * 批量收割Fee和Rewards
   * @param posBaseList
   * @param posRewardsData
   * @param account
   * @returns
   */
  const getBatchHarvestFeeAndRewardsTxPayload = async (
    posBaseList: (PosBaseInfo | DlmmPosBaseInfo)[],
    posRewardsData: Record<string, PosReward[]>,
    account: string
  ) => {
    console.log('🚀 ~ getBatchHarvestFeeAndRewardsTxPayload ~ posBaseList:', posBaseList, posRewardsData, account)
    const clmmHarvestParams: CollectRewarderParams[] = []
    const framsHavestParams: HarvestFeeAndClmmRewarderParams[] = []
    const burnHavestParams: CollectRewarderParams[] = []

    const clmmPosIdList = posBaseList.filter(item => item.posType !== 'dlmm').map((item: any) => item) as PosBaseInfo[]
    const dlmmPosIdList = posBaseList.filter(item => item.posType === 'dlmm').map((item: any) => item) as DlmmPosBaseInfo[]

    const batchDlmmPosList = spitClaimDlmmPosList(dlmmPosIdList, 1800)
    const batchDlmmPosOptionList: CollectRewardAndFeeOption[][] = []
    batchDlmmPosList.forEach(batch => {
      const options: CollectRewardAndFeeOption[] = []

      batch.forEach(position => {
        const rewarderCoinTypes = posRewardsData[position.id]?.map((item: PosReward) => fixCoinType(item.coin_address, true)) || []
        options.push({
          pool_id: position.dlmmPool,
          position_id: position.id,
          reward_coins: rewarderCoinTypes,
          coin_type_a: position.coinTypeA,
          coin_type_b: position.coinTypeB
        })
      })
      batchDlmmPosOptionList.push(options)
    })

    clmmPosIdList.forEach(position => {
      const rewarderCoinTypes = posRewardsData[position.posId]?.map((item: PosReward) => fixCoinType(item.coin_address, true)) || []

      if (position.posType == 'clmm') {
        clmmHarvestParams.push({
          pool_id: position.clmmPool,
          pos_id: position.id,
          collect_fee: true,
          rewarder_coin_types: rewarderCoinTypes,
          coin_type_a: deleteOx(position.coinTypeA),
          coin_type_b: deleteOx(position.coinTypeB)
        })
      } else if (position.posType == 'farms') {
        console.log('🚀 ~ getBatchHarvestFeeAndRewardsTxPayload ~ clmm rewarderCoinTypes:', {
          position,
          posRewardsData
        })
        framsHavestParams.push({
          pool_id: position.farmsPool || '',
          position_nft_id: position.id,
          clmm_pool_id: position.clmmPool,
          collect_fee: true,
          collect_farms_rewarder: true,
          clmm_rewarder_types: [],
          coin_type_a: position.coinTypeA,
          coin_type_b: position.coinTypeB
        })
      } else {
        burnHavestParams.push({
          pos_id: position?.id || '',
          pool_id: position.clmmPool,
          coin_type_a: position.coinTypeA,
          coin_type_b: position.coinTypeB,
          rewarder_coin_types: rewarderCoinTypes,
          account
        })
      }
    })

    // 收割 farms reward 和 clmm 的 fee 和 reward
    let tx = await farmsSdk!.Farms.batchHarvestAndClmmFeePayload(framsHavestParams, clmmHarvestParams)

    const burnRewardList = []
    for (let i = 0; i < burnHavestParams.length; i++) {
      const item = burnHavestParams[i]
      if (item?.rewarder_coin_types.length > 0) {
        burnRewardList.push(item)
      }
    }
    tx = burnSdk!.Burn.createCollectFeesPayload(burnHavestParams, tx)

    tx = burnSdk!.Burn.createCollectRewardsPayload(burnRewardList, tx)

    console.log('🚀 ~ getBatchHarvestFeeAndRewardsTxPayload ~ batchDlmmPosOptionList:', batchDlmmPosOptionList)

    const txs = [tx]

    batchDlmmPosOptionList.forEach((item, index) => {
      if (index === 0) {
        tx = dlmmSdk!.Position.collectRewardAndFeePayload(item, tx)
      } else {
        const tx = dlmmSdk!.Position.collectRewardAndFeePayload(item)
        txs.push(tx)
      }
    })

    return { txs }
  }

  /**
   * 收割仓位的fee和mining和farming奖励，支持clmm, farms, burn
   * @param params
   * @returns
   */
  const getPosClaimFeeAndRewardAndFarmsTxPayload = async (
    params: RewardTxPayloadProps & {
      farmsPool: string
    }
  ) => {
    console.log('🚀 ~ usePosClaimFeeAndReward ~ params:', params)

    const { id, farmsPool } = params
    let txf
    const { tx, msafeParams } = await getPosClaimFeeAndRewardTxPayload(params)
    txf = tx

    if (farmsPool) {
      const { tx, msafeParams } = await getHarvestFarmsTxPayload(farmsPool, id, txf)
      return { tx, msafeParams }
    }

    console.log(`🚀 ~ getPosClaimFeeAndRewardAndFarmsTxPayload ~ { tx, msafeParams }:`, { tx, msafeParams })
    return { tx, msafeParams }
  }
  return {
    getPosClaimFeeAndRewardAndFarmsTxPayload,
    getPosClaimFeeAndRewardTxPayload,
    getBatchHarvestFeeAndRewardsTxPayload
  }
}
