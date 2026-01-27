import useVaultFarmsButtonStatus from '@/hooks/vaults-farming/useVaultFarmingButtonStatus'
import { useVaultFarmingPage } from '@/hooks/vaults-farming/useVaultFarmingPage'
import useVaultsFarmingStore from '@/store/vaults-farming'
import { TradeInput } from '@cetus/design'
import { Button } from '@chakra-ui/react'
import { useMemo } from 'react'

// vaults质押farming
export function FarmingStake({ currentVaultPosition, currentVaultsFarming }: { currentVaultPosition: any; currentVaultsFarming: any }) {
  const { vaultsFarmingStaked } = useVaultsFarmingStore()
  const currentVaultsFarmingStaked = useMemo(() => {
    return vaultsFarmingStaked[currentVaultPosition.vaultId]
  }, [vaultsFarmingStaked, currentVaultPosition.vaultId])
  const { handleChangeStakeValue, stakeAmount, farmStakeAction, isLoading } = useVaultFarmingPage(
    currentVaultPosition?.vaultId,
    currentVaultsFarming,
    currentVaultsFarmingStaked
  )
  const { isDisabled, btnText } = useVaultFarmsButtonStatus(currentVaultPosition?.vaultBalanceFormat, stakeAmount, currentVaultsFarming, true)

  return (
    <>
      <TradeInput
        value={stakeAmount}
        onChange={handleChangeStakeValue}
        token={currentVaultsFarming?.coinDetail}
        placeholder=""
        balance={currentVaultPosition?.vaultBalanceFormat}
        wrapStyle={{
          height: '110px'
        }}
      />
      <Button w="100%" h="52px" fontWeight="600" onClick={farmStakeAction} isDisabled={isDisabled} isLoading={isLoading}>
        {btnText || 'Stake'}
      </Button>
    </>
  )
}
