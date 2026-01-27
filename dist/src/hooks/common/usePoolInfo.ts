import { d, fixRounding } from '@cetus/utils'
import { useMemo } from 'react'

function usePoolInfo(tokenAAmountUSD: string, totalAmountUSD: string) {
  /**
   * tokenA amount 占比
   * tokenA amount ratio
   */
  const tokenARatio = useMemo(() => {
    if (tokenAAmountUSD && totalAmountUSD && tokenAAmountUSD !== '--' && totalAmountUSD !== '--') {
      const ratio = fixRounding(d(tokenAAmountUSD).div(totalAmountUSD).mul(100).toString(), 2)
      return ratio === 'NaN' ? '--' : ratio
    }
    return '--'
  }, [tokenAAmountUSD, totalAmountUSD])
  /**
   * tokenB amount 占比
   * tokenB amount ratio
   */
  const tokenBRatio = useMemo(() => {
    if (tokenARatio && tokenARatio !== '--') {
      return d(100).minus(tokenARatio).toString()
    }
    return '--'
  }, [tokenARatio])
  return {
    tokenARatio,
    tokenBRatio
  }
}

export default usePoolInfo
