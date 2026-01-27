import { useWalletHoldings } from '@/hooks/profile/useWalletHoldings'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import useWalletHoldingsStore from '@/store/profile/walletHoldings'
import { CoinHolding, CoinHoldingFilter } from '@/types/profile'
import { Block, SortDropBlock, TableSortTh } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { H5MapTable, Icon, NoData, Pagination, Table } from '@cetus/ui-kit'
import { d, formatCurrency, formatPercentage, formatPrice, textEllipses } from '@cetus/utils'
import { Box, Button, Center, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HiddenDotted from '../HiddenDotted'
import FilterAssets from './FilterAssets'
import SearchAssetsInput from './SearchAssetsInput'

function ProfileWalletHoldings() {
  const { isApp } = useWindowWidth()
  const { getFilterCoinHoldingList } = useWalletHoldings()
  const { isCoinHoldingLoading, isCoinPriceLoading, unknownCoinCount, filterUnknownCoinCount } = useWalletHoldingsStore()
  const { isAutoRefresh } = useActiveOrdersStore()

  const [coinList, setCoinList] = useState<CoinHolding[]>([])
  const [filter, setFilter] = useState<CoinHoldingFilter>({
    current_sort: 'value',
    current_sort_order: 'desc',
    search: '',
    is_show_unknown: false,
    is_hide_small_balance: true
  })
  const [isShowUnknownCoin, setIsShowUnknownCoin] = useState(false)
  const [isHideLowAsset, setIsHideLowAsset] = useState(true)
  const [sortRule, setSortRule] = useState<SortRule>('desc')
  const [sortBy, setSortBy] = useState<TokenType>(sortByList[2])
  const [minWidthPx, setMinWidthPx] = useState(0)

  const applyFilter = (nextFilter: CoinHoldingFilter) => {
    console.log('🚀 ~ applyFilter ~ nextFilter:', nextFilter)
    if (!isAutoRefresh) {
      setCurrentPage(1)
    }
    setFilter(nextFilter)
    getFilterCoinHoldingList(nextFilter).then(setCoinList)
  }

  const handleInputChange = (value: string) => {
    applyFilter({ ...filter, search: value })
  }

  const handleSortClick = (item: TokenType) => {
    const isSame = item?.value === sortBy?.value
    const nextSortRule: SortRule = isApp || !isSame ? 'desc' : sortRule === 'desc' ? 'asc' : 'desc'
    console.log('🚀 ~ handleSortClick ~ item:', nextSortRule, item)
    setSortBy(item)
    setSortRule(nextSortRule)
    applyFilter({ ...filter, current_sort: item.value, current_sort_order: nextSortRule })
  }

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ isCoinHoldingLoading:', isCoinHoldingLoading, isCoinPriceLoading, coinList)
    if (!isCoinHoldingLoading && !isCoinPriceLoading) {
      applyFilter(filter)
    }
  }, [isCoinHoldingLoading, isCoinPriceLoading])

  useEffect(() => {
    const updateMinWidth = () => {
      const width = window.innerWidth
      setMinWidthPx(Math.floor(width * 0.4))
    }

    updateMinWidth()
    window.addEventListener('resize', updateMinWidth)

    return () => {
      window.removeEventListener('resize', updateMinWidth)
    }
  }, [])

  const navigate = useNavigate()

  const goSwap = (coin_type: string) => {
    navigate(`/swap/${coin_type}/undefined?from=profile`)
  }

  const [paginationList, setPaginationList] = useState<CoinHolding[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  useEffect(() => {
    if (coinList?.length > 0) {
      const start = (currentPage - 1) * pageSize
      if (coinList?.length <= start) {
        setCurrentPage(1)
      }
    }
  }, [coinList])

  useEffect(() => {
    if (coinList?.length > 0) {
      setTotal(coinList?.length)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      console.log('🚀 ~ useEffect ~ start:', currentPage, coinList.slice(0, end), start, end)
      if (coinList?.length > start) {
        setPaginationList(coinList.slice(start, end))
      }
    } else {
      setPaginationList([])
    }
  }, [currentPage, coinList])

  const handleCheckboxChange = (key: keyof CoinHoldingFilter, value: boolean) => {
    // applyFilter({ ...filter, [key]: value })
    if (key === 'is_show_unknown') setIsShowUnknownCoin(value)
    if (key === 'is_hide_small_balance') setIsHideLowAsset(value)
  }
  const handleIsShowUnknownCoin = (e: React.ChangeEvent<HTMLInputElement> | boolean) => {
    let value: boolean
    if (typeof e === 'boolean') {
      value = e
    } else {
      value = e.target.checked
    }
    handleCheckboxChange('is_show_unknown', value)
    applyFilter({ ...filter, ['is_show_unknown']: value })
    // if (!value) {
    //   applyFilter({ ...filter, ['is_show_unknown']: false })
    // }
    // if (value && !isShowUnknownCoin) {
    //   handleCheckboxChange('is_hide_small_balance', false)
    //   applyFilter({ ...filter, ['is_show_unknown']: true, ['is_hide_small_balance']: false })
    // }
  }

  const handleIsHideLowAsset = (e: React.ChangeEvent<HTMLInputElement> | boolean) => {
    let value: boolean
    if (typeof e === 'boolean') {
      value = e
    } else {
      value = e.target.checked
    }
    handleCheckboxChange('is_hide_small_balance', value)
    applyFilter({ ...filter, ['is_hide_small_balance']: value })
  }
  return (
    <Block
      width="100%"
      p={{ base: '0', lg: '8px 16px 16px 0px' }}
      bg={{ base: 'none', lg: 'none' }}
      backdropFilter={{ base: 'none', lg: 'blur(20px)' }}
      border="none"
      mt={{ base: '-4px', lg: '0px' }}
    >
      <VStack w="100%" align="flex-start" gap={{ base: '8px', lg: '16px' }}>
        <HStack w="100%" flexDirection={{ base: 'column', lg: 'row' }}>
          <HStack w="100%" justify="space-between">
            <Text fontSize="16px" color="text_caption" letterSpacing="0.2px">
              Wallet Holdings
            </Text>
            {isApp && (
              <Button
                h="40px"
                w="124px"
                display="flex"
                alignItems="center"
                gap="0px"
                bg="primary"
                borderRadius="8px"
                color="bg_primary"
                cursor="pointer"
                fontSize="14px"
                textAlign="center"
                fontWeight="medium"
                leftIcon={<Icon mr="-4px" xlinkHref="#icon-icon_merge_swap" fontSize="18px" svgFill="bg_primary" />}
                onClick={() => navigate('/merge-swap')}
              >
                Merge Swap
              </Button>
            )}
          </HStack>
          {isApp && (
            <HStack w="100%" justify="space-between" gap="6px">
              <SearchAssetsInput inputValue={filter.search} changeInputValue={handleInputChange} />
              <SortDropBlock
                showArrow
                minW={`${minWidthPx - 62}px`}
                currentSort={sortBy}
                sortByList={sortByList}
                onSortByChange={handleSortClick}
                xlinkHref={sortRule === 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
                iconOnClick={() => {
                  applyFilter({ ...filter, current_sort: sortBy.value, current_sort_order: sortRule === 'desc' ? 'asc' : 'desc' })
                  setSortRule(prev => (prev === 'desc' ? 'asc' : 'desc'))
                }}
              />
            </HStack>
          )}
          <FilterAssets
            unknownCoinCount={unknownCoinCount}
            filterUnknownCoinCount={filterUnknownCoinCount}
            inputValue={filter.search || ''}
            changeInputValue={handleInputChange}
            isShowUnknownCoin={isShowUnknownCoin}
            handleIsShowUnknownCoin={handleIsShowUnknownCoin}
            isHideLowAsset={isHideLowAsset}
            handleIsHideLowAsset={handleIsHideLowAsset}
          />
        </HStack>
        {!isApp && <Box h="1px" w="100%" bg="border" mt="-2px" />}
        <VStack w="100%" position="relative" gap="20px">
          {((!isCoinHoldingLoading && !isCoinPriceLoading) || isAutoRefresh) && coinList?.length === 0 ? (
            <NoData type="nodata" text="No tokens found" noBorder />
          ) : isApp ? (
            <H5MapTable
              rowKey="coin_type"
              columns={getColumns(
                sortRule,
                sortBy,
                handleSortClick,
                goSwap,
                !isAutoRefresh && isCoinPriceLoading,
                coinList?.length,
                isCoinHoldingLoading
              )}
              dataSource={paginationList}
              loading={!isAutoRefresh && (isCoinHoldingLoading || isCoinPriceLoading)}
              itemSkeletonLength={4}
              haveDividingLine={false}
              onRowClick={item => {
                goSwap(item?.coin_type)
              }}
              itemHeight="30px"
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
              rowKey="coin_type"
              columns={getColumns(
                sortRule,
                sortBy,
                handleSortClick,
                goSwap,
                !isAutoRefresh && isCoinPriceLoading,
                coinList?.length,
                isCoinHoldingLoading
              )}
              dataSource={paginationList}
              skeletonLength={5}
              loading={!isAutoRefresh && (isCoinHoldingLoading || isCoinPriceLoading)}
              rowStyle={{ h: '72px', cursor: 'pointer' }}
              onRowClick={item => {
                goSwap(item?.coin_type)
              }}
            />
          )}
          {coinList?.length > pageSize && (
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
      </VStack>
    </Block>
  )
}
type SortRule = 'desc' | 'asc'
export type TokenType = {
  label: 'Balance' | 'Price' | 'Value'
  value: 'balance' | 'price' | 'value'
}

const sortByList: TokenType[] = [
  { label: 'Balance', value: 'balance' },
  { label: 'Price', value: 'price' },
  { label: 'Value', value: 'value' }
]

const sortByObject = Object.fromEntries(sortByList.map(item => [item.value, item]))

const getColumns = (
  sortRule: SortRule,
  sortBy: TokenType,
  clickSort: (value: TokenType) => void,
  goSwap: (coin_type: string) => void,
  isCoinPriceLoading: boolean,
  listNum: string | number,
  isCoinHoldingLoading: boolean
) => [
  {
    title: (
      <HStack>
        <Text>Token</Text>
        {!isCoinHoldingLoading && (
          <Block p="2px 6px" lineHeight="1" w="unset" borderRadius="8px">
            <Text color="primary" fontSize="12px">
              {listNum}
            </Text>
          </Block>
        )}
      </HStack>
    ),
    key: 'pool',
    thConfig: { w: '20%' },
    showLabel: false,
    render: ({ coin }: { coin: Token }) => <SingleTokenInfo haveTooltip token={coin} warningIcon={{ iconW: '14px', iconH: '14px' }} />
  },
  {
    title: <TableSortTh labelInfo={sortByObject['balance']} sortRule={sortRule} sortBy={sortBy} clickSort={clickSort} />,
    key: 'balance',
    thConfig: { w: '25%' },
    render: ({ coin, balance_display }: { coin: Token; balance_display: string }) => (
      <HStack justify="flex-end">
        <HiddenDotted>
          <Text color="text_caption" whiteSpace="nowrap">
            {balance_display} {textEllipses(coin?.symbol, 10)}
          </Text>
        </HiddenDotted>
      </HStack>
    )
  },
  {
    title: <TableSortTh labelInfo={sortByObject['price']} sortRule={sortRule} sortBy={sortBy} clickSort={clickSort} />,
    key: 'price',
    thConfig: { w: '25%' },
    render: ({ price, price_diff_24 }: { price: string; price_diff_24: string }) => {
      const isPositive = d(price_diff_24).gt(0)
      return (
        <HStack justify="flex-end">
          <Skeleton isLoaded={!isCoinPriceLoading}>
            <HStack gap="2px">
              {price === undefined || price === '' ? (
                <Text color="text_caption">--</Text>
              ) : (
                <>
                  <Text color="text_caption">${formatPrice(price)}</Text>
                  <Text color={Number(price_diff_24) === 0 ? 'text_caption' : isPositive ? 'primary_green' : 'primary_red'}>
                    ({isPositive ? '+' : d(price_diff_24).gt(-0.0001) && d(price_diff_24).lt(0) ? '-' : ''}
                    {d(price_diff_24).gt(-0.0001) && d(price_diff_24).lt(0.0001)
                      ? '0%'
                      : formatPercentage(d(price_diff_24).mul(100).toString(), 2, false, false)}
                    )
                  </Text>
                </>
              )}
            </HStack>
          </Skeleton>
        </HStack>
      )
    }
  },
  {
    title: <TableSortTh labelInfo={sortByObject['value']} sortRule={sortRule} sortBy={sortBy} clickSort={clickSort} />,
    key: 'balance_usd',
    thConfig: { w: '15%' },
    render: ({ balance_usd }: { balance_usd: string }) => {
      return (
        <HStack justify="flex-end">
          <Skeleton isLoaded={!isCoinPriceLoading}>
            <HiddenDotted>
              <Text color="text_caption">{balance_usd === undefined ? '--' : formatCurrency(balance_usd, 2)}</Text>
            </HiddenDotted>
          </Skeleton>
        </HStack>
      )
    }
  },
  {
    title: <Text textAlign="right">Action</Text>,
    showLabel: false,
    thConfig: { w: '15%' },
    key: 'actions',
    render: (item: any) => {
      return (
        <Button
          w={{ base: 'calc(100vw - 48px)', lg: 'unset' }}
          p="8px"
          h="32px"
          fontSize={{ base: '14px', lg: '12px' }}
          borderRadius="8px"
          variant="outline"
          fontWeight="500"
          onClick={() => {
            goSwap(item?.coin_type)
          }}
        >
          Swap
        </Button>
      )
    }
  }
]

export default ProfileWalletHoldings
