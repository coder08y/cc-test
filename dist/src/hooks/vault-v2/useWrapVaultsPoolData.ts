import { FrozenPools } from '@/constant/pool'
import { vaultsMaps } from '@/constant/vaults'
import { d, formatCurrency, symbolDataDisplayProcessing } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { isValidSuiAddress } from '@mysten/sui/utils'

export default function useWrapVaultsPoolData() {
  const wrapVaultsPoolData = (vaultsPool: any, clmmPoolList: any[], dlmmPoolList: any[], isLocalData = false) => {
    console.log('🚀🚀🚀 ~ useWrapVaultsPoolData.ts:8 ~ wrapVaultsPoolData ~ vaultsPool:', vaultsPool)
    const defaultApiPool = clmmPoolList.length > 0 ? clmmPoolList[0] : dlmmPoolList[0]
    const { category, hard_cap_usd, tvl, quote_type } = vaultsPool
    const { displayTokenA, displayTokenB, feeDisplay, isReverse, tokenA, tokenB, quoteType } = isLocalData ? vaultsPool : defaultApiPool
    const status = vaultsPool?.sunset ? 'sunset' : vaultsPool?.hard_cap_usd > 0 && vaultsPool?.hard_cap_usd <= 1 ? 'sunsetSoon' : 'active'
    console.log('🚀🚀🚀 ~ useWrapVaultsPoolData.ts:12 ~ wrapVaultsPoolData ~ status:', status)
    const tvlDisplay = symbolDataDisplayProcessing(vaultsPool.tvl || 0)
    const vaultsApyDisplay = symbolDataDisplayProcessing(category == 'cetus' ? vaultsPool.apr * 100 : vaultsPool.apy * 100, '%')
    const vaultsLstApyDisplay = symbolDataDisplayProcessing(vaultsPool.lst_apy * 100, '%')
    const vaultsAprDisplay = symbolDataDisplayProcessing(vaultsPool.apr * 100, '%')
    const vaultsTvlDisplay = symbolDataDisplayProcessing(tvl, '$')
    const hardCapUsdDisplay = formatCurrency(hard_cap_usd, 2)
    const vaultsTotalApy =
      vaultsPool.category == 'cetus' ? d(vaultsPool?.apy).add(d(vaultsPool.lst_apy)).mul(100).toString() : d(vaultsPool.apy).mul(100).toString()
    const vaultsTotalApyDisplay = symbolDataDisplayProcessing(vaultsTotalApy, '%')
    // Earnings处理
    const disPlayCoinAB = [fixCoinType(displayTokenA?.coin_type, false), fixCoinType(displayTokenB?.coin_type, false)]

    const farmingRewardsSet = new Set()
    const miningRewardsSet = new Set()
    clmmPoolList.forEach((clmmPool: any) => {
      clmmPool?.farmsRewarderList?.forEach((fItem: any) => farmingRewardsSet.add(fixCoinType(fItem?.coinType, false)))
      clmmPool?.miningRewardList?.forEach((mItem: any) => miningRewardsSet.add(fixCoinType(mItem?.coinType, false)))
    })
    dlmmPoolList.forEach((dlmmPool: any) => {
      dlmmPool?.farmsRewarderList?.forEach((fItem: any) => farmingRewardsSet.add(fixCoinType(fItem?.coinType, false)))
      dlmmPool?.miningRewardList?.forEach((mItem: any) => miningRewardsSet.add(fixCoinType(mItem?.coinType, false)))
    })

    const vaultsRewards =
      status == 'sunset' ? [] : Array.from(new Set([...disPlayCoinAB, ...Array.from(farmingRewardsSet), ...Array.from(miningRewardsSet)]))
    // 列表进度条
    const depositRatio = d(hard_cap_usd).gt(0) ? d(tvl).div(hard_cap_usd).mul(100).toString() : 0
    const depositRatioDisplay = symbolDataDisplayProcessing(depositRatio || 0, '%')
    const clmmPoolAddress = isLocalData ? vaultsPool.clmmPoolAddress : clmmPoolList.map((clmmPool: any) => clmmPool.poolAddress)
    const dlmmPoolAddress = isLocalData ? vaultsPool.dlmmPoolAddress : dlmmPoolList.map((dlmmPool: any) => dlmmPool.poolAddress)
    // LP Token Type
    const lpTokenType = vaultsPool.category == 'cetus' ? vaultsMaps[vaultsPool.id]?.lpToken?.coin_type : vaultsPool.lp_type || vaultsPool.lpTokenType
    const hardCapUSD = vaultsPool?.hard_cap_usd

    const haveFarming = vaultsPool?.haedal_farm?.rewards?.filter((item: any) => Number(item?.day_release) > 0)?.length > 0
    const vaultId = isLocalData ? vaultsPool.vaultId : vaultsPool.id
    const categoryFinal = category === 'cetus' ? 'cetus' : vaultsPool?.version === 'V2' ? 'haevault_v2' : 'haedal'
    return {
      tokenA,
      tokenB,
      displayTokenA,
      displayTokenB,
      binStep: defaultApiPool?.binStep,
      fee: defaultApiPool?.fee,
      feeDisplay,
      vaultsTvl: isLocalData ? '--' : tvl,
      tvlDisplay: isLocalData ? '--' : tvlDisplay,
      vaultsTvlDisplay: isLocalData ? '--' : vaultsTvlDisplay,
      vaultsApyDisplay: isLocalData ? '--' : status == 'sunset' ? '0%' : vaultsApyDisplay,
      vaultsAprDisplay: isLocalData ? '--' : status == 'sunset' ? '0%' : vaultsAprDisplay,
      vaultsLstApyDisplay: isLocalData ? '--' : vaultsLstApyDisplay,
      vaultsTotalApy: isLocalData ? '--' : status == 'sunset' ? '0' : vaultsTotalApy,
      vaultsTotalApyDisplay: isLocalData ? '--' : status == 'sunset' ? '0%' : vaultsTotalApyDisplay,
      vaultsRewards: isLocalData ? vaultsPool.vaultsRewards : vaultsRewards,
      category: categoryFinal,
      depositRatio,
      depositRatioDisplay,
      vaultId,
      clmmPoolAddress,
      dlmmPoolAddress,
      hardCapUsdDisplay,
      lpTokenType,
      hardCapUSD,
      isReverse,
      isFrozen: FrozenPools.includes(clmmPoolAddress),
      quoteType: isLocalData ? quoteType : quote_type || defaultApiPool?.quote_type,
      status,
      sunsetTime: vaultsPool?.sunset,
      version: vaultsPool?.version,
      haveFarming,
      poolCount: (clmmPoolAddress?.length || 0) + (dlmmPoolAddress?.length || 0),
      liquidity_pools: vaultsPool?.liquidity_pools,
      migrate_target_vault: isValidSuiAddress(vaultsPool?.migrate_target_vault) ? vaultsPool?.migrate_target_vault : undefined
    }
  }
  return {
    wrapVaultsPoolData
  }
}
