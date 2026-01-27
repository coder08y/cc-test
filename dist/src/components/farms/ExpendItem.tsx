import useFarmsActions from '@/hooks/farms/useFarmsAction'
import usePosHelper from '@/hooks/position/usePosHelper'
import usePositionList from '@/hooks/position/usePositionList'
import usePositionStore from '@/store/position'
import { PosReward } from '@/types'
import { CetusTooltip } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { CoinType } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PriceRange from '../position/clmm/PriceRange'
import LiquidityValueBlock from '../position/clmm/list/LiquidityValueBlock'

type ExpendItemProps = {
  positionInfo: any
  apiInfo: any
}

export function ExpendItem({ positionInfo, apiInfo }: ExpendItemProps) {
  const { farmsPosRewardsData, posPoolsRelatedData, posPoolsOriginalData } = usePositionStore()
  const { getPositionBaseList, getPosRelatedData } = usePositionList()
  const { currentAccount } = useAccountStore()
  const { isApp } = useWindowWidth()

  const posFarmsData = farmsPosRewardsData[positionInfo?.id]
  const totalRewards = posFarmsData?.reduce((sum: number, item: any) => d(sum).add(item.display_amount_owed).toString(), 0)
  // const currentPosPoolsRelatedData = posPoolsRelatedData[positionInfo?.posId]
  // const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'
  const { getPosIsActive } = usePosHelper()
  const isActive = useMemo(() => {
    return getPosIsActive(positionInfo as PosBaseInfo, posPoolsOriginalData?.[positionInfo?.clmmPool || '']?.current_sqrt_price)
  }, [positionInfo, posPoolsOriginalData])
  const { getClmmPosName } = usePosHelper()
  const tokenName = useMemo(() => {
    if (positionInfo?.tokenName) {
      return positionInfo?.tokenName
    } else {
      const position_index = posPoolsOriginalData?.[positionInfo?.clmmPool]?.index
      return getClmmPosName(positionInfo?.index, position_index)
    }
  }, [positionInfo?.tokenName, positionInfo?.index, positionInfo?.clmmPool, posPoolsOriginalData])

  const navigate = useNavigate()
  const getPositionList = () => {
    setTimeout(async () => {
      await getPositionBaseList(currentAccount?.address)
    }, 2000)
  }

  const { toStakePos, toUnStakePos, toClaimPos, unstakeLoading, claimLoading } = useFarmsActions()

  const toStake = async (events: any) => {
    console.log('🚀 ~ toStake ~ apiInfo:', apiInfo)
    toStakePos(positionInfo, apiInfo?.farmsPoolAddress, tokenName, getPositionList)
  }

  const toUnstack = async () => {
    toUnStakePos(positionInfo?.id, positionInfo?.farmsPool, tokenName, getPositionList)
  }
  const toClaim = async () => {
    toClaimPos(positionInfo?.id, positionInfo?.farmsPool, getPositionList)
  }
  // 计算仓位的farms奖励数量 来判断是否展示
  // 如果总的farms奖励数量大于0 并且farms奖励列表>0 用farms奖励列表做循环展示数量
  // 否则 用api接口返回来的释放速率大于0的奖励列表做循环 数量写死为0
  // 要求：释放速率为0的奖励不展示 （api接口有过滤 但是posFarmsData用sdk请求回来的没有屏蔽释放速率为0的奖励）
  const totalAmount = useMemo(() => {
    if (posFarmsData?.length > 0) {
      return posFarmsData.reduce((sum: any, rewardData: PosReward) => {
        return d(sum).plus(rewardData?.display_amount_owed).toString()
      }, '0')
    }
    return '0'
  }, [posFarmsData, currentAccount?.address, claimLoading, unstakeLoading])

  const isCanStake = useMemo(() => {
    if (positionInfo && apiInfo) {
      return positionInfo.posType == 'clmm' && apiInfo.haveFarming === true
    }
    return false
  }, [positionInfo?.posType, apiInfo?.haveFarming])

  return (
    <HStack
      bg="bg_primary"
      w="100%"
      gap="16px"
      borderRadius={{ base: '12px', lg: '20px' }}
      border={{ base: 'none', lg: '1px solid' }}
      borderColor="border !important"
      p={{ base: '8px', lg: '12px' }}
      justifyContent="space-between"
      flexDirection={{ base: 'column', lg: 'row' }}
    >
      <PriceRange
        positionInfo={positionInfo}
        symbolEllipsesDecimals={10}
        labelInfo={{ text: tokenName, style: { color: 'text_caption', mb: '-2px' } }}
        children={
          <HStack
            justify="center"
            h={{ base: '14px', lg: '20px' }}
            borderRadius="4px"
            p="0px"
            mb={{ base: '0', lg: '-2px' }}
            cursor="pointer"
            onClick={e => {
              cancelBubble(e)
              navigate(`/position-detail/${positionInfo?.id}`)
            }}
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
            <Text fontSize="12px" color="primary">
              Manage position
            </Text>
            <Icon
              ml="-8px"
              svgW="12px"
              svgH="12px"
              xlinkHref="#icon-icon_arrow"
              variant="gray"
              transition="transform 0.5s"
              transform="rotate(-90deg)"
            />
          </HStack>
        }
      />
      <HStack w={{ base: '100%', lg: 'unset' }} gap={{ base: '8px', lg: '40px' }} flexDirection={{ base: 'column', lg: 'row' }}>
        <VStack w={{ base: '100%', lg: 'unset' }} align="flex-start" justify="space-between" gap="4px" flexDirection={{ base: 'row', lg: 'column' }}>
          <Text color="primary_gray" mb="-12px" mt="12px">
            Liquidity
          </Text>
          <LiquidityValueBlock positionInfo={positionInfo} fontSize="14px" />
        </VStack>
        <VStack
          justify="space-between"
          w={{ base: '100%', lg: 'unset' }}
          minW={{ base: '100%', lg: '180px' }}
          align="flex-end"
          gap="4px"
          flexDirection={{ base: 'row', lg: 'column' }}
        >
          <HStack gap="4px">
            <Text color="primary_gray">Earnings</Text>
            {!isApp && (
              <Button
                isLoading={claimLoading}
                isDisabled={unstakeLoading || claimLoading || d(totalRewards).eq(0)}
                onClick={unstakeLoading || claimLoading || d(totalRewards).eq(0) ? () => {} : toClaim}
                h="20px"
                w="48px"
                fontSize="12px"
                borderRadius="4px"
                variant="outline"
              >
                Claim
              </Button>
            )}
          </HStack>
          <HStack>
            <Skeleton isLoaded={!!totalAmount}>
              <VStack align="flex-end">
                {posFarmsData && posFarmsData?.length > 0 && d(totalAmount).gt(0) ? (
                  posFarmsData?.map((item: any) => {
                    console.log(
                      '🚀 ~ ExpendItem ~ posFarmsData && posFarmsData?.length > 0 && d(totalAmount).gt(0) :',
                      posFarmsData,
                      posFarmsData?.length > 0,
                      totalAmount,
                      d(totalAmount).gt(0)
                    )
                    return (
                      <React.Fragment key={item?.rewarder_type}>
                        {d(item?.display_amount_owed).gt(0) && (
                          <RewardsCoin
                            key={item?.coinType}
                            coinType={item?.token?.coin_type}
                            amount={item?.display_amount_owed || 0}
                            tokenInfo={item?.token}
                          />
                        )}
                      </React.Fragment>
                    )
                  })
                ) : apiInfo?.farmsRewarderList?.length > 0 ? (
                  apiInfo?.farmsRewarderList?.map((item: any) => {
                    console.log('🚀 ~ apiInfo?.farmsRewarderList?.map ~ item:', item)
                    return <RewardsCoin key={item?.coinType} coinType={item?.coinType} amount="0" />
                  })
                ) : (
                  <Text textColor="text_caption" textAlign="right">
                    --
                  </Text>
                )}
              </VStack>
            </Skeleton>
            {isApp && (
              <Button
                isLoading={claimLoading}
                isDisabled={unstakeLoading || claimLoading || d(totalRewards).eq(0)}
                onClick={unstakeLoading || claimLoading || d(totalRewards).eq(0) ? () => {} : toClaim}
                h="20px"
                w="48px"
                fontSize="12px"
                borderRadius="4px"
                variant="outline"
              >
                Claim
              </Button>
            )}
          </HStack>
        </VStack>
        <VStack mt={{ base: '8px', lg: '0' }} w={{ base: '100%', lg: 'unset' }}>
          {positionInfo?.posType == 'farms' && (
            <Button
              isDisabled={unstakeLoading}
              isLoading={unstakeLoading}
              variant="outline"
              w={{ base: '100%', lg: '100px' }}
              h="32px"
              borderRadius="8px"
              fontSize="14px"
              onClick={toUnstack}
            >
              Unstake
            </Button>
          )}
          {isCanStake && !isActive && (
            <CetusTooltip
              placement="top"
              tooltip={
                <Text fontSize="12px" lineHeight="20px" w="200px">
                  Farming rewards are only available for active positions.
                </Text>
              }
            >
              <Button isDisabled={true} borderRadius="8px" w={{ base: 'calc(100vw - 68px)', lg: '100px' }} h="32px" fontSize="14px">
                Stake
              </Button>
            </CetusTooltip>
          )}
          {isCanStake && isActive && (
            <Button
              isDisabled={unstakeLoading}
              isLoading={unstakeLoading}
              w={{ base: '100%', lg: '100px' }}
              h="32px"
              borderRadius="8px"
              fontSize="14px"
              onClick={toStake}
            >
              Stake
            </Button>
          )}
        </VStack>
      </HStack>
    </HStack>
  )
}

export const RewardsCoin = ({
  coinType,
  amount,
  tokenInfo,
  boxStyle,
  textAlign = 'right'
}: {
  coinType: string
  amount: string
  tokenInfo?: any
  boxStyle?: any
  textAlign?: 'right' | 'left' | 'center'
}) => {
  const { tokenInfo: token } = useGetToken<CoinType>(coinType as CoinType)

  return (
    <HStack {...boxStyle}>
      <SingleTokenInfo
        token={tokenInfo || token}
        coinType={coinType}
        imgBoxStyle={{ w: '20px', h: '20px' }}
        warningIcon={{ iconW: '10px', iconH: '10px' }}
        haveName={false}
        haveSymbol={false}
      />
      <Text textColor="text_caption" textAlign={textAlign}>
        {amount} {tokenInfo?.symbol || token?.symbol}
      </Text>
    </HStack>
  )
}
