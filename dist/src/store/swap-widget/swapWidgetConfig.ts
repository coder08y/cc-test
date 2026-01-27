import { WidgetButtonImgs } from '@/config/swap-widget'
import { WidgetDirection } from '@/types/swap-widget'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SwapConfigState {
  currWidgetImg: string
  saveCurrWidgetImg: (img: string) => void

  swapWidgetDirection: WidgetDirection
  saveSwapWidgetDirection: (direction: WidgetDirection) => void

  swapWidgetPosition: any
  setSwapWidgetPosition: (value: any) => void

  isOpen: boolean
  setIsOpen: (value: boolean) => void
}

const store: StateCreator<SwapConfigState> = (set, get) => ({
  currWidgetImg: WidgetButtonImgs[0],
  saveCurrWidgetImg: (img: string) => {
    set(() => ({
      currWidgetImg: img
    }))
  },

  swapWidgetDirection: 'right-bottom',
  saveSwapWidgetDirection: (direction: WidgetDirection) => {
    set(() => ({
      swapWidgetDirection: direction
    }))
  },
  swapWidgetPosition: { x: 0, y: 0 },
  setSwapWidgetPosition: (value: any) => {
    set(() => ({
      swapWidgetPosition: value
    }))
  },
  isOpen: false,
  setIsOpen: (value: boolean) => {
    set(() => ({
      isOpen: value
    }))
  }
})

const useSwapWidgetConfigStore = create(
  persist(store, {
    name: 'useSwapWidgetConfigStore',
    partialize: state => {
      const { swapWidgetPosition, swapWidgetDirection, currWidgetImg } = state
      return {
        swapWidgetPosition,
        swapWidgetDirection,
        currWidgetImg
      }
    }
  })
)

export default useSwapWidgetConfigStore
