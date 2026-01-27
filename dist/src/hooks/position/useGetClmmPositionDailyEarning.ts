import { ClmmPositionDailyEarningPath, ClmmPositionDailyEarningsPath } from '@/apis/path'
import usePositionStore from '@/store/position'
import { GetPositionDailyEarningsOptions, PositionDailyEarnings } from '@/types/dlmm'
import { aprProcessing } from '@/utils/api-data-utils'
import { useFetch } from '@cetus/hooks'
import { formatCurrency } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'

export default function useGetClmmPositionDailyEarning() {
  const { fetchByApi } = useFetch()
  const { setPosClmmDailyEarningsData, setPosClmmDailyEarningsDataLoading } = usePositionStore()
  const getClmmPositionDailyEarning = async (position_id: string, currentPoolTvl: string) => {
    try {
      const res = await fetchByApi(ClmmPositionDailyEarningPath, 'GET', {
        position_id
      })
      if (res?.FeeA) {
        const { FeeA, FeeB, Mining } = res
        const { dailyExpansionFactorUSD: dailyExpansionFactorUSDFeeA } = FeeA
        const { dailyExpansionFactorUSD: dailyExpansionFactorUSDFeeB } = FeeB
        let dailyExpansionFactorUSDMining = d(0)
        Mining.forEach((item: any) => {
          dailyExpansionFactorUSDMining = d(item.dailyExpansionFactorUSD).add(dailyExpansionFactorUSDMining)
        })
        const totalDailyExpansionFactorUSD = d(dailyExpansionFactorUSDFeeA)
          .add(d(dailyExpansionFactorUSDFeeB))
          .add(dailyExpansionFactorUSDMining)
          .toString()

        if (currentPoolTvl !== undefined && d(currentPoolTvl).gt(0)) {
          const apr = d(totalDailyExpansionFactorUSD).div(d(currentPoolTvl)).mul(365).toString()
          const aprDisplay = aprProcessing(apr, true)
          const dailyEarnUSDDisplay = formatCurrency(totalDailyExpansionFactorUSD, 2)

          return { apr, aprDisplay, totalDailyExpansionFactorUSD, dailyEarnUSDDisplay, originResult: res }
        }
      }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetClmmPositionDailyEarning.ts:35 ~ getClmmPositionDailyEarning ~ error:', error)
      throw error
    }
  }

  const getClmmPositionDailyEarnings = async (options: GetPositionDailyEarningsOptions[]) => {
    try {
      console.log('🚀🚀🚀 ~ getClmmPositionDailyEarnings ~ options:', options)
      const position_ids = options.map(item => item.position_id)

      const BATCH_SIZE = 50
      const batches: string[][] = []
      for (let i = 0; i < position_ids.length; i += BATCH_SIZE) {
        batches.push(position_ids.slice(i, i + BATCH_SIZE))
      }

      const allResults: Record<string, any> = {}
      for (const batch of batches) {
        const res = await fetchByApi(ClmmPositionDailyEarningsPath, 'POST', {
          positions: batch
        })
        if (res?.data?.Results) {
          Object.assign(allResults, res.data.Results)
        }
      }

      const resultsMap = allResults
      const earningsMap: Record<string, PositionDailyEarnings> = {}

      options.forEach(item => {
        const result = resultsMap[item.position_id]
        const currentPoolTvl = item.current_pool_tvl
        if (result) {
          const { FeeA, FeeB, Mining } = result
          if (FeeA) {
            const { dailyExpansionFactorUSD: dailyExpansionFactorUSDFeeA } = FeeA
            const { dailyExpansionFactorUSD: dailyExpansionFactorUSDFeeB } = FeeB
            let dailyExpansionFactorUSDMining = d(0)
            Mining.forEach((item: any) => {
              dailyExpansionFactorUSDMining = d(item.dailyExpansionFactorUSD).add(dailyExpansionFactorUSDMining)
            })
            const totalDailyExpansionFactorUSD = d(dailyExpansionFactorUSDFeeA)
              .add(d(dailyExpansionFactorUSDFeeB))
              .add(dailyExpansionFactorUSDMining)
              .toString()
            if (currentPoolTvl !== undefined && d(currentPoolTvl).gt(0)) {
              const apr = d(totalDailyExpansionFactorUSD).div(d(currentPoolTvl)).mul(365).toString()
              const aprDisplay = aprProcessing(apr, true)
              const dailyEarnUSDDisplay = formatCurrency(totalDailyExpansionFactorUSD, 2)

              const earnings: PositionDailyEarnings = {
                apr,
                aprDisplay,
                totalDailyExpansionFactorUSD,
                dailyEarnUSDDisplay,
                originResult: result
              }
              earningsMap[item.position_id] = earnings
            }
          }
        }
      })

      setPosClmmDailyEarningsData(earningsMap)
      console.log('🚀🚀🚀 ~ getClmmPositionDailyEarnings ~ res:', earningsMap)
    } catch (error) {
      console.log('🚀🚀🚀 ~ getClmmPositionDailyEarnings.ts:35 ~ getClmmPositionDailyEarnings ~ error:', error)
      throw error
    } finally {
      setPosClmmDailyEarningsDataLoading(false)
    }
  }

  return { getClmmPositionDailyEarning, getClmmPositionDailyEarnings }
}
