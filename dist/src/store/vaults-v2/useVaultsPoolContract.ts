import { DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { Pool as ClmmPool } from '@cetusprotocol/sui-clmm-sdk'
import { create } from 'zustand'

type VaultsPoolContract = {
  lstVaultContractInfoObj: Record<string, any>
  haedalVaultContractInfoObj: Record<string, any>
  vaultClmmPoolContractInfoObj: Record<string, ClmmPool>
  dlmmVaultContractInfoObj: Record<string, any>
  vaultDlmmPoolContractInfoObj: Record<string, DlmmPool>
  setLstVaultContractInfoObj: (obj: Record<string, any>) => void
  setHaedalVaultContractInfoObj: (obj: Record<string, any>) => void
  setVaultClmmPoolContractInfoObj: (obj: Record<string, any>) => void
  setDlmmVaultContractInfoObj: (obj: Record<string, any>) => void
  setVaultDlmmPoolContractInfoObj: (obj: Record<string, any>) => void
}

const useVaultsPoolContractStore = create<VaultsPoolContract>((set, get) => ({
  lstVaultContractInfoObj: {},
  haedalVaultContractInfoObj: {},
  vaultClmmPoolContractInfoObj: {},
  dlmmVaultContractInfoObj: {},
  vaultDlmmPoolContractInfoObj: {},
  setLstVaultContractInfoObj: (obj: Record<string, any>) => {
    const originData = get().lstVaultContractInfoObj
    set(() => ({
      lstVaultContractInfoObj: { ...originData, ...obj }
    }))
  },
  setHaedalVaultContractInfoObj: (obj: Record<string, any>) => {
    const originData = get().haedalVaultContractInfoObj
    set(() => ({
      haedalVaultContractInfoObj: { ...originData, ...obj }
    }))
  },
  setVaultClmmPoolContractInfoObj: (obj: Record<string, ClmmPool>) => {
    const originData = get().vaultClmmPoolContractInfoObj
    set(() => ({
      vaultClmmPoolContractInfoObj: { ...originData, ...obj }
    }))
  },
  setDlmmVaultContractInfoObj: (obj: Record<string, any>) => {
    const originData = get().dlmmVaultContractInfoObj
    set(() => ({
      dlmmVaultContractInfoObj: { ...originData, ...obj }
    }))
  },
  setVaultDlmmPoolContractInfoObj: (obj: Record<string, DlmmPool>) => {
    const originData = get().vaultDlmmPoolContractInfoObj
    set(() => ({
      vaultDlmmPoolContractInfoObj: { ...originData, ...obj }
    }))
  }
}))

export default useVaultsPoolContractStore
