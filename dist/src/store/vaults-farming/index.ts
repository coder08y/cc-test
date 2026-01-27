import { RewardItem, VaultFarmingApiInfo, VaultStakedInfo } from '@/types/vaults-farming'
import { StateCreator, create } from 'zustand'

type CurrentVaultFarm = {
  // 查询质押loading
  vaultsFarmingStakeLoading: boolean
  setVaultsFarmingStakeLoading: (status: boolean) => void
  // 质押信息
  vaultsFarmingStaked: Record<string, VaultStakedInfo>
  setVaultsFarmingStaked: (data: Record<string, VaultStakedInfo>) => void
  // 查询奖励loading
  vaultsFarmingRewardsLoading: boolean
  setVaultsFarmingRewardsLoading: (status: boolean) => void
  // 奖励信息
  vaultsFarmingRewards: Record<string, RewardItem[]>
  setVaultsFarmingRewards: (reward: Record<string, RewardItem[]>) => void
  // api信息
  vaultsFarmObj: Record<string, VaultFarmingApiInfo>
  setVaultsFarmObj: (data: Record<string, VaultFarmingApiInfo>) => void
  // 是否自动收割奖励
  autoClaimFarmingReward: boolean
  setAutoCliamFarmingReward: (status: boolean) => void
  // 清除用户相关vaults farming信息
  clearVaultsFarmingInfo: () => void
  // 是否自动质押到farming
  autoClaimStakeFarming: boolean
  setAutoClaimStakeFarming: (status: boolean) => void
}

const store: StateCreator<CurrentVaultFarm> = (set, get) => ({
  vaultsFarmingStaked: {} as Record<string, VaultStakedInfo>,
  setVaultsFarmingStaked: (data: Record<string, VaultStakedInfo>) => {
    const prev = get().vaultsFarmingStaked || {}
    const merged = { ...prev, ...data }
    set({ vaultsFarmingStaked: merged })
  },
  vaultsFarmingStakeLoading: true,
  setVaultsFarmingStakeLoading: (status: boolean) => set({ vaultsFarmingStakeLoading: status }),

  vaultsFarmingRewards: {} as Record<string, RewardItem[]>,
  setVaultsFarmingRewards: (data: Record<string, RewardItem[]>) => {
    const prev = get().vaultsFarmingRewards || {}
    const merged = { ...prev, ...data }
    set({ vaultsFarmingRewards: merged })
  },

  vaultsFarmingRewardsLoading: true,
  setVaultsFarmingRewardsLoading: (status: boolean) => set({ vaultsFarmingRewardsLoading: status }),

  vaultsFarmObj: {} as Record<string, VaultFarmingApiInfo>,
  setVaultsFarmObj: (data: Record<string, VaultFarmingApiInfo>) => set({ vaultsFarmObj: data }),

  autoClaimFarmingReward: true,
  setAutoCliamFarmingReward: (status: boolean) => set({ autoClaimFarmingReward: status }),

  autoClaimStakeFarming: true,
  setAutoClaimStakeFarming: (status: boolean) => set({ autoClaimStakeFarming: status }),

  clearVaultsFarmingInfo: () => set({ vaultsFarmingStaked: {}, vaultsFarmingRewards: {} })
})

const useVaultsFarmingStore = create(store)

export default useVaultsFarmingStore
