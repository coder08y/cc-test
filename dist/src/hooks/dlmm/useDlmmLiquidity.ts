import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { useAccountBalance, useInterval } from '@cetus/hooks'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { isAvailableObject, textEllipses } from '@cetus/utils'
import { useEffect, useMemo } from 'react'
import useQuoteWhiteTokenList from '../create-pool/useQuoteWhiteTokenList'
import useGetDlmmContractPoolInfo from './useGetDlmmContractPoolInfo'
import useDlmmLiquidityInteraction from './useLiquidityInteraction'

function useDlmmLiquidity() {
  const { currentAccount } = useAccountStore()
  const { fetchAccountBalance } = useAccountBalance()
  const {
    dlmmApiPoolInfo,
    dlmmContractPoolInfo,
    setActiveBin,
    currentBinStep,
    setCurrentBinStep,
    manualRefresh,
    setCurrentPrice,
    setManualRefresh,
    resetLiquidity
  } = useDlmmLiquidityStore()
  const { fromToken, toToken, setFromToken, setToToken, resetAddLiquidity, setChartRefreshTrigger } = useAddDlmmLiquidityStore()
  const {
    currentTab,
    setCurrentTab,
    tabList,
    favoriteStyle,
    onChangeFavorites,
    selectedTokenA,
    selectedTokenB,
    setSelectedTokenA,
    setSelectedTokenB,
    onConfirm,
    refreshMarketPrice,
    onJump2Swap,
    onJumpAddIncentive,
    handleSelectToken,
    getSelectTokenProps,
    binStep,
    setBinStep,
    getCurrentPrice,
    getList,
    relatedPoolList,
    binStepList,
    currentBaseFee,
    fetchPriceRange,
    baseFee,
    setBaseFee
  } = useDlmmLiquidityInteraction()
  const dlmmSdk = useSdk('dlmm')
  const { poolId } = useQueryParams()

  const { quoteWhiteTokenList } = useQuoteWhiteTokenList()
  const { getTokenInfo } = useGetToken()

  const { getDlmmContractPoolInfo } = useGetDlmmContractPoolInfo()

  // 设置代币 Set tokens
  useEffect(() => {
    if (isAvailableObject(dlmmApiPoolInfo) && isAvailableObject(dlmmContractPoolInfo)) {
      setFromToken(dlmmApiPoolInfo?.displayTokenA)
      setToToken(dlmmApiPoolInfo?.displayTokenB)
      fetchPriceRange(dlmmApiPoolInfo?.poolId, dlmmContractPoolInfo!.binStep, dlmmApiPoolInfo!.tokenA, dlmmApiPoolInfo!.tokenB)
    }
  }, [dlmmApiPoolInfo?.poolId, dlmmContractPoolInfo?.binStep])

  useEffect(() => {
    setCurrentBinStep(dlmmContractPoolInfo?.binStep)
  }, [dlmmContractPoolInfo?.binStep])

  const onBinStepChange = (item: any) => {
    setCurrentBinStep(item?.binStep)
  }
  /**
   * 获取当前池子的token兑换价格
   * Get the token exchange price of the current pool
   */
  const handleGetPrice = async () => {
    if (poolId && dlmmApiPoolInfo && poolId === dlmmApiPoolInfo?.poolAddress) {
      const _contractPoolInfo = await getDlmmContractPoolInfo(poolId)
      if (_contractPoolInfo) {
        getCurrentPrice({ ..._contractPoolInfo, dlmmApiPoolInfo })
      }
    }
  }

  /**
   * 每5秒获取一次合约当前价格
   * 只有在有效的poolId时才启动定时器
   */
  const { startTimer, stopTimer } = useInterval({
    interval: 5 * 1000,
    callback: () => {
      handleGetPrice()
    }
  })

  // 根据poolId状态控制定时器
  useEffect(() => {
    if (poolId && poolId !== 'undefined' && dlmmApiPoolInfo?.poolAddress) {
      startTimer()
    } else {
      stopTimer()
    }

    return () => stopTimer()
  }, [poolId, dlmmApiPoolInfo?.poolAddress, startTimer, stopTimer])

  const handleRefreshPrice = () => {
    refreshMarketPrice?.()
    handleGetPrice?.()
  }

  /**
   * 刷新按钮事件
   * Refresh button event
   * @param isManual 是否手动刷新
   */
  const handleRefresh = async (isManual?: boolean) => {
    if (isManual) {
      setManualRefresh(true)
      handleRefreshPrice()
    }
    if (poolId && poolId !== 'undefined') {
      await getList({ poolId })
    }
    if (currentAccount?.address) {
      await fetchAccountBalance()
    }
    setChartRefreshTrigger()
    handleRefreshActiveBin()
    setTimeout(() => {
      setManualRefresh(false)
    }, 1000)
  }

  useEffect(() => {
    if (dlmmContractPoolInfo) {
      handleRefreshActiveBin()
    }
  }, [dlmmContractPoolInfo?.activeId, dlmmContractPoolInfo?.id])

  const handleRefreshActiveBin = async () => {
    if (dlmmContractPoolInfo) {
      const { bin_manager } = dlmmContractPoolInfo
      const { activeId, binStep } = dlmmContractPoolInfo
      dlmmSdk?.Pool.getBinInfo(bin_manager.bin_manager_handle, activeId, binStep).then(res => {
        setActiveBin(res)
      })
    }
  }

  /**
   * 生成当前池子deposit的token切换tab列表
   * Generate the token switch tab list for the current pool deposit
   */
  const rangeTabList = useMemo(() => {
    if (isAvailableObject(dlmmApiPoolInfo?.displayTokenA) && isAvailableObject(dlmmApiPoolInfo?.displayTokenB)) {
      return [dlmmApiPoolInfo?.displayTokenA, dlmmApiPoolInfo?.displayTokenB]?.filter(Boolean).map((item, index) => ({
        label: textEllipses(item?.symbol, 8),
        key: item?.coinType,
        isToken: true,
        imgInfo: {
          src: item?.logo_url,
          w: '16px',
          h: '16px',
          coinType: item ? item?.coinType : '',
          showTagWidth: '8px',
          showTagHeight: '8px'
        },
        legend: {
          w: '8px',
          h: '8px',
          borderRadius: '2px',
          bg: index === 0 ? 'dlmm_blue' : 'dlmm_green'
        }
      }))
    } else {
      return []
    }
  }, [dlmmApiPoolInfo])

  /**
   * 初始化，获取账户余额，离开页面销毁数据
   * Initialize, get account balance, destroy data when leaving the page
   */
  useEffect(() => {
    if (currentAccount?.address) {
      fetchAccountBalance()
    }
    return () => {
      resetLiquidity()
      resetAddLiquidity()
    }
  }, [])

  /**
   * 切换池子，重置数据
   * Switch pools, reset data
   */
  useEffect(() => {
    /**
     * 保证地址栏的poolId和接口请求到的池子数据poolId相同时再进行操作
     * Ensure that the poolId in the address bar and the poolId obtained from the interface are the same before performing operations
     */
    if (poolId && dlmmApiPoolInfo?.poolId !== poolId) {
      // handleResetRange()
      resetAddLiquidity()
      resetLiquidity()
      // resetDeposit()
    }

    if (poolId && poolId === dlmmApiPoolInfo?.poolId) {
      handleGetPrice()
    }
  }, [poolId, dlmmApiPoolInfo?.poolId])

  return {
    rangeTabList,
    dlmmApiPoolInfo,
    selectedTokenA,
    selectedTokenB,
    setCurrentBinStep,
    currentBinStep,
    currentTab,
    setCurrentTab,
    tabList,
    favoriteStyle,
    onChangeFavorites,
    setSelectedTokenA,
    setSelectedTokenB,
    onConfirm,
    refreshMarketPrice,
    onJump2Swap,
    onJumpAddIncentive,
    handleSelectToken,
    getSelectTokenProps,
    quoteWhiteTokenList,
    onBinStepChange,
    binStepList,
    currentBaseFee,
    baseFee,
    setBaseFee,
    binStep,
    setBinStep,
    handleRefresh,
    handleGetPrice
  }
}

export default useDlmmLiquidity
