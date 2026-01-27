import useGetApiData from '@/hooks/pro/useGetApiData'
import useProStore from '@/store/pro'
import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { d, formatCurrency } from '@cetus/utils'
import { Button, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const PAGE_SIZE = 10
function HoldersContent({ maxHeight }: { maxHeight: any }) {
  const { getExplorerUrl } = useExplorer()
  const { showTokenInfo, topHoldersTotal, topHolders, topHoldersLoading, coinBvPrice } = useProStore()
  const { getTopHolders } = useGetApiData()
  const { isApp } = useWindowWidth()
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [renderedList, setRenderedList] = useState<any[]>([])

  // 获取数据
  useEffect(() => {
    if (showTokenInfo?.coin_type) {
      setCurrentPage(1)
      getTopHolders(showTokenInfo.coin_type, 1, PAGE_SIZE)
    }
  }, [showTokenInfo?.coin_type])

  // 数据变化时，重置渲染列表
  useEffect(() => {
    if (topHolders?.length > 0) {
      setRenderedList(prev => {
        if (currentPage > 1) {
          return [...prev, ...topHolders]
        }
        return [...topHolders]
      })
    } else {
      setRenderedList([])
      setCurrentPage(1)
    }
    setLoadMoreLoading(false)
  }, [topHolders])

  // 点击加载更多
  const handleLoadMore = () => {
    setLoadMoreLoading(true)
    const nextPage = currentPage + 1
    if (showTokenInfo?.coin_type) {
      getTopHolders(showTokenInfo.coin_type, currentPage + 1, PAGE_SIZE)
      setCurrentPage(nextPage)
    }
  }
  const { size } = useDocumentSize()
  return (
    <VStack w="100%" position="relative" gap="20px">
      {!topHoldersLoading && renderedList?.length === 0 ? (
        <NoData type="nodata" noBorder bg="none" />
      ) : isApp ? (
        <VStack w="100%" gap="4px">
          <H5MapTable
            rowKey="holder"
            columns={getColumns(showTokenInfo, getExplorerUrl, coinBvPrice)}
            dataSource={renderedList}
            loading={topHoldersLoading && !loadMoreLoading}
            itemSkeletonLength={5}
            itemHeight="24px"
            rowStyle={(_, index) => ({
              w: '100%',
              p: '0px',
              mt: '12px'
            })}
            // onRowClick={(item: any) => {
            //   window.open(getExplorerUrl(item?.holder, 'account'), '_blank')
            // }}
          />
        </VStack>
      ) : (
        <Table
          rowKey="holder"
          columns={getColumns(showTokenInfo, getExplorerUrl, coinBvPrice)}
          dataSource={renderedList}
          skeletonLength={3}
          fixedHeader
          maxHeight={maxHeight}
          loading={topHoldersLoading && !loadMoreLoading}
          isFlexStart={true}
          trPadding="0px"
          // onRowClick={(item: any) => {
          //   window.open(getExplorerUrl(item?.holder, 'account'), '_blank')
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

      {(loadMoreLoading || !topHoldersLoading) &&
        renderedList?.length < topHoldersTotal &&
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

const getColumns = (showTokenInfo: Token | undefined, getExplorerUrl: any, coinBvPrice: any) => {
  return [
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          #
        </Text>
      ),
      key: '#',
      thConfig: {
        w: '15%'
      },
      render: (_: any, index: number) => (
        <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
          <Text fontSize="13px" color="text_caption">
            {index + 1}
          </Text>
        </HStack>
      )
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          Account
        </Text>
      ),
      key: 'holder',
      thConfig: {
        w: '25%'
      },
      render: (item: any) => (
        <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
          <AddressCopyLink
            address={item?.holder}
            fontSize="13px"
            showLink={false}
            color="text_caption"
            onClickLink={() => window.open(getExplorerUrl(item?.holder, 'account'))}
          />
          {!!item?.image && (
            <CetusTooltip
              placement="top"
              tooltip={
                <Text fontSize="12px" lineHeight="20px" maxW="280px">
                  {item?.name}
                </Text>
              }
            >
              <SingleCoinImage imageUrl={item?.image} imgBoxStyle={{ w: '16px', h: '16px' }} />
            </CetusTooltip>
          )}
        </HStack>
      )
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          Balance
        </Text>
      ),
      key: 'balance',
      thConfig: {
        w: '25%'
      },
      render: (item: any) => (
        <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
          <Text fontSize="13px" color="text_caption">
            {item?.balanceDisplay}
          </Text>
        </HStack>
      )
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          USD Value
        </Text>
      ),
      key: 'usdValue',
      thConfig: {
        w: '25%'
      },
      render: (item: any) => {
        // const usdValue = getTokenAmountValue(showTokenInfo?.coin_type, item?.balance, '--')
        const usdValue = coinBvPrice?.price ? d(coinBvPrice?.price).mul(item?.balance).toString() : '--'
        return (
          <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
            <Text fontSize="13px" color="text_caption">
              {usdValue !== '--' ? formatCurrency(usdValue, 2) : '--'}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: (
        <Text color="primary_gray" fontSize="13px">
          Percentage
        </Text>
      ),
      key: 'percentage',
      thConfig: {
        w: '10%'
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-end">
          <Text fontSize="13px" color="text_caption">
            {item?.percentage}
          </Text>
        </HStack>
      )
    }
  ]
}
export default HoldersContent
