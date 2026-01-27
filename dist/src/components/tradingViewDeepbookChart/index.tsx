// components/DeepbookTradingViewChart.tsx
import useDeepBookOrderActions from '@/hooks/deepbook/useDeepBookOrderActions'
import useGetDeepbookKlineData from '@/hooks/deepbook/useGetDeepbookKline'
import useDeepBookStore from '@/store/deepbook'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { formatUSDPrice } from '@cetus/utils'
import { VStack } from '@chakra-ui/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import type {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  SymbolValueFormatterFormatOptions
} from '../../../public/charting_library_new/charting_library.d.ts'
import { DataFeed } from './datafeed'
import { useDeepbookOrderMarkers } from './useDeepbookOrderMarkers'

interface TradingViewChartProps {
  poolId: string
  poolPriceUnit: string
  onChangePrice: (data: { poolId: string; price: string }) => void
  onChartReady?: () => void
}

const DeepbookTradingViewChart: React.FC<TradingViewChartProps> = ({ poolId, onChartReady, poolPriceUnit, onChangePrice }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  const isMounted = useRef<boolean>(false)
  const [, setIsInitialized] = useState(false)
  const [currentPoolId, setCurrentPoolId] = useState('')
  const initializedPoolRef = useRef<string>('')
  const fadeStyleObserverRef = useRef<MutationObserver | null>(null)
  const fadeStyleIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { getDeepbookHistoricalData, subscribeKlineData, disconnectDeepbookWs } = useGetDeepbookKlineData()
  const { deepBookOpenOrders, orderTab } = useDeepBookStore()
  const { cancelOrder } = useDeepBookOrderActions()
  const { isApp } = useWindowWidth()
  // 使用 ref 存储函数引用，避免作为依赖项导致重复渲染
  const getDeepbookHistoricalDataRef = useRef(getDeepbookHistoricalData)
  const subscribeKlineDataRef = useRef(subscribeKlineData)
  const onChangePriceRef = useRef(onChangePrice)
  const disconnectDeepbookWsRef = useRef(disconnectDeepbookWs)

  // 更新 ref 的值
  useEffect(() => {
    getDeepbookHistoricalDataRef.current = getDeepbookHistoricalData
    subscribeKlineDataRef.current = subscribeKlineData
    onChangePriceRef.current = onChangePrice
    disconnectDeepbookWsRef.current = disconnectDeepbookWs
  }, [getDeepbookHistoricalData, subscribeKlineData, onChangePrice, disconnectDeepbookWs])

  // 转换订单数据为 marker
  const orderMarkers = useMemo(() => {
    const actualPoolAddress = poolId.includes('::') ? poolId.split('::')[1] : poolId
    return deepBookOpenOrders
      .filter((order: any) => order.address === actualPoolAddress && order.baseAssets && order.quoteAssets)
      .map((order: any) => {
        // 根据订单的 side 字段判断订单类型：Long/Short 是 margin，Buy/Sell 是 spot
        // order.side 可能是 'Buy'/'Sell' 或 'Long'/'Short'
        const isMarginOrder = order.side === 'Long' || order.side === 'Short'
        let side: 'Buy' | 'Sell' | 'Long' | 'Short' = order.side as 'Buy' | 'Sell' | 'Long' | 'Short'

        return {
          orderId: order.orderId,
          side,
          price: Number(order.price),
          quantity: Number(order.originalQuantity),
          filledQuantity: Number(order.filledQuantity),
          symbol: order.baseAssets?.symbol || order.baseAsset || 'SUI',
          poolInfo: {
            address: order.address,
            baseAssets: order.baseAssets,
            quoteAssets: order.quoteAssets
          },
          // 保存完整的订单对象，以便在取消订单时使用
          order,
          // 保存订单类型，用于取消订单时判断
          orderType: isMarginOrder ? 'margin' : ('spot' as 'spot' | 'margin')
        }
      })
  }, [deepBookOpenOrders, poolId])

  useEffect(() => {
    isMounted.current = true
    return () => {
      disconnectDeepbookWsRef.current()
    }
  }, [])

  useEffect(() => {
    if (!chartContainerRef.current || !poolId || !poolPriceUnit || !(window as any).TradingView?.widget) return

    // 如果已经初始化过相同的 poolId 和 poolPriceUnit，则不再重复创建
    const poolKey = `${poolId}::${poolPriceUnit}`
    if (initializedPoolRef.current === poolKey && tvWidgetRef.current) {
      return
    }

    // 如果已经存在 widget，先清理
    if (tvWidgetRef.current) {
      try {
        tvWidgetRef.current.remove()
      } catch (error) {
        console.error('Error removing existing widget:', error)
      }
      tvWidgetRef.current = null
    }

    setCurrentPoolId(poolId)
    initializedPoolRef.current = poolKey

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: poolKey,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as any,
      interval: '15' as any,
      container: 'tv_chart_container',
      datafeed: new DataFeed(poolId, '1', getDeepbookHistoricalDataRef.current, subscribeKlineDataRef.current, onChangePriceRef.current) as any,
      library_path: 'https://archive.cetus.zone/assets/charting_library_new/',
      locale: 'en',
      autosize: true,
      theme: 'dark',
      settings_overrides: {},
      overrides: {
        'paneProperties.backgroundGradientStartColor': '#0F0F0F',
        'paneProperties.backgroundGradientEndColor': '#0F0F0F',
        'paneProperties.background': '#0F0F0F',
        'paneProperties.backgroundType': 'solid',
        'Overlay.barStyle.upColor': '#68FFD8',
        'Overlay.barStyle.downColor': '#FF5073',
        'mainSeriesProperties.priceLineWidth': 1,
        'priceScale.precision': 2,
        'priceScale.minMove': 0.01,
        'mainSeriesProperties.style': 1
      },
      custom_css_url: 'https://archive.cetus.zone/assets/web/css/tv-chart-dart.css',
      disabled_features: [
        'header_symbol_search',
        'header_compare',
        'timeframes_toolbar',
        'volume_force_overlay',
        'create_volume_indicator_by_default'
      ],
      enabled_features: [
        'header_widget',
        'chart_style_hilo_last_price',
        'hide_left_toolbar_by_default',
        'hide_resolution_in_legend',
        'two_character_bar_marks_labels'
      ],
      custom_formatters: {
        priceFormatterFactory: (symbolInfo: any, minTick: any) => {
          if (symbolInfo) {
            return {
              format: (price: number, signPositive?: SymbolValueFormatterFormatOptions) => {
                return formatUSDPrice(price)
              }
            }
          }
          return null
        }
      },
      favorites: {
        intervals: ['60'] as any,
        indicators: ['Awesome Oscillator', 'Bollinger Bands'],
        chartTypes: ['Candles', 'Line']
      }
    }

    const tvWidget = new (window as any).TradingView.widget(widgetOptions)
    tvWidgetRef.current = tvWidget

    tvWidget.onChartReady(() => {
      setIsInitialized(true)
      onChartReady?.()
      tvWidgetRef.current = tvWidget

      // 应用遮罩样式到 iframe 内部
      const applyFadeStyles = () => {
        try {
          const iframe = chartContainerRef.current?.querySelector('iframe') as HTMLIFrameElement | null
          const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document
          if (!iframeDoc) return false

          const gradients = {
            right: 'linear-gradient(270deg, #0F0F0F, rgba(15, 15, 15, 0))',
            left: 'linear-gradient(90deg, #0F0F0F, rgba(15, 15, 15, 0))'
          }

          // 设置元素样式
          const setStyle = (el: HTMLElement, gradient: string) => {
            el.style.setProperty('background-image', gradient, 'important')
          }

          const fadeRight = iframeDoc.querySelectorAll('[class*="fadeRight"]')
          const fadeLeft = iframeDoc.querySelectorAll('[class*="fadeLeft"]')
          fadeRight.forEach(el => el instanceof HTMLElement && setStyle(el, gradients.right))
          fadeLeft.forEach(el => el instanceof HTMLElement && setStyle(el, gradients.left))

          // 注入样式到 head（备用方案）
          if ((fadeRight.length || fadeLeft.length) && !iframeDoc.getElementById('deepbook-fade-override')) {
            const style = iframeDoc.createElement('style')
            style.id = 'deepbook-fade-override'
            style.textContent = `
              [class*="fadeRight"] { background-image: ${gradients.right} !important; }
              [class*="fadeLeft"] { background-image: ${gradients.left} !important; }
            `
            iframeDoc.head.appendChild(style)
          }

          return fadeRight.length > 0 || fadeLeft.length > 0
        } catch {
          return false
        }
      }

      // 定时检查并应用样式
      let attempts = 0
      const tryApply = () => {
        if (applyFadeStyles() || ++attempts >= 20) {
          if (fadeStyleIntervalRef.current) {
            clearInterval(fadeStyleIntervalRef.current)
            fadeStyleIntervalRef.current = null
          }
        }
      }

      setTimeout(tryApply, 100)
      fadeStyleIntervalRef.current = setInterval(tryApply, 500)

      // 监听 DOM 变化
      if (chartContainerRef.current) {
        fadeStyleObserverRef.current = new MutationObserver(applyFadeStyles)
        fadeStyleObserverRef.current.observe(chartContainerRef.current, { childList: true, subtree: true })
      }
    })

    return () => {
      // 清理样式相关的监听器和定时器
      if (fadeStyleObserverRef.current) {
        fadeStyleObserverRef.current.disconnect()
        fadeStyleObserverRef.current = null
      }
      if (fadeStyleIntervalRef.current) {
        clearInterval(fadeStyleIntervalRef.current)
        fadeStyleIntervalRef.current = null
      }

      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove()
        } catch (error) {
          console.error(error)
        }
        tvWidgetRef.current = null
        setIsInitialized(false)
        initializedPoolRef.current = ''
      }
    }
  }, [poolId, poolPriceUnit])

  // hook 渲染 marker
  const orderType = orderTab === 'margin' ? 'margin' : 'spot'
  useDeepbookOrderMarkers(tvWidgetRef, orderMarkers, cancelOrder, poolId, orderType)

  // const handleChangeResolution = (value: ResolutionString) => {
  //   if (tvWidgetRef.current) tvWidgetRef.current.chart().setResolution(value)
  // }

  // const handleSetChartType = (chartType: number) => {
  //   if (tvWidgetRef.current) tvWidgetRef.current.activeChart().setChartType(chartType)
  // }

  // const handleToggleFullScreen = useCallback(() => {
  //   if (!tvWidgetRef.current) return
  //   try { tvWidgetRef.current.startFullscreen() } catch (error) { console.error(error) }
  // }, [])

  // const handleUndoRedo = (action: 'undo' | 'redo') => {
  //   if (!tvWidgetRef.current) return
  //   const chart = tvWidgetRef.current.chart()
  //   if (action === 'undo') chart.executeActionById(action)
  //   else if (action === 'redo') chart.executeActionById(action)
  // }

  return (
    <VStack w="100%" h="100%" px={isApp ? '0px' : '4px'} bg={'bg_secondary'}>
      <div id="tv_chart_container" ref={chartContainerRef} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }} />
    </VStack>
  )
}

export default DeepbookTradingViewChart
