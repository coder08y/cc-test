import useGetVaultsContract from '@/hooks/vault-v2/useGetVaultsContract'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { VaultsBalance } from '@/types/vaults-v2'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { Decimal, d, formatNumber, formatNumberWithThreshold, fromDecimalsAmountFix, toLongCoinType } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { Pool as ClmmPool } from '@cetusprotocol/sui-clmm-sdk'
import { Vault, VaultsUtils } from '@cetusprotocol/vaults-sdk'
import { Balance, CoinBalance } from '@mysten/sui/client'
import { Pool, buildVaultsBalance, buildVaultsBalanceV2 } from 'haedal-vault-sdk'
import { useEffect, useRef } from 'react'
import useGetVaultFarmingStaked from '../vaults-farming/useGetVaultFarmingStaked'
import useVaultsMergeRequest from './useVaultsMergeRequest'

export default function useGetVaultsPosition() {
  const { lpTokenInfoObj } = useVaultsListV2Store()
  const { volatileVaultsSdk } = usePeripherySDKStore()
  const { currentAccount } = useAccountStore()
  const { setVaultsPositionObj, setVaultsPositionLoading, setShowVaultsList } = useVaultsPositionStore()
  const { setVaultListLoading } = useVaultsListV2Store()
  const { getVaultsFarmingStaked } = useGetVaultFarmingStaked()
  const { vaultsFarmObj } = useVaultsFarmingStore()
  const { getVaultsBalance, getVaultsContractInfo } = useGetVaultsContract()
  const { getVaultsContractInfoWithMerge, getMultiVaultsFarmingStaked } = useVaultsMergeRequest()

  const currentAcc = useRef(currentAccount?.address)
  useEffect(() => {
    currentAcc.current = currentAccount?.address
  }, [currentAccount?.address])

  // profile专用 获取vaultsPosition
  const getVaultsPosition = async (
    list: any[],
    // lstVaultContractInfoObj: any,
    // haedalVaultContractInfoObj: any,
    // allClmmPoolContractInfoObj: any,
    // isProfile = false,
    vaultsFarmInfoObj?: any
  ) => {
    // if (!isAutoRefresh) {
    //   setVaultsPositionLoading(true)
    // }
    // const balanceList = await volatileVaultsSdk.FullClient.getAllBalances({
    //   owner: currentAccount?.address
    // })
    // const balanceObj = balanceList.reduce((acc: any, curr: any) => {
    //   acc[curr.coinType.toLowerCase()] = curr
    //   return acc
    // }, {})
    // const vaultsPosList = []
    // for (let i = 0; i < list.length; i++) {
    //   const vault = list[i]
    //   const vaultContractInfo = vault.category == 'cetus' ? lstVaultContractInfoObj[vault.vaultId] : haedalVaultContractInfoObj[vault.vaultId]
    //   const clmmContractInfo: ClmmPool[] = vault.clmmPoolAddress.map((clmmPoolAddress: string) => allClmmPoolContractInfoObj[clmmPoolAddress])
    //   const balance = balanceObj[vault.lpTokenType.toLowerCase()] as CoinBalance
    //   const vaultsFarmingInfo = vaultsFarmInfoObj[vault.vaultId]
    //   const result = await getVaultPosition(
    //     vault,
    //     [...clmmContractInfo],
    //     vaultContractInfo,
    //     isProfile,
    //     balance,
    //     currentAccount?.address,
    //     undefined,
    //     vaultsFarmingInfo
    //   )
    //   if (d((result && result[vault.vaultId].balance) || '0').gt(0)) {
    //     vaultsPosList.push(result)
    //   }
    // }
    if (!currentAccount?.address) {
      setVaultsPositionLoading(false)
      setVaultListLoading(false)
      setShowVaultsList([])
      return
    }

    const vaultPositionObj = await getVaultPositionsV2(currentAccount?.address, list, vaultsFarmInfoObj)

    const vaultsPosList: any[] = []
    Object.values(vaultPositionObj).forEach((item: any) => {
      if (d(item?.balance || '0').gt(0) || d(item?.vaultFarmingBalance || '0').gt(0)) {
        vaultsPosList.push(item)
      }
    })

    console.log('1218###🚀 ~ getVaultsPosition ~ vaultsPosList:', vaultsPosList)
    setShowVaultsList(vaultsPosList)
    setVaultsPositionLoading(false)
    setVaultListLoading(false)
  }

  // 获取vaultPosition
  const getVaultPosition = async (
    vault: any,
    poolContractInfo: (ClmmPool | DlmmPool)[],
    vaultContractInfo: any,
    isProfile = false,
    originBalance?: Balance,
    account = currentAccount?.address,
    lpTokenInfoObj?: any,
    vaultsFarmingInfo?: any
  ) => {
    try {
      const { category } = vault
      let positionInfo: any
      let balance

      const haedalFarmingInfo = vaultsFarmObj[vault.vaultId] || vaultsFarmingInfo
      let haedalFarmingBalance = '0'
      if (haedalFarmingInfo) {
        let haedalFarmingStaked = await getVaultsFarmingStaked(
          {
            stakeCoinType: haedalFarmingInfo.stakeCoinType,
            poolId: haedalFarmingInfo.poolId
          },
          vault.vaultId,
          haedalFarmingInfo
        )
        haedalFarmingBalance = haedalFarmingStaked?.stakedBalance || '0'
      }

      if (!originBalance) {
        balance = await volatileVaultsSdk.FullClient.getBalance({
          owner: account,
          coinType: vault.lpTokenType
        })
      } else {
        balance = originBalance
      }

      // console.log("1202####🚀 ~ getVaultPosition ~ balance:", balance)
      // console.log("1202####🚀 ~ getVaultPosition ~ haedalFarmingBalance:", haedalFarmingBalance)

      // if (!Number(balance?.totalBalance) && !Number(haedalFarmingBalance)) {
      //   return
      // }

      let user_amount_a = '0'
      let user_amount_b = '0'
      if (category == 'cetus') {
        positionInfo = VaultsUtils.buildVaultBalance(account, vaultContractInfo as Vault, balance, poolContractInfo[0])
        user_amount_a = positionInfo.amount_a
        user_amount_b = positionInfo.amount_b
      } else if (category == 'haevault_v2') {
        positionInfo = await buildVaultsBalanceV2(
          volatileVaultsSdk,
          d(balance.totalBalance).add(haedalFarmingBalance).toString(),
          (vaultContractInfo as Vault)?.id || '',
          account
        )
        const vaultsPositionInfo = await buildVaultsBalanceV2(
          volatileVaultsSdk,
          balance.totalBalance,
          (vaultContractInfo as Vault)?.id || '',
          account
        )
        user_amount_a = vaultsPositionInfo.amount_a
        user_amount_b = vaultsPositionInfo.amount_b
      } else {
        positionInfo = buildVaultsBalance(
          account,
          d(balance.totalBalance).add(haedalFarmingBalance).toString(),
          vaultContractInfo as Pool,
          poolContractInfo[0]
        )
        const vaultsPositionInfo = buildVaultsBalance(account, balance.totalBalance, vaultContractInfo as Pool, poolContractInfo[0])
        user_amount_a = vaultsPositionInfo.amount_a
        user_amount_b = vaultsPositionInfo.amount_b
      }

      console.log('1202###🚀 ~ getVaultPosition ~ positionInfo:', positionInfo)
      const result = wrapVaultPosition(
        {
          ...positionInfo,

          ownerAddress: currentAcc.current == account ? account : undefined,
          vaultBalance: balance?.totalBalance,
          vaultFarmingBalance: haedalFarmingBalance,
          vault_amount_a: user_amount_a,
          vault_amount_b: user_amount_b
        },
        vault,
        vaultContractInfo,
        lpTokenInfoObj
      )

      if (isProfile && currentAcc.current == account) {
        setVaultsPositionObj(result)
      } else if (!isProfile) {
        setVaultsPositionObj(result)
      }

      return result
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetVaultsPosition.ts:59 ~ getVaultPosition ~ error:', error)
    }
  }

  // 列表页面获取vaults position信息
  const getVaultPositionsV2 = async (account: string, vaultApiList: any[], vaultFarmObj: any) => {
    console.log('1218###🚀 ~ getVaultPositionsV2 ~ vaultFarmObj:', vaultFarmObj)
    const balances = await getVaultsBalance(account)
    const vaultsLpBalanceObj: any = {}
    const farmingBalanceObj: any = {}

    // 只有有仓位或者有farming质押的才去请求getVaultsContractInfo
    const haveGetContractVaults: any = {}

    const haedalFarmingStakedParams: any[] = []

    for (const key in vaultFarmObj) {
      const farmInfo = vaultFarmObj[key]
      haedalFarmingStakedParams.push({
        stakeCoinType: farmInfo?.stakeCoinType,
        poolId: farmInfo?.poolId,
        vaultId: farmInfo?.vaultPool?.id,
        vaultsFarmingInfo: farmInfo
      })
    }

    let haedalFarmingStakedObj: any = {}
    if (currentAccount?.address) {
      haedalFarmingStakedObj = await getMultiVaultsFarmingStaked(haedalFarmingStakedParams, currentAccount?.address)
    }

    for (let i = 0; i < vaultApiList.length; i++) {
      const vaultApiInfo = vaultApiList[i]

      const vaultId = vaultApiInfo?.vaultId
      console.log('🚀 ~ getVaultPositionsV2 ~ vaultApiInfo:', vaultApiInfo)
      const lpTokenType = toLongCoinType(vaultApiInfo?.lpTokenType)?.toLowerCase()
      const lpBalance = balances?.[lpTokenType]
      const vaultsFarmingInfo = vaultFarmObj[vaultId]

      let haedalFarmingBalance = '0'
      if (vaultsFarmingInfo) {
        // let haedalFarmingStaked = await getVaultsFarmingStaked(
        //   {
        //     stakeCoinType: vaultsFarmingInfo.stakeCoinType,
        //     poolId: vaultsFarmingInfo.poolId
        //   },
        //   vaultId,
        //   vaultsFarmingInfo
        // )
        haedalFarmingBalance = haedalFarmingStakedObj?.[vaultsFarmingInfo?.poolId]?.stakedBalance || '0'
      }

      if (!Number(lpBalance?.totalBalance) && !Number(haedalFarmingBalance)) {
        continue
      }

      vaultsLpBalanceObj[vaultId] = lpBalance
      farmingBalanceObj[vaultId] = haedalFarmingBalance

      haveGetContractVaults[vaultId] = vaultApiInfo
    }

    // const { lstVaultContractInfoObj, haedalVaultContractInfoObj, allClmmPoolContractInfoObj, allDlmmPoolContractInfoObj, dlmmVaultContractInfoObj } =
    //   await getVaultsContractInfo(Object.values(haveGetContractVaults))
    const { lstVaultContractInfoObj, haedalVaultContractInfoObj, allClmmPoolContractInfoObj, allDlmmPoolContractInfoObj, dlmmVaultContractInfoObj } =
      await getVaultsContractInfoWithMerge(Object.values(haveGetContractVaults))

    let vaultPositionObj: any = {}
    for (let i = 0; i < vaultApiList?.length; i++) {
      const vaultApiInfo = vaultApiList[i]
      const vaultId = vaultApiInfo?.vaultId

      if (!haveGetContractVaults?.[vaultId]) {
        const result = wrapVaultPositionWithNull(vaultApiInfo, account)
        // setVaultsPositionObj(result)
        vaultPositionObj = { ...vaultPositionObj, ...result }
      } else {
        const category = vaultApiInfo?.category
        const lpBalance = vaultsLpBalanceObj[vaultId]
        const farmingBalance = farmingBalanceObj[vaultId]
        const vaultContractInfo =
          category == 'cetus'
            ? lstVaultContractInfoObj[vaultId]
            : category == 'haevault_v2'
              ? dlmmVaultContractInfoObj[vaultId]
              : haedalVaultContractInfoObj[vaultId]
        const poolContractInfo =
          category == 'cetus' || category == 'haedal'
            ? vaultApiInfo?.clmmPoolAddress.map((clmmPoolAddress: string) => allClmmPoolContractInfoObj[clmmPoolAddress])
            : category == 'haevault_v2'
              ? vaultApiInfo?.dlmmPoolAddress.map((dlmmPoolAddress: string) => allDlmmPoolContractInfoObj[dlmmPoolAddress])
              : undefined

        let positionInfo: any
        let user_amount_a = '0'
        let user_amount_b = '0'
        if (category == 'cetus') {
          positionInfo = VaultsUtils.buildVaultBalance(account, vaultContractInfo as Vault, lpBalance, poolContractInfo[0])
          user_amount_a = positionInfo.amount_a
          user_amount_b = positionInfo.amount_b
        } else if (category == 'haevault_v2') {
          positionInfo = await buildVaultsBalanceV2(
            volatileVaultsSdk,
            d(lpBalance?.totalBalance || '0')
              .add(farmingBalance)
              .toString(),
            vaultContractInfo?.id || '',
            account
          )
          const vaultsPositionInfo = await buildVaultsBalanceV2(
            volatileVaultsSdk,
            lpBalance?.totalBalance || '0',
            vaultContractInfo?.id || '',
            account
          )
          user_amount_a = vaultsPositionInfo.amount_a
          user_amount_b = vaultsPositionInfo.amount_b
        } else {
          positionInfo = buildVaultsBalance(
            account,
            d(lpBalance?.totalBalance || '0')
              .add(farmingBalance)
              .toString(),
            vaultContractInfo as Pool,
            poolContractInfo[0]
          )
          const vaultsPositionInfo = buildVaultsBalance(account, lpBalance?.totalBalance || '0', vaultContractInfo as Pool, poolContractInfo[0])
          user_amount_a = vaultsPositionInfo.amount_a
          user_amount_b = vaultsPositionInfo.amount_b
        }

        const result = wrapVaultPosition(
          {
            ...positionInfo,

            ownerAddress: currentAcc.current == account ? account : undefined,
            vaultBalance: lpBalance?.totalBalance || '0',
            vaultFarmingBalance: farmingBalance,
            vault_amount_a: user_amount_a,
            vault_amount_b: user_amount_b
          },
          vaultApiInfo,
          vaultContractInfo,
          lpTokenInfoObj
        )

        vaultPositionObj = { ...vaultPositionObj, ...result }

        // setVaultsPositionObj(result)
      }
    }

    setVaultsPositionObj({ ...vaultPositionObj })
    return vaultPositionObj
  }

  const wrapVaultPosition = (positionInfo: any, vault: any, vaultContractInfo: any, tokenInfoObj = lpTokenInfoObj) => {
    const tokenInfo = tokenInfoObj[vault.lpTokenType]
    const {
      amount_a,
      amount_b,
      ownerAddress,
      vaultFarmingBalance,
      vaultBalance,
      vault_amount_a,
      vault_amount_b,
      receive_amount_a,
      receive_amount_b
    } = positionInfo
    const { isReverse, tokenA, tokenB, category } = vault
    const amountA = fromDecimalsAmountFix(amount_a, tokenA.decimals).toString()
    const amountB = fromDecimalsAmountFix(amount_b, tokenB.decimals).toString()
    const vaultAmountA = fromDecimalsAmountFix(vault_amount_a, tokenA.decimals).toString()
    const vaultAmountB = fromDecimalsAmountFix(vault_amount_b, tokenB.decimals).toString()
    const clmmPool = positionInfo.clmm_pool_id
    const liquidity = positionInfo.liquidity
    const vaultId = positionInfo.vault_id
    const coinTypeA = extractStructTagFromType(positionInfo.coin_type_a).full_address
    const coinTypeB = extractStructTagFromType(positionInfo.coin_type_b).full_address

    const balanceObj = getVaultBalance(tokenInfo, positionInfo.lp_token_balance)
    const { balanceFormat: vaultBalanceFormat, balanceDisplay: vaultBalanceDisplay } = getVaultBalance(tokenInfo, vaultBalance)
    const sharePoolRate =
      category == 'cetus'
        ? d(balanceObj.balance).div(vaultContractInfo.total_supply).mul(100).toString()
        : d(balanceObj.balance).div(vaultContractInfo.lp_token_treasury).mul(100).toString()
    const shartOfPoolDisplay = `${formatNumberWithThreshold(sharePoolRate, 2, 6)}%`

    const displayTokenA = isReverse ? tokenB : tokenA
    const displayTokenB = isReverse ? tokenA : tokenB

    return {
      [vaultId]: {
        ...balanceObj,
        amountA,
        amountB,
        displayAmountA: isReverse ? amountB : amountA,
        displayAmountB: isReverse ? amountA : amountB,
        coinTypeA,
        coinTypeB,
        displayCoinTypeA: isReverse ? coinTypeB : coinTypeA,
        displayCoinTypeB: isReverse ? coinTypeA : coinTypeB,
        liquidity,
        clmmPool,
        vaultId,
        sharePoolRate,
        shartOfPoolDisplay,
        tokenA,
        tokenB,
        displayTokenA,
        displayTokenB,
        ownerAddress,
        vaultBalance,
        vaultBalanceFormat,
        vaultBalanceDisplay,
        vaultFarmingBalance,
        displayVaultAmountA: isReverse ? vaultAmountB : vaultAmountA,
        displayVaultAmountB: isReverse ? vaultAmountA : vaultAmountB
      }
    }
  }

  const wrapVaultPositionWithNull = (vault: any, account: string) => {
    const vaultId = vault!.vaultId
    const tokenA = vault!.tokenA
    const tokenB = vault!.tokenB
    const coinTypeA = tokenA?.coinType
    const coinTypeB = tokenB?.coinType
    const isReverse = vault!.isReverse

    return {
      [vaultId]: {
        balance: '0',
        balanceDisplay: '0',
        balanceFormat: '0',
        amountA: '0',
        amountB: '0',
        displayAmountA: '0',
        displayAmountB: '0',
        coinTypeA,
        coinTypeB,
        displayCoinTypeA: isReverse ? coinTypeB : coinTypeA,
        displayCoinTypeB: isReverse ? coinTypeA : coinTypeB,
        liquidity: '0',
        clmmPool: vault?.clmmPoolAddress,
        vaultId,
        sharePoolRate: '0',
        shartOfPoolDisplay: '0',
        tokenA,
        tokenB,
        displayTokenA: isReverse ? tokenB : tokenA,
        displayTokenB: isReverse ? tokenA : tokenB,
        ownerAddress: account,
        vaultBalance: '0',
        vaultBalanceFormat: '0',
        vaultBalanceDisplay: '0',
        vaultFarmingBalance: '0',
        displayVaultAmountA: '0',
        displayVaultAmountB: '0'
      }
    }
  }

  const getVaultBalance = (tokenInfo: any, balance: any) => {
    const balanceFormat = fromDecimalsAmountFix(balance, tokenInfo?.decimals).toString()
    const balanceObj: VaultsBalance = {
      balance,
      balanceFormat,
      balanceDisplay: formatNumber(balanceFormat, undefined, false, Decimal.ROUND_DOWN).toString()
    }
    return balanceObj
  }

  return {
    getVaultPosition,
    getVaultsPosition,
    getVaultPositionsV2
  }
}
