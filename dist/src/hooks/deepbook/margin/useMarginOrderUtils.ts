import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d } from '@cetus/utils'
import { useCallback, useMemo } from 'react'

/**
 * Margin Order 工具函数 Hook
 */
export default function useMarginOrderUtils() {
  const { currentDeepBookPool } = useDeepBookStore()
  const { deepBookSDK } = usePeripherySDKStore()
  const { currentAccount } = useAccountStore()
  const { currentMarginManagerInfoMap, marginManagerByAccount } = useMarginStore()
  const { currentBalanceManagerInfoMap } = useDeepBookStore()
  const currentBalanceManagerInfo = useMemo(() => {
    const address = currentAccount?.address
    if (!address) return null
    const storedInfo = (currentMarginManagerInfoMap as Record<string, any>)[address]
    // 验证存储的 margin manager 是否属于当前池子
    if (storedInfo && currentDeepBookPool?.address) {
      const belongsToCurrentPool = (marginManagerByAccount as any[])?.some(
        (m: any) => m?.margin_manager_id === storedInfo?.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPool.address
      )
      if (belongsToCurrentPool) {
        return storedInfo
      }
    }
    return (currentBalanceManagerInfoMap as Record<string, any>)[address] || null
  }, [currentAccount?.address, currentBalanceManagerInfoMap, currentMarginManagerInfoMap, currentDeepBookPool?.address, marginManagerByAccount])

  // 将金额转换为原始单位（考虑 decimals）
  // 返回整数字符串，因为链上需要 BigInt
  const convertAmountToRawUnits = useCallback((amount: string, decimals: number): string => {
    // 使用 toFixed(0) 移除小数部分，向下取整
    return d(amount)
      .mul(d(Math.pow(10, decimals || 0)))
      .toFixed(0)
  }, [])

  // 获取 marginUtils
  const getMarginUtils = useCallback(() => {
    const marginUtils = (deepBookSDK as any)?.MarginUtils || (deepBookSDK as any)?._marginUtils
    if (!marginUtils) {
      throw new Error('MarginUtils is not available')
    }
    return marginUtils
  }, [deepBookSDK])

  // 获取 margin manager ID
  const getMarginManagerId = useCallback((): string | null => {
    if (!currentDeepBookPool?.address) {
      return null
    }

    // 从 store 获取最新数据
    const store = useMarginStore.getState()
    const marginManagerByAccount = store.marginManagerByAccount
    const marginManagerByAccountOwner = store.marginManagerByAccountOwner
    const currentAccountAddress = useAccountStore.getState().currentAccount?.address

    // 验证：确保 marginManagerByAccount 属于当前账户
    if (!currentAccountAddress || marginManagerByAccountOwner !== currentAccountAddress) {
      return null
    }

    if (!marginManagerByAccount || marginManagerByAccount.length === 0) {
      return null
    }

    const marginManager =
      currentBalanceManagerInfo || (marginManagerByAccount as any[]).find((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
    return marginManager?.margin_manager_id || marginManager?.balance_manager_id
  }, [currentDeepBookPool?.address, currentBalanceManagerInfo, marginManagerByAccount, currentMarginManagerInfoMap, currentAccount?.address])

  // 构建 deposit 参数
  const buildDepositParams = useCallback(
    (marginManagerId: string, amountInRawUnits: string, depositCoinType: string) => {
      console.log('🚀🚀🚀 ~ useMarginOrderUtils.ts:45 ~ useMarginOrderUtils ~ currentDeepBookPool:', currentDeepBookPool)
      if (!currentDeepBookPool?.baseAssets || !currentDeepBookPool?.quoteAssets) {
        throw new Error('Pool assets are missing')
      }

      return {
        marginManager: marginManagerId,
        baseCoin: {
          coinType: currentDeepBookPool.baseAssets.coin_type,
          feed: currentDeepBookPool.baseAssets.feed
        },
        quoteCoin: {
          coinType: currentDeepBookPool.quoteAssets.coin_type,
          feed: currentDeepBookPool.quoteAssets.feed
        },
        // isBase,
        depositCoinType: depositCoinType,
        amount: amountInRawUnits
        // id: currentDeepBookPool.address
      } as {
        marginManager: string
        baseCoin: {
          coinType: string
          feed?: string
        }
        quoteCoin: {
          coinType: string
          feed?: string
        }
        // isBase: boolean
        amount: string
        depositCoinType: string
      }
    },
    [currentDeepBookPool]
  )

  /**
   * 计算初始 deposit 需要的 token 类型和数量
   * 直接使用用户输入的 token，不进行转换
   * @param collateralAmounts - 用户输入的抵押品数量 { base: string, quote: string }
   * @param isBid - 订单方向（保留参数以保持接口兼容，但不影响逻辑）
   * @param priceInput - 订单价格（保留参数以保持接口兼容，但不影响逻辑）
   * @returns { isBase: boolean, amount: string } - deposit 的 token 类型和数量
   */
  // const calculateInitialDeposit = useCallback(
  //   (collateralAmounts: { base: string; quote: string }, isBid: boolean, priceInput: string): { isBase: boolean; amount: string } => {
  //     const baseCollateral = d(collateralAmounts.base || '0')
  //     const quoteCollateral = d(collateralAmounts.quote || '0')

  //     // 优先使用 base token（如果用户输入了 base token）
  //     if (baseCollateral.gt(0)) {
  //       return {
  //         isBase: true,
  //         amount: baseCollateral.toString()
  //       }
  //     }

  //     // 如果只有 quote token，使用 quote token
  //     if (quoteCollateral.gt(0)) {
  //       return {
  //         isBase: false,
  //         amount: quoteCollateral.toString()
  //       }
  //     }

  //     // 如果两者都没有，抛出错误
  //     throw new Error('No collateral available for deposit')
  //   },
  //   []
  // )

  return {
    convertAmountToRawUnits,
    getMarginUtils,
    getMarginManagerId,
    buildDepositParams
    // calculateInitialDeposit
  }
}
