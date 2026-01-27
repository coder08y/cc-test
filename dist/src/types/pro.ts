export type CoinBvPrice = {
  price: string
  coinType: string
}

export type CoinDexPoolItem = {
  apr: string
  dex: string
  coinList: string[]
  price: string | number
  tvl: string | number
  link: string
  [key: string]: any
}

export type CoinTransactionBlockItem = {
  txDigest: string
  payload: string
  sender: string
  txns: number
  status: string
  gas: string
  payloadPackage: string
  labels: {
    name: string
    image: string
  }[]
}

export type CoinMarketData = {
  liquidityInUsd: string | number
  liquidity: string | number
  market: {
    [key: string]: {
      txn: string
      buys: number
      sells: number
      buysDisplay: string
      sellsDisplay: string
      buyVolume: number
      buyVolumeDisplay: string
      sellVolume: number
      sellVolumeDisplay: string
      buyers: number
      buyersDisplay: string
      sellers: number
      sellersDisplay: string
      priceChange: string
      label: string
      markers: string
      volume: string
    }
  }
}

export type CoinDetail = {
  coinType: string
  cratedTime: string
  creator: string
  packageId: string
  decimals: number
  website: string
  totalSupply: string
  totalSupplyDisplay: string | number
  cirSupply: string
  cirSupplyDisplay: string | number
  verified: boolean
  scamFlag: boolean
  holders: number
}

export type CoinHolderItem = {
  holder: string
  balance: string | number
  balanceDisplay: string | number
  percentage: string
  name: string
  website: string
  image: string
}

export type CoinTradeItem = {
  type: string
  price: string
  coinChanges: {
    amount: string
    coinType: string
    symbol: string
    logo: string
  }[]
  dex: string
  sender: string
  txDigest: string
  usdValue: string
  iconName: string
  timestamp: number
}

export type CoinAuditCheckData = {
  coinType: string
  isHoneypot: boolean
  top10Holder: string
  mintAuthority: string
}

export type ProTokenListItem = {
  coinType: string
  priceChange: string
  vol: string
  price: string
}

export type ProCoinItem = {
  coinType: string
  coin_type: string
  priceChange: string
  volume: string
  price: string
  logo_url: string
  symbol: string
  name: string
  mc: string | number
  fdv: string | number
  liquidity: string
  holders: string | number
  age: string | number
  decimals: number
}

export type QuickCoin = {
  symbol: string
  coinType: string
  icon: string
  decimals: number
}

export type ProCoinListFetchParams = {
  sorted_by?: string
  date_type?: string
  desc?: boolean
  limit?: number
  offset?: number
  search?: string
  market_cap_max?: string
  market_cap_min?: string
  volume_max?: string
  volume_min?: string
  liqidity_max?: string
  liqidity_min?: string
  text?: string
  tag?: string
}

export type ProCarouseInfo<T> = {
  dataList: T
  lastUpdateTime: number | undefined
}
