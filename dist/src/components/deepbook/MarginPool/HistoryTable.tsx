import { SkipViewPc } from '@/components/farms/FarmsTable'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { AddressCopyLink } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData, SingleCoinImage } from '@cetus/ui-kit'
import { d } from '@cetusprotocol/common-sdk'
import { Button, Center, HStack, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import React, { useState } from 'react'
import { HistoryTableH5 } from './HistoryTableH5'

const PAGE_SIZE = 20

export function HistoryTable() {
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

  const { isApp } = useWindowWidth()
  if (isApp) return <HistoryTableH5 />

  return (
    <Table variant="simple_list" w="100%" sx={{ td: { h: '104px !important' } }} mt="16px" mb="80px">
      <Thead>
        <Tr>
          <Th fontSize="13px" color="primary_gray">
            Action
          </Th>
          <Th textAlign="right" fontSize="13px" color="primary_gray">
            Amounts
          </Th>
          <Th textAlign="right" fontSize="13px" color="primary_gray">
            Transactions
          </Th>
          <Th textAlign="right" fontSize="13px" color="primary_gray">
            Time (UTC)
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {!currentAccount?.address ? (
          <Tr>
            <Td colSpan={4} w="100%" sx={{ borderRadius: '16px !important' }}>
              <NoData
                type="nowallet"
                text=""
                borderRadius="16px"
                noBorder
                onboard={() => {
                  onWalletModal(true)
                }}
              />
            </Td>
          </Tr>
        ) : isHistoryLoading ? (
          <SkipViewPc itemList={[1, 2, 3]} skeletonNum={4} rowStyle={{ h: '66px' }} />
        ) : historyList.length === 0 ? (
          <Tr>
            <Td colSpan={4} w="100%" sx={{ borderRadius: '16px !important' }}>
              <NoData type="nodata" text="No data available" borderRadius="16px" noBorder />
            </Td>
          </Tr>
        ) : (
          <React.Fragment>
            {pageList?.map((item: any, index: number) => {
              return (
                <React.Fragment key={index}>
                  <Tr cursor="pointer">
                    <Td w="15%" textAlign="right">
                      <HStack justify="flex-start">
                        <Center w="36px" h="36px" bg={item?.action == 'Deposit' ? 'primary_green_opacity.10' : '#272727'} borderRadius="12px">
                          <Icon
                            xlinkHref="#icon-a-icon_trade"
                            fontSize="12px"
                            svgFill={item?.action == 'Deposit' ? 'primary_green' : 'text_paragraph'}
                            svgHover={item?.action == 'Deposit' ? 'primary_green' : 'text_paragraph'}
                            transform={item?.action == 'Deposit' ? 'rotate(0deg)' : 'rotate(180deg)'}
                          />
                        </Center>
                        <Text color="text_caption">{item?.action}</Text>
                      </HStack>
                    </Td>
                    <Td w="30%" textAlign="right">
                      <HStack justifyContent="flex-end" gap="4px">
                        <SingleCoinImage imageUrl={item?.tokenInfo?.iconUrl} imgBoxStyle={{ w: '24px', h: '24px' }} />
                        <Text color="text_caption">
                          {item?.amountDisplay} {item?.tokenInfo?.symbol}
                        </Text>
                        {/* <Text fontSize='12px' color="primary_gray"> {item?.amountValueDisplay}</Text> */}
                      </HStack>
                    </Td>
                    <Td w="25%" textAlign="right">
                      <HStack justify="flex-end">
                        <AddressCopyLink
                          address={item?.tx || ''}
                          fontSize="13px"
                          showLink={false}
                          showCopy={false}
                          color="text_caption"
                          onClickLink={() => window.open(getExplorerUrl(item?.tx || '', 'tx'))}
                        />
                      </HStack>
                    </Td>
                    <Td w="30%">
                      <Text color="text_caption"> {item?.timestamp}</Text>
                    </Td>
                  </Tr>
                  <Tr h="16px" />
                </React.Fragment>
              )
            })}

            {hasMore && historyList?.length !== 0 && (
              <Td colSpan={4} w="100%" sx={{ borderRadius: '16px !important' }}>
                <Center w="100%" margin="auto" textAlign="center">
                  {isHistoryLoading ? (
                    <Spinner size="sm" mt="-30px" />
                  ) : (
                    <Button
                      w="150px"
                      h="40px"
                      fontSize="12px"
                      borderRadius="8px"
                      bg="button_ghost_bg"
                      color="primary"
                      borderColor="border"
                      variant="outline"
                      mt="-30px"
                      onClick={() => setCurrentPage(prev => (hasMore ? prev + 1 : prev))}
                    >
                      Load More
                    </Button>
                  )}
                </Center>
              </Td>
            )}
          </React.Fragment>
        )}
      </Tbody>
    </Table>
  )
}
