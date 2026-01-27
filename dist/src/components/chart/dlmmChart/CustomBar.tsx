export default function CustomBar(props: any) {
  const { fill, x, y, width, height, radius = 2, shape } = props
  const r = height > 2 ? radius : 0
  return (
    <g>
      {shape === 'rect' ? (
        <rect x={x} y={y} width={width} height={height} fill={fill} />
      ) : (
        <path
          d={`
              M${x},${y + height}
              L${x},${y + r}
              Q${x},${y} ${x + r},${y}
              L${x + width - r},${y}
              Q${x + width},${y} ${x + width},${y + r}
              L${x + width},${y + height}
              Z
            `}
          fill={fill} // 使用数据中的颜色或默认颜色
        />
      )}
    </g>
  )
}
