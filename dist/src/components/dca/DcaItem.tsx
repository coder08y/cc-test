import useTokenRank from '@/hooks/common/useTokenRank'
import useDcaItemActions from '@/hooks/dca/useDcaItemActions'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import DcaItemCoinPirBlock from './DcaItemBlock/DcaItemCoinPirBlock'
import DcaProgressBlock from './DcaItemBlock/DcaProgressBlock'
import RangeValueBlock from './DcaItemBlock/RangeValueBlock'
import OverviewOrders from './OverviewOrders'

export default function DcaItem({ currentTabVal, orderInfo }: { currentTabVal: string; orderInfo: any }) {
  const { isApp } = useWindowWidth()
  const { inCoin: sellCoin, outCoin: buyCoin } = orderInfo
  const [isDetail, setIsDetail] = useState(false)

  useEffect(() => {
    setIsDetail(false)
  }, [currentTabVal])

  const { getTokenRank } = useTokenRank()
  const [pageDirect, setPageDirect] = useState(false)

  useEffect(() => {
    const direct = getTokenRank(sellCoin, buyCoin)
    console.log('🚀 ~ useEffectDcaItem ~ direct:', buyCoin, sellCoin, direct)
    setPageDirect(!direct)
  }, [sellCoin?.coin_type, buyCoin?.coin_type])

  const { closeOrderAction, isCloseLoading } = useDcaItemActions()
  const closeOrder = async () => {
    closeOrderAction(orderInfo)
  }
  const { getExplorerUrl } = useExplorer()
  return (
    <VStack w="100%" gap="12px" align="flex-start">
      <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }} align={{ base: 'flex-start', lg: 'center' }}>
        <HStack>
          <DcaItemCoinPirBlock orderInfo={orderInfo} />
          <Icon
            xlinkHref="#icon-icon_link3"
            onClick={() => {
              window.open(getExplorerUrl(orderInfo?.orderID, 'poolAddress'))
            }}
            fontSize="16px"
          />
        </HStack>
        {!isApp && (
          <BtnContent
            currentTabVal={currentTabVal}
            isCloseLoading={isCloseLoading}
            closeOrder={closeOrder}
            orderInfo={orderInfo}
            isDetail={isDetail}
            onClickDetail={() => setIsDetail(!isDetail)}
          />
        )}
      </HStack>
      <DcaProgressBlock orderInfo={orderInfo} />
      <HStack w="100%">
        <Text color="primary_gray" fontSize="12px">
          Price Range
        </Text>
        <RangeValueBlock orderInfo={orderInfo} isRank={true} />
      </HStack>
      {isApp && (
        <BtnContent
          currentTabVal={currentTabVal}
          isCloseLoading={isCloseLoading}
          closeOrder={closeOrder}
          orderInfo={orderInfo}
          isDetail={isDetail}
          onClickDetail={() => setIsDetail(!isDetail)}
        />
      )}
      {isDetail && <OverviewOrders pageDirect={pageDirect} isDetail={isDetail} currentTabVal={currentTabVal} orderInfo={orderInfo} />}
    </VStack>
  )
}

const BtnContent = ({
  currentTabVal,
  isCloseLoading,
  closeOrder,
  orderInfo,
  isDetail,
  onClickDetail
}: {
  currentTabVal: string
  isCloseLoading: boolean
  closeOrder: () => void
  orderInfo: any
  isDetail: boolean
  onClickDetail: () => void
}) => {
  return (
    <HStack w={{ base: '100%', lg: 'unset' }} flexDirection={{ base: 'column', lg: 'row' }}>
      {currentTabVal == 'active' && (
        <Button
          w={{ base: '100%', lg: 'unset' }}
          isLoading={isCloseLoading}
          isDisabled={isCloseLoading}
          onClick={closeOrder}
          h="32px"
          minH="unset"
          p="0px 12px"
          fontSize="14px"
          borderRadius="8px"
          variant="outline"
        >
          {orderInfo?.outBalance <= 0 ? 'Close' : 'Close and Withdraw'}
        </Button>
      )}
      <Button
        w={{ base: '100%', lg: 'unset' }}
        h="32px"
        borderRadius="8px"
        minH="unset"
        p="0px 12px"
        fontSize="14px"
        variant="ghost"
        rightIcon={
          <Icon
            svgW="12px"
            svgH="12px"
            xlinkHref="#icon-icon_arrow"
            transform={isDetail ? 'rotate(180deg)' : 'rotate(0deg)'}
            transition="transform 0.5s"
            ml="-4px"
            mr="-4px"
          />
        }
        onClick={onClickDetail}
      >
        Details
      </Button>
    </HStack>
  )
}
