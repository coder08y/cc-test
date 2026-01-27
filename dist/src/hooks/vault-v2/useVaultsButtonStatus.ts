import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'

export default function useVaultsButtonStatus(
  amountInputA: string,
  amountInputB: string,
  balanceA: string,
  balanceB: string,
  tokenA: Token,
  tokenB: Token,
  assetAction: string,
  isAdd: boolean,
  zapNumGtError: boolean,
  zapNumLtError: boolean,
  category: string,
  isCheckedZAP: boolean,
  preCalcError: string | undefined,
  preCalculateLoading: boolean
) {
  const { currentAccount } = useAccountStore()
  const { calculateResult } = useVaultsActionStore()

  // 按钮状态
  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: undefined,
      disabled: false
    }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    if (!tokenA || !tokenB) {
      btnInfo.disabled = true
      return btnInfo
    }

    // 判断输入
    // 双边
    if (assetAction === 'both') {
      if (!+amountInputA && !+amountInputB) {
        btnInfo.text = 'Enter an amount'
        btnInfo.disabled = true
        return btnInfo
      }
      if (isCheckedZAP && (!+amountInputA || !+amountInputB)) {
        btnInfo.text = 'Enter an amount'
        btnInfo.disabled = true
        return btnInfo
      }
    } else {
      // 单边为空
      if ((assetAction == tokenA?.coin_type && !+amountInputA) || (assetAction == tokenB?.coin_type && !+amountInputB)) {
        btnInfo.text = 'Enter an amount'
        btnInfo.disabled = true
        return btnInfo
      }

      // cetus单边SUI添加流动性最少10 sui
      // if (category == 'cetus') {
      //   if (isAdd) {
      //     const isSUI = CoinAssist.isSuiCoin(assetAction)
      //     if (
      //       (isSUI && assetAction === tokenA?.coin_type && d(amountInputA).lt(3)) ||
      //       (isSUI && assetAction === tokenB?.coin_type && d(amountInputB).lt(3))
      //     ) {
      //       btnInfo.text = 'Minimum deposit 3 SUI'
      //       btnInfo.disabled = true
      //       return btnInfo
      //     }
      //   }
      // }
    }

    // 判断余额
    // 双边
    if (assetAction == 'both') {
      if (d(amountInputA || '0').gt(balanceA || '0')) {
        btnInfo.disabled = true
        btnInfo.text = isAdd ? `Insufficient ${tokenA?.symbol} Balance` : 'Invalid Amount'
        return btnInfo
      }
      if (d(amountInputB || '0').gt(balanceB || '0')) {
        btnInfo.disabled = true
        btnInfo.text = isAdd ? `Insufficient ${tokenB?.symbol} Balance` : 'Invalid Amount'
        return btnInfo
      }
    }

    // 单边
    if (assetAction !== 'both') {
      if (d(amountInputA || '0').gt(balanceA || '0')) {
        btnInfo.disabled = true
        btnInfo.text = isAdd ? `Insufficient ${tokenA?.symbol} Balance` : 'Invalid Amount'
        return btnInfo
      }
      if (d(amountInputB || '0').gt(balanceB || '0')) {
        btnInfo.disabled = true
        btnInfo.text = isAdd ? `Insufficient ${tokenB?.symbol} Balance` : 'Invalid Amount'
        return btnInfo
      }
    }

    if (preCalcError && !preCalculateLoading && category == 'haevault_v2') {
      btnInfo.text = 'Amount Too Small'
      btnInfo.disabled = true
      return btnInfo
    }

    // ZAP模式添加 超过$10000
    if (isAdd && zapNumGtError) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    // ZAP模式添加 小于0.0001
    if (isAdd && zapNumLtError) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    //ZAP模式添加 预计算结果为0
    if ((calculateResult && calculateResult.ft_amount == '0') || (calculateResult && calculateResult.burn_ft_amount == '0') || !calculateResult) {
      btnInfo.disabled = true
      btnInfo.text = undefined
      return btnInfo
    }

    return btnInfo
  }, [
    amountInputA,
    amountInputB,
    balanceA,
    balanceB,
    tokenA,
    tokenB,
    assetAction,
    zapNumGtError,
    zapNumLtError,
    category,
    currentAccount?.address,
    calculateResult
  ])

  return {
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled
  }
}
