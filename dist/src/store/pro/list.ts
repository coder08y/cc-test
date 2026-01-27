import { ProCarouseInfo } from '@/types/pro'
import { Token } from '@cetus/types'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tab 数据缓存类型
interface TabCache {
  data: any
  timestamp: number
}

interface ProListState {
  quickCoin: Token & { limitBuy: number }
  quickBuyCoinList: (Token & { limitBuy: number })[]
  setQuickCoin: (info: Token & { limitBuy: number }) => void
  quickAmount: string
  setQuickAmount: (value: string) => void
  searchText: string
  setSearchText: (value: string) => void
  quickLoading: boolean
  setQuickLoading: (value: boolean) => void
  quickLoadingCoin: string
  setQuickLoadingCoin: (value: string) => void
  dateType: string
  displayDateType: string
  setDateType: (value: string, displayVlaue: string) => void
  // liquidity筛选参数
  liquidityMin: string
  setLiquidityMin: (value: string) => void
  liquidityMax: string
  setLiquidityMax: (value: string) => void
  // mc筛选参数
  mcMin: string
  setMcMin: (value: string) => void
  mcMax: string
  setMcMax: (value: string) => void
  // volume筛选参数
  volumeMin: string
  setVolumeMin: (value: string) => void
  volumeMax: string
  setVolumeMax: (value: string) => void

  // 排序tab相关
  currentSortTab: string
  setCurrentSortTab: (value: string) => void

  // 列表tab相关
  currentProTab: string
  setCurrentProTab: (value: string) => void
  resetProListStoreData: () => void

  // 列表请求参数相关
  proListParams: Record<string, any>
  setProListParams: (data: Record<string, any>) => void

  //进入pro页面时是否需要展示弹框
  isShowTokenRickModal: boolean
  setIsShowTokenRickModal: (data: boolean) => void

  //是否打开token risk弹框
  isOpenProTokenRiskModal: boolean
  setIsOpenProTokenRiskModal: (data: boolean) => void

  //proCarouseWatchInfo
  proCarouseWatchInfo: ProCarouseInfo<any[]> & { dataCoinTypeList: any }
  setProCarouseWatchInfo: (data: ProCarouseInfo<any[]>, coins: string[]) => void

  //proCarouseTrendingInfo
  proCarouseTrendingInfo: ProCarouseInfo<any[]>
  setProCarouseTrendingInfo: (data: ProCarouseInfo<any[]>) => void

  //当前轮播tab
  currentCarouselTab: 'Watchlist' | 'Trending'
  setCurrentCarouselTab: (currentCarouselTab: 'Watchlist' | 'Trending') => void

  // 列表刷新完成状态（用于控制 RefreshButton 的加载动画）
  isRefreshing: boolean
  setIsRefreshing: (value: boolean) => void

  // Tab 数据缓存管理
  tabCacheMap: Record<string, TabCache>
  setTabCache: (tabKey: string, data: any) => void
  getTabCache: (tabKey: string) => TabCache | undefined
  isTabCacheValid: (tabKey: string, maxAge?: number) => boolean
}

const store: StateCreator<ProListState> = (set, get) => ({
  quickBuyCoinList: [
    {
      symbol: 'SUI',
      name: 'sui',
      coin_type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      logo_url: 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/sui-coin.svg/public',
      decimals: 9,
      limitBuy: 100 //最多兑换100SUI
    },
    {
      symbol: 'USDC',
      name: 'usdc',
      coin_type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      logo_url: 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/usdc.png/public',
      decimals: 6,
      limitBuy: 200 //最多兑换200USDC
    }
  ],
  quickCoin: {
    symbol: 'SUI',
    name: 'sui',
    coin_type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    logo_url: 'https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/sui-coin.svg/public',
    decimals: 9,
    limitBuy: 100 //最多兑换100SUI
  },
  setQuickCoin: (info: Token & { limitBuy: number }) => {
    set(() => ({
      quickCoin: info
    }))
  },
  quickAmount: '1',
  setQuickAmount: (value: string) => {
    set(() => ({
      quickAmount: value
    }))
  },
  searchText: '',
  setSearchText: (value: string) => {
    set(() => ({
      searchText: value
    }))
  },
  quickLoading: false,
  setQuickLoading: (value: boolean) => {
    set(() => ({
      quickLoading: value
    }))
  },
  quickLoadingCoin: '',
  setQuickLoadingCoin: (value: string) => {
    set(() => ({
      quickLoadingCoin: value
    }))
  },
  dateType: 'hour24',
  displayDateType: '24H',
  setDateType: (value: string, displayVlaue: string) => {
    set(() => ({
      dateType: value,
      displayDateType: displayVlaue
    }))
  },
  liquidityMin: '',
  setLiquidityMin: (value: string) => {
    set(() => ({
      liquidityMin: value
    }))
  },
  liquidityMax: '',
  setLiquidityMax: (value: string) => {
    set(() => ({
      liquidityMax: value
    }))
  },
  // mc筛选参数
  mcMin: '',
  setMcMin: (value: string) => {
    set(() => ({
      mcMin: value
    }))
  },
  mcMax: '',
  setMcMax: (value: string) => {
    set(() => ({
      mcMax: value
    }))
  },
  // volume筛选参数
  volumeMin: '',
  setVolumeMin: (value: string) => {
    set(() => ({
      volumeMin: value
    }))
  },
  volumeMax: '',
  setVolumeMax: (value: string) => {
    set(() => ({
      volumeMax: value
    }))
  },
  currentSortTab: 'Top',
  setCurrentSortTab: (value: string) => {
    set(() => ({
      currentSortTab: value
    }))
  },
  currentProTab: 'Trending',
  setCurrentProTab: (value: string) => {
    set(() => ({
      currentProTab: value
    }))
  },
  isShowTokenRickModal: true,
  setIsShowTokenRickModal: (isShowTokenRickModal: boolean) => {
    set(() => ({
      isShowTokenRickModal
    }))
  },
  isOpenProTokenRiskModal: false,
  setIsOpenProTokenRiskModal: (isOpenProTokenRiskModal: boolean) => {
    set(() => ({
      isOpenProTokenRiskModal
    }))
  },
  currentCarouselTab: 'Trending',
  setCurrentCarouselTab: (currentCarouselTab: 'Watchlist' | 'Trending') => {
    set(() => ({
      currentCarouselTab
    }))
  },
  // 列表刷新完成状态
  isRefreshing: false,
  setIsRefreshing: (value: boolean) => {
    set(() => ({
      isRefreshing: value
    }))
  },
  // Tab 缓存管理
  tabCacheMap: {},
  setTabCache: (tabKey: string, data: any) => {
    set(() => ({
      tabCacheMap: {
        ...get().tabCacheMap,
        [tabKey]: {
          data,
          timestamp: Date.now()
        }
      }
    }))
  },
  getTabCache: (tabKey: string) => {
    return get().tabCacheMap[tabKey]
  },
  isTabCacheValid: (tabKey: string, maxAge: number = 60000) => {
    const cache = get().tabCacheMap[tabKey]
    if (!cache) return false
    return Date.now() - cache.timestamp < maxAge
  },
  // 列表请求参数相关
  proListParams: {
    sorted_by: 'rank',
    date_type: 'hour24',
    desc: false,
    limit: 20,
    offset: 0,
    market_cap_max: '',
    market_cap_min: '',
    volume_max: '',
    volume_min: '',
    liqidity_max: '',
    liqidity_min: '',
    text: '',
    tag: 'trending'
  },
  setProListParams: (data: Record<string, any>) => {
    set(() => ({
      proListParams: {
        ...get().proListParams,
        ...data
      }
    }))
  },
  proCarouseWatchInfo: {
    dataList: [],
    dataCoinTypeList: [],
    lastUpdateTime: undefined
  },
  setProCarouseWatchInfo: (data: any, coins: string[]) => {
    set(() => ({
      proCarouseWatchInfo: {
        dataList: data,
        dataCoinTypeList: coins,
        lastUpdateTime: new Date().getTime()
      }
    }))
  },
  proCarouseTrendingInfo: {
    dataList: [],
    lastUpdateTime: undefined
  },
  setProCarouseTrendingInfo: (data: any) => {
    set(() => ({
      proCarouseTrendingInfo: {
        dataList: data,
        lastUpdateTime: new Date().getTime()
      }
    }))
  },
  // toDo: 暂时只清空了search，其他内容后续依具体情况可重置
  resetProListStoreData: () => {
    set(() => ({
      searchText: '',
      quickAmount: '1',
      quickLoadingCoin: '',
      dateType: 'hour24',
      displayDateType: '24H',
      liquidityMin: '',
      liquidityMax: '',
      mcMin: '',
      mcMax: '',
      volumeMin: '',
      volumeMax: '',
      currentSortTab: 'Top',
      currentProTab: 'Trending',
      tabCacheMap: {},
      proListParams: {
        sorted_by: 'rank',
        date_type: 'hour24',
        desc: false,
        limit: 20,
        offset: 0,
        market_cap_max: '',
        market_cap_min: '',
        volume_max: '',
        volume_min: '',
        liqidity_max: '',
        liqidity_min: '',
        text: '',
        tag: 'trending'
      }
    }))
  }
})

const useProListStore = create(
  persist(store, {
    name: 'useProListStore',
    partialize: state => {
      const { quickCoin, isShowTokenRickModal } = state
      return { quickCoin, isShowTokenRickModal }
    },
    version: 3
  })
)

export default useProListStore
