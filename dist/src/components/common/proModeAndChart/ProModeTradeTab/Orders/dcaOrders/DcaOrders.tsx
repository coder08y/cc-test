import usePreModeDcaItemActions from '@/hooks/dca/usePreModeDcaItemActions'
import { Block } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { Icon, NoData, SingleCoinImage } from '@cetus/ui-kit'
import { bnToAmount, d, formatNumber, timeFormatUTC } from '@cetus/utils'
import { Box, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function DcaOrders({ orderInfo, isActiveOrder, pageDirect }: { orderInfo: any; isActiveOrder?: boolean; pageDirect?: boolean }) {
  const { inCoin: sellCoin, outCoin: buyCoin } = orderInfo
  const { orderHistoryList, handleGetDcaOrderHistory, orderHistoryListLoading } = usePreModeDcaItemActions()
  useEffect(() => {
    if (orderInfo?.orderID) {
      handleGetDcaOrderHistory(orderInfo?.orderID, 9999, 0, true)
    }
  }, [orderInfo?.orderID])
  const { getExplorerUrl } = useExplorer()
  const [rateDirect, setRateDirect] = useState(pageDirect)
  const itemHeight = 142
  const listLength = orderHistoryList?.length || 0
  const totalHeight =
    orderHistoryList?.length == 0
      ? `0px`
      : orderHistoryList?.length <= 1
        ? `${itemHeight * listLength + 8}px`
        : `${itemHeight * listLength + (listLength - 1) * 32 + 8}px`
  return (
    <VStack
      pb="16px"
      align="flex-start"
      w="100%"
      gap="32px"
      position="relative"
      h={orderHistoryList?.length >= 3 ? '460px' : 'unset'}
      overflowY="auto"
    >
      {!orderHistoryListLoading && (
        <Box w="0px" h={totalHeight} borderRight="1px dashed" borderColor="border" position="absolute" left="6px" top="8px" />
      )}
      {orderHistoryListLoading ? (
        <HStack h="100px" w="100%" justify="center">
          <Spinner />
        </HStack>
      ) : orderHistoryList?.length === 0 ? (
        <NoData type="nodata" text="No orders" p="12px" bg="none" />
      ) : (
        orderHistoryList.map((orderHistory: any) => {
          const inAmount = bnToAmount(orderHistory.inAmount, sellCoin?.decimals)
          const outAmount = bnToAmount(orderHistory.outAmount, buyCoin?.decimals)
          const rate = d(inAmount).div(outAmount).toString()
          const rateResever = d(1).div(rate).toString()
          return (
            <VStack pl="20px" align="flex-start" w="100%" key={orderHistory?.tx}>
              <HStack w="100%" gap="16px" justifyContent="space-between" position="relative">
                <Text h="20px" lineHeight="20px">
                  {timeFormatUTC(orderHistory?.time * 1000, 'YMDHM')} (UTC)
                </Text>
                <Icon
                  fontSize="16px"
                  xlinkHref="#icon-icon_link3"
                  onClick={() => {
                    window.open(getExplorerUrl(orderHistory?.tx, 'tx'))
                  }}
                />
                <HStack
                  justify="center"
                  h="12px"
                  w="12px"
                  bg="primary_opacity.20"
                  position="absolute"
                  left="-20px"
                  top="4px"
                  zIndex="99999"
                  borderRadius="50%"
                >
                  <Box h="6px" w="6px" bg="primary" borderRadius="50%" />
                </HStack>
              </HStack>
              <Block p="16px" borderRadius="12px">
                <VStack align="flex-start" gap="16px">
                  <VStack gap="4px" align="flex-start">
                    <Text whiteSpace="nowrap" color="text_caption" fontSize="16px" h="20px" lineHeight="20px">
                      {rateDirect ? `${formatNumber(rate)} ` : `${formatNumber(rateResever)} `}
                    </Text>
                    <HStack>
                      <Text whiteSpace="nowrap" h="20px" fontSize="12px" lineHeight="20px">
                        {rateDirect ? ` ${sellCoin.symbol} per ${buyCoin.symbol}` : ` ${buyCoin.symbol} per ${sellCoin.symbol}`}
                      </Text>
                      <Icon xlinkHref="#icon-icon_swap1" svgW="14px" svgH="14px" ml="-6px" onClick={() => setRateDirect(!rateDirect)} />
                    </HStack>
                  </VStack>
                  <HStack w="100%" gap="4px">
                    <SingleCoinImage imageUrl={sellCoin?.logo_url} w="20px" h="20px" />
                    <Text whiteSpace="nowrap" color="text_caption" h="20px" lineHeight="20px">
                      {`${formatNumber(inAmount)}`}
                    </Text>
                    <Text whiteSpace="nowrap" h="20px" lineHeight="20px">
                      {` ${sellCoin.symbol}`}
                    </Text>
                    <Text whiteSpace="nowrap" color="text_caption" h="20px" lineHeight="20px">
                      {` → `}
                    </Text>
                    <SingleCoinImage imageUrl={buyCoin?.logo_url} w="20px" h="20px" />
                    <Text whiteSpace="nowrap" color="text_caption" h="20px" lineHeight="20px">
                      {`${formatNumber(outAmount)}`}
                    </Text>
                    <Text whiteSpace="nowrap" h="20px" lineHeight="20px">
                      {`${buyCoin.symbol}`}
                    </Text>
                  </HStack>
                </VStack>
              </Block>
            </VStack>
          )
        })
      )}
    </VStack>
  )
}
