export interface ChartEntry {
  activeLiquidity: number
  price0: number
  tick?: number
  amount0Locked?: number
  amount1Locked?: number
}

export interface PriceChartData {
  time: number
  value: number
  open: number
  high: number
  low: number
  close: number
}

export interface LiquidityChartData {
  series: ChartEntry[]
  current: number
  min: number
  max: number
}
