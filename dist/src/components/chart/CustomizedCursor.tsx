// 自定义光标组件
const CustomizedCursor = (params: any) => {
  console.log('🚀 ~ file: TvlChart.tsx:99 ~ CustomizedCursor ~ params:', params)
  const { points, width, height } = params
  // 确保 points 不为 undefined 并且有至少一个元素
  if (!points || points.length === 0) return null

  const x = points[0].x // 获取当前点的 x 坐标
  const y = points[0].y // 获取当前点的 y 坐标

  console.log('🚀 ~ file: TvlChart.tsx:103 ~ CustomizedCursor ~ x:', x)
  console.log('🚀 ~ file: TvlChart.tsx:103 ~ CustomizedCursor ~ y:', y)

  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={height} stroke="red" strokeDasharray="3 3" />
      <line x1={0} y1={y} x2={width} y2={y} stroke="red" strokeDasharray="3 3" />
    </g>
  )
}

export default CustomizedCursor
