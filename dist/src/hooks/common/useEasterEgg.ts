import { useEffect, useRef } from 'react'

interface UseEasterEggOptions {
  /** 触发彩蛋需要的连续点击次数，默认 5 */
  clickCount?: number
  /** 点击时间窗口（毫秒），超过此时间未点击则重置计数，默认 2000 */
  timeWindow?: number
  /** 触发彩蛋时的回调函数 */
  onTrigger: (data?: any) => void
  /** 可选的验证函数，返回 false 则不处理点击 */
  validator?: (data?: any) => boolean
}

/**
 * 通用彩蛋 hook：连续点击指定次数触发回调
 * @param options 配置选项
 * @returns 点击处理函数
 */
export function useEasterEgg<T = any>(options: UseEasterEggOptions) {
  const { clickCount = 5, timeWindow = 2000, onTrigger, validator } = options

  const clickCountRef = useRef<{ count: number; lastClickTime: number }>({ count: 0, lastClickTime: 0 })
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = (data?: T) => {
    // 如果有验证函数且验证失败，则不处理
    if (validator && !validator(data)) {
      return
    }

    const now = Date.now()
    const clickData = clickCountRef.current

    // 如果距离上次点击超过时间窗口，重置计数
    if (now - clickData.lastClickTime > timeWindow) {
      clickData.count = 0
    }

    clickData.count += 1
    clickData.lastClickTime = now

    // 清除之前的定时器
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // 设置新的定时器，时间窗口后重置计数
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = { count: 0, lastClickTime: 0 }
    }, timeWindow)

    // 如果达到指定点击次数，触发彩蛋
    if (clickData.count >= clickCount) {
      clickData.count = 0 // 重置计数
      onTrigger(data)
    }
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  return handleClick
}
