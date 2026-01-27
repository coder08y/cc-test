import useVaultHoadings from '@/hooks/vault-v2/useVaultsHoldings'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { useAccountStore } from '@cetus/stores'
import { isAvailableObject } from '@cetus/utils'
import { Flex, Skeleton, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

function VaultsHoldings({ vaultId, category, color = 'text_caption' }: { vaultId: string; category: string; color?: string }) {
  const { currentAccount } = useAccountStore()
  const { vaultsPositionObj } = useVaultsPositionStore()

  const currentVaultPosition = useMemo(() => {
    if (isAvailableObject(vaultsPositionObj)) {
      return vaultsPositionObj[vaultId]
    }
  }, [vaultsPositionObj, vaultId])

  const { holdingAmountDisplay } = useVaultHoadings(
    currentVaultPosition?.displayAmountA,
    currentVaultPosition?.displayAmountB,
    currentVaultPosition?.displayCoinTypeA,
    currentVaultPosition?.displayCoinTypeB,
    undefined,
    undefined,
    category
  )

  const isLoaded = useMemo(() => {
    return !!isAvailableObject(vaultsPositionObj) || !currentAccount?.address
  }, [vaultsPositionObj, currentAccount?.address])

  return (
    <Flex justifyContent="flex-end">
      <Skeleton isLoaded={isLoaded} width={isLoaded ? 'auto' : '80px'} borderRadius="4px">
        <Text textColor={color} textAlign="right" fontWeight="500">
          {!currentAccount?.address || !isAvailableObject(vaultsPositionObj) ? '--' : holdingAmountDisplay}
        </Text>
      </Skeleton>
    </Flex>
  )
}

export default VaultsHoldings
