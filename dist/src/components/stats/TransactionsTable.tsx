import useTransactionsTx, { GetTransactionsTxParams } from '@/hooks/stats/useTransactionsTx'
import { AddressUnderline } from '@cetus/design'
import SortDropBlock from '@cetus/design/src/components/common/SortDropBlock'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData, Pagination, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import TextWrap from '@cetus/ui-kit/src/components/TextWarp'
import { Box, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import TransTypeValue from './TransTypeValue'

const getColumns = (
  currentSort: {
    label: string
    value: string
  },
  onSortByChange: (type: sortType) => void,
  getExplorerUrl: any
) => {
  return [
    {
      title: <TransTypeLabel currentSort={currentSort} onSortByChange={(item: sortType) => onSortByChange(item)} />,
      key: 'pool',
      thConfig: {
        w: '32%'
      },
      showLabel: false,
      render: (item: any) => {
        return <TransTypeValue transInfo={item} getExplorerUrl={getExplorerUrl} />
      }
    },
    {
      title: <Text textAlign="right">Token Amounts</Text>,
      key: 'tokenAmountA',
      render: (item: any) => {
        return (
          <HStack gap="4px" sx={{ '>div': { display: 'flex', justifyContent: 'flex-end' } }}>
            <TextWrap color="text_caption" w="220px">
              {item?.displayTokenAmountA}&nbsp;
              {item?.tokenA?.symbol}
            </TextWrap>
          </HStack>
        )
      }
    },
    {
      title: <Text textAlign="right">Token Amounts</Text>,
      key: 'tokenAmountB',
      render: (item: any) => {
        return (
          <HStack gap="4px" sx={{ '>div': { display: 'flex', justifyContent: 'flex-end' } }}>
            <TextWrap color="text_caption" w="220px">
              {item?.displayTokenAmountB}&nbsp;
              {item?.tokenB?.symbol}
            </TextWrap>
          </HStack>
        )
      }
    },
    {
      title: <Text textAlign="right">Account</Text>,
      key: 'account',
      render: ({ account }: { account: string }) => {
        return (
          <AddressUnderline
            address={account}
            color="primary"
            fontSize="14px"
            onClickLink={() => {
              window.open(getExplorerUrl(account), '_blank')
            }}
          />
        )
      }
    },
    {
      title: <Text textAlign="right">Time</Text>,
      key: 'timeDisplay'
    }
  ]
}
function TransactionsTable({ isRefresh }: { isRefresh: boolean }) {
  const { getExplorerUrl } = useExplorer()
  const [currentSort, setCurrentSort] = useState<sortType>({
    label: 'All',
    value: 'all'
  })
  const onSortByChange = (item: sortType) => {
    console.log('🚀 ~ onSortByChange ~ item:', item)
    setCurrentPage(1)
    setCurrentSort(item)
  }
  const pageSize = 10
  const { getAllTransactionsTx } = useTransactionsTx()
  const [isLoading, setIsLoading] = useState(true)
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    fetchData()
  }, [currentSort, currentPage])
  useEffect(() => {
    if (isRefresh) {
      fetchData()
    }
  }, [isRefresh])
  const fetchData = async () => {
    const offset = (currentPage - 1) * pageSize
    const params: GetTransactionsTxParams = {
      coin: 'all',
      tx_type: currentSort.value,
      offset,
      limit: pageSize
    }
    setIsLoading(true)
    try {
      const result: any = await getAllTransactionsTx(params)
      console.log('🚀 ~ fetchData ~ result:', result)
      setList(result?.data || [])
      setTotal(result?.total || 0)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }
  const { isApp } = useWindowWidth()

  return (
    <VStack w="100%" position="relative" mt="12px" gap="20px">
      {!isLoading && list?.length == 0 && currentSort.value === 'all' ? (
        <NoData type="nodata" />
      ) : isApp ? (
        <VStack w="100%" gap="4px">
          <HStack w="100%" justify="space-between">
            <Text fontSize="24px" color="text_caption">
              Transactions
            </Text>
            <TransTypeLabel currentSort={currentSort} onSortByChange={(item: sortType) => onSortByChange(item)} />
          </HStack>
          {!isLoading && list?.length == 0 ? (
            <NoData type="nodata" />
          ) : (
            <H5MapTable
              rowKey="uniq_id"
              columns={getColumns(currentSort, onSortByChange, getExplorerUrl)}
              dataSource={list}
              loading={isLoading}
              itemSkeletonLength={5}
              itemHeight="30px"
              rowStyle={(_, index) => ({
                w: '100%',
                p: '0px',
                mt: '12px'
              })}
              onRowClick={(item: any) => {
                window.open(getExplorerUrl(item?.tx, 'tx'), '_blank')
              }}
            />
          )}
        </VStack>
      ) : !isLoading && list?.length == 0 ? (
        <VStack w="100%" align="flex-start">
          <Box p="8px 8px 8px 16px">
            <TransTypeLabel currentSort={currentSort} onSortByChange={(item: sortType) => onSortByChange(item)} />
          </Box>
          <NoData type="nodata" />
        </VStack>
      ) : (
        <Table
          rowKey="uniq_id"
          columns={getColumns(currentSort, onSortByChange, getExplorerUrl)}
          dataSource={list}
          skeletonLength={10}
          loading={isLoading}
          onRowClick={(item: any) => {
            window.open(getExplorerUrl(item?.tx, 'tx'), '_blank')
          }}
          rowStyle={{
            h: '80px',
            cursor: 'pointer',
            _hover: {
              svg: {
                fill: 'text_caption'
              }
            }
          }}
        />
      )}
      {!isLoading && total > pageSize && (
        <Center>
          <Pagination
            total={total}
            size={pageSize}
            currentPage={currentPage}
            onChange={current => {
              setCurrentPage(current)
            }}
          />
        </Center>
      )}
    </VStack>
  )
}

type sortType = {
  label: 'All' | 'Swap' | 'Add' | 'Remove'
  value: 'all' | 'swap' | 'add' | 'remove'
}
const TransTypeLabel = ({
  currentSort,
  onSortByChange
}: {
  currentSort: {
    label: string
    value: string
  }
  onSortByChange: (type: sortType) => void
}) => {
  const sortByList: sortType[] = [
    {
      label: 'All',
      value: 'all'
    },
    {
      label: 'Swap',
      value: 'swap'
    },
    {
      label: 'Add',
      value: 'add'
    },
    {
      label: 'Remove',
      value: 'remove'
    }
  ]
  return <SortDropBlock sortText="Type" minW="168px" currentSort={currentSort} sortByList={sortByList} onSortByChange={onSortByChange} showArrow />
}
export default TransactionsTable
