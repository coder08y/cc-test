import { d } from '@cetusprotocol/common-sdk'

export default function useVaultFarmsButtonStatus(availableBalance: string, stakeAmount: string, currentFarm: any, isAdd: boolean) {
  let btnInfo = {
    isDisabled: false,
    btnText: ''
  }

  if (!stakeAmount || d(stakeAmount).lte(0)) {
    btnInfo.isDisabled = true
  }

  if (d(stakeAmount || '0').gt(d(availableBalance || '0'))) {
    btnInfo.isDisabled = true
    btnInfo.btnText = isAdd ? `Insufficient  ${currentFarm.coinDetail.symbol} balance` : `Invalid Amount`
  }

  return btnInfo
}
