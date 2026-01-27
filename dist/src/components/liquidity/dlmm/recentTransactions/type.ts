export enum EventEnums {
  add = 'add_liquidity_event',
  remove = 'remove_liquidity_event',
  swap = 'swap_event'
}
export type IconProps = {
  icon: string
  color: string
  title: string
}

export type Item = {
  address: string
  amount: string
  symbol: string
  url: string
}

export type DataItem = {
  block_time: string
  pool: string
  sender: string
  tx: string
  type: EventEnums
  items: Item[]
}
