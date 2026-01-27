import { StateCreator, create } from 'zustand'

interface DlmmDepositState {
  priceRangeMap: Record<string, object> | null
  setPriceRangeMap: (value: Record<string, object> | null) => void
  resetDeposit: () => void
}

const store: StateCreator<DlmmDepositState> = (set, get) => ({
  priceRangeMap: null,
  setPriceRangeMap: (value: Record<string, object> | null) => {
    set(() => ({
      priceRangeMap: value
    }))
  },
  resetDeposit: () => {
    set(() => ({
      priceRangeMap: null
    }))
  }
})

const useDlmmDepositStore = create(store)
export default useDlmmDepositStore
