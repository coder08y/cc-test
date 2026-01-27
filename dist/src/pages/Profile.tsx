import ProfileLiquidity from '@/components/profile/Liquidity/index'
import ProfileOrders from '@/components/profile/Orders'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileTab from '@/components/profile/ProfileTabs/ProfileTab'
import ProfileWalletHoldings from '@/components/profile/ProfileWallet/ProfileWalletHoldings'
import XCetus from '@/components/profile/XCetus'
import { useGetActivityTvl } from '@/hooks/profile/useGetActivityTvl'
import { useGetProfileLiquidityTvl } from '@/hooks/profile/useGetProfileLiquidityTvl'
import { useGetXCetusTvl } from '@/hooks/profile/useGetXCetusTvl'
import { useProfileTask } from '@/hooks/profile/useProfileTask'
import useLimitListStore from '@/store/limit/useLimitList'
import usePositionStore from '@/store/position'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import useWalletHoldingsStore from '@/store/profile/walletHoldings'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import useXCetusStore from '@/store/xcetus/useXCetus'
import type { ProfileTab as ProfileTabType } from '@/types/profile'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { NoData } from '@cetus/ui-kit'
import { d, formatCurrency } from '@cetus/utils'
import { Flex, Spinner, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const formatUsdValue = (value?: number | string) => (value ? formatCurrency(value, 2) : '$--')

const getTotalValue = (...values: (string | number | undefined)[]) => {
  return values.reduce((acc, val) => acc.plus(val && +val ? val : 0), d(0)).toString()
}
function ProfilePage() {
  const { tab, tabDetail } = useQueryParams()
  const { currentAccount, onWalletModal } = useAccountStore()
  const navigate = useNavigate()

  const { posBaseListLoading, posLiquidityDataLoading } = usePositionStore()
  const { holdingsTotalUsd, isCoinPriceLoading, isCoinHoldingLoading } = useWalletHoldingsStore()
  const { liquidityTotalTvl } = useGetProfileLiquidityTvl()
  const { orderTotalTvl } = useGetActivityTvl()
  const { orderListLoading } = useLimitListStore()
  const { isAutoRefresh, dcaOrderListLoading, setAutoRefreshCount, resetAutoRefreshCount } = useActiveOrdersStore()
  const { xCetusTotalTvl } = useGetXCetusTvl()
  const { vaultsPositionLoading } = useVaultsPositionStore()
  const { lockCetusListLoading, veNFTLoading } = useXCetusStore()

  const profileTab = useMemo(() => tab, [tab])

  const { refreshTask } = useProfileTask(profileTab as ProfileTabType)

  const walletLoading = !isAutoRefresh && (isCoinHoldingLoading || isCoinPriceLoading)
  const liquidityLoading = !isAutoRefresh && (posBaseListLoading || posLiquidityDataLoading || isCoinPriceLoading || vaultsPositionLoading)
  const ordersLoading = !isAutoRefresh && (orderListLoading || dcaOrderListLoading || isCoinPriceLoading)
  const xCetusLoading = !isAutoRefresh && (lockCetusListLoading || veNFTLoading || isCoinPriceLoading)

  const tabDataObj = useMemo(() => {
    return {
      wallet: { totalValue: formatUsdValue(holdingsTotalUsd), isLoading: walletLoading },
      liquidity: { totalValue: formatUsdValue(liquidityTotalTvl), isLoading: liquidityLoading },
      orders: { totalValue: formatUsdValue(orderTotalTvl), isLoading: ordersLoading },
      xCetus: { totalValue: formatUsdValue(xCetusTotalTvl), isLoading: xCetusLoading }
    }
  }, [holdingsTotalUsd, liquidityTotalTvl, orderTotalTvl, xCetusTotalTvl, walletLoading, liquidityLoading, ordersLoading, xCetusLoading])

  const profileTabList = [
    { title: 'Wallet Holdings', value: 'wallet', route: '/portfolio?tab=wallet', activeImgUrl: '/images/icon_wallet@2x.png', showTooltip: false },
    { title: 'Liquidity', value: 'liquidity', route: '/portfolio?tab=liquidity', activeImgUrl: '/images/icon_liquidity@2x.png', showTooltip: false },
    {
      title: 'Orders',
      value: 'orders',
      route: '/portfolio?tab=orders',
      activeImgUrl: '/images/icon_orders@2x.png',
      showTooltip: true,
      tooltip: ' Total amount of active orders (Limit & DCA)'
    },
    { title: 'xCETUS', value: 'xCetus', route: '/portfolio?tab=xCetus', activeImgUrl: '/images/icon_xcetus@2x.png', showTooltip: false }
  ]

  const totalValue = useMemo(
    () => getTotalValue(xCetusTotalTvl, liquidityTotalTvl, orderTotalTvl, holdingsTotalUsd),
    [xCetusTotalTvl, liquidityTotalTvl, orderTotalTvl, holdingsTotalUsd]
  )

  useEffect(() => resetAutoRefreshCount(false), [])

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { isApp } = useWindowWidth()
  return (
    <VStack minW={{ base: '100%', lg: '1200px' }} p={{ base: '20px 0px 0', lg: '40px 20px 0' }} margin="0px auto" gap="12px" alignItems="start">
      {!isMounted ? (
        <Flex h="300px" w="100%" justifyContent="center" alignItems="center">
          <Spinner />
        </Flex>
      ) : !currentAccount?.address ? (
        <NoData
          type="nowallet"
          mt="20px"
          imgSize="120px"
          imgUrl="/images/img_wallet@2x.png"
          nowalletText="Please connect your wallet to view portfolio page "
          onboard={() => onWalletModal(true)}
        />
      ) : (
        <VStack w="100%" gap="12px" alignItems="start">
          <ProfileHeader
            handleRefresh={isManual => {
              setAutoRefreshCount(!isManual)
              refreshTask()
            }}
            totalValue={totalValue}
            isLoading={!isAutoRefresh && (veNFTLoading || posBaseListLoading || orderListLoading || dcaOrderListLoading)}
          />
          <ProfileTab
            tabList={profileTabList}
            activeTab={profileTab}
            tabData={tabDataObj}
            onClickTab={(value: string) => navigate(`/portfolio?tab=${value}`)}
          />
          {profileTab === 'wallet' && <ProfileWalletHoldings />}
          {profileTab === 'liquidity' && <ProfileLiquidity />}
          {profileTab === 'orders' && <ProfileOrders />}
          {profileTab === 'xCetus' && <XCetus />}
        </VStack>
      )}
    </VStack>
  )
}

export default ProfilePage
