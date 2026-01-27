import Slippage from '@/components/common/Slippage'
import PriceImpact from '@/components/swap/PriceImpact'
import SwapRoutes from '@/components/swap/SwapRoutes'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import { useGetAmountLimit } from '@/hooks/swap/useSwapHelper'
import { useSwapRouter } from '@/hooks/swap/useSwapRouter'
import useGlobalStore from '@/store/common/global'
import { Block } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { Decimal, cancelBubble, formatNumber, formatNumberWithDown, isAvailableObject } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Box, Collapse, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'

type RouteBlockProps = {
  tokenA: any
  tokenB: any
  routerData: any
  findRouterLoading: boolean
  reCalculateRouteData: () => void
  routeErrorInfo?: any
}

function RouteBlock({ tokenA, tokenB, routerData, findRouterLoading, reCalculateRouteData, routeErrorInfo }: RouteBlockProps) {
  const fromCoinType = routeErrorInfo?.swap_in_coin_type || ''
  const { tokenInfo: fromToken } = useGetToken(fromCoinType)
  const amountIn = routeErrorInfo ? fromDecimalsAmount(routeErrorInfo?.swap_amount_in?.toString() || '0', fromToken?.decimals || 0) : ''

  const renderRoutes = (amountIn: string, symbol: string) => {
    return (
      <Block bg="#20282E" border="none" borderRadius="12px" p="12px">
        {!findRouterLoading && routeErrorInfo ? (
          <VStack w="100%" gap="0px" align="flex-start" pl="14px">
            <HStack w="100%">
              <Box as="span" w="4px" minW="4px" h="4px" bg="rgba(255,255,255,0.3)" borderRadius="50%" ml="-12px" zIndex="999" />
              <Text color="text_caption" fontSize="12px" lineHeight="20px">
                Swap {formatNumberWithDown(amountIn)} {symbol} → --
              </Text>
            </HStack>
            <Text color="primary_red" fontSize="12px" lineHeight="20px">
              {routeErrorInfo?.errorText || ''}
            </Text>
          </VStack>
        ) : findRouterLoading || isAvailableObject(routerData?.routerData) ? (
          <VStack gap="12px" w="100%" align="flex-start" position="relative">
            <RouteBlockItem data={routerData} findRouterLoading={findRouterLoading} />
          </VStack>
        ) : (
          <></>
        )}
      </Block>
    )
  }

  return (
    <VStack w="100%" align="flex-start" position="relative">
      <HStack w="100%" justify="space-between" sx={{ _hover: { '.icon_desc svg': { fill: 'text_caption' } } }}>
        <Text>Swap Route</Text>
        <HStack gap="8px">
          {/* <FreshProgressV2
            callbackInterval={5}
            ref={routeProgressRef}
            min={0}
            max={5}
            size="14px"
            noBg
            thickness="16px"
            onClick={() => {
              reCalculateRouteData?.()
              routeProgressRef.current?.reset()
            }}
          /> */}
          <Box onClick={e => cancelBubble(e)}>
            <Slippage slippageType="global" poolType="clmm" showFastMode={false} isModal={false} tokenA={tokenA} tokenB={tokenB} />
          </Box>
        </HStack>
      </HStack>
      <VStack w="100%" align="flex-start">
        {renderRoutes(amountIn, fromToken?.symbol || '')}
      </VStack>
    </VStack>
  )
}

const RouteBlockItem = ({
  data,
  findRouterLoading
}: {
  data: any
  findRouterLoading: boolean
}) => {
  const { slippage } = useGlobalStore()
  const routerData = data?.routerData
  const fromCoinType = routerData?.paths[0]?.from
  const toCoinType = routerData?.paths[routerData.paths.length - 1]?.target
  const { tokenInfo: fromToken } = useGetToken(fromCoinType)
  const { tokenInfo: toToken } = useGetToken(toCoinType)
  const amountOut = fromDecimalsAmount(routerData?.amountOut?.toString(), toToken?.decimals || 0)
  const amountIn = fromDecimalsAmount(routerData?.amountIn?.toString(), fromToken?.decimals || 0)

  const { marketPrice, priceImpact, sources, priceImpactTextInfo, showIncalculable } = usePriceImpact(fromToken, toToken, amountIn, amountOut)
  const { allProviders } = useSwapRouter(data)
  // useEffect(() => {
  //   if (priceImpact != null) setRoutePriceImpact(index, priceImpact)
  // }, [priceImpact, index, setRoutePriceImpact])

  const [isOpenEx, setIsOpenEx] = useState(false)

  const { amountLimit } = useGetAmountLimit(slippage, data)
  return (
    <VStack
      w="100%"
      gap="0px"
      align="flex-start"
      sx={{
        p: { fontSize: '12px !important' },
        svg: { width: '18px', height: '18px', ml: '-2px' },
        '>div': { justifyContent: 'flex-start', gap: '4px', '>div': { w: 'unset' } }
      }}
      position="relative"
    >
      <HStack minH="20px" w="100%" position="relative">
        <Skeleton isLoaded={!findRouterLoading}>
          <Text color="text_caption" fontSize="12px" lineHeight="20px">
            Swap {formatNumberWithDown(amountIn)} {fromToken?.symbol} → {formatNumberWithDown(amountOut)} {toToken?.symbol}
          </Text>
        </Skeleton>
      </HStack>

      <HStack justify="space-between" w="100%">
        <Box minH="20px" sx={{ div: { w: 'unset' } }}>
          <Skeleton isLoaded={!findRouterLoading}>
            <PriceImpact
              fromToken={fromToken!}
              toToken={toToken!}
              marketPrice={marketPrice}
              priceImpact={priceImpactTextInfo}
              sources={sources}
              showIncalculable={showIncalculable}
            />
          </Skeleton>
        </Box>
        <HStack flex={1} justifyContent="end" alignItems="center" cursor="pointer" onClick={() => setIsOpenEx(!isOpenEx)}>
          <Icon transform={isOpenEx ? 'rotate(180deg)' : 'rotate(0deg)'} transition="transform 0.5s" xlinkHref="#icon-icon_arrow" fontSize="12px" />
        </HStack>
      </HStack>
      <Collapse
        unmountOnExit
        animateOpacity
        in={isOpenEx}
        style={{ padding: '8px 4px', width: '100%', marginTop: '6px', background: '#192127', borderRadius: '8px' }}
        transition={{
          enter: { duration: 0.2, ease: 'easeOut' },
          exit: { duration: 0.2, ease: 'easeIn' }
        }}
      >
        <HTextLabelBox
          isLoading={findRouterLoading}
          label={'Minimum Received'}
          value={`${formatNumber(amountLimit, toToken?.decimals, false, Decimal.ROUND_DOWN)} ${toToken?.symbol}`}
          labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
          valueStyle={{ fontWeight: 500, fontSize: '14px' }}
          skeletonStyle={{
            valueW: '128px'
          }}
          wrapStyle={{
            p: '0 8px',
            mb: '4px',
            minH: '20px'
          }}
        />
        <SwapRoutes
          allProviders={allProviders}
          findRouterLoading={findRouterLoading}
          fromAmount={amountIn}
          toAmount={amountOut}
          fromCoin={fromToken}
          toCoin={toToken}
          data={data}
        />
      </Collapse>
    </VStack>
  )
}

export default RouteBlock
