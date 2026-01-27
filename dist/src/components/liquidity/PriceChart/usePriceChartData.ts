import { PoolTickKlinePath } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import { d } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'
import { useEffect, useState } from 'react'

export default function usePriceChartData() {
  const { fetchByApi } = useFetch()
  const [poolPriceData, setPoolPriceData] = useState<any[]>([])
  const [poolPriceDataLoading, setPoolPriceDataLoading] = useState(false)

  const getPoolPriceData = async (pool: string, period: string, direct: boolean, baseCurrency: any, quoteCurrency: any) => {
    try {
      setPoolPriceDataLoading(true)
      const res = await fetchByApi(`${PoolTickKlinePath}?pool=${pool}&period=${period}`, 'GET')
      const showReverse = res?.showReverse
      const list = res?.list

      const formatPriceData = list?.map((item: any) => {
        const baseDecimals = baseCurrency?.decimals
        const quoteDecimals = quoteCurrency?.decimals
        const open = TickMath.tickIndexToPrice(item?.open, baseDecimals, quoteDecimals).toNumber()
        const close = TickMath.tickIndexToPrice(item?.close, baseDecimals, quoteDecimals).toNumber()
        const high = TickMath.tickIndexToPrice(item?.high, baseDecimals, quoteDecimals).toNumber()
        const low = TickMath.tickIndexToPrice(item?.low, baseDecimals, quoteDecimals).toNumber()
        return {
          close: direct ? close : d(1).div(close).toNumber(),
          open: direct ? open : d(1).div(open).toNumber(),
          high: direct ? high : d(1).div(high).toNumber(),
          low: direct ? low : d(1).div(low).toNumber(),
          timestamp: d(item?.timestamp).mul(1000).toNumber()
        }
      })

      setPoolPriceData(formatPriceData)
    } catch (error) {
      console.log('🚀 ~ getPoolPriceData ~ error:', error)
    }
    setPoolPriceDataLoading(false)
  }

  // useEffect(() => {
  //     const pool = '0x51e883ba7c0b566a26cbc8a94cd33eb0abd418a77cc1e60ad22fd9b1f29cd2ab'
  //     const period = '1H'
  //     getPoolPriceData(pool, period)
  // }, [])

  return { poolPriceData, getPoolPriceData, poolPriceDataLoading }
}
