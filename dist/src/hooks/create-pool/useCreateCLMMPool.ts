import { CreateConfirmModalData } from '@/components/pools/createPool/CreateConfirmModal'
import { FeeTier } from '@/components/selectPool/type'
import useTransaction from '@/hooks/common/useTransaction'
import useCreatePoolStore from '@/store/pool/useCreatePool'
import { PoolPercent, PrePosAddRes } from '@/types'
import { TickData } from '@/types/clmm'
import { calcCoinProportion } from '@/utils/pool'
import { clmmDefaultFeeOptions } from '@cetus/design/src/components/common/feeSelect/config'
import { useAccountBalance, usePreviousValue } from '@cetus/hooks'
import { BalanceChanges, CommonTypeInfo, Token, TransactionStatusType } from '@cetus/types'
import { Decimal, addComma, formatNumber, getBalanceChanges, textEllipses } from '@cetus/utils'
import { TickMath, TickUtil, d } from '@cetusprotocol/common-sdk'
import { useDebounceEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import useCreatePoolHelper from './useCreatePoolHelper'
import useCreatePriceRange from './useCreatePriceRange'

export default function useCreateCLMMPool(isReverse: boolean, handleSelectTokenChange: (token: Token | undefined, isBaseToken: boolean) => void) {
  const { fee } = useParams()

  const [feeTier, setFeeTier] = useState<FeeTier | undefined>(undefined)
  const [feeTierList, setFeeTierList] = useState<FeeTier[]>([])
  const [isFetchingOptions, setIsFetchingOptions] = useState<boolean>(false)
  const { signAndExecuteTransaction, transactionConfirmation, transactionRejected } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()

  const { preAddPool, fetchFeeTierList, getCreatePoolTxPayload } = useCreatePoolHelper()
  const {
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

  const [fixBaseTokenInput, setFixBaseTokenInput] = useState<boolean>(true)

  useEffect(() => {
    fetchAccountBalance()
  }, [])

  // 初始化价格
  const [initPrice, setInitPrice] = useState<string>('')
  //是否是全区间
  const [isFullRange, setIsFullRange] = useState<boolean>(true)

  // 最小价格
  const [minTickData, setMinTickData] = useState<Partial<TickData>>({})
  // 最大价格
  const [maxTickData, setMaxTickData] = useState<Partial<TickData>>({})
  // 当前价格tick
  const [currTick, setCurrTick] = useState<number | undefined>()
  // 质押百分比map
  const [percentMap, setPercentMap] = useState<PoolPercent | undefined>(undefined)

  //  预计算结果
  const [prePosAddRes, setPrePosAddRes] = useState<PrePosAddRes | undefined>(undefined)

  const { calcInitPriceRange, handleActionPrice, updateTickDataBasedOnPrice } = useCreatePriceRange()

  const [baseAmount, setBaseAmount] = useState<string>('')
  const [quoteAmount, setQuoteAmount] = useState<string>('')

  const updateFeeTierList = useCallback(() => {
    if (baseToken && quoteToken) {
      setIsFetchingOptions(true)
      fetchFeeTierList(baseToken.coin_type, quoteToken.coin_type)
        .then(res => {
          setFeeTierList(
            res?.map(item => ({
              ...item,
              title: item?.title !== 'Not Created' ? 'Created' : 'Not Created'
            }))
          )
          const notCreateList = res.filter(item => item.poolAddress === undefined)
          const defaultFee =
            notCreateList.find(item => item.feeRate === fee) ||
            notCreateList.find(item => item.feeRate === '25') ||
            (notCreateList.length > 0 ? notCreateList[0] : undefined) ||
            (res.length > 0 ? res[0] : undefined)
          if (defaultFee) {
            handleFeeTierChange({ ...defaultFee, title: defaultFee?.title !== 'Not Created' ? 'Created' : 'Not Created' })
          }
          setIsFetchingOptions(false)
        })
        .catch(() => {
          setIsFetchingOptions(false)
        })
    } else {
      setFeeTierList(
        clmmDefaultFeeOptions?.map(item => ({
          ...item,
          title: ''
        }))
      )
      setFeeTier(undefined)
    }
  }, [baseToken?.coin_type, quoteToken?.coin_type])
  /**
   * token 变化，更新feeTierList
   */
  useEffect(() => {
    updateFeeTierList()
  }, [updateFeeTierList])
  /**
   * 处理切换Token
   * @param token
   * @param isBaseToken
   */
  const onSelectTokenChange = (token?: Token, isBaseToken: boolean = true) => {
    handleStepClick(2)
    handleSelectTokenChange(token, isBaseToken)
  }
  /**
   * 处理FeeTier 切换
   * @param fee
   */
  const handleFeeTierChange = (fee: FeeTier) => {
    setFeeTier(fee)
    setCurrentStep(2)
    resetData()
    handleRangeModeChange(true)
  }

  /**
   * 处理切换Token 方向
   */
  const handleSwitchDirectionChange = () => {
    const baseToken = displayBaseToken
    const quoteToken = displayQuoteToken
    setDisplayBaseToken(quoteToken)
    setDisplayQuoteToken(baseToken)

    if (+initPrice) {
      const price = formatNumber(d(1).div(initPrice).toFixed(18), 18, true).toString()

      setInitPrice(price)
    }
  }
  /**
   * 价格/tickSpacing变化，重新初始化tick 区间
   */
  useEffect(() => {
    handleInitPriceRange(isFullRange)
  }, [initPrice, feeTier?.tickSpacing])

  const handleInitPriceRange = (isFull: boolean, initMinTick?: number, initMaxTick?: number) => {
    resetInputAmount()
    const data = calcInitPriceRange(
      isFull,
      initPrice && +initPrice ? (isReverse ? (1 / Number(initPrice)).toString() : initPrice) : '',
      Number(feeTier?.tickSpacing || 0),
      isReverse ? displayQuoteToken : displayBaseToken,
      isReverse ? displayBaseToken : displayQuoteToken,
      initMinTick,
      initMaxTick
    )
    console.log('🚀 ~ handleInitPriceRange ~ data:', data)

    if (data) {
      setMaxTickData(data.maxData)
      setMinTickData(data.minData)
      setCurrTick(data.currTick)
    } else {
      setCurrTick(undefined)
    }
  }

  const maxPrice = useMemo(() => {
    if (feeTier && displayBaseToken && displayQuoteToken) {
      const price = TickMath.tickIndexToPrice(TickUtil.getMaxIndex(20), 6, 6).toFixed(9, Decimal.ROUND_DOWN)

      return price
    }
    return undefined
  }, [feeTier?.tickSpacing, displayBaseToken?.decimals, displayQuoteToken?.decimals])

  /**
   * 处理价格输入
   */
  const handleInitPriceChange = (price: string) => {
    setInitPrice(price)
  }

  /**
   * 处理价格区间模式切换
   */
  const handleRangeModeChange = (isFull: boolean, initMinTick?: number, initMaxTick?: number) => {
    setIsFullRange(isFull)
    resetInputAmount()
    handleInitPriceRange(isFull, initMinTick, initMaxTick)
  }

  const displayMinPrice = useMemo(() => {
    return isFullRange ? minTickData : isReverse ? maxTickData : minTickData
  }, [isFullRange, minTickData, maxTickData, isReverse])

  const displayMaxPrice = useMemo(() => {
    return isFullRange ? maxTickData : isReverse ? minTickData : maxTickData
  }, [isFullRange, minTickData, maxTickData, isReverse])

  /**
   * 处理区间价格加减
   * @param action
   * @param isMin
   */
  const handlePriceAction = (action: 'Add' | 'Sub', tickData: Partial<TickData>) => {
    resetInputAmount()
    const tick = handleActionPrice(tickData, action)
    if (tick) {
      if (tick?.id === minTickData?.id) {
        setMinTickData(tick)
      } else {
        setMaxTickData(tick)
      }
    }
  }
  const isFullRangePre = usePreviousValue(isFullRange)
  /**
   * 失去焦点后 处理tick价格变化
   * @param data
   * @param value
   * @param isMin
   */
  const handleTickPriceChange = (data: Partial<TickData>, value: string, isMin: boolean) => {
    const newTickData = updateTickDataBasedOnPrice(data, value)

    if (newTickData) {
      newTickData.pool = new Date().getTime().toString()

      let initMinTick = minTickData?.tick
      let initMaxTick = maxTickData?.tick

      if (newTickData.id === 'lower') {
        setMinTickData({ ...newTickData })
        initMinTick = newTickData.tick
      } else {
        setMaxTickData({ ...newTickData })
        initMaxTick = newTickData.tick
      }

      // 上一次是区间。在失去焦点时。校验是否是全区间矫正
      if (initMinTick !== undefined && initMaxTick !== undefined && feeTier) {
        if (isFullRangePre) {
          if (
            TickUtil.getMaxIndex(Number(feeTier.tickSpacing)) !== initMaxTick ||
            TickUtil.getMinIndex(Number(feeTier.tickSpacing)) !== initMinTick
          ) {
            handleRangeModeChange(false)
          } else {
            handleRangeModeChange(true)
          }
        }
      } else {
        handleRangeModeChange(false, initMinTick, initMaxTick)
      }
    } else {
      handleRangeModeChange(false)
    }
  }

  /**
   * 处理数量输入
   * @param amount
   * @param fixBaseToken
   */
  const handleAmountChange = (amount: string, fixBaseToken: boolean) => {
    setFixBaseTokenInput(fixBaseToken)
    if (fixBaseToken) {
      setBaseAmount(amount)
    } else {
      setQuoteAmount(amount)
    }
    const res = preCalcAddPool(amount, fixBaseToken, isFullRange)
    if (res) {
      setPrePosAddRes(res)
      if (fixBaseToken) {
        setQuoteAmount(isReverse ? res.coinAmountA : res.coinAmountB)
      } else {
        setBaseAmount(isReverse ? res.coinAmountB : res.coinAmountA)
      }
    } else {
      if (fixBaseToken) {
        setQuoteAmount('')
      } else {
        setBaseAmount('')
      }
      setPrePosAddRes(undefined)
    }
  }

  /**
   * 切换步骤
   * @param step
   */
  const handleStepClick = (step: number) => {
    if (step === 1) {
      backToStepOne('clmm')
      setInitPrice('')
      handleRangeModeChange(true)
      resetInputAmount()
    } else if (step === 2) {
      setCurrentStep(2)
      setEditStep(2)
      setInitPrice('')
      handleRangeModeChange(true)
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

  /**
   * 预计算
   * @param amount
   * @param fixBaseToken
   * @param isFull
   * @returns
   */
  const preCalcAddPool = (amount: string, fixBaseToken: boolean, isFull: boolean) => {
    if (displayQuoteToken && displayBaseToken && initPrice && feeTier && amount && +amount && minTickData?.price && maxTickData?.price) {
      try {
        const res = preAddPool({
          realTokenA: isReverse ? displayQuoteToken : displayBaseToken,
          realTokenB: isReverse ? displayBaseToken : displayQuoteToken,
          needReverse: minTickData.tokenA!.coin_type !== displayBaseToken!.coin_type,
          tickSpacing: Number(feeTier.tickSpacing),
          amount,
          amountCoinType: fixBaseToken ? displayBaseToken.coin_type : displayQuoteToken.coin_type,
          maxPrice: isFullRange ? maxTickData.price : isReverse ? minTickData.reversePrice! : maxTickData.price!,
          minPrice: isFullRange ? minTickData.price : isReverse ? maxTickData.reversePrice! : minTickData.price!,
          price: isReverse ? d(1).div(initPrice).toString() : initPrice
        })
        console.log('🚀 ~ file: useCreatePool.ts:212 ~ handleAmountChange ~ res:', res)

        return res
      } catch (error) {
        console.log('🚀 ~ file: useCreatePool.ts:240 ~ preCalcAddPool ~ error:', error)
      }
    }

    return undefined
  }

  useDebounceEffect(
    () => {
      const res = preCalcAddPool('1', true, isFullRange)
      if (res) {
        const perMap = calcCoinProportion(res?.coinAmountA, res?.coinAmountB, isReverse ? (1 / Number(initPrice)).toString() : initPrice, isFullRange)
        console.log('🚀 ~ file: useCreatePool.ts:273 ~ useCreatePool ~ perMap:', perMap)

        setPercentMap(perMap)
      } else {
        setPercentMap(undefined)
      }
    },
    [initPrice, minTickData.tick, maxTickData.tick, isFullRange, isReverse, feeTier?.tickSpacing],
    {
      wait: 500
    }
  )

  const resetData = () => {
    setInitPrice('')
    resetInputAmount()
    setIsFullRange(true)
  }

  const resetInputAmount = () => {
    setBaseAmount('')
    setQuoteAmount('')
  }

  const getConfirmData = () => {
    const data: CreateConfirmModalData = {
      isReverse,
      baseToken: displayBaseToken!,
      quoteToken: displayQuoteToken!,
      baseAmount,
      quoteAmount,
      minPrice: displayMinPrice as any,
      maxPrice: displayMaxPrice as any,
      initPrice,
      feeDisplay: feeTier!.feeDisplay,
      isFullRange
    }

    return data
  }

  const handleCreateAction = async () => {
    const realTokenA = minTickData!.tokenA!
    const realTokenB = minTickData!.tokenB!
    const fixAmountA = realTokenA.coin_type === (fixBaseTokenInput ? displayBaseToken!.coin_type : displayQuoteToken!.coin_type)

    const toastInfo = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const baseSymbol = textEllipses(displayBaseToken?.symbol)
        const quoteSymbol = textEllipses(displayQuoteToken?.symbol)
        const description = `Add ${addComma(baseAmount)} ${baseSymbol} and ${addComma(quoteAmount)} ${quoteSymbol}`

        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }

        if (status === 'success') {
          let payAmountF = baseAmount
          let receiveAmountF = quoteAmount

          if (balanceChanges) {
            payAmountF = getBalanceChanges(balanceChanges, displayBaseToken) || baseAmount
            receiveAmountF = getBalanceChanges(balanceChanges, displayQuoteToken) || quoteAmount
          }
          const description = `Add ${addComma(payAmountF as string)} ${baseSymbol} and ${addComma(receiveAmountF as string)} ${quoteSymbol}`

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

    try {
      const payload = await getCreatePoolTxPayload(prePosAddRes as any)
      const msafeParams = payload.msafeParams

      const res = await signAndExecuteTransaction(payload.tx, toastInfo, {
        showSuccessModal: false,
        useDevInspect: true,
        msafeParams
      })
      if (res) {
        //获取余额
        fetchAccountBalance()
        // 刷新feeTierList
        updateFeeTierList()

        return feeTier!.feeDisplay
      }
    } catch (error) {
      console.log('🚀 ~ file: useCreatePool.ts:341 ~ handleCreateAction ~ error:', error)
      transactionRejected(toastInfo)
    }

    return undefined
  }

  const onOk = () => {
    // 回到第2步
    handleStepClick(2)
  }

  return {
    baseToken,
    quoteToken,
    onSelectTokenChange,
    feeTier,
    setFeeTier,
    feeTierList,
    displayBaseToken,
    displayQuoteToken,
    handleSwitchDirectionChange,
    initPrice,
    handleInitPriceChange,
    isFullRange,
    handleRangeModeChange,
    minTickData,
    maxTickData,
    handleFeeTierChange,
    handlePriceAction,
    baseAmount,
    quoteAmount,
    handleAmountChange,
    getConfirmData,
    handleCreateAction,
    percentMap,
    currTick,
    displayMinPrice,
    displayMaxPrice,
    handleTickPriceChange,
    handleStepClick,
    fetchFeeTierList,
    updateFeeTierList,
    onOk,
    isFetchingOptions
  }
}
