import { RecommendRangesType } from '@/types'
import { StateCreator, create } from 'zustand'

interface DepositState {
  priceRangeMap: Record<string, object> | null
  setPriceRangeMap: (value: Record<string, object> | null) => void
  recommendRangesInfo: RecommendRangesType | null
  setRecommendRangesInfo: (value: RecommendRangesType | null) => void
  resetDeposit: () => void
}

const store: StateCreator<DepositState> = (set, get) => ({
  priceRangeMap: null,
  setPriceRangeMap: (value: Record<string, object> | null) => {
    set(() => ({
      priceRangeMap: value
    }))
  },
  recommendRangesInfo: null,
  setRecommendRangesInfo: (value: RecommendRangesType | null) => {
    set(() => ({
      recommendRangesInfo: value
    }))
  },
  resetDeposit: () => {
    set(() => ({
      priceRangeMap: null,
      recommendRangesInfo: null
    }))
  }
})

const useDepositStore = create(store)
export default useDepositStore
