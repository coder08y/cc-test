import useDlmmPosClaim from '@/hooks/dlmm-position/useDlmmPosClaim'
import useCalculatePendingYield from '@/hooks/position/useCalculatePendingYield'
import useGetDlmmPositionHistoricalProfit from '@/hooks/position/useGetDlmmPositionHistoricalProfit'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { showNewVersionApr } from '@/types'
import { CetusTooltip, SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { formatCurrency, removeComma } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Button, HStack, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { uniq } from 'lodash-es'
import React, { useEffect, useMemo, useState } from 'react'
import { TokenAmountAndAfter } from '../../clmm/details/DetailStatsInfo'

export default function DlmmPositionPendingYield({ dailyEarnUSDDisplay, originResult }: { dailyEarnUSDDisplay: string; originResult: any }) {
  const {
    dlmmCurrentPosBaseInfo,
    dlmmPosFeeData,
    dlmmPosRewardsData,
    dlmmPosFeeDataLoading,
    dlmmPosFeeAndRewardsLoading,
    dlmmPosRewardsDataLoading,
    dlmmCurrentPosBaseInfoLoading,
    dlmmPosLiquidityData,
    dlmmPosPoolsOriginalData
  } = useDlmmPositionStore()
  const dlmmCurrentPosFeeData = useMemo(() => {
    return dlmmPosFeeData?.[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmPosFeeData, dlmmCurrentPosBaseInfo])
  const dlmmCurrentPosRewardData = useMemo(() => {
    const result = dlmmPosRewardsData?.[dlmmCurrentPosBaseInfo?.id]
    return result?.filter((item: any, index: number) => {
      const emissionsEveryDay = d(
        dlmmPosPoolsOriginalData?.[dlmmCurrentPosBaseInfo?.dlmmPool]?.reward_manager?.rewards?.[index]?.emissions_per_day || 0
      )
      return emissionsEveryDay.gt(0) || d(item?.display_amount_owed || 0).gt(0)
    })
  }, [dlmmPosRewardsData, dlmmCurrentPosBaseInfo, dlmmPosPoolsOriginalData])

  const { toClaimDlmmPosition, isClaimLoading } = useDlmmPosClaim()
  const { tokenAmountAfterA, tokenAmountAfterB, isAutoClaim } = useDlmmPosDetailStore()

  const [totalYield, setTotalYield] = useState('0')
  const { calculatePendingYield } = useCalculatePendingYield()

  useEffect(() => {
    if (dlmmCurrentPosBaseInfo && dlmmPosFeeData && dlmmPosRewardsData) {
      const { total } = calculatePendingYield([dlmmCurrentPosBaseInfo], {}, {}, {}, dlmmPosFeeData, dlmmPosRewardsData)

      setTotalYield(total)
    }
  }, [dlmmCurrentPosBaseInfo, dlmmPosFeeData, dlmmPosRewardsData])

  const isInputValue = useMemo(() => {
    if (isAutoClaim) {
      return tokenAmountAfterA !== '' || tokenAmountAfterB !== ''
    }
    return false
  }, [tokenAmountAfterA, tokenAmountAfterB, isAutoClaim])

  const { isApp } = useWindowWidth()

  const claimBtnDisabled = useMemo(() => {
    // 可提取奖励为0 并且 没有reward奖励 并且没有fee奖励
    return (
      (Number(totalYield) === 0 &&
        (!dlmmCurrentPosRewardData || dlmmCurrentPosRewardData?.every(item => d(item?.display_amount_owed).eq(0))) &&
        (!dlmmCurrentPosFeeData || (dlmmCurrentPosFeeData?.displayFeeOwedA == '0' && dlmmCurrentPosFeeData?.displayFeeOwedB == '0'))) ||
      isClaimLoading
    )
  }, [dlmmPosFeeAndRewardsLoading, isClaimLoading, dlmmCurrentPosFeeData, totalYield, dlmmCurrentPosRewardData])

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

  const { getDlmmPositionHistoricalProfit } = useGetDlmmPositionHistoricalProfit()
  const [positionHistoricalProfit, setPositionHistoricalProfit] = useState<any>(null)
  const handleGetDlmmPositionHistoricalProfit = async () => {
    const res = await getDlmmPositionHistoricalProfit(dlmmCurrentPosBaseInfo?.id as string)
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
    if (dlmmCurrentPosBaseInfo?.id) {
      handleGetDlmmPositionHistoricalProfit()
    }
  }, [dlmmCurrentPosBaseInfo?.id, dlmmCurrentPosFeeData, dlmmCurrentPosRewardData, dlmmPosLiquidityData])

  const toClaim = async () => {
    await toClaimDlmmPosition(dlmmCurrentPosBaseInfo)
    const historyFeeA = d(positionHistoricalProfit?.FeeA?.Amount || 0)
      .add((dlmmCurrentPosBaseInfo?.isReverse ? dlmmCurrentPosFeeData?.displayFeeOwedB : dlmmCurrentPosFeeData?.displayFeeOwedA) || 0)
      .toString()
    const historyFeeB = d(positionHistoricalProfit?.FeeB?.Amount || 0)
      .add((dlmmCurrentPosBaseInfo?.isReverse ? dlmmCurrentPosFeeData?.displayFeeOwedA : dlmmCurrentPosFeeData?.displayFeeOwedB) || 0)
      .toString()
    const historyMiningCoins = uniq([
      ...dlmmCurrentPosRewardData?.map(item => item?.coin_address),
      ...positionHistoricalProfit?.Mining?.map(item => item?.CoinType)
    ])
    const historyMining = historyMiningCoins.map(coinType => {
      const newReward = dlmmCurrentPosRewardData?.find(item => item?.coin_address === coinType)?.display_amount_owed || '0'
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
    await handleGetDlmmPositionHistoricalProfit()
  }
  return (
    <VStack bg="bg_secondary" w="100%" p={{ base: '16px 8px', lg: '20px 20px 0' }} borderRadius="16px">
      <HStack w="100%" justify="space-between">
        <Stack
          flexDir={{ base: 'row', lg: 'column' }}
          alignItems={{ base: 'center', lg: 'flex-start' }}
          justify={{ base: 'space-between', lg: 'center' }}
          w={{ base: '100%', lg: 'auto' }}
        >
          <HStack gap="28px">
            <VStack align="flex-start">
              <Text color="primary_gray">Claimable Yield</Text>
              <Skeleton isLoaded={!!totalYield && !!dlmmCurrentPosBaseInfo && !!dlmmPosFeeData && !!dlmmPosRewardsData}>
                <Text color="text_caption" fontSize="16px">
                  {formatCurrency(totalYield, 2)}
                </Text>
              </Skeleton>
            </VStack>

            {showNewVersionApr && dailyEarnUSDDisplay !== null && (
              <Stack flexDir={{ base: 'column', lg: 'row' }} bg="card_bg" borderRadius="8px" p="5px 8px" alignItems="center">
                <CetusTooltip
                  placement="top"
                  tooltip={
                    <Text fontSize="12px" lineHeight="20px">
                      Estimated based on yield performance of this position since the last operation on it. Past performance is not indicative of
                      future results, which is for reference only.
                    </Text>
                  }
                >
                  <HStack gap="4px">
                    <Text fontSize="12px">Est. Daily Yield</Text>
                    <Icon xlinkHref="#icon-icon_tips" />
                  </HStack>
                </CetusTooltip>

                <Skeleton isLoaded={!!totalYield && !!dlmmCurrentPosBaseInfo && !!dlmmPosFeeData && !!dlmmPosRewardsData}>
                  <Text fontSize="12px" color="primary">
                    {dailyEarnUSDDisplay ? (dailyEarnUSDDisplay !== '$0' ? `+${dailyEarnUSDDisplay}` : dailyEarnUSDDisplay) : '$0'}
                  </Text>
                </Skeleton>
              </Stack>
            )}
          </HStack>
        </Stack>
        <Button
          isLoading={isClaimLoading}
          isDisabled={(claimBtnDisabled && !+totalYield) || totalYield === '--'}
          onClick={() => toClaim()}
          w="112px"
          h="28px"
          borderRadius="8px"
          fontWeight="500"
          fontSize="14px"
        >
          Claim
        </Button>
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
                w: '158px',
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
              token={dlmmCurrentPosBaseInfo?.displayTokenA}
              amount={dlmmCurrentPosFeeData?.displayFeeOwedA}
              afterAmount={isInputValue && isAutoClaim ? '0' : ''}
              align={isApp ? 'flex-end' : 'flex-start'}
            />
            <TokenAmountAndAfter
              label={isApp ? '' : 'Fees'}
              token={dlmmCurrentPosBaseInfo?.displayTokenB}
              amount={dlmmCurrentPosFeeData?.displayFeeOwedB}
              afterAmount={isInputValue && isAutoClaim ? '0' : ''}
              align="flex-end"
            />
            {dlmmCurrentPosRewardData?.map((item: any, index: number) => {
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
              token={dlmmCurrentPosBaseInfo?.displayTokenA}
              amount={dlmmCurrentPosBaseInfo?.isReverse ? positionHistoricalProfit?.FeeB?.Amount : positionHistoricalProfit?.FeeA?.Amount}
              align={isApp ? 'flex-end' : 'flex-start'}
              afterAmount={''}
            />
            <TokenAmountAndAfter
              label={isApp ? '' : 'Fees'}
              token={dlmmCurrentPosBaseInfo?.displayTokenB}
              amount={dlmmCurrentPosBaseInfo?.isReverse ? positionHistoricalProfit?.FeeA?.Amount : positionHistoricalProfit?.FeeB?.Amount}
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
    </VStack>
  )
}
