import { SkipViewPc } from '@/components/farms/FarmsTable'
import { LimitOrderInfo } from '@/types/limit'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import { useAccountStore } from '@cetus/stores'
import { NoData, Pagination } from '@cetus/ui-kit'
import { Box, Center, Table, Tbody, Th, Thead, Tr, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { HistoryTableItem } from './HistoryTableItem'

type HistoryTableListProps = {
  historyOrderList: LimitOrderInfo[]
  historyOrderLoading: boolean
  maxHeight: any
}

export function HistoryTableList(props: HistoryTableListProps) {
  const { maxHeight, historyOrderList, historyOrderLoading } = props
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
    } else {
      setPaginationList([])
    }
  }, [currentPage, historyOrderList])
  const { size } = useDocumentSize()
  return (
    <Box w="100%">
      {!currentAccount?.address ? (
        <NoData
          type="nowallet"
          noBorder
          mt="4px"
          bg="none"
          onboard={() => {
            onWalletModal(true)
          }}
        />
      ) : historyOrderList.length === 0 ? (
        <NoData mt="4px" type="nodata" noBorder bg="none" text="You don't have any order history." />
      ) : (
        <VStack w="100%">
          <Box overflowX="auto" w="100%" maxHeight={maxHeight} overflowY="visible" position="relative">
            <Table
              variant="simple_list"
              w="100%"
              // minW="1100px"
              overflowX="auto"
              sx={{
                th: {
                  fontSize: '13px',
                  _first: { pl: '0 !important' }
                },
                td: { h: '28px !important', p: '0px !important' }
              }}
            >
              <Thead
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  bg: 'bg_primary'
                }}
              >
                <Tr>
                  <Th>Order Info</Th>
                  <Th textAlign="right">Limit Price</Th>
                  <Th textAlign="right">Expiry</Th>
                  <Th textAlign="right" whiteSpace="nowrap">
                    Filled Size
                  </Th>
                  <Th textAlign="right">Status</Th>
                </Tr>
              </Thead>
              <Tbody
                sx={{
                  _hover: {
                    tr: {
                      bg: 'none'
                    }
                  },
                  td: {
                    bg: 'none !important',
                    border: 'none !important'
                  }
                }}
              >
                {historyOrderLoading ? (
                  <SkipViewPc isPreMode={true} itemList={[1, 2, 3]} skeletonNum={5} rowStyle={{ h: '28px !important' }} />
                ) : (
                  <React.Fragment>
                    {paginationList.map((historyInfo: any) => {
                      return <HistoryTableItem key={historyInfo.order_id} historyInfo={historyInfo} />
                    })}
                  </React.Fragment>
                )}
              </Tbody>
            </Table>
          </Box>
          {!historyOrderLoading && historyOrderList?.length > pageSize && (
            <Center w="100%">
              <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
            </Center>
          )}
        </VStack>
      )}
    </Box>
  )
}
