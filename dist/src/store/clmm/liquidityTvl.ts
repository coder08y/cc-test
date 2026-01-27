import { CoinPrice } from '@cetus/types'
import { d } from '@cetus/utils'
import { StateCreator, create } from 'zustand'

interface TvlInfoState {
  tokenAPrice: CoinPrice | undefined
  setTokenAPrice: (price: CoinPrice | undefined) => void
  tokenBPrice: CoinPrice | undefined
  setTokenBPrice: (price: CoinPrice | undefined) => void
  tokenAAmount: string
  setTokenAAmount: (value: string) => void
  tokenBAmount: string
  setTokenBAmount: (value: string) => void
  tokenAAmountUSD: string
  setTokenAAmountUSD: (value: string) => void
  tokenBAmountUSD: string
  setTokenBAmountUSD: (value: string) => void
  totalAmountUSD: string
  setTotalAmountUSD: (value: string) => void
  tvlLoading: boolean
  setTvlLoading: (value: boolean) => void
  resetTvlInfo: () => void
}

const store: StateCreator<TvlInfoState> = (set, get) => ({
  tokenAPrice: undefined,
  setTokenAPrice: (value: CoinPrice | undefined) => {
    set(() => ({
      tokenAPrice: value
    }))
  },
  tokenBPrice: undefined,
  setTokenBPrice: (value: CoinPrice | undefined) => {
    set(() => ({
      tokenBPrice: value
    }))
  },
  tokenAAmount: '',
  setTokenAAmount: (value: string) => {
    set(() => ({
      tokenAAmount: d(value).lt(0) ? '0' : value
    }))
  },
  tokenBAmount: '',
  setTokenBAmount: (value: string) => {
    set(() => ({
      tokenBAmount: d(value).lt(0) ? '0' : value
    }))
  },
  tokenAAmountUSD: '',
  setTokenAAmountUSD: (value: string) => {
    set(() => ({
      tokenAAmountUSD: value
    }))
  },
  tokenBAmountUSD: '',
  setTokenBAmountUSD: (value: string) => {
    set(() => ({
      tokenBAmountUSD: value
    }))
  },
  totalAmountUSD: '',
  setTotalAmountUSD: (value: string) => {
    set(() => ({
      totalAmountUSD: value
    }))
  },
  tvlLoading: true,
  setTvlLoading: (value: boolean) => {
    set(() => ({
      tvlLoading: value
    }))
  },
  resetTvlInfo: () => {
    set(() => ({
      tokenAPrice: undefined,
      tokenBPrice: undefined,
      tokenAAmount: '',
      tokenBAmount: '',
      tokenAAmountUSD: '',
      tokenBAmountUSD: '',
      totalAmountUSD: ''
    }))
  }
})

const useTvlInfoStore = create(store)
export default useTvlInfoStore
