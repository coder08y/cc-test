// import useLiquidityStore from '@/store/liquidity'
// import usePriceRangeStore from '@/store/liquidity/priceRange'
import DepositRatio from '@/components/common/DepositRatio'
import FreshProgressV2 from '@/components/swap/FreshProgressV2'
import useSlippageTolerance from '@/hooks/common/useSlippageTolerance'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
// import { Item } from '@/components/liquidity/provideLiquidity/common'
import useZapSubmit from '@/hooks/zap/useZapSubmit'
import useGlobalStore from '@/store/common/global'
import useZapStore from '@/store/zap/index'
import { TokensMap } from '@/types/clmm'
import { calcCoinProportion, checkFullRange } from '@/utils/pool'
import { ErrorTips, MarketSource, MarketType } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { bnToAmount, d, formatCurrencyWithKMB, formatNumberWithDown, formatPrice, textEllipses } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import RiskConfirm from '../common/RiskConfirm'

// 价格影响信息类型
interface PriceImpactTextInfo {
  textColor?: string
  priceImpactText?: string
}

// 路由内容组件的 Props 类型
interface ZapRouteContentProps {
  showRiskConfirm: boolean
  isBtnDisabled: boolean
  inConfirmModal?: boolean
  knowsRisk: boolean
  handleKnowsRisk: (value: boolean) => void
  liquiditySlippage: string | number
  action: 'Deposit' | 'Withdraw'
  isPreLoading: boolean
  fromAmount?: string
  fromCoin?: Token
  minimumReceived: string
  toCoin?: Token
  priceImpactTextInfo?: PriceImpactTextInfo
  sources: string[]
  isApp: boolean
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  currentPriceRate?: number
  isToggle: boolean
  handleToggleRate: () => void
  hideDepositRatio?: boolean
  tokenA?: Token
  tokenB?: Token
  percentMap: TokensMap
  isReverse?: boolean
  isPositionStyle?: boolean
  zapSlideValue: number
  originPosAmountA?: string
  originPosAmountB?: string
  coinAmountA?: string
  coinAmountB?: string
  amountARate?: number | string
  amountBRate?: number | string
}

// 提取路由内容组件
function ZapRouteContent({
  showRiskConfirm,
  isBtnDisabled,
  inConfirmModal,
  knowsRisk,
  handleKnowsRisk,
  liquiditySlippage,
  action,
  isPreLoading,
  fromAmount,
  fromCoin,
  minimumReceived,
  toCoin,
  priceImpactTextInfo,
  sources,
  isApp,
  isOpen,
  setIsOpen,
  currentPriceRate,
  isToggle,
  handleToggleRate,
  hideDepositRatio,
  tokenA,
  tokenB,
  percentMap,
  isReverse,
  isPositionStyle,
  zapSlideValue,
  originPosAmountA,
  originPosAmountB,
  coinAmountA,
  coinAmountB,
  amountARate,
  amountBRate
}: ZapRouteContentProps) {
  return (
    <>
      {showRiskConfirm && !isBtnDisabled && !inConfirmModal && (
        <RiskConfirm
          checked={knowsRisk}
          onChange={value => handleKnowsRisk(value)}
          slippage={d(liquiditySlippage).mul(100).toNumber()}
          tipType={d(liquiditySlippage).gte(0.1) ? 'error' : 'warning'}
        />
      )}
      <VStack
        w="100%"
        bg={inConfirmModal ? 'bg_secondary' : 'none'}
        borderRadius="12px"
        p={inConfirmModal ? '0px 12px' : '0px'}
        gap={inConfirmModal ? '4px' : '12px'}
        border="1px solid"
        borderColor={inConfirmModal ? 'border' : 'rgba(0,0,0,0)'}
        flexDirection={action === 'Withdraw' ? 'column-reverse' : 'column'}
      >
        <VStack
          w="100%"
          align="flex-start"
          bg={inConfirmModal ? 'none' : 'button_outline_hov_bg'}
          p={inConfirmModal ? '16px 0px' : '16px 12px'}
          borderRadius={inConfirmModal ? '0px' : '12px'}
          borderBottom="1px solid"
          borderColor={inConfirmModal ? 'border' : 'rgba(0,0,0,0)'}
        >
          <HStack w="100%" align="center">
            <VStack
              w="100%"
              align="flex-start"
              onClick={() => {
                setIsOpen(!isOpen)
              }}
            >
              <HStack w="100%" justify="flex-start">
                {isPreLoading ? (
                  <Skeleton w="100%" h="16px" />
                ) : (
                  <HStack w="100%" justify="flex-start">
                    <Box as="span" w="4px" minW="4px" h="4px" bg="rgba(255,255,255,0.3)" borderRadius="50%" zIndex="999" />
                    <Text w="100%" fontSize="12px" color="text_caption" textAlign="left">
                      Swap {formatNumberWithDown(fromAmount)} {fromCoin?.symbol} for {minimumReceived} {toCoin?.symbol}
                    </Text>
                  </HStack>
                )}
              </HStack>
              {isPreLoading ? (
                <Skeleton w="150px" h="16px" />
              ) : (
                <HStack w="100%" justify="space-between" align={{ base: 'flex-start', lg: 'center' }} flexDirection={{ base: 'column', lg: 'row' }}>
                  <HStack gap="4px" justify="space-between" w={{ base: '100%', lg: 'unset' }}>
                    <HStack gap="4px" ml="12px">
                      <HStack flexWrap="wrap">
                        <Text fontSize="12px" color="text_paragraph">
                          Price Difference
                        </Text>
                        <Text color={priceImpactTextInfo?.textColor} fontSize="12px">
                          {priceImpactTextInfo?.priceImpactText}
                        </Text>
                        {!sources.includes('cetus') &&
                          sources?.map((source: any) => {
                            return <MarketSource key={source} market={source as MarketType} />
                          })}
                      </HStack>
                    </HStack>
                    {isApp && <Icon xlinkHref="#icon-icon_arrow" svgW="12px" svgH="12px" transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} />}
                  </HStack>
                  {(!isApp || inConfirmModal) && (
                    <HStack align="center" gap="2px">
                      {inConfirmModal ? (
                        <HStack gap="4px">
                          <Text fontSize="12px" color="text_paragraph">
                            Slippage
                          </Text>
                          <Text fontSize="12px" color="text_caption">
                            {d(liquiditySlippage).mul(100).toString()}%
                          </Text>
                        </HStack>
                      ) : // zap不需要单独设置滑点
                      null}
                      {!isApp && <Icon xlinkHref="#icon-icon_arrow" svgW="12px" svgH="12px" transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} />}
                    </HStack>
                  )}
                </HStack>
              )}
            </VStack>
          </HStack>
          {isOpen && (
            <HStack w="100%" justify="space-between" bg="bg_fifth" h="52px" borderRadius="12px" p="0px 8px">
              <Text fontSize="12px" color="text_paragraph">
                Swap Rate
              </Text>
              {isPreLoading ? (
                <Skeleton w="150px" h="16px" />
              ) : (
                <HStack>
                  {isToggle ? (
                    <Text fontSize="12px" color="text_caption">
                      1 {toCoin?.symbol} = {formatPrice(currentPriceRate ? 1 / currentPriceRate : 0)} {fromCoin?.symbol}
                    </Text>
                  ) : (
                    <Text fontSize="12px" color="text_caption">
                      1 {fromCoin?.symbol} = {formatPrice(currentPriceRate || 0)} {toCoin?.symbol}
                    </Text>
                  )}
                  <Icon xlinkHref="#icon-icon_swap1" svgW="16px" svgH="16px" onClick={handleToggleRate} />
                </HStack>
              )}
            </HStack>
          )}
        </VStack>

        <VStack
          w="100%"
          p={inConfirmModal ? '16px 0px' : '16px 12px'}
          bg={inConfirmModal ? 'none' : 'button_outline_hov_bg'}
          borderRadius="12px"
          gap="12px"
        >
          {hideDepositRatio ? (
            <Text w="100%" textAlign="left" fontSize="12px" color="text_caption">
              {action === 'Withdraw' ? 'Expected Amounts of Remove' : 'Expected Amounts to Add'}
            </Text>
          ) : (
            <DepositRatio
              tokenA={tokenA}
              tokenB={tokenB}
              percentMap={percentMap}
              type="zap"
              isLoading={isPreLoading}
              isReverse={isReverse}
              label="Expected Amounts to Add"
            />
          )}
          <VStack
            bg="text_highlight_opacity.10"
            p="12px"
            w="100%"
            justify="space-between"
            gap="12px"
            h="auto"
            align="start"
            borderRadius={{ base: '8px', lg: '12px' }}
          >
            <PosAmountInfo
              isPositionStyle={isPositionStyle}
              token={!isReverse ? tokenA : tokenB}
              amount={
                !isReverse
                  ? formatNumberWithDown(zapSlideValue == 100 ? originPosAmountA : coinAmountA)
                  : formatNumberWithDown(zapSlideValue == 100 ? originPosAmountB : coinAmountB)
              }
              rate={!isReverse ? amountARate : amountBRate}
              loading={isPreLoading}
            />
            <PosAmountInfo
              isPositionStyle={isPositionStyle}
              token={!isReverse ? tokenB : tokenA}
              amount={
                !isReverse
                  ? formatNumberWithDown(zapSlideValue == 100 ? originPosAmountB : coinAmountB)
                  : formatNumberWithDown(zapSlideValue == 100 ? originPosAmountA : coinAmountA)
              }
              loading={isPreLoading}
              rate={!isReverse ? amountBRate : amountARate}
            />
          </VStack>
        </VStack>
      </VStack>
    </>
  )
}

export default function ZapSubmiteInfo({
  action,
  onClick,
  hideAmountInfo,
  otherLoading,
  isReverse,
  inConfirmModal,
  hideDepositRatio,
  isPositionStyle,
  mobileClick
}: {
  action: 'Deposit' | 'Withdraw'
  onClick?: () => void
  hideAmountInfo?: boolean
  otherLoading?: boolean
  isReverse?: boolean
  inConfirmModal?: boolean
  isPositionStyle?: boolean
  hideDepositRatio?: boolean
  mobileClick?: () => void
}) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { btnDisabled, btnText, handleZapIn, zapProgressRef, reCalculateZapData, isMinimumPrecision, zapNotAvailable } = useZapSubmit(action)

  const handleKnowsRisk = (value: boolean) => {
    setKnowsRisk(value)
  }

  const inputGroupRef = useRef<HTMLDivElement>(null)
  const [isInputInView, setIsInputInView] = useState(true)

  // 检测输入框是否在可视区域内
  useEffect(() => {
    const checkInputInView = () => {
      // 通过查询选择器找到包含 TradeInput 的容器
      const inputContainer = document.querySelector('[data-zap-input-container]') as HTMLElement
      if (!inputContainer) {
        setIsInputInView(true)
        return
      }

      const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
      if (!scrollContainer) {
        setIsInputInView(true)
        return
      }

      const containerRect = scrollContainer.getBoundingClientRect()
      const inputRect = inputContainer.getBoundingClientRect()

      // 检查输入框是否在滚动容器的可视区域内（考虑一些边距）
      const containerTop = containerRect.top
      const containerBottom = containerRect.bottom
      const inputTop = inputRect.top
      const inputBottom = inputRect.bottom

      // 输入框在可视区域内：输入框的顶部在容器顶部下方，且输入框的底部在容器底部上方（允许100px边距）
      const isVisible = inputTop >= containerTop - 100 && inputBottom <= containerBottom + 100
      setIsInputInView(isVisible)
    }

    checkInputInView()
    const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkInputInView)
      window.addEventListener('resize', checkInputInView)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkInputInView)
        window.removeEventListener('resize', checkInputInView)
      }
    }
  }, [])

  const [isOpen, setIsOpen] = useState(false)
  const { liquiditySlippage } = useGlobalStore()
  const { getTokenAmountValue } = useTokenPrice()

  const {
    zapSlideValue,
    preDepositeData,
    currentTokens,
    currentZapToken,
    zapAmount,
    isPreLoading,
    zapApiPool,
    lower,
    upper,
    zapCurrPriceData,
    posOriginAmounts,
    zapAmountRate
  } = useZapStore()

  // 检查输入框是否为空
  const isInputEmpty = useMemo(() => {
    return !zapAmount || zapAmount === '0' || zapAmount === ''
  }, [zapAmount])

  const handleOnClick = useCallback(() => {
    if (!currentAccount) {
      onWalletModal(true)
      return
    }
    // 如果输入框被遮挡且为空，滚动到页面底部
    if (!isInputInView && isInputEmpty) {
      const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
      if (scrollContainer) {
        // 使用双重 requestAnimationFrame 确保 DOM 已更新
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 计算最大滚动位置
            const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight
            // 直接设置 scrollTop 到最大值
            scrollContainer.scrollTop = maxScrollTop
            // 如果设置失败，使用 scrollTo 作为备选
            if (scrollContainer.scrollTop < maxScrollTop - 10) {
              scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
              })
            }
          })
        })
      }
      return
    }
    // 否则执行原来的逻辑
    onClick ? onClick() : handleZapIn()
  }, [isInputInView, isInputEmpty, handleZapIn, onClick, currentAccount, onWalletModal])

  const { fromCoin, toCoin } = useMemo(() => {
    const fromCoin = currentZapToken
    const toCoin = currentTokens?.filter((item: any) => item?.coin_type !== currentZapToken?.coin_type)?.[0]
    if (action === 'Withdraw') {
      return {
        fromCoin: toCoin,
        toCoin: fromCoin
      }
    } else {
      return {
        fromCoin,
        toCoin
      }
    }
  }, [currentZapToken?.coin_type, currentTokens, action])

  const { fromAmount, toAmount } = useMemo(() => {
    let fromAmount, toAmount
    if (preDepositeData && fromCoin?.coin_type && toCoin?.coin_type) {
      fromAmount = bnToAmount(preDepositeData?.swap_result?.swap_in_amount, fromCoin?.decimals)
      toAmount = bnToAmount(preDepositeData?.swap_result?.swap_out_amount, toCoin?.decimals)
    }
    return {
      fromAmount,
      toAmount
    }
  }, [preDepositeData, fromCoin?.coin_type, toCoin?.coin_type])

  const { sources, priceImpactTextInfo, showPriceImpactTips } = usePriceImpact(fromCoin, toCoin, fromAmount, toAmount)

  const [isToggle, setIsToggle] = useState(false)

  const handleToggleRate = () => {
    setIsToggle(!isToggle)
  }

  const minimumReceived = useMemo(() => {
    if (toAmount) {
      return formatNumberWithDown(d(toAmount).sub(d(toAmount).mul(liquiditySlippage)).toString())
    }
    return '--'
  }, [liquiditySlippage, toAmount])

  const currentPriceRate = useMemo(() => {
    return preDepositeData?.swap_result?.swap_price
  }, [preDepositeData])

  const handleRefresh = () => {
    // console.log('ZapRoute handleRefresh')
    reCalculateZapData()
  }

  const {
    tokenA,
    tokenB,
    coinAmountA,
    coinAmountB,
    displayCoinAmountA,
    displayCoinAmountB,
    displayTokenA,
    displayTokenB,
    displayAmountARate,
    displayAmountBRate,
    amountARate,
    amountBRate
  } = useMemo(() => {
    let coinAmountA, coinAmountB, tokenA, tokenB, amountARate, amountBRate
    const isReverse = zapApiPool?.isReverse
    if (preDepositeData && zapApiPool?.poolAddress) {
      tokenA = zapApiPool?.tokenA
      tokenB = zapApiPool?.tokenB
      coinAmountA = bnToAmount(preDepositeData?.amount_a, tokenA?.decimals)
      coinAmountB = bnToAmount(preDepositeData?.amount_b, tokenB?.decimals)
      amountARate = getTokenAmountValue(tokenA?.coin_type, coinAmountA)
      amountBRate = getTokenAmountValue(tokenB?.coin_type, coinAmountB)
    }

    return {
      displayCoinAmountA: !isReverse ? coinAmountA : coinAmountB,
      displayCoinAmountB: !isReverse ? coinAmountB : coinAmountA,
      displayTokenA: !isReverse ? tokenA : tokenB,
      displayTokenB: !isReverse ? tokenB : tokenA,
      displayAmountARate: !isReverse ? amountARate : amountBRate,
      displayAmountBRate: !isReverse ? amountBRate : amountARate,
      tokenA,
      tokenB,
      coinAmountA,
      coinAmountB,
      amountARate,
      amountBRate
    }
  }, [preDepositeData, zapApiPool?.poolAddress])

  const { originPosAmountA, originPosAmountB } = useMemo(() => {
    let originPosAmountA = ''
    let originPosAmountB = ''
    if (zapApiPool?.poolAddress && (posOriginAmounts?.coinAmountA || posOriginAmounts?.coinAmountB)) {
      const tokenA = zapApiPool?.tokenA
      const tokenB = zapApiPool?.tokenB
      originPosAmountA = bnToAmount(posOriginAmounts?.coinAmountA, tokenA?.decimals)
      originPosAmountB = bnToAmount(posOriginAmounts?.coinAmountB, tokenB?.decimals)
    }

    return { originPosAmountA, originPosAmountB }
  }, [posOriginAmounts, zapApiPool?.poolAddress])

  // 占比
  const [percentMap, setPercentMap] = useState<any>({})
  useEffect(() => {
    if (coinAmountA || coinAmountB) {
      const isFullRange = checkFullRange(lower, upper)
      const rateMap = calcCoinProportion(coinAmountA || 0, coinAmountB || 0, zapCurrPriceData?.currentPrice, isFullRange)
      setPercentMap(rateMap)
    }
  }, [coinAmountA, coinAmountB, zapCurrPriceData?.currentPrice])

  const { isApp } = useWindowWidth()

  const errorTips = useMemo(() => {
    if (d(zapAmountRate).gt(50000)) {
      return 'In Zap mode, each request should be within $50,000.'
    } else if (d(zapAmountRate).gt(0) && (d(zapAmountRate).lt(0.0001) || isMinimumPrecision)) {
      return 'The input is too small. Zap mode is not available.'
    } else if (zapNotAvailable) {
      return 'Zap mode is not available.'
    }
    return ''
  }, [zapAmountRate, action, isMinimumPrecision, zapNotAvailable])

  // 计算按钮是否应该禁用
  const isBtnDisabled = useMemo(() => {
    if (!currentAccount) return false
    // 如果输入框未被遮挡，走原来的disabled逻辑
    // 如果输入框在可视区域内且为空，确保按钮是disabled的
    if (isInputInView) {
      return isPreLoading || btnDisabled || otherLoading || showPriceImpactTips || !!errorTips || isInputEmpty
    }
    // 如果输入框被遮挡且为空，按钮可点击（用于滚动）
    if (!isInputInView && isInputEmpty) {
      return false
    }
    // 其他情况走原来的逻辑
    return (isPreLoading || btnDisabled || otherLoading || showPriceImpactTips || !!errorTips) && !!currentAccount?.address
  }, [isInputInView, isInputEmpty, isPreLoading, btnDisabled, otherLoading, showPriceImpactTips, errorTips, currentAccount?.address])

  const { isRegularTokenPair } = useSlippageTolerance(fromCoin, toCoin, liquiditySlippage, true)

  const showRiskConfirm = useMemo(() => {
    const fromAmountValue = getTokenAmountValue(fromCoin?.coin_type, fromAmount)
    return isRegularTokenPair && d(fromAmountValue || 0).gte(import.meta.env.VITE_LIMIT_RISK_AMOUNT) && d(liquiditySlippage).gt(0.02)
  }, [isRegularTokenPair, fromAmount, liquiditySlippage, fromCoin?.coin_type, getTokenAmountValue])

  const [knowsRisk, setKnowsRisk] = useState<boolean>(false)
  const [isOpenRoute, setIsOpenRoute] = useState(false)

  return (
    <>
      <VStack
        gap="0px"
        w="100%"
        borderRadius="16px"
        border={isPositionStyle ? 'none' : '1px solid'}
        borderColor={inConfirmModal ? 'rgba(0,0,0,0)' : 'border'}
        bg={inConfirmModal || isPositionStyle ? 'none' : 'bg_six'}
        p={{ base: inConfirmModal || isPositionStyle ? '0px' : '0px 8px', lg: inConfirmModal || isPositionStyle ? '0px' : '0px 16px' }}
        className="fixed-bottom-submit"
        sx={{
          ...(isApp &&
            !inConfirmModal && {
              position: 'fixed',
              bottom: '0px',
              left: '0px',
              right: '0px',
              zIndex: '1000',
              p: '8px 12px 32px',
              border: 0,
              bg: 'bg_primary',
              flexDirection: 'column-reverse',
              borderRadius: '0',
              borderTop: '1px solid',
              borderColor: 'border'
            })
        }}
      >
        {!inConfirmModal && (
          <Button
            w={{
              base: '100%', //isPositionStyle ? '' : 'calc(100% + 16px)',
              lg: isPositionStyle ? '100%' : 'calc(100% + 34px)'
            }}
            margin="-1px -1px 0px"
            h={{ base: '42px', lg: '52px' }}
            fontSize={{ base: '14px', lg: '18px' }}
            fontWeight="500"
            borderRadius={{ base: '8px', lg: '16px' }}
            isDisabled={isBtnDisabled || (showRiskConfirm && !knowsRisk)}
            isLoading={isPreLoading || otherLoading}
            onClick={handleOnClick}
          >
            {btnText}
          </Button>
        )}

        {!!Number(zapAmount) && (
          <VStack w="100%" gap="0px">
            {errorTips ? (
              <Box w="100%" p={isPositionStyle ? '12px 0px 0px' : '12px 0px'}>
                <ErrorTips tips={errorTips} />
              </Box>
            ) : (
              <>
                {showPriceImpactTips && (
                  <Box w="100%" pt="12px">
                    <ErrorTips tips="High price difference. Be cautious before submitting your order." />
                  </Box>
                )}
                {inConfirmModal && (
                  <HStack mb="12px" w="100%" justify="space-between">
                    <Text fontSize={{ base: '12px', lg: '14px' }} color="text_paragraph">
                      Zap Amount
                    </Text>
                    <Text fontSize={{ base: '12px', lg: '14px' }} color="text_caption">
                      {formatCurrencyWithKMB(zapAmountRate, 2)}
                    </Text>
                  </HStack>
                )}
                {Number(zapAmount) > 0 && Number(fromAmount) > 0 && (
                  <VStack
                    w="100%"
                    gap="12px"
                    pt={{ base: '0px', lg: '16px' }}
                    pb={{ base: inConfirmModal ? '0px' : '12px', lg: inConfirmModal || isPositionStyle ? '0px' : '16px' }}
                  >
                    <HStack w="100%" justify="space-between" cursor="pointer" onClick={() => setIsOpenRoute(!isOpenRoute)}>
                      <Text fontSize={{ base: '12px', lg: '14px' }} color="text_paragraph">
                        Zap Route
                      </Text>
                      <HStack gap="4px">
                        <FreshProgressV2
                          callbackInterval={20}
                          ref={zapProgressRef}
                          min={0}
                          max={20}
                          size={isApp ? '12px' : '14px'}
                          noBg={true}
                          thickness="16px"
                          onClick={handleRefresh}
                        />
                        {/* {isApp ? (
                          <Icon xlinkHref='#icon-detail' svgW='12px' svgH='12px' />
                        ) : ( */}
                        {isApp ? (
                          <Icon xlinkHref="#icon-detail" svgW="14px" svgH="14px" transform={isOpenRoute ? 'rotate(270deg)' : 'rotate(90deg)'} />
                        ) : (
                          <Icon xlinkHref="#icon-icon_arrow" svgW="14px" svgH="14px" transform={isOpenRoute ? 'rotate(180deg)' : 'rotate(0deg)'} />
                        )}
                        {/* )} */}
                      </HStack>
                    </HStack>
                    {/* PC端直接展开 */}
                    {isOpenRoute && (
                      <ZapRouteContent
                        showRiskConfirm={showRiskConfirm}
                        isBtnDisabled={isBtnDisabled}
                        inConfirmModal={inConfirmModal}
                        knowsRisk={knowsRisk}
                        handleKnowsRisk={handleKnowsRisk}
                        liquiditySlippage={liquiditySlippage}
                        action={action}
                        isPreLoading={isPreLoading}
                        fromAmount={fromAmount}
                        fromCoin={fromCoin}
                        minimumReceived={minimumReceived}
                        toCoin={toCoin}
                        priceImpactTextInfo={priceImpactTextInfo}
                        sources={sources}
                        isApp={isApp}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        currentPriceRate={currentPriceRate}
                        isToggle={isToggle}
                        handleToggleRate={handleToggleRate}
                        hideDepositRatio={hideDepositRatio}
                        tokenA={tokenA}
                        tokenB={tokenB}
                        percentMap={percentMap}
                        isReverse={isReverse}
                        isPositionStyle={isPositionStyle}
                        zapSlideValue={zapSlideValue}
                        originPosAmountA={originPosAmountA}
                        originPosAmountB={originPosAmountB}
                        coinAmountA={coinAmountA}
                        coinAmountB={coinAmountB}
                        amountARate={amountARate}
                        amountBRate={amountBRate}
                      />
                    )}

                    {/* 移动端使用抽屉 */}
                    {/* {isApp && (
                      <VaulDrawer isOpen={isOpenRoute} onClose={() => setIsOpenRoute(false)}>
                        <Text fontSize='14px' color='text_caption' fontWeight='500' mb='12px'>
                          Zap Route
                        </Text>
                        <VStack alignItems='flex-start' gap='12px' w='100%'>
                          <ZapRouteContent
                            showRiskConfirm={showRiskConfirm}
                            isBtnDisabled={isBtnDisabled}
                            inConfirmModal={inConfirmModal}
                            knowsRisk={knowsRisk}
                            handleKnowsRisk={handleKnowsRisk}
                            liquiditySlippage={liquiditySlippage}
                            action={action}
                            isPreLoading={isPreLoading}
                            fromAmount={fromAmount}
                            fromCoin={fromCoin}
                            minimumReceived={minimumReceived}
                            toCoin={toCoin}
                            priceImpactTextInfo={priceImpactTextInfo}
                            sources={sources}
                            isApp={isApp}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            currentPriceRate={currentPriceRate}
                            isToggle={isToggle}
                            handleToggleRate={handleToggleRate}
                            hideDepositRatio={hideDepositRatio}
                            tokenA={tokenA}
                            tokenB={tokenB}
                            percentMap={percentMap}
                            isReverse={isReverse}
                            isPositionStyle={isPositionStyle}
                            zapSlideValue={zapSlideValue}
                            originPosAmountA={originPosAmountA}
                            originPosAmountB={originPosAmountB}
                            coinAmountA={coinAmountA}
                            coinAmountB={coinAmountB}
                            amountARate={amountARate}
                            amountBRate={amountBRate}
                          />
                        </VStack>
                      </VaulDrawer>
                    )} */}
                  </VStack>
                )}
              </>
            )}
          </VStack>
        )}
      </VStack>
    </>
  )
}

function PosAmountInfo({
  token,
  amount,
  rate,
  loading,
  align = 'left',
  isPositionStyle
}: {
  token: any
  amount: any
  rate: any
  loading: boolean
  align?: string
  isPositionStyle?: boolean
}) {
  return (
    <HStack flex="1" gap="8px" justify="flex-start" flexDirection={align === 'left' ? 'row' : 'row-reverse'}>
      {loading ? <SkeletonCircle size="20px" /> : <SingleCoinImage imageUrl={token?.logo_url} w="20px" h="20px" />}
      <VStack align={`flex-${align === 'left' ? 'start' : 'end'}`} gap="4px">
        {loading ? (
          <Skeleton w="50px" h="14px" />
        ) : (
          <Text fontSize="12px" color="text_caption" textAlign={`${align === 'left' ? 'left' : 'right'}`}>
            {amount} {textEllipses(token?.symbol, 10)}
          </Text>
        )}
        {loading ? (
          <Skeleton w={{ base: '70px', lg: '100px' }} h="12px" />
        ) : (
          <Text fontSize="12px" color="text_paragraph">
            {/* {rate && !!+rate ? `${formatCurrencyWithKMB(rate, 2)}` : null} */}
            {formatCurrencyWithKMB(rate, 2)}
          </Text>
        )}
      </VStack>
    </HStack>
  )
}
