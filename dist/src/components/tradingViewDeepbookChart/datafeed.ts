// src/services/datafeed.ts

// import { Bar, getHistoricalData, getLatestKlineData } from './api'
import { Bar } from './api'

// toDo: 具体根据后端接口参数调整映射
const dateType: any = {
  '1': '1m',
  '10': '10m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
  '1W': '1w'
  // '1M': '1M'
}

const secondObj: any = {
  '1': 60,
  '10': 60 * 10,
  '15': 60 * 15,
  '30': 60 * 30,
  '60': 60 * 60,
  '240': 240 * 60,
  '1D': 24 * 60 * 60,
  '1W': 7 * 24 * 60 * 60
}
export class DataFeed {
  private poolId: string
  private resolution: string
  onChangePrice: (data: { poolId: string; price: string }) => void

  getHistoricalData: (params: {
    poolId: string
    resolution: string
    from: number
    to: number
    callback: any
    onErrorCallback: any
    firstDataRequest?: boolean
  }) => void
  subscribeKlineData: (params: { poolId: string; resolution: string; callback: any; onPriceChange: any }) => void
  // getLatestKlineData: (params: any) => void

  constructor(
    poolId: string,
    resolution: string,
    getHistoricalData: (params: {
      poolId: string
      resolution: string
      from: number
      to: number
      callback: any
      onErrorCallback: any
      firstDataRequest?: boolean
    }) => void,
    subscribeKlineData: (params: { poolId: string; resolution: string; callback: any }) => void,
    // getLatestKlineData: (params: any) => void,
    onChangePrice: (data: { poolId: string; price: string }) => void
  ) {
    this.poolId = poolId?.split('::')?.[1] || ''
    this.resolution = resolution
    this.onChangePrice = onChangePrice
    this.getHistoricalData = getHistoricalData
    this.subscribeKlineData = subscribeKlineData
    // this.getLatestKlineData = getLatestKlineData
  }

  /**
   * 初始化配置
   */
  onReady(callback: (config: any) => void): void {
    setTimeout(() => {
      callback({
        supported_resolutions: ['1', '10', '15', '30', '60', '240', 'D', 'W'], // 支持的时间周期
        supports_time: true
      })
    }, 0)
  }

  /**
   * 解析交易对信息
   */
  resolveSymbol(symbolName: string, onSymbolResolvedCallback: (symbolInfo: any) => void, onResolveErrorCallback: (error: string) => void): void {
    console.log('🚀 ~ DataFeed ~ resolveSymbol ~ symbolName:', symbolName)
    console.log('🚀 ~ DataFeed ~ resolveSymbol ~ symbolInfo:')
    const arr = symbolName.split('::')
    const symbol = arr[0]
    const unit = Number(arr[2]) || 2
    console.log('🚀 ~ DataFeed ~ resolveSymbol ~ unit:', unit)
    // toDo: 可将当前交易对的current price传进来，最好用map结构维护，根据symbolName对应的current pirce 动态调整pricascale
    setTimeout(() => {
      onSymbolResolvedCallback({
        name: symbol,
        ticker: symbol,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        minmov: 1,
        format: 'price',
        pricescale: Math.pow(10, unit), // 价格精度
        has_intraday: true,
        has_empty_bars: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: ['1', '10', '15', '30', '60', '240', 'D', 'W'],
        volume_precision: 2
      })
    }, 0)
  }

  /**
   * 获取历史数据
   */
  getBars(
    symbolInfo: any,
    resolution: string,
    periodParams: any,
    onHistoryCallback: (bars: Bar[], { noData }: { noData: boolean }) => void,
    onErrorCallback: (error: string) => void
  ): void {
    const { from, to, firstDataRequest } = periodParams
    // console.log('🚀 ~ DataFeed getBars ~ resolution111:', resolution, symbolInfo)
    // console.log('🚀 ~ DataFeed getBars ~ periodParams:', periodParams)

    const _poolId = this.poolId

    this.getHistoricalData({
      poolId: _poolId,
      resolution,
      from,
      to,
      callback: onHistoryCallback,
      onErrorCallback,
      firstDataRequest
    })
  }

  /**
   * 订阅实时数据（轮询）
   */
  subscribeBars(
    symbolInfo: any,
    resolution: string,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ): void {
    console.log('subscribeBar 🚀 ~ DataFeed ~ symbolInfo:', symbolInfo)
    console.log('subscribeBar 🚀 ~ DataFeed ~ this poolId:', this.poolId)
    // const interval = 5000 // 每 5 秒轮询
    // const _this = this
    // const poller = setInterval(async () => {
    //   const now = new Date().getTime()
    //   const to = d(now).div(1000).floor().toNumber()
    //   const step = secondObj[resolution]
    //   const from = d(to).minus(step).toNumber()
    //   const type = dateType[resolution]

    //   const bars: any = await _this.getLatestKlineData({
    //     poolId: _this.poolId,
    //     resolution,
    //     from,
    //     to
    //   })
    //   console.log('subscribeBar 🚀 ~ DataFeed ~ poller ~ bars:', bars)
    //   if (bars.length) {
    //     try {
    //       const _poolId = this.poolId
    //       _this.onChangePrice({
    //         poolId: _poolId,
    //         price: String(bars[0]?.close || '')
    //       })
    //     } catch (error) {
    //       console.log('🚀 ~ DataFeed ~ poller ~ error:', error)
    //     }

    //     onRealtimeCallback(bars[0]) // 推送最新数据
    //   }
    // }, interval)
    // ;(this as any)[subscriberUID] = poller

    // ws对接后用下面的
    const _poolId = this.poolId
    const _onPriceChange = this.onChangePrice
    this.subscribeKlineData({
      poolId: _poolId,
      resolution,
      callback: onRealtimeCallback,
      onPriceChange: _onPriceChange
    })
  }

  /**
   * 取消实时数据订阅
   */
  unsubscribeBars(subscriberUID: string): void {
    clearInterval((this as any)[subscriberUID])
  }
}
