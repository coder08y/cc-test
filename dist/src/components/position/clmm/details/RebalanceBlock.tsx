import EstimatedApr, { EstimatedAprDateTypeList } from '@/components/common/EstimatedApr'
import ControlPriceRange from '@/components/liquidity/clmm/ControlPriceRange'
import SelectRecommendPriceRange from '@/components/liquidity/clmm/SelectRecommendPriceRange'
import { DateSelect } from '@/components/liquidity/common/DateSelect'
import usePosRebalancePage from '@/hooks/position/usePosRebalancePage'
import usePriceRangeStore from '@/store/clmm/priceRange'
import usePositionStore from '@/store/position'
import usePositionCompoundStore from '@/store/position/compound'
import usePositionDetailStore from '@/store/position/detail'
import { CetusTooltip, ErrorTips, TooltipIcon } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CheckBox } from '@cetus/ui-kit'
import { formatNumberWithDown, isAvailableObject } from '@cetus/utils'
import { Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { ChartSelect } from '../../common/ChartSelect'
import PositionCurrentPrice from '../../common/PositionCurrentPrice'
import AutoClaim from './ClaimAndCompound/AutoClaim'
import RouteBlock from './ClaimAndCompound/RouteBlock'
import ConfirmPriceDiffTips from './ConfirmPriceDiffTips'
import DetailRatio from './DetailRatio'
import RebalanceChartBlock from './RebalanceChartBlock'
import RebalanceFarmsBlock from './RebalanceFarmsBlock'
const chartTypeList = [
  { label: 'Liquidity Distribution', key: '#icon-liquiditydistribution' },
  { label: 'Historical Pool Prices', key: '#icon-poolhistoricprices' }
]
export default function RebalanceBlock() {
  const { currentPosBaseInfo } = usePositionStore()
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const { curPosContractPoolInfo, currentPosPoolInfo, isPriceDirect, isDirect } = usePositionDetailStore()
  const { showConfirmPriceDiffInfo } = usePositionCompoundStore()

  // const isShowConfirmPriceDiff = useMemo(() => {
  //   return showConfirmPriceDiffInfo['move']
  // }, [showConfirmPriceDiffInfo])

  const [isShowConfirmPriceDiff, setIsShowConfirmPriceDiff] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowConfirmPriceDiff(showConfirmPriceDiffInfo['move'])
    }, 800)
    return () => clearTimeout(timer)
  }, [showConfirmPriceDiffInfo])

  const rewardsActions = ['Claim', 'Compound']

  const {
    firstInfo,
    lastInfo,
    allRoutes,
    isRouteError,
    isNewRangeSameOld,
    notCompoundableRewards,
    notCompoundableTotalYield,
    priceImpactBasedOnMarketDisplay,
    refreshRouteData,
    isFullRange,
    showTokenALock,
    showTokenBLock,
    toRebalance,
    isRebalanceLoading,
    btnInfo,
    mergeSwapQuote,
    findRouterLoading,
    canCompound,
    isCompoundPreLoading,
    currentRewardsAction,
    isStakeFarm,
    changeRewardsAction,
    changeStakeFarm,
    compoundPreResult,
    tab,
    setTab,
    isActive,
    ranges,
    leverage,
    perText
  } = usePosRebalancePage()

  const [chartDateTab, setChartDateTabTab] = useState({ type: '30D', key: 'month' })
  const [chartTab, setChartTab] = useState({ type: 'Liquidity Distribution', key: '#icon-liquiditydistribution' })

  const [confirmPriceDiff, setConfirmPriceDiff] = useState(false)

  const isNotShowRatio = useMemo(() => {
    return showTokenALock && showTokenBLock
  }, [showTokenALock, showTokenBLock])

  const { isApp } = useWindowWidth()

  return (
    <VStack
      align="flex-start"
      w="100%"
      position="relative"
      gap="16px"
      p={{ base: '0 8px 16px', lg: '0 16px 16px' }}
      bg="card_bg"
      borderRadius="0px 0px 16px 16px"
    >
      {isApp && (
        <VStack align="start" w="100%">
          <Heading fontSize="14px" fontWeight="500">
            Set Price Range
          </Heading>
          <SelectRecommendPriceRange
            poolAddress={currentPosPoolInfo?.poolAddress as string}
            currentTick={curPosContractPoolInfo?.current_tick_index as number}
            tickSpacing={curPosContractPoolInfo?.tickSpacing as number}
            farmsEffectTickLower={currentPosPoolInfo?.farmsEffectiveTickLower}
            farmsEffectTickUpper={currentPosPoolInfo?.farmsEffectiveTickUpper}
            isRebalance={true}
          />
        </VStack>
      )}

      <HStack w="100%" minH="24px" justify="space-between" zIndex="9999" bg="card_bg">
        <HStack w={{ base: '60%', lg: '80%' }}>
          <PositionCurrentPrice
            posId={currentPosBaseInfo?.posId || ''}
            displayTokenA={currentPosBaseInfo?.displayTokenA}
            displayTokenB={currentPosBaseInfo?.displayTokenB}
            isChangeDirect={isPriceDirect}
            haveChangeIcon={false}
            tooltip="Current price within the pool may differ from market price. Verify with the market rate before providing liquidity to reduce arbitrage risk"
          />
        </HStack>
        <HStack gap="0" position="absolute" right="5px" zIndex="99999">
          {chartTab?.type == 'Historical Pool Prices' && (
            <DateSelect
              type={chartDateTab}
              onTypeChange={tab => {
                setChartDateTabTab({ type: tab.label, key: tab.key })
              }}
              list={EstimatedAprDateTypeList}
              buttonStyle={{ bg: 'none', border: 'none', color: 'text_paragraph', p: { fontSize: '14px' } }}
            />
          )}
          <ChartSelect
            type={chartTab}
            onTypeChange={tab => {
              setChartTab({ type: tab.label, key: tab.key })
            }}
            list={chartTypeList}
            buttonStyle={{ bg: 'none', border: 'none', color: 'text_paragraph' }}
          />
        </HStack>
      </HStack>
      <Box
        w="100%"
        h={{ base: '258px', lg: '240px' }}
        m={{ base: chartTab?.type == 'Liquidity Distribution' ? '0 0 -4px' : '-16px 0 -4px', lg: '-16px 0 -4px' }}
        overflow={chartTab?.type == 'Liquidity Distribution' ? 'none' : ' hidden'}
      >
        <RebalanceChartBlock
          tab={chartTab?.type == 'Liquidity Distribution' ? tab : chartDateTab}
          currentRange={chartTab?.type == 'Liquidity Distribution' ? tab?.key : chartDateTab?.key}
          liquidityChartTab={chartTab?.type == 'Liquidity Distribution' ? 'distribution' : 'prices'}
        />
      </Box>
      <HStack
        flexDirection={{ base: 'column-reverse', lg: 'row' }}
        w="100%"
        justify="space-between"
        flexWrap="wrap"
        sx={{ '>div': { w: isApp ? '100%' : 'unset', '>div': { w: isApp ? '100%' : 'unset' } } }}
        zIndex="999999"
        mt={{ base: chartTab?.type == 'Liquidity Distribution' ? '-42px' : '0', lg: 0 }}
      >
        <EstimatedApr
          tab={tab}
          setTab={setTab}
          ranges={ranges}
          currentPosPoolsRelatedData={{
            minPriceRaw: formatNumberWithDown(!currentPosPoolInfo?.isReverse ? lowerTickData?.price : upperTickData?.reversePrice, undefined, true),
            maxPriceRaw: formatNumberWithDown(!currentPosPoolInfo?.isReverse ? upperTickData?.price : lowerTickData?.reversePrice, undefined, true)
          }}
          posPoolInfo={currentPosPoolInfo}
          isActive={isActive}
          isRebalance={true}
          wrapStyle={{
            w: !isAvailableObject(lowerTickData) || !isAvailableObject(upperTickData) ? '100%' : 'auto'
          }}
        />
        {isAvailableObject(lowerTickData) && isAvailableObject(upperTickData) && (
          <HStack minH="20px" w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'unset' }}>
            <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
              Leverage
            </Text>
            <Text color="primary" whiteSpace="nowrap" fontSize={{ base: '12px', lg: '14px' }}>
              {showTokenALock && showTokenBLock ? '--' : leverage}
            </Text>
          </HStack>
        )}
      </HStack>
      {currentPosPoolInfo?.haveFarming && (
        <RebalanceFarmsBlock perText={perText} isStakeFarm={isStakeFarm} changeStakeFarm={(value: boolean) => changeStakeFarm(value)} />
      )}
      <VStack w="100%">
        {!isApp && (
          <SelectRecommendPriceRange
            poolAddress={currentPosPoolInfo?.poolAddress as string}
            currentTick={curPosContractPoolInfo?.current_tick_index as number}
            tickSpacing={curPosContractPoolInfo?.tickSpacing as number}
            farmsEffectTickLower={currentPosPoolInfo?.farmsEffectiveTickLower}
            farmsEffectTickUpper={currentPosPoolInfo?.farmsEffectiveTickUpper}
            isRebalance={true}
          />
        )}

        <ControlPriceRange
          perText={perText}
          direct={isDirect}
          isFullRange={isFullRange}
          minPriceData={isDirect ? lowerTickData : upperTickData}
          maxPriceData={isDirect ? upperTickData : lowerTickData}
        />
        {showTokenALock && showTokenBLock && (
          <ErrorTips
            isShowIcon={false}
            tipsFontSize="12px"
            justifyContent="center"
            tips="The max price should be higher than min price."
            h="32px"
            borderRadius="8px"
          />
        )}
        {priceImpactBasedOnMarketDisplay && (
          <ErrorTips
            tips={`The current pool price deviates largely from the real-time market price (${priceImpactBasedOnMarketDisplay}). Please be careful with your price range setting to avoid large impermanent loss.`}
            borderRadius="12px"
            p="8px"
            w="100%"
            tipsFontSize="12px"
          />
        )}
      </VStack>
      {!isNewRangeSameOld && (
        <VStack w="100%" gap="16px">
          <DetailRatio
            allRoutes={!compoundPreResult && (isCompoundPreLoading || findRouterLoading) ? [] : allRoutes}
            displayPercentA={isNotShowRatio ? '--' : undefined}
            displayPercentB={isNotShowRatio ? '--' : undefined}
            isError={isNotShowRatio}
            compoundPreResult={compoundPreResult}
            labelSize="14px"
            label="Est. New Liquidity"
            tips="Estimated leftover assets that won't be rebalanced into your position, which will be returned to your wallet."
          />

          {!isNotShowRatio && (
            <HStack w="100%" justify="space-between">
              <HStack gap="2px">
                <Text>Claimable Yield</Text>
                <TooltipIcon
                  tooltipCon={
                    <VStack align="flex-start" gap="0">
                      <Text fontSize="12px">
                        <Text as="span" fontSize="12px" color="text_caption">
                          Compound:{' '}
                        </Text>{' '}
                        Reinvest your claimable yield into the rebalanced position to increase liquidity.
                      </Text>

                      <Text fontSize="12px">
                        <Text as="span" fontSize="12px" color="text_caption">
                          Claim:{' '}
                        </Text>
                        Harvest your claimable yield directly.
                      </Text>
                    </VStack>
                  }
                />
              </HStack>
              <HStack gap="12px">
                {rewardsActions?.map(action => {
                  return (
                    <CetusTooltip
                      showTooltip={action == 'Compound' && !canCompound}
                      placement="top"
                      tooltip={<Text fontSize="12px">Insufficient yield to compound during rebalance</Text>}
                    >
                      <HStack gap="4px" key={action} cursor={action == 'Compound' && !canCompound ? 'not-allowed' : 'pointer'}>
                        <CheckBox
                          isDisabled={action == 'Compound' && !canCompound}
                          checked={action == currentRewardsAction}
                          onClick={action == currentRewardsAction ? () => {} : () => changeRewardsAction(action)}
                        />
                        <Text color={action == currentRewardsAction ? 'primary' : 'text_paragraph'}>{action}</Text>
                      </HStack>
                    </CetusTooltip>
                  )
                })}
              </HStack>
            </HStack>
          )}
          {notCompoundableRewards?.length > 0 && currentRewardsAction == 'Compound' && (
            <AutoClaim
              autoClaimList={notCompoundableRewards}
              autoClaimTotalYield={notCompoundableTotalYield}
              warpStyle={{ bg: 'none', p: '0', border: 'none', mt: '-4px' }}
            />
          )}
          {currentPosPoolInfo?.haveFarming && (
            <RebalanceFarmsBlock
              isShowRange={false}
              perText={perText}
              isStakeFarm={isStakeFarm}
              changeStakeFarm={(value: boolean) => changeStakeFarm(value)}
            />
          )}
          {isShowConfirmPriceDiff && (
            <ConfirmPriceDiffTips confirmPriceDiff={confirmPriceDiff} changeConfirmPriceDiff={() => setConfirmPriceDiff(!confirmPriceDiff)} />
          )}
        </VStack>
      )}
      <Button
        onClick={toRebalance}
        isLoading={isRebalanceLoading || (!compoundPreResult && isCompoundPreLoading)}
        isDisabled={btnInfo?.disabled || (isShowConfirmPriceDiff && !confirmPriceDiff)}
        w="100%"
        h="48px"
        fontWeight="500"
      >
        {btnInfo?.text}
      </Button>
      {!isNewRangeSameOld && !isNotShowRatio && (allRoutes?.length > 0 || compoundPreResult?.routeErrorInfo) && (
        <RouteBlock
          isFrom="move"
          reCalculateRouteData={refreshRouteData}
          allRoutes={allRoutes}
          findRouterLoading={isCompoundPreLoading || findRouterLoading}
          routeErrorInfo={
            compoundPreResult?.routeErrorInfo
              ? {
                  ...compoundPreResult?.routeErrorInfo,
                  errorText: btnInfo?.text == 'Insufficient liquidity' ? 'Insufficient liquidity in this swap' : 'No route available in this swap'
                }
              : undefined
          }
          // firstInfo={firstInfo}
          // lastInfo={lastInfo}
          secondTitle="Rebalance LP for new range"
        />
      )}
    </VStack>
  )
}
