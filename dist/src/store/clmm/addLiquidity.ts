import { TokensMap } from '@/types'
import { Token } from '@cetus/types'
import { StateCreator, create } from 'zustand'

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
  percentMap: TokensMap
  setPercentMap: (value: TokensMap) => void
  isFullRange: boolean
  setIsFullRange: (value: boolean) => void
  fromToken: Token | undefined
  setFromToken: (token?: Token) => void
  fromTokenLock: boolean
  setFromTokenLock: (lock: boolean) => void
  toToken: Token | undefined
  setToToken: (token?: Token) => void
  toTokenLock: boolean
  setToTokenLock: (lock: boolean) => void
  totalAmount: string | undefined
  setTotalAmount: (value?: string) => void
  autoStakePosition: boolean
  setAutoStakePosition: (autoStake: boolean) => void
  isFarmRewardsRange: boolean
  setIsFarmRewardsRange: (isRange: boolean) => void
  resetAddLiquidity: () => void
  useZapIn: boolean
  setUseZapIn: (value: boolean) => void
  confirmModalOpen: boolean
  setConfirmModalOpen: (value: boolean) => void
  nftOpen: boolean
  setNftOpen: (value: boolean) => void
  relatedPosId: string
  setRelatedPosId: (value: string) => void
}

const store: StateCreator<AddLiquidityState> = (set, get) => ({
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
  percentMap: { percentA: '0', percentB: '0' },
  setPercentMap: (value: TokensMap) => {
    set(() => ({
      percentMap: value
    }))
  },
  isFullRange: false,
  setIsFullRange: (value: boolean) => {
    set(() => ({
      isFullRange: value
    }))
  },
  fromToken: undefined,
  setFromToken: (token?: Token) => {
    set(() => ({
      fromToken: token
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
  autoStakePosition: false,
  setAutoStakePosition: (autoStake: boolean) => {
    set(() => ({
      autoStakePosition: autoStake
    }))
  },
  isFarmRewardsRange: false,
  setIsFarmRewardsRange: (isRange: boolean) => {
    set(() => ({
      isFarmRewardsRange: isRange
    }))
  },
  useZapIn: false,
  setUseZapIn: (value: boolean) => {
    set(() => ({
      useZapIn: value
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
  resetAddLiquidity: () => {
    set(() => ({
      isFarmRewardsRange: false,
      autoStakePosition: false,
      totalAmount: undefined,
      fromTokenLock: false,
      fromToken: undefined,
      toTokenLock: false,
      toToken: undefined,
      isFullRange: false,
      percentMap: { percentA: '0', percentB: '0' },
      fromAmount: '',
      toAmount: '',
      fromAmountValue: '',
      toAmountValue: '',
      liquidityAmount: '',
      byAmountIn: true,
      isTokenA: true,
      useZapIn: false,
      nftOpen: false,
      relatedPosId: ''
    }))
  }
})

const useAddLiquidityStore = create(store)
export default useAddLiquidityStore
