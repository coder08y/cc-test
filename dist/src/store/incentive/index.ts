import { DLMMPoolApiInfo } from '@/types'
import { CommonContentTable, INCENTIVE_WHITE_TOKEN_LIST } from '@cetus/utils'
import { DlmmGlobalConfig, DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { StateCreator, create } from 'zustand'

interface IncentiveState {
  incentiveApiPoolInfo: Partial<DLMMPoolApiInfo> | undefined
  setIncentiveApiPoolInfo: (data: Partial<DLMMPoolApiInfo> | undefined) => void
  incentiveContractPoolInfo: (DlmmPool & SnakeToCamel<DlmmPool>) | undefined
  setIncentiveContractPoolInfo: (value: (DlmmPool & SnakeToCamel<DlmmPool>) | undefined) => void
  poolWhiteTokenList: string[]
  setPoolWhiteTokenList: (value: string[]) => void
  globalConfig: DlmmGlobalConfig | undefined
  setGlobalConfig: (value: DlmmGlobalConfig | undefined) => void
}

const store: StateCreator<IncentiveState> = (set, get) => ({
  incentiveApiPoolInfo: undefined,
  setIncentiveApiPoolInfo: (data: Partial<DLMMPoolApiInfo> | undefined) => {
    set(() => ({
      incentiveApiPoolInfo: data
    }))
  },
  incentiveContractPoolInfo: undefined,
  setIncentiveContractPoolInfo: (data: (DlmmPool & SnakeToCamel<DlmmPool>) | undefined) => {
    set(() => ({
      incentiveContractPoolInfo: data
    }))
  },
  poolWhiteTokenList: [],
  setPoolWhiteTokenList: (data: string[]) => {
    CommonContentTable.setItem(INCENTIVE_WHITE_TOKEN_LIST, data)
    set(() => ({
      poolWhiteTokenList: data
    }))
  },
  globalConfig: undefined,
  setGlobalConfig: (data: DlmmGlobalConfig | undefined) => {
    set(() => ({
      globalConfig: data
    }))
  }
})

const useIncentiveStore = create(store)
export default useIncentiveStore

CommonContentTable.getItem<any>(INCENTIVE_WHITE_TOKEN_LIST).then((data: any) => {
  console.log('🚀 ~ CommonContentTable.getItem<any> ~ data:', data)
  if (data !== null) {
    useIncentiveStore.getState().setPoolWhiteTokenList(data)
  }
})
