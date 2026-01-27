import ExamplePieChart from '@/components/common/aprTooltip/ExamplePieChart'
import { CetusTooltip } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { cancelBubble, isAvailableObject, removeComma, textEllipses } from '@cetus/utils'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { Center, HStack, PlacementWithLogical, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { Suspense, useState } from 'react'
const PositionAprBlock = ({
  totalAprDisplay,
  farmingAprDisplay,
  placement = 'top',
  poolInfo,
  positionApr,
  showFarmingApr = false,
  haveUnderline = false,
  flexDirection = 'column',
  isActive = true
}: {
  totalAprDisplay?: string
  farmingAprDisplay?: string
  flexDirection?: string
  poolInfo: any
  positionApr: any
  showFarmingApr?: boolean
  haveUnderline?: boolean
  placement?: PlacementWithLogical | undefined
  isActive?: boolean
}) => {
  const { getTokenListInfo } = useGetToken()
  const [tokenMap, setTokenMap] = useState<Map<string, any>>(new Map())
  useDeepCompareEffect(() => {
    if (positionApr?.posMiningReward?.length == 0) return
    const coinTypeList = positionApr?.posMiningReward?.map((item: any) => item?.coinType)
    getTokenListInfo(coinTypeList).then((res: any) => {
      if (res && res?.size > 0) {
        setTokenMap(res)
      }
    })
  }, [positionApr?.posMiningReward])

  const { isApp } = useWindowWidth()
  const feesData =
    poolInfo?.feeApr && poolInfo?.feeApr !== '--' && !isNaN(Number(removeComma(poolInfo?.feeApr))) && d(removeComma(poolInfo?.feeApr)).gt(0)
      ? [
          {
            name: 'Fees',
            value: Number(positionApr?.aprByFee),
            displayValue: positionApr?.aprByFeeDisplay,
            color: '#68FFD8'
          }
        ]
      : []

  const COLORS = ['#6868FF', '#FFCA68', '#C8FF00', '#FF562B', '#0A05FF', '#FF65F8', '#FF3232', '#842CFF', '#31D829']
  // 确保除去sui以外的奖励颜色按照COLORS的顺序展示
  let colorIndex = -1

  const miningData = positionApr?.posMiningReward
    ?.map((item: any) => {
      const { symbol, coinType, posMiningRewardApr, posMiningRewardAprDisplay } = item || {}
      const isSuiToken = fixCoinType(coinType || '') == fixCoinType(envConfigs?.sui_coin?.coin_type || '')
      colorIndex = isSuiToken ? colorIndex : colorIndex + 1
      return {
        name: `${textEllipses(`${symbol || tokenMap?.get(coinType)?.symbol || ''}`, 8)} Rewards`,
        value: Number(posMiningRewardApr),
        displayValue: posMiningRewardAprDisplay,
        color: isSuiToken ? '#65C8FF' : COLORS[colorIndex]
      }
    })
    .sort((a: any, b: any) => b.value - a.value)

  const originData = feesData.concat(miningData)

  return isActive ? (
    <HStack
      justify="flex-end"
      onClick={e => {
        isApp ? cancelBubble(e) : ''
      }}
    >
      {isAvailableObject(positionApr) && positionApr?.aprPercentageTotal > 0 ? (
        <CetusTooltip
          maxW="350px"
          placement={placement}
          showTooltip={poolInfo?.haveMining && totalAprDisplay !== '--'}
          tooltip={
            <VStack w="100%" p="4px">
              <HStack w="100%" justify="space-between">
                <Text color="text_caption" fontSize={isApp ? '12px' : '14px'}>
                  Total APR
                </Text>
                <Text color="text_caption" fontSize={isApp ? '12px' : '14px'}>
                  {totalAprDisplay}
                </Text>
              </HStack>
              <TooltipInfo originData={originData} />
            </VStack>
          }
        >
          <Center>
            <AprInfo
              flexDirection={flexDirection}
              showFarmingApr={showFarmingApr}
              haveUnderline={haveUnderline}
              poolInfo={poolInfo}
              totalAprDisplay={totalAprDisplay}
              farmingAprDisplay={farmingAprDisplay}
            />
          </Center>
        </CetusTooltip>
      ) : (
        <Text color="text_caption" fontSize={isApp ? '12px' : '14px'}>
          --
        </Text>
      )}
    </HStack>
  ) : (
    <Text color="text_caption" fontSize={isApp ? '12px' : '14px'}>
      0%
    </Text>
  )
}
export default PositionAprBlock

const AprInfo = ({
  poolInfo,
  totalAprDisplay,
  farmingAprDisplay,
  haveUnderline,
  showFarmingApr = false,
  flexDirection = 'column'
}: {
  showFarmingApr?: boolean
  haveUnderline?: boolean
  poolInfo?: any
  totalAprDisplay?: string
  flexDirection?: 'column' | 'row'
  farmingAprDisplay?: string
}) => {
  const { isApp } = useWindowWidth()
  return (
    <VStack align={flexDirection == 'column' ? 'flex-end' : 'center'} gap="4px" flexDirection={flexDirection}>
      <Text
        as="span"
        color="primary"
        fontSize={isApp ? '12px' : '14px'}
        cursor={poolInfo?.haveMining && totalAprDisplay !== '0%' ? 'help' : 'text'}
        textDecoration={haveUnderline && poolInfo?.haveMining && totalAprDisplay !== '0%' ? 'underline dotted' : 'none'}
        textUnderlineOffset="3px"
      >
        {totalAprDisplay}
      </Text>
      {poolInfo?.haveFarming && showFarmingApr && (
        <CetusTooltip tooltip="Your Farming APR">
          <Text
            fontWeight="500"
            p="2px 4px"
            fontSize={isApp ? '12px' : '14px'}
            color="primary_yellow"
            bg="primary_yellow_opacity.10"
            borderRadius="4px"
            whiteSpace="nowrap"
          >
            {farmingAprDisplay == '--' ? '--' : '+' + farmingAprDisplay}
          </Text>
        </CetusTooltip>
      )}
    </VStack>
  )
}

const TooltipInfo = ({ originData }: { originData?: any }) => {
  return (
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
  )
}
