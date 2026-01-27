import usePositionStore from '@/store/position'
import { PoolContractInfo, PosBaseInfo, PosLiquidity } from '@/types'
import { calcCoinProportion, checkFullRange } from '@/utils/pool'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { CoinType, Token } from '@cetus/types'
import { bnToAmount, d } from '@cetus/utils'
import { ClmmPoolUtil, TickMath } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'

export default function useGetPosLiquiditys() {
  const { setPosLiquidityData, setPosLiquidityDataLoading } = usePositionStore()
  const { getTokenInfo } = useGetToken()

  const getCoinAmountFromLiquidity = ({
    tokenA,
    tokenB,
    liquidity,
    currentSqrtPrice,
    lowerTick,
    upperTick,
    roundUp
  }: {
    tokenA: Token
    tokenB: Token
    liquidity: string
    currentSqrtPrice: string
    lowerTick: number
    upperTick: number
    roundUp: boolean
  }) => {
    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(lowerTick)
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(upperTick)
    const amountInfo = ClmmPoolUtil.getCoinAmountFromLiquidity(new BN(liquidity), new BN(currentSqrtPrice), lowerSqrtPrice, upperSqrtPrice, roundUp)

    const coinAmountA = amountInfo.coin_amount_a.toString()
    const coinAmountB = amountInfo.coin_amount_b.toString()

    const decimalsA = tokenA.decimals
    const decimalsB = tokenB.decimals
    const amountA = bnToAmount(coinAmountA, decimalsA || 0)
    const amountB = bnToAmount(coinAmountB, decimalsB || 0)

    return {
      coinAmountA,
      coinAmountB,
      amountA,
      amountB
    }
  }

  const getPosLiquidityData = async (positionBaseList: PosBaseInfo[], posPoolsOriginalData: Record<string, PoolContractInfo>) => {
    setPosLiquidityDataLoading(true)
    const posLiquidityData: Record<string, PosLiquidity> = {}
    console.log(posLiquidityData, 'clmm test posLiquidityData')
    for (let i = 0; i < positionBaseList.length; i++) {
      const position = positionBaseList[i]
      const poolInfo = posPoolsOriginalData?.[position.clmmPool]

      const { coinAmountA, coinAmountB, amountA, amountB } = getCoinAmountFromLiquidity({
        tokenA: position.tokenA,
        tokenB: position.tokenB,
        liquidity: position.liquidity,
        currentSqrtPrice: poolInfo?.current_sqrt_price,
        lowerTick: position.lowerTick,
        upperTick: position.upperTick,
        // TODO 防止数量过小时展示为0 待定方案
        roundUp: true
        // roundUp: false
      })

      const isFullRange = checkFullRange(position.lowerTick, position.upperTick)

      let decimalsA = position.tokenA.decimals
      let decimalsB = position.tokenB.decimals
      if (decimalsA == undefined) {
        decimalsA = (await getTokenInfo(position.tokenA.coin_type as CoinType))?.decimals
      }
      if (decimalsB == undefined) {
        decimalsB = (await getTokenInfo(position.tokenB.coin_type as CoinType))?.decimals
      }
      const currentPrice = TickMath.sqrtPriceX64ToPrice(new BN(poolInfo?.current_sqrt_price), decimalsA, decimalsB).toString()
      const { percentA, percentB } = calcCoinProportion(amountA, amountB, currentPrice, isFullRange)

      const dAmountA = bnToAmount(coinAmountA, decimalsA)
      const dAmountB = bnToAmount(coinAmountB, decimalsB)
      const onlyAmountA = d(dAmountB).div(currentPrice).add(dAmountA).toString()

      const onlyAmountB = d(dAmountA).mul(currentPrice).add(dAmountB).toString()

      posLiquidityData[position.posId] = {
        coinAmountA,
        coinAmountB,
        displayCoinAmountA: !position.isReverse ? amountA : amountB,
        displayCoinAmountB: !position.isReverse ? amountB : amountA,
        displayPercentA: !position.isReverse ? percentA : percentB,
        displayPercentB: !position.isReverse ? percentB : percentA,
        onlyAmountA,
        onlyAmountB
      }
    }
    console.log(posLiquidityData, 'clmm test posLiquidityData')

    setPosLiquidityData(posLiquidityData)
    setPosLiquidityDataLoading(false)
  }

  return {
    getPosLiquidityData,
    getCoinAmountFromLiquidity
  }
}
