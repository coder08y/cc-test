import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface VaultsRiskState {
  isCheckedAcceptWalletObj: Record<string, boolean>
  setIsCheckedAcceptWalletObj: (isCheckedWalletObj: Record<string, boolean>) => void
  isCheckedDontRemindWalletObj: Record<string, boolean>
  setIsCheckedDontRemindWalletObj: (isCheckedDontRemindWalletObj: Record<string, boolean>) => void
}

const store: StateCreator<VaultsRiskState> = (set, get) => ({
  isCheckedAcceptWalletObj: {},
  setIsCheckedAcceptWalletObj: (isCheckedWalletObj: Record<string, boolean>) =>
    set(() => ({
      isCheckedAcceptWalletObj: {
        ...get().isCheckedAcceptWalletObj,
        ...isCheckedWalletObj
      }
    })),
  isCheckedDontRemindWalletObj: {},
  setIsCheckedDontRemindWalletObj: (isCheckedDontRemindWalletObj: Record<string, boolean>) =>
    set(() => ({
      isCheckedDontRemindWalletObj: {
        ...get().isCheckedDontRemindWalletObj,
        ...isCheckedDontRemindWalletObj
      }
    }))
})

const useVaultsRiskStore = create(
  persist(store, {
    name: 'useVaultsRiskStore',
    partialize: state => {
      const { isCheckedAcceptWalletObj, isCheckedDontRemindWalletObj } = state
      return { isCheckedAcceptWalletObj, isCheckedDontRemindWalletObj }
    }
  })
)

export default useVaultsRiskStore
