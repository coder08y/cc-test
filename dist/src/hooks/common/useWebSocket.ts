// hooks/useWebSocket.ts
import { useCallback, useEffect, useRef, useState } from 'react'

type WebSocketMessage = {
  type: string
  data: any
}

type MessageHandler<T = any> = (data: T) => void

type PendingSubscription = {
  action: string
  data?: any
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
  /** 最大重连次数，默认无限制 */
  maxReconnectAttempts?: number
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

const useWebSocket = <T = any>(options?: UseWebSocketOptions) => {
  const [state, setState] = useState<WebSocketState>(globalState)
  const [reconnectCount, setReconnectCount] = useState(0)
  const messageHandlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map())
  const optionsRef = useRef(options)
  optionsRef.current = options
  const reconnectAttemptsRef = useRef(0)

  // 更新全局状态
  const updateGlobalState = useCallback((newState: WebSocketState) => {
    globalState = newState
    setState(newState)
  }, [])

  // 处理消息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)

      // 通知全局订阅者
      const globalHandlers = globalMessageHandlers.get(message.type)
      if (globalHandlers) {
        globalHandlers.forEach(handler => handler(message.data))
      }

      // 通知当前组件的订阅者
      const componentHandlers = messageHandlersRef.current.get(message.type)
      if (componentHandlers) {
        componentHandlers.forEach(handler => handler(message.data))
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }, [])

  // 实际发送消息的内部函数
  const internalSend = useCallback((action: string, data?: any) => {
    if (globalWebSocket && globalWebSocket.readyState === WebSocket.OPEN) {
      globalWebSocket.send(JSON.stringify({ action, data }))
      return true
    }
    return false
  }, [])

  // 连接 WebSocket
  const connect = useCallback(() => {
    // 重置手动断开标记
    isManualDisconnect = false

    if (globalWebSocket) {
      if (globalWebSocket.readyState === WebSocket.OPEN) {
        updateGlobalState('connected')
        return
      }
      if (globalWebSocket.readyState === WebSocket.CONNECTING) {
        updateGlobalState('connecting')
        return
      }
    }

    const url = optionsRef.current?.url || 'wss://ws-api.suivision.xyz/ws'
    updateGlobalState('connecting')

    globalWebSocket = new WebSocket(url)

    globalWebSocket.onopen = () => {
      reconnectAttemptsRef.current = 0
      updateGlobalState('connected')
      setReconnectCount(0)
      console.log('WebSocket connected')

      // 重新连接后重新发送所有活跃的订阅
      activeSubscriptions.forEach((subscription, action) => {
        internalSend(action, subscription.data)
      })
    }

    globalWebSocket.onmessage = handleMessage

    globalWebSocket.onclose = () => {
      updateGlobalState('disconnected')
      console.log('WebSocket disconnected')

      // 只有非手动断开且标签页可见时才重连
      if (!isManualDisconnect && document.visibilityState === 'visible') {
        const maxAttempts = optionsRef.current?.maxReconnectAttempts
        const shouldReconnect = maxAttempts === undefined || reconnectAttemptsRef.current < maxAttempts

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
  }, [handleMessage, internalSend, updateGlobalState])

  // 断开 WebSocket 连接
  const disconnect = useCallback(() => {
    // 标记为手动断开
    isManualDisconnect = true

    if (globalWebSocket) {
      updateGlobalState('disconnecting')
      globalWebSocket.close()
      globalWebSocket = null
      updateGlobalState('disconnected')
    }
  }, [updateGlobalState])

  // 处理标签页可见性变化
  const handleVisibilityChange = useCallback(() => {
    const disconnectDelay = optionsRef.current?.visibilityDisconnectDelay || 5000

    if (document.visibilityState === 'hidden') {
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

      if (!globalWebSocket || globalWebSocket.readyState === WebSocket.CLOSED) {
        connect()
      }
    }
  }, [connect, disconnect])

  // 订阅消息
  const subscribe = useCallback(<T = any>(messageType: string, handler: MessageHandler<T>) => {
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
    (action: string, data?: any, { isSubscription = false }: { isSubscription?: boolean } = {}) => {
      const success = internalSend(action, data)

      // 如果是订阅消息且发送成功，保存到活跃订阅
      if (isSubscription && success) {
        activeSubscriptions.set(action, { action, data })
      }

      return success
    },
    [internalSend]
  )

  // 取消订阅
  const unsubscribe = useCallback(
    (action: string) => {
      // 从活跃订阅中移除
      activeSubscriptions.delete(action)

      // 发送取消订阅消息（如果需要）
      internalSend(`unsubscribe.${action}`)
    },
    [internalSend]
  )

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
    getSocket: () => globalWebSocket
  }
}

export default useWebSocket
