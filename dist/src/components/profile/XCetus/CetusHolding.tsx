import useProfileXCetusStore from '@/store/profile/xcetus'
import useXCetusStore from '@/store/xcetus/useXCetus'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import { Button } from '@chakra-ui/react'
import { useMemo } from 'react'
import Holding from './Holding'

function CetusHolding() {
  const { currentAccount } = useAccountStore()
  const { balanceInfo } = useGetTokenBalance(envConfigs.cetus_coin)
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  const amountUSD = useMemo(() => {
    return getTokenAmountValue(
      envConfigs.cetus_coin.coin_type,
      fromDecimalsAmountFix(balanceInfo?.balance || '0', envConfigs.cetus_coin.decimals)
    ).toString()
  }, [balanceInfo?.balance, currentAccount?.address, coinPriceObj])

  const { setCurrentXCetusTab, setIsXCetusModalOpen } = useProfileXCetusStore()

  const onClickClaim = () => {
    setIsXCetusModalOpen(true)
    setCurrentXCetusTab('Get xCETUS')
  }

  const { veNFT, veNFTLoading, lockCetusListLoading } = useXCetusStore()
  return (
    <Holding
      type="cetus"
      amount={currentAccount ? formatNumber(balanceInfo?.balanceFormat || '0') : '--'}
      amountUSD={amountUSD}
      isLoading={(lockCetusListLoading || veNFTLoading) && veNFT !== undefined}
    >
      <Button
        onClick={onClickClaim}
        variant="outline"
        color="primary"
        flex="0 0 120px"
        h="32px"
        lineHeight="32px"
        w={{ base: '122px', lg: 'unset' }}
        borderRadius="8px"
        fontSize={{ base: '12px', lg: '14px' }}
        fontWeight="500"
      >
        Convert to xCETUS
      </Button>
    </Holding>
  )
}

export default CetusHolding
