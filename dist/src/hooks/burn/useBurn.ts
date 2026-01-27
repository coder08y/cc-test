import { PoolApiInfo, PosBaseInfo } from '@/types'
import { useSdk } from '@cetus/sdk-factory'
import { Token } from '@cetus/types'
import { convertScientificToDecimal, d } from '@cetus/utils'
import { ClmmPoolUtil, TickMath } from '@cetusprotocol/common-sdk'
import { BN } from 'bn.js'

export default function useBurn() {
  const burnSdk = useSdk('burn')

  /**
   * 获取Burn操作tx paylaod
   * @param posBaseInfo
   * @returns
   */
  const getBurnTxPayload = (posBaseInfo: PosBaseInfo) => {
    const { posId, clmmPool, coinTypeA, coinTypeB } = posBaseInfo
    const params = {
      pos_id: posId,
      pool_id: clmmPool,
      coin_type_a: coinTypeA,
      coin_type_b: coinTypeB
    }

    const tx = burnSdk!.Burn.createBurnPayload(params)

    return tx
  }

  /**
   * 获取Burn仓位Claim操作tx payload
   * @param params
   * @returns
   */
  const getBurnClaimTxPayload = (params: {
    poolAddress: string
    posId: string
    coinTypeA: string
    coinTypeB: string
    account: string
    rewarderCoinTypes: any
  }) => {
    const { poolAddress, posId, coinTypeA, coinTypeB, account, rewarderCoinTypes } = params

    const txb = burnSdk!.Burn.createCollectFeesPayload([
      {
        pool_id: poolAddress,
        pos_id: posId,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB,
        account
      }
    ])

    const tx = burnSdk!.Burn.createCollectRewardsPayload(
      [
        {
          pool_id: poolAddress,
          pos_id: posId,
          coin_type_a: coinTypeA,
          coin_type_b: coinTypeB,
          rewarder_coin_types: rewarderCoinTypes,
          account
        }
      ],
      txb
    )

    return tx
  }

  const getCoinAmountFromLiquidity = (params: {
    liquidity: string
    lowerTick: number
    upperTick: number
    currentSqrtPrice: string
    roundUp: boolean
    defaultCoinA: Token
    defaultCoinB: Token
  }) => {
    // console.log('🚀🚀🚀 ~ file: usePositionList.ts:71 ~ getCoinAmountFromLiquidity ~ params:', params)
    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(params.lowerTick)
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(params.upperTick)
    const result = ClmmPoolUtil.getCoinAmountFromLiquidity(
      new BN(params.liquidity),
      new BN(params.currentSqrtPrice),
      lowerSqrtPrice,
      upperSqrtPrice,
      params.roundUp
    )

    const coinAAmount = convertScientificToDecimal(result.coin_amount_a.toString(), params.defaultCoinA?.decimals)
    const coinBAmount = convertScientificToDecimal(result.coin_amount_b.toString(), params.defaultCoinB?.decimals)

    return {
      coinAAmount,
      coinBAmount
    }
  }
  const getBurnPositionAmountByPool = async (poolInfo: PoolApiInfo, current_sqrt_price: string) => {
    const { poolAddress } = poolInfo
    // const contractPoolInfo = await clmmSDK.Pool.getPool(address)
    const positionList = (await burnSdk!.Burn.getPoolBurnPositionList(poolAddress)) || []
    // console.log('🚀🚀🚀 ~ file: useBurn.ts:92 ~ getBurnPositionAmountByPool ~ positionList:', positionList)
    let totalA = d(0)
    let totalB = d(0)
    for (let i = 0; i < positionList?.length; i++) {
      const position = positionList[i]
      // 计算tokenA B数量
      const { tick_lower_index, tick_upper_index, liquidity } = position
      // const { current_sqrt_price } = contractPoolInfo
      const defaultCoinA = poolInfo?.tokenA
      const defaultCoinB = poolInfo?.tokenB
      const { coinAAmount, coinBAmount } = getCoinAmountFromLiquidity({
        lowerTick: tick_lower_index,
        upperTick: tick_upper_index,
        currentSqrtPrice: current_sqrt_price as string,
        roundUp: false,
        liquidity,
        defaultCoinA: defaultCoinA as Token,
        defaultCoinB: defaultCoinB as Token
      })
      totalA = d(totalA).add(d(coinAAmount))
      totalB = d(totalB).add(d(coinBAmount))
    }
    return {
      totalA: totalA.toString(),
      totalB: totalB.toString()
    }
  }

  return {
    getBurnTxPayload,
    getBurnClaimTxPayload,
    getBurnPositionAmountByPool
  }
}
