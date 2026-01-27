import useTransaction from '@/hooks/common/useTransaction'
import useGlobalStore from '@/store/common/global'
import { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import useCreateDlmmPoolStore from '@/store/pool/createDlmmPool'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import { getRelatedDisplayPrice } from '@/utils/dlmm'
import { getPoolDirection } from '@/utils/pool'
import { DlmmSelectFeeType } from '@cetus/design/src/components/common/feeSelect/type'
import { useAccountBalance } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import { BalanceChanges, CommonTypeInfo, Token, TransactionStatusType } from '@cetus/types'
import { amountToBN, isAvailableObject, isAvailablePrice, textEllipses } from '@cetus/utils'
import { d, fixCoinType, isSortedSymbols } from '@cetusprotocol/common-sdk'
import { BinUtils, StrategyType } from '@cetusprotocol/dlmm-sdk'
import { normalizeSuiAddress } from '@mysten/sui/utils'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import useCreatePriceBin from '../dlmm/useCreatePriceBin'
import useDlmmPreCalc from '../dlmm/useDlmmPreCalc'
import useCreatePoolHelper from './useCreatePoolHelper'

export type PriceDataType = {
  binId: number
  price: string
  type: 'lower' | 'upper'
}

export default function useCreateDLMMPool(isReverse: boolean, handleSelectTokenChange: (token: Token | undefined, isBaseToken: boolean) => void) {
  const { fee } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const baseFactor = searchParams.get('baseFactor')
  const dlmmSdk = useSdk('dlmm')
  const { signAndExecuteTransaction, transactionConfirmation, transactionRejected } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const navigate = useNavigate()
  const { preAddPool, getBinStepConfigs, getCreateDLMMPoolTxPayload } = useCreatePoolHelper()
  const { binStepConfig } = useBinStepConfigStore()
  const {
    currentStep,
    editStep,
    setCurrentStep,
    setEditStep,
    displayBaseToken,
    setDisplayBaseToken,
    displayQuoteToken,
    setDisplayQuoteToken,
    baseToken,
    quoteToken,
    backToStepOne
  } = useCreatePoolStore()

  const { getDefaultBinPriceAndId, handleActionBinPrice, getBinInfosByAutoFill, getBinInfosByBothAmount, getNumBins } = useCreatePriceBin()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  useEffect(() => {
    fetchAccountBalance()
  }, [])

  const {
    initPrice,
    setInitPrice,
    minPriceData,
    setMinPriceData,
    maxPriceData,
    setMaxPriceData,
    baseAmount,
    setBaseAmount,
    quoteAmount,
    setQuoteAmount,
    isAutoFill,
    setIsAutoFill,
    strategy,
    setStrategy,
    fixAmountA,
    setFixAmountA,
    activeId,
    setActiveId,
    createBinInfos,
    setCreateBinInfos,
    setBinStep,
    binStep,
    positionCount,
    setPositionCount,
    numBins,
    setNumBins,
    setBaseTokenLock,
    setQuoteTokenLock,
    resetCreateDlmmPoolState,
    binStepList,
    setBinStepList,
    getBinStepListLoading,
    setGetBinStepListLoading,
    baseFee,
    setBaseFee
  } = useCreateDlmmPoolStore()

  useEffect(() => {
    return () => {
      resetCreateDlmmPoolState()
    }
  }, [])

  const resetData = () => {
    setInitPrice('')
    resetInputAmount()
  }

  const handleBaseFeeChange = async (baseFee?: DlmmSelectFeeType) => {
    setBaseFee(baseFee ? { fee: baseFee.fee, feeDisplay: baseFee.feeDisplay } : undefined)
    setBinStep(undefined)
  }

  const handleBinStepChange = async (binStep: any, baseCoinType?: string, quoteCoinType?: string) => {
    if (!binStep?.poolAddress && baseCoinType && quoteCoinType) {
      try {
        const address = await dlmmSdk?.Pool?.getPoolAddress(
          fixCoinType(baseCoinType, true),
          fixCoinType(quoteCoinType, true),
          binStep?.binStep,
          binStep?.baseFactor
        )
        console.log(binStep, 'binStep')
        if (address) {
          setBinStep({ ...binStep, poolAddress: address })
        } else {
          setBinStep(binStep)
        }
      } catch (error) {
        setBinStep(binStep)
      }
    } else {
      setBinStep(binStep)
    }
    setSearchParams({ baseFactor: binStep?.baseFactor, poolType: 'dlmm' })
    setCurrentStep(2)
    resetData()
  }

  const updateBinStep = useCallback(() => {
    console.log(baseFee, fee, baseFactor, baseToken, quoteToken, 'updateBinStep called')
    if (baseFee || (fee !== undefined && baseFactor !== undefined && fee !== 'undefined' && baseFactor !== 'undefined')) {
      if (baseToken && quoteToken) {
        const currentFee = baseFee || {
          fee,
          feeDisplay: fee && d(fee).mul(100).toString() + '%'
        }
        if (!baseFee) {
          setBaseFee(currentFee)
        }
        const binStepList = binStepConfig?.find(item => item?.fee === currentFee.fee)?.binStepList
        if (binStepList) {
          setBinStepList(
            binStepList?.map(item => ({
              ...item,
              title: ''
            }))
          )
        }
        setGetBinStepListLoading(true)

        getBinStepConfigs(currentFee, baseToken?.coin_type, quoteToken?.coin_type)
          .then(res => {
            if (res) {
              console.log(res, baseFee, 'getBinStepConfigs')
              setBinStepList(
                res?.map(item => ({
                  ...item,
                  title: item?.title !== 'Not Created' ? 'Created' : item.title
                }))
              )
              setGetBinStepListLoading(false)
              // const notCreateList = res.filter(item => item.poolAddress === undefined)
              // console.log('notCreateList', notCreateList)
              // const defaultFee =
              //   notCreateList.find(item => item.baseFactor == Number(baseFactor)) ||
              //   notCreateList.find(item => item.binStep === 25) ||
              //   (notCreateList.length > 0 ? notCreateList[0] : undefined) ||
              //   (res.length > 0 ? res[0] : undefined)
              // if (defaultFee && baseToken?.coin_type && quoteToken?.coin_type) {
              //   handleBinStepChange(
              //     { ...defaultFee, title: defaultFee?.title !== 'Not Created' ? 'Created' : 'Not Created' },
              //     baseToken?.coin_type,
              //     quoteToken?.coin_type
              //   )
              // }
            }
          })
          .catch(error => {
            setGetBinStepListLoading(false)
          })
      } else {
        const currentFee =
          baseFee ||
          (fee
            ? {
                fee,
                feeDisplay: fee && d(fee).mul(100).toString() + '%'
              }
            : undefined)
        console.log(currentFee, baseFee, fee, 'currentFee, baseFee, fee')
        if (currentFee) {
          const binStepList = binStepConfig?.find(item => item?.fee === currentFee.fee)?.binStepList
          if (binStepList) {
            setBinStepList(
              binStepList?.map(item => ({
                ...item,
                title: ''
              }))
            )
            setBinStep(binStepList?.find(item => item?.baseFactor + '' === baseFactor) || undefined)
          } else {
            setBinStep(undefined)
          }
          console.log(binStepList, baseFactor, 'binStepList when no token')
        }

        if (!baseFee) {
          setBaseFee(undefined)
        }
      }
    }
  }, [baseToken?.coin_type, quoteToken?.coin_type, binStepConfig, baseFee])

  /**
   * token 变化，更新feeTierList
   */
  useEffect(() => {
    if (currentStep === 2) {
      updateBinStep()
    }
  }, [updateBinStep, currentStep])

  useEffect(() => {
    if (
      isAvailableObject(minPriceData) &&
      isAvailableObject(maxPriceData) &&
      binStep !== undefined &&
      Number.isFinite(minPriceData?.binId) &&
      Number.isFinite(maxPriceData?.binId)
    ) {
      const count = BinUtils.getPositionCount(minPriceData!.binId, maxPriceData!.binId)
      setPositionCount(count)
      const num = getNumBins(minPriceData!.binId, maxPriceData!.binId)
      setNumBins(num)
    }
  }, [minPriceData?.binId, maxPriceData?.binId, binStep])

  /**
   * 处理切换Token
   * @param token
   * @param isBaseToken
   */
  const onSelectTokenChange = (token?: Token, isBaseToken: boolean = true) => {
    handleStepClick(2)
    handleSelectTokenChange(token, isBaseToken)
  }
  useEffect(() => {
    if (
      isAvailablePrice(initPrice) &&
      activeId !== undefined &&
      binStep !== undefined &&
      isAvailableObject(baseToken) &&
      isAvailableObject(quoteToken)
    ) {
      const { lower_bin_id, upper_bin_id, lower_price, upper_price } = getDefaultBinPriceAndId(
        binStep?.binStep,
        activeId,
        baseToken!.decimals,
        quoteToken!.decimals
      )

      const [displayUpperPrice, reverseUpperPrice, displayReverseUpperPrice] = getRelatedDisplayPrice(upper_price)

      setMaxPriceData({
        binId: upper_bin_id,
        price: upper_price,
        displayPrice: displayUpperPrice,
        reversePrice: reverseUpperPrice,
        displayReversePrice: displayReverseUpperPrice,
        type: 'upper'
      })

      const [displayLowerPrice, reverseLowerPrice, displayReverseLowerPrice] = getRelatedDisplayPrice(lower_price)

      setMinPriceData({
        binId: lower_bin_id,
        price: lower_price,
        displayPrice: displayLowerPrice,
        reversePrice: reverseLowerPrice,
        displayReversePrice: displayReverseLowerPrice,
        type: 'lower'
      })
    }
  }, [initPrice, binStep?.binStep, baseToken?.coin_type, quoteToken?.coin_type, activeId, currentStep])

  /**
   * 处理数量输入
   * @param amount
   * @param fixBaseToken
   */
  const handleAmountChange = (amount: string, fixBaseToken: boolean) => {
    if (fixBaseToken) {
      setBaseAmount(amount)
      if (amount === '' || d(amount).lte(0)) {
        setQuoteAmount('')
      }
    } else {
      setQuoteAmount(amount)
      if (amount === '' || d(amount).lte(0)) {
        setBaseAmount('')
      }
    }
  }

  /**
   * 切换步骤
   * @param step
   */

  const handleStepClick = (step: number) => {
    if (step === 1) {
      backToStepOne('dlmm')
      setInitPrice('')
      resetInputAmount()
      navigate('/create-pool?poolType=dlmm', { replace: true })
    } else if (step === 2) {
      setCurrentStep(2)
      setEditStep(2)
      setInitPrice('')
      resetInputAmount()
    } else if (step === 3) {
      setCurrentStep(3)
      setEditStep(3)
      resetInputAmount()
    } else {
      setCurrentStep(4)
      setEditStep(4)
    }
  }

  useEffect(() => {
    if (isAvailablePrice(initPrice) && binStep !== undefined && baseToken !== undefined && quoteToken !== undefined) {
      const binId = BinUtils.getBinIdFromPrice(initPrice, binStep.binStep, false, baseToken?.decimals, quoteToken?.decimals)
      setActiveId(binId)
    }
  }, [initPrice, binStep, baseToken, quoteToken])

  const handlePriceAction = useCallback(
    (type: 'Add' | 'Sub', price: PriceDataType, isMinPrice: boolean) => {
      if (binStep !== undefined && baseToken !== undefined && quoteToken !== undefined) {
        const { bin_id, price: _price } = handleActionBinPrice(price, binStep?.binStep, baseToken?.decimals, quoteToken?.decimals, type)
        const [displayPrice, reversePrice, displayReversePrice] = getRelatedDisplayPrice(_price)

        if (isMinPrice) {
          if (d(_price).gt(initPrice)) {
            const minBinId = BinUtils?.getBinIdFromPrice(initPrice, binStep?.binStep, false, baseToken?.decimals, quoteToken?.decimals)
            const [minDisplayPrice, minReversePrice, minDisplayReversePrice] = getRelatedDisplayPrice(initPrice)
            setMinPriceData({
              binId: minBinId,
              price: initPrice,
              displayPrice: minDisplayPrice,
              reversePrice: minReversePrice,
              displayReversePrice: minDisplayReversePrice,
              type: 'lower'
            } as any)
          } else {
            setMinPriceData({ binId: bin_id, price: _price, displayPrice, reversePrice, displayReversePrice, type: 'lower' } as any)
          }
        } else {
          if (d(_price).lt(initPrice)) {
            const maxBinId = BinUtils?.getBinIdFromPrice(initPrice, binStep?.binStep, false, baseToken?.decimals, quoteToken?.decimals)
            const [maxDisplayPrice, maxReversePrice, maxDisplayReversePrice] = getRelatedDisplayPrice(initPrice)
            setMaxPriceData({
              binId: maxBinId,
              price: initPrice,
              displayPrice: maxDisplayPrice,
              reversePrice: maxReversePrice,
              displayReversePrice: maxDisplayReversePrice,
              type: 'upper'
            } as any)
          } else {
            setMaxPriceData({ binId: bin_id, price: _price, displayPrice, reversePrice, displayReversePrice, type: 'upper' } as any)
          }
        }
      }
    },
    [binStep, baseToken, quoteToken, initPrice]
  )

  const { handleAutoFillPreAdd, handleNotAutoFillPreAdd } = useDlmmPreCalc()
  /**
   * auto fill 预计算
   */

  const onAutoFillPreCalc = useCallback(
    async (amount: string) => {
      try {
        if (isAutoFill && amount && d(amount).gt(0) && baseToken && quoteToken && activeId !== undefined) {
          const res = await handleAutoFillPreAdd({
            amount: fixAmountA ? amountToBN(amount, baseToken?.decimals).toString() : amountToBN(amount, quoteToken?.decimals).toString(),
            tokenA: baseToken,
            tokenB: quoteToken,
            strategy,
            isReverse: getPoolDirection(baseToken!.coin_type, quoteToken!.coin_type),
            fixAmountA,
            lowerBinId: minPriceData!.binId,
            upperBinId: maxPriceData!.binId,
            activeId,
            currentBinStep: binStep!.binStep
          })
          if (res) {
            const { totalAmount: totalValue, binInfos, coinAmountA, coinAmountB } = res
            if (binInfos) {
              setCreateBinInfos(binInfos)
            }
            if (fixAmountA) {
              setQuoteAmount(coinAmountB)
            } else {
              setBaseAmount(coinAmountA)
            }
          }
        }
      } catch (error) {
        console.log('handleAutoFillPreCalc ~ error', error)
      }
    },
    [isAutoFill, baseToken, quoteToken, fixAmountA, activeId, minPriceData, maxPriceData, binStep, strategy]
  )

  useEffect(() => {
    if (fixAmountA && baseAmount && d(baseAmount).gt(0)) {
      onAutoFillPreCalc(baseAmount)
    }
    if (!fixAmountA && quoteAmount && d(quoteAmount).gt(0)) {
      onAutoFillPreCalc(quoteAmount)
    }
  }, [onAutoFillPreCalc, baseAmount, quoteAmount])

  /**
   * not auto fill 预计算
   */

  const onNotAutoFillPreCalc = useCallback(async () => {
    if (!isAutoFill && baseToken && quoteToken && activeId !== undefined && isAvailableObject(minPriceData) && isAvailableObject(maxPriceData)) {
      const res = await handleNotAutoFillPreAdd({
        coinAmountA: amountToBN(baseAmount || '0', baseToken?.decimals).toString(),
        coinAmountB: amountToBN(quoteAmount || '0', quoteToken?.decimals).toString(),
        currentBinStep: binStep!.binStep,
        tokenA: baseToken!,
        tokenB: quoteToken!,
        lowerBinId: minPriceData!.binId,
        upperBinId: maxPriceData!.binId,
        strategyType: strategy,
        activeId,
        isReverse: getPoolDirection(baseToken?.coin_type, quoteToken?.coin_type)
      })
      if (res) {
        const { totalAmount: totalValue, binInfos } = res
        if (binInfos) {
          setCreateBinInfos(binInfos)
        }
      }
    }
  }, [isAutoFill, baseToken, quoteToken, activeId, binStep, strategy, minPriceData, maxPriceData, baseAmount, quoteAmount])

  useEffect(() => {
    onNotAutoFillPreCalc()
  }, [onNotAutoFillPreCalc])

  const resetInputAmount = () => {
    setBaseAmount('')
    setQuoteAmount('')
    setStrategy(StrategyType.Spot)
    setMinPriceData(undefined)
    setMaxPriceData(undefined)
    setNumBins(0)
    setCreateBinInfos(undefined)
  }

  const getConfirmData = () => {
    const data = {}

    return data
  }
  const handleCreateAction = async () => {
    const toastInfo = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const baseSymbol = textEllipses(baseToken?.symbol)
        const quoteSymbol = textEllipses(quoteToken?.symbol)
        // const description = `Add ${addComma(baseAmount)} ${baseSymbol} and ${addComma(quoteAmount)} ${quoteSymbol}`
        const description = 'Create DLMM Pool'
        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }

        if (status === 'success') {
          // let payAmountF = baseAmount
          // let receiveAmountF = quoteAmount

          // if (balanceChanges) {
          //   payAmountF = getBalanceChanges(balanceChanges, baseToken) || baseAmount
          //   receiveAmountF = getBalanceChanges(balanceChanges, quoteToken) || quoteAmount
          // }
          // const description = `Add ${addComma(payAmountF as string)} ${baseSymbol} and ${addComma(receiveAmountF as string)} ${quoteSymbol}`
          const description = 'Create DLMM Pool'
          info.toastDescriptionContent = description
          info.modalDescriptionText = description
          info.toastTitleText = 'Create Success'
        }

        if (status === 'rejected') {
          info.toastTitleText = 'Create pool'
        }

        return info
      }
    }
    transactionConfirmation(toastInfo)

    let TrackDataParams: any = {}
    try {
      let active_id = activeId!
      const isReverse = isSortedSymbols(normalizeSuiAddress(baseToken!.coin_type), normalizeSuiAddress(quoteToken!.coin_type))

      if (isReverse) {
        const initPriceF = d(1).div(initPrice).toString()
        const active_id_reverse = BinUtils.getBinIdFromPrice(initPriceF, binStep!.binStep, false, quoteToken!.decimals, baseToken!.decimals)
        active_id = active_id_reverse
      }

      TrackDataParams = {
        active_id,
        bin_step: binStep!.binStep,
        tokenA: isReverse ? quoteToken!.coin_type : baseToken!.coin_type,
        tokenB: isReverse ? baseToken!.coin_type : quoteToken!.coin_type,
        base_factor: binStep!.baseFactor
      }

      const { tx, pool_id } = await getCreateDLMMPoolTxPayload({
        active_id,
        bin_step: binStep!.binStep,
        tokenA: isReverse ? quoteToken! : baseToken!,
        tokenB: isReverse ? baseToken! : quoteToken!,
        base_factor: binStep!.baseFactor
      })

      if (tx) {
        const res = await signAndExecuteTransaction(tx, toastInfo, {
          useDevInspect: true,
          useMev: mevProtect,
          showSuccessModal: false,
          useFastMode: transactionMode === 'Fast Mode',
          maxCapForGas,
          customGasPrice,
          trackData: {
            ...TrackDataParams,
            actionType: 'dlmm',
            action: 'dlmmCreatePool'
          }
        })
        console.log('🚀 ~ handleCreateAction ~ res:', res)

        if (res) {
          //获取余额
          fetchAccountBalance()
          // 刷新feeTierList
          updateBinStep()

          return binStep
        }
      }
    } catch (error) {
      console.log('🚀 ~ file: useCreatePool.ts:341 ~ handleCreateAction ~ error:', error)
      transactionRejected(toastInfo)
    }

    return undefined
  }

  const handleInitPriceChange = (value: string) => {
    setInitPrice(value)
  }

  // 失去焦点操作
  const onPriceChange = (data: RangePriceType, value: string) => {
    if (!baseToken || !quoteToken) return
    const _binId = BinUtils.getBinIdFromPrice(value, binStep!.binStep, false, baseToken?.decimals, quoteToken?.decimals)
    const [displayPrice, reversePrice, displayReversePrice] = getRelatedDisplayPrice(value)
    const res = {
      tokenA: baseToken,
      tokenB: quoteToken,
      binId: _binId,
      price: value,
      displayPrice: value,
      reversePrice,
      displayReversePrice,
      type: data?.type
    }
    if (data?.type === 'lower') {
      setMinPriceData(res)
    } else {
      setMaxPriceData(res)
    }
  }

  useEffect(() => {
    if (isAvailableObject(minPriceData) && isAvailableObject(maxPriceData) && activeId !== undefined) {
      const minId = minPriceData!.binId
      const maxId = maxPriceData!.binId
      if (d(minId).gt(maxId)) {
        setBaseTokenLock(true)
        setQuoteTokenLock(true)
      } else {
        if (d(minId).gt(activeId)) {
          setBaseTokenLock(false)
          setQuoteTokenLock(true)
        } else if (d(maxId).lt(activeId)) {
          setBaseTokenLock(true)
          setQuoteTokenLock(false)
        } else {
          setBaseTokenLock(false)
          setQuoteTokenLock(false)
        }
      }
    }
  }, [minPriceData, maxPriceData, activeId])

  const onOk = () => {
    // 回到第2步
    handleStepClick(2)
  }
  return {
    baseToken,
    quoteToken,
    onSelectTokenChange,
    displayBaseToken,
    displayQuoteToken,
    initPrice,
    baseAmount,
    quoteAmount,
    handleAmountChange,
    getConfirmData,
    handleCreateAction,
    minPriceData,
    maxPriceData,
    handleStepClick,
    binStep,
    setBinStep,
    handlePriceAction,
    handleInitPriceChange,
    fixAmountA,
    setFixAmountA,
    isAutoFill,
    setIsAutoFill,
    handleActionBinPrice,
    strategy,
    setStrategy,
    handleBinStepChange,
    onPriceChange,
    onOk,
    updateBinStep,
    binStepList,
    handleBaseFeeChange,
    baseFee,
    getBinStepListLoading
  }
}
