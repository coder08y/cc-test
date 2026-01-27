import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VaultsState {
  vaultsList: any
  setVaultList: (list: any) => void

  vaultPageList: any
  setVaultPageList: (list: any) => void

  vaultListLoading: boolean
  setVaultListLoading: (loading: boolean) => void

  vaultsTokenList: any
  setVaultsTokenList: (list: any) => void

  lpTokenInfoObj: any
  setLpTokenInfoObj: (obj: any) => void

  vaultsTotalTvlDisplay: string
  setVaultTotalTvlDisplay: (tvl: string) => void

  vaultListObj: any
  setVaultListObj: (obj: any) => void

  vaultsTotalEarnedDisplay: string
  setVaultsTotalEarnedDisplay: (earned: string) => void
}
const store: StateCreator<VaultsState> = (set, get) => ({
  vaultsList: [],
  setVaultList: (list: any) => set({ vaultsList: list }),

  vaultPageList: [],
  setVaultPageList: (list: any) => set({ vaultPageList: list }),

  vaultListObj: {},
  setVaultListObj: (obj: any) => set({ vaultListObj: obj }),

  vaultListLoading: true,
  setVaultListLoading: (loading: boolean) => set({ vaultListLoading: loading }),

  vaultsTokenList: [],
  setVaultsTokenList: (list: any) => set({ vaultsTokenList: list }),

  lpTokenInfoObj: {},
  setLpTokenInfoObj: (obj: any) => set({ lpTokenInfoObj: obj }),

  vaultsTotalTvlDisplay: '',
  setVaultTotalTvlDisplay: (tvl: string) => set({ vaultsTotalTvlDisplay: tvl }),

  vaultsTotalEarnedDisplay: '',
  setVaultsTotalEarnedDisplay: (earned: string) => set({ vaultsTotalEarnedDisplay: earned })
})

const useVaultsListV2Store = create(
  persist(store, {
    name: 'useVaultsStoreV2',
    partialize: state => {
      const { vaultsList, vaultsTokenList, lpTokenInfoObj } = state
      return { vaultsList, vaultsTokenList, lpTokenInfoObj }
    }
  })
)
export default useVaultsListV2Store
