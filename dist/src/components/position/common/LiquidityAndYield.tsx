import tvl_bg from '@/assets/images/tvl_bg.png'
import yield_bg from '@/assets/images/yield_bg.png'
import HiddenDotted from '@/components/profile/HiddenDotted'
import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import { useGetProfileLiquidityTvl } from '@/hooks/profile/useGetProfileLiquidityTvl'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import { Block, CetusTooltip } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { Icon } from '@cetus/ui-kit'
import { d, formatCurrency, formatNumberWithLtMinPrecision, formatPrice, removeComma } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, SkeletonCircle, Stack, Text, VStack } from '@chakra-ui/react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Cell, Legend, Pie, PieChart } from 'recharts'
import PendingYieldModal from './PendingYieldModal'
import PendingYieldValue from './PendingYieldValue'
function LiquidityAndYield({ isProfile = false, isInitialLoad }: { isProfile?: boolean; isInitialLoad?: boolean }) {
  const { currentAccount } = useAccountStore()
  const [claimLoading, setClaimLoading] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [yieldList, setYieldList] = useState<any>([])

  // 缓存上一次的有效值，用于自动刷新时保持显示
  const [cachedLiquidityTvl, setCachedLiquidityTvl] = useState<string | number | undefined>(undefined)
  const [cachedClmmTvl, setCachedClmmTvl] = useState<string | number | undefined>(undefined)
  const [cachedDlmmTvl, setCachedDlmmTvl] = useState<string | number | undefined>(undefined)
  const [cachedYieldValue, setCachedYieldValue] = useState<string>('')

  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  const {
    myPosYieldValue,
    setMyPosYieldValue,
    myClmmPosYieldValue,
    setMyClmmPosYieldValue,
    myDlmmPosYieldValue,
    setMyDlmmPosYieldValue,
    posFeeDataLoading,
    posRewardsDataLoading,
    farmsPosRewardsDataLoading,
    posBaseList,
    posLiquidityData,
    posBaseListLoading,
    posLiquidityDataLoading,
    posFeeData,
    posRewardsData,
    farmsPosRewardsData
  } = usePositionStore()

  const {
    dlmmPosBaseList,
    dlmmPosLiquidityData,
    dlmmPosBaseListLoading,
    dlmmPosRewardsDataLoading,
    dlmmPosRewardsData,
    dlmmPosFeeData,
    dlmmPosFeeAndRewardsLoading
  } = useDlmmPositionStore()

  const { clmmTotalTvl, dlmmTotalTvl, liquidityTotalTvl } = useGetProfileLiquidityTvl(false)

  const showClmmLoading = !currentAccount?.address ? false : posBaseListLoading
  const showDlmmLoading = !currentAccount?.address ? false : dlmmPosBaseListLoading
  const { calculatePendingYield } = useCalculatePendingYield()

  // 更新缓存：仅在 Pools 页面（isInitialLoad !== undefined）时才缓存
  useEffect(() => {
    if (isInitialLoad !== undefined) {
      if (liquidityTotalTvl && liquidityTotalTvl !== '--' && liquidityTotalTvl !== undefined) {
        setCachedLiquidityTvl(liquidityTotalTvl)
      }
      if (clmmTotalTvl && clmmTotalTvl !== '--' && clmmTotalTvl !== undefined) {
        setCachedClmmTvl(clmmTotalTvl)
      }
      if (dlmmTotalTvl && dlmmTotalTvl !== '--' && dlmmTotalTvl !== undefined) {
        setCachedDlmmTvl(dlmmTotalTvl)
      }
    }
  }, [liquidityTotalTvl, clmmTotalTvl, dlmmTotalTvl, isInitialLoad])

  useEffect(() => {
    if (isInitialLoad !== undefined && myPosYieldValue && myPosYieldValue !== '') {
      setCachedYieldValue(myPosYieldValue)
    }
  }, [myPosYieldValue, isInitialLoad])

  // 决定显示的值：仅在 Pools 自动刷新时（isInitialLoad === false）优先使用缓存值
  const displayLiquidityTvl = isInitialLoad === false && (!liquidityTotalTvl || liquidityTotalTvl === '--') ? cachedLiquidityTvl : liquidityTotalTvl
  const displayClmmTvl = isInitialLoad === false && (!clmmTotalTvl || clmmTotalTvl === '--') ? cachedClmmTvl : clmmTotalTvl
  const displayDlmmTvl = isInitialLoad === false && (!dlmmTotalTvl || dlmmTotalTvl === '--') ? cachedDlmmTvl : dlmmTotalTvl
  const displayYieldValue = isInitialLoad === false && !myPosYieldValue ? cachedYieldValue : myPosYieldValue

  const [yieldLoading, setYieldLoading] = useState(true)

  useEffect(() => {
    if (!currentAccount?.address) {
      setMyPosYieldValue('')
      setYieldList([])
      // 清空缓存
      setCachedLiquidityTvl(undefined)
      setCachedClmmTvl(undefined)
      setCachedDlmmTvl(undefined)
      setCachedYieldValue('')
    } else {
      if (!posBaseListLoading && posBaseList?.length <= 0 && !dlmmPosBaseListLoading && dlmmPosBaseList?.length <= 0) {
        setMyPosYieldValue('0')
        setYieldList([])
      }

      if (
        (posBaseList?.length > 0 || dlmmPosBaseList?.length > 0) &&
        currentAccount?.address &&
        !posBaseListLoading &&
        !posFeeDataLoading &&
        !posRewardsDataLoading &&
        !farmsPosRewardsDataLoading &&
        !dlmmPosBaseListLoading &&
        !dlmmPosRewardsDataLoading &&
        !dlmmPosFeeAndRewardsLoading
      ) {
        console.log('🚀 ~ useEffect ~ posBaseList:', {
          posBaseList,
          dlmmPosBaseList,
          posFeeData,
          posRewardsData,
          farmsPosRewardsData,
          dlmmPosFeeData,
          dlmmPosRewardsData
        })
        setYieldLoading(true)
        setTimeout(() => {
          const { total, rewardAndFeeList } = calculatePendingYield(
            [...posBaseList, ...dlmmPosBaseList],
            posFeeData,
            posRewardsData,
            farmsPosRewardsData,
            dlmmPosFeeData,
            dlmmPosRewardsData
          )
          setMyPosYieldValue(total)
          setYieldList(rewardAndFeeList)
          const { total: clmmTotal } = calculatePendingYield(posBaseList, posFeeData, posRewardsData, farmsPosRewardsData)
          setMyClmmPosYieldValue(clmmTotal)
          const { total: dlmmTotal } = calculatePendingYield(dlmmPosBaseList, {}, {}, {}, dlmmPosFeeData, dlmmPosRewardsData)
          setMyDlmmPosYieldValue(dlmmTotal)
          setYieldLoading(false)
        }, 0)
      }
    }
  }, [
    posBaseList,
    posBaseListLoading,
    posFeeDataLoading,
    posRewardsDataLoading,
    farmsPosRewardsDataLoading,
    dlmmPosBaseListLoading,
    dlmmPosRewardsDataLoading,
    currentAccount,
    coinPriceObj,
    dlmmPosBaseList,
    posFeeData,
    farmsPosRewardsData,
    dlmmPosFeeData,
    dlmmPosRewardsData,
    dlmmPosFeeAndRewardsLoading
  ])

  // Profile 页面使用原始值判断，Pools 页面使用缓存值判断
  const showYieldLoading = isInitialLoad !== undefined ? !displayYieldValue : !myPosYieldValue

  const { isApp } = useWindowWidth()

  const claimDisabled = useMemo(() => {
    return Number(myPosYieldValue) <= 0 || claimLoading
  }, [myPosYieldValue, claimLoading])

  return (
    <>
      {isProfile && isApp ? (
        <Block borderRadius="12px">
          <HStack w="100%" gap="12px" justify="space-between">
            <VStack w="50%" align="flex-start">
              <Text>Total Liquidity</Text>
              <Skeleton
                isLoaded={
                  // Pools 页面自动刷新时（isInitialLoad === false），强制显示保持原值
                  isInitialLoad === false ||
                  // 否则使用原逻辑（Profile 页面使用原始值）
                  !!liquidityTotalTvl ||
                  !currentAccount?.address
                }
              >
                <HiddenDotted size="l">
                  <TotalTvl
                    totalTvl={isInitialLoad !== undefined ? displayLiquidityTvl : liquidityTotalTvl}
                    isProfile
                    clmmTvl={isInitialLoad !== undefined ? displayClmmTvl : clmmTotalTvl}
                    dlmmTvl={isInitialLoad !== undefined ? displayDlmmTvl : dlmmTotalTvl}
                  />
                </HiddenDotted>
              </Skeleton>
            </VStack>

            <Box h="44px" w="1px" bg="border" />
            <VStack w="50%" align="flex-start">
              <HStack w="100%" justify="space-between">
                <Text>Claimable Yield</Text>
                <Text fontSize="12px" color={!claimDisabled ? 'primary' : ''} onClick={claimDisabled ? () => {} : () => setIsOpenModal(true)}>
                  Claim
                </Text>
              </HStack>
              <Skeleton isLoaded={!currentAccount?.address ? true : !showYieldLoading && !yieldLoading}>
                <HiddenDotted size="l">
                  <PendingYieldValue yieldList={yieldList} myPosYieldValue={myPosYieldValue} isProfile />
                </HiddenDotted>
              </Skeleton>
            </VStack>
          </HStack>
        </Block>
      ) : (
        <HStack w="100%" gap={{ base: '8px', lg: '16px' }}>
          <Stack
            justifyContent={{ base: 'center', lg: 'space-between' }}
            align={{ base: 'flex-start', lg: 'center' }}
            flex="1"
            p={{ base: '12px 8px', lg: '0 20px' }}
            h={{ base: '60px', lg: '80px' }}
            borderRadius={{ base: '8px', lg: '14px' }}
            gap="8px"
            bgColor="card_bg"
            bgImage={tvl_bg}
            backgroundSize="100% 100%"
            flexDir={{ base: 'column-reverse', lg: 'row' }}
            border={{ base: '0.5px solid', lg: 'none' }}
            borderColor={'border'}
          >
            <Text
              fontSize={{ base: '12px', lg: '16px' }}
              lineHeight={{ base: '14px', lg: '16px' }}
              h={{ base: '14px', lg: '16px' }}
              color="primary_gray"
            >
              Total Liquidity
            </Text>
            <Skeleton
              h={{ base: '16px', lg: '20px' }}
              isLoaded={
                // Pools 页面自动刷新时（isInitialLoad === false），强制显示保持原值
                isInitialLoad === false ||
                // 否则使用原逻辑
                (!!displayClmmTvl && !!displayDlmmTvl) ||
                !currentAccount?.address
              }
            >
              <HiddenDotted size="l">
                <TotalTvl totalTvl={displayLiquidityTvl} clmmTvl={displayClmmTvl} dlmmTvl={displayDlmmTvl} />
              </HiddenDotted>
            </Skeleton>
          </Stack>
          <HStack
            justify="space-between"
            flex="1"
            bgColor="card_bg"
            bgImage={yield_bg}
            backgroundSize="100% 100%"
            p={{ base: '12px 8px', lg: '0 20px' }}
            h={{ base: '60px', lg: '80px' }}
            borderRadius={{ base: '8px', lg: '14px' }}
            border={{ base: '0.5px solid', lg: 'none' }}
            borderColor={'border'}
          >
            <Stack
              w="100%"
              justifyContent={{ base: 'center', lg: 'space-between' }}
              align={{ base: 'flex-start', lg: 'center' }}
              gap="8px"
              flexDir={{ base: 'column-reverse', lg: 'row' }}
            >
              <Text
                fontSize={{ base: '12px', lg: '16px' }}
                lineHeight={{ base: '14px', lg: '16px' }}
                height={{ base: '14px', lg: '16px' }}
                color="primary_gray"
              >
                Claimable Yield
              </Text>
              <Skeleton
                isLoaded={
                  // Pools 页面自动刷新时（isInitialLoad === false），强制显示保持原值
                  !currentAccount?.address
                    ? true
                    : (isInitialLoad === false ||
                        // 否则使用原逻辑
                        !showYieldLoading) &&
                      !yieldLoading
                }
              >
                {/* {isApp ? (
                <HStack gap="20px">
                  <VStack align="flex-end">
                    <PendingYieldValue yieldList={yieldList} />
                    <Button
                      isLoading={claimLoading}
                      isDisabled={claimDisabled}
                      w="100px"
                      h="24px"
                      onClick={() => setIsOpenModal(true)}
                      borderRadius="8px"
                      fontSize="12px"
                      fontWeight="500"
                    >
                      Claim All
                    </Button>
                  </VStack>

                  {Number(myPosYieldValue) > 0 && <Icon xlinkHref="#icon-icon_spread" onClick={() => setIsOpenModal(true)} />}
                </HStack>
              ) : ( */}
                <HStack onClick={claimDisabled ? () => {} : () => setIsOpenModal(true)} gap={{ base: '4px', lg: '8px' }}>
                  <HiddenDotted size="l">
                    <PendingYieldValue yieldList={yieldList} myPosYieldValue={myPosYieldValue} />
                  </HiddenDotted>
                  {Number(myPosYieldValue) > 0 && <Icon xlinkHref="#icon-icon_spread" fontSize={isApp ? '14px' : '20px'} />}
                  {!isApp && (
                    <Button
                      isLoading={claimLoading}
                      isDisabled={claimDisabled}
                      w={{ base: 'unset', lg: '112px' }}
                      p={{ base: '8px', lg: 'unset' }}
                      h={{ base: '28px', lg: '32px' }}
                      borderRadius="8px"
                      fontSize={{ base: '12px', lg: '14px' }}
                      fontWeight="500"
                    >
                      Claim All
                    </Button>
                  )}
                </HStack>
                {/* )} */}
              </Skeleton>
            </Stack>
            {isApp && (
              <Box
                onClick={claimDisabled ? () => {} : () => setIsOpenModal(true)}
                bg="transparent"
                w="auto"
                p="0"
                h="16px"
                fontSize="12px"
                fontWeight="500"
                color={claimDisabled ? 'primary_gray' : 'primary'}
                cursor={claimDisabled ? 'not-allowed' : 'pointer'}
              >
                Claim
              </Box>
            )}
          </HStack>
        </HStack>
      )}
      <PendingYieldModal
        showLoading={showClmmLoading || showDlmmLoading}
        isOpen={isOpenModal}
        claimLoading={claimLoading}
        onClose={() => setIsOpenModal(false)}
        changeClaimLoading={(status: boolean) => setClaimLoading(status)}
      />
    </>
  )
}

const TotalTvl = ({
  totalTvl,
  isProfile = false,
  clmmTvl,
  dlmmTvl
}: {
  totalTvl: string | number | undefined
  isProfile?: boolean
  clmmTvl: string | number | undefined
  dlmmTvl: string | number | undefined
}) => {
  const { currentAccount } = useAccountStore()
  const isUndefined = totalTvl == '--'
  const isZero = totalTvl == '0'

  const clmmPercent =
    totalTvl !== undefined
      ? formatNumberWithLtMinPrecision(
          d(!clmmTvl || clmmTvl === '--' ? '0' : clmmTvl)
            .div(totalTvl)
            .mul(100)
            .toString()
        )
      : '--'
  const data = [
    {
      value: clmmTvl,
      title: 'CLMM',
      color: '#4A9AEF',
      percent: clmmPercent + '%'
    },
    {
      value: dlmmTvl,
      title: 'DLMM',
      color: '#00D8B6',
      percent: clmmPercent === '< 0.01' ? '99.99%' : clmmPercent !== '--' ? d(100).sub(removeComma(clmmPercent)).toString() + '%' : '--'
    }
  ]

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <VStack w="calc(100% - 60px)" align="flex-start" justify="center" gap="4px">
        {payload.map((entry: any, index: number) => (
          <HStack w="100%" key={`item-${index}`} gap="4px" justify="space-between" h="20px">
            {/* 图例颜色 */}
            <HStack gap="6px" justify="space-between">
              <Box
                style={{
                  width: '8px',
                  height: '8px',
                  minWidth: '8px',
                  minHeight: '8px',
                  backgroundColor: entry.payload?.color,
                  borderRadius: '2px'
                }}
              />
              <HStack gap="2px">
                <Text fontSize="12px">{entry.payload?.title}</Text>
                <Text fontSize="12px" color={entry.payload?.color}>
                  {entry.payload?.percent}
                </Text>
              </HStack>
            </HStack>
            <Text textAlign="right" fontSize="12px" color="text_caption">
              ${formatPrice(entry.payload?.value, 2)}
            </Text>
          </HStack>
        ))}
      </VStack>
    )
  }

  return !currentAccount?.address ? (
    <Text fontSize={{ base: isProfile ? '16px' : '14px', lg: '20px' }} color="text_highlight" fontWeight="500">
      $0
    </Text>
  ) : isUndefined || isZero ? (
    <Text fontSize={{ base: isProfile ? '16px' : '14px', lg: '20px' }} color="text_highlight" fontWeight="500">
      {isUndefined ? '--' : '$0'}
    </Text>
  ) : (
    <CetusTooltip
      tooltip={
        <Suspense
          fallback={
            <HStack justify="space-between" gap="12px" w="100%">
              <SkeletonCircle w="32px" h="32px" />
              <VStack w="80px" gap="4px">
                <Skeleton w="100%" h="20px" />
                <Skeleton w="100%" h="20px" />
              </VStack>
              <VStack w="100px" gap="4px">
                <Skeleton w="100%" h="20px" />
                <Skeleton w="100%" h="20px" />
              </VStack>
            </HStack>
          }
        >
          <PieChart width={240} height={44}>
            <Pie
              data={data?.map(item => ({ ...item, value: Number(item?.value) }))}
              cx="10%"
              cy="50%"
              innerRadius={9} // 设置内半径，创建空心效果
              outerRadius={16}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color} />
              ))}
            </Pie>
            <Legend
              content={renderLegend}
              layout="horizontal" // Set layout to horizontal
              align="center" // Align the Legend to the center
              verticalAlign="middle"
              wrapperStyle={{ left: '56px' }}
            />
          </PieChart>
        </Suspense>
      }
    >
      <Text
        fontSize={{ base: isProfile ? '16px' : '14px', lg: '20px' }}
        color="text_highlight"
        fontStyle="500"
        textDecoration="underline dotted"
        textUnderlineOffset="2px"
        cursor="help"
      >
        {formatCurrency(totalTvl, 2)}
      </Text>
    </CetusTooltip>
  )
}

export const LiquidityAndYieldBg = ({ leftChildren, rightChildren }: { leftChildren: React.ReactNode; rightChildren: React.ReactNode }) => {
  return (
    <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap={{ base: '12px', lg: '20px' }}>
      <HStack
        w={{ base: '100%', lg: '50%' }}
        p={{ base: '0 12px ', lg: '0 20px' }}
        h={{ base: '60px', lg: '80px' }}
        borderRadius="14px"
        bgColor="card_bg"
        bgImage={tvl_bg}
        backgroundSize="100% 100%"
      >
        {leftChildren}
      </HStack>
      <HStack
        p={{ base: '0 12px ', lg: '0 20px' }}
        w={{ base: '100%', lg: '50%' }}
        h={{ base: '60px', lg: '80px' }}
        borderRadius="14px"
        bgColor="card_bg"
        bgImage={yield_bg}
        backgroundSize="100% 100%"
      >
        {rightChildren}
      </HStack>
    </Stack>
  )
}

export default LiquidityAndYield
