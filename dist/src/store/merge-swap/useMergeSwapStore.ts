import { MergeSwapQuote } from '@/types/merge_swap'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { StateCreator, create } from 'zustand'

interface MergeSwapState {
  fromTokenList: Token[]
  setFromTokenList: (fromTokenList: Token[]) => void
  switchFromToken: (token: Token, index: number) => void
  removeFromToken: (token: Token) => void
  fromAmountObj: Record<string, string>
  setFromAmountObj: (coinType: string, fromAmount: string) => void
  clearFromAmountObj: () => void

  toToken: Token | undefined
  setToToken: (toToken: Token | undefined) => void
  toAmount: string
  setToAmount: (toAmount: string) => void

  findRouterLoading: boolean
  setFindRouterLoading: (loading: boolean) => void

  mergeSwapQuote?: MergeSwapQuote
  setMergeSwapQuote: (mergeSwapQuote?: MergeSwapQuote) => void

  isShowSelectRouter: boolean
  setIsShowSelectRouter: (isShowSelectRouter: boolean) => void

  isOpenRoutePathModal: boolean
  setIsOpenRoutePathModal: (isOpenRoutePathModal: boolean) => void
  selectedRoutePathIndex: number
  setSelectedRoutePathIndex: (selectedRoutePathIndex: number) => void

  clearData: () => void
}

const store: StateCreator<MergeSwapState> = (set, get) => ({
  isOpenRoutePathModal: false,
  setIsOpenRoutePathModal: (isOpenRoutePathModal: boolean) => {
    set({ isOpenRoutePathModal })
  },
  selectedRoutePathIndex: 0,
  setSelectedRoutePathIndex: (selectedRoutePathIndex: number) => {
    set({ selectedRoutePathIndex })
  },

  isShowSelectRouter: false,
  setIsShowSelectRouter: (isShowSelectRouter: boolean) => {
    set({ isShowSelectRouter })
  },
  mergeSwapQuote: undefined,
  setMergeSwapQuote: (mergeSwapQuote?: MergeSwapQuote) => {
    set({ mergeSwapQuote })
  },
  findRouterLoading: false,
  setFindRouterLoading: (loading: boolean) => {
    set({ findRouterLoading: loading })
  },
  fromAmountObj: {},
  setFromAmountObj: (coinType: string, fromAmount: string) => {
    set({ fromAmountObj: { ...get().fromAmountObj, [coinType]: fromAmount } })
  },
  clearFromAmountObj: () => {
    set({ fromAmountObj: {} })
  },
  toAmount: '',
  setToAmount: (toAmount: string) => {
    set({ toAmount })
  },
  toToken: { ...envConfigs.sui_coin },
  setToToken: (toToken: Token | undefined) => {
    set({ toToken })
  },
  fromTokenList: [],
  setFromTokenList: (fromTokenList: Token[]) => {
    const currentAmountObj = get().fromAmountObj
    const newAmountObj = { ...currentAmountObj }

    const newCoinTypes = new Set(fromTokenList.map(token => token.coin_type))

    Object.keys(newAmountObj).forEach(coinType => {
      if (!newCoinTypes.has(coinType)) {
        newAmountObj[coinType] = ''
      }
    })

    set({ fromTokenList, fromAmountObj: newAmountObj })
  },
  switchFromToken: (token: Token, fromIndex: number) => {
    const currentList = get().fromTokenList
    const currentAmountObj = get().fromAmountObj
    const dupeIndex = currentList.findIndex(item => fixCoinType(item.coin_type) === fixCoinType(token.coin_type))

    currentAmountObj[currentList[fromIndex].coin_type] = ''
    currentAmountObj[token.coin_type] = ''
    currentList[fromIndex] = token

    let newList = currentList.filter((_, index) => index !== dupeIndex)

    set({ fromTokenList: [...newList], fromAmountObj: { ...currentAmountObj } })
  },
  removeFromToken: (token: Token) => {
    const currentList = get().fromTokenList
    set({ fromTokenList: currentList.filter(existingToken => existingToken.coin_type !== token.coin_type) })
  },
  clearData: () => {
    set({
      fromTokenList: [],
      toToken: { ...envConfigs.sui_coin },
      toAmount: '',
      findRouterLoading: false,
      mergeSwapQuote: undefined,
      isShowSelectRouter: false,
      fromAmountObj: {},
      isOpenRoutePathModal: false,
      selectedRoutePathIndex: 0
    })
  }
})

const useMergeSwapStore = create(store)

export default useMergeSwapStore
