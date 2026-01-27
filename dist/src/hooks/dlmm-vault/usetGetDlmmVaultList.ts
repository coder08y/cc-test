import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'

export default function useGetDlmmVaultList() {
  const { volatileVaultsSdk } = usePeripherySDKStore()

  const getDlmmVaultList = async () => {
    const { data } = await volatileVaultsSdk?.VaultsV2.getPoolList()
    const dlmmVaultList = data.map((item: any) => {
      return {
        apr: '',
        apy: '',
        category: 'haevault_v2',
        dlmm_pool: item.markets[0].position_list[0].position.pool_id,
        dlmm_position_id: '',
        coin_type_a: item.coin_type_a,
        coin_type_b: item.coin_type_b,
        display: true,
        fee_rate: '',
        hard_cap_usd: '',
        id: item.id,
        lp_type: item.lp_token_type,
        lst_apy: '',
        quote_type: item.quote_type,
        show_reverse: true,
        total_supply: '',
        tvl: ''
      }
    })
    return dlmmVaultList
  }
  return { getDlmmVaultList }
}
