import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import { useAccountStore } from '@cetus/stores'
import { d, textEllipses } from '@cetus/utils'
import { useMemo } from 'react'

function useAddLiquidityButton() {
  const { fromAmount, toAmount, fromToken, toToken, fromTokenLock, toTokenLock, liquidityAmount } = useAddLiquidityStore()
  const { currentAccount } = useAccountStore()

  const { balanceInfo: fromBalanceInfo } = useGetTokenBalance(fromToken)
  const { balanceInfo: toBalanceInfo } = useGetTokenBalance(toToken)

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Add Liquidity',
      disabled: false
    }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // 判断输入
    if (!fromTokenLock && !toTokenLock && (!fromAmount || !toAmount || (fromAmount && !+fromAmount) || (toAmount && !+toAmount))) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    if (fromTokenLock && !toTokenLock && (!toAmount || (toAmount && !+toAmount))) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    if (toTokenLock && !fromTokenLock && (!fromAmount || (fromAmount && !+fromAmount))) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    //判断余额
    if (fromAmount && +fromAmount && d(fromAmount).gt(fromBalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(fromToken?.symbol, 10)} Balance`
      return btnInfo
    }
    //判断余额
    if (toAmount && +toAmount && d(toAmount).gt(toBalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(toToken?.symbol, 10)} Balance`
      return btnInfo
    }

    if (!fromTokenLock && !toTokenLock && (!fromAmount || !toAmount)) {
      btnInfo.disabled = true
      return btnInfo
    }
    if (d(liquidityAmount).lte('0')) {
      btnInfo.disabled = true
      return btnInfo
    }

    return btnInfo
  }, [
    currentAccount?.address,
    fromAmount,
    toAmount,
    fromBalanceInfo?.balanceDisplay,
    toBalanceInfo?.balanceDisplay,
    fromToken,
    toToken,
    fromTokenLock,
    toTokenLock,
    liquidityAmount
  ])

  return {
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled
  }
}

export default useAddLiquidityButton
