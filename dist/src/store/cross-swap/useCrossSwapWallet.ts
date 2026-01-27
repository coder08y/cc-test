import { ChainAddressType, ChainAddresses, CrossWalletModalData, SettingToAddressModalData } from '@/types/cross_swap'
import { generateBalanceCacheKey } from '@/utils/cross-swap'
import { CrossSwapToken, CrossSwapTokenBalance } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CrossSwapWalletState {
  // 多链地址管理
  fromAddressObj: ChainAddresses
  toAddressObj: ChainAddresses

  /**
   * key: accountAddress
   * value: key: chainId-tokenAddress
   * value: CrossSwapTokenBalance
   */
  balanceCache: Record<string, Record<string, CrossSwapTokenBalance>>

  switchChainLoading: boolean
  setSwitchChainLoading: (switchChainLoading: boolean) => void

  // 地址管理方法
  setFromAddressObj: (chainType: ChainType, address: ChainAddressType) => void
  setToAddressObj: (chainType: ChainType, address: ChainAddressType) => void

  // 余额管理方法
  setTokenBalances: (tokenBalanceList: CrossSwapTokenBalance[], accountAddress: string) => void
  clearTokenBalances: (tokenAddress: string, accountAddress: string, chainId: number) => void
  getTokenBalance: (token: CrossSwapToken, accountAddress?: string) => CrossSwapTokenBalance | undefined

  // 其他状态
  isOpenBtcWalletModal: boolean
  setIsOpenBtcWalletModal: (isOpenBtcWalletModal: boolean) => void

  // 查看钱包地址弹窗
  crossWalletModalData?: CrossWalletModalData
  setCrossWalletModalData: (crossWalletModalData?: CrossWalletModalData) => void

  // 设置目标地址弹窗数据
  settingToAddressModalData?: SettingToAddressModalData
  setSettingToAddressModalData: (settingToAddressModalData?: SettingToAddressModalData) => void
}

const store: StateCreator<CrossSwapWalletState> = (set, get) => ({
  fromAddressObj: {
    evmAddress: {},
    svmAddress: {},
    mvmAddress: {},
    utxoAddress: {}
  },
  toAddressObj: {
    evmAddress: {},
    svmAddress: {},
    mvmAddress: {},
    utxoAddress: {}
  },

  balanceCache: {},

  switchChainLoading: false,
  setSwitchChainLoading: (switchChainLoading: boolean) => {
    set({ switchChainLoading })
  },

  // 地址管理方法
  setFromAddressObj: (chainType: ChainType, address: ChainAddressType) => {
    const { fromAddressObj } = get()
    const newFromAddressObj = { ...fromAddressObj }
    switch (chainType) {
      case ChainType.EVM:
        newFromAddressObj.evmAddress = { ...newFromAddressObj.evmAddress, ...address }
        break
      case ChainType.SVM:
        newFromAddressObj.svmAddress = { ...newFromAddressObj.svmAddress, ...address }
        break
      case ChainType.MVM:
        newFromAddressObj.mvmAddress = { ...newFromAddressObj.mvmAddress, ...address }
        break
      case ChainType.UTXO:
        newFromAddressObj.utxoAddress = { ...newFromAddressObj.utxoAddress, ...address }
        break
    }
    set({ fromAddressObj: newFromAddressObj })
  },

  setToAddressObj: (chainType: ChainType, address: ChainAddressType) => {
    const { toAddressObj } = get()
    const newToAddressObj = { ...toAddressObj }
    switch (chainType) {
      case ChainType.EVM:
        newToAddressObj.evmAddress = { ...newToAddressObj.evmAddress, ...address }
        break
      case ChainType.SVM:
        newToAddressObj.svmAddress = { ...newToAddressObj.svmAddress, ...address }
        break
      case ChainType.MVM:
        newToAddressObj.mvmAddress = { ...newToAddressObj.mvmAddress, ...address }
        break
      case ChainType.UTXO:
        newToAddressObj.utxoAddress = { ...newToAddressObj.utxoAddress, ...address }
        break
    }
    set({ toAddressObj: newToAddressObj })
  },

  setTokenBalances: (tokenBalances: CrossSwapTokenBalance[], accountAddress: string) => {
    const newBalanceMap = { ...get().balanceCache[accountAddress] }
    tokenBalances.forEach(tokenBalance => {
      const cacheKey = generateBalanceCacheKey(tokenBalance.chain_id, tokenBalance.address)
      newBalanceMap[cacheKey] = tokenBalance
    })
    set(state => ({
      balanceCache: {
        ...state.balanceCache,
        [accountAddress]: newBalanceMap
      }
    }))
  },

  clearTokenBalances: (tokenAddress: string, accountAddress: string, chainId: number) => {
    const cacheKey = generateBalanceCacheKey(chainId, tokenAddress)
    const { balanceCache } = get()
    const accountCache = balanceCache[accountAddress]
    if (accountCache) {
      delete accountCache[cacheKey]
    }

    set(state => ({
      balanceCache: {
        ...state.balanceCache,
        [accountAddress]: accountCache
      }
    }))
  },

  getTokenBalance: (token: CrossSwapToken, accountAddress?: string) => {
    if (!accountAddress) return undefined
    const state = get()
    const accountCache = state.balanceCache[accountAddress]
    if (!accountCache) return undefined

    const cacheKey = generateBalanceCacheKey(token.chain_id, token.address)

    const cacheItem = accountCache[cacheKey]

    return cacheItem
  },

  isOpenBtcWalletModal: false,
  setIsOpenBtcWalletModal: (isOpenBtcWalletModal: boolean) => {
    set({ isOpenBtcWalletModal })
  },

  crossWalletModalData: undefined,
  setCrossWalletModalData: (crossWalletModalData?: CrossWalletModalData) => {
    set({ crossWalletModalData })
  },

  settingToAddressModalData: undefined,
  setSettingToAddressModalData: (settingToAddressModalData?: SettingToAddressModalData) => {
    set({ settingToAddressModalData })
  }
})

const useCrossSwapWalletStore = create(
  persist(store, {
    name: 'useCrossSwapWalletStore',
    version: 2,
    partialize: state => ({
      fromAddressObj: state.fromAddressObj,
      toAddressObj: state.toAddressObj
    })
  })
)

export default useCrossSwapWalletStore
