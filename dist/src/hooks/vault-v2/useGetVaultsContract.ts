import useVaultsPoolStore from '@/store/vaults-v2/useVaultsPool'
import useVaultsPoolContract from '@/store/vaults-v2/useVaultsPoolContract'
import { calcCoinProportion } from '@/utils/pool'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { fromDecimalsAmountFix, symbolDataDisplayProcessing } from '@cetus/utils'
import { ClmmPoolUtil, TickMath, d, fixCoinType, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinUtils, DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { Pool } from '@cetusprotocol/sui-clmm-sdk'
import BN from 'bn.js'
import { CLMMMarketPosition, DLMMMarketPosition, VaultMarket, VaultPool, getAmountBalanceByLpAmount, getShareBufferAssets } from 'haedal-vault-sdk'

export default function useGetVaultsContract() {
  const { volatileVaultsSdk } = usePeripherySDKStore()
  const vaultsSdk = useSdk('vaults')
  const {
    setLstVaultContractInfoObj,
    setHaedalVaultContractInfoObj,
    setVaultClmmPoolContractInfoObj,
    setDlmmVaultContractInfoObj,
    setVaultDlmmPoolContractInfoObj
  } = useVaultsPoolContract()
  const { setVaultsPoolObj } = useVaultsPoolStore()
  const { getTokenInfo } = useGetToken()

  const getVaultsContractInfo = async (list: any[]) => {
    console.log('🚀🚀🚀 ~ useGetVaultsContract.ts:26 ~ getVaultsContractInfo ~ list:', list)
    console.log('开始执行时间1', new Date().getTime())
    const lstVault: string[] = []
    const haedalVault: string[] = []
    const dlmmVault: string[] = []
    const vaultClmmPoolAddressList: string[] = []
    const vaultDlmmPoolAddressList: string[] = []
    const lsdClmmPoolAddressList: string[] = []
    // 这里还可以优化同一个请求里拿全部的object信息
    // 分类Cetus Vault ID列表、Haedal Vault ID列表、CLMM Pool地址列表 以便于通过一个rpc请求拿到这些数据
    list.forEach(item => {
      if (item.category == 'cetus') {
        lstVault.push(item.vaultId)
        lsdClmmPoolAddressList.push(...item.clmmPoolAddress)
      } else if (item.category == 'haedal') {
        haedalVault.push(item.vaultId)
        vaultClmmPoolAddressList.push(...item.clmmPoolAddress)
      } else if (item.category == 'haevault_v2') {
        dlmmVault.push(item.vaultId)
        if (item.clmmPoolAddress) {
          vaultClmmPoolAddressList.push(...item.clmmPoolAddress)
        }
        if (item.dlmmPoolAddress) {
          vaultDlmmPoolAddressList.push(...item.dlmmPoolAddress)
        }
      }
    })
    console.log('🚀🚀🚀 ~ useGetVaultsContract.ts:38 ~ getVaultsContractInfo ~ lstVault:', {
      lstVault,
      haedalVault,
      dlmmVault,
      vaultClmmPoolAddressList,
      lsdClmmPoolAddressList,
      vaultDlmmPoolAddressList
    })

    let lstVaultContractInfoObj: any = {}
    let haedalVaultContractInfoObj: any = {}
    let dlmmVaultContractInfoObj: any = {}
    let allClmmPoolContractInfoObj: any = {}
    let allDlmmPoolContractInfoObj: any = {}

    // 获取Cetus Vault合约信息列表
    if (lstVault.length > 0) {
      const lstVaultContractInfos = await vaultsSdk!.Vaults.getAssignVaultList(lstVault)
      // 将Cetus Vault合约信息列表转换为对象
      lstVaultContractInfoObj = lstVaultContractInfos.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr
        return acc
      }, {})
      setLstVaultContractInfoObj(lstVaultContractInfoObj)
    }

    if (haedalVault.length > 0) {
      const haedalVaultContractInfos = await volatileVaultsSdk.Vaults.getAssignPoolList(haedalVault)
      // 将Haedal Vault合约信息列表转换为对象
      haedalVaultContractInfoObj = haedalVaultContractInfos.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr
        return acc
      }, {})
      setHaedalVaultContractInfoObj(haedalVaultContractInfoObj)
    }

    if (dlmmVault.length > 0) {
      const dlmmVaultContractInfos = await volatileVaultsSdk.VaultsV2.getAssignPoolList(dlmmVault)
      // 将DLMM Vault合约信息列表转换为对象
      dlmmVaultContractInfoObj = dlmmVaultContractInfos.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr
        return acc
      }, {})
      setDlmmVaultContractInfoObj(dlmmVaultContractInfoObj)
    }

    if (lsdClmmPoolAddressList.length > 0) {
      const allClmmPoolContractInfos = await vaultsSdk!.ClmmSDK.Pool.getAssignPools(lsdClmmPoolAddressList)
      // 将CLMM Pool合约信息列表转换为对象
      const obj = allClmmPoolContractInfos.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr
        return acc
      }, {})
      allClmmPoolContractInfoObj = obj
    }

    if (vaultClmmPoolAddressList.length > 0) {
      const allClmmPoolContractInfos = await volatileVaultsSdk.CetusClmmSDK.Pool.getAssignPools(Array.from(new Set(vaultClmmPoolAddressList)))
      // 将CLMM Pool合约信息列表转换为对象
      const obj = allClmmPoolContractInfos.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr
        return acc
      }, {})
      allClmmPoolContractInfoObj = { ...allClmmPoolContractInfoObj, ...obj }
    }
    setVaultClmmPoolContractInfoObj(allClmmPoolContractInfoObj)

    if (vaultDlmmPoolAddressList.length > 0) {
      const allDlmmPoolContractInfos = await volatileVaultsSdk.CetusDlmmSDK.Pool.getAssignPoolList(Array.from(new Set(vaultDlmmPoolAddressList)))
      // 将DLMM Pool合约信息列表转换为对象
      allDlmmPoolContractInfoObj = allDlmmPoolContractInfos.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr
        return acc
      }, {})
      setVaultDlmmPoolContractInfoObj(allDlmmPoolContractInfoObj)
    }

    // // 获取CLMM Pool合约信息列表
    // const allClmmPoolContractInfos = await volatileVaultsSdk.CetusClmmSDK.Pool.getAssignPools(vaultClmmPoolAddressList)
    // // 将CLMM Pool合约信息列表转换为对象
    // const allClmmPoolContractInfoObj = allClmmPoolContractInfos.reduce((acc: any, curr: any) => {
    //   acc[curr.id] = curr
    //   return acc
    // }, {})

    // // 获取DLMM Pool合约信息列表
    // const allDlmmPoolContractInfos = await volatileVaultsSdk.CetusDlmmSDK.Pool.getAssignPoolList(vaultDlmmPoolAddressList)
    // // 将DLMM Pool合约信息列表转换为对象
    // const allDlmmPoolContractInfoObj = allDlmmPoolContractInfos.reduce((acc: any, curr: any) => {
    //   acc[curr.id] = curr
    //   return acc
    // }, {})
    // setVaultClmmPoolContractInfoObj(allClmmPoolContractInfoObj)
    // setVaultDlmmPoolContractInfoObj(allDlmmPoolContractInfoObj)
    console.log('结束执行时间1', new Date().getTime())

    // 获取vaultsPool
    getVaultPool(
      list,
      allClmmPoolContractInfoObj,
      lstVaultContractInfoObj,
      haedalVaultContractInfoObj,
      allDlmmPoolContractInfoObj,
      dlmmVaultContractInfoObj
    )

    return {
      lstVaultContractInfoObj,
      haedalVaultContractInfoObj,
      allClmmPoolContractInfoObj,
      allDlmmPoolContractInfoObj,
      dlmmVaultContractInfoObj
    }
  }

  const getVaultsBalance = async (account: string) => {
    const balanceList = await volatileVaultsSdk.FullClient.getAllBalances({
      owner: account
    })
    const balanceObj = balanceList.reduce((acc: any, curr: any) => {
      acc[fixCoinType(curr.coinType.toLowerCase(), false)] = curr
      return acc
    }, {})
    console.log('🚀 ~ getVaultsBalance ~ balanceObj:', balanceObj)
    return balanceObj
  }

  // 获取vaultsPool
  const getVaultPool = async (
    list: any,
    allClmmPoolContractInfoObj: Record<string, Pool>,
    lstVaultContractInfoObj?: any,
    haedalVaultContractInfoObj?: any,
    allDlmmPoolContractInfoObj?: Record<string, Pool>,
    dlmmVaultContractInfoObj?: Record<string, any>
  ) => {
    for (let i = 0; i < list.length; i++) {
      const vault = list[i]
      const vaultContractInfo =
        vault.category == 'cetus'
          ? lstVaultContractInfoObj[vault.vaultId]
          : vault.category == 'haedal'
            ? haedalVaultContractInfoObj[vault.vaultId]
            : dlmmVaultContractInfoObj[vault.vaultId]
      const clmmContractInfo: any[] = vault.clmmPoolAddress.map((clmmPoolAddress: string) => allClmmPoolContractInfoObj[clmmPoolAddress])
      const dlmmContractInfo: any[] = vault.dlmmPoolAddress.map((dlmmPoolAddress: string) => allDlmmPoolContractInfoObj[dlmmPoolAddress])
      const vaultsPool =
        vault.category == 'haevault_v2'
          ? await wrapDlmmVaultPoolContractInfo(vault, dlmmContractInfo, clmmContractInfo, vaultContractInfo)
          : wrapVaultPoolContractInfo(vault, clmmContractInfo[0], vaultContractInfo)
      setVaultsPoolObj(vaultsPool)
    }
  }

  // 包装vaultsPool
  const wrapVaultPoolContractInfo = (vault: any, clmmContractInfo: Pool, vaultContractInfo: any) => {
    const { tokenA, tokenB, category, isReverse, vaultId } = vault

    const positionList: any[] = []

    const tickLowerIndex =
      category == 'haedal' ? vaultContractInfo.clmm_vault.wrapped_position.tick_lower_index : vaultContractInfo.position.tick_lower_index
    const tickUpperIndex =
      category == 'haedal' ? vaultContractInfo.clmm_vault.wrapped_position.tick_upper_index : vaultContractInfo.position.tick_upper_index
    const minPrice = TickMath.tickIndexToPrice(tickLowerIndex, tokenA.decimals, tokenB.decimals).toString()
    const maxPrice = TickMath.tickIndexToPrice(tickUpperIndex, tokenA.decimals, tokenB.decimals).toString()
    const liquidity = category == 'haedal' ? vaultContractInfo.clmm_vault.wrapped_position.liquidity : vaultContractInfo.position.liquidity
    const maxPriceResever = d(1).div(d(maxPrice)).toString()
    const minPriceResever = d(1).div(d(minPrice)).toString()
    const curSqrtPrice = new BN(clmmContractInfo.current_sqrt_price)
    const currentPrice = TickMath.sqrtPriceX64ToPrice(curSqrtPrice, tokenA.decimals, tokenB.decimals).toString()
    const currentPriceReverse = d(1).div(d(currentPrice)).toString()
    const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(tickLowerIndex)
    const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(tickUpperIndex)

    // toDo: 临时拿了buffer里面的数量，增加到仓位数量里
    let buffer_coin_amount_a, buffer_coin_amount_b
    try {
      const buffer_assets = getShareBufferAssets(
        vaultContractInfo?.lp_token_treasury,
        vaultContractInfo?.balances,
        vaultContractInfo?.lp_token_treasury
      )

      console.log('🚀 ~ wrapVaultPoolContractInfo ~ buffer_assets ', vaultContractInfo?.id, ':', buffer_assets)

      buffer_coin_amount_a = buffer_assets[vaultContractInfo?.clmm_vault?.wrapped_position?.coin_type_a]?.value || '0'
      buffer_coin_amount_b = buffer_assets[vaultContractInfo?.clmm_vault?.wrapped_position?.coin_type_b]?.value || '0'
    } catch (error) {
      console.log('🚀 ~ wrapVaultPoolContractInfo ~ error:', error)
    }

    const coinAmounts = ClmmPoolUtil.getCoinAmountFromLiquidity(new BN(liquidity), curSqrtPrice, lowerSqrtPrice, upperSqrtPrice, false)
    console.log('🚀 ~ wrapVaultPoolContractInfo ~ coinAmounts ', vaultContractInfo?.id, ':', coinAmounts)

    const coinAmountA = fromDecimalsAmountFix(d(buffer_coin_amount_a).add(coinAmounts.coin_amount_a).toString(), tokenA.decimals).toString()
    const coinAmountB = fromDecimalsAmountFix(d(buffer_coin_amount_b).add(coinAmounts.coin_amount_b).toString(), tokenB.decimals).toString()

    const displayAmountA = isReverse ? coinAmountB : coinAmountA
    const displayAmountB = isReverse ? coinAmountA : coinAmountB

    const { percentA, percentB } = calcCoinProportion(coinAmountA, coinAmountB, currentPrice, false)
    const displayPercentA = isReverse ? percentB : percentA
    const displayPercentB = isReverse ? percentA : percentB

    const disPlayProtocolFeeRate = symbolDataDisplayProcessing(d(vaultContractInfo.protocol_fee_rate).div(10000).mul(100).toString(), '%')

    const coinTypeA = fixCoinType(tokenA.coin_type, false)
    const coinTypeB = fixCoinType(tokenB.coin_type, false)

    const displayCoinTypeA = isReverse ? coinTypeB : coinTypeA
    const displayCoinTypeB = isReverse ? coinTypeA : coinTypeB

    let quoteCoinType, quoteCoin, hardCap, baseCoin, baseCoinType

    if (category == 'haedal') {
      quoteCoinType = vaultContractInfo?.quote_type
      quoteCoin = fixCoinType(quoteCoinType, false) == fixCoinType(tokenA.coin_type, false) ? tokenA : tokenB
      hardCap = d(vaultContractInfo?.hard_cap)
        .div(10 ** quoteCoin?.decimals)
        .toString()
      baseCoin = quoteCoinType == tokenA.coin_type ? tokenB : tokenA
      baseCoinType = baseCoin.coin_type
    }

    const totalSupply = category == 'cetus' ? vaultContractInfo?.total_supply : vaultContractInfo?.lp_token_treasury

    positionList.push({
      minPrice: !isReverse ? minPrice : maxPriceResever,
      minPriceResever: !isReverse ? maxPriceResever : minPrice,
      maxPrice: !isReverse ? maxPrice : minPriceResever,
      maxPriceResever: !isReverse ? minPriceResever : maxPrice,
      liquidity,
      currentPrice: !isReverse ? currentPrice : currentPriceReverse,
      currentPriceReverse: !isReverse ? currentPriceReverse : currentPrice
    })

    return {
      [vaultId]: {
        minPrice: !isReverse ? minPrice : maxPriceResever,
        minPriceResever: !isReverse ? maxPriceResever : minPrice,
        maxPrice: !isReverse ? maxPrice : minPriceResever,
        maxPriceResever: !isReverse ? minPriceResever : maxPrice,
        liquidity,
        displayAmountA,
        displayAmountB,
        displayPercentA,
        displayPercentB,
        currentPrice: !isReverse ? currentPrice : currentPriceReverse,
        currentPriceReverse: !isReverse ? currentPriceReverse : currentPrice,
        disPlayProtocolFeeRate,
        displayCoinTypeA,
        displayCoinTypeB,
        hardCap,
        quoteCoinType,
        quoteCoin,
        baseCoin,
        baseCoinType,
        totalSupply,
        positionList,
        version: vault.category === 'haedal' ? 'V1' : undefined
      }
    }
  }

  const wrapDlmmVaultPoolContractInfo = async (vault: any, dlmmContractList: DlmmPool[], clmmContractList: Pool[], vaultContractInfo: VaultPool) => {
    console.log('开始执行时间', new Date().getTime())
    console.log('🚀🚀🚀 ~ useGetVaultsContract.ts:217 ~ wrapDlmVaultPoolContractInfo ~ dlmmContractInfo:', {
      dlmmContractList,
      clmmContractList,
      vaultContractInfo,
      vault
    })
    const { tokenA, tokenB, category, isReverse, vaultId } = vault
    const decimals_a = tokenA.decimals
    const decimals_b = tokenB.decimals
    const coinTypeA = fixCoinType(tokenA.coin_type, false)
    const coinTypeB = fixCoinType(tokenB.coin_type, false)

    const positionList: any[] = []
    const displayCoinTypeA = isReverse ? coinTypeB : coinTypeA
    const displayCoinTypeB = isReverse ? coinTypeA : coinTypeB

    let currentPrice = '0'

    const markets = vaultContractInfo?.markets || []
    markets.forEach(async (m: VaultMarket) => {
      const { position_list, type } = m
      if (type === 'DLMM') {
        for (const p of position_list) {
          const pos = p as DLMMMarketPosition
          const { position, valid_lower_bin_id, valid_upper_bin_id } = pos
          const { pool_id, liquidity_shares } = position
          const dlmmContract = dlmmContractList.find((c: DlmmPool) => c.id === pool_id)
          if (dlmmContract) {
            const { bin_step, active_id } = dlmmContract
            const tickLowerIndex = valid_lower_bin_id
            const tickUpperIndex = valid_upper_bin_id
            const minPrice = BinUtils.getPriceFromBinId(tickLowerIndex, bin_step, decimals_a, decimals_b)
            const maxPrice = BinUtils.getPriceFromBinId(tickUpperIndex, bin_step, decimals_a, decimals_b)
            const maxPriceResever = d(1).div(d(maxPrice)).toString()
            const minPriceResever = d(1).div(d(minPrice)).toString()
            currentPrice = BinUtils.getPriceFromBinId(active_id, bin_step, decimals_a, decimals_b)
            const currentPriceReverse = d(1).div(d(currentPrice)).toString()

            positionList.push({
              ...p,
              minPrice: !isReverse ? minPrice : maxPriceResever,
              minPriceResever: !isReverse ? maxPriceResever : minPrice,
              maxPrice: !isReverse ? maxPrice : minPriceResever,
              maxPriceResever: !isReverse ? minPriceResever : maxPrice,
              liquidity_shares,
              currentPrice: !isReverse ? currentPrice : currentPriceReverse,
              currentPriceReverse: !isReverse ? currentPriceReverse : currentPrice
            })
          }
        }
      } else if (type === 'CLMM') {
        const { position_list } = m
        for (const p of position_list) {
          const pos = p as CLMMMarketPosition
          const { position } = pos
          const { liquidity, tick_lower_index, tick_upper_index, pool_id } = position
          const clmmContract = clmmContractList.find((c: Pool) => c.id === pool_id)
          if (clmmContract) {
            const { current_sqrt_price } = clmmContract
            const minPrice = TickMath.tickIndexToPrice(tick_lower_index, tokenA.decimals, tokenB.decimals).toString()
            const maxPrice = TickMath.tickIndexToPrice(tick_upper_index, tokenA.decimals, tokenB.decimals).toString()
            const maxPriceResever = d(1).div(d(maxPrice)).toString()
            const minPriceResever = d(1).div(d(minPrice)).toString()
            const curSqrtPrice = new BN(current_sqrt_price)
            currentPrice = TickMath.sqrtPriceX64ToPrice(curSqrtPrice, tokenA.decimals, tokenB.decimals).toString()
            const currentPriceReverse = d(1).div(d(currentPrice)).toString()

            positionList.push({
              ...p,
              minPrice: !isReverse ? minPrice : maxPriceResever,
              minPriceResever: !isReverse ? maxPriceResever : minPrice,
              maxPrice: !isReverse ? maxPrice : minPriceResever,
              maxPriceResever: !isReverse ? minPriceResever : maxPrice,
              liquidity,
              currentPrice: !isReverse ? currentPrice : currentPriceReverse,
              currentPriceReverse: !isReverse ? currentPriceReverse : currentPrice
            })
          }
        }
      }
    })

    let quoteCoinType, quoteCoin, hardCap, baseCoin, baseCoinType

    if (category == 'haevault_v2') {
      quoteCoinType = vaultContractInfo?.quote_type
      quoteCoin = fixCoinType(quoteCoinType, false) == fixCoinType(tokenA.coin_type, false) ? tokenA : tokenB
      hardCap = d(vaultContractInfo?.hard_cap)
        .div(10 ** quoteCoin?.decimals)
        .toString()
      baseCoin = quoteCoinType == tokenA.coin_type ? tokenB : tokenA
      baseCoinType = baseCoin.coin_type
    }

    const poolBalanceInfo = await getAmountBalanceByLpAmount(volatileVaultsSdk, vaultContractInfo.lp_token_treasury, vaultContractInfo.id, false)

    const bufferAmountA = poolBalanceInfo.share_buffer_assets.find((item: any) => item.coin_type === tokenA.coin_type)?.value || '0'
    const bufferAmountB = poolBalanceInfo.share_buffer_assets.find((item: any) => item.coin_type === tokenB.coin_type)?.value || '0'

    const coinAmountA = fromDecimalsAmountFix(d(bufferAmountA).add(poolBalanceInfo.amount_a).toString(), tokenA.decimals).toString()
    const coinAmountB = fromDecimalsAmountFix(d(bufferAmountB).add(poolBalanceInfo.amount_b).toString(), tokenB.decimals).toString()

    const displayAmountA = isReverse ? coinAmountB : coinAmountA
    const displayAmountB = isReverse ? coinAmountA : coinAmountB

    const { percentA, percentB } = calcCoinProportion(coinAmountA, coinAmountB, currentPrice, false)
    const displayPercentA = isReverse ? percentB : percentA
    const displayPercentB = isReverse ? percentA : percentB

    const disPlayProtocolFeeRate = symbolDataDisplayProcessing(d(vaultContractInfo.protocol_fee_rate).div(10000).mul(100).toString(), '%')

    const shareBufferAssets: any[] = []
    for (const item of poolBalanceInfo.share_buffer_assets) {
      const tokenInfo = await getTokenInfo(item.coin_type)
      if (tokenInfo) {
        const tokenAmount = fromDecimalsAmount(item.value, tokenInfo.decimals)
        shareBufferAssets.push({
          token: tokenInfo,
          ...item,
          amount_display: tokenAmount
        })
      }
    }
    poolBalanceInfo.share_buffer_assets = shareBufferAssets

    console.log('结束执行时间', new Date().getTime())
    return {
      [vaultId]: {
        poolBalanceInfo,
        coinAmountA,
        coinAmountB,
        displayAmountA,
        displayAmountB,
        displayPercentA,
        displayPercentB,
        positionList,
        disPlayProtocolFeeRate,
        displayCoinTypeA,
        displayCoinTypeB,
        hardCap,
        quoteCoinType,
        quoteCoin,
        baseCoin,
        baseCoinType,
        totalSupply: vaultContractInfo?.lp_token_treasury,
        dlmmPoolAddress: vault.dlmmPoolAddress,
        version: 'V2'
      }
    }
  }
  return { getVaultsContractInfo, getVaultPool, wrapVaultPoolContractInfo, getVaultsBalance }
}
