import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { cancelBubble } from '@cetus/utils'
import { Box, Popover, PopoverContent, PopoverTrigger, Portal, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { SwapIndex } from './SwapIndex'
import { WidgetBtn } from './WidgetBtn'

export function SwapWidgetContainer() {
  const { isOpen, setIsOpen, swapWidgetPosition, setSwapWidgetPosition } = useSwapWidgetConfigStore()
  const { showSwapWidgetTips, setShowSwapWidgetTips } = useWebConfigStore()
  const { isApp } = useWindowWidth()

  const isDraggingRef = useRef<boolean>(false)
  const buttonRef = useRef<HTMLDivElement | null>(null)
  const previousZoomLevelRef = useRef(window.devicePixelRatio || 1)

  const [widgetPosition, setWidgetPosition] = useState({ x: 0, y: 0 })

  const popoverPosition = useMemo(() => {
    if (!buttonRef.current) return 'top-start'

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const centerX = buttonRect.left + buttonRect.width / 2
    const centerY = buttonRect.top + buttonRect.height / 2

    const spaceLeft = buttonRect.left
    const spaceRight = windowWidth - buttonRect.right
    const spaceTop = buttonRect.top
    const spaceBottom = windowHeight - buttonRect.bottom

    const isStart = centerX < windowWidth / 2 // 判断 X 是否在左边
    const isEnd = centerX >= windowWidth / 2 // 判断 X 是否在右边

    let pos = 'top-start'
    // console.log('🚀 ~ popoverPosition ~ spaceBottom:', spaceBottom, spaceTop)
    // 选择顶部还是底部
    if (spaceBottom - spaceTop > 10) {
      pos = isStart ? 'bottom-start' : 'bottom-end'
    } else {
      pos = isStart ? 'top-start' : 'top-end'
    }
    // console.log('🚀 ~ popoverPosition ~ pos:', pos, spaceTop)
    return pos
  }, [isOpen, buttonRef.current, isApp])

  const startPosition = useRef({ x: 0, y: 0 })
  // 处理拖拽开始
  const handleDragStart = (e: any, data: any) => {
    startPosition.current = { x: data.x, y: data.y }
    // isDraggingRef.current = false // 重置状态
  }

  const handleDragStop = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y }
    // 计算移动距离
    const deltaX = Math.abs(newPosition.x - startPosition.current.x)
    const deltaY = Math.abs(newPosition.y - startPosition.current.y)
    // 判断是否超过阈值（如1像素）
    if (deltaX > 1 || deltaY > 1) {
      setSwapWidgetPosition(newPosition) // 更新状态
      setTimeout(() => {
        isDraggingRef.current = false
      }, 200)
    } else {
      isDraggingRef.current = false
    }
  }

  const widgetRef = useRef<HTMLDivElement>(null) // 用于绑定组件的根节点
  const draggableRef = useRef<HTMLDivElement>(null) // 用于 Draggable 的 nodeRef
  const [widgetVisibleHight, setWidgetVisibleHight] = useState(0)
  const [widgetIsOverflow, setWidgetOverflow] = useState(false)
  const [showTopMask, setShowTopMask] = useState(false)

  // 点击空白处关闭, widget区域超过可视区域情况兼容
  useEffect(() => {
    if (!widgetRef.current) return

    const handleClickOutside = (event: MouseEvent) => {
      const path = event?.composedPath()
      const target = event.target as any

      const isClickWidget = target?.id === 'popover-trigger-PopoverId'
      if (isClickWidget) {
        return
      }

      const containsClass = path.some(node => node?.classList && node?.classList?.contains('no-close-widget-flag'))
      // console.log('🚀 ~ handleClickOutside ~ containsClass:', containsClass)

      // 如果点击的地方不在组件内，关闭组件
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node) && !containsClass) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    const checkPosition = () => {
      if (widgetRef.current) {
        const rect = widgetRef.current.getBoundingClientRect()
        const isOutOfTop = rect.top < 0 // 判断是否超出顶部
        const isOutOfBottom = rect.bottom > window.innerHeight // 判断是否超出底部

        // console.log('widget#### is out of view: ', {
        //   top: rect.top,
        //   bottom: rect.bottom,
        //   height: rect.height,
        //   windowHeight: window.innerHeight,
        //   isOutOfTop,
        //   isOutOfBottom
        // })
        setWidgetOverflow(isOutOfTop || isOutOfBottom)
      }
    }

    const calculateVisibleHeight = () => {
      if (widgetRef.current) {
        const rect = widgetRef.current.getBoundingClientRect() // 获取弹框相对于视口的位置
        const windowHeight = window.innerHeight // 获取视口高度

        // 判断可见部分的高度
        let visible = rect.height // 初始为弹框内容的总高度

        setShowTopMask(rect.top < 10)
        // console.log('🚀 ~ calculateVisibleHeight ~ rect:', {
        //   top: rect.top,
        //   bottom: rect.bottom,
        //   height: rect.height,
        //   windowHeight
        // })
        if (rect.top < 0) {
          // 如果弹框顶部超出视口
          visible = Math.min(rect.height, rect.bottom)
        } else if (rect.bottom > windowHeight) {
          // 如果弹框底部超出视口
          visible = Math.min(rect.height, windowHeight - rect.top)
        }
        console.log('🚀 ~ calculateVisibleHeight ~ visible:', {
          visible
        })
        // 在手机上，钱包签名授权弹窗，会导致visible
        if (visible <= 0 && isApp) {
          visible = rect.height
        }

        // console.log('widget#### visible height: ', Math.max(0, visible))
        setWidgetVisibleHight(Math.max(0, visible))
      }
    }

    // 使用 ResizeObserver 检测弹框高度变化
    const observer = new ResizeObserver(() => {
      checkPosition() // 每次弹框尺寸变化时重新检查位置
      calculateVisibleHeight()
    })

    if (widgetRef.current) {
      observer.observe(widgetRef.current) // 监听弹框的变化
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (widgetRef.current) {
        observer.unobserve(widgetRef.current)
      }
    }
  }, [widgetRef.current])

  useEffect(() => {
    if (isOpen) {
      // 禁止页面水平滚动
      document.body.style.overflowX = 'hidden'
    } else {
      // 恢复页面滚动
      document.body.style.overflowX = ''
    }
    return () => {
      document.body.style.overflowX = '' // 清理样式
    }
  }, [setIsOpen])

  // 添加窗口大小变化监听
  useEffect(() => {
    const handleResize = () => {
      if (!buttonRef.current) return
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const buttonWidth = buttonRect.width
      const buttonHeight = buttonRect.height
      const margin = isApp ? 8 : 20 // 边距

      // 获取当前页面的缩放比例
      const currentZoomLevel = window.devicePixelRatio || 1

      // 计算缩放比例变化导致的坐标偏移
      const zoomFactor = currentZoomLevel / previousZoomLevelRef.current
      previousZoomLevelRef.current = currentZoomLevel

      // 根据缩放比例调整位置
      const adjustedX = swapWidgetPosition.x * zoomFactor
      const adjustedY = swapWidgetPosition.y * zoomFactor

      // 确保调整后的位置不会超出可视区域
      const newX = Math.min(Math.max(0, adjustedX), windowWidth - buttonWidth - margin)
      let newY = Math.max(adjustedY, -(windowHeight - buttonHeight - 20))

      // 对Y值 进行矫正
      if (zoomFactor === 1 && newY > 0) {
        newY = -100
      }

      setSwapWidgetPosition({
        x: newX,
        y: newY
      })
    }

    window.addEventListener('resize', handleResize)
    // 初始化时也检查一次
    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [isApp, setSwapWidgetPosition])

  return (
    <Draggable
      nodeRef={draggableRef}
      allowAnyClick={false}
      bounds="parent"
      position={swapWidgetPosition}
      onDrag={(e, data) => {
        isDraggingRef.current = true
        setWidgetPosition({ x: data.x, y: data.y })
      }}
      onStop={handleDragStop}
      onStart={handleDragStart}
    >
      <VStack ref={draggableRef} zIndex={1000} position="absolute" gap="16px" bottom={isApp ? '8px' : '20px'} left={isApp ? '8px' : '20px'}>
        {/* <VStack> */}
        <Popover
          id="PopoverId"
          isLazy
          closeOnBlur={false}
          isOpen={isOpen}
          placement={popoverPosition}
          // onClose={() => setIsOpen(false)}
          trigger="click"
          autoFocus={false}
          returnFocusOnClose={false}
        >
          <PopoverTrigger>
            <Box
              ref={buttonRef}
              pointerEvents="auto"
              cursor="pointer"
              as="button"
              onTouchEnd={() => {
                setShowSwapWidgetTips(false)
                // if (showSwapWidgetTips) {
                //   return
                // }
                if (isApp) {
                  if (!isDraggingRef.current) {
                    setIsOpen(!isOpen)
                  }
                }
              }}
              onClick={() => {
                setShowSwapWidgetTips(false)
                // if (showSwapWidgetTips) {
                //   return
                // }
                if (!isApp && !isDraggingRef.current) {
                  setIsOpen(!isOpen)
                }
              }}
            >
              <WidgetBtn
                handleCloseTips={(e: any) => {
                  cancelBubble(e)
                  setIsOpen(false)
                  setShowSwapWidgetTips(false)
                }}
                isOpen={isOpen}
                popoverPosition={popoverPosition}
              />
            </Box>
          </PopoverTrigger>
          <Portal>
            <PopoverContent
              ref={widgetRef}
              w={isApp ? '90vw' : '386px'}
              bg="transparent"
              p="0px"
              borderRadius="16px"
              borderColor="transparent"
              style={{
                transform: `translate(${widgetPosition.x}px, ${widgetPosition.y}px)`
              }}
            >
              {isOpen && (
                <Box
                  pt="0px"
                  width="100%"
                  maxH={widgetIsOverflow ? `${widgetVisibleHight}px` : 'auto'}
                  overflowY={widgetIsOverflow ? 'auto' : 'visible'}
                  overflowX="hidden"
                >
                  <SwapIndex showTopMask={showTopMask} />
                </Box>
              )}
            </PopoverContent>
          </Portal>
        </Popover>
      </VStack>
    </Draggable>
  )
}
