import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * DeepBook Margin Trading Store
 * 管理所有 margin trading 相关的状态
 */

type MarginStore = {
  // Margin Manager 列表（按账户）
  marginManagerByAccount: any[]
  setMarginManagerByAccount: (marginManagerByAccount: any[]) => void
  // 记录 marginManagerByAccount 对应的账户地址，用于验证数据是否属于当前账户
  marginManagerByAccountOwner: string | null
  setMarginManagerByAccountOwner: (accountAddress: string | null) => void

  // Margin Manager 信息（以钱包地址为key的映射对象，存储当前选择的 margin manager）
  currentMarginManagerInfoMap: Record<string, any>
  setCurrentMarginManagerInfo: (walletAddress: string, currentMarginManagerInfo: any) => void
  getCurrentMarginManagerInfo: (walletAddress: string) => any

  // Margin 杠杆率（按 poolAddress 存储）
  marginLeverageRatioByPool: Record<string, string>
  getMarginLeverageRatio: (poolAddress: string) => string
  setMarginLeverageRatio: (poolAddress: string, marginLeverageRatio: string) => void

  marginLeverageModalOpen: boolean
  setMarginLeverageModalOpen: (marginLeverageModalOpen: boolean) => void

  marginTradingEnabled: boolean
  setMarginTradingEnabled: (marginTradingEnabled: boolean) => void

  enableMarginTradingModalOpen: boolean
  setEnableMarginTradingModalOpen: (enableMarginTradingModalOpen: boolean) => void

  // Margin 输入collateral
  // marginInputCols: Array<{ id: string; amount: string }>
  // setMarginInputCols: (marginInputCols: Array<{ id: string; amount: string }>) => void

  // Margin 激活的 tab
  // marginActiveTab: 'base' | 'quote' | 'mixed'
  // setMarginActiveTab: (marginActiveTab: 'base' | 'quote' | 'mixed') => void

  // Margin 余额状态（全局共享，避免多个 hook 实例导致状态不同步）
  // 使用 account + pool 作为 key，确保不同账户和池子的余额不会互相影响
  marginBalances: Record<string, { base: string; quote: string; deep: string }>
  setMarginBalance: (account: string, poolAddress: string, base: string, quote: string, deep: string) => void
  getMarginBalance: (account: string, poolAddress: string) => { base: string; quote: string; deep: string }

  // 请求状态（防止重复请求）
  // 使用 account + pool 作为 key，标记是否正在请求中
  balanceFetching: Record<string, boolean>
  setBalanceFetching: (account: string, poolAddress: string, fetching: boolean) => void
  isBalanceFetching: (account: string, poolAddress: string) => boolean

  // 价格状态（按 poolAddress 存储，价格与账户无关）
  marginPrices: Record<string, { basePrice: number | null; quotePrice: number | null }>
  setMarginPrice: (poolAddress: string, basePrice: number | null, quotePrice: number | null) => void
  getMarginPrice: (poolAddress: string) => { basePrice: number | null; quotePrice: number | null }

  // 价格请求状态（防止重复请求）
  priceFetching: Record<string, boolean>
  setPriceFetching: (poolAddress: string, fetching: boolean) => void
  isPriceFetching: (poolAddress: string) => boolean

  // 批量获取余额的请求状态（防止多个 hook 实例重复请求）
  batchBalanceFetching: Record<string, boolean>
  setBatchBalanceFetching: (account: string, fetching: boolean) => void
  isBatchBalanceFetching: (account: string) => boolean

  // 债务状态（按 account + poolAddress 存储）
  marginDebts: Record<
    string,
    {
      baseDebt: string
      quoteDebt: string
      baseDebtUSD: string
      quoteDebtUSD: string
      totalDebtValue: string
    }
  >
  setMarginDebt: (
    account: string,
    poolAddress: string,
    debt: {
      baseDebt: string
      quoteDebt: string
      baseDebtUSD: string
      quoteDebtUSD: string
      totalDebtValue: string
    }
  ) => void
  getMarginDebt: (
    account: string,
    poolAddress: string
  ) => {
    baseDebt: string
    quoteDebt: string
    baseDebtUSD: string
    quoteDebtUSD: string
    totalDebtValue: string
  }

  // 债务请求状态（防止重复请求）
  debtFetching: Record<string, boolean>
  setDebtFetching: (account: string, poolAddress: string, fetching: boolean) => void
  isDebtFetching: (account: string, poolAddress: string) => boolean

  // 风险率计算结果（按 account + poolAddress 存储）
  riskRatios: Record<
    string,
    {
      riskRatio: string
      totalAssetsValue: string
      totalDebtValue: string
      baseAssetValue: string
      quoteAssetValue: string
      baseDebtValue: string
      quoteDebtValue: string
      baseAsset: string
      quoteAsset: string
      baseDebt: string
      quoteDebt: string
      borrowLimit: string
    }
  >
  setRiskRatio: (
    account: string,
    poolAddress: string,
    riskRatio: {
      riskRatio: string
      totalAssetsValue: string
      totalDebtValue: string
      baseAssetValue: string
      quoteAssetValue: string
      baseDebtValue: string
      quoteDebtValue: string
      baseAsset: string
      quoteAsset: string
      baseDebt: string
      quoteDebt: string
      borrowLimit: string
    }
  ) => void
  getRiskRatio: (
    account: string,
    poolAddress: string
  ) => {
    riskRatio: string
    totalAssetsValue: string
    totalDebtValue: string
    baseAssetValue: string
    quoteAssetValue: string
    baseDebtValue: string
    quoteDebtValue: string
    baseAsset: string
    quoteAsset: string
    baseDebt: string
    quoteDebt: string
    borrowLimit: string
  }

  // 风险率计算状态（防止重复计算）
  riskRatioCalculating: Record<string, boolean>
  setRiskRatioCalculating: (account: string, poolAddress: string, calculating: boolean) => void
  isRiskRatioCalculating: (account: string, poolAddress: string) => boolean

  // 清算记录相关状态
  deepBookLiquidationRecords: any[]
  setDeepBookLiquidationRecords: (deepBookLiquidationRecords: any[]) => void
  deepBookLiquidationRecordsLoading: boolean
  setDeepBookLiquidationRecordsLoading: (deepBookLiquidationRecordsLoading: boolean) => void
  showDeepBookLiquidationRecordsNum: number
  setShowDeepBookLiquidationRecordsNum: (showDeepBookLiquidationRecordsNum: number) => void

  marginSettleList: any[]
  setMarginSettleList: (marginSettleList: any[]) => void
  marginSettleListLoading: boolean
  setMarginSettleListLoading: (marginSettleListLoading: boolean) => void
  marginClaimSettleLoading: boolean
  setMarginClaimSettleLoading: (marginClaimSettleLoading: boolean) => void

  // Locked Orders 请求状态（防止多个 hook 实例同时发起相同请求）
  // 使用 requestKey (account-pool-managerId) 作为 key
  lockedOrdersFetching: Record<string, boolean>
  setLockedOrdersFetching: (requestKey: string, fetching: boolean) => void
  isLockedOrdersFetching: (requestKey: string) => boolean

  // Margin 交易方向（按 poolAddress 存储）
  marginTradeTypeByPool: Record<string, DeepBookPoolMarginTabs>
  getMarginTradeType: (poolAddress: string) => DeepBookPoolMarginTabs
  setMarginTradeType: (poolAddress: string, tradeType: DeepBookPoolMarginTabs) => void

  // 完整的 Margin Balance 数据（按 account + poolAddress 存储）
  // 包含 free, locked, settled, total 等所有余额信息
  marginBalanceData: Record<
    string,
    {
      baseFreeBalance: string
      quoteFreeBalance: string
      baseLockedBalance: string
      quoteLockedBalance: string
      baseSettledBalance: string
      quoteSettledBalance: string
      baseTotalBalance: string
      quoteTotalBalance: string
      baseMarginBalanceUSD: string
      quoteMarginBalanceUSD: string
      baseLockedBalanceUSD: string
      quoteLockedBalanceUSD: string
      baseSettledBalanceUSD: string
      quoteSettledBalanceUSD: string
      baseTotalBalanceUSD: string
      quoteTotalBalanceUSD: string
      totalCollateralValue: string
      basePrice: number | null
      quotePrice: number | null
    }
  >
  setMarginBalanceData: (
    account: string,
    poolAddress: string,
    managerId: string,
    data: {
      baseFreeBalance: string
      quoteFreeBalance: string
      baseLockedBalance: string
      quoteLockedBalance: string
      baseSettledBalance: string
      quoteSettledBalance: string
      baseTotalBalance: string
      quoteTotalBalance: string
      baseMarginBalanceUSD: string
      quoteMarginBalanceUSD: string
      baseLockedBalanceUSD: string
      quoteLockedBalanceUSD: string
      baseSettledBalanceUSD: string
      quoteSettledBalanceUSD: string
      baseTotalBalanceUSD: string
      quoteTotalBalanceUSD: string
      totalCollateralValue: string
      basePrice: number | null
      quotePrice: number | null
    }
  ) => void
  getCurrentManagerIdForPool: (account: string, poolAddress: string) => string | null
  getMarginBalanceData: (
    account: string,
    poolAddress: string,
    managerId?: string
  ) => {
    baseFreeBalance: string
    quoteFreeBalance: string
    baseLockedBalance: string
    quoteLockedBalance: string
    baseSettledBalance: string
    quoteSettledBalance: string
    baseTotalBalance: string
    quoteTotalBalance: string
    baseMarginBalanceUSD: string
    quoteMarginBalanceUSD: string
    baseLockedBalanceUSD: string
    quoteLockedBalanceUSD: string
    baseSettledBalanceUSD: string
    quoteSettledBalanceUSD: string
    baseTotalBalanceUSD: string
    quoteTotalBalanceUSD: string
    totalCollateralValue: string
    basePrice: number | null
    quotePrice: number | null
  }
}

const store = (set: any, get: any): MarginStore => ({
  marginManagerByAccount: [],
  setMarginManagerByAccount: (marginManagerByAccount: any[]) => set({ marginManagerByAccount }),
  marginManagerByAccountOwner: null,
  setMarginManagerByAccountOwner: (accountAddress: string | null) => set({ marginManagerByAccountOwner: accountAddress }),

  currentMarginManagerInfoMap: {},
  setCurrentMarginManagerInfo: (walletAddress: string, currentMarginManagerInfo: any) =>
    set((state: MarginStore) => ({
      currentMarginManagerInfoMap: {
        ...state.currentMarginManagerInfoMap,
        [walletAddress]: currentMarginManagerInfo
      }
    })),
  getCurrentMarginManagerInfo: (walletAddress: string) => {
    const state = get()
    return state.currentMarginManagerInfoMap[walletAddress] || null
  },

  marginLeverageRatioByPool: {},
  getMarginLeverageRatio: (poolAddress: string) => {
    const state = get()
    return state.marginLeverageRatioByPool[poolAddress] || '1.1'
  },
  setMarginLeverageRatio: (poolAddress: string, marginLeverageRatio: string) => {
    set((state: MarginStore) => ({
      marginLeverageRatioByPool: {
        ...state.marginLeverageRatioByPool,
        [poolAddress]: marginLeverageRatio
      }
    }))
  },

  marginLeverageModalOpen: false,
  setMarginLeverageModalOpen: (marginLeverageModalOpen: boolean) => set({ marginLeverageModalOpen }),

  marginTradingEnabled: false,
  setMarginTradingEnabled: (marginTradingEnabled: boolean) => set({ marginTradingEnabled }),

  enableMarginTradingModalOpen: false,
  setEnableMarginTradingModalOpen: (enableMarginTradingModalOpen: boolean) => set({ enableMarginTradingModalOpen }),

  // marginInputCols: [
  //   { id: '1', amount: '' },
  //   { id: '2', amount: '' }
  // ],
  // setMarginInputCols: (marginInputCols: Array<{ id: string; amount: string }>) => set({ marginInputCols }),

  // marginActiveTab: 'base',
  // setMarginActiveTab: (marginActiveTab: 'base' | 'quote' | 'mixed') => {
  //   // 当切换 activeTab 时，清空输入值
  //   set({
  //     marginActiveTab,
  //     marginInputCols: [
  //       { id: '1', amount: '' },
  //       { id: '2', amount: '' }
  //     ]
  //   })
  // },

  marginBalances: {},
  setMarginBalance: (account: string, poolAddress: string, base: string, quote: string, deep: string) => {
    const key = `${account}-${poolAddress}`
    set((state: MarginStore) => ({
      marginBalances: {
        ...state.marginBalances,
        [key]: { base, quote, deep }
      }
    }))
  },
  getMarginBalance: (account: string, poolAddress: string) => {
    const key = `${account}-${poolAddress}`
    const state = get()
    return state.marginBalances[key] || { base: '0', quote: '0', deep: '0' }
  },

  balanceFetching: {},
  setBalanceFetching: (account: string, poolAddress: string, fetching: boolean) => {
    const key = `${account}-${poolAddress}`
    set((state: MarginStore) => ({
      balanceFetching: {
        ...state.balanceFetching,
        [key]: fetching
      }
    }))
  },
  isBalanceFetching: (account: string, poolAddress: string) => {
    const key = `${account}-${poolAddress}`
    const state = get()
    return state.balanceFetching[key] || false
  },

  marginPrices: {},
  setMarginPrice: (poolAddress: string, basePrice: number | null, quotePrice: number | null) => {
    set((state: MarginStore) => ({
      marginPrices: {
        ...state.marginPrices,
        [poolAddress]: { basePrice, quotePrice }
      }
    }))
  },
  getMarginPrice: (poolAddress: string) => {
    const state = get()
    return state.marginPrices[poolAddress] || { basePrice: null, quotePrice: null }
  },

  priceFetching: {},
  setPriceFetching: (poolAddress: string, fetching: boolean) => {
    set((state: MarginStore) => ({
      priceFetching: {
        ...state.priceFetching,
        [poolAddress]: fetching
      }
    }))
  },
  isPriceFetching: (poolAddress: string) => {
    const state = get()
    return state.priceFetching[poolAddress] || false
  },

  batchBalanceFetching: {},
  setBatchBalanceFetching: (account: string, fetching: boolean) => {
    const key = `batch-${account}`
    set((state: MarginStore) => ({
      batchBalanceFetching: {
        ...state.batchBalanceFetching,
        [key]: fetching
      }
    }))
  },
  isBatchBalanceFetching: (account: string) => {
    const key = `batch-${account}`
    const state = get()
    return state.batchBalanceFetching[key] || false
  },

  marginDebts: {},
  setMarginDebt: (
    account: string,
    poolAddress: string,
    debt: {
      baseDebt: string
      quoteDebt: string
      baseDebtUSD: string
      quoteDebtUSD: string
      totalDebtValue: string
    }
  ) => {
    const key = `${account}-${poolAddress}`
    set((state: MarginStore) => ({
      marginDebts: {
        ...state.marginDebts,
        [key]: debt
      }
    }))
  },
  getMarginDebt: (account: string, poolAddress: string) => {
    const key = `${account}-${poolAddress}`
    const state = get()
    return (
      state.marginDebts[key] || {
        baseDebt: '0',
        quoteDebt: '0',
        baseDebtUSD: '0',
        quoteDebtUSD: '0',
        totalDebtValue: '0'
      }
    )
  },

  debtFetching: {},
  setDebtFetching: (account: string, poolAddress: string, fetching: boolean) => {
    const key = `${account}-${poolAddress}`
    set((state: MarginStore) => ({
      debtFetching: {
        ...state.debtFetching,
        [key]: fetching
      }
    }))
  },
  isDebtFetching: (account: string, poolAddress: string) => {
    const key = `${account}-${poolAddress}`
    const state = get()
    return state.debtFetching[key] || false
  },

  riskRatios: {},
  setRiskRatio: (
    account: string,
    poolAddress: string,
    riskRatio: {
      riskRatio: string
      totalAssetsValue: string
      totalDebtValue: string
      baseAssetValue: string
      quoteAssetValue: string
      baseDebtValue: string
      quoteDebtValue: string
      baseAsset: string
      quoteAsset: string
      baseDebt: string
      quoteDebt: string
      borrowLimit: string
    }
  ) => {
    const key = `${account}-${poolAddress}`
    set((state: MarginStore) => ({
      riskRatios: {
        ...state.riskRatios,
        [key]: riskRatio
      }
    }))
  },
  getRiskRatio: (account: string, poolAddress: string) => {
    const key = `${account}-${poolAddress}`
    const state = get()
    return (
      state.riskRatios[key] || {
        riskRatio: '0',
        totalAssetsValue: '0',
        totalDebtValue: '0',
        baseAssetValue: '0',
        quoteAssetValue: '0',
        baseDebtValue: '0',
        quoteDebtValue: '0',
        baseAsset: '0',
        quoteAsset: '0',
        baseDebt: '0',
        quoteDebt: '0',
        borrowLimit: '0'
      }
    )
  },

  riskRatioCalculating: {},
  setRiskRatioCalculating: (account: string, poolAddress: string, calculating: boolean) => {
    const key = `${account}-${poolAddress}`
    set((state: MarginStore) => ({
      riskRatioCalculating: {
        ...state.riskRatioCalculating,
        [key]: calculating
      }
    }))
  },
  isRiskRatioCalculating: (account: string, poolAddress: string) => {
    const key = `${account}-${poolAddress}`
    const state = get()
    return state.riskRatioCalculating[key] || false
  },

  deepBookLiquidationRecords: [],
  setDeepBookLiquidationRecords: (deepBookLiquidationRecords: any[]) => set({ deepBookLiquidationRecords }),
  deepBookLiquidationRecordsLoading: true,
  setDeepBookLiquidationRecordsLoading: (deepBookLiquidationRecordsLoading: boolean) => set({ deepBookLiquidationRecordsLoading }),
  showDeepBookLiquidationRecordsNum: 0,
  setShowDeepBookLiquidationRecordsNum: (showDeepBookLiquidationRecordsNum: number) => set({ showDeepBookLiquidationRecordsNum }),

  marginSettleList: [],
  setMarginSettleList: (marginSettleList: any[]) => set({ marginSettleList }),

  marginSettleListLoading: false,
  setMarginSettleListLoading: (marginSettleListLoading: boolean) => set({ marginSettleListLoading }),

  marginClaimSettleLoading: false,
  setMarginClaimSettleLoading: (marginClaimSettleLoading: boolean) => set({ marginClaimSettleLoading }),

  // Locked Orders 请求状态（防止多个 hook 实例同时发起相同请求）
  lockedOrdersFetching: {},
  setLockedOrdersFetching: (requestKey: string, fetching: boolean) => {
    set((state: MarginStore) => ({
      lockedOrdersFetching: {
        ...state.lockedOrdersFetching,
        [requestKey]: fetching
      }
    }))
  },
  isLockedOrdersFetching: (requestKey: string) => {
    const state = get()
    return state.lockedOrdersFetching[requestKey] || false
  },

  marginTradeTypeByPool: {},
  getMarginTradeType: (poolAddress: string) => {
    const state = get()
    return state.marginTradeTypeByPool[poolAddress] || DeepBookPoolMarginTabs.Long
  },
  setMarginTradeType: (poolAddress: string, tradeType: DeepBookPoolMarginTabs) => {
    set((state: MarginStore) => ({
      marginTradeTypeByPool: {
        ...state.marginTradeTypeByPool,
        [poolAddress]: tradeType
      }
    }))
  },

  marginBalanceData: {},
  setMarginBalanceData: (
    account: string,
    poolAddress: string,
    managerId: string,
    data: {
      baseFreeBalance: string
      quoteFreeBalance: string
      baseLockedBalance: string
      quoteLockedBalance: string
      baseSettledBalance: string
      quoteSettledBalance: string
      baseTotalBalance: string
      quoteTotalBalance: string
      baseMarginBalanceUSD: string
      quoteMarginBalanceUSD: string
      baseLockedBalanceUSD: string
      quoteLockedBalanceUSD: string
      baseSettledBalanceUSD: string
      quoteSettledBalanceUSD: string
      baseTotalBalanceUSD: string
      quoteTotalBalanceUSD: string
      totalCollateralValue: string
      basePrice: number | null
      quotePrice: number | null
    }
  ) => {
    const state = get()
    // 如果没有提供 managerId，尝试获取当前所选的 ManagerId
    let finalManagerId = managerId
    if (!finalManagerId) {
      finalManagerId = state.getCurrentManagerIdForPool(account, poolAddress) || ''
    }
    // 如果仍然没有 managerId，使用旧的 key 格式（向后兼容）
    const key = finalManagerId ? `${account}-${poolAddress}-${finalManagerId}` : `${account}-${poolAddress}`
    set((state: MarginStore) => ({
      marginBalanceData: {
        ...state.marginBalanceData,
        [key]: data
      }
    }))
  },
  // 获取当前池子对应的 ManagerId（优先使用用户选择的，否则使用第一个匹配的）
  getCurrentManagerIdForPool: (account: string, poolAddress: string) => {
    const state = get()
    // 验证：确保 marginManagerByAccount 属于当前账户
    if (state.marginManagerByAccountOwner !== account) {
      return null
    }
    if (!state.marginManagerByAccount || state.marginManagerByAccount.length === 0) {
      return null
    }
    // 优先使用用户选择的 manager
    const selectedManagerInfo = state.getCurrentMarginManagerInfo(account)
    if (selectedManagerInfo?.margin_manager_id) {
      // 验证选择的 manager 是否属于当前池子
      const belongsToPool = (state.marginManagerByAccount as any[]).some(
        (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === poolAddress
      )
      if (belongsToPool) {
        return selectedManagerInfo.margin_manager_id
      }
    }
    // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找第一个
    const marginManager = (state.marginManagerByAccount as any[]).find((m: any) => m?.deepbook_pool_id === poolAddress)
    return marginManager?.margin_manager_id || null
  },
  getMarginBalanceData: (account: string, poolAddress: string, managerId?: string) => {
    const state = get()
    // 如果没有提供 managerId，尝试获取当前所选的 ManagerId
    let finalManagerId = managerId
    if (!finalManagerId) {
      finalManagerId = state.getCurrentManagerIdForPool(account, poolAddress) || undefined
    }
    // 如果提供了 managerId，使用包含 managerId 的 key
    // 否则使用旧的 key 格式（向后兼容）
    const key = finalManagerId ? `${account}-${poolAddress}-${finalManagerId}` : `${account}-${poolAddress}`
    return (
      state.marginBalanceData[key] || {
        baseFreeBalance: '0',
        quoteFreeBalance: '0',
        baseLockedBalance: '0',
        quoteLockedBalance: '0',
        baseSettledBalance: '0',
        quoteSettledBalance: '0',
        baseTotalBalance: '0',
        quoteTotalBalance: '0',
        baseMarginBalanceUSD: '0',
        quoteMarginBalanceUSD: '0',
        baseLockedBalanceUSD: '0',
        quoteLockedBalanceUSD: '0',
        baseSettledBalanceUSD: '0',
        quoteSettledBalanceUSD: '0',
        baseTotalBalanceUSD: '0',
        quoteTotalBalanceUSD: '0',
        totalCollateralValue: '0',
        basePrice: null,
        quotePrice: null
      }
    )
  }
})

const useMarginStore = create(
  persist(store, {
    name: 'useMarginStore',
    partialize: (state: MarginStore) => ({
      // 只持久化 margin manager 信息、启用状态和杠杆率配置，其他数据都是临时的
      currentMarginManagerInfoMap: state.currentMarginManagerInfoMap,
      marginTradingEnabled: state.marginTradingEnabled,
      marginLeverageRatioByPool: state.marginLeverageRatioByPool
    }),
    version: 1
  })
)

export default useMarginStore
