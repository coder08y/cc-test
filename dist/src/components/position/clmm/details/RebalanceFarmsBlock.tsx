import FarmingIcon from '@/components/common/FarmingIcon'
import usePriceRange from '@/hooks/clmm/usePriceRange'
import useLiquidityStore from '@/store/clmm'
import usePositionDetailStore from '@/store/position/detail'
import { getDisplayPrice, getDisplayReversePrice } from '@/utils/pool'
import { ErrorTips } from '@cetus/design'
import { cancelBubble } from '@cetus/utils'
import { Box, HStack, Stack, Switch, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

export default function RebalanceFarmsBlock({
  perText,
  isStakeFarm,
  isShowRange = true,
  changeStakeFarm
}: {
  perText: string
  isStakeFarm: boolean
  isShowRange?: boolean
  changeStakeFarm: (isStakeFarm: boolean) => void
}) {
  const { currentPosPoolInfo, isDirect } = usePositionDetailStore()
  const { currentRange } = useLiquidityStore()

  const { handleInitTickData } = usePriceRange()
  const [isFarmRange, setIsFarmRange] = useState(true)

  const minPrice = useMemo(() => {
    return isDirect
      ? getDisplayPrice(currentPosPoolInfo?.displayFarmsEffectMinPrice)
      : getDisplayReversePrice(currentPosPoolInfo?.displayFarmsEffectMaxPrice)
  }, [currentPosPoolInfo, isDirect])

  const maxPrice = useMemo(() => {
    return isDirect
      ? getDisplayPrice(currentPosPoolInfo?.displayFarmsEffectMaxPrice)
      : getDisplayReversePrice(currentPosPoolInfo?.displayFarmsEffectMinPrice)
  }, [currentPosPoolInfo, isDirect])

  console.log('🚀 ~ RebalanceBlock ~ minPrice:', minPrice, maxPrice)

  useEffect(() => {
    console.log('🚀 ~ RebalanceBlock ~ currentRange:', currentRange == 'default', currentRange)
    if (currentRange) {
      if (currentRange == 'default') {
        changeStakeFarm(true)
        setIsFarmRange(true)
      } else {
        setIsFarmRange(false)
      }
    }
  }, [currentRange])

  // 处理farm奖励范围变化 Handle farm rewards range change
  const handleChangeIsFarmRewardsRange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 ~ handleChangeIsFarmRewardsRange ~ event:', event)
    setIsFarmRange(event.target.checked)
    if (event.target.checked) {
      changeStakeFarm(event.target.checked)
    }
    if (event.target.checked && currentPosPoolInfo?.farmsEffectiveTickLower && currentPosPoolInfo?.farmsEffectiveTickUpper) {
      handleInitTickData(currentPosPoolInfo?.farmsEffectiveTickLower, currentPosPoolInfo?.farmsEffectiveTickUpper, currentPosPoolInfo)
    }
  }

  return (
    <VStack w="100%" align="flex-start">
      {isShowRange ? (
        <VStack w="100%" align="flex-start" p={{ base: '0px', lg: '0' }}>
          <Stack w="100%" flexDir="row" justify="space-between">
            <HStack>
              <FarmingIcon
                tooltip={
                  <Box as="div" lineHeight="20px" fontSize="12px">
                    Farm reward range: Only liquidity within this range is eligible to receive farming rewards of the pool. &nbsp;
                    <Box
                      as="a"
                      color="primary"
                      onClick={(e: any) => {
                        cancelBubble(e)
                        window.open('https://medium.com/@CetusProtocol/cetus-new-farms-everything-you-should-know-about-it-c6b60e6a6ae5')
                      }}
                    >
                      Learn More
                    </Box>
                  </Box>
                }
              />
              <Text fontSize={{ base: '12px', lg: '14px' }} ml={{ base: '-8px', lg: '0' }}>
                Farm rewards range
              </Text>
            </HStack>
            <Switch isChecked={isFarmRange} onChange={e => handleChangeIsFarmRewardsRange(e)} />
          </Stack>
          <HStack>
            <Text color="primary_yellow" fontSize={{ base: '12px', lg: '14px' }}>
              {minPrice}&nbsp;-&nbsp;{maxPrice}
            </Text>

            <Text fontSize={{ base: '12px', lg: '14px' }}> {perText?.replace('/', ' per ')}</Text>
          </HStack>
        </VStack>
      ) : (
        <VStack w="100%" align="flex-start">
          <HStack w="100%" justify="space-between">
            <Text>Stake your new position into the farm</Text>
            <Switch isChecked={isStakeFarm} onChange={() => changeStakeFarm(!isStakeFarm)} />
          </HStack>
          <Box sx={{ p: { color: 'primary' } }}>
            <ErrorTips
              bg="primary_opacity.10"
              isShowIcon={false}
              tipsFontSize="12px"
              tips="Rebalance will automatically close the previous farming stake, with the farming yield be claimed "
            />
          </Box>
        </VStack>
      )}
    </VStack>
  )
}
