import { FarmingImage } from '@/components/common/FarmingIcon'
import { MiningImage } from '@/components/common/MiningIcon'
import usePositionListAction from '@/hooks/position/usePositionListAction'
import { DlmmPosBaseInfo } from '@/types/dlmm'
import { PosBaseInfo, showNewVersionApr } from '@/types/position'
import { TableSortTh } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, isAvailableObject } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import PositionItemContent from '../../common/PositionItemContent'

function PositionItem({
  poolInfo,
  priceDirect,
  sortBy: externalSortBy,
  sortRule: externalSortRule,
  onSortChange,
  onSortListChange,
  isListWrap = true
}: {
  poolInfo: any
  priceDirect?: boolean
  sortBy?: { label: string; value: string }
  sortRule?: 'asc' | 'desc'
  onSortChange?: (item: { label: string; value: string }, rule: 'asc' | 'desc') => void
  onSortListChange?: (list: { label: string; value: string }[]) => void
  isListWrap?: boolean
}) {
  const itemWidth = showNewVersionApr
    ? ['380px', '100px', '130px', '170px', '160px', '106px']
    : ['300px', '100px', '110px', '140px', '180px', '224px']

  const SORT_BY_LIST = showNewVersionApr
    ? [
        { label: 'APR', value: 'apr' },
        { label: 'Liquidity', value: 'liquidity' },
        { label: 'Claimable Yield', value: 'yield' },
        { label: 'Est. Daily Yield', value: 'dailyEarn' },
        // { label: 'Claimable Fees', value: 'fees' },
        // { label: 'Pending Rewards', value: 'rewards' },
        { label: 'Actions', value: 'actions' }
      ]
    : [
        { label: 'APR', value: 'apr' },
        { label: 'Liquidity', value: 'liquidity' },
        { label: 'Pending Fees', value: 'fees' },
        { label: 'Pending Rewards', value: 'rewards' },
        { label: 'Actions', value: 'actions' }
      ]

  const SORT_BY_OBJECT = SORT_BY_LIST.reduce((obj: any, item) => {
    obj[item.value] = item
    return obj
  }, {})
  const { getPositionSortList } = usePositionListAction()

  // 如果外部传入排序参数，使用外部的；否则使用内部的（PC端）
  const [internalSortRule, setInternalSortRule] = useState<'asc' | 'desc'>('desc')
  const sortRule = externalSortRule !== undefined ? externalSortRule : internalSortRule

  // 从 poolInfo.list 计算初始的 mining 和 farming 状态（用于初始化排序列表）
  const hasPositiveAmountFromPool = useCallback(
    (key: 'totalMiningAmount' | 'totalFarmingAmount') => {
      return (poolInfo?.list || []).some((item: any) => d(item[key]).gt(0))
    },
    [poolInfo?.list]
  )

  const initialShowMiningIcon = useMemo(() => hasPositiveAmountFromPool('totalMiningAmount'), [hasPositiveAmountFromPool])
  const initialShowFarmingIcon = useMemo(() => hasPositiveAmountFromPool('totalFarmingAmount'), [hasPositiveAmountFromPool])

  // 统一的排序项过滤函数：判断某个排序项是否应该显示
  const shouldShowSortItem = useCallback(
    (item: { label: string; value: string }, hasMining: boolean, hasFarming: boolean) => {
      // 排除 actions 项（不可排序）
      if (item.value === 'actions') {
        return false
      }
      // 对于 rewards（旧版本）或 yield（新版本），只有当有 mining 或 farming icon 时才显示
      if (showNewVersionApr) {
        if (item.value === 'yield') {
          return hasMining || hasFarming
        }
      } else {
        if (item.value === 'rewards') {
          return hasMining || hasFarming
        }
      }

      return true
    },
    [showNewVersionApr]
  )

  // 移动端排序列表：排除 actions，并根据条件过滤 rewards/yield（用于初始化）
  const mobileSortByList = useMemo(() => {
    return SORT_BY_LIST.filter(item => shouldShowSortItem(item, initialShowMiningIcon, initialShowFarmingIcon))
  }, [SORT_BY_LIST, shouldShowSortItem, initialShowMiningIcon, initialShowFarmingIcon])

  const [internalSortBy, setInternalSortBy] = useState<{ label: string; value: string }>({ label: '', value: '' })

  // 如果外部传入排序参数，使用外部的；否则使用内部的（PC端）
  const sortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy

  const handleClickSort = (item: any) => {
    if (externalSortRule !== undefined && onSortChange) {
      // 如果外部传入排序参数且有回调函数，通知父组件更新（PC端）
      if (item?.value === sortBy.value) {
        const newRule = sortRule === 'desc' ? 'asc' : 'desc'
        onSortChange(item, newRule)
      } else {
        onSortChange(item, 'desc')
      }
      return
    }
    // 如果没有外部参数，使用内部状态（兼容旧代码）
    if (item?.value === sortBy.value) {
      setInternalSortRule(prev => (prev === 'desc' ? 'asc' : 'desc'))
    } else {
      setInternalSortRule('desc')
      setInternalSortBy(item)
    }
  }

  const [sortList, setSortList] = useState<(PosBaseInfo | DlmmPosBaseInfo)[]>([])
  const [listLoading, setListLoading] = useState<boolean>(true)
  const [positionList, setPositionList] = useState<(PosBaseInfo | DlmmPosBaseInfo)[]>([])
  const handleGetPositionList = useCallback(async () => {
    setListLoading(true)
    try {
      // console.log(sortBy.value, sortRule, poolInfo.list, 'handleGetPositionList')
      const list = await getPositionSortList(sortBy.value, sortRule, poolInfo.list)
      setSortList(list)
      setPositionList(list)
      setListLoading(false)
    } catch (error) {
      console.log(error, 'handleGetPositionList')
      setListLoading(false)
    }
  }, [sortBy.value, sortRule, poolInfo.list, getPositionSortList])
  useDebounceEffect(
    () => {
      if (isAvailableObject(poolInfo)) {
        handleGetPositionList()
      }
    },
    [handleGetPositionList],
    { wait: 300 }
  )

  const hasPositiveAmount = (key: 'totalMiningAmount' | 'totalFarmingAmount') => sortList.some((item: any) => d(item[key]).gt(0))

  const showMiningIcon = useMemo(() => hasPositiveAmount('totalMiningAmount'), [sortList])
  const showFarmingIcon = useMemo(() => hasPositiveAmount('totalFarmingAmount'), [sortList])

  const pcShowMiningIcon = useMemo(() => {
    const sourceList = sortList.length > 0 ? sortList : poolInfo?.list || []
    return sourceList.some((item: any) => d(item.totalMiningAmount).gt(0))
  }, [sortList, poolInfo?.list])

  const pcShowFarmingIcon = useMemo(() => {
    const sourceList = sortList.length > 0 ? sortList : poolInfo?.list || []
    return sourceList.some((item: any) => d(item.totalFarmingAmount).gt(0))
  }, [sortList, poolInfo?.list])

  const updatedMobileSortByList = useMemo(() => {
    const sourceList = sortList.length > 0 ? sortList : poolInfo?.list || []
    const hasMining = sourceList.some((item: any) => d(item.totalMiningAmount).gt(0))
    const hasFarming = sourceList.some((item: any) => d(item.totalFarmingAmount).gt(0))

    return SORT_BY_LIST.filter(item => shouldShowSortItem(item, hasMining, hasFarming))
  }, [SORT_BY_LIST, shouldShowSortItem, sortList, poolInfo?.list])

  // 将动态更新的排序列表传递给父组件
  useEffect(() => {
    if (onSortListChange) {
      onSortListChange(updatedMobileSortByList)
    }
  }, [updatedMobileSortByList, onSortListChange])

  const handleIconClick = useCallback(() => {
    if (sortBy.value) {
      setInternalSortRule(prev => (prev === 'desc' ? 'asc' : 'desc'))
    }
  }, [sortBy.value])

  const { isApp } = useWindowWidth()

  return (
    <VStack gap="12px" w="100%">
      {!isApp && (
        <HStack w="100%" p="0 16px" justify="space-between">
          <Text w={itemWidth[0]} minW={{ base: 'unset', lg: itemWidth[0] }}>
            Price Range
          </Text>
          {SORT_BY_LIST.map((item, idx) => {
            // 使用统一的过滤逻辑判断是否显示该项（可排序的项）
            const shouldShow = item.value !== 'rewards' || showMiningIcon || showFarmingIcon
            // actions 项需要显示但不可排序，其他不可排序的项不显示
            if (!shouldShow && item.value !== 'actions') {
              return null
            }

            return (
              <HStack key={item.value} gap="4px" w={itemWidth[idx + 1]} justify="flex-end">
                {!showNewVersionApr && pcShowMiningIcon && item.value === 'rewards' && <MiningImage />}
                {!showNewVersionApr && pcShowFarmingIcon && item.value === 'rewards' && <FarmingImage />}
                {showNewVersionApr && pcShowMiningIcon && item.value === 'yield' && <MiningImage />}
                {showNewVersionApr && pcShowFarmingIcon && item.value === 'yield' && <FarmingImage />}
                {item.value === 'actions' && <Text>{item.label}</Text>}
                {/* {item.value !== 'actions' && shouldShow && (
                  <TableSortTh
                    labelInfo={SORT_BY_OBJECT[item.value]}
                    sortRule={sortRule}
                    sortBy={sortBy}
                    clickSort={handleClickSort}
                    defaultShowSortIcon={true}
                    tooltip={{
                      content:
                        item.value === 'apr' ? (
                          <span>
                            APR based on the daily yield accrued by this position. Past performance is not indicative of future results. Calculations
                            are an estimate and only for reference.
                          </span>
                        ) : (
                          ''
                        )
                    }}
                  />
                )} */}
                {item.value === 'apr' && showNewVersionApr && (
                  <TableSortTh
                    labelInfo={SORT_BY_OBJECT[item.value]}
                    sortRule={sortRule}
                    sortBy={sortBy}
                    clickSort={handleClickSort}
                    defaultShowSortIcon={true}
                    tooltip={{
                      content:
                        item.value === 'apr' ? (
                          <span>
                            APR based on the daily yield accrued by this position. Past performance is not indicative of future results. Calculations
                            are an estimate and only for reference.
                          </span>
                        ) : (
                          ''
                        )
                    }}
                  />
                )}
                {item.value === 'dailyEarn' && showNewVersionApr && (
                  <TableSortTh
                    labelInfo={SORT_BY_OBJECT[item.value]}
                    sortRule={sortRule}
                    sortBy={sortBy}
                    clickSort={handleClickSort}
                    defaultShowSortIcon={true}
                    tooltip={{
                      content:
                        item.value === 'dailyEarn' ? (
                          <span>
                            Estimated based on yield performance of this position since the last operation on it. Past performance is not indicative
                            of future results, which is for reference only.
                          </span>
                        ) : (
                          ''
                        )
                    }}
                  />
                )}
                {item.value !== 'apr' && item.value !== 'actions' && item.value !== 'dailyEarn' && (
                  <TableSortTh
                    labelInfo={SORT_BY_OBJECT[item.value]}
                    sortRule={sortRule}
                    sortBy={sortBy}
                    clickSort={handleClickSort}
                    defaultShowSortIcon={true}
                    tooltip={{
                      content:
                        item.value === 'apr' ? (
                          <span>
                            APR based on the daily yield accrued by this position. Past performance is not indicative of future results. Calculations
                            are an estimate and only for reference.
                          </span>
                        ) : (
                          ''
                        )
                    }}
                  />
                )}
              </HStack>
            )
          })}
        </HStack>
      )}

      <VStack w="100%" maxH={isListWrap ? '440px' : 'unset'} overflow="auto" gap="12px" p={{ base: '0 12px', lg: '0' }}>
        {(listLoading && positionList?.length === 0 ? poolInfo?.list : positionList).map((item: any, index: number) => (
          <Box
            key={item?.id}
            borderBottom={{ base: index === positionList?.length - 1 ? 'none' : '1px solid', lg: 'none' }}
            borderColor="border !important"
            pb={{ base: '12px', lg: '0' }}
            w="100%"
          >
            <PositionItemContent
              poolType="clmm"
              positionInfo={item}
              positionItemWidth={itemWidth}
              priceDirect={priceDirect}
              showMiningIcon={showMiningIcon}
              showFarmingIcon={showFarmingIcon && (!isApp || item.posType == 'farms')}
              isLoading={listLoading && positionList?.length === 0}
            />
          </Box>
        ))}
      </VStack>
    </VStack>
  )
}

export default PositionItem
