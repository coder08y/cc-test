import useLimitListStore from '@/store/limit/useLimitList'
import { LimitOrderInfo } from '@/types/limit'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { NoData, Pagination } from '@cetus/ui-kit'
import { Center, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { CoinInfoBlock } from './OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from './OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from './OrderItemBlock/FilledSizeBlock'
import { OrderActionBlock } from './OrderItemBlock/OrderActionBlock'
import { PriceBlock } from './OrderItemBlock/PriceBlock'

export function OrdersCard() {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { myOrderList, orderListLoading } = useLimitListStore()
  const pageSize = 10
  const [paginationList, setPaginationList] = useState<LimitOrderInfo[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    if (myOrderList?.length > 0) {
      setTotal(myOrderList?.length)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setPaginationList(myOrderList.slice(start, end))
    }
  }, [currentPage, myOrderList])
  return (
    <VStack w="100%">
      {!currentAccount?.address ? (
        <NoData type="nowallet" onboard={() => onWalletModal(true)} borderRadius="16px" />
      ) : orderListLoading ? (
        <Block p={{ base: '12px', lg: '20px 16px' }} borderRadius="16px">
          <VStack
            gap="20px"
            sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '20px', _last: { borderBottom: 'none', pb: '0px' } } }}
          >
            {[{}, {}].map((item, index) => (
              <OrdersCardLoading key={index} />
            ))}
          </VStack>
        </Block>
      ) : myOrderList.length === 0 ? (
        <NoData type="nodata" text="You don't have any open orders yet." borderRadius="16px" />
      ) : (
        <Block borderRadius="16px" p={{ base: '12px', lg: '20px 16px' }} h={paginationList?.length > 8 ? '927px' : 'unset'} overflowY="auto">
          <VStack
            gap="20px"
            sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '20px', _last: { borderBottom: 'none', pb: '0px' } } }}
          >
            {paginationList?.map((orderInfo: any) => (
              <OrdersCardItem key={orderInfo?.order_id} orderInfo={orderInfo} />
            ))}
          </VStack>
          {!orderListLoading && myOrderList?.length > pageSize && (
            <Center mt="12px">
              <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
            </Center>
          )}
        </Block>
      )}
    </VStack>
  )
}

const OrdersCardItem = ({ orderInfo }: { orderInfo: any }) => {
  const { isApp } = useWindowWidth()
  return (
    <VStack w="100%" gap="16px">
      <HStack w="100%" justify="space-between">
        <CoinInfoBlock info={orderInfo} imgSize="28px" />
        {!isApp && <OrderActionBlock orderInfo={orderInfo} />}
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text>Price</Text>
        <PriceBlock info={orderInfo} />
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text>Filled Size</Text>
        <FilledSizeBlock info={orderInfo} />
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text>Expiry</Text>
        <ExpiryBlock info={orderInfo} />
      </HStack>
      {isApp && <OrderActionBlock orderInfo={orderInfo} />}
    </VStack>
  )
}

export const OrdersCardLoading = () => {
  return (
    <VStack w="100%" gap="12px" align="flex-start">
      <HStack w="100%" gap="0" justify="space-between">
        <HStack gap="0">
          <HStack gap="0px" mr="8px" align="flex-start">
            <SkeletonCircle size="8" />
            <SkeletonCircle size="8" />
          </HStack>
          <Skeleton height="4" width="100px" />
        </HStack>
      </HStack>
      <HStack w="100%" justify="space-between">
        <Skeleton height="4" width="180px" />
        <Skeleton height="4" width="150px" />
      </HStack>
      <HStack w="100%" justify="space-between">
        <Skeleton height="4" width="180px" />
        <Skeleton height="4" width="150px" />
      </HStack>
    </VStack>
  )
}
