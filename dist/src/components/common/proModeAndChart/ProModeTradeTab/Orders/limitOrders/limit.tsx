import DropBlock from '@/components/common/DropBlock'
import { HistoryCard } from '@/components/limit/HistoryCard'
import useGetLimitOrderHistory from '@/hooks/limit/useGetLimitOrderHistory'
import useGetMyLimitOrder from '@/hooks/limit/useGetMyLimitOrder'
import useLimitCancelAction from '@/hooks/limit/useLimitCancelAction'
import useLimitListStore from '@/store/limit/useLimitList'
import SelectTab, { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useRpcListener } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Button, HStack, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { HistoryTableList } from './HistoryTableList'
import OpenOrdersTable from './OpenOrdersTable'

enum LimitTabType {
  OpenOrders = 'Open Orders',
  OrderHistory = 'Order History'
}

function Limit({
  currentOrderTab,
  orderTabList,
  setCurrentOrderTab,
  maxHeight
}: {
  currentOrderTab: string
  orderTabList: any
  setCurrentOrderTab: (tab: string) => void
  maxHeight: any
}) {
  const { currentAccount } = useAccountStore()
  const { getLimitOrderHistory, historyOrderList, historyOrderLoading } = useGetLimitOrderHistory()
  const { fetchMyLimitOrder } = useGetMyLimitOrder()
  const { setMyOrderList, myOrderList, orderListLoading } = useLimitListStore()

  const [pageHistoryList, setPageHistoryList] = useState<any>([])
  const [currTab, setCurrTab] = useState<Tab<object>>({
    label: LimitTabType.OpenOrders
  })

  const tabList = useMemo(() => {
    const list: Tab<object>[] = []

    list.push({
      label: LimitTabType.OpenOrders,
      num: currTab.label === LimitTabType.OpenOrders && myOrderList.length > 0 && !orderListLoading ? myOrderList.length.toString() : undefined
    })

    list.push({
      label: LimitTabType.OrderHistory,
      num:
        currTab.label === LimitTabType.OrderHistory && pageHistoryList.length > 0 && !historyOrderLoading
          ? pageHistoryList.length.toString()
          : undefined
    })
    return list
  }, [currTab.label, myOrderList, pageHistoryList, historyOrderLoading, orderListLoading])

  useEffect(() => {
    getOrderList(true)
  }, [currTab.label, currentAccount])

  useRpcListener({
    onRpcChange: () => {
      getOrderList(true)
    }
  })

  const getOrderList = (isLoading?: boolean) => {
    if (currentAccount?.address) {
      if (currTab.label === LimitTabType.OpenOrders) {
        fetchMyLimitOrder(currentAccount.address, isLoading)
      } else {
        getLimitOrderHistory(currentAccount.address, isLoading)
      }
    }
  }

  useEffect(() => {
    if (currentAccount?.address && historyOrderList?.length > 0) {
      setPageHistoryList(historyOrderList)
    } else {
      setPageHistoryList([])
    }
  }, [historyOrderList, currentAccount?.address])

  useEffect(() => {
    if (!currentAccount?.address) {
      setMyOrderList([])
    }
  }, [currentAccount?.address])

  const { isApp } = useWindowWidth()
  const { handleCancelOrder, cancelOrderLoading } = useLimitCancelAction()
  const isShowCancelAllBtn = currTab.label === LimitTabType.OpenOrders && myOrderList.length > 1
  return (
    <>
      <VStack w="100%" gap="0" align="flex-start" mt={{ base: '0px', lg: '12px' }}>
        <HStack w="100%" justify="space-between" mb="4px">
          <HStack gap={{ base: '8px', lg: '16px' }}>
            <SelectTab<any, any>
              type="outlineTab"
              tabList={orderTabList}
              currentTab={currentOrderTab}
              handleChangeTab={tab => setCurrentOrderTab(tab?.label)}
              wrapStyle={{
                h: '32px',
                p: '3px',
                border: '1px solid',
                borderColor: 'border',
                borderRadius: '8px',
                gap: '4px',
                zIndex: '99'
              }}
              itemStyle={{
                h: '24px',
                p: '4px 8px',
                borderRadius: '4px',
                gap: '4px'
              }}
            />
            <DropBlock
              currenTab={currTab.label}
              tabList={tabList}
              onChange={label => {
                const selected = tabList.find(item => item.label === label)
                if (selected) setCurrTab(selected)
              }}
            />
          </HStack>
          {isShowCancelAllBtn && (
            <Button
              onClick={() => {
                handleCancelOrder(myOrderList)
              }}
              isDisabled={cancelOrderLoading}
              isLoading={cancelOrderLoading}
              h="28px"
              p="8px"
              fontSize="12px"
              fontWeight="400"
              variant="ghost"
            >
              Cancel All
            </Button>
          )}
        </HStack>
        {currTab.label === LimitTabType.OpenOrders && <OpenOrdersTable maxHeight={maxHeight} />}
        {currTab.label === LimitTabType.OrderHistory &&
          (isApp ? (
            <HistoryCard historyOrderList={pageHistoryList} historyOrderLoading={historyOrderLoading} />
          ) : (
            <HistoryTableList maxHeight={maxHeight} historyOrderList={pageHistoryList} historyOrderLoading={historyOrderLoading} />
          ))}
      </VStack>
    </>
  )
}

export default Limit
