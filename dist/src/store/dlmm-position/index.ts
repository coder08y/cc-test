import { PosFee, PosReward } from '@/types'
import { DlmmPoolData, DlmmPosBaseInfo, DlmmPosLiquidity, DlmmPosPoolsRelated, PositionDailyEarnings } from '@/types/dlmm'
import { StateCreator, create } from 'zustand'

interface DlmmPositionState {
  dlmmPosBaseListLoading: boolean
  setDlmmPosBaseListLoading: (status: boolean) => void

  dlmmPosPoolsOriginalData: Record<string, DlmmPoolData>
  setDlmmPosPoolOriginalData: (data: Record<string, DlmmPoolData>) => void

  dlmmPosBaseListGroupByPool: Record<string, DlmmPoolData & { list?: DlmmPoolData[] }>

  dlmmPosPoolsRelatedDataLoading: boolean
  setDlmmPosPoolsRelatedDataLoading: (status: boolean) => void

  dlmmAprMap: Record<string, string>
  setDlmmAprMap: (data: Record<string, string>) => void

  dlmmPosPoolsRelatedData: Record<string, DlmmPosPoolsRelated>
  setDlmmPosPoolsRelatedData: (data: Record<string, DlmmPosPoolsRelated>) => void

  dlmmPosLiquidityDataLoading: boolean
  setPosLiquidityDataLoading: (status: boolean) => void

  dlmmPosLiquidityData: Record<string, DlmmPosLiquidity>
  setDlmmPosLiquidityData: (data: Record<string, DlmmPosLiquidity>) => void

  dlmmPosFeeData: Record<string, PosFee>
  setDlmmPosFeeData: (data: Record<string, PosFee>) => void

  dlmmPosBaseList: DlmmPosBaseInfo[]
  setDlmmPosBaseList: (list: DlmmPosBaseInfo[]) => void

  dlmmCurrentPosBaseInfo: DlmmPosBaseInfo
  setCurrentPosBaseInfo: (data: DlmmPosBaseInfo) => void

  dlmmCurrentPosBaseInfoLoading: boolean
  setDlmmCurrentPosBaseInfoLoading: (status: boolean) => void

  dlmmPosRewardsData: Record<string, PosReward[]>
  setDlmmPosRewardsData: (data: Record<string, PosReward[]>) => void

  dlmmPosFeeAndRewardsLoading: boolean
  setDlmmPosFeeAndRewardsLoading: (status: boolean) => void

  dlmmPosFeeDataLoading: boolean
  setDlmmPosFeeDataLoading: (status: boolean) => void

  dlmmPosRewardsDataLoading: boolean
  setDlmmPosRewardsDataLoading: (status: boolean) => void

  posChartRefreshTrigger: number
  setPosChartRefreshTrigger: () => void

  posDlmmDailyEarningsData: Record<string, PositionDailyEarnings>
  setPosDlmmDailyEarningsData: (data: Record<string, PositionDailyEarnings>) => void
  posDlmmDailyEarningsDataLoading: boolean
  setPosDlmmDailyEarningsDataLoading: (status: boolean) => void

  resetDlmmPositionState: () => void
}
const store: StateCreator<DlmmPositionState> = (set, get) => ({
  posDlmmDailyEarningsDataLoading: true,
  setPosDlmmDailyEarningsDataLoading: (status: boolean) => {
    set(() => ({
      posDlmmDailyEarningsDataLoading: status
    }))
  },
  posDlmmDailyEarningsData: {},
  setPosDlmmDailyEarningsData: (data: Record<string, PositionDailyEarnings>) => {
    set(() => ({
      posDlmmDailyEarningsData: { ...get().posDlmmDailyEarningsData, ...data }
    }))
  },
  dlmmPosFeeAndRewardsLoading: false,
  setDlmmPosFeeAndRewardsLoading: (status: boolean) => {
    set(() => ({
      dlmmPosFeeAndRewardsLoading: status
    }))
  },
  dlmmPosBaseListLoading: false,
  setDlmmPosBaseListLoading: (status: boolean) => {
    set(() => ({
      dlmmPosBaseListLoading: status
    }))
  },

  dlmmPosPoolsOriginalData: {},
  setDlmmPosPoolOriginalData: (data: Record<string, DlmmPoolData>) => {
    set(() => ({
      dlmmPosPoolsOriginalData: data
    }))
  },

  dlmmAprMap: {},
  setDlmmAprMap: (data: Record<string, string>) => {
    const originData = get().dlmmAprMap
    set(() => ({
      dlmmAprMap: { ...originData, ...data }
    }))
  },

  dlmmPosPoolsRelatedDataLoading: false,
  setDlmmPosPoolsRelatedDataLoading: (status: boolean) => {
    set(() => ({
      dlmmPosPoolsRelatedDataLoading: status
    }))
  },

  dlmmPosPoolsRelatedData: {},
  setDlmmPosPoolsRelatedData: (data: Record<string, DlmmPosPoolsRelated>) => {
    set(() => ({
      dlmmPosPoolsRelatedData: data
    }))
  },

  dlmmPosLiquidityDataLoading: true,
  setPosLiquidityDataLoading: (status: boolean) => {
    set(() => ({
      dlmmPosLiquidityDataLoading: status
    }))
  },

  dlmmPosLiquidityData: {},
  setDlmmPosLiquidityData: (data: Record<string, DlmmPosLiquidity>) => {
    set(() => ({
      dlmmPosLiquidityData: data
    }))
  },

  dlmmPosFeeData: {},
  setDlmmPosFeeData: (data: Record<string, PosFee>) => {
    set(state => ({
      dlmmPosFeeData: {
        ...state.dlmmPosFeeData,
        ...data
      }
    }))
  },
  dlmmPosBaseListGroupByPool: {},
  dlmmPosBaseList: [],
  setDlmmPosBaseList: (list: DlmmPosBaseInfo[]) => {
    const groupedByDlmmPool = list.reduce((result: any, item: DlmmPosBaseInfo) => {
      if (!result[item.dlmmPool]) {
        result[item.dlmmPool] = { list: [] }
      }
      if (!result[item.dlmmPool]?.tokenA) {
        result[item.dlmmPool]['poolType'] = 'dlmm'
        result[item.dlmmPool]['isReverse'] = item?.isReverse
        result[item.dlmmPool]['tokenA'] = item?.tokenA
        result[item.dlmmPool]['tokenB'] = item?.tokenB
        result[item.dlmmPool]['displayTokenA'] = item?.displayTokenA
        result[item.dlmmPool]['displayTokenB'] = item?.displayTokenB
        result[item.dlmmPool]['dlmmPoolAddress'] = item.dlmmPool
      }
      result[item.dlmmPool]?.list?.push(item)
      return result
    }, {})
    set(() => ({
      dlmmPosBaseList: list,
      dlmmPosBaseListGroupByPool: groupedByDlmmPool
    }))
  },

  dlmmCurrentPosBaseInfo: {} as DlmmPosBaseInfo,
  setCurrentPosBaseInfo: (data: DlmmPosBaseInfo) => {
    set(() => ({
      dlmmCurrentPosBaseInfo: data
    }))
  },

  dlmmCurrentPosBaseInfoLoading: false,
  setDlmmCurrentPosBaseInfoLoading: (status: boolean) => {
    set(() => ({
      dlmmCurrentPosBaseInfoLoading: status
    }))
  },

  dlmmPosRewardsData: {},
  setDlmmPosRewardsData: (data: Record<string, PosReward[]>) => {
    set(state => ({
      dlmmPosRewardsData: {
        ...state.dlmmPosRewardsData,
        ...data
      }
    }))
  },

  dlmmPosFeeDataLoading: false,
  setDlmmPosFeeDataLoading: (status: boolean) => {
    set(() => ({
      dlmmPosFeeDataLoading: status
    }))
  },

  dlmmPosRewardsDataLoading: false,
  setDlmmPosRewardsDataLoading: (status: boolean) => {
    set(() => ({
      dlmmPosRewardsDataLoading: status
    }))
  },
  posChartRefreshTrigger: 0,
  setPosChartRefreshTrigger: () => {
    set(state => ({
      posChartRefreshTrigger: state.posChartRefreshTrigger + 1
    }))
  },
  resetDlmmPositionState: () => {
    set(() => ({
      dlmmPosFeeAndRewardsLoading: false,
      dlmmPosRewardsDataLoading: false,
      dlmmPosFeeDataLoading: false,
      dlmmCurrentPosBaseInfoLoading: false,
      dlmmPosPoolsRelatedDataLoading: false,
      dlmmPosLiquidityDataLoading: false,
      dlmmPosRewardsData: {},
      dlmmPosPoolsOriginalData: {},
      dlmmCurrentPosBaseInfo: {} as DlmmPosBaseInfo,
      dlmmPosBaseListGroupByPool: {},
      dlmmPosBaseList: [],
      dlmmPosFeeData: {},
      dlmmPosLiquidityData: {},
      dlmmPosPoolsRelatedData: {}
    }))
  }
})

const useDlmmPositionStore = create(store)
export default useDlmmPositionStore
