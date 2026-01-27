// src/services/datafeed.ts

import { Bar, getHistoricalData, getLatestKlineData } from './api'

// toDo: 具体根据后端接口参数调整映射
const dateType: any = {
  '1': 'min',
  '5': '5min',
  '10': '10min',
  '30': '30min',
  '60': 'hour',
  '240': '4hour',
  '360': '6hour',
  '1D': 'day',
  '1W': 'week'
}

const dateTypeSecondObj: any = {
  '1': 60,
  '5': 300,
  '10': 600,
  '30': 1800,
  '60': 3600,
  '240': 14400,
  '360': 21600,
  '1D': 86400,
  '1W': 604800
}

export class DataFeed {
  private poolId: string
  private resolution: string
  onChangeApiStatus: ((value: boolean) => void) | undefined

  constructor(poolId: string, resolution: string, onChangeApiStatus?: () => void) {
    this.poolId = poolId
    this.resolution = resolution
    this.onChangeApiStatus = onChangeApiStatus
  }

  /**
   * 初始化配置
   */
  onReady(callback: (config: any) => void): void {
    setTimeout(() => {
      callback({
        supported_resolutions: ['1', '5', '10', '30', '60', '240', '360', 'D', 'W'], // 支持的时间周期
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
    const unit = Number(arr[1]) || 2
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
        supported_resolutions: ['1', '5', '10', '30', '60', '240', '360', 'D', 'W'],
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
    const { from, to } = periodParams
    console.log('🚀 ~ DataFeed ~ resolution111:', resolution, symbolInfo)
    console.log('🚀 ~ DataFeed ~ periodParams:', periodParams)
    // if (!periodParams?.firstDataRequest) return
    // getHistoricalData(this.poolId, dateType[resolution], from - dateTypeSecondObj[resolution] * 5, to)
    getHistoricalData(this.poolId, dateType[resolution], from, to)
      .then(bars => {
        console.log('🚀 ~ DataFeed ~ bars:', bars)
        if (!bars) {
          this.onChangeApiStatus?.(true)
          return
        } else {
          this.onChangeApiStatus?.(false)
        }
        if (bars.length) {
          onHistoryCallback(bars, { noData: false })
        } else {
          onHistoryCallback([], { noData: true })
        }
      })

      .catch(error => onErrorCallback(error.message))
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
    const interval = 10000 // 每 5 秒轮询
    const poller = setInterval(async () => {
      // const now = Math.floor(Date.now() / 1000)
      const bars = await getLatestKlineData(this.poolId, dateType[resolution])
      console.log('🚀 ~ DataFeed ~ poller ~ bars:', bars)
      if (bars.length) {
        // onRealtimeCallback(bars[bars.length - 1]) // 推送最新数据
        onRealtimeCallback(bars[0]) // 推送最新数据
      }
    }, interval)
    ;(this as any)[subscriberUID] = poller
  }

  /**
   * 取消实时数据订阅
   */
  unsubscribeBars(subscriberUID: string): void {
    clearInterval((this as any)[subscriberUID])
  }
}
