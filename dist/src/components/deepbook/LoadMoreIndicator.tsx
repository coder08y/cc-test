import { Box, Spinner, Text } from '@chakra-ui/react'
import { forwardRef } from 'react'

interface LoadMoreIndicatorProps {
  isLoadingMore: boolean
  hasMore: boolean
  dataLength: number
  endText?: string
}

const LoadMoreIndicator = forwardRef<HTMLDivElement, LoadMoreIndicatorProps>(({ isLoadingMore, hasMore, dataLength, endText = '' }, ref) => {
  // 如果没有数据，不渲染
  if (dataLength === 0) return null

  const hasEndText = endText && endText.trim().length > 0

  // 如果不在加载中、没有更多数据、且没有结束文本，不渲染
  if (!isLoadingMore && !hasMore && !hasEndText) return null

  // 始终渲染一个固定高度的容器，确保 IntersectionObserver 能正确工作
  return (
    <Box ref={ref} display="flex" justifyContent="center" alignItems="center" minH="32px" py="8px">
      {isLoadingMore ? (
        <Spinner size="sm" color="primary" />
      ) : hasMore ? (
        // 当还有更多数据但不在加载中时，显示一个小的占位符
        // 使用较低的 opacity 让用户可以看到（调试用）
        <Box h="4px" w="100%" bg="gray.700" opacity={0.3} borderRadius="2px" />
      ) : hasEndText ? (
        <Text fontSize="12px" color="text_paragraph">
          {endText}
        </Text>
      ) : null}
    </Box>
  )
})

LoadMoreIndicator.displayName = 'LoadMoreIndicator'

export default LoadMoreIndicator
