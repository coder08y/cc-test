import { QuoteMode, SwapRfqData, SwapRouterData } from '@/types/swap'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { StateCreator, create } from 'zustand'
import { SwapConfigState } from '../swap/swap'

const store: StateCreator<SwapConfigState> = (set, get) => ({
  byAmountIn: true,
  findRouterLoading: false,
  fromAmount: '',
  toAmount: '',
  fromCoin: envConfigs.clmm_swap.from_coin,
  toCoin: envConfigs.clmm_swap.to_coin,
  routerData: undefined,
  rfqData: undefined,
  userSelectQuoteMode: 'router',
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
  setRouterData: (data?: SwapRouterData) => {
    set(() => ({
      routerData: data
    }))
  },
  setRfqData: (data?: SwapRfqData) => {
    set(() => ({
      rfqData: data
    }))
  },
  setUserSelectQuoteMode: (mode: QuoteMode) => {
    set(() => ({
      userSelectQuoteMode: mode
    }))
  }
})

const useSwapWidgetStore = create(store)
export default useSwapWidgetStore
