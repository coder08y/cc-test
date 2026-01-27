import ProChart from '@/components/chart/ProChart'
import { ChartOrderIcon } from '@/components/common/ChartOrderIcon'
import { TradeTab } from '@/components/common/TradeTab'
import ProModeCoinInfo from '@/components/common/proModeAndChart/ProModeCoinInfo'
import { ProModeTradeTab } from '@/components/common/proModeAndChart/ProModeTradeTab'
import ActiveAndPastDcas from '@/components/dca/ActiveAndPastDcas'
import { DcaInputBlock } from '@/components/dca/DcaInputBlock'
import { LimitPriceChart } from '@/components/limit/LimitPriceChart'
import { TradeTabs } from '@/components/swap/type'
import { useGetDcaOrderList } from '@/hooks/dca/useGetDcaOrderList'
import useGlobalStore from '@/store/common/global'
import useDcaStore from '@/store/dca'
import useProStore from '@/store/pro'
import useProModeStore from '@/store/pro/useProModeStore'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import { determineToggleTokens, determineTokenChange } from '@/utils/tokenHelpers'
import { useAccountBalance, useInterval, useRpcListener } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Box, HStack, Stack, VStack } from '@chakra-ui/react'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dca() {
  const { currentAccount } = useAccountStore()
  const { sellCoin, buyCoin, setIsDcaRefresh, whiteTokenList } = useDcaStore()
  const { isShowTradeChart, isShowTradeOrders } = useGlobalStore()
  const { getDcaOrderList } = useGetDcaOrderList()
  const { fetchAccountBalance } = useAccountBalance()

  const { dcaOrderListLoading, setDcaOrderListLoading, dcaActiveOrderList, dcaPastOrderList, setDcaActiveOrderList, setDcaPastOrderList } =
    useActiveOrdersStore()

  const handleGetDcaOrderList = async (account: string, isLoading: boolean = false) => {
    if (!isProMode && !isShowTradeOrders) return
    if (isLoading) {
      setDcaOrderListLoading(true)
    }
    getDcaOrderList(account, isLoading)
  }

  useEffect(() => {
    if (currentAccount?.address) {
      handleGetDcaOrderList(currentAccount?.address, true)
    } else {
      setDcaActiveOrderList([])
      setDcaPastOrderList([])
    }
  }, [currentAccount?.address, isShowTradeOrders])

  const handleRefresh = (isLoading: boolean = true) => {
    setRefreshCount(0)
    setIsDcaRefresh(true)
    setTimeout(() => {
      setIsDcaRefresh(false)
    }, 1000)
    if (currentAccount?.address) {
      if (!isLoading) {
        // 手动刷新的时候只请求记录不请求余额 只有20s自动刷新和进入页面时请求余额
        fetchAccountBalance()
      }
      handleGetDcaOrderList(currentAccount?.address, isLoading)
    }
  }

  useRpcListener({
    onRpcChange: () => {
      handleRefresh()
    }
  })

  useEffect(() => {
    if (currentAccount?.address) {
      fetchAccountBalance()
    }
  }, [currentAccount?.address])

  const { isApp, windowWidth } = useWindowWidth()

  const [refreshCount, setRefreshCount] = useState<number>(0)
  // 移动端使用更长的刷新间隔
  const refreshInterval = isApp ? 2000 : 1000
  const maxRefreshCount = isApp ? 10 : 20

  useInterval({
    interval: refreshInterval,
    callback: () => {
      setRefreshCount(refreshCount + 1)
      if (refreshCount >= maxRefreshCount && !isProMode) {
        handleRefresh(false)
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
      tokenA: sellCoin,
      tokenB: buyCoin
    })
    setShowTokenInfo(newShowToken)
    setAnotherTokenInfo(newAnotherToken)
  }, [isChangeDirect, showTokenInfo, buyCoin, sellCoin])

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
        tokenA: sellCoin,
        tokenB: buyCoin,
        page: 'dca'
      })

      if (shouldToggleDirect) {
        setIsChangeDirect(!isChangeDirect)
      }

      setAnotherTokenInfo(targetToken)

      if (navigationPath) {
        navigate(navigationPath)
      }
    },
    [sellCoin, buyCoin, currentProTab, isChangeDirect]
  )

  // 同步数据到全局 Pro 模式状态
  useEffect(() => {
    if (isProMode || isShowTradeChart) {
      syncPageData({
        page: 'dca',
        tokenA: sellCoin,
        tokenB: buyCoin,
        onTokenSelect: onCoinSelect,
        onToggleDirect: handleToggleDirect,
        isChangeDirect,
        whiteTokenList: whiteTokenList || [],
        isProMode
      })
    } else {
      reset()
    }
  }, [isProMode, isShowTradeChart, sellCoin, buyCoin, onCoinSelect, handleToggleDirect, isChangeDirect, whiteTokenList])

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
        {/* Pro 模式组件现在在 Layout 中全局渲染，这里预留空间 */}
        {isProMode && !isApp && <Box w={{ base: '100%', lg: 'calc(100% - 380px)' }} />}

        {/* pc chart and orders */}
        {(isShowTradeChart || isShowTradeOrders) && !isProMode && !isApp && (
          <VStack pr="20px" w={{ base: '100%', lg: 'calc(100% - 470px)' }}>
            {isShowTradeChart && <LimitPriceChart baseToken={sellCoin} quoteToken={buyCoin} />}
            {isShowTradeOrders && (
              <ActiveAndPastDcas
                handleRefresh={handleRefresh}
                activeList={dcaActiveOrderList}
                pastList={dcaPastOrderList}
                isOrderLoading={dcaOrderListLoading}
              />
            )}
          </VStack>
        )}

        {isApp && isProMode && (
          <>
            <VStack w="100%" py="8px" gap="16px">
              <ProModeTradeTab />
            </VStack>
            <VStack w="100%" p="20px 0 8px" gap="16px">
              <ProModeCoinInfo handleToggleDirect={handleToggleDirect} onCoinSelect={onCoinSelect} whiteTokenList={whiteTokenList} />
            </VStack>
          </>
        )}

        {/* input交易框 */}
        <VStack w={{ base: '100%', lg: isProMode ? '380px' : '470px' }} alignItems="start">
          <HStack w="100%" justify="space-between" mb="8px">
            <TradeTab currTradeTab={TradeTabs.DCA} />
            {!isProMode && <ChartOrderIcon />}
          </HStack>
          <DcaInputBlock handleGetDcaOrderList={(walletAddress: string) => handleGetDcaOrderList(walletAddress)} />
        </VStack>
        {isApp && isProMode && (
          <ProChart onCoinSelect={onCoinSelect} handleToggleDirect={handleToggleDirect} token={showTokenInfo} tokenPriceUnit={coinBvPriceUnit} />
        )}

        {/* h5chart */}
        {isApp && isShowTradeChart && !isProMode ? (
          <VStack w="100%">
            <Suspense fallback={<div />}>
              <LimitPriceChart baseToken={buyCoin} quoteToken={sellCoin} />
            </Suspense>
          </VStack>
        ) : null}
      </Stack>

      {/* h5 orders - 移到 Stack 外部，和 Limit 页面保持一致 */}
      {isApp && isShowTradeOrders && !isProMode && (
        <VStack w="100%" mt="8px">
          <ActiveAndPastDcas
            handleRefresh={handleRefresh}
            activeList={dcaActiveOrderList}
            pastList={dcaPastOrderList}
            isOrderLoading={dcaOrderListLoading}
          />
        </VStack>
      )}
    </Box>
  )
}
