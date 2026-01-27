import { Token } from '@cetus/types'

export type TickData = {
  id: string
  tokenA: Token
  tokenB: Token
  tick: number
  price: string
  displayPrice: string
  reversePrice: string
  displayReversePrice: string
  // isReverse: boolean
  tickSpacing: string
  pool: string
}

export type GetTickParams = {
  poolAddress: string
  tokenA: any
  tokenB: any
  tickSpacing: number
  currentTickIndex: number
  liquidity: string
  feeRate: string
}

export type TokensMap = {
  percentA: string
  percentB: string
}

export type FeeRate = '100' | '500' | '1000' | '2500' | '10000' | '20000'

export type Statistics = {
  totalTvl: string
  vol24H: string
  cumulativeVol: string
  cumulativeTx: string
  cumulativeUserAccount: string
}

export type StatisticsSummary = {
  clmm: Statistics
  dlmm: Statistics
  summary: Statistics
}
