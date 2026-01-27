import useDcaItemActions from '@/hooks/dca/useDcaItemActions'
import { Block, ErrorTips, SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox, Icon, NoData, Pagination } from '@cetus/ui-kit'
import { bnToAmount, d, formatNumber, timeFormatUTC } from '@cetus/utils'
import { Box, Button, Center, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import DcaVLabel from './DcaVLabel'

export default function OverviewOrders({
  isDetail,
  currentTabVal,
  orderInfo,
  pageDirect
}: {
  pageDirect: boolean
  isDetail: boolean
  currentTabVal: string
  orderInfo: any
}) {
  const { isApp } = useWindowWidth()
  const { inCoin: sellCoin, outCoin: buyCoin } = orderInfo
  const [direct, setDirect] = useState(pageDirect)
  const [rateDirect, setRateDirect] = useState(pageDirect)
  const orderHistoryPageSize = 10
  const [currentPage, setCurrentPage] = useState(1)
  const { isClaimLoading, toClaim, total, orderHistoryList, handleGetDcaOrderHistory, orderHistoryListLoading } = useDcaItemActions()

  const [currentTab, setCurrentTab] = useState<Tab>({
    label: 'Overview',
    value: 'overview'
  })
  const tabList: Tab[] = useMemo(() => {
    return [
      {
        label: 'Overview',
        value: 'overview'
      },
      {
        label: orderHistoryListLoading || Number(total) === 0 ? 'Orders' : `Orders (${total})`,
        value: 'orders'
      }
    ]
  }, [total])

  const handleChangeTab = (item: Tab) => {
    setCurrentTab(item)
    setCurrentPage(1)
    if (orderInfo?.orderID) {
      handleGetDcaOrderHistory(orderInfo?.orderID, orderHistoryPageSize, 0, false)
    }
  }

  useEffect(() => {
    if (isDetail && orderInfo?.orderID) {
      handleGetDcaOrderHistory(orderInfo?.orderID, orderHistoryPageSize, 0, false)
    }
  }, [orderInfo?.orderID, isDetail])

  const handleCurrentPage = (page: number) => {
    console.log('🚀 ~ handleCurrentPage ~ page:', page)
    const offset = (page - 1) * orderHistoryPageSize
    handleGetDcaOrderHistory(orderInfo?.orderID, orderHistoryPageSize, offset, false)
    setCurrentPage(page)
  }

  const { getExplorerUrl } = useExplorer()
  return (
    <VStack w="100%" gap="20px">
      <SelectTab
        type="outlineTab"
        wrapStyle={{
          w: '100%',
          h: '36px',
          borderRadius: '8px',
          p: '4px',
          mt: '-1px',
          zIndex: '1'
        }}
        itemStyle={{
          w: '50%',
          fontSize: '12px'
        }}
        tabList={tabList}
        currentTab={currentTab.label}
        handleChangeTab={handleChangeTab}
      />
      <Block p="30px 8px 20px" mt="-42px" borderRadius="8px" zIndex="0" bg="bg_primary">
        {currentTab.value == 'orders' &&
          (orderHistoryListLoading ? (
            <Skeleton height="4" width="100%" />
          ) : orderHistoryList?.length === 0 ? (
            <NoData type="nodata" text="No orders" noBorder p="12px" bg="none" />
          ) : (
            <VStack w="100%" align="flex-start" gap="16px" mt="12px">
              {!isApp && (
                <HStack w="100%" flexDirection={{ base: 'column', lg: 'row' }}>
                  <DcaVLabel label="Order info" value="" w={{ base: '100%', lg: '40%' }} />
                  <DcaVLabel
                    label="Rate"
                    value=""
                    w={{ base: '100%', lg: 'calc(32% - 16px)' }}
                    direct={rateDirect}
                    onChangeDirect={() => setRateDirect(!rateDirect)}
                  />
                  <DcaVLabel label="Time (UTC)" value="" w={{ base: '100%', lg: '28%' }} align="flex-end" textAlign="right" />
                </HStack>
              )}
              {orderHistoryList?.map((orderHistory: any) => {
                const inAmount = bnToAmount(orderHistory.inAmount, sellCoin?.decimals)
                const outAmount = bnToAmount(orderHistory.outAmount, buyCoin?.decimals)
                const rate = d(inAmount).div(outAmount).toString()
                const rateResever = d(1).div(rate).toString()
                return (
                  <HStack
                    w="100%"
                    key={orderHistory?.time}
                    flexDirection={{ base: 'column', lg: 'row' }}
                    borderBottom={isApp ? '1px solid' : 'none'}
                    pb={isApp ? '16px' : '0'}
                    borderColor="border"
                    _last={{
                      borderBottom: 'none',
                      pb: '0'
                    }}
                  >
                    <DcaVLabel
                      label={isApp ? 'Order info' : ''}
                      value={`${formatNumber(inAmount)} ${sellCoin.symbol} → ${formatNumber(outAmount)} ${buyCoin.symbol}`}
                      w={{ base: '100%', lg: '40%' }}
                    />
                    <DcaVLabel
                      label={isApp ? 'Rate' : ''}
                      value={
                        rateDirect
                          ? `${formatNumber(rate)} ${sellCoin.symbol} per ${buyCoin.symbol}`
                          : `${formatNumber(rateResever)} ${buyCoin.symbol} per ${sellCoin.symbol}`
                      }
                      w={{ base: '100%', lg: 'calc(32% - 16px)' }}
                      direct={rateDirect}
                      showDirectIcon={isApp ? true : false}
                      onChangeDirect={() => setRateDirect(!rateDirect)}
                    />
                    <DcaVLabel
                      label={isApp ? 'Time (UTC)' : ''}
                      value={
                        <HStack h="12px">
                          <Text fontSize="12px" color="text_caption">
                            {timeFormatUTC(orderHistory?.time * 1000, 'YMDHM')}
                          </Text>
                          <Icon
                            xlinkHref="#icon-icon_link3"
                            onClick={() => {
                              window.open(getExplorerUrl(orderHistory?.tx, 'tx'))
                            }}
                            fontSize="16px"
                          />
                        </HStack>
                      }
                      w={{ base: '100%', lg: '28%' }}
                      align="flex-end"
                      textAlign="right"
                    />
                  </HStack>
                )
              })}
              {d(total).gt(orderHistoryPageSize) && (
                <Center w="100%">
                  <Pagination total={total} size={orderHistoryPageSize} currentPage={currentPage} onChange={handleCurrentPage} />
                </Center>
              )}
            </VStack>
          ))}

        {currentTab.value == 'overview' && (
          <VStack align="flex-start" gap="20px">
            {orderInfo?.isShowTradeTips && orderInfo?.orderStatus == 'Active' && currentTabVal == 'active' && <WarningText />}
            <VStack w="100%" borderRadius="8px" p="12px" bg="card_bg" gap="12px">
              <HTextLabelBox
                isLoading={false}
                label={`DCA  ${sellCoin?.symbol} Balance`}
                value={`${getSellCoinBalance(orderInfo)} ${sellCoin?.symbol}`}
                skeletonStyle={{
                  valueW: '128px'
                }}
              />
              <HStack w="100%" justify="space-between">
                <Text fontSize="12px">DCA {buyCoin?.symbol} Balance</Text>
                <HStack>
                  <Text color="text_caption" fontSize="12px">
                    {getBuyCoinBalance(orderInfo)} {buyCoin?.symbol}
                  </Text>
                  {currentTabVal == 'active' && (
                    <Button
                      isLoading={isClaimLoading}
                      onClick={() => toClaim(orderInfo)}
                      isDisabled={orderInfo?.outBalance <= 0 || isClaimLoading}
                      w="60px"
                      h="20px"
                      fontSize="12px"
                      borderRadius="4px"
                      variant="outline"
                    >
                      Claim
                    </Button>
                  )}
                </HStack>
              </HStack>
              <HTextLabelBox
                isLoading={false}
                label="Amount Withdrawn"
                value={getAmountWithdrawn(orderInfo, currentTabVal == 'active')}
                skeletonStyle={{
                  valueW: '128px'
                }}
              />
            </VStack>
            <HStack
              flexWrap="wrap"
              p={{ base: '0', lg: '0 12px' }}
              mt={{
                base: '-12px',
                lg: '-28px'
              }}
              sx={{
                '>div': {
                  mt: {
                    base: '12px',
                    lg: '28px'
                  },
                  w: {
                    base: '100%',
                    lg: 'calc((100% - 66px)/3)'
                  },
                  '&:nth-child(3n+1)': {
                    mr: {
                      base: '0',
                      lg: '50px'
                    }
                  }
                }
              }}
            >
              <DcaVLabel label="Invest Every" value={orderInfo?.investEvery} />
              <DcaVLabel label="# of Orders Left" value={orderInfo?.ofOrderLeft} />
              <DcaVLabel label="Each Order Size" value={`${orderInfo?.eachOrderSize} ${sellCoin?.symbol}`} align="flex-end" textAlign="right" />
              <DcaVLabel
                label="Minimum Price"
                value={
                  direct
                    ? `${orderInfo?.minPrice} ${sellCoin?.symbol} per ${buyCoin?.symbol}`
                    : `${orderInfo?.minPriceResever} ${buyCoin?.symbol} per ${sellCoin?.symbol}`
                }
                direct={direct}
                onChangeDirect={() => setDirect(!direct)}
              />
              <DcaVLabel
                label="Maximum Price"
                value={
                  direct
                    ? `${orderInfo?.maxPrice} ${sellCoin?.symbol} per ${buyCoin?.symbol}`
                    : `${orderInfo?.maxPriceResever} ${buyCoin?.symbol} per ${sellCoin?.symbol}`
                }
                direct={direct}
                onChangeDirect={() => setDirect(!direct)}
              />
              {currentTabVal == 'active' && (
                <DcaVLabel
                  label="Current Avg. Price"
                  value={
                    direct
                      ? `${orderInfo?.currentAvgPrice} ${sellCoin?.symbol} per ${buyCoin?.symbol}`
                      : `${orderInfo?.currentAvgPriceResever} ${buyCoin?.symbol} per ${sellCoin?.symbol}`
                  }
                  align="flex-end"
                  textAlign="right"
                  direct={direct}
                  onChangeDirect={() => setDirect(!direct)}
                />
              )}
              {currentTabVal !== 'active' && orderInfo?.currentAvgPrice !== '--' && (
                <DcaVLabel
                  label="Avg. Price"
                  value={
                    direct
                      ? `${orderInfo?.currentAvgPrice} ${sellCoin?.symbol} per ${buyCoin?.symbol}`
                      : `${orderInfo?.currentAvgPriceResever} ${buyCoin?.symbol} per ${sellCoin?.symbol}`
                  }
                  align="flex-end"
                  textAlign="right"
                  direct={direct}
                  onChangeDirect={() => setDirect(!direct)}
                />
              )}
              {currentTabVal == 'active' && <DcaVLabel label="Next Order (UTC)" value={orderInfo?.nextCycleAt} />}
              <DcaVLabel
                label="Created (UTC)"
                value={orderInfo?.createAt}
                align={currentTabVal == 'active' || (currentTabVal !== 'active' && orderInfo?.currentAvgPrice !== '--') ? 'flex-start' : 'flex-end'}
              />
            </HStack>
          </VStack>
        )}
      </Block>
    </VStack>
  )
}

export const getAmountWithdrawn = (orderInfo: any, isActiveOrder: boolean | undefined, isProfile = false) => {
  const { inCoin: sellCoin, outCoin: buyCoin } = orderInfo
  return isActiveOrder ? (
    `${formatNumber(orderInfo?.outWithdraw, 2)} ${buyCoin?.symbol}`
  ) : orderInfo?.orderStatus === 'PartialDeal' || orderInfo?.orderStatus === 'Close' ? (
    d(orderInfo?.outWithdraw).gt(0) ? (
      <>
        {formatNumber(orderInfo?.inWithdrawn)} {sellCoin?.symbol}
        {isProfile && <Box as="span" display="inline-block" m="0 8px" w="1px" h="14px" bg="border" />}
        {formatNumber(orderInfo?.outWithdraw)} {buyCoin?.symbol}
      </>
    ) : (
      `${formatNumber(orderInfo?.inWithdrawn)} ${sellCoin?.symbol}`
    )
  ) : (
    `${formatNumber(orderInfo?.outWithdraw)} ${buyCoin?.symbol}`
  )
}
export const getSellCoinBalance = (orderInfo: any) => {
  return formatNumber(orderInfo?.inBalance, 2) || '0'
}

export const getBuyCoinBalance = (orderInfo: any) => {
  return orderInfo?.outBalance > 0 ? formatNumber(orderInfo?.outBalance) : orderInfo?.outBalance
}

const WarningText = () => {
  return (
    <VStack p="12px 12px 0" align="flex-start">
      <HStack>
        <ErrorTips
          tips="The system tried to execute your order multiple times but did not get it through. This is possibly because:"
          type="warning"
          tipsFontSize="12px"
          p="0"
          bg="none"
          svgW="20px"
          svgH="20px"
        />
      </HStack>
      <WarningDetails />
    </VStack>
  )
}

export function WarningDetails() {
  return (
    <VStack align="flex-start" w="100%">
      <Text color="primary_yellow" lineHeight="20px" fontSize="12px">
        - The market price is not in your required price range
      </Text>
      <Text color="primary_yellow" lineHeight="20px" fontSize="12px">
        - The market no longer exit
      </Text>
      <Text color="primary_yellow" lineHeight="20px" fontSize="12px">
        - The market is extremely volatile
      </Text>
      <Text color="primary_yellow" lineHeight="20px" fontSize="12px" textAlign="left">
        This DCA will continue to be attempted and the estimated end date may be extended until your order is fully executed.
      </Text>
    </VStack>
  )
}
