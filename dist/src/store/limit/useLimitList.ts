import { LimitOrderInfo } from '@/types/limit'
import { StateCreator, create } from 'zustand'

interface LimitState {
  // 我的订单
  orderListLoading: boolean
  setOrderListLoading: (isLoading: boolean) => void
  myOrderList: LimitOrderInfo[]
  setMyOrderList: (list: LimitOrderInfo[]) => void
  historyOrderList: LimitOrderInfo[]
  setHistoryOrderList: (list: LimitOrderInfo[]) => void
}

const store: StateCreator<LimitState> = (set, get) => ({
  orderListLoading: false,
  myOrderList: [],
  setOrderListLoading: (isLoading: boolean) => {
    set(() => ({
      orderListLoading: isLoading
    }))
  },
  historyOrderList: [],
  setHistoryOrderList: (list: LimitOrderInfo[]) => {
    set(() => ({
      historyOrderList: list
    }))
  },
  setMyOrderList: (list: LimitOrderInfo[]) => {
    set(() => ({
      myOrderList: list
    }))
  }
})

const useLimitListStore = create(store)
export default useLimitListStore
