import { useEffect } from 'react'

/**
 * 初始化游标的 hook
 * 从数据列表的最后一条记录中提取 eventCursor
 * 如果数据量小于 limit，说明已经加载完了，hasMore 应为 false
 */
export function useInitCursor(
  dataList: any[],
  cursor: string | null,
  setCursor: (cursor: string | null) => void,
  setHasMore: (hasMore: boolean) => void,
  debugLabel?: string,
  limit: number = 20
) {
  useEffect(() => {
    if (dataList && dataList.length > 0 && !cursor) {
      const lastItem: any = dataList[dataList.length - 1]
      if (lastItem?.eventCursor) {
        if (debugLabel) {
          console.log(`${debugLabel} 设置初始 cursor:`, lastItem.eventCursor)
        }
        setCursor(lastItem.eventCursor)
        // 如果数据量小于 limit，说明已经加载完了，hasMore 应为 false
        // 只有当数据量等于 limit 时，才认为可能还有更多数据
        const hasMoreData = dataList.length >= limit
        setHasMore(hasMoreData)
        if (debugLabel) {
          console.log(`${debugLabel} 设置 hasMore:`, hasMoreData, `(数据量: ${dataList.length}, limit: ${limit})`)
        }
      } else {
        // 如果没有 eventCursor，说明已经加载完了
        setHasMore(false)
      }
    } else if (dataList && dataList.length > 0 && dataList.length < limit && cursor === null) {
      // 如果数据量小于 limit 且没有 cursor，说明已经加载完了
      setHasMore(false)
    }
  }, [dataList, cursor, setCursor, setHasMore, debugLabel, limit])
}
