import { FrozenPools } from '@/constant/pool'
import { DLMMPoolApiInfo, PoolApiInfo } from '@/types'
import { addApr, aprProcessing, processedAsEmissionsEveryDay } from '@/utils/api-data-utils'
import { VAULT_FILTER } from '@cetus/types/src/env'
import { Decimal, d, symbolDataDisplayProcessing } from '@cetus/utils'
import { CoinAssist, TickMath, extractStructTagFromType } from '@cetusprotocol/common-sdk'

export default function useWrapPoolData() {
  // Mining相关数据处理
  const handleMining = (pool: any) => {
    // const haveMining = !!(pool?.is_display_rewarder && (pool?.rewarder_display1 || pool?.rewarder_display2 || pool?.rewarder_display3))
    const haveMining = pool?.has_mining
    let miningAprTotal = d(0)
    const miningRewardList: any = []
    const miningAprList: any = []

    if (haveMining) {
      const rewarderOriginList = pool?.object?.rewarder_manager?.fields?.rewarders || []
      const rewarderAprArr = pool?.rewarder_apr || []
      rewarderOriginList?.forEach((item: any, index: number) => {
        const emissionsPerSecond = d(item?.fields?.emissions_per_second).mul(Decimal.pow(2, -64)).toString()
        // 过滤掉奖励释放为0的奖励
        if (pool?.[`rewarder_display${index + 1}`] && d(emissionsPerSecond).gt(0)) {
          const apr = aprProcessing(rewarderAprArr[index])
          miningAprTotal = miningAprTotal.add(apr)
          const coinType = extractStructTagFromType(item?.fields?.reward_coin?.fields?.name)?.source_address
          miningRewardList.push({
            coinType,
            emissionsEveryDay: processedAsEmissionsEveryDay(emissionsPerSecond)
          })

          miningAprList.push({
            coinType, // apr tooltip浮框里需要兼容下没有symbol的情况
            apr,
            aprDisplay: aprProcessing(apr, true)
          })
        }
      })
    }

    return {
      haveMining: haveMining && miningRewardList.length > 0,
      miningRewardList,
      miningAprList,
      miningAprTotal: miningAprTotal.toString()
    }
  }

  // Farms相关数据处理
  const handleFarms = (pool: any) => {
    const isReverse = pool?.is_forward === false
    const apiHasFarming = pool?.has_farming
    const farmsRewarderList: any = []
    let farmsPoolAddress = ''
    let farmsStatedTvl = ''
    let farmsStatedTvlDisplay = ''
    let farmingAprDisplay = ''
    let farmsEffectiveTickLower = 0
    let farmsEffectiveTickUpper = 0
    let displayFarmsEffectMinPrice = ''
    let displayFarmsEffectMaxPrice = ''
    let farmsApr = d(0)
    let haveFarming = false

    if (apiHasFarming) {
      farmsPoolAddress = pool?.stable_farming?.stable_farming_pool
      const farmsRewarderOriginList = pool?.stable_farming?.stable_rewarder

      console.log('🚀 ~ handleFarms ~ farmsRewarderOriginList:', farmsRewarderOriginList)

      farmsRewarderOriginList?.forEach((item: any, index: number) => {
        const emissionsPerSecond = d(item?.amount_second)
        if (pool?.stable_farming[`show_rewarder_${index + 1}`] && emissionsPerSecond.gt(0)) {
          haveFarming = true
          const apr = aprProcessing(item?.apr)
          farmsApr = farmsApr?.add(apr)
          farmsRewarderList.push({
            coinType: extractStructTagFromType(item.coin).source_address,
            emissionsEveryDay: emissionsPerSecond
              .mul(60 * 60 * 24)
              .toDP(2, Decimal.ROUND_HALF_UP)
              .toString()
          })
        }
      })

      farmsStatedTvl = pool?.stable_farming?.tvl
      farmsStatedTvlDisplay = symbolDataDisplayProcessing(pool?.stable_farming?.tvl, '$')
      farmingAprDisplay = symbolDataDisplayProcessing(d(farmsApr).mul(100).toString(), '%', 2, true)

      farmsEffectiveTickLower = pool?.stable_farming?.effective_tick_lower
      farmsEffectiveTickUpper = pool?.stable_farming?.effective_tick_upper

      const minPrice = TickMath.tickIndexToPrice(farmsEffectiveTickLower, pool?.coin_a?.decimals, pool?.coin_b?.decimals).toString()
      const maxPrice = TickMath.tickIndexToPrice(farmsEffectiveTickUpper, pool?.coin_a?.decimals, pool?.coin_b?.decimals).toString()

      displayFarmsEffectMinPrice = !isReverse ? minPrice : d(1).div(maxPrice).toString()
      displayFarmsEffectMaxPrice = !isReverse ? maxPrice : d(1).div(minPrice).toString()
    }

    return {
      haveFarming,
      farmsRewarderList,
      farmsApr: farmsApr.toString(),
      farmingAprDisplay,
      farmsStatedTvl,
      farmsStatedTvlDisplay,
      farmsEffectiveTickLower,
      farmsEffectiveTickUpper,
      displayFarmsEffectMinPrice,
      displayFarmsEffectMaxPrice,
      farmsPoolAddress
    }
  }

  const wrapPoolData = (pool: any, isLocalData = false): PoolApiInfo => {
    console.log('🚀🚀🚀 ~ useWrapPoolData.ts:110 ~ wrapPoolData ~ pool:', pool)
    const object = pool?.object
    const index = pool?.object?.index
    const poolAddress = pool.address
    const isReverse = pool?.is_forward === false
    const tokenA = {
      ...pool?.coin_a,
      coin_type: extractStructTagFromType(pool?.coin_a?.address)?.source_address // 为了统一pools接口和coins_info接口返回的token的地址key
    }
    const tokenB = {
      ...pool?.coin_b,
      coin_type: extractStructTagFromType(pool?.coin_b?.address)?.source_address // 为了统一pools接口和coins_info接口返回的token的地址key
    }
    const displayTokenA = !isReverse ? tokenA : tokenB
    const displayTokenB = !isReverse ? tokenB : tokenA
    const name = `${displayTokenA?.symbol} - ${displayTokenB?.symbol}`
    const feeRate = d(pool.fee).mul(10000).toString()
    const feeDisplay = d(pool.fee).mul(100).toString() + '%'
    const tickSpacing = pool?.tick_spacing

    const tvlDisplay = symbolDataDisplayProcessing(pool.pure_tvl_in_usd || 0, '$', 2, false, true)
    const volume24Display = symbolDataDisplayProcessing(pool.vol_in_usd_24h || 0, '$', 2, false, true)
    const fees24Display = symbolDataDisplayProcessing(pool.fee_24_h || 0, '$', 2, false, true)

    const feeApr = aprProcessing(pool?.apr?.fee_apr_24h)
    const feeAprDisplay = aprProcessing(pool?.apr?.fee_apr_24h, true)

    const { haveMining, miningRewardList, miningAprList, miningAprTotal } = handleMining(pool)
    const {
      haveFarming,
      farmsRewarderList,
      farmsApr,
      farmingAprDisplay,
      farmsStatedTvl,
      farmsStatedTvlDisplay,
      farmsEffectiveTickLower,
      farmsEffectiveTickUpper,
      displayFarmsEffectMinPrice,
      displayFarmsEffectMaxPrice,
      farmsPoolAddress
    } = handleFarms(pool)

    const feeAndMiningApr = addApr([feeApr, miningAprTotal])
    const feeAndMiningAprDisplay = d(feeAndMiningApr).gt(10000)
      ? '>1,000,000%'
      : symbolDataDisplayProcessing(d(feeAndMiningApr).mul(100).toString(), '%')
    const feeAndFarmsApr = addApr([feeAndMiningApr, farmsApr])
    const feeAndFarmsAprDisplay = addApr([feeApr, farmsApr], true)
    const totalAprDisplay = addApr([feeAndMiningApr, farmsApr], true)

    const isVaults = pool.is_vaults
    const vaultCategory = !isVaults && pool.vaults && pool.vaults.length > 0 && pool.show_vaults ? 'haedal' : isVaults ? 'cetus' : ''
    const vaultId = pool.show_vaults && pool.vaults && pool.vaults.length > 0 && pool.vaults[pool.vaults.length - 1]

    if (!isLocalData) {
      return {
        poolAddress,
        name,
        isReverse,
        tokenA,
        tokenB,
        displayTokenA,
        displayTokenB,
        haveMining,
        miningRewardList, // 数组中的emissionsEveryDay需要UI层用coinType拿到decimal后做精度处理再展示
        miningAprList, // 由于pools接口中没有mining coin的详细信息，所以symbol需要在UI层通过coinType获取后再做展示
        haveFarming,
        farmsRewarderList, // 只有coinType, coin详细信息需再UI层获取
        farmsApr,
        farmingAprDisplay,
        feeApr,
        feeAprDisplay,
        miningAprTotal,
        feeAndMiningAprDisplay,
        totalAprDisplay,
        fee: pool.fee,
        feeRate,
        feeDisplay,
        tvlDisplay,
        tvl: pool.pure_tvl_in_usd || 0,
        volume24Display,
        fees24Display,
        isVaults,
        farmsStatedTvl,
        farmsStatedTvlDisplay,
        feeAndFarmsApr,
        feeAndFarmsAprDisplay,
        farmsEffectiveTickLower,
        farmsEffectiveTickUpper,
        displayFarmsEffectMinPrice, // 已处理过正反向，展示的精度需在UI组件中处理，因为展示时候需要做正反向切换, 展示精度可以统一用formatNumberWithDown处理, 精度设置为6
        displayFarmsEffectMaxPrice,
        farmsPoolAddress,
        tickSpacing,
        index,
        object,
        // haveZap: pool?.extensions?.zap ? true : false
        haveZap: tokenA?.is_trusted && tokenB?.is_trusted && pool.pure_tvl_in_usd > 10000,
        // haveZap: tokenA?.is_verified && tokenB?.is_verified,
        vaultCategory,
        vaultId
      }
    } else {
      // 本地数据涉及到统计信息的全部设置为null或者'--', 具体展示UI自行处理
      return {
        poolAddress,
        name,
        isReverse,
        tokenA,
        tokenB,
        displayTokenA,
        displayTokenB,
        haveMining,
        miningRewardList: null,
        miningAprList: null,
        haveFarming,
        farmsRewarderList: null,
        farmsApr: '--',
        farmingAprDisplay: '--',
        feeApr: '--',
        feeAprDisplay: '--',
        miningAprTotal: '--',
        feeAndMiningAprDisplay: '--',
        totalAprDisplay: '--',
        feeRate,
        fee: pool.fee,
        feeDisplay,
        tvlDisplay: '--',
        tvl: '--',
        volume24Display: '--',
        fees24Display: '--',
        isVaults,
        isLocalData, // 走本地数据时为true
        farmsStatedTvl: '--',
        farmsStatedTvlDisplay: '--',
        feeAndFarmsApr: '--',
        feeAndFarmsAprDisplay: '--',
        farmsEffectiveTickLower,
        farmsEffectiveTickUpper,
        displayFarmsEffectMinPrice,
        displayFarmsEffectMaxPrice,
        farmsPoolAddress,
        tickSpacing,
        index,
        object,
        haveZap: tokenA?.is_trusted && tokenB?.is_trusted && pool.pure_tvl_in_usd > 10000,
        vaultCategory,
        vaultId
      }
    }
  }

  const handleFarmsV2 = (pool: any) => {
    const { farmingRewarder, showReverse } = pool
    if (!farmingRewarder) {
      return {
        displayFarmsEffectMinPrice: '',
        displayFarmsEffectMaxPrice: '',
        farmsApr: '0',
        farmingAprDisplay: '0',
        farmsEffectiveTickLower: 0,
        farmsEffectiveTickUpper: 0,
        farmsPoolAddress: '',
        farmsRewarderList: [],
        farmsStatedTvl: '',
        farmsStatedTvlDisplay: '',
        haveFarming: false
      }
    }
    const { effectiveTickLower, effectiveTickUpper, rewarderCoins, tvl } = farmingRewarder
    const minPrice = TickMath.tickIndexToPrice(effectiveTickLower, pool?.coinA?.decimals, pool?.coinB?.decimals).toString()
    const maxPrice = TickMath.tickIndexToPrice(effectiveTickUpper, pool?.coinA?.decimals, pool?.coinB?.decimals).toString()

    const displayFarmsEffectMinPrice = !showReverse ? minPrice : d(1).div(maxPrice).toString()
    const displayFarmsEffectMaxPrice = !showReverse ? maxPrice : d(1).div(minPrice).toString()
    let apr = d(0)
    rewarderCoins.forEach((item: any) => {
      apr = apr.add(item?.apr)
    })
    const farmsApr = apr.toString()
    const farmingAprDisplay = symbolDataDisplayProcessing(apr.mul(100).toString(), '%', 2, true)
    const farmsPoolAddress = farmingRewarder.farmingPool
    const farmsStatedTvl = farmingRewarder.tvl
    const farmsStatedTvlDisplay = symbolDataDisplayProcessing(farmsStatedTvl, '$')
    const farmsRewarderList: any = []
    rewarderCoins.forEach((item: any) => {
      if (d(item?.emissionsPerSecond).gt(0)) {
        farmsRewarderList.push({
          coinType: extractStructTagFromType(item?.coinType).source_address,
          emissionsEveryDay: d(item?.emissionsPerSecond)
            .mul(60 * 60 * 24)
            .toDP(2, Decimal.ROUND_HALF_UP)
            .toString()
        })
      }
    })

    return {
      displayFarmsEffectMinPrice,
      displayFarmsEffectMaxPrice,
      farmsApr,
      farmingAprDisplay,
      farmsEffectiveTickLower: effectiveTickLower,
      farmsEffectiveTickUpper: effectiveTickUpper,
      farmsPoolAddress,
      farmsRewarderList,
      farmsStatedTvl,
      farmsStatedTvlDisplay,
      haveFarming: farmsRewarderList.length > 0
    }
  }

  const handleMingV2 = (pool: any) => {
    const { miningRewarders, showReverse } = pool
    if (!miningRewarders) {
      return {
        miningAprTotal: 0,
        miningRewardList: [],
        haveMining: false,
        miningAprList: []
      }
    }
    let apr = d(0)
    const miningRewardList: any = []
    const miningAprList: any = []
    miningRewarders.forEach((item: any) => {
      apr = apr.add(item?.apr)
      const isSuiCoin = CoinAssist.isSuiCoin(item?.coinType || '')
      if (item.display && d(item?.emissionsPerSecond).gt(0)) {
        miningRewardList.push({
          coinType: extractStructTagFromType(item?.coinType).source_address,
          emissionsEveryDay: d(item?.emissionsPerSecond)
            .mul(10 ** item.decimals)
            .mul(60 * 60 * 24)
            .toDP(2, Decimal.ROUND_HALF_UP)
            .toString(),
          sort: isSuiCoin ? 1 : 0 // 2025/05/13 产品需求 池子有sui的奖励，可默认token都在最后一列展示
        })
        miningAprList.push({
          coinType: extractStructTagFromType(item?.coinType).source_address,
          apr: item?.apr,
          aprDisplay: aprProcessing(item?.apr, true, false, true)
        })
      }
    })
    return {
      miningAprTotal: apr.toString(),
      miningRewardList: miningRewardList.sort((a: any, b: any) => a.sort - b.sort),
      haveMining: miningRewardList.length > 0,
      miningAprList
    }
  }

  const handleVaultsV2 = (pool: any) => {
    const { vault, pool: poolId } = pool
    if (!vault) {
      return {
        isUnstableVault: false,
        isVault: false,
        vaultId: '',
        vaultCategory: ''
      }
    }

    vault.display = VAULT_FILTER ? vault.display : true
    const { category, id, display } = vault
    const isUnstableVault = category === 'haedal'
    const isVaults = category === 'cetus'
    let vaultId = id

    // showVaults = 1 池子列表不显示vaults入口
    return { isUnstableVault, isVaults, vaultId, vaultCategory: display ? category : '' }
  }

  const wrapPoolDataV2 = (pool: any, isLocalData = false): PoolApiInfo => {
    const { showReverse, feeRate, stats, tvl, pool: poolAddress, extensions } = pool
    const {
      displayFarmsEffectMinPrice,
      displayFarmsEffectMaxPrice,
      farmingAprDisplay,
      farmsApr,
      farmsEffectiveTickLower,
      farmsEffectiveTickUpper,
      farmsPoolAddress,
      farmsRewarderList,
      farmsStatedTvl,
      farmsStatedTvlDisplay,
      haveFarming
    } = handleFarmsV2(pool)
    const tokenA = {
      ...pool?.coinA,
      coin_type: extractStructTagFromType(pool?.coinA?.coinType)?.full_address,
      logo_url: pool?.coinA?.logoURL,
      address: pool?.coinA?.coinType,
      is_trusted: pool?.coinA?.isVerified
    }
    const tokenB = {
      ...pool?.coinB,
      coin_type: extractStructTagFromType(pool?.coinB?.coinType)?.full_address,
      logo_url: pool?.coinB?.logoURL,
      address: pool?.coinB?.coinType,
      is_trusted: pool?.coinB?.isVerified
    }
    const displayTokenA = !showReverse ? tokenA : tokenB
    const displayTokenB = !showReverse ? tokenB : tokenA
    const fee = d(feeRate)
      .div(10 ** 6)
      .toString()

    const { miningAprTotal, miningRewardList, haveMining, miningAprList } = handleMingV2(pool)
    const feeApr = stats?.filter((item: any) => item.dateType === '24H')[0]?.apr
    const feeApr7d = stats?.filter((item: any) => item.dateType === '7D')[0]?.apr
    const feeApr30d = stats?.filter((item: any) => item.dateType === '30D')[0]?.apr
    const fees24 = stats?.filter((item: any) => item.dateType === '24H')[0]?.fee
    const feeAndFarmsApr = addApr([feeApr, farmsApr])
    const feeAndFarmsAprDisplay = addApr([feeApr, farmsApr], true)
    const feeAndMiningAprDisplay = addApr([feeApr, miningAprTotal], true)
    const feeAprDisplay = aprProcessing(feeApr, true)
    // const feeDisplay = aprProcessing(fee, true)
    const feeDisplay = d(fee).mul(100).toString() + '%'
    const fees24Display = symbolDataDisplayProcessing(fees24, '$')
    const feeAndMiningApr = addApr([feeApr, miningAprTotal])
    const totalAprDisplay = addApr([feeAndMiningApr, farmsApr], true)
    const haveZap = tokenA?.isVerified && tokenB?.isVerified && d(tvl).gt(10000)

    const { vaultCategory, vaultId, isVaults } = handleVaultsV2(pool)

    const tvlDisplay = symbolDataDisplayProcessing(pool.tvl || 0, '$', 2, false, true)
    const volume24Display = symbolDataDisplayProcessing(stats?.filter((item: any) => item.dateType === '24H')[0]?.vol || 0, '$', 2, false, true)
    const volume7Display = symbolDataDisplayProcessing(stats?.filter((item: any) => item.dateType === '7D')[0]?.vol || 0, '$', 2, false, true)

    if (!isLocalData) {
      return {
        displayFarmsEffectMinPrice,
        displayFarmsEffectMaxPrice,
        displayTokenA,
        displayTokenB,
        farmsEffectiveTickLower,
        farmsEffectiveTickUpper,
        farmsApr,
        farmingAprDisplay,
        farmsPoolAddress,
        farmsRewarderList,
        farmsStatedTvl,
        farmsStatedTvlDisplay,
        fee,
        feeApr,
        feeApr7d,
        feeApr30d,
        feeAprDisplay,
        feeAndFarmsApr,
        feeAndFarmsAprDisplay,
        feeAndMiningAprDisplay,
        feeDisplay,
        feeRate: d(feeRate).div(100).toString(),
        haveFarming,
        haveZap,
        isReverse: showReverse,
        vaultCategory,
        vaultId,
        haveMining,
        miningRewardList,
        miningAprList,
        miningAprTotal: miningAprTotal.toString(),
        name: `${displayTokenA?.symbol} - ${displayTokenB?.symbol}`,
        poolAddress,
        poolId: poolAddress,
        tokenA,
        tokenB,
        totalAprDisplay,
        tvl,
        tvlDisplay,
        volume24Display,
        volume7Display,
        fees24Display,
        isVaults: isVaults as boolean,
        isFrozen: FrozenPools.includes(poolAddress),
        poolType: 'clmm'
      }
    } else {
      // 本地数据涉及到统计信息的全部设置为null或者'--', 具体展示UI自行处理
      return {
        poolAddress,
        poolId: poolAddress,
        name: `${displayTokenA?.symbol} - ${displayTokenB?.symbol}`,
        isReverse: showReverse,
        tokenA,
        tokenB,
        displayTokenA,
        displayTokenB,
        haveMining,
        miningRewardList: null,
        miningAprList: null,
        haveFarming,
        farmsRewarderList: null,
        farmsApr: '--',
        farmingAprDisplay: '--',
        feeApr: '--',
        feeApr7d: '--',
        feeApr30d: '--',
        feeAprDisplay: '--',
        miningAprTotal: '--',
        feeAndMiningAprDisplay: '--',
        totalAprDisplay: '--',
        feeRate: d(feeRate).div(100).toString(),
        fee: pool.fee,
        feeDisplay,
        tvlDisplay: '--',
        tvl: '--',
        volume24Display: '--',
        volume7Display: '--',
        fees24Display: '--',
        isVaults: isVaults as boolean,
        isLocalData, // 走本地数据时为true
        farmsStatedTvl: '--',
        farmsStatedTvlDisplay: '--',
        feeAndFarmsApr: '--',
        feeAndFarmsAprDisplay: '--',
        farmsEffectiveTickLower,
        farmsEffectiveTickUpper,
        displayFarmsEffectMinPrice,
        displayFarmsEffectMaxPrice,
        farmsPoolAddress,
        haveZap: tokenA?.is_trusted && tokenB?.is_trusted && pool.pure_tvl_in_usd > 10000,
        vaultCategory,
        vaultId,
        isFrozen: FrozenPools.includes(poolAddress),
        poolType: 'clmm'
      }
    }
  }

  const wrapDLmmPoolData = (pool: any, isLocalData = false): DLMMPoolApiInfo => {
    const { showReverse, stats, tvl, pool: poolAddress, extensions, baseFeeRate, protocolFeeRate } = pool
    const {
      displayFarmsEffectMinPrice,
      displayFarmsEffectMaxPrice,
      farmingAprDisplay,
      farmsApr,
      farmsEffectiveTickLower,
      farmsEffectiveTickUpper,
      farmsPoolAddress,
      farmsRewarderList,
      farmsStatedTvl,
      farmsStatedTvlDisplay,
      haveFarming
    } = handleFarmsV2(pool)
    const tokenA = {
      ...pool?.coinA,
      coin_type: extractStructTagFromType(pool?.coinA?.coinType)?.full_address,
      logo_url: pool?.coinA?.logoURL,
      address: pool?.coinA?.coinType,
      is_trusted: pool?.coinA?.isVerified
    }
    const tokenB = {
      ...pool?.coinB,
      coin_type: extractStructTagFromType(pool?.coinB?.coinType)?.full_address,
      logo_url: pool?.coinB?.logoURL,
      address: pool?.coinB?.coinType,
      is_trusted: pool?.coinB?.isVerified
    }
    const displayTokenA = !showReverse ? tokenA : tokenB
    const displayTokenB = !showReverse ? tokenB : tokenA
    const fee = baseFeeRate

    const { miningAprTotal, miningRewardList, haveMining, miningAprList } = handleMingV2(pool)
    const feeApr = stats?.filter((item: any) => item.dateType === '24H')[0]?.apr
    const feeApr7d = stats?.filter((item: any) => item.dateType === '7D')[0]?.apr
    const feeApr30d = stats?.filter((item: any) => item.dateType === '30D')[0]?.apr
    const fees24 = stats?.filter((item: any) => item.dateType === '24H')[0]?.fee
    const feeAndFarmsApr = addApr([feeApr, farmsApr])
    const feeAndFarmsAprDisplay = addApr([feeApr, farmsApr], true)
    const feeAndMiningAprDisplay = addApr([feeApr, miningAprTotal], true)
    const feeAprDisplay = aprProcessing(feeApr, true)
    // const feeDisplay = aprProcessing(fee, true)
    const feeDisplay = d(fee).mul(100).toString() + '%'
    const fees24Display = symbolDataDisplayProcessing(fees24, '$')
    const feeAndMiningApr = addApr([feeApr, miningAprTotal])
    const totalAprDisplay = addApr([feeAndMiningApr, farmsApr], true)
    const haveZap = tokenA?.isVerified && tokenB?.isVerified && d(tvl).gt(10000)

    const { vaultCategory, vaultId, isVaults } = handleVaultsV2(pool)

    const tvlDisplay = symbolDataDisplayProcessing(pool.tvl || 0)
    const volume24Display = symbolDataDisplayProcessing(stats?.filter((item: any) => item.dateType === '24H')[0]?.vol || 0)
    const volume7Display = symbolDataDisplayProcessing(stats?.filter((item: any) => item.dateType === '7D')[0]?.vol || 0)

    if (!isLocalData) {
      return {
        binStep: pool?.binStep,
        displayFarmsEffectMinPrice,
        displayFarmsEffectMaxPrice,
        displayTokenA,
        displayTokenB,
        farmsEffectiveTickLower,
        farmsEffectiveTickUpper,
        farmsApr,
        farmingAprDisplay,
        farmsPoolAddress,
        farmsRewarderList,
        farmsStatedTvl,
        farmsStatedTvlDisplay,
        fee,
        feeApr,
        feeApr7d,
        feeApr30d,
        feeAprDisplay,
        feeAndFarmsApr,
        feeAndFarmsAprDisplay,
        feeAndMiningAprDisplay,
        feeDisplay,
        feeRate: fee,
        protocolFeeRate,
        haveFarming,
        haveZap,
        isReverse: showReverse,
        vaultCategory,
        vaultId,
        haveMining,
        miningRewardList,
        miningAprList,
        miningAprTotal: miningAprTotal.toString(),
        name: `${displayTokenA?.symbol} - ${displayTokenB?.symbol}`,
        poolAddress,
        poolId: poolAddress,
        id: poolAddress,
        tokenA,
        tokenB,
        totalAprDisplay,
        totalApr: pool?.totalApr,
        tvl,
        tvlDisplay,
        volume24Display,
        volume7Display,
        fees24Display,
        isVaults: isVaults as boolean,
        isFrozen: FrozenPools.includes(poolAddress),
        poolType: 'dlmm',
        createTimestamp: Number(pool?.createTimestamp || 0)
      }
    } else {
      // 本地数据涉及到统计信息的全部设置为null或者'--', 具体展示UI自行处理
      return {
        binStep: pool?.binStep,
        poolAddress,
        poolId: poolAddress,
        id: poolAddress,
        name: `${displayTokenA?.symbol} - ${displayTokenB?.symbol}`,
        isReverse: showReverse,
        tokenA,
        tokenB,
        displayTokenA,
        displayTokenB,
        haveMining,
        miningRewardList: null,
        miningAprList: null,
        haveFarming,
        farmsRewarderList: null,
        farmsApr: '--',
        farmingAprDisplay: '--',
        feeApr: '--',
        feeApr7d: '--',
        feeApr30d: '--',
        feeAprDisplay: '--',
        miningAprTotal: '--',
        feeAndMiningAprDisplay: '--',
        totalAprDisplay: '--',
        feeRate: fee,
        protocolFeeRate,
        fee: pool.fee,
        feeDisplay,
        tvlDisplay: '--',
        tvl: '--',
        volume24Display: '--',
        volume7Display: '--',
        fees24Display: '--',
        isVaults: isVaults as boolean,
        isLocalData, // 走本地数据时为true
        farmsStatedTvl: '--',
        farmsStatedTvlDisplay: '--',
        feeAndFarmsApr: '--',
        feeAndFarmsAprDisplay: '--',
        farmsEffectiveTickLower,
        farmsEffectiveTickUpper,
        displayFarmsEffectMinPrice,
        displayFarmsEffectMaxPrice,
        farmsPoolAddress,
        haveZap: tokenA?.is_trusted && tokenB?.is_trusted && pool.pure_tvl_in_usd > 10000,
        vaultCategory,
        vaultId,
        isFrozen: FrozenPools.includes(poolAddress),
        poolType: 'dlmm',
        createTimestamp: 0
      }
    }
  }

  return {
    wrapPoolData,
    wrapPoolDataV2,
    wrapDLmmPoolData
  }
}
