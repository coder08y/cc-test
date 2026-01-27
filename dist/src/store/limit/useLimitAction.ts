import { Token } from '@cetus/types/src/common-types'
import { StateCreator, create } from 'zustand'

interface LimitActionState {
  // 支付coin
  payCoin?: Token | undefined
  // 目标coin
  targetCoin?: Token | undefined
  // 周期
  //展示的计价coin
  quoteToken?: Token | undefined
  expiresIn?: string
  customExpiresVal?: any
  refreshPriceLoading?: boolean
  setPayCoin: (coin: Token | undefined) => void
  setTargetCoin: (coin: Token | undefined) => void
  setQuoteToken: (coin: Token | undefined) => void
  setExpiresIn: (expiresIn: string) => void
  setCustomExpiresVal: (customExpiresVal: any) => void
  setRefreshPriceLoading: (refreshPriceLoading: boolean) => void
}

const store: StateCreator<LimitActionState> = (set, get) => ({
  quoteToken: undefined,
  payCoin: undefined,
  targetCoin: undefined,
  setPayCoin: (coin: Token | undefined) => {
    set(() => ({
      payCoin: coin
    }))
  },
  setTargetCoin: (coin: Token | undefined) => {
    set(() => ({
      targetCoin: coin
    }))
  },
  setQuoteToken: (coin: Token | undefined) => {
    set(() => ({
      quoteToken: coin
    }))
  },
  expiresIn: '7 Days',
  setExpiresIn: (expiresIn: string) => {
    set(() => ({
      expiresIn
    }))
  },
  customExpiresVal: null,
  setCustomExpiresVal: (customExpiresVal: any) => {
    set(() => ({
      customExpiresVal
    }))
  },
  refreshPriceLoading: false,
  setRefreshPriceLoading: (refreshPriceLoading: boolean) => {
    set(() => ({
      refreshPriceLoading
    }))
  }
})

const useLimitActionStore = create(store)
export default useLimitActionStore
