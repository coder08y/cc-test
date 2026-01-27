import { formatPriceUseInAxis } from '@cetus/utils'
import { useColorMode } from '@chakra-ui/react'
import { NumberValue, ScaleLinear, axisBottom, Axis as d3Axis, select } from 'd3'
import { useMemo } from 'react'
import styled from 'styled-components'

const StyledGroup = styled.g`
  line {
    display: none;
  }
  text {
    transform: translateY(5px);
    font-family: 'Inter';
    font-size: 12px;
  }
`

const Axis = ({ axisGenerator, isPosition }: { axisGenerator: d3Axis<NumberValue>; isPosition: boolean }) => {
  const { colorMode } = useColorMode()
  const axisRef = (axis: SVGGElement) => {
    // if (isPosition) {
    //   axis &&
    //     select(axis)
    //       .call(axisGenerator)
    //       .call(g => g.selectAll('.tick').remove())
    //       .call(g => g.select('.domain').attr('d', 'M0 0 L658 0 Z').attr('stroke', 'var(--chakra-colors-border)'))
    // } else {
    if (isPosition) {
      axis &&
        select(axis)
          .call(axisGenerator)
          // .call(g => g.selectAll('.domain').remove())
          .call(g => g.selectAll('.tick').remove())
          .call(g => g.select('.domain').attr('d', 'M0 0 L658 0 Z').attr('stroke', '#2A3238'))
    } else {
      axis &&
        select(axis)
          .call(axisGenerator)
          // .call(g => g.selectAll('.domain').remove())
          .call(g => g.selectAll('.tick').select('line').remove())
          .call(g => g.select('.domain').attr('d', 'M0 0 L658 0 Z').attr('stroke', '#2A3238'))
    }
  }

  return (
    <g
      ref={axisRef}
      style={{
        color: colorMode == 'light' ? '#000' : '#909CA4',
        opacity: colorMode == 'light' ? '0.5' : '1'
      }}
    />
  )
}

export const AxisBottom = ({
  xScale,
  innerHeight,
  offset = 0,
  isPosition = false
}: {
  xScale: ScaleLinear<number, number>
  innerHeight: number
  offset?: number
  isPosition?: boolean
}) =>
  useMemo(
    () => (
      <StyledGroup transform={`translate(0, ${innerHeight + offset})`}>
        <Axis
          axisGenerator={axisBottom(xScale)
            .ticks(5)
            .tickSize(0)
            .tickFormat((value: any) => formatPriceUseInAxis(String(value)))}
          isPosition={isPosition}
        />
      </StyledGroup>
    ),
    [innerHeight, offset, xScale, isPosition]
  )
