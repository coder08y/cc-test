type Balance = {
  coin_type: string
  value: string
}

type LiquidityRange = {
  lower_offset: number
  rebalance_threshold: number
  upper_offset: number
}

type WrappedPosition = {
  coin_type_a: string
  coin_type_b: string
  description: string
  id: string
  index: string
  liquidity: string
  name: string
  pool: string
  tick_lower_index: number
  tick_upper_index: number
  url: string
}

type ClmmVault = {
  clmm_pool_id: string
  liquidity_range: LiquidityRange
  wrapped_position: WrappedPosition
}

export type UnstableVaultContractInfo = {
  id: string
  is_pause: boolean
  clmm_vault: ClmmVault
  lp_token_treasury: string
  protocol_fees_handle: string
  hard_cap: string
  quote_type: string
  lp_token_type: string
  balances: Balance[]
  protocol_fee_rate: string
}

export type DepositCalculationResult = {
  amount_a: string
  amount_b: string
  ft_amount?: string
}
