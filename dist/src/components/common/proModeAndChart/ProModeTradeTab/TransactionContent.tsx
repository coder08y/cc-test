import useGetApiData from '@/hooks/pro/useGetApiData'
import useProStore from '@/store/pro'
import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import H5MapTable from '@cetus/ui-kit/src/components/H5MapTable'
import { getRandomImage, getTimeDifferenceString } from '@cetus/utils'
import { Button, Center, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const PAGE_SIZE = 10
function TransactionContent({ maxHeight }: { maxHeight: any }) {
  const { getExplorerUrl } = useExplorer()
  const { showTokenInfo, coinTransactionBlocks, coinTransactionLoading } = useProStore()
  const { getCoinTransactionBlocks } = useGetApiData()

  const [paginationList, setPaginationList] = useState<any[]>([])
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  const { isApp } = useWindowWidth()

  // 初次加载或切换币种
  useEffect(() => {
    if (showTokenInfo?.coin_type) {
      setPaginationList([])
      getCoinTransactionBlocks(showTokenInfo.coin_type, '', PAGE_SIZE)
    }
  }, [showTokenInfo?.coin_type])

  // 数据更新处理
  useEffect(() => {
    if (!coinTransactionBlocks) return
    setPaginationList(prev => {
      const list = coinTransactionBlocks?.list || []
      if (coinTransactionBlocks?.isFirstPage) {
        return [...list]
      } else {
        return coinTransactionBlocks?.nextPageCursor && prev.length ? [...prev, ...list] : [...list]
      }
    })
    setLoadMoreLoading(false)
  }, [coinTransactionBlocks])

  const loadMore = () => {
    if (showTokenInfo?.coin_type && coinTransactionBlocks?.nextPageCursor) {
      setLoadMoreLoading(true)
      getCoinTransactionBlocks(showTokenInfo.coin_type, coinTransactionBlocks?.nextPageCursor, PAGE_SIZE)
    }
  }
  const { size } = useDocumentSize()
  return (
    <VStack w="100%" position="relative" gap="20px">
      {/* {!coinTransactionLoading && !coinTransactionBlocks?.list?.length ? (
        <NoData type="nodata" noBorder bg="none" />
      ) :  */}
      {isApp ? (
        <VStack w="100%" gap="4px">
          <H5MapTable
            rowKey="txDigest"
            columns={getColumns(getExplorerUrl)}
            dataSource={paginationList}
            loading={coinTransactionLoading && !loadMoreLoading}
            itemSkeletonLength={5}
            itemHeight="24px"
            rowStyle={(_, index) => ({
              w: '100%',
              p: '0px',
              mt: '12px'
            })}
            // onRowClick={(item: any) => {
            //   window.open(getExplorerUrl(item?.txDigest, 'tx'), '_blank')
            // }}
          />
        </VStack>
      ) : (
        <Table
          rowKey="txDigest"
          key={paginationList.length}
          columns={getColumns(getExplorerUrl)}
          dataSource={paginationList}
          skeletonLength={3}
          loading={coinTransactionLoading && !loadMoreLoading}
          isFlexStart
          trPadding="0px"
          fixedHeader
          maxHeight={maxHeight}
          // onRowClick={(item: any) => {
          //   window.open(getExplorerUrl(item?.txDigest, 'tx'), '_blank')
          // }}
          noData={!coinTransactionBlocks?.list?.length ? <NoData type="nodata" noBorder bg="none" /> : undefined}
          rowStyle={{
            h: '40px',
            // cursor: 'pointer',
            _hover: {
              bg: 'none !important'
            }
          }}
        />
      )}
      {(loadMoreLoading || !coinTransactionLoading) && coinTransactionBlocks?.nextPageCursor && (
        <Center w="100%" py="12px">
          {loadMoreLoading ? (
            <Spinner size="sm" />
          ) : (
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
              isDisabled={loadMoreLoading}
            >
              Load More
            </Button>
          )}
        </Center>
      )}
    </VStack>
  )
}

const getColumns = (getExplorerUrl: any) => [
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Digest
      </Text>
    ),
    key: 'digest',
    thConfig: {
      w: '24%'
    },
    render: (item: any) => (
      <HStack w="100%" gap="4px" justify={{ base: 'flex-end', lg: 'flex-start' }} mr="12px">
        <AddressCopyLink
          address={item?.txDigest}
          fontSize="13px"
          showLink={false}
          color="text_caption"
          onClickLink={() => window.open(getExplorerUrl(item?.txDigest, 'tx'))}
        />
        {item?.labels?.map((info: any) => {
          return (
            <CetusTooltip
              placement="top"
              tooltip={
                <Text fontSize="12px" lineHeight="20px" maxW="280px">
                  {info?.name}
                </Text>
              }
            >
              <SingleCoinImage imageUrl={info?.image} imgBoxStyle={{ w: '16px', h: '16px' }} />
            </CetusTooltip>
          )
        })}
      </HStack>
    )
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Payload
      </Text>
    ),
    key: 'payload',
    thConfig: {
      w: '20%'
    },
    render: (item: any) => (
      <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        {item?.payload === 'TransferObjects' ? (
          <Text fontSize="13px" color="text_caption">
            {item?.payload}
          </Text>
        ) : (
          <AddressCopyLink
            address={item?.payload}
            fontSize="13px"
            // hasUnderline={false}
            showLink={false}
            color="text_caption"
            onClickLink={() => (item?.payloadPackage ? window.open(getExplorerUrl(item?.payloadPackage, 'package')) : {})}
          />
        )}
      </HStack>
    )
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Sender
      </Text>
    ),
    key: 'sender',
    thConfig: {
      w: '20%'
    },
    render: (item: any) => (
      <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <SingleCoinImage imageUrl={getRandomImage(item?.sender)} imgBoxStyle={{ w: '20px', h: '20px' }} />
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
        Txns
      </Text>
    ),
    key: 'txns',

    thConfig: {
      w: '8%'
    },
    render: (item: any) => (
      <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <Text fontSize="13px" color="text_caption">
          {item?.txns}
        </Text>
      </HStack>
    )
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Status
      </Text>
    ),
    key: 'status',
    thConfig: {
      w: '8%'
    },
    render: (item: any) => (
      <HStack w="100%" gap="4px" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <Image src={item?.status === 'success' ? '/images/icon_yes.png' : '/images/img_fail.png'} w="16px" h="16px" />
      </HStack>
    )
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Age
      </Text>
    ),
    key: 'age',
    thConfig: {
      w: '10%'
    },
    render: (item: any) => (
      <HStack w="100%" gap="4px" justify={{ base: 'flex-end', lg: 'flex-start' }}>
        <Text fontSize="13px" color="text_caption">
          {getTimeDifferenceString(item?.timestamp)}
        </Text>
      </HStack>
    )
  },
  {
    title: (
      <Text color="primary_gray" fontSize="13px">
        Gas
      </Text>
    ),
    key: 'gas',
    thConfig: {
      minW: '180px'
    },
    render: (item: any) => (
      <HStack w="100%" gap="4px" justify={{ base: 'flex-end', lg: 'flex-end' }}>
        <Image src="/images/icon_gas@2x.png" w="16px" h="16px" />
        <Text fontSize="13px" color="text_caption" whiteSpace="nowrap">
          {item?.gas} SUI
        </Text>
      </HStack>
    )
  }
]

export default TransactionContent
