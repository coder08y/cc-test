import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import useGetDeepBookOrderBook from '../useGetDeepBookOrderBook'
import useMarginOrderUtils from './useMarginOrderUtils'

/**
 * Margin Settle List Hook
 * 获取 margin trading 的 settle 列表
 */
export default function useMarginSettleList() {
  const { currentDeepBookPool } = useDeepBookStore()
  const { setMarginSettleList, setMarginSettleListLoading, marginManagerByAccount } = useMarginStore()
  const { getRequestPool } = useGetDeepBookOrderBook()
  const { getMarginUtils } = useMarginOrderUtils()

  const getSettleList = async () => {
    if (!currentDeepBookPool?.address) {
      setMarginSettleList([])
      setMarginSettleListLoading(false)
      return
    }

    setMarginSettleListLoading(true)
    try {
      // 从 store 获取最新的数据
      const store = useMarginStore.getState()
      const latestMarginManagerByAccount = store.marginManagerByAccount
      const marginManagerByAccountOwner = store.marginManagerByAccountOwner
      const currentAccountAddress = useAccountStore.getState().currentAccount?.address

      // 验证：确保 marginManagerByAccount 属于当前账户
      if (!currentAccountAddress || marginManagerByAccountOwner !== currentAccountAddress) {
        // console.warn('marginManagerByAccount 不属于当前账户，返回空列表', {
        //   marginManagerByAccountOwner,
        //   currentAccountAddress
        // })
        setMarginSettleList([])
        setMarginSettleListLoading(false)
        return
      }

      // 检查 marginManagerByAccount 状态
      if (!latestMarginManagerByAccount || latestMarginManagerByAccount.length === 0) {
        setMarginSettleList([])
        setMarginSettleListLoading(false)
        return
      }

      // 获取 margin manager ID（使用 currentDeepBookPool.address 匹配，因为 marginManagerByAccount 中的 deepbook_pool_id 对应 pool 的 address）
      const marginManagerId = (latestMarginManagerByAccount as any[])?.find(
        (m: any) => m?.deepbook_pool_id === currentDeepBookPool?.address
      )?.margin_manager_id

      // 构建 poolInfo（使用 margin 类型）
      const poolInfo = getRequestPool(currentDeepBookPool)

      // 获取 margin utils
      const marginUtils = getMarginUtils()
      if (
        !marginUtils ||
        !marginManagerId ||
        typeof marginManagerId !== 'string' ||
        !poolInfo?.baseCoin?.coinType ||
        !poolInfo?.quoteCoin?.coinType
      ) {
        setMarginSettleList([])
        setMarginSettleListLoading(false)
        return
      }

      // 调用 MarginUtils.getAccount 获取 settle 列表
      const res = await marginUtils.getAccount(marginManagerId, poolInfo)

      if (!res) {
        setMarginSettleList([])
        setMarginSettleListLoading(false)
        return
      }

      // 处理返回结果
      const list =
        res?.map((item: any) => {
          return wrapSettle(item)
        }) || []

      setMarginSettleList(list)
      setMarginSettleListLoading(false)
    } catch (error) {
      console.error('🚀🚀🚀 ~ useMarginSettleList.ts ~ getSettleList ~ error:', error)
      setMarginSettleList([])
      setMarginSettleListLoading(false)
    }
  }

  const wrapSettle = (item: any) => {
    const { baseAssets, quoteAssets, address } = currentDeepBookPool
    const baseSettle = d(item?.settled_balances?.base || 0)
      .div(10 ** (baseAssets?.decimals || 0))
      .toString()
    const quoteSettle = d(item?.settled_balances?.quote || 0)
      .div(10 ** (quoteAssets?.decimals || 0))
      .toString()
    const deepSettle = d(item?.settled_balances?.deep || 0)
      .div(10 ** 6)
      .toString()
    const canClaim = d(baseSettle).gt(0) || d(quoteSettle).gt(0)
    return {
      address,
      baseAssets,
      quoteAssets,
      baseSettle,
      quoteSettle,
      deepSettle,
      canClaim
    }
  }

  return { getSettleList }
}
