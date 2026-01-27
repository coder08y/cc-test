import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { AddressCopyLink } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData, SingleCoinImage } from '@cetus/ui-kit'
import { d } from '@cetusprotocol/common-sdk'
import { Box, Button, Center, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { useState } from 'react'
import { TableCardLoading } from './MarginPoolTableH5'

const PAGE_SIZE = 20

export function HistoryTableH5() {
  const { currentAccount, onWalletModal } = useAccountStore()

  const historyList = useDeepBookMarginPoolStore(state => state.historyList)
  const isHistoryLoading = useDeepBookMarginPoolStore(state => state.isHistoryLoading)

  const { getExplorerUrl } = useExplorer()
  //分页
  const [pageList, setPageList] = useState<any>([])
  const [currentPage, setCurrentPage] = useState(0)
  const hasMore = pageList?.length < (historyList?.length ?? 0)
  useDeepCompareEffect(() => {
    if (!historyList?.length) {
      setPageList([])
      return
    }
    const end = d(currentPage).plus(1).mul(PAGE_SIZE).toNumber()
    const data = historyList.slice(0, end)
    setPageList(data)
  }, [historyList, currentPage])
  return (
    <VStack w="100%" m="20px 0">
      {!currentAccount?.address ? (
        <NoData
          type="nowallet"
          text=""
          borderRadius="16px"
          noBorder
          onboard={() => {
            onWalletModal(true)
          }}
        />
      ) : isHistoryLoading ? (
        <VStack
          w="100%"
          gap="16px"
          sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '16px', _last: { borderBottom: 'none', pb: '0px' } } }}
        >
          {[{}, {}].map((item, index) => (
            <TableCardLoading key={index} />
          ))}
        </VStack>
      ) : pageList.length === 0 ? (
        <NoData type="nodata" text="You don't have any open orders yet." borderRadius="16px" />
      ) : (
        <VStack
          w="100%"
          gap="16px"
          //  _first: { borderTop: '1px solid', borderColor: 'border', pt: '16px' },
          sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '16px', _last: { borderBottom: 'none', pb: '0px' } } }}
        >
          {pageList?.map((item: any) => (
            <VStack w="100%" gap="12px">
              <HStack w="100%" justify="space-between">
                {/* <Text fontSize='12px'>Action</Text> */}
                <HStack justify="flex-start">
                  <Center w="20px" h="20px" bg={item?.action == 'Deposit' ? 'primary_green_opacity.10' : '#272727'} borderRadius="4px">
                    <Icon
                      xlinkHref="#icon-a-icon_trade"
                      fontSize="10px"
                      svgFill={item?.action == 'Deposit' ? 'primary_green' : 'text_paragraph'}
                      svgHover={item?.action == 'Deposit' ? 'primary_green' : 'text_paragraph'}
                      transform={item?.action == 'Deposit' ? 'rotate(0deg)' : 'rotate(180deg)'}
                    />
                  </Center>
                  <Text color="text_caption" fontSize="12px">
                    {item?.action}
                  </Text>
                </HStack>
              </HStack>
              <HStack w="100%" justify="space-between" minH="16px">
                <Text fontSize="12px">Amounts</Text>
                <HStack justifyContent="flex-end" gap="4px">
                  <Box h={{ base: '16px', lg: '20px' }} mt="-4px">
                    <SingleCoinImage imageUrl={item?.tokenInfo?.iconUrl} imgBoxStyle={{ w: '20px', h: '20px' }} />
                  </Box>
                  <Text color="text_caption" fontSize="12px">
                    {item?.amountDisplay} {item?.tokenInfo?.symbol}
                  </Text>
                </HStack>
              </HStack>
              <HStack w="100%" justify="space-between" minH="16px">
                <Text fontSize="12px">Transactions</Text>
                <HStack justify="flex-end">
                  <AddressCopyLink
                    address={item?.tx || ''}
                    fontSize="12px"
                    showLink={false}
                    showCopy={false}
                    color="text_caption"
                    onClickLink={() => window.open(getExplorerUrl(item?.tx || '', 'tx'))}
                  />
                </HStack>
              </HStack>
              <HStack w="100%" justify="space-between" minH="16px">
                <Text fontSize="12px"> Time (UTC)</Text>
                <Text color="text_caption" fontSize="12px">
                  {item?.timestamp}
                </Text>
              </HStack>
            </VStack>
          ))}
          {hasMore && historyList?.length !== 0 && (
            <Center w="100%" margin="auto" textAlign="center">
              {isHistoryLoading ? (
                <Spinner size="sm" mt="-30px" />
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
                  // mt="-30px"
                  onClick={() => setCurrentPage(prev => (hasMore ? prev + 1 : prev))}
                >
                  Load More
                </Button>
              )}
            </Center>
          )}
        </VStack>
      )}
    </VStack>
  )
}
