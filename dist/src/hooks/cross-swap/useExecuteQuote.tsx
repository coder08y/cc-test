import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import { RouteStatus } from '@/types/cross_swap'
import { HighlightText, useGlobalToast } from '@cetus/design'
import { useSigner } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useSdk } from '@cetus/sdk-factory'
import { CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types/src/common-types'
import { handleCrossErrorMessages } from '@cetus/utils/src/cross-error'
import { formatNumber } from '@cetus/utils/src/formatter'
import { CrossSwapPlatform, CrossSwapQuote, CrossSwapToken, MayanConfigs, SwapOptions } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'
import { Quote } from '@mayanfinance/swap-sdk'
import { TransactionResponse } from 'ethers'
import { getQuoteShowDuration, getRouteLink, getRouteStatus, getSourceTxHash, getTokenAllowanceStatus } from './useCrossHelper'
import { pollMayanTransactionStatus } from './useMayanTransactionStatus'

/**
 * 执行交易
 * @param platform 平台
 * @returns 执行交易
 */
export function useExecuteQuote(platform: CrossSwapPlatform) {
  const crossSwapSdk = useSdk('crossSwap')
  const { signAndExecuteTransactionBlock } = useSigner()
  const { transactionConfirmation, transactionSubmitted, transactionSuccess, transactionRejected, closeTransactionModal } = useTransactionModal()
  const { submittedTsToast, failedTsToast, successTsToast, closeToast } = useGlobalToast()
  const { setApproveData } = useCrossSwapStore()

  /**
   * 执行交易，交易成功或失败都会调用executeCallback
   * @param swapOptions 交易参数
   * @param executeCallback 交易回调，交易成功或失败都会调用
   */
  const executeQuote = async (swapOptions: SwapOptions, executeCallback: (status: 'success' | 'failed' | 'pending') => void) => {
    const { from_token, to_token, amount_in_formatted, amount_out_formatted } = swapOptions.quote
    const startTimestamp = Date.now()
    console.log('🚀🚀🚀 ~ executeQuote ~ amount_out_formatted:', swapOptions)
    const toastType = createToastType(from_token, to_token, amount_in_formatted, amount_out_formatted, swapOptions.quote, startTimestamp)
    const description = `Swapping ${formatNumber(amount_in_formatted, from_token.decimals)} ${from_token?.symbol} for ${formatNumber(amount_out_formatted, to_token.decimals)} ${to_token?.symbol}`
    try {
      transactionConfirmation(toastType)
      if (platform === CrossSwapPlatform.LI_FI) {
        const statusMap: Record<RouteStatus, boolean> = {
          DONE: false,
          PARTIAL: false,
          REFUNDED: false,
          FAILED: false,
          PENDING: false,
          ACTION_REQUIRED: false
        }

        const res: any = await crossSwapSdk!.executeSwapQuoteFromLiFi(swapOptions, {
          updateRouteHook(route: any) {
            handleLiFiRouteStatusUpdate(route, from_token, description, statusMap, toastType, executeCallback, setApproveData)
          }
        })
        if (String(res).includes('Error')) {
          handleError(toastType, new Error(res))
          executeCallback('failed')
        }
      } else if (platform === CrossSwapPlatform.MAYAN) {
        const result = await crossSwapSdk!.buildCrossSwapResult(swapOptions, {
          updatePermitState: (quote: Quote, state: 'success' | 'start') => {
            console.log('🚀 ~ updatePermitState ~ state:', state)
            if (state === 'start') {
              closeTransactionModal()
              setApproveData({
                approveSymbol: from_token.symbol,
                swapText: description,
                step: 1
              })
            }
            if (state === 'success') {
              setApproveData({
                approveSymbol: from_token.symbol,
                swapText: description,
                step: 2
              })
            }
          }
        })

        const { from_chain } = swapOptions.quote

        let txHash: string | undefined
        if (from_chain.type === ChainType.MVM) {
          const res = await signAndExecuteTransactionBlock(result.sui!)
          txHash = res?.digest
        }
        if (from_chain.type === ChainType.EVM) {
          const evm = result.evm as TransactionResponse
          txHash = evm?.hash
        }

        if (from_chain.type === ChainType.SVM) {
          const swapRes = result.solana!
          const { connection } = crossSwapSdk!.getCrossSwapConfigs<MayanConfigs>(CrossSwapPlatform.MAYAN).solana!
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
          const confirmRes = await connection.confirmTransaction(
            {
              signature: swapRes.signature,
              blockhash,
              lastValidBlockHeight
            },
            'confirmed'
          )
          console.log('🚀 ~ executeQuote ~ confirmRes:', confirmRes)
          txHash = swapRes.signature
        }

        if (txHash) {
          toastType.link = txHash ? getRouteLink(txHash, platform) : undefined

          // 开始轮询查询交易状态
          handleMayanTransactionPolling(txHash, toastType, executeCallback)
        } else {
          handleError(toastType, new Error('Transaction failed'))
        }
        setApproveData(undefined)
      }
    } catch (error) {
      console.log('🚀 ~ executeQuote ~ error:', error)
      handleError(toastType, error)
    }
  }

  /**
   * 处理交易错误
   * @param toastType 交易toast
   * @param error 错误
   */
  const handleError = (toastType: ToastType, error: any) => {
    const errorString = handleCrossErrorMessages(error)

    console.error('🚀 ~ file: useTransaction.tsx:270 ~ handleError ~ error:', { error, errorString })

    if (toastType.getShowInfo) {
      const info = toastType.getShowInfo('rejected')

      toastType.getShowInfo = (_: any) => {
        info.toastDescriptionContent = errorString
        info.modalDescriptionText = errorString
        return info
      }
      transactionRejected(toastType)
      if (!toastType.isSwapWidget) {
        failedTsToast(toastType)
      }
    } else {
      toastType.getShowInfo = (_: any) => {
        const info: CommonTypeInfo = {}
        info.toastDescriptionContent = errorString
        info.modalDescriptionText = errorString
        return info
      }
      transactionRejected(toastType)
      if (!toastType.isSwapWidget) {
        failedTsToast(toastType)
      }
    }

    return errorString
  }

  /**
   * 处理Mayan交易轮询
   * @param txHash 交易hash
   * @param toastType 交易toast
   * @param executeCallback 交易回调，交易成功或失败都会调用
   */
  const handleMayanTransactionPolling = (
    txHash: string,
    toastType: ToastType,
    executeCallback: (status: 'success' | 'failed' | 'pending') => void
  ) => {
    transactionSubmitted(toastType)
    submittedTsToast(toastType)
    executeCallback('pending')

    // 开始轮询查询交易状态
    pollMayanTransactionStatus(
      txHash,
      status => {
        console.log('Mayan transaction status update:', status)
      },
      status => {
        console.log('Mayan transaction completed:', status)
        transactionSuccess(toastType)
        successTsToast(toastType)
        executeCallback('success')
      },
      error => {
        console.error('Mayan transaction failed:', error)
        handleError(toastType, error)
        executeCallback('failed')
      }
    )
  }

  /**
   * 处理LiFi交易轮询
   * @param route 交易路由
   * @param statusMap 交易状态map
   * @param toastType 交易toast
   * @param executeCallback 交易回调，交易成功或失败都会调用
   */
  const handleLiFiRouteStatusUpdate = (
    route: any,
    fromToken: CrossSwapToken,
    swapText: string,
    statusMap: Record<RouteStatus, boolean>,
    toastType: ToastType,
    executeCallback: (status: 'success' | 'failed' | 'pending') => void,
    setApproveData: (approveData?: { approveSymbol: string; swapText: string; step: 1 | 2 }) => void
  ) => {
    const routeStatus = getRouteStatus(route)
    const sourceTxHash = getSourceTxHash(route)
    console.log('🚀 ~ printLiFiTransactionLinks ~ process:', {
      routeStatus,
      sourceTxHash,
      statusMap,
      route
    })

    if (statusMap[routeStatus]) {
      return
    }

    if (routeStatus === 'ACTION_REQUIRED') {
      const tokenAllowanceStatus = getTokenAllowanceStatus(route)
      console.log('🚀 ~ printLiFiTransactionLinks ~ tokenAllowanceStatus :', {
        tokenAllowanceStatus
      })
      if (tokenAllowanceStatus === 'ACTION_REQUIRED') {
        closeTransactionModal()
        setApproveData({
          approveSymbol: fromToken.symbol,
          swapText,
          step: 1
        })
      }
      if (tokenAllowanceStatus === 'DONE') {
        statusMap[routeStatus] = true
        setApproveData({
          approveSymbol: fromToken.symbol,
          swapText,
          step: 2
        })
      }
      return
    }

    if (routeStatus === 'FAILED') {
      statusMap[routeStatus] = true
      setApproveData(undefined)
      // handleError(toastType, new Error('Transaction failed'))
      // executeCallback(false)
      return
    }
    if (routeStatus === 'DONE') {
      statusMap[routeStatus] = true
      transactionSuccess(toastType)
      successTsToast(toastType)
      executeCallback('success')
      return
    }

    if (routeStatus === 'PENDING' && sourceTxHash) {
      setApproveData(undefined)
      executeCallback('pending')
      statusMap[routeStatus] = true
      console.log('🚀 ~ printLiFiTransactionLinks ~ sourceTxHash:', sourceTxHash)
      toastType.link = sourceTxHash ? getRouteLink(sourceTxHash, platform) : undefined
      transactionSubmitted(toastType)
      submittedTsToast(toastType)
      return
    }

    if (routeStatus === 'PARTIAL') {
      statusMap[routeStatus] = true
      return
    }
  }

  /**
   * 创建交易toast
   * @param fromToken 输入token
   * @param toToken 输出token
   * @param amountIn 输入金额
   * @param amountOut 输出金额
   * @param quote 交易quote
   * @param startTimestamp 开始时间
   * @returns 交易toast
   */
  const createToastType = (
    fromToken: CrossSwapToken,
    toToken: CrossSwapToken,
    amountIn: string,
    amountOut: string,
    quote: CrossSwapQuote,
    startTimestamp: number
  ): ToastType => {
    return {
      actionType: 'swap',
      getShowInfo: (status: TransactionStatusType) => {
        console.log('🚀 ~ printLiFiTransactionLinks ~ getShowInfo:', status)

        const description = `Swapping ${formatNumber(amountIn, fromToken.decimals)} ${fromToken?.symbol} for ${formatNumber(amountOut, toToken.decimals)} ${toToken?.symbol}`
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description,
          showSubmittedToast: true
        }

        if (status === 'submitted') {
          info.iconUrl = '/images/chain/cross_pending_icon@2x.png'
          info.toastTitleText = 'Processing Transaction'
          info.modalTitleText = 'Processing Transaction'
          info.modalSubDescriptionText = 'Track your transaction progress on the explorer.'

          const duration = getQuoteShowDuration(quote.execution_duration)

          info.toastDescriptionContent = () => {
            return (
              <HighlightText
                text={`Estimated to complete in ${duration}. You may track the progress on the explorer.`}
                keywords={[duration]}
                onKeywordClick={() => {}}
              />
            )
          }
        }

        if (status === 'rejected') {
          info.toastTitleText = description.replace('Swapping', 'Swap')
          info.toastDescriptionContent = undefined
        }

        if (status === 'success') {
          info.iconUrl = undefined
          info.toastTitleText = description.replace('Swapping', 'Swapped')
          const executionDuration = Date.now() - startTimestamp
          const duration = getQuoteShowDuration(executionDuration / 1000)
          info.toastTitleText = 'Transaction completed'

          info.toastDescriptionContent = () => {
            return (
              <HighlightText
                text={`Transaction completed in ${duration}. You may track the progress on the explorer.`}
                keywords={[duration]}
                onKeywordClick={() => {}}
              />
            )
          }
        }

        return info
      }
    }
  }

  return {
    executeQuote
  }
}
