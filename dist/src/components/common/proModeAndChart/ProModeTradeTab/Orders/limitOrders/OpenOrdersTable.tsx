import { CoinInfoBlock } from '@/components/limit/OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from '@/components/limit/OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from '@/components/limit/OrderItemBlock/FilledSizeBlock'
import { OrderActionBlock } from '@/components/limit/OrderItemBlock/OrderActionBlock'
import { PriceBlock } from '@/components/limit/OrderItemBlock/PriceBlock'
import useLimitListStore from '@/store/limit/useLimitList'
import { LimitOrderInfo } from '@/types/limit'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { H5MapTable, NoData, Pagination, Table } from '@cetus/ui-kit'
import { Button, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

function OpenOrdersTable({ maxHeight }: { maxHeight: any }) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { myOrderList, orderListLoading } = useLimitListStore()
  const pageSize = 10
  const [paginationList, setPaginationList] = useState<LimitOrderInfo[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    if (myOrderList?.length > 0) {
      setTotal(myOrderList?.length)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setPaginationList(myOrderList.slice(start, end))
    } else {
      setPaginationList([])
    }
  }, [currentPage, myOrderList])
  const { isApp } = useWindowWidth()

  const { size } = useDocumentSize()
  return (
    <VStack w="100%" position="relative" gap="20px" mt="4px">
      {!currentAccount?.address ? (
        <NoData
          type="nowallet"
          noBorder
          bg="none"
          onboard={() => {
            onWalletModal(true)
          }}
        />
      ) : !orderListLoading && myOrderList?.length === 0 ? (
        <NoData type="nodata" text={"You don't have any open orders yet."} noBorder bg="none" />
      ) : isApp ? (
        <H5MapTable
          rowKey="orderID"
          columns={getColumns()}
          dataSource={paginationList}
          loading={orderListLoading}
          itemSkeletonLength={3}
          isShowBorder={false}
          itemHeight="30px"
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
          columns={getColumns()}
          dataSource={paginationList}
          loading={orderListLoading}
          trPadding="0px"
          fixedHeader
          maxHeight={maxHeight}
          rowStyle={{
            h: '40px',
            cursor: 'pointer',
            _hover: {
              bg: 'none !important'
            }
          }}
        />
      )}
      {paginationList?.length > pageSize && (
        <Center>
          <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
        </Center>
      )}
    </VStack>
  )
}

const getColumns = () => {
  const columns = [
    {
      title: <Text fontSize="13px">Order Info</Text>,
      key: 'order',
      showLabel: false,
      thConfig: { w: '18%' },
      render: (record: any) => (
        <HStack sx={{ p: { fontSize: '13px' } }}>
          <CoinInfoBlock imgSize="20px" info={record} />
        </HStack>
      )
    },
    {
      title: (
        <Text fontSize="13px" textAlign="right">
          Price
        </Text>
      ),
      key: 'price',
      thConfig: { w: '20%' },
      render: (record: any) => (
        <HStack justify="flex-end" sx={{ p: { fontSize: '13px' } }} ml="12px">
          <PriceBlock info={record} />
        </HStack>
      )
    },
    {
      title: (
        <Text fontSize="13px" textAlign="right">
          Filled Size
        </Text>
      ),
      key: 'filled',
      thConfig: { w: '15%' },
      render: (record: any) => (
        <HStack justify="flex-end" sx={{ p: { fontSize: '13px' } }} ml="12px">
          <FilledSizeBlock info={record} />{' '}
        </HStack>
      )
    },
    {
      title: (
        <Text fontSize="13px" textAlign="right">
          Expiry
        </Text>
      ),
      key: 'nextOrder',
      thConfig: { w: '20%' },
      render: (record: any) => (
        <HStack justify="flex-end" sx={{ p: { fontSize: '13px' } }} ml="12px">
          <ExpiryBlock info={record} />{' '}
        </HStack>
      )
    },
    {
      title: (
        <Text fontSize="13px" textAlign="right">
          Action
        </Text>
      ),
      showLabel: false,
      key: 'action',
      thConfig: { w: '20%' },
      render: (record: any) => (
        <HStack justify="flex-end" sx={{ button: { fontSize: '13px' } }}>
          <OrderActionBlock orderInfo={record} />{' '}
        </HStack>
      )
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

export default OpenOrdersTable
