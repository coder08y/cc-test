import { useGetMinReceivedAmount, usePriceAcceptSwapQuote } from '@/hooks/merge-swap/useMergeSwapHelper'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useGlobalStore from '@/store/common/global'
import useMergeSwapStore from '@/store/merge-swap/useMergeSwapStore'
import { MergeSwapQuote } from '@/types/merge_swap'
import { CurrentPrice } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HTextLabelBox, Icon, SingleCoinImage } from '@cetus/ui-kit'
import { formatNumber, formatPercentage } from '@cetus/utils'
import { fixCoinType, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react'
import cloneDeep from 'lodash-es/cloneDeep'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PriceImpact from '../swap/PriceImpact'

type MergeSwapConfirmProps = {
  data: MergeSwapQuote
  isOpen: boolean
  onClose: () => void
  handleRouterSwap: (data: MergeSwapQuote) => void
}

export default function MergeSwapConfirm(props: MergeSwapConfirmProps) {
  const { mergeSwapQuote } = useMergeSwapStore()
  const { data, isOpen, onClose, handleRouterSwap } = props
  const { mergeSwapSlippage } = useGlobalStore()
  const [hasPriceImpactWarn, setHasPriceImpactWarn] = useState(false)
  const [tokenWarnStates, setTokenWarnStates] = useState<Record<string, boolean>>({})
  const [originData, setOriginData] = useState<MergeSwapQuote>(data)
  // 用户点击了 忽视PriceImpact
  const [ignorePriceImpact, setIgnorePriceImpact] = useState<boolean>(false)
  // 控制滚动容器的状态
  const [needsScroll, setNeedsScroll] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const minReceivedAmount = useGetMinReceivedAmount(mergeSwapSlippage.toString(), originData.totalAmountOutDisplay)

  const priceAcceptSwapQuote = usePriceAcceptSwapQuote(originData, mergeSwapQuote)
  const { isApp } = useWindowWidth()

  const [maxHeight, setMaxHeight] = useState<number>(isApp ? 450 : 600)

  const showPriceUpdated = useMemo(() => {
    return priceAcceptSwapQuote !== undefined
  }, [priceAcceptSwapQuote])

  // 处理单个 token 的价格影响警告状态变化
  const handleTokenPriceImpactWarnChange = useCallback((coinType: string, hasWarn: boolean) => {
    setTokenWarnStates(prev => ({
      ...prev,
      [coinType]: hasWarn
    }))
  }, [])

  // 检查是否有任何 token 显示价格影响警告
  useEffect(() => {
    const hasAnyWarn = Object.values(tokenWarnStates).some(hasWarn => hasWarn)
    setHasPriceImpactWarn(hasAnyWarn)
  }, [tokenWarnStates])

  // 检测内容高度，决定是否需要滚动
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const maxHeight = window.innerHeight - 300
        const needsScroll = container.scrollHeight > maxHeight
        setNeedsScroll(needsScroll)
        setMaxHeight(maxHeight)
      }
    }

    // 初始检查
    checkScrollNeeded()

    // 监听窗口大小变化
    window.addEventListener('resize', checkScrollNeeded)

    // 使用 ResizeObserver 监听内容变化
    let resizeObserver: ResizeObserver | null = null
    if (scrollContainerRef.current) {
      resizeObserver = new ResizeObserver(checkScrollNeeded)
      resizeObserver.observe(scrollContainerRef.current)
    }

    return () => {
      window.removeEventListener('resize', checkScrollNeeded)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [scrollContainerRef.current, originData.fromTokenList, hasPriceImpactWarn, showPriceUpdated])

  const toAmountItem = useCallback(
    (coinType: string) => {
      const coinTypeFix = fixCoinType(coinType, false)
      const amountOut = originData.data?.allRoutes.find(route => fixCoinType(route.paths[0].from, false) === coinTypeFix)?.amountOut.toString()
      if (amountOut) {
        return fromDecimalsAmount(amountOut, originData.toToken.decimals)
      }
      return '0'
    },
    [originData?.data?.allRoutes, originData.toToken.decimals]
  )

  const buttonDisabled = useMemo(() => {
    if (ignorePriceImpact) {
      return false
    }

    if (hasPriceImpactWarn) {
      return true
    }
    return false
  }, [ignorePriceImpact, hasPriceImpactWarn])

  const handlePriceAcceptClick = () => {
    if (priceAcceptSwapQuote) {
      const safeData = cloneDeep(priceAcceptSwapQuote)
      setOriginData({ ...safeData })
    }
  }

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={() => onClose()} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading fontWeight="500" fontSize="16px">
            Merge Swap
          </Heading>
        </ModalHeader>
        <ModalCloseButton onClick={() => onClose()} />
        <ModalBody textAlign="center" p="16px">
          <VStack w="100%" gap="16px">
            <VStack ref={scrollContainerRef} w="100%" gap="8px" maxH={`${maxHeight}px`} overflowY={needsScroll ? 'auto' : 'visible'}>
              {/* from token 列表 */}
              {originData.fromTokenList.map(token => (
                <TokenInItem
                  key={token.coin_type}
                  fromToken={token}
                  toToken={originData.toToken}
                  fromAmount={originData.fromAmountObj[token.coin_type]}
                  toAmount={toAmountItem(token.coin_type)}
                  onPriceImpactWarnChange={hasWarn => handleTokenPriceImpactWarnChange(token.coin_type, hasWarn)}
                />
              ))}
              {/* 指示箭头 */}
              <Center
                minH="36px"
                maxH="36px"
                w="36px"
                h="36px"
                mt="8px"
                mb="8px"
                borderRadius="50%"
                border="1px solid"
                borderColor="token_inactive_border"
                bg={'input_bg'}
              >
                <Icon cursor="default" xlinkHref="#icon-a-icon_trade" svgFill="text_caption" fontSize="12px" />
              </Center>

              {/* to token */}
              <HStack
                justifyContent={'center'}
                w="100%"
                borderRadius="12px"
                bg="bg_primary"
                border="1px solid"
                borderColor="border"
                p="16px"
                gap="8px"
              >
                <SingleCoinImage imageUrl={originData.toToken.logo_url} w="32px" h="32px" coinType={data.toToken.coin_type} />
                <Text fontSize="16px" color="text_caption">
                  {formatNumber(originData.totalAmountOutDisplay, originData.toToken.decimals)} {originData.toToken.symbol}
                </Text>
              </HStack>

              <HTextLabelBox
                label={'Slippage Tolerance'}
                value={formatPercentage(Number(mergeSwapSlippage) * 100)}
                labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
                valueStyle={{ fontWeight: 500, fontSize: '14px' }}
                skeletonStyle={{
                  valueW: '128px'
                }}
                wrapStyle={{
                  mt: '8px'
                }}
              />
              <HTextLabelBox
                label={'Minimum Received'}
                value={`${formatNumber(minReceivedAmount, originData.toToken.decimals)} ${originData.toToken.symbol}`}
                labelStyle={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}
                valueStyle={{ fontWeight: 500, fontSize: '14px' }}
                skeletonStyle={{
                  valueW: '128px'
                }}
                wrapStyle={{
                  mt: '8px'
                }}
              />
            </VStack>

            {/* 价格警告 */}
            {hasPriceImpactWarn && (
              <VStack w="100%" gap="8px">
                <HStack
                  w="100%"
                  bg="primary_red_opacity.10"
                  borderRadius="12px"
                  border="1px solid"
                  borderColor="border"
                  justifyContent="start"
                  p="10px 16px"
                >
                  <Text color="primary_red" fontSize="12px" lineHeight="20px" textAlign="start">
                    The exchange rate of this order deviates from the market price by a large percentage. Are you sure you want to continue the swap?
                  </Text>
                </HStack>
                <HStack w="100%" justifyContent="space-between" gap="16px">
                  <Button
                    variant="outline"
                    w="100%"
                    color="text_highlight"
                    fontSize="14px"
                    borderColor={ignorePriceImpact ? 'text_highlight' : 'button_outline_border'}
                    onClick={() => {
                      setIgnorePriceImpact(true)
                    }}
                  >
                    Yes, please continue.
                  </Button>
                  <Button
                    variant="outline"
                    w="100%"
                    color="text_highlight"
                    fontSize="14px"
                    borderColor="button_outline_border"
                    onClick={() => onClose()}
                  >
                    No,cancel it.
                  </Button>
                </HStack>
              </VStack>
            )}
            {showPriceUpdated && (
              <HStack w="100%" justifyContent="space-between">
                <HStack>
                  <Icon xlinkHref="#icon-icon_priceupdated1" svgW="20px" svgH="20px" />
                  <Text color="text_caption" fontWeight="500" fontSize="14px">
                    Price updated
                  </Text>
                </HStack>
                <Button onClick={handlePriceAcceptClick} h="40px" borderRadius="12px" fontSize="16px" fontWeight="500" p="0 42px">
                  Accept
                </Button>
              </HStack>
            )}
            {!showPriceUpdated && (
              <Button
                fontSize="18px"
                fontWeight="500"
                width="100%"
                h="52px"
                isDisabled={buttonDisabled}
                colorScheme={hasPriceImpactWarn ? 'orange' : 'blue'}
                onClick={() => {
                  handleRouterSwap(originData)
                  onClose()
                }}
              >
                Confirm
              </Button>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

type TokenInItemProps = {
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  onPriceImpactWarnChange?: (hasWarn: boolean) => void
}
function TokenInItem(props: TokenInItemProps) {
  const { fromToken, toToken, fromAmount, toAmount, onPriceImpactWarnChange } = props
  const { marketPrice, priceImpact, sources, priceImpactTextInfo, showIncalculable, showPriceImpactWarn } = usePriceImpact(
    fromToken,
    toToken,
    fromAmount,
    toAmount
  )

  useEffect(() => {
    onPriceImpactWarnChange?.(showPriceImpactWarn)
  }, [showPriceImpactWarn])
  return (
    <VStack gap="12px" w="100%" borderRadius="12px" bg="bg_primary" border="1px solid" borderColor="border" p="16px">
      <HStack w="100%" justifyContent="space-between">
        <SingleCoinImage imageUrl={fromToken.logo_url} w="32px" h="32px" coinType={fromToken.coin_type} />
        <VStack alignItems="end" gap="4px">
          <Text fontSize="16px" color="text_caption" fontWeight="500">
            {formatNumber(fromAmount, fromToken.decimals)} {fromToken.symbol}
          </Text>
          <CurrentPrice noIcon={true} fromToken={fromToken} toToken={toToken} fromValue={fromAmount} toValue={toAmount} fontSize={'14px'} />
        </VStack>
      </HStack>

      <Box w="100%" borderBottom="1px dashed" borderColor="border" />

      <PriceImpact
        fromToken={fromToken}
        toToken={toToken}
        marketPrice={marketPrice}
        priceImpact={priceImpactTextInfo}
        sources={sources}
        showIncalculable={showIncalculable}
      />
    </VStack>
  )
}
