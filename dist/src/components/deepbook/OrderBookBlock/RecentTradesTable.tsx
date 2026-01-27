import useGetDeepBookRecentTrades from '@/hooks/deepbook/useGetDeepBookRecentTrades'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData } from '@cetus/ui-kit'
import { abbreviateTokenName, formatNumber } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'

interface RecentTradesTableProps {
  currentDeepBookPool: any
  refreshTrigger?: number
  currentTab: string
}

export default function RecentTradesTable({ currentDeepBookPool, refreshTrigger, currentTab }: RecentTradesTableProps) {
  const { recentTrades, loading, initialized, getRecentTrades } = useGetDeepBookRecentTrades()
  const { isApp } = useWindowWidth()

  // 构建池子名称，例如 SUI_USDC
  // const poolName = useMemo(() => {
  //   if (!currentDeepBookPool?.baseAssets?.symbol || !currentDeepBookPool?.quoteAssets?.symbol) {
  //     return ''
  //   }
  //   return `${currentDeepBookPool.baseAssets.symbol}_${currentDeepBookPool.quoteAssets.symbol}`
  // }, [currentDeepBookPool?.baseAssets?.symbol, currentDeepBookPool?.quoteAssets?.symbol])

  // 获取交易数据
  useEffect(() => {
    if (currentDeepBookPool?.address && currentTab === 'RecentTrades') {
      getRecentTrades(currentDeepBookPool.address)
    }
  }, [currentDeepBookPool?.address, refreshTrigger, getRecentTrades, currentTab])

  // 格式化时间戳为 HH:MM:SS
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  // 动态获取资产符号
  const quoteSymbol = abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol) || 'QUOTE'
  const baseSymbol = abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol) || 'BASE'

  return (
    <Box
      w="100%"
      h="100%"
      p="0px 8px 0 12px"
      overflow="auto"
      position="relative"
      css={
        isApp
          ? {
              maxHeight: '400px',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }
          : undefined
      }
    >
      <HStack w="100%" spacing={0} justify="space-between" position="sticky" top="0px" zIndex={10} h="36px" bg="bg_secondary">
        <Text fontSize="12px" w="100%" fontWeight="500">
          Price ({quoteSymbol})
        </Text>
        <Text fontSize="12px" w="100%" fontWeight="500" textAlign="right">
          Size ({baseSymbol})
        </Text>
        <Text fontSize="12px" textAlign="right" w="100%" fontWeight="500">
          Time
        </Text>
      </HStack>

      {loading && recentTrades.length === 0 ? (
        <VStack w="100%" display="flex" justifyContent="center" alignItems="center" gap="1px">
          {Array.from({ length: 15 }, (_, index) => (
            <Skeleton key={`recent-trade-skeleton-${index}`} w="100%" h="20px" mb="1px" />
          ))}
        </VStack>
      ) : initialized && !loading && recentTrades.length === 0 ? (
        <Box w="100%" display="flex" justifyContent="center" alignItems="center" py="20px">
          <NoData type="nodata" text="No recent trades" noBorder bg="none" />
        </Box>
      ) : recentTrades.length > 0 ? (
        recentTrades.map((trade, index) => (
          <HStack key={`${trade.trade_id}-${index}`} my={index !== 0 ? '12px' : '0px'} w="100%" spacing={0} justify="space-between">
            <Text fontSize="12px" w="100%" color={trade.taker_is_bid ? 'primary_green' : 'primary_red'} fontWeight="500">
              {formatNumber(trade.price, 4)}
            </Text>
            <Text fontSize="12px" w="100%" color="text_caption" fontWeight="500" textAlign="right">
              {formatNumber(trade.base_volume, 2)}
            </Text>
            <Text fontSize="12px" w="100%" color="text_caption" fontWeight="500" textAlign="right">
              {formatTime(trade.timestamp)}
            </Text>
          </HStack>
        ))
      ) : null}
    </Box>
  )
}
