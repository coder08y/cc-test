import useActiveOrdersStore from '@/store/profile/activeOrders'
import useXCetusStore from '@/store/xcetus/useXCetus'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { fromDecimalsAmountFix } from '@cetus/utils'
import { useMemo } from 'react'

export function useGetXCetusTvl() {
  const { currentAccount } = useAccountStore()
  const { isAutoRefresh } = useActiveOrdersStore()
  const { veNFT, veNFTLoading, lockCetusListLoading } = useXCetusStore()

  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()

  const xCetusTotalTvl = useMemo(() => {
    if (isAutoRefresh || (!veNFTLoading && !lockCetusListLoading)) {
      if (currentAccount?.address && veNFT) {
        const amountValue = getTokenAmountValue(
          envConfigs.cetus_coin.coin_type,
          fromDecimalsAmountFix(veNFT?.xcetus_balance, envConfigs.cetus_coin.decimals)
        )
        return amountValue.toString()
      } else {
        return '0'
      }
    }
  }, [isAutoRefresh, veNFT?.xcetus_balance, lockCetusListLoading, veNFTLoading, currentAccount?.address, coinPriceObj])

  return {
    xCetusTotalTvl
  }
}
