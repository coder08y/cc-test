import { addresses } from '@mayanfinance/swap-sdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

// Mayan交易状态类型定义
export interface MayanTransactionStatus {
  id: string
  trader: string
  sourceTxHash: string
  status: string
  clientStatus: string
  fromTokenSymbol: string
  toTokenSymbol: string
  fromAmount: string
  toAmount: string
  initiatedAt: string
  completedAt?: string
  txs: Array<{
    txHash: string
    goals: string[]
    scannerUrl: string
  }>
  steps: Array<{
    title: string
    status: string
    type: string
  }>
}

// 查询Mayan交易状态的函数
export const queryMayanTransactionStatus = async (txHash: string): Promise<MayanTransactionStatus | null> => {
  try {
    const response = await fetch(`${addresses.EXPLORER_URL}/swap/trx/${txHash}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to query Mayan transaction status:', error)
    return null
  }
}

interface UseMayanTransactionStatusParams {
  txHash?: string
  enabled?: boolean
  maxAttempts?: number
  interval?: number
  onStatusUpdate?: (status: MayanTransactionStatus) => void
  onComplete?: (status: MayanTransactionStatus) => void
  onError?: (error: Error) => void
}

interface UseMayanTransactionStatusReturn {
  status: MayanTransactionStatus | null
  isLoading: boolean
  error: Error | null
  isCompleted: boolean
  isFailed: boolean
  stopPolling: () => void
  startPolling: () => void
}

export const useMayanTransactionStatus = ({
  txHash,
  enabled = true,
  maxAttempts = 60,
  interval = 5000,
  onStatusUpdate,
  onComplete,
  onError
}: UseMayanTransactionStatusParams): UseMayanTransactionStatusReturn => {
  const [isPollingEnabled, setIsPollingEnabled] = useState(enabled)
  const attemptsRef = useRef(0)
  const isCompletedRef = useRef(false)
  const isFailedRef = useRef(false)

  // 使用React Query进行轮询查询
  const {
    data: status,
    isLoading,
    error
  } = useQuery({
    queryKey: ['mayan-transaction-status', txHash],
    queryFn: async () => {
      if (!txHash) return null

      attemptsRef.current++

      // 检查是否超过最大尝试次数
      if (attemptsRef.current > maxAttempts) {
        throw new Error('Transaction status polling timeout')
      }

      const result = await queryMayanTransactionStatus(txHash)
      return result
    },
    enabled: !!txHash && isPollingEnabled,
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    retry: false,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })

  // 处理查询结果
  useEffect(() => {
    if (!status) return

    // 通知状态更新
    onStatusUpdate?.(status)

    // 检查交易是否完成
    if (status.clientStatus === 'COMPLETED' && !isCompletedRef.current) {
      isCompletedRef.current = true
      onComplete?.(status)
      setIsPollingEnabled(false) // 停止轮询
    }

    // 检查交易是否失败
    if (status.clientStatus === 'FAILED' && !isFailedRef.current) {
      isFailedRef.current = true
      const failedError = new Error('Transaction failed')
      onError?.(failedError)
      setIsPollingEnabled(false) // 停止轮询
    }
  }, [status, onStatusUpdate, onComplete, onError])

  // 处理查询错误
  useEffect(() => {
    if (error && !isFailedRef.current) {
      isFailedRef.current = true
      onError?.(error)
      setIsPollingEnabled(false) // 停止轮询
    }
  }, [error, onError])

  // 重置状态
  const resetState = () => {
    attemptsRef.current = 0
    isCompletedRef.current = false
    isFailedRef.current = false
    setIsPollingEnabled(true)
  }

  // 开始轮询
  const startPolling = () => {
    if (txHash) {
      resetState()
    }
  }

  // 停止轮询
  const stopPolling = () => {
    setIsPollingEnabled(false)
  }

  // 当txHash或enabled变化时重置状态
  useEffect(() => {
    if (txHash && enabled) {
      resetState()
    } else {
      setIsPollingEnabled(false)
    }
  }, [txHash, enabled])

  return {
    status: status || null,
    isLoading,
    error: error as Error | null,
    isCompleted: isCompletedRef.current,
    isFailed: isFailedRef.current,
    stopPolling,
    startPolling
  }
}

export const pollMayanTransactionStatus = async (
  txHash: string,
  onStatusUpdate: (status: MayanTransactionStatus) => void,
  onComplete: (status: MayanTransactionStatus) => void,
  onError: (error: Error) => void,
  maxAttempts: number = 60,
  interval: number = 10 * 1000
): Promise<void> => {
  let attempts = 0

  const poll = async () => {
    if (attempts >= maxAttempts) {
      onError(new Error('Transaction status polling timeout'))
      return
    }

    attempts++

    try {
      const status = await queryMayanTransactionStatus(txHash)

      if (!status) {
        // 如果查询失败，继续轮询
        setTimeout(poll, interval)
        return
      }

      // 通知状态更新
      onStatusUpdate(status)

      // 检查交易是否完成
      if (status.clientStatus === 'COMPLETED') {
        onComplete(status)
        return
      }

      // 检查交易是否失败
      if (status.clientStatus === 'FAILED') {
        onError(new Error('Transaction failed'))
        return
      }

      // 继续轮询
      setTimeout(poll, interval)
    } catch (error) {
      console.error('Error polling transaction status:', error)
      // 即使出错也继续轮询
      setTimeout(poll, interval)
    }
  }

  // 开始轮询
  poll()
}
