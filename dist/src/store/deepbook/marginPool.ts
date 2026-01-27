import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const store = (set: any, get: any) => ({
  selectCoinList: [],
  setSelectCoinList: (selectCoinList: any) => set({ selectCoinList }),

  isYourSupply: false,
  setIsYourSupply: (isYourSupply: boolean) => set({ isYourSupply }),

  deepBookMarginPools: [],
  setDeepBookMarginPools: (deepBookMarginPools: any) => set({ deepBookMarginPools }),
  isMarginPoolsLoading: true,
  setIsMarginPoolsLoading: (isMarginPoolsLoading: boolean) => set({ isMarginPoolsLoading }),
  marginPoolsTotalData: {},
  setMarginPoolsTotalData: (marginPoolsTotalData: any) => set({ marginPoolsTotalData }),

  marginPoolCap: undefined,
  setMarginPoolCap: (marginPoolCap: any) => set({ marginPoolCap }),

  userInfo: {} as Record<string, any>,
  setUserInfo: (orderId: string, info: any, noData?: boolean) =>
    set((state: any) => ({
      userInfo: noData
        ? { noData: true }
        : {
            ...state.userInfo,
            [orderId]: info, // 有则覆盖，无则新增
            noData: false
          }
    })),

  routerData: undefined,
  setRouterData: (routerData: any) => set({ routerData }),

  toToken: undefined,
  setToToken: (toToken: any) => set({ toToken }),

  inputValue: '',
  setInputValue: (inputValue: string) => set({ inputValue }),

  isAutoSwap: false,
  setIsAutoSwap: (isAutoSwap: boolean) => set({ isAutoSwap }),

  currentPageTab: 'Pools',
  setCurrentPageTab: (currentPageTab: 'Pools' | 'History') => set({ currentPageTab }),

  historyCurrentAction: {
    label: 'All',
    value: 'All'
  },
  setHistoryCurrentAction: (historyCurrentAction: 'All' | 'Deposit' | 'Withdraw') => set({ historyCurrentAction }),

  historyCurrentPools: {
    label: 'All',
    value: 'All'
  },
  setHistoryCurrentPools: (historyCurrentPools: string) => set({ historyCurrentPools }),

  historyList: [],
  setHistoryList: (historyList: any) => set({ historyList }),
  isHistoryLoading: [],
  setIsHistoryLoading: (isHistoryLoading: any) => set({ isHistoryLoading }),

  poolsSort: {
    sortRule: 'desc',
    sortBy: {
      label: 'Total Supply',
      value: 'supply'
    }
  },
  setPoolsSort: (poolsSort: any) => set({ poolsSort }),

  clearData: () =>
    set({
      isYourSupply: false,
      currentPageTab: 'Pools',
      historyCurrentAction: {
        label: 'All',
        value: 'All'
      },
      historyCurrentPools: {
        label: 'All',
        value: 'All'
      }
    })
})

const useDeepBookMarginPoolStore = create(
  persist(store, {
    name: 'useDeepBookMarginPoolStore',
    partialize: state => {
      const {} = state
      return {}
    },
    version: 1
  })
)

export default useDeepBookMarginPoolStore
