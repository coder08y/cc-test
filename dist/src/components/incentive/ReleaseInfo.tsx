import useIncentiveStore from '@/store/incentive'
import { IncentiveRewardInfo } from '@/types/incentive'
import { Block, TooltipIcon } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { HTextLabelBox } from '@cetus/ui-kit'
import { d, formatNumber, formatPercentage, isAvailableObject, removeComma, textEllipses } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { formatEpoch } from './RewardTokenAndDuration'
import RewardsPreviewChart from './RewardsPreviewChart'

export default function ReleaseInfo({ rewardList }: { rewardList: any }) {
  return (
    <VStack gap="16px" w="100%" maxW="460px" align="flex-start" bg="#1B1D21" borderRadius="16px" p={{ base: '16px 8px', lg: '32px' }}>
      <Text color="text_caption" fontSize="16px" fontWeight="500">
        Release Info
      </Text>
      <VStack w="100%">
        {rewardList?.length > 0 &&
          rewardList?.map((rewardInfo: any, index: number) => {
            return <ReleaseInfoItem rewardInfo={rewardInfo} key={rewardInfo?.rewardCoin?.coin_type || index} />
          })}
      </VStack>
    </VStack>
  )
}

const ReleaseInfoItem = ({ rewardInfo }: { rewardInfo: IncentiveRewardInfo }) => {
  const { getTokenAmountValue, fetchTokenPrices } = useTokenPrice()
  const { incentiveApiPoolInfo } = useIncentiveStore()

  useEffect(() => {
    if (rewardInfo?.rewardCoin?.is_trusted === false) {
      fetchTokenPrices([rewardInfo?.rewardCoin?.coin_type])
    }
  }, [rewardInfo?.rewardCoin?.coin_type])

  const amountVal = getTokenAmountValue(rewardInfo?.rewardCoin?.coin_type, rewardInfo?.rewardNum || 0)
  const releaseRate = rewardInfo?.releaseRate
    ? d(removeComma(rewardInfo?.releaseRate + ''))
        .mul(24 * 60 * 60)
        .toString()
    : '--'

  // apr: 本次添加激励的价值 / 池子当前总流动性 *100% *（365天 / 激励释放时间)
  const periodDays = rewardInfo?.startTime && rewardInfo?.endTime ? Number(formatEpoch(rewardInfo.startTime, rewardInfo.endTime, 'day')) : 0
  const apr =
    rewardInfo?.rewardNum && periodDays > 0 && d(incentiveApiPoolInfo?.tvl ?? 0).gt(0) && d(amountVal).gt(0)
      ? formatPercentage(
          d(amountVal)
            .div(incentiveApiPoolInfo?.tvl ?? 0)
            .mul(d(365).div(periodDays))
            .mul(100)
            .toString()
        )
      : '--'
  const showReleaseInfo =
    rewardInfo?.startTime &&
    rewardInfo?.endTime &&
    rewardInfo?.rewardNum &&
    rewardInfo?.releaseRate &&
    isAvailableObject(rewardInfo?.rewardCoin) &&
    d(removeComma(rewardInfo?.releaseRate + '')).gte(d(1).div(d(10).pow(rewardInfo?.rewardCoin?.decimals)))
  return showReleaseInfo ? (
    <Block borderRadius="12px" p="0">
      <VStack p="16px" w="100%" gap="12px">
        <HStack w="100%" justify="space-between" gap="12px">
          <SingleTokenInfo haveName={false} token={rewardInfo?.rewardCoin} />
        </HStack>
        <HTextLabelBox
          label="Vesting Period"
          isLoading={false}
          labelStyle={{
            fontSize: '14px',
            lineHeight: '20px',
            whiteSpace: 'nowrap'
          }}
          value={(formatEpoch(rewardInfo?.startTime, rewardInfo?.endTime) as string) || '--'}
          valueStyle={{
            fontSize: '14px',
            lineHeight: '20px'
          }}
        />

        <HStack w="100%" justify="space-between" lineHeight="18px" gap="12px">
          <Text whiteSpace="nowrap">Total allocation</Text>
          <HStack gap="2px" justify="flex-end" flexWrap="wrap">
            <Text color="text_caption" whiteSpace="nowrap">
              {rewardInfo?.rewardNum ? formatNumber(rewardInfo?.rewardNum, rewardInfo?.rewardCoin?.decimal) : '--'}
            </Text>
            <Text whiteSpace="nowrap">{textEllipses(rewardInfo?.rewardCoin?.symbol, 10) || ''}</Text>
          </HStack>
        </HStack>
        <HStack w="100%" justify="space-between" lineHeight="18px" gap="12px">
          <HStack gap="4px">
            <Text whiteSpace="nowrap">Emission Rate</Text>
            <TooltipIcon tooltipCon="Rewards emitted to the pool per day" />
          </HStack>
          <HStack gap="2px" justify="flex-end" flexWrap="wrap">
            <Text color="text_caption" whiteSpace="nowrap">
              {releaseRate ? formatNumber(releaseRate, rewardInfo?.rewardCoin?.decimal) : '--'}
            </Text>
            <Text whiteSpace="nowrap">{textEllipses(rewardInfo?.rewardCoin?.symbol, 10) || ''} per day</Text>
          </HStack>
        </HStack>
        <HStack w="100%" justify="space-between">
          <HStack gap="4px">
            <Text>{textEllipses(rewardInfo?.rewardCoin?.symbol, 10) || ''} Reward APR</Text>
            <TooltipIcon tooltipCon="Estimated APR increase from this incentive" />
          </HStack>
          <Text color="text_caption" as="span" textAlign="right">
            {apr}
          </Text>
        </HStack>
      </VStack>
      <RewardsPreviewChart rewardInfo={rewardInfo} />
    </Block>
  ) : null
}

export { ReleaseInfoItem }
