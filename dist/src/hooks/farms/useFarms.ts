import { MsafeTransactionSubType } from '@/types'
import { useSdk } from '@cetus/sdk-factory'
import { Transaction } from '@mysten/sui/transactions'

type HarvestParams = {
  pool_id: string
  position_nft_id: string
}

export default function useFarms() {
  const farmsSdk = useSdk('farms')

  /**
   * Farms Stake Transaction Payload
   * @param clmmPosId
   * @param poolId
   * @returns
   */
  const getStakeTxPayload = async (clmmPosId: string, poolId: string, clmmPool: string, coinTypeA: string, coinTypeB: string) => {
    const parameter = {
      pool_id: poolId,
      clmm_position_id: clmmPosId,
      clmm_pool_id: clmmPool,
      coin_type_a: coinTypeA,
      coin_type_b: coinTypeB
    }
    console.log('🚀 ~ getStakeTxPayload ~ parameter:', parameter)
    const tx = await farmsSdk!.Farms.depositPayload(parameter)
    const msafeParams = {
      action: MsafeTransactionSubType.FarmingStake,
      txbParams: parameter
    }

    return {
      tx,
      msafeParams
    }
  }

  /**
   * Farms Unstake Transaction Payload
   * @param poolId
   * @param positionNftId 传posBaseInfo里的id就行
   * @returns
   */
  const getUnstakeTxPayload = async (poolId: string, positionNftId: string) => {
    const parameter = {
      pool_id: poolId,
      position_nft_id: positionNftId
    }

    const tx = await farmsSdk!.Farms.withdrawPayload(parameter)

    const msafeParams = {
      action: MsafeTransactionSubType.FarmingUnstake,
      txbParams: parameter
    }
    return {
      tx,
      msafeParams
    }
  }

  /**
   * Farms claim rewards
   * @param poolId
   * @param positionNftId
   * @returns
   */
  const getHarvestFarmsTxPayload = async (poolId: string, positionNftId: string, txf?: Transaction) => {
    const parameter = {
      pool_id: poolId,
      position_nft_id: positionNftId
    }
    const tx = await farmsSdk!.Farms.harvestPayload(parameter, txf)

    const msafeParams = {
      action: MsafeTransactionSubType.FarmingHarvest,
      txbParams: parameter
    }
    return {
      tx,
      msafeParams
    }
  }

  /**
   * Batch Harvest Farms rewards
   * @param params
   * @returns
   */
  const getBatchHarvestFarmsTxPayload = async (params: HarvestParams[]) => {
    const tx = await farmsSdk!.Farms.batchHarvestPayload(params)
    const msafeParams = {
      action: 'FarmingBatchHarvest',
      txbParams: params
    }
    return {
      tx,
      msafeParams
    }
  }

  return {
    getStakeTxPayload,
    getUnstakeTxPayload,
    getHarvestFarmsTxPayload,
    getBatchHarvestFarmsTxPayload
  }
}
