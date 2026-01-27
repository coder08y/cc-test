// =====================
// 📦 通用基础类型
// =====================

export type CoinDetail = {
  symbol: string
  name: string
  price: string
  decimals: string
  logo_url: string
}

// =====================
// 🎁 奖励相关类型
// =====================

// 静态奖励配置
export type RewardConfig = {
  bank: string
  rewardCoinType: string
  rate: string
  curRewardNum: number
  apr: number
  coinDetail: CoinDetail
  start_at: number
  isNewPool: boolean
}

// 动态奖励信息（带金额和展示）
export type RewardItem = RewardConfig & {
  rewardAmount: string
  rewardAmountDisplay: string
  rewardItemRate?: string
  rewardItemRateDisplay?: string
}

// =====================
// 💧 Farming 池信息类型
// =====================

export type VaultPool = {
  apr: string
  apy: string
  fee_rate: number
  coin_type_a: string
  coin_type_b: string
  coinADetail: CoinDetail
  coinBDetail: CoinDetail
  show_reverse: boolean
  id: string
}

// =====================
// 🏦 Vault API 信息类型
// =====================

export type VaultFarmingApiInfo = {
  poolId: string
  balance: number
  stakeCoinType: string
  active: number
  vaultPool: VaultPool
  coinDetail: CoinDetail
  rewardConfigs: RewardConfig[]
  isVaultsFarming: boolean
  isActiveVaultsFarming?: boolean
  rewardList: RewardItem[]
  // farmingPoolAmountA: string
  // farmingPoolAmountB: string
  coinTypeA: string
  coinTypeB: string
}

// =====================
// 🔐 Staked 仓位信息类型
// =====================

export type VaultStakedInfo = {
  poolId: string
  stakeObjectId: string
  stakedBalance: string
  stakedBalanceFormat: string
  stakedBalanceDisplay: string
  coinDetail: CoinDetail
  stakeCoinType: string
  rewardConfigs: RewardConfig[]
  ownerAddress: string
}

// =====================
// ✅ Vault Map 泛型
// =====================

export type VaultsMap<T> = Record<string, T>
