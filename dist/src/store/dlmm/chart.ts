import { BinAmount, BinLiquidityInfo } from '@cetusprotocol/dlmm-sdk'
import { StateCreator, create } from 'zustand'

interface DlmmChartStoreState {
  allBins: BinAmount[] // 当前池子合约中的所有bins
  allBinsObj: Record<string, BinAmount>
  setAllBins: (value: BinAmount[]) => void
  currentLiquidityInfo: BinLiquidityInfo | undefined
  setCurrentLiquidityInfo: (value: BinLiquidityInfo | undefined) => void
}

const store: StateCreator<DlmmChartStoreState> = (set, get) => ({
  allBins: [],
  allBinsObj: {},
  setAllBins: (value: BinAmount[]) => {
    const res = Object.fromEntries(value.map(item => [item.bin_id, item]))
    set(() => ({
      allBins: value,
      allBinsObj: res
    }))
  },
  currentLiquidityInfo: undefined,
  setCurrentLiquidityInfo: (value: BinLiquidityInfo | undefined) => {
    set(() => ({
      currentLiquidityInfo: value
    }))
  }
})

const useDlmmChartStore = create(store)
export default useDlmmChartStore
