import useVaultsFarmingStore from '@/store/vaults-farming'
import { useMemo } from 'react'

// 获取当前vaults farming
export default function useCurrentVaultsFarm(vaultId: string) {
  const { vaultsFarmObj } = useVaultsFarmingStore()

  const currentVaultsFarm = useMemo(() => {
    return vaultsFarmObj[vaultId]
  }, [vaultsFarmObj, vaultId])

  const isVaultsFarming = useMemo(() => {
    return currentVaultsFarm?.isVaultsFarming
  }, [currentVaultsFarm, vaultId])

  const isActiveVaultsFarming = useMemo(() => {
    return currentVaultsFarm?.isActiveVaultsFarming
  }, [currentVaultsFarm, vaultId])

  return { currentVaultsFarm, isVaultsFarming, isActiveVaultsFarming }
}
