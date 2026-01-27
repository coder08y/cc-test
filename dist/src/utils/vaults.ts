import { VaultApiInfo, VaultBaseInfo, VaultStatItem } from '@/types/vaults'

export function formatVaultApiInfo(baseInfo: VaultBaseInfo, statsItem?: VaultStatItem): VaultApiInfo {
  return {
    ...baseInfo,
    vaultsTvl: statsItem?.vaultsTvl || '--',
    vaultsTvlDisplay: statsItem?.vaultsTvlDisplay || '--',
    vaultsApy: statsItem?.vaultsApy || '--',
    vaultsApyDisplay: statsItem?.vaultsApyDisplay || '--',
    vaultsTotalApy: statsItem?.vaultsTotalApy || '--',
    vaultsTotalApyDisplay: statsItem?.vaultsTotalApyDisplay || '--',
    vaultsLstApy: statsItem?.vaultsLstApy || '--',
    vaultsLstApyDisplay: statsItem?.vaultsLstApyDisplay || '--',
    vaultsApr: statsItem?.vaultsApr || '--',
    vaultsAprDisplay: statsItem?.vaultsAprDisplay || '--',
    vaultsId: statsItem?.vaultsId || '',
    clmmPoolAddress: statsItem?.clmmPoolAddress || '',
    amountPerLpA: statsItem?.amountPerLpA || '0',
    amountPerLpB: statsItem?.amountPerLpB || '0',
    category: statsItem?.category || '',
    hardCapUSD: statsItem?.hardCapUSD || '--',
    depositRatioDisplay: statsItem?.depositRatioDisplay || '--',
    depositRatio: statsItem?.depositRatio || 0,
    lpTokenType: statsItem?.lpTokenType || ''
  }
}
