export type DcaConfig = {
  minCycleAmountInUsd?: string
  minCycleCount?: string
  minCycleFrequency?: string
  whitelistMode?: number
}

export type DcaQuoteData = {
  amountInLimitPerCycle?: number
  coinType?: string
  feeRate?: number
  signature?: string
  signer?: string
  timestamp?: number
}

export type DcaOrderHistoryItem = {
  inAmount: string
  outAmount: string
  inCoinType: string
  outCoinType: string
  time: number
}

export type DcaOrderHistoryData = Record<string, { total: string; list: DcaOrderHistoryItem[] }>
