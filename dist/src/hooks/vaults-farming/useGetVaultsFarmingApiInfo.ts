import { VaultList } from '@/apis/path'
import useVaultsFarmingStore from '@/store/vaults-farming'
import { VaultFarmingApiInfo } from '@/types/vaults-farming'
import { useFetch } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { d, formatNumber } from '@cetus/utils'
import { useState } from 'react'
import useGetVaultPoolList from '../vault-v2/useGetVaultPoolList'

// 获取vaults farming信息
export default function useGetVaultsFarmingApiInfo() {
  const { fetchByApi } = useFetch()
  const { volatileVaultsSdk, haedalFarmSdk } = usePeripherySDKStore()
  const { currentAccount } = useAccountStore()
  const { getTokenInfo } = useGetToken()
  const { fetchTokenPrices } = useTokenPrice()
  const { setVaultsFarmObj } = useVaultsFarmingStore()
  const { getLocalVaultPoolList } = useGetVaultPoolList()

  const MAX_COUNT = 5
  const [count, setCount] = useState<number>(0)

  // 1. 拉取 Haedal Farming 原始数据
  const getHaedalFarmingApiData = async () => {
    try {
      const res = await (await fetch('https://www.haedal.xyz/api/v1/farming/pools')).json()
      if (res && res.code === 200) {
        // res.data.push(dlmmVaultFarming)
        if (res && res.code === 200) return res.data.map((item: any) => ({ ...item })) || []
      }
      return []
    } catch (error) {
      return await haedalFarmSdk.Farms.getFarmsList()
    }
  }

  // 2. 拉取 Vaults List 并转为对象
  const getVaultsApiData = async () => {
    try {
      const vaultsRes = await fetchByApi(VaultList, 'GET')
      return vaultsRes.list.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr
        return acc
      }, {})
    } catch (error) {
      const { vaultListObj } = await getLocalVaultPoolList()
      return vaultListObj
    }
  }

  // 3. 计算 Farming 详情
  const processFarmingData = async (list: any[], vaultsObj: Record<string, any>) => {
    const rewardCoinList: string[] = []
    // farm池子信息 以vaultId为key
    const vaultsFarmObj: Record<string, VaultFarmingApiInfo> = {}

    for (const item of list) {
      const { rewardConfigs, vaultPool } = item
      console.log('🚀🚀🚀 ~ useGetVaultsFarmingApiInfo.ts:146 ~ processFarmingData ~ item:', item)
      const currentVaultApiInfo = vaultsObj?.[vaultPool?.id]
      if (!currentVaultApiInfo) continue

      const { liquidity_pools } = currentVaultApiInfo

      // const dlmmPoolAddress = liquidity_pools?.[0]?.protocol === 'dlmm' ? liquidity_pools?.[0]?.id : undefined
      // const clmmPoolAddress = currentVaultApiInfo?.clmm_pool || currentVaultApiInfo?.clmmPoolAddress
      // //to: 这里接口返回的都是haedal，后面可能得考虑接口处理或者拿链上数据
      // const category = clmmPoolAddress ? 'haedal' : 'haedal-v2'
      const vaultId = currentVaultApiInfo?.id || currentVaultApiInfo?.vaultId
      const coinTypeA = currentVaultApiInfo?.coin_type_a || currentVaultApiInfo?.coinTypeA
      const coinTypeB = currentVaultApiInfo?.coin_type_b || currentVaultApiInfo?.coinTypeB

      rewardCoinList.push(coinTypeA, coinTypeB)

      // const poolContractInfo =
      //   category == 'haedal'
      //     ? await volatileVaultsSdk?.CetusClmmSDK?.Pool.getPool(clmmPoolAddress)
      //     : await volatileVaultsSdk?.CetusDlmmSDK?.Pool.getPool(dlmmPoolAddress)
      // const vaultContractInfo =
      //   category == 'haedal' ? await volatileVaultsSdk.Vaults.getPool(vaultId) : await volatileVaultsSdk.VaultsV2.getPool(vaultId)
      // const positionInfo =
      //   category == 'haedal'
      //     ? buildVaultsBalance(currentAccount?.address || '', item.balance, vaultContractInfo, poolContractInfo)
      //     : await buildVaultsBalanceV2(volatileVaultsSdk, item.balance, vaultContractInfo, poolContractInfo, currentAccount?.address || '')
      // console.log('🚀🚀🚀 ~ useGetVaultsFarmingApiInfo.ts:166 ~ processFarmingData ~ positionInfo:', positionInfo)

      // const tokenA = await getTokenInfo(coinTypeA)
      // const tokenB = await getTokenInfo(coinTypeB)

      // const farmingPoolAmountA = d(positionInfo.amount_a)
      //   .div(10 ** tokenA?.decimals)
      //   .toString()
      // const farmingPoolAmountB = d(positionInfo.amount_b)
      //   .div(10 ** tokenB?.decimals)
      //   .toString()

      const isActiveVaultsFarming = !!item?.rewardConfigs?.filter((rItem: any) => rItem?.rate && Number(rItem?.rate) > 0)?.[0]

      vaultsFarmObj[vaultId] = {
        ...item,
        isVaultsFarming: true,
        isActiveVaultsFarming,
        rewardList: [],
        // farmingPoolAmountA,
        // farmingPoolAmountB,
        coinTypeA,
        coinTypeB
      }

      for (const rewardItem of rewardConfigs) {
        const rewardRate = d(rewardItem?.rate || 0)
        if (rewardRate.lte(0)) continue

        const rewardDecimals = rewardItem?.coinDetail?.decimals
        const rewardItemRate = rewardRate
          .mul(60 * 60 * 24)
          .div(10 ** rewardDecimals)
          .toString()

        const rewardItemRateDisplay = formatNumber(d(rewardItemRate).toString(), 2)

        vaultsFarmObj[vaultId].rewardList.push({
          rewardItemRate,
          ...rewardItem,
          rewardCoinType: rewardItem.rewardCoinType,
          rewardItemRateDisplay
        })
        rewardCoinList.push(rewardItem.rewardCoinType)
      }
    }

    return { vaultsFarmObj, rewardCoinList: [...new Set(rewardCoinList)] }
  }

  // 4. 主入口
  const getHaedalFarmingList = async () => {
    console.log(count, 'getHaedalFarmingList')
    if (count >= MAX_COUNT) return
    const haedalList = await getHaedalFarmingApiData()
    console.log('🚀🚀🚀 ~ useGetVaultsFarmingApiInfo.ts:118 ~ getHaedalFarmingList ~ haedalList:', haedalList)
    const vaultsObj = await getVaultsApiData()
    console.log('🚀🚀🚀 ~ useGetVaultsFarmingApiInfo.ts:211 ~ getHaedalFarmingList ~ vaultsObj:', vaultsObj)
    const { vaultsFarmObj, rewardCoinList } = await processFarmingData(haedalList, vaultsObj)
    console.log({ haedalList, vaultsObj, vaultsFarmObj, rewardCoinList }, 'getHaedalFarmingList')

    console.log('🚀🚀🚀 ~ useGetVaultsFarmingApiInfo.ts:134 ~ getHaedalFarmingList ~ vaultsFarmObj:', vaultsFarmObj)
    setVaultsFarmObj(vaultsFarmObj)
    fetchTokenPrices(rewardCoinList)
    setCount(prev => prev + 1)
    return { vaultsFarmObj }
  }

  return { getHaedalFarm: getHaedalFarmingList, getHaedalFarmingList }
}
