import { PoolApiInfo, PoolContractInfo } from '@/types'
import { StateCreator, create } from 'zustand'

interface LiquidityState {
  netError: boolean
  setNetError: (value: boolean) => void
  contractPoolInfo: PoolContractInfo | null
  setContractPoolInfo: (data: PoolContractInfo | null) => void
  contractPoolInfoLoading: boolean
  setContractPoolInfoLoading: (value: boolean) => void
  apiPoolInfo: PoolApiInfo | null
  setApiPoolInfo: (data: PoolApiInfo | null) => void
  apiPoolInfoLoading: boolean
  setApiPoolInfoLoading: (value: boolean) => void
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
  resetLiquidity: () => void
}

const store: StateCreator<LiquidityState> = (set, get) => ({
  netError: false,
  setNetError: (value: boolean) => {
    set(() => ({
      netError: value
    }))
  },
  contractPoolInfo: null,
  setContractPoolInfo: (data: PoolContractInfo | null) => {
    set(() => ({
      contractPoolInfo: data,
      contractPoolInfoLoading: false
    }))
  },
  contractPoolInfoLoading: true,
  setContractPoolInfoLoading: (value: boolean) => {
    set(() => ({
      contractPoolInfoLoading: value
    }))
  },
  apiPoolInfo: null,
  setApiPoolInfo: (data: PoolApiInfo | null) => {
    set(() => ({
      apiPoolInfo: data,
      apiPoolInfoLoading: false
    }))
  },
  apiPoolInfoLoading: true,
  setApiPoolInfoLoading: (value: boolean) => {
    set(() => ({
      apiPoolInfoLoading: value
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
  resetLiquidity: () => {
    set(() => ({
      contractPoolInfo: null,
      apiPoolInfo: null,
      currentPriceData: {},
      minPriceForDate: '',
      maxPriceForDate: '',
      currentRange: '',
      manualRefresh: false
    }))
  }
})

const useLiquidityStore = create(store)
export default useLiquidityStore
