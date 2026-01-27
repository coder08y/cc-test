import useRedeem from '@/hooks/compensation/useRedeem'
import useCompensationStore from '@/store/compensation'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { formatNumberWithDown } from '@cetus/utils'
import { Button, HStack, Skeleton, Text } from '@chakra-ui/react'
import { MSafeWallet } from '@msafe/sui-wallet'
import { useMemo } from 'react'
import { LiquidityAndYieldBg } from '../position/common/LiquidityAndYield'

export default function CompensationTotalAndClaim({ currentTab }: { currentTab: string }) {
  const { isApp } = useWindowWidth()
  const {
    posTotalCetusCompensation,
    posTotalAvailableClaim,
    vltTotalCetusCompensation,
    vltTotalAvailableClaim,
    posBaseListLoading,
    vaultPositionLoading
  } = useCompensationStore()

  const totalCetusCompensation = useMemo(() => {
    if (currentTab == 'positions') return posTotalCetusCompensation
    return vltTotalCetusCompensation
  }, [currentTab, posTotalCetusCompensation, vltTotalCetusCompensation])

  const totalAvailableClaim = useMemo(() => {
    if (currentTab == 'positions') return posTotalAvailableClaim
    return vltTotalAvailableClaim
  }, [currentTab, posTotalAvailableClaim, vltTotalAvailableClaim])

  const loading = useMemo(() => {
    if (currentTab == 'positions') return posBaseListLoading
    return vaultPositionLoading
  }, [currentTab, posBaseListLoading, vaultPositionLoading])

  const inMsafe = useMemo(() => {
    return !!MSafeWallet?.inMSafeWallet()
  }, [MSafeWallet])

  const { handleRedeem, redeemLoading, redeemAllLoading } = useRedeem(currentTab)

  const LeftChildrenComponent = () => (
    <HStack w="100%" justifyContent="space-between">
      <Text fontSize={{ base: '13px', lg: '16px' }} color="primary_gray">
        Total CETUS Compensation
      </Text>
      <Skeleton isLoaded={!loading} h={loading ? '28px' : 'auto'}>
        <Text fontSize={{ base: '14px', lg: '20px' }} color="primary">
          {formatNumberWithDown(totalCetusCompensation)} CETUS
        </Text>
      </Skeleton>
    </HStack>
  )

  const RightChildrenComponent = () => (
    <HStack gap="12px" w="100%" justifyContent="space-between">
      <Text fontSize={{ base: '13px', lg: '16px' }} color="primary_gray">
        Available to Claim
      </Text>
      <Skeleton isLoaded={!loading} h={loading ? '28px' : 'auto'}>
        <HStack gap="12px">
          <Text fontSize={{ base: '14px', lg: '20px' }} color="primary_green">
            {formatNumberWithDown(totalAvailableClaim)} CETUS
          </Text>
          {!inMsafe && (
            <Button
              w={{ base: '88px', lg: '112px' }}
              h={{ base: '24px', lg: '32px' }}
              borderRadius="8px"
              fontSize="12px"
              fontWeight="500"
              onClick={() => handleRedeem()}
              isLoading={redeemLoading || redeemAllLoading}
              isDisabled={!totalAvailableClaim || Number(totalAvailableClaim) == 0 || redeemLoading || redeemAllLoading}
            >
              Claim All
            </Button>
          )}
        </HStack>
      </Skeleton>
    </HStack>
  )
  return <LiquidityAndYieldBg leftChildren={<LeftChildrenComponent />} rightChildren={<RightChildrenComponent />} />
}
