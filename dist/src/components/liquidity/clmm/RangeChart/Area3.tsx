import { d } from '@cetus/utils'
import { ScaleLinear, area, curveStepAfter, scaleLinear } from 'd3'
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
}) => {
  const pathD = useMemo(() => {
    const currentXDomain = xScale.domain()
    const currentYDomain = yScale.domain()
    // console.log('🚀 ~ pathD ~ currentXDomain:', currentXDomain)
    // console.log('🚀 ~ pathD ~ currentYDomain:', currentYDomain)
    const isEqual = Number(series?.[0]?.price || 0) === Number(series?.[1]?.price || 0)
    const isDesc = Number(series?.[!isEqual ? 0 : 1]?.price || 0) > Number(series?.[!isEqual ? 1 : 2]?.price || 0)
    // console.log('🚀 ~ pathD ~ isDesc:', isDesc)
    // console.log('🚀 ~ pathD ~ series:', series)

    const newData = [...series]
    if (newData?.length > 1) {
      newData[series.length - 1] = {
        ...newData[series.length - 1],
        depth: newData[series.length - 2].depth
      }
    }

    const dgtPrice = d(currentXDomain[1]).add(d(currentXDomain[1]).sub(currentXDomain[0]).div(100)).toNumber()
    // console.log('🚀 ~ pathD ~ dgtPrice:', dgtPrice)
    const gtCurrentIndex = newData.findIndex(({ price }: any) => (isDesc ? Number(price) <= dgtPrice : Number(price) >= dgtPrice))
    const gap = d(currentXDomain[1]).sub(currentXDomain[0]).div(100)

    if (isDesc) {
      if (gtCurrentIndex >= 0 && newData[gtCurrentIndex - 1]?.depth) {
        newData.splice(gtCurrentIndex, 0, {
          ...newData[gtCurrentIndex - 1],
          price: d(currentXDomain[1]).add(gap).toNumber()
        })
      }
    } else {
      if (gtCurrentIndex >= 0 && newData[gtCurrentIndex]?.depth) {
        newData.splice(gtCurrentIndex, 0, {
          ...newData[gtCurrentIndex],
          price: dgtPrice
        })
      }
    }

    const dltPrice = d(currentXDomain[0]).add(d(currentXDomain[1]).sub(currentXDomain[0]).div(100)).toNumber()
    // console.log('🚀 ~ pathD ~ dltPrice:', dltPrice)
    const ltCurrentIndex = newData.findIndex(({ price }: any) => (isDesc ? Number(price) <= dltPrice : Number(price) >= dltPrice))
    // console.log('🚀 ~ pathD ~ gtCurrentIndex:', gtCurrentIndex)
    // console.log('🚀 ~ pathD ~ ltCurrentIndex:', ltCurrentIndex)

    if (isDesc) {
      if (ltCurrentIndex >= 0 && newData[ltCurrentIndex]?.depth) {
        newData.splice(ltCurrentIndex, 0, {
          ...newData[ltCurrentIndex],
          price: dltPrice > 0 ? dltPrice : 0
        })
      }
    } else {
      if (ltCurrentIndex - 1 >= 0 && newData[ltCurrentIndex - 1]?.depth) {
        newData.splice(ltCurrentIndex, 0, {
          ...newData[ltCurrentIndex - 1],
          price: dltPrice > 0 ? dltPrice : 0
        })
      }

      if (ltCurrentIndex === gtCurrentIndex) {
        newData.splice(ltCurrentIndex + 1, 0, {
          ...newData[ltCurrentIndex + 1],
          price: dltPrice > 0 ? d(dltPrice).add(d(dltPrice).div(1000000)).toNumber() : 0
        })
      }
    }

    // console.log('🚀 ~ pathD ~ newData:', newData)

    // console.log('🚀 ~ pathD ~ isNaN(currentYDomain[1]):', isNaN(currentYDomain[1]))

    const newYScale = isNaN(currentYDomain[1])
      ? scaleLinear()
          // .domain([0, max(series, yAccessor)] as number[])
          .domain([0, Math.max(...newData.map(item => item.depth))] as number[])
          .range([200, 0])
      : yScale
    // const newYScale = scaleLinear()
    //   .domain([0, maxDepth] as number[])
    //   .range([200, 0])
    return (
      area()
        .curve(curveStepAfter)
        .x((d: unknown) => xScale(xValue(d as ChartEntry)))
        .y1((d: unknown) => newYScale(yValue(d as ChartEntry)))
        .y0(newYScale(0))(
        newData.filter(d => {
          const value = xScale(xValue(d))
          // console.log('🚀 ~ pathD ~ value:', value)
          const valueY = newYScale(yValue(d))
          // console.log('🚀 ~ pathD ~ valueY:', valueY)

          return value >= 0 && value <= window.innerWidth
        }) as Iterable<[number, number]>
      ) ?? undefined
    )
  }, [fill, series, xScale, xValue, yScale, yValue])

  return useMemo(() => <Path fill={fill} d={pathD} opacity={opacity} />, [pathD])
}
