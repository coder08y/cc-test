import { VaultApiInfo } from '@/types/vaults'
import { Decimal, d, formatNumberWithDown, formatNumberWithThreshold } from '@cetus/utils'
import { useMemo } from 'react'

/**
 * 计算变更 lp 的 持仓占比
 * @param changeLp
 * @param totalLp
 * @returns
 */
export function useCalculateChangeLpRate(changeLp?: string, totalLp?: string) {
  const lpRate = useMemo(() => {
    if (changeLp && totalLp) {
      if (d(totalLp).eq(0)) {
        return '100%'
      }

      return `${formatNumberWithThreshold(d(changeLp).div(d(changeLp).add(totalLp)).mul(100).toString(), 2, 6)}%`
    }
    return '0%'
  }, [changeLp, totalLp])

  return { lpRate }
}

/**
 * 计算滑点数量
 * @param slippage
 * @param amount
 * @param isUp
 * @returns
 */
export function useCalculateSlippageAmount(slippage: number, amount?: string, isUp: boolean = false) {
  const amountLimit = useMemo(() => {
    if (amount) {
      return d(amount)
        .mul(isUp ? 1 + slippage : 1 - slippage)
        .toString()
    }
    return undefined
  }, [amount, slippage, isUp])

  return { amountLimit }
}

// export function useContractVault(vaultsId?: string) {
//   const { contractVaultObj } = useUnstableVaultsListStore()

//   // 合约vaults 信息
//   const contractVault = useMemo(() => {
//     if (vaultsId) {
//       return contractVaultObj[vaultsId]
//     }
//     return undefined
//   }, [contractVaultObj, vaultsId])

//   return { contractVault }
// }

// export function useContractClmmInfo(poolAddress?: string) {
//   const { contractClmmPoolObj } = useUnstableVaultsListStore()

//   const contractClmmInfo = useMemo(() => {
//     if (poolAddress) {
//       return contractClmmPoolObj[poolAddress]
//     }
//     return undefined
//   }, [contractClmmPoolObj, poolAddress])

//   return { contractClmmInfo }
// }

export function useGetSuiStakeProtocol(coinType?: string) {
  const stakeProtocolName = useMemo(() => {
    if (coinType) {
      if (coinType.includes('HASUI')) {
        return 'Haedal'
      }

      if (coinType.includes('AFSUI')) {
        return 'Aftermath'
      }
      if (coinType.includes('CERT')) {
        return 'Volo'
      }
    }
    return undefined
  }, [coinType])

  return { stakeProtocolName }
}

export function useGetRewardPeDay(balanceFormat?: string, apiInfo?: VaultApiInfo) {
  const rewardPerA = useMemo(() => {
    if (apiInfo && balanceFormat) {
      return `${formatNumberWithDown(d(apiInfo.amountPerLpA).mul(balanceFormat).toFixed(18, Decimal.ROUND_DOWN), apiInfo.displayTokenA.decimals)}  ${apiInfo?.displayTokenA.symbol}`
    }
    return undefined
  }, [apiInfo?.amountPerLpA, balanceFormat])

  const rewardPerB = useMemo(() => {
    if (apiInfo && balanceFormat) {
      return `${formatNumberWithDown(d(apiInfo.amountPerLpB).mul(balanceFormat).toFixed(18, Decimal.ROUND_DOWN), apiInfo.displayTokenB.decimals)}  ${apiInfo?.displayTokenB.symbol}`
    }
    return undefined
  }, [apiInfo?.amountPerLpB, balanceFormat])

  return { rewardPerA, rewardPerB }
}
