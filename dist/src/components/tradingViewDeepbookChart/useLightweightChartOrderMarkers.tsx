import type { IChartApi, ISeriesApi } from 'lightweight-charts'
// hooks/useLightweightChartOrderMarkers.ts
import { useEffect, useRef } from 'react'

interface OrderMarker {
  orderId: string
  side: 'Buy' | 'Sell' | 'Long' | 'Short'
  price: number
  quantity: number
  filledQuantity: number
  symbol: string
  poolInfo: any
  order?: any
  orderType?: 'spot' | 'margin'
}

const BUY_COLOR = '#67FFD8'
const SELL_COLOR = '#FF5073'

export function useLightweightChartOrderMarkers(
  chartRef: React.MutableRefObject<IChartApi | null>,
  seriesRef: React.MutableRefObject<ISeriesApi<'Candlestick'> | null>,
  orders: OrderMarker[],
  onCancelOrder: (poolInfo: any, orderId: string, orderType: 'spot' | 'margin') => void,
  currentPoolId?: string,
  orderType: 'spot' | 'margin' = 'spot'
) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<Map<string, { el: HTMLDivElement; line: HTMLDivElement; order: OrderMarker }>>(new Map())
  const rafRef = useRef<number>(0)

  const clearAll = () => {
    markersRef.current.forEach(({ el, line }) => {
      el.remove()
      line.remove()
    })
    markersRef.current.clear()
    overlayRef.current?.remove()
    overlayRef.current = null
    cancelAnimationFrame(rafRef.current)
  }

  const ensureOverlay = () => {
    if (overlayRef.current) return overlayRef.current

    const container = document.getElementById('tv_chart_container')
    if (!container) {
      console.error('ensureOverlay: tv_chart_container not found')
      return null
    }

    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative'
    }

    const el = document.createElement('div')
    el.id = 'order-markers-overlay'
    el.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
    `
    container.appendChild(el)
    overlayRef.current = el
    return el
  }

  const createMarker = (o: OrderMarker, overlay: HTMLDivElement) => {
    const isBuy = o.side === 'Buy' || o.side === 'Long'
    const color = isBuy ? BUY_COLOR : SELL_COLOR
    const sideText = o.side
    const quantity = o.quantity - o.filledQuantity
    const symbol = o.symbol

    const line = document.createElement('div')
    line.style.cssText = `
      position: absolute;
      height: 1px;
      background: transparent;
      border-bottom: 1px dashed ${color};
      pointer-events: none;
      z-index: 998;
      opacity: 0.6;
      display: none;
    `
    overlay.appendChild(line)

    const el = document.createElement('div')
    el.style.cssText = `
      position: absolute;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(18, 18, 18, 0.95);
      border: 1px solid #2A3238;
      border-radius: 6px;
      padding: 2px 6px 4px;
      font-size: 12px;
      font-weight: 400;
      pointer-events: auto;
      z-index: 999;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    `

    const closeBtn = document.createElement('span')
    closeBtn.innerHTML = '×'
    closeBtn.style.cssText = `
      color: ${color};
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      margin-left: 4px;
      opacity: 0.7;
      transition: opacity 0.2s;
    `
    closeBtn.onmouseover = () => (closeBtn.style.opacity = '1')
    closeBtn.onmouseout = () => (closeBtn.style.opacity = '0.7')
    closeBtn.onclick = e => {
      e.stopPropagation()
      const poolInfo = o.order
      if (!poolInfo) {
        console.error('useLightweightChartOrderMarkers: order object is missing', o)
        return
      }
      if (
        !poolInfo.address ||
        !poolInfo.baseAssets?.coin_type ||
        !poolInfo.baseAssets?.decimals ||
        !poolInfo.quoteAssets?.coin_type ||
        !poolInfo.quoteAssets?.decimals
      ) {
        console.error('useLightweightChartOrderMarkers: Missing required fields in order object', {
          address: poolInfo.address,
          baseAssets: poolInfo.baseAssets,
          quoteAssets: poolInfo.quoteAssets
        })
        return
      }
      const actualOrderType = o.orderType || (o.side === 'Long' || o.side === 'Short' ? 'margin' : 'spot')
      onCancelOrder(poolInfo, o.orderId, actualOrderType)
    }

    const textSpan = document.createElement('span')
    textSpan.style.color = color
    textSpan.textContent = `${sideText} ${quantity} ${symbol}`
    el.appendChild(textSpan)
    el.appendChild(closeBtn)

    el.onmouseover = () => {
      el.style.background = 'rgba(28, 28, 28, 0.98)'
      el.style.transform = 'scale(1.02)'
    }
    el.onmouseout = () => {
      el.style.background = 'rgba(18, 18, 18, 0.95)'
      el.style.transform = 'scale(1)'
    }

    overlay.appendChild(el)
    markersRef.current.set(o.orderId, { el, line, order: o })
  }

  const refresh = () => {
    const chart = chartRef.current
    const series = seriesRef.current
    if (!chart || !series) return

    const container = overlayRef.current?.parentElement
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const containerHeight = containerRect.height
    const containerWidth = containerRect.width

    if (containerHeight === 0 || containerWidth === 0) return

    // 获取价格刻度信息
    const priceScale = chart.priceScale('right')
    if (!priceScale) return

    // 获取可见的价格范围
    const priceRange = priceScale.getVisibleRange()
    if (!priceRange) return

    const { from: minPrice, to: maxPrice } = priceRange
    const priceRangeSize = maxPrice - minPrice

    if (priceRangeSize <= 0) return

    // 计算价格刻度区域的位置（Lightweight Charts 右侧价格刻度通常在右侧）
    const yAxisWidth = 80
    const markerRight = yAxisWidth + 20

    // 获取图表区域的位置（排除顶部和底部边距）
    const chartTop = 0
    const chartHeight = containerHeight

    markersRef.current.forEach(({ el, line, order: o }) => {
      if (el.offsetParent === null) {
        el.style.visibility = 'hidden'
        el.style.display = 'block'
      }

      // 计算价格在可见范围内的相对位置
      let yRatio = (o.price - minPrice) / priceRangeSize
      yRatio = Math.max(0, Math.min(1, yRatio)) // 限制在 0-1 之间

      // 转换为像素坐标（从顶部开始）
      const y = chartTop + chartHeight * (1 - yRatio) // 反转 Y 轴（价格高在上）

      const markerHeight = el.offsetHeight || el.getBoundingClientRect().height || 32
      const markerHalfHeight = markerHeight / 2

      // 判断价格是否在可见范围内
      const isInVisibleRange = yRatio >= 0 && yRatio <= 1 && !Number.isNaN(yRatio) && !Number.isNaN(y)

      if (!isInVisibleRange) {
        const isAbove = yRatio < 0 || Number.isNaN(yRatio)
        const top = isAbove ? chartTop + 20 : chartTop + chartHeight - markerHeight - 20

        el.style.visibility = 'visible'
        el.style.display = 'block'
        el.style.top = `${top}px`
        el.style.right = `${markerRight}px`
        el.style.opacity = '0.6'
        el.style.borderColor = '#666'

        line.style.display = 'none'
        return
      }

      // 价格在可见范围内
      let top = y - markerHalfHeight

      const minTop = chartTop + 20
      const maxTop = chartTop + chartHeight - markerHeight - 20
      top = Math.max(minTop, Math.min(maxTop, top))

      el.style.visibility = 'visible'
      el.style.display = 'block'
      el.style.top = `${top}px`
      el.style.right = `${markerRight}px`
      el.style.opacity = '1'

      line.style.display = 'block'
      line.style.top = `${y}px`
      line.style.left = '0'
      line.style.width = `calc(100% - ${markerRight + 10}px)`
    })
  }

  const lastRefreshTime = useRef<number>(0)

  const throttledRefresh = () => {
    const now = Date.now()
    if (now - lastRefreshTime.current < 100) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        lastRefreshTime.current = Date.now()
        refresh()
      })
      return
    }

    lastRefreshTime.current = now
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(refresh)
  }

  const prevOrdersRef = useRef<OrderMarker[]>([])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) {
      return
    }

    const overlay = ensureOverlay()
    if (!overlay) {
      console.error('Failed to create overlay')
      return
    }

    const poolAddr = currentPoolId?.includes('::') ? currentPoolId.split('::')[1] : currentPoolId
    const filtered = orders.filter(o => !poolAddr || o.poolInfo?.address === poolAddr)

    // 智能更新：对比新旧订单
    const prevOrders = prevOrdersRef.current
    const prevOrderIds = new Set(prevOrders.map(o => o.orderId))
    const currentOrderIds = new Set(filtered.map(o => o.orderId))

    // 删除不存在的订单标记
    prevOrderIds.forEach(id => {
      if (!currentOrderIds.has(id)) {
        const marker = markersRef.current.get(id)
        if (marker) {
          marker.el.remove()
          marker.line.remove()
          markersRef.current.delete(id)
        }
      }
    })

    // 添加新订单标记
    filtered.forEach(o => {
      if (!prevOrderIds.has(o.orderId)) {
        createMarker(o, overlay)
      } else {
        const marker = markersRef.current.get(o.orderId)
        if (marker) {
          marker.order = o
        }
      }
    })

    prevOrdersRef.current = filtered

    // 订阅图表事件
    chart.timeScale().subscribeVisibleTimeRangeChange(throttledRefresh)
    chart.subscribeCrosshairMove(throttledRefresh)

    // 刷新标记位置
    throttledRefresh()

    return () => {
      chart.timeScale().unsubscribeVisibleTimeRangeChange(throttledRefresh)
      chart.unsubscribeCrosshairMove(throttledRefresh)
      clearAll()
      prevOrdersRef.current = []
    }
  }, [orders, currentPoolId, chartRef.current, seriesRef.current, onCancelOrder, orderType])

  return { clear: clearAll }
}
