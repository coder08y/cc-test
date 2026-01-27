import useDeepBookMarginPools from '@/hooks/deepbook/margin/useDeepbookMarginPools'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { Block, SelectTab, SortDropBlock } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { CheckBox, RefreshButton } from '@cetus/ui-kit'
import { Box, HStack, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useRef } from 'react'
import NewMenuButton from './NewMenuButton'

export default function MarginPoolFilter({ sortByList, clickSort }: { sortByList: any; clickSort: any }) {
  const { currentAccount } = useAccountStore()

  const marginPoolCap = useDeepBookMarginPoolStore(state => state.marginPoolCap)
  const selectCoinList = useDeepBookMarginPoolStore(state => state.selectCoinList)
  const setSelectCoinList = useDeepBookMarginPoolStore(state => state.setSelectCoinList)
  const isYourSupply = useDeepBookMarginPoolStore(state => state.isYourSupply)
  const setIsYourSupply = useDeepBookMarginPoolStore(state => state.setIsYourSupply)

  const currentPageTab = useDeepBookMarginPoolStore(state => state.currentPageTab)
  const setCurrentPageTab = useDeepBookMarginPoolStore(state => state.setCurrentPageTab)

  const historyCurrentAction = useDeepBookMarginPoolStore(state => state.historyCurrentAction)
  const setHistoryCurrentAction = useDeepBookMarginPoolStore(state => state.setHistoryCurrentAction)

  const historyCurrentPools = useDeepBookMarginPoolStore(state => state.historyCurrentPools)
  const setHistoryCurrentPools = useDeepBookMarginPoolStore(state => state.setHistoryCurrentPools)

  const clearData = useDeepBookMarginPoolStore(state => state.clearData)

  const deepBookMarginPools = useDeepBookMarginPoolStore(state => state.deepBookMarginPools)
  const poolsSort = useDeepBookMarginPoolStore(state => state.poolsSort)
  const setPoolsSort = useDeepBookMarginPoolStore(state => state.setPoolsSort)

  const { getDeepBookMarginPools, fetchMarginCap, getDeepBookMarginPoolsHistory } = useDeepBookMarginPools()

  const tabList = [
    { label: 'Pools', value: 'Pools' },
    { label: 'History', value: 'History' }
  ]
  const actionList = [
    {
      label: 'All',
      value: 'All'
    },
    {
      label: 'Deposit',
      value: 'Deposit'
    },
    {
      label: 'Withdraw',
      value: 'Withdraw'
    }
  ]

  const poolsList = useMemo(() => {
    let result = !deepBookMarginPools?.length
      ? []
      : deepBookMarginPools?.map((item: any) => {
          return { ...item?.tokenInfo, label: item?.tokenInfo?.symbol, value: item?.objectId }
        })
    return [
      {
        label: 'All',
        value: 'All'
      }
    ].concat(result)
  }, [deepBookMarginPools])

  const handleChangeActions = (val: any) => {
    getDeepBookMarginPoolsHistory(currentAccount?.address, historyCurrentPools?.value, val?.value, true)
    setHistoryCurrentAction(val)
  }
  const handleChangePools = (val: any) => {
    getDeepBookMarginPoolsHistory(currentAccount?.address, val?.value, historyCurrentAction?.value, true)
    setHistoryCurrentPools(val)
  }

  const handleRefresh = (tab: any, isLoading = true) => {
    if (tab == 'Pools') {
      getDeepBookMarginPools(currentAccount?.address, true)
    } else {
      getDeepBookMarginPoolsHistory(currentAccount?.address || '', historyCurrentPools?.value || '', historyCurrentAction?.value, true)
    }
  }

  useEffect(() => {
    return () => clearData()
  }, [])

  const { deepBookSDK } = usePeripherySDKStore()
  useEffect(() => {
    fetchMarginCap(currentAccount?.address || deepBookSDK?.senderAddress || '')
  }, [currentAccount?.address, deepBookSDK?.senderAddress])

  const prevMarginPoolCapRef = useRef(marginPoolCap)

  useEffect(() => {
    const isMarginPoolCapChanged = prevMarginPoolCapRef.current !== marginPoolCap
    let isLoading: boolean

    // 只有 marginPoolCap 变化才关闭 loading
    if (isMarginPoolCapChanged) {
      isLoading = false
    } else {
      isLoading = true
    }
    // getDeepBookMarginPools(currentAccount?.address, isLoading)
    handleRefresh(currentPageTab, isLoading)

    prevMarginPoolCapRef.current = marginPoolCap
  }, [marginPoolCap, selectCoinList, isYourSupply, poolsSort])

  const { isApp } = useWindowWidth()
  return (
    <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
      {/* <Box>
        <SearchInputBlock
          whiteTokenList={undefined}
          selectCoinList={selectCoinList}
          onClickSelectCoinList={(val: any) => {
            setSelectCoinList([{ ...val }])
          }}
          onDeleteSelectCoinList={(val: any) => {
            setSelectCoinList([])
          }}
          selectTokenLength={1}
          isVault={true}
        />
      </Box> */}
      <HStack w={{ base: '100%', lg: '212px' }} justify="space-between">
        <SelectTab
          type="outlineTab"
          tabList={tabList}
          currentTab={currentPageTab}
          handleChangeTab={(val: any) => {
            handleRefresh(val?.value)
            setCurrentPageTab(val?.value)
          }}
          wrapStyle={{
            flex: {
              lg: '0 0 212px',
              base: '1'
            },
            h: isApp ? '32px' : '40px',
            p: '4px',
            borderRadius: isApp ? '8px' : '12px'
          }}
          itemStyle={{
            flex: {
              lg: '1',
              base: 'auto'
            },
            fontSize: '14px',
            margin: '0px',
            borderRadius: isApp ? '4px' : '8px'
          }}
        />
      </HStack>
      <HStack w={{ base: '100%', lg: 'unset' }}>
        {currentPageTab == 'Pools' && (
          <Block
            w={{ base: '50%', lg: 'unset' }}
            h={{ base: '32px', lg: '40px' }}
            borderRadius={{ base: '8px', lg: '12px' }}
            p={{ base: '5px 12px', lg: '9px 12px' }}
          >
            <HStack justify={{ base: 'space-between', lg: 'unset' }}>
              <CheckBox
                checked={isYourSupply}
                onClick={() => {
                  setIsYourSupply(!isYourSupply)
                }}
                wrapStyle={{
                  ...{
                    sx: {
                      div: {
                        border: '1px solid',
                        borderRadius: '4px',
                        borderColor: 'clmm_checked_border',
                        bg: isYourSupply ? '#1D2634 !important' : 'transparent !important'
                      },
                      '& svg': {
                        fill: isYourSupply ? 'primary !important' : 'transparent !important'
                      }
                    }
                  }
                }}
              />
              <Text fontSize={{ base: '12px', lg: '13px' }} color="primary_gray">
                Your Holdings
              </Text>
            </HStack>
          </Block>
        )}
        {currentPageTab == 'Pools' && isApp && (
          <Box w={{ base: '50%', lg: 'unset' }}>
            <SortDropBlock
              useDrawer={true}
              sortText="Sort by"
              wrapStyle={{
                borderRadius: { base: '8px', lg: '12px' },
                height: '20px !important',
                w: '100%'
              }}
              mainStyle={{
                flexDirection: 'row-reverse',
                p: '0 0px 0 10px',
                gap: '8px'
              }}
              iconSize="32px"
              iconStyle={{
                fontSize: '16px'
              }}
              iconBoxStyle={{
                border: '0',
                borderRadius: 0,
                borderLeft: ' 1px solid',
                borderColor: 'border !important',
                height: '16px',
                ml: 0,
                w: '16px',
                minW: '32px'
              }}
              hideButtonText={true}
              minW="max-content"
              currentSort={poolsSort?.sortBy}
              sortByList={sortByList}
              onSortByChange={clickSort}
              xlinkHref={poolsSort?.sortRule == 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
              iconOnClick={() => {
                const rule = poolsSort?.sortRule == 'desc' ? 'asc' : 'desc'
                setPoolsSort({
                  ...poolsSort,
                  sortRule: rule
                })
              }}
            />
          </Box>
        )}
        {currentPageTab == 'History' && (
          <NewMenuButton current={historyCurrentAction} handleChange={(val: any) => handleChangeActions(val)} menuList={actionList} title="Action" />
        )}
        {currentPageTab == 'History' && (
          <NewMenuButton current={historyCurrentPools} handleChange={(val: any) => handleChangePools(val)} menuList={poolsList} title="Pools" />
        )}
        <RefreshButton
          handleRefresh={() => handleRefresh(currentPageTab)}
          borderRadius={{ base: '8px', lg: '12px' }}
          w={{ base: '32px', lg: '40px' }}
          minW={{ base: '32px', lg: '40px' }}
          h={{ base: '32px', lg: '40px' }}
          bg="bg_secondary"
          innerStyle={isApp ? { bg: 'none' } : {}}
        />
      </HStack>
    </HStack>
  )
}
