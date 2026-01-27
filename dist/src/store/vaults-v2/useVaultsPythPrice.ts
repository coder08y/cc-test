import { create } from 'zustand'

interface VaultsPythPriceState {
  pythPriceMap: Record<string, any>
  setPythPriceMap: (pythPriceMap: Record<string, any>) => void
}

const useVaultsPythPriceStore = create<VaultsPythPriceState>((set, get) => ({
  pythPriceMap: {},
  setPythPriceMap: (pythPriceMap: Record<string, any>) => {
    set({ pythPriceMap: { ...get().pythPriceMap, ...pythPriceMap } })
  }
}))

export default useVaultsPythPriceStore
