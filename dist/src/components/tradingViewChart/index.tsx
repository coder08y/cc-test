// import ChartHeader from './ChartHeader'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { coinTypeIsequal, formatPriceWithSigFigs, getPriceUnit } from '@cetus/utils'
import { d } from '@cetus/utils'
import { VStack } from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  ResolutionString,
  SymbolValueFormatterFormatOptions
} from '../../../public/charting_library_new/charting_library.d.ts'

import { DataFeed } from './datafeed'
interface TradingViewChartProps {
  tokenA: Token | undefined // 交易对，例如 "BTC/USDT"
  tokenB: Token | undefined
  onChartReady?: () => void // 可以用来控制loading
  onChangeApiStatus?: () => void
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ tokenA, tokenB, onChartReady, onChangeApiStatus }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  const isMounted = useRef<boolean>(false)
  const [indicators, setIndicators] = useState<string[]>([])
  const [, setIsInitialized] = useState(false)
  const [currentPoolId, setCurrentPoolId] = useState('')

  const { getTokenPrice } = useTokenPrice()

  const tokenAPrice = getTokenPrice(tokenA?.coin_type)
  const tokenBPrice = getTokenPrice(tokenB?.coin_type)

  // toDo: priceUnit 暂时还没处理起来
  const priceInfo = useMemo(() => {
    if (
      tokenAPrice?.price &&
      tokenBPrice?.price &&
      coinTypeIsequal(tokenAPrice!.base_symbol, tokenA!.coin_type) &&
      coinTypeIsequal(tokenBPrice!.base_symbol, tokenB!.coin_type) &&
      tokenA?.coin_type &&
      tokenB?.coin_type &&
      tokenA?.coin_type !== tokenB?.coin_type
    ) {
      const price = d(tokenAPrice.price).div(tokenBPrice.price).toString()
      console.log('🚀 TradingViewChart ~ priceInfo ~ price:', price)
      return {
        coinPair: tokenA!.coin_type + '-' + tokenB!.coin_type,
        price,
        unit: getPriceUnit(price)
      }
    }

    if (tokenA?.coin_type && tokenB?.coin_type && tokenA?.coin_type !== tokenB?.coin_type && (!tokenAPrice?.price || !tokenBPrice?.price)) {
      return {
        coinPair: tokenA!.coin_type + '-' + tokenB!.coin_type,
        price: 0,
        unit: 4
      }
    }
  }, [tokenAPrice, tokenBPrice, tokenA?.coin_type, tokenB?.coin_type])

  useEffect(() => {
    console.log('tv chart component Mounted')
    isMounted.current = true
  }, [])

  const symbolInfo = useMemo(() => {
    const poolId = `${tokenA?.coin_type}-${tokenB?.coin_type}`

    // console.log('tv chart init symbolInfo useMemo poolId: ', poolId)
    // console.log('tv chart init symbolInfo useMemo priceInfo?.coinPair: ', priceInfo?.coinPair)
    console.log('tv chart init symbolInfo useMemo priceInfo: ', priceInfo)
    console.log('tv chart init symbolInfo useMemo poolId: ', poolId)

    if (tokenA?.coin_type && tokenB?.coin_type && priceInfo?.coinPair === poolId) {
      return {
        symbol: `${tokenA?.symbol}/${tokenB?.symbol}`,
        poolId,
        unit: priceInfo?.unit || 4
      }
    }
    return null
  }, [tokenA?.coin_type, tokenB?.coin_type, priceInfo?.coinPair])

  useEffect(() => {
    if (!chartContainerRef.current || !symbolInfo?.poolId || !isMounted.current) return

    console.log('tv chart init useEffect symbolInfo: ', symbolInfo)
    console.log('tv chart init useEffect symbolInfo?.poolId: ', symbolInfo?.poolId)
    console.log('tv chart init useEffect isMounted.current: ', isMounted.current)
    setCurrentPoolId(symbolInfo?.poolId)

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: `${symbolInfo!.symbol}::${symbolInfo?.unit || 2}`,
      interval: '1' as any, // 默认时间周期（1分钟）
      container: 'tv_chart_container',
      datafeed: new DataFeed(symbolInfo!.poolId, '1', onChangeApiStatus) as any, // 使用自定义 DataFeed
      // library_path: '/charting_library_new/',
      library_path: 'https://archive.cetus.zone/assets/charting_library_new/',
      locale: 'en',
      autosize: true,
      theme: 'dark',
      settings_overrides: {
        // 'paneProperties.backgroundGradientStartColor': '#020024', // 窗格背景渐变开始颜色。
        // 'paneProperties.backgroundGradientEndColor': '#4f485e', // 窗格背景渐变结束颜色。
        'paneProperties.background': '#0F0F0F',
        'paneProperties.backgroundType': 'solid',
        'Overlay.barStyle.upColor': '#68FFD8',
        'Overlay.barStyle.downColor': '#FF5073'
      },
      // 精度设置
      overrides: {
        'mainSeriesProperties.priceLineWidth': 1, // 主价格线宽度
        'priceScale.precision': 2, // 价格精度
        'priceScale.minMove': 0.01 // 最小变化单位
      },
      custom_css_url: 'https://archive.cetus.zone/assets/web/css/tv-chart-dart.css',
      // disabled_features: ['header_symbol_search', 'header_compare', 'header_widget'],
      disabled_features: [
        'header_symbol_search',
        'header_compare',
        'timeframes_toolbar',
        'volume_force_overlay',
        'create_volume_indicator_by_default'
      ],
      // enabled_features: ['chart_style_hilo_last_price', 'hide_left_toolbar_by_default', 'header_resolutions'],
      enabled_features: [
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
                return formatPriceWithSigFigs(price, price)
              }
            }
          }
          return null
        }
      }
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
    tvWidgetRef.current = tvWidget
    // console.log('🚀 ~ useEffect ~ tvWidgetRef.current:', tvWidgetRef.current)

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
  }, [symbolInfo?.poolId, isMounted.current]) // 当 symbol 改变时重新初始化图表

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

  return (
    <VStack>
      {/* <ChartHeader onChangeResolution={handleChangeResolution}></ChartHeader> */}
      <div id="tv_chart_container" ref={chartContainerRef} style={{ width: '100%', height: '422px' }} />
    </VStack>
  )
}

export default TradingViewChart
