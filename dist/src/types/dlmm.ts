import { Token } from '@cetus/types'
import {
  BinAmount,
  BinLiquidityInfo,
  BinManager,
  PoolPermissions,
  PositionManager,
  RewardManager,
  StrategyType,
  VariableParameters
} from '@cetusprotocol/dlmm-sdk'

type CoinPairType = {
  coinTypeA: string
  coinTypeB: string
}

export type DlmmPosBaseInfo = {
  dlmmPool: string
  index: string
  lowerBinId: number
  upperBinId: number
  id: string
  posType: 'dlmm'
  tokenName: string
  tokenA: Token
  tokenB: Token
  displayTokenA: Token
  displayTokenB: Token
  isReverse: boolean
  liquidityShares: string[]
  totalShareLiquidity: string
  version: string
} & CoinPairType

export type DlmmPosPoolsRelated = {
  currentPrice: string
  currentPriceReverse: string
  minPrice: string
  minPriceResever: string
  maxPrice: string
  maxPriceResever: string
  minPriceOrigin: string
  maxPriceOrigin: string
  minPriceBinId: number
  maxPriceBinId: number
  fee: string
  displayFee: string
  binStep: number
  currentTickIndex: number
  currentStatus: string
  haveZap: boolean
  active_bin?: BinAmount
}

export type DlmmPoolData = {
  poolId: string
  id: string
  bin_step: number
  coin_type_a: string
  coin_type_b: string
  pool_type: string
  index: number
  bin_manager: BinManager
  variable_parameters: VariableParameters
  active_id: number
  permissions: PoolPermissions
  balance_a: string
  balance_b: string
  base_fee_rate: string
  protocol_fee_a: string
  protocol_fee_b: string
  url: string
  reward_manager: RewardManager
  position_manager: PositionManager
  currentPrice: string
  currentPriceReverse: string
  coinAmountA: string
  coinAmountB: string
  coinTypeA: string
  coinTypeB: string
  poolAddress: string
  poolType: string
  binStep: number
  fee_protocol_coin_a: string
  fee_protocol_coin_b: string
  fee_rate: string
  active_bin: BinAmount
}

export type DlmmPosLiquidity = {
  coinAmountA: string
  coinAmountB: string
  displayCoinAmountA: string
  displayCoinAmountB: string
  displayPercentA: string
  displayPercentB: string
  binInfos: BinLiquidityInfo
  haveFarming?: boolean
}

export type DlmmPosAddLiquidityParams = {
  dlmmPool: string
  binInfos: BinLiquidityInfo
  positionId: string
  activeId: number
  collectFee: boolean
  rewardCoins: string[]
  strategy: StrategyType
  binStep: number
} & CoinPairType

export type DlmmPosRemoveLiquidityParams = {
  dlmmPool: string
  positionId: string
  binInfos: BinLiquidityInfo
  slippage: number
  rewardCoins: string[]
  coinTypeA: string
  coinTypeB: string
  activeId: number
  binStep: number
  slideValue: number
}

export type DlmmPreAddParams = {
  activeId: number
  binStep: number
  lowerBinId: number
  upperBinId: number
  amount: string
  fromToken: Token
  toToken: Token
  strategy: StrategyType
  fixAmountA: boolean
  isReverse: boolean
  isAutoFill: boolean
  otherAmount: string
}

export type DlmmPreRemoveParams = {
  bins: BinAmount[]
  activeId: number
  fixAmountA: boolean
  coinAmount: string
  isOnlyA?: boolean
  tokenA: Token
  tokenB: Token
  isReverse: boolean
}

/**
 * toDo: api接口未确定，当前只按初步结构定义，具体字段名需根据最终api调整
 * */
export type DlmmApiPoolGroupItem = {
  tvl: string
  vol: string
  fees: string
  totalApr: string
  id: string
  list: DlmmPoolData[] // 暂时用合约池子信息模拟，所以用的合约的定义
}

/**
 * dlmm 图表列表对象
 * */
export type ChartBinItem = BinAmount & {
  price: string
  totalLiquidity?: string
  totalAmountA?: string
  totalAmountB?: string
  newBins?: BinAmount & { [key: string]: any }
  type?: string

  [key: string]: any
}

export type CurrentBinChartData = {
  list: ChartBinItem[]
  max: number
  toLarge?: boolean
}

export type MaxBinRangeChartData = {
  list: ChartBinItem[]
  max: number
  active: ChartBinItem
}

export type DlmmPosClosePositionParams = {
  dlmmPool: string
  positionId: string
  rewardCoins: string[]
} & CoinPairType

export type CollectDlmmRewardPayloadParams = {} & DlmmPosClosePositionParams
export type CollectDlmmRewardAndFeeParams = {} & DlmmPosClosePositionParams

export type GetPositionBaseListOptions = { clmmPool?: string; useInVest?: boolean; fetchType?: 'all' | 'clmm' | 'dlmm'; isFarmsPage?: boolean }

export type RewardCoinItem = { currentEmissionPerSecond: string; coinType: string }
export type BinsRewardData = {
  rewardCoin: RewardCoinItem[]
  bins: BinsRewardItem[]
}

export type BinsRewardItem = {
  binId: number
  value: string[]
}

export type GetPositionDailyEarningsOptions = {
  position_id: string
  current_pool_tvl: string
}

export type PositionDailyEarnings = {
  apr: string
  aprDisplay: string
  totalDailyExpansionFactorUSD: string
  dailyEarnUSDDisplay: string
  originResult: string
}

export enum BothAndZapTabAction {
  useBoth = 'Default',
  zapIn = 'Zap In'
}

export const zapInTabList = [
  { label: BothAndZapTabAction.useBoth, action: BothAndZapTabAction.useBoth },
  { label: BothAndZapTabAction.zapIn, action: BothAndZapTabAction.zapIn }
]
