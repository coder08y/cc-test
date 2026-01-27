import ZapTabs from '@/components/zap/ZapTabs'
import UseZap from '@/hooks/zap/useZap'

import { TradeInput } from '@cetus/design'
import { VStack } from '@chakra-ui/react'

export default function ZapWithdraw({ apiPoolInfo, lowerTick, upperTick }: { apiPoolInfo: any; lowerTick?: any; upperTick?: any }) {
  const { currentTokens, currentZapToken, handleChangeZapToken, zapAmount, zapAmountRate, handleChangeAmount, zapTokenBalance } = UseZap(
    apiPoolInfo,
    lowerTick,
    upperTick
  )

  return (
    <VStack w="100%">
      <ZapTabs tokens={currentTokens} current={currentZapToken} onSelect={handleChangeZapToken} />
      <TradeInput
        placeholder="0.0"
        value={zapAmount}
        onChange={handleChangeAmount}
        balance={zapTokenBalance?.balanceFormat || ''}
        amountValue={zapAmountRate}
        token={currentZapToken}
      />
    </VStack>
  )
}
