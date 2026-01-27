import { DlmmPositionHistoricalProfitPath } from '@/apis/path'
import { useFetch } from '@cetus/hooks'

export default function useGetDlmmPositionHistoricalProfit() {
  const { fetchByApi } = useFetch()
  const getDlmmPositionHistoricalProfit = async (position_id: string) => {
    try {
      const res = await fetchByApi(DlmmPositionHistoricalProfitPath, 'GET', {
        position_id
      })
      if (res?.FeeA) {
        return res
      }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetClmmPositionHistoricalProfit.ts:15 ~ getClmmPositionHistoricalProfit ~ error:', error)
    }
  }
  return { getDlmmPositionHistoricalProfit }
}
