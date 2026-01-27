import { LimitOrderInfo } from '@/types/limit'
import { useAccountStore } from '@cetus/stores'
import { NoData, Pagination } from '@cetus/ui-kit'
import { Center, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { SkipViewPc } from '../farms/FarmsTable'
import { HistoryTableItem } from './HistoryTableItem'

type HistoryTableListProps = {
  historyOrderList: LimitOrderInfo[]
  historyOrderLoading: boolean
}

export function HistoryTableList(props: HistoryTableListProps) {
  const { historyOrderList, historyOrderLoading } = props
  const { currentAccount, onWalletModal } = useAccountStore()
  const pageSize = 10
  const [paginationList, setPaginationList] = useState<LimitOrderInfo[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    if (historyOrderList?.length > 0) {
      setTotal(historyOrderList?.length)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setPaginationList(historyOrderList.slice(start, end))
    }
  }, [currentPage, historyOrderList])
  return (
    <Table variant="simple_list" w="100%" sx={{ td: { h: '66px !important' } }}>
      <Thead>
        <Tr>
          <Th>Order Info</Th>
          <Th textAlign="right">Limit Price</Th>
          <Th textAlign="right">Expiry</Th>
          <Th textAlign="right">Filled Size</Th>
          <Th textAlign="right">Status</Th>
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
              }
            }}
          >
            <Td colSpan={5} w="100%">
              <NoData
                type="nowallet"
                onboard={() => {
                  onWalletModal(true)
                }}
              />
            </Td>
          </Tr>
        ) : historyOrderLoading ? (
          <SkipViewPc itemList={[1, 2, 3]} skeletonNum={5} rowStyle={{ h: '66px' }} />
        ) : historyOrderList.length === 0 ? (
          <Tr
            sx={{
              td: {
                bg: 'none !important',
                p: '0 !important',
                border: 'none !important'
              }
            }}
          >
            <Td colSpan={5} w="100%">
              <NoData type="nodata" text="You don't have any order history." />
            </Td>
          </Tr>
        ) : (
          <React.Fragment>
            {paginationList.map((historyInfo: any) => {
              return <HistoryTableItem key={historyInfo.order_id} historyInfo={historyInfo} />
            })}
            {!historyOrderLoading && historyOrderList?.length > pageSize && (
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
