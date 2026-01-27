import { SortDropBlock, TableSortTh } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData, Pagination, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStatsTokens, { GetStatsTokensParams } from '../../hooks/stats/useStatsTokens'

const getColumns = (sortRule: string, sortBy: tokenType, clickSort: (value: tokenType) => void, sortByObject: any) => {
  return [
    {
      title: <Text>Token</Text>,
      key: 'pool',
      thConfig: {
        w: '25%'
      },
      showLabel: false,
      render: ({ coinType }: { coinType: string }) => {
        return <SingleTokenInfo haveTooltip={true} coinType={coinType} warningIcon={{ iconW: '14px', iconH: '14px' }} />
      }
    },
    {
      title: <TableSortTh labelInfo={sortByObject['price']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: tokenType) => clickSort(value)} />,
      key: 'price'
    },
    {
      title: (
        <TableSortTh
          labelInfo={sortByObject['change_percentage']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: tokenType) => clickSort(value)}
        />
      ),
      key: 'priceChange',
      render: ({ priceChangeColor, priceChange }: { priceChangeColor: string; priceChange: string }) => {
        return (
          <Text color={priceChangeColor} whiteSpace="nowrap">
            {priceChange}
          </Text>
        )
      }
    },
    {
      title: (
        <TableSortTh labelInfo={sortByObject['vol_24']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: tokenType) => clickSort(value)} />
      ),
      key: 'volume24'
    },
    {
      title: (
        <TableSortTh
          labelInfo={sortByObject['tvl']}
          sortRule={sortRule}
          sortBy={sortBy}
          clickSort={(value: tokenType) => clickSort(value)}
          justifyContent="flex-end"
        />
      ),
      key: 'tvl'
    }
  ]
}
type sortRule = 'desc' | 'asc'
export type tokenType = {
  label: 'Price' | 'Price Change' | 'Volume (24H)' | 'TVL' | ''
  value: 'tvl' | 'vol_24' | 'price' | 'change_percentage' | ''
}
function TokensTable({ isRefresh }: { isRefresh: boolean }) {
  const pageSize = 10
  const { getAllStatesTokens } = useStatsTokens()
  const [isLoading, setIsLoading] = useState(true)
  const [sortRule, setSortRule] = useState<sortRule>('desc')
  const [sortBy, setSortBy] = useState<tokenType>({ label: 'Volume (24H)', value: 'vol_24' })
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const { getTokenListInfo } = useGetToken()
  useEffect(() => {
    fetchData()
  }, [sortRule, sortBy, currentPage])

  useEffect(() => {
    if (isRefresh) {
      fetchData()
    }
  }, [isRefresh])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const offset = (currentPage - 1) * pageSize
      const params: GetStatsTokensParams = {
        order_by: sortRule == 'desc' ? `-${sortBy?.value}` : `${sortBy?.value}`,
        offset,
        limit: pageSize
      }
      const result: any = await getAllStatesTokens(params)
      if (result) {
        console.log('🚀 ~ fetchData ~ result:', result)
        setList(result.data)
        setTotal(result.total)
        if (result?.data?.length > 0) {
          const coinTypeList = result?.data
            ?.map((item: any) => {
              return item?.coinType
            })
            .filter(Boolean)
          await getTokenListInfo(coinTypeList)
        }
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  const clickSort = (item: tokenType) => {
    if (isApp) {
      if (item?.value !== sortBy?.value) {
        setSortRule('desc')
        setSortBy(item)
      }
    } else {
      if (item?.value == sortBy?.value) {
        const rule = sortRule == 'desc' ? 'asc' : 'desc'
        setSortRule(rule)
      } else {
        setSortRule('desc')
        setSortBy(item)
      }
    }
  }
  const sortByList = [
    { label: 'Price', value: 'price' },
    { label: 'Price Change', value: 'change_percentage' },
    { label: 'Volume (24H)', value: 'vol_24' },
    { label: 'TVL', value: 'tvl' }
  ]
  const sortByObject = sortByList.reduce((obj: any, item) => {
    obj[item.value] = item
    return obj
  }, {})
  return (
    <VStack w="100%" position="relative" mt="12px" gap="20px">
      {!isLoading && list?.length == 0 ? (
        <NoData type="nodata" />
      ) : isApp ? (
        <VStack w="100%" gap="4px">
          <HStack w="100%" justify="space-between">
            <Text fontSize="24px" color="text_caption">
              Tokens
            </Text>
            <SortDropBlock
              sortText="Sort by"
              minW="168px"
              mainStyle={{
                w: 'auto'
              }}
              showArrow
              currentSort={sortBy}
              sortByList={sortByList}
              onSortByChange={clickSort}
              xlinkHref={sortRule == 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
              iconOnClick={() => {
                const rule = sortRule == 'desc' ? 'asc' : 'desc'
                setSortRule(rule)
              }}
            />
          </HStack>
          <H5MapTable
            rowKey="coinType"
            columns={getColumns(sortRule, sortBy, clickSort, sortByObject)}
            dataSource={list}
            loading={isLoading}
            itemSkeletonLength={5}
            itemHeight="30px"
            rowStyle={(_, index) => ({
              w: '100%',
              p: '0px',
              mt: '16px'
            })}
            onRowClick={item => {
              navigate(`/swap/${undefined}/${item?.coinType}?from=stats`)
            }}
          />
        </VStack>
      ) : (
        <Table
          rowKey="coinType"
          columns={getColumns(sortRule, sortBy, clickSort, sortByObject)}
          dataSource={list}
          skeletonLength={10}
          loading={isLoading}
          onRowClick={item => {
            navigate(`/swap/${undefined}/${item?.coinType}?from=stats`)
          }}
          rowStyle={{ h: '80px', cursor: 'pointer' }}
        />
      )}
      {!isLoading && (
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
export default TokensTable
