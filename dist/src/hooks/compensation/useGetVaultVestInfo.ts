import useCompensationStore from '@/store/compensation'
import { useSdk } from '@cetus/sdk-factory'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { haedalVaultVestConfig } from '@cetus/types'

export default function useGetVaultVestInfo() {
  const vaultSdk = useSdk('vaults')
  const { setVaultVestInfoObj } = useCompensationStore()
  const { volatileVaultsSdk } = usePeripherySDKStore()

  const getVaultsVestInfoList = async (vaultIdList: string[], haedalVaultIdList: string[]) => {
    console.log('🚀🚀🚀 ~ useGetVaultVestInfo.ts:11 ~ getVaultsVestInfoList ~ haedalVaultIdList:', haedalVaultIdList)
    console.log('🚀🚀🚀 ~ useGetVaultVestInfo.ts:11 ~ getVaultsVestInfoList ~ vaultIdList:', vaultIdList)
    try {
      const vestInfoList = await vaultSdk?.Vest.getVaultsVestInfoList(vaultIdList)
      const haedalVestInfoList = haedalVaultVestConfig == 'open' ? await volatileVaultsSdk.Vest.getVaultsVestInfoList(haedalVaultIdList) : []
      console.log('🚀🚀🚀 ~ useGetVaultVestInfo.ts:11 ~ getVaultsVestInfoList ~ vestInfoList:', vestInfoList, haedalVestInfoList)
      if (vestInfoList || haedalVestInfoList) {
        const vestInfoObj = [...vestInfoList, ...haedalVestInfoList].reduce((acc: Record<string, any>, curr: any) => {
          acc[curr.vault_id] = curr
          return acc
        }, {})
        setVaultVestInfoObj(vestInfoObj)
        return vestInfoObj
      }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useGetVaultVestInfo.ts:14 ~ getVaultsVestInfoList ~ error:', error)
    }
  }

  return { getVaultsVestInfoList }
}
