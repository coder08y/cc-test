import { RewardsCoin } from '@/components/farms/ExpendItem'
import useFarmsActions from '@/hooks/farms/useFarmsAction'
import useCurrentPos from '@/hooks/position/useCurrentPos'
import useGetFarmsPosRewards from '@/hooks/position/useGetFarmsPosRewards'
import usePosHelper from '@/hooks/position/usePosHelper'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { PosBaseInfo, PosReward } from '@/types'
import { Block, CetusTooltip } from '@cetus/design/src/components/common'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Icon } from '@cetus/ui-kit'
import { d } from '@cetusprotocol/common-sdk'
import { Box, Button, HStack, Image, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

type FarmsBlockProps = {
  haveFarming: boolean
}

function FarmsBlock({ haveFarming }: FarmsBlockProps) {
  const { isApp } = useWindowWidth()
  const { currentPosBaseInfo, farmsPosRewardsData, posPoolsRelatedData, posBaseListLoading, posPoolsOriginalData } = usePositionStore()
  const { currentPosPoolInfo } = usePositionDetailStore()
  const { currentAccount } = useAccountStore()
  const { getCurrentPosBaseInfo, getCurrentPosHistory } = useCurrentPos()
  const { getFarmsRewardsData } = useGetFarmsPosRewards()

  const { getClmmPosName } = usePosHelper()
  const tokenName = useMemo(() => {
    if (currentPosBaseInfo?.tokenName) {
      return currentPosBaseInfo?.tokenName
    } else {
      const position_index = posPoolsOriginalData?.[currentPosBaseInfo?.clmmPool as string]?.index
      return getClmmPosName(currentPosBaseInfo?.index as number, position_index) || ''
    }
  }, [currentPosBaseInfo?.tokenName, currentPosBaseInfo?.index, currentPosBaseInfo?.clmmPool, posPoolsOriginalData])

  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId as string]
  // const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'
  const { getPosIsActive } = usePosHelper()

  const isActive = useMemo(() => {
    return getPosIsActive(currentPosBaseInfo as PosBaseInfo, posPoolsOriginalData?.[currentPosBaseInfo?.clmmPool || '']?.current_sqrt_price)
  }, [currentPosBaseInfo, posPoolsOriginalData])

  const posFarmsData = farmsPosRewardsData[currentPosBaseInfo?.id as string]
  const farmsRewarderList = currentPosPoolInfo?.farmsRewarderList || []
  const totalRewards = posFarmsData?.reduce((sum: number, item: any) => d(sum).add(item.display_amount_owed).toString(), 0)

  const { toStakePos, toUnStakePos, toClaimPos, unstakeLoading, claimLoading } = useFarmsActions()

  const navigate = useNavigate()

  const stakeRefresh = (events: any) => {
    navigate(`/position-detail/${events[0].parsedJson.wrapped_position_id}`, { replace: true })
    setTimeout(() => {
      getCurrentPosBaseInfo(currentAccount?.address as string, events[0].parsedJson.wrapped_position_id, true)
    }, 2000)
  }
  const toStake = async () => {
    toStakePos(currentPosBaseInfo as string, currentPosPoolInfo?.farmsPoolAddress, tokenName, stakeRefresh)
  }

  const unstakeRefresh = () => {
    navigate(`/position-detail/${currentPosBaseInfo?.posId}`, { replace: true })
    setTimeout(() => {
      getCurrentPosBaseInfo(currentAccount?.address as string, currentPosBaseInfo?.posId as string, true)
      // getCurrentPosHistory(currentPosBaseInfo?.id as string, currentPosBaseInfo?.posId as string)
    }, 2000)
  }
  const toUnstack = async () => {
    toUnStakePos(currentPosBaseInfo?.id as string, currentPosBaseInfo?.farmsPool as string, tokenName, unstakeRefresh)
  }

  const claimRefresh = () => {
    setTimeout(() => {
      getFarmsRewardsData([currentPosBaseInfo])
      // getCurrentPosHistory(currentPosBaseInfo?.id as string, currentPosBaseInfo?.posId as string)
    }, 2000)
  }

  const toClaim = async () => {
    toClaimPos(currentPosBaseInfo?.id as string, currentPosBaseInfo?.farmsPool as string, claimRefresh)
  }

  // 计算仓位的amount 判断用哪个list做奖励的循环展示
  const totalAmount = useMemo(() => {
    if (posFarmsData?.length > 0) {
      return posFarmsData.reduce((sum: any, rewardData: PosReward) => {
        return d(sum).plus(rewardData?.display_amount_owed).toString()
      }, '0')
    }
    return '0'
  }, [posFarmsData, currentAccount?.address, claimLoading, unstakeLoading])

  const isCanStake = useMemo(() => {
    if (currentPosBaseInfo && currentPosPoolInfo) {
      return currentPosBaseInfo.posType == 'clmm' && currentPosPoolInfo.haveFarming === true
    }
    return false
  }, [currentPosBaseInfo?.posType, currentPosPoolInfo?.haveFarming])

  if (!haveFarming && d(totalRewards).eq(0)) {
    return null
  }

  return (
    <>
      {(currentPosPoolInfo?.farmsPoolAddress || d(totalAmount).gt(0)) && (
        <VStack position="relative" w="100%" borderRadius="16px" bg="linear-gradient( 180deg, #003125 0%, #111111 100%)">
          {haveFarming && (
            <HStack position="relative" zIndex={1} w="100%" p={{ base: '12px 8px', lg: '12px 16px' }} justify="space-between">
              <VStack align="flex-start">
                <Text color="text_caption">Farming</Text>
                <Text color="primary_gray" fontSize="12px">
                  Stake Position to Earn
                </Text>
              </VStack>
              <HStack gap="4px" p="12px 16px">
                <Text color="primary" fontSize="12px" fontWeight="500">
                  APR
                </Text>
                <Text color="primary" fontSize="12px" fontWeight="500">
                  {currentPosPoolInfo?.farmingAprDisplay}
                  {/* <AprTooltip poolInfo={currentPosPoolInfo} isPosition={true} showAprSize="12px" /> */}
                </Text>
                <HStack
                  gap="4px"
                  cursor="pointer"
                  onClick={() => navigate('/farms')}
                  sx={{
                    _hover: {
                      p: {
                        color: 'text_caption'
                      },
                      svg: {
                        fill: 'text_caption'
                      }
                    }
                  }}
                >
                  <Icon boxW="14px" boxH="14px" xlinkHref="#icon-icon_list_token" />
                </HStack>
              </HStack>
            </HStack>
          )}

          <Block
            position="relative"
            zIndex={1}
            mt={haveFarming ? '-20px' : '0px'}
            bg="none"
            p={{ base: '16px 8px 12px', lg: '20px 16px 16px' }}
            borderRadius={haveFarming ? '0 0 12px 12px' : '12px'}
            border="none"
          >
            <Text fontSize="12px" color="primary_gray">
              Farming Rewards
            </Text>
            <HStack w="100%" flexWrap="wrap">
              {posFarmsData?.length > 0 && d(totalAmount).gt(0) ? (
                posFarmsData?.map((item: any) => {
                  return (
                    <React.Fragment key={item?.rewarder_type}>
                      {d(item?.display_amount_owed).gt(0) && (
                        <RewardsCoin
                          key={item?.coinType}
                          coinType={item?.token?.coin_type}
                          amount={item?.display_amount_owed}
                          tokenInfo={item?.token}
                          boxStyle={{ mt: '16px', w: 'calc(50% - 4px) ' }}
                          textAlign="left"
                        />
                      )}
                    </React.Fragment>
                  )
                })
              ) : farmsRewarderList?.length > 0 ? (
                farmsRewarderList?.map((item: any) => {
                  return (
                    <RewardsCoin
                      key={item?.coinType}
                      coinType={item?.coinType}
                      amount="0"
                      boxStyle={{ mt: '16px', w: 'calc(50% - 4px) ' }}
                      textAlign="left"
                    />
                  )
                })
              ) : (
                <Text textColor="text_caption" textAlign="right" mt="8px">
                  --
                </Text>
              )}
            </HStack>
            <HStack w="100%" justify="space-between" mt="16px">
              {currentPosBaseInfo?.posType == 'farms' && (
                <Button
                  isDisabled={claimLoading || unstakeLoading}
                  isLoading={unstakeLoading}
                  variant="outline"
                  h="32px"
                  borderRadius="8px"
                  w="50%"
                  fontSize="14px"
                  bg="none"
                  onClick={toUnstack}
                >
                  Unstake
                </Button>
              )}
              {isCanStake && !isActive && (
                <Box w="50%" sx={{ '>button': { w: '100%' } }}>
                  <CetusTooltip
                    placement="top"
                    tooltip={
                      <Text fontSize="12px" lineHeight="20px" w="200px">
                        Farming rewards are only available for active positions.
                      </Text>
                    }
                  >
                    <Box w="100%">
                      <Button bg="none" isDisabled={true} h="32px" borderRadius="8px" w="100%" fontSize="14px">
                        Stake
                      </Button>
                    </Box>
                  </CetusTooltip>
                </Box>
              )}

              {isCanStake && isActive && (
                <Button
                  isDisabled={claimLoading || unstakeLoading}
                  isLoading={unstakeLoading}
                  h="32px"
                  borderRadius="8px"
                  w="50%"
                  fontSize="14px"
                  onClick={toStake}
                >
                  Stake
                </Button>
              )}
              <Button
                isDisabled={claimLoading || unstakeLoading || d(totalRewards).eq(0)}
                isLoading={claimLoading}
                variant="outline"
                h="32px"
                borderRadius="8px"
                w="50%"
                bg="none"
                fontSize="14px"
                onClick={toClaim}
              >
                Claim rewards
              </Button>
            </HStack>
          </Block>
          <Image
            src="/images/img_farming@2x.png"
            w={haveFarming ? '169px' : '128px'}
            h={haveFarming ? '169px' : '128px'}
            position="absolute"
            right="20px"
            top="50%"
            transform="translateY(-50%)"
            opacity="0.1"
          />
        </VStack>
      )}
    </>
  )
}
export default FarmsBlock
