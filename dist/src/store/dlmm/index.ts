import { DLMMPoolApiInfo } from '@/types'
import { d } from '@cetus/utils'
import { BinAmount, DlmmPool, StrategyType } from '@cetusprotocol/dlmm-sdk'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'
interface DLMMLiquidityState {
  netError: boolean
  setNetError: (value: boolean) => void
  isAutoFill: boolean
  setIsAutoFill: (value: boolean) => void
  dlmmContractPoolInfo: (DlmmPool & SnakeToCamel<DlmmPool>) | null
  setDlmmContractPoolInfo: (value: (DlmmPool & SnakeToCamel<DlmmPool>) | null) => void
  dlmmContractPoolInfoLoading: boolean
  setDlmmContractPoolInfoLoading: (value: boolean) => void
  dlmmApiPoolInfo: Partial<DLMMPoolApiInfo> | null
  setDlmmApiPoolInfo: (data: Partial<DLMMPoolApiInfo> | null) => void
  dlmmApiPoolInfoLoading: boolean
  setDlmmApiPoolInfoLoading: (value: boolean) => void
  currentPriceData: any
  setCurrentPriceData: (data: any) => void
  minPriceForDate: string
  maxPriceForDate: string
  setMinPriceForDate: (value: string) => void
  setMaxPriceForDate: (value: string) => void
  currentRange: string
  setCurrentRange: (value: string) => void
  manualRefresh: boolean
  setManualRefresh: (value: boolean) => void
  strategy: StrategyType
  setStrategy: (value: StrategyType) => void
  currentBinStep: number | undefined
  setCurrentBinStep: (value: number | undefined) => void
  currentPrice: string
  reverseCurrentPrice: string
  setCurrentPrice: (value: string) => void
  resetLiquidity: () => void
  activeBin?: BinAmount
  setActiveBin: (value: BinAmount) => void
}

const store: StateCreator<DLMMLiquidityState> = (set, get) => ({
  activeBin: undefined,
  setActiveBin: (value: BinAmount) => {
    set(() => ({
      activeBin: value
    }))
  },
  netError: false,
  setNetError: (value: boolean) => {
    set(() => ({
      netError: value
    }))
  },
  isAutoFill: true,
  setIsAutoFill: (value: boolean) => {
    set(() => ({
      isAutoFill: value
    }))
  },
  dlmmContractPoolInfo: null,
  setDlmmContractPoolInfo: (data: (DlmmPool & SnakeToCamel<DlmmPool>) | null) => {
    set(() => ({
      dlmmContractPoolInfo: data,
      dlmmContractPoolInfoLoading: false
    }))
  },
  dlmmContractPoolInfoLoading: true,
  setDlmmContractPoolInfoLoading: (value: boolean) => {
    set(() => ({
      dlmmContractPoolInfoLoading: value
    }))
  },
  dlmmApiPoolInfo: null,
  setDlmmApiPoolInfo: (data: Partial<DLMMPoolApiInfo> | null) => {
    set(() => ({
      dlmmApiPoolInfo: data,
      apiPoolInfoLoading: false
    }))
  },
  dlmmApiPoolInfoLoading: true,
  setDlmmApiPoolInfoLoading: (value: boolean) => {
    set(() => ({
      dlmmApiPoolInfoLoading: value
    }))
  },
  currentPriceData: {},
  setCurrentPriceData: (data: any) => {
    set(() => ({
      currentPriceData: data
    }))
  },
  minPriceForDate: '',
  maxPriceForDate: '',
  setMinPriceForDate: (value: string) => {
    set(() => ({
      minPriceForDate: value
    }))
  },
  setMaxPriceForDate: (value: string) => {
    set(() => ({
      maxPriceForDate: value
    }))
  },
  currentRange: '',
  setCurrentRange: (value: string) => {
    set(() => ({
      currentRange: value
    }))
  },
  manualRefresh: false,
  setManualRefresh: (value: boolean) => {
    set(() => ({
      manualRefresh: value
    }))
  },
  strategy: StrategyType.Spot,
  setStrategy: (value: StrategyType) => {
    set(() => ({
      strategy: value
    }))
  },
  currentBinStep: undefined,
  setCurrentBinStep: (value: number | undefined) => {
    set(() => ({
      currentBinStep: value
    }))
  },
  currentPrice: '',
  reverseCurrentPrice: '',
  setCurrentPrice: (value: string) => {
    set(() => ({
      currentPrice: value,
      reverseCurrentPrice: d(1).div(value).toString()
    }))
  },
  resetLiquidity: () => {
    set(() => ({
      dlmmContractPoolInfo: null,
      dlmmContractPoolInfoLoading: true,
      dlmmApiPoolInfo: null,
      dlmmApiPoolInfoLoading: true,
      currentPriceData: {},
      minPriceForDate: '',
      maxPriceForDate: '',
      currentRange: '',
      manualRefresh: false,
      strategy: StrategyType.Spot,
      currentBinStep: undefined,
      currentPrice: '',
      reverseCurrentPrice: '',
      activeBin: undefined
    }))
  }
})

const useDlmmLiquidityStore = create(
  persist(store, {
    name: 'dlmm_pool',
    partialize: state => {
      const { isAutoFill } = state
      return { isAutoFill }
    }
  })
)
export default useDlmmLiquidityStore
