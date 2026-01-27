import useGetApiData from '@/hooks/pro/useGetApiData'
import useProStore from '@/store/pro'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { Button, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import ViewExplorerIcon from '../../ViewExplorerIcon'

const PAGE_SIZE = 10
function PoolContent({ hideSmallPools }: { hideSmallPools: boolean }) {
  const { showTokenInfo, proTokenMap, coinDexPools, coinDexPoolsLoading } = useProStore()
  const { getCoinDexPools, getTokenInfos } = useGetApiData()
  const [currentPage, setCurrentPage] = useState(1)
  const [displayList, setDisplayList] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (showTokenInfo?.coin_type) {
      getCoinDexPools({ coinType: showTokenInfo?.coin_type, hideSmallPools })
    }
  }, [hideSmallPools, showTokenInfo?.coin_type])

  useEffect(() => {
    if (!coinDexPoolsLoading) {
      setCurrentPage(1)
      setDisplayList([])
      if (coinDexPools?.length > 0) {
        const list = coinDexPools.slice(0, PAGE_SIZE)
        const coinTypesObj: any = {}
        list.forEach((item: any) =>
          item?.coinList?.forEach((coin: any) => {
            coinTypesObj[coin] = true
          })
        )
        const coinTypes = Object.keys(coinTypesObj)
        getTokenInfos(coinTypes)
        setDisplayList(list)
        setHasMore(coinDexPools.length > PAGE_SIZE)
      } else {
        setHasMore(false)
      }
    }
  }, [coinDexPools])

  const loadMore = () => {
    const start = currentPage * PAGE_SIZE
    const end = start + PAGE_SIZE
    const newList = coinDexPools.slice(start, end)
    const coinTypesObj: any = {}
    newList.forEach((item: any) =>
      item?.coinList?.forEach((coin: any) => {
        coinTypesObj[coin] = true
      })
    )
    const coinTypes = Object.keys(coinTypesObj)
    getTokenInfos(coinTypes)
    setDisplayList(prev => [...prev, ...newList])
    setCurrentPage(prev => prev + 1)
    setHasMore(coinDexPools.length > end)
  }

  const { isApp } = useWindowWidth()

  return (
    <VStack w="100%" position="relative" gap="20px">
      {!coinDexPoolsLoading && coinDexPools?.length === 0 ? (
        <NoData type="nodata" noBorder bg="none" />
      ) : isApp ? (
        <VStack w="100%" gap="4px">
          <H5MapTable
            rowKey="tx"
            columns={getColumns(isApp, proTokenMap)}
            dataSource={displayList}
            loading={coinDexPoolsLoading}
            itemSkeletonLength={5}
            itemHeight="24px"
            rowStyle={(_, index) => ({
              w: '100%',
              p: '0px',
              mt: '12px'
            })}
            // onRowClick={(item: any) => {
            //   window.open(item?.link, '_blank')
            // }}
          />
        </VStack>
      ) : (
        <Table
          rowKey="tx"
          columns={getColumns(isApp, proTokenMap)}
          dataSource={displayList}
          skeletonLength={3}
          loading={coinDexPoolsLoading}
          isFlexStart={true}
          trPadding="0px"
          // onRowClick={(item: any) => {
          //   window.open(item?.link, '_blank')
          // }}
          rowStyle={{
            h: '40px',
            // cursor: 'pointer',
            _hover: {
              bg: 'none !important'
            }
          }}
        />
      )}
      {!coinDexPoolsLoading && hasMore && (
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
            onClick={loadMore}
          >
            Load More
          </Button>
        </Center>
      )}
    </VStack>
  )
}

const getColumns = (isApp: boolean, proTokenMap: any) => {
  return [
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          Protocol
        </Text>
      ),
      key: 'protocol',
      render: (item: any) => {
        return (
          <HStack w="100%" gap="4px" justify={{ base: 'flex-end', lg: 'flex-start' }}>
            <SingleCoinImage imageUrl={`/images/aggregator-source/${item?.dex}.png`} imgBoxStyle={{ w: '20px', h: '20px' }} />
            <Text fontSize="13px" color="text_caption">
              {item?.dex ? item?.dex[0].toUpperCase() + item?.dex.slice(1) : ''}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          Pair
        </Text>
      ),
      key: 'pair',
      render: (item: any) => {
        return (
          <HStack align="center" justify={{ base: 'flex-end', lg: 'flex-start' }} gap="0px">
            {item?.coinList?.map((coinAddress: string, index: number) => (
              <HStack gap="0" key={coinAddress} justify="flex-start">
                <SingleCoinImage w="20px" h="20px" maxH="20px" imageUrl={proTokenMap?.get(coinAddress)?.logo_url} />
              </HStack>
            ))}
            {item?.coinList?.map((coinAddress: string, index: number) => (
              <HStack
                key={coinAddress}
                gap="4px"
                justify="flex-start"
                sx={{
                  _before: {
                    content: index !== 0 ? `"/"` : '""',
                    color: 'text_caption',
                    ml: '4px'
                  }
                }}
              >
                <Text fontSize="13px" color="text_caption">
                  {proTokenMap?.get(coinAddress)?.symbol}
                </Text>
              </HStack>
            ))}
          </HStack>
        )
      }
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          Price
        </Text>
      ),
      key: 'price',
      render: (item: any) => {
        return (
          <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
            <Text fontSize="13px" color="text_caption">
              {item?.price}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          TVL
        </Text>
      ),
      key: 'tvl',
      render: (item: any) => {
        return (
          <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
            <Text fontSize="13px" color="text_caption">
              {item?.tvl}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          APR
        </Text>
      ),
      key: 'apr',
      render: (item: any) => {
        return (
          <HStack w="100%" gap="4px" justify={{ base: 'flex-end', lg: 'flex-start' }}>
            <Text fontSize="13px" color="text_caption">
              {item?.apr == '0%' ? '-' : item?.apr}
            </Text>
            {/* <Image w="16px" h="16px" src="/images/icon_star@2x.png" /> */}
          </HStack>
        )
      }
    },
    !isApp && {
      title: <Text fontSize="13px" />,
      key: 'tx',
      render: (item: any) => {
        return (
          <HStack w="100%" justify="flex-end">
            <ViewExplorerIcon onClick={() => window.open(item?.link)} />
          </HStack>
        )
      }
    }
  ].filter(Boolean)
}
export default PoolContent
