import { formatNumber } from '@cetus/utils'
import { useState } from 'react'
import { ChartEntry } from '../types'

interface TickTooltipProps {
  data: ChartEntry[]
  current?: number
  quoteCurrency: any
  baseCurrency: any
  isMobile?: boolean
}

export const TickTooltip = ({ data, current, quoteCurrency, baseCurrency, isMobile = false }: TickTooltipProps) => {
  const [hoveredEntry, setHoveredEntry] = useState<ChartEntry | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!data.length) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find the closest data point
    const height = rect.height
    const priceRange = Math.max(...data.map(d => d.price0)) - Math.min(...data.map(d => d.price0))
    const price = Math.min(...data.map(d => d.price0)) + (y / height) * priceRange

    const closestEntry = data.reduce((closest, current) => {
      const closestDiff = Math.abs(closest.price0 - price)
      const currentDiff = Math.abs(current.price0 - price)
      return currentDiff < closestDiff ? current : closest
    })

    setHoveredEntry(closestEntry)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredEntry(null)
    setTooltipPosition(null)
  }

  if (!hoveredEntry || !tooltipPosition) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: tooltipPosition.x + 10,
        top: tooltipPosition.y - 10,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        pointerEvents: 'none',
        zIndex: 1000,
        maxWidth: '200px'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Price: {formatNumber(hoveredEntry.price0, 6)}</div>
      <div style={{ marginBottom: '2px' }}>Liquidity: {formatNumber(hoveredEntry.activeLiquidity, 0)}</div>
      <div style={{ marginBottom: '2px' }}>
        {baseCurrency?.symbol}: {formatNumber(hoveredEntry.amount0Locked || 0, 4)}
      </div>
      <div>
        {quoteCurrency?.symbol}: {formatNumber(hoveredEntry.amount1Locked || 0, 4)}
      </div>
    </div>
  )
}
