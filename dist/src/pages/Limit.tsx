import ProChart from '@/components/chart/ProChart'
import ProModeCoinInfo from '@/components/common/proModeAndChart/ProModeCoinInfo'
import { ProModeTradeTab } from '@/components/common/proModeAndChart/ProModeTradeTab'
import { HistoryCard } from '@/components/limit/HistoryCard'
import { HistoryTableList } from '@/components/limit/HistoryTableList'
import { LimitAction } from '@/components/limit/LimitAction'
import { LimitPriceChart } from '@/components/limit/LimitPriceChart'
import { OrderTableList } from '@/components/limit/OrderTableList'
import { OrdersCard } from '@/components/limit/OrdersCard'
import useGetLimitOrderHistory from '@/hooks/limit/useGetLimitOrderHistory'
import useGetMyLimitOrder from '@/hooks/limit/useGetMyLimitOrder'
import useLimitCancelAction from '@/hooks/limit/useLimitCancelAction'
import useRefreshCoinMarketPrice from '@/hooks/limit/useRefreshCoinMarketPrice'
import useGlobalStore from '@/store/common/global'
import useLimitActionStore from '@/store/limit/useLimitAction'
import useLimitListStore from '@/store/limit/useLimitList'
import useProStore from '@/store/pro'
import useProModeStore from '@/store/pro/useProModeStore'
import { determineToggleTokens, determineTokenChange } from '@/utils/tokenHelpers'
import SelectTab, { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useAccountBalance, useInterval, useRpcListener } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { RefreshButton } from '@cetus/ui-kit'
import { Box, Button, HStack, Stack, VStack } from '@chakra-ui/react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

enum LimitTabType {
  OpenOrders = 'Open Orders',
  OrderHistory = 'Order History'
}

function Limit() {
  const { currentAccount } = useAccountStore()
  const { getLimitOrderHistory, historyOrderList, historyOrderLoading } = useGetLimitOrderHistory()
  const { fetchMyLimitOrder } = useGetMyLimitOrder()
  const { setMyOrderList, myOrderList, orderListLoading } = useLimitListStore()
  const { payCoin, targetCoin } = useLimitActionStore()
  const { fetchAccountBalance } = useAccountBalance()
  useEffect(() => {
    if (currentAccount?.address) {
      fetchAccountBalance()
    }
  }, [])
  const { isShowTradeChart, isShowTradeOrders } = useGlobalStore()

  const [pageHistoryList, setPageHistoryList] = useState<any>([])
  const [currTab, setCurrTab] = useState<Tab<object>>({
    label: LimitTabType.OpenOrders
  })

  const tabList = useMemo(() => {
    // console.log('🚀 ~ Limit ~ myOrderList:', myOrderList)

    const list: Tab<object>[] = []

    list.push({
      label: LimitTabType.OpenOrders,
      num: currTab.label === LimitTabType.OpenOrders && myOrderList.length > 0 && !orderListLoading ? myOrderList.length.toString() : undefined
    })

    list.push({
      label: LimitTabType.OrderHistory,
      num:
        currTab.label === LimitTabType.OrderHistory && pageHistoryList.length > 0 && !historyOrderLoading
          ? pageHistoryList.length.toString()
          : undefined
    })
    return list
  }, [currTab.label, myOrderList, pageHistoryList, historyOrderLoading, orderListLoading])

  useEffect(() => {
    getOrderList(true)
  }, [currTab.label, currentAccount, isShowTradeOrders])

  useRpcListener({
    onRpcChange: () => {
      getOrderList(true)
      if (currentAccount?.address) {
        fetchAccountBalance()
      }
    }
  })

  const getOrderList = (isLoading?: boolean) => {
    if (!isShowTradeOrders) return
    setRefreshCount(0)
    // console.log('🚀  ~ currentAccount:', currTab.label === LimitTabType.OpenOrders, currentAccount?.address)
    if (currentAccount?.address) {
      if (currTab.label === LimitTabType.OpenOrders) {
        fetchMyLimitOrder(currentAccount.address, isLoading)
      } else {
        // console.log('🚀 ~  ~ currentAccount:', currentAccount)
        getLimitOrderHistory(currentAccount.address, isLoading)
      }
    }
  }

  useEffect(() => {
    if (currentAccount?.address && historyOrderList?.length > 0) {
      setPageHistoryList(historyOrderList)
    } else {
      setPageHistoryList([])
    }
  }, [historyOrderList, currentAccount?.address])

  useEffect(() => {
    if (!currentAccount?.address) {
      setMyOrderList([])
    }
  }, [currentAccount?.address])

  const handleChangeTab = (tab: Tab<object>) => {
    setCurrTab(tab)
  }
  const { windowWidth, isApp } = useWindowWidth()

  const { refreshCoinMarketPrice } = useRefreshCoinMarketPrice()
  const [refreshCount, setRefreshCount] = useState<number>(0)

  // 移动端使用更长的刷新间隔
  const refreshInterval = isApp ? 2000 : 1000
  const maxRefreshCount = isApp ? 10 : 20

  useInterval({
    interval: refreshInterval,
    callback: () => {
      setRefreshCount(refreshCount + 1)
      if (refreshCount >= maxRefreshCount) {
        setRefreshCount(0)
        // 每20秒 刷新一次  市场价格
        refreshCoinMarketPrice()
        if (currentAccount?.address) {
          fetchAccountBalance()
        }
        getOrderList(false)
      }
    }
  })

  const [isChangeDirect, setIsChangeDirect] = useState(false)
  const { isProMode, currentProTab, showTokenInfo, setShowTokenInfo, setAnotherTokenInfo, coinBvPriceUnit, setIsCoinSelect } = useProStore()

  // 使用全局 Pro 模式状态管理
  const { syncPageData, reset } = useProModeStore()

  // Handle token direction toggle in Pro mode
  const handleToggleDirect = useCallback(() => {
    setIsChangeDirect(!isChangeDirect)
    const { newShowToken, newAnotherToken } = determineToggleTokens({
      showTokenInfo,
      tokenA: payCoin,
      tokenB: targetCoin
    })
    setShowTokenInfo(newShowToken)
    setAnotherTokenInfo(newAnotherToken)
  }, [isChangeDirect, showTokenInfo, payCoin, targetCoin])

  const navigate = useNavigate()

  // Handle token selection in Pro mode
  const onCoinSelect = useCallback(
    (item: any) => {
      setIsCoinSelect(true)
      setShowTokenInfo(item)

      // Determine token change using helper function
      const { shouldToggleDirect, targetToken, navigationPath } = determineTokenChange({
        selectedItem: item,
        currentTab: currentProTab || 'Buy',
        tokenA: payCoin,
        tokenB: targetCoin,
        page: 'limit'
      })

      if (shouldToggleDirect) {
        setIsChangeDirect(!isChangeDirect)
      }

      setAnotherTokenInfo(targetToken)

      if (navigationPath) {
        navigate(navigationPath)
      }
    },
    [payCoin, targetCoin, currentProTab, isChangeDirect]
  )

  // 同步数据到全局 Pro 模式状态
  useEffect(() => {
    if (isProMode || isShowTradeChart) {
      syncPageData({
        page: 'limit',
        tokenA: payCoin,
        tokenB: targetCoin,
        onTokenSelect: onCoinSelect,
        onToggleDirect: handleToggleDirect,
        isChangeDirect,
        whiteTokenList: [],
        isProMode
      })
    } else {
      reset()
    }
  }, [isProMode, isShowTradeChart, payCoin, targetCoin, onCoinSelect, handleToggleDirect, isChangeDirect])

  useEffect(() => {
    return () => {
      setIsCoinSelect(false)
      reset() // 页面卸载时重置全局状态
    }
  }, [])
  return (
    <Box
      mt={{ base: '0px', lg: windowWidth && windowWidth < 1024 ? '0' : isProMode ? '0px' : '42px' }}
      p={{ base: '0', lg: isProMode || isShowTradeChart || isShowTradeOrders ? '0' : '0 345px' }}
      className={isProMode || isApp || isShowTradeChart || isShowTradeOrders ? '' : 'bg_img'}
      w={!isProMode ? '100%' : 'unset'}
    >
      <Stack w="100%" flexDir={{ base: 'column-reverse', lg: 'row' }} gap="0px" align="flex-start" justify="center">
        {/* PC Lite 模式：显示图表 */}
        {!isApp && isShowTradeChart && !isProMode && (
          <VStack pr="20px" w={{ base: '100%', lg: 'calc(100% - 470px)' }}>
            <Suspense fallback={<div />}>
              <LimitPriceChart baseToken={payCoin} quoteToken={targetCoin} />
            </Suspense>
          </VStack>
        )}

        {/* Pro 模式组件现在在 Layout 中全局渲染，这里预留空间 */}
        {isProMode && !isApp && <Box w={{ base: '100%', lg: 'calc(100% - 380px)' }} />}

        {/* pc orders(no chart) */}
        {!isProMode && !isShowTradeChart && isShowTradeOrders && (
          <HStack pr={{ base: '0', lg: '20px' }} gap="8px" w={{ base: '100%', lg: 'calc(100% - 470px)' }}>
            <VStack w="100%">
              <OrderAndHistoryTab
                tabList={tabList}
                currTab={currTab}
                myOrderList={myOrderList}
                handleChangeTab={handleChangeTab}
                handleGetOrderList={getOrderList}
              />
              {currTab.label === LimitTabType.OpenOrders && <OrdersCard />}
              {currTab.label === LimitTabType.OrderHistory && (
                <HistoryCard historyOrderList={pageHistoryList} historyOrderLoading={historyOrderLoading} />
              )}
            </VStack>
          </HStack>
        )}
        {isApp && isProMode && (
          <>
            <VStack w="100%" p="20px 0 8px" gap="16px">
              <ProModeCoinInfo handleToggleDirect={handleToggleDirect} onCoinSelect={onCoinSelect} whiteTokenList={[]} />
            </VStack>

            <VStack w="100%" py="8px" gap="16px">
              <ProModeTradeTab />
            </VStack>
          </>
        )}

        {/* input交易框 */}
        <LimitAction />
        {isApp && isProMode && (
          <ProChart onCoinSelect={onCoinSelect} handleToggleDirect={handleToggleDirect} token={showTokenInfo} tokenPriceUnit={coinBvPriceUnit} />
        )}

        {/* h5chart */}
        {isApp && isShowTradeChart && !isProMode ? (
          <VStack w="100%">
            <Suspense fallback={<div />}>
              <LimitPriceChart baseToken={payCoin} quoteToken={targetCoin} />
            </Suspense>
          </VStack>
        ) : null}
      </Stack>
      {/* pc orders(have chart) */}
      {isShowTradeOrders && isShowTradeChart && (
        <VStack w="100%" gap="0" align="flex-start" mt={{ base: '8px', lg: '0px' }}>
          <OrderAndHistoryTab
            handleGetOrderList={() => getOrderList(true)}
            tabList={tabList}
            currTab={currTab}
            myOrderList={myOrderList}
            handleChangeTab={handleChangeTab}
          />
          {isApp && <Box h="16px" />}
          {currTab.label === LimitTabType.OpenOrders && (isApp ? <OrdersCard /> : <OrderTableList />)}
          {currTab.label === LimitTabType.OrderHistory &&
            (isApp ? (
              <HistoryCard historyOrderList={pageHistoryList} historyOrderLoading={historyOrderLoading} />
            ) : (
              <HistoryTableList historyOrderList={pageHistoryList} historyOrderLoading={historyOrderLoading} />
            ))}
        </VStack>
      )}
    </Box>
  )
}

const OrderAndHistoryTab = ({
  tabList,
  currTab,
  myOrderList,
  handleChangeTab,
  handleGetOrderList
}: {
  tabList: any
  currTab: any
  myOrderList: any
  handleGetOrderList: () => void
  handleChangeTab: (tab: Tab<object>) => void
}) => {
  const { handleCancelOrder, cancelOrderLoading } = useLimitCancelAction()
  const { isApp } = useWindowWidth()
  const isShowCancelAllBtn = currTab.label === LimitTabType.OpenOrders && myOrderList.length > 1
  return (
    <HStack
      w="100%"
      justifyContent="space-between"
      flexDirection={{ base: currTab.label === LimitTabType.OpenOrders && myOrderList.length > 1 ? 'column' : 'row', lg: 'row' }}
      gap={{ base: '16px', lg: '8px' }}
    >
      <HStack
        w={{
          base: '100%',
          lg: '395px'
        }}
        justifyContent="space-between"
      >
        <SelectTab
          type="borderTab"
          wrapStyle={{
            w: '100%',
            h: '52px',
            gap: '32px',
            bg: 'none',
            border: 'none',
            mb: { base: '0px', lg: '8px' }
          }}
          itemStyle={{
            fontSize: '16px'
          }}
          tabList={tabList}
          currentTab={currTab.label}
          handleChangeTab={handleChangeTab}
        />
        {isApp && <RefreshButton handleRefresh={handleGetOrderList} w="28px" h="28px" innerStyle={{ bg: 'none' }} />}
      </HStack>
      {(!isApp || isShowCancelAllBtn) && (
        <HStack gap="8px" w={{ base: '100%', lg: 'unset' }}>
          {isShowCancelAllBtn && (
            <Button
              onClick={() => {
                handleCancelOrder(myOrderList)
              }}
              isDisabled={cancelOrderLoading}
              isLoading={cancelOrderLoading}
              h="28px"
              minH="unset"
              borderRadius="8px"
              fontSize="14px"
              variant="outline"
              color="primary_gray"
              w={{ base: '100%', lg: '92px' }}
              mb={{ base: '0px', lg: '0' }}
              _hover={{
                color: 'text_caption'
              }}
            >
              Cancel All
            </Button>
          )}
          {!isApp && <RefreshButton handleRefresh={handleGetOrderList} w="28px" h="28px" innerStyle={{ bg: 'none' }} />}
        </HStack>
      )}
    </HStack>
  )
}

export default Limit
