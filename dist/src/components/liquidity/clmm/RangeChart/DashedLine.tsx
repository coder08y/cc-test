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
  opacity: 0.7;
  stroke-width: 1;
  stroke: var(--chakra-colors-text_caption);
  fill: none;
`

export const DashedLine = ({ value, xScale, innerHeight }: { value: number; xScale: ScaleLinear<number, number>; innerHeight: number }) =>
  useMemo(() => <StyledLine x1={xScale(value)} y1="0" x2={xScale(value)} y2={innerHeight} strokeDasharray="4,3" />, [value, xScale, innerHeight])
