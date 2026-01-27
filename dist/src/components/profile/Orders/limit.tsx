import HiddenDotted from '@/components/profile/HiddenDotted'
import useGetLimitOrderHistory from '@/hooks/limit/useGetLimitOrderHistory'
import useLimitCancelAction from '@/hooks/limit/useLimitCancelAction'
import useLimitListStore from '@/store/limit/useLimitList'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import { LimitOrderInfo } from '@/types/limit'
import { SelectTab } from '@cetus/design'
import { useRpcListener } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Drawer, H5MapTable, Icon, NoData, Pagination, Table } from '@cetus/ui-kit'
import { Button, Center, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

import { CoinInfoBlock } from '@/components/limit/OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from '@/components/limit/OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from '@/components/limit/OrderItemBlock/FilledSizeBlock'
import { OrderActionBlock } from '@/components/limit/OrderItemBlock/OrderActionBlock'
import { PriceBlock } from '@/components/limit/OrderItemBlock/PriceBlock'
import { StatusBlock } from '@/components/limit/OrderItemBlock/StatusBlock'

function usePaginationList<T>(list: T[], pageSize: number, currentPage: number) {
  const total = list.length
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const paginated = total > start ? list.slice(start, end) : []
  return { total, paginated }
}

function Limit() {
  const { currentAccount } = useAccountStore()
  const { getLimitOrderHistory, historyOrderList, historyOrderLoading } = useGetLimitOrderHistory()
  const { myOrderList, orderListLoading } = useLimitListStore()
  const { isAutoRefresh, autoRefreshCount } = useActiveOrdersStore()
  const { isApp } = useWindowWidth()
  const { handleCancelOrder, cancelOrderLoading } = useLimitCancelAction()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [currentTab, setCurrentTab] = useState<'openOrders' | 'ordersHistory'>('openOrders')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const displayedList = useMemo(() => {
    return currentTab === 'openOrders' ? myOrderList : historyOrderList
  }, [currentTab, myOrderList, historyOrderList])

  const isLoadingCurrentTab = useMemo(() => {
    return currentTab === 'openOrders' ? orderListLoading : historyOrderLoading
  }, [currentTab, orderListLoading, historyOrderLoading])

  const { total, paginated } = usePaginationList(displayedList || [], pageSize, currentPage)

  useEffect(() => {
    const start = (currentPage - 1) * pageSize
    if (displayedList.length <= start) {
      setCurrentPage(1)
    }
  }, [displayedList, currentPage])

  const fetchOrders = (isLoading?: boolean) => {
    if (currentAccount?.address) {
      getLimitOrderHistory(currentAccount.address, isLoading)
    }
  }

  useEffect(() => {
    if (autoRefreshCount > 0) {
      fetchOrders(true)
    }
  }, [autoRefreshCount])

  useEffect(() => {
    fetchOrders(false)
  }, [currentTab, currentAccount])

  useRpcListener({
    onRpcChange: () => fetchOrders(true)
  })

  const getTabNum = (loading: boolean, list: any[]) => {
    if ((isAutoRefresh || !loading) && list.length === 0) return 0
    if (!isAutoRefresh && loading) return ''
    return list.length
  }

  const tabList = useMemo(
    () => [
      {
        label: 'Open Orders',
        value: 'openOrders',
        num: getTabNum(orderListLoading, myOrderList)
      },
      {
        label: 'Orders History',
        value: 'ordersHistory',
        num: getTabNum(historyOrderLoading, historyOrderList)
      }
    ],
    [isAutoRefresh, orderListLoading, historyOrderLoading, myOrderList, historyOrderList]
  )

  const columns = useMemo(() => getColumns(currentTab === 'openOrders'), [currentTab])

  return (
    <VStack w="100%">
      <HStack w="100%" justify="space-between">
        <SelectTab<any, any>
          type="outlineTab"
          tabList={tabList}
          currentTab={currentTab}
          handleChangeTab={tab => setCurrentTab(tab?.value)}
          isActive={(current, tab) => current === tab.value}
          wrapStyle={{
            h: '32px',
            p: '3px',
            border: '1px solid',
            borderColor: 'border',
            borderRadius: '8px',
            gap: '4px',
            zIndex: '99'
          }}
          itemStyle={{
            h: '24px',
            p: '4px 8px',
            borderRadius: '4px',
            gap: '4px'
          }}
        />
        {currentTab === 'openOrders' &&
          displayedList.length > 1 &&
          (isApp ? (
            <Button
              variant="outline"
              w="32px"
              h="32px"
              p="0"
              bg="card_bg"
              borderRadius="8px"
              onClick={onOpen}
              sx={{
                _hover: {
                  svg: { fill: 'primary' }
                }
              }}
            >
              <Icon svgFill="primary" xlinkHref="#icon-icon_more" svgW="16px" svgH="16px" />
            </Button>
          ) : (
            <OpenMoreContent cancelOrderLoading={cancelOrderLoading} handleCancelOrder={() => handleCancelOrder(myOrderList)} />
          ))}
      </HStack>

      <VStack w="100%" position="relative" gap="20px">
        {(isAutoRefresh || !isLoadingCurrentTab) && displayedList.length === 0 ? (
          <NoData type="nodata" text={currentTab === 'openOrders' ? 'No open orders' : 'No history orders'} noBorder />
        ) : isApp ? (
          <H5MapTable
            rowKey="order_id"
            columns={columns}
            dataSource={paginated}
            loading={!isAutoRefresh && isLoadingCurrentTab}
            itemSkeletonLength={4}
            itemHeight="30px"
            haveDividingLine={false}
            rowStyle={(_, index) => ({
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'border',
              bg: 'bg_secondary',
              p: '12px 8px'
            })}
          />
        ) : (
          <Table
            rowKey="order_id"
            columns={columns}
            dataSource={paginated}
            loading={!isAutoRefresh && isLoadingCurrentTab}
            rowStyle={{ h: '80px', cursor: 'pointer' }}
          />
        )}

        {total > pageSize && (
          <Center>
            <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
          </Center>
        )}
      </VStack>

      <CancelDrawer
        isOpen={isOpen}
        onClose={onClose}
        cancelOrderLoading={cancelOrderLoading}
        handleCancelOrder={() => handleCancelOrder(myOrderList)}
      />
    </VStack>
  )
}

function getColumns(isOpenOrder: boolean) {
  const columns = [
    {
      title: <Text>Order</Text>,
      key: 'order',
      showLabel: false,
      thConfig: { w: '20%' },
      render: (record: LimitOrderInfo) => <CoinInfoBlock imgSize="28px" info={record} isProfile />
    },
    {
      title: <Text textAlign="right">Limit Price</Text>,
      key: 'price',
      thConfig: { w: '20%' },
      render: (record: LimitOrderInfo) => (
        <HStack justify="flex-end">
          <HiddenDotted>
            <PriceBlock info={record} isProfile />{' '}
          </HiddenDotted>
        </HStack>
      )
    },
    {
      title: <Text textAlign="right">Filled Size</Text>,
      key: 'completed',
      thConfig: { w: '12%' },
      render: (record: LimitOrderInfo) => (
        <HStack justify="flex-end">
          <HiddenDotted>
            <FilledSizeBlock info={record} isProfile />
          </HiddenDotted>
        </HStack>
      )
    },
    {
      title: <Text textAlign="right">Expiry</Text>,
      key: 'expiry',
      thConfig: { w: '16%' },
      render: (record: LimitOrderInfo) => <ExpiryBlock info={record} isProfile />
    },
    !isOpenOrder && {
      title: <Text textAlign="right">Status</Text>,
      key: 'status',
      thConfig: { w: '8%' },
      render: (record: LimitOrderInfo) => <StatusBlock historyInfo={record} openExpendItemObj={undefined} isProfile />
    },
    {
      title: <Text textAlign="right">Actions</Text>,
      key: 'actions',
      showLabel: false,
      thConfig: { w: '8%' },
      render: (record: LimitOrderInfo) => <OrderActionBlock orderInfo={record} isProfile isOpenOrder={isOpenOrder} />
    }
  ]

  return columns.filter(Boolean)
}

function OpenMoreContent({ cancelOrderLoading, handleCancelOrder }: { cancelOrderLoading: boolean; handleCancelOrder: () => void }) {
  return (
    <Button
      h="32px"
      p={{ base: '4px', lg: '8px' }}
      fontSize="12px"
      fontWeight="400"
      variant="ghost"
      isLoading={cancelOrderLoading}
      onClick={handleCancelOrder}
    >
      Cancel All
    </Button>
  )
}

function CancelDrawer({
  isOpen,
  onClose,
  cancelOrderLoading,
  handleCancelOrder
}: {
  isOpen: boolean
  onClose: () => void
  cancelOrderLoading: boolean
  handleCancelOrder: () => void
}) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
      <VStack
        align="flex-start"
        sx={{
          button: {
            w: '100%',
            bg: 'none !important',
            border: 'none !important',
            color: 'text_caption',
            fontSize: '16px',
            '&:disabled': {
              bg: 'none !important',
              '&:hover': {
                bg: 'none !important'
              }
            },
            '&:hover': {
              bg: 'none !important'
            }
          }
        }}
      >
        <OpenMoreContent cancelOrderLoading={cancelOrderLoading} handleCancelOrder={handleCancelOrder} />
      </VStack>
    </Drawer>
  )
}

export default Limit
