import ChartLoading from '@/components/chart/ChartLoading'
import useDeepBookStore from '@/store/deepbook'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { abbreviateTokenName, getPriceUnit, isOKXAndroidApp } from '@cetus/utils'
import { Box, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import DeepbookTradingViewChart from '../tradingViewDeepbookChart'
import H5DeepbookTradingViewChart from '../tradingViewDeepbookChart/h5Index'

export default function DeepbookChart({ currentDeepBookPool }: { currentDeepBookPool: any }) {
  const { setDeepbookPrice } = useDeepBookStore()
  const { isApp } = useWindowWidth()
  const isOKXInAndroid = isApp && isOKXAndroidApp()

  const handleDeepbookPriceChange = (data: { poolId: string; price: string }) => {
    if (data?.poolId && data?.price) {
      setDeepbookPrice({ ...data })
    }
  }

  const poolId = useMemo(() => {
    return (
      `${abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)}-${abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)}::${currentDeepBookPool?.address}` ||
      ''
    )
  }, [currentDeepBookPool?.address])

  const poolPriceUnit = useMemo(() => {
    if (currentDeepBookPool?.price) {
      return String(getPriceUnit(currentDeepBookPool?.price))
    }
    return '4'
  }, [currentDeepBookPool?.address])

  // 在安卓手机端，确保 Provider 注入成功后再加载组件
  // 修改逻辑：允许在 OKX Android App 中渲染，或者非 App 环境渲染
  const shouldRenderChart = poolId && poolPriceUnit !== undefined

  return (
    <VStack w="100%" h="100%">
      <Box p="0" overflow="hidden" position="relative" borderRadius="0 0 8px 8px" w="100%" h="100%">
        {!shouldRenderChart && <ChartLoading />}
        {shouldRenderChart && !isOKXInAndroid && (
          <DeepbookTradingViewChart poolId={poolId} poolPriceUnit={poolPriceUnit} onChangePrice={handleDeepbookPriceChange} />
        )}
        {shouldRenderChart && isOKXInAndroid && (
          <H5DeepbookTradingViewChart poolId={poolId} poolPriceUnit={poolPriceUnit} onChangePrice={handleDeepbookPriceChange} />
        )}
      </Box>
    </VStack>
  )
}
