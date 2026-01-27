// hooks/useTradingViewOrderLines.ts
import { formatUSDPrice } from '@cetus/utils'
import { useEffect, useRef } from 'react'
import { IChartingLibraryWidget } from '../../../public/charting_library_new'

interface Order {
  id: string
  type: 'buy' | 'sell'
  avgPrice: number
  quantity: number
}

const BUY_COLOR = '#68FFD8'
const SELL_COLOR = '#FF5073'

export const useTradingViewOrderLines = (tvWidgetRef: React.MutableRefObject<IChartingLibraryWidget | null>, orders: Order[]) => {
  const linesRef = useRef<Map<string, any>>(new Map())
  const panelRef = useRef<HTMLDivElement | null>(null)

  const clearAll = (chart: any, container: HTMLElement) => {
    linesRef.current.forEach(line => {
      try {
        chart.removePriceLine(line)
      } catch (e) {
        console.warn('Failed to remove price line:', e)
      }
    })
    linesRef.current.clear()
    panelRef.current?.remove()
    panelRef.current = null
  }

  const renderPanel = (container: HTMLElement) => {
    panelRef.current?.remove()

    const panel = document.createElement('div')
    panel.style.cssText = `
      position: absolute;
      top: 12px; right: 12px;
      background: rgba(15,15,15,0.96);
      border: 1px solid #333;
      border-radius: 8px;
      padding: 10px;
      font-size: 12px;
      color: #fff;
      z-index: 10;
      min-width: 180px;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `

    let html = `<div style="margin-bottom:8px; color:#aaa; font-weight:600;">My Positions</div>`
    orders.forEach(o => {
      const color = o.type === 'buy' ? BUY_COLOR : SELL_COLOR
      html += `
        <div style="display:flex; justify-content:space-between; margin:3px 0;">
          <div style="color:${color}; font-weight:600;">${o.type.toUpperCase()}</div>
          <div>${formatUSDPrice(o.avgPrice)}</div>
          <div style="color:#aaa;">${o.quantity.toFixed(2)} SUI</div>
        </div>
      `
    })

    panel.innerHTML = html
    container.style.position = 'relative'
    container.appendChild(panel)
    panelRef.current = panel
  }

  useEffect(() => {
    if (!tvWidgetRef.current || orders.length === 0) return

    const widget = tvWidgetRef.current

    const init = () => {
      const chart = widget.activeChart() as any // Correct: 获取 IChart 实例
      const container = document.getElementById('tv_chart_container')
      if (!container) return

      clearAll(chart, container)

      // Correct: 使用 chart.createPriceLine
      orders.forEach(order => {
        const line = chart.createPriceLine({
          price: order.avgPrice,
          color: order.type === 'buy' ? BUY_COLOR : SELL_COLOR,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          axisLabelColor: order.type === 'buy' ? BUY_COLOR : SELL_COLOR,
          axisLabelTextColor: '#000',
          title: `${order.type.toUpperCase()}: ${formatUSDPrice(order.avgPrice)}`
        })
        linesRef.current.set(order.id, line)
      })

      renderPanel(container)
    }

    // 等待图表 ready
    widget.onChartReady(init)

    return () => {
      if (widget.headerReady?.() as any) {
        const chart = widget.activeChart()
        const container = document.getElementById('tv_chart_container')
        if (container) clearAll(chart, container)
      }
    }
  }, [tvWidgetRef.current, orders])
}
