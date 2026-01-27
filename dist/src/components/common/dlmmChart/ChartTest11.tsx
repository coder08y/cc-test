const AnimatedRectangle = () => {
  return (
    <svg width="200" height="100" viewBox="0 0 200 100">
      {/* 背景矩形（可选） */}
      <rect x="0" y="0" width="200" height="100" fill="#eee" />

      {/* 动画矩形 */}
      <rect x="0" y="0" width="200" height="100" fill="#4CAF50">
        <animate attributeName="height" from="0" to="100" dur="2s" fill="freeze" />
        <animate attributeName="y" from="100" to="0" dur="2s" fill="freeze" />
      </rect>
    </svg>
  )
}

export default AnimatedRectangle
