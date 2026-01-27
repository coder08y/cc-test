import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { StateCreator, create } from 'zustand'

interface PositionCompoundState {
  showConfirmPriceDiffInfo: Record<string, boolean>
  setShowConfirmPriceDiffInfo: (isFrom: 'move' | 'merge' | 'compound', value: boolean) => void
  routePriceImpacts: {
    move: Record<number, number>
    merge: Record<number, number>
    compound: Record<number, number>
  }
  setRoutePriceImpact: (index: number, impact: number, isFrom: 'move' | 'merge' | 'compound', isReset?: boolean) => void

  rewardAndFeeList: any
  setRewardAndFeeList: (value: any) => void
  clmmFeeList: any
  setClmmFeeList: (value: any) => void
  clmmRewardList: any
  setClmmRewardList: (value: any) => void

  mergeToToken: Token
  setMergeToToken: (value: Token) => void

  mergeableRewards: any
  setMergeableRewards: (value: any) => void
  notMergeableRewards: any
  setNotMergeableRewards: (value: any) => void
  compoundableRewards: any
  setCompoundableRewards: (value: any) => void
  notCompoundableRewards: any
  setNotCompoundableRewards: (value: any) => void
  resetCompoundData: () => void

  compoundValue: string
  setCompoundValue: (value: string) => void

  isOpenCompoundModal: boolean
  setIsOpenCompoundModal: (value: boolean) => void
}

const store: StateCreator<PositionCompoundState> = (set, get) => ({
  isOpenCompoundModal: false,
  setIsOpenCompoundModal: (value: boolean) => {
    set(() => ({
      isOpenCompoundModal: value
    }))
  },
  mergeToToken: envConfigs.cetus_coin,
  setMergeToToken: (value: Token) => {
    set(() => ({
      mergeToToken: value
    }))
  },
  compoundValue: '',
  setCompoundValue: (value: any) => {
    set(() => ({
      compoundValue: value
    }))
  },
  clmmRewardList: [],
  setClmmRewardList: (value: any) => {
    set(() => ({
      clmmRewardList: value
    }))
  },
  clmmFeeList: [],
  setClmmFeeList: (value: any) => {
    set(() => ({
      clmmFeeList: value
    }))
  },
  rewardAndFeeList: [],
  setRewardAndFeeList: (value: any) => {
    set(() => ({
      rewardAndFeeList: value
    }))
  },
  notCompoundableRewards: [],
  setNotCompoundableRewards: (value: any) => {
    set(() => ({
      notCompoundableRewards: value
    }))
  },
  compoundableRewards: [],
  setCompoundableRewards: (value: any) => {
    set(() => ({
      compoundableRewards: value
    }))
  },
  notMergeableRewards: [],
  setNotMergeableRewards: (value: any) => {
    set(() => ({
      notMergeableRewards: value
    }))
  },
  mergeableRewards: [],
  setMergeableRewards: (value: any) => {
    set(() => ({
      mergeableRewards: value
    }))
  },
  showConfirmPriceDiffInfo: {
    move: false,
    merge: false,
    compound: false
  },
  setShowConfirmPriceDiffInfo: (isFrom: 'move' | 'merge' | 'compound', value: boolean) => {
    set(state => ({
      showConfirmPriceDiffInfo: {
        ...state.showConfirmPriceDiffInfo,
        [isFrom]: value
      }
    }))
  },
  routePriceImpacts: {
    move: {},
    merge: {},
    compound: {}
  },
  setRoutePriceImpact: (index: number, impact: number, isFrom: 'move' | 'merge' | 'compound', isReset?: boolean) => {
    set(state => {
      if (isReset) {
        return {
          routePriceImpacts: {
            move: {},
            merge: {},
            compound: {}
          },
          showConfirmPriceDiffInfo: {
            move: false,
            merge: false,
            compound: false
          }
        }
      }
      const nextImpacts: any = {
        ...state.routePriceImpacts,
        [isFrom]: {
          ...state.routePriceImpacts[isFrom],
          [index]: impact
        }
      }

      const hasBadImpact = Object.values(nextImpacts[isFrom]).some(v => v <= -5)

      console.log(impact, isFrom, nextImpacts, 'showConfirmPriceDiffInfo')

      return {
        routePriceImpacts: nextImpacts,
        showConfirmPriceDiffInfo: {
          ...state.showConfirmPriceDiffInfo,
          [isFrom]: hasBadImpact
        }
      }
    })
  },

  resetCompoundData: () => {
    set(() => ({
      rewardAndFeeList: [],
      clmmFeeList: [],
      clmmRewardList: [],
      mergeableRewards: [],
      notMergeableRewards: [],
      compoundableRewards: [],
      notCompoundableRewards: []
    }))
  }
})

const usePositionCompoundStore = create(store)
export default usePositionCompoundStore
