import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompensationState {
  vaultPositionLoading: boolean
  setVaultPositionLoading: (status: boolean) => void

  vaultPositionList: any
  setVaultPositionList: (list: any) => void

  vaultVestInfoObj: any
  setVaultVestInfoObj: (data: any) => void

  clmmVestInfo: any
  setClmmVestInfo: (data: any) => void

  posBaseListLoading: boolean
  setPosbaseListLoading: (status: boolean) => void

  posBaseListGroupByPool: any
  setPosBaseListGroupByPool: (data: any) => void

  posBaseList: any
  setPosBaseList: (list: any) => void

  posTotalCetusCompensation: string
  setPosTotalCetusCompensation: (num: string) => void

  posTotalAvailableClaim: string
  setPosTotalAvailableClaim: (num: string) => void

  vltTotalCetusCompensation: string
  setVltTotalCetusCompensation: (num: string) => void

  vltTotalAvailableClaim: string
  setVltTotalAvailableClaim: (num: string) => void

  redeemAllLoading: boolean
  setRedeemAllLoading: (status: boolean) => void

  vaultPosGroupByPool: any
  setVaultPosGroupByPool: (list: any) => void
}

const store: StateCreator<CompensationState> = (set, get) => ({
  vaultPositionLoading: false,
  setVaultPositionLoading: (status: boolean) => {
    set(() => ({
      vaultPositionLoading: status
    }))
  },

  vaultPositionList: [],
  setVaultPositionList: (list: any) => {
    set(() => ({
      vaultPositionList: list
    }))
  },

  vaultVestInfoObj: {},
  setVaultVestInfoObj: (data: any) => {
    set(() => ({
      vaultVestInfoObj: data
    }))
  },

  clmmVestInfo: {},
  setClmmVestInfo: (data: any) => {
    set(() => ({
      clmmVestInfo: data
    }))
  },

  posBaseListGroupByPool: {},
  setPosBaseListGroupByPool: (data: any) => {
    set(() => ({
      posBaseListGroupByPool: data
    }))
  },

  posBaseListLoading: false,
  setPosbaseListLoading: (status: boolean) => {
    set(() => ({
      posBaseListLoading: status
    }))
  },

  posTotalCetusCompensation: '',
  setPosTotalCetusCompensation: (num: string) => {
    set(() => ({
      posTotalCetusCompensation: num
    }))
  },

  posTotalAvailableClaim: '',
  setPosTotalAvailableClaim: (num: string) => {
    set(() => ({
      posTotalAvailableClaim: num
    }))
  },

  vltTotalCetusCompensation: '',
  setVltTotalCetusCompensation: (num: string) => {
    set(() => ({
      vltTotalCetusCompensation: num
    }))
  },

  vltTotalAvailableClaim: '',
  setVltTotalAvailableClaim: (num: string) => {
    set(() => ({
      vltTotalAvailableClaim: num
    }))
  },

  posBaseList: [],
  setPosBaseList: (list: any) => {
    set(() => ({
      posBaseList: list
    }))
  },

  redeemAllLoading: false,
  setRedeemAllLoading: (status: boolean) => {
    set(() => ({
      redeemAllLoading: status
    }))
  },

  vaultPosGroupByPool: [],
  setVaultPosGroupByPool: (list: any) => {
    set(() => ({
      vaultPosGroupByPool: list
    }))
  }
})

const useCompensationStore = create(
  persist(store, {
    name: 'useCompensationStore',
    partialize: state => {
      const { vaultVestInfoObj, clmmVestInfo } = state
      return { vaultVestInfoObj, clmmVestInfo }
    }
  })
)
export default useCompensationStore
