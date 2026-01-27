import { select, zoom, zoomIdentity } from 'd3'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ResponsiveContainer } from 'recharts'

interface ZoomableChartProps {
  width?: number
  height?: number
  zoomHeight?: number
  scaleExtent?: [number, number]
  initialZoom?: number
  onZoomChange?: (visibleRange: { startIndex: number; endIndex: number }) => void
  children: React.ReactNode
  data: any[] // 强制要求传入数据
}

// 可缩放图表高阶组件 - 只缩放X轴范围
export const ZoomController = <P extends object>(ChartComponent: React.ComponentType<P>) => {
  const ZoomableWrapper = forwardRef<any, P & ZoomableChartProps>((props, ref) => {
    const { width = 800, height = 400, zoomHeight = 400, scaleExtent = [1, 10], initialZoom = 1, onZoomChange, data, children, ...chartProps } = props

    const chartRef = useRef(null)
    const zoomContainerRef = useRef<HTMLDivElement>(null)
    const transformRef = useRef(zoomIdentity.scale(initialZoom))
    const [visibleData, setVisibleData] = useState(data || [])
    const [visibleRange, setVisibleRange] = useState({ startIndex: 0, endIndex: data?.length - 1 || 0 })

    // 将 ref 转发到基础图表组件
    useImperativeHandle(ref, () => ({
      ...chartRef.current,
      // 添加自定义方法
      zoomTo: (scale: number, centerIndex?: number) => {
        if (zoomContainerRef.current && data && data.length > 0) {
          const newTransform = zoomIdentity
            .scale(scale)
            .translate(centerIndex !== undefined ? -centerIndex * (width / data.length) * scale + width / 2 : transformRef.current.x, 0)

          select(zoomContainerRef.current).call(zoomBehavior.transform as any, newTransform)
        }
      },
      resetZoom: () => {
        if (zoomContainerRef.current && data && data.length > 0) {
          select(zoomContainerRef.current).call(zoomBehavior.transform as any, zoomIdentity.scale(1))
        }
      },
      // 获取当前可见范围
      getVisibleRange: () => visibleRange
    }))

    // 创建缩放行为
    const zoomBehavior = zoom<HTMLDivElement, unknown>()
      .scaleExtent(scaleExtent)
      .filter(event => event.type !== 'dblclick') // <- 禁用双击
      .on('zoom', event => {
        const { transform } = event
        transformRef.current = transform

        if (!data || data.length === 0) return

        // 计算可见数据范围
        const visibleWidth = width / transform.k
        const startIndex = Math.max(0, Math.floor(-transform.x / (width / data.length)))
        const endIndex = Math.min(data.length - 1, startIndex + Math.ceil(visibleWidth / (width / data.length)))

        // 至少保证有一个可视区域的数据
        if (startIndex > data?.length - 1 || endIndex - startIndex < 1) return

        // 更新可见数据和范围
        const newVisibleRange = { startIndex, endIndex }
        setVisibleData(data.slice(startIndex, endIndex + 1))

        setVisibleRange(newVisibleRange)

        // 通知父组件
        if (onZoomChange) {
          onZoomChange(newVisibleRange)
        }
      })

    // useEffect(() => {
    //   if (!zoomContainerRef.current || !data || data.length === 0) return

    //   // 创建并应用缩放行为
    //   const zoomContainer = zoomContainerRef.current

    //   // 应用 zoom 行为并禁用 dblclick.zoom
    //   select(zoomContainer).call(zoomBehavior)

    //   return () => {
    //     // 清理缩放行为
    //     select(zoomContainer).on('.zoom', null)
    //   }
    // }, [zoomBehavior, data])
    useEffect(() => {
      if (!zoomContainerRef.current || !data || data.length === 0) return

      const zoomContainer = zoomContainerRef.current

      const sel = select(zoomContainer)
      sel.call(zoomBehavior)

      // 移除所有 dblclick 的 zoom 行为
      sel.on('dblclick.zoom', null)
      sel.on('dblclick', e => e.stopPropagation()) // 防止事件冒泡再触发别的

      return () => {
        sel.on('.zoom', null)
      }
    }, [zoomBehavior, data])

    // 转发鼠标移动事件以显示 Tooltip
    // useEffect(() => {
    //   if (!zoomContainerRef.current) return

    //   const handleMouseMove = (e: MouseEvent) => {
    //     e.stopPropagation()

    //     // 转发事件到图表
    //     const chartElement = zoomContainerRef.current.parentElement?.querySelector('.recharts-surface')
    //     if (chartElement) {
    //       chartElement.dispatchEvent(
    //         new MouseEvent('mousemove', {
    //           clientX: e.clientX,
    //           clientY: e.clientY,
    //           bubbles: true
    //         })
    //       )
    //     }
    //   }

    //   zoomContainerRef.current.addEventListener('mousemove', handleMouseMove)

    //   return () => {
    //     if (zoomContainerRef.current) {
    //       zoomContainerRef.current.removeEventListener('mousemove', handleMouseMove)
    //     }
    //   }
    // }, [])

    // 当原始数据变化时重置可见数据
    useEffect(() => {
      if (data && data.length > 0) {
        setVisibleData(data)
        setVisibleRange({ startIndex: 0, endIndex: data.length - 1 })
        if (zoomContainerRef.current) {
          select(zoomContainerRef.current).call(zoomBehavior.transform as any, zoomIdentity.scale(initialZoom))
        }
      }
    }, [data])

    useEffect(() => {
      console.log('ZoomController 🚀 ~ visibleData:', visibleData)
    }, [visibleData])

    useEffect(() => {
      if (!zoomContainerRef.current) return

      const forwardToChart = (type: string, e: MouseEvent) => {
        const chartElement = zoomContainerRef.current?.parentElement?.querySelector('.recharts-surface')
        if (chartElement) {
          chartElement.dispatchEvent(
            new MouseEvent(type, {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true
            })
          )
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        e.stopPropagation()
        forwardToChart('mousemove', e)
      }

      const handleMouseLeave = (e: MouseEvent) => {
        e.stopPropagation()
        forwardToChart('mouseleave', e)
        forwardToChart('mouseout', e)
      }

      const container = zoomContainerRef.current
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }, [])

    return (
      <div style={{ position: 'relative', width, height }}>
        {/* 交互层 - 处理缩放和平移 */}
        <div
          ref={zoomContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: zoomHeight,
            zIndex: 1,
            pointerEvents: 'auto',
            cursor: 'move'
          }}
        />

        {/* 图表层 - 渲染实际图表 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent ref={chartRef} data={visibleData} {...chartProps}>
              {children}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>
    )
  })

  ZoomableWrapper.displayName = `ZoomableXAxis(${ChartComponent.displayName || ChartComponent.name || 'Chart'})`

  return ZoomableWrapper
}
