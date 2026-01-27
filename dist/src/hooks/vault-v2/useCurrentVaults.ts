import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import { useMemo } from 'react'

export default function useCurrentVaults(vaultId: string) {
  const { vaultListObj } = useVaultsListV2Store()
  const currentVaults = useMemo(() => {
    return vaultListObj[vaultId]
  }, [vaultListObj, vaultId])
  return { currentVaults }
}
