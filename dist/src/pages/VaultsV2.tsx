import VaultsListH5 from '@/components/vaults-v2/list/H5/VaultsListH5'
import { VaultsListPC } from '@/components/vaults-v2/list/PC/VaultsListPC'
import { VaultsBanner } from '@/components/vaults-v2/list/VaultsBanner'
import { VaultsTabFilter } from '@/components/vaults-v2/list/VaultsTabFilter'
import useGetVaultsContract from '@/hooks/vault-v2/useGetVaultsContract'
import useGetVaultsPosition from '@/hooks/vault-v2/useGetVaultsPosition'
import useVaultList from '@/hooks/vault-v2/useVaultList'
import useGetVaultsFarmingApiInfo from '@/hooks/vaults-farming/useGetVaultsFarmingApiInfo'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { QueryVaultListOptions } from '@/types/vaults'
import { SortDropType } from '@cetus/design/src/components/common/SortDropBlock'
import { useAccountBalance, useInterval } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useSdkStore } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { isAvailableObject } from '@cetus/utils'
import { Box, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function VaultsV2() {
  const { vaultListLoading, setVaultListLoading, vaultsList, vaultsTokenList } = useVaultsListV2Store()
  const { fetchAccountBalance } = useAccountBalance()
  const { currentAccount } = useAccountStore()
  const { vaultPageList, fetchVaultList, filterVaultList, sortVaultList } = useVaultList()

  const [isYourHoldings, setIsYourHoldings] = useState(false)
  const [isIncentivizedOnly, setIsIncentivizedOnly] = useState(false)
  const [selectCoinList, setSelectCoinList] = useState<Token[]>([])

  const handleChangeIsIncentivizedOnly = (value: boolean) => {
    setIsIncentivizedOnly(value)
    filterVaultList({ sortOptions: queryOptions, currentTab: currentTab.value, isYourHoldings, selectCoinList, isIncentivizedOnly: value })
  }
  const { clearVaultsPositionObj, vaultsPositionObj, setVaultsPositionObj } = useVaultsPositionStore()

  const [queryOptions, setQueryOptions] = useState<QueryVaultListOptions>({
    sortRule: 'desc',
    sortType: 'tvl'
  })

  const sortByList: SortDropType[] = [
    { label: 'APY', value: 'apr' },
    { label: 'TVL', value: 'tvl' }
  ]
  const [currSortType, setCurrSortType] = useState<SortDropType>(sortByList[1])

  // 初始化拉取数据
  useEffect(() => {
    fetchVaultList({ sortOptions: queryOptions, currentTab: currentTab.value, isYourHoldings, selectCoinList, isIncentivizedOnly })
  }, [])

  useEffect(() => {
    if (!currentAccount?.address) {
      // setIsYourHoldings(false)
      clearVaultsPositionObj()
    }
  }, [currentAccount?.address])

  useEffect(() => {
    if (Object.values(vaultsPositionObj).length == vaultsList.length && vaultsList.length > 0) {
      filterVaultList({
        sortOptions: queryOptions,
        currentTab: currentTab.value,
        isYourHoldings,
        selectCoinList,
        status: currentStatus,
        isIncentivizedOnly
      })
      setVaultListLoading(false)
    }
  }, [vaultsPositionObj, vaultsList])

  const { isApp } = useWindowWidth()
  const [refreshCount, setRefreshCount] = useState<number>(0)

  // 移动端使用更长的刷新间隔
  const refreshInterval = isApp ? 120000 : 60000 // 移动端2分钟，桌面端1分钟
  const maxRefreshCount = isApp ? 30 : 60

  useInterval({
    interval: refreshInterval,
    callback: () => {
      setRefreshCount(refreshCount + 1)
      if (refreshCount >= maxRefreshCount) {
        setRefreshCount(0)
        fetchVaultList(
          { sortOptions: queryOptions, currentTab: currentTab.value, isYourHoldings, selectCoinList, status: currentStatus, isIncentivizedOnly },
          false
        )
        // if (currentAccount?.address) {
        //   getVaultsPosition(vaultsList)
        // }
      }
    }
  })

  // const handleSortChange = (type: SortDropType) => {
  //   console.log('🚀🚀🚀 ~ VaultsV2.tsx:87 ~ handleSortChange ~ type:', type)
  //   setRefreshCount(0)
  //   const updated = { ...queryOptions, sortType: type.value }
  //   console.log('🚀🚀🚀 ~ VaultsV2.tsx:89 ~ handleSortChange ~ updated:', updated)
  //   setCurrSortType(type)
  //   setQueryOptions(updated)
  //   sortVaultList(updated, vaultPageList)
  // }

  // const handleSortRuleChange = (sortRule: 'asc' | 'desc') => {
  //   setRefreshCount(0)
  //   const updated = { ...queryOptions, sortRule }
  //   setQueryOptions(updated)
  //   sortVaultList(updated, vaultPageList)
  // }

  const handleSortChange = (type: SortDropType) => {
    setCurrSortType(type)
    setRefreshCount(0)
    const updated = {
      ...queryOptions,
      sortType: type.value,
      sortRule: type?.value === queryOptions.sortType ? (queryOptions.sortRule == 'desc' ? 'asc' : 'desc') : queryOptions.sortRule
    }
    setQueryOptions(updated)
    sortVaultList(updated, vaultPageList)
  }

  const handleSelectCoin = (tokenInfo: Token) => {
    setRefreshCount(0)
    setSelectCoinList(prev => {
      const exists = prev.some(ele => ele?.coin_type === tokenInfo?.coin_type)
      if (exists) return prev
      const updated = [...prev, tokenInfo]
      filterVaultList({
        sortOptions: queryOptions,
        currentTab: currentTab.value,
        isYourHoldings,
        selectCoinList: updated,
        status: currentStatus,
        isIncentivizedOnly
      })
      return updated
    })
  }

  const handleDeleteCoin = (tokenInfo: Token) => {
    setRefreshCount(0)
    setSelectCoinList(prev => {
      const updated = prev.filter(ele => ele?.coin_type !== tokenInfo?.coin_type)
      filterVaultList({
        sortOptions: queryOptions,
        currentTab: currentTab.value,
        isYourHoldings,
        selectCoinList: updated,
        status: currentStatus,
        isIncentivizedOnly
      })
      return updated
    })
  }

  const handleToggleHoldings = () => {
    setRefreshCount(0)
    const newValue = !isYourHoldings
    setIsYourHoldings(newValue)
    filterVaultList({
      sortOptions: queryOptions,
      currentTab: currentTab.value,
      isYourHoldings: !isYourHoldings,
      selectCoinList,
      status: currentStatus,
      isIncentivizedOnly
    })
  }

  const handleRefresh = () => {
    setRefreshCount(0)
    setVaultListLoading(true)
    fetchAccountBalance()
    fetchVaultList({
      sortOptions: queryOptions,
      currentTab: currentTab.value,
      isYourHoldings,
      selectCoinList,
      status: currentStatus,
      isIncentivizedOnly
    })
  }

  const { getVaultsContractInfo } = useGetVaultsContract()
  const { isInitialized } = useSdkStore()
  const { getVaultPosition, getVaultPositionsV2 } = useGetVaultsPosition()
  const { vaultsFarmObj } = useVaultsFarmingStore()

  useEffect(() => {
    if (currentAccount?.address && isInitialized && isAvailableObject(vaultsFarmObj)) {
      // setVaultsPositionObj({})
      getVaultsInfo()
    }
  }, [currentAccount?.address, vaultsList.length, isInitialized, vaultsFarmObj])

  useEffect(() => {
    if (
      currentAccount?.address &&
      isAvailableObject(vaultsPositionObj) &&
      Object.values(vaultsPositionObj)[0]?.ownerAddress !== currentAccount?.address
    ) {
      setVaultsPositionObj({})
    }
  }, [vaultsPositionObj, currentAccount?.address])

  const [currentTab, setCurrentTab] = useState({
    label: 'All',
    value: 'all'
  })

  const handleVaultsTab = (data: any) => {
    setCurrentTab(data)
    filterVaultList({ sortOptions: queryOptions, currentTab: data.value, isYourHoldings, selectCoinList, status: currentStatus, isIncentivizedOnly })
  }

  const { getVaultsBalance } = useGetVaultsContract()
  const getVaultsInfo = async () => {
    // setVaultListLoading(true)
    // const { lstVaultContractInfoObj, haedalVaultContractInfoObj, allClmmPoolContractInfoObj, allDlmmPoolContractInfoObj, dlmmVaultContractInfoObj } =
    //   await getVaultsContractInfo(vaultsList)
    // const balance = await getVaultsBalance(currentAccount?.address)
    // for (let i = 0; i < vaultsList.length; i++) {
    //   const apiInfo = vaultsList[i]
    //   const lstVaultContractInfo = lstVaultContractInfoObj[apiInfo?.vaultId]
    //   const haedalVaultContractInfo = haedalVaultContractInfoObj[apiInfo?.vaultId]
    //   const vaultClmmPoolContractInfo = allClmmPoolContractInfoObj[apiInfo?.clmmPoolAddress]
    //   const vaultDlmmPoolContractInfo = allDlmmPoolContractInfoObj[apiInfo?.dlmmPoolAddress]
    //   const vaultContractInfo =
    //     apiInfo?.category == 'cetus'
    //       ? lstVaultContractInfo
    //       : apiInfo?.category == 'haedal'
    //         ? haedalVaultContractInfo
    //         : dlmmVaultContractInfoObj[apiInfo?.vaultId]
    //   if (vaultContractInfo && (apiInfo?.category == 'haevault_v2' ? vaultDlmmPoolContractInfo : vaultClmmPoolContractInfo)) {
    //     const lpTokenType = toLongCoinType(apiInfo?.lpTokenType)?.toLowerCase()
    //     getVaultPosition(
    //       apiInfo,
    //       apiInfo?.category == 'haevault_v2' ? vaultDlmmPoolContractInfo : vaultClmmPoolContractInfo,
    //       vaultContractInfo,
    //       false,
    //       balance[lpTokenType] || {}
    //     )
    //   }
    // }
    if (currentAccount?.address) {
      getVaultPositionsV2(currentAccount?.address, vaultsList, vaultsFarmObj)
    }
  }

  const { getHaedalFarmingList } = useGetVaultsFarmingApiInfo()
  // 页面刷新重新获取
  useEffect(() => {
    console.log('🚀🚀🚀 ~ VaultsV2.tsx:218 ~ VaultsV2 ~ vaultsFarmObj:', vaultsFarmObj)
    if (!isAvailableObject(vaultsFarmObj)) {
      getHaedalFarmingList()
    }
  }, [vaultsFarmObj])

  const vaultPoolStatusList = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Deprecated', value: 'sunset' }
  ]

  const [currentStatus, setCurrentStatus] = useState<string>('all')
  const handleStatusChange = (status: string) => {
    setCurrentStatus(status.value)
    filterVaultList({
      sortOptions: queryOptions,
      currentTab: currentTab.value,
      isYourHoldings,
      selectCoinList,
      status: status.value,
      isIncentivizedOnly
    })
  }

  return (
    <VStack gap="0px" w="100%">
      <VaultsBanner />
      <Box h={{ base: '260px', lg: '240px' }} />
      <VStack gap="0px" w="100%" maxW="1200px">
        <VaultsTabFilter
          sortByList={sortByList}
          whiteTokenList={vaultsTokenList}
          selectCoinList={selectCoinList}
          onClickSelectCoinList={handleSelectCoin}
          onDeleteSelectCoinList={handleDeleteCoin}
          showSkeletonLoading={vaultListLoading}
          currSortType={currSortType}
          onSortByChange={handleSortChange}
          sortRule={queryOptions.sortRule}
          // handleChangeSortRule={handleSortRuleChange}
          handleRefresh={handleRefresh}
          isYourHoldings={isYourHoldings}
          onClickIsYourHoldings={handleToggleHoldings}
          isIncentivizedOnly={isIncentivizedOnly}
          handleChangeIsIncentivizedOnly={handleChangeIsIncentivizedOnly}
          onClickVaultsTab={handleVaultsTab}
          currentTab={currentTab}
          vaultPoolStatusList={vaultPoolStatusList}
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
          vaultPoolStatusObj={vaultPoolStatusList.reduce((obj: any, item) => {
            obj[item.value] = item
            return obj
          }, {})}
        />
        {isApp ? (
          <VaultsListH5
            isShowPowered={true}
            dataList={vaultPageList}
            showSkeletonLoading={vaultListLoading}
            onSortByChange={handleSortChange}
            sortByList={sortByList}
            currSortType={currSortType}
            sortRule={queryOptions.sortRule}
            sortByObject={sortByList.reduce((obj: any, item) => {
              obj[item.value] = item
              return obj
            }, {})}
            currentStatus={currentStatus}
          />
        ) : (
          <VaultsListPC
            isShowPowered={true}
            dataList={vaultPageList}
            showSkeletonLoading={vaultListLoading}
            onSortByChange={handleSortChange}
            sortByList={sortByList}
            currSortType={currSortType}
            sortRule={queryOptions.sortRule}
            sortByObject={sortByList.reduce((obj: any, item) => {
              obj[item.value] = item
              return obj
            }, {})}
            currentStatus={currentStatus}
          />
        )}
      </VStack>
    </VStack>
  )
}
