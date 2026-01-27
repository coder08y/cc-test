import { FrozenPools } from '@/constant/pool'
import { PoolApiInfo, PoolContractInfo, PosBaseInfo, PosFee, PosLiquidity, PosPoolsRelated, PosReward } from '@/types'
import { PositionDailyEarnings } from '@/types/dlmm'
import { StateCreator, create } from 'zustand'

interface PositionState {
  myPosYieldValue: string
  setMyPosYieldValue: (data: string) => void
  myClmmPosYieldValue: string
  setMyClmmPosYieldValue: (data: string) => void
  myDlmmPosYieldValue: string
  setMyDlmmPosYieldValue: (data: string) => void
  showPosListLength: {
    clmm_position_count?: number
    dlmm_position_count?: number
  }
  setShowPosListLength: (data: { clmm_position_count?: number; dlmm_position_count?: number }) => void

  posBaseList: PosBaseInfo[]
  setPosBaseList: (data: PosBaseInfo[]) => void
  posBaseListLoading: boolean
  setPosBaseListLoading: (value: boolean) => void

  posAprMap: Record<string, string>
  setPosAprMap: (data: Record<string, string>) => void

  posBaseListGroupByPool: Record<string, PosBaseInfo & { list?: PosBaseInfo[] }>

  posApiPoolData: Record<string, PoolApiInfo>
  setPosApiPoolData: (data: Record<string, PoolApiInfo>) => void

  fullRangePosBaseList: PosBaseInfo[]
  setFullRangePosBaseList: (data: PosBaseInfo[]) => void
  fullRangePosBaseListLoading: boolean
  setFullRangePosBaseListLoading: (data: boolean) => void

  posPoolsOriginalData: Record<string, PoolContractInfo>
  setPosPoolOriginalData: (data: Record<string, PoolContractInfo>) => void

  posPoolsRelatedData: Record<string, PosPoolsRelated>
  setPosPoolsRelatedData: (data: Record<string, PosPoolsRelated>) => void
  posPoolsRelatedDataLoading: boolean
  setPosPoolsRelatedDataLoading: (value: boolean) => void

  posPoolsRelatedDataGroupByPool: Record<string, any>

  posLiquidityData: Record<string, any>
  setPosLiquidityData: (data: Record<string, PosLiquidity>) => void
  posLiquidityDataLoading: boolean
  setPosLiquidityDataLoading: (value: boolean) => void

  posRewardsData: Record<string, any>
  setPosRewardsData: (data: Record<string, PosReward[]>) => void
  posRewardsDataLoading: boolean
  setPosRewardsDataLoading: (value: boolean) => void

  farmsPosRewardsData: Record<string, any>
  setFarmsPosRewardsData: (data: Record<string, PosReward[]>) => void
  farmsPosRewardsDataLoading: boolean
  setFarmsPosRewardsDataLoading: (value: boolean) => void

  posFeeData: Record<string, any>
  setPosFeeData: (data: Record<string, PosFee>) => void
  posFeeDataLoading: boolean
  setPosFeeDataLoading: (value: boolean) => void

  currentPosBaseInfo: PosBaseInfo | null
  setCurrentPosBaseInfo: (data: PosBaseInfo | null) => void
  currentPosBaseInfoLoading: boolean
  setCurrentPosBaseInfoLoading: (data: boolean) => void

  poolRangeObj: any
  setPoolRangeObj: (poolRangeObj: any) => void

  posClmmDailyEarningsData: Record<string, PositionDailyEarnings>
  setPosClmmDailyEarningsData: (data: Record<string, PositionDailyEarnings>) => void
  posClmmDailyEarningsDataLoading: boolean
  setPosClmmDailyEarningsDataLoading: (status: boolean) => void
}

const store: StateCreator<PositionState> = (set, get) => ({
  posClmmDailyEarningsDataLoading: true,
  setPosClmmDailyEarningsDataLoading: (status: boolean) => {
    set(() => ({
      posClmmDailyEarningsDataLoading: status
    }))
  },
  posClmmDailyEarningsData: {},
  setPosClmmDailyEarningsData: (data: Record<string, PositionDailyEarnings>) => {
    set(() => ({
      posClmmDailyEarningsData: { ...get().posClmmDailyEarningsData, ...data }
    }))
  },
  showPosListLength: {
    clmm_position_count: 0,
    dlmm_position_count: 0
  },
  setShowPosListLength: (data: { clmm_position_count?: number; dlmm_position_count?: number }) => {
    set(() => ({
      showPosListLength: data
    }))
  },
  poolRangeObj: {},
  setPoolRangeObj: (data: Record<string, any>) => {
    console.log('🚀 ~ poolRangeObj:', data)
    const originData = get().poolRangeObj
    set(() => ({
      poolRangeObj: { ...originData, ...data }
    }))
  },
  posApiPoolData: {},
  setPosApiPoolData: (data: Record<string, PoolApiInfo>) => {
    const originData = get().posApiPoolData
    set(() => ({
      posApiPoolData: { ...originData, ...data }
    }))
  },
  myPosYieldValue: '',
  setMyPosYieldValue: (data: string) => {
    set(() => ({
      myPosYieldValue: data
    }))
  },
  posAprMap: {},
  setPosAprMap: (data: Record<string, string>) => {
    const originData = get().posAprMap
    set(() => ({
      posAprMap: { ...originData, ...data }
    }))
  },
  myClmmPosYieldValue: '',
  setMyClmmPosYieldValue: (data: string) => {
    set(() => ({
      myClmmPosYieldValue: data
    }))
  },
  myDlmmPosYieldValue: '',
  setMyDlmmPosYieldValue: (data: string) => {
    set(() => ({
      myDlmmPosYieldValue: data
    }))
  },
  posBaseList: [],
  posBaseListGroupByPool: {},
  setPosBaseList: (data: PosBaseInfo[]) => {
    const groupedByClmmPool = data.reduce((result: any, item: PosBaseInfo) => {
      if (!result[item.clmmPool]) {
        result[item.clmmPool] = { list: [] }
      }
      if (!result[item.clmmPool]?.tokenA) {
        result[item.clmmPool]['poolType'] = 'clmm'
        result[item.clmmPool]['isReverse'] = item?.isReverse
        result[item.clmmPool]['tokenA'] = item?.tokenA
        result[item.clmmPool]['tokenB'] = item?.tokenB
        result[item.clmmPool]['displayTokenA'] = item?.displayTokenA
        result[item.clmmPool]['displayTokenB'] = item?.displayTokenB
        result[item.clmmPool]['clmmPoolAddress'] = item.clmmPool
        result[item.clmmPool]['isFrozen'] = FrozenPools.includes(item.clmmPool)
      }
      result[item.clmmPool]?.list?.push(item)
      return result
    }, {})
    console.log('🚀 ~ file: index.ts:43 ~ groupedByClmmPool ~ groupedByClmmPool:', groupedByClmmPool)

    set(() => ({
      posBaseList: data,
      posBaseListGroupByPool: groupedByClmmPool,
      posBaseListIsLoading: false
    }))
  },
  posBaseListLoading: true,
  setPosBaseListLoading: (value: boolean) => {
    set(() => ({
      posBaseListLoading: value
    }))
  },
  fullRangePosBaseList: [],
  setFullRangePosBaseList: (data: PosBaseInfo[]) => {
    set(() => ({
      fullRangePosBaseList: data,
      fullRangePosBaseListLoading: false
    }))
  },
  fullRangePosBaseListLoading: true,
  setFullRangePosBaseListLoading: (value: boolean) => {
    set(() => ({
      fullRangePosBaseListLoading: value
    }))
  },
  posPoolsOriginalData: {},
  setPosPoolOriginalData: (data: Record<string, PoolContractInfo>) => {
    const originData = get().posPoolsOriginalData
    set(() => ({
      posPoolsOriginalData: { ...originData, ...data }
    }))
  },
  posPoolsRelatedData: {},
  posPoolsRelatedDataGroupByPool: {},
  setPosPoolsRelatedData: (data: Record<string, PosPoolsRelated>) => {
    const originData = get().posPoolsRelatedData
    set(() => ({
      posPoolsRelatedData: { ...originData, ...data },
      posPoolsRelatedDataLoading: false
    }))
  },
  posPoolsRelatedDataLoading: true,
  setPosPoolsRelatedDataLoading: (value: boolean) => {
    set(() => ({
      posPoolsRelatedDataLoading: value
    }))
  },
  posLiquidityData: {},
  setPosLiquidityData: (data: Record<string, PosLiquidity>) => {
    const originData = get().posLiquidityData
    set(() => ({
      posLiquidityData: { ...originData, ...data },
      posLiquidityDataLoading: false
    }))
  },
  posLiquidityDataLoading: true,
  setPosLiquidityDataLoading: (value: boolean) => {
    set(() => ({
      posLiquidityDataLoading: value
    }))
  },
  posRewardsData: {},
  setPosRewardsData: (data: Record<string, PosReward[]>) => {
    const originData = get().posRewardsData
    set(() => ({
      posRewardsData: { ...originData, ...data },
      posRewardsDataLoading: false
    }))
  },
  posRewardsDataLoading: true,
  setPosRewardsDataLoading: (value: boolean) => {
    set(() => ({
      posRewardsDataLoading: value
    }))
  },
  farmsPosRewardsData: {},
  setFarmsPosRewardsData: (data: Record<string, PosReward[]>) => {
    set(() => ({
      farmsPosRewardsData: data,
      farmsPosRewardsDataLoading: false
    }))
  },
  farmsPosRewardsDataLoading: true,
  setFarmsPosRewardsDataLoading: (value: boolean) => {
    set(() => ({
      farmsPosRewardsDataLoading: value
    }))
  },
  posFeeData: {},
  setPosFeeData: (data: Record<string, PosFee>) => {
    const originData = get().posFeeData
    set(() => ({
      posFeeData: { ...originData, ...data },
      posFeeDataLoading: false
    }))
  },
  posFeeDataLoading: true,
  setPosFeeDataLoading: (value: boolean) => {
    set(() => ({
      posFeeDataLoading: value
    }))
  },
  currentPosBaseInfo: null,
  setCurrentPosBaseInfo: (data: PosBaseInfo | null) => {
    set(() => ({
      currentPosBaseInfo: data,
      currentPosBaseInfoLoading: false
    }))
  },
  currentPosBaseInfoLoading: true,
  setCurrentPosBaseInfoLoading: (value: boolean) => {
    set(() => ({
      currentPosBaseInfoLoading: value
    }))
  }
})

const usePositionStore = create(store)
export default usePositionStore
