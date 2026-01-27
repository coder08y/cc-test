import { ScaleLinear } from 'd3'

interface HorizontalAreaProps {
  y0: number
  y1: number
  yScale: ScaleLinear<number, number>
  width: number
  axisLabelPaneWidth: number
  fill: string
  opacity: number
}

export const HorizontalArea = ({ y0, y1, yScale, width, axisLabelPaneWidth, fill, opacity }: HorizontalAreaProps) => {
  const y0Scaled = yScale(y0)
  const y1Scaled = yScale(y1)

  const areaHeight = Math.abs(y1Scaled - y0Scaled)
  const areaY = Math.min(y0Scaled, y1Scaled)

  return (
    <rect
      x={axisLabelPaneWidth}
      y={areaY}
      width={width - axisLabelPaneWidth}
      height={areaHeight}
      fill={fill}
      opacity={opacity}
      pointerEvents="none"
    />
  )
}
