import useGetDeepBookOrderHistory from '@/hooks/deepbook/useGetDeepBookOrderHistory'
import { useInitCursor } from '@/hooks/deepbook/useInitCursor'
import { useLoadMore } from '@/hooks/deepbook/useLoadMore'
import useDeepBookStore from '@/store/deepbook'
import { AddressCopyLink, useGlobalToast } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { NoData, Table } from '@cetus/ui-kit'
import { formatNumber } from '@cetus/utils'
import { Box, HStack, Progress, Text, VStack } from '@chakra-ui/react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSideFilter } from '../../../hooks/deepbook/useSideFilter'
import CoinPairInfo from '../../common/CoinPairInfo'

dayjs.extend(utc)
dayjs.extend(timezone)
// import TypeCon from '../common/proModeAndChart/ProModeTradeTab/TypeCon'
import CombinedFilter from '../../common/CombinedFilter'
import LoadMoreIndicator from '../LoadMoreIndicator'
import MobileOrderList, { MobileOrderListField } from '../MobileOrderList'
import SideBadge from '../SideBadge'

export default function OrderHistoryTableBlock({
  sideType,
  setSideType,
  statusType,
  setStatusType,
  orderType
}: {
  sideType: string
  setSideType: (val: string) => void
  statusType: string
  setStatusType: (val: string) => void
  orderType: 'spot' | 'margin'
}) {
  const {
    deepBookOrderHistory,
    deepBookOrderHistoryLoading,
    currentDeepBookPool,
    isCheckedAllMarkets,
    setShowDeepBookOrderHistoryNum,
    setDeepBookOrderHistory
  } = useDeepBookStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { type, handleTypeChangeDirect } = useSideFilter()
  const { isApp } = useWindowWidth()
  const [status, setStatus] = useState('')
  const { getDeepBookOrderHistory } = useGetDeepBookOrderHistory()

  // 在 H5 下使用父组件传递的筛选状态
  const effectiveType = isApp ? sideType : type
  const effectiveSetType = isApp ? setSideType : handleTypeChangeDirect
  const effectiveStatus = isApp ? statusType : status
  const effectiveSetStatus = isApp ? setStatusType : setStatus

  const deepBookOrderHistoryList = useMemo(
    () => (isCheckedAllMarkets ? deepBookOrderHistory : deepBookOrderHistory?.filter((item: any) => item.poolId == currentDeepBookPool?.address)),
    [deepBookOrderHistory, currentDeepBookPool, isCheckedAllMarkets]
  )

  // console.log('deepBookOrderHistory:', deepBookOrderHistory)

  // 前端筛选：根据 side 和 status 筛选
  const dataSource = useMemo(() => {
    let filtered = deepBookOrderHistoryList

    // 根据 side 筛选
    if (effectiveType && !effectiveType.split(',').includes('All')) {
      const types = effectiveType.split(',')
      filtered = filtered.filter((order: any) => types.includes(order.side))
    }

    // 根据 status 筛选
    if (effectiveStatus) {
      const statuses = effectiveStatus.split(',')
      filtered = filtered.filter((item: any) => statuses.includes(item.orderStatus))
    }

    return filtered
  }, [deepBookOrderHistoryList, effectiveType, effectiveStatus])

  // useEffect(() => {
  //   setShowDeepBookOrderHistoryNum(dataSource?.length)
  // }, [dataSource?.length])

  const { showCommonToast } = useGlobalToast()

  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ===== 使用通用的加载更多 hook =====
  const PAGE_SIZE = 20 // 统一的分页大小
  const { loadMoreRef, isLoadingMore, cursor, hasMore, setCursor, setHasMore } = useLoadMore({
    onLoadMore: async () => {
      const params: any = {
        limit: PAGE_SIZE,
        eventCursor: cursor,
        isLoadMore: true,
        isMargin: orderType === 'margin'
      }

      // 根据筛选条件添加参数
      if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
        params.poolId = currentDeepBookPool.address
      }

      const result = await getDeepBookOrderHistory(params)

      if (result && result.list.length > 0) {
        setDeepBookOrderHistory([...deepBookOrderHistory, ...result.list])
        setCursor(result.cursor)
        setHasMore(result.hasMore)
      } else {
        setHasMore(false)
      }
    },
    enabled: true,
    dataLength: dataSource?.length || 0,
    isInitialLoading: deepBookOrderHistoryLoading,
    scrollContainerRef
  })

  // 当 orderType 变化时，重置 cursor 和 hasMore 状态（数据获取由父组件统一处理）
  const prevOrderTypeRef = useRef<'spot' | 'margin'>(orderType)
  const prevDataLengthRef = useRef<number>(deepBookOrderHistory?.length || 0)

  useEffect(() => {
    if (prevOrderTypeRef.current !== orderType) {
      prevOrderTypeRef.current = orderType
      setCursor(null)
      setHasMore(true)
    }
  }, [orderType, setCursor, setHasMore])

  // 当数据被清空时（比如切换 tab），重置 cursor
  useEffect(() => {
    const currentLength = deepBookOrderHistory?.length || 0
    if (prevDataLengthRef.current > 0 && currentLength === 0) {
      // 数据被清空，重置 cursor
      setCursor(null)
      setHasMore(true)
    }
    prevDataLengthRef.current = currentLength
  }, [deepBookOrderHistory?.length, setCursor, setHasMore])

  // 初始化 cursor
  useInitCursor(deepBookOrderHistory, cursor, setCursor, setHasMore, 'OrderHistory', PAGE_SIZE)
  // ===== Mobile fields configuration =====
  const mobileFields: MobileOrderListField[] = useMemo(
    () => [
      // ...(orderType === 'margin' ? [
      //   {
      //     key: 'leverage',
      //     label: 'Leverage',
      //     render: (item: any) => (
      //       <Text fontSize='12px' color='text_caption'>
      //         {item?.leverage || 1.2} X
      //       </Text>
      //     )
      //   }] : []
      // ),
      {
        key: 'status',
        label: 'Status',
        render: (item: any) => {
          const colorMap: any = {
            Pending: 'primary',
            'Partially Filled': 'primary',
            Filled: 'primary_green',
            Cancelled: 'text_caption',
            Expired: '#909CA4'
          }
          const color = colorMap[item?.orderStatus] || '#909CA4'
          return (
            <Text fontSize={'12px'} color={color}>
              {item?.orderStatus}
            </Text>
          )
        }
      },
      {
        key: 'price',
        label: 'Price',
        render: (item: any) => (
          <Text fontSize={'12px'} color={{ base: 'text_caption', lg: 'text_caption' }}>
            {formatNumber(item?.price)}
          </Text>
        )
      },
      {
        key: 'filled',
        label: 'Filled/Quantity',
        render: (item: any) => (
          <Text fontSize={'12px'} color={{ base: 'text_caption', lg: 'text_caption' }}>
            {formatNumber(item?.filledQuantity)}/{formatNumber(item?.originalQuantity)}
          </Text>
        )
      },
      {
        key: 'orderId',
        label: 'Order ID',
        render: (item: any) => (
          <HStack justify="flex-end" gap="4px">
            <AddressCopyLink
              hasUnderline={false}
              address={item?.orderId}
              showLink={false}
              subStringLengthStart={4}
              color="text_caption"
              onClickLink={() => {}}
            />
          </HStack>
        )
      }
    ],
    [showCommonToast]
  )

  // ===== Render Mobile or Desktop =====
  if (isApp) {
    return (
      <>
        <MobileOrderList
          dataSource={dataSource}
          fields={mobileFields}
          loading={!currentAccount?.address ? false : deepBookOrderHistoryLoading}
          noDataText="No orders in the last 3 months"
          noDataType={!currentAccount?.address ? 'nowallet' : 'nodata'}
          onWalletConnect={() => onWalletModal(true)}
          showProgress={false}
          headerRight={(item: any) => {
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const formattedTime = item?.timestamp ? dayjs(item.timestamp).tz(browserTimezone).format('MMM D YYYY h:mm:ss A') : '-'
            return (
              <Text color="" fontSize="12px">
                <Text fontSize="12px" color="text_caption">
                  {formattedTime}
                </Text>
              </Text>
            )
          }}
        />

        {/* 加载更多指示器 - 移动端 */}
        {hasMore && <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource?.length || 0} />}
      </>
    )
  }

  return (
    <Box ref={scrollContainerRef} w="100%" h="100%" display="flex" flexDirection="column" overflow="auto">
      <Table
        dataSource={dataSource}
        columns={getColumns(effectiveType, effectiveSetType, effectiveStatus, effectiveSetStatus, orderType, isApp)}
        loading={!currentAccount?.address ? false : deepBookOrderHistoryLoading}
        fixedHeader
        headBg={'bg_secondary'}
        trPadding="4px"
        rowStyle={{
          _hover: {
            borderRadius: '6px !important',
            'td:first-of-type': {
              borderRadius: '6px 0 0 6px !important'
            },
            'td:last-of-type': {
              borderRadius: '0 6px 6px 0 !important'
            }
          }
        }}
        tableContainerWrapStyle={{
          h: '100%'
        }}
        sx={{
          'thead tr > th:first-of-type': {
            pl: '12px !important'
          },
          'tbody tr td:first-of-type': {
            pl: '12px !important'
          },
          'thead tr > th:last-of-type': {
            pr: '12px !important'
          },
          'tbody tr td:last-of-type': {
            pr: '12px !important'
          }
        }}
        noData={
          !currentAccount?.address ? (
            <NoData imgSize="100px" type="nowallet" noBorder bg="none" onboard={() => onWalletModal(true)} />
          ) : dataSource?.length == 0 ? (
            <NoData imgSize="100px" type="nodata" text="No orders in the last 3 months" noBorder bg="none" />
          ) : undefined
        }
        loadMoreIndicator={{ loadMoreRef, isLoadingMore, hasMore, cursor, dataSource }}
      />

      {/* 加载更多指示器 - 桌面端 */}
      {/* <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource?.length || 0} /> */}
    </Box>
  )
}

const getColumns = (
  type: string,
  setType: (val: string) => void,
  status: string,
  setStatus: (val: string) => void,
  orderType: 'spot' | 'margin',
  isApp: boolean
) => {
  const { showCommonToast } = useGlobalToast()
  return [
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Market
        </Text>
      ),
      key: '#',
      thConfig: {
        w: '20%'
      },
      render: (item: any, index?: number) => (
        <HStack h="32px">
          <CoinPairInfo
            poolInfo={{
              displayTokenA: item?.baseAssets,
              displayTokenB: item?.quoteAssets,
              poolAddress: item?.poolId
              // poolAddress: item?.address
            }}
            symbolFontSize="12px"
            imgStyle={{
              w: '20px',
              h: '20px'
            }}
            showFee={false}
            // coinPairInfoWrapStyle={{
            //   p: '0px'
            // }}
          />
        </HStack>
      )
    },
    {
      title: <Text fontSize="12px">Time</Text>,
      key: 'time',
      thConfig: {
        w: '20%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const formattedTime = item?.timestamp ? dayjs(item.timestamp).tz(browserTimezone).format('MMM D YYYY h:mm:ss A') : '-'
        return (
          <Text w="100%" textAlign="left" fontSize="12px" color="text_caption">
            {formattedTime}
          </Text>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Side
          </Text>
          <CombinedFilter
            filterGroups={[
              {
                label: 'Side',
                type,
                setType,
                // filterList: orderType === 'margin' ? ['Long', 'Short', 'All'] : ['Buy', 'Sell', 'All'],
                filterList: ['All', 'Buy', 'Sell'],
                singleSelect: true
              }
            ]}
            hideLabel={true}
            autoApply={true}
            keepOpenOnSelect={!isApp}
          />
        </HStack>
      ),
      key: 'side',
      thConfig: {
        w: '10%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => <SideBadge side={item?.side} />
    },
    // ...(orderType === 'margin' ? [
    //   {
    //     title: (
    //       <Text fontSize='12px' fontWeight='500'>
    //         Leverage
    //       </Text>
    //     ),
    //     key: 'leverage',
    //     thConfig: {
    //       w: '10%'
    //     },
    //     render: (item: any) => (
    //       <Text fontSize='12px' color='text_caption' textAlign='left'>
    //         {item?.leverage}x
    //       </Text>
    //     )
    //   }
    // ] : []),
    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Status
          </Text>
          <CombinedFilter
            filterGroups={[
              {
                label: 'Status',
                type: status,
                setType: setStatus,
                filterList: ['Pending', 'Partially Filled', 'Filled', 'Cancelled', 'Expired']
              }
            ]}
            hideLabel={true}
            autoApply={true}
            keepOpenOnSelect={!isApp}
          />
        </HStack>
      ),
      key: 'status',
      thConfig: {
        w: '10%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const colorMap: any = {
          Pending: 'primary',
          'Partially Filled': 'primary',
          Filled: 'primary_green',
          Cancelled: '#909CA4',
          Expired: '#909CA4'
        }
        const color = colorMap[item?.orderStatus] || '#909CA4'
        return (
          <Text w="100%" textAlign="left" fontSize="12px" color={color}>
            {item?.orderStatus}
          </Text>
        )
      }
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Price
        </Text>
      ),
      key: 'orderPrice',
      thConfig: {
        w: '10%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <Text w="100%" textAlign="left" fontSize="12px" color="text_caption">
          {formatNumber(item?.price)}
        </Text>
      )
    },
    {
      title: (
        <Text fontSize="12px" textAlign="left" fontWeight="500">
          Filled %
        </Text>
      ),
      key: 'filledPercentage',
      thConfig: {
        w: '10%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const filledQuantity = Number(item?.filledQuantity) || 0
        const originalQuantity = Number(item?.originalQuantity) || 0
        const percentage = originalQuantity > 0 ? (filledQuantity / originalQuantity) * 100 : 0
        const displayPercentage = formatNumber(percentage, 2)

        return (
          <HStack justifyContent="left" gap="4px">
            <Text fontSize="12px" color="text_caption">
              {displayPercentage}%
            </Text>
            <Progress
              w={'40px'}
              h="4px"
              value={percentage}
              bg="#282828"
              sx={{
                'div[role="progressbar"]': {
                  bg: 'primary'
                }
              }}
            />
          </HStack>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" alignItems="center" gap="4px" height="24px" fontWeight="500">
          <Text fontSize="12px" fontWeight="500">
            Filled/Quantity
          </Text>
        </HStack>
      ),
      key: 'filled',
      thConfig: {
        w: '10%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <VStack w="100%" justify="flex-start" gap="0px">
          <HStack w="100%" justify="flex-start" gap="4px">
            <Text fontSize="12px" color="text_caption">
              {formatNumber(item?.filledQuantity)}/{formatNumber(item?.originalQuantity)}
            </Text>
          </HStack>
        </VStack>
      )
    },
    {
      title: <Text fontSize="12px">Order ID</Text>,
      key: 'orderId',
      thConfig: {
        w: '10%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-end" gap="4px" sx={{ p: { cursor: 'text' }, svg: { _hover: { fill: 'primary' } } }}>
          <AddressCopyLink
            hasUnderline={false}
            address={item?.orderId}
            showLink={false}
            subStringLengthStart={4}
            color="text_caption"
            onClickLink={() => {}}
          />
        </HStack>
      )
    }
  ]
}
