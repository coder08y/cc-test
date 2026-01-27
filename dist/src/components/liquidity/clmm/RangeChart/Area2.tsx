import { ScaleLinear, area, curveStepAfter } from 'd3'
import { useMemo } from 'react'
import styled from 'styled-components'
import { ChartEntry } from './types'

const Path = styled.path<{ fill: string | undefined; opacity: number | undefined }>`
  opacity: ${({ opacity }) => opacity || 1}};
  stroke: ${({ fill, theme }) => fill ?? theme.colors.failure};
  fill: ${({ fill, theme }) => fill ?? theme.colors.failure};
`

export const Area = ({
  series,
  xScale,
  yScale,
  xValue,
  yValue,
  fill,
  opacity
}: {
  series: ChartEntry[]
  xScale: ScaleLinear<number, number>
  yScale: ScaleLinear<number, number>
  xValue: (d: ChartEntry) => number
  yValue: (d: ChartEntry) => number
  fill?: string
  opacity?: number
}) =>
  useMemo(
    () => (
      <Path
        fill={fill}
        d={
          area()
            .curve(curveStepAfter)
            .x((d: unknown) => xScale(xValue(d as ChartEntry)))
            .y1((d: unknown) => yScale(yValue(d as ChartEntry)))
            .y0(yScale(0))(
            series.filter(d => {
              const value = xScale(xValue(d))
              return value > 0 && value <= window.innerWidth
            }) as Iterable<[number, number]>
          ) ?? undefined
        }
        opacity={opacity}
      />
    ),
    [fill, series, xScale, xValue, yScale, yValue]
  )
