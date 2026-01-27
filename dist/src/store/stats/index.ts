import { StatisticsSummary } from '@/types/clmm'
import { StateCreator, create } from 'zustand'

interface statsState {
  statisticsData?: StatisticsSummary
  setStatisticsData: (data: StatisticsSummary) => void
}

const store: StateCreator<statsState> = (set, get) => ({
  statisticsData: undefined,
  setStatisticsData: (data: StatisticsSummary) => {
    set(() => ({
      statisticsData: data
    }))
  }
})

const useStatsStore = create(store)
export default useStatsStore
