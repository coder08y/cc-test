import { StatisticsV2Path } from '@/apis/path'
import useStatsStore from '@/store/stats'
import { useFetch } from '@cetus/hooks'
import { addComma, d, symbolDataDisplayProcessing } from '@cetus/utils'

export default function useStatistics() {
  const { fetchByApi } = useFetch()
  const { setStatisticsData } = useStatsStore()

  const getStatistics = async () => {
    const res = await fetchByApi(StatisticsV2Path, 'GET')
    console.log('🚀 ~ file: useStatistics.ts:8 ~ getStatistics ~ res:', res)

    if (res) {
      const { cLmm: clmmData, dlmm: dlmmData } = res
      const summary = {
        totalTvl: symbolDataDisplayProcessing(d(clmmData.totalTvl).plus(dlmmData.totalTvl).toString(), '$'),
        vol24H: symbolDataDisplayProcessing(d(clmmData.vol24H).plus(dlmmData.vol24H).toString(), '$'),
        cumulativeVol: symbolDataDisplayProcessing(d(clmmData.cumulativeVol).plus(dlmmData.cumulativeVol).toString(), '$'),
        cumulativeTx: addComma(
          d(clmmData.cumulativeTx)
            .plus(dlmmData.cumulativeTx ?? 0)
            .toString()
        ),
        cumulativeUserAccount: addComma(
          d(clmmData.cumulativeUserAccount)
            .plus(dlmmData.cumulativeUserAccount ?? 0)
            .toString()
        )
      }

      const result = {
        clmm: clmmData,
        dlmm: dlmmData,
        summary
      }
      console.log('🚀 ~ file: useStatistics.ts:42 ~ getStatistics ~ result:', result)
      setStatisticsData(result)
      return result
    }

    return undefined
  }

  return {
    getStatistics
  }
}
