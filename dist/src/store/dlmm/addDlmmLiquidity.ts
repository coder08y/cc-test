import { BothAndZapTabAction } from '@/types/dlmm'
import { Token } from '@cetus/types'
import { BinLiquidityInfo, MAX_BIN_ID, MIN_BIN_ID } from '@cetusprotocol/dlmm-sdk'
import { StateCreator, create } from 'zustand'

export type RangePriceType = {
  tokenA: Token
  tokenB: Token
  binId: number
  price: string
  displayPrice: string | number
  reversePrice: string
  displayReversePrice: string | number
  type: 'lower' | 'upper'
  triggerFrom?: string
  actionSource?: 'user' | 'system'
  changeCount?: number
}

interface AddLiquidityState {
  fromAmount: string
  setFromAmount: (value: string) => void
  fromAmountValue: string
  setFromAmountValue: (value: string) => void
  toAmount: string
  setToAmount: (value: string) => void
  toAmountValue: string
  setToAmountValue: (value: string) => void
  liquidityAmount: string
  setLiquidityAmount: (value: string) => void
  byAmountIn: boolean
  tokenMaxA: string
  setTokenMaxA: (value?: string) => void
  tokenMaxB: string
  setTokenMaxB: (value?: string) => void
  setByAmountIn: (value: boolean) => void
  isTokenA: boolean
  setIsTokenA: (value: boolean) => void
  fromToken: Token | undefined
  setFromToken: (token?: Token) => void
  fromLoading: boolean
  setFromLoading: (loading: boolean) => void
  fromTokenLock: boolean
  setFromTokenLock: (lock: boolean) => void
  toToken: Token | undefined
  setToToken: (token?: Token) => void
  toLoading: boolean
  setToLoading: (loading: boolean) => void
  toTokenLock: boolean
  setToTokenLock: (lock: boolean) => void
  totalAmount: string | undefined
  setTotalAmount: (value?: string) => void
  addLiquidityInfo: BinLiquidityInfo | null
  setAddLiquidityInfo: (value: BinLiquidityInfo | null) => void
  zapAddLiquidityInfo: BinLiquidityInfo | null
  setZapAddLiquidityInfo: (value: BinLiquidityInfo | null) => void
  resetAddLiquidity: () => void
  confirmModalOpen: boolean
  setConfirmModalOpen: (value: boolean) => void
  nftOpen: boolean
  setNftOpen: (value: boolean) => void
  relatedPosId: string
  setRelatedPosId: (value: string) => void
  minPriceData: RangePriceType | null
  setMinPriceData: (value: RangePriceType | null) => void
  maxPriceData: RangePriceType | null
  setMaxPriceData: (value: RangePriceType | null) => void
  positionCount: number
  setPositionCount: (value: number) => void
  numBins: number | string
  setNumBins: (value: number | string) => void
  chartRefreshTrigger: number
  setChartRefreshTrigger: () => void
  preCalcError?: 'amountTooSmall'
  setPreCalcError: (type?: 'amountTooSmall') => void
  preCalcParams: any
  setPreCalcParams: (value: any) => void
  binIdRange: {
    minBinId: number
    maxBinId: number
  }
  setBinIdRange: (value: { minBinId: number; maxBinId: number }) => void

  currTabMode: BothAndZapTabAction
  setCurrTabMode: (value: BothAndZapTabAction) => void
}

const store: StateCreator<AddLiquidityState> = (set, get) => ({
  zapAddLiquidityInfo: null,
  setZapAddLiquidityInfo: (value: BinLiquidityInfo | null) => {
    set(() => ({
      zapAddLiquidityInfo: value
    }))
  },
  currTabMode: BothAndZapTabAction.useBoth,
  setCurrTabMode: (value: BothAndZapTabAction) => {
    set(() => ({
      currTabMode: value
    }))
  },
  binIdRange: {
    minBinId: MIN_BIN_ID,
    maxBinId: MAX_BIN_ID
  },
  setBinIdRange: (value: { minBinId: number; maxBinId: number }) => {
    set(() => ({
      binIdRange: value
    }))
  },
  preCalcError: undefined,
  setPreCalcError: (type?: 'amountTooSmall') => {
    set(() => ({
      preCalcError: type
    }))
  },
  fromAmount: '',
  setFromAmount: (value: string) => {
    set(() => ({
      fromAmount: value
    }))
  },
  fromAmountValue: '',
  setFromAmountValue: (value: string) => {
    set(() => ({
      fromAmountValue: value
    }))
  },
  toAmount: '',
  setToAmount: (value: string) => {
    set(() => ({
      toAmount: value
    }))
  },
  toAmountValue: '',
  setToAmountValue: (value: string) => {
    set(() => ({
      toAmountValue: value
    }))
  },
  liquidityAmount: '',
  setLiquidityAmount: (value: string) => {
    set(() => ({
      liquidityAmount: value
    }))
  },
  tokenMaxA: '',
  setTokenMaxA: (value?: string) => {
    set(() => ({
      tokenMaxA: value
    }))
  },
  tokenMaxB: '',
  setTokenMaxB: (value?: string) => {
    set(() => ({
      tokenMaxB: value
    }))
  },
  byAmountIn: true,
  setByAmountIn: (value: boolean) => {
    set(() => ({
      byAmountIn: value
    }))
  },

  isTokenA: true,
  setIsTokenA: (value: boolean) => {
    set(() => ({
      isTokenA: value
    }))
  },
  fromToken: undefined,
  setFromToken: (token?: Token) => {
    set(() => ({
      fromToken: token
    }))
  },
  fromLoading: false,
  setFromLoading: (loading: boolean) => {
    set(() => ({
      fromLoading: loading
    }))
  },
  fromTokenLock: false,
  setFromTokenLock: (lock: boolean) => {
    set(() => ({
      fromTokenLock: lock
    }))
  },
  toToken: undefined,
  setToToken: (token?: Token) => {
    set(() => ({
      toToken: token
    }))
  },
  toLoading: false,
  setToLoading: (loading: boolean) => {
    set(() => ({
      toLoading: loading
    }))
  },
  toTokenLock: false,
  setToTokenLock: (lock: boolean) => {
    set(() => ({
      toTokenLock: lock
    }))
  },
  totalAmount: undefined,
  setTotalAmount: (value?: string) => {
    set(() => ({
      totalAmount: value
    }))
  },
  confirmModalOpen: false,
  setConfirmModalOpen: (value: boolean) => {
    set(() => ({
      confirmModalOpen: value
    }))
  },
  nftOpen: false,
  setNftOpen: (value: boolean) => {
    set(() => ({
      nftOpen: value
    }))
  },
  relatedPosId: '',
  setRelatedPosId: (value: string) => {
    set(() => ({
      relatedPosId: value
    }))
  },
  minPriceData: null,
  setMinPriceData: (value: RangePriceType | null) => {
    set(() => ({
      minPriceData: value
    }))
  },
  maxPriceData: null,
  setMaxPriceData: (value: RangePriceType | null) => {
    set(() => ({
      maxPriceData: value
    }))
  },
  positionCount: 0,
  setPositionCount: (value: number) => {
    set(() => ({
      positionCount: value
    }))
  },
  addLiquidityInfo: null,
  setAddLiquidityInfo: (value: BinLiquidityInfo | null) => {
    set(() => ({
      addLiquidityInfo: value
    }))
  },
  numBins: 0,
  setNumBins: (value: number | string) => {
    set(() => ({
      numBins: value
    }))
  },

  chartRefreshTrigger: 0,
  setChartRefreshTrigger: () => {
    set(() => ({
      chartRefreshTrigger: get().chartRefreshTrigger + 1
    }))
  },
  preCalcParams: null,
  setPreCalcParams: (value: any) => {
    set(state => ({
      preCalcParams: { ...state.preCalcParams, ...value }
    }))
  },
  resetAddLiquidity: () => {
    set(() => ({
      totalAmount: undefined,
      fromTokenLock: false,
      fromToken: undefined,
      toTokenLock: false,
      toToken: undefined,
      fromAmount: '',
      toAmount: '',
      fromAmountValue: '',
      toAmountValue: '',
      liquidityAmount: '',
      byAmountIn: true,
      isTokenA: true,
      relatedPosId: '',
      minPriceData: null,
      maxPriceData: null,
      addLiquidityInfo: null,
      positionCount: 0,
      numBins: 0,
      preCalcError: undefined,
      currTabMode: BothAndZapTabAction.useBoth,
      binIdRange: {
        minBinId: MIN_BIN_ID,
        maxBinId: MAX_BIN_ID
      }
    }))
  }
})

const useAddDlmmLiquidityStore = create(store)
export default useAddDlmmLiquidityStore
