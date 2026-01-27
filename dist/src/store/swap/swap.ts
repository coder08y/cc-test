import { QuoteMode, SwapRfqData, SwapRouterData } from '@/types/swap'
import { Token } from '@cetus/types'
import { StateCreator, create } from 'zustand'

export interface SwapConfigState {
  fromCoin: Token | undefined
  toCoin: Token | undefined
  setFromCoin: (value: Token | undefined) => void
  setToCoin: (value: Token | undefined) => void

  byAmountIn: boolean
  setByAmountIn: (byAmountIn: boolean) => void

  fromAmount: string
  toAmount: string
  setFromAmount: (amount: string) => void
  setToAmount: (amount: string) => void

  findRouterLoading: boolean
  setFindRouterLoading: (loading: boolean) => void

  rfqData?: SwapRfqData
  routerData?: SwapRouterData
  setRouterData: (data?: SwapRouterData) => void
  setRfqData: (data?: SwapRfqData) => void

  userSelectQuoteMode: QuoteMode
  setUserSelectQuoteMode: (mode: QuoteMode) => void
}

const store: StateCreator<SwapConfigState> = (set, get) => ({
  userSelectQuoteMode: 'router',
  byAmountIn: true,
  findRouterLoading: false,
  fromAmount: '',
  toAmount: '',
  fromCoin: undefined,
  toCoin: undefined,
  routerData: undefined,
  rfqData: undefined,
  setFromCoin: (value: Token | undefined) => {
    set(() => ({
      fromCoin: value
    }))
  },
  setToCoin: (value: Token | undefined) => {
    set(() => ({
      toCoin: value
    }))
  },

  setFromAmount: (amount: string) => {
    set(() => ({
      fromAmount: amount
    }))
  },
  setToAmount: (amount: string) => {
    set(() => ({
      toAmount: amount
    }))
  },
  setFindRouterLoading: (loading: boolean) => {
    set(() => ({
      findRouterLoading: loading
    }))
  },
  setByAmountIn: (byAmountIn: boolean) => {
    set(() => ({
      byAmountIn
    }))
  },
  setUserSelectQuoteMode: (mode: QuoteMode) => {
    set(() => ({
      userSelectQuoteMode: mode
    }))
  },
  setRouterData: (data?: SwapRouterData) => {
    set(() => ({
      routerData: data
    }))
  },
  setRfqData: (data?: SwapRfqData) => {
    set(() => ({
      rfqData: data
    }))
  }
})

const useSwapStore = create(store)
export default useSwapStore
