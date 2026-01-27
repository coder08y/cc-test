import useProStore from '@/store/pro'
import { SelectTab } from '@cetus/design'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CheckBox } from '@cetus/ui-kit'
import { formatNumber } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import HoldersContent from './HoldersContent'
import OrdersContent from './Orders/OrdersContent'
import PoolContent from './PoolContent'
import TradesContent from './TradesContent'
import TransactionContent from './TransactionContent'

export function ProModeTradeTab() {
  const [hideSmallPools, setHideSmallPools] = useState(true)
  const { isApp } = useWindowWidth()
  const { size } = useDocumentSize()
  const { topHoldersTotal, topHoldersLoading, currTradeTab, setCurrTradeTab, coinDetailLoading, isRealTime, setIsRealTime } = useProStore()
  const tableHeight = size?.h - 545 > 300 ? size?.h - 545 : 300
  const tradeTabList = useMemo(() => {
    return [
      {
        label: 'Trades',
        value: 'trades'
      },
      {
        label: 'Holders',
        value: 'holders',
        // num: currTradeTab == 'Holders' && !topHoldersLoading ? formatNumber(topHoldersTotal) : undefined
        num: !coinDetailLoading ? formatNumber(topHoldersTotal) : undefined
      },
      // {
      //   label: 'Pools',
      //   value: 'pools'
      // },
      {
        label: 'Transaction Blocks',
        value: 'transaction'
      },
      {
        label: 'Orders',
        value: 'orders'
      }
    ]
  }, [topHoldersTotal, coinDetailLoading])

  const renderRealTimeCheckbox = () => (
    <HStack w={{ base: '100%', lg: 'unset' }} ml={{ base: '0', lg: '8px' }} gap="12px" justify={{ base: 'space-between', lg: 'flex-start' }}>
      {/* <HStack bg="checked_bg" cursor="pointer" h="20px" gap="4px" p="4px" borderRadius="4px" border="1px solid" borderColor="border">
        <Icon svgW="14px" boxW="14px" svgH="14px" boxH="14px" xlinkHref="#icon-icon_paused" svgFill="primary" svgHover="primary" />
        <Text fontSize="12px" color="primary">
          Paused
        </Text>
      </HStack> */}
      <HStack>
        <CheckBox width="20px" height="20px" checked={isRealTime} onClick={() => setIsRealTime(!isRealTime)} />
        <Text fontSize="12px" whiteSpace="nowrap" color="primary_gray">
          RealTime Activity
        </Text>
      </HStack>
    </HStack>
  )

  const renderContent = () => {
    switch (currTradeTab) {
      case 'Trades':
        return <TradesContent maxHeight={tableHeight} />
      case 'Holders':
        return <HoldersContent maxHeight={tableHeight} />
      case 'Pools':
        return <PoolContent hideSmallPools={hideSmallPools} />
      case 'Transaction Blocks':
        return <TransactionContent maxHeight={tableHeight} />
      case 'Orders':
        return <OrdersContent maxHeight={tableHeight} />
      default:
        return null
    }
  }

  return (
    <VStack w="100%" gap={{ base: '0', lg: '8px' }} align="flex-start">
      <Box w="100%" overflow="auto">
        <HStack w="100%" minW={{ base: 'unset', lg: '550px' }} justify="space-between">
          <SelectTab
            type="borderTab"
            currentTab={currTradeTab}
            tabList={tradeTabList as any}
            handleChangeTab={tab => setCurrTradeTab(tab?.label)}
            wrapStyle={{
              bg: 'none',
              h: '52px',
              gap: '20px',
              border: 'none',
              mt: { base: '8px', lg: '0' },
              w: isApp ? 'calc(100vw - 60px)' : 'auto'
            }}
            itemStyle={{
              fontSize: '15px',
              fontWeight: 500,
              position: 'relative',
              whiteSpace: 'nowrap',
              _hover: {
                svg: {
                  fill: 'primary'
                },
                p: {
                  color: 'primary'
                }
              }
            }}
          />

          {/* {currTradeTab === 'Pools' && (
            <HStack>
              <Text fontSize="12px" whiteSpace="nowrap">
                Hide Small Pools
              </Text>
              <Switch isChecked={hideSmallPools} onChange={() => setHideSmallPools(!hideSmallPools)} />
            </HStack>
          )} */}

          {!isApp && currTradeTab === 'Trades' && renderRealTimeCheckbox()}
        </HStack>
      </Box>

      {isApp && currTradeTab === 'Trades' && (
        <HStack w="100%" m="16px 0 4px">
          {renderRealTimeCheckbox()}
        </HStack>
      )}
      {/* overflowY={{ base: 'unset', lg: 'auto' }}*/}
      {/* h={{ base: 'unset', lg: tableHeight }} */}
      <VStack w="100%" minH="300px">
        {renderContent()}
      </VStack>
    </VStack>
  )
}
