import { TabTypes } from '@/pages/XCetus'
import { StateCreator, create } from 'zustand'

export interface SwapConfigState {
  isXCetusModalOpen: boolean
  setIsXCetusModalOpen: (value: boolean) => void
  isXCetusLoading: boolean
  setIsXCetusLoading: (value: boolean) => void
  currentXCetusTab: TabTypes
  setCurrentXCetusTab: (value: TabTypes) => void
}

const store: StateCreator<SwapConfigState> = (set, get) => ({
  isXCetusModalOpen: false,
  setIsXCetusModalOpen: (value: boolean) => set({ isXCetusModalOpen: value }),
  isXCetusLoading: false,
  setIsXCetusLoading: (value: boolean) => set({ isXCetusLoading: value }),
  currentXCetusTab: 'Get xCETUS',
  setCurrentXCetusTab: (value: TabTypes) => set({ currentXCetusTab: value })
})

const useProfileXCetusStore = create(store)
export default useProfileXCetusStore
