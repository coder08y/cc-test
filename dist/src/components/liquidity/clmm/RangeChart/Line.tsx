import { ScaleLinear } from 'd3'
import { useMemo } from 'react'
import styled from 'styled-components'

const theme = {
  colors: {
    primary: 'var(--chakra-colors-primary)'
  }
}
// const StyledLine = styled.line`
//   opacity: 0.5;
//   stroke-width: 2;
//   stroke: ${theme.colors.primary};
//   fill: none;
//   stroke-dasharray: 4;
// `
const StyledLine = styled.line`
  opacity: 1;
  stroke-width: 2;
  stroke: #fff;
  fill: none;
`

export const Line = ({ value, xScale, innerHeight }: { value: number; xScale: ScaleLinear<number, number>; innerHeight: number }) =>
  useMemo(() => {
    return (
      <g>
        <circle cx={xScale(Number(value))} cy="4" fill="#fff" r="4" />
        {/* <StyledLine x1={xScale(value)} y1="0" x2={xScale(value)} y2={innerHeight} /> */}
        <line x1={xScale(Number(value))} y1="0" x2={xScale(value)} y2={innerHeight} stroke="#fff" strokeWidth={2} />
      </g>
    )
  }, [value, xScale, innerHeight])
