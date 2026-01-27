import { PoolShowInfo } from '@/components/common/CoinPairInfo'
import AprTooltip from '@/components/common/aprTooltip'
import StatsInfo from '@/components/liquidity/dlmm/StatsInfo'
import StatusPosition from '@/components/position/common/StatusPosition'
import DlmmLiquidityDistribution from '@/components/position/dlmm/details/DlmmLiquidityDistribution'
import DlmmPositionAction from '@/components/position/dlmm/details/DlmmPositionAction'
import DlmmPositionLiquidity from '@/components/position/dlmm/details/DlmmPositionLiquidity'
import DlmmPositionPendingYield from '@/components/position/dlmm/details/DlmmPositionPendingYield'
import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import useGetDlmmCurrentPos from '@/hooks/dlmm-position/useGetDlmmCurrentPos'
import useGetDlmmRelatedPools from '@/hooks/dlmm/useGetDlmmRelatedPools'
import useGetDlmmPositionDailyEarning from '@/hooks/position/useGetDlmmPositionDailyEarning'
import usePositionList from '@/hooks/position/usePositionList'
import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import { AddressCopyLink, CopyButton } from '@cetus/design'
import { useAccountBalance, useInterval, useRpcListener } from '@cetus/hooks'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { BackButton, RefreshButton } from '@cetus/ui-kit'
import { d, isAvailableObject } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function DlmmPositionDetail() {
  const navigate = useNavigate()
  const { position_nft_id } = useParams()
  const { fetchAccountBalance } = useAccountBalance()
  const {
    dlmmCurrentPosBaseInfo,
    dlmmPosLiquidityData,
    dlmmPosPoolsRelatedData,
    dlmmPosRewardsData,
    dlmmPosRewardsDataLoading,
    resetDlmmPositionState,
    setPosChartRefreshTrigger
  } = useDlmmPositionStore()
  const { resetDlmmPosDetail } = useDlmmPosDetailStore()
  const { fetchTokenPrices, getTokenAmountValue } = useTokenPrice()
  const { dlmmApiPoolInfo, dlmmApiPoolInfoLoading } = useDlmmLiquidityStore()
  const { getDlmmCurrentPosBaseInfo } = useGetDlmmCurrentPos()
  const { getPosDlmmRelatedData } = usePositionList()

  const { getList } = useGetDlmmRelatedPools()
  const { fetchIsSupportZap } = useIsSupportZap(dlmmApiPoolInfo?.tokenA?.coin_type, dlmmApiPoolInfo?.tokenB?.coin_type)
  useEffect(() => {
    if (dlmmApiPoolInfo?.tokenA?.coin_type && dlmmApiPoolInfo?.tokenB?.coin_type) {
      fetchIsSupportZap(dlmmApiPoolInfo.tokenA.coin_type, dlmmApiPoolInfo.tokenB.coin_type)
    }
  }, [dlmmApiPoolInfo?.tokenA?.coin_type, dlmmApiPoolInfo?.tokenB?.coin_type])

  const currentPosLiquidityData = useMemo(() => {
    return dlmmPosLiquidityData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosLiquidityData])

  /**
   * 每5秒获取一次合约数据
   */
  useInterval({
    interval: 5 * 1000,
    callback: () => {
      if (currentAccount && dlmmCurrentPosBaseInfo) {
        // toDo: 后续需要优化，active bin变化时候才需要重新获取数据
        getPosDlmmRelatedData([dlmmCurrentPosBaseInfo], true)
      }
    }
  })

  const feeDisplay = dlmmPosPoolsRelatedData?.[dlmmCurrentPosBaseInfo?.id]?.displayFee
    ? `${dlmmPosPoolsRelatedData?.[dlmmCurrentPosBaseInfo?.id]?.displayFee}%`
    : undefined
  const binStep = dlmmPosPoolsRelatedData?.[dlmmCurrentPosBaseInfo?.id]?.binStep || '--'

  const { currentAccount } = useAccountStore()

  useEffect(() => {
    if (currentAccount?.address && position_nft_id) {
      getDlmmCurrentPosBaseInfo(currentAccount?.address, position_nft_id)
    }
  }, [currentAccount?.address, position_nft_id])

  const currentPosPoolsRelatedData = useMemo(() => {
    return dlmmPosPoolsRelatedData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmPosPoolsRelatedData])

  const { setCurrentPosDetailTab } = useDlmmPosDetailStore()

  const { setFromCoin, setToCoin, fromCoin, toCoin } = useSwapWidgetStore()

  useEffect(() => {
    if (dlmmCurrentPosBaseInfo?.dlmmPool) {
      getList({ poolId: dlmmCurrentPosBaseInfo?.dlmmPool })

      fetchTokenPrices([dlmmCurrentPosBaseInfo?.coinTypeA, dlmmCurrentPosBaseInfo?.coinTypeB])
      if (dlmmCurrentPosBaseInfo?.displayTokenA && dlmmCurrentPosBaseInfo?.displayTokenB) {
        setFromCoin(dlmmCurrentPosBaseInfo?.displayTokenA)
        setToCoin(dlmmCurrentPosBaseInfo?.displayTokenB)
      }
    }
    return () => {
      setFromCoin(envConfigs.clmm_swap.from_coin)
      setToCoin(envConfigs.clmm_swap.to_coin)
    }
  }, [dlmmCurrentPosBaseInfo?.dlmmPool])

  useEffect(() => {
    if (dlmmCurrentPosBaseInfo?.dlmmPool && dlmmPosRewardsData) {
      getList({ poolId: dlmmCurrentPosBaseInfo?.dlmmPool })

      const coinTypeA = dlmmCurrentPosBaseInfo?.coinTypeA
      const coinTypeB = dlmmCurrentPosBaseInfo?.coinTypeB

      const rewardCoinSet = new Set<string>()

      for (const [positionId, rewards] of Object.entries(dlmmPosRewardsData)) {
        if (positionId === dlmmCurrentPosBaseInfo?.id) {
          rewards.forEach(reward => {
            if (reward.coin_address !== coinTypeA && reward.coin_address !== coinTypeB) {
              rewardCoinSet.add(reward.coin_address)
            }
          })
        }
      }

      const rewardCoinList = Array.from(rewardCoinSet)
      if (rewardCoinList.length > 0) {
        fetchTokenPrices(rewardCoinList)
      }
    }
  }, [dlmmPosRewardsData])

  useRpcListener({
    onRpcChange: () => {
      handleRefresh()
      if (currentAccount?.address) {
        fetchAccountBalance()
      }
    }
  })
  const { getExplorerUrl } = useExplorer()
  useEffect(() => {
    return () => {
      resetDlmmPosDetail()
      resetDlmmPositionState()
    }
  }, [])

  const { setBackUrl, backUrl } = useGlobalStore()
  const handleBack = () => {
    // todo: 暂时为解决仓位和流动性页面跳转死循环的问题 ，后面应对整站跳转做优化
    if (backUrl && !backUrl.includes('dlmm-position-detail')) {
      navigate(-1)
    } else {
      navigate('/pools?tab=positions')
    }
  }

  const cursorStyle = useMemo(() => {
    if (dlmmApiPoolInfo?.miningAprList?.length > 0) {
      return 'help'
    }
    return undefined
  }, [dlmmApiPoolInfo])

  const currentPosLiquidity = dlmmPosLiquidityData[dlmmCurrentPosBaseInfo?.id as string]
  const amountValueA = getTokenAmountValue(dlmmCurrentPosBaseInfo?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
  const amountValueB = getTokenAmountValue(dlmmCurrentPosBaseInfo?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)
  const currentPosTvl = useMemo(() => {
    return d(amountValueA).plus(amountValueB).toString()
  }, [amountValueA, amountValueB])

  const [positionApr, setPositionApr] = useState<any>(null)
  const [dailyEarnUSDDisplay, setDailyEarnUSDDisplay] = useState<any>(null)
  const [originResult, setOriginResult] = useState<any>(null)
  const { getDlmmPositionDailyEarning } = useGetDlmmPositionDailyEarning()
  const [getDailyEarning, setGetDailyEarning] = useState(true)
  const handleGetPositionApr = async () => {
    setGetDailyEarning(true)
    try {
      const res = await getDlmmPositionDailyEarning(dlmmCurrentPosBaseInfo?.id, currentPosTvl)
      if (res) {
        const { aprDisplay, dailyEarnUSDDisplay, originResult } = res
        console.log('🚀🚀🚀 ~ PositionChartInfo.tsx:155 ~ handleGetPositionApr ~ originResult:', originResult)
        setPositionApr(aprDisplay)
        setDailyEarnUSDDisplay(dailyEarnUSDDisplay)
        setOriginResult(originResult)
      }
      setGetDailyEarning(false)
    } catch (error) {
      setGetDailyEarning(false)
    }
  }

  useEffect(() => {
    if (dlmmCurrentPosBaseInfo?.id) {
      if (d(currentPosTvl).gt(0)) {
        handleGetPositionApr()
      } else {
        setGetDailyEarning(false)
      }
    }
  }, [dlmmCurrentPosBaseInfo?.id, currentPosTvl])

  useInterval({
    interval: 60 * 1000,
    callback: () => {
      handleGetPositionApr()
    }
  })
  const isActive = useMemo(() => currentPosPoolsRelatedData?.currentStatus === 'Active', [currentPosPoolsRelatedData?.currentStatus])
  const isInActive = useMemo(() => currentPosPoolsRelatedData?.currentStatus === 'Inactive', [currentPosPoolsRelatedData?.currentStatus])
  const hasStatus = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus !== undefined
  }, [currentPosPoolsRelatedData?.currentStatus])
  const { isApp } = useWindowWidth()

  const handleRefresh = useCallback(
    async (isManual?: boolean) => {
      setPosChartRefreshTrigger()
      if (dlmmCurrentPosBaseInfo?.dlmmPool) {
        await getList({ poolId: dlmmCurrentPosBaseInfo?.dlmmPool })
      }
      if (isManual) {
        getDlmmCurrentPosBaseInfo(currentAccount?.address, position_nft_id, true)
      }
      fetchAccountBalance()
      handleGetPositionApr()
    },
    [dlmmCurrentPosBaseInfo, dlmmCurrentPosBaseInfo?.id, currentPosTvl]
  )

  /**
   * 每5秒获取一次合约数据
   */
  useInterval({
    interval: 5 * 1000,
    callback: () => {
      if (currentAccount && dlmmCurrentPosBaseInfo) {
        getPosDlmmRelatedData([dlmmCurrentPosBaseInfo], false)
      }
    }
  })

  return (
    <VStack gap="12px" w="100%" pt="20px" align="flex-start">
      <HStack w="100%" justifyContent="space-between" flexDirection={{ base: 'column-reverse', lg: 'row' }}>
        <HStack w={{ base: '100%', lg: 'unset' }} justifyContent="space-between">
          <BackButton
            text="Back"
            onClick={() => {
              handleBack()
            }}
          />
        </HStack>
        <HStack w={{ base: '100%', lg: 'unset' }}>
          <Button
            w={{ base: '100%', lg: 'unset' }}
            bg="bg_secondary"
            fontSize="14px"
            p="0 16px"
            h="32px"
            borderRadius="8px"
            fontWeight="500"
            variant="outline"
            onClick={e => {
              setBackUrl(`/dlmm-position-detail/${dlmmCurrentPosBaseInfo?.id}`)
              navigate(`/dlmm?poolId=${dlmmCurrentPosBaseInfo?.dlmmPool}`)
            }}
          >
            Create a new position
          </Button>
          <RefreshButton handleRefresh={handleRefresh} isAutoRefresh refreshInterval={5} w="28px" h="28px" innerStyle={{ bg: 'none' }} />
        </HStack>
      </HStack>
      <HStack w="100%" justifyContent="space-between" flexDirection={{ base: 'column', lg: 'row' }} alignItems="end">
        <Skeleton w={{ base: '100%', lg: 'unset' }} isLoaded={!!dlmmCurrentPosBaseInfo?.dlmmPool}>
          <PoolShowInfo
            type="column"
            poolType="dlmm"
            symbolFontWeight="500"
            symbolFontSize="20px"
            symbolEllipsesDecimals={10}
            nameEllipsesDecimals={20}
            poolInfo={{ feeDisplay, binStep, ...dlmmCurrentPosBaseInfo, poolAddress: dlmmCurrentPosBaseInfo?.dlmmPool }}
            haveFarming={currentPosLiquidityData?.haveFarming}
            showPoolTypeTag
            versionBlockPosition="right"
            moreDetails
            // dividerTooltip={false}
            isShowInfoIcon={true}
            boxStyle={{ padding: '8px 0' }}
          />

          <HStack mb={{ base: '8px', lg: '0px' }}>
            <HStack
              p={{ base: '8px', lg: '3px 8px' }}
              borderRadius="8px"
              bg="bg_secondary"
              gap={{ base: '8px', lg: '4px' }}
              flexDirection={{ base: 'column', lg: 'row' }}
              align={{ base: 'flex=start', lg: 'center' }}
            >
              <HStack>
                <Text fontSize="12px" color="primary_gray">
                  Position ID
                </Text>
                <Text color="primary_gray" fontSize="12px">
                  {dlmmCurrentPosBaseInfo?.tokenName}
                </Text>
              </HStack>
              <HStack gap={{ base: '8px', lg: '4px' }}>
                <Text color="primary_gray" fontSize="12px">
                  {isApp ? 'Position Address' : '|'}
                </Text>
                <HStack gap="0px">
                  {dlmmCurrentPosBaseInfo?.id && (
                    <AddressCopyLink
                      fontWeight="500"
                      showCopy={false}
                      color="primary_gray"
                      address={dlmmCurrentPosBaseInfo?.id as string}
                      showLink={false}
                      onClickLink={() => {
                        window.open(getExplorerUrl(dlmmCurrentPosBaseInfo?.id, 'nftAddress'), '_blank')
                      }}
                    />
                  )}
                  <CopyButton text={dlmmCurrentPosBaseInfo?.id} copyText="Position address copied" />
                </HStack>
              </HStack>
            </HStack>
            {hasStatus && (
              <StatusPosition isActive={isActive} isLoading={!currentPosPoolsRelatedData && !isAvailableObject(currentPosPoolsRelatedData)} />
            )}
          </HStack>
        </Skeleton>
        <Box sx={{ ...(isApp && { w: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }) }}>
          <HStack
            w={{ base: 'max-content', lg: 'unset' }}
            gap={{ base: '4px', lg: '28px' }}
            flexDirection="row"
            overflowX={{ base: 'auto', lg: 'unset' }}
          >
            <StatsInfo
              label="Pool APR"
              value={
                <AprTooltip poolInfo={dlmmApiPoolInfo} placement={isApp ? 'bottom-end' : 'bottom'}>
                  <HStack justify="flex-end" align="flex-end" gap="4px" lineHeight="14px" h="14px">
                    <Text
                      as="span"
                      fontSize="14px"
                      color={cursorStyle ? 'primary' : 'text_caption'}
                      fontWeight="500"
                      cursor={cursorStyle ? 'help' : 'text'}
                      textUnderlineOffset="2px"
                      textDecoration={cursorStyle ? 'underline dotted' : 'none'}
                    >
                      {dlmmApiPoolInfo?.feeAndMiningAprDisplay !== '' ? dlmmApiPoolInfo?.feeAndMiningAprDisplay : '--'}
                    </Text>
                    {dlmmApiPoolInfo?.haveFarming && (
                      <Text fontSize="12px" lineHeight="12px" h="12px" color="primary" fontWeight="500">
                        +{dlmmApiPoolInfo?.farmingAprDisplay}
                      </Text>
                    )}
                  </HStack>
                </AprTooltip>
              }
              loading={!dlmmApiPoolInfo?.poolAddress}
            />
            <StatsInfo label="TVL" value={(dlmmApiPoolInfo?.tvlDisplay as string) || ''} loading={!dlmmApiPoolInfo?.poolAddress} />
            <StatsInfo label="Volume (24H)" value={(dlmmApiPoolInfo?.volume24Display as string) || ''} loading={!dlmmApiPoolInfo?.volume24Display} />
            <StatsInfo label="Fees (24H)" value={(dlmmApiPoolInfo?.fees24Display as string) || ''} loading={!dlmmApiPoolInfo?.poolAddress} />
          </HStack>
        </Box>
      </HStack>
      <HStack flexDirection={{ base: 'column-reverse', lg: 'row' }} width="100%" justifyContent="space-between" align="flex-start" mt="8px">
        <VStack width={{ base: '100%', lg: '684px' }} position="relative" gap="16px">
          <DlmmLiquidityDistribution positionApr={isInActive ? '0%' : hasStatus ? positionApr : null} isAprLoading={getDailyEarning} />
          <DlmmPositionLiquidity />
          <DlmmPositionPendingYield dailyEarnUSDDisplay={isInActive ? '$0' : hasStatus ? dailyEarnUSDDisplay : null} originResult={originResult} />
        </VStack>
        <VStack width={{ base: '100%', lg: '460px' }}>
          <DlmmPositionAction />
        </VStack>
      </HStack>
    </VStack>
  )
}
