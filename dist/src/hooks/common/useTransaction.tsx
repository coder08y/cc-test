import useBatchAuthStore from '@/store/common/useBatchAuthStore'
import { useGlobalToast } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useFastModeTransaction from '@cetus/hooks/src/useFastModeTransaction'
import useMsafeTransaction from '@cetus/hooks/src/useMsafeTransaction'
import { useSigner } from '@cetus/hooks/src/useSigner'
import useTrack from '@cetus/hooks/src/useTrack'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { BatchAuthOptions, CommonTypeInfo, ToastType, TransactionOption } from '@cetus/types/src/common-types'
import { trackShioEvent } from '@cetus/utils'
import { base64ToUint8Array, parseOwnerBalanceChanges, sleepTime } from '@cetus/utils/src/common'
import { handleErrorMessages, isUserRejectedError } from '@cetus/utils/src/error'
import { MSafeWallet } from '@msafe/sui-wallet'
import { useCurrentWallet } from '@mysten/dapp-kit'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'
import { Transaction, TransactionDataBuilder } from '@mysten/sui/transactions'
import { executeAuction } from 'shio-sdk'

export default function useTransaction() {
  const { signTransactionBlock, executeTransactionBlock, signAndExecuteTransactionBlock } = useSigner()
  const { currentAccount } = useAccountStore()
  const clmmSdk = useSdk('clmm')
  const { transactionConfirmation, transactionSubmitted, transactionSuccess, transactionRejected, closeTransactionModal } = useTransactionModal()
  const { submittedTsToast, failedTsToast, successTsToast, closeToast } = useGlobalToast()
  const { getExplorerUrl } = useExplorer()
  const { getFastModeTx } = useFastModeTransaction()
  const { getMsafeRes } = useMsafeTransaction()
  const { trackShio, toTrackSwap, toTrackTransactionError, toTrackDlmmTransaction } = useTrack()
  const { setShowBatchAuthModal, setBatchAuthOptions } = useBatchAuthStore()
  const { currentWallet } = useCurrentWallet()

  const MAX_RETRIES = 5
  const RETRY_DELAY = 2000

  async function getTransactionStatus(digest: string, attempt = 1): Promise<any> {
    console.log(`useTransaction: 🔍 getTransactionStatus - Attempt ${attempt}`)

    try {
      let response
      try {
        response = await clmmSdk!.FullClient.getTransactionBlock({
          digest,
          options: {
            showEvents: true,
            showEffects: true,
            showBalanceChanges: true,
            showInput: true,
            showRawInput: true,
            showObjectChanges: true
          }
        })
      } catch (error) {
        response = await clmmSdk!.FullClient.getTransactionBlock({
          digest,
          options: {
            showEvents: true,
            showEffects: true
          }
        })
      }

      console.log('useTransaction: ✅ Transaction status response:', response)

      if (response) {
        return response
      }
      throw new Error('Empty response')
    } catch (error) {
      console.error(`useTransaction: ❌ Attempt ${attempt} failed:`, error)

      if (attempt >= MAX_RETRIES) {
        console.error('useTransaction: 💥 Max retries reached, giving up')
        throw new Error('Failed to fetch transaction status after maximum retries.')
      }

      console.log(`useTransaction: ⏳ Waiting ${RETRY_DELAY}ms before retry...`)
      // 延迟后继续下一次轮询
      await sleepTime(RETRY_DELAY)
      return getTransactionStatus(digest, attempt + 1)
    }
  }

  type BuildTransactionCallback = (options?: any) => Promise<Transaction>

  // 单个交易执行逻辑
  const executeSingleTransaction = async (
    transaction: Transaction,
    index: number,
    options: {
      useDevInspect: boolean
      useMev: boolean
      txAction: string
      useFastMode: boolean
      maxCapForGas: string
      customGasPrice: string
      msafeParams?: any
    }
  ) => {
    console.log(`useTransaction: ⚡ executeSingleTransaction - TX ${index}`, transaction)
    const { useDevInspect, useMev, txAction, useFastMode, maxCapForGas, customGasPrice, msafeParams } = options
    console.log('useTransaction: Options:', {
      useDevInspect,
      useMev,
      txAction,
      useFastMode,
      maxCapForGas,
      customGasPrice,
      hasMsafeParams: !!msafeParams
    })

    try {
      let transactionResponse
      let transactionBlockBytes
      let startExecuteTime

      if (useFastMode && maxCapForGas && customGasPrice) {
        // Fast mode模式
        const res = await getFastModeTx(transaction, maxCapForGas, customGasPrice)
        transactionResponse = res.result
        transactionBlockBytes = res.transactionBlockBytes
        startExecuteTime = res.startExecuteTime

        const isSuccess = transactionResponse?.effects?.status?.status === 'success'
        let digest = transactionResponse?.digest
        if (!digest && transactionBlockBytes) {
          const uint8ArrayData = base64ToUint8Array(transactionBlockBytes)
          digest = TransactionDataBuilder.getDigestFromBytes(uint8ArrayData)
          transactionResponse.digest = digest
        }

        return {
          success: isSuccess,
          response: transactionResponse,
          index,
          digest: transactionResponse?.digest || '',
          transactionBlockBytes,
          startExecuteTime,
          error: null
        }
      } else if (MSafeWallet?.inMSafeWallet()) {
        if (msafeParams) {
          transactionResponse = await getMsafeRes(transaction, msafeParams)
          const isSuccess = transactionResponse?.effects?.status?.status === 'success'
          let digest = transactionResponse?.digest
          if (!digest && transactionBlockBytes) {
            const uint8ArrayData = base64ToUint8Array(transactionBlockBytes)
            digest = TransactionDataBuilder.getDigestFromBytes(uint8ArrayData)
            transactionResponse.digest = digest
          }
          return {
            success: isSuccess,
            response: transactionResponse,
            index,
            digest: digest || '',
            transactionBlockBytes,
            startExecuteTime: null,
            error: isSuccess ? null : transactionResponse?.effects?.status?.error || 'Transaction failed'
          }
        } else {
          throw new Error('The current operation does not support msafe wallet')
        }
      } else {
        // Default模式
        if (txAction === 'signTransactionBlock') {
          const signTx = await signTransactionBlock(transaction)
          startExecuteTime = new Date().getTime()
          const { bytes, signature } = signTx
          transactionBlockBytes = signTx.bytes

          if (useMev) {
            console.log('💰 MEV execution...')
            try {
              const shioRes = await executeAuction(bytes, signature, 500)
            } catch (error) {
              console.log('⚠️ MEV execution failed:', error)
            }
          }

          transactionResponse = await executeTransactionBlock(bytes, signature, useDevInspect)
        } else {
          transactionResponse = await signAndExecuteTransactionBlock(transaction, useDevInspect)
        }
      }

      // 检查交易是否成功
      const isSuccess = transactionResponse?.effects?.status?.status === 'success'
      let digest = transactionResponse?.digest
      if (!digest && transactionBlockBytes) {
        const uint8ArrayData = base64ToUint8Array(transactionBlockBytes)
        digest = TransactionDataBuilder.getDigestFromBytes(uint8ArrayData)
        transactionResponse.digest = digest
      }

      const result = {
        success: isSuccess,
        response: transactionResponse,
        index,
        digest,
        transactionBlockBytes,
        startExecuteTime,
        error: isSuccess ? null : transactionResponse?.effects?.status?.error || 'Transaction failed'
      }

      console.log(isSuccess ? 'useTransaction: ✅ Transaction successful' : 'useTransaction: ❌ Transaction failed', result)
      return result
    } catch (error: any) {
      console.error(`useTransaction: Transaction ${index} execution failed:`, error)
      const result = {
        success: false,
        response: null,
        index,
        digest: null,
        transactionBlockBytes: null,
        startExecuteTime: null,
        error: error?.message || String(error)
      }
      return result
    }
  }

  const signAndExecuteTransaction = async (
    tx: Transaction | BuildTransactionCallback,
    toastType: ToastType,
    {
      useDevInspect = false,
      useMev = false,
      txAction = 'signTransactionBlock',
      showSuccessModal = true,
      useFastMode = false,
      maxCapForGas = '',
      customGasPrice = '',
      msafeParams,
      otherParams,
      trackData
    }: TransactionOption = {}
  ) => {
    const res = await batchSignAndExecuteTransaction([tx] as Transaction[] | BuildTransactionCallback[], toastType, {
      useDevInspect,
      useMev,
      txAction,
      showSuccessModal,
      useFastMode,
      maxCapForGas,
      customGasPrice,
      msafeParams,
      otherParams,
      trackData
    })
    console.log('useTransaction: 🚀 ~ batchSignAndExecuteTransaction ~ res:', res)

    if (res && res.successResults && res.successResults.length > 0) {
      return res.successResults[0].response
    }
    return undefined
  }

  const batchSignAndExecuteTransaction = async (
    txs: Transaction[] | BuildTransactionCallback[],
    toastType: ToastType,
    {
      useDevInspect = false,
      useMev = false,
      txAction = 'signTransactionBlock',
      showSuccessModal = true,
      useFastMode = false,
      maxCapForGas = '',
      customGasPrice = '',
      msafeParams,
      otherParams,
      trackData
    }: TransactionOption = {}
  ) => {
    console.log('useTransaction: Options:', {
      useDevInspect,
      useMev,
      txAction,
      txsCount: txs.length,
      useFastMode,
      maxCapForGas,
      customGasPrice,
      msafeParams: !!msafeParams
    })

    const txConfirmToastId = toastType.transactionId || new Date().getTime().toString()
    toastType.transactionId = txConfirmToastId

    const isBatchAuth = txs.length > 1
    const requestId = toastType.requestId
    let batchAuthOptions: BatchAuthOptions | undefined

    // 显示 钱包确认中 弹窗
    if (isBatchAuth) {
      setShowBatchAuthModal(true)
      batchAuthOptions = {
        requestId,
        title: toastType.getShowInfo?.('confirmation')?.modalDescriptionText || '',
        status: 'pending',
        steps: txs.map((tx, index) => ({
          index: index + 1,
          status: 'confirmation',
          isActiveStep: index === 0
        }))
      }
      setBatchAuthOptions(batchAuthOptions)
    } else {
      transactionConfirmation(toastType)
    }

    const isSwap = msafeParams?.action === 'AggregatorSwap'

    // dlmm操作最终改为1000bins一个仓位后，除了批量收割奖励不会触发多次approve，当前暂不收集多次approve情况
    let trackErrorString = ''
    let trackTxHash = ''

    try {
      // 解析交易数组
      const transactions: Transaction[] = []
      for (const tx of txs) {
        if (typeof tx === 'function') {
          const resolvedTx = await tx()
          transactions.push(resolvedTx)
        } else {
          transactions.push(tx)
        }
      }

      // 设置发送者
      transactions.forEach(transaction => {
        transaction.setSender(currentAccount?.address as string)
      })

      // 执行所有交易
      const results = []
      let activeIndex = 0
      for (const tx of transactions) {
        const res = await executeSingleTransaction(tx, activeIndex, {
          useDevInspect,
          useMev,
          txAction,
          useFastMode,
          maxCapForGas,
          customGasPrice,
          msafeParams
        })

        console.log('useTransaction executeSingleTransaction: ', res)

        if (isBatchAuth && batchAuthOptions) {
          batchAuthOptions.steps[activeIndex].status = res.success ? 'success' : res.digest ? 'submitted' : 'rejected'
          batchAuthOptions.steps[activeIndex].tx = res.digest || ''
          batchAuthOptions.steps[activeIndex].error = res.error ? handleErrorMessages(res.error) : ''
          batchAuthOptions.steps.forEach((step, index) => {
            step.isActiveStep = index === activeIndex + 1
          })
          setBatchAuthOptions(batchAuthOptions)
        }
        activeIndex++
        results.push(res)
      }

      // 处理 Promise.allSettled 的结果
      console.log('useTransaction: Processing execution results...', results)

      // 分析结果
      let successResults = results.filter(r => r.success)
      // 对应response 不为空的，需要继续轮询判断状态
      const pendingResults = results.filter(r => !r.success && r.response && r.digest)
      // 直接失败的，例如用户拒绝
      let failedResults = results.filter(r => !r.success && !r.response)

      console.log('useTransaction: Initial classification:', {
        total: results.length,
        successful: successResults.length,
        pending: pendingResults.length,
        failed: failedResults.length
      })

      // 用户在钱包点击了授权按钮后，显示进度弹窗
      toastType.tx = successResults.length > 0 ? successResults[0].digest || '' : ''
      if (isBatchAuth && batchAuthOptions) {
        batchAuthOptions.status = failedResults.length === txs.length ? 'failed' : 'success'
        setBatchAuthOptions(batchAuthOptions)
      } else {
        transactionSubmitted(toastType)
        if (!toastType.isSwapWidget) {
          submittedTsToast(toastType)
        }
      }

      // 关闭进度弹窗
      closeToast(txConfirmToastId)

      // 处理待确认的交易
      if (pendingResults.length > 0) {
        for (const pendingResult of pendingResults) {
          try {
            let digest = pendingResult.digest as string
            const statusResult = await getTransactionStatus(digest, 0)

            if (statusResult?.effects?.status?.status === 'success') {
              // 交易成功，移动到成功列表
              successResults.push({
                ...pendingResult,
                success: true,
                response: statusResult
              })
              console.log(`useTransaction: TX ${pendingResult.index} confirmed successful`)

              if (isBatchAuth && batchAuthOptions) {
                batchAuthOptions.steps[pendingResult.index].status = 'success'
                batchAuthOptions.steps[pendingResult.index].tx = statusResult.digest || ''
                batchAuthOptions.steps[pendingResult.index].error = ''
                setBatchAuthOptions(batchAuthOptions)
              }
            } else {
              // 交易失败，移动到失败列表
              failedResults.push({
                ...pendingResult,
                error: statusResult?.effects?.status?.error || 'Transaction failed after status check'
              })
              console.log(`useTransaction: TX ${pendingResult.index} confirmed failed:`, statusResult?.effects?.status?.error)
              if (isBatchAuth && batchAuthOptions) {
                batchAuthOptions.steps[pendingResult.index].status = 'rejected'
                batchAuthOptions.steps[pendingResult.index].tx = statusResult.digest || ''
                batchAuthOptions.steps[pendingResult.index].error = handleErrorMessages(statusResult?.effects?.status?.error)
                setBatchAuthOptions(batchAuthOptions)
              }
            }
          } catch (error: any) {
            // 状态检查失败，标记为失败
            failedResults.push({
              ...pendingResult,
              error: error?.message || String(error) || 'Status check failed'
            })
            console.error(`useTransaction: Status check failed for TX ${pendingResult.index}:`, error)
            if (isBatchAuth && batchAuthOptions) {
              batchAuthOptions.steps[pendingResult.index].status = 'rejected'
              batchAuthOptions.steps[pendingResult.index].tx = pendingResult.digest || ''
              batchAuthOptions.steps[pendingResult.index].error = handleErrorMessages(error)
              setBatchAuthOptions(batchAuthOptions)
            }
          }
        }
      }

      // 重新计算最终结果
      const finalSuccessCount = successResults.length
      const totalCount = results.length

      console.log('useTransaction: Final statistics:', {
        total: totalCount,
        successful: successResults,
        failed: failedResults
      })

      if (finalSuccessCount === totalCount || finalSuccessCount > 0) {
        const isPartialSuccess = failedResults.length > 0
        // 如果是多个 则取第一个的startExecuteTime和timestampMs
        let startExecuteTime = successResults.length > 0 ? successResults[0].startExecuteTime : 0
        let timestampMs = successResults.length > 0 ? successResults[0].response?.timestampMs : 0

        if (startExecuteTime && timestampMs) {
          const endExecuteTime = new Date().getTime()
          const endTime = timestampMs && Number(timestampMs) > startExecuteTime ? Math.min(endExecuteTime, Number(timestampMs)) : endExecuteTime
          const executeTime = endTime - startExecuteTime

          if (executeTime < 1000) {
            toastType.executeTime = executeTime
          }
        }
        const res = successResults[0].response as SuiTransactionBlockResponse
        const balanceChanges = parseOwnerBalanceChanges(res, currentAccount?.address, false)

        if (toastType.getShowInfo) {
          const info = toastType.getShowInfo(isPartialSuccess ? 'rejected' : 'success', balanceChanges, res, {
            successResults,
            failedResults
          })
          toastType.getShowInfo = (_: any) => {
            return info
          }
        }

        if (showSuccessModal) {
          if (isBatchAuth && batchAuthOptions) {
            batchAuthOptions.status = 'success'
            setBatchAuthOptions(batchAuthOptions)
            setShowBatchAuthModal(true)
          } else {
            if (isPartialSuccess) {
              transactionRejected(toastType)
            } else {
              transactionSuccess(toastType)
            }
          }
        } else {
          closeTransactionModal()
        }

        if (!toastType.isSwapWidget) {
          toastType.transactionId = undefined
          successTsToast(toastType)
        }

        // 配合shio打点
        if (msafeParams) {
          try {
            trackShioEvent(msafeParams.action, useFastMode || useMev, res.digest)
          } catch (e) {
            console.error('useTransaction: Shio tracking failed:', e)
          }
        }
        // 谷歌打点
        if (isSwap) {
          toTrackSwap({ ...otherParams, useMev, useFastMode }, '', res.digest)
        }

        console.log('useTransaction: Returning success results:', {
          successCount: successResults.length,
          failedCount: failedResults.length
        })

        if (finalSuccessCount === totalCount && finalSuccessCount === 1) {
          trackTxHash = successResults[0]?.digest || successResults[0].response?.digest || ''
        }
        return {
          successResults,
          failedResults
        }
      } else {
        // 全部失败
        const lastError = failedResults[0]
        console.log('useTransaction: All transactions failed, last error:', failedResults)
        const errorString = handleError(toastType, lastError.error, batchAuthOptions ? false : true)
        trackErrorString = errorString === 'Transaction failed' ? String(lastError.error) : errorString

        if (isBatchAuth && batchAuthOptions) {
          batchAuthOptions.status = 'failed'
          setBatchAuthOptions(batchAuthOptions)
          setShowBatchAuthModal(true)
        }

        // 谷歌打点
        if (isSwap) {
          toTrackSwap(
            {
              ...otherParams,
              useMev,
              useFastMode
            },
            errorString,
            lastError?.digest as any
          )
        } else {
          toTrackTransactionError({ paramsJson: JSON.stringify({ ...trackData }), account: currentAccount?.address, error: String(lastError.error) })
        }
      }
    } catch (error: any) {
      console.error('useTransaction: Batch transaction execution trackData:', trackData)

      if (txConfirmToastId) {
        closeToast(txConfirmToastId)
      }

      const errorString = handleError(toastType, error)
      trackErrorString = errorString === 'Transaction failed' ? String(error) : errorString

      // 谷歌打点
      if (isSwap) {
        toTrackSwap({ ...otherParams, useMev, useFastMode }, errorString, '')
      } else if (trackData && trackData?.actionType !== 'dlmm') {
        toTrackTransactionError({ paramsJson: JSON.stringify({ ...trackData }), account: currentAccount?.address, error: String(error) })
      } else if (msafeParams) {
        const paramsJson = JSON.stringify(msafeParams.txbParams)
        toTrackTransactionError({
          paramsJson,
          account: currentAccount?.address,
          txAction: msafeParams.action,
          error: errorString
        })
      }
    } finally {
      if (
        trackData?.actionType === 'dlmm' &&
        !(trackErrorString?.includes('reject') && (trackErrorString?.includes('user') || trackErrorString?.includes('User')))
      ) {
        // if (trackData?.actionType === 'dlmm') {
        const { actionType, ...rest } = trackData
        const dlmmTrackData = {
          ...rest,
          walletAddress: currentAccount?.address as string,
          walletName: currentWallet?.name as string
        }

        if (!!trackErrorString) {
          dlmmTrackData['error'] = trackErrorString
          dlmmTrackData['isError'] = true
        } else {
          dlmmTrackData['isError'] = false
        }

        if (trackTxHash) {
          dlmmTrackData['txHash'] = trackTxHash
        }
        toTrackDlmmTransaction(dlmmTrackData)
      }
    }

    return undefined
  }

  const handleError = (toastType: ToastType, error: any, showModal = true) => {
    const errorString = handleErrorMessages(error)
    const isWalletRejection = isUserRejectedError(error)

    console.error('useTransaction: ❌ Error details:', { error, errorString, isWalletRejection })

    if (toastType.getShowInfo) {
      const info = toastType.getShowInfo('rejected')

      toastType.getShowInfo = (_: any) => {
        const hasCustomOrderMessage = info.modalTitleText === 'Transaction failed' && info.toastTitleText === 'Place order failed'

        if (hasCustomOrderMessage) {
        } else {
          if (isWalletRejection) {
            info.toastDescriptionContent = errorString
            info.modalDescriptionText = errorString
          } else {
            // 不是钱包拒绝，使用默认的 errorString
            if (!info.toastDescriptionContent) {
              info.toastDescriptionContent = errorString
            }
            if (!info.modalDescriptionText) {
              info.modalDescriptionText = errorString
            }
          }
        }
        return info
      }
      if (showModal) {
        transactionRejected(toastType)
      }
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
      if (showModal) {
        transactionRejected(toastType)
      }
      if (!toastType.isSwapWidget) {
        failedTsToast(toastType)
      }
    }

    console.log('useTransaction: Error handling completed')
    return errorString
  }

  return {
    signAndExecuteTransaction,
    batchSignAndExecuteTransaction,
    transactionSuccess,
    getTransactionStatus,
    transactionConfirmation,
    transactionRejected,
    handleError,
    closeTransactionModal
  }
}
