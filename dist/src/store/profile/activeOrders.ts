import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ActiveOrdersState {
  /**
   * 限价订单数量
   */
  limitOrdersNum: number | string
  setLimitOrdersNum: (num: number | string) => void
  /**
   * DCA订单数量
   */
  dcaOrdersNum: number | string
  setDcaOrdersNum: (num: number | string) => void
  /**
   * 限价订单索引器
   */
  limitUserIndexerObj: Record<string, string>
  setLimitUserIndexerObj: (owner: string, indexer: string) => void

  /**
   * DCA 订单索引器
   */
  dcaUserIndexerObj: Record<string, string>
  setDcaUserIndexerObj: (owner: string, indexer: string) => void

  /**
   * DCA 订单列表加载状态
   */
  dcaOrderListLoading: boolean
  setDcaOrderListLoading: (loading: boolean) => void

  /**
   * DCA 订单列表
   */
  dcaActiveOrderList: any[]
  setDcaActiveOrderList: (orderList: any[]) => void

  /**
   * DCA 历史订单列表
   */
  dcaPastOrderList: any[]
  setDcaPastOrderList: (orderList: any[]) => void
  /**
   * 是否自动刷新
   */
  isAutoRefresh: boolean

  /**
   * 自动刷新间隔
   */
  autoRefreshCount: number
  setAutoRefreshCount: (isAutoRefresh: boolean) => void
  resetAutoRefreshCount: (isAutoRefresh: boolean) => void
}

const store: StateCreator<ActiveOrdersState> = (set, get) => ({
  limitOrdersNum: '',
  setLimitOrdersNum: (num: number | string) => {
    set(() => ({
      limitOrdersNum: num
    }))
  },
  dcaOrdersNum: '',
  setDcaOrdersNum: (num: number | string) => {
    set(() => ({
      dcaOrdersNum: num
    }))
  },
  limitUserIndexerObj: {},
  setLimitUserIndexerObj: (owner: string, indexer: string) => {
    set(() => ({
      limitUserIndexerObj: { ...get().limitUserIndexerObj, [owner]: indexer }
    }))
  },
  dcaUserIndexerObj: {},
  setDcaUserIndexerObj: (owner: string, indexer: string) => {
    set(() => ({
      dcaUserIndexerObj: { ...get().dcaUserIndexerObj, [owner]: indexer }
    }))
  },
  dcaActiveOrderList: [],
  setDcaActiveOrderList: (orderList: any[]) => {
    set(() => ({
      dcaActiveOrderList: orderList
    }))
  },
  dcaPastOrderList: [],
  setDcaPastOrderList: (orderList: any[]) => {
    set(() => ({
      dcaPastOrderList: orderList
    }))
  },
  dcaOrderListLoading: false,
  setDcaOrderListLoading: (loading: boolean) => {
    set(() => ({
      dcaOrderListLoading: loading
    }))
  },
  autoRefreshCount: 0,
  isAutoRefresh: false,
  setAutoRefreshCount: (isAutoRefresh: boolean) => {
    set(() => ({
      autoRefreshCount: get().autoRefreshCount + 1,
      isAutoRefresh
    }))
  },
  resetAutoRefreshCount: (isAutoRefresh: boolean) => {
    set(() => ({
      autoRefreshCount: 0,
      isAutoRefresh
    }))
  }
})

const useActiveOrdersStore = create(
  persist(store, {
    name: 'useActiveOrdersStore',
    partialize: state => {
      const { limitUserIndexerObj, dcaUserIndexerObj } = state
      return {
        limitUserIndexerObj,
        dcaUserIndexerObj
      }
    }
  })
)
export default useActiveOrdersStore
