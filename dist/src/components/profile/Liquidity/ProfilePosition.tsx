import LiquidityAndYield from '@/components/position/common/LiquidityAndYield'
import PoolItem from '@/components/position/common/PoolItem'
import PositionListLoading from '@/components/position/common/PositionListLoading'
import useGetClmmPositionDailyEarning from '@/hooks/position/useGetClmmPositionDailyEarning'
import useGetDlmmPositionDailyEarning from '@/hooks/position/useGetDlmmPositionDailyEarning'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import { GetPositionDailyEarningsOptions } from '@/types/dlmm'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { NoData } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'

function ProfilePosition({ showPosListGroupByPool = [] }: { showPosListGroupByPool: any }) {
  console.log('1202###🚀 ~ ProfilePosition ~ showPosListGroupByPool:', showPosListGroupByPool)
  const { currentAccount, onWalletModal } = useAccountStore()
  const { posBaseListLoading, posBaseList, posLiquidityData } = usePositionStore()
  const { isAutoRefresh } = useActiveOrdersStore()
  const { isApp } = useWindowWidth()

  const { getClmmPositionDailyEarnings } = useGetClmmPositionDailyEarning()
  const { getDlmmPositionDailyEarnings } = useGetDlmmPositionDailyEarning()
  const { getTokenAmountValue } = useTokenPrice()
  const { dlmmPosBaseList, dlmmPosRewardsData, dlmmPosLiquidityData, setDlmmPosBaseList } = useDlmmPositionStore()

  useDebounceEffect(() => {
    if (posBaseList?.length > 0 && posLiquidityData && Object.keys(posLiquidityData).length > 0) {
      const options: GetPositionDailyEarningsOptions[] = posBaseList.map(item => {
        const currentPosLiquidity = posLiquidityData[item?.posId]
        const amountValueA = getTokenAmountValue(item?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
        const amountValueB = getTokenAmountValue(item?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)
        return {
          position_id: item?.posId,
          current_pool_tvl: d(amountValueA).plus(amountValueB).toString()
        }
      })
      getClmmPositionDailyEarnings(options)
    }
  }, [posBaseList, posLiquidityData, getTokenAmountValue])

  useDebounceEffect(() => {
    if (dlmmPosBaseList?.length > 0 && dlmmPosLiquidityData && Object.keys(dlmmPosLiquidityData).length > 0) {
      const options: GetPositionDailyEarningsOptions[] = dlmmPosBaseList.map(item => {
        const currentPosLiquidity = dlmmPosLiquidityData[item?.id]
        const amountValueA = getTokenAmountValue(item?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
        const amountValueB = getTokenAmountValue(item?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)

        return {
          position_id: item?.id,
          current_pool_tvl: d(amountValueA).plus(amountValueB).toString()
        }
      })
      getDlmmPositionDailyEarnings(options)
    }
  }, [dlmmPosBaseList, dlmmPosLiquidityData, getTokenAmountValue])

  return (
    <VStack w="100%">
      <LiquidityAndYield isProfile />
      {!currentAccount?.address ? (
        <NoData type="nowallet" onboard={() => onWalletModal(true)} noBorder />
      ) : !isAutoRefresh && posBaseListLoading ? (
        <VStack width="100%" mt={!isApp ? '8px' : '0px'}>
          {[{}, {}, {}, {}].map((item, index) => {
            return <PositionListLoading key={index} />
          })}
        </VStack>
      ) : showPosListGroupByPool?.length > 0 ? (
        <VStack width="100%" mt={!isApp ? '8px' : '0px'}>
          {showPosListGroupByPool?.map((item, index) => {
            return <PoolItem key={item?.clmmPoolAddress || item?.dlmmPoolAddress} poolInfo={item} />
          })}
        </VStack>
      ) : (
        <NoData type="nodata" text="No Liquidity Positions" noBorder />
      )}
    </VStack>
  )
}

export default ProfilePosition
