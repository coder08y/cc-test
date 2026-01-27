import { Token } from '@cetus/types'
import { create } from 'zustand'

interface ProModeStoreState {
  // Pro 模式是否激活
  isActive: boolean

  // 当前页面类型
  currentPage: 'swap' | 'limit' | 'dca' | undefined

  // 当前交易对
  tokenA: Token | undefined
  tokenB: Token | undefined

  // 回调函数
  onTokenSelect: ((item: any) => void) | undefined
  onToggleDirect: (() => void) | undefined

  // 其他 Pro 模式状态
  isChangeDirect: boolean
  whiteTokenList: any[]
  isProMode: boolean

  // 同步页面数据的方法
  syncPageData: (data: {
    page: 'swap' | 'limit' | 'dca'
    tokenA: Token | undefined
    tokenB: Token | undefined
    onTokenSelect: ((item: any) => void) | undefined
    onToggleDirect: (() => void) | undefined
    isChangeDirect?: boolean
    whiteTokenList?: any[]
    isProMode?: boolean
  }) => void

  // 重置方法
  reset: () => void
}

const useProModeStore = create<ProModeStoreState>(set => ({
  isActive: false,
  currentPage: undefined,
  tokenA: undefined,
  tokenB: undefined,
  onTokenSelect: undefined,
  onToggleDirect: undefined,
  isChangeDirect: false,
  whiteTokenList: [],
  isProMode: false,

  syncPageData: data => {
    const { page, tokenA, tokenB, onTokenSelect, onToggleDirect, isChangeDirect, whiteTokenList, isProMode } = data
    set({
      isActive: true,
      currentPage: page,
      tokenA,
      tokenB,
      onTokenSelect,
      onToggleDirect,
      isChangeDirect: isChangeDirect ?? false,
      whiteTokenList: whiteTokenList ?? [],
      isProMode: isProMode ?? false
    })
  },

  reset: () =>
    set({
      isActive: false,
      currentPage: undefined,
      tokenA: undefined,
      tokenB: undefined,
      onTokenSelect: undefined,
      onToggleDirect: undefined,
      isChangeDirect: false,
      whiteTokenList: [],
      isProMode: false
    })
}))

export default useProModeStore
