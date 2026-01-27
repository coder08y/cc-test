import { ScaleLinear, area, curveStepAfter } from 'd3'
import { useMemo } from 'react'
import styled from 'styled-components'

import { ChartEntry } from '../types'

const Path = styled.path<{ fill: string | undefined; opacity: number | undefined }>`
  opacity: ${({ opacity }) => opacity || 1};
  stroke: none; /* 移除stroke，避免出现线条 */
  fill: ${({ fill }) => fill ?? '#ff0000'};
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
}) => {
  const pathD = useMemo(() => {
    const ascData = series.sort((a: any, b: any) => a.price0 - b.price0)

    if (ascData?.length === 2 && (ascData[1] as any).depth == 0) {
      ;(ascData[1] as any).depth = (ascData[0] as any).depth
      ascData[1].activeLiquidity = ascData[0].activeLiquidity
    }

    const testData =
      ascData[0].price0 !== 1e-10 && ascData?.length > 1
        ? [
            {
              ...ascData[0],
              price0: ascData[0].price0 - Math.pow(10, -9),
              price: ascData[0].price0 - Math.pow(10, -9),
              activeLiquidity: 0,
              depth: 0
            },
            ...ascData
          ]
        : ascData

    // if (testData?.length === 2 && testData[0].price0 === 1e-10 && testData[1].price0 === 10000000000 && (testData[1] as any).depth == 0) {
    // if (testData?.length === 2  && (testData[1] as any).depth == 0) {
    //   (testData[1] as any).depth = (testData[0] as any).depth
    //   testData[1].activeLiquidity = testData[0].activeLiquidity
    // }

    // Safari兼容性：确保坐标在合理范围内
    const validData = testData.filter((d: any) => {
      const xVal = xValue(d)
      const yVal = yValue(d)
      return isFinite(xVal) && isFinite(yVal) && xVal >= 0
    })

    if (validData.length === 0) {
      return undefined
    }

    return area()
      .curve(curveStepAfter)
      .x0(xScale(0)) // 基线：流动性为0的位置（右边）
      .x1((d: unknown) => {
        const xVal = xValue(d as ChartEntry)
        const scaledX = xScale(xVal)
        // Safari兼容性：确保X坐标在合理范围内
        return Math.max(0, Math.min(scaledX, xScale.range()[0]))
      })
      .y((d: unknown) => {
        const yVal = yValue(d as ChartEntry)
        const scaledY = yScale(yVal)
        // Safari兼容性：确保Y坐标在合理范围内
        // 注意：yScale.range()[0] 是最大值，yScale.range()[1] 是最小值
        return Math.max(yScale.range()[1], Math.min(scaledY, yScale.range()[0]))
      })(validData as any)
  }, [series, xScale, xValue, yScale, yValue])

  return useMemo(() => {
    return <Path opacity={opacity} fill={fill || undefined} d={pathD || undefined} />
  }, [pathD, opacity, fill])
}
