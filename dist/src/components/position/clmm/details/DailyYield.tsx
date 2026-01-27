import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { CetusTooltip } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { formatCurrency } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { HStack, Image, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

type PriceRangeBlockProps = {
  totalYield: string
  afterRatio?: string
}

function PriceRangeBlock({ totalYield, afterRatio }: PriceRangeBlockProps) {
  const { posPoolsRelatedData, currentPosBaseInfo, posFeeData, posRewardsData } = usePositionStore()
  const { totalDailyExpansionFactorUSD } = usePositionDetailStore()

  const currentPosPoolsRelatedData = useMemo(() => {
    return posPoolsRelatedData[currentPosBaseInfo?.posId]
  }, [posPoolsRelatedData, currentPosBaseInfo?.posId])

  const isInActive = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus == 'Inactive'
  }, [currentPosPoolsRelatedData])

  const hasStatus = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus !== undefined
  }, [currentPosPoolsRelatedData])

  const showEarnUSD = useMemo(() => {
    return isInActive
      ? '$0'
      : hasStatus
        ? totalDailyExpansionFactorUSD !== '$0'
          ? `+${formatCurrency(totalDailyExpansionFactorUSD, 2)}`
          : totalDailyExpansionFactorUSD
        : null
  }, [totalDailyExpansionFactorUSD])

  const afterRatioEarnUSD = useMemo(() => {
    console.log('🚀 ~ PriceRangeBlock ~ showEarnUSD:', totalDailyExpansionFactorUSD, showEarnUSD, afterRatio)
    if (!totalDailyExpansionFactorUSD || !showEarnUSD || showEarnUSD == 0 || showEarnUSD == '$0' || !afterRatio) return '$0'

    const value = d(totalDailyExpansionFactorUSD)
    if (value.isNaN()) return null

    // 计算乘以 afterRatio 后的值
    const result = value.mul(afterRatio).div(100).toString()

    return `+${formatCurrency(result, 2)}`
  }, [totalDailyExpansionFactorUSD, afterRatio])

  return (
    <>
      {showEarnUSD !== null &&
        (afterRatio ? (
          isInActive ? (
            <></>
          ) : (
            <VStack align="flex-start" w="100%">
              <Text fontSize="12px">Est. Daily Yield Boost</Text>
              <Skeleton isLoaded={!!totalYield && !!currentPosBaseInfo && !!posFeeData && !!posRewardsData}>
                <HStack gap="2px" align="flex-end">
                  <Text fontSize="16px" color="primary_green">
                    {afterRatioEarnUSD}
                  </Text>
                  <Image src="/images/rise.png" w="12px" h="12px" mb="1px" />
                </HStack>
              </Skeleton>
            </VStack>
          )
        ) : (
          <Stack flexDir={{ base: 'row', lg: 'row' }} bg="blue_bg" borderRadius="6px" p="5px 8px" alignItems="center">
            <CetusTooltip
              placement="top"
              tooltip={
                <Text fontSize="12px" lineHeight="20px">
                  Estimated based on yield performance of this position since the last operation on it. Past performance is not indicative of future
                  results, which is for reference only.
                </Text>
              }
            >
              <HStack gap="4px">
                <Text fontSize="12px">Est. Daily Yield</Text>
                <Icon xlinkHref="#icon-icon_tips" />
              </HStack>
            </CetusTooltip>

            <Skeleton isLoaded={!!totalYield && !!currentPosBaseInfo && !!posFeeData && !!posRewardsData}>
              <Text fontSize="12px" color="primary">
                {showEarnUSD}
              </Text>
            </Skeleton>
          </Stack>
        ))}
    </>
  )
}

export default PriceRangeBlock
