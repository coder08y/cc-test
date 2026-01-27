import useGetPriceKlineData from '@/hooks/pro/useGetPriceKlineData'
import { Token } from '@cetus/types'
import { addComma, d, fixDown, formatNumberWithDown, formatTvMarkDate, formatUSDPrice } from '@cetus/utils'
import { VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  SymbolValueFormatterFormatOptions
} from '../../../public/charting_library_new/charting_library.d.ts'
// import ChartHeader from './ChartHeader'

import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { DataFeed } from './datafeed'
interface TradingViewChartProps {
  token: Token | undefined
  tokenPriceUnit: string
  onChartReady?: () => void // 可以用来控制loading
  onChangePrice?: (data: { coinType: string; price: string }) => void
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ token, onChartReady, tokenPriceUnit, onChangePrice }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  const isMounted = useRef<boolean>(false)
  const [indicators, setIndicators] = useState<string[]>([])
  const [, setIsInitialized] = useState(false)
  const [currentPoolId, setCurrentPoolId] = useState('')
  const { getHistoricalData, subscribeKlineData, proTransactionList } = useGetPriceKlineData()
  const tvMarksOnDataCallbackRef = useRef<any>(null)

  useEffect(() => {
    console.log('tv chart component Mounted')
    isMounted.current = true
  }, [])

  const setTvMarksOnDataCallback = (callback: any) => {
    tvMarksOnDataCallbackRef.current = callback
  }

  useEffect(() => {
    if (!chartContainerRef.current || !token?.coin_type || !tokenPriceUnit) return
    console.log('bv chart tokenPriceUnit: ', tokenPriceUnit)

    console.log('tv chart init useEffect isMounted.current: ', isMounted.current)
    setCurrentPoolId(token?.coin_type)

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: `${token?.symbol}::${tokenPriceUnit}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as any,
      interval: '15' as any, // 默认时间周期（1分钟）
      container: 'tv_chart_container',
      datafeed: new DataFeed(token?.coin_type, '1', getHistoricalData, subscribeKlineData, onChangePrice, setTvMarksOnDataCallback) as any, // 使用自定义 DataFeed
      library_path: 'https://archive.cetus.zone/assets/charting_library_new/',
      locale: 'en',
      autosize: true,
      theme: 'dark',
      settings_overrides: {},
      // 精度设置
      overrides: {
        'paneProperties.backgroundGradientStartColor': '#0F0F0F', // 窗格背景渐变开始颜色。
        'paneProperties.backgroundGradientEndColor': '#0F0F0F', // 窗格背景渐变结束颜色。
        'paneProperties.background': '#0F0F0F',
        'paneProperties.backgroundType': 'solid',
        'Overlay.barStyle.upColor': '#68FFD8',
        'Overlay.barStyle.downColor': '#FF5073',
        'mainSeriesProperties.priceLineWidth': 1, // 主价格线宽度
        'priceScale.precision': 2, // 价格精度
        'priceScale.minMove': 0.01, // 最小变化单位
        'mainSeriesProperties.style': 1
      },
      custom_css_url: 'https://archive.cetus.zone/assets/web/css/tv-chart-dart.css',
      // disabled_features: ['header_symbol_search', 'header_compare', 'header_widget'],
      disabled_features: [
        'header_symbol_search',
        'header_compare',
        'timeframes_toolbar'
        // 'volume_force_overlay',
        // 'create_volume_indicator_by_default'
      ],
      // enabled_features: ['chart_style_hilo_last_price', 'hide_left_toolbar_by_default', 'header_resolutions'],
      enabled_features: [
        'header_widget',
        'chart_style_hilo_last_price',
        'hide_left_toolbar_by_default',
        'hide_resolution_in_legend',
        'two_character_bar_marks_labels'
      ],
      custom_formatters: {
        priceFormatterFactory: (symbolInfo, minTick) => {
          console.log('🚀 ~ priceFormatterFactory ~ symbolInfo:', symbolInfo)

          // if (symbolInfo?.fractional || (minTick !== 'default' && minTick.split(',')[2] === 'true')) {
          if (symbolInfo) {
            return {
              format: (price: number, signPositive?: SymbolValueFormatterFormatOptions): string => {
                // console.log('🚀 ~ priceFormatterFactory ~ price.toString():', price)

                // if (d(price).gte(100000)) {
                //   console.log('🚀 ~ useEffect ~ numericAbbreviation(price.toString(), 0):', numericAbbreviation(price.toString(), 0))
                //   return String(numericAbbreviation(price.toString(), 0, 0))
                // }

                // const decimals = Math.log10(symbolInfo.pricescale)

                // if (d(price).abs().lt(0.0000001)) {
                //   return String(formatNumberWithDown(convertScientificToDecimal(price.toString(), decimals), decimals))
                // }

                // return String(formatNumberWithDown(price.toString(), decimals))
                return formatUSDPrice(price)
              }
            }
          }
          return null
        }
      },
      favorites: {
        intervals: ['5' as ResolutionString, '15' as ResolutionString],
        indicators: ['Awesome Oscillator', 'Bollinger Bands'],
        // drawingTools: ['LineToolBrush', 'LineToolCallout', 'LineToolCircle'],
        chartTypes: ['Candles', 'Line']
      }
      // header_widget_buttons_mode: 'fullsize'
      // studies_overrides: {
      //   'volume.volume.color.0': '#00FFFF'
      // }
      // 设置价格精度
      // time_frames: [
      //   { text: '50y', resolution: '6M', description: '50 Years' },
      //   { text: '3y', resolution: '1W', description: '3 Years', title: '3yr' },
      //   { text: '8m', resolution: '1D', description: '8 Month' },
      //   { text: '3d', resolution: '5', description: '3 Days' }
      //   // { text: '1000y', resolution: '1W', description: 'All', title: 'All' }
      // ],
      // enabled_timeframes: ['1m', '1h', '1D', '1W']
      // header_resolutions: ['1', '60', '240', 'D', 'W']

      // saved_data: {
      //   'left_toolbar.state': 'hidden' // 初始化为折叠状态
      // }
    }

    // console.log('🚀 ~ useEffect ~ document.getElementById(tv_chart_container):', document.getElementById('tv_chart_container'))
    // 初始化图表
    // const tvWidget = new widget(widgetOptions)
    const tvWidget = new (window as any).TradingView.widget(widgetOptions)

    console.log('🚀 ~ useEffect ~ tvWidgetRef.current:', tvWidgetRef.current)

    tvWidget.onChartReady(() => {
      // console.log('🚀 ~ useEffect ~ tvWidget.onChartReady:')
      // const chart = tvWidget.chart()
      // const studies = chart.getAllStudies()
      // const volumeStudy = studies.find(s => s.name === 'Volume')

      // const studiesList = tvWidget.getStudiesList()
      // setIndicators(studiesList)

      // // Remove existing volume study if it exists
      // if (volumeStudy) {
      //   chart.removeEntity(volumeStudy.id)
      // }

      setIsInitialized(true)

      onChartReady?.()

      const chart = tvWidget.chart()
      tvWidgetRef.current = tvWidget
      // chart.createMultipointShape([{ time: 1758519900, price: 3.5 }], { shape: 'note' })
    })

    // Then remove the TradingView widget
    return () => {
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove()
        } catch (error) {
          console.error('Error removing TradingView widget:', error)
        }
        tvWidgetRef.current = null
        setIsInitialized(false)
      }
    }
  }, [token?.coin_type, isMounted.current, tokenPriceUnit]) // 当 symbol 改变时重新初始化图表

  // useEffect(() => {
  //   console.log('tvWidgetRef.current###', tvWidgetRef.current)
  // }, [tvWidgetRef.current])

  // 切换时间周期
  const handleChangeResolution = (value: ResolutionString) => {
    if (tvWidgetRef.current) {
      tvWidgetRef.current.chart().setResolution(value)
    }
  }

  // 切换图表类型
  const handleSetChartType = (chartType: number) => {
    if (tvWidgetRef.current) {
      tvWidgetRef.current.activeChart().setChartType(chartType)
      // setCurrentChartType(chartType);
    }
  }

  // 全屏
  const handleToggleFullScreen = useCallback(() => {
    if (!tvWidgetRef.current) return

    try {
      tvWidgetRef.current.startFullscreen()
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }, [])

  // 前进后退
  const handleUndoRedo = (action: 'undo' | 'redo') => {
    if (!tvWidgetRef.current) return
    const chart = tvWidgetRef.current.chart()
    if (action === 'undo') {
      chart.executeActionById('undo')
    } else {
      chart.executeActionById('redo')
    }
  }

  // test
  const handleTestAddMark = () => {
    if (tvMarksOnDataCallbackRef.current) {
      tvMarksOnDataCallbackRef.current([
        {
          id: 1,
          time: 1758713400,
          color: 'green',
          text: [`This is the mark pop-up text. ${formatUSDPrice(20000)}`],
          label: 'B',
          labelFontColor: 'blue',
          minSize: 25
        },
        {
          id: 2,
          time: 1758713400,
          color: 'red',
          text: ['Second marker'],
          label: 'S',
          labelFontColor: 'green',
          minSize: 25
        },
        {
          id: 3,
          time: 1758712500,
          color: 'red',
          text: ['Second marker'],
          label: 'S',
          labelFontColor: 'green',
          minSize: 25
        }
      ])
    }
  }

  useDeepCompareEffect(() => {
    if (!tvMarksOnDataCallbackRef.current) return
    if (proTransactionList.length > 0 && token?.coin_type) {
      const data = proTransactionList
        .filter(item => fixCoinType(item.currentCoin.coin_type) === fixCoinType(token!.coin_type))
        .map((item, index) => {
          const amount = formatNumberWithDown(item.amount, item.currentCoin.decimals, true)
          const currentCoinPrice = item?.price
          const amountValue = d(currentCoinPrice).mul(amount).toString()
          const symbol = item.currentCoin.symbol
          return {
            id: `pro_mark_${index}`,
            time: Number(fixDown(d(item.time).div(1000).toNumber(), 0)),
            color: item.type === 'Buy' ? 'green' : 'red',
            text:
              item.type === 'Buy'
                ? `Bought ${amount} ${symbol}($${addComma(formatUSDPrice(amountValue, true))}) at $${addComma(formatUSDPrice(currentCoinPrice))} on ${formatTvMarkDate(item.time)}`
                : `Sold ${amount} ${symbol}($${addComma(formatUSDPrice(amountValue, true))}) at $${addComma(formatUSDPrice(currentCoinPrice))} on ${formatTvMarkDate(item.time)}`,
            label: item.type === 'Buy' ? 'B' : 'S',
            textColor: '#fff',
            labelFontColor: '#fff',
            minSize: 20
          }
        })

      tvMarksOnDataCallbackRef.current(data)
    }
  }, [proTransactionList, tvMarksOnDataCallbackRef.current, token?.coin_type])

  return (
    <VStack>
      {/* <ChartHeader onChangeResolution={handleChangeResolution}></ChartHeader> */}
      {/* <button onClick={handleTestAddMark}>testtest</button> */}
      <div id="tv_chart_container" ref={chartContainerRef} style={{ width: '100%', height: '460px' }} />
    </VStack>
  )
}

export default TradingViewChart
