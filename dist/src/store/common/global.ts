import { TransactionMode } from '@/types'
import { PoolApiInfo } from '@/types/pool'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GlobalState {
  pageLoading: boolean
  setPageLoading: (value: boolean) => void

  mevProtect: boolean
  setMevProtect: (value: boolean) => void

  dlmmMevProtect: boolean
  setDlmmMevProtect: (value: boolean) => void

  // 滑点 UI 0.5%,  存 0.005
  slippage: string | number
  setSlippage: (value: string | number) => void
  liquiditySlippage: string | number
  setLiquiditySlippage: (value: string | number) => void

  deepBookSlippage: string | number
  setDeepBookSlippage: (value: string | number) => void
  mergeSwapSlippage: string | number
  setMergeSwapSlippage: (value: string | number) => void

  crossSwapSlippage: string | number
  setCrossSwapSlippage: (value: string | number) => void

  poolApiMap: Record<string, PoolApiInfo[]>
  setPoolApiMap: (key: string, poolAddress: PoolApiInfo[]) => void

  isShowProfileAssets: boolean
  setIsShowProfileAssets: (isOpen: boolean) => void

  isShowTradeChart: boolean
  setIsShowTradeChart: (isOpen: boolean) => void
  isShowTradeOrders: boolean
  setIsShowTradeOrders: (isOpen: boolean) => void
  settingOpen: boolean
  setSettingOpen: (value: boolean) => void
  transactionMode: TransactionMode
  setTransactionMode: (value: TransactionMode) => void
  maxCapForGas: string
  setMaxCapForGas: (value: string) => void
  customGasPrice: string
  setCustomGasPrice: (value: string) => void

  userTimeHasChang: boolean
  setUserTimeHasChang: (value: boolean) => void

  backUrl: string
  setBackUrl: (url: string) => void

  verifyInviteCodes: string
  setVerifyInviteCodes: (value: string) => void

  remindDlmmClaimRewardTips: boolean
  setRemindDlmmClaimRewardTips: (value: boolean) => void

  // 顶部加载进度条状态（全局）
  isTopProgressLoading: boolean
  setIsTopProgressLoading: (value: boolean) => void

  supportZapMap: Record<string, boolean>
  setIsSupportZap: (coinTypeA: string, coinTypeB: string, value: boolean) => void
  getIsSupportZap: (coinTypeA: string, coinTypeB: string) => boolean
}

const store: StateCreator<GlobalState> = (set, get) => ({
  supportZapMap: {},
  setIsSupportZap: (coinTypeA: string, coinTypeB: string, value: boolean) => {
    const supportZapMap = get().supportZapMap
    const key = `${fixCoinType(coinTypeA)}-${fixCoinType(coinTypeB)}`
    supportZapMap[key] = value
    set(() => ({
      supportZapMap: { ...supportZapMap }
    }))
  },
  getIsSupportZap: (coinTypeA: string, coinTypeB: string) => {
    const supportZapMap = get().supportZapMap
    const key = `${fixCoinType(coinTypeA)}-${fixCoinType(coinTypeB)}`
    const key2 = `${fixCoinType(coinTypeB)}-${fixCoinType(coinTypeA)}`

    return supportZapMap[key] || supportZapMap[key2] || false
  },
  dlmmMevProtect: true,
  setDlmmMevProtect: (value: boolean) => {
    set(() => ({
      dlmmMevProtect: value
    }))
  },

  remindDlmmClaimRewardTips: true,
  setRemindDlmmClaimRewardTips: (value: boolean) => {
    set(() => ({
      remindDlmmClaimRewardTips: value
    }))
  },
  verifyInviteCodes: '',
  setVerifyInviteCodes: (value: string) => {
    set(() => ({
      verifyInviteCodes: value
    }))
  },
  poolApiMap: {},
  pageLoading: true,
  setPageLoading: (value: boolean) => {
    set(() => ({
      pageLoading: value
    }))
  },
  backUrl: '',
  setBackUrl: (url: string) => {
    set(() => ({
      backUrl: url
    }))
  },

  mergeSwapSlippage: '0.01',
  setMergeSwapSlippage: (value: string | number) => {
    set(() => ({
      mergeSwapSlippage: value
    }))
  },
  mevProtect: true,
  setMevProtect: (value: boolean) => {
    set(() => ({
      mevProtect: value
    }))
  },
  slippage: 0.005,
  setSlippage: (value: string | number) => {
    set(() => ({
      slippage: value
    }))
  },
  liquiditySlippage: '0.01',
  setLiquiditySlippage: (value: string | number) => {
    set(() => ({
      liquiditySlippage: value
    }))
  },
  deepBookSlippage: '0.005',
  setDeepBookSlippage: (value: string | number) => {
    set(() => ({
      deepBookSlippage: value
    }))
  },
  crossSwapSlippage: '0.01',
  setCrossSwapSlippage: (value: string | number) => {
    set(() => ({
      crossSwapSlippage: value
    }))
  },
  setPoolApiMap: (key: string, poolApiList: PoolApiInfo[]) => {
    const poolApiMap = get().poolApiMap
    poolApiMap[key] = poolApiList
    set(() => ({
      poolApiMap: { ...poolApiMap }
    }))
  },
  isShowTradeChart: false,
  setIsShowTradeChart: (isOpen: boolean) => {
    set(() => ({
      isShowTradeChart: isOpen
    }))
  },
  isShowTradeOrders: false,
  setIsShowTradeOrders: (isOpen: boolean) => {
    set(() => ({
      isShowTradeOrders: isOpen
    }))
  },
  isShowProfileAssets: true,
  setIsShowProfileAssets: (isShow: boolean) => {
    set(() => ({
      isShowProfileAssets: isShow
    }))
  },
  settingOpen: false,
  setSettingOpen: (value: boolean) => {
    set(() => ({
      settingOpen: value
    }))
  },
  transactionMode: 'Default',
  setTransactionMode: (value: TransactionMode) => {
    set(() => ({
      transactionMode: value
    }))
  },
  maxCapForGas: '0.5',
  setMaxCapForGas: (value: string) => {
    set(() => ({
      maxCapForGas: value
    }))
  },
  customGasPrice: '1500',
  setCustomGasPrice: (value: string) => {
    set(() => ({
      customGasPrice: value
    }))
  },
  userTimeHasChang: false,
  setUserTimeHasChang: (value: boolean) => {
    set(() => ({
      userTimeHasChang: value
    }))
  },

  // 顶部加载进度条状态（全局）
  isTopProgressLoading: false,
  setIsTopProgressLoading: (value: boolean) => {
    set(() => ({
      isTopProgressLoading: value
    }))
  }
})

const useGlobalStore = create(
  persist(store, {
    name: 'useGlobalStore',
    partialize: state => {
      const {
        slippage,
        liquiditySlippage,
        deepBookSlippage,
        crossSwapSlippage,
        mevProtect,
        isShowTradeChart,
        transactionMode,
        maxCapForGas,
        customGasPrice,
        isShowProfileAssets,
        verifyInviteCodes,
        remindDlmmClaimRewardTips,
        dlmmMevProtect,
        supportZapMap
      } = state
      return {
        slippage,
        liquiditySlippage,
        deepBookSlippage,
        crossSwapSlippage,
        mevProtect,
        isShowTradeChart,
        transactionMode,
        maxCapForGas,
        customGasPrice,
        isShowProfileAssets,
        verifyInviteCodes,
        remindDlmmClaimRewardTips,
        dlmmMevProtect,
        supportZapMap
      }
    },
    version: 4
  })
)
export default useGlobalStore
