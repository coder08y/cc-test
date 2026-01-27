import DepositRatio from '@/components/common/DepositRatio'
import EstimatedApr from '@/components/common/EstimatedApr'
import TotalAmount from '@/components/common/TotalAmount'
import WithTooltipInfo from '@/components/common/WithTooltipInfo'
import VaultBanner from '@/components/vaults-v2/add-liquidity/VaultsBanner'
import ZapDeposite from '@/components/zap/ZapDeposite'
import ZapSubmiteInfo from '@/components/zap/ZapSubmiteInfo'
import ZapSwitch from '@/components/zap/ZapSwitch'
import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import useDepositStore from '@/store/clmm/deposit'
import usePriceRangeStore from '@/store/clmm/priceRange'
import useGlobalStore from '@/store/common/global'
import { showNewVersionApr } from '@/types/position'
import { getDisplayPrice, getDisplayReversePrice } from '@/utils/pool'
import { Block, ErrorTips, SelectTab, TradeInputGroup } from '@cetus/design'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import { d, formatNumberWithDown, formatTickPrice, isAvailableObject } from '@cetus/utils'
import { Box, Button, Divider, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import DivisionBlock from '../../common/DivisionBlock'
import ControlPriceRange from '../ControlPriceRange'
import { AutoStakePosition, FarmRewardsRange } from '../FarmRelated'
import LiquidityRangeChart from '../LiquidityRangeChart'
import PriceRangeForDate from '../PriceRangeForDate'
import SelectRecommendPriceRange from '../SelectRecommendPriceRange'
import { CurrentPrice } from './common'
import { ProvideLiquidityProps } from './type'

function PCProvideLiquidity({
  btnText,
  btnDisabled,
  handleChangeIsFarmRewardsRange,
  onReverseClick,
  leverage,
  direct,
  perText,
  rangeTabList,
  currentRangeTab,
  fromBalanceInfo,
  toBalanceInfo,
  fromAmountValue,
  toAmountValue,
  handleAmountChange,
  handleAdd,
  isFullRange,
  useZapIn,
  handleChangeZapIn,
  handleSubmit,
  handleChangeLiquidityChartTab,
  liquidityChartTab,
  liquidityChartTabList
}: ProvideLiquidityProps) {
  const {
    currentPriceData,
    contractPoolInfo,
    apiPoolInfo,
    resetLiquidity,
    contractPoolInfoLoading,
    apiPoolInfoLoading,
    minPriceForDate,
    maxPriceForDate,
    currentRange
  } = useLiquidityStore()
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const { liquiditySlippage } = useGlobalStore()
  const {
    autoStakePosition,
    setAutoStakePosition,
    isFarmRewardsRange,
    fromAmount,
    toAmount,
    byAmountIn,
    percentMap,
    fromToken,
    toToken,
    totalAmount,
    fromTokenLock,
    toTokenLock
  } = useAddLiquidityStore()
  const { poolAddress } = useQueryParams()
  const handleChangeAutoStake = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoStakePosition(event.target.checked)
  }

  const currentPrice = useMemo(() => {
    if (currentPriceData?.currentPrice && currentPriceData.pool === poolAddress) {
      return currentPriceData?.currentPrice
    }
    return undefined
  }, [currentPriceData?.currentPrice, poolAddress])

  const { priceImpactBasedOnMarket } = usePriceImpact(
    fromToken,
    toToken,
    direct ? '1' : (formatTickPrice(currentPrice) as string),
    direct ? (formatTickPrice(currentPrice) as string) : '1',
    true
  )

  const priceImpactBasedOnMarketDisplay = useMemo(() => {
    if (priceImpactBasedOnMarket !== undefined && d(priceImpactBasedOnMarket).abs().gte(30)) {
      if (d(priceImpactBasedOnMarket).gte(30)) {
        return `+${d(priceImpactBasedOnMarket).toFixed(0)}%`
      }
      return `${d(priceImpactBasedOnMarket).toFixed(0)}%`
    }
    return undefined
  }, [priceImpactBasedOnMarket])

  const [tab, setTab] = useState({ type: '30D', key: 'month' })

  const { recommendRangesInfo } = useDepositStore()
  // console.log('🚀🚀🚀 ~ PC.tsx:53 ~ maxPriceForDate:', direct, apiPoolInfo, lowerTickData, upperTickData, minPriceForDate, maxPriceForDate)
  const ranges = useMemo(() => {
    console.log('🚀🚀🚀 ~ PC.tsx:118 ~ PCProvideLiquidity ~ recommendRangesInfo?.dateTypeRanges:', recommendRangesInfo?.dateTypeRanges)
    if (recommendRangesInfo?.dateTypeRanges && recommendRangesInfo?.dateTypeRanges?.length > 0) {
      const ranges = recommendRangesInfo?.dateTypeRanges?.reduce((acc: any, item: any) => {
        acc[item.dateType] = item
        return acc
      }, {})
      return ranges
    }
  }, [recommendRangesInfo?.dateTypeRanges])

  const { isSupportZap } = useIsSupportZap(apiPoolInfo?.displayTokenA?.coin_type, apiPoolInfo?.displayTokenB?.coin_type)

  return (
    <>
      <HStack gap="16px" align="flex-start">
        <DivisionBlock title="Select Range" wrapStyle={{ flex: 1, minW: '588px', gap: '0', border: 'none', bg: 'card_bg' }}>
          {!rangeTabList || !rangeTabList.length ? (
            <Skeleton h="32px" borderRadius="8px" w="180px" />
          ) : (
            <HStack>
              <SelectTab<any, any>
                type="outlineTab"
                tabList={rangeTabList}
                currentTab={currentRangeTab}
                handleChangeTab={tab => onReverseClick(tab)}
                wrapStyle={{
                  h: '32px',
                  p: '3px',
                  border: '1px solid',
                  borderColor: 'border',
                  borderRadius: '8px',
                  gap: '4px',
                  zIndex: '99'
                }}
                itemStyle={{
                  h: '24px',
                  p: '4px 12px',
                  borderRadius: '4px',
                  gap: '4px'
                }}
              />
              <SelectTab<any, any>
                type="outlineTab"
                tabList={liquidityChartTabList}
                currentTab={liquidityChartTab}
                tooltipGutter={8}
                handleChangeTab={tab => handleChangeLiquidityChartTab && handleChangeLiquidityChartTab(tab)}
                wrapStyle={{
                  h: '32px',
                  p: '3px',
                  border: '1px solid',
                  borderColor: 'border',
                  borderRadius: '8px',
                  gap: '0px',
                  zIndex: '99'
                }}
                itemStyle={{
                  h: '24px',
                  p: '4px 12px',
                  borderRadius: '4px',
                  gap: '0px'
                }}
              />
            </HStack>
          )}
          <VStack w="100%" flex="1" pos="relative" gap="16px" mt="12px">
            <VStack w="100%" pos="relative" gap="0px">
              <HStack pl="126px" w="100%" h="24px" justify={liquidityChartTab === 'prices' ? 'center' : 'flex-start'}>
                <CurrentPrice
                  loading={apiPoolInfoLoading}
                  price={
                    isAvailableObject(currentPriceData)
                      ? (formatTickPrice(direct ? currentPriceData?.currentPrice : currentPriceData.reverseCurrentPrice, 6) as string)
                      : '--'
                  }
                  perText={perText}
                  wrapStyle={{
                    // ml: '126px',
                    ml: '0px',
                    zIndex: 99
                  }}
                />
              </HStack>
              <HStack w="100%" align="flex-start" gap="20px">
                <Box mt="16px" w={{ base: '100%', lg: '106px' }}>
                  <SelectRecommendPriceRange
                    poolAddress={poolAddress as string}
                    currentTick={contractPoolInfo?.current_tick_index as number}
                    tickSpacing={contractPoolInfo?.tickSpacing as number}
                    farmsEffectTickLower={apiPoolInfo?.farmsEffectiveTickLower}
                    farmsEffectTickUpper={apiPoolInfo?.farmsEffectiveTickUpper}
                  />
                </Box>
                <VStack w="calc(100% - 126px)" gap="12px">
                  <HStack w="100%" gap="32px" alignItems="start">
                    <VStack w="100%" gap={priceImpactBasedOnMarketDisplay ? '72px' : '32px'}>
                      <Box w="100%" h="230px" pt={liquidityChartTab !== 'prices' ? '20px' : 0}>
                        <LiquidityRangeChart
                          handleClickRefresh={() => {}}
                          direct={direct}
                          minPriceData={direct ? lowerTickData : upperTickData}
                          maxPriceData={direct ? upperTickData : lowerTickData}
                          dashedMarkerLine={[minPriceForDate, maxPriceForDate]}
                          currentRange={currentRange}
                          liquidityChartTab={liquidityChartTab}
                        />
                      </Box>
                      {priceImpactBasedOnMarketDisplay ? (
                        <ErrorTips
                          tips={`The current pool price deviates largely from the real-time market price (${priceImpactBasedOnMarketDisplay}). Please be careful with your price range setting to avoid large impermanent loss.`}
                          borderRadius="12px"
                          p="8px"
                          w="100%"
                          // mb="-20px"
                          tipsFontSize="12px"
                        />
                      ) : (
                        <Box h="24px" />
                      )}
                    </VStack>
                  </HStack>
                  <VStack w="100%" gap="12px" position="relative">
                    {
                      <HStack w="100%">
                        {isAvailableObject(lowerTickData) && isAvailableObject(upperTickData) && showNewVersionApr && (
                          <Block bg="none" border="none" borderRadius="12px" p="8px" w="110px" position="absolute" left="-126px" top="16px">
                            <WithTooltipInfo
                              label="Leverage"
                              tooltip="This parameter indicates the concentration rate of your liquidity relative to a full range position."
                              wrapStyle={{
                                flexDir: 'column',
                                align: 'flex-start',
                                gap: '2px'
                              }}
                            >
                              <Text color="primary">{fromTokenLock && toTokenLock ? '--' : leverage}</Text>
                            </WithTooltipInfo>
                          </Block>
                        )}
                        <ControlPriceRange
                          perText={perText}
                          direct={direct}
                          isFullRange={isFullRange}
                          minPriceData={direct ? lowerTickData : upperTickData}
                          maxPriceData={direct ? upperTickData : lowerTickData}
                        />
                      </HStack>
                    }

                    {fromTokenLock && toTokenLock && (
                      <ErrorTips
                        isShowIcon={false}
                        tipsFontSize="12px"
                        justifyContent="center"
                        tips="The max price should be higher than min price."
                        h="32px"
                        borderRadius="8px"
                      />
                    )}
                    {apiPoolInfo?.haveFarming && apiPoolInfo?.displayFarmsEffectMaxPrice && apiPoolInfo?.displayFarmsEffectMinPrice && (
                      <FarmRewardsRange
                        minPrice={
                          direct
                            ? getDisplayPrice(apiPoolInfo?.displayFarmsEffectMinPrice)
                            : getDisplayReversePrice(apiPoolInfo?.displayFarmsEffectMaxPrice)
                        }
                        maxPrice={
                          direct
                            ? getDisplayPrice(apiPoolInfo?.displayFarmsEffectMaxPrice)
                            : getDisplayReversePrice(apiPoolInfo?.displayFarmsEffectMinPrice)
                        }
                        loading={apiPoolInfoLoading}
                        perText={perText}
                        checked={isFarmRewardsRange}
                        onChange={handleChangeIsFarmRewardsRange}
                      />
                    )}
                  </VStack>
                </VStack>
              </HStack>
            </VStack>

            <Divider orientation="horizontal" />
            {showNewVersionApr && (
              <EstimatedApr
                tab={tab}
                setTab={setTab}
                ranges={ranges}
                currentPosPoolsRelatedData={{
                  minPriceRaw: formatNumberWithDown(!apiPoolInfo?.isReverse ? lowerTickData?.price : upperTickData?.reversePrice, undefined, true),
                  maxPriceRaw: formatNumberWithDown(!apiPoolInfo?.isReverse ? upperTickData?.price : lowerTickData?.reversePrice, undefined, true)
                }}
                posPoolInfo={apiPoolInfo}
                isActive={!fromTokenLock && !toTokenLock}
                wrapStyle={{
                  w: !isAvailableObject(lowerTickData) || !isAvailableObject(upperTickData) ? '100%' : 'auto'
                }}
              >
                {isAvailableObject(lowerTickData) && isAvailableObject(upperTickData) && (
                  <PriceRangeForDate
                    direct={direct}
                    tab={tab}
                    setTab={setTab}
                    liquidityChartTab={liquidityChartTab}
                    wrapStyle={{
                      w: 'auto',
                      mt: priceImpactBasedOnMarketDisplay ? '-20px' : '0'
                    }}
                  />
                )}
              </EstimatedApr>
            )}
          </VStack>
        </DivisionBlock>
        <VStack gap="12px" minW="420px" maxW="460px" w="460px">
          <DivisionBlock title="Deposit Amounts" wrapStyle={{ gap: '12px', w: '100%', border: 'none', bg: 'card_bg' }}>
            <HStack>
              {/* <MEVProtect /> */}
              {isSupportZap && !fromTokenLock && !toTokenLock && <ZapSwitch action="Deposit" value={useZapIn} onChange={handleChangeZapIn} />}
            </HStack>
            <Box w="100%" position="relative" data-zap-input-container={useZapIn && !fromTokenLock && !toTokenLock ? 'true' : undefined}>
              {useZapIn && !fromTokenLock && !toTokenLock ? (
                <ZapDeposite
                  apiPoolInfo={apiPoolInfo}
                  action="Deposit"
                  currentSqrtPrice={currentPriceData?.currentSqrtPrice}
                  lowerTick={lowerTickData?.tick}
                  upperTick={upperTickData?.tick}
                />
              ) : (
                <>
                  <TradeInputGroup
                    onClick={onReverseClick}
                    from={{
                      wrapStyle: { h: '108px' },
                      balance: fromBalanceInfo?.balanceFormat || '',
                      value: fromAmount,
                      amountValue: fromAmountValue,
                      loading: false,
                      onChange: value => {
                        handleAmountChange(value, true, fromToken?.coin_type === apiPoolInfo?.tokenA?.coin_type)
                      },
                      selectable: false,
                      placeholder: '0.0',
                      token: fromToken,
                      onFocusChange: (focus: boolean) => {
                        if (focus && +(fromAmount + '') && !byAmountIn) {
                          handleAmountChange(fromAmount + '', true, fromToken?.coin_type === apiPoolInfo?.tokenA?.coin_type)
                        }
                      },
                      lock: {
                        isLock: fromTokenLock && !toTokenLock,
                        text: 'The market price is outside your specified price range. Single-asset deposit only.'
                      },
                      rightJustify: 'space-around'
                    }}
                    to={{
                      wrapStyle: { h: '108px' },
                      balance: toBalanceInfo?.balanceFormat || '',
                      value: toAmount,
                      amountValue: toAmountValue,
                      loading: false,
                      onFocusChange: (focus: boolean) => {
                        if (focus && +(toAmount + '') && byAmountIn) {
                          handleAmountChange(toAmount + '', false, toToken?.coin_type === apiPoolInfo?.tokenA?.coin_type)
                        }
                      },
                      onChange: value => {
                        handleAmountChange(value, false, toToken?.coin_type === apiPoolInfo?.tokenA?.coin_type)
                      },
                      selectable: false,
                      placeholder: '0.0',
                      token: toToken,
                      lock: {
                        isLock: !fromTokenLock && toTokenLock,
                        text: 'The market price is outside your specified price range. Single-asset deposit only.'
                      },
                      rightJustify: 'space-around'
                    }}
                    iconParams={{
                      xlinkHref: '#icon-icon_add',
                      svgFill: 'text_caption'
                    }}
                    lock={{
                      isLock: fromTokenLock && toTokenLock,
                      style: { h: '224px' }
                    }}
                  />
                </>
              )}

              <VStack w="100%" gap="8px" mt="12px">
                {!useZapIn && !!apiPoolInfo?.poolAddress && !(fromTokenLock && toTokenLock) && (
                  <VStack
                    gap="12px"
                    w="100%"
                    borderRadius="16px"
                    // border="1px solid"
                    // borderColor="border"
                    // bg="bg_six"
                    // p={apiPoolInfo?.displayTokenA && apiPoolInfo?.displayTokenB ? '0 8px 16px' : '0 16px'}
                  >
                    <Button
                      w="100%"
                      h="52px"
                      margin="-1px -1px 5px"
                      fontSize="18px"
                      fontWeight="500"
                      borderRadius="12px"
                      isDisabled={btnDisabled || !!apiPoolInfo?.isFrozen}
                      isLoading={false}
                      onClick={handleAdd}
                    >
                      {btnText}
                    </Button>

                    {apiPoolInfo?.displayTokenA && apiPoolInfo?.displayTokenB && (
                      <>
                        <TotalAmount
                          labelStyle={{ color: 'primary_gray' }}
                          totalAmount={totalAmount}
                          loading={false}
                          valueStyle={{ h: '20px', lineHeight: '20px' }}
                        />
                        <DepositRatio
                          type="image"
                          percentMap={percentMap}
                          lockRatio={fromTokenLock && toTokenLock}
                          tokenA={fromToken}
                          tokenB={toToken}
                          isReverse={fromToken?.coin_type !== apiPoolInfo?.tokenA?.coin_type}
                        />
                        {/* {apiPoolInfo?.haveFarming && (
                        <AutoStakePosition disabled={fromTokenLock || toTokenLock} checked={autoStakePosition} onChange={handleChangeAutoStake} />
                      )} */}
                      </>
                    )}
                  </VStack>
                )}

                {useZapIn && (
                  <ZapSubmiteInfo action="Deposit" isPositionStyle={true} isReverse={fromToken?.coin_type !== apiPoolInfo?.tokenA?.coin_type} />
                )}
              </VStack>
            </Box>
          </DivisionBlock>

          <VStack gap="0">
            {apiPoolInfo?.haveFarming && (
              <VStack w="100%" gap="8px" mb="12px">
                <AutoStakePosition disabled={fromTokenLock || toTokenLock} checked={autoStakePosition} onChange={handleChangeAutoStake} />
              </VStack>
            )}
            {apiPoolInfo?.vaultCategory && (
              <VaultBanner
                displayTokenA={apiPoolInfo?.displayTokenA}
                displayTokenB={apiPoolInfo?.displayTokenB}
                feeDisplay={apiPoolInfo?.feeDisplay}
                clmmPool={apiPoolInfo?.poolAddress}
                vaultId={apiPoolInfo?.vaultId}
                isReverse={apiPoolInfo?.isReverse}
                category={apiPoolInfo?.vaultCategory}
              />
            )}
          </VStack>
        </VStack>
      </HStack>
    </>
  )
}

export default PCProvideLiquidity
