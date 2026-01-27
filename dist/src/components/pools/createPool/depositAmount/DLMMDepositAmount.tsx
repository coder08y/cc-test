import FunnelPrice from '@/components/common/FunnelPrice'
import TotalAmount from '@/components/common/TotalAmount'
import PriceInput from '@/components/liquidity/dlmm/ControlPriceRange/PriceInput'
import { Strategy } from '@/components/liquidity/dlmm/SelectStrategy'
import useCreateDlmmButtonStatus from '@/hooks/create-pool/useCreateDlmmButtonStatus'
import { useShowDlmmPriceWarn } from '@/hooks/create-pool/useCreatePoolHelper'
import useCreateDlmmPoolStore from '@/store/pool/createDlmmPool'
import { CetusTooltip, ErrorTips, SelectTab, TradeInputGroup } from '@cetus/design'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { isAvailableObject, textEllipses } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { MAX_BIN_PER_POSITION, StrategyType } from '@cetusprotocol/dlmm-sdk'
import { Box, Button, Center, FormControl, FormLabel, HStack, Heading, Stack, Switch, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import CreateDlMMChart from './DlMMChart'
import type { DLMMDepositAmountProps } from './type'

function DLMMDepositAmount({
  initPrice,
  currentStep,
  editStep,
  onCreate,
  baseToken,
  quoteToken,
  baseAmount,
  quoteAmount,
  displayBaseToken,
  displayQuoteToken,
  onBaseAmountChange,
  onQuoteAmountChange,
  isReverse,
  handlePriceAction,
  minPriceData,
  maxPriceData,
  binStep,
  fixAmountA,
  setFixAmountA,
  isAutoFill,
  setIsAutoFill,
  strategy,
  setStrategy,
  onPriceChange
}: DLMMDepositAmountProps) {
  const { balanceInfo: baseBalanceInfo } = useGetTokenBalance(baseToken)
  const { balanceInfo: quoteBalanceInfo } = useGetTokenBalance(quoteToken)
  const { fetchTokenPrices, getTokenAmountValue } = useTokenPrice()
  const { numBins, positionCount, baseTokenLock, quoteTokenLock, activeId } = useCreateDlmmPoolStore()
  const { btnText, btnDisabled } = useCreateDlmmButtonStatus(
    baseAmount,
    quoteAmount,
    baseToken,
    quoteToken,
    baseBalanceInfo,
    quoteBalanceInfo,
    positionCount,
    baseTokenLock,
    quoteTokenLock
  )
  const { showInputPriceWarn, showPriceRangeWarn } = useShowDlmmPriceWarn(activeId, minPriceData?.binId, maxPriceData?.binId)
  // 刷新市场价格
  const refreshMarketPrice = () => {
    const list = []
    if (baseToken?.coin_type) {
      list.push(baseToken?.coin_type)
    }

    if (quoteToken?.coin_type) {
      list.push(quoteToken?.coin_type)
    }

    if (list.length > 0) {
      fetchTokenPrices(list)
    }
  }

  useEffect(() => {
    refreshMarketPrice()
  }, [baseToken?.coin_type, quoteToken?.coin_type])

  const baseAmountValue = getTokenAmountValue(baseToken?.coin_type, baseAmount)
  const quoteAmountValue = getTokenAmountValue(quoteToken?.coin_type, quoteAmount)

  const totalAmount = useMemo(() => {
    if (+baseAmountValue && +quoteAmountValue) {
      return d(baseAmountValue || '0')
        .plus(quoteAmountValue || '0')
        .toString()
    }
    return undefined
  }, [baseAmountValue, quoteAmountValue])

  const tabList = useMemo(() => {
    if (isAvailableObject(baseToken) && isAvailableObject(quoteToken)) {
      return [baseToken, quoteToken].filter(Boolean).map(item => ({
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
  }, [baseToken, quoteToken])

  const [currentTab, setCurrentTab] = useState('')

  useEffect(() => {
    if (tabList?.length > 0) {
      setCurrentTab(tabList?.[0]?.label + '')
    }
  }, [tabList])

  const isDirect = useMemo(() => {
    return currentTab === baseToken?.symbol
  }, [currentTab, baseToken?.symbol])

  const perText = useMemo(() => {
    return isDirect
      ? `${textEllipses(quoteToken?.symbol)}/${textEllipses(baseToken?.symbol)}`
      : `${textEllipses(baseToken?.symbol)}/${textEllipses(quoteToken?.symbol)}`
  }, [baseToken?.symbol, quoteToken?.symbol, isDirect])

  return (
    <>
      {currentStep === 4 && editStep === 4 ? (
        <VStack w="100%" gap="40px" bg="bg_fifth" borderRadius="12px" p={{ base: '16px 8px', lg: '32px' }} align="flex-start">
          <VStack w="100%" gap="12px">
            <VStack w="100%" align="flex-start">
              <HStack w="100%" justify="space-between">
                <Heading fontSize="16px" fontWeight="500">
                  Deposit amounts
                </Heading>
                <FormControl display="flex" alignItems="center" w="fit-content">
                  <FormLabel htmlFor="auto-fill" mb="0" fontSize="14px" color="text_paragraph">
                    Auto Fill
                  </FormLabel>
                  <Switch id="auto-fill" isChecked={isAutoFill} onChange={() => {}} isDisabled />
                </FormControl>
              </HStack>
              <Text fontSize="12px">Please enter the amount you want to deposit into the pool</Text>
            </VStack>

            <TradeInputGroup
              wrapStyle={{ mt: '4px' }}
              from={{
                wrapStyle: { h: '108px' },
                balance: baseBalanceInfo?.balanceFormat || '',
                value: baseAmount,
                amountValue: baseAmountValue,
                loading: false,
                onChange: value => {
                  setFixAmountA(true)
                  onBaseAmountChange(value)
                },
                selectable: false,
                placeholder: '0.0',
                token: baseToken,
                lock: {
                  isLock: !baseTokenLock && quoteTokenLock,
                  text: 'The current pool price is outside your specified price range. Single-asset deposit only.'
                }
              }}
              to={{
                wrapStyle: { h: '108px' },
                balance: quoteBalanceInfo?.balanceFormat || '',
                value: quoteAmount,
                amountValue: quoteAmountValue,
                loading: false,
                onChange: value => {
                  setFixAmountA(false)
                  onQuoteAmountChange(value)
                },
                selectable: false,
                placeholder: '0.0',
                token: quoteToken,
                lock: {
                  isLock: baseTokenLock && !quoteTokenLock,
                  text: 'The current pool price is outside your specified price range. Single-asset deposit only.'
                }
              }}
              lock={{
                isLock: baseTokenLock && quoteTokenLock,
                style: { h: '224px' }
              }}
            />
          </VStack>

          <VStack w="100%" align="flex-start" gap="12px">
            <VStack w="100%" align="flex-start">
              <Heading fontSize="16px" fontWeight="500">
                Select Strategy
              </Heading>

              <Text fontSize="12px">Choose the liquidity distribution strategy you want</Text>
            </VStack>

            <HStack w="100%" justify="space-between">
              <Strategy type={StrategyType.Spot} isActive={strategy === StrategyType.Spot} onClick={() => setStrategy(StrategyType.Spot)} size="l" />
              <Strategy
                type={StrategyType.Curve}
                isActive={strategy === StrategyType.Curve}
                onClick={() => setStrategy(StrategyType.Curve)}
                size="l"
              />
              <Strategy
                type={StrategyType.BidAsk}
                isActive={strategy === StrategyType.BidAsk}
                onClick={() => setStrategy(StrategyType.BidAsk)}
                size="l"
              />
            </HStack>
          </VStack>
          <VStack w="100%" gap="12px">
            <VStack w="100%" align="flex-start" gap="12px">
              <HStack w="100%" justify="space-between" align="flex-start">
                <VStack align="flex-start">
                  <Heading fontSize="16px" fontWeight="500">
                    Set Price Range
                  </Heading>
                  <Text fontSize="12px">Set the price range you want to provide liquidity</Text>
                </VStack>

                <SelectTab<any, any>
                  type="outlineTab"
                  tabList={tabList}
                  currentTab={currentTab}
                  handleChangeTab={tab => {
                    if (tab.label !== currentTab) {
                      setCurrentTab(tab.label)
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
              </HStack>
              <HStack w="100%" justify="space-between">
                <HStack gap="12px">
                  <Legend symbol={baseToken!.symbol} color="dlmm_blue" />
                  <Legend symbol={quoteToken!.symbol} color="dlmm_green" />
                </HStack>
                <FunnelPrice label="Initial Price" />
              </HStack>

              <CreateDlMMChart direct={isDirect} />

              <HStack w="100%" justifyContent="space-between" bg="num_bins_bg" borderRadius="12px" p="12px 8px">
                <HStack left="12px" top="17px">
                  <HStack gap="4px">
                    <Text>Num Bins</Text>
                    <CetusTooltip tooltip="Total bins in this position or actions.">
                      <Center cursor="pointer">
                        <Icon xlinkHref="#icon-icon_tips" svgW="20px" svgH="20px" />
                      </Center>
                    </CetusTooltip>
                  </HStack>
                </HStack>
                <Text>{numBins}</Text>
              </HStack>
              <Stack mt="4px" position="relative" flexDir={{ base: 'column', lg: 'row' }} w="100%" gap={{ base: '8px', lg: '16px' }}>
                {/* opacity为0时修复出现input高亮后点击btn按钮 出现lock后 input高亮没消失的问题 */}
                <Box opacity={1} w={{ base: '100%', lg: '50%' }}>
                  <PriceInput
                    title="Min Price"
                    perText={perText}
                    maxPrice={initPrice}
                    data={isDirect ? minPriceData : maxPriceData}
                    direct={isDirect}
                    loading={false}
                    onPriceChange={onPriceChange}
                    handleAddPrice={data => handlePriceAction?.('Add', data, isDirect)}
                    handleSubPrice={data => handlePriceAction?.('Sub', data, isDirect)}
                  />
                </Box>
                <Box opacity={1} w={{ base: '100%', lg: '50%' }}>
                  <PriceInput
                    title="Max Price"
                    perText={perText}
                    minPrice={initPrice}
                    data={isDirect ? maxPriceData : minPriceData}
                    direct={isDirect}
                    loading={false}
                    onPriceChange={onPriceChange}
                    handleAddPrice={data => handlePriceAction?.('Add', data, !isDirect)}
                    handleSubPrice={data => handlePriceAction?.('Sub', data, !isDirect)}
                  />
                </Box>
              </Stack>

              {isAvailableObject(maxPriceData) && isAvailableObject(minPriceData) && d(maxPriceData?.price).lt(minPriceData?.price) && (
                <ErrorTips
                  isShowIcon={false}
                  tipsFontSize="12px"
                  justifyContent="center"
                  tips="The Max price should be higher than or equal to the Min price."
                  p="0 16px"
                  h="28px"
                  borderRadius="8px"
                />
              )}
              {showInputPriceWarn && !showPriceRangeWarn && (
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
              {positionCount && positionCount > 1 && (
                <ErrorTips
                  p="8px 16px"
                  w="100%"
                  isShowIcon={false}
                  type="warning"
                  borderRadius="8px"
                  tipsFontSize="12px"
                  tipsLineHeight="16px"
                  tips={`Pool creation allows adding liquidity in only 1 position (max ${MAX_BIN_PER_POSITION - 1} bins).`}
                />
              )}
            </VStack>

            <Button w="100%" onClick={onCreate} h="48px" fontSize="16px" borderRadius="12px" isDisabled={btnDisabled}>
              {btnText}
            </Button>
            {positionCount > 1 && (
              <HTextLabelBox
                isLoading={false}
                label={
                  <HStack gap="4px">
                    <Text>Position</Text>
                    <CetusTooltip
                      tooltip={
                        <Text lineHeight="20px" fontSize="12px">
                          Each position covers up to {MAX_BIN_PER_POSITION - 1} bins on Sui, multiple positions are needed to cover a larger range.
                        </Text>
                      }
                    >
                      <Icon xlinkHref="#icon-icon_tips" />
                    </CetusTooltip>
                  </HStack>
                }
                value={positionCount}
                labelStyle={{
                  fontSize: '14px'
                }}
                valueStyle={{
                  fontSize: '14px'
                }}
                skeletonStyle={{
                  valueW: '128px'
                }}
              />
            )}

            <TotalAmount totalAmount={totalAmount} />
          </VStack>
        </VStack>
      ) : null}
    </>
  )
}

export const Legend = ({ symbol, color }: { symbol: string; color: string }) => {
  return (
    <HStack>
      <Box w="8px" h="8px" borderRadius="2px" bg={color} />
      <Text fontSize="12px">{symbol}</Text>
    </HStack>
  )
}

export default DLMMDepositAmount
