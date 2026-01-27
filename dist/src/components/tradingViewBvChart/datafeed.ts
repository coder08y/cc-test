// src/services/datafeed.ts

// import { Bar, getHistoricalData, getLatestKlineData } from './api'
import { Bar } from './api'

// toDo: 具体根据后端接口参数调整映射
const dateType: any = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
  '1W': '1w',
  '1M': '1M'
}

const dateTypeSecondObj: any = {
  '1': 60,
  '5': 300,
  '15': 900,
  '60': 3600,
  '240': 14400,
  '1D': 86400,
  '1W': 604800,
  '1M': 2592000
}

export class DataFeed {
  private poolId: string
  private resolution: string
  onChangePrice: ((data: { coinType: string; price: string }) => void) | undefined

  getHistoricalData: (params: {
    poolId: string
    resolution: string
    from: number
    to: number
    callback: any
    onErrorCallback: any
    firstDataRequest?: boolean
  }) => void
  subscribeKlineData: (params: { poolId: string; resolution: string; callback: any }) => void
  setTvMarksOnDataCallback: ((callback: any) => void) | undefined

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
    onChangePrice?: (data: { coinType: string; price: string }) => void,
    setTvMarksOnDataCallback?: (callback: any) => void
  ) {
    this.poolId = poolId
    this.resolution = resolution
    this.onChangePrice = onChangePrice
    this.getHistoricalData = getHistoricalData
    this.subscribeKlineData = subscribeKlineData
    this.setTvMarksOnDataCallback = setTvMarksOnDataCallback
  }

  /**
   * 初始化配置
   */
  onReady(callback: (config: any) => void): void {
    setTimeout(() => {
      callback({
        supported_resolutions: ['1', '5', '15', '60', '240', 'D', 'W', 'M'], // 支持的时间周期
        supports_time: true,
        supports_marks: true
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
    // const unit = Number(arr[1]) || 2
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
        supported_resolutions: ['1', '5', '15', '60', '240', 'D', 'W', 'M'],
        volume_precision: 2,
        supports_marks: true
      })
    }, 0)
  }

  getMarks(symbolInfo: any, from: number, to: number, onDataCallback: (marks: any[]) => void, resolution: string): void {
    console.log('Tradingview getMarks 0922 ')

    // onDataCallback([
    //   {
    //     id: 1,
    //     time: 1758519900,
    //     color: 'green',
    //     text: ['This is the mark pop-up text.'],
    //     label: 'B',
    //     labelFontColor: 'blue',
    //     minSize: 25
    //   },
    //   {
    //     id: 2,
    //     // time: 1758517200,
    //     time: 1758519900,
    //     color: 'red',
    //     text: ['Second marker'],
    //     label: 'S',
    //     labelFontColor: 'green',
    //     minSize: 25
    //   },
    //   {
    //     id: 3,
    //     // time: 1758517200,
    //     time: 1758519900,
    //     color: 'red',
    //     text: ['Second marker'],
    //     label: 'S',
    //     labelFontColor: 'green',
    //     minSize: 25
    //   }
    // ])

    this.setTvMarksOnDataCallback && this.setTvMarksOnDataCallback(onDataCallback)
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
    // if (!periodParams?.firstDataRequest) return
    // getHistoricalData(this.poolId, dateType[resolution], from - dateTypeSecondObj[resolution] * 5, to)
    // getHistoricalData(this.poolId, dateType[resolution], from, to, firstDataRequest)
    //   .then(bars => {
    //     console.log('🚀 ~ DataFeed ~ bars:', bars)
    //     // if (!bars) {
    //     //   this.onChangeApiStatus?.(true)
    //     //   return
    //     // } else {
    //     //   this.onChangeApiStatus?.(false)
    //     // }
    //     if (bars.length) {
    //       try {
    //         const _poolId = this.poolId
    //         this.onChangePrice({
    //           coinType: _poolId,
    //           price: String(bars[bars?.length - 1]?.close || '')
    //         })
    //       } catch (error) {
    //         console.log('🚀 ~ DataFeed ~ poller ~ error:', error)
    //       }
    //       onHistoryCallback(bars, { noData: false })
    //       // onHistoryCallback([], { noData: true })
    //     } else {
    //       onHistoryCallback([], { noData: true })
    //     }
    //   })
    //   .catch(error => onErrorCallback(error.message))

    const _poolId = this.poolId

    this.getHistoricalData({
      poolId: _poolId,
      resolution: dateType[resolution],
      from: from - dateTypeSecondObj[resolution] * 5,
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
    console.log('bv subscribeBar 🚀 ~ DataFeed ~ symbolInfo:', symbolInfo)
    console.log('bv subscribeBar 🚀 ~ DataFeed ~ this poolId:', this.poolId)
    // const interval = 5000 // 每 5 秒轮询
    // const poller = setInterval(async () => {
    //   const bars = await getLatestKlineData(this.poolId, dateType[resolution])
    //   console.log('bv subscribeBar 🚀 ~ DataFeed ~ poller ~ bars:', bars)
    //   if (bars.length) {
    //     try {
    //       const _poolId = this.poolId
    //       this.onChangePrice({
    //         coinType: _poolId,
    //         price: String(bars[0]?.close || '')
    //       })
    //     } catch (error) {
    //       console.log('🚀 ~ DataFeed ~ poller ~ error:', error)
    //     }

    //     onRealtimeCallback(bars[0]) // 推送最新数据
    //   }
    // }, interval)
    // ;(this as any)[subscriberUID] = poller

    const _poolId = this.poolId
    this.subscribeKlineData({
      poolId: _poolId,
      resolution: dateType[resolution],
      callback: onRealtimeCallback
    })
  }

  /**
   * 取消实时数据订阅
   */
  unsubscribeBars(subscriberUID: string): void {
    clearInterval((this as any)[subscriberUID])
  }
}
