import { DcaConfig, DcaOrderHistoryData, DcaQuoteData } from '@/types/dca'
import { Token } from '@cetus/types'
import { StateCreator, create } from 'zustand'

interface DcaState {
  sellCoin: Token | undefined
  setSellCoin: (value: Token | undefined) => void
  buyCoin: Token | undefined
  setBuyCoin: (value: Token | undefined) => void
  sellAmount: string
  setSellAmount: (value: string) => void
  buyAmount: string
  setBuyAmount: (value: string) => void
  orderNum: string
  setOrderNum: (value: string) => void
  investNum: string
  setInvestNum: (value: string) => void
  currentInvest: string
  setCurrentInvest: (value: string) => void
  currentCoinKey: string
  setCurrentCoinKey: (value: string) => void
  pageLoading: boolean
  setPageLoading: (value: boolean) => void
  dcaConfig: DcaConfig
  setDcaConfig: (value: DcaConfig) => void
  dcaQuote: DcaQuoteData
  setDcaQuote: (value: DcaQuoteData) => void
  orderHistoryObj: DcaOrderHistoryData
  setOrderHistoryObj: (data: DcaOrderHistoryData) => void
  inCoinWhiteList: Token[]
  setInCoinWhiteList: (list: Token[]) => void
  outCoinWhiteList: Token[]
  setOutCoinWhiteList: (list: Token[]) => void
  pageDirect: boolean
  setPageDirect: (pageDirect: boolean) => void
  isDcaRefresh: boolean
  setIsDcaRefresh: (isDcaRefresh: boolean) => void
  dcaMode: string
  setDcaMode: (dcaMode: string) => void
  sellTotalAmount: string
  setSellTotalAmount: (sellTotalAmount: string) => void
  lowerPriceSize: string
  setLowerPriceSize: (lowerPriceSize: string) => void
  upperPriceSize: string
  setUpperPriceSize: (upperPriceSize: string) => void
  whiteTokenList: undefined
  setWhiteTokenList: (whiteTokenList: any) => void
}

const store: StateCreator<DcaState> = (set, get) => ({
  whiteTokenList: undefined,
  setWhiteTokenList: (whiteTokenList: any) => {
    set(() => ({
      whiteTokenList
    }))
  },
  upperPriceSize: '0%',
  setUpperPriceSize: (upperPriceSize: string) => {
    set(() => ({
      upperPriceSize
    }))
  },
  lowerPriceSize: '0%',
  setLowerPriceSize: (lowerPriceSize: string) => {
    set(() => ({
      lowerPriceSize
    }))
  },
  dcaMode: 'total',
  setDcaMode: (dcaMode: string) => {
    set(() => ({
      dcaMode
    }))
  },
  isDcaRefresh: false,
  setIsDcaRefresh: (isDcaRefresh: boolean) => {
    set(() => ({
      isDcaRefresh
    }))
  },
  pageDirect: false,
  setPageDirect: (pageDirect: boolean) => {
    set(() => ({
      pageDirect
    }))
  },
  sellTotalAmount: '',
  setSellTotalAmount: (value: string) => {
    set(() => ({
      sellTotalAmount: value
    }))
  },
  sellAmount: '',
  setSellAmount: (value: string) => {
    set(() => ({
      sellAmount: value
    }))
  },
  buyAmount: '',
  setBuyAmount: (value: string) => {
    set(() => ({
      buyAmount: value
    }))
  },
  sellCoin: undefined,
  setSellCoin: (value: Token | undefined) => {
    set(() => ({
      sellCoin: value
    }))
  },
  buyCoin: undefined,
  setBuyCoin: (value: Token | undefined) => {
    set(() => ({
      buyCoin: value
    }))
  },
  orderNum: '2',
  setOrderNum: (value: string) => {
    set(() => ({
      orderNum: value
    }))
  },
  investNum: '1',
  setInvestNum: (value: string) => {
    set(() => ({
      investNum: value
    }))
  },
  currentCoinKey: 'sellCoin',
  setCurrentCoinKey: (value: string) => {
    set(() => ({
      currentCoinKey: value
    }))
  },
  currentInvest: 'Hour',
  setCurrentInvest: (value: string) => {
    set(() => ({
      currentInvest: value
    }))
  },
  pageLoading: true,
  setPageLoading: (value: boolean) => {
    set(() => ({
      pageLoading: value
    }))
  },
  dcaConfig: {},
  setDcaConfig: (value: DcaConfig) => {
    set(() => ({
      dcaConfig: value
    }))
  },
  dcaQuote: {},
  setDcaQuote: (value: DcaQuoteData) => {
    set(() => ({
      dcaQuote: value
    }))
  },
  orderHistoryObj: {},
  setOrderHistoryObj: (data: DcaOrderHistoryData) => {
    set(() => ({
      orderHistoryObj: { ...get().orderHistoryObj, ...data }
    }))
  },
  inCoinWhiteList: [],
  setInCoinWhiteList: (list: Token[]) => {
    set(() => ({
      inCoinWhiteList: list
    }))
  },
  outCoinWhiteList: [],
  setOutCoinWhiteList: (list: Token[]) => {
    set(() => ({
      outCoinWhiteList: list
    }))
  }
})

const useDcaStore = create(store)
export default useDcaStore
