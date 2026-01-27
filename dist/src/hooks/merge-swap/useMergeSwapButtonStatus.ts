import useMergeSwapStore from '@/store/merge-swap/useMergeSwapStore'
import { MergeSwapMaxOutValue } from '@/types/merge_swap'
import { useAccountStore } from '@cetus/stores'
import { AggregatorServerErrorCode } from '@cetusprotocol/aggregator-sdk'
import { d } from '@cetusprotocol/common-sdk'
import { useMemo } from 'react'

export function useMergeSwapButtonStatus(isAllInputValid: boolean, isAllBalanceEnough: boolean, totalOutValue: string) {
  const { currentAccount } = useAccountStore()
  const { fromTokenList, mergeSwapQuote, toToken } = useMergeSwapStore(state => ({
    fromTokenList: state.fromTokenList,
    mergeSwapQuote: state.mergeSwapQuote,
    toToken: state.toToken
  }))

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Swap',
      disabled: true
    }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // token 选择判断
    if (fromTokenList.length === 0 || !toToken) {
      btnInfo.text = 'Select a token'
      btnInfo.disabled = true
      return btnInfo
    }

    // 判断输入
    if (!isAllInputValid) {
      btnInfo.text = `Enter an amount`
      btnInfo.disabled = true
      return btnInfo
    }
    //  errorCode
    if (mergeSwapQuote?.error) {
      if (
        mergeSwapQuote.error.code === AggregatorServerErrorCode.InsufficientLiquidity ||
        mergeSwapQuote.error.code === AggregatorServerErrorCode.HoneyPot
      ) {
        btnInfo.text = 'Insufficient Liquidity'
        btnInfo.disabled = true
        return btnInfo
      }
      if (mergeSwapQuote.error.code === AggregatorServerErrorCode.BadRequest) {
        btnInfo.text = 'No Available Route'
        btnInfo.disabled = true
        return btnInfo
      }
    }

    //判断余额
    if (!isAllBalanceEnough) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient  Balance`
      return btnInfo
    }

    if (+totalOutValue && d(totalOutValue).gt(MergeSwapMaxOutValue)) {
      btnInfo.disabled = true
      return btnInfo
    }

    if (mergeSwapQuote) {
      btnInfo.disabled = false
    }
    return btnInfo
  }, [currentAccount?.address, fromTokenList, isAllBalanceEnough, isAllInputValid, mergeSwapQuote, totalOutValue])

  return {
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled
  }
}
