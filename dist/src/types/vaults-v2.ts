import { Token } from '@cetus/types'

export type VaultsV2ListItemProps = {
  apiInfo: VaultV2ApiInfo
  isShowPowered: boolean
  tableWidth?: string[]
  currentStatus: string
}
export type VaultV2ApiInfo = {
  tokenA: Token
  tokenB: Token
  displayTokenA: Token
  displayTokenB: Token
  category: string
  clmmPoolAddress: string
  depositRatio: string
  depositRatioDisplay: string
  feeDisplay: string
  hardCapUSD: string
  hardCapUsdDisplay: string
  isReverse: string
  lpTokenType: string
  tvlDisplay: string
  vaultId: string
  vaultsAprDisplay: string
  vaultsApyDisplay: string
  vaultsLstApyDisplay: string
  vaultsTotalApy: string
  vaultsTotalApyDisplay: string
  vaultsTvl: string
  vaultsTvlDisplay: string
  vaultsRewards: string[]
  isFrozen: boolean
  status: string
  migrate_target_vault?: string
  version?: string
}
export type VaultsV2ListProps = {
  dataList: VaultV2ApiInfo[]
  showSkeletonLoading: boolean
  isShowPowered: boolean
  showNoWallet?: boolean
}

export type VaultsV2ListItemType<T> = {
  openExpend: boolean
  onExpand: () => void
  apiInfo: VaultV2ApiInfo
  logo_url?: string
  currentAccount?: T
  jumpVaultsDetail: (vaultId: string) => void
  isShowPowered: boolean
  isShowAumLimit: boolean
  currentStatus: string
}

export type FilterVaultListOptions = {
  currentTab: string
  isYourHoldings: boolean
  selectCoinList: any[]
}

export type SortVaultListOptions = {
  sortRule: 'desc' | 'asc'
  sortType: 'apr' | 'tvl'
}

export type QueryVaultListOptions = FilterVaultListOptions & { sortOptions: SortVaultListOptions; status?: string; isIncentivizedOnly?: boolean }

export type VaultsBalance = {
  balance: string
  balanceFormat: string
  balanceDisplay: string
}

export type MigrateAmountResult = {
  ft_amount: string
  amount_a: string
  amount_b: string
  amount_a_display: string
  amount_b_display: string
  amount_value_a: string
  amount_value_b: string
}

export type MigrateSwapResult = {
  in_token: Token
  out_token: Token
  swap_in_amount: string
  swap_out_amount: string
  swap_in_amount_display: string
  swap_out_amount_display: string
}

export type MigrateWithdrawResult = {
  // 提取
  withdraw: MigrateAmountResult
  // 存入
  deposit: MigrateAmountResult
  // swap
  swap_results: MigrateSwapResult[]
  // 原始数据
  raw_data: any
}
