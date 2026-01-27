import { TickData } from '@/types'
import { StateCreator, create } from 'zustand'

interface PriceRangeState {
  lowerTickData: Partial<TickData>
  setLowerTickData: (data: Partial<TickData>) => void
  upperTickData: Partial<TickData>
  setUpperTickData: (data: Partial<TickData>) => void
  tickDataLoading: boolean
  setTickDataLoading: (value: boolean) => void

  posLowerTickData: Partial<TickData>
  setPosLowerTickData: (data: Partial<TickData>) => void
  posUpperTickData: Partial<TickData>
  setPosUpperTickData: (data: Partial<TickData>) => void
  posTickDataLoading: boolean
  setPosTickDataLoading: (value: boolean) => void
}

const store: StateCreator<PriceRangeState> = (set, get) => ({
  lowerTickData: {},
  setLowerTickData: (data: Partial<TickData>) => {
    set(() => ({
      lowerTickData: data
    }))
  },
  upperTickData: {},
  setUpperTickData: (data: Partial<TickData>) => {
    set(() => ({
      upperTickData: data
    }))
  },
  tickDataLoading: true,
  setTickDataLoading: (value: boolean) => {
    set(() => ({
      tickDataLoading: value
    }))
  },
  posLowerTickData: {},
  setPosLowerTickData: (data: Partial<TickData>) => {
    set(() => ({
      posLowerTickData: data
    }))
  },
  posUpperTickData: {},
  setPosUpperTickData: (data: Partial<TickData>) => {
    set(() => ({
      posUpperTickData: data
    }))
  },
  posTickDataLoading: true,
  setPosTickDataLoading: (value: boolean) => {
    set(() => ({
      posTickDataLoading: value
    }))
  }
})

const usePriceRangeStore = create(store)
export default usePriceRangeStore
