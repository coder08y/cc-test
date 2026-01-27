import { VaultsZapProps } from '@/components/vaults-v2/detail/VaultsZapRoute'
import { Token } from '@cetus/types'
import { StateCreator, create } from 'zustand'

interface VaultsActionState {
  amountInputA: string
  amountInputB: string
  setAmountInputA: (amountInputA: string) => void
  setAmountInputB: (amountInputB: string) => void
  fromToken: Token
  toToken: Token
  setFromToken: (fromToken: Token) => void
  setToToken: (toToken: Token) => void
  calculateResult: { amount_a: string; amount_b: string; ft_amount?: string; burn_ft_amount?: string; swap_result?: any; swap?: any }
  setCalculateResult: (
    calculateResult: { amount_a: string; amount_b: string; ft_amount?: string; burn_ft_amount?: string; swap_result?: any; swap?: any } | undefined
  ) => void
  clearVaultsActionData: () => void
  // 用于profile
  isProfileOpenVaultModal: boolean
  setIsProfileOpenVaultModal: (isProfileOpenVaultModal: boolean) => void
  profilePoolInfo: any
  setProfilePoolInfo: (profilePoolInfo: any) => void
  profileActionTab: 'Deposit' | 'Withdraw'
  setProfileActionTab: (profileActionTab: 'Deposit' | 'Withdraw') => void
  isCheckedZAP: boolean
  setIsCheckedZAP: (status: boolean) => void
  assetAction: string
  setAssetAction: (value: string) => void
  currTab: string
  setCurrTab: (value: string) => void

  vaultsZapProps?: VaultsZapProps
  setVaultsZapProps: (vaultsZapProps?: VaultsZapProps) => void
}

const store: StateCreator<VaultsActionState> = (set, get) => ({
  vaultsZapProps: undefined,
  setVaultsZapProps: (vaultsZapProps?: VaultsZapProps) => {
    set(() => ({
      vaultsZapProps
    }))
  },
  amountInputA: '',
  isProfileOpenVaultModal: false,
  setIsProfileOpenVaultModal: (isProfileOpenVaultModal: boolean) => {
    set(() => ({
      isProfileOpenVaultModal
    }))
  },
  profilePoolInfo: {},
  setProfilePoolInfo: (profilePoolInfo: any) => {
    set(() => ({
      profilePoolInfo
    }))
  },
  amountInputB: '',
  setAmountInputA: (value: string) => {
    set(() => ({
      amountInputA: value
    }))
  },
  profileActionTab: 'Deposit',
  setProfileActionTab: (profileActionTab: 'Deposit' | 'Withdraw') => {
    set(() => ({
      profileActionTab
    }))
  },
  setAmountInputB: (value: string) => {
    set(() => ({
      amountInputB: value
    }))
  },
  fromToken: {} as Token,
  toToken: {} as Token,
  setFromToken: (fromToken: Token) => set({ fromToken }),
  setToToken: (toToken: Token) => set({ toToken }),
  calculateResult: undefined,
  setCalculateResult: (
    calculateResult: { amount_a: string; amount_b: string; ft_amount?: string; burn_ft_amount?: string; swap_result?: any; swap?: any } | undefined
  ) => set({ calculateResult }),
  clearVaultsActionData: () =>
    set({
      amountInputA: '',
      amountInputB: '',
      // fromToken: {} as Token,
      // toToken: {} as Token,
      calculateResult: undefined,
      vaultsZapProps: undefined
    }),
  isCheckedZAP: false,
  setIsCheckedZAP: (status: boolean) => {
    set({ isCheckedZAP: status })
  },
  assetAction: 'both',
  setAssetAction: (value: string) => {
    set({ assetAction: value })
  },
  currTab: 'Deposit',
  setCurrTab: (value: string) => {
    set({ currTab: value })
  }
})

const useVaultsActionStore = create(store)
export default useVaultsActionStore
