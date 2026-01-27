// DeepBook Order Type (Time In Force)
export enum OrderType {
  NO_RESTRICTION = 0, // GTC - Good Til Cancel
  IMMEDIATE_OR_CANCEL = 1, // IOC - Immediate Or Cancel
  FILL_OR_KILL = 2, // FOK - Fill Or Kill
  POST_ONLY = 3 // Post Only - Must be maker
}

// Time In Force 类型映射
export const TIF_TO_ORDER_TYPE: Record<string, OrderType> = {
  GTC: OrderType.NO_RESTRICTION,
  IOC: OrderType.IMMEDIATE_OR_CANCEL,
  FOK: OrderType.FILL_OR_KILL
}

export const ORDER_TYPE_TO_TIF: Record<OrderType, string> = {
  [OrderType.NO_RESTRICTION]: 'GTC',
  [OrderType.IMMEDIATE_OR_CANCEL]: 'IOC',
  [OrderType.FILL_OR_KILL]: 'FOK',
  [OrderType.POST_ONLY]: 'POST'
}

export type Token = {
  coinType: string
  decimals: number
}

export type PoolInfo = {
  address: string
  baseCoin: Token
  quoteCoin: Token
  [key: string]: any
}

export enum DeepBookPoolMarginTabs {
  Long = 'Buy/Long',
  Short = 'Sell/Short'
}

export enum DeepBookPoolCollateralTabs {
  Base = 'base',
  Quote = 'quote',
  Mixed = 'mixed'
}
