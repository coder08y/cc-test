import useGetTrades from '@/hooks/pro/useGetTrades'
import useProStore from '@/store/pro'
import { AddressCopyLink, Block, CetusTooltip } from '@cetus/design'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { formatNumber, fromDecimalsAmountFix, getRandomImage, getTimeDifferenceAbbr, textEllipses } from '@cetus/utils'
import { Button, Center, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ViewExplorerIcon from '../../ViewExplorerIcon'
import TraderCon from './TraderCon'
import TypeCon from './TypeCon'

const PAGE_SIZE = 10

function TradesContent({ maxHeight }: { maxHeight: any }) {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()
  const { showTokenInfo, isRealTime } = useProStore()

  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  const [traderAddress, setTraderAddress] = useState('')
  const [type, setType] = useState('')
  const { getTrades, data, loading, setPauseWs, pauseWs } = useGetTrades()

  const isFirstRender = useRef(true)

  const refreshTrades = (isFirstPange?: boolean) => {
    if (showTokenInfo?.coin_type) {
      getTrades({
        coinType: showTokenInfo.coin_type,
        type: type?.toLowerCase(),
        maker: traderAddress,
        isRealTime,
        cursor: isFirstPange ? '' : data?.nextPageCursor,
        limit: PAGE_SIZE
      }).then(res => {
        if (!isRealTime) {
          setLoadMoreLoading(false)
        }
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
      // setCoinTradesLoading(true)
      refreshTrades(true)
    }
  }, [type, traderAddress, isRealTime])

  const handleLoadMore = () => {
    setLoadMoreLoading(true)
    refreshTrades()
  }

  const columns = useMemo(
    () => getColumns({ isApp, getExplorerUrl, traderAddress, setTraderAddress, type, setType, isRealTime, pauseWs }),
    [isApp, getExplorerUrl, traderAddress, type]
  )

  const tableProps = {
    columns,
    dataSource: data?.list,
    // loading: coinTradesLoading && !loadMoreLoading
    loading: loading && !loadMoreLoading,
    rowKey: (item: any) => {
      return item?.id
    },
    rowClassName: (item: any) => {
      if (item?.haveAnimation) {
        return `${item?.type}-animation`
      }
      return ''
    },
    // onRowClick: (item: any) => window.open(getExplorerUrl(item?.txDigest, 'tx'), '_blank')
    onBodyHover: () => {
      console.log('onBodyHover####')
      setPauseWs(true)
    },
    onBodyLeave: () => setPauseWs(false)
  }

  const { size } = useDocumentSize()

  return (
    <VStack w="100%" spacing="20px" position="relative">
      {isApp && isRealTime && pauseWs && (
        <HStack
          bg="checked_bg"
          cursor="pointer"
          h="20px"
          gap="4px"
          p="4px"
          borderRadius="4px"
          border="1px solid"
          borderColor="border"
          position="absolute"
          right={isApp ? 'auto' : '140px'}
          left={isApp ? '140px' : 'auto'}
          top={isApp ? '-24px' : '-44px'}
          zIndex="100000"
        >
          <Icon svgW="14px" boxW="14px" svgH="14px" boxH="14px" xlinkHref="#icon-icon_paused" svgFill="primary" svgHover="primary" />
          <Text fontSize="12px" color="primary">
            Paused
          </Text>
        </HStack>
      )}
      {!loading && !data?.list?.length && isApp ? (
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
          fixedHeader
          maxHeight={maxHeight}
          trPadding="0px"
          noData={data?.list?.length == 0 ? <NoData type="nodata" text="No trades history" noBorder bg="none" /> : undefined}
          rowStyle={{
            h: '40px',
            borderRadius: '0px',
            // bg: 'red',

            // cursor: 'pointer',
            _hover: { bg: 'none !important' }
          }}
          theadConfig={{
            h: '20px'
          }}
        />
      )}
      {(loadMoreLoading || !loading) &&
        !isRealTime &&
        data?.nextPageCursor &&
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

const getColumns = ({ isApp, getExplorerUrl, traderAddress, setTraderAddress, type, setType, isRealTime, pauseWs }: any) => [
  {
    title: (
      <HStack w="80px" h="20px" pl={{ base: '0', lg: '4px' }}>
        {!isApp && isRealTime && pauseWs ? (
          <HStack bg="checked_bg" cursor="pointer" h="20px" gap="4px" p="4px" borderRadius="4px" border="1px solid" borderColor="border">
            <Icon svgW="14px" boxW="14px" svgH="14px" boxH="14px" xlinkHref="#icon-icon_paused" svgFill="primary" svgHover="primary" />
            <Text fontSize="12px" color="primary">
              Paused
            </Text>
          </HStack>
        ) : (
          <Text color="primary_gray" fontSize="13px">
            Time
          </Text>
        )}
        {/* <HStack bg="checked_bg" cursor="pointer" h="20px" gap="4px" p="4px" borderRadius="4px" border="1px solid" borderColor="border">
        <Icon svgW="14px" boxW="14px" svgH="14px" boxH="14px" xlinkHref="#icon-icon_paused" svgFill="primary" svgHover="primary" />
        <Text fontSize="12px" color="primary">
          Paused
        </Text>
      </HStack> */}
      </HStack>
    ),
    key: 'time',
    thConfig: {
      w: '80px'
    },
    render: (item: any) => (
      <HStack justify={{ base: 'flex-end', lg: 'flex-start' }} w="100%" pl="4px">
        <Text fontSize="13px" color="text_caption" whiteSpace="nowrap">
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
        {!isRealTime && <Image w="16px" h="16px" src={`/images/${item?.iconName}.png`} />}
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
                    {!isRealTime && <SingleCoinImage imageUrl={coinChange?.logo} w="20px" h="20px" minH="20px" minW="20px" />}
                    <Text color="text_caption"> {textEllipses(coinChange?.symbol, 12)}</Text>
                    <AddressCopyLink address={coinChange?.coinType} onClickLink={() => window.open(getExplorerUrl(coinChange?.coinType, 'coin'))} />
                  </HStack>
                }
              >
                <HStack>
                  {!isRealTime && <SingleCoinImage w="20px" h="20px" imageUrl={coinChange?.logo} />}
                  <Text
                    whiteSpace="nowrap"
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
        {!isRealTime && (
          <CetusTooltip
            showTooltip={!isApp}
            placement="top"
            tooltip={<Text fontSize="12px">{item?.dex ? item.dex[0].toUpperCase() + item.dex.slice(1) : ''}</Text>}
          >
            <Center>
              <SingleCoinImage imageUrl={`/images/aggregator-source/${item?.dex}.png`} imgBoxStyle={{ w: '20px', h: '20px' }} />
            </Center>
          </CetusTooltip>
        )}
        {isRealTime && (
          <Text fontSize="13px" textTransform="capitalize">
            {item?.dex}
          </Text>
        )}
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
      <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }} pr="4px">
        {!isRealTime && <SingleCoinImage imageUrl={getRandomImage(item?.sender) || ''} imgBoxStyle={{ w: '20px', h: '20px' }} />}
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
      <Text color="primary_gray" fontSize="13px" pr="4px">
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
