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
import { useSideFilter } from '../../hooks/deepbook/useSideFilter'
import CoinPairInfo from '../common/CoinPairInfo'

dayjs.extend(utc)
dayjs.extend(timezone)
// import TypeCon from '../common/proModeAndChart/ProModeTradeTab/TypeCon'
import CombinedFilter from '../common/CombinedFilter'
import LoadMoreIndicator from './LoadMoreIndicator'
import MobileOrderList, { MobileOrderListField } from './MobileOrderList'
import SideBadge from './SideBadge'

export default function TradeHistoryTableBlock({ sideType, setSideType }: { sideType: string; setSideType: (val: string) => void }) {
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
        isLoadMore: true
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

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setDeepBookTradeHistory([])
    setCursor(null)
  }, [isCheckedAllMarkets])

  // 初始化 cursor
  useInitCursor(deepBookTradeHistory, cursor, setCursor, setHasMore, 'TradeHistory', PAGE_SIZE)

  // ===== Mobile fields configuration =====
  const mobileFields: MobileOrderListField[] = useMemo(
    () => [
      {
        key: 'price',
        label: 'Price',
        render: (item: any) => (
          <Text fontSize="12px" color={{ base: 'text_caption', lg: 'text_paragraph' }}>
            {formatNumber(item?.price)}
          </Text>
        )
      },
      {
        key: 'quantity',
        label: 'Quantity',
        render: (item: any) => (
          <HStack justify="flex-end" gap="4px">
            <Text fontSize="12px" color={{ base: 'text_caption', lg: 'text_paragraph' }}>
              {formatNumber(item?.total)}
            </Text>
            <Text fontSize="12px">{item?.baseAssets?.symbol}</Text>
          </HStack>
        )
      },
      {
        key: 'fee',
        label: 'Fee',
        render: (item: any) => (
          <HStack justify="flex-end" gap="4px">
            <Text fontSize="12px" color={{ base: 'text_caption', lg: 'text_paragraph' }}>
              {item?.fee}
            </Text>
            <Text fontSize="12px">{item?.feeCoinSymbol}</Text>
          </HStack>
        )
      },
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
            <Text fontSize={'12px'} textDecoration={'underline dotted'}>
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
            return <Text fontSize="12px">{formattedTime}</Text>
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
    <Box ref={scrollContainerRef} w="100%" h="100%" display="flex" flexDirection="column" overflow="auto">
      <Table
        dataSource={dataSource}
        columns={getColumns(effectiveType, effectiveSetType, isApp)}
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
            <NoData type="nowallet" noBorder bg="none" onboard={() => onWalletModal(true)} />
          ) : dataSource?.length == 0 ? (
            <NoData type="nodata" text="No trade history in the last 3 months" noBorder bg="none" />
          ) : undefined
        }
        loadMoreIndicator={{ loadMoreRef, isLoadingMore, hasMore, cursor, dataSource }}
      />

      {/* 加载更多指示器 - 桌面端 */}
      {/* {dataSource && dataSource.length > 0 && (
        <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource.length} />
      )} */}
    </Box>
  )
}

const getColumns = (type: string, setType: (val: string) => void, isApp: boolean) => {
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
                filterList: ['Buy', 'Sell', 'All'],
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
        w: '12.5%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => <SideBadge side={item?.side} />
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Price
        </Text>
      ),
      key: 'orderPrice',
      thConfig: {
        w: '12.5%',
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
    // {
    //   title: (
    //     <Text fontSize="12px" >
    //       Filled/Total
    //     </Text>
    //   ),
    //   key: 'filled',
    //   thConfig: {
    //     w: '10%',
    //     textAlign: 'right'
    //   },
    //   render: (item: any) => (
    //     <VStack w="100%" justify="flex-end" gap="0px">
    //       <HStack w="100%" justify="flex-end" gap="4px">
    //         <Text color="text_caption">{item?.total}</Text>
    //         <Text>{item?.baseAssets?.symbol}</Text>
    //       </HStack>
    //       <HStack w="100%" justify="flex-end" gap="4px">
    //         <Text color="text_caption">{item?.filled}</Text>
    //         <Text>{item?.quoteAssets?.symbol}</Text>
    //       </HStack>
    //     </VStack>
    //   )
    // },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Quantity
        </Text>
      ),
      key: 'filled',
      thConfig: {
        w: '12.5%',
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
        w: '12.5%',
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
    // {
    //   title: (
    //     <Text fontSize="12px" >
    //       Order status
    //     </Text>
    //   ),
    //   key: 'orderStatus',
    //   thConfig: {
    //     w: '10%',
    //     textAlign: 'right'
    //   },
    //   render: (item: any) => (
    //     <Text w="100%" textAlign="right">
    //       {item?.orderStatus}
    //     </Text>
    //   )
    // },
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
          <Text fontSize="12px" color="text_caption">
            {addressAbridge(item?.tx)}
          </Text>
          <Icon xlinkHref="#icon-icon_link3" fontSize="16px" />
        </HStack>
      )
    }
  ]
}
