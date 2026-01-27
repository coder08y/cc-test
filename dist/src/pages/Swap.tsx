import ProChart from '@/components/chart/ProChart.tsx'
import { TradeTab } from '@/components/common/TradeTab'
import ProModeCoinInfo from '@/components/common/proModeAndChart/ProModeCoinInfo.tsx'
import { ProModeTradeTab } from '@/components/common/proModeAndChart/ProModeTradeTab/index.tsx'
import { LimitPriceChart } from '@/components/limit/LimitPriceChart.tsx'
import { TradeTabs } from '@/components/swap/type'
import useGlobalStore from '@/store/common/global.ts'
import useProStore from '@/store/pro/index.ts'
import useProModeStore from '@/store/pro/useProModeStore.ts'
import useSwapStore from '@/store/swap/swap.ts'
import { determineToggleTokens, determineTokenChange } from '@/utils/tokenHelpers'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, Stack, VStack } from '@chakra-ui/react'
import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SwapTrade = lazy(() => import('../components/swap/Swap.tsx'))

function Swap() {
  const { windowWidth, isApp } = useWindowWidth()
  const { isShowTradeChart } = useGlobalStore()
  const { fromCoin, toCoin, setToAmount, setFromAmount } = useSwapStore()
  const { isProMode, currentProTab, showTokenInfo, setShowTokenInfo, setAnotherTokenInfo, coinBvPriceUnit, setIsCoinSelect } = useProStore()

  // 使用全局 Pro 模式状态管理
  const { syncPageData, reset } = useProModeStore()

  const [isChangeDirect, setIsChangeDirect] = useState(false)

  // Handle token direction toggle in Pro mode
  const handleToggleDirect = useCallback(() => {
    setIsChangeDirect(!isChangeDirect)
    const { newShowToken, newAnotherToken } = determineToggleTokens({
      showTokenInfo,
      tokenA: fromCoin,
      tokenB: toCoin
    })
    setShowTokenInfo(newShowToken)
    setAnotherTokenInfo(newAnotherToken)
  }, [isChangeDirect, showTokenInfo, fromCoin, toCoin])

  const navigate = useNavigate()

  // Handle token selection in Pro mode
  const onCoinSelect = useCallback(
    (item: any) => {
      // Reset amounts (Swap-specific behavior)
      setFromAmount('')
      setToAmount('')

      setIsCoinSelect(true)
      setShowTokenInfo(item)

      // Determine token change using helper function
      const { shouldToggleDirect, targetToken, navigationPath } = determineTokenChange({
        selectedItem: item,
        currentTab: currentProTab || 'Buy',
        tokenA: fromCoin,
        tokenB: toCoin,
        page: 'swap'
      })

      if (shouldToggleDirect) {
        setIsChangeDirect(!isChangeDirect)
      }

      setAnotherTokenInfo(targetToken)

      if (navigationPath) {
        navigate(navigationPath)
      }
    },
    [fromCoin, toCoin, currentProTab, isChangeDirect]
  )

  // 同步数据到全局 Pro 模式状态
  useEffect(() => {
    if (isProMode || isShowTradeChart) {
      syncPageData({
        page: 'swap',
        tokenA: fromCoin,
        tokenB: toCoin,
        onTokenSelect: onCoinSelect,
        onToggleDirect: handleToggleDirect,
        isChangeDirect,
        whiteTokenList: [],
        isProMode
      })
    } else {
      reset()
    }
  }, [isProMode, isShowTradeChart, fromCoin, toCoin, onCoinSelect, handleToggleDirect, isChangeDirect])

  useEffect(() => {
    return () => {
      setIsCoinSelect(false)
      reset() // 页面卸载时重置全局状态
    }
  }, [])

  return (
    <Box
      mt={{ base: '0px', lg: windowWidth && windowWidth < 1024 ? '0' : isProMode ? '0px' : '42px' }}
      p={{ base: '0', lg: isProMode || isShowTradeChart ? '0' : '0 345px' }}
      className={isProMode || isApp || isShowTradeChart ? '' : 'bg_img'}
      w={!isProMode ? '100%' : 'unset'}
    >
      <Stack w="100%" flexDir={{ base: 'column', lg: 'row' }} gap="0px" align="flex-start" justify="center">
        {/* PC Lite 模式：显示图表 */}
        {!isApp && isShowTradeChart && !isProMode && (
          <VStack pr="20px" w={{ base: '100%', lg: 'calc(100% - 470px)' }}>
            <Suspense fallback={<div />}>
              <LimitPriceChart baseToken={fromCoin} quoteToken={toCoin} />
            </Suspense>
          </VStack>
        )}

        {/* Pro 模式组件现在在 Layout 中全局渲染，这里预留空间 */}
        {isProMode && !isApp && <Box w={{ base: '100%', lg: 'calc(100% - 380px)' }} />}
        {isApp && isProMode && (
          <ProChart onCoinSelect={onCoinSelect} handleToggleDirect={handleToggleDirect} token={showTokenInfo} tokenPriceUnit={coinBvPriceUnit} />
        )}
        {isApp && isShowTradeChart && !isProMode ? (
          <VStack w="100%">
            <Suspense fallback={<div />}>
              <LimitPriceChart baseToken={fromCoin} quoteToken={toCoin} />
            </Suspense>
          </VStack>
        ) : null}

        {/* input交易框 */}
        <VStack gap="16px" w={{ base: '100%', lg: isProMode ? '380px' : '470px' }} alignItems="start">
          <TradeTab currTradeTab={TradeTabs.Swap} />
          <Suspense fallback={<div />}>
            <SwapTrade />
          </Suspense>
        </VStack>
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

        {/* h5chart */}
      </Stack>
    </Box>
  )
}

export default Swap
