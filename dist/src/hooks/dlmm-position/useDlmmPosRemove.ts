import { DlmmPosClosePositionParams, DlmmPosRemoveLiquidityParams, DlmmPreRemoveParams } from '@/types/dlmm'
import { getBatchBinInfo } from '@/utils/dlmm'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetusprotocol/common-sdk'
import {
  CalculateRemoveLiquidityBothOption,
  CalculateRemoveLiquidityOnlyOption,
  ClosePositionOption,
  RemoveLiquidityOption
} from '@cetusprotocol/dlmm-sdk'
import { Transaction } from '@mysten/sui/transactions'
import useDlmmPosCollect from './useDlmmPosCollect'

export default function useDlmmPosRemove() {
  const dlmmSdk = useSdk('dlmm')
  const { collectRewardAndFeePayload } = useDlmmPosCollect()
  const dlmmPreRemove = async (params: DlmmPreRemoveParams) => {
    const { bins, activeId, fixAmountA, coinAmount, isOnlyA, tokenA, tokenB, isReverse } = params

    const dlmmPosRemoveLiquidityParams: CalculateRemoveLiquidityBothOption | CalculateRemoveLiquidityOnlyOption = {
      bins,
      active_id: activeId,
      coin_amount: coinAmount,
      ...(isOnlyA !== undefined ? { is_only_a: isOnlyA } : { fix_amount_a: fixAmountA })
    }
    console.log('🚀🚀🚀 ~ useDlmmPosRemove.ts:11 ~ dlmmPreRemove ~ dlmmPosRemoveLiquidityParams:', dlmmPosRemoveLiquidityParams)

    const binInfos = dlmmSdk?.Position.calculateRemoveLiquidityInfo(dlmmPosRemoveLiquidityParams)
    console.log('🚀🚀🚀 ~ useDlmmPosRemove.ts:18 ~ preRemove ~ binInfos:', binInfos)
    const coinAmountA = d(binInfos?.amount_a)
      .div(10 ** tokenA?.decimals)
      .toString()
    const coinAmountB = d(binInfos?.amount_b)
      .div(10 ** tokenB?.decimals)
      .toString()

    return {
      displayCoinAmountA: isReverse ? coinAmountB : coinAmountA,
      displayCoinAmountB: isReverse ? coinAmountA : coinAmountB,
      coinAmountA,
      coinAmountB,
      binInfos
    }
  }

  const getDlmmPosRemoveLiquidityPayload = (params: DlmmPosRemoveLiquidityParams, isAutoClaim: boolean) => {
    const { dlmmPool, binInfos, coinTypeA, coinTypeB, positionId, slippage, rewardCoins, activeId, binStep, slideValue } = params

    const { bins } = binInfos
    const payloads: Transaction[] = []
    console.log(bins, 'getDlmmPosRemoveLiquidityPayload bins')
    if (bins.length > 1000) {
      // 如果bins数量超过1000，分批处理
      const batchSize = 1000
      const totalBatches = Math.ceil(bins.length / batchSize)

      for (let i = 0; i < totalBatches; i++) {
        const batchBinInfo = getBatchBinInfo(bins, i, batchSize)

        const parameter: RemoveLiquidityOption = {
          pool_id: dlmmPool,
          position_id: positionId,
          bin_infos: batchBinInfo,
          coin_type_a: coinTypeA,
          coin_type_b: coinTypeB,
          slippage,
          reward_coins: [],
          active_id: activeId,
          collect_fee: false,
          bin_step: binStep,
          remove_percent: slideValue
        }

        const payload = dlmmSdk!.Position.removeLiquidityPayload(parameter)
        payloads.push(payload)

        let claimTx = null
        if (i === totalBatches - 1 && isAutoClaim) {
          claimTx = collectRewardAndFeePayload(
            [
              {
                dlmmPool: parameter.pool_id,
                positionId: parameter.position_id,
                rewardCoins,
                coinTypeA: parameter.coin_type_a,
                coinTypeB: parameter.coin_type_b
              }
            ],
            payload
          )
        }

        console.log(`🚀🚀🚀 ~ useDlmmPosRemove.ts ~ getDlmmPosRemoveLiquidityPayload ~ batch ${i + 1}/${totalBatches} ~ parameter:`, parameter)
      }
    } else {
      // 如果bins数量不超过1000，直接处理
      const parameter: RemoveLiquidityOption = {
        pool_id: dlmmPool,
        position_id: positionId,
        bin_infos: binInfos,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        slippage,
        reward_coins: isAutoClaim ? rewardCoins : [],
        active_id: activeId,
        collect_fee: isAutoClaim,
        bin_step: binStep,
        remove_percent: slideValue
      }

      console.log('🚀🚀🚀 ~ useDlmmPosRemove.ts ~ getDlmmPosRemoveLiquidityPayload ~ single batch ~ parameter:', parameter)

      const payload = dlmmSdk!.Position.removeLiquidityPayload(parameter)
      payloads.push(payload)
    }

    return payloads
  }

  const getDlmmPosClosePositionPayload = (params: DlmmPosClosePositionParams, txb?: Transaction) => {
    const { dlmmPool, positionId, rewardCoins, coinTypeA, coinTypeB } = params
    const dlmmPosClosePositionParams: ClosePositionOption = {
      pool_id: dlmmPool,
      position_id: positionId,
      reward_coins: rewardCoins,
      coin_type_a: coinTypeA,
      coin_type_b: coinTypeB
    }
    const payload = dlmmSdk!.Position.closePositionPayload(dlmmPosClosePositionParams, txb)
    console.log('🚀🚀🚀 ~ useDlmmPosRemove.ts:72 ~ getDlmmPosClosePositionPayload ~ payload:', payload)
    return payload
  }

  return { dlmmPreRemove, getDlmmPosRemoveLiquidityPayload, getDlmmPosClosePositionPayload }
}
