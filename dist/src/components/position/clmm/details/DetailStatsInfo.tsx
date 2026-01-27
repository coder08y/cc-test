import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import useClaimPosition from '@/hooks/position/useClaimPosition'
import useGetClmmPositionHistoricalProfit from '@/hooks/position/useGetClmmPositionHistoricalProfit'
import usePosHelper from '@/hooks/position/usePosHelper'
import usePositionStore from '@/store/position'
import usePositionCompoundStore from '@/store/position/compound'
import usePositionDetailStore from '@/store/position/detail'
import { showNewVersionApr } from '@/types'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { CoinType, Token } from '@cetus/types'
import { d, formatCurrency, formatNumberWithDown, isAvailableObject, removeComma, textEllipses } from '@cetus/utils'
import { Box, Button, HStack, Progress, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { uniq } from 'lodash-es'
import React, { useEffect, useMemo, useState } from 'react'
import LiquidityValueBlock from '../list/LiquidityValueBlock'
import ClaimAndCompoundModal from './ClaimAndCompound/ClaimAndCompoundModal'
import DailyYield from './DailyYield'

export function DetailStatsInfo({ handleRefresh }: { handleRefresh: () => void }) {
  const { currentAccount } = useAccountStore()
  const { coinPriceObj } = useTokenPriceStore()
  const {
    rewardAndFeeList,
    setRewardAndFeeList,
    setClmmFeeList,
    setClmmRewardList,
    resetCompoundData,
    isOpenCompoundModal,
    setIsOpenCompoundModal,
    setCompoundableRewards,
    setNotCompoundableRewards,
    setMergeableRewards,
    setNotMergeableRewards
  } = usePositionCompoundStore()

  const { tokenAmountAfterA, tokenAmountAfterB, curPosContractPoolInfo, isAutoClaim, currentPosPoolInfo, useZapIn } = usePositionDetailStore()
  const { currentPosBaseInfo, posFeeData, posRewardsData, posLiquidityData, currentPosBaseInfoLoading, posFeeDataLoading, posRewardsDataLoading } =
    usePositionStore()

  const currentPosLiquidityData = useMemo(() => {
    return posLiquidityData[currentPosBaseInfo?.posId as string]
  }, [posLiquidityData, currentPosBaseInfo?.posId])

  const currentPosFeeData = useMemo(() => {
    return posFeeData[currentPosBaseInfo?.posId as string]
  }, [posFeeData, currentPosBaseInfo?.posId])

  const currentPosRewardsData = useMemo(() => {
    const result = posRewardsData[currentPosBaseInfo?.posId as string] ?? []

    return result.filter((item: any, index: number) => {
      const emissionsEveryDay = d(curPosContractPoolInfo?.rewarder_infos?.[index]?.emissionsEveryDay || 0)
      return emissionsEveryDay.gt(0) || d(item?.display_amount_owed || 0).gt(0)
    })
  }, [posRewardsData, currentPosBaseInfo?.posId, curPosContractPoolInfo?.rewarder_infos])

  const [totalYield, setTotalYield] = useState('0')
  const [isTotalYieldLoading, setIsTotalYieldLoading] = useState(true)
  const { calculatePendingYield } = useCalculatePendingYield()

  useEffect(() => {
    if (!currentPosBaseInfoLoading && !posFeeDataLoading && !posRewardsDataLoading && currentPosBaseInfo) {
      const { total, rewardAndFeeList, clmmFeeList, clmmRewardList } = calculatePendingYield([currentPosBaseInfo], posFeeData, posRewardsData)
      setTotalYield(total)
      setIsTotalYieldLoading(false)
      setRewardAndFeeList(rewardAndFeeList)
      setClmmFeeList(clmmFeeList)
      setClmmRewardList(clmmRewardList)
    }
  }, [currentPosBaseInfoLoading, posFeeDataLoading, posRewardsDataLoading, posFeeData, posRewardsData, coinPriceObj])
  const { toClaimPosition, isClaimLoading } = useClaimPosition()

  const isInputValue = isAutoClaim ? tokenAmountAfterA !== '' || tokenAmountAfterB !== '' : false

  const { isApp } = useWindowWidth()

  const tabList = [
    {
      label: 'Unclaimed',
      value: 'Unclaimed'
    },
    {
      label: 'Claimed',
      value: 'Claimed'
    }
  ]

  const [currentTab, setCurrentTab] = useState<Tab>(tabList[0])

  const handleChangeTab = (tab: Tab) => {
    setCurrentTab(tab)
  }

  const { getClmmPositionHistoricalProfit } = useGetClmmPositionHistoricalProfit()

  const [positionHistoricalProfit, setPositionHistoricalProfit] = useState<any>(null)
  const handleGetClmmPositionHistoricalProfit = async () => {
    const res = await getClmmPositionHistoricalProfit(currentPosBaseInfo?.posId as string)
    console.log('🚀🚀🚀 ~ DetailStatsInfo.tsx:93 ~ handleGetClmmPositionHistoricalProfit ~ res:', res)
    if (positionHistoricalProfit === null) {
      setPositionHistoricalProfit(res)
    } else {
      if (res?.FeeA?.Amount !== undefined && d(removeComma(res?.FeeA?.Amount)).gt(positionHistoricalProfit?.FeeA?.Amount)) {
        setPositionHistoricalProfit(res)
      }
    }
  }
  useDeepCompareEffect(() => {
    if (currentPosBaseInfo?.posId) {
      handleGetClmmPositionHistoricalProfit()
    }
  }, [currentPosBaseInfo?.posId, currentPosFeeData, currentPosRewardsData, currentPosPoolInfo])

  const toClaim = async () => {
    await toClaimPosition(currentPosBaseInfo, curPosContractPoolInfo)
    const historyFeeA = d(positionHistoricalProfit?.FeeA?.Amount || 0)
      .add((currentPosBaseInfo?.isReverse ? currentPosFeeData?.displayFeeOwedB : currentPosFeeData?.displayFeeOwedA) || 0)
      .toString()
    const historyFeeB = d(positionHistoricalProfit?.FeeB?.Amount || 0)
      .add((currentPosBaseInfo?.isReverse ? currentPosFeeData?.displayFeeOwedA : currentPosFeeData?.displayFeeOwedB) || 0)
      .toString()
    const historyMiningCoins = uniq([
      ...currentPosRewardsData?.map(item => item?.coin_address),
      ...positionHistoricalProfit?.Mining?.map(item => item?.CoinType)
    ])
    const historyMining = historyMiningCoins.map(coinType => {
      const newReward = currentPosRewardsData?.find(item => item?.coin_address === coinType)?.display_amount_owed || '0'
      const old = positionHistoricalProfit?.Mining?.find(item => item?.CoinType === coinType)?.Amount || '0'
      const amount = d(removeComma(newReward)).add(removeComma(old)).toString()
      return {
        CoinType: coinType,
        Amount: amount || 0
      }
    })
    setPositionHistoricalProfit({
      FeeA: {
        Amount: historyFeeA,
        CoinType: positionHistoricalProfit?.FeeA?.CoinType
      },
      FeeB: {
        Amount: historyFeeB,
        CoinType: positionHistoricalProfit?.FeeB?.CoinType
      },
      Mining: historyMining
    })
    await handleGetClmmPositionHistoricalProfit()
    setIsOpenCompoundModal(false)
  }

  const { hasCompound, getCompoundableRewards, getMergeableRewards } = usePosHelper()

  const canCompound = useMemo(() => {
    console.log('🚀 ~ DetailStatsInfo ~ rewardAndFeeList:', rewardAndFeeList)
    return rewardAndFeeList?.length > 0 ? hasCompound(rewardAndFeeList) : false
  }, [rewardAndFeeList])

  const [modalTab, setModalTab] = useState('Claim')

  useEffect(() => {
    return () => {
      setIsOpenCompoundModal(false)
      resetCompoundData()
    }
  }, [])

  useDeepCompareEffect(() => {
    if (!rewardAndFeeList?.length) {
      setCompoundableRewards([])
      setNotCompoundableRewards([])
      setMergeableRewards([])
      setNotMergeableRewards([])
      return
    }
    const compoundable = getCompoundableRewards(rewardAndFeeList, true)
    const notCompoundable = getCompoundableRewards(rewardAndFeeList, false)
    const mergeable = getMergeableRewards(rewardAndFeeList, true)
    const notMergeable = getMergeableRewards(rewardAndFeeList, false)

    setMergeableRewards(mergeable)
    setNotMergeableRewards(notMergeable)
    setCompoundableRewards(compoundable)
    setNotCompoundableRewards(notCompoundable)
  }, [rewardAndFeeList])

  const actionBtnDisabled = useMemo(() => {
    return isTotalYieldLoading || !currentPosBaseInfo || !posFeeData || !posRewardsData || Number(totalYield) === 0 || !currentAccount?.address
  }, [totalYield, isTotalYieldLoading, currentPosBaseInfo, posFeeData, posRewardsData, currentAccount?.address])
  return (
    <VStack w="100%" gap={{ base: '12px', lg: '16px' }}>
      <VStack bg="bg_secondary" w="100%" p={{ base: '16px 8px 8px', lg: '20px 20px 0' }} borderRadius="16px">
        <Stack flexDir={{ base: 'column', lg: 'row' }} w="100%" justify={{ base: 'center', lg: 'space-between' }} gap={{ base: '16px', lg: '0' }}>
          <Stack
            flexDir={{ base: 'row', lg: 'column' }}
            align={{ base: 'center', lg: 'flex-start' }}
            justify={{ base: 'space-between', lg: 'center' }}
            mt="0"
          >
            <Text color="primary_gray" mb={{ base: '0', lg: '-12px' }}>
              Liquidity
            </Text>
            <LiquidityValueBlock positionInfo={currentPosBaseInfo} haveTooltip={false} />
          </Stack>
          <HStack w={{ base: '100%', lg: 'unset' }} gap="4px" pb="12px" justifyContent="center">
            <Skeleton isLoaded={!!currentPosBaseInfo && !!currentPosLiquidityData}>
              <HStack gap="4px">
                <Text color="text_caption">{textEllipses(currentPosBaseInfo?.displayTokenA?.symbol)}</Text>
                <Text color="primary">{currentPosLiquidityData?.displayPercentA}%</Text>
              </HStack>
            </Skeleton>
            <Progress
              w={{ base: '100px', lg: '200px' }}
              h="4px"
              value={currentPosLiquidityData?.displayPercentA}
              bg="quote_green"
              sx={{
                'div[role="progressbar"]': {
                  bg: 'primary'
                }
              }}
            />
            <Skeleton isLoaded={!!currentPosBaseInfo && !!currentPosLiquidityData}>
              <HStack gap="4px">
                <Text color="primary_green">{currentPosLiquidityData?.displayPercentB}%</Text>
                <Text color="text_caption">{textEllipses(currentPosBaseInfo?.displayTokenB?.symbol)}</Text>
              </HStack>
            </Skeleton>
          </HStack>
        </Stack>
        <HStack gap="0px" p={{ base: '8px 0px', lg: '8px 40px 0px' }} w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
          <TokenAmountAndAfter
            label="Base"
            token={currentPosBaseInfo?.displayTokenA}
            amount={currentPosLiquidityData?.displayCoinAmountA}
            afterAmount={tokenAmountAfterA}
            align={isApp ? 'flex-end' : 'flex-start'}
          />
          <TokenAmountAndAfter
            label="Quote"
            token={currentPosBaseInfo?.displayTokenB}
            amount={currentPosLiquidityData?.displayCoinAmountB}
            afterAmount={tokenAmountAfterB}
            align="flex-end"
          />
        </HStack>
      </VStack>
      <VStack bg="bg_secondary" w="100%" p={{ base: useZapIn ? '16px 8px 80px' : '16px 8px', lg: '20px 20px 0' }} borderRadius="16px">
        <HStack w="100%" justify="space-between">
          <HStack gap="28px" w={{ base: '100%', lg: 'auto' }} justify={{ base: 'space-between', lg: 'center' }}>
            <VStack align="flex-start">
              <Text color="primary_gray" whiteSpace="nowrap">
                Claimable Yield
              </Text>
              <Skeleton isLoaded={!isTotalYieldLoading && !!currentPosBaseInfo && !!posFeeData && !!posRewardsData}>
                <Text color="text_caption" fontSize="16px">
                  {formatCurrency(totalYield, 2)}
                </Text>
              </Skeleton>
            </VStack>
            <DailyYield totalYield={totalYield} />
          </HStack>
          {!isApp && (
            <HStack>
              {currentPosBaseInfo?.posType !== 'burn' && (
                <Button
                  isDisabled={actionBtnDisabled}
                  onClick={() => {
                    setModalTab('Compound')
                    setIsOpenCompoundModal(true)
                  }}
                  w="112px"
                  h="28px"
                  borderRadius="8px"
                  fontWeight="500"
                  fontSize="14px"
                >
                  Compound
                </Button>
              )}
              <Button
                isDisabled={actionBtnDisabled}
                onClick={() => {
                  setModalTab('Claim')
                  setIsOpenCompoundModal(true)
                }}
                w="112px"
                h="28px"
                borderRadius="8px"
                fontWeight="500"
                fontSize="14px"
              >
                Claim
              </Button>
            </HStack>
          )}
        </HStack>
        <VStack p={{ base: '20px 0px 0', lg: '20px 40px 0px' }} w="100%" gap="26px">
          {showNewVersionApr && (
            <VStack align="flex-start" w="100%">
              <SelectTab
                type="outlineTab"
                tabList={tabList}
                currentTab={currentTab?.label}
                handleChangeTab={handleChangeTab}
                wrapStyle={{
                  w: isApp ? '100%' : '158px',
                  h: '28px',
                  p: '4px',
                  borderRadius: '8px'
                }}
                itemStyle={{
                  flex: {
                    lg: '1',
                    base: 'auto'
                  },
                  fontSize: '12px',
                  margin: '0px',
                  borderRadius: '4px'
                }}
              />
            </VStack>
          )}

          {currentTab.value == 'Unclaimed' ? (
            <HStack justify="space-between" w="100%" gap="0px" flexWrap="wrap" flexDirection={{ base: 'column', lg: 'row' }}>
              <TokenAmountAndAfter
                label="Fees"
                token={currentPosBaseInfo?.displayTokenA}
                amount={currentPosFeeData?.displayFeeOwedA}
                afterAmount={isInputValue && isAutoClaim ? '0' : ''}
                align={isApp ? 'flex-end' : 'flex-start'}
              />
              <TokenAmountAndAfter
                label={isApp ? '' : 'Fees'}
                token={currentPosBaseInfo?.displayTokenB}
                amount={currentPosFeeData?.displayFeeOwedB}
                afterAmount={isInputValue && isAutoClaim ? '0' : ''}
                align="flex-end"
              />
              {currentPosRewardsData?.map((item: any, index: number) => {
                return (
                  <React.Fragment key={item?.coin_address}>
                    <TokenAmountAndAfter
                      label={isApp ? (index == 0 ? 'Mining Rewards' : '') : 'Mining Rewards'}
                      token={item?.token}
                      amount={item?.display_amount_owed}
                      afterAmount={isInputValue && isAutoClaim ? '0' : ''}
                      align={isApp ? 'flex-end' : index % 2 === 0 ? 'flex-start' : 'flex-end'}
                    />
                  </React.Fragment>
                )
              })}
            </HStack>
          ) : (
            <HStack justify="space-between" w="100%" gap="0px" flexWrap="wrap" flexDirection={{ base: 'column', lg: 'row' }}>
              <TokenAmountAndAfter
                label="Fees"
                token={currentPosBaseInfo?.displayTokenA}
                amount={currentPosBaseInfo?.isReverse ? positionHistoricalProfit?.FeeB?.Amount : positionHistoricalProfit?.FeeA?.Amount}
                align={isApp ? 'flex-end' : 'flex-start'}
                afterAmount={''}
              />
              <TokenAmountAndAfter
                label={isApp ? '' : 'Fees'}
                token={currentPosBaseInfo?.displayTokenB}
                amount={currentPosBaseInfo?.isReverse ? positionHistoricalProfit?.FeeA?.Amount : positionHistoricalProfit?.FeeB?.Amount}
                align="flex-end"
                afterAmount={''}
              />
              {positionHistoricalProfit?.Mining?.filter?.(item => item?.Amount && d(removeComma(item?.Amount))?.gt(0))?.map(
                (item: any, index: number) => {
                  return (
                    <React.Fragment key={item?.CoinType}>
                      <TokenAmountAndAfter
                        label={isApp ? (index == 0 ? 'Mining Rewards' : '') : 'Mining Rewards'}
                        coinType={item?.CoinType}
                        amount={item?.Amount}
                        align={isApp ? 'flex-end' : index % 2 === 0 ? 'flex-start' : 'flex-end'}
                        afterAmount={''}
                      />
                    </React.Fragment>
                  )
                }
              )}
            </HStack>
          )}
        </VStack>
        {isApp && (
          <HStack w="100%" justify="space-between">
            {currentPosBaseInfo?.posType !== 'burn' && (
              <Button
                isDisabled={actionBtnDisabled}
                onClick={() => {
                  setModalTab('Compound')
                  setIsOpenCompoundModal(true)
                }}
                w={{ base: '50%', lg: '112px' }}
                h="28px"
                borderRadius="8px"
                fontWeight="500"
                fontSize="14px"
              >
                Compound
              </Button>
            )}
            <Button
              isDisabled={actionBtnDisabled}
              onClick={() => {
                setModalTab('Claim')
                setIsOpenCompoundModal(true)
              }}
              w={{ base: currentPosBaseInfo?.posType !== 'burn' ? '50%' : '100%', lg: '112px' }}
              h="28px"
              borderRadius="8px"
              fontWeight="500"
              fontSize="14px"
            >
              Claim
            </Button>
          </HStack>
        )}
      </VStack>

      {isOpenCompoundModal && (
        <ClaimAndCompoundModal
          handleRefresh={handleRefresh}
          isOpen={isOpenCompoundModal}
          canCompound={canCompound}
          toClaim={toClaim}
          isClaimLoading={isClaimLoading}
          onClose={() => setIsOpenCompoundModal(false)}
          currentTab={modalTab}
          totalYield={totalYield}
        />
      )}
    </VStack>
  )
}

export function TokenAmountAndAfter({
  label,
  token,
  amount,
  afterAmount,
  isLoading,
  align = 'flex-start',
  coinType = ''
}: {
  label: string
  token?: Token
  amount: string
  afterAmount: string
  isLoading?: boolean
  align: string
  coinType?: string
}) {
  const { getTokenAmountValue } = useTokenPrice()
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  const amountValue = getTokenAmountValue(token?.coin_type || coinType, amount, '--')
  const [forceLoaded, setForceLoaded] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      setForceLoaded(true)
    }, 5000)
  }, [])

  const { getTokenInfo } = useGetToken()

  const [currentToken, setCurrentToken] = useState<Token | null>(null)
  const fetchToken = async (coinType: string) => {
    if (!coinType) return
    try {
      const coinInfo = await getTokenInfo(coinType as CoinType)
      console.log('🚀 ~ fetchToken ~ coinInfo:', coinType, coinInfo)
      if (coinInfo) {
        setCurrentToken(coinInfo)
      }
    } catch (error) {
      console.error('Error fetching token info:', error)
    }
  }

  useEffect(() => {
    if (token && isAvailableObject(token)) {
      setCurrentToken(token)
    } else {
      if (coinType) {
        fetchToken(coinType)
      }
    }
  }, [coinType, token])

  return (
    <VStack align={align} gap={{ base: '4px', lg: '8px' }} w={{ base: '100%', lg: 'calc(50% - 4px)' }} mb={{ base: '16px', lg: '28px' }}>
      <VStack w="100%" align={{ base: 'center', lg: align }} justify={{ base: 'space-between' }} flexDirection={{ base: 'row', lg: 'column' }}>
        <Text color="primary_gray">{label}</Text>
        <HStack h={{ base: 'unset', lg: '34px' }} flexDirection={align == 'flex-start' ? 'row' : 'row-reverse'}>
          <Box onClick={isApp ? () => window.open(getExplorerUrl(token?.coin_type, 'coin')) : () => {}}>
            <SingleTokenInfo
              haveTooltip={!isApp}
              coinType={token ? token?.coin_type : coinType}
              haveName={false}
              haveSymbol={false}
              warningIcon={{ iconW: '14px', iconH: '14px' }}
              imgBoxStyle={{ w: '28px', h: '28px' }}
            />
          </Box>
          <Skeleton isLoaded={(!isLoading && !!amount) || forceLoaded}>
            <VStack align={align} gap="4px">
              <Text color="text_caption" fontSize={{ base: '14px', lg: '16px' }}>
                {formatNumberWithDown(amount)} {textEllipses(currentToken?.symbol)}
              </Text>
              <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }}>
                {amountValue == '--' ? '$--' : formatCurrency(amountValue, 2)}
              </Text>
            </VStack>
          </Skeleton>
        </HStack>
      </VStack>
      {afterAmount !== '' && afterAmount && (
        <HStack bg="primary_opacity.10" borderRadius="full" p="4px 20px" align="center">
          <Text color="primary" lineHeight="20px" textAlign={align === 'flex-end' ? 'right' : 'left'}>
            {formatNumberWithDown(afterAmount)} {textEllipses(token?.symbol, 10)} after
          </Text>
        </HStack>
      )}
    </VStack>
  )
}
