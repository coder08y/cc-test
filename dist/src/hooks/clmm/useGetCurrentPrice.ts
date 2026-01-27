import useLiquidityStore from '@/store/clmm'
import { PoolApiInfo } from '@/types'
import { d } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'
import BN from 'bn.js'

export default function useGetCurrentPrice() {
  const { setCurrentPriceData } = useLiquidityStore()

  const getCurrentPrice = (currentSqrtPrice: string, apiPoolInfo: PoolApiInfo, currentTickIndex?: number) => {
    if (apiPoolInfo.tokenA && apiPoolInfo.tokenB) {
      const decimalsA = apiPoolInfo.tokenA.decimals
      const decimalsB = apiPoolInfo.tokenB.decimals
      // const currentPrice = TickMath.sqrtPriceX64ToPrice(new BN(currentSqrtPrice), decimalsA, decimalsB).toString()
      const currentPrice =
        currentTickIndex !== undefined
          ? TickMath.tickIndexToPrice(currentTickIndex, decimalsA, decimalsB).toString()
          : TickMath.sqrtPriceX64ToPrice(new BN(currentSqrtPrice), decimalsA, decimalsB).toString()
      const reverseCurrentPrice = d(1).div(currentPrice).toString()

      const data = {
        currentPrice,
        reverseCurrentPrice,
        currentSqrtPrice,
        pool: apiPoolInfo.poolAddress
      }
      setCurrentPriceData(data)
    }
  }

  return {
    getCurrentPrice
  }
}
