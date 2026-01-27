import { DLMMBinsRewardPath, DLMMBinsTradedPath } from '@/apis/path'
import { BinsRewardData } from '@/types/dlmm'
import { useFetch } from '@cetus/hooks'

function useFetchBinsTradeData() {
  const { fetchByApi } = useFetch()

  const fetchBinsTradeData = async ({ poolId, dataType, period }: { poolId: string; dataType: 'vol' | 'fee'; period: '24H' | '7D' | '30D' }) => {
    if (!poolId) return []
    try {
      const result = await fetchByApi(DLMMBinsTradedPath, 'GET', {
        dataType,
        period,
        pool: poolId
      })

      if (result && result.bins && result.bins.length) {
        return result.bins as any[]
      } else {
        return []
      }
    } catch (error) {
      console.error(error, 'res-fetchAnalyticsData')
      return []
    }
  }

  const fetchBinsRewardData = async ({ poolId, period }: { poolId: string; period: '24H' | '7D' | '30D' }) => {
    if (!poolId) return undefined
    try {
      const result = await fetchByApi(DLMMBinsRewardPath, 'GET', {
        period,
        pool: poolId
      })

      if (result && result.bins && result.bins.length) {
        return result as BinsRewardData
      } else {
        return undefined
      }
    } catch (error) {
      console.error(error, 'res-fetchAnalyticsData')
      return undefined
    }
  }
  return {
    fetchBinsTradeData,
    fetchBinsRewardData
  }
}

export default useFetchBinsTradeData
