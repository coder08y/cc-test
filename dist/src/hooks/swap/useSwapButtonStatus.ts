import { AggregatorServerErrorCode, SwapRouterData } from '@/types/swap'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { textEllipses } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'

export function useSwapButtonStatus(
  fromAmount: string,
  toAmount: string,
  fromBalance?: string,
  fromCoin?: Token,
  toCoin?: Token,
  routerData?: SwapRouterData
) {
  const { currentAccount } = useAccountStore()

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Swap',
      disabled: false
    }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // token 选择判断
    if (!fromCoin || !toCoin) {
      btnInfo.text = 'Select a token'
      btnInfo.disabled = true
      return btnInfo
    }

    // 判断输入
    if (!+fromAmount && !+toAmount) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    // errorCode
    if (routerData && routerData.errorCode) {
      if (routerData.errorCode === AggregatorServerErrorCode.InsufficientLiquidity) {
        btnInfo.text = 'Insufficient liquidity for this trade'
        btnInfo.disabled = true
        return btnInfo
      }
      if (routerData.errorCode === AggregatorServerErrorCode.NoRouter || routerData.errorCode === AggregatorServerErrorCode.HoneyPot) {
        btnInfo.text = 'No Available Route'
        btnInfo.disabled = true
        return btnInfo
      }
    }

    //判断余额
    if (+fromAmount && d(fromAmount).gt(fromBalance || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(fromCoin?.symbol, 10)} Balance`
      return btnInfo
    }

    if (!+fromAmount || !+toAmount) {
      btnInfo.disabled = true
      return btnInfo
    }

    return btnInfo
  }, [currentAccount?.address, fromAmount, toAmount, fromBalance, routerData?.errorCode, fromCoin, toCoin])

  return {
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled
  }
}
