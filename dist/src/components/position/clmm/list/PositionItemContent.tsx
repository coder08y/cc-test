import { FarmingImage } from '@/components/common/FarmingIcon'
import { MiningImage } from '@/components/common/MiningIcon'
import StatusPosition from '@/components/position/common/StatusPosition'
import PositionPriceBar from '@/components/position/list/PositionPriceRangeBar'
import HiddenDotted from '@/components/profile/HiddenDotted'
import useClaimPosition from '@/hooks/position/useClaimPosition'
import usePosHelper from '@/hooks/position/usePosHelper'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { PosBaseInfo, showNewVersionApr } from '@/types'
import { AddressCopyLink, Block, CetusTooltip, TooltipIcon } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import CoinPairImage from '@cetus/ui-kit/src/components/CoinPairImage'
import { cancelBubble, d, formatSmallPrice, isAvailableObject, removeComma } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DailyEarnBlock from '../../list/DailyEarnBlock'
import PendingYieldBlock from '../../list/PendingYieldBlock'
import LiquidityValueBlock from './LiquidityValueBlock'
import PendingFeesBlock from './PendingFeesBlock'
import PendingRewardsBlock from './PendingRewardsBlock'
import PositionPriceRange from './PositionPriceRange'

function CLMMPositionItemContent({
  positionInfo,
  positionItemWidth = [],
  priceDirect,
  showMiningIcon,
  showFarmingIcon,
  isLoading = false
}: {
  positionInfo: PosBaseInfo
  positionItemWidth?: string[]
  priceDirect?: boolean
  showMiningIcon?: boolean
  showFarmingIcon?: boolean
  isLoading?: boolean
}) {
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  const { getClmmPosName } = usePosHelper()
  const navigate = useNavigate()
  const { setCurrentPosDetailTab } = usePositionDetailStore()
  const {
    setPosAprMap,
    posPoolsOriginalData,
    posPoolsRelatedData,
    posApiPoolData,
    poolRangeObj,
    posLiquidityData,
    posRewardsData,
    posFeeData,
    farmsPosRewardsData,
    posClmmDailyEarningsData,
    posClmmDailyEarningsDataLoading
  } = usePositionStore()

  const currentPosDailyEarnings = useMemo(() => {
    if (positionInfo?.posId) {
      return posClmmDailyEarningsData[positionInfo?.posId]
    }
    return undefined
  }, [positionInfo?.posId, posClmmDailyEarningsData])

  const tokenName = useMemo(() => {
    if (positionInfo?.tokenName) {
      return positionInfo?.tokenName
    } else {
      const position_index = posPoolsOriginalData?.[positionInfo?.clmmPool]?.index
      return getClmmPosName(Number(positionInfo?.index), position_index)
    }
  }, [positionInfo?.tokenName, positionInfo?.index, positionInfo?.clmmPool, posPoolsOriginalData])

  const clickDetail = (posTab?: 'remove' | 'increase') => {
    console.log('🚀 ~ PoolItem ~ poolInfo:', positionInfo)
    if (posTab) {
      setCurrentPosDetailTab(posTab)
      navigate(`/position-detail/${positionInfo?.id}/${posTab}`)
    } else {
      navigate(`/position-detail/${positionInfo?.id}`)
    }
  }

  const [isShowAction, setIsShowAction] = useState(false)

  const { getTokenAmountValue } = useTokenPrice()
  const currentPosLiquidity = posLiquidityData[positionInfo?.posId as string]
  const amountValueA = getTokenAmountValue(positionInfo?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
  const amountValueB = getTokenAmountValue(positionInfo?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)
  const currentPosTvl = useMemo(() => {
    return d(amountValueA).plus(amountValueB).toString()
  }, [amountValueA, amountValueB])

  // const { getPositionApr } = usePositionApr()
  // const positionApr = useMemo(() => {
  //   if (isAvailableObject(currentPosPoolsRelatedData) && isAvailableObject(posPoolInfo) && isAvailableObject(poolRangeObj)) {
  //     const currentRangeObj = poolRangeObj[positionInfo?.clmmPool]
  //     if (currentRangeObj) {
  //       const ranges = currentRangeObj?.ranges.reduce((acc: any, item: any) => {
  //         acc[item.dateType] = item
  //         return acc
  //       }, {})
  //       if (positionInfo?.posType !== 'farms') {
  //         return getPositionApr(posPoolInfo, currentPosPoolsRelatedData, 'month', ranges['month'])
  //       }
  //       return getPositionApr(posPoolInfo, currentPosPoolsRelatedData, 'month', ranges['month'], true, currentPosTvl)
  //     }
  //   }
  // }, [currentPosPoolsRelatedData, posPoolInfo, positionInfo, poolRangeObj, currentPosTvl])
  // console.log('🚀🚀🚀 ~ PositionItemContent.tsx:91 ~ positionApr ~ positionApr:', positionApr)

  const { toClaimPosition, isClaimLoading } = useClaimPosition()
  const toClaim = () => {
    toClaimPosition(positionInfo, null, true)
  }

  const [fees, setFees] = useState(null)
  const [rewards, setRewards] = useState(null)
  const { getPosIsActive } = usePosHelper()
  // // const isActive = currentPosPoolsRelatedData?.currentStatus == 'Active'
  const isActive = useMemo(() => {
    return getPosIsActive(positionInfo as PosBaseInfo, posPoolsOriginalData?.[positionInfo?.clmmPool || '']?.current_sqrt_price)
  }, [positionInfo, posPoolsOriginalData])

  const currentPosData = posFeeData[positionInfo?.id] || posFeeData[positionInfo?.posId]
  const currentPosRewardData = posRewardsData[positionInfo?.id] || posRewardsData[positionInfo?.posId]
  const currentPosFarmsData = farmsPosRewardsData[positionInfo?.id]

  const claimBtnDisabled = useMemo(() => {
    // console.log('🚀 ~  rewards, fees:', {
    //   isClaimLoading,
    //   showMiningIcon,
    //   showFarmingIcon,
    //   clmmPool: positionInfo?.clmmPool,
    //   fees,
    //   rewards,
    //   id: positionInfo,
    //   currentPosRewardData,
    //   posRewardsData,
    //   farmsPosRewardsData
    // })
    return (
      isClaimLoading ||
      ((!currentPosData || (d(currentPosData?.feeOwedA).eq(0) && d(currentPosData?.feeOwedB).eq(0))) &&
        (!currentPosFarmsData || currentPosFarmsData?.every((item: any) => d(item?.display_amount_owed).eq(0))) &&
        (!currentPosRewardData ||
          currentPosRewardData?.every((item: any) => d(item?.display_amount_owed).eq(0)) ||
          ((fees == '$0' || !fees) && (rewards == '$0' || !rewards || (!showMiningIcon && !showFarmingIcon)))))
    )
  }, [isClaimLoading, fees, rewards, showMiningIcon, showFarmingIcon, currentPosRewardData])

  const currentPosPoolsRelatedData = posPoolsRelatedData[positionInfo?.posId]
  const minPrice = useMemo(() => {
    return currentPosPoolsRelatedData?.minPriceOrigin
  }, [currentPosPoolsRelatedData])

  const maxPrice = useMemo(() => {
    return currentPosPoolsRelatedData?.maxPriceOrigin
  }, [currentPosPoolsRelatedData])

  const currPrice = useMemo(() => {
    return currentPosPoolsRelatedData?.currentPriceOrigin
  }, [currentPosPoolsRelatedData])

  const priceRangeText = priceDirect
    ? `${isNaN(Number(currentPosPoolsRelatedData?.minPrice)) ? currentPosPoolsRelatedData?.minPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPrice))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPrice)) ? currentPosPoolsRelatedData?.maxPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPrice))}`
    : `${isNaN(Number(currentPosPoolsRelatedData?.minPriceResever)) ? currentPosPoolsRelatedData?.minPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPriceResever))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPriceResever)) ? currentPosPoolsRelatedData?.maxPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPriceResever))}`

  // 移动端布局
  if (isApp) {
    return (
      <Block
        w="100%"
        bg="transparent"
        border="none"
        p="0"
        borderRadius="0"
        onClick={(e: any) => {
          cancelBubble(e)
          clickDetail()
        }}
        cursor="pointer"
      >
        <VStack w="100%" align="flex-start" gap="12px">
          {/* Pool Name and Address */}
          <HStack w="100%" justify="space-between" align="center">
            <HStack gap="4px">
              <CoinPairImage
                coinACoinType={positionInfo?.displayTokenA?.coin_type}
                coinBCoinType={positionInfo?.displayTokenB?.coin_type}
                coinAIconUrl={positionInfo?.displayTokenA?.logo_url}
                coinBIconUrl={positionInfo?.displayTokenB?.logo_url}
                imgBoxStyle={{ w: '20px', h: '20px' }}
                showTagHeight="10px"
                showTagWidth="10px"
                ml="-8px"
              />
              <Skeleton isLoaded={!isLoading && !!tokenName} h="30px">
                <VStack align="flex-start" gap="0">
                  <Text h="16px" color="text_caption" fontSize="12px" fontWeight="500">
                    {isLoading ? '--' : tokenName?.split('|')[1]}
                  </Text>

                  <AddressCopyLink
                    color="text_paragraph"
                    address={positionInfo?.id}
                    showLink={false}
                    fontSize="10px"
                    wrapStyle={{ gap: '4px', h: '14px' }}
                    onClickLink={() => {
                      window.open(getExplorerUrl(positionInfo?.id, 'nftAddress'), '_blank')
                    }}
                  />
                </VStack>
              </Skeleton>
            </HStack>
            {/* Price Range with Slider */}
            <VStack align="flex-start" gap="8px">
              <HStack gap="8px">
                <Skeleton isLoaded={!isLoading && !!currentPosPoolsRelatedData?.currentPrice}>
                  <PositionPriceBar minPrice={minPrice} maxPrice={maxPrice} currPrice={currPrice} isActive={isActive} priceDirect={priceDirect} />
                </Skeleton>
                <StatusPosition
                  isActive={isActive}
                  w="47px !important"
                  minW="47px !important"
                  bg="primary_opacity.10"
                  h="20px"
                  p="0"
                  borderRadius="10px"
                  sx={{
                    '& img': {
                      display: 'none'
                    },
                    '& p': {
                      fontSize: '10px'
                    }
                  }}
                  isLoading={
                    isLoading || !isAvailableObject(positionInfo) || !isAvailableObject(posPoolsOriginalData?.[positionInfo?.clmmPool || ''])
                  }
                />
              </HStack>
            </VStack>
          </HStack>

          {/* Two Column Layout */}
          <VStack w="100%" justify="space-between" gap="16px">
            {/* Left Column */}
            <HStack flex="1" align="flex-start" w="100%" gap="12px">
              <VStack w="100%" justify="flex-start" align="flex-start" gap="2px">
                <Text color="primary_gray" fontSize="10px" h="14px" lineHeight="14px">
                  Liquidity
                </Text>
                <Skeleton isLoaded={!isLoading}>
                  <LiquidityValueBlock h="16px" lineHeight="16px" p="0" positionInfo={positionInfo} fontSize="12px" isPosList />
                </Skeleton>
              </VStack>
              <VStack w="100%" justify="space-between" align="flex-end" gap="2px">
                <Text color="primary_gray" fontSize="10px" h="14px" lineHeight="14px">
                  Price Range
                </Text>
                <Skeleton
                  isLoaded={!isLoading && !!currentPosPoolsRelatedData?.minPrice && !!currentPosPoolsRelatedData?.maxPrice}
                  borderRadius="4px"
                >
                  <Text h="16px" lineHeight="16px" fontSize="12px" color="text_caption" whiteSpace="nowrap">
                    {priceRangeText || '--'}
                  </Text>
                </Skeleton>
              </VStack>
            </HStack>

            {/* Right Column */}
            <HStack flex="1" align="flex-start" gap="12px" w="100%">
              {showNewVersionApr && (
                <VStack flex={1} w="100%" justify="space-between" align="flex-start" gap="2px">
                  <Text color="primary_gray" fontSize="10px">
                    Claimable Yield
                  </Text>
                  <Skeleton isLoaded={!isLoading}>
                    <PendingYieldBlock positionInfo={positionInfo} hasRewards={showMiningIcon || showFarmingIcon || false} />
                  </Skeleton>
                </VStack>
              )}
              {showNewVersionApr && (
                <VStack justify="space-between" align="flex-start" gap="4px">
                  <HStack gap="0px" height="10px">
                    <Text color="primary_gray" fontSize="10px">
                      APR
                    </Text>
                    <TooltipIcon
                      sx={{ '& svg': { width: '14px', height: '14px' } }}
                      tooltipCon={
                        <span>
                          APR based on the past 24h historical trade fees and emissions. Only positions in range earn yield. Past performance is not
                          indicative of future results. <br />
                          Calculations are an estimate and only for reference.
                        </span>
                      }
                    />
                  </HStack>
                  <Skeleton isLoaded={!isLoading && !posClmmDailyEarningsDataLoading} h="14px" lineHeight="14px">
                    <Text color="text_caption" fontSize="12px">
                      {isActive ? currentPosDailyEarnings?.aprDisplay || '--' : '0%'}
                    </Text>
                  </Skeleton>
                </VStack>
              )}
              {showNewVersionApr && (
                <VStack flex={1} w="100%" justify="space-between" align="flex-end" gap="6px">
                  <Text color="primary_gray" fontSize="10px">
                    Est. Daily Yield
                  </Text>
                  <Skeleton isLoaded={!isLoading && !posClmmDailyEarningsDataLoading} h="14px">
                    <DailyEarnBlock
                      sx={{ '& p': { fontSize: '12px' } }}
                      positionInfo={positionInfo}
                      dailyEarnUSD={isActive ? currentPosDailyEarnings?.dailyEarnUSDDisplay || '--' : '$0'}
                      dailyEarnOriginResult={isActive ? currentPosDailyEarnings?.originResult || '--' : null}
                      hasRewards={showMiningIcon || showFarmingIcon || false}
                    />
                  </Skeleton>
                </VStack>
              )}
            </HStack>
          </VStack>

          {/* Action Buttons */}
          {positionInfo?.posType !== 'burn' && (
            <HStack w="100%" gap="8px">
              <Button
                flex="1"
                variant="outline"
                fontSize="12px"
                bg="primary_opacity.10"
                border="none"
                h="32px"
                borderRadius="8px"
                onClick={(e: any) => {
                  cancelBubble(e)
                  clickDetail('remove')
                }}
              >
                <Text color="primary" fontSize="12px">
                  Remove
                </Text>
              </Button>
              <Button
                flex="1"
                variant="outline"
                fontSize="12px"
                bg="primary_opacity.10"
                h="32px"
                borderRadius="8px"
                border="none"
                onClick={(e: any) => {
                  cancelBubble(e)
                  clickDetail('increase')
                }}
              >
                <Text color="primary" fontSize="12px">
                  Add
                </Text>
              </Button>
            </HStack>
          )}
        </VStack>
      </Block>
    )
  }

  // 桌面端布局
  return (
    <Block
      onMouseEnter={() => {
        setTimeout(() => {
          setIsShowAction(true)
        }, 40)
      }}
      onMouseLeave={() => {
        setTimeout(() => {
          setIsShowAction(false)
        }, 80)
      }}
      w="100%"
      bg="position_bg"
      border="none"
      p={{ base: '16px 8px 12px', lg: '20px 16px ' }}
      borderRadius="16px"
      onClick={(e: any) => {
        cancelBubble(e)
        clickDetail()
      }}
      cursor="pointer"
    >
      <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
        <VStack w="100%" align="flex-start" gap="14px">
          {isApp && (
            <HStack flexDirection={{ base: 'column', lg: 'row' }} w={{ base: '100%', lg: 'unset' }} gap="12px">
              <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
                <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
                  NFT ID
                </Text>
                <Skeleton isLoaded={!isLoading && !!tokenName}>
                  <Text fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                    {isLoading ? '--' : tokenName?.split('|')[1]}
                  </Text>
                </Skeleton>
              </HStack>
              <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
                <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }} ml={{ base: '0', lg: '8px' }}>
                  Position Address
                </Text>
                <Box h="14px">
                  <Skeleton isLoaded={!isLoading}>
                    <AddressCopyLink
                      fontWeight="500"
                      color="text_caption"
                      address={positionInfo?.id}
                      showLink={false}
                      fontSize={{ base: '14px', lg: '12px' }}
                      onClickLink={() => {
                        window.open(getExplorerUrl(positionInfo?.id, 'nftAddress'), '_blank')
                      }}
                    />
                  </Skeleton>
                </Box>
              </HStack>
            </HStack>
          )}
          <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '14px', lg: '8px' }}>
            <HStack
              minW={{ base: 'unset', lg: positionItemWidth[0] }}
              w={{ base: '100%', lg: positionItemWidth[0] }}
              justify={{ base: 'space-between', lg: 'flex-end' }}
            >
              {isApp && (
                <Text color="primary_gray" whiteSpace="nowrap">
                  Price Range
                </Text>
              )}
              <PositionPriceRange positionInfo={positionInfo} tokenName={tokenName} priceDirect={priceDirect} isShowIcon={isShowAction} />
            </HStack>
            {
              <HStack w={{ base: '100%', lg: positionItemWidth[1] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && showNewVersionApr && (
                  <HStack gap="2px">
                    <Text color="primary_gray">APR</Text>
                    <Box h="14px" mt="-6px">
                      <TooltipIcon
                        tooltipCon={
                          <span>
                            APR based on the past 24h historical trade fees and emissions. Only positions in range earn yield. Past performance is not
                            indicative of future results. <br />
                            Calculations are an estimate and only for reference.
                          </span>
                        }
                      />
                    </Box>
                  </HStack>
                )}
                {showNewVersionApr && (
                  <Skeleton isLoaded={!isLoading && !posClmmDailyEarningsDataLoading} h="14px">
                    <Text color="text_caption">{isActive ? currentPosDailyEarnings?.aprDisplay || '--' : '0%'}</Text>
                  </Skeleton>
                )}
              </HStack>
            }
            <HStack m="-12px 0" w={{ base: '100%', lg: positionItemWidth[2] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
              {isApp && <Text color="primary_gray">Liquidity</Text>}
              <HiddenDotted>
                <LiquidityValueBlock positionInfo={positionInfo} fontSize="14px" isPosList />
              </HiddenDotted>
            </HStack>

            {showNewVersionApr && (
              <HStack w={{ base: '100%', lg: positionItemWidth[3] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && <Text color="primary_gray">Claimable Yield</Text>}
                <PendingYieldBlock positionInfo={positionInfo} hasRewards={showMiningIcon || showFarmingIcon || false} />
              </HStack>
            )}
            {showNewVersionApr && (
              <HStack w={{ base: '100%', lg: positionItemWidth[4] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && <Text color="primary_gray">Est. Daily Yield</Text>}
                <Skeleton isLoaded={!isLoading && !posClmmDailyEarningsDataLoading} h="14px">
                  <DailyEarnBlock
                    positionInfo={positionInfo}
                    dailyEarnUSD={isActive ? currentPosDailyEarnings?.dailyEarnUSDDisplay || '--' : '$0'}
                    dailyEarnOriginResult={isActive ? currentPosDailyEarnings?.originResult || '--' : null}
                    hasRewards={showMiningIcon || showFarmingIcon || false}
                  />
                </Skeleton>
              </HStack>
            )}
            {!showNewVersionApr && (
              <HStack m="-12px 0" w={{ base: '100%', lg: positionItemWidth[3] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && <Text color="primary_gray">Pending Fees</Text>}
                <HiddenDotted>
                  <PendingFeesBlock positionInfo={positionInfo} onFeesChange={setFees} />
                </HiddenDotted>
              </HStack>
            )}

            {!showNewVersionApr && (showMiningIcon || showFarmingIcon) && (
              <HStack m="-12px 0" w={{ base: '100%', lg: positionItemWidth[4] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && <Text color="primary_gray">Pending Rewards</Text>}
                <HStack gap={{ base: '8px', lg: '12px' }}>
                  {isApp && showMiningIcon && <MiningImage />}
                  {isApp && showFarmingIcon && <FarmingImage />}
                  <HiddenDotted>
                    <PendingRewardsBlock positionInfo={positionInfo} onRewardsChange={setRewards} />
                  </HiddenDotted>
                </HStack>
              </HStack>
            )}
            <HStack
              w={{ base: '100%', lg: positionItemWidth[5] }}
              justify={{ base: 'space-between', lg: 'flex-start' }}
              flexDir={{ base: 'row', lg: 'row-reverse' }}
            >
              {positionInfo?.posType !== 'burn' && (
                <Box w={{ base: 'calc((100vw - 32px )/ 2)', lg: '32px' }} sx={{ button: { w: '100%' } }}>
                  <CetusTooltip
                    placement="top"
                    tooltip={
                      <Text fontSize="12px" lineHeight="20px" color="text_caption">
                        Add
                      </Text>
                    }
                    showTooltip={!isApp}
                  >
                    <Button
                      variant="outline"
                      fontSize="12px"
                      bg="primary_opacity.10"
                      h="32px"
                      borderRadius="8px"
                      onClick={(e: any) => {
                        cancelBubble(e)
                        clickDetail('increase')
                      }}
                    >
                      {!isApp && <Icon xlinkHref="#icon-a-icon_add1" svgFill="primary" svgHover="primary" fontSize="14px" />}
                      {isApp && (
                        <Text color="primary" fontSize="12px">
                          Add
                        </Text>
                      )}
                    </Button>
                  </CetusTooltip>
                </Box>
              )}
              {positionInfo?.posType !== 'burn' && (
                <Box w={{ base: 'calc((100vw - 32px )/ 2)', lg: '32px' }} sx={{ button: { w: '100%' } }}>
                  <CetusTooltip
                    placement="top"
                    tooltip={
                      <Text fontSize="12px" lineHeight="20px" color="text_caption">
                        Remove
                      </Text>
                    }
                    showTooltip={!isApp}
                  >
                    <Button
                      variant="outline"
                      fontSize="12px"
                      bg="primary_opacity.10"
                      h="32px"
                      borderRadius="8px"
                      onClick={(e: any) => {
                        cancelBubble(e)
                        clickDetail('remove')
                      }}
                    >
                      {!isApp && <Icon xlinkHref="#icon-tx_remove" svgFill="text_paragraph" svgHover="text_paragraph" fontSize="14px" />}
                      {isApp && (
                        <Text color="primary" fontSize="12px">
                          Remove
                        </Text>
                      )}
                    </Button>
                  </CetusTooltip>
                </Box>
              )}
              {/* <Button
                variant="outline"
                fontSize="12px"
                bg="primary_opacity.10"
                h="32px"
                w={{ base: positionInfo?.posType !== 'burn' ? 'calc((100vw - 32px )/ 3)' : '100%', lg: '110px' }}
                borderRadius="8px"
                onClick={e => {
                  cancelBubble(e)
                  toClaim()
                }}
                isLoading={isClaimLoading}
                isDisabled={claimBtnDisabled}
              >
                {!isApp && (
                  <Icon
                    xlinkHref="#icon-icon_claim"
                    svgFill={claimBtnDisabled ? 'primary_gray' : 'primary'}
                    svgHover={claimBtnDisabled ? 'primary_gray' : 'primary'}
                  />
                )}
                Claim Yield
              </Button> */}
            </HStack>
          </HStack>
          {/* 
          {isApp && (
            <Button
              w={{ base: '100%', lg: '32px' }}
              h={{ base: '32px', lg: '90px' }}
              borderRadius="8px"
              variant="ghost"
              p="0 !important"
              _hover={{
                svg: {
                  fill: 'text_caption'
                }
              }}
            >
              <Text color="primary_gray">Manage</Text>
              <Icon xlinkHref="#icon-icon_list_token" w="14px" h="14px" />
            </Button>
          )} */}
        </VStack>
      </HStack>
    </Block>
  )
}

export default CLMMPositionItemContent
