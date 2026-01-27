import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { d, isAvailableObject } from '@cetus/utils'
import { useMemo } from 'react'
import useGetPythTokenPrice from '../vault-v2/pyth-price/useGetPythTokenPrice'

export function useGetProfileLiquidityTvl(useVaultTvl = true) {
  const { isAutoRefresh } = useActiveOrdersStore()

  const { currentAccount } = useAccountStore()

  const { posBaseList, posLiquidityData, posBaseListLoading, posLiquidityDataLoading } = usePositionStore()
  const { dlmmPosBaseList, dlmmPosLiquidityData, dlmmPosBaseListLoading, dlmmPosRewardsDataLoading, dlmmPosRewardsData, dlmmPosFeeData } =
    useDlmmPositionStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()

  const { vaultsPositionObj } = useVaultsPositionStore()
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()

  const clmmTotalTvl = useMemo(() => {
    let total: any = 0
    let totalAmount: any = 0

    if (isAutoRefresh || (!posBaseListLoading && !posLiquidityDataLoading)) {
      if (posBaseList?.length > 0 && currentAccount?.address) {
        posBaseList.forEach((ele: any) => {
          const currentPosData = posLiquidityData[ele?.posId]
          const amountValueA = getTokenAmountValue(ele?.displayTokenA?.coin_type, currentPosData?.displayCoinAmountA)
          const amountValueB = getTokenAmountValue(ele?.displayTokenB?.coin_type, currentPosData?.displayCoinAmountB)
          // total == '--' || amountValueA == '--' || amountValueB == '--' ? '--' :
          total = d(total).plus(amountValueA).plus(amountValueB).toString()
          totalAmount = d(totalAmount)
            .plus(currentPosData?.displayCoinAmountA || 0)
            .plus(currentPosData?.displayCoinAmountB || 0)
            .toString()
        })
        return d(total).lte(0) && d(totalAmount).gt(0) ? '--' : total
      } else {
        return '--'
      }
    }
  }, [isAutoRefresh, posBaseList, posBaseListLoading, posLiquidityData, posLiquidityDataLoading, currentAccount?.address, coinPriceObj])

  const vaultTotalTvl = useMemo(() => {
    let totalTvl = d(0)
    if (isAvailableObject(vaultsPositionObj)) {
      Object.values(vaultsPositionObj).forEach(vault => {
        const { category, displayCoinTypeA, displayAmountA, displayCoinTypeB, displayAmountB } = vault
        const holdCoinAValue =
          category == 'haedal' ? getTokenAmountValueByPyth(displayCoinTypeA, displayAmountA) : getTokenAmountValue(displayCoinTypeA, displayAmountA)
        const holdCoinBValue =
          category == 'haedal' ? getTokenAmountValueByPyth(displayCoinTypeB, displayAmountB) : getTokenAmountValue(displayCoinTypeB, displayAmountB)
        const holdingAmount = d(holdCoinAValue).plus(holdCoinBValue || 0)
        totalTvl = totalTvl.add(holdingAmount)
      })
      return totalTvl.toString()
    }
    return '--'
  }, [vaultsPositionObj, currentAccount?.address])

  const dlmmTotalTvl = useMemo(() => {
    let total: any = 0
    let totalAmount: any = 0
    if (isAutoRefresh || (!dlmmPosBaseListLoading && !dlmmPosRewardsDataLoading)) {
      if (dlmmPosBaseList?.length > 0 && currentAccount?.address) {
        dlmmPosBaseList.forEach(ele => {
          const currentDlmmPosData = dlmmPosLiquidityData[ele.id]
          const amountValueA = getTokenAmountValue(ele?.displayTokenA?.coin_type, currentDlmmPosData?.displayCoinAmountA)
          const amountValueB = getTokenAmountValue(ele?.displayTokenB?.coin_type, currentDlmmPosData?.displayCoinAmountB)
          // total == '--' || amountValueA == '--' || amountValueB == '--' ? '--' :
          total = d(total).plus(amountValueA).plus(amountValueB).toString()
          totalAmount = d(totalAmount)
            .plus(currentDlmmPosData?.displayCoinAmountA || 0)
            .plus(currentDlmmPosData?.displayCoinAmountB || 0)
            .toString()
        })
        return d(total).lte(0) && d(totalAmount).gt(0) ? '--' : total
      }
      return '--'
    }
  }, [dlmmPosBaseList, dlmmPosLiquidityData, currentAccount, coinPriceObj, isAutoRefresh, dlmmPosBaseListLoading, dlmmPosRewardsDataLoading])

  const liquidityTotalTvl = useMemo(() => {
    if (!clmmTotalTvl || !dlmmTotalTvl || !vaultTotalTvl) {
      return undefined
    }

    let total = d(0)
    if (clmmTotalTvl && clmmTotalTvl !== '--') {
      total = d(clmmTotalTvl)
    }
    if (dlmmTotalTvl && dlmmTotalTvl !== '--') {
      total = total.plus(dlmmTotalTvl)
    }
    if (useVaultTvl && vaultTotalTvl && vaultTotalTvl !== '--') {
      total = total.plus(vaultTotalTvl)
    }

    return total.toString()
  }, [clmmTotalTvl, dlmmTotalTvl, vaultTotalTvl])

  return {
    clmmTotalTvl,
    vaultTotalTvl,
    liquidityTotalTvl,
    dlmmTotalTvl
  }
}
