import useDeepBookStore from '@/store/deepbook'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { useCallback } from 'react'
import useMarginOrderUtils from './useMarginOrderUtils'

/**
 * Margin 验证函数 Hook
 * 提供各种验证函数，用于验证 pool、token、account 等
 */
export default function useMarginValidators() {
  const { currentDeepBookPool } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { getMarginUtils, getMarginManagerId } = useMarginOrderUtils()

  // 验证 Pool 和 Token
  const validatePoolAndToken = useCallback(
    (tokenInfo: Token) => {
      if (!currentDeepBookPool || !tokenInfo) {
        throw new Error('Pool or token info is missing')
      }
    },
    [currentDeepBookPool]
  )

  // 验证 Pool Assets
  const validatePoolAssets = useCallback(() => {
    if (!currentDeepBookPool?.baseAssets || !currentDeepBookPool?.quoteAssets) {
      throw new Error('Pool assets are missing')
    }
  }, [currentDeepBookPool])

  // 验证 Account
  const validateAccount = useCallback(() => {
    if (!currentAccount?.address) {
      throw new Error('Account not found')
    }
  }, [currentAccount])

  // 验证 Margin Pools
  const validateMarginPools = useCallback(() => {
    if (!currentDeepBookPool?.baseMarginPool || !currentDeepBookPool?.quoteMarginPool) {
      throw new Error('Margin pools are missing')
    }
  }, [currentDeepBookPool])

  // 获取并验证 Margin Utils 和 Margin Manager ID
  const getValidatedMarginContext = useCallback(() => {
    const marginUtils = getMarginUtils()
    const marginManagerId = getMarginManagerId()

    if (!marginManagerId) {
      throw new Error('Margin manager not found. Please initialize first.')
    }

    return { marginUtils, marginManagerId }
  }, [getMarginUtils, getMarginManagerId])

  return {
    validatePoolAndToken,
    validatePoolAssets,
    validateAccount,
    validateMarginPools,
    getValidatedMarginContext
  }
}
