import PriceInput from '@/components/liquidity/clmm/ControlPriceRange/PriceInput'
import { useShowPriceWarn } from '@/hooks/create-pool/useCreatePoolHelper'
import useStatsTokens from '@/hooks/stats/useStatsTokens'
import { ErrorTips, InputBox, LockInput, SelectTab } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NumericFormatInput } from '@cetus/ui-kit'
import { convertScientificToDecimal, formatPrice, textEllipses } from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, Button, HStack, Heading, InputGroup, InputRightAddon, Stack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import CompletedBlock from '../CompletedBlock'
import MarketPrice from './MarketPrice'
import { CLMMInitPriceProps } from './type'

const rangeTabList = [
  {
    label: 'Full Range'
  },
  {
    label: 'Custom Range'
  }
]

function CLMMInitPrice({
  editStep,
  currTick,
  currentStep,
  onEdit,
  onContinue,
  displayBaseToken,
  displayQuoteToken,
  initPrice,
  onInitPriceChange,
  displayMinPrice,
  onMinPriceChange,
  displayMaxPrice,
  onMaxPriceChange,
  isFullRange,
  isReverse,
  handleRangeModeChange,
  handleSwitchDirectionChange,
  handlePriceAction
}: Omit<CLMMInitPriceProps, 'poolType'>) {
  const [rangeCurrentTab, setRangeCurrentTab] = useState<string>('Full Range')
  const { isApp } = useWindowWidth()
  const { getTokenPrice, fetchTokenPrices } = useTokenPrice()
  const { getAllStatesTokens } = useStatsTokens()
  const [showRefPrice, setShowRefPrice] = useState<boolean>(false)
  const tabList = useMemo(() => {
    if (displayMinPrice) {
      return [displayMinPrice.tokenA, displayMinPrice.tokenB].filter(Boolean).map(item => ({
        label: item?.symbol,
        isToken: true,
        imgInfo: {
          src: item?.logo_url,
          w: '16px',
          h: '16px',
          borderRadius: '50%',
          fallbackSrc: '/images/placeholder-token@2x.png'
        }
      }))
    }
    return []
  }, [displayMinPrice?.tokenA, displayMinPrice?.tokenB])

  const perText = useMemo(() => {
    return `${textEllipses(displayQuoteToken?.symbol)} per ${textEllipses(displayBaseToken?.symbol)}`
  }, [displayBaseToken?.symbol, displayQuoteToken?.symbol])

  const isDirect = useMemo(() => {
    if (isFullRange) {
      return true
    }
    return displayMinPrice?.tokenA?.coin_type === displayBaseToken?.coin_type
  }, [isFullRange, displayMinPrice?.tokenA, displayMinPrice?.tokenB, displayBaseToken?.coin_type])

  const { showInputPriceWarn, showPriceRangeWarn } = useShowPriceWarn(
    isFullRange,
    currTick,
    isReverse ? displayMaxPrice.tick : displayMinPrice.tick,
    isReverse ? displayMinPrice.tick : displayMaxPrice.tick
  )

  const isFullPriceRange = useMemo(() => {
    return displayMinPrice?.price === '0' && displayMaxPrice?.price === '∞'
  }, [displayMinPrice?.price, displayMaxPrice?.price])

  const isLock = useMemo(() => {
    return !+initPrice && !isFullRange
  }, [initPrice, isFullRange])

  const marketPrice = useMemo(() => {
    if (displayBaseToken && displayQuoteToken) {
      const priceA = getTokenPrice(displayBaseToken.coin_type)
      const priceB = getTokenPrice(displayQuoteToken.coin_type)
      if (priceA && priceB) {
        return d(priceA?.price).div(priceB?.price).toString()
      }
    }
  }, [displayBaseToken?.coin_type, displayQuoteToken?.coin_type, getTokenPrice])

  const fetchData = useCallback(async () => {
    try {
      if (displayBaseToken?.coin_type && displayQuoteToken?.coin_type) {
        const params = {
          coinTypes: [fixCoinType(displayBaseToken?.coin_type, false), fixCoinType(displayQuoteToken?.coin_type, false)]
        }
        const result: any = await getAllStatesTokens(params, false)
        if (result && result?.data?.length === 2) {
          console.log('🚀 ~ fetchData ~ result:', result)
          setShowRefPrice(!result?.data?.some(item => item?.tvl && d(item?.tvl?.replace(/[$,]/g, '')).lt(1000)))
        } else {
          setShowRefPrice(false)
        }
      }
    } catch (error) {}
  }, [displayBaseToken?.coin_type, displayQuoteToken?.coin_type])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <>
      {currentStep >= 3 ? (
        editStep === 3 || currentStep === 3 ? (
          <VStack w="100%" gap="32px" bg="bg_fifth" borderRadius="12px" p={{ base: '16px 8px', lg: '32px' }}>
            <VStack gap="8px" w="100%" align="flex-start">
              <Heading fontSize="16px" fontWeight="500">
                Set initial price
              </Heading>
              <Stack
                flexDir={{ base: 'column', lg: 'row' }}
                w="100%"
                justify="space-between"
                mt="-2px"
                alignItems={{ base: 'flex-start', lg: 'center' }}
              >
                <Text fontSize="12px">Please set an initial price for this new pool to start.</Text>
                <SelectTab<any, any>
                  type="outlineTab"
                  tabList={tabList}
                  currentTab={displayBaseToken?.symbol}
                  handleChangeTab={tab => {
                    if (tab.label !== displayBaseToken?.symbol) {
                      handleSwitchDirectionChange()
                    }
                  }}
                  wrapStyle={{
                    w: { base: '100%', lg: 'auto' },
                    h: '32px',
                    p: '3px',
                    border: '1px solid',
                    borderColor: 'border',
                    borderRadius: '8px',
                    gap: '4px'
                  }}
                  itemStyle={{
                    flex: 1,
                    h: '24px',
                    p: '4px 12px',
                    borderRadius: '4px',
                    gap: '4px'
                  }}
                />
              </Stack>
              <InputBox mt="4px" h="48px" borderRadius="12px" p="16px">
                <InputGroup fontFamily="Inter" justifyContent="space-between" gap="12px">
                  <NumericFormatInput
                    value={initPrice ? convertScientificToDecimal(initPrice, 18) : ''}
                    onChange={(value: string) => {
                      onInitPriceChange?.(value)
                    }}
                    placeholder="0.0"
                    inputAllowed
                    decimals={18}
                    style={{
                      width: 'calc(100% - 8px)',
                      background: 'none',
                      whiteSpace: 'nowrap',
                      opacity: 1,
                      outline: 'none',
                      color: 'var(--chakra-colors-text_caption)',
                      fontSize: '16px',
                      fontWeight: '500',
                      height: '14px',
                      lineHeight: '20px',
                      touchAction: 'manipulation',
                      transition: 'all 0.3s'
                    }}
                  />
                  <InputRightAddon>
                    <Text>{perText}</Text>
                  </InputRightAddon>
                </InputGroup>
              </InputBox>
              {showRefPrice && (
                <MarketPrice
                  inputPrice={initPrice}
                  marketPrice={marketPrice}
                  perText={perText}
                  onClick={() => onInitPriceChange(marketPrice ? marketPrice : '')}
                />
              )}
            </VStack>
            <VStack w="100%" align="flex-start" gap="12px">
              <Heading fontSize="16px" fontWeight="500">
                Set price range
              </Heading>
              <Text fontSize="12px">Please specify a price range that you want to provide your liquidity within.</Text>
              <SelectTab<any, any>
                type="outlineTab"
                tabList={rangeTabList}
                currentTab={isFullRange ? 'Full Range' : 'Custom Range'}
                handleChangeTab={tab => {
                  setRangeCurrentTab(tab?.label)
                  handleRangeModeChange(tab?.label === 'Full Range')
                }}
                wrapStyle={{
                  w: '100%',
                  h: '40px',
                  p: '3px',
                  border: '1px solid',
                  borderColor: 'border',
                  borderRadius: '12px',
                  gap: '4px'
                }}
                itemStyle={{
                  flex: '1',
                  h: '32px',
                  p: '8px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Stack mt="4px" position="relative" flexDir={{ base: 'column', lg: 'row' }} w="100%" gap={{ base: '8px', lg: '16px' }}>
                {/* opacity为0时修复出现input高亮后点击btn按钮 出现lock后 input高亮没消失的问题 */}
                <Box opacity={isLock ? 0 : 1} w={{ base: '100%', lg: '50%' }}>
                  <PriceInput
                    title="Min Price"
                    perText={perText}
                    data={displayMinPrice}
                    direct={isDirect}
                    loading={false}
                    handleAddPrice={data => handlePriceAction('Add', data)}
                    handleSubPrice={data => handlePriceAction('Sub', data)}
                    setTickDataBasedOnPrice={onMinPriceChange}
                    isFullRange={isFullPriceRange}
                  />
                </Box>
                <Box opacity={isLock ? 0 : 1} w={{ base: '100%', lg: '50%' }}>
                  <PriceInput
                    title="Max Price"
                    perText={perText}
                    data={displayMaxPrice}
                    direct={isDirect}
                    loading={false}
                    handleAddPrice={data => handlePriceAction('Add', data)}
                    handleSubPrice={data => handlePriceAction('Sub', data)}
                    setTickDataBasedOnPrice={onMaxPriceChange}
                    isFullRange={isFullPriceRange}
                  />
                </Box>
                {!+initPrice && !isFullRange && <LockInput position="absolute" top="0px" left="0" w="100%" h="80px" borderRadius="12px" text="" />}
                {isApp && !+initPrice && !isFullRange && (
                  <LockInput position="absolute" top="88px" left="0" w="100%" h="80px" borderRadius="12px" text="" />
                )}
              </Stack>
              {!isFullRange && showInputPriceWarn && !showPriceRangeWarn && (
                <ErrorTips
                  p="8px 16px"
                  w="100%"
                  isShowIcon={false}
                  type="warning"
                  borderRadius="8px"
                  tipsFontSize="12px"
                  tipsLineHeight="16px"
                  tips="To create a new pool, the initial price you set must be within your price range."
                />
              )}

              {!isFullRange && showPriceRangeWarn && (
                <ErrorTips
                  isShowIcon={false}
                  tipsFontSize="12px"
                  justifyContent="center"
                  tips="The max price should be higher than min price."
                  p="0 16px"
                  h="28px"
                  borderRadius="8px"
                />
              )}

              <Button
                mt="4px"
                w="100%"
                onClick={onContinue}
                isDisabled={!initPrice || !+initPrice || !displayMinPrice.price || !displayMaxPrice.price || showInputPriceWarn || showPriceRangeWarn}
                h="48px"
                fontSize="16px"
                borderRadius="12px"
              >
                {!initPrice || !+initPrice ? 'Enter initial price' : 'Continue'}
              </Button>
            </VStack>
          </VStack>
        ) : (
          <CompletedBlock onEdit={onEdit}>
            <VStack gap="12px" align="flex-start">
              <HStack>
                <Text whiteSpace="nowrap">Initial Price</Text>
                <Text color="text_caption" fontWeight="500">{`${formatPrice(convertScientificToDecimal(initPrice, 18), 18)} ${perText}`}</Text>
              </HStack>
              <HStack>
                <Text whiteSpace="nowrap">Price Range</Text>
                <Text color="text_caption" fontWeight="500">
                  {isFullRange
                    ? '0 - ∞'
                    : `${isReverse ? displayMinPrice.displayReversePrice : displayMinPrice?.displayPrice} - ${isReverse ? displayMaxPrice?.displayReversePrice : displayMaxPrice?.displayPrice} `}{' '}
                  {`${perText}`}{' '}
                </Text>
              </HStack>
            </VStack>
          </CompletedBlock>
        )
      ) : null}
    </>
  )
}

export default CLMMInitPrice
