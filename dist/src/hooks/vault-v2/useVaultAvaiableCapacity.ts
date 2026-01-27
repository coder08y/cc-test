import { log } from 'console'
import { d, symbolDataDisplayProcessing } from '@cetus/utils'
import { useMemo } from 'react'
import useGetPythTokenPrice from './pyth-price/useGetPythTokenPrice'
// 获取vault可用容量
export default function useVaultAvaiableCapacity(currentVaultPool: any) {
  const { getTokenAmountValueByPyth, getTokenPriceByPyth } = useGetPythTokenPrice()

  return useMemo(() => {
    if (currentVaultPool) {
      console.log('🚀🚀🚀 ~ useVaultAvaiableCapacity.ts:11 ~ useMemo ~ currentVaultPool:', currentVaultPool)
      const { hardCap, quoteCoinType, displayCoinTypeA, displayCoinTypeB, displayAmountA, displayAmountB, quoteCoin, baseCoin, baseCoinType } =
        currentVaultPool
      if (!hardCap || !+hardCap) {
        return undefined
      }
      const hardCapUSD = getTokenAmountValueByPyth(quoteCoinType, hardCap)
      if (!hardCapUSD) return undefined
      const displayHardCapUSD = symbolDataDisplayProcessing(hardCapUSD)
      const holdingAmountA = getTokenAmountValueByPyth(displayCoinTypeA, displayAmountA)
      const holdingAmountB = getTokenAmountValueByPyth(displayCoinTypeB, displayAmountB)
      const vaultTvl = d(holdingAmountA).add(d(holdingAmountB)).toString()
      const depositRatio = d(vaultTvl).div(d(hardCapUSD)).mul(100).toString()
      const displayDepositRatio = symbolDataDisplayProcessing(depositRatio, '%')
      const quoteCoinPrice = getTokenPriceByPyth(quoteCoinType)
      const baseCoinPrice = getTokenPriceByPyth(baseCoinType)
      const availableCapacityUSD = d(hardCapUSD).sub(d(vaultTvl)).gt(0) ? d(hardCapUSD).sub(d(vaultTvl)).toString() : '0'
      let availableCapacityWithQuoteCoin, availableCapacityWithBaseCoin
      if (availableCapacityUSD !== '0') {
        availableCapacityWithQuoteCoin = d(availableCapacityUSD)
          .div(quoteCoinPrice || '0')
          .toString()
        availableCapacityWithBaseCoin = d(availableCapacityUSD)
          .div(baseCoinPrice || '0')
          .toString()
      } else {
        availableCapacityWithQuoteCoin = '0'
        availableCapacityWithBaseCoin = '0'
      }

      console.log('useVaultAvaiableCapacity: ', {
        hardCap,
        hardCapUSD,
        vaultTvl,
        displayHardCapUSD,
        depositRatio,
        displayDepositRatio,
        baseCoin,
        quoteCoin,
        availableCapacityWithQuoteCoin,
        availableCapacityWithBaseCoin,
        availableCapacityUSD
      })

      return {
        hardCap,
        hardCapUSD,
        vaultTvl,
        displayHardCapUSD,
        depositRatio,
        displayDepositRatio,
        baseCoin,
        quoteCoin,
        availableCapacityWithQuoteCoin,
        availableCapacityWithBaseCoin,
        availableCapacityUSD
      }
    }
    return undefined
  }, [currentVaultPool])
}
