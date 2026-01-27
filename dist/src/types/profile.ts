import { Token } from '@cetus/types'

export const CoinHoldingTaskType = 'fetch-coin-holding-list'
export const PositionListTaskType = 'fetch-position-list'
export const OwnerNFTTaskType = 'fetch-owner-nft'
export const ActiveOrderListTaskType = 'fetch-active-order-list'
export const XCetusBaseInfoTaskType = 'fetch-xcetus-base-info'
export const VaultsPositionListTaskType = 'fetch-vaults-position-list'
export type CoinHolding = {
  balance: string
  balance_format: string
  balance_display: string
  balance_usd?: string
  coin: Token
  coin_type: string
  price: string
  price_diff_24: string
}

export type CoinHoldingFilter = {
  current_sort: 'balance' | 'price' | 'value'
  current_sort_order: 'asc' | 'desc'
  search?: string
  is_show_unknown?: boolean
  is_hide_small_balance?: boolean
}

export type ProfileTab = 'wallet' | 'liquidity' | 'orders' | 'xCetus'
