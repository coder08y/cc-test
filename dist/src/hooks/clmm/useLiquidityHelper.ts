import { Token } from '@cetus/types'
import { bnToAmount } from '@cetus/utils'
import { ClmmPoolUtil, TickMath } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'

export default function useLiquidityHelper() {
  /**
   * 用liquidity计算出coinA, coinB数量
   * @param params
   * @returns
   */
  const getCoinAmountFromLiquidity = (params: {
    lowerTick: number
    upperTick: number
    liquidity: string
    currentSqrtPrice: string
    tokenA: Token
    tokenB: Token
    roundUp: boolean
  }) => {
    const { lowerTick, upperTick, liquidity, currentSqrtPrice, tokenA, tokenB, roundUp } = params

    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(lowerTick)
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(upperTick)
    const result = ClmmPoolUtil.getCoinAmountFromLiquidity(new BN(liquidity), new BN(currentSqrtPrice), lowerSqrtPrice, upperSqrtPrice, roundUp)

    const coinaAmount = bnToAmount(result.coin_amount_a.toString(), tokenA.decimals)
    const coinbAmount = bnToAmount(result.coin_amount_b.toString(), tokenB.decimals)

    return {
      coinaAmount,
      coinbAmount
    }
  }

  return {
    getCoinAmountFromLiquidity
  }
}
