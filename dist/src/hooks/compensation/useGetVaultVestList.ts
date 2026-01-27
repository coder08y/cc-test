import useCompensationStore from '@/store/compensation'
import { useSdk } from '@cetus/sdk-factory'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { haedalVaultVestConfig } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import useGetVaultPoolList from '../vault-v2/useGetVaultPoolList'
import { mapVaultListToObject, wrapVaultVestList } from './wrapVaultVestList'

export default function useGetVaultVestList() {
  const vaultSdk = useSdk('vaults')
  const { volatileVaultsSdk } = usePeripherySDKStore()
  const { getVaultPoolList } = useGetVaultPoolList()
  const { setVaultPositionLoading, setVaultPositionList } = useCompensationStore()
  const hasHaedal = haedalVaultVestConfig == 'open'

  const getVaultVestList = async (account: string, isSetLoading = true) => {
    if (isSetLoading) {
      setVaultPositionLoading(true)
    }
    try {
      const { poolList: vaultPoolsList } = await getVaultPoolList()
      const nftList = await vaultSdk?.Vest.getOwnerVaultVestNFT(account)
      const haedalNftList = hasHaedal ? await volatileVaultsSdk.Vest.getOwnerVaultVestNFT(account) : []
      console.log('🚀🚀🚀 ~ useGetVaultVestList.ts:19 ~ getVaultVestList ~ nftList:', nftList)
      console.log('🚀🚀🚀 ~ useGetVaultVestList.ts:20 ~ getVaultVestList ~ haedalNftList:', haedalNftList)
      const vaultListObj = mapVaultListToObject(vaultPoolsList)
      console.log('🚀🚀🚀 ~ useGetVaultVestList.ts:23 ~ getVaultVestList ~ vaultListObj:', vaultListObj)
      const result = await wrapVaultVestList(nftList, vaultListObj)
      const haedalResult = hasHaedal ? await wrapVaultVestList(haedalNftList, vaultListObj) : []
      const vaultList = [...result, ...haedalResult]
      console.log('🚀🚀🚀 ~ useGetVaultVestList.ts:24 ~ getVaultVestList ~ vaultList:', vaultList)
      const availableVestList =
        envConfigs.env == 'testnet'
          ? vaultList?.filter(
              ele =>
                vaultSdk?.sdkOptions?.vest?.config?.create_event_list?.some(i => i.vault_vester_id === ele.vestData.vester_id) ||
                volatileVaultsSdk?.sdkOptions?.vest?.config?.create_event_list?.some(i => i.vault_vester_id === ele.vestData.vester_id)
            )
          : vaultList
      console.log('🚀🚀🚀 ~ useGetVaultVestList.ts:39 ~ getVaultVestList ~ availableVestList:', availableVestList)
      setVaultPositionList(availableVestList)
      return availableVestList
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetVaultVestList.ts:25 ~ getVaultVestList ~ error:', error)
      setVaultPositionLoading(false)
    }
  }

  const getCurrentVaultVest = async (account: string, vestId: string, vaultItemObj: any, category: string) => {
    let nftList
    if (category == 'haedal') {
      nftList = await volatileVaultsSdk?.Vest.getOwnerVaultVestNFT(account)
    } else {
      nftList = await vaultSdk?.Vest.getOwnerVaultVestNFT(account)
    }
    const nftItem = nftList?.filter(ele => ele.id == vestId)
    const result = wrapVaultVestList(nftItem, vaultItemObj)
    return result
  }

  return { getVaultVestList, getCurrentVaultVest }
}
