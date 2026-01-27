import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPoolContractStore from '@/store/vaults-v2/useVaultsPoolContract'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { isAvailableObject } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { Pool as ClmmPool } from '@cetusprotocol/sui-clmm-sdk'
import { useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import useGetPythLastPrice from './pyth-price/useGetPythLastPrice'
import useGetVaultPoolList from './useGetVaultPoolList'
import useGetVaultsContract from './useGetVaultsContract'
import useGetVaultsPosition from './useGetVaultsPosition'
import useVaultList from './useVaultList'
import useVaultsMergeRequest from './useVaultsMergeRequest'

export default function useCurrentVaultDetail() {
  const { setCurrentVaultPosition, vaultsPositionObj, setCurrentVaultPositionLoading, setVaultsPositionObj } = useVaultsPositionStore()
  const { vaultClmmPoolContractInfoObj, setLstVaultContractInfoObj, setHaedalVaultContractInfoObj, vaultDlmmPoolContractInfoObj } =
    useVaultsPoolContractStore()
  const { setVaultsFarmingStakeLoading } = useVaultsFarmingStore()
  const { volatileVaultsSdk } = usePeripherySDKStore()
  const vaultsSdk = useSdk('vaults')
  const { vaultsList } = useVaultsListV2Store()
  const { getVaultPoolList } = useGetVaultPoolList()
  const { getVaultPosition } = useGetVaultsPosition()
  const { getVaultsContractInfo } = useGetVaultsContract()
  const { getVaultsContractInfoWithMerge } = useVaultsMergeRequest()
  const { getPythLastPrice } = useGetPythLastPrice()
  const { fetchTokenPrices } = useTokenPrice()
  const { setFromToken, setToToken } = useVaultsActionStore()
  const { getVaultsLpTokenList } = useVaultList()

  const { currentAccount } = useAccountStore()
  const currentAcc = useRef(currentAccount?.address)
  useEffect(() => {
    currentAcc.current = currentAccount?.address
  }, [currentAccount?.address])

  const { vaultId } = useParams()
  const { pathname } = useLocation()

  const vaultIdRef = useRef(vaultId)
  useEffect(() => {
    vaultIdRef.current = vaultId
  }, [vaultId])

  // 获取当前vault详情
  const getCurrentVaultDetail = (vaultId: string, isRefresh = false) => {
    if (vaultIdRef.current !== vaultId && pathname.indexOf('/vaults/') > -1) return
    // 如果当前vault详情已存在，则直接返回
    if (isAvailableObject(vaultsPositionObj) && vaultsPositionObj[vaultId] && !isRefresh) {
      const currentVaultPositionData = vaultsPositionObj[vaultId]
      if (currentVaultPositionData.ownerAddress == currentAcc.current && currentAcc.current && currentVaultPositionData.vaultBalance !== undefined) {
        const { displayTokenA, displayTokenB } = currentVaultPositionData
        setFromToken(displayTokenA)
        setToToken(displayTokenB)
        setCurrentVaultPosition(currentVaultPositionData)
        setCurrentVaultPositionLoading(false)
      } else {
        getCurrentVaultByVaultId(vaultId, isRefresh)
      }
    } else {
      // 没有的话获取最新的
      getCurrentVaultByVaultId(vaultId, isRefresh)
    }
  }

  // 获取当前Vault 池子信息、token汇率
  const getCurrentVaultContractInfo = async (vaultId: any) => {
    // 获取vault列表
    const { poolList: list } = await getVaultPoolList()

    // 获取vaultLP Token信息
    const lpTokenInfoObj = await getVaultsLpTokenList(list)
    // 获取当前vault详情
    const vault = list.filter((item: any) => item.vaultId == vaultId)[0]
    const { displayTokenA, displayTokenB } = vault
    setFromToken(displayTokenA)
    setToToken(displayTokenB)
    if (vault.category == 'haedal' || vault.category == 'haevault_v2') {
      getPythLastPrice([fixCoinType(vault.displayTokenA.coin_type, false), fixCoinType(vault.displayTokenB.coin_type, false)], vault.category)
    } else {
      fetchTokenPrices([fixCoinType(vault.displayTokenA.coin_type, false), fixCoinType(vault.displayTokenB.coin_type, false)], vault.category)
    }
    // 获取vaultsContractInfo
    const { lstVaultContractInfoObj, haedalVaultContractInfoObj, allClmmPoolContractInfoObj, dlmmVaultContractInfoObj, allDlmmPoolContractInfoObj } =
      await getVaultsContractInfo([vault])
    // const { lstVaultContractInfoObj, haedalVaultContractInfoObj, allClmmPoolContractInfoObj, dlmmVaultContractInfoObj, allDlmmPoolContractInfoObj } =
    //   await getVaultsContractInfoWithMerge([vault], true)

    console.log('🚀🚀🚀 ~ useCurrentVaultDetail.ts:93 ~ getCurrentVaultContractInfo ~ dlmmVaultContractInfoObj:', dlmmVaultContractInfoObj)
    // 获取clmmContractInfo
    const clmmContractInfo: ClmmPool[] = vault.clmmPoolAddress.map((clmmPoolAddress: string) => allClmmPoolContractInfoObj[clmmPoolAddress])
    // 获取dlmmContractInfo
    const dlmmContractInfo: DlmmPool[] = vault.dlmmPoolAddress.map((dlmmPoolAddress: string) => allDlmmPoolContractInfoObj[dlmmPoolAddress])
    // 获取vaultContractInfo
    const vaultContractInfo =
      vault.category == 'cetus'
        ? lstVaultContractInfoObj[vault.vaultId]
        : vault.category == 'haevault_v2'
          ? dlmmVaultContractInfoObj[vault.vaultId]
          : haedalVaultContractInfoObj[vault.vaultId]
    return { vaultContractInfo, clmmContractInfo, dlmmContractInfo, vault, lpTokenInfoObj, category: vault.category }
  }

  // 获取当前vault详情
  const getCurrentVaultByVaultId = async (vaultId: any, isRefresh = false) => {
    try {
      if (currentAcc.current && !isRefresh) {
        setCurrentVaultPositionLoading(true)
      }
      const { vaultContractInfo, clmmContractInfo, vault, lpTokenInfoObj, dlmmContractInfo, category } = await getCurrentVaultContractInfo(vaultId)
      console.log('🚀🚀🚀 ~ useCurrentVaultDetail.ts:114 ~ getCurrentVaultByVaultId ~ vault:', vault)
      console.log('🚀🚀🚀 ~ useCurrentVaultDetail.ts:109 ~ getCurrentVaultByVaultId ~ dlmmContractInfo:', dlmmContractInfo)
      let currentVaultPosition: any = {}
      if ((category == 'haevault_v2' ? dlmmContractInfo : clmmContractInfo) && vaultContractInfo && currentAcc.current) {
        // 获取当前vault详情

        currentVaultPosition = await getVaultPosition(
          vault,
          [...dlmmContractInfo, ...clmmContractInfo],
          vaultContractInfo,
          false,
          undefined,
          currentAcc.current,
          lpTokenInfoObj
        )
        console.log('🚀🚀🚀 ~ useCurrentVaultDetail.ts:128 ~ getCurrentVaultByVaultId ~ currentVaultPosition:', currentVaultPosition)
        console.log(
          '🚀🚀🚀 ~ useCurrentVaultDetail.ts:130 ~ getCurrentVaultByVaultId ~ currentVaultPosition[vault.vaultId]:',
          currentVaultPosition,
          vault.vaultId,
          currentVaultPosition[vault.vaultId].ownerAddress
        )
        if (currentVaultPosition[vault.vaultId].ownerAddress == currentAcc.current && currentAcc.current) {
          // 设置当前vault详情
          setCurrentVaultPosition(currentVaultPosition[vault.vaultId])
          setCurrentVaultPositionLoading(false)
        }
      } else {
        setCurrentVaultPositionLoading(false)
        setVaultsFarmingStakeLoading(false)
      }
    } catch (error) {
      setCurrentVaultPositionLoading(false)
    }
  }

  // 更新当前vault详情
  const updateCurrentVaultById = async (vaultId: string) => {
    const vault = vaultsList.filter((item: any) => item.vaultId == vaultId)[0]
    const clmmContractInfo: ClmmPool[] = vault.clmmPoolAddress.map((clmmPoolAddress: string) => vaultClmmPoolContractInfoObj[clmmPoolAddress])
    const dlmmContractInfo: DlmmPool[] = vault.dlmmPoolAddress.map((dlmmPoolAddress: string) => vaultDlmmPoolContractInfoObj[dlmmPoolAddress])
    const category = vault.category
    let vaultContractInfo
    if (vault.category == 'cetus') {
      vaultContractInfo = await vaultsSdk!.Vaults.getVault(vault.vaultId)
    } else if (vault.category == 'haedal') {
      vaultContractInfo = await volatileVaultsSdk.Vaults.getPool(vault.vaultId)
    } else if (vault.category == 'haevault_v2') {
      vaultContractInfo = await volatileVaultsSdk.VaultsV2.getPool(vault.vaultId)
    }
    if (vault.category == 'cetus') {
      setLstVaultContractInfoObj({ [vault.vaultId]: vaultContractInfo })
    } else {
      setHaedalVaultContractInfoObj({ [vault.vaultId]: vaultContractInfo })
    }
    if ((category == 'haevault_v2' ? dlmmContractInfo : clmmContractInfo) && vaultContractInfo) {
      // 获取当前vault详情
      console.log('🚀🚀🚀 ~ useCurrentVaultDetail.ts:152 ~ updateCurrentVaultById ~ 获取当前vault详情:')
      const currentVaultPosition = await getVaultPosition(vault, [...dlmmContractInfo, ...clmmContractInfo], vaultContractInfo)
      console.log('🚀🚀🚀 ~ useCurrentVaultDetail.ts:173 ~ updateCurrentVaultById ~ currentVaultPosition:', currentVaultPosition)
      if (currentVaultPosition[vault.vaultId].ownerAddress == currentAcc.current && currentAcc.current) {
        // 设置当前vault详情
        setCurrentVaultPosition(currentVaultPosition[vault.vaultId])
        setVaultsPositionObj(currentVaultPosition)
      }
    }
  }

  return { getCurrentVaultDetail, getCurrentVaultContractInfo, getCurrentVaultByVaultId, updateCurrentVaultById }
}
