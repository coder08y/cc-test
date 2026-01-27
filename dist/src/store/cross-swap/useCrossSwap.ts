import { defaultLifiOptions, defaultMayanOptions } from '@/config/cross-swap/chain'
import { SelectCrossSwapOptions } from '@/types/cross_swap'
import { CrossSwapPlatform, CrossSwapQuote, CrossSwapRouter, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CrossSwapState {
  crossSwapOptions: Record<CrossSwapPlatform, SelectCrossSwapOptions>
  setCrossSwapOptions: (platform: CrossSwapPlatform, options: SelectCrossSwapOptions) => void

  chainTokenObj: Record<string, CrossSwapToken[]>
  chainTokenKeys: string[] // 新增：用于记录 key 顺序
  setChainTokenObj: (chainTokenObj: Record<string, CrossSwapToken[]>) => void

  fromCoinAmount: string
  setFromCoinAmount: (value: string) => void

  findRouterLoading: boolean
  setFindRouterLoading: (value: boolean) => void

  routers?: CrossSwapRouter
  setRouters: (routers?: CrossSwapRouter) => void
  quote?: CrossSwapQuote
  setQuote: (quote?: CrossSwapQuote) => void

  approveData?: {
    approveSymbol: string
    swapText: string
    step: 1 | 2
  }
  setApproveData: (approveData?: { approveSymbol: string; swapText: string; step: 1 | 2 }) => void
}

const store: StateCreator<CrossSwapState> = (set, get) => ({
  chainTokenObj: {},
  chainTokenKeys: [], // 新增
  crossSwapOptions: {
    [CrossSwapPlatform.MAYAN]: { ...defaultMayanOptions },
    [CrossSwapPlatform.LI_FI]: { ...defaultLifiOptions }
  },
  setCrossSwapOptions: (platform: CrossSwapPlatform, options: SelectCrossSwapOptions) => {
    const currentOptions = get().crossSwapOptions[platform] || {}

    set({
      crossSwapOptions: {
        ...get().crossSwapOptions,
        [platform]: { ...currentOptions, ...options }
      }
    })
  },
  setChainTokenObj: (newChainTokenObj: Record<string, CrossSwapToken[]>) => {
    const oldChainTokenObj = get().chainTokenObj
    const oldKeys = get().chainTokenKeys
    let updatedChainTokenObj = { ...oldChainTokenObj }
    let updatedKeys = [...oldKeys]

    Object.entries(newChainTokenObj).forEach(([key, value]) => {
      // 如果 key 已存在，先移除旧的顺序
      updatedKeys = updatedKeys.filter(k => k !== key)
      // 添加到末尾
      updatedKeys.push(key)
      // 更新数据
      updatedChainTokenObj[key] = value
    })

    // 如果超出3个，移除最早的key
    while (updatedKeys.length > 3) {
      const removeKey = updatedKeys.shift()
      if (removeKey !== undefined) {
        delete updatedChainTokenObj[removeKey]
      }
    }

    set({
      chainTokenObj: updatedChainTokenObj,
      chainTokenKeys: updatedKeys
    })
  },
  fromCoinAmount: '',
  setFromCoinAmount: (fromCoinAmount: string) => {
    set({ fromCoinAmount })
  },
  findRouterLoading: false,
  setFindRouterLoading: (value: boolean) => {
    set({ findRouterLoading: value })
  },
  routers: undefined,
  setRouters: (routers?: CrossSwapRouter) => {
    set({ routers })
  },
  quote: undefined,
  setQuote: (quote?: CrossSwapQuote) => {
    set({ quote })
  },
  approveData: undefined,
  setApproveData: (approveData?: { approveSymbol: string; swapText: string; step: 1 | 2 }) => {
    set({ approveData })
  }
})

const useCrossSwapStore = create(
  persist(store, {
    name: 'useCrossSwapStore',
    partialize: state => ({
      crossSwapOptions: state.crossSwapOptions
      // chainTokenObj/chainTokenKeys 不持久化
    })
  })
)

export default useCrossSwapStore
