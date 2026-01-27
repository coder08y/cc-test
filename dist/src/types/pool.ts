import { Token } from '@cetus/types'
import { TokensMap } from './clmm'

export type FilterItem = {
  label: string
  value: string
}
type MiningRewardItem = {
  coinType: string
  emissionsEveryDay: string
}

type MiningAprItem = {
  coinType: string
  apr: string
  aprDisplay: string
  symbol?: string
}

type FarmsRewarderItem = {
  coinType: string
  emissionsEveryDay: string
}

export type DLMMPoolApiInfo = PoolApiInfo & {
  poolId: string
  id: string
  binStep: string
  createTimestamp: number
  tvl?: string
}

export type PoolApiInfo = {
  poolAddress?: string
  name: string
  isReverse: boolean
  tokenA: Token & { coinType: string }
  tokenB: Token & { coinType: string }
  displayTokenA?: Token & { coinType: string }
  displayTokenB?: Token & { coinType: string }
  haveMining: boolean
  miningRewardList: MiningRewardItem[] | null
  miningAprList: MiningAprItem[] | null
  haveFarming: boolean
  farmsRewarderList: FarmsRewarderItem[] | null
  farmsApr: string
  farmingAprDisplay: string
  feeApr: string
  feeAprDisplay: string
  miningAprTotal: string
  feeAndMiningAprDisplay: string
  totalAprDisplay: string
  fee: string
  feeRate: string
  feeDisplay: string
  tvlDisplay: string
  volume24Display: string
  fees24Display: string
  isVaults: boolean
  // tickSpacing: string
  isLocalData?: boolean
  farmsStatedTvl?: string
  farmsStatedTvlDisplay?: string
  feeAndFarmsApr?: string
  feeAndFarmsAprDisplay?: string
  farmsEffectiveTickLower?: number
  farmsEffectiveTickUpper?: number
  displayFarmsEffectMinPrice?: string
  displayFarmsEffectMaxPrice?: string
  farmsPoolAddress?: string
  haveZap?: boolean
  [key: string]: unknown
  vaultCategory: string
  vaultId: string
}

export type PoolContractInfo = {
  coinAmountA: string
  coinAmountB: string
  coinTypeA: string
  coinTypeB: string
  current_sqrt_price: string
  current_tick_index: number
  fee_growth_global_a: string
  fee_growth_global_b: string
  fee_protocol_coin_a: string
  fee_protocol_coin_b: string
  fee_rate: string
  index: number
  is_pause: boolean
  liquidity: string
  name: string
  poolAddress: string
  poolType: string
  position_manager: {
    positions_handle: string
    size: number
  }
  rewarder_infos: {
    coinAddress: string
    emissionsEveryDay: number
    emissions_per_second: string
    growth_global: string
  }[]
  rewarder_last_updated_time: string
  tickSpacing: number
  ticks_handle: string
  uri: string
  [key: string]: unknown
}

export type GetRecommendRangesListParams = {
  poolAddress: string
  currentTick: number
  tickSpacing: number
  farmsEffectTickLower?: number
  farmsEffectTickUpper?: number
  recommendRangesInfo: RecommendRangesType | null
}

export type RecommendRangesType = {
  type: string
  ranges: object
  dateTypeRanges: any
}
export type RecommendRange = {
  key: string
  lower: number
  upper: number
  sort: number
}

export type PoolPercent = TokensMap
