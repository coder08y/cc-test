import useGlobalStore from '@/store/common/global'
import { MsafeTransactionSubType } from '@/types'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { d, fixDown } from '@cetus/utils'
import { Transaction } from '@mysten/sui/transactions'

type GetRemoveParams = {
  posId: string
  poolAddress: string
  coinTypeA: string
  coinTypeB: string
  amountA: string
  amountB: string
  liquidity: string
  lowerTick: number
  upperTick: number
  posType: 'clmm' | 'farms'
  rewarderCoinTypes: any
  farmsPoolId?: string
  farmsPosId?: string
  isVestingPos?: boolean
  isAutoClaim: boolean
}

export default function usePosRemove() {
  const clmmSdk = useSdk('clmm')
  const farmsSdk = useSdk('farms')
  const { liquiditySlippage } = useGlobalStore()
  const { currentAccount } = useAccountStore()
  // 受损的仓位移除全部时候
  const getRemoveTsPayload = async (params: GetRemoveParams, isRemoveAll?: boolean, txb?: Transaction) => {
    console.log('🚀 ~ getRemoveTsPayload ~ isRemoveAll:', isRemoveAll)
    console.log('🚀 ~ getRemoveTsPayload ~ params:', params)
    const {
      posId,
      poolAddress,
      coinTypeA,
      coinTypeB,
      amountA,
      amountB,
      liquidity,
      lowerTick,
      upperTick,
      posType,
      rewarderCoinTypes,
      farmsPoolId,
      farmsPosId,
      isAutoClaim
    } = params
    const minAmountA = d(amountA).mul(d(1).sub(d(liquiditySlippage)))
    const minAmountB = d(amountB.toString()).mul(d(1).sub(d(liquiditySlippage)))
    console.log('🚀 ~ getRemoveTsPayload ~ minAmountA:', minAmountA, minAmountB)

    if (posType === 'clmm') {
      const parameter = {
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        pool_id: poolAddress,
        pos_id: posId,
        delta_liquidity: liquidity,
        min_amount_a: fixDown(minAmountA.toString(), 0) || '',
        min_amount_b: fixDown(minAmountB.toString(), 0) || '',
        collect_fee: isAutoClaim || isRemoveAll,
        rewarder_coin_types: isAutoClaim || isRemoveAll ? rewarderCoinTypes : []
      }
      console.log('🚀 ~ getRemoveTsPayload ~ parameter:', parameter)

      const tx = await clmmSdk!.Position.removeLiquidityPayload(parameter, txb)

      const msafeParams = {
        action: MsafeTransactionSubType.DecreaseLiquidity,
        txbParams: parameter
      }
      console.log('🚀 ~ getRemoveTsPayload ~ msafeParams:', tx, msafeParams)
      return {
        tx,
        msafeParams
      }
    } else {
      const parameter = {
        pool_id: farmsPoolId || '',
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        position_nft_id: farmsPosId || '',
        clmm_pool_id: poolAddress,
        min_amount_a: fixDown(minAmountA.toString(), 0) || '',
        min_amount_b: fixDown(minAmountB.toString(), 0) || '',
        collect_rewarder: !isRemoveAll ? false : true,
        clmm_rewarder_types: isAutoClaim || isRemoveAll ? rewarderCoinTypes : [],
        delta_liquidity: liquidity,
        unstake: !isRemoveAll ? false : true,
        close_position: !isRemoveAll ? false : false
      }
      console.log('🚀 ~ getRemoveTsPayload ~ parameter:', parameter)

      const tx = await farmsSdk!.Farms.removeLiquidityPayload(parameter, txb)

      const msafeParams = {
        action: 'FarmingDecreaseLiquidity',
        txbParams: parameter
      }
      console.log('🚀 ~ getRemoveTsPayload ~ msafeParams:', msafeParams, tx)
      return {
        tx,
        msafeParams
      }
    }
  }

  // 移除并关闭仓位
  const getCloseTsPayload = async (params: GetRemoveParams, txb?: Transaction) => {
    const {
      posId,
      poolAddress,
      coinTypeA,
      coinTypeB,
      amountA,
      amountB,
      liquidity,
      lowerTick,
      upperTick,
      posType,
      rewarderCoinTypes,
      farmsPoolId,
      farmsPosId
    } = params

    const minAmountA = d(amountA).mul(d(1).sub(d(liquiditySlippage)))
    const minAmountB = d(amountB.toString()).mul(d(1).sub(d(liquiditySlippage)))
    console.log('🚀 ~ getCloseTsPayload ~ minAmountA:', params, minAmountA.toString(), minAmountB.toString())
    console.log('🚀 ~ getCloseTsPayload ~ parameter.rewarderCoinTypes:', rewarderCoinTypes)

    if (posType === 'clmm') {
      const parameter = {
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        pool_id: poolAddress,
        pos_id: posId || '',
        min_amount_a: fixDown(minAmountA.toString(), 0) || '',
        min_amount_b: fixDown(minAmountB.toString(), 0) || '',
        rewarder_coin_types: rewarderCoinTypes,
        collect_fee: false
      }
      console.log('🚀 ~ getCloseTsPayload ~ parameter:', parameter)

      const tx = await clmmSdk!.Position.closePositionPayload(parameter, txb)

      const msafeParams = {
        action: MsafeTransactionSubType.RemoveLiquidity,
        txbParams: parameter
      }
      console.log('🚀 ~ getCloseTsPayload ~ msafeParams:', tx, msafeParams)
      return {
        tx,
        msafeParams
      }
    } else {
      const parameter = {
        pool_id: farmsPoolId || '',
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        position_nft_id: farmsPosId || '',
        clmm_pool_id: poolAddress,
        min_amount_a: fixDown(minAmountA.toString(), 0) || '',
        min_amount_b: fixDown(minAmountB.toString(), 0) || '',
        collect_fee: true,
        collect_rewarder: true,
        clmm_rewarder_types: rewarderCoinTypes,
        delta_liquidity: liquidity,
        unstake: true,
        close_position: true,
        clmm_position_id: posId
      }
      console.log('🚀 ~ getCloseTsPayload ~ parameter:', parameter)
      const tx = await farmsSdk!.Farms.removeLiquidityPayload(parameter, txb)

      const msafeParams = {
        action: MsafeTransactionSubType.FarmingRemoveLiquidity,
        txbParams: parameter
      }
      console.log('🚀 ~ getCloseTsPayload ~ msafeParams:', msafeParams, tx)
      return {
        tx,
        msafeParams
      }
    }
  }

  const getCloseTsPayloadAll = async (paramsList: GetRemoveParams[]) => {
    console.log('🚀 ~ getCloseTsPayloadAll ~ paramsList:', paramsList)

    const newTx = new Transaction()
    newTx.setSender(currentAccount?.address)

    const results = await Promise.all(
      paramsList.map(params => {
        if (params?.isVestingPos) {
          return getRemoveTsPayload(params, true, newTx)
        } else {
          return getCloseTsPayload(params, newTx)
        }
      })
    )

    console.log('🚀 ~ getCloseTsPayloadAll ~ results:', results)
    return results[0] // 或返回全部 results 看需求
  }

  return {
    getRemoveTsPayload,
    getCloseTsPayload,
    getCloseTsPayloadAll
  }
}
