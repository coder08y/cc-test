import Slippage from '@/components/common/Slippage'
import DetailHeaderInfo from '@/components/position/clmm/details/DetailHeaderInfo'
import { DetailStatsInfo } from '@/components/position/clmm/details/DetailStatsInfo'
import IncreaseBlock from '@/components/position/clmm/details/IncreaseBlock'
import PositionChartInfo from '@/components/position/clmm/details/PositionChartInfo'
import RebalanceBlock from '@/components/position/clmm/details/RebalanceBlock'
import RemoveBlock from '@/components/position/clmm/details/RemoveBlock'
import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import useGetPoolList from '@/hooks/pool/useGetPoolList'
import useCurrentPos from '@/hooks/position/useCurrentPos'
import useGetClmmPositionDailyEarning from '@/hooks/position/useGetClmmPositionDailyEarning'
import useGetPosLiquiditys from '@/hooks/position/useGetPosLiquiditys'
import useGetPosPools from '@/hooks/position/useGetPosPools'
import useLiquidityStore from '@/store/clmm'
import usePriceRangeStore from '@/store/clmm/priceRange'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import { PosBaseInfo } from '@/types'
import { SelectTab } from '@cetus/design'
import { useAccountBalance, useRpcListener } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { BackButton, RefreshButton } from '@cetus/ui-kit'
import { d, isAvailableObject } from '@cetus/utils'
import { Button, HStack, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function PositionDetail() {
  const navigate = useNavigate()
  const { fetchAccountBalance } = useAccountBalance()
  const { currentAccount } = useAccountStore()
  const { position_nft_id, posTab } = useParams()
  const { getCurrentPosBaseInfo, getCurrentPosHistory, getCurrentPosByPosId, getPoolLiquiditySnapshot } = useCurrentPos()
  const {
    curPosContractPoolInfo,
    currentPosDetailTab,
    currentPosPoolInfo,
    setCurrentPosDetailTab,
    setCurrentPosPoolInfo,
    setCurrentPoolSqrtPrice,
    setCurPosContractPoolInfo,
    setIsPosDetailRefresh,
    setUseZapIn,
    setTotalDailyExpansionFactorUSD,
    setIsPriceDirect,
    setIsDirect,
    useZapIn
  } = usePositionDetailStore()
  const { posPoolsRelatedData, currentPosBaseInfo, setCurrentPosBaseInfo, farmsPosRewardsData, posRewardsData, posLiquidityData } = usePositionStore()
  const feeDisplay = (posPoolsRelatedData[currentPosBaseInfo?.posId as string]?.displayFee || '--') + '%'

  const { fetchIsSupportZap } = useIsSupportZap(currentPosBaseInfo?.displayTokenA?.coin_type, currentPosBaseInfo?.displayTokenB?.coin_type)
  useEffect(() => {
    if (currentPosBaseInfo?.displayTokenA?.coin_type && currentPosBaseInfo?.displayTokenB?.coin_type) {
      fetchIsSupportZap(currentPosBaseInfo.displayTokenA.coin_type, currentPosBaseInfo.displayTokenB.coin_type)
    }
  }, [currentPosBaseInfo?.displayTokenA?.coin_type, currentPosBaseInfo?.displayTokenB?.coin_type])

  const { getTokenAmountValue } = useTokenPrice()
  const currentPosLiquidity = posLiquidityData[currentPosBaseInfo?.posId as string]
  const amountValueA = getTokenAmountValue(currentPosBaseInfo?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
  const amountValueB = getTokenAmountValue(currentPosBaseInfo?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)
  const currentPosTvl = useMemo(() => {
    return d(amountValueA).plus(amountValueB).toString()
  }, [amountValueA, amountValueB])

  const { setCurrentRange } = useLiquidityStore()
  const { setLowerTickData, setUpperTickData } = usePriceRangeStore()

  useEffect(() => {
    setCurrentRange('')
    return () => {
      setCurrentRange('')
    }
  }, [])

  const tabList = useMemo(() => {
    const baseTabs = [
      { label: 'Add', value: 'increase' },
      { label: 'Remove', value: 'remove' }
    ]

    if (currentPosBaseInfo?.posType !== 'burn' && currentPosTvl && currentPosTvl !== '--' && d(currentPosTvl).gt(1)) {
      baseTabs.push({ label: 'Rebalance', value: 'rebalance' })
    }

    return baseTabs
  }, [currentPosBaseInfo?.posType, currentPosTvl])

  const getPosData = (isForceRefresh: boolean = false) => {
    if (currentAccount?.address && position_nft_id) {
      getCurrentPosBaseInfo(currentAccount?.address, position_nft_id, isForceRefresh)
    }
  }
  useEffect(() => {
    console.log('🚀 ~ PositionDetail ~ position_nft_id:', position_nft_id)
    getPosData()
  }, [currentAccount?.address, position_nft_id])
  useEffect(() => {
    if (currentPosDetailTab == 'rebalance') {
      setCurrentPosDetailTab('increase')
    }
  }, [tabList?.length])
  const getHistory = async (id: string, posId: string) => {
    if (id) {
      await getCurrentPosHistory(id, posId)
    }
  }
  useEffect(() => {
    console.log('🚀 ~ PositionHistory ~ currentPosBaseInfo?.id:', currentPosBaseInfo?.id)
    // getHistory(currentPosBaseInfo?.id as string, currentPosBaseInfo?.posId as string)
  }, [currentPosBaseInfo?.id])

  const { fetchTokenPrices } = useTokenPrice()

  // 刷新页面时重新查token价格
  const posFarmsData = farmsPosRewardsData[currentPosBaseInfo?.id as string]
  const currentPosRewardsData = posRewardsData[currentPosBaseInfo?.posId as string]
  const getTokensPrice = () => {
    const coinAddresses = currentPosRewardsData?.map((item: any) => item?.coin_address) || []
    const rewarderTypes = posFarmsData?.map((item: any) => item?.rewarder_type) || []
    const additionalTokens = [currentPosBaseInfo?.tokenA?.coin_type, currentPosBaseInfo?.tokenB?.coin_type].filter(Boolean)
    const uniqueTokens = Array.from(new Set([...coinAddresses, ...additionalTokens, ...rewarderTypes]))
    fetchTokenPrices(uniqueTokens)
  }
  useEffect(() => {
    getTokensPrice()
  }, [currentPosBaseInfo?.posId, currentPosRewardsData?.length, posFarmsData?.length])

  // 接口查询池子信息 FarmsBlock展示apr 以及添加和移除时的奖励coin_types
  const { getPoolList } = useGetPoolList()
  const getPosPoolPoolData = async () => {
    if (!currentPosBaseInfo?.clmmPool) return
    const poolDataList: any = await getPoolList({ pool: currentPosBaseInfo?.clmmPool, display_all_pools: true })
    console.log('🚀 ~ getPoolData ~ poolInfo:', currentPosBaseInfo, poolDataList)
    if (poolDataList) {
      return setCurrentPosPoolInfo(poolDataList?.list[0])
    }
  }

  // 20s轮询current_sqrt_price 防止提交交易时报错
  // const { getContractPoolInfo } = useGetContractPoolInfo()
  const { getPosPoolsOriginalObj, getPosPoolsRelatedData } = useGetPosPools()
  const { getPosLiquidityData } = useGetPosLiquiditys()

  const handleGetPrice = async () => {
    if (currentPosBaseInfo?.clmmPool) {
      const posInfo: any = await getCurrentPosByPosId(currentAccount?.address, position_nft_id as string)
      if (isAvailableObject(posInfo) && posInfo) {
        const contractPoolInfo = await getPosPoolsOriginalObj([posInfo as PosBaseInfo])
        if (isAvailableObject(contractPoolInfo)) {
          console.log('🚀 ~ handleGetPrice ~ contractPoolInfo:', posInfo, contractPoolInfo)
          // const contractPoolInfo = await getContractPoolInfo(currentPosBaseInfo?.clmmPool)
          getPosPoolsRelatedData([posInfo], contractPoolInfo)
          const info = contractPoolInfo[posInfo?.clmmPool]

          console.log('🚀 ~ handleGetPrice ~ [currentPosBaseInfo?.clmmPool]:', info, curPosContractPoolInfo)
          if (info?.current_sqrt_price !== curPosContractPoolInfo?.current_sqrt_price) {
            getPosLiquidityData([posInfo], contractPoolInfo)
          }
          setCurrentPoolSqrtPrice(info?.current_sqrt_price)
          setCurPosContractPoolInfo(info)
        }
      }
    }
  }

  const { setFromCoin, setToCoin, fromCoin, toCoin } = useSwapWidgetStore()
  useEffect(() => {
    getPosPoolPoolData()
    handleGetPrice()
    let priceInterval: any
    if (currentPosBaseInfo?.clmmPool) {
      priceInterval = setInterval(() => {
        handleGetPrice()
      }, 20000)
    }
    /**
     * 切换小组件token与当前池子相同
     */
    if (currentPosBaseInfo?.displayTokenA && currentPosBaseInfo?.displayTokenB) {
      setFromCoin(currentPosBaseInfo?.displayTokenA)
      setToCoin(currentPosBaseInfo?.displayTokenB)
    }
    console.log('🚀🚀🚀 ~ PositionDetail.tsx:159 ~ useEffect ~ currentPosBaseInfo:', currentPosBaseInfo)

    return () => {
      clearInterval(priceInterval) // 清除 priceInterval
      setFromCoin(envConfigs.clmm_swap.from_coin)
      setToCoin(envConfigs.clmm_swap.to_coin)
    }
  }, [currentPosBaseInfo?.clmmPool])

  useEffect(() => {
    if (!posTab || posTab == 'increase') {
      setCurrentPosDetailTab('increase')
    }
    if (currentAccount?.address) {
      fetchAccountBalance()
    }

    // todo: 反馈第一次切换到rebalance的custom时候区间展示异常，但交互层暂时没发现问题，所以暂时在进入详情页时清空tick数据来观察下
    setLowerTickData({})
    setUpperTickData({})
    return () => {
      setCurPosContractPoolInfo(null)
      setCurrentPosBaseInfo(null)
      setCurrentPosPoolInfo(null)
      setUseZapIn(false)
      setIsPriceDirect(undefined)
      setIsDirect(undefined)
      setLowerTickData({})
      setUpperTickData({})
    }
  }, [])

  const currentPosPoolsRelatedData = useMemo(() => {
    return posPoolsRelatedData[currentPosBaseInfo?.posId]
  }, [posPoolsRelatedData, currentPosBaseInfo?.posId])

  const isActive = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus == 'Active'
  }, [currentPosPoolsRelatedData])

  const isInActive = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus == 'Inactive'
  }, [currentPosPoolsRelatedData])

  const hasStatus = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus !== undefined
  }, [currentPosPoolsRelatedData])
  // 仓位已经单边应该取消zap模式
  // useEffect(() => {
  //   if (!isActive) {
  //     setUseZapIn(false)
  //   }
  // }, [isActive])

  useRpcListener({
    onRpcChange: () => {
      getPosData(true)
      handleGetPrice()
      if (currentAccount?.address) {
        fetchAccountBalance()
      }
    }
  })
  const { isApp } = useWindowWidth()

  const handleConsoleSnapLog = () => {
    if (currentPosBaseInfo?.posId) {
      getPoolLiquiditySnapshot(currentPosBaseInfo)
    }
  }
  const { setBackUrl, backUrl } = useGlobalStore()

  const handleBack = () => {
    // todo: 暂时为解决仓位和流动性页面跳转死循环的问题 ，后面应对整站跳转做优化
    // return
    if (backUrl && !backUrl.includes('position-detail')) {
      navigate(-1)
    } else {
      navigate('/pools?tab=positions')
    }
  }

  const [positionApr, setPositionApr] = useState<any>(null)
  const [originResult, setOriginResult] = useState<any>(null)
  const { getClmmPositionDailyEarning } = useGetClmmPositionDailyEarning()
  const [getDailyEarning, setGetDailyEarning] = useState(true)
  const handleGetPositionApr = async () => {
    setGetDailyEarning(true)
    try {
      const res = await getClmmPositionDailyEarning(currentPosBaseInfo?.posId, currentPosTvl)
      if (res) {
        const { totalDailyExpansionFactorUSD, aprDisplay, dailyEarnUSDDisplay, originResult } = res
        console.log('🚀🚀🚀 ~ PositionChartInfo.tsx:155 ~ handleGetPositionApr ~ originResult:', originResult)
        setPositionApr(aprDisplay)
        setTotalDailyExpansionFactorUSD(totalDailyExpansionFactorUSD)
        setOriginResult(originResult)
      }
      setGetDailyEarning(false)
    } catch (error) {
      setGetDailyEarning(false)
    }
  }

  useEffect(() => {
    console.log('🚀 ~ PositionDetail ~ currentPosTvl:', currentPosTvl)
    if (currentPosBaseInfo?.posId) {
      if (d(currentPosTvl).gt(0)) {
        handleGetPositionApr()
      } else {
        setGetDailyEarning(false)
      }
    }
  }, [currentPosBaseInfo?.posId, currentPosTvl])

  // useInterval({
  //   interval: 5 * 1000,
  //   callback: () => {
  //     handleGetPositionApr()
  //   }
  // })

  const handleRefresh = () => {
    console.log('🚀 ~ handleRefresh ~ handleRefresh:')
    setIsPosDetailRefresh(true)
    getPosData(true)
    getPosPoolPoolData()
    getTokensPrice()
    fetchAccountBalance()
    handleGetPrice()
    handleGetPositionApr()
    setTimeout(() => {
      setIsPosDetailRefresh(false)
    }, 1000)
    // getHistory(currentPosBaseInfo?.id as string, currentPosBaseInfo?.posId as string)
  }

  return (
    <VStack gap="12px" w="100%" pt="20px" align="flex-start">
      <HStack w="100%" justifyContent="space-between" flexDirection={{ base: 'column-reverse', lg: 'row' }}>
        <HStack w={{ base: '100%', lg: 'unset' }} justifyContent="space-between">
          <BackButton
            onClick={() => {
              handleBack()
            }}
          />
          {/* toDo: 后面删除掉 */}
          {envConfigs?.env === 'testnet' && !!currentPosBaseInfo?.vestData && (
            <Button h="32px" borderRadius="8px" onClick={handleConsoleSnapLog}>
              Print snapshot
            </Button>
          )}
          {isApp && (
            <HStack>
              <SlippageRefreshMEV
                tokenA={currentPosBaseInfo?.tokenA}
                tokenB={currentPosBaseInfo?.tokenB}
                showNewTolerance={currentPosDetailTab !== 'rebalance' && useZapIn}
              />
              <RefreshButton handleRefresh={handleRefresh} isAutoRefresh refreshInterval={5} w="28px" h="28px" innerStyle={{ bg: 'bg_secondary' }} />
            </HStack>
          )}
        </HStack>
        <HStack w={{ base: '100%', lg: 'unset' }}>
          {!currentPosBaseInfo?.isFrozen ? (
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
                setBackUrl(`/position-detail/${currentPosBaseInfo?.id}`)
                navigate(`/clmm?poolAddress=${currentPosBaseInfo?.clmmPool}`)
              }}
            >
              Create a new position
            </Button>
          ) : null}

          {!isApp && (
            <RefreshButton refreshInterval={5} handleRefresh={handleRefresh} isAutoRefresh w="32px" h="32px" innerStyle={{ bg: 'bg_secondary' }} />
          )}
        </HStack>
      </HStack>
      <DetailHeaderInfo />
      <HStack w="100%" align="flex-start" gap={{ base: '12px', lg: '16px' }} flexDirection={{ base: 'column-reverse', lg: 'row' }}>
        <VStack w={{ base: '100%', lg: '60%' }} gap={{ base: '12px', lg: '16px' }} key={`${currentPosBaseInfo?.posId}-posInfo`}>
          <PositionChartInfo positionApr={isInActive ? '0%' : hasStatus ? positionApr : null} isAprLoading={getDailyEarning} />
          <DetailStatsInfo handleRefresh={handleRefresh} />
          {/* <PositionHistory /> */}
        </VStack>
        <VStack w={{ base: '100%', lg: '40%' }} gap="0">
          <HStack w="100%" p="0 16px 12px" bg="card_bg" borderRadius="16px 16px 0 0 ">
            <SelectTab
              type="borderTab"
              bg="none"
              wrapStyle={{
                w: '100%',
                h: '60px',
                border: 'none',
                bg: 'none'
              }}
              itemStyle={{
                w: { base: `calc(100% / ${tabList?.length} )`, lg: 'unset' },
                fontSize: '16px',
                mr: { base: 0, lg: '28px' }
              }}
              tabList={tabList}
              currentTab={currentPosDetailTab == 'increase' ? 'Add' : currentPosDetailTab == 'remove' ? 'Remove' : 'Rebalance'}
              handleChangeTab={(item: any) => {
                setCurrentPosDetailTab(item?.value)
              }}
            />
            {!isApp && (
              <SlippageRefreshMEV
                tokenA={currentPosBaseInfo?.tokenA}
                tokenB={currentPosBaseInfo?.tokenB}
                showNewTolerance={currentPosDetailTab !== 'rebalance' && useZapIn}
              />
            )}
          </HStack>
          {currentPosDetailTab == 'increase' && <IncreaseBlock />}
          {currentPosDetailTab == 'remove' && <RemoveBlock />}
          {currentPosDetailTab == 'rebalance' && <RebalanceBlock />}
        </VStack>
      </HStack>
    </VStack>
  )
}
const SlippageRefreshMEV = ({ tokenA, tokenB, showNewTolerance }: { tokenA?: Token; tokenB?: Token; showNewTolerance?: boolean }) => {
  return (
    <HStack>
      <Slippage slippageType="liquidity" poolType="clmm" tokenA={tokenA} tokenB={tokenB} showNewTolerance={showNewTolerance} />
      {/* <MEVProtect /> */}
    </HStack>
  )
}
export default PositionDetail
