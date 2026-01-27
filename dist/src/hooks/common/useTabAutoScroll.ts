import { RefObject, useEffect } from 'react'

interface UseTabAutoScrollOptions {
  /** 滚动容器的 ref */
  scrollContainerRef: RefObject<HTMLElement>
  /** 当前选中的 tab 值 */
  currentTabValue: string | number
  /** 第一个 tab 的值（用于左侧滚动） */
  firstTabValue?: string | number
  /** 最后一个 tab 的值（用于右侧滚动） */
  lastTabValue?: string | number
  /** 距离边缘的像素值，默认 12 */
  padding?: number
  /** 右侧固定元素的宽度（用于处理右侧遮挡），默认 0 */
  rightOffset?: number
  /** 是否启用自动滚动，默认 true */
  enabled?: boolean
}

/**
 * 自动滚动 Tab 容器，确保选中的 tab 可见
 *
 * @example
 * const scrollContainerRef = useRef<HTMLDivElement>(null)
 * useTabAutoScroll({
 *   scrollContainerRef,
 *   currentTabValue: currentTab.value,
 *   firstTabValue: 'chart',
 *   lastTabValue: 'marketDetails'
 * })
 */
export default function useTabAutoScroll({
  scrollContainerRef,
  currentTabValue,
  firstTabValue,
  lastTabValue,
  padding = 12,
  rightOffset = 0,
  enabled = true
}: UseTabAutoScrollOptions) {
  useEffect(() => {
    if (!enabled) return

    // 等待 DOM 更新后执行滚动，使用双重 requestAnimationFrame 确保 DOM 渲染完成
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer) return

        // 查找当前选中的 tab 元素
        const tabElements = scrollContainer.querySelectorAll('[data-active="true"]')
        if (tabElements.length === 0) return

        const activeTabElement = tabElements[0] as HTMLElement
        const containerRect = scrollContainer.getBoundingClientRect()
        const tabRect = activeTabElement.getBoundingClientRect()

        // 检查是否是第一个 tab 或最后一个 tab
        const isFirstTab = firstTabValue !== undefined && currentTabValue === firstTabValue
        const isLastTab = lastTabValue !== undefined && currentTabValue === lastTabValue

        if (isFirstTab) {
          // 第一个 tab: 如果被部分遮挡，滚动至距离屏幕左侧边缘 padding px
          const tabLeftOffset = tabRect.left - containerRect.left
          // 如果 tab 左边缘距离容器左边缘小于 padding，说明被遮挡了
          if (tabLeftOffset < padding) {
            const targetScrollLeft = scrollContainer.scrollLeft + tabLeftOffset - padding
            scrollContainer.scrollTo({
              left: Math.max(0, targetScrollLeft),
              behavior: 'smooth'
            })
          }
        } else if (isLastTab) {
          // 最后一个 tab: 如果被部分遮挡，滚动至距离屏幕右侧边缘 padding px
          // 考虑右侧固定元素的宽度（rightOffset）
          const containerRight = containerRect.right - rightOffset
          const tabRightOffset = tabRect.right - containerRight
          // 如果 tab 右边缘超出容器右边缘（减去右侧固定元素宽度）超过 padding，说明被遮挡了
          if (tabRightOffset > -padding) {
            const targetScrollLeft = scrollContainer.scrollLeft + tabRightOffset + padding
            const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth
            scrollContainer.scrollTo({
              left: Math.min(maxScrollLeft, Math.max(0, targetScrollLeft)),
              behavior: 'smooth'
            })
          }
        }
      })
      return () => cancelAnimationFrame(frame2)
    })

    return () => cancelAnimationFrame(frame1)
  }, [scrollContainerRef, currentTabValue, firstTabValue, lastTabValue, padding, rightOffset, enabled])
}
