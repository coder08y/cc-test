import PendingYieldValue from '@/components/position/common/PendingYieldValue'
import useClaimMerge from '@/hooks/position-compound/useClaimMerge'
import usePositionCompoundStore from '@/store/position/compound'
import { TradeInput } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { Button, Center, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import ConfirmPriceDiffTips from '../ConfirmPriceDiffTips'
import AutoClaim from './AutoClaim'
import RouteBlock from './RouteBlock'

function ClaimMerged() {
  const { showConfirmPriceDiffInfo, mergeableRewards, notMergeableRewards, mergeToToken, setMergeToToken } = usePositionCompoundStore()

  // const isShowConfirmPriceDiff = useMemo(() => {
  //   return showConfirmPriceDiffInfo['merge']
  // }, [showConfirmPriceDiffInfo])

  const [isShowConfirmPriceDiff, setIsShowConfirmPriceDiff] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowConfirmPriceDiff(showConfirmPriceDiffInfo['merge'])
    }, 800)
    return () => clearTimeout(timer)
  }, [showConfirmPriceDiffInfo])

  const {
    isShowAutoClaim,
    reCalculateRouteData,
    btnInfo,
    isClaimMergeLoading,
    toClaimMerge,
    notMergeableTotalYield,
    totalYield,
    mergeSwapQuote,
    findRouterLoading,
    resetData,
    targetTokenList,
    toTokenAmountValue,
    toTokenRawAmountValue
  } = useClaimMerge()

  const [confirmPriceDiff, setConfirmPriceDiff] = useState(false)
  return (
    <VStack w="100%" align="flex-start">
      <VStack w="100%" mt="22px">
        <PendingYieldValue
          myPosYieldValue={totalYield}
          yieldList={mergeableRewards}
          placement="bottom"
          textStyle={{ fontSize: '24px', color: 'text_caption', textDecorationColor: 'text_paragraph', textUnderlineOffset: '4px' }}
        />
        <Text>Total Mergeable Value</Text>
        {mergeableRewards?.length !== 0 && (
          <Center zIndex="999" mb="-24px" mt="4px" w="36px" h="36px" borderRadius="50%" bg="#202123">
            <Icon xlinkHref="#icon-a-icon_trade" fontSize="12px" cursor="text" svgHover="text_paragraph" />
          </Center>
        )}
      </VStack>
      {mergeableRewards?.length !== 0 && (
        <TradeInput
          token={mergeToToken}
          value={toTokenRawAmountValue || ''}
          isShowBalance={false}
          selectable={true}
          placeholder={'0'}
          inputAllowed={false}
          half={false}
          max={false}
          // rightJustify="center"
          loading={findRouterLoading && !toTokenRawAmountValue}
          dropSelectTokenList={targetTokenList}
          changeCurrentToken={value => {
            resetData()
            setMergeToToken(value)
          }}
          onChange={() => {}}
          amountValue={toTokenAmountValue}
          wrapStyle={{
            h: '98px',
            borderRadius: '12px',
            bg: 'blue_bg'
          }}
          symbolTipStyle={{
            fontSize: '16px'
          }}
        />
      )}

      {isShowAutoClaim && <AutoClaim autoClaimList={notMergeableRewards} autoClaimTotalYield={notMergeableTotalYield} />}
      {isShowConfirmPriceDiff && (
        <ConfirmPriceDiffTips confirmPriceDiff={confirmPriceDiff} changeConfirmPriceDiff={() => setConfirmPriceDiff(!confirmPriceDiff)} />
      )}
      <Button
        mb="8px"
        isLoading={isClaimMergeLoading}
        isDisabled={btnInfo?.disabled || (isShowConfirmPriceDiff && !confirmPriceDiff)}
        fontWeight="500"
        h="48px"
        w="100%"
        onClick={toClaimMerge}
        mt={mergeableRewards?.length == 0 ? '28px' : '8px'}
      >
        {btnInfo?.text}
      </Button>
      {mergeSwapQuote?.data?.allRoutes?.length > 0 && (
        <RouteBlock
          isFrom="merge"
          allRoutes={mergeSwapQuote?.data?.allRoutes || []}
          findRouterLoading={findRouterLoading}
          reCalculateRouteData={reCalculateRouteData}
        />
      )}
    </VStack>
  )
}

export default ClaimMerged
