import useRecentTransactions from '@/hooks/clmm/useRecentTransactions'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData, Table } from '@cetus/ui-kit'
import { Box, Button, Center, HStack, Skeleton, Spinner, Text, VStack } from '@chakra-ui/react'
import MobileTransactionCard from './MobileTransactionCard'
import { getColumns } from './components'
import { DataItem } from './type'

function RecentTransactions() {
  const { getExplorerUrl } = useExplorer()

  const { isLoading, list, apiPoolInfo, currentPage, onCurrentPageChange, hasNextPage } = useRecentTransactions()
  const { isApp } = useWindowWidth()

  return (
    <VStack w="100%" position="relative" px={{ base: '12px', lg: '0px' }} mt={{ base: '0', lg: '24px' }} gap="0px">
      {!isApp && (
        <HStack w="100%" justify="space-between">
          <Text fontSize="24px" color="text_caption" fontWeight="500">
            Transactions
          </Text>
        </HStack>
      )}
      {!isLoading && list?.length == 0 ? (
        <NoData type="nodata" mt="16px" text="No Recent Transactions" />
      ) : isApp ? (
        <VStack w="100%" gap="12px">
          {isLoading && currentPage === 1 ? (
            <>
              {[1, 2, 3, 4, 5].map(index => (
                <Box key={index} w="100%" borderBottom="1px solid" borderColor="border" pb="12px">
                  {/* 顶部：事件类型和时间戳 */}
                  <HStack w="100%" justify="space-between" mb="12px" align="flex-start">
                    <HStack gap="4px">
                      <Skeleton w="20px" h="20px" borderRadius="5px" />
                      <Skeleton h="14px" w="100px" />
                    </HStack>
                    <Skeleton h="12px" w="60px" />
                  </HStack>

                  {/* 内容区域 */}
                  <VStack align="flex-start" gap="8px">
                    {/* Amounts */}
                    <HStack justify="space-between" align="center" gap="4px" w="100%">
                      <Skeleton h="12px" w="60px" />
                      <VStack align="flex-end" gap="4px">
                        <Skeleton h="12px" w="120px" />
                        <Skeleton h="12px" w="100px" />
                      </VStack>
                    </HStack>

                    {/* Transactions */}
                    <HStack justify="space-between" align="center" gap="4px" w="100%">
                      <Skeleton h="12px" w="80px" />
                      <Skeleton h="12px" w="140px" />
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </>
          ) : (
            list?.map((item, index) => (
              <MobileTransactionCard key={item.tx + index} item={item} getExplorerUrl={getExplorerUrl} isReverse={apiPoolInfo?.isReverse} />
            ))
          )}
        </VStack>
      ) : (
        <Table<DataItem>
          columns={getColumns(getExplorerUrl, apiPoolInfo?.isReverse)}
          dataSource={list}
          skeletonLength={10}
          loading={isLoading && currentPage === 1}
          onRowClick={(item: any) => {
            window.open(getExplorerUrl(item?.tx, 'tx'), '_blank')
          }}
          rowStyle={{ h: '52px', cursor: 'pointer' }}
        />
      )}
      {hasNextPage && (
        <Center mt={{ base: '40px', lg: '20px' }}>
          <Button
            w="120px"
            h="32px"
            fontSize="12px"
            borderRadius="8px"
            bg="button_ghost_bg"
            color="primary"
            borderColor="border"
            variant="outline"
            onClick={onCurrentPageChange}
          >
            {isLoading ? <Spinner size="sm" color="text_caption" /> : 'Load More'}
          </Button>
        </Center>
      )}
    </VStack>
  )
}

export default RecentTransactions
