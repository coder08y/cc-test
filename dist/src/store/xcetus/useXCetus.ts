import { d } from '@cetusprotocol/common-sdk'
import { DividendManager, DividendReward, LockCetus, PhaseDividendInfo, VeNFT, XcetusManager } from '@cetusprotocol/xcetus-sdk'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface XCetusState {
  owner: string

  veNFT?: VeNFT
  veNFTLoading: boolean
  setVeNFT: (veNFT: VeNFT, owner: string) => void
  setVeNFTLoading: (isLoading: boolean) => void

  lockCetusListLoading: boolean
  lockCetusList: LockCetus[]
  setLockCetusList: (list: LockCetus[]) => void
  setLockCetusListLoading: (isLoading: boolean) => void

  XCetusManager?: XcetusManager
  setXCetusManager: (manager: XcetusManager) => void

  dividendManager?: DividendManager
  setDividendManager: (dividendManager: DividendManager) => void

  dividendRewardList: DividendReward[]
  setDividendRewardList: (list: DividendReward[]) => void

  phaseDividendInfoMap: Record<string, PhaseDividendInfo>
  setPhaseDividendInfoMap: (info: PhaseDividendInfo) => void

  showConvertModel: boolean
  setShowConvertModel: (show: boolean) => void

  availableXCetusAmount: string
  setAvailableXCetusAmount: (amount: string) => void

  availableXCetusAmountLoading: boolean
  setAvailableXCetusAmountLoading: (isLoading: boolean) => void

  clearData: () => void
}

const store: StateCreator<XCetusState> = (set, get) => ({
  showConvertModel: true,
  availableXCetusAmount: '0',
  availableXCetusAmountLoading: false,
  phaseDividendInfoMap: {},
  dividendManager: undefined,
  XCetusManager: undefined,
  dividendRewardList: [],
  lockCetusListLoading: false,
  veNFT: undefined,
  veNFTLoading: false,
  lockCetusList: [],
  owner: '',
  setVeNFTLoading: (isLoading: boolean) => {
    set(() => ({
      veNFTLoading: isLoading
    }))
  },
  setVeNFT: (veNFT: VeNFT, owner: string) => {
    set(() => ({
      veNFT,
      owner
    }))
  },
  setLockCetusList: (list: LockCetus[]) => {
    set(() => ({
      lockCetusList: [...list]
    }))
  },
  setLockCetusListLoading: (isLoading: boolean) => {
    set(() => ({
      lockCetusListLoading: isLoading
    }))
  },
  setXCetusManager: (manager: XcetusManager) => {
    set(() => ({
      XCetusManager: manager
    }))
  },
  setDividendManager: (dividendManager: DividendManager) => {
    set(() => ({
      dividendManager
    }))
  },
  setDividendRewardList: (list: DividendReward[]) => {
    set(() => ({
      dividendRewardList: list
    }))
  },
  setPhaseDividendInfoMap: (info: PhaseDividendInfo) => {
    const phaseDividendInfoMap = get().phaseDividendInfoMap
    phaseDividendInfoMap[info.phase] = info

    set(() => ({
      phaseDividendInfoMap: { ...phaseDividendInfoMap }
    }))
  },
  setShowConvertModel: (show: boolean) => {
    set(() => ({
      showConvertModel: show
    }))
  },
  setAvailableXCetusAmount: (amount: string) => {
    set(() => ({
      availableXCetusAmount: d(amount).lt(0) ? '0' : amount
    }))
  },
  setAvailableXCetusAmountLoading: (isLoading: boolean) => {
    set(() => ({
      availableXCetusAmountLoading: isLoading
    }))
  },
  clearData: () => {
    set(() => ({
      veNFT: undefined,
      owner: '',
      lockCetusList: [],
      lockCetusListLoading: false,
      availableXCetusAmount: '0',
      veNFTLoading: false,
      dividendRewardList: []
    }))
  }
})

const useXCetusStore = create(
  persist(store, {
    name: 'useXCetusStore',
    partialize: state => {
      const { owner, veNFT, lockCetusList, XCetusManager, dividendManager, phaseDividendInfoMap, showConvertModel, availableXCetusAmount } = state
      return {
        owner,
        veNFT,
        lockCetusList,
        XCetusManager,
        dividendManager,
        phaseDividendInfoMap,
        availableXCetusAmount,
        showConvertModel
      }
    }
  })
)
export default useXCetusStore
