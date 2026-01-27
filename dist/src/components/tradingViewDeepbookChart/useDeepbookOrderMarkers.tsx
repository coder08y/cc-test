// hooks/useDeepbookOrderMarkers.ts
import { useEffect, useRef } from 'react'
import type { IChartingLibraryWidget } from '../../../public/charting_library_new'

interface OrderMarker {
  orderId: string
  side: 'Buy' | 'Sell' | 'Long' | 'Short'
  price: number
  quantity: number
  filledQuantity: number
  symbol: string
  poolInfo: any
  order?: any // 完整的订单对象，用于取消订单
  orderType?: 'spot' | 'margin' // 订单类型，用于取消订单时判断
}

const BUY_COLOR = '#67FFD8'
const SELL_COLOR = '#FF5073'

export function useDeepbookOrderMarkers(
  tvWidgetRef: React.MutableRefObject<IChartingLibraryWidget | null>,
  orders: OrderMarker[],
  onCancelOrder: (poolInfo: any, orderId: string, orderType: 'spot' | 'margin') => void,
  currentPoolId?: string,
  orderType: 'spot' | 'margin' = 'spot'
) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<Map<string, { el: HTMLDivElement; line: HTMLDivElement; order: OrderMarker }>>(new Map())
  const chartRef = useRef<any>(null)
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

    // 直接使用 tv_chart_container
    const container = document.getElementById('tv_chart_container')
    if (!container) {
      console.error('ensureOverlay: tv_chart_container not found')
      return null
    }

    // 确保容器有相对定位
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
    // 根据 side 确定颜色和文本
    const isBuy = o.side === 'Buy' || o.side === 'Long'
    const color = isBuy ? BUY_COLOR : SELL_COLOR
    const sideText = o.side // side 已经是 'Buy'/'Sell'/'Long'/'Short'
    const quantity = o.quantity - o.filledQuantity
    const symbol = o.symbol

    // 虚线连接线
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

    // 标记标签
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

    // 创建关闭按钮
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
      // 参考 OpenOrdersTableBlock.tsx 中的调用方式：cancelOrder(item, item.orderId, orderType)
      // 传递完整的订单对象作为 poolInfo（包含 address、baseAssets、quoteAssets 等字段）
      // 与 OpenOrdersTableBlock.tsx 保持一致，直接传递完整的订单对象
      const poolInfo = o.order
      if (!poolInfo) {
        console.error('useDeepbookOrderMarkers: order object is missing', o)
        return
      }
      // 验证必需字段（getRequestPool 需要这些字段）
      if (
        !poolInfo.address ||
        !poolInfo.baseAssets?.coin_type ||
        !poolInfo.baseAssets?.decimals ||
        !poolInfo.quoteAssets?.coin_type ||
        !poolInfo.quoteAssets?.decimals
      ) {
        console.error('useDeepbookOrderMarkers: Missing required fields in order object', {
          address: poolInfo.address,
          baseAssets: poolInfo.baseAssets,
          quoteAssets: poolInfo.quoteAssets
        })
        return
      }
      // 根据订单本身的类型来判断，而不是使用全局的 orderType
      // 如果订单有 orderType 字段，使用它；否则根据 side 判断：Long/Short 是 margin，Buy/Sell 是 spot
      const actualOrderType = o.orderType || (o.side === 'Long' || o.side === 'Short' ? 'margin' : 'spot')
      onCancelOrder(poolInfo, o.orderId, actualOrderType)
    }

    // 文本内容
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
    if (!chart) return

    const panes = (chart as any).getPanes?.()
    if (!panes || panes.length === 0) return

    const rightScales = panes[0].getRightPriceScales?.()
    if (!rightScales || rightScales.length === 0) return

    const priceScale = rightScales[0]
    const realPriceScale = priceScale._priceScale
    if (!realPriceScale || typeof realPriceScale.priceToCoordinate !== 'function') return

    // 获取价格刻度区域信息
    const scaleHeight = realPriceScale.m_height ?? 400
    const scaleTop = realPriceScale._topMarginInPixels ?? 0

    // 获取容器信息
    const container = overlayRef.current?.parentElement
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const containerHeight = containerRect.height

    // 计算价格刻度区域相对于容器的偏移
    // TradingView 图表结构：容器顶部有工具栏，价格刻度区域在下方
    let realChartTopOffset = containerHeight - scaleHeight - 28

    // 尝试从 DOM 获取更精确的偏移
    const priceScaleElement = panes[0].getRightPriceScaleElement?.()
    if (priceScaleElement && overlayRef.current) {
      try {
        const scaleRect = priceScaleElement.getBoundingClientRect()
        const overlayRect = overlayRef.current.getBoundingClientRect()
        const calculatedOffset = scaleRect.top - overlayRect.top
        if (calculatedOffset > 0 && calculatedOffset < containerHeight) {
          realChartTopOffset = calculatedOffset
        }
      } catch (e) {
        // 使用回退值
      }
    }

    // 计算Y轴宽度（通常右侧价格刻度宽度约60-80px）
    const yAxisWidth = 80
    // 标记距离右侧的距离（在Y轴左侧，留出空间）
    const markerRight = yAxisWidth + 20

    markersRef.current.forEach(({ el, line, order: o }) => {
      // 确保元素已添加到DOM，才能获取准确高度
      if (el.offsetParent === null) {
        el.style.visibility = 'hidden'
        el.style.display = 'block'
      }

      const y = realPriceScale.priceToCoordinate(o.price)
      const markerHeight = el.offsetHeight || el.getBoundingClientRect().height || 32
      const markerHalfHeight = markerHeight / 2

      // priceToCoordinate 返回的 y 坐标是相对于价格刻度区域（0-scaleHeight）
      // 需要加上 realChartTopOffset 才是相对于容器的绝对坐标
      const absoluteY = realChartTopOffset + y

      // 判断价格是否在可见范围内
      const isInVisibleRange = y >= 0 && y <= scaleHeight

      if (!isInVisibleRange || y === null || Number.isNaN(y)) {
        // 价格超出可见范围，显示在边界
        const isAbove = y < 0 || Number.isNaN(y)
        const top = isAbove ? realChartTopOffset + 20 : realChartTopOffset + scaleHeight - markerHeight - 20

        el.style.visibility = 'visible'
        el.style.display = 'block'
        el.style.top = `${top}px`
        el.style.right = `${markerRight}px`
        el.style.opacity = '0.6'
        el.style.borderColor = '#666'

        line.style.display = 'none'
        return
      }

      // 价格在可见范围内，精确对齐
      // 计算标记的top位置（居中在价格线上）
      let top = absoluteY - markerHalfHeight

      // 边界处理，保持20px距离
      const minTop = realChartTopOffset + 20
      const maxTop = realChartTopOffset + scaleHeight - markerHeight - 20
      top = Math.max(minTop, Math.min(maxTop, top))

      // 设置标记位置
      el.style.visibility = 'visible'
      el.style.display = 'block'
      el.style.top = `${top}px`
      el.style.right = `${markerRight}px`
      el.style.opacity = '1'
      // el.style.borderColor = o.side === 'Buy' ? BUY_COLOR : SELL_COLOR;

      // 设置虚线位置（价格线位置）
      line.style.display = 'block'
      line.style.top = `${absoluteY}px`
      line.style.left = '0'
      // 虚线从左侧延伸到标记左侧
      line.style.width = `calc(100% - ${markerRight + 10}px)`
    })
  }

  const lastRefreshTime = useRef<number>(0)

  const throttledRefresh = () => {
    // 限制刷新频率：最多每 100ms 刷新一次
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
  const subsRef = useRef<(() => void)[]>([])

  useEffect(() => {
    const widget = tvWidgetRef.current
    if (!widget) {
      return
    }

    widget.onChartReady(() => {
      const chart = widget.activeChart?.()
      if (!chart) {
        return
      }

      chartRef.current = chart

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
          // 更新已存在的订单数据（价格可能变化）
          const marker = markersRef.current.get(o.orderId)
          if (marker) {
            marker.order = o
          }
        }
      })

      prevOrdersRef.current = filtered

      // 订阅图表事件（只订阅一次）
      if (subsRef.current.length === 0) {
        const subscribe = (event: string) => {
          // @ts-ignore
          const sub = chart[event]?.()
          if (sub?.subscribe) {
            sub.subscribe(null, throttledRefresh)
            subsRef.current.push(() => sub.unsubscribe(null, throttledRefresh))
          }
        }

        subscribe('onVisibleRangeChanged')
        subscribe('onPaneChanged')
        if (typeof (chart as any).subscribeCrosshairMove === 'function') {
          ;(chart as any).subscribeCrosshairMove(throttledRefresh)
          subsRef.current.push(() => (chart as any).subscribeCrosshairMove?.(null))
        }
      }

      // 刷新标记位置
      throttledRefresh()
    })

    return () => {
      // 清理订阅
      subsRef.current.forEach(fn => fn())
      subsRef.current = []
      clearAll()
      prevOrdersRef.current = []
    }
  }, [orders, currentPoolId, tvWidgetRef.current, onCancelOrder, orderType])

  return { clear: clearAll }
}
