import { PoolType } from '@/components/pools/createPool/SelectPoolType'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { StateCreator, create } from 'zustand'

interface CreatePoolState {
  poolType: PoolType
  setPoolType: (poolType: PoolType) => void
  currentStep: number
  setCurrentStep: (step: number) => void
  editStep: number
  setEditStep: (step: number) => void
  displayBaseToken: Token | undefined
  setDisplayBaseToken: (token: Token | undefined) => void
  displayQuoteToken: Token | undefined
  setDisplayQuoteToken: (token: Token | undefined) => void
  baseToken: Token | undefined
  setBaseToken: (token: Token | undefined) => void
  quoteToken: Token | undefined
  setQuoteToken: (token: Token | undefined) => void
  quoteWhiteTokenList: Token[]
  setQuoteWhiteTokenList: (tokenList: Token[]) => void
  backToStepOne: (poolType: PoolType) => void
  resetCreatePoolState: () => void
}

const store: StateCreator<CreatePoolState> = (set, get) => ({
  poolType: 'clmm',
  setPoolType: (poolType: PoolType) => {
    set(() => ({
      poolType
    }))
  },
  currentStep: 2,
  setCurrentStep: (step: number) => {
    set(() => ({
      currentStep: step
    }))
  },
  editStep: 2,
  setEditStep: (step: number) => {
    set(() => ({
      editStep: step
    }))
  },
  displayBaseToken: undefined,
  setDisplayBaseToken: (token: Token | undefined) => {
    set(() => ({
      displayBaseToken: token
    }))
  },
  displayQuoteToken: undefined,
  setDisplayQuoteToken: (token: Token | undefined) => {
    set(() => ({
      displayQuoteToken: token
    }))
  },
  baseToken: undefined,
  setBaseToken: (token: Token | undefined) => {
    set(() => ({
      baseToken: token
    }))
  },
  quoteToken: undefined,
  setQuoteToken: (token: Token | undefined) => {
    set(() => ({
      quoteToken: token
    }))
  },
  quoteWhiteTokenList: [],
  setQuoteWhiteTokenList: (tokenList: Token[]) => {
    set(() => ({
      quoteWhiteTokenList: tokenList
    }))
  },
  backToStepOne: (poolType: PoolType) => {
    set(() => ({
      poolType,
      currentStep: 1,
      editStep: 1,
      displayBaseToken: undefined,
      displayQuoteToken: envConfigs.sui_coin,
      baseToken: undefined,
      quoteToken: envConfigs.sui_coin
    }))
  },

  resetCreatePoolState: () => {
    set(() => ({
      currentStep: 2,
      editStep: 2,
      displayBaseToken: undefined,
      displayQuoteToken: undefined,
      baseToken: undefined,
      quoteToken: undefined,
      quoteWhiteTokenList: []
    }))
  }
})

const useCreatePoolStore = create(store)
export default useCreatePoolStore
