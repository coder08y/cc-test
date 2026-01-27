import { BinStepType } from '@cetus/design/src/components/common/feeSelect/type'
import { BinLiquidityInfo, StrategyType } from '@cetusprotocol/dlmm-sdk'
import { StateCreator, create } from 'zustand'
import { RangePriceType } from '../dlmm/addDlmmLiquidity'

type RangePriceDataType = Omit<RangePriceType, 'tokenA' | 'tokenB'>

interface CreateDlmmPoolState {
  initPrice: string
  setInitPrice: (value: string) => void
  baseFee: Pick<BinStepType, 'fee' | 'feeDisplay'> | undefined
  setBaseFee: (fee: Pick<BinStepType, 'fee' | 'feeDisplay'> | undefined) => void
  binStep: BinStepType | undefined
  setBinStep: (value: BinStepType | undefined) => void
  getBinStepListLoading: boolean
  setGetBinStepListLoading: (value: boolean) => void
  binStepList: BinStepType[]
  setBinStepList: (value: BinStepType[]) => void
  baseAmount: string
  setBaseAmount: (value: string) => void
  quoteAmount: string
  setQuoteAmount: (value: string) => void
  baseTokenLock: boolean
  setBaseTokenLock: (value: boolean) => void
  quoteTokenLock: boolean
  setQuoteTokenLock: (value: boolean) => void
  isAutoFill: boolean
  setIsAutoFill: (value: boolean) => void
  strategy: StrategyType
  setStrategy: (value: StrategyType) => void
  fixAmountA: boolean
  setFixAmountA: (value: boolean) => void
  activeId: number | undefined
  setActiveId: (value: number | undefined) => void
  minPriceData: RangePriceDataType | undefined
  setMinPriceData: (value: RangePriceDataType | undefined) => void
  maxPriceData: RangePriceDataType | undefined
  setMaxPriceData: (value: RangePriceDataType | undefined) => void
  createBinInfos: BinLiquidityInfo | undefined
  setCreateBinInfos: (value: BinLiquidityInfo | undefined) => void
  positionCount: number
  setPositionCount: (value: number) => void
  numBins: number | string
  setNumBins: (value: number | string) => void
  resetCreateDlmmPoolState: () => void
}

const store: StateCreator<CreateDlmmPoolState> = (set, get) => ({
  initPrice: '',
  setInitPrice: (value: string) => {
    set(() => ({
      initPrice: value
    }))
  },
  baseFee: undefined,
  setBaseFee: (value: Pick<BinStepType, 'fee' | 'feeDisplay'> | undefined) => {
    set(() => ({
      baseFee: value
    }))
  },
  binStep: undefined,
  setBinStep: (value: BinStepType | undefined) => {
    set(() => ({
      binStep: value
    }))
  },
  getBinStepListLoading: false,
  setGetBinStepListLoading: (value: boolean) => {
    set(() => ({
      getBinStepListLoading: value
    }))
  },
  binStepList: [],
  setBinStepList: (value: BinStepType[]) => {
    set(() => ({
      binStepList: value
    }))
  },
  baseAmount: '',
  setBaseAmount: (value: string) => {
    set(() => ({
      baseAmount: value
    }))
  },
  quoteAmount: '',
  setQuoteAmount: (value: string) => {
    set(() => ({
      quoteAmount: value
    }))
  },
  baseTokenLock: false,
  setBaseTokenLock: (value: boolean) => {
    set(() => ({
      baseTokenLock: value
    }))
  },
  quoteTokenLock: false,
  setQuoteTokenLock: (value: boolean) => {
    set(() => ({
      quoteTokenLock: value
    }))
  },
  isAutoFill: true,
  setIsAutoFill: (value: boolean) => {
    set(() => ({
      isAutoFill: value
    }))
  },
  strategy: StrategyType.Spot,
  setStrategy: (value: StrategyType) => {
    set(() => ({
      strategy: value
    }))
  },
  fixAmountA: true,
  setFixAmountA: (value: boolean) => {
    set(() => ({
      fixAmountA: value
    }))
  },
  activeId: undefined,
  setActiveId: (value: number | undefined) => {
    set(() => ({
      activeId: value
    }))
  },
  minPriceData: undefined,
  setMinPriceData: (value: RangePriceDataType | undefined) => {
    set(() => ({
      minPriceData: value
    }))
  },
  maxPriceData: undefined,
  setMaxPriceData: (value: RangePriceDataType | undefined) => {
    set(() => ({
      maxPriceData: value
    }))
  },
  createBinInfos: undefined,
  setCreateBinInfos: (value: BinLiquidityInfo | undefined) => {
    set(() => ({
      createBinInfos: value
    }))
  },
  positionCount: 0,
  setPositionCount: (value: number) => {
    set(() => ({
      positionCount: value
    }))
  },
  numBins: 0,
  setNumBins: (value: number | string) => {
    set(() => ({
      numBins: value
    }))
  },
  resetCreateDlmmPoolState: () => {
    set(() => ({
      initPrice: '',
      positionCount: 0,
      numBins: 0,
      baseFee: undefined,
      binStep: undefined,
      binStepList: [],
      baseAmount: '',
      quoteAmount: '',
      baseTokenLock: false,
      quoteTokenLock: false,
      isAutoFill: true,
      strategy: StrategyType.Spot,
      fixAmountA: true,
      minPriceData: undefined,
      maxPriceData: undefined,
      createBinInfos: undefined,
      getBinStepListLoading: false
    }))
  }
})

const useCreateDlmmPoolStore = create(store)
export default useCreateDlmmPoolStore
