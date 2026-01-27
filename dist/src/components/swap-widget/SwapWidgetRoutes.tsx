import V3Router from '@/components/swap/V3Router'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import { SingleCoinImage } from '@cetus/ui-kit'
import { addComma } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import OverView from '../swap/SwapRoutes/OverView'
import SwapWidgetBack from './SwapWidgetBack'

type SwapWidgetRoutesProps = {
  data?: any
  allProviders?: string[]
  onClose: () => void
}

export default function SwapWidgetRoutes(props: SwapWidgetRoutesProps) {
  const { onClose, data, allProviders } = props
  const { fromCoin, toCoin, findRouterLoading, fromAmount, toAmount } = useSwapWidgetStore()

  return (
    <VStack w="100%" gap="12px">
      <SwapWidgetBack title="Route" onBackClick={onClose} />

      <HStack w="100%" justify="space-between" p="0 12px">
        <Text fontSize="14px" color="text_caption" fontWeight="500" whiteSpace="nowrap">
          Router
        </Text>
        <Box>
          <OverView allProviders={allProviders} loading={findRouterLoading} />
        </Box>
      </HStack>
      <Box pl="12px" pr="12px" w="100%" overflowX="auto">
        <Box w="878px">
          <HStack w="100%" h="100%" justify="space-between" align="center" mb="16px">
            <HStack>
              <SingleCoinImage imageUrl={fromCoin?.logo_url} w="24px" h="24px" />
              <Text fontSize="14px" fontWeight="500" color="text_caption">
                {addComma(fromAmount || '0')}
              </Text>
              <Text fontSize="14px" fontWeight="500" color="primary_gray">
                {fromCoin?.symbol}
              </Text>
            </HStack>
            <HStack>
              <Text fontSize="14px" fontWeight="500" color="text_caption">
                {addComma(toAmount || '0')}
              </Text>
              <Text fontSize="14px" fontWeight="500" color="primary_gray">
                {toCoin?.symbol}
              </Text>
              <SingleCoinImage imageUrl={toCoin?.logo_url} w="24px" h="24px" />
            </HStack>
          </HStack>
          <V3Router data={data} originFromCoinType={fromCoin?.coin_type} originToCoinType={toCoin?.coin_type} isWidget={true} />
        </Box>
      </Box>
    </VStack>
  )
}
