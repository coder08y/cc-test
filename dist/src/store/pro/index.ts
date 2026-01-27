import {
  CoinAuditCheckData,
  CoinBvPrice,
  CoinDetail,
  CoinDexPoolItem,
  CoinHolderItem,
  CoinMarketData,
  CoinTradeItem,
  CoinTransactionBlockItem,
  ProTokenListItem
} from '@/types/pro'
import { Token } from '@cetus/types'
import { CommonContentTable, PROCEED_TOKEN_DISCLAIMER_OBJ_KEY, getPriceUnit, toLongCoinType } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface proState {
  // 跳转token外部网站警示弹框
  proceedTokenDisclaimerObj: Record<string, boolean> | undefined
  setProceedTokenDisclaimerObj: (data: Record<string, boolean> | undefined) => void
  // 当前展示token
  showTokenInfo: Token | undefined
  setShowTokenInfo: (token: Token | undefined) => void
  notChangeToken: boolean
  setNotChangeToken: (value: boolean) => void
  // 交易对的另一个token
  anotherTokenInfo: Token | undefined
  setAnotherTokenInfo: (token: Token | undefined) => void

  // detail相关
  coinDetail: CoinDetail | undefined
  setCoinDetail: (data: CoinDetail | undefined) => void
  coinDetailLoading: boolean
  setCoinDetailLoading: (value: boolean) => void
  // dex pools 相关
  coinDexPools: CoinDexPoolItem[]
  setCoinDexPools: (data: CoinDexPoolItem[]) => void
  coinDexPoolsLoading: boolean
  setCoinDexPoolsLoading: (value: boolean) => void

  // coin transaction blocks 相关
  coinTransactionBlocks: { list: CoinTransactionBlockItem[]; nextPageCursor: string; isFirstPage?: boolean } | undefined
  setCoinTransactionBlocks: (data: { list: CoinTransactionBlockItem[]; nextPageCursor: string; isFirstPage?: boolean } | undefined) => void
  coinTransactionLoading: boolean
  setCoinTrasactionLoading: (value: boolean) => void
  // coin market data 相关
  coinMarketData: CoinMarketData | undefined
  setCoinMarketData: (value: CoinMarketData | undefined) => void
  coinMarketDataLoading: boolean
  setCoinMarketDataLoading: (value: boolean) => void
  // coin holders相关
  topHolders: CoinHolderItem[]
  topHoldersTotal: number
  setTopHolders: (data: CoinHolderItem[], total?: number, top10HoldersBalance?: string) => void
  topHoldersLoading: boolean
  setTopHoldersLoading: (value: boolean) => void
  // coin trade相关
  coinTrades: { list: CoinTradeItem[]; nextPageCursor: string; isFirstPage?: boolean } | undefined
  setCoinTrades: (data: { list: CoinTradeItem[]; nextPageCursor: string; isFirstPage?: boolean } | undefined) => void
  coinTradesLoading: boolean
  setCoinTradesLoading: (value: boolean) => void

  // coin bv当前价格相关
  coinBvPriceUnit: string
  coinBvPrice: CoinBvPrice | undefined
  setCoinBvPrice: (value: CoinBvPrice) => void
  coinBvPriceLoading: boolean
  setCoinBvPriceLoading: (value: boolean) => void

  // 存一些相关token信息, 以便前端渲染
  proTokenMap: Map<`0x${string}`, Token>
  setProTokenMap: (data: Map<`0x${string}`, Token>) => void

  // coin是否存在风险相关
  coinAuditCheckData: CoinAuditCheckData | undefined
  setCoinAuditCheckData: (data: CoinAuditCheckData | undefined) => void
  coinAuditCheckLoading: boolean
  setCoinAuditCheckLoading: (value: boolean) => void

  // pro token列表相关
  proTokenList: ProTokenListItem[]
  setProTokenList: (data: ProTokenListItem[]) => void
  proCoinListcontroller: any
  setProCoinListcontroller: (value: any) => void
  proSearchListcontroller: any
  setProSearchListcontroller: (value: any) => void
  proTokenListLoading: boolean
  setProTokenListLoading: (value: boolean) => void
  proTokenStatsMap: Map<`0x${string}`, ProTokenListItem>
  getProTokenFromStats: (value: string) => ProTokenListItem[]

  // recentSearchTokens
  recentSearchTokens: Token[] | undefined
  setClearRecentSearchTokens: () => void
  setRecentSearchTokens: (data: Token | undefined, isDelete?: boolean) => void

  // 记录选择的token是否是当前交易对中的一个
  // isSelectCurrent: boolean
  // setIsSelectCurrent: (data: boolean) => void

  // 交易相关tab切换
  currTradeTab: string
  setCurrTradeTab: (value: string) => void
  // 记录是否是coin下拉框里选择token
  isCoinSelect: boolean
  setIsCoinSelect: (data: boolean) => void

  //记录当前模式 lite/pro
  isProMode: boolean
  setIsProMode: (value: boolean) => void

  // 记录当前tab
  currentProTab: string | undefined
  currentProTabUpdateWith: string
  setCurrentProTab: (data: string | undefined, isUpdateWithBtn?: string) => void

  // 重置pro数据
  resetProData: () => void
  // toDo: 暂时为了dashboad跳pro时候清空所有数据，后面swap/dca/limit拆分后，两个reset只留一个即可
  resetProAllData: () => void

  // trades 实时数据设置开发
  isRealTime: boolean
  setIsRealTime: (value: boolean) => void

  proTransactionList: any[] // 用于在pro kline处对买卖单做标记，不需要本地缓存
  setProTransactionList: (data: any) => void
}

const store: StateCreator<proState> = (set, get) => ({
  currentProTab: '',
  currentProTabUpdateWith: '',
  setCurrentProTab: (data: string | undefined, isUpdateWithBtn?: string) => {
    set(() => ({
      currentProTab: data,
      currentProTabUpdateWith: isUpdateWithBtn
    }))
  },
  isProMode: false,
  setIsProMode: (value: boolean) => {
    if (!value) {
      set(() => ({
        isProMode: false,
        showTokenInfo: undefined
      }))
    } else {
      set(() => ({
        isProMode: value
      }))
    }
  },
  isCoinSelect: false,
  setIsCoinSelect: (data: boolean) => {
    set(() => ({
      isCoinSelect: data
    }))
  },
  proceedTokenDisclaimerObj: {},
  setProceedTokenDisclaimerObj: (data: Record<string, boolean> | undefined) => {
    const originData = get().proceedTokenDisclaimerObj
    set(() => ({
      proceedTokenDisclaimerObj: { ...originData, ...data }
    }))
  },
  showTokenInfo: undefined,
  setShowTokenInfo: (token: Token | undefined) => {
    set(() => ({
      showTokenInfo: token
        ? {
            ...token,
            coin_type: toLongCoinType(token.coin_type)
          }
        : token
    }))
  },
  notChangeToken: true,
  setNotChangeToken: (value: boolean) => {
    set(() => ({
      notChangeToken: value
    }))
  },
  anotherTokenInfo: undefined,
  setAnotherTokenInfo: (token: Token | undefined) => {
    set(() => ({
      anotherTokenInfo: token
    }))
  },
  // detail相关
  coinDetail: undefined,
  setCoinDetail: (data: CoinDetail | undefined) => {
    console.log('🚀 ~ pro index setCoinDetail data:', data)
    set(() => ({
      coinDetail: data,
      coinDetailLoading: false,
      topHoldersTotal: data?.holders
    }))
  },
  coinDetailLoading: true,
  setCoinDetailLoading: (value: boolean) => {
    set(() => ({
      coinDetailLoading: value
    }))
  },
  // dex pools 相关
  coinDexPools: [],
  setCoinDexPools: (data: CoinDexPoolItem[]) => {
    set(() => ({
      coinDexPools: data,
      coinDexPoolsLoading: false
    }))
  },
  coinDexPoolsLoading: true,
  setCoinDexPoolsLoading: (value: boolean) => {
    set(() => ({
      coinDexPoolsLoading: value
    }))
  },
  // coin transaction blocks 相关
  coinTransactionBlocks: undefined,
  setCoinTransactionBlocks: (data: { list: CoinTransactionBlockItem[]; nextPageCursor: string; isFirstPage?: boolean } | undefined) => {
    set(() => ({
      coinTransactionBlocks: data,
      coinTransactionLoading: false
    }))
  },
  coinTransactionLoading: true,
  setCoinTrasactionLoading: (value: boolean) => {
    set(() => ({
      coinTransactionLoading: value
    }))
  },
  // coin Market 相关
  coinMarketData: undefined,
  setCoinMarketData: (value: CoinMarketData | undefined) => {
    set(() => ({
      coinMarketData: value,
      coinMarketDataLoading: false
    }))
  },
  coinMarketDataLoading: true,
  setCoinMarketDataLoading: (value: boolean) => {
    set(() => ({
      coinMarketDataLoading: value
    }))
  },
  // coin holders相关
  topHolders: [],
  topHoldersTotal: 0,
  setTopHolders: (data: CoinHolderItem[], total?: number, top10HoldersBalance?: string) => {
    if (top10HoldersBalance) {
      set(() => ({
        topHolders: data || [],
        topHoldersLoading: false,
        // topHoldersTotal: total || 0,
        top10HoldersBalance
      }))
    } else {
      set(() => ({
        topHolders: data || [],
        topHoldersLoading: false
        // topHoldersTotal: total || 0
      }))
    }
  },
  topHoldersLoading: true,
  setTopHoldersLoading: (value: boolean) => {
    set(() => ({
      topHoldersLoading: value
    }))
  },
  // coin trade相关
  coinTrades: undefined,
  setCoinTrades: (data: { list: CoinTradeItem[]; nextPageCursor: string; isFirstPage?: boolean } | undefined) => {
    set(() => ({
      coinTrades: data,
      coinTradesLoading: false
    }))
  },
  coinTradesLoading: true,
  setCoinTradesLoading: (value: boolean) => {
    set(() => ({
      coinTradesLoading: value
    }))
  },
  // coin bv当前价格相关
  coinBvPriceUnit: '',
  coinBvPrice: undefined,
  setCoinBvPrice: (value: CoinBvPrice) => {
    const currentCoinType = get().showTokenInfo?.coin_type || ''
    if (currentCoinType && fixCoinType(currentCoinType) !== fixCoinType(value?.coinType)) return
    set(() => ({
      coinBvPrice: value,
      coinBvPriceLoading: false,
      coinBvPriceUnit: String(getPriceUnit(value?.price))
    }))
  },
  coinBvPriceLoading: true,
  setCoinBvPriceLoading: (value: boolean) => {
    set(() => ({
      coinBvPriceLoading: value
    }))
  },
  proTokenMap: new Map<`0x${string}`, Token>(),
  setProTokenMap: (data: Map<`0x${string}`, Token>) => {
    set(() => ({
      proTokenMap: data
    }))
  },
  coinAuditCheckData: undefined,
  coinAuditCheckLoading: true,
  setCoinAuditCheckData: (data: CoinAuditCheckData | undefined) => {
    set(() => ({
      coinAuditCheckData: data,
      coinAuditCheckLoading: false
    }))
  },
  setCoinAuditCheckLoading: (value: boolean) => {
    set(() => ({
      coinAuditCheckLoading: value
    }))
  },
  // pro token列表相关
  proTokenStatsMap: new Map<`0x${string}`, ProTokenListItem>(),
  proTokenList: [],
  setProTokenList: (data: ProTokenListItem[]) => {
    const newMap = data.reduce((map, item) => map.set(item.coinType as `0x${string}`, item), new Map<`0x${string}`, ProTokenListItem>())
    set(() => ({
      proTokenList: data,
      proTokenListLoading: false,
      proTokenStatsMap: newMap,
      proCoinListcontroller: undefined
    }))
  },
  proCoinListcontroller: undefined,
  setProCoinListcontroller: (value: any) => {
    set(() => ({
      proCoinListcontroller: value
    }))
  },
  proSearchListcontroller: undefined,
  setProSearchListcontroller: (value: any) => {
    set(() => ({
      proSearchListcontroller: value
    }))
  },
  getProTokenFromStats: (value: string) => {
    try {
      const list = get().proTokenList
      console.log('getProTokenFromStats 🚀 ~ list:', list)
      if (value?.trim()?.includes('0x')) {
        return list?.filter((item: ProTokenListItem) =>
          fixCoinType(item?.coinType)?.toLocaleLowerCase()?.includes(fixCoinType(value?.trim())?.toLocaleLowerCase())
        )
      } else {
        return list?.filter((item: ProTokenListItem) => item?.coinType?.toLocaleLowerCase()?.includes(value?.toLocaleLowerCase()))
      }
    } catch (error) {
      console.log('🚀 getProTokenFromStats ~ error:', error)
      return []
    }
  },
  proTokenListLoading: true,
  setProTokenListLoading: (value: boolean) => {
    set(() => ({
      proTokenListLoading: value
    }))
  },

  recentSearchTokens: undefined,
  // 清空最近搜索记录
  setClearRecentSearchTokens: () => {
    set(() => ({
      recentSearchTokens: undefined
    }))
  },
  setRecentSearchTokens: (value: Token | undefined, isDelete?: boolean) => {
    if (!value) return
    let result
    const originData = get().recentSearchTokens ?? []
    // 如果已存在该 Token 或者是删除token
    const filteredData = originData.filter(token => token.coin_type !== value?.coin_type)

    if (isDelete) {
      result = filteredData
    } else {
      // 如果长度已满 0，则移除最早的一个
      if (filteredData.length >= 20) {
        filteredData.shift()
      }
      result = [...filteredData, value]
    }
    set(() => ({
      recentSearchTokens: result
    }))
  },
  // 交易相关tab切换
  currTradeTab: 'Trades',
  setCurrTradeTab: (value: string) => {
    set(() => ({
      currTradeTab: value
    }))
  },
  isRealTime: true,
  setIsRealTime: (value: boolean) => {
    set(() => ({
      isRealTime: value
    }))
  },
  proTransactionList: [], // 用于在pro kline处对买卖单做标记，不需要本地缓存
  setProTransactionList: (data: any) => {
    set(() => ({
      proTransactionList: [...get().proTransactionList, data]
    }))
  },
  resetProData: () => {
    set(() => ({
      currentProTab: 'Buy',
      currentProTabUpdateWith: '',
      isCoinSelect: false,
      coinBvPrice: undefined,
      coinBvPriceLoading: true
      // proceedTokenDisclaimerObj: {},
      // showTokenInfo: undefined
      // notChangeToken: true,
      // anotherTokenInfo: undefined,
      // coinDetail: undefined,
      // coinDetailLoading: true,
      // coinDexPools: [],
      // coinDexPoolsLoading: true,
      // coinTransactionBlocks: undefined,
      // coinTransactionLoading: true,
      // coinMarketData: undefined,
      // coinMarketDataLoading: true,
      // topHolders: [],
      // topHoldersTotal: 0,
      // topHoldersLoading: true,
      // coinTrades: undefined,
      // coinTradesLoading: true,
      // coinBvPriceUnit: '',
      // coinBvPrice: undefined,
      // coinBvPriceLoading: true,
      // coinAuditCheckData: undefined,
      // coinAuditCheckLoading: true,
      // proTokenList: [],
      // proTokenListLoading: true,
      // recentSearchTokens: undefined,
      // currTradeTab: 'Trades'
    }))
  },
  resetProAllData: () => {
    set(() => ({
      currentProTab: 'Buy',
      currentProTabUpdateWith: '',
      isCoinSelect: false,
      proceedTokenDisclaimerObj: {},
      showTokenInfo: undefined,
      notChangeToken: true,
      anotherTokenInfo: undefined,
      coinDetail: undefined,
      coinDetailLoading: true,
      coinDexPools: [],
      coinDexPoolsLoading: true,
      coinTransactionBlocks: undefined,
      coinTransactionLoading: true,
      coinMarketData: undefined,
      coinMarketDataLoading: true,
      topHolders: [],
      topHoldersTotal: 0,
      topHoldersLoading: true,
      coinTrades: undefined,
      coinTradesLoading: true,
      coinBvPriceUnit: '',
      coinBvPrice: undefined,
      coinBvPriceLoading: true,
      coinAuditCheckData: undefined,
      coinAuditCheckLoading: true,
      proTokenList: [],
      proTokenListLoading: true,
      recentSearchTokens: undefined,
      currTradeTab: 'Trades'
    }))
  }
})

const useProStore = create(
  persist(store, {
    name: 'useProStore',
    partialize: state => {
      const { isProMode, recentSearchTokens, isRealTime } = state
      return { isProMode, recentSearchTokens, isRealTime }
    },
    version: 3
  })
)

export default useProStore
CommonContentTable.getItem<Token>(PROCEED_TOKEN_DISCLAIMER_OBJ_KEY).then((data: any) => {
  if (data !== null) {
    useProStore.getState().setProceedTokenDisclaimerObj(data)
  }
})
