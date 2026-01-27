import usePriceRange from '@/hooks/clmm/usePriceRange'
import useGetRecommendRanges from '@/hooks/clmm/useRecommendRanges'
import useLiquidityStore from '@/store/clmm'
import useDepositStore from '@/store/clmm/deposit'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { RecommendRange } from '@/types'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, isAvailableObject } from '@cetus/utils'
import { Box, Flex, Image, Text, Tooltip, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useEffect, useState } from 'react'

type SelectRecommendPriceRangeProps = {
  poolAddress: string
  currentTick: number
  tickSpacing: number
  farmsEffectTickLower?: number
  farmsEffectTickUpper?: number
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
  const { poolAddress, currentTick, tickSpacing, farmsEffectTickLower, farmsEffectTickUpper } = props
  const { isApp } = useWindowWidth()
  const { handleInitTickData } = usePriceRange()
  const { apiPoolInfo, currentRange, setCurrentRange } = useLiquidityStore()
  const { lowerTickData, upperTickData, setLowerTickData, setUpperTickData, setTickDataLoading, tickDataLoading } = usePriceRangeStore()
  const { recommendRangesInfo } = useDepositStore()
  const fetchRecommendRanges = async () => {
    try {
      if (!currentRange) {
        setTickDataLoading(true)
      }

      const { rangeList, error } = await getRecommendRangesList({ ...props, recommendRangesInfo })
      setRecommendRanges(rangeList)
      if (error) {
        setCurrentRange('custom')
        if (!currentRange && apiPoolInfo?.tokenA && apiPoolInfo?.tokenB) {
          const range = rangeList.find(item => item.key === 'custom')
          if (range && apiPoolInfo?.tokenA && apiPoolInfo?.tokenB) {
            handleInitTickData(range?.lower, range?.upper, apiPoolInfo)
          }
        }
      } else {
        setCurrentRange(rangeList[0]?.key)
        if (!currentRange && apiPoolInfo?.tokenA && apiPoolInfo?.tokenB) {
          handleInitTickData(rangeList[0]?.lower, rangeList[0]?.upper, apiPoolInfo)
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
      if (poolAddress && currentTick !== undefined && tickSpacing !== undefined) {
        fetchRecommendRanges()
      }
    },
    [poolAddress, tickSpacing, recommendRangesInfo],
    { wait: 500 }
  )

  useEffect(() => {
    if (recommendRanges && recommendRanges.length > 0 && isAvailableObject(lowerTickData) && isAvailableObject(upperTickData)) {
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
  return (
    <>
      <Flex
        w={{ base: '100%', lg: '124px' }}
        flexDirection={{ base: 'row', lg: 'column' }}
        flexWrap="wrap"
        border="1px solid"
        borderColor={recommendRanges && recommendRanges.length > 0 ? 'border' : 'transparent'}
        borderRadius="16px"
        p="4px"
        rowGap={{ base: '20px', lg: '0' }}
        bg={recommendRanges && recommendRanges.length > 0 ? 'background' : 'transparent'}
        marginTop="0"
        minH="62px"
      >
        {recommendRanges?.map((range, index) => {
          return (
            <Tooltip label={getRecommendRangeTipText(range.key)} key={range.key} lineHeight="1.5" placement="top" gutter={-4}>
              <VStack
                cursor="pointer"
                textAlign="center"
                width={{ base: recommendRanges?.length ? rangeWidthMap[recommendRanges.length + ''] : 'auto', lg: 'auto' }}
                p="8px 20px"
                gap="4px"
                onClick={() => {
                  if (range.key !== currentRange) {
                    setCurrentRange(range.key)

                    if (apiPoolInfo?.tokenA && apiPoolInfo?.tokenB) {
                      handleInitTickData(range.lower, range.upper, apiPoolInfo)
                    }
                  }
                }}
                bg={range.key == currentRange ? 'card_bg' : 'transparent'}
                borderRadius="12px"
                sx={{
                  _hover: {
                    p: {
                      color: 'primary'
                    }
                  }
                }}
              >
                <Image
                  decoding="async"
                  display={range.key === currentRange ? 'block' : 'none'}
                  src={`/images/${getRecommendRangeData(range.key, true)?.image}`}
                  w="72px"
                  h={range.key === currentRange ? '22px' : '0px'}
                  fallback={<Box bg="background" w="72px" h={range.key === currentRange ? '22px' : '0px'} borderRadius="4px" />}
                />
                <Image
                  decoding="async"
                  display={range.key === currentRange ? 'none' : 'block'}
                  src={`/images/${getRecommendRangeData(range.key, false)?.image}`}
                  w="72px"
                  h={range.key === currentRange ? '0px' : '22px'}
                  fallback={<Box bg="background" w="72px" h={range.key === currentRange ? '0px' : '22px'} borderRadius="4px" />}
                />
                <Text color={range.key == currentRange ? 'primary' : 'primary_gray'} fontSize="12px">
                  {getRecommendRangeData(range.key).name}
                </Text>
              </VStack>
            </Tooltip>
          )
        })}
      </Flex>
    </>
  )
}
