// import { DeepBookBalancePath } from '@/apis/path'
import useDeepBookStore from '@/store/deepbook'
// import { useFetch } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { isAvailableObject } from '@cetus/utils'
import { useEffect, useRef } from 'react'

export default function useGetDeepBookManagerBalance() {
  // const { fetchByApi } = useFetch()

  const { deepBookSDK } = usePeripherySDKStore()
  const {
    setBalanceManagerList,
    setCurrentBalanceManagerInfo,
    getCurrentBalanceManagerInfo,
    setManagerBalanceObjs,
    setManagerBalanceListObjs
    // setBalancesByApi
  } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const currentAccountRef = useRef(currentAccount?.address as string)
  useEffect(() => {
    currentAccountRef.current = currentAccount?.address as string
  }, [currentAccount?.address])

  // 获取balanceManager账户里的余额
  const getManagerBalance = async (list: any, account: string, balanceManager?: string) => {
    try {
      const coins = list.map((item: any) => {
        return {
          coinType: item.coin_type,
          decimals: item.decimals
        }
      })

      if (coins.length < 1) return []

      let deepBookAccount = balanceManager ? balanceManager : getCurrentBalanceManagerInfo(account)?.balanceManager

      if (!deepBookAccount) {
        const accounts = await getBalanceManagerInfo(account)
        if (accounts?.length > 0) {
          deepBookAccount = accounts?.[0]?.balanceManager
        }
      }

      const res = await deepBookSDK.DeepbookUtils.getManagerBalance({
        account,
        balanceManager: deepBookAccount,
        coins: [...coins]
      })

      // console.log('🚀🚀🚀 ~ useGetDeepBookManagerBalance.ts:54 ~ getManagerBalance ~ res:', res)
      setManagerBalanceObjs(res)
    } catch (error) {
      console.log('🚀 ~ file: useDeepbook.ts:245 ~ getManagerBalance ~ error:', error)
    }
  }

  // 获取balanceManager账户列表
  const getBalanceManagerInfo = async (address: string) => {
    const res = await deepBookSDK.DeepbookUtils.getBalanceManager(address)
    // console.log('🚀🚀🚀 ~ useGetDeepBookManagerBalance.ts:43 ~ getBalanceManagerInfo ~ res:', res)
    setBalanceManagerList(res)
    const currentBalanceManagerLocal = getCurrentBalanceManagerInfo(address)
    if (currentAccountRef.current == address) {
      if (currentBalanceManagerLocal && isAvailableObject(currentBalanceManagerLocal)) {
        setCurrentBalanceManagerInfo(address, currentBalanceManagerLocal)
      } else if (res && res.length > 0) {
        setCurrentBalanceManagerInfo(address, res[0])
      } else {
        setCurrentBalanceManagerInfo(address, {})
      }
      return res
    }
  }

  // 获取所有 balance manager 的余额 - 使用新的 SDK API
  const getAllManagerBalances = async (balanceManagerList: any[], coins: any[], account: string) => {
    try {
      if (!balanceManagerList || balanceManagerList.length === 0 || coins.length === 0) {
        return
      }
      // 使用新的 getAccountAllManagerBalance API
      const res = await (deepBookSDK.DeepbookUtils as any).getAccountAllManagerBalance({
        account,
        coins: [...coins]
      })
      console.log('🚀🚀🚀 ~ useGetDeepBookManagerBalance.ts:90 ~ getAllManagerBalances ~ res:', res)

      // console.log('useGetDeepBookManagerBalance --- sdk getbalance', res)

      // 将结果按 balance manager 存储
      if (res && typeof res === 'object') {
        Object.entries(res).forEach(([balanceManager, balanceObjs]) => {
          setManagerBalanceListObjs(balanceManager, balanceObjs)
        })
      }
    } catch (error) {
      console.log('🚀 ~ getAllManagerBalances ~ error:', error)
    }
  }

  // const getBalanceManagerInfoByFetch = async (balance_manager_ids: string | string[]): Promise<{ value: string; id: string; type: string }[]> => {
  //   try {
  //     // 支持传入单个或多个 balance_manager_id
  //     const idsParam = Array.isArray(balance_manager_ids) ? balance_manager_ids.join(',') : balance_manager_ids
  //     const res = await fetchByApi(DeepBookBalancePath, 'GET', { balance_manager_ids: idsParam })

  //     console.log('🚀🚀🚀 ~ useGetDeepBookManagerBalance.ts:106 ~ getBalanceManagerInfoByFetch ~ res:', res)

  //     if (res && typeof res === 'object' && res.length > 0) {
  //       setBalancesByApi(res)
  //       return res
  //     } else {
  //       setBalancesByApi([])
  //       return []
  //     }
  //   } catch (error) {
  //     console.error('🚀 ~ getBalanceManagerInfoByFetch ~ error:', error)
  //     setBalancesByApi([])
  //     return []
  //   }
  // }

  return { getBalanceManagerInfo, getManagerBalance, getAllManagerBalances }
}
