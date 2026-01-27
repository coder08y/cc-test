import PriceImpact from '@/components/swap/PriceImpact'
import OverView from '@/components/swap/SwapRoutes/OverView'
import { useGetRouterProviders } from '@/hooks/merge-swap/useMergeSwapHelper'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useGlobalStore from '@/store/common/global'
import { CurrentPrice, ErrorTips } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { HTextLabelBox, Icon, SingleCoinImage } from '@cetus/ui-kit'
import { cancelBubble, formatCurrency, formatNumber } from '@cetus/utils'
import { MergeRoute } from '@cetusprotocol/aggregator-sdk'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Box, Collapse, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

export function MergeSwapRouteItem({
  route,
  index,
  openRoutesModal
}: {
  route: MergeRoute
  index: number
  openRoutesModal: (index: number) => void
}) {
  const { getTokenAmountValue } = useTokenPrice()
  if (route.paths.length === 0) return <></>
  const fromCoinType = route.paths[0].from
  const toCoinType = route.paths[route.paths.length - 1].target
  const { routeProviders } = useGetRouterProviders(route.paths || [])
  const { tokenInfo: fromToken } = useGetToken(fromCoinType)
  const { tokenInfo: toToken } = useGetToken(toCoinType)

  const amount_out_ui = fromDecimalsAmount(route.amountOut.toString(), toToken?.decimals || 0)
  const amount_in_ui = fromDecimalsAmount(route.amountIn.toString(), fromToken?.decimals || 0)

  const amount_out_usd = getTokenAmountValue(toCoinType, amount_out_ui)

  const { marketPrice, swapPrice, priceImpact, sources, priceImpactTextInfo, showIncalculable } = usePriceImpact(
    fromToken,
    toToken,
    amount_in_ui,
    amount_out_ui
  )
  const [isOpenEx, setIsOpenEx] = useState(false)

  return (
    <VStack w="100%" borderRadius="12px" bg="card_bg" p="16px" gap="12px">
      <HStack w="100%" justifyContent="space-between">
        <HStack gap="8px">
          <SingleCoinImage imageUrl={fromToken?.logo_url} w="28px" h="28px" coinType={fromCoinType} />
          <Icon xlinkHref="#icon-icon_double_arrow_left" svgW="12px" svgH="12px" iconCursor="default" showHover={false} />
          <SingleCoinImage imageUrl={toToken?.logo_url} w="28px" h="28px" coinType={toCoinType} />
        </HStack>
        <VStack gap="6px" alignItems="end">
          <Text fontSize="16px" color="text_caption" fontWeight="500">
            {formatNumber(amount_out_ui)} {toToken?.symbol}
          </Text>
          <Text fontSize="14px">{formatCurrency(amount_out_usd, 2)}</Text>
        </VStack>
      </HStack>
      <Box w="100%" borderBottom="1px dashed" borderColor="border" />
      <PriceImpact
        fromToken={fromToken!}
        toToken={toToken!}
        marketPrice={marketPrice}
        priceImpact={priceImpactTextInfo}
        sources={sources}
        showIncalculable={showIncalculable}
      />
      <HStack w="100%" justifyContent="space-between">
        <CurrentPrice
          noIcon={true}
          fromToken={fromToken!}
          toToken={toToken!}
          fromValue={amount_in_ui}
          toValue={amount_out_ui}
          color="text_caption"
          fontSize={'14px'}
        />
        <HStack flex={1} justifyContent="end" alignItems="center" cursor="pointer" onClick={() => setIsOpenEx(!isOpenEx)}>
          <Icon
            transform={isOpenEx ? 'rotate(0deg)' : 'rotate(180deg)'}
            transition="transform 0.5s"
            xlinkHref="#icon-icon_ascending"
            fontSize="18px"
          />
        </HStack>
      </HStack>
      {d(priceImpact).lte(-30) && (
        <ErrorTips tipsFontSize="12px" tips="High price difference. Be cautious before submitting your order." p="8px" gap="4px" />
      )}
      <Collapse
        unmountOnExit
        animateOpacity
        in={isOpenEx}
        style={{ width: '100%' }}
        transition={{
          enter: { duration: 0.2, ease: 'easeOut' },
          exit: { duration: 0.2, ease: 'easeIn' }
        }}
      >
        <RouteItemEx
          toToken={toToken}
          amount_out_ui={amount_out_ui}
          allProviders={routeProviders}
          handleOpenRoutesModal={() => openRoutesModal(index)}
        />
      </Collapse>
    </VStack>
  )
}

type RouteItemExProps = {
  amount_out_ui: string
  allProviders: string[]
  toToken?: Token
  handleOpenRoutesModal: () => void
}

function RouteItemEx({ amount_out_ui, allProviders, handleOpenRoutesModal, toToken }: RouteItemExProps) {
  const { slippage } = useGlobalStore()

  const minReceivedAmount = useMemo(() => {
    if (+amount_out_ui) {
      return d(amount_out_ui)
        .mul(d(1).sub(d(slippage)))
        .toString()
    }
  }, [slippage, amount_out_ui])

  return (
    <VStack w="100%" bg="primary_opacity.10" borderRadius="8px" p="12px" gap="12px">
      <HTextLabelBox
        label={'Minimum Received'}
        value={`${formatNumber(minReceivedAmount)} ${toToken?.symbol}`}
        labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
        valueStyle={{ fontWeight: 500, fontSize: '14px' }}
        skeletonStyle={{
          valueW: '128px'
        }}
        wrapStyle={{
          minH: '20px'
        }}
      />

      <HStack w="100%" justify="space-between" align="flex-start">
        <Text fontWeight="500" whiteSpace="nowrap">
          Route
        </Text>
        <Box
          mt="-2px"
          onClick={e => {
            cancelBubble(e)
            handleOpenRoutesModal()
          }}
          cursor="pointer"
        >
          <OverView allProviders={allProviders}>
            <Icon xlinkHref="#icon-icon_spread" fontSize="16px" />
          </OverView>
        </Box>
      </HStack>
    </VStack>
  )
}
