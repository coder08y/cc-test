// hooks/useWebSocket.ts
import { useCallback, useEffect, useRef, useState } from 'react'

type WebSocketMessage = {
  op?: string
  source?: string
  category?: string
  sub_addrs?: string[]
  data?: any
  [key: string]: any // 允许其他字段
}

type MessageHandler<T = any> = (data: T) => void

type PendingSubscription = {
  op: string
  source?: string
  category?: string
  sub_addrs?: string[]
  data?: any
}

// 订阅配置类型
type SubscriptionConfig = {
  // 按消息类型订阅（如 'pool-price', 'subscribe' 等）
  messageType?: string
  // 按消息来源订阅（如 'deepbookv3'）
  source?: string
  // 按消息分类订阅（如 'pool-price'）
  category?: string
  // 按池地址订阅
  poolAddresses?: string[]
  // 自定义消息匹配函数
  matcher?: (message: WebSocketMessage) => boolean
}

interface UseWebSocketOptions {
  /** WebSocket 服务器 URL */
  url?: string
  /** 是否自动连接 (默认为 false) */
  autoConnect?: boolean
  /** 离开标签页后延迟断开连接的时间（毫秒），默认 5000 */
  visibilityDisconnectDelay?: number
  /** 重连间隔时间（毫秒），默认 5000 */
  reconnectInterval?: number
  /** 最大重连次数，默认 5 */
  maxReconnectAttempts?: number
  /** 心跳间隔时间（毫秒），默认 30000 */
  heartbeatInterval?: number
}

type WebSocketState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error'

// 共享的全局状态
let globalWebSocket: WebSocket | null = null
let globalMessageHandlers: Map<string, Set<MessageHandler>> = new Map()
let globalState: WebSocketState = 'disconnected'
let isManualDisconnect = false
let visibilityDisconnectTimer: NodeJS.Timeout | null = null
let pendingSubscriptions: PendingSubscription[] = []
let activeSubscriptions: Map<string, PendingSubscription> = new Map()

// 心跳检测相关状态
let heartbeatTimer: NodeJS.Timeout | null = null

// 订阅状态跟踪 - 用于区分第一次订阅和后续订阅
let hasInitialSubscription = false
let subscriptionCount = 0

// 重连补偿机制相关状态
let lastDisconnectTime = 0
let reconnectCompensationCallbacks: Set<(disconnectStartTime: number, disconnectEndTime: number) => void> = new Set()

// 添加重连补偿回调函数
const addReconnectCompensationCallback = (callback: (disconnectStartTime: number, disconnectEndTime: number) => void) => {
  reconnectCompensationCallbacks.add(callback)
}

// 移除重连补偿回调函数
const removeReconnectCompensationCallback = (callback: (disconnectStartTime: number, disconnectEndTime: number) => void) => {
  reconnectCompensationCallbacks.delete(callback)
}

// 执行重连补偿
const executeReconnectCompensation = () => {
  const now = Date.now()
  const disconnectDuration = now - lastDisconnectTime

  // 如果断开时间超过5秒，需要补偿数据
  if (disconnectDuration > 5000) {
    // console.log(`WebSocket reconnected after ${disconnectDuration}ms, executing compensation...`)
    // console.log(`Compensation time range: ${new Date(lastDisconnectTime).toISOString()} to ${new Date(now).toISOString()}`)

    // 传递精确的断开时间范围给补偿回调
    reconnectCompensationCallbacks.forEach(callback => {
      try {
        callback(lastDisconnectTime, now)
      } catch (error) {
        console.error('Error executing reconnection compensation callback:', error)
      }
    })
  }
}

/**
 * Deepbook WebSocket Hook
 *
 * 使用示例:
 *
 * ```tsx
 * const {
 *   state,
 *   isConnected,
 *   connect,
 *   disconnect,
 *   subscribe,
 *   send,
 *   subscribePoolPrice,
 *   ping,
 *   getSubscriptionStats
 * } = useDeepbookWebSocket({
 *   autoConnect: true,
 *   maxReconnectAttempts: 5
 * })
 *
 * // 订阅池价格
 * const handleSubscribe = () => {
 *   subscribePoolPrice([
 *     "0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22",
 *     "0xf948981b806057580f91622417534f491da5f61aeaf33d0ed8e69fd5691c95ce"
 *   ])
 * }
 *
 * // 订阅特定消息类型
 * useEffect(() => {
 *   const unsubscribe = subscribe('pool-price', (message) => {
 *     console.log('Received pool price update:', message)
 *   })
 *
 *   return unsubscribe
 * }, [subscribe])
 *
 * // 查看订阅统计信息
 * const stats = getSubscriptionStats()
 * console.log('Subscription stats:', stats)
 * ```
 *
 * 订阅逻辑说明：
 * - 第一次订阅时，op 字段自动设置为 'subscribe'
 * - 后续订阅时，op 字段自动设置为 'change_sub'
 * - 连接断开后重新连接时，订阅状态会重置
 */
const useDeepbookWebSocket = <T = any>(options?: UseWebSocketOptions) => {
  const [state, setState] = useState<WebSocketState>(globalState)
  const [reconnectCount, setReconnectCount] = useState(0)
  const messageHandlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map())
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reconnectAttemptsRef = useRef(0)
  const isHiddenTime = useRef(0) // 标签不可见的开始时间

  // 更新全局状态
  const updateGlobalState = useCallback((newState: WebSocketState) => {
    globalState = newState
    setState(newState)
  }, [])

  // 获取正确的订阅操作类型
  const getSubscriptionOp = useCallback(() => {
    if (!hasInitialSubscription) {
      hasInitialSubscription = true
      subscriptionCount = 1
      return 'subscribe'
    } else {
      subscriptionCount++
      return 'change_sub'
    }
  }, [])

  // 重置订阅状态（当连接断开时）
  const resetSubscriptionState = useCallback(() => {
    hasInitialSubscription = false
    subscriptionCount = 0
  }, [])

  // 发送心跳
  const sendHeartbeat = useCallback(() => {
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      try {
        const pingMsg = {
          op: 'ping'
        }
        globalWebSocket.send(JSON.stringify(pingMsg))
        // console.log('Sent ping message')
      } catch (error) {
        console.error('Failed to send heartbeat:', error)
      }
    }
  }, [])

  // 启动心跳检测
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
    }

    const interval = optionsRef.current?.heartbeatInterval || 30000
    heartbeatTimer = setInterval(() => {
      sendHeartbeat()
    }, interval)
  }, [sendHeartbeat])

  // 停止心跳检测
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }, [])

  // 检查消息是否匹配订阅条件
  const isMessageMatch = useCallback((message: WebSocketMessage, config: SubscriptionConfig): boolean => {
    // 如果提供了自定义匹配函数，优先使用
    if (config.matcher) {
      return config.matcher(message)
    }

    // 按消息类型匹配
    if (config.messageType && message.op === config.messageType) {
      return true
    }

    // 按来源匹配
    if (config.source && message.source === config.source) {
      return true
    }

    // 按分类匹配
    if (config.category && message.category === config.category) {
      return true
    }

    // 按池地址匹配
    if (config.poolAddresses && config.poolAddresses.length > 0) {
      if (message.sub_addrs && message.sub_addrs.some(addr => config.poolAddresses!.includes(addr))) {
        return true
      }
      // 也检查data中的tokenId或poolId
      if (message.data?.tokenId && config.poolAddresses.includes(message.data.tokenId)) {
        return true
      }
      if (message.data?.poolId && config.poolAddresses.includes(message.data.poolId)) {
        return true
      }
    }

    return false
  }, [])

  // 处理消息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      // console.log('Received message:', message)

      // 通知全局订阅者 - 按消息类型
      if (message.op) {
        const globalHandlers = globalMessageHandlers.get(message.op)
        if (globalHandlers) {
          globalHandlers.forEach(handler => handler(message))
        }

        // 通知当前组件的订阅者
        const componentHandlers = messageHandlersRef.current.get(message.op)
        if (componentHandlers) {
          componentHandlers.forEach(handler => handler(message))
        }
      }

      // 通知全局订阅者 - 按消息分类（如 'pool-price'）
      if (message.category) {
        const globalHandlers = globalMessageHandlers.get(message.category)
        if (globalHandlers) {
          globalHandlers.forEach(handler => handler(message))
        }

        // 通知当前组件的订阅者
        const componentHandlers = messageHandlersRef.current.get(message.category)
        if (componentHandlers) {
          componentHandlers.forEach(handler => handler(message))
        }
      }

      // 通知全局订阅者 - 按来源
      if (message.source) {
        const globalHandlers = globalMessageHandlers.get(message.source)
        if (globalHandlers) {
          globalHandlers.forEach(handler => handler(message))
        }

        // 通知当前组件的订阅者
        const componentHandlers = messageHandlersRef.current.get(message.source)
        if (componentHandlers) {
          componentHandlers.forEach(handler => handler(message))
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }, [])

  // 实际发送消息的内部函数
  const internalSend = useCallback((message: PendingSubscription) => {
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      globalWebSocket.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  // 连接 WebSocket
  const connect = useCallback(() => {
    // 重置手动断开标记
    isManualDisconnect = false

    // console.log('deepbook websocket  connect')

    if (globalWebSocket) {
      if (globalWebSocket.readyState === WebSocket.OPEN) {
        updateGlobalState('connected')
        startHeartbeat()
        return
      }
      if (globalWebSocket.readyState === WebSocket.CONNECTING) {
        updateGlobalState('connecting')
        return
      }
    }

    const url = optionsRef.current?.url || 'wss://stream.cetus.zone/ws'
    updateGlobalState('connecting')

    try {
      globalWebSocket = new WebSocket(url)

      globalWebSocket.onopen = () => {
        reconnectAttemptsRef.current = 0
        updateGlobalState('connected')
        setReconnectCount(0)
        // console.log('WebSocket connected')

        // 启动心跳检测
        startHeartbeat()

        // 重新连接后重新发送所有活跃的订阅
        activeSubscriptions.forEach(subscription => {
          internalSend(subscription)
        })

        // 执行重连补偿机制
        executeReconnectCompensation()
      }

      globalWebSocket.onmessage = handleMessage

      globalWebSocket.onclose = () => {
        updateGlobalState('disconnected')
        // console.log('WebSocket disconnected')

        // 停止心跳检测
        stopHeartbeat()

        // 重置订阅状态
        resetSubscriptionState()

        // 记录断开时间
        lastDisconnectTime = Date.now()

        // 只有非手动断开且标签页可见时才重连
        if (!isManualDisconnect && document.visibilityState === 'visible') {
          const maxAttempts = optionsRef.current?.maxReconnectAttempts || 5
          const shouldReconnect = reconnectAttemptsRef.current < maxAttempts

          if (shouldReconnect) {
            const interval = optionsRef.current?.reconnectInterval || 5000
            setTimeout(() => {
              reconnectAttemptsRef.current += 1
              setReconnectCount(prev => prev + 1)
              connect()
            }, interval)
          }
        }
      }

      globalWebSocket.onerror = error => {
        updateGlobalState('error')
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Dial error:', error)
      // 连接失败时重试
      const maxAttempts = optionsRef.current?.maxReconnectAttempts || 5
      if (reconnectAttemptsRef.current < maxAttempts) {
        setTimeout(() => {
          reconnectAttemptsRef.current += 1
          connect()
        }, optionsRef.current?.reconnectInterval || 5000)
      }
    }
  }, [handleMessage, internalSend, updateGlobalState, startHeartbeat, stopHeartbeat, resetSubscriptionState])

  // 断开 WebSocket 连接
  const disconnect = useCallback(() => {
    // 标记为手动断开
    isManualDisconnect = true

    // 停止心跳检测
    stopHeartbeat()

    if (globalWebSocket) {
      updateGlobalState('disconnecting')
      globalWebSocket.close()
      globalWebSocket = null
      updateGlobalState('disconnected')
    }
  }, [updateGlobalState, stopHeartbeat])

  // 处理标签页可见性变化
  const handleVisibilityChange = useCallback(() => {
    const disconnectDelay = optionsRef.current?.visibilityDisconnectDelay || 60000

    if (document.visibilityState === 'hidden') {
      isHiddenTime.current = new Date().getTime()
      // 标签页变为不可见，延迟断开连接
      if (visibilityDisconnectTimer) {
        clearTimeout(visibilityDisconnectTimer)
      }

      visibilityDisconnectTimer = setTimeout(() => {
        if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
          disconnect()
        }
      }, disconnectDelay)
    } else {
      // 标签页变为可见，取消延迟断开并尝试重新连接
      if (visibilityDisconnectTimer) {
        clearTimeout(visibilityDisconnectTimer)
        visibilityDisconnectTimer = null
      }

      const gap = new Date().getTime() - isHiddenTime.current
      if (gap > 300000) {
        // 超过五分钟重新加载页面
        window.location.reload()
        return
      }

      if (!globalWebSocket || globalWebSocket.readyState === WebSocket.CLOSED) {
        connect()
      }
    }
  }, [connect, disconnect])

  // 订阅消息 - 支持多种订阅方式
  const subscribe = useCallback(<T = any>(messageType: string, handler: MessageHandler<T>, config?: SubscriptionConfig) => {
    // 添加到全局订阅
    if (!globalMessageHandlers.has(messageType)) {
      globalMessageHandlers.set(messageType, new Set())
    }
    globalMessageHandlers.get(messageType)?.add(handler)

    // 添加到当前组件订阅
    if (!messageHandlersRef.current.has(messageType)) {
      messageHandlersRef.current.set(messageType, new Set())
    }
    messageHandlersRef.current.get(messageType)?.add(handler)

    // 返回取消订阅函数
    return () => {
      globalMessageHandlers.get(messageType)?.delete(handler)
      messageHandlersRef.current.get(messageType)?.delete(handler)
    }
  }, [])

  // 发送消息
  const send = useCallback(
    (message: PendingSubscription, { isSubscription = false }: { isSubscription?: boolean } = {}) => {
      // 如果是订阅消息，自动设置正确的操作类型
      if (isSubscription && message.op === 'subscribe') {
        message.op = getSubscriptionOp()
        // console.log(`Subscription operation: ${message.op} (count: ${subscriptionCount})`)
      }

      const success = internalSend(message)

      // 如果是订阅消息且发送成功，保存到活跃订阅
      if (isSubscription && success) {
        const key = `${message.op}_${message.source}_${message.category}`
        activeSubscriptions.set(key, message)
      }

      return success
    },
    [internalSend, getSubscriptionOp]
  )

  // 取消订阅
  const unsubscribe = useCallback(
    (message: PendingSubscription) => {
      const key = `${message.op}_${message.source}_${message.category}`
      // 从活跃订阅中移除
      activeSubscriptions.delete(key)

      // 发送取消订阅消息（如果需要）
      const unsubscribeMsg = {
        op: 'unsubscribe',
        source: message.source,
        category: message.category,
        sub_addrs: message.sub_addrs
      }
      internalSend(unsubscribeMsg)
    },
    [internalSend]
  )

  // 订阅 Deepbook 池价格
  const subscribePoolPrice = useCallback(
    (poolAddresses: string[]) => {
      const subscribeMsg: PendingSubscription = {
        op: 'subscribe', // 这里会自动转换为正确的操作类型
        source: 'deepbookv3',
        category: 'pool-price',
        sub_addrs: poolAddresses
      }

      return send(subscribeMsg, { isSubscription: true })
    },
    [send]
  )

  // 获取当前订阅统计信息
  const getSubscriptionStats = useCallback(() => {
    return {
      hasInitialSubscription,
      subscriptionCount,
      activeSubscriptionsCount: activeSubscriptions.size
    }
  }, [])

  // 手动发送心跳
  const ping = useCallback(() => {
    sendHeartbeat()
  }, [sendHeartbeat])

  // 初始化
  useEffect(() => {
    // 同步初始状态
    setState(globalState)

    // 如果设置了自动连接且当前未连接
    if (optionsRef.current?.autoConnect && globalState === 'disconnected') {
      connect()
    }

    // 添加 visibilitychange 事件监听
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 清理函数
    return () => {
      // 清理当前组件的订阅
      messageHandlersRef.current.clear()

      // 移除事件监听
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // 清除可能的延迟断开计时器
      if (visibilityDisconnectTimer) {
        clearTimeout(visibilityDisconnectTimer)
      }
    }
  }, [connect, handleVisibilityChange])

  return {
    state,
    isConnected: state === 'connected',
    reconnectCount,
    connect,
    disconnect,
    subscribe,
    send,
    unsubscribe,
    getSocket: () => globalWebSocket,
    // 心跳检测相关方法
    ping,
    subscribePoolPrice,
    getSubscriptionStats, // 添加新的方法
    // 重连补偿机制相关方法
    addReconnectCompensation: addReconnectCompensationCallback,
    removeReconnectCompensation: removeReconnectCompensationCallback,
    getConnectionHealth: () => ({
      state: globalState,
      isConnected: globalState === 'connected',
      isConnecting: globalState === 'connecting',
      isDisconnected: globalState === 'disconnected',
      isError: globalState === 'error',
      isDisconnecting: globalState === 'disconnecting'
    })
  }
}

export default useDeepbookWebSocket
