import { DEEPBOOK_POOL_FAVORITE_LIST, VariousTokensTable } from '@cetus/utils'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DeepbookPrice = {
  price: string
  poolId: string
}

const store = (set: any, get: any) => ({
  deepBookPools: [],
  setDeepBookPools: (deepBookPools: any[]) => {
    // console.log('🚀🚀🚀 ~ index.ts:13 ~ store ~ deepBookPools:', deepBookPools)
    const currentPools = get().deepBookPools

    // 如果数组长度不同，直接更新
    if (currentPools.length !== deepBookPools.length) {
      set({ deepBookPools })
      return
    }

    // 简单比较：检查地址列表是否相同
    const currentAddresses = currentPools.map((p: any) => p.address).join(',')
    const newAddresses = deepBookPools.map((p: any) => p.address).join(',')

    if (currentAddresses !== newAddresses) {
      set({ deepBookPools })
      return
    }

    // 如果地址列表相同，检查每个池子的关键字段
    const hasChanges = deepBookPools.some((newPool: any, index: number) => {
      const currentPool = currentPools[index]
      const keyFields = ['price', 'priceDisplay', 'priceChange', 'vol24h', 'vol24hDisplay', 'isFavorite', 'isLocal', 'vol24hUsdDisplay']
      return keyFields.some(field => currentPool?.[field] !== newPool?.[field])
    })

    if (hasChanges) {
      set({ deepBookPools })
    }
  },

  deepBookPoolsObj: {},
  setDeepBookPoolsObj: (deepBookPoolsObj: Record<string, any>) => set({ deepBookPoolsObj }),

  deepBookPoolLoading: false,
  setDeepBookPoolLoading: (deepBookPoolLoading: boolean) => set({ deepBookPoolLoading }),

  currentDeepBookPool: {} as any,
  setCurrentDeepBookPool: (currentDeepBookPool: any) => {
    const currentPool = get().currentDeepBookPool

    const isAddressChanged = currentPool?.address !== currentDeepBookPool?.address
    // 如果地址不同，直接更新，并根据池子类型设置顶部 tab
    if (isAddressChanged) {
      set({
        currentDeepBookPool,
        orderTab: 'spot'
      })
      return
    }

    // 如果地址相同，检查关键字段是否变化
    const keyFields = [
      'price',
      'priceDisplay',
      'priceChange',
      'vol24h',
      'vol24hDisplay',
      'vol24hUsdDisplay',
      'high',
      'low',
      'isFavorite',
      'takerFeeRate',
      'makerFeeRate',
      'makerRebateRate',
      'isMarginPool'
    ]
    const changedFields = keyFields.filter(field => currentPool?.[field] !== currentDeepBookPool?.[field])

    // 只有数据真正变化时才更新
    if (changedFields.length > 0) {
      set({ currentDeepBookPool })
    }
  },

  deepBookOrderBookLoading: true,
  setDeepBookOrderBookLoading: (deepBookOrderBookLoading: boolean) => set({ deepBookOrderBookLoading }),

  deepBookAskList: [],
  setDeepBookAskList: (deepBookAskList: any[]) => set({ deepBookAskList }),

  deepBookBidList: [],
  setDeepBookBidList: (deepBookBidList: any[]) => set({ deepBookBidList }),

  queryDeepBookPoolLoading: false,
  setQueryDeepBookPoolLoading: (queryDeepBookPoolLoading: boolean) => set({ queryDeepBookPoolLoading }),

  queryDeepBookPools: [],
  setQueryDeepBookPools: (queryDeepBookPools: any[]) => {
    const currentQueryPools = get().queryDeepBookPools

    // 如果都是空数组，不更新
    if (currentQueryPools.length === 0 && queryDeepBookPools.length === 0) {
      return
    }

    // 如果数组长度不同，直接更新
    if (currentQueryPools.length !== queryDeepBookPools.length) {
      set({ queryDeepBookPools })
      return
    }

    // 检查地址列表是否相同
    const currentAddresses = currentQueryPools.map((p: any) => p.address).join(',')
    const newAddresses = queryDeepBookPools.map((p: any) => p.address).join(',')

    if (currentAddresses !== newAddresses) {
      set({ queryDeepBookPools })
      return
    }

    // 如果地址列表相同，检查关键字段是否发生变化（例如 isLocal）
    const hasChanges = queryDeepBookPools.some((newPool: any, index: number) => {
      const currentPool = currentQueryPools[index]
      const keyFields = ['price', 'priceDisplay', 'priceChange', 'vol24h', 'vol24hDisplay', 'isFavorite', 'isLocal', 'vol24hUsdDisplay']
      return keyFields.some(field => currentPool?.[field] !== newPool?.[field])
    })

    if (hasChanges) {
      set({ queryDeepBookPools })
    }
  },

  // 以钱包地址为key的映射对象
  currentBalanceManagerInfoMap: {},
  setCurrentBalanceManagerInfo: (walletAddress: string, currentBalanceManagerInfo: any) =>
    set((state: any) => ({
      currentBalanceManagerInfoMap: {
        ...state.currentBalanceManagerInfoMap,
        [walletAddress]: currentBalanceManagerInfo
      }
    })),
  getCurrentBalanceManagerInfo: (walletAddress: string) => {
    const state = get()
    return state.currentBalanceManagerInfoMap[walletAddress] || null
  },

  balanceManagerList: [],
  setBalanceManagerList: (balanceManagerList: any[]) => set({ balanceManagerList }),

  managerBalanceObjs: [] as any,
  setManagerBalanceObjs: (managerBalanceObjs: any[]) => set({ managerBalanceObjs }),

  managerBalanceListObjs: {},
  setManagerBalanceListObjs: (balanceManager: string, balanceObjs: any) =>
    set((state: any) => ({
      managerBalanceListObjs: {
        ...state.managerBalanceListObjs,
        [balanceManager]: balanceObjs
      }
    })),

  deepBookOpenOrders: [],
  setDeepBookOpenOrders: (deepBookOpenOrders: any[]) => set({ deepBookOpenOrders }),

  showOpenOrdersNum: 0,
  setShowOpenOrdersNum: (showOpenOrdersNum: number) => set({ showOpenOrdersNum }),

  // Spot 和 Margin 分别计数
  showOpenOrdersNumSpot: 0,
  setShowOpenOrdersNumSpot: (showOpenOrdersNumSpot: number) => set({ showOpenOrdersNumSpot }),
  showOpenOrdersNumMargin: 0,
  setShowOpenOrdersNumMargin: (showOpenOrdersNumMargin: number) => set({ showOpenOrdersNumMargin }),

  cancelOrderLoading: null,
  setCancelOrderLoading: (cancelOrderLoading: string | null) => set({ cancelOrderLoading }),

  cancelAllOrderLoading: false,
  setCancelAllOrderLoading: (cancelAllOrderLoading: boolean) => set({ cancelAllOrderLoading }),

  modifyOrderLoading: false,
  setModifyOrderLoading: (modifyOrderLoading: boolean) => set({ modifyOrderLoading }),

  orderListLoading: true,
  setOrderListLoading: (orderListLoading: boolean) => set({ orderListLoading }),

  isCheckedAllMarkets: false,
  setIsCheckedAllMarkets: (isCheckedAllMarkets: boolean) => set({ isCheckedAllMarkets }),

  deepBookOrderHistory: [],
  setDeepBookOrderHistory: (deepBookOrderHistory: any[]) => set({ deepBookOrderHistory }),

  deepBookOrderHistoryLoading: true,
  setDeepBookOrderHistoryLoading: (deepBookOrderHistoryLoading: boolean) => set({ deepBookOrderHistoryLoading }),

  showDeepBookOrderHistoryNum: 0,
  setShowDeepBookOrderHistoryNum: (showDeepBookOrderHistoryNum: number) => set({ showDeepBookOrderHistoryNum }),

  // Spot 和 Margin 分别计数
  showDeepBookOrderHistoryNumSpot: 0,
  setShowDeepBookOrderHistoryNumSpot: (showDeepBookOrderHistoryNumSpot: number) => set({ showDeepBookOrderHistoryNumSpot }),
  showDeepBookOrderHistoryNumMargin: 0,
  setShowDeepBookOrderHistoryNumMargin: (showDeepBookOrderHistoryNumMargin: number) => set({ showDeepBookOrderHistoryNumMargin }),

  deepBookTradeHistory: [],
  setDeepBookTradeHistory: (deepBookTradeHistory: any[]) => set({ deepBookTradeHistory }),
  showDeepBookTradeHistoryNum: 0,
  setShowDeepBookTradeHistoryNum: (showDeepBookTradeHistoryNum: number) => set({ showDeepBookTradeHistoryNum }),

  // Spot 和 Margin 分别计数
  showDeepBookTradeHistoryNumSpot: 0,
  setShowDeepBookTradeHistoryNumSpot: (showDeepBookTradeHistoryNumSpot: number) => set({ showDeepBookTradeHistoryNumSpot }),
  showDeepBookTradeHistoryNumMargin: 0,
  setShowDeepBookTradeHistoryNumMargin: (showDeepBookTradeHistoryNumMargin: number) => set({ showDeepBookTradeHistoryNumMargin }),

  deepBookTradeHistoryLoading: true,
  setDeepBookTradeHistoryLoading: (deepBookTradeHistoryLoading: boolean) => set({ deepBookTradeHistoryLoading }),

  deepBookSettleList: [],
  setDeepBookSettleList: (deepBookSettleList: any[]) => set({ deepBookSettleList }),

  deepBookSettleListLoading: false,
  setDeepBookSettleListLoading: (deepBookSettleListLoading: boolean) => set({ deepBookSettleListLoading }),

  claimSettleLoading: false,
  setClaimSettleLoading: (claimSettleLoading: boolean) => set({ claimSettleLoading }),

  depositAssetsLoading: false,
  setDepositAssetsLoading: (depositAssetsLoading: boolean) => set({ depositAssetsLoading }),

  withdrawAssetsLoading: false,
  setWithdrawAssetsLoading: (withdrawAssetsLoading: boolean) => set({ withdrawAssetsLoading }),

  localDeepBookPools: [],
  setLocalDeepBookPools: (localDeepBookPools: any[]) => set({ localDeepBookPools }),

  placeOrderPrice: '',
  setPlaceOrderPrice: (placeOrderPrice: string) => set({ placeOrderPrice }),

  orderType: 'Market' as 'Market' | 'Limit',
  setOrderType: (orderType: 'Market' | 'Limit') => set({ orderType }),

  deepbookPrice: undefined,
  setDeepbookPrice: (value: DeepbookPrice) => {
    set(() => ({
      deepbookPrice: value
    }))
  },

  // 价格锁定状态
  isPriceLocked: false,
  lockPrice: () => set({ isPriceLocked: true }),
  unlockPrice: () => set({ isPriceLocked: false }),

  deepBookPoolFavoriteIds: [] as string[],
  setDeepBookPoolFavoriteId: (id: string): string[] => {
    const currentIds = get().deepBookPoolFavoriteIds
    if (!currentIds.includes(id)) {
      const newIds = [...currentIds, id]
      set(() => ({ deepBookPoolFavoriteIds: newIds }))
      return newIds
    }
    return currentIds
  },
  removeDeepBookPoolFavoriteId: (id: string): string[] => {
    const newIds = get().deepBookPoolFavoriteIds.filter((favoriteId: string) => favoriteId !== id)
    set(() => ({ deepBookPoolFavoriteIds: newIds }))
    return newIds
  },
  setDeepBookPoolFavoriteIds: (ids: string[]) => {
    set(() => ({ deepBookPoolFavoriteIds: ids }))
  },

  managePoolModalOpen: false,
  setManagePoolModalOpen: (open: boolean) => set({ managePoolModalOpen: open }),

  selectedPoolAddress: null,
  setSelectedPoolAddress: (address: string | null) => set({ selectedPoolAddress: address }),

  withdrawAllModalOpen: false,
  setWithdrawAllModalOpen: (open: boolean) => set({ withdrawAllModalOpen: open }),

  searchText: '',
  setSearchText: (searchText: string) => set({ searchText }),

  isAllPools: false,
  setIsAllPools: (isAllPools: boolean) => set({ isAllPools }),

  isOpenCreateModal: false,
  setIsOpenCreateModal: (isOpenCreateModal: boolean) => set({ isOpenCreateModal }),

  isCreatePoolSuccess: false,
  setIsCreatePoolSuccess: (isCreatePoolSuccess: boolean) => set({ isCreatePoolSuccess }),

  chartAndMarketCurrentTab: { key: 'chart', label: 'Chart' },
  setChartAndMarketCurrentTab: (chartAndMarketCurrentTab: { key: string; label: string }) => set({ chartAndMarketCurrentTab }),

  deepbookTopTab: 'trade',
  setDeepbookTopTab: (deepbookTopTab: 'trade' | 'margin_pools') => set({ deepbookTopTab }),

  tradeTypeByPool: {} as Record<string, 'Spot' | 'Margin'>,
  getTradeType: (poolAddress: string): 'Spot' | 'Margin' => {
    const state = get()
    return state.tradeTypeByPool[poolAddress] || 'Spot'
  },
  setTradeType: (poolAddress: string, tradeType: 'Spot' | 'Margin') =>
    set((state: any) => ({
      tradeTypeByPool: {
        ...state.tradeTypeByPool,
        [poolAddress]: tradeType
      }
    })),

  orderTab: 'spot' as 'spot' | 'margin',
  setOrderTab: (orderTab: 'spot' | 'margin') => set({ orderTab }),

  isOpenAssetsActionModal: false,
  setIsOpenAssetsActionModal: (isOpenAssetsActionModal: boolean) => set({ isOpenAssetsActionModal }),

  actionType: null,
  tokenInfo: null,
  allowTokenSwitch: null as boolean | null,

  openAssetsActionModal: (type: any, token: any, allowTokenSwitch?: boolean) =>
    set({
      isOpenAssetsActionModal: true,
      actionType: type,
      tokenInfo: token,
      allowTokenSwitch: allowTokenSwitch !== undefined ? allowTokenSwitch : null
    }),

  closeAssetsActionModal: () =>
    set({
      isOpenAssetsActionModal: false,
      actionType: null,
      tokenInfo: null,
      allowTokenSwitch: null
    })
})

const useDeepBookStore = create(
  persist(store, {
    name: 'useDeepBookStore',
    partialize: state => {
      const { currentBalanceManagerInfoMap, localDeepBookPools, isCheckedAllMarkets, deepbookTopTab, tradeTypeByPool } = state
      return { currentBalanceManagerInfoMap, localDeepBookPools, isCheckedAllMarkets, deepbookTopTab, tradeTypeByPool }
    },
    version: 2
  })
)

// 从 localForage 加载收藏列表数据
VariousTokensTable.getItem<string[]>(DEEPBOOK_POOL_FAVORITE_LIST).then(savedFavoriteList => {
  if (savedFavoriteList && savedFavoriteList.length > 0) {
    useDeepBookStore.getState().setDeepBookPoolFavoriteIds(savedFavoriteList)
  }
})

export default useDeepBookStore
