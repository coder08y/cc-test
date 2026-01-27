import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import { useRpcListener } from '@cetus/hooks'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useAccountStore } from '@cetus/stores'
import { useEffect, useMemo, useState } from 'react'
import usePositionList, { RpcNodeError } from '../position/usePositionList'

function useMyDlmmPositions() {
  const { dlmmPosBaseListLoading, dlmmPosBaseListGroupByPool } = useDlmmPositionStore()
  const { manualRefresh } = useDlmmLiquidityStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { getPositionBaseList, getPosRelatedData } = usePositionList()
  const [rpcNodeErrorStr, setRpcNodeErrorStr] = useState('')
  const { poolId } = useQueryParams()
  /**
   * 获取个人所有仓位列表
   * Get the list of all personal positions
   * @param walletAddress string 钱包地址 Wallet address
   */
  const handleGetPositionList = async (walletAddress: string, poolId: string) => {
    try {
      const res = await getPositionBaseList(walletAddress, { clmmPool: poolId, fetchType: 'dlmm' })
      if (typeof res === 'string') {
        setRpcNodeErrorStr(res)
      }
    } catch (error) {
      if (error instanceof RpcNodeError) {
        setRpcNodeErrorStr(error.message)
      }
    }
  }

  /**
   * 初始化请求个人所有仓位列表
   * Initialize request personal position list
   */
  useEffect(() => {
    if (currentAccount?.address && poolId) {
      handleGetPositionList(currentAccount?.address, poolId)
    }
  }, [currentAccount?.address, poolId])

  /**
   * 手动刷新，重新请求个人所有仓位列表
   * Manually refresh and request personal position list
   */
  useEffect(() => {
    if (manualRefresh && currentAccount?.address && poolId) {
      handleGetPositionList(currentAccount?.address, poolId)
    }
  }, [manualRefresh])

  /**
   * 监听rpc节点切换，重新请求个人仓位列表
   * Listen for rpc node switching and request personal position list
   */
  useRpcListener({
    onRpcChange: () => {
      if (currentAccount?.address) {
        handleGetPositionList(currentAccount?.address, poolId)
      }
    }
  })
  /**
   * 获取当前池子的个人仓位列表
   * Get the personal position list of the current pool
   */
  const data = useMemo(() => {
    if (poolId) {
      const res = dlmmPosBaseListGroupByPool[poolId.toLowerCase() || '']
      if (res) {
        return res?.list
      }
      return []
    }
    return []
  }, [poolId, JSON.stringify(dlmmPosBaseListGroupByPool)])

  return {
    data,
    rpcNodeErrorStr,
    dlmmPosBaseListLoading,
    currentAccount,
    onWalletModal
  }
}

export default useMyDlmmPositions
