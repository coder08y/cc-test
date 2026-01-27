// import { LimitPriceChart } from '@/components/limit/LimitPriceChart.tsx'
// import { SwapTrade } from '@/components/swap'
import useWebSocket from '@/hooks/common/useWebSocket'
import useProData from '@/hooks/pro/useProData.ts'
import useGlobalStore from '@/store/common/global.ts'
import useProStore from '@/store/pro/index.ts'
import { getHighWeightToken } from '@/utils/pro'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize.ts'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth.ts'
import { Token } from '@cetus/types'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, Stack, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { Suspense, lazy, memo, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProModeCoinInfo from './ProModeCoinInfo.tsx'

const LimitPriceChart = lazy(() => import('../../limit/LimitPriceChart.tsx').then(module => ({ default: module.LimitPriceChart })))
const ProModeTradeTab = lazy(() => import('./ProModeTradeTab/index.tsx').then(module => ({ default: module.ProModeTradeTab })))
const ProChart = lazy(() => import('../../chart/ProChart.tsx'))

type ProModeAndChartProps = {
  tokenA?: Token
  tokenB?: Token
  isChangeDirect: boolean
  onCoinSelect: (item: any) => void
  handleToggleDirect: () => void
  whiteTokenList?: any
}
function ProModeAndChart({ isChangeDirect, tokenA, tokenB, handleToggleDirect, whiteTokenList, onCoinSelect }: ProModeAndChartProps) {
  const { connect, disconnect, state } = useWebSocket({
    url: 'wss://ws-api.suivision.xyz/ws',
    autoConnect: false // 手动控制连接
  })
  useEffect(() => {
    // 初始化 WebSocket 连接
    connect()

    return () => {
      // 应用卸载时断开连接
      disconnect()
    }
  }, [])
  const { isShowTradeChart } = useGlobalStore()
  const { getCoinRelatedData } = useProData()
  const {
    isProMode,
    setCurrentProTab,
    currentProTab,
    currentProTabUpdateWith,
    showTokenInfo,
    setShowTokenInfo,
    setAnotherTokenInfo,
    setNotChangeToken,
    coinBvPriceUnit,
    isCoinSelect,
    resetProData
  } = useProStore()
  const [isMounted, setIsMounted] = useState(false)
  const { from } = useQueryParams()
  const { from: params_from, to, pay, target } = useParams()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useDebounceEffect(() => {
    // if ((currentProTabUpdateWith && showTokenInfo?.coin_type) || (!tokenA?.coin_type && !tokenB?.coin_type)) return
    if (showTokenInfo?.coin_type == tokenA?.coin_type || showTokenInfo?.coin_type == tokenB?.coin_type || (!tokenA?.coin_type && !tokenB?.coin_type))
      return

    if (isCoinSelect && ((!tokenA?.coin_type && tokenB?.coin_type) || (!tokenB?.coin_type && tokenA?.coin_type))) {
      setNotChangeToken(true)
    }

    const isInit = !params_from && !to && !pay && !target

    if (
      tokenA?.coin_type &&
      tokenB?.coin_type &&
      params_from &&
      to &&
      fixCoinType(tokenA?.coin_type) !== fixCoinType(params_from) &&
      fixCoinType(tokenA?.coin_type) !== fixCoinType(to)
    )
      return
    if (
      tokenA?.coin_type &&
      tokenB?.coin_type &&
      params_from &&
      to &&
      fixCoinType(tokenB?.coin_type) !== fixCoinType(params_from) &&
      fixCoinType(tokenB?.coin_type) !== fixCoinType(to)
    )
      return

    if (isInit && tokenA?.coin_type !== showTokenInfo?.coin_type) {
      setCurrentProTab('Buy')
    }

    const oneIsUndefined =
      !!((!params_from || params_from === 'undefined') && to) ||
      !!(params_from && (!to || to === 'undefined')) ||
      !!(pay && (!target || target === 'undefined')) ||
      !!((!pay || pay === 'undefined') && target)

    if (tokenA?.coin_type && tokenB?.coin_type) {
      if (from === 'pro') {
        setShowTokenInfo(tokenB)
        setAnotherTokenInfo(tokenA)
        setNotChangeToken(false)
        setCurrentProTab('Buy')
        return
      }
      const ntoken = !oneIsUndefined && !isInit ? (currentProTab === 'Buy' ? tokenB : tokenA) : getHighWeightToken(tokenA, tokenB)
      setShowTokenInfo(ntoken)
      setAnotherTokenInfo(ntoken?.coin_type === tokenA?.coin_type ? tokenB : tokenA)
      setNotChangeToken(false)
      setCurrentProTab(fixCoinType(ntoken?.coin_type) === fixCoinType(tokenA?.coin_type) ? 'Sell' : 'Buy')
    } else if (tokenA?.coin_type || tokenB?.coin_type) {
      const newShowInfo = tokenA?.coin_type ? tokenA : tokenB
      setShowTokenInfo(newShowInfo)
      setAnotherTokenInfo(tokenA?.coin_type ? tokenB : tokenA)
      setNotChangeToken(true)
      setCurrentProTab(tokenA?.coin_type ? 'Sell' : 'Buy')
    }
  }, [tokenA?.coin_type, tokenB?.coin_type])

  useEffect(() => {
    if (isMounted && showTokenInfo?.coin_type && isProMode) {
      getCoinRelatedData(showTokenInfo?.coin_type)
    }
  }, [showTokenInfo?.coin_type, isProMode, isMounted])

  const { a, b } = useMemo(() => {
    return {
      a: params_from || pay || '',
      b: to || target || ''
    }
  }, [params_from, to, pay, target])

  // 刷新浏览器时根据地址栏设置currentProTab默认值
  // useEffect(() => {
  //   if (!currentProTab && showTokenInfo?.coin_type) {
  //     if (showTokenInfo?.coin_type === a) {
  //       setCurrentProTab('Sell')
  //     } else {
  //       setCurrentProTab('Buy')
  //     }
  //   }
  // }, [currentProTab, showTokenInfo?.coin_type, a, b])

  useEffect(() => {
    return () => {
      resetProData()
    }
  }, [])

  const { isApp } = useWindowWidth()
  const { size } = useDocumentSize()

  // H5 模式下只提供数据加载，不渲染布局
  if (isApp && isProMode) {
    return null
  }

  return (
    <Stack
      h={{ base: 'unset', lg: isProMode ? size?.h - 174 : 'unset' }}
      minH={{ base: 'unset', lg: isProMode ? '700px' : 'unset' }}
      w={{ base: '100%', lg: isProMode ? 'calc(100% - 380px)' : 'calc(100% - 470px)' }}
      flexDir={{ base: 'column', lg: 'row' }}
      gap="0px"
      align="flex-start"
      justify="center"
      position="sticky"
      top="92px"
      mt={isProMode ? '8px' : '0'}
    >
      {isProMode && (
        <Box
          h={{ base: 'unset', lg: '100%' }}
          overflowY={{ base: 'unset', lg: 'auto' }}
          css={{
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none'
          }}
        >
          <ProModeCoinInfo whiteTokenList={whiteTokenList} onCoinSelect={onCoinSelect} handleToggleDirect={handleToggleDirect} />
        </Box>
      )}

      {/* Middle Section */}
      <VStack
        h={{ base: 'unset', lg: '100%' }}
        overflowY={{ base: 'unset', lg: 'auto' }}
        w={{ base: '100%', lg: isProMode ? 'calc(100% - 340px)' : '100%' }}
        p={{ base: '0px', lg: isProMode ? '0 20px' : '0 20px 0 0' }}
        flexGrow={1}
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}
      >
        {!isApp && isShowTradeChart && !isProMode && (
          <VStack w="100%">
            <Suspense fallback={<div />}>
              <LimitPriceChart isChangeDirect={isChangeDirect} baseToken={tokenA} quoteToken={tokenB} />
            </Suspense>
          </VStack>
        )}

        {!isApp && isProMode && (
          <ProChart
            whiteTokenList={whiteTokenList}
            onCoinSelect={onCoinSelect}
            handleToggleDirect={handleToggleDirect}
            token={showTokenInfo}
            tokenPriceUnit={coinBvPriceUnit}
          />
        )}

        {isProMode && (
          <VStack w="100%">
            <Suspense fallback={<div />}>
              <ProModeTradeTab />
            </Suspense>
          </VStack>
        )}
      </VStack>

      {/* Footer for mobile */}
      {/* {isApp && isProMode && (
        <HStack w="100%" justify="center" mt="20px">
          <Text fontSize="12px">Powered by</Text>
          <Image w="20px" src="/images/img_suivision@2x.png" />
          <Text fontSize="12px">SuiVision</Text>
        </HStack>
      )} */}
    </Stack>
  )
}

export default memo(ProModeAndChart)
