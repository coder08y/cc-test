import { FreshProgressRef } from '@/components/swap/FreshProgressV2'
import useGlobalStore from '@/store/common/global'
import useMergeSwapStore from '@/store/merge-swap/useMergeSwapStore'
import useSwapConfigStore from '@/store/swap/swapConfig'
import { MergeSwapQuote } from '@/types/merge_swap'
import { useTokenSelect } from '@cetus/design'
import { useAccountBalance } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenStore from '@cetus/stores/src/token'
import useClmmSDKStore from '@cetus/stores/src/useClmmSDKStore'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { addComma } from '@cetus/utils'
import useDebounceEffect from 'ahooks/lib/useDebounceEffect'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useTransaction from '../common/useTransaction'
import { aggregatorPartner } from '../swap/useSwap'
import { useFindMergeRouter } from './useFindMergeRouter'
import { useGetMinReceivedAmount, useMergeSwapPrice, useMergeTotalInputValue, useVerifySwapInput } from './useMergeSwapHelper'

export function useMergeSwap() {
  const { aggregatorSDK } = useClmmSDKStore()
  const { providers } = useWebConfigStore()
  const { currentAccount } = useAccountStore()
  const { mergeSwapSlippage, mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const { providersSwitchStates } = useSwapConfigStore()
  const { findRouter: findMergeRouter, buildFastMergeSwapTxb } = useFindMergeRouter()
  const {
    fromTokenList,
    setToAmount,
    findRouterLoading,
    setFindRouterLoading,
    toToken,
    fromAmountObj,
    clearFromAmountObj,
    mergeSwapQuote,
    setMergeSwapQuote,
    clearData,
    setIsShowSelectRouter
  } = useMergeSwapStore()
  const uuidRef = useRef<string>('')
  const { getTokenAmountValue, fetchTokenPrices } = useTokenPrice()
  const [isOpenConfirmModel, setIsOpenConfirmModel] = useState<boolean>(false)
  const progressRef = useRef<FreshProgressRef>(null)
  const { verifiedTokenMap } = useTokenStore(state => ({ verifiedTokenMap: state.verifiedTokenMap }))
  const { handleTokenPrices } = useMergeSwapPrice(fromTokenList, toToken)
  const { sortWithTokenList } = useTokenSelect()
  const handleReset = () => {
    progressRef.current?.reset()
  }

  useEffect(() => {
    return () => {
      clearData()
    }
  }, [])

  useEffect(() => {
    fetchTokenPrices([envConfigs.sui_coin.coin_type])
  }, [])

  const { totalInputValue } = useMergeTotalInputValue(fromTokenList, fromAmountObj)
  const { isAllInputValid, isAllBalanceEnough, verifySwapInput, hasAnyInput } = useVerifySwapInput(fromTokenList, fromAmountObj)
  // 用户输入合法且余额足够
  const isAllowFindRouter = useMemo(() => {
    return isAllInputValid && isAllBalanceEnough
  }, [isAllInputValid, isAllBalanceEnough])

  const targetTokenList = useMemo(() => {
    const list = [...Array.from(verifiedTokenMap.values()).filter(token => token.is_merge_target && Number(token.is_merge_target) > 0)]
    return sortWithTokenList(list, '')
  }, [verifiedTokenMap])
  /**
   * 获取交易路由
   */
  const findRouter = async (fromTokenList: Token[], toToken: Token, fromAmountObj: Record<string, string>, uuid: string) => {
    setFindRouterLoading(true)
    handleReset()

    if (uuidRef.current === uuid) {
      try {
        const quote = await findMergeRouter(fromTokenList, toToken, fromAmountObj, uuid)
        if (uuidRef.current === uuid) {
          setMergeSwapQuote(quote)
          if (quote && !quote?.error) {
            setIsShowSelectRouter(true)
          } else {
            setIsShowSelectRouter(false)
          }
        }
      } catch (error) {
        console.log('findRouter error', error)
        setMergeSwapQuote(undefined)
      } finally {
        setFindRouterLoading(false)
      }
    }
  }

  const resetData = () => {
    uuidRef.current = ''
    setToAmount('')
    setFindRouterLoading(false)
    setMergeSwapQuote(undefined)
    setIsShowSelectRouter(false)
  }

  /**
   * 输入数量监听
   */
  useDebounceEffect(
    () => {
      const { isAllInputValid, isAllBalanceEnough } = verifySwapInput(fromTokenList, fromAmountObj)
      if (isAllInputValid && isAllBalanceEnough && isAllowFindRouter && toToken && currentAccount) {
        const uuid = v4()
        uuidRef.current = uuid
        findRouter(fromTokenList, toToken, fromAmountObj, uuid)
      } else {
        resetData()
      }
    },
    [fromTokenList, fromAmountObj, toToken, currentAccount, isAllowFindRouter, providersSwitchStates],
    { wait: 300 }
  )

  useDebounceEffect(() => {
    if (mergeSwapQuote && !mergeSwapQuote?.error) {
      setIsShowSelectRouter(true)
    } else {
      setIsShowSelectRouter(false)
    }
  }, [mergeSwapQuote])

  useDebounceEffect(() => {
    if (isAllowFindRouter && toToken && currentAccount) {
    } else {
      resetData()
    }
  }, [currentAccount, isAllowFindRouter])

  const reCalculateRouteData = () => {
    if (isAllowFindRouter && toToken) {
      const uuid = v4()
      uuidRef.current = uuid
      findRouter(fromTokenList, toToken, fromAmountObj, uuid)
    } else {
      resetData()
    }
  }

  // 输出总价值
  const totalOutValue = useMemo(() => {
    if (mergeSwapQuote?.totalAmountOut) {
      return getTokenAmountValue(mergeSwapQuote.toToken.coin_type, mergeSwapQuote.totalAmountOutDisplay)
    }
    return ''
  }, [mergeSwapQuote])

  // 输出Token余额
  const { balanceInfo: toBalanceInfo } = useGetTokenBalance(toToken)

  // 最小接收数量
  const minReceivedAmount = useGetMinReceivedAmount(mergeSwapSlippage.toString(), mergeSwapQuote?.totalAmountOutDisplay)

  const { signAndExecuteTransaction, transactionConfirmation, handleError } = useTransaction()

  // 提交交易
  const handleSwapSubmit = async (swapData: MergeSwapQuote) => {
    console.log('🚀 ~ handleSwapSubmit ~ swapData:', {
      swapData,
      mergeSwapSlippage,
      aggregatorPartner
    })
    const { data, fromTokenList } = swapData

    const toastType: ToastType = {
      getShowInfo: (status: TransactionStatusType) => {
        const description =
          fromTokenList.length > 1
            ? `Swapping ${fromTokenList.length} tokens for ${addComma(swapData.totalAmountOutDisplay)} ${swapData.toToken.symbol}`
            : `Swapping  ${addComma(swapData.fromAmountObj[swapData.fromTokenList[0].coin_type])} ${swapData.fromTokenList[0].symbol} for ${addComma(swapData.totalAmountOutDisplay)} ${swapData.toToken.symbol}`
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }
        if (status === 'success') {
          const newDescription = description.replace('Swapping', 'Swapped')
          info.toastDescriptionContent = newDescription
          info.modalDescriptionText = newDescription
          info.toastTitleText = 'Swap Successful'
        }

        if (status === 'rejected') {
          info.toastTitleText = description.replace('Swapping', 'Swap')
        }

        return info
      }
    }
    transactionConfirmation(toastType)

    try {
      const txb = buildFastMergeSwapTxb(data, Number(mergeSwapSlippage))

      const res = await signAndExecuteTransaction(txb, toastType, {
        useMev: mevProtect
        // useFastMode: transactionMode === 'Fast Mode',
        // maxCapForGas,
        // customGasPrice
      })
      if (res) {
        setToAmount('')
        setMergeSwapQuote(undefined)
        clearFromAmountObj()
        setTimeout(() => {
          fetchAccountBalance()
        }, 1000)
      } else {
        reCalculateRouteData()
      }
    } catch (error) {
      console.log('🚀 ~ handleSwapSubmit ~ error:', error)
    }
  }
  // 刷新
  const handleRefresh = () => {
    reCalculateRouteData()
    if (!isOpenConfirmModel) {
      fetchAccountBalance()
    }
    handleTokenPrices(fromTokenList, toToken)
  }

  return {
    totalOutValue,
    totalInputValue,
    minReceivedAmount,
    toBalanceInfo,
    handleSwapSubmit,
    reCalculateRouteData,
    isAllowFindRouter,
    isAllBalanceEnough,
    isAllInputValid,
    handleRefresh,
    isOpenConfirmModel,
    setIsOpenConfirmModel,
    progressRef,
    hasAnyInput,
    targetTokenList
  }
}
