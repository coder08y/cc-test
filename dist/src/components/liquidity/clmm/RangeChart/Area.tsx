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
  fill?: string | undefined
  opacity?: number
}) =>
  // useMemo(
  //   () => (
  //     <Path
  //       opacity={opacity}
  //       fill={fill}
  //       d={
  //         area()
  //           // curveStepBefore
  //           .curve(curveStepAfter)
  //           .x((d: unknown) => xScale(xValue(d as ChartEntry)))
  //           .y1((d: unknown) => yScale(yValue(d as ChartEntry)))
  //           .y0(yScale(0))(
  //           series.filter(d => {
  //             const value = xScale(xValue(d))
  //             return value > 0 && value <= window.innerWidth
  //           }) as any
  //         ) ?? undefined
  //       }
  //     />
  //   ),
  //   [fill, opacity, series, xScale, xValue, yScale, yValue]
  // )

  {
    const pathD = useMemo(() => {
      const currentXDomain = xScale.domain()

      const descData = series?.sort((a: any, b: any) => b.price - a.price) // 降序
      const newDescData: any = []

      let isInsertRangeMin = false
      for (let i = 0; i < descData.length; i++) {
        const item: any = descData[i]
        newDescData.push(item)
        if (item?.price < currentXDomain?.[0] && !isInsertRangeMin) {
          newDescData.push({
            price: currentXDomain?.[0] + Math.pow(10, -9),
            depth: item.depth
          })
          isInsertRangeMin = true
        }
      }

      const AscData = newDescData?.sort((a: any, b: any) => a.price - b.price) // 升序
      const newAscData: any = []

      // let isInsertRangeMin = false
      let isInsertRangeMax = false
      for (let i = 0; i < AscData.length; i++) {
        const item: any = AscData[i]
        newAscData.push(item)
        if (item?.price > currentXDomain?.[1] && !isInsertRangeMax) {
          newAscData.push({
            price: currentXDomain?.[1] - Math.pow(10, -9),
            depth: item.depth
          })
          isInsertRangeMax = true
        }
      }

      // if (item?.price < currentXDomain?.[0] && !isInsertRangeMin) {
      //   newData.push({
      //     depth: item.depth,
      //     price: currentXDomain?.[0]
      //   })
      //   isInsertRangeMin = true
      // }

      return (
        area()
          // curveStepBefore
          .curve(curveStepAfter)
          .x((d: unknown) => xScale(xValue(d as ChartEntry)))
          .y1((d: unknown) => yScale(yValue(d as ChartEntry)))
          .y0(yScale(0))(
          // series.filter(d => {
          newAscData.filter((d: any) => {
            const value = xScale(xValue(d))
            return value > 0 && value <= window.innerWidth
          }) as any
        ) ?? undefined
      )
    }, [fill, opacity, series, xScale, xValue, yScale, yValue])

    return useMemo(() => {
      return <Path opacity={opacity} fill={fill} d={pathD} />
    }, [pathD])
  }
