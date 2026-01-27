import PendingYieldValue from '@/components/position/common/PendingYieldValue'
import useCompound from '@/hooks/position-compound/useCompound'
import usePositionCompoundStore from '@/store/position/compound'
import { Icon } from '@cetus/ui-kit'
import { Button, Center, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import ConfirmPriceDiffTips from '../ConfirmPriceDiffTips'
import DetailRatio from '../DetailRatio'
import AutoClaim from './AutoClaim'
import RouteBlock from './RouteBlock'

function CompoundBlock() {
  const { compoundableRewards, notCompoundableRewards, showConfirmPriceDiffInfo } = usePositionCompoundStore()

  // const isShowConfirmPriceDiff = useMemo(() => {
  //   return showConfirmPriceDiffInfo['compound']
  // }, [showConfirmPriceDiffInfo])

  const [isShowConfirmPriceDiff, setIsShowConfirmPriceDiff] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowConfirmPriceDiff(showConfirmPriceDiffInfo['compound'])
    }, 800)
    return () => clearTimeout(timer)
  }, [showConfirmPriceDiffInfo])

  const [confirmPriceDiff, setConfirmPriceDiff] = useState(false)

  const {
    firstInfo,
    lastInfo,
    allRoutes,
    isRouteError,
    refreshRouteData,
    isRebalancePreLoading,
    isCompoundLoading,
    toCompound,
    btnInfo,
    compoundPreResult,
    mergeSwapQuote,
    findRouterLoading,
    notCompoundableTotalYield,
    totalYield,
    currentPosLiquidityData
  } = useCompound()

  const initLoading = useMemo(() => {
    return !compoundPreResult && (isRebalancePreLoading || findRouterLoading)
  }, [compoundPreResult, isRebalancePreLoading, findRouterLoading])

  return (
    <VStack w="100%" align="flex-start">
      <VStack w="100%" mt="24px">
        <PendingYieldValue
          myPosYieldValue={totalYield}
          yieldList={compoundableRewards}
          placement="bottom"
          textStyle={{ fontSize: '24px', color: 'text_caption', textDecorationColor: 'text_paragraph', textUnderlineOffset: '4px' }}
        />
        <Center zIndex="999" mb="-24px" mt="4px" w="36px" h="36px" borderRadius="50%" bg="#202123">
          <Icon xlinkHref="#icon-a-icon_trade" fontSize="12px" cursor="text" svgHover="text_paragraph" />
        </Center>
      </VStack>
      <DetailRatio
        allRoutes={initLoading ? [] : allRoutes}
        displayPercentA={currentPosLiquidityData?.displayPercentA}
        displayPercentB={currentPosLiquidityData?.displayPercentB}
        compoundPreResult={compoundPreResult}
      />
      {notCompoundableRewards?.length > 0 && <AutoClaim autoClaimList={notCompoundableRewards} autoClaimTotalYield={notCompoundableTotalYield} />}
      {isShowConfirmPriceDiff && (
        <ConfirmPriceDiffTips confirmPriceDiff={confirmPriceDiff} changeConfirmPriceDiff={() => setConfirmPriceDiff(!confirmPriceDiff)} />
      )}
      <Button
        onClick={toCompound}
        fontWeight="500"
        h="48px"
        w="100%"
        mt="8px"
        isDisabled={btnInfo?.disabled || (isShowConfirmPriceDiff && !confirmPriceDiff)}
        isLoading={isCompoundLoading || initLoading}
      >
        {btnInfo?.text}
      </Button>
      <HStack w="100%" justify="space-between" m="8px 0 4px">
        <Text>Compound Fee</Text>
        <Skeleton isLoaded={true} h="16px">
          <Text color="text_caption">0%</Text>
        </Skeleton>
      </HStack>
      {(allRoutes?.length > 0 || compoundPreResult?.routeErrorInfo) && (
        <RouteBlock
          isFrom="compound"
          // firstInfo={firstInfo}
          // lastInfo={lastInfo}
          secondTitle="Build LP to position"
          routeErrorInfo={
            compoundPreResult?.routeErrorInfo
              ? {
                  ...compoundPreResult?.routeErrorInfo,
                  errorText: btnInfo?.text == 'Insufficient liquidity' ? 'Insufficient liquidity in this swap' : 'No route available in this swap'
                }
              : undefined
          }
          reCalculateRouteData={refreshRouteData}
          allRoutes={allRoutes}
          findRouterLoading={isRebalancePreLoading || findRouterLoading}
        />
      )}
    </VStack>
  )
}

export default CompoundBlock
