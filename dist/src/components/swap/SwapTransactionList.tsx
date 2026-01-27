import useTokenRank from '@/hooks/common/useTokenRank'
import { useSwapTransactionList } from '@/hooks/swap/useSwapTransactionList'
import { Block, CurrentPrice } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData, RefreshButton, SingleCoinImage } from '@cetus/ui-kit'
import { fromDecimalsAmountFix, getTimeDifferenceString, textEllipses } from '@cetus/utils'
import { CoinAssist } from '@cetusprotocol/common-sdk'
import { Center, Flex, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

function SwapTransactionList() {
  const { isApp } = useWindowWidth()
  const { currentAccount, onWalletModal } = useAccountStore()

  const { getWalletSwapHis, historyLoading, historyList, nextCursor, remainingList, handleRefreshSwapHis } = useSwapTransactionList()

  const [loadMoreLoading, setLoadMoreLoading] = useState(false) // 初始页面设为 1
  const [currentPage, setCurrentPage] = useState(1) // 初始页面设为 1
  const [pageList, setPageList] = useState([]) // 初始页面设为 1

  // 计算当前要展示的数据
  useEffect(() => {
    console.log('🚀 ~ SwapTransactionList ~ historyList:', currentPage, historyList)
    const res = historyList.slice(0, currentPage * 10)
    setPageList(res)
  }, [historyList, currentPage])

  useEffect(() => {
    if (loadMoreLoading) {
      setLoadMoreLoading(historyLoading)
    }
  }, [historyLoading, loadMoreLoading])

  const loadMore = () => {
    console.log('🚀 ~ loadMore ~ remainingList:', remainingList)
    setLoadMoreLoading(true)
    if (remainingList.length >= 10) {
      // 直接从 remainingList 取数据
      setCurrentPage(prev => prev + 1)
    } else {
      // 先用完 remainingList 后再请求新数据
      if (remainingList.length > 0 || historyList?.length > 0) {
        setCurrentPage(prev => prev + 1)
      }
      if (nextCursor && currentAccount?.address) {
        getWalletSwapHis(currentAccount.address, nextCursor)
      }
    }
  }

  useEffect(() => {
    console.log('🚀 ~ useEffect ~ currentAccount?.address:', currentAccount?.address)
    if (currentAccount?.address) {
      getWalletSwapHis(currentAccount.address, '')
    }
  }, [currentAccount?.address])

  return (
    <VStack w="100%" align="flex-start">
      <HStack w="100%" h="60px" justify="space-between">
        <Text
          position="relative"
          fontSize="16px"
          color="primary"
          fontWeight="500"
          sx={{
            _before: {
              content: "''",
              width: '20px',
              height: '2px',
              background: 'primary',
              position: 'absolute',
              left: 'calc(50% - 10px)',
              bottom: '-14px'
            }
          }}
        >
          Transaction History
        </Text>
        <RefreshButton handleRefresh={handleRefreshSwapHis} borderRadius="8px" w="28px" h="28px" innerStyle={{ bg: 'swap_bg_secondary' }} />
      </HStack>
      <Block w="100%" borderRadius="16px" p="4px 0 0">
        <VStack w="100%" gap="0">
          <VStack gap="0" w="100%" align="flex-start">
            {!currentAccount?.address ? (
              <NoData type="nowallet" onboard={() => onWalletModal(true)} noBorder p="0 16px 30px" borderRadius="16px" />
            ) : pageList?.length == 0 ? (
              <Flex w="100%" align="center" justifyContent="center" h="220px" mt="16px">
                {historyLoading ? <Spinner /> : <NoData type="nodata" noBorder borderRadius="16px" p="0 16px 30px" />}
              </Flex>
            ) : (
              <VStack
                w="100%"
                p="0 16px"
                gap="0"
                pr={pageList?.length < 5 ? '16px' : '12px'}
                h={pageList?.length > 4 ? '420px' : 'unset'}
                overflow="auto"
                overflowY="scroll"
                sx={{
                  '>div': {
                    _last: {
                      borderBottom: pageList?.length == 1 ? 'none' : '1px solid',
                      borderColor: 'border'
                    }
                  }
                }}
              >
                {pageList?.map((item: any) => {
                  return <TransInfo key={item?.digest} trans={item} isApp={isApp} />
                })}
              </VStack>
            )}
            {nextCursor &&
              (loadMoreLoading ? (
                <Center w="200px" margin="auto" textAlign="center" pb="16px" pt="12px">
                  <Spinner size="sm" />
                </Center>
              ) : (
                <Text w="200px" margin="auto" textAlign="center" cursor="pointer" mt="12px" h="32px" color="primary" onClick={loadMore}>
                  Load More
                </Text>
              ))}
          </VStack>
        </VStack>
      </Block>
    </VStack>
  )
}

const TransInfo = (props: { trans: any; isApp: boolean }) => {
  const { trans } = props
  const { getAmount } = useSwapTransactionList()
  const { getTokenRank } = useTokenRank()
  const [transDirect, setTransDirect] = useState(false)
  const coinChanges = useMemo(() => {
    if (trans?.coinChanges?.length > 2) {
      return trans?.coinChanges.filter((item: any) => {
        return !CoinAssist.isSuiCoin(item?.coinAddress || '')
      })
    }
    return trans?.coinChanges
  }, [trans?.coinChanges])

  const tokenA = useMemo(() => {
    return coinChanges[0] || undefined
  }, [coinChanges[0]?.coinAddress])

  const tokenB = useMemo(() => {
    return coinChanges[1] || undefined
  }, [coinChanges[1]?.coinAddress])

  const tokenAmountA = useMemo(() => {
    return coinChanges[0]?.amount?.includes('-')
      ? fromDecimalsAmountFix(coinChanges[0]?.amount, coinChanges[0]?.decimal).split('-')[1]
      : fromDecimalsAmountFix(coinChanges[0]?.amount, coinChanges[0]?.decimal)
  }, [coinChanges[0]?.amount])

  const tokenAmountB = useMemo(() => {
    return coinChanges[1]?.amount?.includes('-')
      ? fromDecimalsAmountFix(coinChanges[1]?.amount, coinChanges[1]?.decimal).split('-')[1]
      : fromDecimalsAmountFix(coinChanges[1]?.amount, coinChanges[1]?.decimal)
  }, [coinChanges[1]?.amount])

  useEffect(() => {
    const direct = getTokenRank(tokenA, tokenB)
    setTransDirect(direct)
  }, [tokenA, tokenB])

  const handlePageToggleDirect = () => {
    setTransDirect(!transDirect)
  }
  return (
    <HStack
      gap={{ base: '12px', lg: '0' }}
      display="flex"
      w="100%"
      justify="space-between"
      borderBottom="1px solid"
      borderColor="border"
      p="16px 0px"
      flexDirection={{ base: 'column', lg: 'row' }}
      align={{ base: 'flex-start', lg: 'center' }}
    >
      <VStack align="flex-start" gap="12px">
        <HStack justify="flex-start" gap="4px" flexWrap="wrap">
          {coinChanges?.map((coinChange: any, index: string) =>
            coinChange?.amount?.includes('-') ? (
              <HStack key={coinChange?.coinAddress + index} gap="4px">
                <SingleCoinImage w="24px" h="24px" imageUrl={coinChange?.logo} />
                <Text color="text_caption">{getAmount(coinChange?.amount, coinChange?.decimal).split('-')[1]}</Text>
                <Text color="text_caption">{textEllipses(coinChange?.symbol, 10)}</Text>
              </HStack>
            ) : null
          )}
          <Text color="text_caption">→</Text>
          {coinChanges?.map((coinChange: any, index: string) =>
            !coinChange?.amount?.includes('-') ? (
              <HStack key={coinChange?.coinAddress + index} gap="4px">
                <SingleCoinImage w="24px" h="24px" imageUrl={coinChange?.logo} />
                <Text color="text_caption">{getAmount(coinChange?.amount, coinChange?.decimal).split('+')[1]}</Text>
                <Text color="text_caption">{textEllipses(coinChange?.symbol, 10)}</Text>
              </HStack>
            ) : null
          )}
        </HStack>
        <HStack>
          <Text fontSize="12px">Swap Rate</Text>
          <CurrentPrice
            color="text_caption"
            pageDirect={transDirect}
            handlePageToggleDirect={handlePageToggleDirect}
            fromToken={tokenA!}
            toToken={tokenB!}
            fromValue={tokenAmountA}
            toValue={tokenAmountB}
            noIcon
            fontSize="12px"
            isLoading={coinChanges?.length < 2}
          />
        </HStack>
      </VStack>
      <HStack gap="4px">
        <Text>{getTimeDifferenceString(trans?.timestampMs)}</Text>
        <Icon
          fontSize="16px"
          xlinkHref="#icon-icon_link3"
          onClick={() => window.open(`https://suivision.xyz/txblock/${trans?.digest}?tab=Activity&type=Cetus`, '_blank')}
        />
      </HStack>
    </HStack>
  )
}

export default SwapTransactionList
