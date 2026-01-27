import ExamplePieChart from '@/components/common/aprTooltip/ExamplePieChart'
import { aprProcessing } from '@/utils/api-data-utils'
import { CetusTooltip } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { d, formatPercentage, textEllipses } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { HStack, PlacementWithLogical, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { Suspense, useState } from 'react'
type EstimatedAprProps = {
  estimateApr?: string
  placement?: PlacementWithLogical | undefined
  miningAprList?: any[] | null
  haveMining?: boolean
  loading: boolean
}
function EstimatedApr({ estimateApr, placement = 'top', miningAprList, haveMining, loading }: EstimatedAprProps) {
  const { isApp } = useWindowWidth()
  const [tokenMap, setTokenMap] = useState<Map<string, any>>(new Map())
  const isEstimateApNaN = isNaN(estimateApr as any)
  const { getTokenListInfo } = useGetToken()

  useDeepCompareEffect(() => {
    const coinTypeList = miningAprList?.map((item: any) => item?.coinType)
    getTokenListInfo(coinTypeList).then((res: any) => {
      if (res && res?.size > 0) {
        setTokenMap(res)
      }
    })
  }, [miningAprList])

  const feesData = isEstimateApNaN
    ? []
    : [
        {
          name: 'Fees',
          value: Number(estimateApr),
          displayValue: formatPercentage(d(estimateApr).mul(100).toString()) ?? '--',
          color: '#68FFD8'
        }
      ]

  const COLORS = ['#6868FF', '#FFCA68', '#C8FF00', '#FF562B', '#0A05FF', '#FF65F8', '#FF3232', '#842CFF', '#31D829']
  // 确保除去sui以外的奖励颜色按照COLORS的顺序展示
  let colorIndex = -1
  const miningData = miningAprList
    ?.map((item: any) => {
      const { coinType, apr } = item || {}
      const isSuiToken = fixCoinType(coinType || '') == fixCoinType(envConfigs?.sui_coin?.coin_type || '')
      colorIndex = isSuiToken ? colorIndex : colorIndex + 1
      return {
        name: `${textEllipses(`${tokenMap?.get(coinType)?.symbol || ''}`, 8)} Rewards`,
        value: Number(apr),
        displayValue: aprProcessing(apr, true, false, true),
        color: isSuiToken ? '#65C8FF' : COLORS[colorIndex],
        coinType
      }
    })
    .sort((a: any, b: any) => b.value - a.value)

  const originData = feesData.concat(miningData ?? [])

  const totalAprDisplay = isEstimateApNaN
    ? estimateApr
    : aprProcessing(d(originData?.reduce((acc, cur) => d(acc).plus(cur?.value).toNumber(), 0)).toString(), true, false, true)

  return loading ? (
    <Skeleton w="50px" h="14px" />
  ) : haveMining ? (
    <CetusTooltip
      placement={placement}
      maxW="350px"
      tooltip={
        <Suspense
          fallback={
            <VStack w="320px" h="279px" align="flex-start" gap="16px">
              <HStack justify="space-between" w="100%">
                <Skeleton w="30%" h="20px" />
                <Skeleton w="30%" h="20px" />
              </HStack>
              <HStack justify="space-between" gap="20px" w="100%">
                <SkeletonCircle w="64px" h="64px" />
                <VStack w="calc(100% - 84px)">
                  <HStack justify="space-between" w="100%">
                    <Skeleton w="40%" h="16px" />
                    <Skeleton w="30%" h="16px" />
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Skeleton w="40%" h="16px" />
                    <Skeleton w="30%" h="16px" />
                  </HStack>
                  <HStack justify="space-between" w="100%">
                    <Skeleton w="40%" h="16px" />
                    <Skeleton w="30%" h="16px" />
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          }
        >
          <VStack gap="16px" w="320px" overflow="hidden" align="flex-start" pb="2px">
            <HStack w="100%" justify="space-between">
              <Text color="text_caption">Total APR</Text>
              <Text color="text_caption" fontSize="16px">
                {totalAprDisplay ?? '--'}
              </Text>
            </HStack>

            <Suspense
              fallback={
                <HStack justify="space-between" gap="20px" w="100%">
                  <SkeletonCircle w="64px" h="64px" />
                  <VStack w="calc(100% - 84px)">
                    <HStack justify="space-between" w="100%">
                      <Skeleton w="40%" h="16px" />
                      <Skeleton w="30%" h="16px" />
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Skeleton w="40%" h="16px" />
                      <Skeleton w="30%" h="16px" />
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Skeleton w="40%" h="16px" />
                      <Skeleton w="30%" h="16px" />
                    </HStack>
                  </VStack>
                </HStack>
              }
            >
              <ExamplePieChart originData={originData} />
            </Suspense>
          </VStack>
        </Suspense>
      }
    >
      <Text fontSize={isApp ? '12px' : '14px'} color="primary" textDecoration="underline dotted" textDecorationColor="primary" cursor="pointer">
        {totalAprDisplay ?? '--'}
      </Text>
    </CetusTooltip>
  ) : (
    <Text fontSize={isApp ? '12px' : '14px'} color={isEstimateApNaN ? 'text_caption' : 'primary'} textDecorationColor="primary">
      {totalAprDisplay ?? '--'}
    </Text>
  )
}

export default EstimatedApr
