import icon_fee from '@/assets/images/icon_fee@2x.png'
import { PoolType } from '@/components/pools/createPool/SelectPoolType'
import { useGetToken } from '@cetus/hooks/src/useToken'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { SingleCoinImage } from '@cetus/ui-kit'
import { fixRounding, formatNumber, fromDecimalsAmountFix, textEllipses } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, HStack, Image, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { Suspense, lazy, useEffect, useState } from 'react'
const ExamplePieChart = lazy(() => import('./ExamplePieChart'))

const tooltipMap: Record<
  PoolType,
  {
    both: string
    mining: string
    farming: string
    rewards: string
  }
> = {
  clmm: {
    both: 'Estimated according to trading activity in the past 24 hours plus mining and farming rewards',
    mining: 'Estimated according to trading activity in the past 24 hours plus mining rewards',
    farming: 'Estimated according to trading activity in the past 24 hours plus farming rewards',
    rewards: 'Estimated according to trading activity in the past 24 hours'
  },
  dlmm: {
    both: 'Estimated based on trading activity in the past 24 hours plus mining and farming rewards. For pool groups, the displayed APR represents the highest value among active pools in that category',
    mining:
      'Estimated based on trading activity in the past 24 hours plus mining rewards. For pool groups, the displayed APR represents the highest value among active pools in that category',
    farming:
      'Estimated based on trading activity in the past 24 hours plus farming rewards. For pool groups, the displayed APR represents the highest value among active pools in that category',
    rewards:
      'Estimated based on trading activity in the past 24 hours. For pool groups, the displayed APR represents the highest value among active pools in that category'
  }
}

const TooltipInfo = ({ poolInfo, poolType = 'clmm' }: { poolInfo: any; poolType?: PoolType }) => {
  // TODO api接口合并奖励信息更新后 不用单独拿token信息
  const { getTokenInfo, getTokenListInfo } = useGetToken()
  const [tokenMap, setTokenMap] = useState<Map<string, any>>(new Map())

  useDeepCompareEffect(() => {
    const coinTypeList = poolInfo?.miningAprList?.map((item: any) => item?.coinType)
    getTokenListInfo(coinTypeList).then((res: any) => {
      if (res && res?.size > 0) {
        setTokenMap(res)
      }
    })
  }, [poolInfo?.miningAprList])

  const feesData = [
    {
      name: 'Fees',
      value: Number(poolInfo?.feeApr),
      displayValue: poolInfo?.feeAprDisplay,
      color: '#68FFD8'
    }
  ]

  const COLORS = ['#6868FF', '#FFCA68', '#C8FF00', '#FF562B', '#0A05FF', '#FF65F8', '#FF3232', '#842CFF', '#31D829']
  // 确保除去sui以外的奖励颜色按照COLORS的顺序展示
  let colorIndex = -1

  const miningData = poolInfo?.miningAprList
    ?.map((item: any) => {
      const { symbol, coinType, apr, aprDisplay } = item || {}
      const isSuiToken = fixCoinType(coinType || '') == fixCoinType(envConfigs?.sui_coin?.coin_type || '')
      colorIndex = isSuiToken ? colorIndex : colorIndex + 1
      return {
        name: `${textEllipses(`${symbol || tokenMap?.get(coinType)?.symbol || ''}`, 8)} Rewards`,
        value: Number(apr),
        displayValue: aprDisplay,
        color: isSuiToken ? '#65C8FF' : COLORS[colorIndex],
        coinType
      }
    })
    .sort((a: any, b: any) => b.value - a.value)

  const originData = feesData.concat(miningData)

  const [rewardsList, setRewardsList] = useState<any>([])
  useEffect(() => {
    const fetchData = async () => {
      if (poolInfo?.miningRewardList?.length > 0) {
        try {
          const coinTypeList = poolInfo?.miningRewardList?.map((item: any) => item?.coinType)
          const tokenMap = await getTokenListInfo(coinTypeList)
          const list = miningData
            ?.map(m => {
              const token = poolInfo?.miningRewardList?.find(i => i?.coinType === m?.coinType)
              if (token) {
                const tokenInfo = tokenMap?.get(token?.coinType)
                return { ...token, tokenInfo }
              }
              return undefined
            })
            .filter(Boolean)
          setRewardsList(list)
        } catch (error) {
          console.error('Error processing list:', error)
        }
      }
    }
    fetchData()
  }, [poolInfo?.miningRewardList, miningData])

  return (
    <VStack gap="16px" w="320px" overflow="hidden" align="flex-start" pb="2px">
      <Text lineHeight="20px" textAlign="left" w="100%" whiteSpace="wrap" fontSize="12px">
        {poolInfo?.haveMining && poolInfo?.haveFarming
          ? tooltipMap[poolType].both
          : poolInfo?.haveMining
            ? tooltipMap[poolType].mining
            : poolInfo?.haveFarming
              ? tooltipMap[poolType].farming
              : tooltipMap[poolType].rewards}
      </Text>
      <Box h="1px" w="100%" bg="border" />
      <HStack w="100%" justify="space-between">
        <Text color="text_caption">Total APR</Text>
        <Text color="text_caption" fontSize="16px">
          {poolInfo?.totalAprDisplay}
        </Text>
      </HStack>
      {!poolInfo?.haveMining && (
        <HStack w="100%" justify="space-between">
          <HStack>
            <Image w="20px" h="20px" src={icon_fee} />
            <Text fontSize="12px">Fees</Text>
          </HStack>
          <Text color="text_caption" fontSize="12px">
            {poolInfo?.feeAprDisplay}
          </Text>
        </HStack>
      )}
      {poolInfo?.haveMining && (
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
      )}
      {rewardsList?.length > 0 && (
        <Box w="100%" p="8px" bg="primary_opacity.10" borderRadius="12px">
          <VStack align="flex-start" gap="8px">
            <Text color="text_caption">Mining Rewards</Text>
            {rewardsList.map((item: any) => (
              <HStack gap="8px" key={item?.tokenInfo?.symbol}>
                <Box>
                  <SingleCoinImage imageUrl={item?.tokenInfo?.logo_url} w="20px" h="20px" />
                </Box>
                <Text color="primary" display="inline-block" fontSize="12px">
                  {/* 处理精度后向上取整展示位隔符 */}
                  {formatNumber(fixRounding(fromDecimalsAmountFix(item?.emissionsEveryDay, item?.tokenInfo?.decimals), 2))}{' '}
                  {textEllipses(item?.tokenInfo?.symbol, 8)} per day
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
      {poolInfo?.haveFarming && (
        <HStack w="100%" justify="space-between" borderRadius="8px" p="8px" bg="primary_yellow_opacity.10">
          <VStack align="flex-start" gap="4px">
            <Text color="primary_yellow" fontSize="12px">
              Farming
            </Text>
            <Text color="white_color_opacity.80" fontSize="12px">
              Stake Position to Earn
            </Text>
          </VStack>
          <Text color="text_caption">{poolInfo?.farmingAprDisplay}</Text>
        </HStack>
      )}
    </VStack>
  )
}

export default TooltipInfo
