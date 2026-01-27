import useGetDeepBookManagerBalance from '@/hooks/deepbook/useGetDeepBookManagerBalance'
import useGetDeepBookOpenOrders from '@/hooks/deepbook/useGetDeepBookOpenOrders'
import useGetDeepBookOrderHistory from '@/hooks/deepbook/useGetDeepBookOrderHistory'
import useGetDeepBookSettleList from '@/hooks/deepbook/useGetDeepBookSettleList'
import useGetDeepBookTradeHistory from '@/hooks/deepbook/useGetDeepBookTradeHistory'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { SelectTab } from '@cetus/design'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { RefreshButton } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import Slippage from '../../common/Slippage'

export const orderBlockTabList = [
  {
    label: 'Market'
  },
  {
    label: 'Limit'
  }
]

export const OrderBlockTab = ({
  currentTab,
  setCurrentTab,
  reduceOnly = false
}: { currentTab: 'Market' | 'Limit'; setCurrentTab: (tab: 'Market' | 'Limit') => void; reduceOnly?: boolean }) => {
  const { currentDeepBookPool, isCheckedAllMarkets } = useDeepBookStore()
  const { marginManagerByAccount } = useMarginStore()
  const { getManagerBalance } = useGetDeepBookManagerBalance()
  const { currentAccount } = useAccountStore()
  const { getCurrentBalanceManagerInfo } = useDeepBookStore()
  const currentBalanceManagerInfo = getCurrentBalanceManagerInfo(currentAccount?.address as string)
  const { fetchAccountBalance } = useAccountBalance()
  const { getDeepBookAllOpenOrders, getDeepBookOpenOrders } = useGetDeepBookOpenOrders()
  const { getDeepBookTradeHistory } = useGetDeepBookTradeHistory()
  const { getDeepBookOrderHistory } = useGetDeepBookOrderHistory()
  const { getSettleList } = useGetDeepBookSettleList()

  const tradeTypeByPool = useDeepBookStore(state => {
    return state.tradeTypeByPool
  })
  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool?.address])

  const tradeType = useMemo(() => {
    return poolAddress ? tradeTypeByPool[poolAddress] : 'Spot'
  }, [poolAddress, tradeTypeByPool])
  const handleRefresh = () => {
    getManagerBalance(
      [
        { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
        { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals }
      ],
      currentAccount?.address as string,
      currentBalanceManagerInfo?.balanceManager
    )
    // getBalanceManagerInfoByFetch(currentBalanceManagerInfo?.balanceManager)
    fetchAccountBalance()
    // 使用 currentDeepBookPool?.isMarginPool 来判断，而不是全局的 orderTab
    const isMargin = tradeType == 'Margin'
    getDeepBookTradeHistory({ poolId: currentDeepBookPool?.address, isMargin })
    getDeepBookOrderHistory({ poolId: currentDeepBookPool?.address, isMargin })
    getSettleList()
    if (isCheckedAllMarkets) {
      getDeepBookAllOpenOrders(false, undefined, false, isMargin, marginManagerByAccount)
    } else {
      getDeepBookOpenOrders(currentDeepBookPool, undefined, isMargin, undefined, marginManagerByAccount)
    }
  }
  return (
    <HStack w="100%" borderRadius="8px" bg="bg_secondary" justifyContent="space-between">
      <SelectTab<any, any>
        type="borderTab"
        tabList={orderBlockTabList}
        currentTab={currentTab}
        handleChangeTab={tab => setCurrentTab(tab?.label)}
        wrapStyle={{
          // w: '132px',
          h: '30px',
          border: 'none',
          gap: '24px'
          // pl: '4px'
        }}
        itemStyle={{
          // w: '50%',
          h: '100%',
          borderRadius: '4px',
          gap: '4px',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: '500',

          sx: {
            '& p': {
              '&::before': {
                display: 'none'
              }
            }
          }
        }}
        selectTabItemTextStyle={{
          color: 'text_paragraph',
          sx: {
            '&[data-active=true]': {
              color: 'primary'
            }
          }
        }}
      />
      <HStack gap="4px" flex="1" justifyContent="flex-end">
        {reduceOnly && (
          <Text fontSize="12px" fontWeight="500" lineHeight="16px" bg="primary_red_opacity.10" color="primary_red" p="6px" borderRadius="8px">
            Reduce-Only
          </Text>
        )}
        {currentTab == 'Market' && <Slippage slippageType="deepbook" />}
        <RefreshButton w="28px" h="28px" innerStyle={{ w: '26px', h: '26px', bg: 'none', fontSize: '12px' }} handleRefresh={handleRefresh} />
      </HStack>
    </HStack>
  )
}
