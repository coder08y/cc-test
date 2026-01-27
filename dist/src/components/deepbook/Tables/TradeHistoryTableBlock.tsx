import useGetDeepBookTradeHistory from '@/hooks/deepbook/useGetDeepBookTradeHistory'
import { useInitCursor } from '@/hooks/deepbook/useInitCursor'
import { useLoadMore } from '@/hooks/deepbook/useLoadMore'
import useDeepBookStore from '@/store/deepbook'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData, Table } from '@cetus/ui-kit'
import { addressAbridge, formatNumber } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useEffect, useMemo, useRef } from 'react'
import { useSideFilter } from '../../../hooks/deepbook/useSideFilter'
import CoinPairInfo from '../../common/CoinPairInfo'

dayjs.extend(utc)
dayjs.extend(timezone)
// import TypeCon from '../common/proModeAndChart/ProModeTradeTab/TypeCon'
import CombinedFilter from '../../common/CombinedFilter'
import LoadMoreIndicator from '../LoadMoreIndicator'
import MobileOrderList, { MobileOrderListField } from '../MobileOrderList'
import SideBadge from '../SideBadge'

export default function TradeHistoryTableBlock({
  sideType,
  setSideType,
  orderType
}: { sideType: string; setSideType: (val: string) => void; orderType: 'spot' | 'margin' }) {
  const {
    deepBookTradeHistory,
    deepBookTradeHistoryLoading,
    currentDeepBookPool,
    isCheckedAllMarkets,
    setShowDeepBookTradeHistoryNum,
    setDeepBookTradeHistory
  } = useDeepBookStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { type, handleTypeChangeDirect } = useSideFilter()
  const { isApp } = useWindowWidth()
  const { getDeepBookTradeHistory } = useGetDeepBookTradeHistory()

  // 在 H5 下使用父组件传递的筛选状态
  const effectiveType = isApp ? sideType : type
  const effectiveSetType = isApp ? setSideType : handleTypeChangeDirect

  const deepBookTradeHistoryList = useMemo(
    () => (isCheckedAllMarkets ? deepBookTradeHistory : deepBookTradeHistory?.filter((item: any) => item.poolId == currentDeepBookPool?.address)),
    [deepBookTradeHistory, currentDeepBookPool, isCheckedAllMarkets]
  )

  // 前端筛选：根据 side 筛选
  const dataSource = useMemo(() => {
    let filtered = deepBookTradeHistoryList

    // 根据 side 筛选
    if (effectiveType && !effectiveType.split(',').includes('All')) {
      const types = effectiveType.split(',')
      filtered = filtered.filter((order: any) => types.includes(order.side))
    }

    return filtered
  }, [deepBookTradeHistoryList, effectiveType])

  // useEffect(() => {
  //   setShowDeepBookTradeHistoryNum(dataSource?.length)
  // }, [dataSource?.length])

  const { getExplorerUrl } = useExplorer()

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

      const result = await getDeepBookTradeHistory(params)

      if (result && result.list.length > 0) {
        setDeepBookTradeHistory([...deepBookTradeHistory, ...result.list])
        setCursor(result.cursor)
        setHasMore(result.hasMore)
      } else {
        setHasMore(false)
      }
    },
    enabled: true,
    dataLength: dataSource?.length || 0,
    isInitialLoading: deepBookTradeHistoryLoading,
    scrollContainerRef
  })

  // 当 orderType 变化时，重置 cursor 和 hasMore 状态（数据获取由父组件统一处理）
  const prevOrderTypeRef = useRef<'spot' | 'margin'>(orderType)
  const prevDataLengthRef = useRef<number>(deepBookTradeHistory?.length || 0)

  useEffect(() => {
    if (prevOrderTypeRef.current !== orderType) {
      prevOrderTypeRef.current = orderType
      setCursor(null)
      setHasMore(true)
    }
  }, [orderType, setCursor, setHasMore])

  // 当数据被清空时（比如切换 tab），重置 cursor
  useEffect(() => {
    const currentLength = deepBookTradeHistory?.length || 0
    if (prevDataLengthRef.current > 0 && currentLength === 0) {
      // 数据被清空，重置 cursor
      setCursor(null)
      setHasMore(true)
    }
    prevDataLengthRef.current = currentLength
  }, [deepBookTradeHistory?.length, setCursor, setHasMore])

  // 初始化 cursor
  useInitCursor(deepBookTradeHistory, cursor, setCursor, setHasMore, 'TradeHistory', PAGE_SIZE)

  // ===== Mobile fields configuration =====
  const mobileFields: MobileOrderListField[] = useMemo(
    () => [
      // ...(orderType === 'margin'
      //   ? [
      //     {
      //       key: 'leverage',
      //       label: 'Leverage',
      //       render: (item: any) => (
      //         <Text fontSize="12px" color="text_caption">
      //           {item?.leverage || 1.2} X
      //         </Text>
      //       )
      //     },
      //     {
      //       key: 'collateral',
      //       label: 'Collateral',
      //       alignItems: 'flex-start' as const,
      //       render: (item: any) => (
      //         <VStack alignItems={'flex-end'}>
      //           {['100 SUI', '10 USDC'].map(i => (
      //             <Text key={`collateral-${i}`} fontSize="12px" color="text_caption">
      //               {i}
      //             </Text>
      //           ))}
      //         </VStack>
      //       )
      //     },
      //     {
      //       key: 'estBorrow',
      //       label: 'Est. Borrow',
      //       render: (item: any) => (
      //         <Text fontSize="12px" color="text_caption">
      //           {item?.estBorrow || '10 USDC'}
      //         </Text>
      //       )
      //     }
      //   ]
      //   : []),

      {
        key: 'price',
        label: 'Price',
        render: (item: any) => (
          <Text fontSize="12px" color="text_caption">
            {formatNumber(item?.price)}
          </Text>
        )
      },
      {
        key: 'quantity',
        label: 'Quantity',
        render: (item: any) => (
          <HStack justify="flex-end" gap="4px">
            <Text fontSize="12px" color="text_caption">
              {formatNumber(item?.total)}
            </Text>
            <Text fontSize="12px" color="text_caption">
              {item?.baseAssets?.symbol}
            </Text>
          </HStack>
        )
      },
      {
        key: 'fee',
        label: 'Fee',
        render: (item: any) => (
          <HStack justify="flex-end" gap="4px">
            <Text fontSize="12px" color="text_caption">
              {item?.fee}
            </Text>
            <Text fontSize="12px" color="text_caption">
              {item?.feeCoinSymbol}
            </Text>
          </HStack>
        )
      },
      // ...(orderType === 'margin'
      //   ? [
      //       {
      //         key: 'floatingPnL',
      //         label: 'Floating PnL',
      //         render: (item: any) => (
      //           <Text fontSize="12px" color={item?.floatingPnL > 0 ? 'primary_green' : 'primary_red'} textAlign="left">
      //             {item?.floatingPnL || '10'} {item?.quoteAssets?.symbol}
      //           </Text>
      //         )
      //       }
      //     ]
      //   : []),
      {
        key: 'txns',
        label: 'Txns',
        render: (item: any) => (
          <HStack
            justify="flex-end"
            gap="4px"
            onClick={() => {
              window.open(getExplorerUrl(item?.tx, 'tx'), '_blank')
            }}
            _hover={{
              cursor: 'pointer',
              svg: {
                fill: 'primary'
              },
              '&>p': {
                color: 'primary',
                textDecoration: 'underline'
              }
            }}
          >
            <Text fontSize={'12px'} textDecoration={'underline dotted'} color="text_caption">
              {addressAbridge(item?.tx)}
            </Text>
          </HStack>
        )
      }
    ],
    [getExplorerUrl]
  )

  // ===== Render Mobile or Desktop =====
  if (isApp) {
    return (
      <>
        <MobileOrderList
          dataSource={dataSource}
          fields={mobileFields}
          loading={!currentAccount?.address ? false : deepBookTradeHistoryLoading}
          noDataText="No trade history in the last 3 months"
          noDataType={!currentAccount?.address ? 'nowallet' : 'nodata'}
          onWalletConnect={() => onWalletModal(true)}
          showProgress={false}
          headerRight={(item: any) => {
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const formattedTime = item?.timestamp ? dayjs(item.timestamp).tz(browserTimezone).format('MMM D YYYY h:mm:ss A') : '-'
            return (
              <Text fontSize="12px" color="text_caption">
                {formattedTime}
              </Text>
            )
          }}
        />

        {/* 加载更多指示器 - 移动端 */}
        {dataSource && dataSource.length > 0 && hasMore && (
          <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource.length} />
        )}
      </>
    )
  }

  return (
    <Box ref={scrollContainerRef} w="100%" h="100%" display="flex" flexDirection="column" px="8px" overflow="auto">
      <Table
        dataSource={dataSource}
        columns={getColumns(effectiveType, effectiveSetType, orderType)}
        loading={!currentAccount?.address ? false : deepBookTradeHistoryLoading}
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
            pr: '8px !important'
          },
          'tbody tr td:last-of-type': {
            pr: '8px !important'
          }
        }}
        noData={
          !currentAccount?.address ? (
            <NoData imgSize="100px" type="nowallet" noBorder bg="none" onboard={() => onWalletModal(true)} />
          ) : dataSource?.length == 0 ? (
            <NoData imgSize="100px" type="nodata" text="No trade history in the last 3 months" noBorder bg="none" />
          ) : undefined
        }
      />

      {/* 加载更多指示器 - 桌面端 */}
      {dataSource && dataSource.length > 0 && (
        <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource.length} />
      )}
    </Box>
  )
}

const getColumns = (type: string, setType: (val: string) => void, orderType: 'spot' | 'margin') => {
  const { getExplorerUrl } = useExplorer()

  return [
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Market
        </Text>
      ),
      key: '#',
      thConfig: {
        // w: '20%'
      },
      render: (item: any, index?: number) => (
        <HStack>
          <CoinPairInfo
            poolInfo={{
              displayTokenA: item?.baseAssets,
              displayTokenB: item?.quoteAssets,
              poolAddress: item?.poolId
            }}
            imgStyle={{
              w: '24px',
              h: '24px'
            }}
            showFee={false}
            coinPairInfoWrapStyle={{
              p: '0px'
            }}
          />
        </HStack>
      )
    },
    {
      title: <Text fontSize="12px">Time</Text>,
      key: 'time',
      thConfig: {
        // w: '20%'
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
        <HStack justifyContent="flex-start" height="24px" fontWeight="500">
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
          />
        </HStack>
      ),
      key: 'side',
      thConfig: {
        // w: '12.5%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => <SideBadge side={item?.side} />
    },
    // ...(orderType === 'margin'
    //   ? [
    //     {
    //       title: (
    //         <Text fontSize="12px" fontWeight="500">
    //           Leverage
    //         </Text>
    //       ),
    //       key: 'leverage',
    //       thConfig: {
    //         // w: '8%'
    //       },
    //       tdConfig: {
    //         textAlign: 'left' as const
    //       },
    //       render: (item: any) => (
    //         <Text fontSize="12px" color="text_caption" textAlign="left">
    //           {item?.leverage}x
    //         </Text>
    //       )
    //     },
    //     {
    //       title: (
    //         <Text fontSize="12px" fontWeight="500">
    //           Collateral
    //         </Text>
    //       ),
    //       key: 'collateral',
    //       thConfig: {
    //         // w: '12%'
    //       },
    //       tdConfig: {
    //         textAlign: 'left' as const
    //       },
    //       render: (item: any) => (
    //         <VStack alignItems="flex-start" gap="4px">
    //           <Text fontSize="12px" color="text_caption" textAlign="left">
    //             1000 SUI
    //           </Text>
    //           <Text fontSize="12px" color="text_caption" textAlign="left">
    //             1000 USDC
    //           </Text>
    //         </VStack>
    //       )
    //     },
    //     {
    //       title: (
    //         <Text fontSize="12px" fontWeight="500">
    //           Est. Borrow
    //         </Text>
    //       ),
    //       key: 'estBorrow',
    //       thConfig: {
    //         // w: '10%'
    //       },
    //       tdConfig: {
    //         textAlign: 'left' as const
    //       },
    //       render: (item: any) => (
    //         <Text fontSize="12px" color="text_caption" textAlign="left">
    //           100 SUI
    //         </Text>
    //       )
    //     }
    //   ]
    //   : []),
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Price
        </Text>
      ),
      key: 'orderPrice',
      thConfig: {
        // w: '12.5%',
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
        <Text fontSize="12px" fontWeight="500">
          Quantity
        </Text>
      ),
      key: 'filled',
      thConfig: {
        // w: '12.5%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <VStack w="100%" justify="flex-start" gap="0px">
          <HStack w="100%" justify="flex-start" gap="4px">
            <Text color="text_caption">{formatNumber(item?.total)}</Text>
            <Text fontSize="12px" color="text_paragraph">
              {item?.baseAssets?.symbol}
            </Text>
          </HStack>
        </VStack>
      )
    },
    {
      title: <Text fontSize="12px">Fee</Text>,
      key: 'fee',
      thConfig: {
        // w: '12.5%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-start" gap="4px">
          <Text fontSize="12px" color="text_caption">
            {item?.fee}
          </Text>
          <Text fontSize="12px">{item?.feeCoinSymbol}</Text>
        </HStack>
      )
    },

    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Txns
        </Text>
      ),
      key: 'action',
      thConfig: {
        w: '10%'
      },
      render: (item: any) => (
        <HStack
          w="100%"
          justify="flex-end"
          gap="4px"
          onClick={() => {
            window.open(getExplorerUrl(item?.tx, 'tx'), '_blank')
          }}
          _hover={{
            cursor: 'pointer',
            svg: {
              fill: 'primary'
            },
            '&>p': {
              color: 'primary',
              textDecoration: 'underline'
            }
          }}
        >
          <Text fontSize="12px">{addressAbridge(item?.tx)}</Text>
          <Icon xlinkHref="#icon-icon_link3" fontSize="16px" />
        </HStack>
      )
    }
  ]
}
