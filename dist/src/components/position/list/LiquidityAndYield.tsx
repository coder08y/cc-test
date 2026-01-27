import tvl_bg from '@/assets/images/tvl_bg.png'
import yield_bg from '@/assets/images/yield_bg.png'
import HiddenDotted from '@/components/profile/HiddenDotted'
import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import { useGetProfileLiquidityTvl } from '@/hooks/profile/useGetProfileLiquidityTvl'
import usePositionStore from '@/store/position'
import { Block } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { Icon } from '@cetus/ui-kit'
import { formatCurrency } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import PendingYieldModal from '../common/PendingYieldModal'
import PendingYieldValue from '../common/PendingYieldValue'

function LiquidityAndYield({ isProfile = false }: { isProfile?: boolean }) {
  const { currentAccount } = useAccountStore()
  const [claimLoading, setClaimLoading] = useState(false)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [yieldList, setYieldList] = useState<any>([])
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  const {
    myPosYieldValue,
    setMyPosYieldValue,
    posFeeDataLoading,
    posRewardsDataLoading,
    farmsPosRewardsDataLoading,
    posBaseList,
    posLiquidityData,
    posBaseListLoading,
    posLiquidityDataLoading,
    posFeeData,
    posRewardsData,
    farmsPosRewardsData,
    setMyClmmPosYieldValue,
    setMyDlmmPosYieldValue
  } = usePositionStore()

  const { clmmTotalTvl } = useGetProfileLiquidityTvl()

  const showLoading = !currentAccount?.address ? false : posBaseListLoading
  const { calculatePendingYield } = useCalculatePendingYield()

  useEffect(() => {
    if (!currentAccount?.address) {
      setMyPosYieldValue('')
      setYieldList([])
    } else {
      if (!posBaseListLoading && posBaseList?.length <= 0) {
        setMyPosYieldValue('0')
        setYieldList([])
      }
      if (
        posBaseList?.length > 0 &&
        currentAccount?.address &&
        !posBaseListLoading &&
        !posFeeDataLoading &&
        !posRewardsDataLoading &&
        !farmsPosRewardsDataLoading
      ) {
        const { total, rewardAndFeeList } = calculatePendingYield(posBaseList, posFeeData, posRewardsData, farmsPosRewardsData)

        setMyPosYieldValue(total)
        setYieldList(rewardAndFeeList)
      }
    }
  }, [posBaseList, posBaseListLoading, posFeeDataLoading, posRewardsDataLoading, farmsPosRewardsDataLoading, currentAccount, coinPriceObj])

  const showYieldLoading = !currentAccount?.address ? false : !myPosYieldValue

  const { isApp } = useWindowWidth()
  const claimDisabled = useMemo(() => {
    return Number(myPosYieldValue) <= 0 || claimLoading || !currentAccount?.address
  }, [myPosYieldValue, claimLoading, currentAccount?.address])

  return (
    <>
      {isProfile && isApp ? (
        <Block borderRadius="12px">
          <HStack w="100%" gap="12px" justify="space-between">
            <VStack w="50%" align="flex-start">
              <Text>Total Liquidity</Text>
              <Skeleton isLoaded={!!clmmTotalTvl}>
                <HiddenDotted size="l">
                  <ClmmTotalTvl clmmTotalTvl={clmmTotalTvl} isProfile />
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
              <Skeleton isLoaded={!showYieldLoading}>
                <HiddenDotted size="l">
                  <PendingYieldValue yieldList={yieldList} myPosYieldValue={myPosYieldValue} isProfile />
                </HiddenDotted>
              </Skeleton>
            </VStack>
          </HStack>
        </Block>
      ) : (
        <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" gap="16px">
          <HStack
            justifyContent="space-between"
            w={{ base: '100%', lg: '50%' }}
            p="0 20px"
            h="80px"
            borderRadius="14px"
            bgColor="card_bg"
            bgImage={tvl_bg}
            backgroundSize="100% 100%"
          >
            <Text fontSize="16px" color="primary_gray">
              Total Liquidity
            </Text>
            <Skeleton isLoaded={!!clmmTotalTvl}>
              <HiddenDotted size="l">
                <ClmmTotalTvl clmmTotalTvl={clmmTotalTvl} />
              </HiddenDotted>
            </Skeleton>
          </HStack>
          <HStack
            justifyContent="space-between"
            p="0 20px"
            w={{ base: '100%', lg: '50%' }}
            h="80px"
            borderRadius="14px"
            bgColor="card_bg"
            bgImage={yield_bg}
            backgroundSize="100% 100%"
          >
            <Text fontSize="16px" color="primary_gray">
              Claimable Yield
            </Text>
            <Skeleton isLoaded={!showYieldLoading}>
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
              <HStack onClick={claimDisabled ? () => {} : () => setIsOpenModal(true)}>
                <HiddenDotted size="l">
                  <PendingYieldValue myPosYieldValue={myPosYieldValue} yieldList={yieldList} />
                </HiddenDotted>
                {Number(myPosYieldValue) > 0 && <Icon xlinkHref="#icon-icon_spread" />}
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
              </HStack>
              {/* )} */}
            </Skeleton>
          </HStack>
        </Stack>
      )}
      <PendingYieldModal
        isOpen={isOpenModal}
        claimLoading={claimLoading}
        onClose={() => setIsOpenModal(false)}
        changeClaimLoading={(status: boolean) => setClaimLoading(status)}
      />
    </>
  )
}
const ClmmTotalTvl = ({ clmmTotalTvl, isProfile = false }: { clmmTotalTvl: string | number; isProfile?: boolean }) => {
  return (
    <Text fontSize={{ base: isProfile ? '16px' : '20px', lg: '20px' }} color="primary">
      {'$' + clmmTotalTvl == '--' ? '--' : formatCurrency(clmmTotalTvl, 2)}
    </Text>
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
