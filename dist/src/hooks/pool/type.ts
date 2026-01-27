export type GetPoolListParams = {
  is_vaults?: boolean
  display_all_pools?: boolean
  has_mining?: boolean
  has_farming?: boolean
  no_incentives?: boolean
  order_by?: string
  limit?: number
  offset?: number
  coin_type?: string
  pool?: string
  pools?: string[]
}

export type GetPoolListApiParamsV2 = {
  filter: 'farming' | 'mining' | 'incentivized' | 'verified' | 'all'
  sortBy: string // 'tvl' | 'vol' | 'totalApr' | 'fee'
  sortOrder: string // 'asc' | 'desc'
  limit?: number
  offset?: number
  coinTypes: string[]
  pools?: string[]
  pool?: string
}
