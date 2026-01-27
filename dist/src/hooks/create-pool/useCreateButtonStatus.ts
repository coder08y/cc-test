import { useAccountStore } from '@cetus/stores'
import { BalanceInfo, Token } from '@cetus/types'
import { d, textEllipses } from '@cetus/utils'
import { useMemo } from 'react'

function useCreateButtonStatus(
  baseAmount?: string,
  quoteAmount?: string,
  baseToken?: Token,
  quoteToken?: Token,
  baseBalanceInfo?: BalanceInfo,
  quoteBalanceInfo?: BalanceInfo
) {
  const { currentAccount } = useAccountStore()

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Create',
      disabled: false
    }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // 判断输入
    if (!baseAmount || !quoteAmount || (baseAmount && !+baseAmount) || (quoteAmount && !+quoteAmount)) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    //判断余额
    if (baseAmount && +baseAmount && d(baseAmount).gt(baseBalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(baseToken?.symbol)} Balance`
      return btnInfo
    }
    //判断余额
    if (quoteAmount && +quoteAmount && d(quoteAmount).gt(quoteBalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(quoteToken?.symbol)} Balance`
      return btnInfo
    }

    if (!baseAmount || !quoteAmount) {
      btnInfo.disabled = true
      return btnInfo
    }

    return btnInfo
  }, [
    currentAccount?.address,
    baseAmount,
    quoteAmount,
    baseBalanceInfo?.balanceDisplay,
    quoteBalanceInfo?.balanceDisplay,
    baseToken?.coin_type,
    quoteToken?.coin_type
  ])
  return {
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled
  }
}

export default useCreateButtonStatus
