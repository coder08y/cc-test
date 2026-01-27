import { LimitOrderInfo } from '@/types/limit'
import { Block } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { NoData, Pagination } from '@cetus/ui-kit'
import { Box, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { CoinInfoBlock } from './OrderItemBlock/CoinInfoBlock'
import { ExpiryBlock } from './OrderItemBlock/ExpiryBlock'
import { FilledSizeBlock } from './OrderItemBlock/FilledSizeBlock'
import { LimitExpendBlock } from './OrderItemBlock/LimitExpendBlock'
import { PriceBlock } from './OrderItemBlock/PriceBlock'
import { StatusBlock } from './OrderItemBlock/StatusBlock'
import { OrdersCardLoading } from './OrdersCard'

type HistoryTableListProps = {
  historyOrderList: LimitOrderInfo[]
  historyOrderLoading: boolean
}
export function HistoryCard(props: HistoryTableListProps) {
  const { historyOrderList, historyOrderLoading } = props
  const { currentAccount, onWalletModal } = useAccountStore()
  const pageSize = 10
  const [paginationList, setPaginationList] = useState<LimitOrderInfo[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  useEffect(() => {
    if (historyOrderList?.length > 0) {
      setTotal(historyOrderList?.length)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setPaginationList(historyOrderList.slice(start, end))
    }
  }, [currentPage, historyOrderList])
  return (
    <VStack w="100%">
      {!currentAccount?.address ? (
        <NoData type="nowallet" onboard={() => onWalletModal(true)} borderRadius="16px" />
      ) : historyOrderLoading ? (
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
      ) : historyOrderList.length === 0 ? (
        <NoData type="nodata" text="You don't have any order history." borderRadius="16px" />
      ) : (
        <Block borderRadius="16px" p={{ base: '12px', lg: '20px 16px' }} h={paginationList?.length > 8 ? '927px' : 'unset'} overflowY="auto">
          <VStack
            gap="20px"
            sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '20px', _last: { borderBottom: 'none', pb: '0px' } } }}
          >
            {paginationList?.map((historyInfo: any) => (
              <OrdersCardItem key={historyInfo?.order_id} historyInfo={historyInfo} />
            ))}
          </VStack>
          {!historyOrderLoading && historyOrderList?.length > pageSize && (
            <Center mt="12px">
              <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
            </Center>
          )}
        </Block>
      )}
    </VStack>
  )
}

const OrdersCardItem = ({ historyInfo }: { historyInfo: any }) => {
  const [openExpendItemObj, setOpenExpendItemObj] = useState<Record<string, boolean>>({})
  return (
    <VStack w="100%" gap="16px">
      <HStack w="100%" justify="space-between">
        <CoinInfoBlock info={historyInfo} imgSize="28px" />
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text>Limit Price</Text>
        <PriceBlock info={historyInfo} />
      </HStack>

      <HStack w="100%" justify="space-between">
        <Text>Expiry</Text>
        <ExpiryBlock info={historyInfo} />
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text>Filled Size</Text>
        <FilledSizeBlock info={historyInfo} />
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text>Status</Text>
        <Box
          cursor="pointer"
          onClick={() => {
            if (openExpendItemObj[historyInfo?.order_id]) {
              openExpendItemObj[historyInfo?.order_id] = false
            } else {
              openExpendItemObj[historyInfo?.order_id] = true
            }
            setOpenExpendItemObj({ ...openExpendItemObj })
          }}
        >
          <StatusBlock historyInfo={historyInfo} openExpendItemObj={openExpendItemObj} />
        </Box>
      </HStack>
      {openExpendItemObj[historyInfo?.order_id] && <LimitExpendBlock historyInfo={historyInfo} p="0" border="none" type="card" />}
    </VStack>
  )
}
