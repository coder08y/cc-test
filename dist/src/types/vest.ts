import { PosBaseInfo } from './position'

export type ClmmVestRedeemPayloadParams = {
  clmmPoolId: string
  clmmPositionId: string
  vestCoinType: string
  period: number
  coinTypeA: string
  coinTypeB: string
}

export type FarmsVestRedeemPayloadParams = {
  clmmPoolId: string
  clmmPositionId: string
  period: number
  coinTypeA: string
  coinTypeB: string
  farmingPoolId: string
  farmPositionId: string
  vestCoinType: string
}

export type FarmRedeemGroupedParam = {
  clmmPoolId: string
  clmmPositionId: string
  period: number[] // 多个可领取周期
  coinTypeA: string
  coinTypeB: string
  farmPositionId: string
  farmingPoolId: string
  liquidity?: string
}

export type VaultVestRedeemPayloadParams = {
  vaultId: string
  vestingNftId: string
  clmmPoolId: string
  vestCoinType: string
  period: number
  coinTypeA: string
  coinTypeB: string
}

export type BurnVestRedeemPayloadParams = {
  clmmPoolId: string
  clmmPositionId: string
  period: number
  coinTypeA: string
  coinTypeB: string
  posId: string
}

export type VestingPeriod = {
  period: number
  release_time?: string // 原始字段存在，可能不在后面的 globalVestingPeriods 里
  redeemed_amount?: string // 同 release_time
  percentage: number
  redeemedAmount?: string // 驼峰版本字段（后面 globalVestingPeriods 使用）
}

export type PositionInfo = {
  id: { id: string }
  size: string
}

export type ClmmVestInfo = {
  id: string
  balance: string
  global_vesting_periods: VestingPeriod[]
  total_value: string
  total_cetus_amount: string
  redeemed_amount: string
  start_time: string
  type: string
  positions: PositionInfo
  globalVestingPeriods: VestingPeriod[]
}

export type PeriodDetail = {
  cetusAmount: string
  isRedeemed: boolean
  period: string
  releaseTime: string
  canClaim: boolean
  status: string
}

export type VestingPosition = {
  positionId: string
  cetusAmount: string
  redeemedAmount: string
  isPaused: boolean
  impairedA: string
  impairedB: string
  periodDetails: PeriodDetail[]
  coinTypeA: string
  coinTypeB: string
  releasedAmount: string
  availableAmount: string
  releasedAmountRatio: number
}

export type ClmmCompensationItem = VestingPosition & PosBaseInfo
