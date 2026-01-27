import EstimatedApr from '@/components/common/EstimatedApr'
import Slippage from '@/components/common/Slippage'
import TotalAmount from '@/components/common/TotalAmount'
import WithTooltipInfo from '@/components/common/WithTooltipInfo'
import ControlPriceRange from '@/components/liquidity/clmm/ControlPriceRange'
import { AutoStakePosition, FarmRewardsRange } from '@/components/liquidity/clmm/FarmRelated'
import LiquidityRangeChart from '@/components/liquidity/clmm/LiquidityRangeChart'
import PriceRangeForDate from '@/components/liquidity/clmm/PriceRangeForDate'
import SelectRecommendPriceRange from '@/components/liquidity/clmm/SelectRecommendPriceRange'
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
import { ErrorTips, SelectTab, TradeInputGroup } from '@cetus/design'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { d, formatNumberWithDown, formatTickPrice } from '@cetus/utils'
import { Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import { useSize } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DepositRatio from '../../../common/DepositRatio'
import { CurrentPrice } from './common'
import { ProvideLiquidityProps } from './type'

function H5ProvideLiquidity({
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
  handleChangeLiquidityChartTab,
  liquidityChartTab,
  liquidityChartTabList
}: ProvideLiquidityProps) {
  const { isApp } = useWindowWidth()
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
  const { liquiditySlippage } = useGlobalStore()
  const { poolAddress } = useQueryParams()
  const inputGroupRef = useRef<HTMLDivElement>(null)
  const [isInputInView, setIsInputInView] = useState(true)
  const { currentAccount } = useAccountStore()
  const handleChangeAutoStake = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoStakePosition(event.target.checked)
  }

  // 检测输入框是否在可视区域内
  useEffect(() => {
    const checkInputInView = () => {
      if (inputGroupRef.current) {
        const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
        if (!scrollContainer) {
          setIsInputInView(true)
          return
        }

        const containerRect = scrollContainer.getBoundingClientRect()
        const inputRect = inputGroupRef.current.getBoundingClientRect()

        // 检查输入框是否在滚动容器的可视区域内（考虑一些边距）
        const containerTop = containerRect.top
        const containerBottom = containerRect.bottom
        const inputTop = inputRect.top
        const inputBottom = inputRect.bottom

        // 输入框在可视区域内：输入框的顶部在容器顶部下方，且输入框的底部在容器底部上方（允许100px边距）
        const isVisible = inputTop >= containerTop - 100 && inputBottom <= containerBottom + 100
        setIsInputInView(isVisible)
      }
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

  // 检查输入框是否为空
  const isInputEmpty = useMemo(() => {
    return (!fromAmount || fromAmount === '0' || fromAmount === '') && (!toAmount || toAmount === '0' || toAmount === '')
  }, [fromAmount, toAmount])

  // 处理按钮点击
  const handleButtonClick = useCallback(() => {
    if (!currentAccount) {
      handleAdd()
      return
    }
    // 如果输入框被遮挡且为空，滚动到页面底部
    if (!isInputInView && isInputEmpty && inputGroupRef.current) {
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
    handleAdd()
  }, [isInputInView, isInputEmpty, handleAdd, currentAccount])

  // 计算按钮是否应该禁用
  const shouldDisableButton = useMemo(() => {
    if (!currentAccount) return false
    // 如果输入框未被遮挡，走原来的disabled逻辑
    // 如果输入框在可视区域内且为空，确保按钮是disabled的
    if (isInputInView) {
      return btnDisabled || !!apiPoolInfo?.isFrozen || isInputEmpty
    }
    // 如果输入框被遮挡且为空，按钮可点击（用于滚动）
    if (!isInputInView && isInputEmpty) {
      return false
    }
    // 其他情况走原来的逻辑
    return btnDisabled || !!apiPoolInfo?.isFrozen
  }, [isInputInView, isInputEmpty, !!apiPoolInfo?.isFrozen, btnDisabled, currentAccount])

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

  const showFarming = useMemo(() => {
    return !!apiPoolInfo?.haveFarming && !!apiPoolInfo?.displayFarmsEffectMaxPrice && !!apiPoolInfo?.displayFarmsEffectMinPrice
  }, [apiPoolInfo?.haveFarming, apiPoolInfo?.displayFarmsEffectMaxPrice, apiPoolInfo?.displayFarmsEffectMinPrice])

  const [tab, setTab] = useState({ type: '30D', key: 'month' })

  const { recommendRangesInfo } = useDepositStore()
  const ranges = useMemo(() => {
    if (recommendRangesInfo?.dateTypeRanges && recommendRangesInfo?.dateTypeRanges?.length > 0) {
      const ranges = recommendRangesInfo?.dateTypeRanges?.reduce((acc: any, item: any) => {
        acc[item.dateType] = item
        return acc
      }, {})
      return ranges
    }
  }, [recommendRangesInfo?.dateTypeRanges])

  const { isSupportZap } = useIsSupportZap(apiPoolInfo?.displayTokenA?.coin_type, apiPoolInfo?.displayTokenB?.coin_type)

  const renderSelectTab = useMemo(() => {
    return (
      <SelectTab<any, any>
        type="outlineTab"
        tabList={rangeTabList}
        currentTab={currentRangeTab}
        handleChangeTab={tab => onReverseClick(tab)}
        wrapStyle={{
          h: isApp ? '26px' : '28px',
          p: isApp ? '2px' : '3px',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '8px',
          gap: '4px'
        }}
        itemStyle={{
          flex: 1,
          h: '20px',
          p: '1px 6px',
          fontSize: isApp ? '12px' : '14px',
          borderRadius: '4px',
          gap: '4px'
        }}
      />
    )
  }, [rangeTabList, currentRangeTab, isApp, onReverseClick])

  const getTradeInputWrapStyle = useCallback(
    (isFrom: boolean) => {
      return {
        h: '108px',
        overflow: 'hidden'
      }
    },
    [isApp, fromTokenLock, toTokenLock]
  )

  const fixBottomSubmitSize = useSize(document.querySelector('.fixed-bottom-submit') as HTMLElement)
  return (
    <VStack
      w="100%"
      gap={{ base: '0', lg: '20px' }}
      pb={{
        base: fixBottomSubmitSize?.height && document.querySelector('.fixed-bottom-submit') ? `${fixBottomSubmitSize?.height - 28}px` : '8px',
        lg: 0
      }}
    >
      <Box w="100%" bg={{ base: 'transparent', lg: 'card_bg' }} p={{ base: '0 12px 12px', lg: '16px 8px 0px' }} borderRadius="12px">
        <VStack w="100%" align="start" pt="12px" mb="16px">
          <Heading fontSize="14px" fontWeight="500">
            Set Price Range
          </Heading>
          <Box w="100%">
            <SelectRecommendPriceRange
              isRebalance
              poolAddress={poolAddress as string}
              currentTick={contractPoolInfo?.current_tick_index as number}
              tickSpacing={contractPoolInfo?.tickSpacing as number}
              farmsEffectTickLower={apiPoolInfo?.farmsEffectiveTickLower}
              farmsEffectTickUpper={apiPoolInfo?.farmsEffectiveTickUpper}
            />
          </Box>
        </VStack>

        <VStack position="relative" flex="1" h="180px" pos="relative" mt="32px" align="start">
          <HStack w="100%" justify="space-between" position="absolute" top="-20px" right="0" zIndex="99999" gap="16px">
            <SelectTab<any, any>
              type="outlineTab"
              tabList={liquidityChartTabList}
              currentTab={liquidityChartTab}
              handleChangeTab={tab => handleChangeLiquidityChartTab && handleChangeLiquidityChartTab(tab)}
              wrapStyle={{
                h: isApp ? '26px' : '28px',
                p: isApp ? '2px' : '3px',
                border: '1px solid',
                borderColor: 'border',
                borderRadius: '8px',
                gap: '0px',
                zIndex: '99'
              }}
              itemStyle={{
                h: isApp ? '20px' : '20px',
                p: isApp ? '1px' : '0px 4px',
                borderRadius: '4px',
                gap: '0px'
              }}
            />
            {isApp && renderSelectTab}
          </HStack>
          {isApp && (
            <CurrentPrice
              price={formatTickPrice(direct ? currentPriceData?.currentPrice : currentPriceData.reverseCurrentPrice, 6)}
              perText={perText}
              loading={contractPoolInfoLoading}
              wrapStyle={{
                mt: '16px',
                gap: '4px',
                flexDir: 'row',
                w: '100%',
                justifyContent: 'center'
              }}
            />
          )}
          <LiquidityRangeChart
            handleClickRefresh={() => {}}
            direct={direct}
            minPriceData={direct ? lowerTickData : upperTickData}
            maxPriceData={direct ? upperTickData : lowerTickData}
            dashedMarkerLine={[minPriceForDate, maxPriceForDate]}
            currentRange={currentRange}
            liquidityChartTab={liquidityChartTab}
          />
        </VStack>

        {priceImpactBasedOnMarketDisplay && (
          <ErrorTips
            tips={`The current pool price deviates largely from the real-time market price (${priceImpactBasedOnMarketDisplay}). Please be careful with your price range setting to avoid large impermanent loss.`}
            borderRadius="12px"
            p="8px"
            w="100%"
            mt={isApp && liquidityChartTab === 'prices' ? '142px' : '74px'}
            mb={liquidityChartTab === 'prices' ? '-124px' : '-64px'}
            tipsFontSize="12px"
          />
        )}

        <VStack mt={liquidityChartTab === 'prices' ? '48px' : '8px'}>
          <PriceRangeForDate
            liquidityChartTab={liquidityChartTab}
            tab={tab}
            setTab={setTab}
            direct={direct}
            wrapStyle={{
              mt: isApp && liquidityChartTab === 'prices' ? '90px' : '70px',
              align: 'center',
              gap: '20px',
              sx: {
                '& > div': {
                  flexDirection: isApp ? 'row' : 'column'
                },
                '.price-range-for-date-hstack': {
                  justifyContent: 'space-between',
                  w: '100%',
                  '& > div': {
                    flexDirection: 'row',
                    gap: '6px',
                    '& > div': {
                      border: 0,
                      bg: 'transparent',
                      w: '10px'
                    }
                  }
                }
              }
            }}
          />
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
              isActive={!fromTokenLock || !toTokenLock}
            />
          )}
        </VStack>

        <VStack borderRadius="16px" mt="4px" mb="4px" p="8px 0px" gap="12px">
          <ControlPriceRange
            perText={perText}
            direct={direct}
            isFullRange={isFullRange}
            minPriceData={direct ? lowerTickData : upperTickData}
            maxPriceData={direct ? upperTickData : lowerTickData}
          />
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
        </VStack>
        <VStack mb={isApp ? '0' : '20px'} gap="8px">
          {/* </Item> */}
          {apiPoolInfo?.haveFarming && apiPoolInfo?.displayFarmsEffectMaxPrice && apiPoolInfo?.displayFarmsEffectMinPrice && (
            <FarmRewardsRange
              minPrice={
                direct ? getDisplayPrice(apiPoolInfo?.displayFarmsEffectMinPrice) : getDisplayReversePrice(apiPoolInfo?.displayFarmsEffectMaxPrice)
              }
              maxPrice={
                direct ? getDisplayPrice(apiPoolInfo?.displayFarmsEffectMaxPrice) : getDisplayReversePrice(apiPoolInfo?.displayFarmsEffectMinPrice)
              }
              loading={apiPoolInfoLoading}
              perText={perText}
              checked={isFarmRewardsRange}
              onChange={handleChangeIsFarmRewardsRange}
            />
          )}
          <WithTooltipInfo
            label="Leverage"
            tooltip="This parameter indicates the concentration rate of your liquidity relative to a full range position."
            wrapStyle={{
              flexDir: 'row',
              gap: '8px',
              p: '0',
              mt: isApp ? '0px' : '4px'
            }}
          >
            <Text color={isApp ? 'text_caption' : 'primary'} fontSize={isApp ? '12px' : '14px'}>
              {fromTokenLock && toTokenLock ? '--' : leverage}
            </Text>
          </WithTooltipInfo>
        </VStack>
      </Box>
      <Box w="100%">
        <VStack
          w="calc(100%)"
          gap="16px"
          p={isApp ? '12px' : '16px 8px'}
          bg={isApp ? 'transparent' : 'card_bg'}
          // border="1px solid"
          borderColor="border"
          borderRadius="12px"
          margin="-1px -1px 0px -1px"
        >
          <HStack w="100%" justify="space-between" sx={{ ...(isApp && { flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }) }}>
            <HStack gap="20px">
              <Heading fontSize="14px" fontWeight="500">
                Deposit Amounts
              </Heading>
              {!isApp && isSupportZap && !fromTokenLock && !toTokenLock && (
                <ZapSwitch action="Deposit" value={useZapIn} onChange={handleChangeZapIn} />
              )}
            </HStack>
            <HStack sx={{ ...(isApp && { justifyContent: 'space-between', w: '100%' }) }}>
              <Slippage
                slippageType="liquidity"
                poolType="clmm"
                showNewTolerance={isSupportZap && useZapIn}
                tokenA={apiPoolInfo?.displayTokenA}
                tokenB={apiPoolInfo?.displayTokenB}
              />
              {isApp && isSupportZap && !fromTokenLock && !toTokenLock && (
                <ZapSwitch action="Deposit" value={useZapIn} onChange={handleChangeZapIn} />
              )}
              {/* <MEVProtect /> */}
            </HStack>
          </HStack>
          <VStack w="100%" gap="12px">
            <Box
              w="100%"
              position="relative"
              ref={inputGroupRef}
              data-zap-input-container={useZapIn && !fromTokenLock && !toTokenLock ? 'true' : undefined}
            >
              {useZapIn && !fromTokenLock && !toTokenLock ? (
                <ZapDeposite
                  apiPoolInfo={apiPoolInfo}
                  action="Deposit"
                  currentSqrtPrice={currentPriceData?.currentSqrtPrice}
                  lowerTick={lowerTickData?.tick}
                  upperTick={upperTickData?.tick}
                />
              ) : (
                <TradeInputGroup
                  onClick={onReverseClick}
                  from={{
                    wrapStyle: getTradeInputWrapStyle(true),
                    balance: fromBalanceInfo?.balanceFormat || '',
                    value: fromAmount + '',
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
                    }
                  }}
                  to={{
                    wrapStyle: getTradeInputWrapStyle(false),
                    balance: toBalanceInfo?.balanceFormat || '',
                    value: toAmount + '',
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
                    }
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
              )}
            </Box>
          </VStack>

          {!useZapIn &&
            !!apiPoolInfo?.poolAddress &&
            !(fromTokenLock && toTokenLock) &&
            (isApp ? (
              <Box
                w="100%"
                sx={{ position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: '9999', bg: 'background', p: '12px 12px 32px' }}
                borderTop="1px solid"
                borderColor="border"
                className="fixed-bottom-submit"
              >
                <VStack gap="12px" w="100%">
                  <TotalAmount
                    labelStyle={{ color: 'text_paragraph', ...(isApp ? { fontSize: '12px !important' } : {}) }}
                    valueStyle={{ ...(isApp ? { fontSize: '12px !important' } : {}) }}
                    totalAmount={totalAmount}
                    loading={false}
                  />
                  <DepositRatio
                    type="image"
                    percentMap={percentMap}
                    lockRatio={fromTokenLock && toTokenLock}
                    tokenA={fromToken}
                    tokenB={toToken}
                    isReverse={fromToken?.coin_type !== apiPoolInfo?.tokenA?.coin_type}
                  />
                </VStack>
                <Button
                  w="100%"
                  mt="12px"
                  fontWeight="500"
                  h={{ base: '42px', lg: '52px' }}
                  fontSize={{ base: '14px', lg: '20px' }}
                  borderRadius={{ base: '8px', lg: '16px' }}
                  isDisabled={shouldDisableButton}
                  isLoading={false}
                  onClick={handleButtonClick}
                >
                  {btnText}
                </Button>
              </Box>
            ) : (
              <>
                <VStack gap="12px" w="100%">
                  <TotalAmount
                    labelStyle={{ color: 'text_paragraph', ...(isApp ? { fontSize: '12px !important' } : {}) }}
                    valueStyle={{ ...(isApp ? { fontSize: '12px !important' } : {}) }}
                    totalAmount={totalAmount}
                    loading={false}
                  />
                  <DepositRatio
                    type="image"
                    percentMap={percentMap}
                    lockRatio={fromTokenLock && toTokenLock}
                    tokenA={fromToken}
                    tokenB={toToken}
                    isReverse={fromToken?.coin_type !== apiPoolInfo?.tokenA?.coin_type}
                  />
                </VStack>
                <Button
                  w="100%"
                  h={{ base: '42px', lg: '52px' }}
                  fontSize={{ base: '14px', lg: '20px' }}
                  fontWeight="500"
                  borderRadius={{ base: '8px', lg: '16px' }}
                  isDisabled={shouldDisableButton}
                  isLoading={false}
                  onClick={handleButtonClick}
                >
                  {btnText}
                </Button>
              </>
            ))}
          {useZapIn && <ZapSubmiteInfo action="Deposit" isReverse={fromToken?.coin_type !== apiPoolInfo?.tokenA?.coin_type} />}
        </VStack>
      </Box>
      {apiPoolInfo?.haveFarming && (
        <Box mb="12px" w="100%">
          <AutoStakePosition disabled={fromTokenLock || toTokenLock} checked={autoStakePosition} onChange={handleChangeAutoStake} />
        </Box>
      )}
      {apiPoolInfo?.vaultCategory ? (
        <VStack w="100%">
          <VaultBanner
            displayTokenA={apiPoolInfo?.displayTokenA}
            displayTokenB={apiPoolInfo?.displayTokenB}
            feeDisplay={apiPoolInfo?.feeDisplay || ''}
            clmmPool={apiPoolInfo?.poolAddress || ''}
            vaultId={apiPoolInfo?.vaultId || ''}
            isReverse={apiPoolInfo?.isReverse || false}
            category={apiPoolInfo.vaultCategory}
          />
        </VStack>
      ) : null}
    </VStack>
  )
}

export default H5ProvideLiquidity
