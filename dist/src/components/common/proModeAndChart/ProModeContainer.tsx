import ProModeAndChart from '@/components/common/proModeAndChart'
import useProModeStore from '@/store/pro/useProModeStore'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { memo } from 'react'

// Pro 模式容器组件，使用 memo 避免不必要的重新渲染
const ProModeContainer = memo(() => {
  const { isActive, currentPage, tokenA, tokenB, onTokenSelect, onToggleDirect, isChangeDirect, whiteTokenList, isProMode } = useProModeStore()

  const { isApp } = useWindowWidth()

  // 如果 Pro 模式未激活或不在交易页面，不渲染
  if (!isActive || !currentPage || !onTokenSelect || !onToggleDirect) {
    return null
  }

  // H5 端也需要渲染 ProModeAndChart 来提供数据加载
  // ProModeAndChart 在 H5 模式下不会渲染布局，只提供数据

  // 只有在 Pro 模式下才渲染 ProModeAndChart
  // 在 Lite 模式下，让各个页面自己处理图表渲染
  if (!isProMode) {
    return null
  }

  return (
    <ProModeAndChart
      tokenA={tokenA}
      tokenB={tokenB}
      onCoinSelect={onTokenSelect!}
      handleToggleDirect={onToggleDirect!}
      isChangeDirect={isChangeDirect}
      whiteTokenList={whiteTokenList}
    />
  )
})

ProModeContainer.displayName = 'ProModeContainer'

export default ProModeContainer
