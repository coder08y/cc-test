import { create } from 'zustand'

interface VaultsPositionState {
  vaultsPoolObj: Record<string, any>
  setVaultsPoolObj: (obj: Record<string, any>) => void
}

const useVaultsPoolStore = create<VaultsPositionState>(set => ({
  vaultsPoolObj: {},
  setVaultsPoolObj: (obj: Record<string, any>) =>
    set(state => ({
      vaultsPoolObj: {
        ...state.vaultsPoolObj,
        ...obj
      }
    }))
}))

export default useVaultsPoolStore
