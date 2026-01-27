import useNavigateToLiquidity from '@/hooks/clmm/useNavigateToLiquidity'
import useGlobalStore from '@/store/common/global'
import { TableSortTh } from '@cetus/design'
import SortDropBlock from '@cetus/design/src/components/common/SortDropBlock'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData, Pagination, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStatsPools, { GetStatsPoolsParams } from '../../hooks/stats/useStatsPools'
import CoinPairInfo from '../common/CoinPairInfo'
import AprTooltip from '../common/aprTooltip'

function PoolsTable({ isRefresh }: { isRefresh: boolean }) {
  const pageSize = 10
  const { getAllStatsPools, getDlmmStatsPools, getClmmStatsPools } = useStatsPools()
  const [currentPoolType, setCurrentPoolType] = useState({ label: 'All', value: 'all' })
  const [isLoading, setIsLoading] = useState(true)
  const [sortRule, setSortRule] = useState<sortRule>('desc')
  const [sortBy, setSortBy] = useState<poolType>({ label: 'Volume (24H)', value: 'vol' })
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [allTotal, setAllTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const { goLiquidity, goDlmmLiquidity } = useNavigateToLiquidity()
  const changePoolType = (type: PoolsType) => {
    setCurrentPoolType(type)
    setCurrentPage(1)
    fetchData(type?.value)
  }
  useEffect(() => {
    fetchData()
  }, [sortRule, sortBy?.value, currentPage])
  useEffect(() => {
    if (isRefresh) {
      fetchData()
    }
  }, [isRefresh])
  const fetchData = async (type?: 'all' | 'clmm' | 'dlmm') => {
    const poolType = !type ? currentPoolType?.value : type
    const offset = (currentPage - 1) * pageSize
    const params: GetStatsPoolsParams = {
      order_by: sortRule == 'desc' ? `-${sortBy?.value}` : `${sortBy?.value}`,
      offset,
      limit: pageSize
    }
    setIsLoading(true)
    try {
      const result: any =
        poolType == 'dlmm' ? await getDlmmStatsPools(params) : poolType == 'clmm' ? await getClmmStatsPools(params) : await getAllStatsPools(params)
      if (result) {
        console.log('🚀 ~ fetchData ~ result:', result)
        setList(result.data)
        setTotal(result.total)
        if (poolType === 'all') {
          setAllTotal(result?.total)
        }
        setIsLoading(false)
      } else {
        setList([])
        setTotal(0)
        if (poolType === 'all') {
          setAllTotal(0)
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
  const clickSort = (item: poolType) => {
    console.log('🚀 ~ clickSort ~ item:', item)
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
    { label: 'Liquidity', value: 'tvl' },
    { label: 'Volume (24H)', value: 'vol' },
    { label: 'Volume (7D)', value: 'vol7d' },
    { label: 'Fees (24H)', value: 'fees' },
    { label: 'APR', value: 'totalApr' }
  ]
  const sortByObject = sortByList.reduce((obj: any, item) => {
    obj[item.value] = item
    return obj
  }, {})

  const { setBackUrl } = useGlobalStore()

  return (
    <VStack w="100%" position="relative" mt="12px" gap="20px">
      {!isLoading && allTotal == 0 ? (
        <NoData type="nodata" />
      ) : isApp ? (
        <VStack w="100%" gap="4px" align="flex-start">
          <Text fontSize="24px" color="text_caption" mb="16px">
            Pools
          </Text>
          <HStack w="100%" justify="space-between">
            <SortDropBlock
              sortText="Pool"
              minW="120px"
              currentSort={currentPoolType}
              sortByList={typeList}
              showArrow
              onSortByChange={(item: any) => changePoolType(item)}
            />
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
            rowKey="poolAddress"
            dataSource={list}
            columns={getColumns(sortRule, sortBy, clickSort, sortByObject, isApp, currentPoolType, changePoolType)}
            loading={isLoading}
            itemSkeletonLength={6}
            itemHeight="30px"
            rowStyle={(_, index) => ({
              w: '100%',
              p: '0px',
              mt: '8px'
            })}
            onRowClick={item => {
              setBackUrl('/stats')
              if (item?.poolType === 'clmm') {
                goLiquidity(`/clmm?poolAddress=${item?.poolAddress}`, item)
              } else {
                goDlmmLiquidity(`/dlmm?poolId=${item?.poolId}`, item)
              }
            }}
          />
        </VStack>
      ) : (
        <Table
          rowKey="poolAddress"
          columns={getColumns(sortRule, sortBy, clickSort, sortByObject, isApp, currentPoolType, changePoolType)}
          dataSource={list}
          skeletonLength={10}
          loading={isLoading}
          onRowClick={item => {
            setBackUrl('/stats')
            if (item?.poolType === 'clmm') {
              goLiquidity(`/clmm?poolAddress=${item?.poolAddress}`, item)
            } else {
              goDlmmLiquidity(`/dlmm?poolId=${item?.poolId}`, item)
            }
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
type PoolsType = {
  label: 'All' | 'CLMM' | 'DLMM'
  value: 'all' | 'clmm' | 'dlmm'
}
const typeList: PoolsType[] = [
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'CLMM',
    value: 'clmm'
  },
  {
    label: 'DLMM',
    value: 'dlmm'
  }
]
const PoolTypeLabel = ({ currentPoolType, changePoolType }: { currentPoolType: PoolsType; changePoolType: (type: PoolsType) => void }) => {
  return (
    <SortDropBlock
      sortText="Pool"
      minW="168px"
      currentSort={currentPoolType}
      sortByList={typeList}
      onSortByChange={(item: any) => changePoolType(item)}
      showArrow
    />
  )
}
const getColumns = (
  sortRule: string,
  sortBy: poolType,
  clickSort: (value: poolType) => void,
  sortByObject: any,
  isApp: boolean,
  currentPoolType: PoolsType,
  changePoolType: (type: PoolsType) => void
) => {
  return [
    {
      title: <PoolTypeLabel currentPoolType={currentPoolType} changePoolType={(type: PoolsType) => changePoolType(type)} />,
      key: 'pool',
      thConfig: {
        w: '30%'
      },
      showLabel: false,
      render: (item: any) => {
        return (
          <HStack justify="space-between">
            <CoinPairInfo
              versionBlockPosition={isApp ? 'right' : 'bottom'}
              poolInfo={item}
              symbolEllipsesDecimals={10}
              type="column"
              showPoolTypeTag
              symbolFontSize="14px !important"
            />
            {/* {item?.haveFarming && <FarmingIcon />}
            {item?.haveMining && <MiningIcon />}
            {item?.haveVaults && <VaultsIcon />} */}
          </HStack>
        )
      }
    },
    {
      title: <TableSortTh labelInfo={sortByObject['tvl']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolType) => clickSort(value)} />,
      key: 'tvlDisplay'
    },
    {
      title: <TableSortTh labelInfo={sortByObject['vol']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolType) => clickSort(value)} />,
      key: 'volume24Display'
    },
    {
      title: <TableSortTh labelInfo={sortByObject['vol7d']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolType) => clickSort(value)} />,
      key: 'volume7Display'
    },
    {
      title: <TableSortTh labelInfo={sortByObject['fees']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolType) => clickSort(value)} />,
      key: 'fees24Display'
    },
    {
      title: (
        <TableSortTh
          labelInfo={sortByObject['totalApr']}
          sortRule={sortRule}
          sortBy={sortBy}
          tooltip={{
            content: 'Estimated according to trading activity in the past 24 hours plus mining and farming rewards.',
            description: 'Estimated APR = [(24h fees + 24h rewards) × 365 / TVL] × 100%'
          }}
          clickSort={(value: poolType) => clickSort(value)}
          justifyContent="flex-end"
        />
      ),
      key: 'apr24h', // 自定义render key不生效
      thConfig: {
        w: '12%'
      },
      render: (item: any) => {
        return <AprTooltip poolInfo={item} placement="top-end" showAprSize={isApp ? '12px' : '14px'} />
      }
    }
  ]
}
type sortRule = 'desc' | 'asc'
export type poolType = {
  label: 'Liquidity' | 'Volume (24H)' | 'Volume (7D)' | 'Fees (24H)' | 'APR (24H)'
  value: 'tvl' | 'vol' | 'vol7d' | 'fees' | 'totalApr'
}
export default PoolsTable
