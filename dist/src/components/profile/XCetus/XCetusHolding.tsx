import useProfileXCetusStore from '@/store/profile/xcetus'
import useXCetusStore from '@/store/xcetus/useXCetus'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import { Button } from '@chakra-ui/react'
import { useMemo } from 'react'
import Holding from './Holding'

type XCetusHoldingProps = {
  availableXCetusAmount: string
}
function XCetusHolding({ availableXCetusAmount }: XCetusHoldingProps) {
  const { currentAccount } = useAccountStore()
  const { veNFT, veNFTLoading, lockCetusListLoading } = useXCetusStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  const amountUSD = useMemo(() => {
    return getTokenAmountValue(
      envConfigs.cetus_coin.coin_type,
      fromDecimalsAmountFix(availableXCetusAmount || '0', envConfigs.x_cetus_coin.decimals)
    ).toString()
  }, [availableXCetusAmount, currentAccount?.address, coinPriceObj])

  const { setCurrentXCetusTab, setIsXCetusModalOpen } = useProfileXCetusStore()

  const onClickRedeem = () => {
    setIsXCetusModalOpen(true)
    setCurrentXCetusTab('Redeem CETUS')
  }

  const isLoading = (lockCetusListLoading || veNFTLoading) && veNFT !== undefined

  return (
    <Holding
      type="xcetus"
      amount={currentAccount ? formatNumber(fromDecimalsAmountFix(availableXCetusAmount || '0', 9)).toString() : '--'}
      amountUSD={amountUSD}
      isLoading={isLoading}
    >
      <Button
        onClick={onClickRedeem}
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
        Redeem
      </Button>
    </Holding>
  )
}

export default XCetusHolding
