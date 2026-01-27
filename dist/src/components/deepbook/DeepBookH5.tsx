import DeepbookChart from '@/components/deepbook/DeepbookChart'
import OrderBookBlock from '@/components/deepbook/OrderBookBlock'
import TradeTableBlock from '@/components/deepbook/Tables/TradeTableBlock'
import TopDataBlock from '@/components/deepbook/TopDataBlock'
import useTabAutoScroll from '@/hooks/common/useTabAutoScroll'
import useDeepBookStore from '@/store/deepbook'
import useDeepBookMarginStore from '@/store/deepbook/margin'
import { SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VaulDrawer } from '@cetus/ui-kit'
import { Box, Button, HStack, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import AssetsInfo from './AssetsInfo'
import BalanceManagerSelector from './BalanceManagerSelector'
import MarginAccount from './Margin/MarginAccount'
import MarginTradeBlock from './Margin/MarginTradeBlock'
import MarginLeverageModal from './Margin/MarginleverageModal'
import MarketDetails from './MarketDetails'
import TopTabs from './TopTabs'
import TradeBlock from './Trade/TradeBlock'
import TradeTypeSwitch from './TradeTypeSwitch'

interface DeepBookH5Props {
  currentDeepBookPool: any
  deepBookPools: any[]
  currentAccount: any
  currentBalanceManagerInfo: any
}

function DeepBookH5({ currentDeepBookPool, deepBookPools, currentAccount, currentBalanceManagerInfo }: DeepBookH5Props) {
  const setWithdrawAllModalOpen = useDeepBookStore(state => state.setWithdrawAllModalOpen)
  // ==================== 本地状态 ====================
  const [currentTab, setCurrentTab] = useState<any>({
    label: 'Chart',
    value: 'chart'
  })
  const [isOpenCard, setIsOpenCard] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ==================== 监听币对变化，重置tab ====================
  useEffect(() => {
    // 当币对地址变化时，重置到默认的 Chart tab
    setCurrentTab({
      label: 'Chart',
      value: 'chart'
    })
  }, [currentDeepBookPool?.address])

  // ==================== 常量定义 ====================
  const tabList = [
    { label: 'Chart', value: 'chart' },
    { label: 'Order Book', value: 'orderBook' },
    { label: 'Recent Trades', value: 'recentTrades' },
    { label: 'Market Details', value: 'marketDetails' }
  ]

  const menuList = [
    { label: 'Trade', value: 'trade' },
    { label: 'Account', value: 'account' }
  ]

  // ==================== 事件处理函数 ====================
  const handleChangeTab = (tab: any) => {
    setCurrentTab(tab)
  }

  // ==================== Tab 自动滚动逻辑 ====================
  useTabAutoScroll({
    scrollContainerRef,
    currentTabValue: currentTab.value,
    firstTabValue: 'chart',
    lastTabValue: 'marketDetails',
    padding: 12
  })

  const [isOpenMenuDrawer, setIsOpenMenuDrawer] = useState(false)
  const [currentMenu, setCurrentMenu] = useState<any>({
    label: 'Trade',
    value: 'trade'
  })

  // 保存之前 drawer 的状态，用于在 leverage modal 关闭时恢复
  const prevDrawerStateRef = useRef(false)

  // 监听 leverage modal 状态，控制 drawer 的显示
  const marginLeverageModalOpen = useDeepBookMarginStore(state => state.marginLeverageModalOpen)
  useEffect(() => {
    if (marginLeverageModalOpen) {
      // 当 leverage modal 打开时，保存当前 drawer 状态并关闭 drawer
      setIsOpenMenuDrawer(prev => {
        if (prev) {
          prevDrawerStateRef.current = true
          return false
        }
        return prev
      })
    } else {
      // 当 leverage modal 关闭时，如果之前 drawer 是因为 modal 打开而关闭的，就重新打开它
      if (prevDrawerStateRef.current) {
        setIsOpenMenuDrawer(true)
        prevDrawerStateRef.current = false
      }
    }
  }, [marginLeverageModalOpen])

  // 同步 currentMenu.label 与 menuList，当 isMarginPool 变化时
  useEffect(() => {
    setCurrentMenu((prevMenu: any) => {
      if (prevMenu.value === 'account') {
        const accountLabel = 'Account'
        if (prevMenu.label !== accountLabel) {
          return {
            ...prevMenu,
            label: accountLabel
          }
        }
      }
      return prevMenu
    })
  }, [currentDeepBookPool?.isMarginPool])

  const { isApp } = useWindowWidth()

  const closeMenuDrawer = () => {
    setIsOpenMenuDrawer(false)
  }

  const tradeTypeByPool = useDeepBookStore(state => {
    return state.tradeTypeByPool
  })
  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool?.address])

  const tradeType = useMemo(() => {
    return poolAddress ? tradeTypeByPool[poolAddress] : 'Spot'
  }, [poolAddress, tradeTypeByPool])

  return (
    <VStack w="100%" bg={'background'} minH="100vh" pb="64px" gap={isApp ? '4px' : '8px'}>
      <TopTabs />
      <TopDataBlock />
      <VStack bg="bg_secondary" w="100%" minH="444px" overflow="auto" gap="0">
        <Box
          ref={scrollContainerRef}
          w="100%"
          overflowX={'auto'}
          h="40px"
          flexShrink={0}
          position="sticky"
          top="0"
          zIndex={10}
          bg="bg_secondary"
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none'
          }}
        >
          <SelectTab
            type="borderTab"
            tabList={tabList}
            currentTab={currentTab?.label}
            handleChangeTab={handleChangeTab}
            wrapStyle={{
              w: '100%',
              h: '39px',
              minH: '39px',
              bg: 'bg_secondary',
              border: 'none',
              borderBottom: '1px solid',
              borderColor: 'border !important',
              minW: '398px',
              gap: '24px',
              pl: '12px',
              borderRadius: '0px'
            }}
            itemStyle={{
              // flex: {
              //   lg: '1',
              //   base: 'auto'
              // },
              fontSize: '14px',
              // margin: '0px',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          />
        </Box>

        {currentTab.value === 'chart' && <DeepbookChart currentDeepBookPool={currentDeepBookPool} />}
        {currentTab.value === 'orderBook' && <OrderBookBlock isOpenCard={isOpenCard} ct="Orderbook" />}
        {currentTab.value === 'recentTrades' && <OrderBookBlock isOpenCard={isOpenCard} ct="RecentTrades" />}
        {currentTab.value === 'marketDetails' && (
          <Box w="100%" h="100%" p="12px">
            <MarketDetails tradeType={tradeType} currentDeepBookPool={currentDeepBookPool} />
          </Box>
        )}
      </VStack>
      <TradeTableBlock />

      <VaulDrawer
        key={`drawer-bottom-trade-account`}
        isOpen={isOpenMenuDrawer}
        onClose={() => setIsOpenMenuDrawer(false)}
        placement="bottom"
        padding={'0'}
        wrapStyle={{
          bg: 'bg_secondary'
        }}
      >
        <VStack gap="0">
          <HStack w={'100%'} justifyContent="space-between" borderBottom="1px solid" borderColor="border">
            <SelectTab
              type="borderTab"
              tabList={menuList}
              currentTab={currentMenu?.label}
              handleChangeTab={setCurrentMenu}
              wrapStyle={{
                w: '100%',
                h: '34px',
                minH: '34px',
                borderRadius: '0px',
                bg: 'transparent',
                border: 'none',
                px: '12px',
                flex: 1
              }}
              itemStyle={{
                mr: '24px',
                fontSize: '14px',
                borderRadius: '4px',
                fontWeight: '500'
              }}
            />

            <TradeTypeSwitch />
          </HStack>

          <Box w="100%" px="12px" pb="12px">
            {currentMenu.value === 'trade' && (
              <Box
                sx={{
                  mt: '12px',
                  '& > div': {
                    w: '100%',
                    p: '0'
                  },
                  '&::webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none'
                }}
                maxH={'calc(90vh - 76px)'}
                overflowY={'auto'}
              >
                {tradeType == 'Margin' ? <MarginTradeBlock /> : <TradeBlock />}
              </Box>
            )}

            {currentMenu.value === 'account' && (
              <Box
                sx={{
                  '& > div > div': {
                    w: '100%',
                    p: '0'
                  }
                }}
              >
                {tradeType == 'Margin' ? (
                  <MarginAccount />
                ) : (
                  <Box w="100%" pt="12px">
                    <BalanceManagerSelector mb="12px" isMarginPool={tradeType !== 'Spot'} />
                    <AssetsInfo onOpenInnerDrawer={closeMenuDrawer} />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </VStack>
      </VaulDrawer>

      <Box
        sx={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          zIndex: '1000',
          width: '100%',
          bg: 'bg_secondary',
          px: '12px',
          pt: '12px',
          display: 'flex',
          h: '64px',
          gap: '8px',
          alignItems: 'center',
          pb: '12px'
        }}
      >
        <Button
          variant="ghost"
          w="90px"
          h="38px"
          borderRadius="8px"
          fontSize="14px"
          textColor="text_paragraph"
          _hover={{ color: 'text_paragraph' }}
          onClick={() => {
            setCurrentMenu({ label: 'Account', value: 'account' })
            setIsOpenMenuDrawer(true)
          }}
        >
          Account
        </Button>
        <Button
          variant="solid"
          w="100%"
          h="38px"
          borderRadius="8px"
          fontSize="14px"
          onClick={() => {
            setCurrentMenu({ label: 'Trade', value: 'trade' })
            setIsOpenMenuDrawer(true)
          }}
        >
          Trade
        </Button>
      </Box>

      {/* MarginLeverageModal 放在抽屉外部，确保抽屉关闭时不会被卸载 */}
      {tradeType == 'Margin' && <MarginLeverageModal />}
    </VStack>
  )
}

export default DeepBookH5
