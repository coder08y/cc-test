import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { isAvailableObject, symbolDataDisplayProcessing } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import useGetPythTokenPrice from './pyth-price/useGetPythTokenPrice'

// 处理池子质押数量、用户持仓数量
export default function useVaultHoadings(
  displayAmountA: string,
  displayAmountB: string,
  displayCoinTypeA: string,
  displayCoinTypeB: string,
  displayVaultAmountA?: string,
  displayVaultAmountB?: string,
  category?: string
) {
  const { getTokenAmountValueByPyth, priceMap } = useGetPythTokenPrice()
  const { getTokenAmountValue } = useTokenPrice()

  if ((!displayAmountA && !displayAmountB) || (!isAvailableObject(priceMap) && category != 'cetus')) {
    return {
      holdCoinAValue: '--',
      holdCoinBValue: '--',
      holdCoinAValueDisplay: '0',
      holdCoinBValueDisplay: '0',
      holdingAmount: '0',
      holdingAmountDisplay: '--',
      holdingVaultAmount: '0',
      holdingVaultAmountDisplay: '--'
    }
  }

  const holdCoinAValue =
    category == 'haedal' || category == 'haevault_v2'
      ? getTokenAmountValueByPyth(displayCoinTypeA, displayAmountA)
      : getTokenAmountValue(displayCoinTypeA, displayAmountA)
  const holdCoinBValue =
    category == 'haedal' || category == 'haevault_v2'
      ? getTokenAmountValueByPyth(displayCoinTypeB, displayAmountB)
      : getTokenAmountValue(displayCoinTypeB, displayAmountB)
  const holdCoinAValueDisplay = symbolDataDisplayProcessing(holdCoinAValue, '$')
  const holdCoinBValueDisplay = symbolDataDisplayProcessing(holdCoinBValue, '$')

  const holdingAmount = d(holdCoinAValue)
    .plus(holdCoinBValue || 0)
    .toString()

  const holdingAmountDisplay = symbolDataDisplayProcessing(holdingAmount, '$')
  const holdVaultCoinAValue =
    category == 'haedal' || category == 'haevault_v2'
      ? getTokenAmountValueByPyth(displayCoinTypeA, displayVaultAmountA)
      : getTokenAmountValue(displayCoinTypeA, displayVaultAmountA)
  const holdVaultCoinBValue =
    category == 'haedal' || category == 'haevault_v2'
      ? getTokenAmountValueByPyth(displayCoinTypeB, displayVaultAmountB)
      : getTokenAmountValue(displayCoinTypeB, displayVaultAmountB)
  const holdVaultCoinAValueDisplay = symbolDataDisplayProcessing(holdVaultCoinAValue, '$')
  const holdVaultCoinBValueDisplay = symbolDataDisplayProcessing(holdVaultCoinBValue, '$')

  const holdingVaultAmount = d(holdVaultCoinAValue)
    .plus(holdVaultCoinBValue || 0)
    .toString()
  const holdingVaultAmountDisplay = symbolDataDisplayProcessing(holdingVaultAmount, '$')

  return {
    holdCoinAValue,
    holdCoinBValue,
    holdCoinAValueDisplay,
    holdCoinBValueDisplay,
    holdingAmount,
    holdingAmountDisplay,
    holdingVaultAmount,
    holdingVaultAmountDisplay,
    displayAmountA,
    displayAmountB
  }
}
