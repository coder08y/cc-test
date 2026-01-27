import useGetVaultsContract from '@/hooks/vault-v2/useGetVaultsContract'
import useVaultsPoolContract from '@/store/vaults-v2/useVaultsPoolContract'
// vaults相关的请求做一些合并
import { useSdk } from '@cetus/sdk-factory'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { parseDlmmPool } from '@cetusprotocol/dlmm-sdk'
import { buildPool as buildClmmPool } from '@cetusprotocol/sui-clmm-sdk'
import { VaultsUtils } from '@cetusprotocol/vaults-sdk'
import { bcs } from '@mysten/sui/bcs'
import { Transaction } from '@mysten/sui/transactions'
import { buildPoolData as haedalV1BuildPoolData, buildPoolV2Data as haedalV2BuildPoolData } from 'haedal-vault-sdk'

export default function useVaultsMergeRequest() {
  const vaultsSdk = useSdk('vaults')
  const { getVaultPool } = useGetVaultsContract()
  const { haedalFarmSdk, volatileVaultsSdk } = usePeripherySDKStore()
  const {
    setLstVaultContractInfoObj,
    setHaedalVaultContractInfoObj,
    setVaultClmmPoolContractInfoObj,
    setDlmmVaultContractInfoObj,
    setVaultDlmmPoolContractInfoObj
  } = useVaultsPoolContract()

  const getVaultsContractInfoWithMerge = async (list: any[], isGetVaultsPool = false) => {
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ list:', list)
    const lstVaultIds: string[] = []
    const haedalV1VaultIds: string[] = []
    const haedalV2VaultIds: string[] = []
    let vaultClmmPoolIds: string[] = []
    let vaultDlmmPoolIds: string[] = []

    // 分类统计cetus vaults ids, haedalv1 vaults ids, haedalv2 vaults ids, clmm pool ids, dlmm pool ids, 一遍后面通过一个rpc请求拿到这些数据
    list.forEach(item => {
      if (item.category == 'cetus') {
        lstVaultIds.push(item.vaultId)
        vaultClmmPoolIds.push(...item.clmmPoolAddress)
      } else if (item.category == 'haedal') {
        haedalV1VaultIds.push(item.vaultId)
        vaultClmmPoolIds.push(...item.clmmPoolAddress)
      } else if (item.category == 'haevault_v2') {
        haedalV2VaultIds.push(item.vaultId)
        if (item.clmmPoolAddress) {
          vaultClmmPoolIds.push(...item.clmmPoolAddress)
        }
        if (item.dlmmPoolAddress) {
          vaultDlmmPoolIds.push(...item.dlmmPoolAddress)
        }
      }
    })

    vaultClmmPoolIds = Array.from(new Set(vaultClmmPoolIds))
    vaultDlmmPoolIds = Array.from(new Set(vaultDlmmPoolIds))

    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ lstVaultIds:', lstVaultIds)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ haedalV1VaultIds:', haedalV1VaultIds)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ haedalV2VaultIds:', haedalV2VaultIds)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ vaultClmmPoolIds:', vaultClmmPoolIds)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ vaultDlmmPoolIds:', vaultDlmmPoolIds)

    const res = await vaultsSdk!.FullClient.batchGetObjects(
      [...lstVaultIds, ...haedalV1VaultIds, ...haedalV2VaultIds, ...vaultClmmPoolIds, ...vaultDlmmPoolIds],
      {
        showContent: true,
        showType: true
      }
    )
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ res:', res)

    let marketObj: any = {}
    if (haedalV2VaultIds.length > 0 && isGetVaultsPool) {
      marketObj = await volatileVaultsSdk.VaultsV2.geMarketList(haedalV2VaultIds)
    }

    let lstVaultContractInfoObj: any = {}
    let haedalVaultContractInfoObj: any = {}
    let dlmmVaultContractInfoObj: any = {}
    let allClmmPoolContractInfoObj: any = {}
    let allDlmmPoolContractInfoObj: any = {}

    for (let i = 0; i < res?.length; i++) {
      const item = res[i]
      const data = res[i]?.data
      const objectId = data?.objectId
      if (!objectId) {
        continue
      }

      if (lstVaultIds.includes(objectId)) {
        const info = VaultsUtils.buildPool(item)
        lstVaultContractInfoObj[info.id] = info
      } else if (haedalV1VaultIds.includes(objectId)) {
        const info = haedalV1BuildPoolData(data?.content)
        haedalVaultContractInfoObj[info.id] = info
      } else if (haedalV2VaultIds.includes(objectId)) {
        const info = haedalV2BuildPoolData(data?.content)
        dlmmVaultContractInfoObj[info.id] = {
          ...info,
          markets: isGetVaultsPool ? marketObj?.[info?.id] : undefined
        }
      } else if (vaultClmmPoolIds.includes(objectId)) {
        const info = buildClmmPool(item)
        allClmmPoolContractInfoObj[info.id] = info
      } else if (vaultDlmmPoolIds.includes(objectId)) {
        const info = parseDlmmPool(item)
        allDlmmPoolContractInfoObj[info.id] = info
      }
    }

    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ lstVaultContractInfoObj:', lstVaultContractInfoObj)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ haedalVaultContractInfoObj:', haedalVaultContractInfoObj)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ dlmmVaultContractInfoObj:', dlmmVaultContractInfoObj)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ allClmmPoolContractInfoObj:', allClmmPoolContractInfoObj)
    console.log('🚀 ~ getVaultsContractInfoWithMerge ~ allDlmmPoolContractInfoObj:', allDlmmPoolContractInfoObj)

    // 保留原getVaultsContractInfo中的请求部分
    getVaultPool(
      list,
      allClmmPoolContractInfoObj,
      lstVaultContractInfoObj,
      haedalVaultContractInfoObj,
      allDlmmPoolContractInfoObj,
      dlmmVaultContractInfoObj
    )

    setLstVaultContractInfoObj(lstVaultContractInfoObj)
    setHaedalVaultContractInfoObj(haedalVaultContractInfoObj)
    setDlmmVaultContractInfoObj(dlmmVaultContractInfoObj)
    setVaultClmmPoolContractInfoObj(allClmmPoolContractInfoObj)
    setVaultDlmmPoolContractInfoObj(allDlmmPoolContractInfoObj)

    return {
      lstVaultContractInfoObj,
      haedalVaultContractInfoObj,
      allClmmPoolContractInfoObj,
      allDlmmPoolContractInfoObj,
      dlmmVaultContractInfoObj
    }
  }

  const getMultiVaultsFarmingStaked = async (list: any[], account: string) => {
    try {
      const tx = new Transaction()

      list.forEach(item => {
        tx.moveCall({
          target: `${haedalFarmSdk.sdkOptions.farms.packageId}::interface::get_deposit`,
          typeArguments: [item?.stakeCoinType],
          arguments: [tx.object(item?.poolId)]
        })
      })

      const result: any = await vaultsSdk?.FullClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: account
      })
      console.log('🚀 ~ getMultiVaultsFarmingStaked ~ result:', result)

      const datas = result.results
      let ids: any = []
      datas.forEach((data: any) => {
        const { returnValues } = data
        if (returnValues && returnValues.length > 0) {
          const [value] = returnValues[0]
          const d2 = Uint8Array.from(value)
          const result2 = bcs.Address.parse(d2)
          ids.push(result2)
        }
      })

      ids = ids.filter((item: string) => item !== '0x0000000000000000000000000000000000000000000000000000000000000000')
      console.log('🚀 ~ getMultiVaultsFarmingStaked ~ ids:', ids)
      const res: any = await vaultsSdk?.FullClient.batchGetObjects(ids, {
        showContent: true,
        showType: true,
        showOwner: true
      })
      console.log('🚀 ~ getMultiVaultsFarmingStaked ~ res:', res)

      const haedalFarmingStakedObj: any = {}
      res.forEach((item: any) => {
        const data = item.data
        const objectId = data.objectId
        const content = data.content
        const farmingId = content?.fields?.pool
        haedalFarmingStakedObj[farmingId] = {
          stakeObjectId: objectId,
          stakedBalance: content?.fields?.amount
        }
      })

      console.log('🚀 ~ getMultiVaultsFarmingStaked ~ haedalFarmingStakedObj:', haedalFarmingStakedObj)
      return haedalFarmingStakedObj
    } catch (error) {
      console.log('getMultiVaultsFarmingStaked error', error)
    }
  }

  return {
    getVaultsContractInfoWithMerge,
    getMultiVaultsFarmingStaked
  }
}
