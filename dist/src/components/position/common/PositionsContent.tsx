import useNotifiSubscription from '@/hooks/notifi/useNotifiSubscription'
import useGetClmmPositionDailyEarning from '@/hooks/position/useGetClmmPositionDailyEarning'
import useGetDlmmPositionDailyEarning from '@/hooks/position/useGetDlmmPositionDailyEarning'
import usePositionList from '@/hooks/position/usePositionList'
import useStatistics from '@/hooks/stats/useStatistics'
import useCommonGlobalStore from '@/store/common/global'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePoolsStore from '@/store/pool'
import usePositionStore from '@/store/position'
import { GetPositionDailyEarningsOptions } from '@/types/dlmm'
import { useRpcListener } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useNotifiStore from '@cetus/stores/src/notifi'
import { Token } from '@cetus/types'
import { NoData } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { Box, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useEffect, useState } from 'react'
import LiquidityAndYield from './LiquidityAndYield'
import PoolItem from './PoolItem'
import PositionListLoading from './PositionListLoading'
import PositionTypeAndCollapse from './PositionTypeAndCollapse'

interface PositionsContentProps {
  isRefreshed: boolean
  handleIsRefreshed: (isFreshed: boolean) => void
  onRefreshHandlerRegistered?: (handler: () => Promise<void>) => void
  onManualRefresh?: () => void
  setPaginationLoading?: (loading: boolean) => void
}

function PositionsContent({ isRefreshed, handleIsRefreshed, onRefreshHandlerRegistered, onManualRefresh }: PositionsContentProps) {
  const { isApp } = useWindowWidth()
  const { getStatistics } = useStatistics()
  const { setIsTopProgressLoading } = useCommonGlobalStore()
  const { fetchTokenPrices } = useTokenPrice()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { getPositionBaseList } = usePositionList()
  const {
    posRewardsData,
    farmsPosRewardsData,
    posBaseList,
    showPosListLength,
    setShowPosListLength,
    setMyPosYieldValue,
    posBaseListLoading,
    posLiquidityData,
    setPosBaseList,
    setPosBaseListLoading
  } = usePositionStore()
  const { dlmmPosBaseList, dlmmPosRewardsData, dlmmPosLiquidityData, setDlmmPosBaseList } = useDlmmPositionStore()
  const [showPosListGroupByPool, setShowPosListGroupByPool] = useState<any>([])
  const { getNotifiPositionTransfer } = useNotifiSubscription()
  const totalPositionList = [...posBaseList, ...dlmmPosBaseList]
  const [showDataLoading, setShowDataLoading] = useState<boolean>(true)
  // 区分初始加载和动态刷新
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false)

  useEffect(() => {
    setPosBaseListLoading(true)
    // setPosBaseList([])
    // setDlmmPosBaseList([])
    // setShowPosListGroupByPool([])
  }, [currentAccount?.address])
  const handleRefresh = (isManual: boolean = true) => {
    if (onManualRefresh) {
      onManualRefresh()
    }
    // console.log('🚀 ~ handleRefresh ~ handleRefresh:', isManual ? '手动刷新' : '自动刷新')
    handleIsRefreshed(false)
    setMyPosYieldValue('')
    getStatistics()
    refreshTokenPrice()
    if (currentAccount?.address) {
      if (isManual) {
        // 手动点击刷新按钮时显示骨架屏
        setIsInitialLoad(true)
        setShowDataLoading(true)
        handleGetPositionList(currentAccount?.address, true)
      } else {
        // 自动刷新时不显示骨架屏，增量更新
        handleGetPositionList(currentAccount?.address, false)
      }
    }
    setTimeout(() => {
      handleIsRefreshed(true)
    }, 1000)
  }

  const { getClmmPositionDailyEarnings } = useGetClmmPositionDailyEarning()
  const { getDlmmPositionDailyEarnings } = useGetDlmmPositionDailyEarning()
  const { getTokenAmountValue } = useTokenPrice()

  useDebounceEffect(() => {
    if (posBaseList?.length > 0 && posLiquidityData && Object.keys(posLiquidityData).length > 0) {
      const options: GetPositionDailyEarningsOptions[] = posBaseList.map(item => {
        const currentPosLiquidity = posLiquidityData[item?.posId]
        const amountValueA = getTokenAmountValue(item?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
        const amountValueB = getTokenAmountValue(item?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)
        return {
          position_id: item?.posId,
          current_pool_tvl: d(amountValueA).plus(amountValueB).toString()
        }
      })
      getClmmPositionDailyEarnings(options)
    }
  }, [posBaseList, posLiquidityData, getTokenAmountValue])

  useDebounceEffect(() => {
    if (dlmmPosBaseList?.length > 0 && dlmmPosLiquidityData && Object.keys(dlmmPosLiquidityData).length > 0) {
      const options: GetPositionDailyEarningsOptions[] = dlmmPosBaseList.map(item => {
        const currentPosLiquidity = dlmmPosLiquidityData[item?.id]
        const amountValueA = getTokenAmountValue(item?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
        const amountValueB = getTokenAmountValue(item?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)

        return {
          position_id: item?.id,
          current_pool_tvl: d(amountValueA).plus(amountValueB).toString()
        }
      })
      getDlmmPositionDailyEarnings(options)
    }
  }, [dlmmPosBaseList, dlmmPosLiquidityData, getTokenAmountValue])

  useEffect(() => {
    if (onRefreshHandlerRegistered && currentAccount?.address) {
      const handler = async () => {
        const walletAddress = currentAccount?.address

        if (!walletAddress) {
          return
        }

        refreshTokenPrice()

        try {
          // 自动刷新时不重置 isInitialLoad，保持现有状态
          await getPositionBaseList(walletAddress)
        } catch (error) {
          console.error('Auto refresh positions error:', error)
        }
      }
      onRefreshHandlerRegistered(handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRefreshHandlerRegistered, currentAccount?.address])
  useRpcListener({
    onRpcChange: () => {
      if (currentAccount?.address) {
        // RPC 变化时不显示骨架屏，作为刷新处理
        handleGetPositionList(currentAccount?.address, false)
      }
    }
  })
  const [selectCoinList, setSelectCoinList] = useState<Token[]>([])
  const onClickSelectCoinList = (tokenInfo: Token) => {
    // console.log('🚀 ~ onClickIncentiveTypes ~ tokenInfo:', tokenInfo)
    setSelectCoinList(prev => [...prev, tokenInfo])
  }
  const onDeleteSelectCoinList = (tokenInfo: Token) => {
    // console.log('🚀 ~ onClickIncentiveTypes ~ tokenInfo:', tokenInfo)
    setSelectCoinList(prev => prev.filter(ele => ele?.coin_type !== tokenInfo?.coin_type))
  }
  useEffect(() => {
    setMyPosYieldValue('')
    if (currentAccount?.address) {
      // console.log('🚀 ~ useEffect ~ currentAccount?.address:', currentAccount?.address)
      // 切换账户时作为初始加载
      setIsInitialLoad(true)
      handleGetPositionList(currentAccount?.address, true)
    } else {
      setShowPosListLength({})
      setIsInitialLoad(true)
      setHasLoadedOnce(false)
    }
  }, [currentAccount?.address])

  const handleGetPositionList = async (walletAddress: string, isInitial: boolean = false) => {
    console.log('🚀 ~ handleGetPositionList ~ handleGetPositionList:')
    // 只有初始加载时才显示顶部进度条
    if (isInitial) {
      setIsTopProgressLoading(true)
    }

    try {
      await getPositionBaseList(walletAddress)
      // 加载完成后标记已完成首次加载
      if (isInitial) {
        setHasLoadedOnce(true)
        setIsInitialLoad(false)
      }
    } finally {
      if (isInitial) {
        setIsTopProgressLoading(false)
      }
    }
  }

  const { notifiClient, notifiSources } = useNotifiStore()
  useEffect(() => {
    getNotifiPositionTransfer(totalPositionList, notifiClient, notifiSources)
  }, [totalPositionList, notifiClient, notifiSources])

  // 刷新token价格
  const refreshTokenPrice = () => {
    const list: any = []
    if (totalPositionList?.length > 0) {
      totalPositionList.map(item => {
        list.push(extractStructTagFromType(item?.coinTypeA).full_address)
        list.push(extractStructTagFromType(item?.coinTypeB).full_address)
        const currentPosData =
          item?.posType === 'dlmm'
            ? dlmmPosRewardsData[item?.id] || []
            : item?.posType == 'clmm'
              ? posRewardsData[item?.posId] || []
              : posRewardsData[item?.id] || []
        const currentPosFarmsData = farmsPosRewardsData[item?.id] || []
        const rewardsArr = currentPosData.concat(currentPosFarmsData)
        rewardsArr?.map((reward: any) => {
          if (d(reward?.display_amount_owed).gt(0)) {
            list.push(extractStructTagFromType(reward?.token?.coin_type).full_address)
          }
        })
      })
      const tokenArr: any = Array.from(new Set(list))
      // console.log('🚀 ~ refreshTokenPrice ~ list:', totalPositionList, list, tokenArr)
      fetchTokenPrices(tokenArr)
    }
  }

  useEffect(() => {
    refreshTokenPrice()
  }, [totalPositionList?.length, posRewardsData, dlmmPosRewardsData])

  useEffect(() => {
    getStatistics()
    // 组件卸载时 列表条数重置
    return () => {
      setShowPosListLength({})
    }
  }, [])
  useEffect(() => {
    // 初始加载时清空列表长度
    if (posBaseListLoading && isInitialLoad) {
      setShowPosListLength({})
    }
    // 只有初始加载完成后才设置 showDataLoading 为 false
    if (!posBaseListLoading && isInitialLoad) {
      setTimeout(() => {
        setShowDataLoading(false)
      }, 200)
    }
    // 非初始加载时，loading 变化不影响 showDataLoading
    if (!posBaseListLoading && !isInitialLoad) {
      setShowDataLoading(false)
    }
  }, [posBaseListLoading, isInitialLoad])

  const { setIsExpandAllPosition, isExpendPositionMap, setIsExpendPosition, clearIsExpendPositionMap } = usePoolsStore()

  useEffect(() => {
    const isExpandAll = Object.values(isExpendPositionMap).every(item => item)
    setIsExpandAllPosition(isExpandAll)
  }, [isExpendPositionMap])

  useEffect(() => {
    return () => {
      clearIsExpendPositionMap()
    }
  }, [])

  return (
    <VStack gap={{ base: '0px', lg: '16px' }} w="100%" mb={{ base: '-40px', lg: '0' }}>
      {!isApp && <LiquidityAndYield isInitialLoad={isInitialLoad} />}

      <Box w="100%">
        <PositionTypeAndCollapse
          isProfile={false}
          isVaults={false}
          isShowChildren={!!totalPositionList && totalPositionList?.length > 0}
          handleRefresh={handleRefresh}
          selectCoinList={selectCoinList}
          onClickSelectCoinList={onClickSelectCoinList}
          onDeleteSelectCoinList={onDeleteSelectCoinList}
          showPosListGroupByPool={showPosListGroupByPool}
          changeShowPosListGroupByPool={(val: any) => setShowPosListGroupByPool(val)}
          isInitialLoad={isInitialLoad}
        />
      </Box>
      {!isApp && <Box h="1px" w="100%" bg="border" mb={{ base: '12px', lg: 0 }} />}

      {
        <VStack px="0" w="100%" gap={{ base: '0', lg: '16px' }}>
          {!currentAccount?.address ? (
            <NoData type="nowallet" imgSize="140px" onboard={() => onWalletModal(true)} imgStyle={{ mb: '0px' }} />
          ) : isInitialLoad && (posBaseListLoading || showDataLoading) ? (
            // 初始加载或手动刷新时显示骨架屏
            [{}, {}, {}, {}].map((item, index) => {
              return <PositionListLoading key={index} />
            })
          ) : showPosListGroupByPool?.length > 0 ? (
            showPosListGroupByPool.map((item: any, index: number) => {
              return (
                <VStack w="100%" gap="0px" key={item?.clmmPoolAddress || item?.dlmmPoolAddress}>
                  <PoolItem poolInfo={item} showDivider={index !== showPosListGroupByPool?.length - 1} />
                </VStack>
              )
            })
          ) : (
            <NoData type="nodata" text="No Liquidity Positions" />
          )}
        </VStack>
      }
    </VStack>
  )
}

export default PositionsContent
