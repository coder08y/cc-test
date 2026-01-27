import { StateCreator, create } from 'zustand'

interface DepthChartState {
  formatPriceData: any
  setFormatPriceData: (data: any) => void
  formatPriceDataIsLoading: boolean
  setFormatPriceDataIsLoading: (value: boolean) => void
  ticksPool: any
  setTicksPool: (data: any) => void
}

const store: StateCreator<DepthChartState> = (set, get) => ({
  formatPriceData: [],
  setFormatPriceData: (data: any) => {
    set(() => ({
      formatPriceData: data,
      formatPriceDataIsLoading: false
    }))
  },
  formatPriceDataIsLoading: true,
  setFormatPriceDataIsLoading: (value: boolean) => {
    set(() => ({
      formatPriceDataIsLoading: value
    }))
  },
  ticksPool: {},
  setTicksPool: (data: any) => {
    set(() => ({
      ticksPool: data
    }))
  }
})

const useDepthChartStore = create(store)
export default useDepthChartStore
