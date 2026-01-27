import useGlobalStore from '@/store/common/global'
import { DlmmPosAddLiquidityParams, DlmmPreAddParams } from '@/types/dlmm'
import { getBatchBinInfo } from '@/utils/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetusprotocol/common-sdk'
import { AddLiquidityOption, CalculateAddLiquidityAutoFillOption, CalculateAddLiquidityOption } from '@cetusprotocol/dlmm-sdk'
import { Transaction } from '@mysten/sui/transactions'
import useDlmmPosCollect from './useDlmmPosCollect'
export default function useDlmmPosAdd() {
  const dlmmSdk = useSdk('dlmm')
  const { liquiditySlippage } = useGlobalStore()
  const { collectRewardAndFeePayload } = useDlmmPosCollect()
  const dlmmPreAdd = async (params: DlmmPreAddParams) => {
    const { activeId, binStep, lowerBinId, upperBinId, amount, fromToken, toToken, strategy, fixAmountA, isReverse, isAutoFill, otherAmount, pool } =
      params
    let amount_in_active_bin
    if (pool) {
      amount_in_active_bin = await dlmmSdk?.Position?.getActiveBinIfInRange(
        pool?.bin_manager.bin_manager_handle,
        lowerBinId,
        upperBinId,
        activeId,
        binStep
      )
    }

    //todo: 实际lock一边的时候不能按autofill预计算
    const realAutoFill = isAutoFill && amount_in_active_bin
    // console.log('🚀🚀🚀 ~ useDlmmPosAdd.ts:10 ~ dlmmPreAdd ~ params:', fixAmountA, params)
    const calculateAddLiquidityInfoParams: CalculateAddLiquidityOption | CalculateAddLiquidityAutoFillOption = {
      active_id: activeId,
      bin_step: binStep,
      lower_bin_id: lowerBinId,
      upper_bin_id: upperBinId,
      // amount_a_in_active_bin: amount_in_active_bin?.amount_a || '0',
      // amount_b_in_active_bin: amount_in_active_bin?.amount_b || '0',
      active_bin_of_pool: amount_in_active_bin,
      pool_id: pool?.id,
      strategy_type: strategy,
      ...(realAutoFill
        ? {
            fix_amount_a: fixAmountA,
            coin_amount: amount
          }
        : {
            amount_a: fixAmountA ? amount : otherAmount,
            amount_b: fixAmountA ? otherAmount : amount
          })
    }

    console.log('🚀🚀🚀 ~ useDlmmPosAdd.ts:30 ~ dlmmPreAdd ~ calculateAddLiquidityInfoParams:', calculateAddLiquidityInfoParams)
    const binInfos = await dlmmSdk?.Position.calculateAddLiquidityInfo(calculateAddLiquidityInfoParams)
    console.log('🚀🚀🚀 ~ useDlmmPosAdd.ts:32 ~ dlmmPreAdd ~ binInfos:', binInfos, amount, otherAmount, fixAmountA, isReverse)

    const coinAmountA = d(binInfos?.amount_a)
      .div(10 ** (isReverse ? toToken?.decimals : fromToken?.decimals))
      .toString()
    const coinAmountB = d(binInfos?.amount_b)
      .div(10 ** (isReverse ? fromToken?.decimals : toToken?.decimals))
      .toString()

    return {
      displayCoinAmountA: isReverse ? coinAmountB : coinAmountA,
      displayCoinAmountB: isReverse ? coinAmountA : coinAmountB,
      coinAmountA,
      coinAmountB,
      binInfos
    }
  }
  const getDlmmPosAddLiquidityPayload = (params: DlmmPosAddLiquidityParams, isAutoClaim: boolean) => {
    const { dlmmPool, binInfos, coinTypeA, coinTypeB, positionId, activeId, collectFee, rewardCoins, strategy, binStep } = params
    if (binInfos && binInfos.bins && binInfos.bins.length > 0) {
      const validBinInfos = binInfos.bins.filter(bin => bin.amount_a !== '0' || bin.amount_b !== '0')
      const payloads: Transaction[] = []
      if (validBinInfos?.length > 1000) {
        // 如果bins数量超过1000，分批处理
        const batchSize = 1000
        const totalBatches = Math.ceil(validBinInfos.length / batchSize)
        for (let i = 0; i < totalBatches; i++) {
          const batchBinInfo = getBatchBinInfo(validBinInfos, i, batchSize)

          const dlmmPosAddLiquidityParams: AddLiquidityOption = {
            position_id: positionId,
            active_id: activeId,
            reward_coins: [],
            pool_id: dlmmPool,
            bin_infos: batchBinInfo,
            collect_fee: false,
            coin_type_a: coinTypeA,
            coin_type_b: coinTypeB,
            strategy_type: strategy,
            max_price_slippage: Number(liquiditySlippage),
            use_bin_infos: false,
            bin_step: binStep
          }

          const payload = dlmmSdk?.Position.addLiquidityPayload(dlmmPosAddLiquidityParams)
          payloads.push(payload)
          let claimTx = null
          if (isAutoClaim && i === totalBatches - 1) {
            dlmmPosAddLiquidityParams.collect_fee = false
            dlmmPosAddLiquidityParams.reward_coins = rewardCoins
            claimTx = collectRewardAndFeePayload(
              [
                {
                  dlmmPool,
                  positionId,
                  rewardCoins,
                  coinTypeA,
                  coinTypeB
                }
              ],
              payload
            )
          }
        }
      } else {
        const dlmmPosAddLiquidityParams: AddLiquidityOption = {
          position_id: positionId,
          active_id: activeId,
          reward_coins: isAutoClaim ? rewardCoins : [],
          pool_id: dlmmPool,
          bin_infos: binInfos,
          collect_fee: isAutoClaim,
          coin_type_a: coinTypeA,
          coin_type_b: coinTypeB,
          strategy_type: strategy,
          max_price_slippage: Number(liquiditySlippage),
          use_bin_infos: false,
          bin_step: binStep
        }
        console.log('🚀🚀🚀 ~ useDlmmPosAdd.ts:66 ~ getDlmmPosAddLiquidityPayload ~ dlmmPosAddLiquidityParams:', dlmmPosAddLiquidityParams)
        const payload = dlmmSdk?.Position.addLiquidityPayload(dlmmPosAddLiquidityParams)
        console.log('🚀🚀🚀 ~ useDlmmPosAdd.ts:67 ~ getDlmmPosAddLiquidityPayload ~ payload:', payload)
        payloads.push(payload)
      }

      return payloads
    }
  }

  return { dlmmPreAdd, getDlmmPosAddLiquidityPayload }
}
