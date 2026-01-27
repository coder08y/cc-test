import { create } from 'zustand'

interface VaultsPositionState {
  vaultsPositionLoading: boolean
  setVaultsPositionLoading: (vaultsPositionLoading: boolean) => void

  vaultsPositionObj: Record<string, any>
  setVaultsPositionObj: (obj: Record<string, any>) => void
  clearVaultsPositionObj: () => void

  currentVaultPosition: Record<string, any>
  setCurrentVaultPosition: (currentVaultPosition: Record<string, any>) => void

  currentVaultPositionLoading: boolean
  setCurrentVaultPositionLoading: (currentVaultPositionLoading: boolean) => void

  vaultsTotalTvl: string
  setVaultsTotalTvl: (vaultsTotalTvl: string) => void

  showVaultsList: any[]
  setShowVaultsList: (list: any) => void

  showVaultsListLength: string

  dailyYieldPerLpMap: Record<string, any>
  setDailyYieldPerLpMap: (vaultId: string, dailyYieldPerLp: number) => void
}

const useVaultsPositionStore = create<VaultsPositionState>((set, get) => ({
  dailyYieldPerLpMap: {},
  setDailyYieldPerLpMap: (vaultId: string, dailyYieldPerLp: number) =>
    set(() => ({ dailyYieldPerLpMap: { ...get().dailyYieldPerLpMap, [vaultId]: dailyYieldPerLp } })),
  vaultsPositionObj: {},
  setVaultsPositionObj: (obj: Record<string, any>) => {
    const oldOwners = new Set(Object.values(get().vaultsPositionObj).map(i => i.ownerAddress))
    const newOwners = new Set(Object.values(obj).map(i => i.ownerAddress))

    const isSame = oldOwners.size === newOwners.size && [...oldOwners].every(owner => newOwners.has(owner))

    set(state => ({
      vaultsPositionObj: isSame ? { ...state.vaultsPositionObj, ...obj } : obj
    }))
  },
  clearVaultsPositionObj: () => set(() => ({ vaultsPositionObj: {} })),

  currentVaultPosition: {},
  setCurrentVaultPosition: (currentVaultPosition: Record<string, any>) => set(() => ({ currentVaultPosition })),

  currentVaultPositionLoading: true,
  setCurrentVaultPositionLoading: (currentVaultPositionLoading: boolean) => set(() => ({ currentVaultPositionLoading })),

  vaultsPositionLoading: false,
  setVaultsPositionLoading: (vaultsPositionLoading: boolean) => set(() => ({ vaultsPositionLoading })),

  vaultsTotalTvl: '',
  setVaultsTotalTvl: (vaultsTotalTvl: string) => set(() => ({ vaultsTotalTvl })),

  showVaultsList: [],
  showVaultsListLength: '',
  setShowVaultsList: (showVaultsList: any[]) => set(() => ({ showVaultsList, showVaultsListLength: String(showVaultsList?.length) }))
}))

export default useVaultsPositionStore
