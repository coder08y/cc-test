import { PriceDataType } from '@/hooks/create-pool/useCreateDLMMPool'
import { BothAndZapTabAction } from '@/types/dlmm'
import { d } from '@cetus/utils'
import { BinLiquidityInfo } from '@cetusprotocol/dlmm-sdk'
import { StateCreator, create } from 'zustand'

interface DlmmPositionDetailState {
  binInfos: BinLiquidityInfo
  setBinInfos: (data: BinLiquidityInfo) => void

  currentPosDetailTab: string
  setCurrentPosDetailTab: (value: string) => void

  tokenAmountAfterA: string
  setTokenAmountAfterA: (value: string) => void

  tokenAmountAfterB: string
  setTokenAmountAfterB: (value: string) => void

  minPriceData: PriceDataType
  maxPriceData: PriceDataType
  setMinPriceData: (data: PriceDataType) => void
  setMaxPriceData: (data: PriceDataType) => void

  dlmmPosDetailDirect: boolean
  setDlmmPosDetailDirect: (status: boolean) => void
  showPositionSelectRange: boolean
  setShowPositionSelectRange: (status: boolean) => void
  resetDlmmPosDetail: () => void

  isAutoClaim: boolean
  setIsAutoClaim: (status: boolean) => void

  preCalcError: 'amountTooSmall' | undefined
  setPreCalcError: (type?: 'amountTooSmall') => void

  currAddTabMode: BothAndZapTabAction
  setCurrAddTabMode: (value: BothAndZapTabAction) => void

  useZapOut: boolean
  setUseZapOut: (useZapOut: boolean) => void
  zapLiquidityInfo: BinLiquidityInfo | undefined
  setZapLiquidityInfo: (data: BinLiquidityInfo | undefined) => void
}
const store: StateCreator<DlmmPositionDetailState> = (set, get) => ({
  useZapOut: false,
  setUseZapOut: (useZapOut: boolean) => {
    set(() => ({
      useZapOut
    }))
  },
  currAddTabMode: BothAndZapTabAction.useBoth,
  setCurrAddTabMode: (value: BothAndZapTabAction) => {
    set(() => ({
      currAddTabMode: value
    }))
  },
  preCalcError: undefined,
  setPreCalcError: (type?: 'amountTooSmall') => {
    set(() => ({
      preCalcError: type
    }))
  },
  binInfos: {} as BinLiquidityInfo,
  setBinInfos: (data: BinLiquidityInfo) => {
    set(() => ({
      binInfos: data
    }))
  },

  currentPosDetailTab: 'increase',
  setCurrentPosDetailTab: (value: string) => {
    set(() => ({
      currentPosDetailTab: value
    }))
  },

  tokenAmountAfterA: '',
  tokenAmountAfterB: '',
  setTokenAmountAfterA: (value: string) => {
    set(() => ({
      tokenAmountAfterA: d(value).lte(0) && value !== '' ? '0' : value
    }))
  },
  setTokenAmountAfterB: (value: string) => {
    set(() => ({
      tokenAmountAfterB: d(value).lte(0) && value !== '' ? '0' : value
    }))
  },
  minPriceData: {} as PriceDataType,
  maxPriceData: {} as PriceDataType,
  setMinPriceData: (data: PriceDataType) => {
    set(() => ({
      minPriceData: data
    }))
  },
  setMaxPriceData: (data: PriceDataType) => {
    set(() => ({
      maxPriceData: data
    }))
  },
  dlmmPosDetailDirect: true,
  setDlmmPosDetailDirect: (status: boolean) => {
    set(() => ({
      dlmmPosDetailDirect: status
    }))
  },
  showPositionSelectRange: true,
  setShowPositionSelectRange: (status: boolean) => {
    set(() => ({
      showPositionSelectRange: status
    }))
  },
  isAutoClaim: true,
  setIsAutoClaim: (status: boolean) => {
    set(() => ({
      isAutoClaim: status
    }))
  },
  resetDlmmPosDetail: () => {
    set(() => ({
      binInfos: {} as BinLiquidityInfo,
      currentPosDetailTab: 'increase',
      tokenAmountAfterA: '',
      tokenAmountAfterB: '',
      minPriceData: {} as PriceDataType,
      maxPriceData: {} as PriceDataType,
      dlmmPosDetailDirect: true,
      showPositionSelectRange: true,
      isAutoClaim: true,
      preCalcError: undefined,
      useZapOut: false,
      activeBin: undefined,
      currAddTabMode: BothAndZapTabAction.useBoth
    }))
  }
})

const useDlmmPosDetailStore = create(store)
export default useDlmmPosDetailStore
