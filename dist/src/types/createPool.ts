import { Token } from '@cetus/types'
import { BinLiquidityInfo, StrategyType } from '@cetusprotocol/dlmm-sdk'
import { PrePosAddRes } from './position'

export type CreatePoolBaseInfo = {
  tokenA: Token
  tokenB: Token
  needReverse: boolean
  realTokenA: Token
  realTokenB: Token
}

export type preCreateRes = PrePosAddRes & {
  currentSqrtPrice: string
  fixAmountA: boolean
  lowerTick: number
  upperTick: number
  tickSpacing: number
  coinTypeA: string
  coinTypeB: string
}

export type PreCreateDLMMRes = {
  active_id: number
  lower_bin_id?: number
  upper_bin_id?: number
  bin_step: number
  bin_infos?: BinLiquidityInfo
  tokenA: Token
  tokenB: Token
  strategy_type?: StrategyType
  use_bin_infos?: boolean
  base_factor: number
}
