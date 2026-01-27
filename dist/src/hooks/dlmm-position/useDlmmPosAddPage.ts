import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { MsafeTransactionSubType } from '@/types'
import { BothAndZapTabAction } from '@/types/dlmm'
import { formatDescription } from '@/utils'
import { useAccountBalance } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { getBalanceChanges, isAvailableObject, textEllipses } from '@cetus/utils'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinLiquidityInfo } from '@cetusprotocol/dlmm-sdk'
import { useDebounceEffect, useDeepCompareEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useSlippageTolerance from '../common/useSlippageTolerance'
import useTransaction from '../common/useTransaction'
import { PriceDataType } from '../create-pool/useCreateDLMMPool'
import useCreatePriceBin from '../dlmm/useCreatePriceBin'
import { useMinMaxPriceData } from '../dlmm/useDlmmHelper'
import { useDlmmZapIn } from '../dlmm/useDlmmZapIn'
import useGetDlmmRelatedPools from '../dlmm/useGetDlmmRelatedPools'
import useDlmmPosAdd from './useDlmmPosAdd'
import useDlmmPosHelper from './useDlmmPosHelper'
import useGetDlmmCurrentPos from './useGetDlmmCurrentPos'

export default function useDlmmPosAddPage() {
  const { dlmmCurrentPosBaseInfo, dlmmPosLiquidityData, dlmmPosPoolsRelatedData, dlmmPosPoolsOriginalData } = useDlmmPositionStore()
  const { setTokenAmountAfterA, setTokenAmountAfterB, minPriceData, maxPriceData, setMinPriceData, setMaxPriceData } = useDlmmPosDetailStore()
  const { binInfos, setBinInfos, setPreCalcError, preCalcError, currAddTabMode } = useDlmmPosDetailStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { dlmmPreAdd, getDlmmPosAddLiquidityPayload } = useDlmmPosAdd()
  const { currentAccount } = useAccountStore()
  const { getTokenALock, getTokenBLock } = useDlmmPosHelper()
  const [disabledAutoFill, setDisabledAutoFill] = useState(false)
  const [isSelectRange, setIsSelectRange] = useState(true)
  const [isAddLoading, setIsAddLoading] = useState(false)
  const { handleActionBinPrice, getNumBins } = useCreatePriceBin()
  const { strategy, setStrategy, isAutoFill, setIsAutoFill, dlmmApiPoolInfo } = useDlmmLiquidityStore()
  const { dlmmPosDetailDirect, isAutoClaim } = useDlmmPosDetailStore()
  const { transactionConfirmation } = useTransactionModal()

  // 池子合约信息
  const dlmmCurrentPosPoolsOriginalData = useMemo(() => {
    return dlmmPosPoolsOriginalData[dlmmCurrentPosBaseInfo?.dlmmPool]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosPoolsOriginalData])

  const [tokenAmountA, setTokenAmountA] = useState('')
  const [tokenAmountB, setTokenAmountB] = useState('')
  const [displayTokenALock, setDisplayTokenALock] = useState(false)
  const [displayTokenBLock, setDisplayTokenBLock] = useState(false)

  const [isFixedDisplayTokenA, setIsFixedDisplayTokenA] = useState(true)
  const [dlmmPreAddLoading, setDlmmPreAddLoading] = useState(false)
  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useRef<string>('')

  const isBtnClickRef = useRef(false)

  useEffect(() => {
    console.log('🚀 ~ usePosAddPage ~ uuid:', uuid)
    uuidRef.current = uuid
  }, [uuid])

  // tokenA、B
  const displayTokenA = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.displayTokenA
  }, [dlmmCurrentPosBaseInfo])
  const displayTokenB = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.displayTokenB
  }, [dlmmCurrentPosBaseInfo])

  const tokenA = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.tokenA
  }, [dlmmCurrentPosBaseInfo])

  const tokenB = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.tokenB
  }, [dlmmCurrentPosBaseInfo])

  const binStep = useMemo(() => {
    return dlmmCurrentPosPoolsOriginalData?.binStep
  }, [dlmmCurrentPosPoolsOriginalData])

  const { buildPriceData } = useMinMaxPriceData(tokenA, tokenB, binStep)

  // 余额
  const { balanceInfo: tokenABalanceInfo } = useGetTokenBalance(displayTokenA)
  const { balanceInfo: tokenBBalanceInfo } = useGetTokenBalance(displayTokenB)

  // 价值
  const tokenAmountValueA = getTokenAmountValue(displayTokenA?.coin_type, tokenAmountA)
  const tokenAmountValueB = getTokenAmountValue(displayTokenB?.coin_type, tokenAmountB)

  const currentPosPoolsRelatedData = useMemo(() => {
    return dlmmPosPoolsRelatedData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmPosPoolsRelatedData, dlmmCurrentPosBaseInfo?.id])

  const refreshForSubmitAfter = async (toastInfo: any, txLength: number, res?: any) => {
    if (res) {
      resetInputAmount()
      fetchAccountBalance()
      await getList({ poolId: dlmmCurrentPosBaseInfo?.dlmmPool })
    }
    if (currentAccount) {
      getDlmmCurrentPosBaseInfo(currentAccount?.address, dlmmCurrentPosBaseInfo?.id as string, true).then(res => {
        if (!res) {
          reCalculateResult()
        }
      })
    }
    setIsAddLoading(false)
  }
  const zapProps = useDlmmZapIn(
    currAddTabMode === BothAndZapTabAction.zapIn,
    strategy,
    minPriceData?.binId,
    maxPriceData?.binId,
    tokenA,
    tokenB,
    dlmmCurrentPosPoolsOriginalData || null,
    dlmmCurrentPosBaseInfo?.isReverse,
    dlmmCurrentPosPoolsOriginalData?.active_bin,
    dlmmCurrentPosBaseInfo?.isReverse ? currentPosPoolsRelatedData?.currentPriceReverse : currentPosPoolsRelatedData?.currentPrice,
    refreshForSubmitAfter,
    setPreCalcError,
    {
      pos_id: dlmmCurrentPosBaseInfo?.id,
      collect_fee: isAutoClaim,
      collect_rewarder_types: isAutoClaim ? dlmmCurrentPosPoolsOriginalData?.reward_manager?.rewards.map(ele => ele.reward_coin) : []
    }
  )

  useEffect(() => {
    if (zapProps?.preDepositResult) {
      setBinInfos(zapProps?.preDepositResult?.bin_infos)
    } else {
      setBinInfos({} as BinLiquidityInfo)
    }
  }, [zapProps?.preDepositResult])

  useEffect(() => {
    if (currAddTabMode === BothAndZapTabAction.zapIn) {
      resetInputAmount()
    } else {
      zapProps?.handleChangeZapAmount('')
    }
    setBinInfos({} as BinLiquidityInfo)
  }, [currAddTabMode])

  useEffect(() => {
    if (currAddTabMode === BothAndZapTabAction.zapIn) {
      setBinInfos({} as BinLiquidityInfo)
      zapProps?.handleChangeZapAmount('')
    }
  }, [isAutoFill])

  const resetInputAmount = () => {
    setTokenAmountA('')
    setTokenAmountB('')
    setBinInfos({} as BinLiquidityInfo)
    setPreCalcError(undefined)
  }

  useEffect(() => {
    if ((!tokenAmountA || !+tokenAmountA) && (!tokenAmountB || !+tokenAmountB)) {
      setBinInfos({} as BinLiquidityInfo)
      setPreCalcError(undefined)
    }
  }, [tokenAmountA, tokenAmountB])

  const handleAmountChange = (amount: string, isFixedDisplayTokenA: boolean) => {
    isBtnClickRef.current = false
    if (!amount && isAutoFill) {
      resetInputAmount()
    }
    setIsFixedDisplayTokenA(isFixedDisplayTokenA)
    if (isFixedDisplayTokenA) {
      setTokenAmountA(amount)
    } else {
      setTokenAmountB(amount)
    }

    if (+amount) {
      const uuid = v4()
      setUuid(uuid)

      console.log('🚀 ~ handleAmountChange ~ params:', amount)
    } else {
      if (isAutoFill) {
        if (isFixedDisplayTokenA) {
          setTokenAmountB('')
        } else {
          setTokenAmountA('')
        }
      }
    }
    setTimeout(() => {
      isBtnClickRef.current = true
    }, 300)
  }

  const debouncedDlmmPreAdd = async (
    amount: string,
    otherAmount: string,
    isFixedDisplayTokenA: boolean,
    isDisplayTokenALock: boolean = false,
    isDisplayTokenBLock: boolean = false
  ) => {
    if (!dlmmPreAddLoading) {
      setDlmmPreAddLoading(true)
    }
    console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:132 ~ debouncedDlmmPreAdd ~ amount:', amount, otherAmount, isFixedDisplayTokenA)
    const binStep = dlmmCurrentPosPoolsOriginalData.binStep
    const selectLowerBinId = isSelectRange ? minPriceData.binId : dlmmCurrentPosBaseInfo.lowerBinId
    const selectUpperBinId = isSelectRange ? maxPriceData.binId : dlmmCurrentPosBaseInfo.upperBinId
    console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:140 ~ debouncedDlmmPreAdd ~ minPriceData.price:', {
      dlmmCurrentPosBaseInfo,
      selectLowerBinId,
      selectUpperBinId,
      minPriceData,
      maxPriceData
    })

    let lowerBinId = d(selectLowerBinId).lt(dlmmCurrentPosBaseInfo.lowerBinId) ? dlmmCurrentPosBaseInfo.lowerBinId : selectLowerBinId
    let upperBinId = d(selectUpperBinId).gt(dlmmCurrentPosBaseInfo.upperBinId) ? dlmmCurrentPosBaseInfo.upperBinId : selectUpperBinId

    if (lowerBinId > upperBinId) {
      lowerBinId = dlmmCurrentPosBaseInfo.lowerBinId
      upperBinId = dlmmCurrentPosBaseInfo.upperBinId
    }

    let params = {
      pool: dlmmCurrentPosPoolsOriginalData,
      activeId: dlmmCurrentPosPoolsOriginalData.active_id,
      binStep,
      lowerBinId,
      upperBinId,
      strategy,
      amount: d(amount || 0)
        .mul(10 ** (isFixedDisplayTokenA ? displayTokenA?.decimals : displayTokenB?.decimals))
        .toString(),
      fixAmountA: dlmmCurrentPosBaseInfo?.isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA,
      fromToken: displayTokenA,
      toToken: displayTokenB,
      isReverse: dlmmCurrentPosBaseInfo?.isReverse,
      isAutoFill,
      otherAmount: d(otherAmount || 0)
        .mul(10 ** (isFixedDisplayTokenA ? displayTokenB?.decimals : displayTokenA?.decimals))
        .toString()
    }
    // -34390 -34380
    // -34448  -34380
    // -34448  -34380
    console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:108 ~ debouncedDlmmPreAdd ~ params:', params)
    try {
      const { displayCoinAmountA, displayCoinAmountB, binInfos } = await dlmmPreAdd(params)
      setBinInfos(binInfos)
      setPreCalcError(undefined)
      console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:166 ~ debouncedDlmmPreAdd ~ binInfos:', {
        binInfos,
        params
      })
      if (isAutoFill) {
        if (isFixedDisplayTokenA) {
          if (!isDisplayTokenBLock) {
            setTokenAmountB(displayCoinAmountB)
          }
        } else {
          if (!isDisplayTokenALock) {
            setTokenAmountA(displayCoinAmountA)
          }
        }
      } else {
        // if (isFixedDisplayTokenA) {
        //   setTokenAmountA(displayCoinAmountA)
        // } else {
        //   setTokenAmountB(displayCoinAmountB)
        // }
      }
    } catch (error) {
      if (String(error).includes('is less than 1')) {
        setPreCalcError('amountTooSmall')
        setBinInfos({} as BinLiquidityInfo)
      } else {
        setPreCalcError(undefined)
      }
    } finally {
      setTimeout(() => {
        setDlmmPreAddLoading(false)
      }, 500)
    }
  }

  // 重新计算 (刷新按钮价格更新时 交易失败时)
  const reCalculateResult = () => {
    if (supportZap && currAddTabMode === BothAndZapTabAction.zapIn && isAutoFill) {
      zapProps.reCalculateZapData()
      return
    }
    if ((tokenAmountA || tokenAmountB) && isAvailableObject(dlmmCurrentPosBaseInfo)) {
      const amount = isFixedDisplayTokenA ? tokenAmountA : tokenAmountB
      const otherAmount = isFixedDisplayTokenA ? tokenAmountB : tokenAmountA
      if (+amount || +otherAmount) {
        console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:199 ~ reCalculateResult ~ debouncedDlmmPreAdd:', amount, 'test', otherAmount)
        debouncedDlmmPreAdd(amount, otherAmount, isFixedDisplayTokenA, displayTokenALock, displayTokenBLock)
      } else {
        setBinInfos({} as BinLiquidityInfo)
        setPreCalcError(undefined)
      }
    }
  }

  const totalAmount = useMemo(() => {
    return d(tokenAmountValueA).add(tokenAmountValueB).toString()
  }, [tokenAmountValueA, tokenAmountValueB])

  const showTokenALock = useMemo(() => {
    return getTokenALock(dlmmCurrentPosBaseInfo, dlmmCurrentPosPoolsOriginalData)
  }, [dlmmCurrentPosPoolsOriginalData?.active_id, dlmmCurrentPosBaseInfo])

  const showTokenBLock = useMemo(() => {
    return getTokenBLock(dlmmCurrentPosBaseInfo, dlmmCurrentPosPoolsOriginalData)
  }, [dlmmCurrentPosPoolsOriginalData?.active_id, dlmmCurrentPosBaseInfo])

  const showDisplayTokenALock = !dlmmCurrentPosBaseInfo?.isReverse ? showTokenALock : showTokenBLock
  const showDisplayTokenBLock = !dlmmCurrentPosBaseInfo?.isReverse ? showTokenBLock : showTokenALock

  const { dlmmMevProtect, maxCapForGas, transactionMode, customGasPrice, liquiditySlippage } = useGlobalStore()
  const { signAndExecuteTransaction, batchSignAndExecuteTransaction } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const { getDlmmCurrentPosBaseInfo } = useGetDlmmCurrentPos()
  const { getList } = useGetDlmmRelatedPools()
  const toAdd = async () => {
    setIsAddLoading(true)
    let TrackDataParams: any = {}
    const parameter = {
      dlmmPool: dlmmCurrentPosBaseInfo.dlmmPool,
      coinTypeA: dlmmCurrentPosBaseInfo.coinTypeA,
      coinTypeB: dlmmCurrentPosBaseInfo.coinTypeB,
      positionId: dlmmCurrentPosBaseInfo?.id,
      activeId: dlmmCurrentPosPoolsOriginalData.active_id,
      collectFee: isAutoClaim,
      rewardCoins: isAutoClaim ? dlmmCurrentPosPoolsOriginalData.reward_manager.rewards.map(ele => ele.reward_coin) : [],
      binInfos,
      strategy,
      binStep
    }
    let txs: any[] = []

    console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:244 ~ toAdd ~ params:', parameter)

    const { binInfos: p_binInfos, rewardCoins, ...trackData } = parameter

    TrackDataParams = { ...trackData }

    if (rewardCoins.length > 0) {
      TrackDataParams['rewardCoins'] = JSON.stringify(rewardCoins)
    }

    const tx = getDlmmPosAddLiquidityPayload(parameter, isAutoClaim)
    txs = txs.concat(tx)

    console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:262 ~ toAdd ~ tx:', tx)
    const msafeParams = {
      action: MsafeTransactionSubType.DlmmIncreaseLiquidity,
      txbParams: parameter
    }
    const toastInfo = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>, _: any, otherParams?: any) => {
        const description =
          'Add ' +
          [formatDescription(tokenAmountA, displayTokenA?.symbol), formatDescription(tokenAmountB, displayTokenB?.symbol)]
            .filter(Boolean)
            .join(' and ')

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
          let amountAF = tokenAmountA
          let amountBF = tokenAmountB

          if (balanceChanges) {
            amountAF = getBalanceChanges(balanceChanges, displayTokenA) || tokenAmountA
            amountBF = getBalanceChanges(balanceChanges, displayTokenB) || tokenAmountB
          }
          const description =
            'Add ' +
            [formatDescription(amountAF, displayTokenA?.symbol), formatDescription(amountBF, displayTokenB?.symbol)].filter(Boolean).join(' and ')
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
    console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:299 ~ toAdd ~ tx:', tx)

    const res = await batchSignAndExecuteTransaction(txs, toastInfo, {
      useMev: dlmmMevProtect,
      // useFastMode: transactionMode === 'Fast Mode',
      maxCapForGas,
      customGasPrice,
      msafeParams,
      trackData: {
        params: TrackDataParams,
        actionType: 'dlmm',
        action: 'dlmmIncreaseLiquidity'
      }
    })

    if (res?.successResults) {
      refreshForSubmitAfter(toastInfo, txs.length, res.successResults[0]!.response!)
    } else {
      if (dlmmCurrentPosBaseInfo) {
        refreshForSubmitAfter(toastInfo, txs.length)
      }
    }
    setIsAddLoading(false)
  }

  const handleAdd = () => {
    toAdd()
  }

  // const [minPriceData, setMinPriceData] = useState({})
  // const [maxPriceData, setMaxPriceData] = useState({})
  const [tokenBalanceA, setTokenBalanceA] = useState('')
  const [tokenBalanceB, setTokenBalanceB] = useState('')

  const isReverse = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.isReverse
  }, [dlmmCurrentPosBaseInfo])

  const currentPosLiquidityData = useMemo(() => {
    return dlmmPosLiquidityData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosLiquidityData])

  const posMinPrice = useMemo(() => {
    return dlmmPosDetailDirect ? currentPosPoolsRelatedData?.minPrice : currentPosPoolsRelatedData?.minPriceResever
  }, [currentPosPoolsRelatedData, dlmmCurrentPosBaseInfo?.id, dlmmPosDetailDirect])

  const posMinPriceBinId = useMemo(() => {
    return currentPosPoolsRelatedData?.minPriceBinId
  }, [currentPosPoolsRelatedData, dlmmCurrentPosBaseInfo?.id])

  const posMaxPrice = useMemo(() => {
    return dlmmPosDetailDirect ? currentPosPoolsRelatedData?.maxPrice : currentPosPoolsRelatedData?.maxPriceResever
  }, [currentPosPoolsRelatedData, dlmmCurrentPosBaseInfo?.id, dlmmPosDetailDirect])

  const posMaxPriceBinId = useMemo(() => {
    return currentPosPoolsRelatedData?.maxPriceBinId
  }, [currentPosPoolsRelatedData, dlmmCurrentPosBaseInfo?.id])

  const initMinMaxPriceAndAmount = () => {
    if (!dlmmCurrentPosBaseInfo || !tokenA || !tokenB || !binStep) return

    handleSlider([dlmmCurrentPosBaseInfo.lowerBinId, dlmmCurrentPosBaseInfo.upperBinId])

    setTokenBalanceA(currentPosLiquidityData?.displayCoinAmountA)
    setTokenBalanceB(currentPosLiquidityData?.displayCoinAmountB)
  }

  const [isInitPrice, setIsInitPrice] = useState(false)
  useDeepCompareEffect(() => {
    if (currentPosLiquidityData && tokenA && tokenB && binStep && !isInitPrice) {
      initMinMaxPriceAndAmount()
      setIsInitPrice(true)
    }
    setTokenBalanceA(currentPosLiquidityData?.displayCoinAmountA)
    setTokenBalanceB(currentPosLiquidityData?.displayCoinAmountB)
  }, [isReverse, currentPosLiquidityData, tokenA, tokenB, binStep])

  const handlePriceAction = useCallback(
    (type: 'Add' | 'Sub', price: PriceDataType) => {
      const isMinPrice = price.type === 'lower'
      console.log('🚀 ~ handlePriceAction ~ price:', {
        price,
        isMinPrice,
        dlmmPosDetailDirect,
        type,
        minPriceData,
        maxPriceData,
        dlmmCurrentPosBaseInfo
      })

      if (
        binStep !== undefined &&
        tokenA !== undefined &&
        tokenB !== undefined &&
        posMinPrice &&
        posMaxPrice &&
        posMinPriceBinId &&
        posMaxPriceBinId
      ) {
        const { bin_id, price: _price } = handleActionBinPrice(price, binStep, tokenA?.decimals, tokenB?.decimals, type)

        if (isMinPrice) {
          if ((type === 'Sub' && bin_id < posMinPriceBinId) || (type === 'Add' && bin_id > posMaxPriceBinId)) {
            const priceData = buildPriceData(posMinPriceBinId, isMinPrice)
            if (priceData) {
              setMinPriceData(priceData)
            }
          } else {
            const priceData = buildPriceData(bin_id, isMinPrice)
            if (priceData) {
              setMinPriceData(priceData)
            }
          }
        } else {
          if ((type === 'Sub' && bin_id < posMinPriceBinId) || (type === 'Add' && bin_id > posMaxPriceBinId)) {
            const priceData = buildPriceData(posMaxPriceBinId, isMinPrice)
            if (priceData) {
              setMaxPriceData(priceData)
            }
          } else {
            const priceData = buildPriceData(bin_id, isMinPrice)
            if (priceData) {
              setMaxPriceData(priceData)
            }
          }
        }
        // getRemoveTokenBalance()
      }
    },
    [binStep, tokenA, tokenB, posMinPrice, posMaxPrice, dlmmPosDetailDirect]
  )

  const handleSlider = (val: number[]) => {
    if (!tokenA || !tokenB || !binStep) return
    const lowerBinId = val[0]
    const upperBinId = val[1]

    const maxPriceData = buildPriceData(upperBinId, false)
    if (maxPriceData) {
      setMaxPriceData(maxPriceData)
    }

    const minPriceData = buildPriceData(lowerBinId, true)
    if (minPriceData) {
      setMinPriceData(minPriceData)
    }
  }

  const [isDirect, setIsDirect] = useState(true)

  const baseToken = useMemo(() => {
    return isDirect ? displayTokenA : displayTokenB
  }, [displayTokenA, displayTokenB, isDirect])

  const quoteToken = useMemo(() => {
    return isDirect ? displayTokenB : displayTokenA
  }, [displayTokenA, displayTokenB, isDirect])
  useDebounceEffect(
    () => {
      if ((binInfos?.amount_a || binInfos?.amount_b) && !dlmmPreAddLoading && dlmmCurrentPosBaseInfo) {
        let addAmountA = binInfos.amount_a || '0'
        let addAmountB = binInfos.amount_b || '0'
        // const activeBin = dlmmCurrentPosPoolsOriginalData.active_bin
        //  const bin = binInfos.bins.find(bin => bin.bin_id === activeBin.bin_id)

        // 单独处理activeBin
        // if (bin && activeBin?.liquidity && !isAutoFill && (d(bin.amount_a).eq(0) || d(bin.amount_b).eq(0))) {
        //   // 先减去activeBin的amount_a和amount_b
        //   addAmountA = d(addAmountA).minus(bin.amount_a).toString()
        //   addAmountB = d(addAmountB).minus(bin.amount_b).toString()
        //   const [activeAmountA, activeAmountB] = BinUtils.getAmountsFromLiquidity(
        //     activeBin.amount_a,
        //     activeBin.amount_b,
        //     bin.liquidity || '0',
        //     d(activeBin.liquidity)
        //       .add(bin.liquidity || '0')
        //       .floor()
        //   )
        //   // 加上activeBin的amount_a和amount_b
        //   addAmountA = d(addAmountA).plus(activeAmountA).toString()
        //   addAmountB = d(addAmountB).plus(activeAmountB).toString()
        // }
        const amountA = dlmmCurrentPosBaseInfo.isReverse ? addAmountB : addAmountA
        const amountB = dlmmCurrentPosBaseInfo.isReverse ? addAmountA : addAmountB
        const tokenADecimals = dlmmCurrentPosBaseInfo.isReverse ? dlmmCurrentPosBaseInfo?.tokenB?.decimals : dlmmCurrentPosBaseInfo?.tokenA?.decimals
        const tokenBDecimals = dlmmCurrentPosBaseInfo.isReverse ? dlmmCurrentPosBaseInfo?.tokenA?.decimals : dlmmCurrentPosBaseInfo?.tokenB?.decimals
        const amountAF = fromDecimalsAmount(amountA, tokenADecimals)
        const amountBF = fromDecimalsAmount(amountB, tokenBDecimals)
        setTokenAmountAfterA(d(amountAF).plus(tokenBalanceA).toString())
        setTokenAmountAfterB(d(amountBF).plus(tokenBalanceB).toString())
      } else {
        setTokenAmountAfterA('')
        setTokenAmountAfterB('')
      }
    },
    [dlmmPreAddLoading, tokenBalanceA, tokenBalanceB, binInfos?.amount_a, binInfos?.amount_b],
    { wait: 200 }
  )

  useEffect(() => {
    return () => {
      resetInputAmount()
      setTokenAmountAfterA('')
      setTokenAmountAfterB('')
    }
  }, [])

  const isActive = useMemo(() => {
    return currentPosPoolsRelatedData?.currentStatus === 'Active'
  }, [currentPosPoolsRelatedData?.currentStatus])

  useEffect(() => {
    if (isActive) {
      if (dlmmCurrentPosPoolsOriginalData?.active_id > maxPriceData?.binId && dlmmCurrentPosPoolsOriginalData?.active_id > minPriceData?.binId) {
        setDisplayTokenALock(!isReverse)
        setDisplayTokenBLock(isReverse)
      }
      if (dlmmCurrentPosPoolsOriginalData?.active_id < maxPriceData?.binId && dlmmCurrentPosPoolsOriginalData?.active_id < minPriceData?.binId) {
        setDisplayTokenALock(isReverse)
        setDisplayTokenBLock(!isReverse)
      }
      if (dlmmCurrentPosPoolsOriginalData?.active_id <= maxPriceData?.binId && dlmmCurrentPosPoolsOriginalData?.active_id >= minPriceData?.binId) {
        setDisplayTokenALock(false)
        setDisplayTokenBLock(false)
      }
    }
  }, [dlmmCurrentPosPoolsOriginalData?.active_id, minPriceData?.binId, maxPriceData?.binId, isActive, isReverse])

  useEffect(() => {
    if (displayTokenALock) {
      setTokenAmountA('')
      setIsFixedDisplayTokenA(false)
    }
    if (displayTokenBLock) {
      setTokenAmountB('')
      setIsFixedDisplayTokenA(true)
    }
    if (!displayTokenALock && !displayTokenBLock) {
      if (tokenAmountA && !tokenAmountB) {
        setIsFixedDisplayTokenA(true)
      }
      if (tokenAmountB && !tokenAmountA) {
        setIsFixedDisplayTokenA(false)
      }
    }
  }, [displayTokenALock, displayTokenBLock])

  useEffect(() => {
    if (!isActive) {
      setDisabledAutoFill(true)
    } else {
      setDisabledAutoFill(false)
    }
  }, [isActive])

  const onAutoFillChange = useCallback(() => {
    setIsAutoFill(!isAutoFill)
    if (tokenAmountA !== '' && tokenAmountB === '') {
      setIsFixedDisplayTokenA(true)
    }
    if (tokenAmountA === '' && tokenAmountB !== '') {
      setIsFixedDisplayTokenA(false)
    }
  }, [isAutoFill, tokenAmountA, tokenAmountB])

  const numBins = useMemo(() => {
    if (minPriceData?.binId !== undefined && maxPriceData?.binId !== undefined) {
      return getNumBins(minPriceData!.binId, maxPriceData!.binId)
    } else {
      return '--'
    }
  }, [minPriceData?.binId, maxPriceData?.binId])

  const isOneSide = useMemo(() => {
    return showDisplayTokenALock || showDisplayTokenBLock || displayTokenALock || displayTokenBLock
  }, [displayTokenALock, displayTokenBLock, showDisplayTokenALock, showDisplayTokenBLock])

  const supportZap = useMemo(() => {
    return zapProps.supportZap && !isOneSide
  }, [zapProps.supportZap, isOneSide])

  const btnStatusText = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Add More Liquidity',
      disabled: true
    }
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }
    if (isAutoFill && supportZap && currAddTabMode === BothAndZapTabAction.zapIn) {
      const { zapAmount, availableAmount, zapCoin } = zapProps

      if (!zapProps.preDepositResult) {
        btnInfo.text = 'Enter an amount'
        btnInfo.disabled = true
        return btnInfo
      }

      if (!+zapAmount) {
        btnInfo.text = 'Enter an amount'
        btnInfo.disabled = true
        return btnInfo
      }

      if (zapAmount && +zapAmount && d(zapAmount).gt(availableAmount || 0)) {
        btnInfo.disabled = true
        btnInfo.text = `Insufficient ${textEllipses(zapCoin?.symbol, 10)} Balance`
        return btnInfo
      }
      if (preCalcError === 'amountTooSmall' || zapProps.zapTipsError) {
        btnInfo.disabled = true
        return btnInfo
      }

      btnInfo.disabled = false
      return btnInfo
    }

    if (preCalcError === 'amountTooSmall' || zapProps.zapTipsError) {
      btnInfo.disabled = true
      return btnInfo
    }

    // 判断输入
    if (!+tokenAmountA && !+tokenAmountB) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    //判断余额
    if (!showDisplayTokenALock && tokenAmountA && d(tokenAmountA).gt(tokenABalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(displayTokenA?.symbol, 10)} Balance`
      return btnInfo
    }
    //判断余额
    if (!showDisplayTokenBLock && tokenAmountB && d(tokenAmountB).gt(tokenBBalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(displayTokenB?.symbol, 10)} Balance`
      return btnInfo
    }
    if (!showTokenALock && !showTokenBLock && !+tokenAmountA && !+tokenAmountB && isAutoFill && !displayTokenALock && !displayTokenBLock) {
      btnInfo.disabled = true
      return btnInfo
    }
    if (displayTokenALock && !+tokenAmountB) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    if (displayTokenBLock && !+tokenAmountA) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    if (!binInfos?.bins?.length || !isBtnClickRef.current) {
      btnInfo.disabled = true
      return btnInfo
    }

    btnInfo.disabled = false
    return btnInfo
  }, [
    tokenAmountA,
    tokenAmountB,
    tokenABalanceInfo,
    tokenBBalanceInfo,
    currentAccount?.address,
    isAutoFill,
    displayTokenALock,
    displayTokenBLock,
    displayTokenA,
    displayTokenB,
    numBins,
    zapProps.availableAmount,
    zapProps.zapAmount,
    zapProps.zapTipsError,
    preCalcError,
    zapProps.preDepositResult,
    binInfos?.bins,
    supportZap
  ])

  const { isRegularTokenPair } = useSlippageTolerance(tokenA, tokenB, liquiditySlippage, currAddTabMode === BothAndZapTabAction.zapIn && supportZap)

  const showRiskConfirm = useMemo(() => {
    if (zapProps == undefined) return false
    const { zapCoin, coinA, coinB, preDepositResult } = zapProps
    const isZapCoinA = zapCoin?.coin_type === coinA?.coin_type

    if (!preDepositResult?.swap_result || !coinA || !coinB) return false
    const { swap_in_amount } = preDepositResult.swap_result
    const fromCoin = isZapCoinA ? coinA : coinB
    const amount = fromDecimalsAmount(swap_in_amount || '0', fromCoin?.decimals).toString()
    const amountValue = getTokenAmountValue(fromCoin?.coin_type, amount)

    console.log(amount, amountValue, '----amountValue---test')
    return (
      isRegularTokenPair &&
      supportZap &&
      currAddTabMode === BothAndZapTabAction.zapIn &&
      d(amountValue || 0).gte(import.meta.env.VITE_LIMIT_RISK_AMOUNT) &&
      d(liquiditySlippage).gt(0.02)
    )
  }, [isRegularTokenPair, zapProps, liquiditySlippage, currAddTabMode, getTokenAmountValue])

  const [knowsRisk, setKnowsRisk] = useState<boolean>(false)

  const handleKnowsRisk = (value: boolean) => {
    setKnowsRisk(value)
  }

  return {
    displayTokenA,
    displayTokenB,
    tokenABalanceInfo,
    tokenBBalanceInfo,
    tokenAmountValueA,
    tokenAmountValueB,
    tokenAmountA,
    tokenAmountB,
    handleAmountChange,
    strategy,
    setStrategy,
    dlmmPreAddLoading,
    isFixedDisplayTokenA,
    totalAmount,
    btnStatusText,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    displayTokenALock,
    displayTokenBLock,
    isAutoFill,
    isSelectRange,
    setIsSelectRange,
    handleAdd,
    isAddLoading,
    setIsAddLoading,
    posMinPrice,
    posMaxPrice,
    posMinPriceBinId,
    posMaxPriceBinId,
    minPriceData,
    maxPriceData,
    handlePriceAction,
    handleSlider,
    baseToken,
    quoteToken,
    dlmmPosDetailDirect,
    reCalculateResult,
    setIsAutoFill,
    setIsInitPrice,
    disabledAutoFill,
    onAutoFillChange,
    numBins,
    isReverse,
    binStep: currentPosPoolsRelatedData?.binStep,
    tokenA,
    tokenB,
    zapProps,
    totalTokenBalanceA: currentPosLiquidityData?.coinAmountA,
    showRiskConfirm,
    knowsRisk,
    handleKnowsRisk,
    isOneSide,
    supportZap
  }
}
