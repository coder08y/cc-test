import PoolsFilter, { PositionTypes } from '@/components/pools/PoolsFilter'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePoolsStore from '@/store/pool'
import usePositionStore from '@/store/position'
import { Block, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import LiquidityAndYield from './LiquidityAndYield'

function PositionTypeAndCollapse({
  isProfile,
  isVaults = false,
  currentTab = '',
  setCurrentTab,
  whiteTokenList,
  isShowChildren,
  handleRefresh,
  onClickSelectCoinList,
  onDeleteSelectCoinList,
  showPosListGroupByPool,
  selectCoinList,
  changeShowPosListGroupByPool,
  isInitialLoad
}: {
  isVaults?: boolean
  currentTab?: any
  setCurrentTab?: (val: any) => void
  whiteTokenList?: any
  isProfile: boolean
  isShowChildren: boolean
  handleRefresh: () => void
  onClickSelectCoinList: (tokenInfo: Token) => void
  onDeleteSelectCoinList: (tokenInfo: Token) => void
  showPosListGroupByPool: any
  selectCoinList: any
  changeShowPosListGroupByPool: (val: any) => void
  isInitialLoad?: boolean
}) {
  const { isApp } = useWindowWidth()
  const [positionTab, setPositionTab] = useState<PositionTypes>('All')
  const { showPosListLength, setShowPosListLength, posBaseListGroupByPool } = usePositionStore()
  const { isExpendPositionMap, setIsExpendPosition } = usePoolsStore()
  const { dlmmPosBaseListGroupByPool } = useDlmmPositionStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const positionTypeList = useMemo(
    () =>
      isApp
        ? [
            {
              label: `All (${d(showPosListLength?.clmm_position_count ?? 0)
                .plus(showPosListLength?.dlmm_position_count ?? 0)
                .toString()})`,
              value: 'All',
              key: 'All'
            },
            {
              label: `CLMM (${showPosListLength?.clmm_position_count ?? 0})`,
              value: 'CLMM',
              key: 'CLMM'
            },
            {
              label: `DLMM (${showPosListLength?.dlmm_position_count ?? 0})`,
              value: 'DLMM',
              key: 'DLMM'
            }
          ]
        : [
            {
              label: 'All',
              value: 'All',
              num: d(showPosListLength?.clmm_position_count ?? 0)
                .plus(showPosListLength?.dlmm_position_count ?? 0)
                .toString()
            },
            {
              label: `CLMM`,
              value: 'CLMM',
              num: showPosListLength?.clmm_position_count ?? 0
            },
            {
              label: `DLMM`,
              value: 'DLMM',
              num: showPosListLength?.dlmm_position_count ?? 0
            }
          ],
    [showPosListLength, isApp]
  )

  const hasOneExpand = useMemo(() => {
    const hasOpen = Object.values(isExpendPositionMap).some(item => item)
    // 只要有一个是展开状态，则全局按钮 可操作收起全部
    return hasOpen
  }, [isExpendPositionMap])

  const handleChangePositionTab = (tab: PositionTypes) => {
    setPositionTab(tab)
    handleFilterGroupPool(tab)
  }

  useEffect(() => {
    console.log('🚀 ~ PositionTypeAndCollapse ~ posBaseListGroupByPool:', dlmmPosBaseListGroupByPool, posBaseListGroupByPool)
    handleFilterGroupPool(positionTab)
  }, [selectCoinList, positionTab, posBaseListGroupByPool, dlmmPosBaseListGroupByPool])

  const handleFilterGroupPool = (tab: PositionTypes) => {
    console.log('🚀 ~ handleFilterGroupPool ~ tab:', tab, dlmmPosBaseListGroupByPool, posBaseListGroupByPool)
    let originData = {}
    if (tab == 'All') {
      originData = { ...posBaseListGroupByPool, ...dlmmPosBaseListGroupByPool }
    } else if (tab == 'CLMM') {
      originData = { ...posBaseListGroupByPool }
    } else if (tab == 'DLMM') {
      originData = { ...dlmmPosBaseListGroupByPool }
    }
    const firstTokenAddress = selectCoinList[0]?.coin_type ? fixCoinType(selectCoinList[0]?.coin_type) : undefined
    const lastTokenAddress = selectCoinList[1]?.coin_type ? fixCoinType(selectCoinList[1]?.coin_type) : undefined

    const filterArr = Object.values(originData).filter((filterItem: any) => {
      if (firstTokenAddress && lastTokenAddress) {
        return (
          (fixCoinType(filterItem.tokenA.coin_type) == firstTokenAddress && fixCoinType(filterItem.tokenB.coin_type) == lastTokenAddress) ||
          (fixCoinType(filterItem.tokenA.coin_type) == lastTokenAddress && fixCoinType(filterItem.tokenB.coin_type) == firstTokenAddress)
        )
      } else if (firstTokenAddress) {
        return fixCoinType(filterItem.tokenA.coin_type) == firstTokenAddress || fixCoinType(filterItem.tokenB.coin_type) == firstTokenAddress
      } else {
        return filterItem
      }
    })
    changeShowPosListGroupByPool(filterArr)
    console.log('🚀 ~ handleFilterGroupPool ~ filterArr:', filterArr)
    const positionKeys = Object.keys(isExpendPositionMap)
    filterArr?.forEach((item: any) => {
      const poolAddress = item?.dlmmPoolAddress || item?.clmmPoolAddress
      if (!positionKeys.includes(poolAddress)) {
        setIsExpendPosition([poolAddress], true)
      }
    })
    const clmm_position_count = Object.values(posBaseListGroupByPool)
      .filter((item: any) => item.poolType == 'clmm')
      .reduce((sum: number, item: any) => {
        return sum + (item.list ? item.list.length : 0)
      }, 0)
    const dlmm_position_count = Object.values(dlmmPosBaseListGroupByPool)
      .filter((item: any) => item.poolType == 'dlmm')
      .reduce((sum: number, item: any) => {
        return sum + (item.list ? item.list.length : 0)
      }, 0)

    if (currentAccount?.address) {
      setShowPosListLength({
        clmm_position_count,
        dlmm_position_count
      })
    } else {
      setShowPosListLength({})
    }
  }

  return (
    <PoolsFilter
      isProfile={isProfile}
      isPools={false}
      isVaults={isVaults}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      whiteTokenList={whiteTokenList}
      handleRefresh={handleRefresh}
      selectCoinList={selectCoinList}
      onClickSelectCoinList={onClickSelectCoinList}
      onDeleteSelectCoinList={onDeleteSelectCoinList}
      positionCountObj={showPosListLength}
      handleChangePositionTab={handleChangePositionTab}
      fromSource="position"
    >
      {isApp ? (
        <VStack w="100%" gap="12px" align="stretch">
          {!isProfile && (
            <Box w="100%" mt="-8px">
              <LiquidityAndYield isInitialLoad={isInitialLoad} />
            </Box>
          )}

          {isShowChildren && positionTypeList?.length > 0 && (
            <HStack gap="12px" w="100%">
              <SelectTab
                type="outlineTab"
                isActive={(current, tab) => current === tab.value}
                wrapStyle={{
                  w: '100%',
                  border: '1px solid',
                  borderColor: 'border',
                  bg: 'bg_secondary',
                  h: '32px',
                  justifyContent: 'flex-end',
                  p: '3px',
                  borderRadius: '8px'
                }}
                itemStyle={{
                  w: `calc(100% / ${positionTypeList?.length})`,
                  fontSize: '12px',
                  borderRadius: '6px',
                  gap: '0px'
                }}
                tabList={positionTypeList}
                currentTab={positionTab}
                handleChangeTab={(item: any) => {
                  setPositionTab(item?.value)
                }}
              />
            </HStack>
          )}
        </VStack>
      ) : (
        isShowChildren &&
        positionTypeList?.length > 0 && (
          <HStack gap="12px" w="100%">
            <SelectTab
              type="outlineTab"
              isActive={(current, tab) => current === tab.value}
              wrapStyle={{
                w: '100%',
                border: '1px solid',
                borderColor: 'border',
                bg: 'bg_secondary',
                h: '40px',
                justifyContent: 'flex-end',
                p: '4px'
              }}
              itemStyle={{
                w: '102px',
                fontSize: '14px',
                borderRadius: '8px',
                gap: '0px'
              }}
              tabList={positionTypeList}
              currentTab={positionTab}
              handleChangeTab={(item: any) => {
                setPositionTab(item?.value)
              }}
            />
            <Block
              w="35%"
              borderRadius="12px"
              p="0px 10px 0 8px"
              h="40px"
              sx={{
                cursor: 'pointer',
                _hover: {
                  svg: {
                    fill: 'text_caption'
                  },
                  p: {
                    color: 'text_caption'
                  }
                }
              }}
              onClick={() => {
                const newExpandState = !hasOneExpand
                setIsExpendPosition(Object.keys(isExpendPositionMap), newExpandState)
              }}
            >
              <HStack h="100%" justify="space-between">
                {hasOneExpand ? <Icon xlinkHref="#icon-icon_collapse" /> : <Icon xlinkHref="#icon-icon_expand" />}
                <Text whiteSpace="nowrap">{hasOneExpand ? 'Collapse' : 'Expand'}</Text>
              </HStack>
            </Block>
          </HStack>
        )
      )}
    </PoolsFilter>
  )
}
export default PositionTypeAndCollapse
