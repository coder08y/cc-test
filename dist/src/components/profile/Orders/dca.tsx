import DcaItemCoinPirBlock from '@/components/dca/DcaItemBlock/DcaItemCoinPirBlock'
import DcaProgressBlock from '@/components/dca/DcaItemBlock/DcaProgressBlock'
import DcaTableAction from '@/components/dca/DcaItemBlock/DcaTableAction'
import RangeValueBlock from '@/components/dca/DcaItemBlock/RangeValueBlock'
import HiddenDotted from '@/components/profile/HiddenDotted'
import useDcaActions from '@/hooks/dca/useDcaActions'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import { SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Drawer, H5MapTable, Icon, NoData, Pagination, Table } from '@cetus/ui-kit'
import { d, utcTimeFormatted } from '@cetus/utils'
import { Button, Center, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
function Dca() {
  const { isAutoRefresh, dcaOrderListLoading, dcaActiveOrderList, dcaPastOrderList } = useActiveOrdersStore()

  const [currentTab, setCurrentTab] = useState('activeDCAs')
  const isActiveTab = currentTab === 'activeDCAs'
  const pageSize = 10

  const tabList = useMemo(
    () => [
      {
        label: 'Active DCAs',
        value: 'activeDCAs',
        num: !isAutoRefresh && dcaOrderListLoading ? '' : dcaActiveOrderList?.length
      },
      {
        label: 'Past DCAs',
        value: 'pastDCAs',
        num: !isAutoRefresh && dcaOrderListLoading ? '' : dcaPastOrderList?.length
      }
    ],
    [isAutoRefresh, dcaOrderListLoading, dcaActiveOrderList, dcaPastOrderList]
  )

  const currentList = useMemo(() => {
    return isActiveTab ? dcaActiveOrderList : dcaPastOrderList
  }, [isActiveTab, dcaActiveOrderList, dcaPastOrderList])

  const { isApp } = useWindowWidth()
  const { closeAll, claimAll, isClaimAllLoading, isCloseAllLoading } = useDcaActions()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [paginationList, setPaginationList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const totalClaimNum = useMemo(() => {
    if (!isActiveTab || !currentList?.length) return '0'
    return currentList.reduce((sum, order) => d(sum).plus(order?.outBalance || 0), d(0)).toString()
  }, [isActiveTab, currentList])

  const isClaimDisabled = d(totalClaimNum).isZero() || isClaimAllLoading
  const isCloseDisabled = !currentList?.length || isCloseAllLoading

  const columns = useMemo(() => getColumns(isActiveTab), [isActiveTab])

  useEffect(() => {
    const totalItems = currentList?.length || 0
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize

    if (totalItems > 0) {
      if (totalItems <= start) {
        setCurrentPage(1)
      } else {
        setTotal(totalItems)
        setPaginationList(currentList.slice(start, end))
      }
    } else {
      setPaginationList([])
      setTotal(0)
    }
  }, [currentList, currentPage])

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
        {isActiveTab &&
          currentList?.length > 1 &&
          (isApp ? (
            <Button
              bg="card_bg"
              variant="outline"
              w="32px"
              h="32px"
              p="0"
              borderRadius="8px"
              onClick={onOpen}
              sx={{ _hover: { svg: { fill: 'primary' } } }}
            >
              <Icon svgFill="primary" xlinkHref="#icon-icon_more" svgW="16px" svgH="16px" />
            </Button>
          ) : (
            <OpenMoreContent
              isClaimAllLoading={isClaimAllLoading}
              claimDisabled={isClaimDisabled}
              claimAll={() => claimAll(currentList)}
              isCloseAllLoading={isCloseAllLoading}
              closeDisabled={isCloseDisabled}
              closeAll={() => closeAll(currentList)}
            />
          ))}
      </HStack>

      <VStack w="100%" position="relative" gap="20px">
        {(isAutoRefresh || !dcaOrderListLoading) && currentList?.length === 0 ? (
          <NoData type="nodata" text={isActiveTab ? 'No active DCAs' : 'No past DCAs'} noBorder />
        ) : isApp ? (
          <H5MapTable
            rowKey="orderID"
            columns={columns}
            dataSource={paginationList}
            loading={!isAutoRefresh && dcaOrderListLoading}
            itemSkeletonLength={3}
            itemHeight="30px"
            haveDividingLine={false}
            rowStyle={() => ({
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'border',
              bg: 'bg_secondary',
              p: '12px 8px'
            })}
          />
        ) : (
          <Table
            rowKey="orderID"
            columns={columns}
            dataSource={paginationList}
            loading={!isAutoRefresh && dcaOrderListLoading}
            rowStyle={{ h: '80px', cursor: 'pointer' }}
          />
        )}
        {currentList?.length > pageSize && (
          <Center>
            <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
          </Center>
        )}
      </VStack>

      <CancelDrawer
        isOpen={isOpen}
        onClose={onClose}
        isClaimAllLoading={isClaimAllLoading}
        claimDisabled={isClaimDisabled}
        claimAll={() => claimAll(currentList)}
        isCloseAllLoading={isCloseAllLoading}
        closeDisabled={isCloseDisabled}
        closeAll={() => closeAll(currentList)}
      />
    </VStack>
  )
}

const getColumns = (isActiveOrder: boolean) => {
  const columns = [
    {
      title: <Text>Orders</Text>,
      key: 'order',
      showLabel: false,
      thConfig: { w: '18%' },
      render: (record: any) => <DcaItemCoinPirBlock orderInfo={record} />
    },
    {
      title: <Text textAlign="right">Price Range</Text>,
      key: 'price',
      thConfig: { w: '20%' },
      render: (record: any) => (
        <HStack justify="flex-end">
          <HiddenDotted>
            <RangeValueBlock orderInfo={record} isProfile isRank />
          </HiddenDotted>
        </HStack>
      )
    },
    {
      title: <Text textAlign="right">Filled Size</Text>,
      key: 'completed',
      thConfig: { w: '15%' },
      render: (record: any) => (
        <HStack justify="flex-end">
          <HiddenDotted>
            <DcaProgressBlock orderInfo={record} isProfile />{' '}
          </HiddenDotted>
        </HStack>
      )
    },
    isActiveOrder && {
      title: <Text textAlign="right">Next Order (UTC)</Text>,
      key: 'nextOrder',
      thConfig: { w: '20%' },
      render: ({ nextCycleAtTimeStamp }: any) => (
        <Text color="text_caption" whiteSpace="nowrap">
          {utcTimeFormatted(nextCycleAtTimeStamp)}
        </Text>
      )
    },
    {
      title: <Text textAlign="right">Actions</Text>,
      key: 'actions',
      showLabel: false,
      thConfig: { w: '15%' },
      render: (record: any) => <DcaTableAction orderInfo={record} isActiveOrder={isActiveOrder} />
    }
  ]

  return columns.filter(Boolean)
}

function OpenMoreContent({
  isClaimAllLoading,
  claimDisabled,
  claimAll,
  isCloseAllLoading,
  closeDisabled,
  closeAll
}: {
  isClaimAllLoading: boolean
  claimDisabled: boolean
  isCloseAllLoading: boolean
  closeDisabled: boolean
  claimAll: () => void
  closeAll: () => void
}) {
  return (
    <HStack>
      <Button
        h="32px"
        p="8px"
        fontSize="12px"
        fontWeight="500"
        borderRadius="8px"
        isLoading={isClaimAllLoading}
        isDisabled={claimDisabled}
        onClick={claimAll}
      >
        Claim All
      </Button>
      <Button
        h="32px"
        p="8px"
        fontSize="12px"
        fontWeight="400"
        variant="ghost"
        isLoading={isCloseAllLoading}
        isDisabled={closeDisabled}
        onClick={closeAll}
      >
        Close All
      </Button>
    </HStack>
  )
}

function CancelDrawer({
  isOpen,
  onClose,
  isClaimAllLoading,
  claimDisabled,
  claimAll,
  isCloseAllLoading,
  closeDisabled,
  closeAll
}: {
  isOpen: boolean
  onClose: () => void
  isClaimAllLoading: boolean
  claimDisabled: boolean
  isCloseAllLoading: boolean
  closeDisabled: boolean
  claimAll: () => void
  closeAll: () => void
}) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="bottom">
      <VStack
        align="flex-start"
        sx={{
          '>div': {
            w: '100%',
            flexDirection: 'column',
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
          }
        }}
      >
        <OpenMoreContent
          isClaimAllLoading={isClaimAllLoading}
          claimDisabled={claimDisabled}
          claimAll={claimAll}
          isCloseAllLoading={isCloseAllLoading}
          closeDisabled={closeDisabled}
          closeAll={closeAll}
        />
      </VStack>
    </Drawer>
  )
}

export default Dca
