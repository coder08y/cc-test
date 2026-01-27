import usePriceRange from '@/hooks/clmm/usePriceRange'
import useGetRecommendRanges from '@/hooks/clmm/useRecommendRanges'
import useLiquidityStore from '@/store/clmm'
import useDepositStore from '@/store/clmm/deposit'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { PoolApiInfo, RecommendRange } from '@/types'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { d, isAvailableObject } from '@cetus/utils'
import { Box, Flex, HStack, Image, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useEffect, useMemo, useState } from 'react'

type SelectRecommendPriceRangeProps = {
  poolAddress: string
  currentTick: number
  tickSpacing: number
  farmsEffectTickLower?: number
  farmsEffectTickUpper?: number
  isRebalance?: boolean
}

const getRecommendRangeData = (rangeName: string, isActive = false) => {
  switch (rangeName) {
    case 'passive':
      return {
        name: 'Conservative',
        image: isActive ? 'img_conservative_sel@2x.png' : 'img_conservative_nor@2x.png'
      }
    case 'active':
      return {
        name: 'Active',
        image: isActive ? 'img_active_sel@2x.png' : 'img_active_nor@2x.png'
      }
    case 'full range':
      return {
        name: 'Full Range',
        image: isActive ? 'img_fullrange_sel@2x.png' : 'img_fullrange_nor@2x.png'
      }
    case 'custom':
      return {
        name: 'Custom',
        image: isActive ? 'img_custom_sel@2x.png' : 'img_custom_nor@2x.png'
      }
    case 'suggested':
      return {
        name: 'Stable',
        image: isActive ? 'img_stable_sel@2x.png' : 'img_stable_nor@2x.png'
      }
    default:
      return {
        name: 'Default',
        image: isActive ? 'img_stable_sel@2x.png' : 'img_stable_nor@2x.png'
      }
  }
}

const getRecommendRangeTipText = (rangeName: string) => {
  switch (rangeName) {
    case 'passive':
      return 'Lower yields and lower impermanent loss. Less frequent rebalancing.'
    case 'active':
      return 'Higher yields but higher impermanent loss potentially. Requires frequent rebalancing.'
    case 'full range':
      return 'Full range positions are active all the time with no need to be rebalanced but may earn less fees than concentrated liquidity.'
    case 'custom':
      return 'Recommended only if you understand how concentrated liquidity works.'
    case 'suggested':
      return 'Stable range according to the price history of last 7 days.'
    default:
      return 'The default range of this pool is set following the real-time valid range of its farm.'
  }
}
const rangeWidthMap: Record<string, string> = {
  '1': '100%',
  '2': '50%',
  '3': '33.33%',
  '4': '50%'
}

export default function SelectRecommendPriceRange(props: SelectRecommendPriceRangeProps) {
  const { getRecommendRangesList } = useGetRecommendRanges()
  const [recommendRanges, setRecommendRanges] = useState<RecommendRange[]>()
  const { poolAddress, currentTick, tickSpacing, farmsEffectTickLower, farmsEffectTickUpper, isRebalance } = props
  const { isApp } = useWindowWidth()
  const { handleInitTickData } = usePriceRange()
  const { apiPoolInfo, currentRange, setCurrentRange } = useLiquidityStore()
  const { lowerTickData, upperTickData, setLowerTickData, setUpperTickData, setTickDataLoading, tickDataLoading } = usePriceRangeStore()
  const { recommendRangesInfo } = useDepositStore()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const originApiPoolInfo: PoolApiInfo = useMemo(() => {
    // console.log('🚀 ~ SelectRecommendPriceRange ~ apiPoolInfo:', apiPoolInfo)
    return { ...apiPoolInfo, tickSpacing }
  }, [apiPoolInfo, tickSpacing])

  const fetchRecommendRanges = async () => {
    try {
      if (!currentRange) {
        setTickDataLoading(true)
      }

      const { rangeList, error } = await getRecommendRangesList({ ...props, recommendRangesInfo })
      // console.log('🚀 ~ fetchRecommendRanges ~ rangeList:', rangeList, error, currentRange)
      setRecommendRanges(rangeList)

      if (error) {
        setCurrentRange('custom')
        if (!currentRange && originApiPoolInfo?.tokenA && originApiPoolInfo?.tokenB) {
          const range = rangeList.find(item => item.key === 'custom')
          if (range) {
            handleInitTickData(range?.lower, range?.upper, originApiPoolInfo)
          }
        }
      } else {
        setCurrentRange(rangeList[0]?.key)
        if (!currentRange && originApiPoolInfo?.tokenA && originApiPoolInfo?.tokenB) {
          handleInitTickData(rangeList[0]?.lower, rangeList[0]?.upper, originApiPoolInfo)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setTickDataLoading(false)
    }
  }

  useDebounceEffect(
    () => {
      const data = { ...props, recommendRangesInfo }
      // console.log('🚀 ~ SelectRecommendPriceRange ~ data:', data)
      if (
        recommendRangesInfo &&
        data?.poolAddress &&
        data?.currentTick !== undefined &&
        data?.tickSpacing !== undefined
        // data?.farmsEffectTickLower !== undefined &&
        // data?.farmsEffectTickUpper !== undefined
      ) {
        fetchRecommendRanges()
      }
    },
    [poolAddress, tickSpacing, currentTick, farmsEffectTickLower, farmsEffectTickUpper, recommendRangesInfo],
    { wait: 500 }
  )

  useEffect(() => {
    if (recommendRanges && recommendRanges.length > 0 && isAvailableObject(lowerTickData) && isAvailableObject(upperTickData)) {
      // console.log('🚀 ~ SelectRecommendPriceRange ~ recommendRanges:', recommendRanges)
      const range = recommendRanges?.find(range => d(range.lower).eq(d(lowerTickData?.tick)) && d(range.upper).eq(d(upperTickData?.tick)))

      if (range) {
        if (range.key !== currentRange) {
          setCurrentRange(range.key)
        }
      } else {
        setCurrentRange('custom')
      }
    }
  }, [lowerTickData?.tick, upperTickData?.tick, recommendRanges])

  const changeRange = (range: any) => {
    if (range.key !== currentRange) {
      setCurrentRange(range.key)
      if (originApiPoolInfo?.tokenA && originApiPoolInfo?.tokenB) {
        handleInitTickData(range.lower, range.upper, originApiPoolInfo)
      }
    }
  }

  const [tempRange, setTempRange] = useState<any>()

  return (
    <>
      {!(isRebalance && isApp) ? (
        <Flex
          w="100%"
          flexDirection={{ base: 'row', lg: isRebalance ? 'row' : 'column' }}
          flexWrap="wrap"
          rowGap={{ base: isRebalance ? '8px' : '20px', lg: '12px' }}
          marginTop="0"
          bg={isRebalance ? 'bg_secondary' : 'unset'}
          justify={isRebalance ? 'space-between' : 'unset'}
          align={isRebalance ? 'center' : 'unset'}
          border={isRebalance ? '1px solid' : 'none'}
          borderColor={'border'}
          borderRadius={isRebalance ? '12px' : '16px'}
          h={isRebalance && !isApp ? '38px' : 'unset'}
          p={isRebalance ? '4px' : '0px'}
        >
          {recommendRanges?.map((range, index) => {
            return (
              <Tooltip label={getRecommendRangeTipText(range.key)} key={range.key} lineHeight="1.5" placement="top" gutter={-4}>
                <VStack
                  cursor="pointer"
                  textAlign="center"
                  width={{
                    base: recommendRanges?.length ? rangeWidthMap[recommendRanges.length + ''] : 'auto',
                    lg: isRebalance ? `calc(100% / ${recommendRanges?.length} )` : 'auto'
                  }}
                  p={isRebalance && !isApp ? '0px' : '4px 8px'}
                  h={isRebalance && !isApp ? '100%' : 'unset'}
                  justify={isRebalance ? 'center' : 'unset'}
                  gap="4px"
                  onClick={() => changeRange(range)}
                  bg={range.key == currentRange ? 'primary_opacity.10' : 'transparent'}
                  borderRadius={isRebalance ? '8px' : '12px'}
                  sx={{
                    _hover: {
                      p: {
                        color: 'primary'
                      }
                    }
                  }}
                >
                  {!isRebalance && (
                    <Image
                      decoding="async"
                      display={range.key === currentRange ? 'block' : 'none'}
                      src={`/images/${getRecommendRangeData(range.key, true)?.image}`}
                      w="90px"
                      h={range.key === currentRange ? '28px' : '0px'}
                      fallback={<Box bg="background" w="72px" h={range.key === currentRange ? '28px' : '0px'} borderRadius="4px" />}
                    />
                  )}
                  {!isRebalance && (
                    <Image
                      decoding="async"
                      display={range.key === currentRange ? 'none' : 'block'}
                      src={`/images/${getRecommendRangeData(range.key, false)?.image}`}
                      w="90px"
                      h={range.key === currentRange ? '0px' : '28px'}
                      fallback={<Box bg="background" w="72px" h={range.key === currentRange ? '0px' : '28px'} borderRadius="4px" />}
                    />
                  )}
                  <Text color={range.key == currentRange ? 'primary' : 'primary_gray'} fontSize={isRebalance ? '14px' : '12px'}>
                    {getRecommendRangeData(range.key).name}
                  </Text>
                </VStack>
              </Tooltip>
            )
          })}
        </Flex>
      ) : (
        <Box as="div" display="grid" w="100%" marginTop="0" gap="8px" gridTemplateColumns="1fr 1fr">
          {recommendRanges &&
            recommendRanges?.length > 0 &&
            recommendRanges?.map((range, index) => {
              return (
                <HStack
                  cursor="pointer"
                  justify="center"
                  textAlign="center"
                  p="10px"
                  gap="2px"
                  border="1px solid"
                  borderColor={range.key == currentRange ? 'transparent' : 'border'}
                  onClick={() => changeRange(range)}
                  bg={range.key == currentRange ? 'primary_opacity.10' : 'bg_secondary'}
                  borderRadius="8px"
                  sx={{
                    _hover: {
                      p: {
                        color: 'primary'
                      }
                    },
                    '&:last-child:nth-child(odd)': {
                      gridColumn: 'span 2'
                    }
                  }}
                >
                  <Text color={range.key == currentRange ? 'primary' : 'primary_gray'} fontSize="12px">
                    {getRecommendRangeData(range.key).name}
                  </Text>
                  <CetusTooltip
                    tooltip={
                      <Text fontSize="12px" lineHeight="20px">
                        {getRecommendRangeTipText(range.key)}
                      </Text>
                    }
                  >
                    <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
                  </CetusTooltip>
                </HStack>
              )
            })}
        </Box>
      )}
    </>
  )
}
