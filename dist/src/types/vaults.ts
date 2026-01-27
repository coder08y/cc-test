import { BalanceInfo, Token } from '@cetus/types'
import { Vault } from '@cetusprotocol/vaults-sdk'
import { PoolApiInfo } from './pool'

export type VaultStatItem = {
  vaultsApy: string
  vaultsApyDisplay: string
  vaultsTotalApy: string
  vaultsTotalApyDisplay: string
  vaultsLstApy: string
  vaultsLstApyDisplay: string
  clmmPoolAddress: string
  vaultsId: string
  vaultsTvl: string
  vaultsTvlDisplay: string
  amountPerLpA: string
  amountPerLpB: string
  [key: string]: unknown
  vaultsApr: string
  vaultsAprDisplay: string
  category: string
}

export type VaultBaseInfo = PoolApiInfo & {
  vaultsRewards: string[]
}

export type VaultApiInfo = VaultBaseInfo & VaultStatItem

export type VaultSortRule = 'desc' | 'asc'
export type VaultSortType = 'apr' | 'tvl'

export type QueryVaultListOptions = {
  sortRule: VaultSortRule
  sortType: VaultSortType
}

export type AssetActionType = 'both' | string

export type VaultsAddModelData = {
  feeTier: string
  displayTokenA: Token
  displayTokenB: Token
  displayAmountA: string
  displayAmountB: string
  totalAmountValue: string
  sharePool: string
  lpAmountLimit: string
  lpDecimals?: string
  category: string
  binStep?: string
  isDlmm?: boolean
}

export type VaultCoinAmounts = {
  coinAmountA: string
  coinAmountB: string
  displayCoinA: string
  displayCoinB: string
}

export type ContractVaultInfo = {
  fetchVaultInfoFromContract: (vaults_id: string, forceRefresh?: boolean) => Promise<void>
  fetchClmmPoolFromContract: (vaults_id: string, forceRefresh?: boolean) => Promise<void>
  contractVault?: Vault
  lpTokenInfo?: Token
  balanceInfo?: BalanceInfo
  sharePoolRate: string
  holdCoinAmounts: VaultCoinAmounts
  totalValue?: string
  maxPrice?: string
  currPrice?: string
  minPrice?: string
  vaultCoinAmounts: VaultCoinAmounts
  vaultsCoinPercent?: {
    percentA: string
    percentB: string
  }
  vaultsCoinAValue: string
  vaultsCoinBValue: string
  holdCoinAValue: string
  holdCoinBValue: string
  calculateCoinAmounts?: (liquidity: string) => VaultCoinAmounts
  fromTokenLock?: boolean
  toTokenLock?: boolean
  fetchVaultBalance?: (walletAddress: string, vaultsId: string, lpDecimals: string) => Promise<void>
  vaultTvl: string
  isBalanceLoading?: boolean
}
