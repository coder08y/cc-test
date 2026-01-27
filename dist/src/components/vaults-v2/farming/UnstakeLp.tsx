import useVaultFarmsButtonStatus from '@/hooks/vaults-farming/useVaultFarmingButtonStatus'
import { useVaultFarmingPage } from '@/hooks/vaults-farming/useVaultFarmingPage'
import useVaultsFarmingStore from '@/store/vaults-farming'
import { TradeInput } from '@cetus/design'
import { Button } from '@chakra-ui/react'
import { useMemo } from 'react'

type UnstakeLpProps = {
  currentVaultPosition: any
  currentVaultsFarming: any
}
// vaults提取
export function UnstakeLp(props: UnstakeLpProps) {
  const { currentVaultsFarming, currentVaultPosition } = props
  const { vaultsFarmingStaked } = useVaultsFarmingStore()
  const currentVaultsFarmingStaked = useMemo(() => {
    return vaultsFarmingStaked[currentVaultPosition.vaultId]
  }, [vaultsFarmingStaked, currentVaultPosition.vaultId])
  const { handleChangeStakeValue, stakeAmount, farmUnStakeAction, isLoading } = useVaultFarmingPage(
    currentVaultPosition?.vaultId,
    currentVaultsFarming,
    currentVaultsFarmingStaked
  )
  const { isDisabled, btnText } = useVaultFarmsButtonStatus(currentVaultsFarmingStaked?.stakedBalanceFormat, stakeAmount, currentVaultsFarming, false)
  return (
    <>
      <TradeInput
        token={currentVaultsFarming?.coinDetail}
        value={stakeAmount}
        onChange={handleChangeStakeValue}
        placeholder="0"
        balance={currentVaultsFarmingStaked?.stakedBalanceFormat}
        wrapStyle={{ height: '110px' }}
      />
      <Button w="100%" h="52px" fontWeight="600" mt="8px" isDisabled={isDisabled} onClick={farmUnStakeAction} isLoading={isLoading}>
        {btnText || 'Unstake'}
      </Button>
    </>
  )
}
