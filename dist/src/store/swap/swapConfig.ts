import { AggregatorProvider, RfqConfigs } from '@/types/swap'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SwapConfigState {
  providersSwitchStates: Partial<Record<AggregatorProvider, boolean>>
  setProvidersSwitchStates: (provider: Partial<Record<AggregatorProvider, boolean>>) => void
  supportOrderSplit: boolean
  setSupportOrderSplit: (value: boolean) => void

  // RFQ 开关是否打开（用户选择）
  isOpenRfqSwitch: boolean
  setIsOpenRfqSwitch: (value: boolean) => void

  // RFQ 配置
  rfqConfigs?: RfqConfigs
  setRfqConfigs: (value: RfqConfigs) => void
}

const store: StateCreator<SwapConfigState> = (set, get) => ({
  providersSwitchStates: {
    [AggregatorProvider.CETUS]: true
  },
  setProvidersSwitchStates: (provider: Partial<Record<AggregatorProvider, boolean>>) => {
    const providersSwitchStates = get().providersSwitchStates
    set(() => ({
      providersSwitchStates: { ...providersSwitchStates, ...provider }
    }))
  },
  supportOrderSplit: true,
  setSupportOrderSplit: (value: boolean) => {
    set(() => ({
      supportOrderSplit: value
    }))
  },
  isOpenRfqSwitch: true,
  setIsOpenRfqSwitch: (value: boolean) => {
    set(() => ({
      isOpenRfqSwitch: value
    }))
  },
  rfqConfigs: undefined,
  setRfqConfigs: (value: RfqConfigs) => {
    set(() => ({
      rfqConfigs: value
    }))
  }
})

const useSwapConfigStore = create(persist(store, { name: 'useSwapConfigStore' }))
export default useSwapConfigStore
