import { Token } from '@cetus/types'
import { StateCreator, create } from 'zustand'

interface zapState {
  currentTokens: Token[]
  setCurrentTokens: (data: Token[]) => void
  zapAmount: string
  setZapAmount: (value: string) => void
  zapAmountRate: string
  setZapAmountRate: (value: string) => void
  currentZapToken: Token | undefined
  setCurrentZapToken: (value: Token) => void
  zapTokenBalance: any
  setZapTokenBalance: (value: any) => void
  preDepositeData: any
  setPreDepositeData: (data: any) => void
  isPreLoading: boolean
  setIsPreLoading: (value: any) => void
  zapApiPool: any
  setZapApiPool: (data: any) => void
  lower: number
  setLower: (value: number) => void
  upper: number
  setUpper: (value: number) => void
  liquidity: string
  setLiquidity: (value: string) => void
  zapCurrPriceData: any
  setZapCurrPriceData: (data: any) => void
  zapSlideValue: number
  setZapSlideValue: (value: number | string) => void
  resetZapData: () => void
  posOriginAmounts: any
  setPosOriginAmounts: (data: any) => void
}

const store: StateCreator<zapState> = (set, get) => ({
  currentTokens: [],
  setCurrentTokens: (data: Token[]) => {
    set(() => ({
      currentTokens: data
    }))
  },
  zapAmount: '',
  setZapAmount: (value: string) => {
    set(() => ({
      zapAmount: value
    }))
  },
  currentZapToken: undefined,
  setCurrentZapToken: (value: Token) => {
    set(() => ({
      currentZapToken: value
    }))
  },
  zapAmountRate: '',
  setZapAmountRate: (value: string) => {
    set(() => ({
      zapAmountRate: value
    }))
  },
  zapTokenBalance: undefined,
  setZapTokenBalance: (value: any) => {
    set(() => ({
      zapTokenBalance: value
    }))
  },
  isPreLoading: false,
  setIsPreLoading: (value: any) => {
    set(() => ({
      isPreLoading: value
    }))
  },
  preDepositeData: undefined,
  setPreDepositeData: (data: any) => {
    set(() => ({
      preDepositeData: data,
      isPreLoading: false
    }))
  },
  zapApiPool: undefined,
  setZapApiPool: (data: any) => {
    set(() => ({
      zapApiPool: data
    }))
  },
  lower: 0,
  setLower: (value: number) => {
    set(() => ({
      lower: value
    }))
  },
  upper: 0,
  setUpper: (value: number) => {
    set(() => ({
      upper: value
    }))
  },
  liquidity: '',
  setLiquidity: (value: string) => {
    set(() => ({
      liquidity: value
    }))
  },
  zapCurrPriceData: {},
  setZapCurrPriceData: (data: any) => {
    set(() => ({
      zapCurrPriceData: data
    }))
  },
  zapSlideValue: 0,
  setZapSlideValue: (value: number | string) => {
    set(() => ({
      zapSlideValue: Number(value === '--' ? 0 : value)
    }))
  },
  posOriginAmounts: {},
  setPosOriginAmounts: (data: any) => {
    set(() => ({
      posOriginAmounts: data
    }))
  },
  resetZapData: () => {
    set(() => ({
      zapAmount: '',
      zapAmountRate: '',
      lower: 0,
      upper: 0,
      preDepositeData: undefined,
      isPreLoading: false,
      liquidity: '',
      zapSlideValue: 0,
      posOriginAmounts: {}
    }))
  }
})

const useZapStore = create(store)
export default useZapStore
