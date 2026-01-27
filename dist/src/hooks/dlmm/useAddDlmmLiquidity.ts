import { DLMM_MAX_BIN_NUMBER } from '@/constant/dlmm'
import useTransaction from '@/hooks/common/useTransaction'
import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { BothAndZapTabAction } from '@/types/dlmm'
import { formatDescription } from '@/utils'
import { defaultBinsNum, getBatchBinInfo } from '@/utils/dlmm'
import { useAccountBalance } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import useNotifiStore from '@cetus/stores/src/notifi'
import { BalanceChanges, CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types'
import { amountToBN, d, getBalanceChanges, isAvailableObject, parsePositionIdFromEvent } from '@cetus/utils'
import { fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinLiquidityInfo, BinUtils, OpenAndAddLiquidityOption } from '@cetusprotocol/dlmm-sdk'
import { useDebounceEffect, useDeepCompareEffect } from 'ahooks'
import { debounce } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useSlippageTolerance from '../common/useSlippageTolerance'
import useNotifiSubscription from '../notifi/useNotifiSubscription'
import useCreatePriceBin from './useCreatePriceBin'
import useDlmmPreCalc from './useDlmmPreCalc'
import { useDlmmZapIn } from './useDlmmZapIn'
import useInitDlmmPoolPriceRange from './useInitDlmmPoolPriceRange'
interface DebouncedPreAddProps {
  amount?: string | number
  isTokenA: boolean
  isFullRange: boolean
}

function useAddDlmmLiquidity(getList: () => Promise<void>, direct?: boolean) {
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [preCalcLoading, setPreCalcLoading] = useState<boolean>(false)
  const { getDefaultBinPriceAndId } = useCreatePriceBin()
  const { dlmmApiPoolInfo, currentBinStep, isAutoFill, setIsAutoFill, setCurrentBinStep, strategy, currentPrice, dlmmContractPoolInfo } =
    useDlmmLiquidityStore()
  const { signAndExecuteTransaction, batchSignAndExecuteTransaction, getTransactionStatus, transactionSuccess, closeTransactionModal } =
    useTransaction()
  const { dlmmMevProtect, maxCapForGas, transactionMode, customGasPrice, liquiditySlippage } = useGlobalStore()
  const { transactionConfirmation } = useTransactionModal()
  const { setBinInfos } = useDlmmPosDetailStore()
  const { activeBin } = useDlmmLiquidityStore()

  const preCalcUuidRef = useRef<string>('')
  const btnClickRef = useRef(false)

  const {
    fromAmount,
    setFromAmount,
    fromAmountValue,
    setFromAmountValue,
    toAmount,
    setToAmount,
    toAmountValue,
    setToAmountValue,
    byAmountIn,
    setByAmountIn,
    isTokenA,
    setIsTokenA,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    totalAmount,
    setTotalAmount,
    fromTokenLock,
    setFromTokenLock,
    toTokenLock,
    setToTokenLock,
    setTokenMaxA,
    setTokenMaxB,
    tokenMaxA,
    tokenMaxB,
    liquidityAmount,
    setLiquidityAmount,
    confirmModalOpen,
    setConfirmModalOpen,
    nftOpen,
    setNftOpen,
    relatedPosId,
    setRelatedPosId,
    minPriceData,
    maxPriceData,
    setMaxPriceData,
    setMinPriceData,
    addLiquidityInfo,
    setAddLiquidityInfo,
    setZapAddLiquidityInfo,
    setPreCalcError,
    positionCount,
    setPositionCount,
    setNumBins,
    numBins,
    setBinIdRange,
    resetAddLiquidity,
    currTabMode,
    setCurrTabMode
  } = useAddDlmmLiquidityStore()
  const dlmmSdk = useSdk('dlmm')
  const { getTokenAmountValue } = useTokenPrice()
  const { getBinInfosByAutoFill, getNumBins } = useCreatePriceBin()
  const { handleInitPriceRange, initPriceRange } = useInitDlmmPoolPriceRange()

  const refreshForSubmitAfter = async (toastInfo: any, txLength: number, res?: any) => {
    if (res) {
      let response = res
      if (response?.events?.length === 0) {
        response = await getTransactionStatus(response.digest)
      }
      const { posId, farmsPosId } = parsePositionIdFromEvent(response)
      console.log(res, posId, farmsPosId, 'signAndExecuteTransaction')
      if (posId) {
        setNftOpen(true)
        if (farmsPosId) {
          setRelatedPosId(farmsPosId)
        } else {
          setRelatedPosId(posId)
        }
      } else {
        if (txLength === 1) {
          transactionSuccess(toastInfo)
        }
      }
    }

    // 重新拿数据
    fetchAccountBalance()
    resetInputAmount()
    getList()
    setSubmitLoading(false)
  }
  const zapProps = useDlmmZapIn(
    currTabMode === BothAndZapTabAction.zapIn,
    strategy,
    minPriceData?.binId,
    maxPriceData?.binId,
    dlmmApiPoolInfo?.tokenA,
    dlmmApiPoolInfo?.tokenB,
    dlmmContractPoolInfo || null,
    dlmmApiPoolInfo?.isReverse || false,
    activeBin,
    currentPrice,
    refreshForSubmitAfter,
    setPreCalcError
  )

  useEffect(() => {
    // 价格变动，不需要重新初始化区间
    handleInitPriceRange(undefined, undefined, false)
  }, [handleInitPriceRange])

  useEffect(() => {
    if (zapProps.preDepositResult && dlmmApiPoolInfo) {
      const { bin_infos } = zapProps.preDepositResult
      const { amount_a, amount_b } = bin_infos
      const { tokenA, tokenB } = dlmmApiPoolInfo
      const amountAValues = getTokenAmountValue(tokenA?.coinType, fromDecimalsAmount(amount_a, tokenA?.decimals || 0))
      const amountBValues = getTokenAmountValue(tokenB?.coinType, fromDecimalsAmount(amount_b, tokenB?.decimals || 0))
      setTotalAmount(d(amountAValues).add(amountBValues).toString())
      setZapAddLiquidityInfo(bin_infos)
    } else {
      setZapAddLiquidityInfo(null)
    }
  }, [zapProps?.preDepositResult])

  // 获取最小最大binId
  useEffect(() => {
    if (dlmmApiPoolInfo?.binStep) {
      const { minBinId, maxBinId } = BinUtils.findMinMaxBinId(Number(dlmmApiPoolInfo.binStep))
      setBinIdRange({ minBinId, maxBinId })
    }
  }, [dlmmApiPoolInfo?.binStep])

  // 切换模式时，重置输入金额
  useEffect(() => {
    resetInputAmount()
    zapProps.handleChangeZapAmount('')
  }, [currTabMode])

  useEffect(() => {
    if (isAutoFill && currTabMode === BothAndZapTabAction.zapIn) {
      resetInputAmount()
    }
    zapProps.handleChangeZapAmount('')
    setPreCalcError(undefined)
  }, [isAutoFill, currTabMode])

  useDeepCompareEffect(() => {
    if (dlmmApiPoolInfo) {
      setIsTokenA(dlmmApiPoolInfo?.displayTokenA?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type)
    }
  }, [dlmmApiPoolInfo])

  const defaultBinIds = useMemo(() => {
    if (currentBinStep && dlmmContractPoolInfo?.activeId !== undefined && dlmmApiPoolInfo?.tokenA && dlmmApiPoolInfo?.tokenB) {
      return getDefaultBinPriceAndId(
        currentBinStep!,
        dlmmContractPoolInfo?.activeId,
        dlmmApiPoolInfo?.tokenA?.decimals,
        dlmmApiPoolInfo?.tokenB?.decimals
      )
    }
    return undefined
  }, [dlmmContractPoolInfo?.activeId, dlmmApiPoolInfo?.tokenA?.decimals, dlmmApiPoolInfo?.tokenB?.decimals, currentBinStep])

  // notifi
  const { notifiSubscription } = useNotifiSubscription()
  const { isChecked } = useNotifiStore()

  const handleAmountChange = useCallback(
    async (value: string, _byAmountIn: boolean, _isTokenA?: boolean) => {
      btnClickRef.current = false
      setByAmountIn(_byAmountIn)
      if (!value && isAutoFill) {
        if (_byAmountIn) {
          setFromAmount(value)
          setToAmount('')
        } else {
          setToAmount(value)
          setFromAmount('')
        }
      } else {
        if (_byAmountIn) {
          setFromAmount(value)
        } else {
          setToAmount(value)
        }
      }

      if (_isTokenA !== undefined) {
        setIsTokenA(_isTokenA)
      } else {
        setIsTokenA(false)
      }

      setTimeout(() => {
        btnClickRef.current = true
      }, 300)
    },

    [isAutoFill]
  )

  useEffect(() => {
    if (!preCalcLoading) {
      btnClickRef.current = true
    }
  }, [preCalcLoading])

  const { handleAutoFillPreAdd, handleNotAutoFillPreAdd } = useDlmmPreCalc()

  const onDlmmNotAutoFillPreCalc = useCallback(async () => {
    if (currTabMode === BothAndZapTabAction.zapIn && zapProps?.supportZap && isAutoFill) {
      return
    }
    try {
      if (!isAutoFill || (fromTokenLock && !toTokenLock) || (!fromTokenLock && toTokenLock)) {
        setPreCalcLoading(true)
        const coinAmountA =
          (fromToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type
            ? amountToBN(fromAmount, fromToken?.decimals).toString()
            : amountToBN(toAmount, toToken?.decimals).toString()) || '0'
        const coinAmountB =
          (fromToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type
            ? amountToBN(toAmount, toToken?.decimals).toString()
            : amountToBN(fromAmount, fromToken?.decimals).toString()) || '0'

        const isInputAmountA = d(coinAmountA).gt(0)
        const isInputAmountB = d(coinAmountB).gt(0)

        let lowerBinId = minPriceData!.binId
        let upperBinId = maxPriceData!.binId
        const activeId = dlmmContractPoolInfo?.activeId as number

        // const isDefaultBinIds = maxPriceData?.actionSource === 'system' || minPriceData!.actionSource === 'system'
        const isDefaultBinIds = maxPriceData?.actionSource === 'system' && minPriceData!.actionSource === 'system'

        // console.log('onDlmmNotAutoFillPreCalc 1', {
        //   minPriceData,
        //   maxPriceData,
        //   activeId,
        //   lowerBinId,
        //   upperBinId,
        //   isInputAmountA,
        //   isInputAmountB,
        //   defaultBinIds,
        //   isDefaultBinIds
        // })

        // 如果输入的是A，但是没有输入B，
        if (isInputAmountA && !isInputAmountB) {
          if (isDefaultBinIds && minPriceData!.binId < activeId) {
            lowerBinId = activeId
            upperBinId = activeId + defaultBinsNum - 2
          }
          // 如果输入的是B，但是没有输入A，
        } else if (!isInputAmountA && isInputAmountB) {
          if (isDefaultBinIds && maxPriceData!.binId > activeId) {
            upperBinId = activeId
            lowerBinId = upperBinId - defaultBinsNum + 2
          }
        } else {
          // 如果输入的是A和B，
          if (isDefaultBinIds) {
            lowerBinId = defaultBinIds!.lower_bin_id
            upperBinId = defaultBinIds!.upper_bin_id
          }
        }

        if (lowerBinId !== minPriceData!.binId || upperBinId !== maxPriceData!.binId) {
          initPriceRange(lowerBinId, upperBinId, dlmmContractPoolInfo?.binStep!, dlmmApiPoolInfo?.tokenA!, dlmmApiPoolInfo?.tokenB!, false)
          return
        }

        if (Number(numBins) > DLMM_MAX_BIN_NUMBER || Number(numBins) < 1) {
          setAddLiquidityInfo([])
          return
        }

        const uuid = v4()
        preCalcUuidRef.current = uuid

        const res = await handleNotAutoFillPreAdd({
          coinAmountA,
          coinAmountB,
          currentBinStep: dlmmContractPoolInfo?.binStep,
          tokenA: dlmmApiPoolInfo?.tokenA,
          tokenB: dlmmApiPoolInfo?.tokenB,
          lowerBinId,
          upperBinId,
          strategyType: strategy,
          activeId,
          isReverse: dlmmApiPoolInfo?.isReverse,
          pool: dlmmContractPoolInfo,
          uuid
        })
        if (res?.uuid === preCalcUuidRef.current) {
          const { totalAmount: totalValue, binInfos, coinAmountA, coinAmountB } = res
          console.log(res, 'onDlmmNotAutoFillPreCalc 2')
          if (binInfos) {
            setAddLiquidityInfo(binInfos)
            setPreCalcError(undefined)
          }
          setTotalAmount(totalValue)
        }
      }
    } catch (error) {
      console.log('onDlmmNotAutoFillPreCalc ~ error', error)
      if (String(error).includes('is less than 1')) {
        setPreCalcError('amountTooSmall')
        setAddLiquidityInfo(null)
      }
    } finally {
      setPreCalcLoading(false)
    }
  }, [
    fromAmount,
    toAmount,
    byAmountIn,
    dlmmApiPoolInfo,
    isAutoFill,
    strategy,
    minPriceData?.binId,
    maxPriceData?.binId,
    fromToken,
    toToken,
    dlmmContractPoolInfo,
    fromTokenLock,
    toTokenLock
  ])

  useDebounceEffect(
    () => {
      if (defaultBinIds && (d(fromAmount).gt(0) || d(toAmount).gt(0)) && dlmmContractPoolInfo && dlmmApiPoolInfo) {
        onDlmmNotAutoFillPreCalc()
      } else {
        setAddLiquidityInfo(null)
        if (currTabMode !== BothAndZapTabAction.zapIn || !isAutoFill) {
          setPreCalcError(undefined)
        }

        setPreCalcLoading(false)
        //  清空双边数量时，需要恢复默认
        if (!isAutoFill) {
          if (minPriceData) {
            setMinPriceData({ ...minPriceData, actionSource: 'system' })
          }
          if (maxPriceData) {
            setMaxPriceData({ ...maxPriceData, actionSource: 'system' })
          }
        }
      }
    },
    [onDlmmNotAutoFillPreCalc],
    { wait: 300 }
  )

  const onDlmmAutoFillPreCalc = useCallback(
    async (amount: string) => {
      if (currTabMode === BothAndZapTabAction.zapIn || !isAutoFill) {
        return
      }
      if (isAutoFill && !fromTokenLock && !toTokenLock && dlmmContractPoolInfo && dlmmApiPoolInfo) {
        setPreCalcLoading(true)
        console.log('onDlmmAutoFillPreCalc ~ numBins', numBins, amount)
        const fixAmountA =
          byAmountIn && fromToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type
            ? true
            : !byAmountIn && toToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type
              ? true
              : false
        if (d(amount).gt(0)) {
          try {
            if (Number(numBins) > DLMM_MAX_BIN_NUMBER || Number(numBins) < 1) {
              setAddLiquidityInfo([])
              return
            }
            const uuid = v4()
            preCalcUuidRef.current = uuid
            const res = await handleAutoFillPreAdd({
              amount: fixAmountA
                ? amountToBN(amount, dlmmApiPoolInfo?.tokenA?.decimals).toString()
                : amountToBN(amount, dlmmApiPoolInfo?.tokenB?.decimals).toString(),
              tokenA: dlmmApiPoolInfo?.tokenA,
              tokenB: dlmmApiPoolInfo?.tokenB,
              strategy,
              isReverse: dlmmApiPoolInfo?.isReverse,
              fixAmountA,
              lowerBinId: minPriceData!.binId,
              upperBinId: maxPriceData!.binId,
              activeId: dlmmContractPoolInfo?.activeId,
              currentBinStep: dlmmContractPoolInfo?.binStep,
              pool: dlmmContractPoolInfo,
              uuid
            })
            console.log('onDlmmAutoFillPreCalc ~ res', res)
            if (res && res?.uuid === preCalcUuidRef.current) {
              const { displayCoinAmountA, displayCoinAmountB, totalAmount: totalValue, binInfos, coinAmountA, coinAmountB } = res
              if (binInfos) {
                setAddLiquidityInfo(binInfos)
                setPreCalcError(undefined)
              }
              if (byAmountIn) {
                if (toToken?.coin_type === dlmmApiPoolInfo?.tokenB?.coin_type) {
                  setToAmount(coinAmountB)
                } else {
                  setToAmount(coinAmountA)
                }
              } else {
                if (fromToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type) {
                  setFromAmount(coinAmountA)
                } else {
                  setFromAmount(coinAmountB)
                }
              }
              setTotalAmount(totalValue)
            }
          } catch (error) {
            console.log('onDlmmAutoFillPreCalc ~ error', error)
            if (String(error).includes('is less than 1')) {
              setPreCalcError('amountTooSmall')
              setAddLiquidityInfo(null)
              if (byAmountIn) {
                setToAmount('')
              } else {
                setFromAmount('')
              }
              setTotalAmount('')
            }
            setPreCalcLoading(false)
          }
        } else {
          setPreCalcLoading(false)
          setPreCalcError(undefined)
          if (byAmountIn) {
            setToAmount('')
          } else {
            setFromAmount('')
          }
          setTotalAmount('')
        }
      }
    },
    [
      isAutoFill,
      fromToken,
      toToken,
      minPriceData,
      maxPriceData,
      strategy,
      byAmountIn,
      fromAmount,
      toAmount,
      dlmmApiPoolInfo,
      fromTokenLock,
      toTokenLock,
      numBins,
      dlmmContractPoolInfo?.activeId
    ]
  )

  useEffect(() => {
    if (d(fromAmount || '0').eq('0') && d(toAmount || '0').eq('0')) {
      setAddLiquidityInfo(null)
      setPreCalcLoading(false)
    }
  }, [fromAmount, toAmount])

  useDebounceEffect(
    () => {
      if (byAmountIn) {
        onDlmmAutoFillPreCalc(fromAmount)
      }
      if (!byAmountIn) {
        onDlmmAutoFillPreCalc(toAmount)
      }
    },
    [onDlmmAutoFillPreCalc],
    { wait: 250 }
  )

  useEffect(() => {
    if (isAvailableObject(minPriceData) && isAvailableObject(maxPriceData) && currentBinStep !== undefined) {
      if (Number.isFinite(minPriceData?.binId) && Number.isFinite(maxPriceData?.binId) && d(maxPriceData!.binId).gte(minPriceData!.binId)) {
        const count = BinUtils.getPositionCount(minPriceData!.binId, maxPriceData!.binId)
        setPositionCount(count)
        const num = getNumBins(minPriceData!.binId, maxPriceData!.binId)
        setNumBins(num)
      } else {
        setPositionCount(0)
        setNumBins(0)
      }
    }
  }, [minPriceData?.binId, maxPriceData?.binId, currentBinStep])

  const { balanceInfo: fromBalanceInfo } = useGetTokenBalance(fromToken)
  const { balanceInfo: toBalanceInfo } = useGetTokenBalance(toToken)
  const isReverse = useMemo(() => dlmmApiPoolInfo?.isReverse, [dlmmApiPoolInfo?.isReverse])

  useDeepCompareEffect(() => {
    if (byAmountIn) {
      setIsTokenA(fromToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type)
    } else {
      setIsTokenA(toToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coin_type)
    }
  }, [dlmmApiPoolInfo?.poolAddress, byAmountIn, fromToken, toToken])

  const { currentAccount, onWalletModal } = useAccountStore()

  const handleAdd = debounce(
    () => {
      if (!currentAccount) {
        onWalletModal(true)
      } else {
        setConfirmModalOpen(true)
      }
    },
    300,
    { leading: true, trailing: false }
  )

  const resetInputAmount = () => {
    setFromAmount('')
    setToAmount('')
    setFromAmountValue('')
    setToAmountValue('')
    setTotalAmount('')
    setAddLiquidityInfo(null)
  }

  useEffect(() => {
    if ((!fromAmount || !+fromAmount) && (!toAmount || !+toAmount)) {
      setBinInfos({} as BinLiquidityInfo)
    }
  }, [fromAmount, toAmount])

  const { fetchAccountBalance } = useAccountBalance()

  const handleSubmit = async () => {
    let TrackDataParams = []
    try {
      let toastInfo: ToastType
      setSubmitLoading(true)
      // const inputAmount = byAmountIn ? fromAmount : toAmount
      // const tokenDecimals = byAmountIn ? fromToken!.decimals : toToken!.decimals
      // const amount = d(inputAmount).mul(Decimal.pow(10, tokenDecimals)).toString()

      // const fixAmountA =
      //   byAmountIn && fromToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coinType
      //     ? true
      //     : toToken?.coin_type === dlmmApiPoolInfo?.tokenA?.coinType && !byAmountIn
      //       ? true
      //       : false
      // const amount_a = d(fromAmount).mul(Decimal.pow(10, tokenDecimals)).toString()
      // const amount_b = d(toAmount).mul(Decimal.pow(10, tokenDecimals)).toString()

      const lower_bin_id = minPriceData!.binId
      const upper_bin_id = maxPriceData!.binId

      const txs: any[] = []
      const bins = addLiquidityInfo?.bins

      if (bins && bins?.length > 1000) {
        // 如果bins数量超过1000，分批处理
        const batchSize = 1000
        const totalBatches = Math.ceil(bins?.length / batchSize)
        for (let i = 0; i < totalBatches; i++) {
          const batchBinInfo = getBatchBinInfo(bins, i, batchSize)
          const addOption: OpenAndAddLiquidityOption = {
            pool_id: dlmmApiPoolInfo?.poolId || dlmmApiPoolInfo?.poolAddress,
            bin_infos: batchBinInfo!,
            coin_type_a: dlmmApiPoolInfo?.tokenA?.coinType || dlmmApiPoolInfo?.tokenA?.coin_type,
            coin_type_b: dlmmApiPoolInfo?.tokenB?.coinType || dlmmApiPoolInfo?.tokenB?.coin_type,
            lower_bin_id,
            upper_bin_id,
            active_id: dlmmContractPoolInfo?.activeId,
            strategy_type: strategy,
            max_price_slippage: liquiditySlippage,
            bin_step: dlmmContractPoolInfo?.binStep,
            use_bin_infos: false
          }

          const tx = dlmmSdk?.Position.addLiquidityPayload(addOption)
          txs.push(tx)
          const { bin_infos, ...trackData } = addOption
          TrackDataParams.push(trackData)
        }
      } else {
        const addOption: OpenAndAddLiquidityOption = {
          pool_id: dlmmApiPoolInfo?.poolId || dlmmApiPoolInfo?.poolAddress,
          bin_infos: addLiquidityInfo!,
          coin_type_a: dlmmApiPoolInfo?.tokenA?.coinType || dlmmApiPoolInfo?.tokenA?.coin_type,
          coin_type_b: dlmmApiPoolInfo?.tokenB?.coinType || dlmmApiPoolInfo?.tokenB?.coin_type,
          lower_bin_id,
          upper_bin_id,
          active_id: dlmmContractPoolInfo?.activeId,
          strategy_type: strategy,
          max_price_slippage: liquiditySlippage,
          bin_step: dlmmContractPoolInfo?.binStep,
          use_bin_infos: false
        }

        console.log('🚀 ~ handleSubmit ~ addOption22222:', addOption)
        const tx = dlmmSdk?.Position.addLiquidityPayload(addOption)

        txs.push(tx)
        const { bin_infos, ...trackData } = addOption
        TrackDataParams.push(trackData)
      }

      toastInfo = {
        actionType: 'dlmmAddLiquidityBatch',
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>, _: any, otherParams?: any) => {
          const description =
            'Add ' + [formatDescription(fromAmount, fromToken?.symbol), formatDescription(toAmount, toToken?.symbol)].filter(Boolean).join(' and ')

          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }

          const isPartialSuccess = otherParams?.failedResults && otherParams.failedResults.length > 0 && otherParams.successResults.length > 0
          if (status === 'rejected') {
            if (isPartialSuccess) {
              if (otherParams.failedResults.length > 0) {
                info.toastDescriptionContent = `Failed transactions ${otherParams.failedResults.length} /${txs.length} `
              }
            }
          }

          if (status === 'success') {
            let amountAF = fromAmount
            let amountBF = toAmount

            if (balanceChanges) {
              amountAF = getBalanceChanges(balanceChanges, fromToken) || fromAmount
              amountBF = getBalanceChanges(balanceChanges, toToken) || toAmount
            }
            const description =
              'Add ' + [formatDescription(amountAF, fromToken?.symbol), formatDescription(amountBF, toToken?.symbol)].filter(Boolean).join(' and ')

            if (txs.length > 1) {
              info.toastDescriptionContent = `Completed transactions ${txs.length} /${txs.length} `
            } else {
              info.toastDescriptionContent = description
            }
            info.modalDescriptionText = description
            info.toastTitleText = 'Supplied Successful'
          }

          return info
        }
      }

      if (txs.length === 1) {
        transactionConfirmation(toastInfo)
      }

      let res = await batchSignAndExecuteTransaction(txs, toastInfo, {
        useDevInspect: true,
        useMev: dlmmMevProtect,
        showSuccessModal: false,
        //  useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        trackData: {
          params: TrackDataParams,
          actionType: 'dlmm',
          action: 'dlmmAddLiquidity'
        }
      })

      console.log(res, 'signAndExecuteTransaction')
      if (res?.successResults && res?.successResults?.length > 0) {
        refreshForSubmitAfter(toastInfo, txs.length, res.successResults[0]!.response!)
      } else {
        refreshForSubmitAfter(toastInfo, txs.length, res)
      }
    } catch (error) {
      console.error(error, 'handleSubmit ~ error')
      const errorLowerString = String(error).toLocaleLowerCase()
      setSubmitLoading(false)
      throw error
    } finally {
      setSubmitLoading(false)
    }
  }

  useEffect(() => {
    if (isAvailableObject(dlmmContractPoolInfo) && isAvailableObject(minPriceData) && isAvailableObject(maxPriceData)) {
      const minId = minPriceData!.binId
      const maxId = maxPriceData!.binId
      const activeId = dlmmContractPoolInfo?.activeId
      if (d(minId).gt(maxId)) {
        setFromTokenLock(true)
        setToTokenLock(true)
      } else {
        if (d(minId).gt(activeId)) {
          if (isReverse) {
            setFromTokenLock(!!direct)
            setToTokenLock(!direct)
          } else {
            setFromTokenLock(!direct)
            setToTokenLock(!!direct)
          }
        } else if (d(maxId).lt(activeId)) {
          // todo 最大id可以等于activeId时
          if (isReverse) {
            setFromTokenLock(!direct)
            setToTokenLock(!!direct)
          } else {
            setFromTokenLock(!!direct)
            setToTokenLock(!direct)
          }
        } else {
          setFromTokenLock(false)
          setToTokenLock(false)
        }
      }
    }
  }, [minPriceData?.binId, maxPriceData?.binId, currentPrice, dlmmContractPoolInfo?.activeId, direct, isReverse])

  const { isRegularTokenPair } = useSlippageTolerance(fromToken, toToken, liquiditySlippage, currTabMode === BothAndZapTabAction.zapIn)

  const showRiskConfirm = useMemo(() => {
    if (zapProps == undefined) return false
    const { action, zapCoin, coinA, coinB, preDepositResult, preWithdrawResult } = zapProps
    const isZapCoinA = zapCoin?.coin_type === coinA?.coin_type

    const preResult = action === 'Deposit' ? preDepositResult : preWithdrawResult
    if (!preResult?.swap_result || !coinA || !coinB) return false
    const { swap_in_amount } = preResult.swap_result
    const fromCoin = isZapCoinA && action === 'Deposit' ? coinA : coinB
    const amount = fromDecimalsAmount(swap_in_amount || '0', fromCoin?.decimals).toString()
    const amountValue = getTokenAmountValue(fromCoin?.coin_type, amount)

    console.log(amount, amountValue, '----amountValue---test')
    return (
      isRegularTokenPair &&
      currTabMode === BothAndZapTabAction.zapIn &&
      d(amountValue || 0).gte(import.meta.env.VITE_LIMIT_RISK_AMOUNT) &&
      d(liquiditySlippage).gt(0.02)
    )
  }, [isRegularTokenPair, zapProps, liquiditySlippage, currTabMode, getTokenAmountValue])

  const [knowsRisk, setKnowsRisk] = useState<boolean>(false)

  const handleKnowsRisk = (value: boolean) => {
    setKnowsRisk(value)
  }

  return {
    handleAmountChange,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    byAmountIn,
    setByAmountIn,
    fromAmount,
    fromAmountValue,
    setFromAmount,
    toAmount,
    toAmountValue,
    setToAmount,
    liquidityAmount,
    fromBalanceInfo,
    toBalanceInfo,
    totalAmount,
    fromTokenLock,
    toTokenLock,
    handleAdd,
    confirmModalOpen,
    setConfirmModalOpen,
    nftOpen,
    setNftOpen,
    relatedPosId,
    handleSubmit,
    submitLoading,
    positionCount,
    isReverse,
    preCalcLoading,
    zapProps,
    btnClickRef,
    showRiskConfirm,
    knowsRisk,
    handleKnowsRisk
  }
}

export default useAddDlmmLiquidity
