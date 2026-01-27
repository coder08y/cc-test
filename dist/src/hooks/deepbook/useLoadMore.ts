import { useCallback, useEffect, useRef, useState } from 'react'

interface UseLoadMoreOptions {
  onLoadMore: () => Promise<void>
  enabled: boolean // 是否启用加载更多
  dataLength: number // 当前数据长度
  isInitialLoading?: boolean // 初始数据是否正在加载
  scrollContainerRef?: React.RefObject<HTMLElement> // 滚动容器的引用（用于 IntersectionObserver 的 root）
  // orderTab: string
}

interface UseLoadMoreResult {
  loadMoreRef: React.RefObject<HTMLDivElement>
  isLoadingMore: boolean
  cursor: string | null
  hasMore: boolean
  setCursor: (cursor: string | null) => void
  setHasMore: (hasMore: boolean) => void
  setIsLoadingMore: (isLoading: boolean) => void
}

/**
 * 加载更多 hook
 * 使用 IntersectionObserver 监听滚动到底部自动加载
 */
export function useLoadMore({
  onLoadMore,
  enabled,
  dataLength,
  isInitialLoading = false,
  scrollContainerRef
  // orderTab
}: UseLoadMoreOptions): UseLoadMoreResult {
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [canObserve, setCanObserve] = useState(false) // 标记是否可以开始观察（延迟启用，避免初始化时立即触发）
  const loadingRef = useRef(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 当数据长度变化时（比如切换 tab 或数据重置），确保 isLoadingMore 被重置
  useEffect(() => {
    if (dataLength === 0) {
      setIsLoadingMore(false)
      loadingRef.current = false
      setCanObserve(false)
    }
  }, [dataLength])

  // 当初始加载完成且 cursor 存在时，延迟启用 IntersectionObserver
  // 只有当有 cursor（说明可能还有更多数据）且 hasMore 为 true 时才启用
  useEffect(() => {
    if (!isInitialLoading && cursor && dataLength > 0 && hasMore) {
      // 延迟 300ms 后才允许 IntersectionObserver 触发
      // 这个延迟确保：
      // 1. 第一页数据已经完全渲染
      // 2. 避免在初始化时立即触发加载
      const timer = setTimeout(() => {
        setCanObserve(true)
      }, 300)
      return () => {
        clearTimeout(timer)
        setCanObserve(false)
      }
    } else {
      setCanObserve(false)
    }
  }, [isInitialLoading, cursor, dataLength, hasMore])

  const loadMoreFun = useCallback(async () => {
    if (!cursor || !hasMore || loadingRef.current || isLoadingMore) return

    loadingRef.current = true
    setIsLoadingMore(true)

    try {
      await onLoadMore()
    } catch (error) {
      console.error('加载更多失败:', error)
    } finally {
      setIsLoadingMore(false)
      setTimeout(() => {
        loadingRef.current = false
      }, 300)
    }
  }, [cursor, hasMore, isLoadingMore, onLoadMore])

  useEffect(() => {
    // 只有当允许观察且满足所有条件时才启用 IntersectionObserver
    if (!loadMoreRef.current || !hasMore || !enabled || dataLength === 0 || !cursor || !canObserve) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当元素进入视口时触发加载
        if (entry.isIntersecting && !loadingRef.current && !isLoadingMore) {
          loadMoreFun()
        }
      },
      {
        root: scrollContainerRef?.current || null, // 使用指定的滚动容器，如果没有则使用视口
        rootMargin: '20px', // 提前 20px 触发，改善用户体验
        threshold: 0.1
      }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore, enabled, dataLength, cursor, canObserve, loadMoreFun, isLoadingMore])

  return {
    loadMoreRef,
    isLoadingMore,
    cursor,
    hasMore,
    setCursor,
    setHasMore,
    setIsLoadingMore
  }
}
