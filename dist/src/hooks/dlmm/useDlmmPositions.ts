import useDlmmLiquidityStore from '@/store/dlmm'
import { useRpcListener } from '@cetus/hooks'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { useEffect, useState } from 'react'

function useMyPositions() {
  const { dlmmApiPoolInfo, manualRefresh } = useDlmmLiquidityStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const [rpcNodeErrorStr, setRpcNodeErrorStr] = useState('')
  const { poolAddress } = useQueryParams()
  const dlmmSdk = useSdk('dlmm')
  /**
   * 获取个人所有仓位列表
   * Get the list of all personal positions
   * @param walletAddress string 钱包地址 Wallet address
   */
  const handleGetPositionList = async (walletAddress: string) => {
    const res = await dlmmSdk?.Position?.getOwnerPositionList(walletAddress)
    if (typeof res === 'string') {
      setRpcNodeErrorStr(res)
    }
  }
  /**
   * 初始化请求个人所有仓位列表
   * Initialize request personal position list
   */
  useEffect(() => {
    if (currentAccount?.address) {
      handleGetPositionList(currentAccount?.address)
    }
  }, [currentAccount?.address])

  /**
   * 手动刷新，重新请求个人所有仓位列表
   * Manually refresh and request personal position list
   */

  useEffect(() => {
    if (manualRefresh && currentAccount?.address) {
      handleGetPositionList(currentAccount?.address)
    }
  }, [manualRefresh])

  /**
   * 监听rpc节点切换，重新请求个人仓位列表
   * Listen for rpc node switching and request personal position list
   */
  useRpcListener({
    onRpcChange: () => {
      if (currentAccount?.address) {
        handleGetPositionList(currentAccount?.address)
      }
    }
  })
  /**
   * 获取当前池子的个人仓位列表
   * Get the personal position list of the current pool
   */

  return {
    data: [],
    rpcNodeErrorStr,
    currentAccount,
    onWalletModal
  }
}

export default useMyPositions
