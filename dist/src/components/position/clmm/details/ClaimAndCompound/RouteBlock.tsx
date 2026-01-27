import FreshProgressV2, { FreshProgressRef } from '@/components/swap/FreshProgressV2'
import PriceImpact from '@/components/swap/PriceImpact'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import usePositionCompoundStore from '@/store/position/compound'
import usePositionDetailStore from '@/store/position/detail'
import { Block } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { Icon } from '@cetus/ui-kit'
import { formatNumberWithDown } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

type InfoItem = { title: string; info: string }

type RouteBlockProps = {
  allRoutes: any[]
  findRouterLoading: boolean
  reCalculateRouteData: () => void
  isFrom: string
  routeErrorInfo?: any
  firstInfo?: { title: string; info: string }
  secondTitle?: string
  lastInfo?: InfoItem
}

function RouteBlock({
  allRoutes,
  findRouterLoading,
  reCalculateRouteData,
  isFrom,
  firstInfo,
  secondTitle,
  lastInfo,
  routeErrorInfo
}: RouteBlockProps) {
  const fromCoinType = routeErrorInfo?.swap_in_coin_type || ''
  const { tokenInfo: fromToken } = useGetToken(fromCoinType)
  const amountIn = routeErrorInfo ? fromDecimalsAmount(routeErrorInfo?.swap_amount_in?.toString() || '0', fromToken?.decimals || 0) : ''

  const [isOpen, setIsOpen] = useState(false)
  const routeProgressRef = useRef<FreshProgressRef>(null)

  const topDotRef = useRef<HTMLDivElement>(null)
  const bottomDotRef = useRef<HTMLDivElement>(null)
  const [lineHeight, setLineHeight] = useState(0)

  const { showConfirmPriceDiffInfo } = usePositionCompoundStore()
  // const isShowConfirmPriceDiff = showConfirmPriceDiffInfo[isFrom]

  const [isShowConfirmPriceDiff, setIsShowConfirmPriceDiff] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowConfirmPriceDiff(showConfirmPriceDiffInfo[isFrom])
    }, 800)
    return () => clearTimeout(timer)
  }, [showConfirmPriceDiffInfo])

  const { isPosDetailRefresh } = usePositionDetailStore()

  useEffect(() => {
    if (isPosDetailRefresh) routeProgressRef.current?.reset()
  }, [isPosDetailRefresh])

  // 🧩 计算虚线高度
  useEffect(() => {
    if (allRoutes?.length <= 1) {
      setLineHeight(0)
      return
    }
    if (topDotRef.current && bottomDotRef.current) {
      const topY = topDotRef.current.getBoundingClientRect().top
      const bottomY = bottomDotRef.current.getBoundingClientRect().top
      const height = bottomY - topY
      setLineHeight(height)
    }
  }, [allRoutes, isOpen])

  const renderInfoBlock = (item?: InfoItem) =>
    item?.title && item?.info ? (
      <Block bg="#20282E" border="none" borderRadius="12px" p="12px">
        <Text fontSize="12px" mb="8px">
          {item.title}
        </Text>
        <HStack w="100%" gap="6px" pl="14px" position="relative">
          <Box position="absolute" top="8px" left="2px" as="span" w="4px" h="4px" bg="rgba(255, 255, 255, 0.3)" borderRadius="50%" />
          <Text color="text_caption" fontSize="12px" lineHeight="20px">
            {item.info}
          </Text>
        </HStack>
      </Block>
    ) : null

  const renderRoutes = (lineHeight: number, amountIn: string, symbol: string) => {
    if (findRouterLoading && !allRoutes?.length && !routeErrorInfo)
      return (
        <Block bg="#20282E" border="none" borderRadius="12px" p="12px">
          <VStack w="100%" align="flex-start">
            <Skeleton h="20px" w="100%" borderRadius="8px" />
            <Skeleton h="20px" w="100%" borderRadius="8px" />
          </VStack>
        </Block>
      )

    if (!allRoutes?.length && !routeErrorInfo) return null

    return (
      <Block bg="#20282E" border="none" borderRadius="12px" p="12px">
        {secondTitle && (
          <Text fontSize="12px" mb="8px">
            {secondTitle}
          </Text>
        )}
        {routeErrorInfo ? (
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
        ) : (
          <VStack gap="12px" w="100%" align="flex-start" position="relative">
            {/* 🧩 绘制虚线 */}
            {lineHeight > 0 && (
              <Box
                position="absolute"
                left="3px"
                top="14px"
                height={`${lineHeight - 8}px`}
                borderLeft="2px dotted rgba(255,255,255,0.3)"
                zIndex="1"
              />
            )}
            {allRoutes.map((route, idx) => (
              <RouteBlockItem
                key={idx}
                index={idx}
                route={route}
                isFrom={isFrom}
                routeLength={allRoutes.length}
                topDotRef={idx === 0 ? topDotRef : undefined}
                bottomDotRef={idx === allRoutes.length - 1 ? bottomDotRef : undefined}
              />
            ))}
          </VStack>
        )}
      </Block>
    )
  }

  return (
    <VStack w="100%" align="flex-start" position="relative">
      <HStack w="100%" justify="space-between" onClick={() => setIsOpen(v => !v)} sx={{ _hover: { '.icon_desc svg': { fill: 'text_caption' } } }}>
        <Text>Route</Text>
        <HStack gap="0">
          <FreshProgressV2
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
          />
          {isShowConfirmPriceDiff && <Icon xlinkHref="#icon-warning" variant="error" svgW="14px" svgH="14px" />}
          <Box className="icon_desc">
            <Icon transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} transition="transform 0.5s" xlinkHref="#icon-icon_descending_nor" />
          </Box>
        </HStack>
      </HStack>
      <VStack w="100%" align="flex-start" display={isOpen ? 'flex' : 'none'}>
        {/* {renderInfoBlock(firstInfo)} */}
        {renderRoutes(lineHeight, amountIn, fromToken?.symbol || '')}
        {/* {renderInfoBlock(lastInfo)} */}
      </VStack>
    </VStack>
  )
}

const RouteBlockItem = ({
  index,
  route,
  routeLength,
  isFrom,
  topDotRef,
  bottomDotRef
}: {
  index: number
  route: any
  routeLength: number
  isFrom?: string
  topDotRef?: React.RefObject<HTMLDivElement>
  bottomDotRef?: React.RefObject<HTMLDivElement>
}) => {
  const isMove = isFrom == 'move'
  const { setRoutePriceImpact } = usePositionCompoundStore()
  const fromCoinType = route.paths[0].from
  const toCoinType = route.paths[route.paths.length - 1].target
  const { tokenInfo: fromToken } = useGetToken(fromCoinType)
  const { tokenInfo: toToken } = useGetToken(toCoinType)
  const amountOut = fromDecimalsAmount(route.amountOut.toString(), toToken?.decimals || 0)
  const amountIn =
    isMove && route?.displaySwapAmountIn
      ? fromDecimalsAmount(route.displaySwapAmountIn.toString(), fromToken?.decimals || 0)
      : fromDecimalsAmount(route.amountIn.toString(), fromToken?.decimals || 0)

  const { marketPrice, priceImpact, sources, priceImpactTextInfo, showIncalculable } = usePriceImpact(fromToken, toToken, amountIn, amountOut)

  useEffect(() => {
    if (priceImpact != null) setRoutePriceImpact(index, priceImpact, isFrom)
  }, [priceImpact, index, setRoutePriceImpact])

  const isFirst = index === 0
  const isLast = index === routeLength - 1

  return (
    <VStack
      w="100%"
      gap="0px"
      align="flex-start"
      pl="14px"
      sx={{
        p: { fontSize: '12px !important' },
        svg: { width: '18px', height: '18px', ml: '-2px' },
        '>div': { justifyContent: 'flex-start', gap: '4px', '>div': { w: 'unset' } }
      }}
      position="relative"
    >
      <HStack w="100%" position="relative">
        {(isFirst || isLast) && (
          <Box
            ref={isFirst ? topDotRef : isLast ? bottomDotRef : undefined}
            as="span"
            position="absolute"
            top="8px"
            left="-12px"
            w="4px"
            minW="4px"
            h="4px"
            bg="rgba(255,255,255,0.3)"
            borderRadius="50%"
            zIndex="999"
          />
        )}
        <Text color="text_caption" fontSize="12px" lineHeight="20px">
          Swap {formatNumberWithDown(amountIn)} {fromToken?.symbol} → {formatNumberWithDown(amountOut)} {toToken?.symbol}
        </Text>
      </HStack>

      <PriceImpact
        fromToken={fromToken!}
        toToken={toToken!}
        marketPrice={marketPrice}
        priceImpact={priceImpactTextInfo}
        sources={sources}
        showIncalculable={showIncalculable}
      />
    </VStack>
  )
}

export default RouteBlock
