import { VaultVestRedeemPayloadParams } from '@/types/vest'
import { useSdk } from '@cetus/sdk-factory'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { Transaction } from '@mysten/sui/transactions'

export default function useVaultRedeem() {
  const vaultSdk = useSdk('vaults')
  const { volatileVaultsSdk } = usePeripherySDKStore()

  const getVaultRedeemPayload = async (params: VaultVestRedeemPayloadParams[], haedalParams: VaultVestRedeemPayloadParams[], tx: Transaction) => {
    console.log('🚀🚀🚀 ~ useVaultRedeem.ts:8 ~ getVaultRedeemPayload ~ params:', params)
    const options = params.map(item => {
      const { vaultId, vestingNftId, period, coinTypeA, coinTypeB } = item
      return {
        vault_id: vaultId,
        vesting_nft_id: vestingNftId,
        period,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB
      }
    })
    const haedalOptions = haedalParams.map(item => {
      const { vaultId, vestingNftId, vestCoinType, period, coinTypeA, coinTypeB } = item
      return {
        vault_id: vaultId,
        vesting_nft_id: vestingNftId,
        period,
        coin_type_a: coinTypeA,
        coin_type_b: coinTypeB
      }
    })
    if (options.length > 0) {
      await vaultSdk?.Vest.buildRedeemPayload(options, tx)
    }
    console.log('🚀🚀🚀 ~ useVaultRedeem.ts:38 ~ getVaultRedeemPayload ~ haedalOptions:', JSON.stringify(haedalOptions))
    if (haedalOptions.length > 0) {
      await volatileVaultsSdk?.Vest.buildRedeemPayload(haedalOptions, tx)
    }
    return {
      params: options?.length > 0 ? options : haedalOptions,
      type: options?.length > 0 ? 'vaults' : 'haedalVaults'
    }
  }
  return { getVaultRedeemPayload }
}
