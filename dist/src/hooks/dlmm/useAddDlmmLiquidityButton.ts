import { DLMM_MAX_BIN_NUMBER } from '@/constant/dlmm'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { BothAndZapTabAction } from '@/types/dlmm'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import { useAccountStore } from '@cetus/stores'
import { d, textEllipses } from '@cetus/utils'
import { useMemo } from 'react'

function useAddDlmmLiquidityButton(
  supportZap?: boolean,
  zapAmount?: string,
  availableAmount?: string,
  zapCoinSymbol?: string,
  zapTipsError?: string
) {
  const {
    fromAmount,
    toAmount,
    fromToken,
    toToken,
    fromTokenLock,
    toTokenLock,
    liquidityAmount,
    numBins,
    addLiquidityInfo,
    zapAddLiquidityInfo,
    preCalcError,
    currTabMode
  } = useAddDlmmLiquidityStore()
  const { currentAccount } = useAccountStore()
  const { isAutoFill } = useDlmmLiquidityStore()
  const { balanceInfo: fromBalanceInfo } = useGetTokenBalance(fromToken)
  const { balanceInfo: toBalanceInfo } = useGetTokenBalance(toToken)

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: isAutoFill && supportZap && currTabMode === BothAndZapTabAction.zapIn ? 'Zap in' : 'Add Liquidity',
      disabled: true
    }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // 判断numBins
    if (!numBins || +numBins > DLMM_MAX_BIN_NUMBER) {
      btnInfo.disabled = true
      return btnInfo
    }

    const liquidityInfo = addLiquidityInfo || zapAddLiquidityInfo

    if (isAutoFill && supportZap && currTabMode === BothAndZapTabAction.zapIn) {
      if (!zapAmount || !+zapAmount) {
        btnInfo.disabled = true
        btnInfo.text = 'Enter an amount'
        return btnInfo
      }
      if (zapAmount && +zapAmount && d(zapAmount).gt(availableAmount || 0)) {
        btnInfo.disabled = true
        btnInfo.text = `Insufficient ${textEllipses(zapCoinSymbol, 10)} Balance`
        return btnInfo
      }

      if (zapTipsError) {
        btnInfo.disabled = true
        return btnInfo
      }

      if (preCalcError === 'amountTooSmall') {
        btnInfo.disabled = true
        return btnInfo
      }

      if (!liquidityInfo?.bins || liquidityInfo.bins.length === 0) {
        btnInfo.disabled = true
        return btnInfo
      }

      btnInfo.disabled = false
      return btnInfo
    }

    if (preCalcError === 'amountTooSmall') {
      btnInfo.disabled = true
      return btnInfo
    }

    if (!liquidityInfo?.bins || liquidityInfo.bins.length === 0) {
      btnInfo.disabled = true
      return btnInfo
    }

    // 上面判断了addLiquidityInfo  则不用在判断fromAmount toAmount了
    // if (isAutoFill) {
    //   // 判断输入
    //   if (!fromTokenLock && !toTokenLock && (!fromAmount || !toAmount || (fromAmount && !+fromAmount) || (toAmount && !+toAmount))) {
    //     btnInfo.text = 'Enter an amount'
    //     btnInfo.disabled = true
    //     return btnInfo
    //   }

    //   if (!fromTokenLock && !toTokenLock && (!fromAmount || !toAmount)) {
    //     btnInfo.disabled = true
    //     return btnInfo
    //   }
    // } else {
    //   if (!fromTokenLock && !toTokenLock && (!fromAmount || !+fromAmount) && (!toAmount || !+toAmount)) {
    //     btnInfo.text = 'Enter an amount'
    //     btnInfo.disabled = true
    //     return btnInfo
    //   }
    // }
    // if (fromTokenLock && !toTokenLock && (!toAmount || (toAmount && !+toAmount))) {
    //   btnInfo.text = 'Enter an amount'
    //   btnInfo.disabled = true
    //   return btnInfo
    // }

    // if (toTokenLock && !fromTokenLock && (!fromAmount || (fromAmount && !+fromAmount))) {
    //   btnInfo.text = 'Enter an amount'
    //   btnInfo.disabled = true
    //   return btnInfo
    // }

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
    // if (d(liquidityAmount).lte('0')) {
    //   btnInfo.disabled = true
    //   return btnInfo
    // }
    btnInfo.disabled = false
    return btnInfo
  }, [
    currentAccount?.address,
    fromAmount,
    toAmount,
    fromBalanceInfo?.balanceFormat,
    toBalanceInfo?.balanceFormat,
    fromToken,
    toToken,
    fromTokenLock,
    toTokenLock,
    liquidityAmount,
    isAutoFill,
    numBins,
    currTabMode,
    addLiquidityInfo,
    preCalcError,
    zapAddLiquidityInfo,
    zapAmount,
    availableAmount,
    zapCoinSymbol,
    zapTipsError,
    supportZap
  ])

  return {
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled
  }
}

export default useAddDlmmLiquidityButton
