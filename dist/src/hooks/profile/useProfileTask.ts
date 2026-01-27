import useLimitListStore from '@/store/limit/useLimitList'
import usePositionStore from '@/store/position'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import useWalletHoldingsStore from '@/store/profile/walletHoldings'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import useXCetusStore from '@/store/xcetus/useXCetus'
import {
  ActiveOrderListTaskType,
  CoinHoldingTaskType,
  OwnerNFTTaskType,
  ProfileTab,
  VaultsPositionListTaskType,
  XCetusBaseInfoTaskType
} from '@/types/profile'
import { Task, useTaskQueue } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { useEffect, useRef, useState } from 'react'
import { useActiveOrders } from './useActiveOrders'
import { useOwnerNFT } from './useOwnerNFT'
import { useProfileLiquidity } from './useProfileLiquidity'
import useProfileVaults from './useProfileVaults'
import { useProfileXCetus } from './useProfileXCetus'
import { useWalletHoldings } from './useWalletHoldings'

export function useProfileTask(currentTab: ProfileTab) {
  const { currentAccount } = useAccountStore()
  const { fetchCoinHoldingList, resetUserData: resetWalletHoldings } = useWalletHoldings()
  const { fetchPosRelatedData, resetUserData: resetProfileLiquidity } = useProfileLiquidity()
  const { fetchActiveOrderList, resetUserData: resetActiveOrders } = useActiveOrders()
  const { fetchVaultsPositionList, resetUserData: resetVaultsPosition } = useProfileVaults()
  const { setAutoRefreshCount, setDcaOrderListLoading } = useActiveOrdersStore()
  const { fetchOwnerNFT, resetUserData: resetOwnerNFT } = useOwnerNFT()
  const { fetchXCetusBaseInfo } = useProfileXCetus()
  const { addTask, removeTask } = useTaskQueue()
  const [taskQueue, setTaskQueue] = useState<Task[]>([])
  const lastAccountRef = useRef(currentAccount)

  const { setOrderListLoading } = useLimitListStore()
  const { setLockCetusListLoading } = useXCetusStore()
  const { setPosBaseListLoading } = usePositionStore()
  const { setIsCoinHoldingLoading } = useWalletHoldingsStore()
  const { setVaultListLoading } = useVaultsListV2Store()
  const { setVaultsPositionLoading } = useVaultsPositionStore()

  // const { setIsAutoRefresh } = useProfileStore()
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)

  const resetUserData = () => {
    resetWalletHoldings()
    resetProfileLiquidity()
    resetActiveOrders()
    resetOwnerNFT()
    resetVaultsPosition()
  }

  useEffect(() => {
    if (!currentAccount) {
      resetUserData()
      // 断开链接
      taskQueue.forEach(task => {
        removeTask(task.id)
      })
    } else if (lastAccountRef.current?.address && lastAccountRef.current?.address !== currentAccount?.address) {
      setAutoRefreshCount(false)
      resetUserData()
      // 切换账号
      taskQueue.forEach(task => {
        removeTask(task.id)
      })
      buildTaskQueue(false)
    } else {
      // 首次链接
      buildTaskQueue(false)
    }

    lastAccountRef.current = currentAccount
  }, [currentAccount?.address])

  // 钱包coin列表任务
  const buildCoinHoldingTask = {
    id: CoinHoldingTaskType,
    run: fetchCoinHoldingList
  }

  // 获取NFT任务
  const buildOwnerNFTTask = {
    id: OwnerNFTTaskType,
    run: fetchOwnerNFT,
    onSuccess: (result: any) => {
      const { posBaseList } = result
      fetchPosRelatedData(posBaseList)
    }
  }

  // 获取xCetus基础信息任务
  const buildXCetusBaseInfoTask = {
    id: XCetusBaseInfoTaskType,
    run: fetchXCetusBaseInfo
  }

  // 订单列表任务
  const buildActiveOrderListTask = {
    id: ActiveOrderListTaskType,
    run: fetchActiveOrderList
  }

  // vaults列表任务
  const buildVaultsPositionListTask = {
    id: VaultsPositionListTaskType,
    run: fetchVaultsPositionList
  }

  /**
   * 构建任务队列
   */
  const buildTaskQueue = (isAutoRefresh: boolean) => {
    const queue = []
    setOrderListLoading(true)
    setLockCetusListLoading(true)
    setIsCoinHoldingLoading(true)
    setVaultListLoading(true)
    setDcaOrderListLoading(true)

    if (!isAutoRefresh) {
      setVaultsPositionLoading(true)
      setPosBaseListLoading(true)
    }
    // 根据当前标签页类型调整任务优先级
    if (currentTab === 'wallet') {
      queue.push(buildCoinHoldingTask, buildOwnerNFTTask, buildVaultsPositionListTask, buildActiveOrderListTask, buildXCetusBaseInfoTask)
    } else if (currentTab === 'liquidity') {
      queue.push(buildOwnerNFTTask, buildVaultsPositionListTask, buildCoinHoldingTask, buildActiveOrderListTask, buildXCetusBaseInfoTask)
    } else if (currentTab === 'orders') {
      queue.push(buildActiveOrderListTask, buildCoinHoldingTask, buildOwnerNFTTask, buildVaultsPositionListTask, buildXCetusBaseInfoTask)
    } else {
      queue.push(buildOwnerNFTTask, buildVaultsPositionListTask, buildXCetusBaseInfoTask, buildCoinHoldingTask, buildActiveOrderListTask)
    }

    setTaskQueue(queue)

    queue.forEach(task => {
      addTask(task)
    })
  }

  const refreshTask = () => {
    console.log('🚀🚀🚀 ~ useProfileTask.ts:149 ~ refreshTask ~ refreshTask:')
    if (currentAccount) {
      setIsAutoRefresh(true)
      taskQueue.forEach(task => {
        removeTask(task.id)
      })
      buildTaskQueue(true)
    }
  }

  return { refreshTask }
}
