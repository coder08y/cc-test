import { FarmsBanner } from '@/components/farms/FarmsBanner'
import FarmsListH5 from '@/components/farms/FarmsListH5'
import { FarmsTabFilter } from '@/components/farms/FarmsTabFilter'
import { FarmsTable } from '@/components/farms/FarmsTable'
import useGetFarmList from '@/hooks/farms/useGetFarmList'
import usePositionList from '@/hooks/position/usePositionList'
import usePositionStore from '@/store/position'
import { PosBaseInfo, PosReward } from '@/types'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { SortDropType } from '@cetus/design/src/components/common/SortDropBlock'
import { useAccountBalance, useRpcListener } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { d } from '@cetus/utils'
import { Box, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

function Farms() {
  const { currentAccount } = useAccountStore()
  const { getPositionBaseList, getPosRelatedData } = usePositionList()
  const { posBaseList, posBaseListLoading, farmsPosRewardsData, farmsPosRewardsDataLoading } = usePositionStore()
  const { getFarmList } = useGetFarmList()
  const [farmsList, setFarmsList] = useState<any>([])
  const [farmsLiveList, setFarmsLiveList] = useState<any>([])
  const [myFarmsList, setMyFarmsList] = useState<any>([])
  const [farmsListLoading, setFarmsListLoading] = useState<boolean>(true)
  const [positionList, setPositionList] = useState<PosBaseInfo[]>([])
  const { fetchAccountBalance } = useAccountBalance()

  const [currTab, setCurrTab] = useState<Tab<object>>({
    label: 'Live'
  })

  const sortByList: SortDropType[] = [
    {
      label: 'APR',
      value: 'apr'
    },
    {
      label: 'TVL',
      value: 'tvl'
    }
  ]
  const [queryOptions, setQueryOptions] = useState<any>({
    sortRule: 'desc',
    sortType: 'tvl'
  })
  const [currSortType, setCurrSortType] = useState<SortDropType>({
    label: 'TVL',
    value: 'tvl'
  })

  const tabList = useMemo(() => {
    const list: Tab<object>[] = []
    list.push({
      label: 'Live',
      num: !farmsListLoading ? farmsLiveList.length.toString() : undefined
    })

    list.push({
      label: 'Your Farms',
      num: myFarmsList.length > 0 && currentAccount?.address && !farmsListLoading ? myFarmsList.length.toString() : undefined
    })
    return list
  }, [currTab.label, farmsListLoading, farmsLiveList, myFarmsList, currentAccount?.address])

  const getPositionList = async () => {
    if (currentAccount?.address) {
      const list = await getPositionBaseList(currentAccount?.address, { isFarmsPage: true })
      console.log('🚀 ~ getPositionList ~ currentAccount?.address:', currentAccount?.address)
    } else {
      setPositionList([])
    }
  }

  // useEffect(() => {
  //   console.log('🚀 ~ useEffect ~ posBaseList:', posBaseList)
  //   getPosRelatedData(posBaseList, true)
  // }, [JSON.stringify(posBaseList)])

  const fetchFarmsList = async (queryOptions: any) => {
    const order_by = queryOptions?.sortRule == 'desc' ? '-' + queryOptions?.sortType : queryOptions?.sortType
    const res = await getFarmList(order_by)
    if (res) {
      setFarmsList(res)
    }
  }

  useEffect(() => {
    console.log('🚀 ~ Farms ~ positionList:', positionList)
    if (farmsList.length > 0) {
      if (currTab.label == 'Live') {
        setFarmsLiveList(farmsList.filter((item: any) => item?.haveFarming))
        setFarmsListLoading(false)
      }

      if (currentAccount?.address && positionList?.length > 0) {
        const myList = farmsList.filter((item: { poolAddress: string }) => {
          console.log('🚀🚀🚀 ~ Farms.tsx:106 ~ myList ~ item:', item)
          const posItems = positionList?.filter(pos => pos?.posType === 'farms') // 获取所有符合条件的条目
          console.log('🚀🚀🚀 ~ Farms.tsx:103 ~ myList ~ posItems:', posItems)
          return posItems.some(pos => item?.poolAddress === pos?.clmmPool) // 检查是否有匹配
        })
        console.log('🚀🚀🚀 ~ Farms.tsx:104 ~ myList ~ myList:', myList)
        setMyFarmsList(myList)
      } else {
        setMyFarmsList([])
      }
      if (!posBaseListLoading) {
        setFarmsListLoading(false)
      }
    } else {
      setFarmsLiveList([])
      setMyFarmsList([])
    }
  }, [currTab.label, farmsList, currentAccount?.address, positionList, posBaseListLoading])

  useEffect(() => {
    fetchFarmsList(queryOptions)
    if (currentAccount?.address) {
      setFarmsListLoading(true)
      getPositionList()
    } else {
      setPositionList([])
    }
  }, [currentAccount?.address])

  useEffect(() => {
    setPositionList(posBaseList)
  }, [posBaseList])

  const handleRefresh = () => {
    setFarmsListLoading(true)
    fetchFarmsList(queryOptions)
    // fetchAccountBalance()
    getPositionList()
  }

  useRpcListener({
    onRpcChange: () => {
      // getPositionList()
      handleRefresh()
    }
  })

  const { fetchTokenPrices } = useTokenPrice()

  // 刷新页面时重新查token价格
  const getTokensPrice = () => {
    const coinTypeList: string[] = []
    farmsList?.forEach((data: any) => {
      if (!coinTypeList.includes(data.tokenA.coin_type)) {
        coinTypeList.push(data.tokenA.coin_type)
      }
      if (!coinTypeList.includes(data.tokenB.coin_type)) {
        coinTypeList.push(data.tokenB.coin_type)
      }
      if (data?.farmsRewarderList?.length > 0) {
        data?.farmsRewarderList?.forEach((reward: any) => {
          coinTypeList.push(reward?.coinType)
        })
      }
    })
    if (coinTypeList.length > 0) {
      fetchTokenPrices(Array.from(new Set(coinTypeList)))
    }
  }

  useEffect(() => {
    if (farmsList?.length > 0) {
      getTokensPrice()
    }
  }, [farmsList])

  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()

  const totalEarned = useMemo(() => {
    if (!currentAccount?.address) return '--'
    if (!posBaseListLoading && !farmsPosRewardsDataLoading) {
      // 累加所有仓位的farms奖励
      return posBaseList.reduce((total: any, item: PosBaseInfo) => {
        // 累加单个仓位的所有farms奖励
        const posFarmsData = farmsPosRewardsData[item?.id] || []
        const totalAmount = posFarmsData.reduce((sum: any, rewardData: PosReward) => {
          if (sum === '--') return '--'

          const amountValue = getTokenAmountValue(rewardData?.token.coin_type, rewardData?.display_amount_owed, '--')
          return amountValue === '--' ? '--' : d(sum).plus(amountValue).toString()
        }, '0')

        return total === '--' || totalAmount === '--' ? '--' : d(total).plus(totalAmount).toString()
      }, '0')
    }
  }, [posBaseListLoading, farmsPosRewardsData, farmsPosRewardsDataLoading, coinPriceObj, currentAccount?.address])
  const { isApp } = useWindowWidth()
  return (
    <VStack gap="20px" w="100%">
      <FarmsBanner totalRewards={totalEarned as string} />
      <Box h="220px" />
      {/* 切换Tab 和 排序 */}
      <VStack gap="20px" w="100%" maxW="1200px">
        <FarmsTabFilter
          sortByList={sortByList}
          currTab={currTab}
          tabList={tabList}
          handleChangeTab={(tab: Tab<object>) => {
            setCurrTab(tab)
          }}
          currSortType={currSortType}
          onSortByChange={(type: SortDropType) => {
            setFarmsListLoading(true)
            queryOptions.sortType = type.value as any
            setQueryOptions({ ...queryOptions })
            setCurrSortType(type)
            fetchFarmsList(queryOptions)
          }}
          sortRule={queryOptions.sortRule}
          handleChangeSortRule={(sortRule: any) => {
            setFarmsListLoading(true)
            queryOptions.sortRule = sortRule
            setQueryOptions({ ...queryOptions })
            fetchFarmsList(queryOptions)
          }}
          handleRefresh={handleRefresh}
        />
        {isApp && (
          <Text w="100%" fontSize="20px" color="text_caption" mb="-8px">
            Pools
          </Text>
        )}
        {!isApp && (
          <FarmsTable
            dataList={currTab.label == 'Live' ? farmsLiveList : myFarmsList}
            showSkeletonLoading={farmsListLoading}
            currTabLabel={currTab?.label}
          />
        )}
        {isApp && (
          <FarmsListH5
            dataList={currTab.label == 'Live' ? farmsLiveList : myFarmsList}
            showSkeletonLoading={farmsListLoading}
            currTabLabel={currTab?.label}
          />
        )}
      </VStack>
    </VStack>
  )
}

export default Farms
