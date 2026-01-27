import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { Block } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinType } from '@cetus/types'
import { H5MapTable, Icon, NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import { bnToAmount, d, formatCurrency, formatNumber, textEllipses, timeFormatUTC } from '@cetus/utils'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

export function PositionHistory() {
  const { currentPosBaseInfo } = usePositionStore()
  const { isPosHistoryLoading, curPosHistoryList } = usePositionDetailStore()
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()

  const pageSize = 10
  const [paginationList, setPaginationList] = useState<any[]>([])
  const [currentPaginationList, setCurrentPaginationList] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ curPosHistoryList.slice(0, end):', currentPosBaseInfo, isPosHistoryLoading, curPosHistoryList)
    if (curPosHistoryList?.length > 0 && !isPosHistoryLoading) {
      setTotal(curPosHistoryList?.length)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setPaginationList(curPosHistoryList.slice(0, end))
      setCurrentPaginationList(curPosHistoryList.slice(start, end))
    }
  }, [currentPage, curPosHistoryList, isPosHistoryLoading])

  useEffect(() => {
    if (isPosHistoryLoading) {
      setCurrentPage(1)
    }
  }, [isPosHistoryLoading])

  const hasLoadMore = useMemo(() => {
    const currentSize = (currentPage - 1) * pageSize + currentPaginationList?.length
    console.log('🚀 ~ hasLoadMore ~ Number(total) > currentSize:', currentPage, pageSize, Number(total), currentSize)
    return Number(total) > currentSize
  }, [total, currentPage])

  const changeCurrentPage = () => {
    setCurrentPage(prev => prev + 1)
  }

  return (
    <Block borderRadius="16px" p="0" overflow="hidden">
      <Text p="16px 16px 8px" color="text_caption" fontSize="16px" fontWeight="500">
        History
      </Text>
      <Box maxH="350px" overflow="auto">
        <VStack w="100%" position="relative" gap="16px">
          {!isPosHistoryLoading && curPosHistoryList?.length == 0 ? (
            <NoData type="nodata" text="No history found" border="none" />
          ) : isApp ? (
            <VStack w="100%">
              <HStack w="100%" justify="space-between">
                <Text fontSize="24px" color="text_caption">
                  Pools
                </Text>
              </HStack>
              <H5MapTable
                rowKey="index"
                dataSource={paginationList}
                columns={getColumns(currentPosBaseInfo, isPosHistoryLoading)}
                loading={isPosHistoryLoading}
                itemSkeletonLength={4}
                itemHeight="30px"
                onRowClick={item => {
                  window.open(getExplorerUrl(item?.txDigest, 'tx'))
                }}
                rowStyle={(_, index) => ({
                  w: '100%',
                  p: '0px',
                  mt: '12px'
                })}
              />
            </VStack>
          ) : (
            <Table
              rowKey="index"
              columns={getColumns(currentPosBaseInfo, isPosHistoryLoading)}
              dataSource={paginationList}
              skeletonLength={3}
              loading={isPosHistoryLoading}
              rowStyle={{
                h: '68px',
                cursor: 'pointer'
              }}
              onRowClick={item => {
                window.open(getExplorerUrl(item?.txDigest, 'tx'))
              }}
            />
          )}
          {!isPosHistoryLoading && hasLoadMore && (
            <Button
              w="120px"
              h="32px"
              mb="16px"
              fontSize="12px"
              borderRadius="8px"
              bg="button_ghost_bg"
              color="primary"
              borderColor="border"
              variant="outline"
              onClick={changeCurrentPage}
            >
              Load More
            </Button>
          )}
        </VStack>
      </Box>
    </Block>
  )
}
const getColumns = (currentPosBaseInfo: any, isPosHistoryLoading: boolean) => {
  const getEvent = (type: string) => {
    if (type?.includes('AddLiquidity')) {
      return 'Add liquidity'
    }
    if (type?.includes('RemoveLiquidity')) {
      return 'Remove liquidity'
    }
    if (type?.includes('CollectReward') || type?.includes('Harvest')) {
      return 'Claim rewards'
    }
    if (type?.includes('CollectFee')) {
      return 'Claim fees'
    }
  }
  return [
    {
      title: <Text>Event</Text>,
      key: 'type',
      showLabel: false,
      render: ({ type }: { type: string }) => {
        return <Text color="text_caption">{getEvent(type)}</Text>
      }
    },
    {
      title: <Text textAlign={isPosHistoryLoading ? 'right' : 'left'}>Amount ($)</Text>,
      key: 'amount',
      render: (history: any) => {
        return <AmountBlock history={history} currentPosBaseInfo={currentPosBaseInfo} type="amount" />
      }
    },
    {
      title: <Text textAlign={isPosHistoryLoading ? 'right' : 'left'}>Assets</Text>,
      key: 'txDigest',
      render: (history: any) => {
        return <AmountBlock history={history} currentPosBaseInfo={currentPosBaseInfo} type="assets" />
      }
    },
    {
      title: <Text textAlign="right">Date (UTC)</Text>,
      key: 'timestampMs',
      render: ({ timestampMs }: { timestampMs: string }) => {
        return (
          <HStack gap="4px" cursor="pointer" justify="flex-end">
            <Text>{timeFormatUTC(Number(timestampMs), '')}</Text>
            <Icon fontSize="16px" xlinkHref="#icon-icon_link3" />
          </HStack>
        )
      }
    }
  ]
}

const AmountBlock = ({ history, currentPosBaseInfo, type }: { history: any; currentPosBaseInfo: any; type: 'assets' | 'amount' }) => {
  const { getTokenAmountValue } = useTokenPrice()
  const { tokenInfo: rewardTokenInfo } = useGetToken<CoinType>(history?.parsedJson?.rewarder_type?.name as CoinType)

  const displayTokenA = currentPosBaseInfo?.displayTokenA
  const displayTokenB = currentPosBaseInfo?.displayTokenB

  const isReverse = currentPosBaseInfo?.isReverse
  const amountA = !isReverse ? history?.parsedJson?.amount_a : history?.parsedJson?.amount_b
  const amountB = !isReverse ? history?.parsedJson?.amount_b : history?.parsedJson?.amount_a

  const displayAmount = history?.parsedJson?.rewarder_type?.name ? bnToAmount(history?.parsedJson?.amount, rewardTokenInfo?.decimals) : 0
  const displayAmountA = bnToAmount(amountA, displayTokenA?.decimals) || 0
  const displayAmountB = bnToAmount(amountB, displayTokenB?.decimals) || 0

  const amountValue = Number(displayAmount) == 0 ? 0 : getTokenAmountValue(rewardTokenInfo?.coin_type, displayAmount + '', '--')
  const amountValueA = Number(displayAmountA) == 0 ? 0 : getTokenAmountValue(displayTokenA?.coin_type, displayAmountA + '', '--')
  const amountValueB = Number(displayAmountB) == 0 ? 0 : getTokenAmountValue(displayTokenB?.coin_type, displayAmountB + '', '--')

  const amountValueTotal = useMemo(() => {
    if (amountValue !== '--' && amountValueA !== '--' && amountValueB !== '--') {
      return formatCurrency(d(amountValue).plus(amountValueA).plus(amountValueB).toString(), 2)
    }
    return '$--'
  }, [amountValue, amountValueA, amountValueB])

  useEffect(() => {
    console.log(
      'history, currentPosBaseInfo',
      history,
      currentPosBaseInfo,
      displayAmount,
      displayAmountA,
      displayAmountB,
      amountValue,
      amountValueA,
      amountValueB
    )
  }, [history, currentPosBaseInfo])
  return (
    <>
      {type == 'amount' ? (
        <Text textAlign="left">{amountValueTotal}</Text>
      ) : (
        <VStack align="flex-start" gap="4px">
          {rewardTokenInfo && (
            <HStack gap="4px">
              <SingleCoinImage
                imageUrl={rewardTokenInfo?.logo_url}
                w="20px"
                h="20px"
                coinType={rewardTokenInfo?.coin_type}
                showTagHeight="10px"
                showTagWidth="10px"
              />
              <Text>
                {formatNumber(displayAmount)} {textEllipses(rewardTokenInfo?.symbol)}
              </Text>
            </HStack>
          )}
          {amountA && d(amountA).gt(0) && (
            <HStack gap="4px">
              <SingleCoinImage
                imageUrl={displayTokenA?.logo_url}
                w="20px"
                h="20px"
                coinType={displayTokenA?.coin_type}
                showTagHeight="10px"
                showTagWidth="10px"
              />
              <Text>
                {formatNumber(displayAmountA)} {textEllipses(displayTokenA?.symbol)}
              </Text>
            </HStack>
          )}
          {amountB && d(amountB).gt(0) && (
            <HStack gap="4px">
              <SingleCoinImage
                imageUrl={displayTokenB?.logo_url}
                w="20px"
                h="20px"
                coinType={displayTokenB?.coin_type}
                showTagHeight="10px"
                showTagWidth="10px"
              />
              <Text>
                {formatNumber(displayAmountB)} {textEllipses(displayTokenB?.symbol)}
              </Text>
            </HStack>
          )}
        </VStack>
      )}
    </>
  )
}
