import ZapTabs from '@/components/zap/ZapTabs'
import useZap from '@/hooks/zap/useZap'

import { TradeInput } from '@cetus/design'
import { d } from '@cetus/utils'
import { VStack } from '@chakra-ui/react'
import { useEffect } from 'react'

export default function ZapDeposite({
  action,
  apiPoolInfo,
  currentSqrtPrice,
  lowerTick,
  upperTick,
  onlyAmountA,
  onlyAmountB,
  liquidity,
  slideValue,
  currentPosLiquidityData
}: {
  action: 'Deposit' | 'Withdraw'
  apiPoolInfo: any
  currentSqrtPrice: string
  lowerTick?: any
  upperTick?: any
  onlyAmountA?: string
  onlyAmountB?: string
  liquidity?: string
  slideValue?: string
  currentPosLiquidityData?: any
}) {
  const { currentTokens, currentZapToken, handleChangeZapToken, zapAmount, zapAmountRate, handleChangeAmount, zapTokenBalance } = useZap(
    action,
    apiPoolInfo,
    currentSqrtPrice,
    lowerTick,
    upperTick,
    onlyAmountA,
    onlyAmountB,
    liquidity,
    slideValue,
    currentPosLiquidityData
  )

  useEffect(() => {
    if (action === 'Withdraw') {
      if (d(zapAmount).gt(zapTokenBalance?.balanceFormat || '0')) {
        handleChangeAmount(zapTokenBalance?.balanceFormat)
      }
    }
  }, [zapAmount, action, zapTokenBalance?.balanceFormat])

  return (
    <VStack w="100%">
      <ZapTabs tokens={currentTokens} current={currentZapToken} onSelect={handleChangeZapToken} />
      <TradeInput
        wrapStyle={{ h: '108px' }}
        placeholder="0.0"
        value={zapAmount}
        onChange={handleChangeAmount}
        balance={zapTokenBalance?.balanceFormat || ''}
        amountValue={zapAmountRate}
        token={currentZapToken}
        needRemainBalance={action === 'Withdraw' ? false : true}
        balanceLabel={action === 'Withdraw' ? 'Available' : undefined}
      />
    </VStack>
  )
}
