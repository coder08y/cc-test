import { ClmmPositionHistoricalProfitPath } from '@/apis/path'
import { useFetch } from '@cetus/hooks'

export default function useGetClmmPositionHistoricalProfit() {
  const { fetchByApi } = useFetch()
  const getClmmPositionHistoricalProfit = async (position_id: string) => {
    try {
      const res = await fetchByApi(ClmmPositionHistoricalProfitPath, 'GET', {
        position_id
      })
      if (res?.FeeA) {
        return res
      }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetClmmPositionHistoricalProfit.ts:15 ~ getClmmPositionHistoricalProfit ~ error:', error)
    }
  }
  return { getClmmPositionHistoricalProfit }
}
