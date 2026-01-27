import useGetApiData from '@/hooks/pro/useGetApiData'
import useProStore from '@/store/pro'
import { AddressCopyLink, Block, CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { formatNumber, fromDecimalsAmountFix, getRandomImage, getTimeDifferenceAbbr, textEllipses } from '@cetus/utils'
import { Button, Center, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ViewExplorerIcon from '../../ViewExplorerIcon'
import TraderCon from './TraderCon'
import TypeCon from './TypeCon'

const PAGE_SIZE = 10

function TradesContent() {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()
  const { getCoinTrades } = useGetApiData()
  const { showTokenInfo, coinTrades, coinTradesLoading, setCoinTradesLoading } = useProStore()

  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  const [traderAddress, setTraderAddress] = useState('')
  const [type, setType] = useState('')
  const [displayList, setDisplayList] = useState<any[]>([])

  const isFirstRender = useRef(true)

  const refreshTrades = (isFirstPange?: boolean) => {
    if (showTokenInfo?.coin_type) {
      console.log('🚀 ~ refreshTrades ~ showTokenInfo?.coin_type:', showTokenInfo?.coin_type)
      getCoinTrades({
        coinType: showTokenInfo.coin_type,
        sender: traderAddress,
        type: type?.toLowerCase(),
        cursor: isFirstPange ? '' : coinTrades?.nextPageCursor,
        limit: PAGE_SIZE
      })
    }
  }

  useEffect(() => {
    refreshTrades(true)
    setType('')
    setTraderAddress('')
  }, [showTokenInfo?.coin_type])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (showTokenInfo?.coin_type) {
      setCoinTradesLoading(true)
      refreshTrades(true)
    }
  }, [type, traderAddress])

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ coinTrades:', coinTrades)
    if (coinTrades?.isFirstPage) {
      setDisplayList([...coinTrades.list])
    } else {
      if (coinTrades?.list?.length) {
        setDisplayList(prev => (coinTrades?.list?.length ? [...prev, ...coinTrades.list] : []))
      }
    }

    setLoadMoreLoading(false)
  }, [coinTrades?.list])

  const handleLoadMore = () => {
    setLoadMoreLoading(true)
    refreshTrades()
  }

  const columns = useMemo(
    () => getColumns({ isApp, getExplorerUrl, traderAddress, setTraderAddress, type, setType }),
    [isApp, getExplorerUrl, traderAddress, type]
  )

  const tableProps = {
    columns,
    dataSource: displayList,
    loading: coinTradesLoading && !loadMoreLoading
    // onRowClick: (item: any) => window.open(getExplorerUrl(item?.txDigest, 'tx'), '_blank')
  }

  // type筛选
  useEffect(() => {
    let filterList: any = coinTrades?.list || []
    if (type) {
      filterList = coinTrades?.list?.filter(ele => type.split(',').includes(ele.type)) || []
    }
    if (traderAddress) {
      filterList = filterList?.filter(ele => ele.sender == traderAddress)
    }
    setDisplayList(filterList)
  }, [type, traderAddress])

  return (
    <VStack w="100%" spacing="20px" position="relative">
      {!coinTradesLoading && !coinTrades?.list?.length && isApp ? (
        <NoData type="nodata" noBorder bg="none" text="No trades history" />
      ) : isApp ? (
        <VStack w="100%">
          <HStack w="100%" mt="12px">
            <Block w="156px" h="40px" borderRadius="8px" p="0" display="flex" alignItems="center" justifyContent="center">
              <TypeCon type={type} setType={setType} />
            </Block>
            <Block w="auto" flex="1" h="40px" borderRadius="8px" p="0" display="flex" alignItems="center" justifyContent="center">
              <TraderCon traderAddress={traderAddress} setTraderAddress={setTraderAddress} />
            </Block>
          </HStack>
          <H5MapTable {...tableProps} itemSkeletonLength={5} itemHeight="24px" rowStyle={() => ({ w: '100%', p: '0px', mt: '12px' })} />
        </VStack>
      ) : (
        <Table
          {...tableProps}
          skeletonLength={3}
          isFlexStart
          trPadding="0px"
          noData={displayList?.length == 0 ? <NoData type="nodata" text="No trades history" noBorder bg="none" /> : undefined}
          rowStyle={{
            h: '40px',
            // cursor: 'pointer',
            _hover: { bg: 'none !important' }
          }}
        />
      )}
      {(loadMoreLoading || !coinTradesLoading) &&
        coinTrades?.nextPageCursor &&
        (loadMoreLoading ? (
          <Center w="200px" margin="auto" textAlign="center" pb="16px" pt="8px">
            <Spinner size="sm" />
          </Center>
        ) : (
          <Center>
            <Button
              w="120px"
              h="32px"
              fontSize="12px"
              borderRadius="8px"
              bg="button_ghost_bg"
              color="primary"
              borderColor="border"
              variant="outline"
              onClick={handleLoadMore}
            >
              Load More
            </Button>
          </Center>
        ))}
    </VStack>
  )
}

export default TradesContent

const getColumns = ({ isApp, getExplorerUrl, traderAddress, setTraderAddress, type, setType }: any) => [
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Time
      </Text>
    ),
    key: 'time',
    thConfig: {
      w: '15%'
    },
    render: (item: any) => (
      <HStack justify={{ base: 'flex-end', lg: 'flex-start' }} w="100%">
        <Text fontSize="13px" color="text_caption">
          {getTimeDifferenceAbbr(item?.timestamp)}
        </Text>
      </HStack>
    )
  },
  {
    title: isApp ? (
      <Text color="primary_gray" fontSize="13px">
        Type
      </Text>
    ) : (
      <TypeCon type={type} setType={setType} />
    ),
    key: 'type',
    thConfig: {
      w: '15%'
    },
    render: (item: any) => {
      const colorMap: any = {
        buy: { color: 'primary_green', bg: 'primary_green_opacity.10' },
        add: { color: 'primary', bg: 'primary_opacity.10' },
        remove: { color: 'primary_gray', bg: 'rgba(127, 152, 167,0.1)' },
        default: { color: 'primary_red', bg: 'primary_red_opacity.10' }
      }
      const { color, bg } = colorMap[item?.type] || colorMap.default
      return (
        <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
          <Text fontSize="12px" color={color} bg={bg} h="20px" p="0 8px" borderRadius="4px" lineHeight="20px">
            {item?.type?.[0]?.toUpperCase() + item?.type?.slice(1)}
          </Text>
        </HStack>
      )
    }
  },
  {
    title: (
      <Text minW="100px" color="primary_gray" fontSize="13px">
        Value
      </Text>
    ),
    key: 'usdValue',
    thConfig: {
      w: '20%'
    },
    render: (item: any) => (
      <HStack gap="0px" w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <Image w="16px" h="16px" src={`/images/${item?.iconName}.png`} />
        <Text fontSize="13px" color="text_caption">
          {item?.usdValue}
        </Text>
      </HStack>
    )
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Amount
      </Text>
    ),
    key: 'price',
    thConfig: {
      w: '20%'
    },
    render: (item: any) => {
      return (
        <VStack w="100%" align={{ base: 'flex-end', lg: 'flex-start' }} spacing="2px">
          {item?.coinChanges?.map((coinChange: any, idx: number) => (
            <HStack w="100%" key={`${coinChange?.coinType || 'unknown'}-${idx}`} justify={{ base: 'flex-end', lg: 'flex-start' }}>
              <CetusTooltip
                placement="top"
                showTooltip={!isApp ? true : false}
                tooltip={
                  <HStack>
                    <SingleCoinImage imageUrl={coinChange?.logo} w="20px" h="20px" minH="20px" minW="20px" />
                    <Text color="text_caption"> {textEllipses(coinChange?.symbol, 12)}</Text>
                    <AddressCopyLink address={coinChange?.coinType} onClickLink={() => window.open(getExplorerUrl(coinChange?.coinType, 'coin'))} />
                  </HStack>
                }
              >
                <HStack>
                  <SingleCoinImage w="20px" h="20px" imageUrl={coinChange?.logo} />
                  <Text
                    fontSize="13px"
                    color={
                      coinChange?.amount?.includes('-')
                        ? 'primary_red'
                        : coinChange?.amount?.includes('+')
                          ? 'primary_green'
                          : item?.type == 'add'
                            ? 'primary'
                            : 'text_caption'
                    }
                  >
                    {coinChange?.amount} {textEllipses(coinChange?.symbol, 8)}
                  </Text>
                </HStack>
              </CetusTooltip>
            </HStack>
          ))}
        </VStack>
      )
    }
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Dex
      </Text>
    ),
    key: 'dex',
    thConfig: {
      w: '10%'
    },
    render: (item: any) => (
      <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <CetusTooltip
          showTooltip={!isApp}
          placement="top"
          tooltip={<Text fontSize="12px">{item?.dex ? item.dex[0].toUpperCase() + item.dex.slice(1) : ''}</Text>}
        >
          <Center>
            <SingleCoinImage imageUrl={`/images/aggregator-source/${item?.dex}.png`} imgBoxStyle={{ w: '20px', h: '20px' }} />
          </Center>
        </CetusTooltip>
      </HStack>
    )
  },
  {
    title: isApp ? (
      <Text color="primary_gray" fontSize="13px">
        Trader
      </Text>
    ) : (
      <TraderCon traderAddress={traderAddress} setTraderAddress={setTraderAddress} />
    ),
    key: 'sender',
    thConfig: {
      w: '10%'
    },
    render: (item: any) => (
      <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <SingleCoinImage imageUrl={getRandomImage(item?.sender) || ''} imgBoxStyle={{ w: '20px', h: '20px' }} />
        <AddressCopyLink
          address={item?.sender}
          fontSize="13px"
          showLink={false}
          color="text_caption"
          onClickLink={() => window.open(getExplorerUrl(item?.sender, 'account'))}
        />
      </HStack>
    )
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        TXN
      </Text>
    ),
    key: 'txDigest',
    thConfig: {
      w: '10%'
    },
    render: (item: any) => (
      <HStack w="100%" justify="flex-end">
        <ViewExplorerIcon onClick={() => window.open(getExplorerUrl(item?.txDigest, 'tx'))} />
      </HStack>
    )
  }
]

const getAmount = (amount: string, decimal: number) => {
  const value = fromDecimalsAmountFix(amount, decimal).toString().replace('-', '')
  return amount.includes('-') ? `-${formatNumber(value, decimal)}` : `+${formatNumber(value, decimal)}`
}
