import useGetCurrentPrice from '@/hooks/clmm/useGetCurrentPrice'
import useGetPoolRelatedInfo from '@/hooks/clmm/useGetPoolRelatedInfo'
import usePriceRange from '@/hooks/clmm/usePriceRange'
import useGetContractPoolInfo from '@/hooks/pool/useGetContractPoolInfo'
import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import useDepositStore from '@/store/clmm/deposit'
import { useAccountBalance } from '@cetus/hooks'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { useAccountStore } from '@cetus/stores'
import { isAvailableObject } from '@cetus/utils'
import { useEffect } from 'react'
import useLiquidityInteraction from './useLiquidityInteraction'
function useLiquidity() {
  const { currentAccount } = useAccountStore()
  const { apiPoolInfo, resetLiquidity, setManualRefresh, setCurrentPriceData } = useLiquidityStore()
  const { feeTierList, currentFeeTier, rangeTabList, getList, quoteWhiteTokenList, warningTokenList } = useGetPoolRelatedInfo()
  const { poolAddress } = useQueryParams()
  const { handleResetRange } = usePriceRange()
  const { resetAddLiquidity, setFromToken, setToToken } = useAddLiquidityStore()
  const { resetDeposit } = useDepositStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { getContractPoolInfo } = useGetContractPoolInfo()
  const { getCurrentPrice } = useGetCurrentPrice()
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
    setFeeTier,
    refreshMarketPrice,
    onJump2Swap,
    handleSelectToken,
    getSelectTokenProps
  } = useLiquidityInteraction({ apiPoolInfo })

  // 设置代币 Set tokens
  useEffect(() => {
    if (isAvailableObject(apiPoolInfo)) {
      setFromToken(apiPoolInfo?.displayTokenA)
      setToToken(apiPoolInfo?.displayTokenB)
    }
  }, [apiPoolInfo?.poolAddress])

  /**
   * 获取当前池子的token兑换价格
   * Get the token exchange price of the current pool
   */
  const handleGetPrice = async () => {
    if (poolAddress && apiPoolInfo && poolAddress === apiPoolInfo?.poolAddress) {
      const _contractPoolInfo = await getContractPoolInfo(poolAddress)
      if (_contractPoolInfo) {
        getCurrentPrice(_contractPoolInfo?.current_sqrt_price, apiPoolInfo, _contractPoolInfo?.current_tick_index)
      }
    }
  }

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
    console.log('🚀 ~ handleRefresh ~ handleRefresh111:')
    if (isManual) {
      setManualRefresh(true)
    }
    if (poolAddress && poolAddress !== 'undefined') {
      await getList({ poolAddress })
    }
    if (currentAccount?.address) {
      await fetchAccountBalance()
    }
    handleRefreshPrice()
    setManualRefresh(false)
  }

  /**
   * 初始化，获取账户余额，离开页面销毁数据
   * Initialize, get account balance, destroy data when leaving the page
   */
  useEffect(() => {
    if (currentAccount?.address) {
      fetchAccountBalance()
    }

    setCurrentPriceData({})

    return () => {
      handleResetRange()
      resetAddLiquidity()
      resetLiquidity()
      resetDeposit()
    }
  }, [])

  /**
   * 切换池子，重置数据
   * Switch pools, reset data
   */
  useEffect(() => {
    /**
     * 保证地址栏的poolAddress和接口请求到的池子数据poolAddress相同时再进行操作
     * Ensure that the poolAddress in the address bar and the poolAddress obtained from the interface are the same before performing operations
     */
    if (poolAddress && apiPoolInfo?.poolAddress !== poolAddress) {
      handleResetRange()
      resetAddLiquidity()
      resetLiquidity()
      resetDeposit()
    }

    if (poolAddress && poolAddress === apiPoolInfo?.poolAddress) {
      handleGetPrice()
    }
  }, [poolAddress, apiPoolInfo?.poolAddress])

  return {
    feeTierList,
    currentFeeTier,
    rangeTabList,
    quoteWhiteTokenList,
    warningTokenList,
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
    setFeeTier,
    handleRefresh,
    handleGetPrice,
    onJump2Swap,
    handleSelectToken,
    getSelectTokenProps
  }
}

export default useLiquidity
