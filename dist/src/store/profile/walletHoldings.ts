import { CoinHolding } from '@/types/profile'
import { StateCreator, create } from 'zustand'

export interface SwapConfigState {
  /**
   * 钱包持有币种loading
   */
  isCoinHoldingLoading: boolean
  setIsCoinHoldingLoading: (value: boolean) => void
  /**
   * 钱包持有币种列表
   */
  coinHoldingList: CoinHolding[]
  setCoinHoldingList: (value: CoinHolding[]) => void

  /**
   * 钱包持有币种价格loading
   */
  isCoinPriceLoading: boolean
  setIsCoinPriceLoading: (value: boolean) => void

  /**
   * 钱包持有币种总价值
   */
  holdingsTotalUsd: string
  setHoldingsTotalUsd: (value: string) => void

  /**
   * 未知币种数量
   */
  unknownCoinCount: number
  setUnknownCoinCount: (value: number) => void

  /**
   * 列表筛选后未知币种数量
   */
  filterUnknownCoinCount: number
  setFilterUnknownCoinCount: (value: number) => void
}

const store: StateCreator<SwapConfigState> = (set, get) => ({
  coinHoldingList: [],
  isCoinHoldingLoading: true,
  setIsCoinHoldingLoading: (value: boolean) => set({ isCoinHoldingLoading: value }),
  setCoinHoldingList: (value: CoinHolding[]) => set({ coinHoldingList: value }),

  isCoinPriceLoading: true,
  setIsCoinPriceLoading: (value: boolean) => set({ isCoinPriceLoading: value }),

  holdingsTotalUsd: '0',
  setHoldingsTotalUsd: (value: string) => set({ holdingsTotalUsd: value }),

  unknownCoinCount: 0,
  setUnknownCoinCount: (value: number) => set({ unknownCoinCount: value }),

  filterUnknownCoinCount: 0,
  setFilterUnknownCoinCount: (value: number) => set({ filterUnknownCoinCount: value })
})

const useWalletHoldingsStore = create(store)
export default useWalletHoldingsStore
