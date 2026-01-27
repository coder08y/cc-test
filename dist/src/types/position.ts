import { Token } from '@cetus/types'
import { PositionVesting } from '@cetusprotocol/sui-clmm-sdk'

//TODO 临时控制变量，后期需删除，是否展示新版apr ui部分
export const showNewVersionApr = true

export type PosToken = {
  isReverse: boolean
  tokenA: Token
  tokenB: Token
  displayTokenA: Token
  displayTokenB: Token
}

export type PosBaseInfo = PosToken & {
  clmmPool: string
  posId: string
  id: string
  liquidity: string
  index: string | number
  coinTypeA: string
  coinTypeB: string
  lowerTick: number
  upperTick: number
  owner: string
  posType: 'clmm' | 'farms' | 'burn'
  tokenName: string
  version: string
  farmsPool?: string
  isFrozen?: boolean
  vestData?: PositionVesting
}

export type PosPoolsRelated = {
  currentPrice: string
  currentPriceReverse: string
  minPrice: string
  minPriceResever: string
  maxPrice: string
  maxPriceResever: string
  minPriceOrigin: string
  maxPriceOrigin: string
  minPriceRaw: string
  maxPriceRaw: string
  currentPriceOrigin: string
  currentStatus: string
  fee: string
  displayFee: string
  tickSpacing: number
  currentTickIndex: number
  curSqrtPrice: string
  liquidity: string
  lowerTick: string
  upperTick: string

  contractCurrentPrice: string
  contractCurrentPriceReverse: string
  contractMinPrice: string
  contractMinPriceReverse: string
  contractMaxPrice: string
  contractMaxPriceReverse: string
}

export type PosLiquidity = {
  coinAmountA: string
  coinAmountB: string
  displayCoinAmountA: string
  displayCoinAmountB: string
  displayPercentA: string
  displayPercentB: string
  onlyAmountA?: string
  onlyAmountB?: string
}

export type PosFee = {
  displayFeeOwedA: string
  displayFeeOwedB: string
  feeOwedA: string
  feeOwedB: string
}

export type PosReward = {
  amount_owed: string
  coin_address: string
  display_amount_owed: string
  token: Token
}

export type PrePosAddRes = {
  coinAmountA: string
  coinAmountB: string
  coinAmountAOrigin: string
  coinAmountBOrigin: string
  tokenMaxA: string
  tokenMaxB: string
  liquidityAmount: string
  displayCoinAmountA?: string
  displayCoinAmountB?: string
}
