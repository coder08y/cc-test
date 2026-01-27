import { AddressCopyLink, MarketSource, MarketType, Ratio, TooltipIcon } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenStore from '@cetus/stores/src/token'
import { Token } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import { formatUSDPrice, textEllipses } from '@cetus/utils'
import { Box, HStack, StackProps, Text, TextProps, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import PriceChart from './PriceChart'

interface PriceReferenceProps {
  fromCoin?: Token
  toCoin?: Token
  wrapStyle?: StackProps
  titleStyle?: TextProps
  itemStyle?: StackProps
  chartStyle?: StackProps
  type?: 'swap' | 'deepbook'
  iconSize?: string
}

function PriceReference({
  fromCoin,
  toCoin,
  wrapStyle = { gap: '28px' },
  titleStyle,
  itemStyle,
  type = 'swap',
  chartStyle,
  iconSize = '20px'
}: PriceReferenceProps) {
  const { isApp } = useWindowWidth()
  const { verifiedTokenMap } = useTokenStore()

  const tokenList = useMemo(() => {
    const from = verifiedTokenMap?.get(fromCoin?.coin_type as string)
    const to = verifiedTokenMap?.get(toCoin?.coin_type as string)
    return [from || fromCoin, to || toCoin]
  }, [fromCoin?.coin_type, toCoin?.coin_type, verifiedTokenMap])

  return tokenList.length ? (
    <VStack w="100%" align="flex-start" gap="8px" mt={{ base: '12px', lg: '0' }}>
      <HStack justify="flex-start" h="52px" align="center" gap="4px" {...titleStyle}>
        <Text fontSize={isApp ? '12px' : '14px'} fontWeight="500" color="text_caption" h="20px" lineHeight="20px">
          Price Reference
        </Text>
        <TooltipIcon
          iconSize={iconSize}
          tooltipCon="The following price is only an external reference from 3rd party data providers, which does not reflect actual data on Cetus."
        />
      </HStack>
      <VStack w="100%" {...wrapStyle} overflow={'hidden'}>
        {/* {(fromCoin?.is_verified === undefined ? fromCoin?.is_trusted : fromCoin?.is_verified) && ( */}
        <Item coin={tokenList[0]} itemStyle={itemStyle} type={type} chartStyle={chartStyle} />
        {/* )} */}
        {/* {(toCoin?.is_verified === undefined ? toCoin?.is_trusted : toCoin?.is_verified) && ( */}
        <Item coin={tokenList[1]} itemStyle={itemStyle} type={type} chartStyle={chartStyle} />
        {/* )} */}
      </VStack>
    </VStack>
  ) : null
}

const Item = ({
  coin,
  itemStyle,
  type,
  chartStyle
}: {
  coin?: Token
  itemStyle?: StackProps
  type?: 'swap' | 'deepbook'
  chartStyle?: StackProps
}) => {
  const { getExplorerUrl } = useExplorer()
  const { getPriceKline, getTokenPrice } = useTokenPrice()
  const [priceData, setPriceData] = useState<{ price: any[]; daily_rate: string }>({ price: [], daily_rate: '' })

  useEffect(() => {
    setPriceData({ price: [], daily_rate: '' })
  }, [coin?.coin_type])

  const coinMarketInfo = getTokenPrice(coin?.coin_type as string)

  const fetchPriceData = async (coin_type: string, market: string) => {
    try {
      const data = await getPriceKline(coin_type, market)
      setPriceData(data)
    } catch (error) {
      console.log(error, 'error')
    }
  }

  useEffect(() => {
    // market = cetus时不再请求chart接口
    if (coinMarketInfo?.base_symbol && coinMarketInfo?.market !== 'cetus') {
      // if (coinMarketInfo?.base_symbol) {
      fetchPriceData(coinMarketInfo?.base_symbol, coinMarketInfo?.market)
    }
  }, [coinMarketInfo?.base_symbol, coinMarketInfo?.market, coin?.coin_type])

  const { isApp } = useWindowWidth()

  // 在 swap 页面，如果没有价格数据则不显示
  if (type === 'swap' && (!priceData || priceData.price.length === 0)) {
    return <></>
  }

  const typeIsDeepbookAndPrice =
    type === 'deepbook' && coinMarketInfo?.market !== 'coingecko' && coinMarketInfo?.market !== 'pyth' && coinMarketInfo?.price !== undefined
  if (typeIsDeepbookAndPrice) {
    return <></>
  }

  return (
    <VStack
      w="100%"
      gap="12px"
      border={isApp && type === 'deepbook' ? '1px solid #262626' : 'none'}
      pb={isApp && type === 'deepbook' ? '8px' : type === 'deepbook' ? '16px' : '0'}
      {...itemStyle}
    >
      <HStack w="100%" justify="space-between" align="flex-start" h="32px">
        <HStack>
          <SingleCoinImage imageUrl={coin?.logo_url} coinType={coin?.coin_type} w="28px" h="28px" />
          <VStack align="flex-start" gap="4px">
            <Text fontSize="14px" h="16px" lineHeight="16px" fontWeight="600" color="text_caption">
              {coin?.symbol}
            </Text>
            <Text fontSize="12px" h="12px" lineHeight="12px" fontWeight="500">
              {textEllipses(coin?.name, 20)}
            </Text>
          </VStack>
        </HStack>
        <HStack>
          {coinMarketInfo?.market && <MarketSource market={coinMarketInfo?.market as MarketType} />}
          <Text color="text_caption" fontSize="14px" fontWeight="500">
            ${coinMarketInfo?.price !== undefined ? formatUSDPrice(coinMarketInfo?.price) : '--'}
          </Text>
          {priceData?.daily_rate && coinMarketInfo?.price !== undefined && <Ratio value={priceData?.daily_rate} />}
        </HStack>
      </HStack>
      <HStack w="100%" justify="space-between" align="flex-end" gap="0">
        <AddressCopyLink
          address={coin?.coin_type as string}
          onClickLink={() => window.open(getExplorerUrl(coin?.coin_type, 'coin'))}
          wrapStyle={{ border: '1px solid', borderColor: 'border', h: '24px', borderRadius: '8px', p: '0 8px', bg: 'bg_secondary', gap: '8px' }}
          fontWeight="500"
          iconGap="8px"
        />
        <Box flex={chartStyle?.flex || { base: '0 0 200px', lg: type === 'deepbook' ? '0 0 170px' : '0 0 210px' }} h="24px" mr="-13px">
          {coinMarketInfo?.price !== undefined && priceData?.price.length > 0 ? (
            <PriceChart data={priceData?.price} />
          ) : type === 'deepbook' ? null : (
            <Text fontSize="12px" p="0 16px" textAlign="right">
              No available data
            </Text>
          )}
        </Box>
      </HStack>
    </VStack>
  )
}

export default PriceReference
