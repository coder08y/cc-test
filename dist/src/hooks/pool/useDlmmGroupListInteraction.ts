import { cancelBubble } from '@cetus/utils'
import { useThrottleEffect } from 'ahooks'
import { useEffect, useRef, useState } from 'react'

export default function useDlmmGroupListInteraction<T>(allData: T[], pageSize = 3, isOpen: boolean, groupId?: string) {
  const [list, setList] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [hasLoadMore, setHasLoadMore] = useState<boolean>(true)
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const parentHeaderRef = useRef<HTMLDivElement>(null)

  // 判断是否为移动端（通过groupId是否存在来判断）
  const isMobile = !!groupId

  // 监听展开状态变化，重置滚动位置和列表
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current?.scrollTo({ top: 0 })
      setList(allData?.slice(0, pageSize))
      setCurrentPage(1)
      setHasLoadMore(allData?.length > pageSize)
      setIsLoadMoreLoading(false)
    }
  }, [isOpen, groupId, allData, pageSize]) // 依赖 isOpen 和 groupId 状态

  useEffect(() => {
    if (!isOpen) {
      setList([])
      setCurrentPage(1)
      setHasLoadMore(true)
      setIsLoadMoreLoading(false)
    }
  }, [isOpen])

  // PC端：自动加载更多逻辑
  useEffect(() => {
    if (isMobile || !isOpen) return // 移动端不使用自动加载

    let observer: IntersectionObserver | null = null
    if (loadMoreRef.current) {
      observer = new IntersectionObserver(
        entries => {
          const entry = entries[0]
          if (entry && entry.isIntersecting && hasLoadMore && !isLoadMoreLoading) {
            const totalPage = allData?.length <= pageSize ? 1 : Math.ceil((allData.length - pageSize) / pageSize) + 1
            if (currentPage < totalPage) {
              setIsLoadMoreLoading(true)
              setCurrentPage(pre => pre + 1)
            }
          }
        },
        { threshold: 1 }
      )
      observer.observe(loadMoreRef.current!)
    }

    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [hasLoadMore, isLoadMoreLoading, currentPage, isMobile, isOpen, allData?.length, pageSize])

  // PC端：处理自动加载更多的数据更新
  useThrottleEffect(
    () => {
      if (isMobile || !isOpen) return // 移动端不使用自动加载

      setTimeout(() => {
        if (currentPage > 1) {
          const oldList = [...list]
          const newList = allData.slice(0, oldList?.length + pageSize)
          setList(newList)
          setIsLoadMoreLoading(false)
        }
      }, 300)
    },
    [currentPage, pageSize, isMobile, isOpen],
    {
      wait: 300
    }
  )

  useEffect(() => {
    if (isMobile || !isOpen) return // 移动端不使用自动加载

    const totalPage = allData?.length <= pageSize ? 1 : Math.ceil((allData.length - pageSize) / pageSize) + 1
    if (currentPage >= totalPage) {
      setHasLoadMore(false)
      setIsLoadMoreLoading(false)
    }
  }, [currentPage, allData?.length, pageSize, isMobile, isOpen])

  // 移动端：手动加载更多（一次性加载所有剩余数据）
  const onLoadMore = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    cancelBubble(e)
    if (!isMobile) return // PC端不使用手动加载

    // 一次性加载所有剩余的数据
    setList(allData)
    setHasLoadMore(false)

    // 滚动到新展开的第一个池子位置（表头下方）
    setTimeout(() => {
      if (parentHeaderRef.current) {
        const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
        if (scrollContainer) {
          // 获取表头高度
          const headerHeight = parentHeaderRef.current.offsetHeight
          const headerRect = parentHeaderRef.current.getBoundingClientRect()
          const currentScrollTop = scrollContainer.scrollTop
          // 计算表头在文档中的位置
          const headerTopInDocument = currentScrollTop + headerRect.top
          // 滚动到表头下方（表头位置 + 表头高度 + 间距）
          const targetScrollTop = headerTopInDocument + headerHeight + 8
          scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
        }
      }
    }, 150)
  }

  const onLoadLess = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    cancelBubble(e)
    if (!isMobile) return
    containerRef.current?.scrollTo({ top: 0 })

    setList(allData?.slice(0, pageSize))
    setCurrentPage(1)
    setHasLoadMore(true)

    // // 滚动到新展开的第一个池子位置（表头下方）
    // setTimeout(() => {
    //   if (parentHeaderRef.current) {
    //     const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
    //     if (scrollContainer) {
    //       // 获取表头高度
    //       const headerHeight = parentHeaderRef.current.offsetHeight
    //       const headerRect = parentHeaderRef.current.getBoundingClientRect()
    //       const currentScrollTop = scrollContainer.scrollTop
    //       // 计算表头在文档中的位置
    //       const headerTopInDocument = currentScrollTop + headerRect.top
    //       // 滚动到表头下方（表头位置 + 表头高度 + 间距）
    //       const targetScrollTop = headerTopInDocument + headerHeight + 8
    //       scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
    //     }
    //   }
    // }, 150)
  }

  // 根据平台返回不同的值
  if (isMobile) {
    // 移动端返回手动加载相关的值
    return {
      hasLoadMore,
      list,
      onLoadMore,
      onLoadLess,
      containerRef,
      parentHeaderRef
    }
  } else {
    // PC端返回自动加载相关的值
    return {
      hasLoadMore,
      loadMoreRef,
      list,
      isLoadMoreLoading,
      containerRef
    }
  }
}
