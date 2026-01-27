import useTokenRank from '@/hooks/common/useTokenRank'
import { Block } from '@cetus/design'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import CoinPairImage from '@cetus/ui-kit/src/components/CoinPairImage'
import { toLongCoinType } from '@cetus/utils'
import { Box, Center, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import useProStore from '@/store/pro'
import ChartLoading from '../chart/ChartLoading'

type LimitPriceChartProps = {
  baseToken?: Token
  quoteToken?: Token
  isChangeDirect?: boolean
}

export function LimitPriceChart(props: LimitPriceChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { baseToken, quoteToken, isChangeDirect } = props
  const [isSwapSort, setIsSwapSort] = useState<boolean>(false)
  const [tokenA, setTokenA] = useState<Token | undefined>(undefined)
  const [tokenB, setTokenB] = useState<Token | undefined>(undefined)
  const { getTokenRank } = useTokenRank()
  const { isProMode } = useProStore()
  const didMountRef = useRef(false)
  useEffect(() => {
    if (didMountRef.current) {
      setIsSwapSort(prev => !prev)
    } else {
      didMountRef.current = true
    }
  }, [isChangeDirect])

  // 根据rank 展示pair
  useEffect(() => {
    if (baseToken?.coin_type && quoteToken?.coin_type && baseToken?.coin_type !== quoteToken?.coin_type) {
      const direct = getTokenRank(baseToken, quoteToken)
      console.log('test price kline direct:', direct)
      console.log('test price kline baseToken:', baseToken)
      console.log('test price kline quoteToken:', quoteToken)
      const newTokenA = direct ? baseToken : quoteToken
      const newTokenB = direct ? quoteToken : baseToken

      const newDTokenA = !isSwapSort ? newTokenA : newTokenB
      const newDTokenB = !isSwapSort ? newTokenB : newTokenA
      setTokenA(newDTokenA)
      setTokenB(newDTokenB)
    }
  }, [baseToken?.coin_type, quoteToken?.coin_type, isSwapSort])

  const coinPair = useMemo(() => {
    return `${tokenA?.coin_type}##${tokenB?.coin_type}`
  }, [tokenA?.coin_type, tokenB?.coin_type])

  const onChartReady = useCallback(() => {
    setIsLoading(false)
  }, [])

  // const [customApiIsNoData, setCustomApiIsNoData] = useState(false)
  // const handleChangeCustomApiIsNoData = useCallback((value: boolean) => {
  //   console.log('🚀 ~ handleChangeCustomApiIsNoData ~ value:', value)
  //   setCustomApiIsNoData(value)
  //   if (value) {
  //     setIsLoading(true)
  //   }
  // }, [])

  // useEffect(() => {
  //   if (coinPair) {
  //     setIsLoading(true)
  //     setCustomApiIsNoData(false)
  //   }
  // }, [coinPair])

  return (
    <VStack w="100%" position="relative" alignItems="start" gap={{ base: '4px', lg: '16px' }}>
      {!isProMode && (
        <Box>
          {isLoading ? (
            <HStack h="52px" lineHeight="52px" gap="8px">
              <SkeletonCircle />
              <SkeletonCircle />
              <Skeleton />
            </HStack>
          ) : (
            <HStack h="52px" lineHeight="52px" gap="8px">
              <CoinPairImage
                coinACoinType={tokenA?.coin_type}
                coinBCoinType={tokenB?.coin_type}
                coinAIconUrl={tokenA?.logo_url}
                coinBIconUrl={tokenB?.logo_url}
                ml="-4px"
              />
              <Text textColor="text_caption" fontSize="16px">
                {tokenA?.symbol} / {tokenB?.symbol}
              </Text>

              <Icon
                xlinkHref="#icon-icon_swap1"
                onClick={() => {
                  setIsSwapSort(!isSwapSort)
                }}
              />
            </HStack>
          )}
        </Box>
      )}
      <Block p="0" overflow="hidden" borderRadius="16px" position="relative" w="100%" h="422px">
        {isLoading && (
          <Center className="test-is-loading" position="absolute" left="0px" top="0px" w="100%" h="422px" bg="bg_primary" zIndex="10">
            <ChartLoading />
            {/* <ChartSkeletonLoader height={470} preserveAspectRatio="xMidYMid meet" color={'bg_primary'} /> */}
          </Center>
        )}
        {/* {customApiIsNoData ? ( */}
        {/* <iframe
          id="geckoterminal-embed"
          className="frame"
          style={{ display: isLoading ? 'none' : 'block' }}
          height="422px"
          width="100%"
          title="GeckoTerminal Embed"
          frameBorder="0"
          allow="clipboard-write"
          allowFullScreen
          src={`https://birdeye.so/tv-widget/${extractStructTagFromType(tokenA?.coin_type).full_address}/${extractStructTagFromType(tokenB?.coin_type).full_address}?chain=sui&viewMode=base%2Fquote&chartInterval=15&chartType=CANDLE&chartTimezone=Atlantic%2FReykjavik&chartLeftToolbar=show&theme=dark&cssCustomProperties=--tv-color-platform-background%3A%230F0F0F&cssCustomProperties=--tv-color-pane-background%3A%230F0F0F&chartOverrides=paneProperties.backgroundType%3Asolid&chartOverrides=paneProperties.backgroundGradientStartColor%3A%230F0F0F&chartOverrides=paneProperties.backgroundGradientEndColor%3A%230F0F0F&chartOverrides=paneProperties.background%3A%230F0F0F`}
          onLoad={() => {
            setIsLoading(false)
          }}
        /> */}

        {tokenA?.coin_type && tokenB?.coin_type && (
          <iframe
            id="geckoterminal-embed"
            className="frame"
            style={{ display: isLoading ? 'none' : 'block' }}
            height="422px"
            width="100%"
            title="GeckoTerminal Embed"
            frameBorder="0"
            allow="clipboard-write"
            allowFullScreen
            // src={`https://birdeye.so/tv-widget/${extractStructTagFromType(tokenA?.coin_type).full_address}/${extractStructTagFromType(tokenB?.coin_type).full_address}?chain=sui&viewMode=base%2Fquote&chartInterval=15&chartType=CANDLE&chartTimezone=Atlantic%2FReykjavik&chartLeftToolbar=show&theme=dark&cssCustomProperties=--tv-color-platform-background%3A%230F0F0F&cssCustomProperties=--tv-color-pane-background%3A%230F0F0F&chartOverrides=paneProperties.backgroundType%3Asolid&chartOverrides=paneProperties.backgroundGradientStartColor%3A%230F0F0F&chartOverrides=paneProperties.backgroundGradientEndColor%3A%230F0F0F&chartOverrides=paneProperties.background%3A%230F0F0F`}
            src={`https://noodles.fi/tv-widget?coinA=${toLongCoinType(tokenA?.coin_type)}&coinB=${toLongCoinType(tokenB?.coin_type)}&theme=dark`}
            onLoad={() => {
              setIsLoading(false)
            }}
          />
        )}

        {/* ) 
        : (
         <TradingViewChart tokenA={tokenA} tokenB={tokenB} onChartReady={onChartReady} onChangeApiStatus={handleChangeCustomApiIsNoData} />
         )} */}
      </Block>
    </VStack>
  )
}
