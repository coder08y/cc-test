import DropBlock from '@/components/common/DropBlock'
import { useGetDcaOrderList } from '@/hooks/dca/useGetDcaOrderList'
import usePreModeDcaActions from '@/hooks/dca/usePreModeDcaActions'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import { SelectTab } from '@cetus/design'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { H5MapTable, Icon, NoData, Pagination, Table } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { Button, Center, HStack, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import DcaItemCoinPirBlock from './DcaItemCoinPirBlock'
import DcaProgressBlock from './DcaProgressBlock'
import DcaTableAction from './DcaTableAction'
import RangeValueBlock from './RangeValueBlock'

function Dca({
  currentOrderTab,
  orderTabList,
  setCurrentOrderTab,
  maxHeight
}: {
  currentOrderTab: string
  orderTabList: any
  setCurrentOrderTab: (tab: string) => void
  maxHeight: any
}) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { getDcaOrderList } = useGetDcaOrderList()
  const { setDcaOrderListLoading, dcaOrderListLoading, dcaActiveOrderList, dcaPastOrderList, setDcaActiveOrderList, setDcaPastOrderList } =
    useActiveOrdersStore()
  const handleGetDcaOrderList = async (account: string, isLoading: boolean = false) => {
    if (isLoading) {
      setDcaOrderListLoading(true)
    }
    await getDcaOrderList(account)
    setDcaOrderListLoading(false)
  }

  useEffect(() => {
    if (currentAccount?.address) {
      handleGetDcaOrderList(currentAccount?.address, true)
    }
  }, [currentAccount?.address])

  const [currentTab, setCurrentTab] = useState('Active DCAs')
  const isActiveTab = currentTab === 'Active DCAs'
  const pageSize = 10

  const tabList = useMemo(
    () => [
      {
        label: 'Active DCAs',
        value: 'Active DCAs',
        num: dcaOrderListLoading ? '' : dcaActiveOrderList?.length
      },
      {
        label: 'Past DCAs',
        value: 'Past DCAs',
        num: dcaOrderListLoading ? '' : dcaPastOrderList?.length
      }
    ],
    [dcaOrderListLoading, dcaActiveOrderList, dcaPastOrderList]
  )

  const currentList = useMemo(() => {
    return isActiveTab ? dcaActiveOrderList : dcaPastOrderList
  }, [isActiveTab, dcaActiveOrderList, dcaPastOrderList])

  const { isApp } = useWindowWidth()
  const { closeAll, claimAll, isClaimAllLoading, isCloseAllLoading } = usePreModeDcaActions()
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

  const columns = useMemo(() => getColumns(isActiveTab, handleGetDcaOrderList), [isActiveTab])

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

  const { size } = useDocumentSize()
  return (
    <VStack w="100%">
      <HStack w="100%" justify="space-between" mt={{ base: '0px', lg: '12px' }}>
        <HStack gap={{ base: '8px', lg: '16px' }}>
          <SelectTab<any, any>
            type="outlineTab"
            tabList={orderTabList}
            currentTab={currentOrderTab}
            handleChangeTab={tab => setCurrentOrderTab(tab?.label)}
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
          <DropBlock
            currenTab={currentTab}
            tabList={tabList}
            onChange={label => {
              const selected = tabList.find(item => item.label === label)
              if (selected) setCurrentTab(selected?.label)
            }}
          />
        </HStack>
        {isActiveTab &&
          currentList?.length > 1 &&
          (isApp ? (
            <Button
              bg="card_bg"
              variant="outline"
              w="28px"
              h="28px"
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
        {!currentAccount?.address ? (
          <NoData
            type="nowallet"
            noBorder
            bg="none"
            mt="-4px"
            onboard={() => {
              onWalletModal(true)
            }}
          />
        ) : !dcaOrderListLoading && currentList?.length === 0 ? (
          <NoData type="nodata" text={isActiveTab ? 'No active DCAs' : 'No past DCAs'} noBorder bg="none" />
        ) : isApp ? (
          <H5MapTable
            rowKey="orderID"
            columns={columns}
            dataSource={paginationList}
            loading={dcaOrderListLoading}
            itemSkeletonLength={3}
            itemHeight="24px"
            isShowBorder={false}
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
            loading={dcaOrderListLoading}
            trPadding="0px"
            fixedHeader
            maxHeight={maxHeight}
            rowStyle={{
              h: '48px',
              cursor: 'pointer',
              _hover: {
                bg: 'none !important'
              }
            }}
          />
        )}
        {currentList?.length > pageSize && (
          <Center>
            <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
          </Center>
        )}
      </VStack>
    </VStack>
  )
}

const getColumns = (isActiveOrder: boolean, handleGetDcaOrderList?: any) => {
  const columns = [
    {
      title: <Text fontSize="13px">Orders</Text>,
      key: 'order',
      showLabel: false,
      thConfig: { w: '18%' },
      render: (record: any) => <DcaItemCoinPirBlock orderInfo={record} />
    },
    {
      title: (
        <Text fontSize="13px" textAlign="right">
          Price Range
        </Text>
      ),
      key: 'price',
      thConfig: { w: '20%' },
      render: (record: any) => (
        <HStack justify="flex-end">
          <RangeValueBlock orderInfo={record} isProfile isRank />
        </HStack>
      )
    },
    {
      title: (
        <Text fontSize="13px" textAlign="right">
          Filled Size
        </Text>
      ),
      key: 'completed',
      thConfig: { w: '15%' },
      render: (record: any) => (
        <HStack justify="flex-end">
          <DcaProgressBlock orderInfo={record} isProfile />{' '}
        </HStack>
      )
    },
    isActiveOrder && {
      title: (
        <Text fontSize="13px" textAlign="right">
          Next Order (UTC)
        </Text>
      ),
      key: 'nextOrder',
      thConfig: { w: '20%' },
      render: ({ nextCycleAt }: any) => <Text color="text_caption">{nextCycleAt}</Text>
    },
    {
      title: <Text textAlign="right">Actions</Text>,
      key: 'actions',
      showLabel: false,
      thConfig: { w: '15%' },
      render: (record: any) => <DcaTableAction orderInfo={record} isActiveOrder={isActiveOrder} refresh={handleGetDcaOrderList} />
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
        h="28px"
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
        h="28px"
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

export default Dca
