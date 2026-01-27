import { DeepBookMarginManagerPath } from '@/apis/path'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useFetch } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { useCallback, useEffect, useRef } from 'react'
import useMarginOrderUtils from './useMarginOrderUtils'

export default function useDeepBookMarginManager() {
  const { currentAccount } = useAccountStore()
  const { getMarginUtils } = useMarginOrderUtils()
  const { setMarginManagerByAccount, setMarginManagerByAccountOwner, setCurrentMarginManagerInfo } = useMarginStore()
  const { fetchByApi } = useFetch()
  const { currentDeepBookPool } = useDeepBookStore()

  // 使用 ref 记录上一个账户地址，用于检测账户切换
  const prevAccountRef = useRef<string | undefined>(currentAccount?.address)

  // 监听账户变化，切换账户时立即清空 marginManagerByAccount 和 currentMarginManagerInfoMap
  useEffect(() => {
    const prevAccount = prevAccountRef.current
    const currentAccountAddress = currentAccount?.address

    // 如果账户发生变化（从有账户切换到另一个账户，或从有账户切换到无账户）
    if (prevAccount !== undefined && prevAccount !== currentAccountAddress) {
      // 立即清空 marginManagerByAccount，避免旧数据影响新账户
      setMarginManagerByAccount([])
      // 清空 marginManagerByAccountOwner
      useMarginStore.getState().setMarginManagerByAccountOwner(null)

      // 清空旧账户和新账户的 currentMarginManagerInfoMap（避免显示旧数据）
      const store = useMarginStore.getState()
      const currentMarginManagerInfoMap = store.currentMarginManagerInfoMap
      const newMap = { ...currentMarginManagerInfoMap }

      // 删除旧账户的数据
      if (prevAccount) {
        delete newMap[prevAccount]
      }

      // 删除新账户的数据（如果有缓存，避免显示旧数据）
      if (currentAccountAddress) {
        delete newMap[currentAccountAddress]
      }

      // 更新 store（需要直接设置整个 map）
      useMarginStore.setState({ currentMarginManagerInfoMap: newMap })
    }

    // 更新 ref
    prevAccountRef.current = currentAccountAddress
  }, [currentAccount?.address, setMarginManagerByAccount])

  const getMarginManagerByAccount = useCallback(async () => {
    if (!currentAccount?.address) {
      return
    }

    // 保存当前账户地址，用于验证数据是否属于当前账户
    const requestAccountAddress = currentAccount.address
    console.log('🚀🚀🚀 ~ useDeepBookMarginManager.ts:59 ~ useDeepBookMarginManager ~ requestAccountAddress:', requestAccountAddress)

    try {
      const { data } = await fetchByApi(DeepBookMarginManagerPath, 'POST', { address: requestAccountAddress })
      // 请求完成时，验证账户是否还是请求开始时的值
      const currentAccountAddress = useAccountStore.getState().currentAccount?.address
      const result = data.list.sort(
        (a, b) => b?.content?.BalanceManager?.Fields?.Balances?.Fields?.Size - a?.content?.BalanceManager?.Fields?.Balances?.Fields?.Size
      )
      if (requestAccountAddress === currentAccountAddress) {
        if (data && data.list?.length) {
          setMarginManagerByAccount(data.list)
          setMarginManagerByAccountOwner(requestAccountAddress)
          setCurrentMarginManagerInfo(
            requestAccountAddress,
            result?.find((item: any) => item.deepbook_pool_id === currentDeepBookPool?.address)
          )
        } else {
          // 明确设置为空数组，表示已加载完成但没有数据
          setMarginManagerByAccount([])
          setMarginManagerByAccountOwner(requestAccountAddress)
        }
      }

      return data?.list
    } catch (error) {
      try {
        const marginUtils = getMarginUtils()
        const res = await marginUtils.getMarginManagerByAccount(requestAccountAddress)
        // 请求完成时，验证账户是否还是请求开始时的值
        const currentAccountAddress = useAccountStore.getState().currentAccount?.address
        if (requestAccountAddress === currentAccountAddress) {
          setMarginManagerByAccount(res || [])
          setMarginManagerByAccountOwner(requestAccountAddress)
        }
        return res
      } catch (error) {
        console.log('🚀🚀🚀 ~ useDeepBookMarginManager.ts:32 ~ useDeepBookMarginManager ~ error:', error)
        // 请求完成时，验证账户是否还是请求开始时的值
        const currentAccountAddress = useAccountStore.getState().currentAccount?.address
        if (requestAccountAddress === currentAccountAddress) {
          // 出错时也设置为空数组，表示已加载完成但没有数据
          setMarginManagerByAccount([])
          setMarginManagerByAccountOwner(requestAccountAddress)
        }
      }
    }
  }, [getMarginUtils, currentAccount?.address, setMarginManagerByAccount, setMarginManagerByAccountOwner])

  return { getMarginManagerByAccount }
}
