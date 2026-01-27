import { FarmingImage } from '@/components/common/FarmingIcon'
import { MiningImage } from '@/components/common/MiningIcon'
import StatusPosition from '@/components/position/common/StatusPosition'
import HiddenDotted from '@/components/profile/HiddenDotted'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { showNewVersionApr } from '@/types'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { AddressCopyLink, Block, CetusTooltip, TooltipIcon } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import CoinPairImage from '@cetus/ui-kit/src/components/CoinPairImage'
import { cancelBubble, d, formatSmallPrice, isAvailableObject, removeComma } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DailyEarnBlock from '../../list/DailyEarnBlock'
import PendingYieldBlock from '../../list/PendingYieldBlock'
import DLMMPendingFeesBlock from './DLMMPendingFeesBlock'
import DLMMPendingRewardsBlock from './DLMMPendingRewardsBlock'
import DLMMPositionPriceRange from './DLMMPositionPriceRange'
import DLMMLiquidityValueBlock from './LiquidityValueBlock'

function DLMMPositionItemContent({
  positionInfo,
  positionItemWidth = [],
  priceDirect,
  showMiningIcon,
  showFarmingIcon,
  isLoading = false
}: {
  positionInfo: DlmmPosBaseInfo
  positionItemWidth?: string[]
  priceDirect?: boolean
  showMiningIcon?: boolean
  showFarmingIcon?: boolean
  isLoading?: boolean
}) {
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  const navigate = useNavigate()
  const { setCurrentPosDetailTab } = useDlmmPosDetailStore()

  const {
    dlmmPosPoolsRelatedData,
    dlmmPosPoolsOriginalData,
    dlmmPosFeeData,
    dlmmPosRewardsData,
    dlmmPosLiquidityData,
    posDlmmDailyEarningsDataLoading,
    posDlmmDailyEarningsData
  } = useDlmmPositionStore()
  const currentPosPoolsRelatedData = dlmmPosPoolsRelatedData[positionInfo?.id]
  const tokenName = useMemo(() => positionInfo?.tokenName, [positionInfo?.tokenName])

  const clickDetail = (posTab?: 'remove' | 'increase') => {
    console.log('🚀 ~ PoolItem ~ poolInfo:', positionInfo, posTab)
    if (posTab) {
      setCurrentPosDetailTab(posTab)
    } else {
      setCurrentPosDetailTab('increase')
    }
    navigate(`/dlmm-position-detail/${positionInfo?.id}`)
  }

  const [isShowAction, setIsShowAction] = useState(false)

  const currentPosLiquidity = dlmmPosLiquidityData[positionInfo?.id as string]

  const currentPosDailyEarnings = useMemo(() => {
    if (positionInfo?.id) {
      return posDlmmDailyEarningsData[positionInfo?.id]
    }
    return undefined
  }, [positionInfo?.id, posDlmmDailyEarningsData])

  // const { getPositionApr } = usePositionApr()
  const isActive = currentPosPoolsRelatedData?.currentStatus === 'Active'

  // const { toClaimDlmmPosition, isClaimLoading } = useDlmmPosClaim()
  // const toClaim = () => {
  //   toClaimDlmmPosition(positionInfo)
  // }

  const [fees, setFees] = useState(null)
  const [rewards, setRewards] = useState(null)
  // const currentPosData = dlmmPosFeeData[positionInfo?.id]
  // const currentPosRewardData = dlmmPosRewardsData[positionInfo?.id]
  // const claimBtnDisabled = useMemo(() => {
  //   console.log('🚀 ~ dlmm,  rewards, fees:', isClaimLoading, currentPosRewardData, showMiningIcon, showFarmingIcon, fees, rewards, positionInfo?.id)
  //   return (
  //     isClaimLoading ||
  //     ((!currentPosData || (d(currentPosData?.feeOwedA).eq(0) && d(currentPosData?.feeOwedB).eq(0))) &&
  //       (!currentPosRewardData || currentPosRewardData?.every(item => d(item?.display_amount_owed).eq(0)) || (!showMiningIcon && !showFarmingIcon)))
  //   )
  // }, [isClaimLoading, currentPosData, rewards, showMiningIcon, showFarmingIcon, currentPosRewardData])

  const minPrice = useMemo(() => {
    return removeComma(priceDirect ? (currentPosPoolsRelatedData?.minPrice ?? '0') : (currentPosPoolsRelatedData?.minPriceResever ?? '0'))
  }, [currentPosPoolsRelatedData, priceDirect])

  const maxPrice = useMemo(() => {
    return removeComma(priceDirect ? (currentPosPoolsRelatedData?.maxPrice ?? '0') : (currentPosPoolsRelatedData?.maxPriceResever ?? '0'))
  }, [currentPosPoolsRelatedData, priceDirect])

  const currPrice = useMemo(() => {
    return removeComma(priceDirect ? (currentPosPoolsRelatedData?.currentPrice ?? '0') : (currentPosPoolsRelatedData?.currentPriceReverse ?? '0'))
  }, [currentPosPoolsRelatedData, priceDirect])

  const priceRangeText = priceDirect
    ? `${isNaN(Number(currentPosPoolsRelatedData?.minPrice)) ? currentPosPoolsRelatedData?.minPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPrice))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPrice)) ? currentPosPoolsRelatedData?.maxPrice : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPrice))}`
    : `${isNaN(Number(currentPosPoolsRelatedData?.minPriceResever)) ? currentPosPoolsRelatedData?.minPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.minPriceResever))} - ${isNaN(Number(currentPosPoolsRelatedData?.maxPriceResever)) ? currentPosPoolsRelatedData?.maxPriceResever : formatSmallPrice(removeComma(currentPosPoolsRelatedData?.maxPriceResever))}`

  const sliderML = useMemo(() => {
    if (maxPrice === '∞') return '0px'
    if (currPrice && minPrice && maxPrice) {
      if (d(currPrice).lt(maxPrice) && d(currPrice).gt(minPrice)) {
        const relativePosition = d(currPrice)
          .sub(minPrice)
          .div(d(maxPrice).sub(d(minPrice)))
          .toString()

        return `${d(relativePosition).mul(100).toFixed(2)}%`
      }
      if (d(minPrice).eq(maxPrice) && d(minPrice).eq(currPrice)) {
        return '50%'
      }
      if (d(currPrice).lt(minPrice)) {
        return '-6px'
      }
      if (d(currPrice).gt(maxPrice)) {
        return 'calc(100% + 6px)'
      }
      if (d(currPrice).eq(minPrice) && d(currPrice).lt(maxPrice)) {
        return '0px'
      }
      if (d(currPrice).eq(maxPrice) && d(currPrice).gt(minPrice)) {
        return 'calc(100% - 1px)'
      }
    }
    return '0px'
  }, [currPrice, minPrice, maxPrice, currentPosPoolsRelatedData])

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
                  <Text h="16px" lineHeight="16px" color="text_caption" fontSize="12px" fontWeight="500">
                    {isLoading ? '--' : tokenName?.split('|')[1] || tokenName || '--'}
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
                <Skeleton isLoaded={!isLoading && !!currentPosPoolsRelatedData?.currentPrice} borderRadius="4px">
                  <Box w="88px" h="6px" bgImage={maxPrice === '∞' ? 'none' : "url('/images/img_inactive_bg@2x.png')"} bgSize="88px 6px">
                    <Box
                      w={maxPrice === '∞' ? '88px' : '56px'}
                      h={maxPrice === '∞' ? '2px' : '6px'}
                      position="relative"
                      background={
                        maxPrice === '∞' ? 'linear-gradient(135deg, #68FFD8 0%, #0091FF 100%)' : isActive ? "url('/images/img_range@2x.png')" : 'none'
                      }
                      ml={maxPrice === '∞' ? '0px' : '16px'}
                      bgSize="100% 6px"
                      bgPosition="center"
                      bgRepeat="no-repeat"
                    >
                      {maxPrice !== '∞' && (
                        <Box
                          w="2px"
                          h="8px"
                          bg="#fff"
                          borderRadius="8px"
                          position="absolute"
                          top="50%"
                          left={sliderML}
                          transform="translateY(-50%)"
                          zIndex="5"
                        />
                      )}
                    </Box>
                  </Box>
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
                    isLoading || !isAvailableObject(positionInfo) || !isAvailableObject(dlmmPosPoolsOriginalData?.[positionInfo?.dlmmPool || ''])
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
                  <DLMMLiquidityValueBlock p="0" positionInfo={positionInfo} fontSize="12px" isPosList />
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
                      tooltipCon={
                        <span>
                          APR based on the past 24h historical trade fees and emissions. Only positions in range earn yield. Past performance is not
                          indicative of future results. <br />
                          Calculations are an estimate and only for reference.
                        </span>
                      }
                      sx={{ '& svg': { width: '14px', height: '14px' } }}
                    />
                  </HStack>
                  <Skeleton isLoaded={!isLoading && !posDlmmDailyEarningsDataLoading} h="14px" lineHeight="14px">
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
                  <Skeleton isLoaded={!isLoading && !posDlmmDailyEarningsDataLoading} h="14px">
                    <DailyEarnBlock
                      sx={{ '& p': { fontSize: '12px' } }}
                      positionInfo={positionInfo as any}
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
          {positionInfo?.posType === 'dlmm' && (
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
      onClick={() => clickDetail()}
      cursor="pointer"
    >
      <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
        <VStack w="100%" align="flex-start" gap="12px">
          {isApp && (
            <HStack flexDirection={{ base: 'column', lg: 'row' }} w={{ base: '100%', lg: 'unset' }}>
              <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
                <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }}>
                  Position ID
                </Text>
                <Skeleton isLoaded={!!tokenName}>
                  <Text fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                    {tokenName}
                  </Text>
                </Skeleton>
              </HStack>
              <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
                <Text color="primary_gray" fontSize={{ base: '14px', lg: '12px' }} ml={{ base: '0', lg: '8px' }}>
                  Position Address
                </Text>
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
              </HStack>
            </HStack>
          )}
          <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '12px', lg: '8px' }}>
            <HStack w={{ base: '100%', lg: positionItemWidth[0] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
              {isApp && (
                <Text color="primary_gray" whiteSpace="nowrap">
                  Price Range
                </Text>
              )}
              <DLMMPositionPriceRange positionInfo={positionInfo} tokenName={tokenName} priceDirect={priceDirect} isShowIcon={isShowAction} />
            </HStack>
            {
              <HStack w={{ base: '100%', lg: positionItemWidth[1] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && showNewVersionApr && (
                  <HStack gap="2px">
                    <Text color="primary_gray">APR</Text>
                    <TooltipIcon
                      tooltipCon={
                        <span>
                          APR based on the past 24h historical trade fees and emissions. Only positions in range earn yield. Past performance is not
                          indicative of future results. <br />
                          Calculations are an estimate and only for reference.
                        </span>
                      }
                    />
                  </HStack>
                )}
                {/* {showNewVersionApr && (
                  <PositionAprBlock
                    poolInfo={posPoolInfo}
                    isActive={isActive}
                    showFarmingApr={positionInfo?.posType == 'farms'}
                    positionApr={positionApr}
                    farmingAprDisplay={positionApr?.farmingAprDisplay}
                    totalAprDisplay={positionApr?.displayAprPercentageTotal}
                  />
                )} */}

                {showNewVersionApr && (
                  <Skeleton isLoaded={!posDlmmDailyEarningsDataLoading && currentPosLiquidity !== undefined} h="14px">
                    <Text color="text_caption">{isActive ? currentPosDailyEarnings?.aprDisplay : '0%'}</Text>
                  </Skeleton>
                )}
              </HStack>
            }

            <HStack m="-12px 0" w={{ base: '100%', lg: positionItemWidth[2] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
              {isApp && <Text color="primary_gray">Liquidity</Text>}
              <HiddenDotted>
                <DLMMLiquidityValueBlock positionInfo={positionInfo} fontSize="14px" isPosList />
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
                <Skeleton isLoaded={!posDlmmDailyEarningsDataLoading && currentPosLiquidity !== undefined} h="14px">
                  <DailyEarnBlock
                    positionInfo={positionInfo as any}
                    dailyEarnUSD={isActive ? currentPosDailyEarnings?.dailyEarnUSDDisplay || '$0' : '$0'}
                    dailyEarnOriginResult={isActive ? currentPosDailyEarnings?.originResult : null}
                    hasRewards={showMiningIcon || showFarmingIcon || false}
                  />
                </Skeleton>
              </HStack>
            )}
            {!showNewVersionApr && (
              <HStack m="-12px 0" w={{ base: '100%', lg: positionItemWidth[3] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && <Text color="primary_gray">Pending Fees</Text>}
                <HiddenDotted>
                  <DLMMPendingFeesBlock positionInfo={positionInfo} onFeesChange={setFees} />
                </HiddenDotted>
              </HStack>
            )}

            {!showNewVersionApr && (showMiningIcon || showFarmingIcon) && (
              <HStack m="-12px 0" w={{ base: '100%', lg: positionItemWidth[4] }} justify={{ base: 'space-between', lg: 'flex-end' }}>
                {isApp && <Text color="primary_gray">Pending Rewards</Text>}
                <HStack gap="12px">
                  {isApp && showMiningIcon && <MiningImage />}
                  {isApp && showFarmingIcon && <FarmingImage />}
                  <HiddenDotted>
                    <DLMMPendingRewardsBlock positionInfo={positionInfo} onRewardsChange={setRewards} />
                  </HiddenDotted>
                </HStack>
              </HStack>
            )}
            <HStack
              w={{ base: '100%', lg: positionItemWidth[5] }}
              justify={{ base: 'space-between', lg: 'flex-start' }}
              flexDir={{ base: 'row', lg: 'row-reverse' }}
            >
              {positionInfo?.posType === 'dlmm' && (
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
              {positionInfo?.posType === 'dlmm' && (
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
        </VStack>
      </HStack>
      {/* 暂时不做 后面加了move range一起 */}
      {/* <Box
        sx={{
          maxHeight: isShowAction ? '44px' : '0',
          opacity: isShowAction ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.2s ease'
        }}
      >
        <HStack w="100%" justify="space-between" mt="12px">
          <HStack flexDirection={{ base: 'column', lg: 'row' }} w={{ base: '100%', lg: 'unset' }}>
            <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
              <Text fontSize={{ base: '14px', lg: '12px' }}>NFT ID</Text>
              <Skeleton isLoaded={!!tokenName}>
                <Text fontWeight="500" fontSize={{ base: '14px', lg: '12px' }} color="text_caption">
                  {tokenName?.split('|')[1]}
                </Text>
              </Skeleton>
            </HStack>
            <HStack w={{ base: '100%', lg: 'unset' }} justify={{ base: 'space-between', lg: 'flex-start' }}>
              <Text fontSize={{ base: '14px', lg: '12px' }} ml={{ base: '0', lg: '8px' }}>
                Address
              </Text>
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
            </HStack>
          </HStack>
          <HStack>
            <Button
              variant="outline"
              fontSize="12px"
              bg="none"
              w="96px"
              h="32px"
              borderRadius="8px"
              onClick={() => setCurrentPosDetailTab('increase')}
            >
              Add
            </Button>
            <Button variant="outline" fontSize="12px" bg="none" w="96px" h="32px" borderRadius="8px" onClick={() => setCurrentPosDetailTab('remove')}>
              Remove
            </Button>
            <Button
              variant="outline"
              fontSize="12px"
              bg="none"
              w="96px"
              h="32px"
              borderRadius="8px"
              onClick={e => {
                cancelBubble(e)
                toClaim()
              }}
              isLoading={isClaimLoading}
              disabled={isClaimLoading || (fees == '$0' && rewards == '$0')}
            >
              Claim Yield
            </Button>
           <Button variant="outline" fontSize="12px" bg="none" w="96px" h="32px" borderRadius="8px">
              Move Range
            </Button> 
          </HStack>
        </HStack>
      </Box> */}
    </Block>
  )
}

export default DLMMPositionItemContent
