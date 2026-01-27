import useLiquidityStore from '@/store/clmm'
import useTvlInfoStore from '@/store/clmm/liquidityTvl'
import { PoolApiInfo } from '@/types'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { d } from '@cetus/utils'
import { useDebounceEffect } from 'ahooks'
import { useState } from 'react'
import useBurn from '../burn/useBurn'

function useBurnedLiquidity() {
  const { getBurnPositionAmountByPool } = useBurn()
  const { apiPoolInfo, contractPoolInfo } = useLiquidityStore()
  const [burnAmountA, setBurnAmountA] = useState<string>('0')
  const [burnAmountB, setBurnAmountB] = useState<string>('0')
  const [burnAmountAUSD, setBurnAmountAUSD] = useState<string>('0')
  const [burnAmountBUSD, setBurnAmountBUSD] = useState<string>('0')
  const [loading, setLoading] = useState<boolean>(false)
  const { poolAddress } = useQueryParams()
  const { tokenAPrice, tokenBPrice } = useTvlInfoStore()

  /**
   * 获取burn liquidity amount 及其价值usd
   * Get the amount of burn liquidity and its value in usd
   * @param poolInfo PoolApiInfo
   * @param current_sqrt_price string
   */
  const getBurnAmount = async (poolInfo: PoolApiInfo, current_sqrt_price: string) => {
    try {
      setLoading(true)
      console.log('🚀🚀🚀 ~ file: burn-position-amount 29 ~ getBurnAmount ~ getBurnAmount:')
      const { totalA, totalB } = await getBurnPositionAmountByPool(poolInfo, current_sqrt_price)
      setBurnAmountA(totalA)
      setBurnAmountB(totalB)
      if (tokenAPrice) {
        setBurnAmountAUSD(d(totalA).mul(tokenAPrice?.price).toString())
      }
      if (tokenBPrice) {
        setBurnAmountBUSD(d(totalB).mul(tokenBPrice?.price).toString())
      }
    } catch (error) {
      console.log('🚀🚀🚀  ~ getBurnAmount ~ error:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 监听池子地址变化和价格变化
   * Listen to pool address changes and price changes
   */
  useDebounceEffect(
    () => {
      if (apiPoolInfo && contractPoolInfo?.current_sqrt_price) {
        getBurnAmount(apiPoolInfo, contractPoolInfo?.current_sqrt_price)
      }
    },
    [poolAddress, contractPoolInfo?.current_sqrt_price, tokenAPrice?.price, tokenBPrice?.price],
    {
      wait: 500
    }
  )
  return {
    burnAmountA,
    burnAmountB,
    burnAmountAUSD,
    burnAmountBUSD,
    loading
  }
}

export default useBurnedLiquidity
