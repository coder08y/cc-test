import { StateCreator, create } from 'zustand'

interface PositionDetailState {
  currentPosDetailTab: string
  setCurrentPosDetailTab: (data: string) => void
  tokenAmountAfterA: string
  setTokenAmountAfterA: (data: string) => void
  tokenAmountAfterB: string
  setTokenAmountAfterB: (data: string) => void
  isFixedDisplayTokenA: boolean
  setIsFixedDisplayTokenA: (data: boolean) => void
  slideValue: string | number
  setSlideValue: (data: string | number) => void
  currentPosPoolInfo: any
  setCurrentPosPoolInfo: (data: any) => void
  currentPoolSqrtPrice: string
  setCurrentPoolSqrtPrice: (data: string) => void
  curPosContractPoolInfo: any
  setCurPosContractPoolInfo: (data: any) => void
  isPosHistoryLoading: boolean
  setIsPosHistoryLoading: (isPosHistoryLoading: boolean) => void
  curPosHistoryList: any
  setCurPosHistoryList: (data: any) => void
  isPosDetailRefresh: boolean
  setIsPosDetailRefresh: (data: boolean) => void
  useZapIn: boolean
  setUseZapIn: (value: boolean) => void
  isAutoClaim: boolean
  setIsAutoClaim: (value: boolean) => void

  totalDailyExpansionFactorUSD: any
  setTotalDailyExpansionFactorUSD: (data: any) => void
  currentRangeTab: string
  setCurrentRangeTab: (value: string) => void
  isDirect: undefined | boolean
  setIsDirect: (value: undefined | boolean) => void
  isPriceDirect: undefined | boolean
  setIsPriceDirect: (value: undefined | boolean) => void
  rangeTabList: any
  setRangeTabList: (data: any) => void
}

const store: StateCreator<PositionDetailState> = (set, get) => ({
  rangeTabList: undefined,
  setRangeTabList: (value: any) => {
    set(() => ({
      rangeTabList: value
    }))
  },
  currentRangeTab: '',
  setCurrentRangeTab: (value: string) => {
    set(() => ({
      currentRangeTab: value
    }))
  },
  isDirect: undefined,
  setIsDirect: (value: any) => {
    set(() => ({
      isDirect: value
    }))
  },
  isPriceDirect: undefined,
  setIsPriceDirect: (value: any) => {
    set(() => ({
      isPriceDirect: value
    }))
  },
  totalDailyExpansionFactorUSD: null,
  setTotalDailyExpansionFactorUSD: (value: any) => {
    set(() => ({
      totalDailyExpansionFactorUSD: value
    }))
  },
  isAutoClaim: true,
  setIsAutoClaim: (value: boolean) => {
    set(() => ({
      isAutoClaim: value
    }))
  },
  isPosDetailRefresh: false,
  setIsPosDetailRefresh: (isPosDetailRefresh: boolean) => {
    set(() => ({
      isPosDetailRefresh
    }))
  },
  isPosHistoryLoading: true,
  setIsPosHistoryLoading: (isPosHistoryLoading: boolean) => {
    set(() => ({
      isPosHistoryLoading
    }))
  },
  curPosHistoryList: [],
  setCurPosHistoryList: (data: any) => {
    set(() => ({
      curPosHistoryList: data
    }))
  },
  currentPosDetailTab: 'increase',
  setCurrentPosDetailTab: (data: string) => {
    set(() => ({
      currentPosDetailTab: data
    }))
  },
  tokenAmountAfterA: '',
  setTokenAmountAfterA: (data: string) => {
    set(() => ({
      tokenAmountAfterA: data
    }))
  },
  tokenAmountAfterB: '',
  setTokenAmountAfterB: (data: string) => {
    set(() => ({
      tokenAmountAfterB: data
    }))
  },
  isFixedDisplayTokenA: true,
  setIsFixedDisplayTokenA: (data: boolean) => {
    set(() => ({
      isFixedDisplayTokenA: data
    }))
  },
  slideValue: '--',
  setSlideValue: (data: string | number) => {
    set(() => ({
      slideValue: data
    }))
  },
  currentPosPoolInfo: null,
  setCurrentPosPoolInfo: (data: any) => {
    set(() => ({
      currentPosPoolInfo: data
    }))
  },
  currentPoolSqrtPrice: '',
  setCurrentPoolSqrtPrice: (data: string) => {
    set(() => ({
      currentPoolSqrtPrice: data
    }))
  },
  curPosContractPoolInfo: null,
  setCurPosContractPoolInfo: (data: any) => {
    set(() => ({
      curPosContractPoolInfo: data
    }))
  },
  useZapIn: false,
  setUseZapIn: (value: boolean) => {
    set(() => ({
      useZapIn: value
    }))
  }
})

const usePositionDetailStore = create(store)
export default usePositionDetailStore
