import '@/assets/css/common.css'
import '@/assets/css/flexlayout.css'
import CreatePoolModal from '@/components/deepbook/CreatePool/CreatePoolModal'
import DeepBookAssetsInfoModal from '@/components/deepbook/DeepBookAssetsInfoModal'
import DeepBookH5 from '@/components/deepbook/DeepBookH5'
import DeepBookPC from '@/components/deepbook/DeepBookPC'
import MarginPool from '@/components/deepbook/MarginPool'
import { useGetCoin } from '@/hooks/common/useCoin'
import useDeepBookMarginManager from '@/hooks/deepbook/margin/useDeepBookMarginManager'
import useDeepBookMarginPools from '@/hooks/deepbook/margin/useDeepbookMarginPools'
import useGetDeepBookManagerBalance from '@/hooks/deepbook/useGetDeepBookManagerBalance'
import useGetDeepBookOrderBook from '@/hooks/deepbook/useGetDeepBookOrderBook'
import useGetDeepBookPools from '@/hooks/deepbook/useGetDeepBookPools'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

function DeepBook() {
  // ==================== 路由参数 ====================
  const { address } = useParams()

  // ==================== 状态管理 ====================
  const { currentAccount } = useAccountStore()
  const {
    setDeepbookTopTab,
    searchText,
    deepBookPools,
    setDeepBookOpenOrders,
    setDeepBookOrderHistory,
    setDeepBookSettleList,
    setManagerBalanceObjs,
    currentDeepBookPool,
    isCheckedAllMarkets,
    deepBookPoolsObj,
    setBalanceManagerList,
    getCurrentBalanceManagerInfo,
    currentBalanceManagerInfoMap,
    setManagerBalanceListObjs,
    deepbookTopTab,
    orderTab,
    setShowOpenOrdersNumSpot,
    setShowOpenOrdersNumMargin,
    setShowDeepBookOrderHistoryNumSpot,
    setShowDeepBookOrderHistoryNumMargin,
    setShowDeepBookTradeHistoryNumSpot,
    setShowDeepBookTradeHistoryNumMargin
  } = useDeepBookStore()
  const marginPoolCap = useDeepBookMarginPoolStore(state => state.marginPoolCap)

  const { marginManagerByAccount } = useMarginStore()

  // ==================== 自定义 Hooks ====================
  const { isApp } = useWindowWidth()
  const { getDeepBookPools, queryDeepBookPoolByValue } = useGetDeepBookPools()
  // const { getDeepBookOpenOrders, getDeepBookAllOpenOrders } = useGetDeepBookOpenOrders()
  // const { getDeepBookOrderHistory } = useGetDeepBookOrderHistory()
  // const { getDeepBookTradeHistory } = useGetDeepBookTradeHistory()
  const { getOrderBook } = useGetDeepBookOrderBook()
  const { getBalanceManagerInfo, getManagerBalance } = useGetDeepBookManagerBalance()
  const { fetchTokenPrices } = useTokenPrice()
  const deepCoin = useGetCoin('0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP')

  // 确保默认选中 Trade
  useEffect(() => {
    return () => {
      setDeepbookTopTab('trade')
    }
  }, [])

  const [currentBalanceManagerInfo, setCurrentBalanceManagerInfo] = useState(() => {
    if (currentAccount?.address) {
      return getCurrentBalanceManagerInfo(currentAccount?.address)
    }
    return null
  })

  useDeepCompareEffect(() => {
    if (currentAccount?.address) {
      const info = getCurrentBalanceManagerInfo(currentAccount.address)
      setCurrentBalanceManagerInfo(info)
    } else {
      setCurrentBalanceManagerInfo(null)
    }
  }, [currentAccount?.address, currentBalanceManagerInfoMap, getCurrentBalanceManagerInfo])

  // ==================== 事件处理函数 ====================
  const getDeepBookTokenPrice = () => {
    const coinTypeList: string[] = []
    deepBookPools.forEach((pool: any) => {
      coinTypeList.push(pool?.baseAssets?.coin_type, pool?.quoteAssets?.coin_type)
    })
    fetchTokenPrices(coinTypeList)
  }

  // ==================== 副作用处理 ====================
  // 初始化获取 DeepBook 池子 解决自动刷新问题
  useEffect(() => {
    getDeepBookPools(address)
  }, [searchText])

  const { getDeepBookMarginPools } = useDeepBookMarginPools()

  useEffect(() => {
    getDeepBookMarginPools()
  }, [])

  // 定时刷新数据 //testnet暂时关掉
  // useInterval({
  //   interval: 30 * 1000,
  //   callback: () => {
  //     getDeepBookPools(address, true) // 传入 isAutoRefresh = true，避免触发导航
  //     getDeepBookTokenPrice()
  //     if (isCheckedAllMarkets) {
  //       getDeepBookAllOpenOrders(true)
  //     } else {
  //       getDeepBookOpenOrders(currentDeepBookPool, true)
  //     }
  //     // 刷新订单统计数据
  //     if (currentAccount?.address && currentBalanceManagerInfo?.balanceManager) {
  //       getDeepBookCount({ poolId: isCheckedAllMarkets ? null : currentDeepBookPool?.address })
  //     }
  //   }
  // })

  // 获取余额管理器信息
  const { getMarginManagerByAccount } = useDeepBookMarginManager()

  useEffect(() => {
    if (currentAccount?.address) {
      getBalanceManagerInfo(currentAccount?.address)
      getMarginManagerByAccount()
    }
  }, [currentAccount?.address])

  // 获取代币价格
  useEffect(() => {
    if (deepBookPools?.length > 0) {
      getDeepBookTokenPrice()
    }
  }, [deepBookPools?.length])

  // 账户切换或断开时重置状态
  useEffect(() => {
    setDeepBookOpenOrders([])
    setDeepBookOrderHistory([])
    setDeepBookSettleList([])
    setManagerBalanceObjs([])
    setBalanceManagerList([])
    // setBalancesByApi([])
    // 重置所有 balance manager 的余额信息
    setManagerBalanceListObjs('', {})
    // 清空所有订单计数
    setShowOpenOrdersNumSpot(0)
    setShowOpenOrdersNumMargin(0)
    setShowDeepBookOrderHistoryNumSpot(0)
    setShowDeepBookOrderHistoryNumMargin(0)
    setShowDeepBookTradeHistoryNumSpot(0)
    setShowDeepBookTradeHistoryNumMargin(0)
  }, [
    currentAccount?.address,
    setDeepBookOpenOrders,
    setDeepBookOrderHistory,
    setDeepBookSettleList,
    setManagerBalanceObjs,
    setBalanceManagerList,
    setManagerBalanceListObjs,
    setShowOpenOrdersNumSpot,
    setShowOpenOrdersNumMargin,
    setShowDeepBookOrderHistoryNumSpot,
    setShowDeepBookOrderHistoryNumMargin,
    setShowDeepBookTradeHistoryNumSpot,
    setShowDeepBookTradeHistoryNumMargin
  ])

  // 注释掉：Open Orders 数据获取已由 TradeTableBlock 统一管理，避免数据冲突
  // useEffect(() => {
  //   if (currentDeepBookPool?.address && currentAccount?.address) {
  //     console.log('🚀🚀🚀 ~ DeepBook.tsx:150 ~ DeepBook ~ orderTab:', orderTab)
  //     if (isCheckedAllMarkets) {
  //       getDeepBookAllOpenOrders(false, undefined, false, orderTab == 'margin')
  //     } else {
  //       getDeepBookOpenOrders(currentDeepBookPool, undefined, orderTab == 'margin')
  //     }
  //     // 获取订单统计数据
  //     if (currentBalanceManagerInfo?.balanceManager) {
  //       getDeepBookCount({ poolId: isCheckedAllMarkets ? null : currentDeepBookPool?.address })
  //     }
  //   }
  // }, [currentDeepBookPool?.address, currentAccount?.address, isCheckedAllMarkets, currentBalanceManagerInfo, marginManagerByAccount, orderTab])

  // 注释掉：Order History、Trade History 和 Count 数据获取已由 TradeTableBlock 统一管理，避免数据冲突
  // useEffect(() => {
  //   if (currentAccount?.address) {
  //     // 获取订单历史
  //     // getDeepBookOrderHistory({ poolId: isCheckedAllMarkets ? null : currentDeepBookPool?.address, isMargin: orderTab == 'margin' })
  //     // 获取交易历史
  //     // getDeepBookTradeHistory({ poolId: isCheckedAllMarkets ? null : currentDeepBookPool?.address, isMargin: orderTab == 'margin' })
  //     // 获取订单统计数据（getDeepBookCount 现在会同时获取 spot 和 margin 的计数，不需要 isMargin 参数）
  //     getDeepBookCount({ poolId: isCheckedAllMarkets ? null : currentDeepBookPool?.address })
  //   }
  // }, [currentAccount?.address, currentBalanceManagerInfo?.balanceManager, isCheckedAllMarkets, currentDeepBookPool?.address, marginManagerByAccount])

  // 获取订单簿
  useEffect(() => {
    if (currentDeepBookPool?.address) {
      getOrderBook('all', currentDeepBookPool.tickSize, true, 9)
    }
  }, [currentDeepBookPool?.address])

  // 获取管理器余额（包含 DEEP）
  useEffect(() => {
    if (currentBalanceManagerInfo?.balanceManager && currentDeepBookPool?.address && currentAccount?.address && deepCoin) {
      getManagerBalance(
        [
          { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
          { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
          { coin_type: deepCoin?.coin_type, decimals: deepCoin?.decimals }
        ],
        currentAccount?.address,
        currentBalanceManagerInfo?.balanceManager
      )
    }
  }, [currentBalanceManagerInfo, currentAccount?.address, currentDeepBookPool, deepCoin])

  const isOpenCreateModal = useDeepBookStore(state => state.isOpenCreateModal)
  const setIsOpenCreateModal = useDeepBookStore(state => state.setIsOpenCreateModal)

  // ==================== 渲染逻辑 ====================
  if (isApp) {
    return (
      <>
        {deepbookTopTab == 'margin_pools' ? (
          <MarginPool />
        ) : (
          <>
            <DeepBookH5
              currentDeepBookPool={currentDeepBookPool}
              deepBookPools={deepBookPools}
              currentAccount={currentAccount}
              currentBalanceManagerInfo={currentBalanceManagerInfo}
            />
            {isOpenCreateModal && <CreatePoolModal isOpen={isOpenCreateModal} onClose={() => setIsOpenCreateModal(false)} />}
            <DeepBookAssetsInfoModal />
          </>
        )}
      </>
    )
  }

  return (
    <>
      {deepbookTopTab == 'margin_pools' ? (
        <MarginPool />
      ) : (
        <>
          <DeepBookPC
            currentDeepBookPool={currentDeepBookPool}
            deepBookPools={deepBookPools}
            currentAccount={currentAccount}
            currentBalanceManagerInfo={currentBalanceManagerInfo}
          />
          {isOpenCreateModal && <CreatePoolModal isOpen={isOpenCreateModal} onClose={() => setIsOpenCreateModal(false)} />}
          <DeepBookAssetsInfoModal />
        </>
      )}
    </>
  )
}

export default DeepBook
