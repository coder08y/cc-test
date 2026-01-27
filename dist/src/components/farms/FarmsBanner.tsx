import useFarmsActions from '@/hooks/farms/useFarmsAction'
import usePositionList from '@/hooks/position/usePositionList'
import usePositionStore from '@/store/position'
import { useAccountStore } from '@cetus/stores'
import { d, formatCurrency } from '@cetus/utils'
import { Box, Button, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

type FarmsBannerProps = {
  totalRewards: string
}

export function FarmsBanner(props: FarmsBannerProps) {
  const { totalRewards } = props
  const { currentAccount } = useAccountStore()
  const { posBaseList } = usePositionStore()
  const { getPositionBaseList, getPosRelatedData } = usePositionList()
  const { toClaimAllPos, claimLoading } = useFarmsActions()
  const rewardRef = useRef<HTMLParagraphElement | null>(null)
  const getPosList = async () => {
    if (currentAccount?.address) {
      await getPositionBaseList(currentAccount?.address as string)
    }
  }
  const toClaimAll = () => {
    toClaimAllPos(posBaseList, getPosList)
  }

  useEffect(() => {
    if (rewardRef?.current) {
      rewardRef.current.textContent = formatCurrency(totalRewards, 2)
    }
  }, [totalRewards])
  return (
    <VStack
      w="100%"
      pos="absolute"
      alignItems="start"
      sx={{
        backgroundImage: { base: "url('/images/farms_banner_h5.png')", lg: "url('/images/farms.png')" },
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <VStack minW={{ base: '100%', lg: '1200px' }} p="40px 20px 0" margin="0px auto" gap="12px" h="240px" alignItems="start">
        <Text color="text_caption" fontSize="28px" fontWeight="500">
          Farms
        </Text>
        <Text fontSize="16px">Stake your positions to earn higher yield.</Text>
        {currentAccount?.address && (
          <Box h="20px" mt="16px">
            <Skeleton isLoaded={!!totalRewards}>
              <Text color="primary" fontSize="20px" fontWeight="500" ref={rewardRef}>
                {/* {formatCurrency(totalRewards, 2)} */}
              </Text>
            </Skeleton>
          </Box>
        )}
        {currentAccount?.address && (
          <Button
            isLoading={claimLoading}
            isDisabled={claimLoading || totalRewards == '--' ? true : d(totalRewards).lte(0)}
            // w="170px"
            h="28px"
            fontSize="14px"
            borderRadius="8px"
            onClick={toClaimAll}
          >
            Claim All Rewards
          </Button>
        )}
      </VStack>
    </VStack>
  )
}
