import useLimitListStore from '@/store/limit/useLimitList'
import { LimitOrderInfo } from '@/types/limit'
import { useAccountStore } from '@cetus/stores'
import { NoData, Pagination } from '@cetus/ui-kit'
import { Center, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { SkipViewPc } from '../farms/FarmsTable'
import { OrderTableItem } from './OrderTableItem'

export function OrderTableList() {
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
    }
  }, [currentPage, myOrderList])
  return (
    <Table variant="simple_list" w="100%" sx={{ td: { h: '60px !important' } }}>
      <Thead>
        <Tr>
          <Th>Order Info</Th>
          <Th textAlign="right">Price</Th>
          <Th textAlign="right">Filled Size</Th>
          <Th textAlign="right">Expiry</Th>
          <Th textAlign="right">Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {!currentAccount?.address ? (
          <Tr
            sx={{
              td: {
                bg: 'none !important',
                p: '0 !important',
                border: 'none !important'
              },
              _hover: {
                bg: 'none !important',
                border: 'none !important'
              }
            }}
          >
            <Td colSpan={5} w="100%">
              <NoData
                type="nowallet"
                onboard={() => {
                  onWalletModal(true)
                }}
                borderRadius="16px"
              />
            </Td>
          </Tr>
        ) : orderListLoading ? (
          <SkipViewPc itemList={[1, 2, 3]} skeletonNum={5} rowStyle={{ h: '66px' }} />
        ) : myOrderList.length === 0 ? (
          <Tr
            sx={{
              td: {
                bg: 'none !important',
                p: '0 !important',
                border: 'none !important'
              },
              _hover: {
                bg: 'none !important',
                border: 'none !important'
              }
            }}
          >
            <Td colSpan={5} w="100%">
              <NoData type="nodata" text="You don't have any open orders yet." borderRadius="16px" />
            </Td>
          </Tr>
        ) : (
          <React.Fragment>
            {paginationList.map((orderInfo: any) => {
              return <OrderTableItem key={orderInfo.order_id} orderInfo={orderInfo} />
            })}
            {!orderListLoading && myOrderList?.length > pageSize && (
              <Td colSpan={5} w="100%" pt="0px !important">
                <Center w="100%">
                  <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
                </Center>
              </Td>
            )}
          </React.Fragment>
        )}
      </Tbody>
    </Table>
  )
}
