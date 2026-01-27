import React from 'react'

interface CustomBarProps {
  payload?: any
  fill?: string
  x?: number
  y?: number
  width?: number
  height?: number
  isCurrentDay?: boolean
  isIncomplete?: boolean
}

const CustomBar: React.FC<CustomBarProps> = ({
  payload,
  fill = '#75C8FF',
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  isCurrentDay = false,
  isIncomplete = false
}) => {
  if (!isCurrentDay || !isIncomplete) {
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx="2" ry="2" />
  }

  return (
    <g>
      {/* Define shadow pattern - use base64 image directly */}
      <defs>
        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill={fill} />
          <image
            width="20"
            height="20"
            opacity="0.8"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4AgMAAABECt5BAAAADFBMVEUAAAAAAAAAAAAAAAA16TeWAAAAA3RSTlMAgH8BTzA4AAAAYElEQVR4Xu3SsQ3AIBTEUIuWYViBzVkhw6RFF/0B/vWRrnHr5qHNVBsuLLXhhaM2PAypDXYt7Ppi1hWzrtj1/u8aux7Y9cSuF3Z9sGvFWiXWYi3WYi3WYi3WYi3WYi3WPhVhAWJ8v+OTAAAAAElFTkSuQmCC"
          />
        </pattern>
      </defs>

      {/* Use shadow pattern to fill the rectangle */}
      <rect x={x} y={y} width={width} height={height} fill="url(#diagonalHatch)" rx="2" ry="2" />
    </g>
  )
}

export default CustomBar
