import useGlobalStore from '@/store/common/global'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { MsafeTransactionSubType } from '@/types'
import { DlmmPosBaseInfo, DlmmPosClosePositionParams, DlmmPosRemoveLiquidityParams } from '@/types/dlmm'
import { formatDescription } from '@/utils'
import { useAccountBalance } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { Decimal, bnToAmount, formatNumber, getBalanceChanges, isAvailableObject, textEllipses } from '@cetus/utils'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinAmount, BinLiquidityInfo, parseLiquidityShares } from '@cetusprotocol/dlmm-sdk'
import { WithdrawMode } from '@cetusprotocol/dlmm-zap-sdk'
import { useDebounceEffect, useDeepCompareEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import useSlippageTolerance from '../common/useSlippageTolerance'
import useTransaction from '../common/useTransaction'
import { PriceDataType } from '../create-pool/useCreateDLMMPool'
import useCreatePriceBin from '../dlmm/useCreatePriceBin'
import { useMinMaxPriceData } from '../dlmm/useDlmmHelper'
import useGetDlmmRelatedPools from '../dlmm/useGetDlmmRelatedPools'
import useDlmmPosHelper from './useDlmmPosHelper'
import useDlmmPosRemove from './useDlmmPosRemove'
import { useDlmmZapOut } from './useDlmmZapOut'
import useGetDlmmCurrentPos from './useGetDlmmCurrentPos'

export default function useDlmmPosRemovePage() {
  const { dlmmCurrentPosBaseInfo, dlmmPosLiquidityData, dlmmPosPoolsOriginalData, dlmmPosPoolsRelatedData } = useDlmmPositionStore()
  const { minPriceData, maxPriceData, setMinPriceData, setMaxPriceData, setTokenAmountAfterA, setTokenAmountAfterB } = useDlmmPosDetailStore()
  const { handleActionBinPrice, getNumBins } = useCreatePriceBin()
  const { binInfos, setBinInfos, dlmmPosDetailDirect, isAutoClaim, setIsAutoClaim, setPreCalcError, useZapOut } = useDlmmPosDetailStore()
  const { getDlmmCurrentPosBaseInfo } = useGetDlmmCurrentPos()
  const { getTokenAmountValue } = useTokenPrice()
  const { getTokenALock, getTokenBLock } = useDlmmPosHelper()
  const { transactionConfirmation } = useTransactionModal()
  const { dlmmApiPoolInfo } = useDlmmLiquidityStore()

  const { dlmmPreRemove, getDlmmPosRemoveLiquidityPayload, getDlmmPosClosePositionPayload } = useDlmmPosRemove()
  const [removeSide, setRemoveSide] = useState<WithdrawMode>('Both')
  const [isFixedDisplayTokenA, setIsFixedDisplayTokenA] = useState(false)
  const [dlmmPreRemoveLoading, setDlmmPreRemoveLoading] = useState(false)

  const [displayTokenALock, setDisplayTokenALock] = useState(false)
  const [displayTokenBLock, setDisplayTokenBLock] = useState(false)

  const { slippage, liquiditySlippage } = useGlobalStore()
  const [slideValue, setSlideValue] = useState('0')
  const navigate = useNavigate()
  const isUseSliderRef = useRef(false)

  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useRef<string>('')
  const { currentAccount } = useAccountStore()

  const currentPosLiquidityData = useMemo(() => {
    return dlmmPosLiquidityData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosLiquidityData])

  const dlmmCurrentPosPoolsOriginalData = useMemo(() => {
    return dlmmPosPoolsOriginalData[dlmmCurrentPosBaseInfo?.dlmmPool]
  }, [dlmmCurrentPosBaseInfo?.id, dlmmPosPoolsOriginalData])

  const currentPosPoolsRelatedData = useMemo(() => {
    return dlmmPosPoolsRelatedData[dlmmCurrentPosBaseInfo?.id]
  }, [dlmmPosPoolsRelatedData])

  const [tokenBalanceA, setTokenBalanceA] = useState('')
  const [tokenBalanceB, setTokenBalanceB] = useState('')
  const [totalTokenBalanceA, setTotalTokenBalanceA] = useState('')
  const [totalTokenBalanceB, setTotalTokenBalanceB] = useState('')
  const isReverse = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.isReverse
  }, [dlmmCurrentPosBaseInfo])

  const [posMinPrice, setPosMinPrice] = useState<string | undefined>()
  const [posMaxPrice, setPosMaxPrice] = useState<string | undefined>()
  const [posMinPriceBinId, setPosMinPriceBinId] = useState<number | undefined>()
  const [posMaxPriceBinId, setPosMaxPriceBinId] = useState<number | undefined>()
  const [amountInfo, setAmountInfo] = useState<BinLiquidityInfo>()

  /**
   * 切换removeSide时，更新minPriceData和maxPriceData 和 minBinIdLimit、maxBinIdLimit
   */
  useDeepCompareEffect(() => {
    if (currentPosPoolsRelatedData && dlmmCurrentPosPoolsOriginalData && tokenA && tokenB && binStep && dlmmCurrentPosBaseInfo) {
      const activeBin = dlmmCurrentPosPoolsOriginalData.active_bin
      const minBinId = dlmmCurrentPosBaseInfo.lowerBinId
      const maxBinId = dlmmCurrentPosBaseInfo.upperBinId
      if (removeSide === 'Both') {
        setPosMinPrice(dlmmPosDetailDirect ? currentPosPoolsRelatedData.minPrice : currentPosPoolsRelatedData.minPriceResever)
        setPosMaxPrice(dlmmPosDetailDirect ? currentPosPoolsRelatedData.maxPrice : currentPosPoolsRelatedData.maxPriceResever)
        setPosMinPriceBinId(currentPosPoolsRelatedData.minPriceBinId)
        setPosMaxPriceBinId(currentPosPoolsRelatedData.maxPriceBinId)
        initMinMaxPriceAndAmount()
      } else if (removeSide === 'OnlyCoinA') {
        let tempMinBinId = activeBin.bin_id + 1
        // [active_id+1,max]
        if (tempMinBinId <= maxBinId) {
          const maxPriceData = buildPriceData(maxBinId, false)!
          const minPriceData = buildPriceData(tempMinBinId, true)!

          if (isReverse !== dlmmPosDetailDirect) {
            setPosMinPrice(minPriceData.displayPrice.toString())
            setPosMaxPrice(maxPriceData.displayPrice.toString())
          } else {
            setPosMinPrice(maxPriceData.displayReversePrice.toString())
            setPosMaxPrice(minPriceData.displayReversePrice.toString())
          }

          setPosMaxPriceBinId(maxBinId)
          setPosMinPriceBinId(tempMinBinId)
          setMaxPriceData(maxPriceData)
          setMinPriceData(minPriceData)
        } else {
          // 全是b的情况 就暂时不做限制
          setPosMinPrice(dlmmPosDetailDirect ? currentPosPoolsRelatedData.minPrice : currentPosPoolsRelatedData.minPriceResever)
          setPosMaxPrice(dlmmPosDetailDirect ? currentPosPoolsRelatedData.maxPrice : currentPosPoolsRelatedData.maxPriceResever)
          setPosMaxPriceBinId(currentPosPoolsRelatedData.maxPriceBinId)
          setPosMinPriceBinId(currentPosPoolsRelatedData.minPriceBinId)
          initMinMaxPriceAndAmount()
        }
      } else if (removeSide === 'OnlyCoinB') {
        const isReverse = dlmmCurrentPosBaseInfo.isReverse
        let tempMaxBinId = activeBin.bin_id - 1
        // [min,active_id-1]
        if (tempMaxBinId >= minBinId) {
          const maxPriceData = buildPriceData(tempMaxBinId, false)!
          const minPriceData = buildPriceData(minBinId, true)!

          if (isReverse !== dlmmPosDetailDirect) {
            setPosMinPrice(minPriceData.displayPrice.toString())
            setPosMaxPrice(maxPriceData.displayPrice.toString())
          } else {
            setPosMinPrice(maxPriceData.displayReversePrice.toString())
            setPosMaxPrice(minPriceData.displayReversePrice.toString())
          }

          setPosMaxPriceBinId(tempMaxBinId)
          setPosMinPriceBinId(minBinId)
          setMaxPriceData(maxPriceData)
          setMinPriceData(minPriceData)
        } else {
          // 全是a的情况
          setPosMinPrice(dlmmPosDetailDirect ? currentPosPoolsRelatedData.minPrice : currentPosPoolsRelatedData.minPriceResever)
          setPosMaxPrice(dlmmPosDetailDirect ? currentPosPoolsRelatedData.maxPrice : currentPosPoolsRelatedData.maxPriceResever)
          setPosMinPriceBinId(dlmmCurrentPosBaseInfo.lowerBinId)
          setPosMaxPriceBinId(dlmmCurrentPosBaseInfo.upperBinId)
          initMinMaxPriceAndAmount()
        }
      }
    }
  }, [
    removeSide,
    dlmmCurrentPosBaseInfo?.lowerBinId,
    dlmmCurrentPosBaseInfo?.upperBinId,
    dlmmPosDetailDirect,
    currentPosPoolsRelatedData?.minPrice,
    currentPosPoolsRelatedData?.maxPrice
  ])

  const initMinMaxPriceAndAmount = () => {
    if (!tokenA || !tokenB) return

    handleSlider([dlmmCurrentPosBaseInfo.lowerBinId, dlmmCurrentPosBaseInfo.upperBinId])

    setTokenBalanceA(currentPosLiquidityData?.displayCoinAmountA)
    setTokenBalanceB(currentPosLiquidityData?.displayCoinAmountB)
    setTotalTokenBalanceA(currentPosLiquidityData?.displayCoinAmountA)
    setTotalTokenBalanceB(currentPosLiquidityData?.displayCoinAmountB)
  }

  const [tokenAmountA, setTokenAmountA] = useState('')
  const [tokenAmountB, setTokenAmountB] = useState('')

  // tokenA、B
  const displayTokenA = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.displayTokenA
  }, [dlmmCurrentPosBaseInfo?.displayTokenA])
  const displayTokenB = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.displayTokenB
  }, [dlmmCurrentPosBaseInfo?.displayTokenB])

  const tokenA = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.tokenA
  }, [dlmmCurrentPosBaseInfo?.tokenA])

  const tokenB = useMemo(() => {
    return dlmmCurrentPosBaseInfo?.tokenB
  }, [dlmmCurrentPosBaseInfo?.tokenB])

  const binStep = useMemo(() => {
    return dlmmCurrentPosPoolsOriginalData?.binStep
  }, [dlmmCurrentPosPoolsOriginalData])

  const [isInitPrice, setIsInitPrice] = useState(false)
  useDeepCompareEffect(() => {
    if (currentPosLiquidityData && tokenA && tokenB && binStep && !isInitPrice) {
      initMinMaxPriceAndAmount()
      setIsInitPrice(true)
      setTokenBalanceA(currentPosLiquidityData?.displayCoinAmountA)
      setTokenBalanceB(currentPosLiquidityData?.displayCoinAmountB)
    }
    setTotalTokenBalanceA(currentPosLiquidityData?.displayCoinAmountA)
    setTotalTokenBalanceB(currentPosLiquidityData?.displayCoinAmountB)
  }, [isReverse, currentPosLiquidityData, tokenA, tokenB, binStep])

  const { buildPriceData } = useMinMaxPriceData(tokenA, tokenB, binStep)

  const [isDirect, setIsDirect] = useState(true)

  const baseToken = useMemo(() => {
    return isDirect ? displayTokenA : displayTokenB
  }, [displayTokenA, displayTokenB, isDirect])

  const quoteToken = useMemo(() => {
    return isDirect ? displayTokenB : displayTokenA
  }, [displayTokenA, displayTokenB, isDirect])

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

  // 余额
  // const tokenBalanceA = useMemo(() => {
  //   return currentPosLiquidityData?.displayCoinAmountA
  // }, [currentPosLiquidityData])

  // const tokenBalanceB = useMemo(() => {
  //   return currentPosLiquidityData?.displayCoinAmountB
  // }, [currentPosLiquidityData])

  // 价值
  const tokenAmountValueA = getTokenAmountValue(displayTokenA?.coin_type, tokenAmountA)
  const tokenAmountValueB = getTokenAmountValue(displayTokenB?.coin_type, tokenAmountB)

  const showTokenALock = useMemo(() => {
    return getTokenALock(dlmmCurrentPosBaseInfo, dlmmCurrentPosPoolsOriginalData)
  }, [dlmmCurrentPosPoolsOriginalData?.active_id, dlmmCurrentPosBaseInfo])

  const showTokenBLock = useMemo(() => {
    return getTokenBLock(dlmmCurrentPosBaseInfo, dlmmCurrentPosPoolsOriginalData)
  }, [dlmmCurrentPosPoolsOriginalData?.active_id, dlmmCurrentPosBaseInfo])

  const showDisplayTokenALock = (!dlmmCurrentPosBaseInfo?.isReverse ? showTokenALock : showTokenBLock) || displayTokenALock
  const showDisplayTokenBLock = (!dlmmCurrentPosBaseInfo?.isReverse ? showTokenBLock : showTokenALock) || displayTokenBLock

  const resetInputAmount = () => {
    setTokenAmountA('')
    setTokenAmountB('')
    setSlideValue('0')
    setBinInfos({} as BinLiquidityInfo)
    setPreCalcError(undefined)
  }

  useEffect(() => {
    if ((!tokenAmountA || !+tokenAmountA) && (!tokenAmountB || !+tokenAmountB)) {
      setBinInfos({} as BinLiquidityInfo)
      setPreCalcError(undefined)
    }
  }, [tokenAmountA, tokenAmountB])

  const refreshForSubmitAfter = async (toastInfo: any, txLength: number, res?: any) => {
    if (res) {
      // 重新拿数据
      fetchAccountBalance()
      resetInputAmount()
      await getList({ poolId: dlmmCurrentPosBaseInfo?.dlmmPool })
      if (isAllRemove) {
        navigate('/pools?tab=positions')
      } else {
        if (currentAccount) {
          const dlmmPosBaseInfo = await getDlmmCurrentPosBaseInfo(currentAccount?.address, dlmmCurrentPosBaseInfo?.id, true)
          getRemoveTokenBalance(true, dlmmPosBaseInfo || undefined)
        }
      }
    } else {
      if (currentAccount) {
        getDlmmCurrentPosBaseInfo(currentAccount?.address, dlmmCurrentPosBaseInfo?.id as string, true).then(_ => {
          reCalculateResult()
        })
      }
    }
  }

  const isAllRemove = useMemo(() => {
    if (
      d(slideValue).eq(100) &&
      minPriceData?.binId === dlmmCurrentPosBaseInfo?.lowerBinId &&
      maxPriceData?.binId === dlmmCurrentPosBaseInfo?.upperBinId
    ) {
      return true
    }

    if (d(slideValue).eq(100) && binInfos?.bins && dlmmCurrentPosBaseInfo?.totalShareLiquidity) {
      const removeLiquidityAmount = binInfos.bins.reduce(
        (acc: string, curr: BinAmount) =>
          d(acc)
            .add(curr.liquidity || '0')
            .toString(),
        '0'
      )
      return d(removeLiquidityAmount).gte(dlmmCurrentPosBaseInfo?.totalShareLiquidity)
    }
    return false
  }, [
    slideValue,
    minPriceData?.binId,
    maxPriceData?.binId,
    dlmmCurrentPosBaseInfo?.lowerBinId,
    dlmmCurrentPosBaseInfo?.upperBinId,
    binInfos?.bins,
    dlmmCurrentPosBaseInfo?.totalShareLiquidity
  ])

  const zapProps = useDlmmZapOut(
    removeSide,
    dlmmCurrentPosBaseInfo?.id,
    isAutoClaim,
    isAllRemove,
    isAutoClaim || isAllRemove ? dlmmCurrentPosPoolsOriginalData?.reward_manager?.rewards.map(ele => ele.reward_coin) : [],
    amountInfo?.bins || [],
    minPriceData?.binId,
    maxPriceData?.binId,
    tokenA,
    tokenB,
    dlmmCurrentPosPoolsOriginalData || null,
    dlmmCurrentPosBaseInfo?.isReverse,
    dlmmCurrentPosPoolsOriginalData?.active_bin,
    dlmmCurrentPosBaseInfo?.isReverse ? currentPosPoolsRelatedData?.currentPriceReverse : currentPosPoolsRelatedData?.currentPrice,
    refreshForSubmitAfter,
    setSlideValue
  )

  useEffect(() => {
    zapProps.handleChangeZapAmount('')
    resetInputAmount()
  }, [useZapOut])

  useEffect(() => {
    if (zapProps?.preWithdrawResult) {
      setBinInfos(zapProps?.preWithdrawResult?.remove_liquidity_info as BinLiquidityInfo)
    } else {
      setBinInfos({} as BinLiquidityInfo)
    }
  }, [zapProps?.preWithdrawResult])

  const handleAmountChange = (amount: string, isFixedDisplayTokenA: boolean) => {
    isUseSliderRef.current = false
    if (!amount) {
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
      if (isFixedDisplayTokenA) {
        setTokenAmountB('')
      } else {
        setTokenAmountA('')
      }
      setSlideValue('0')
    }
  }

  const debouncedDlmmPreRemove = async (
    amount: string,
    isFixedDisplayTokenA: boolean,
    isDisplayTokenALock: boolean = false,
    isDisplayTokenBLock: boolean = false
  ) => {
    if (!dlmmPreRemoveLoading) {
      setDlmmPreRemoveLoading(true)
    }
    const { liquidityShares } = dlmmCurrentPosBaseInfo
    const lowerBinId = minPriceData?.binId
    const upperBinId = maxPriceData?.binId
    const bins = amountInfo?.bins.filter(
      bin =>
        bin.bin_id >= lowerBinId &&
        bin.bin_id <= upperBinId &&
        (removeSide !== 'Both' ? bin.bin_id !== dlmmCurrentPosPoolsOriginalData.active_bin.bin_id : true)
    )
    const { bin_step, bin_manager, active_id } = dlmmCurrentPosPoolsOriginalData
    // const active_bin = await dlmmSdk?.Pool.getBinInfo(bin_manager.bin_manager_handle, active_id, bin_step)
    // console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:233 ~ debouncedDlmmPreRemove ~ active_bin:', active_bin)
    // const binsInfo = parseLiquidityShares(liquidityShares, bin_step, lowerBinId, active_bin)
    // console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:235 ~ debouncedDlmmPreRemove ~ binsInfo:', binsInfo)

    if (isFixedDisplayTokenA) {
      if (d(amount).gt(tokenBalanceA)) {
        setTokenAmountA(tokenBalanceA)
        return
      }
    } else {
      if (d(amount).gt(tokenBalanceB)) {
        setTokenAmountB(tokenBalanceB)
        return
      }
    }

    const params = {
      bins,
      activeId: active_id,
      fixAmountA: isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA,
      coinAmount: d(amount)
        .mul(10 ** (isFixedDisplayTokenA ? displayTokenA?.decimals : displayTokenB?.decimals))
        .toString(),
      isOnlyA: removeSide === 'Both' ? undefined : removeSide == 'OnlyCoinA',
      tokenA,
      tokenB,
      isReverse
    }
    console.log('🚀🚀🚀 ~ useDlmmPosremovePage.ts:91 ~ preRemove ~ params:', params)
    const { displayCoinAmountA, displayCoinAmountB, binInfos } = await dlmmPreRemove(params)
    console.log(
      '🚀🚀🚀 ~ useDlmmPosRemovePage.ts:253 ~ debouncedDlmmPreRemove ~ binInfos:',
      binInfos,
      displayCoinAmountA,
      displayCoinAmountB,
      tokenBalanceA,
      tokenBalanceB
    )
    console.log('binInfos-binInfos', binInfos, tokenBalanceA, tokenBalanceB)

    try {
      setBinInfos(binInfos as BinLiquidityInfo)
      setPreCalcError(undefined)
      let slide
      let isSelectMax = false
      if (removeSide === 'Both') {
        if (isFixedDisplayTokenA) {
          if (amount && d(amount).gte(tokenBalanceA)) {
            slide = '100'
            isSelectMax = true
          } else {
            slide = formatNumber(d(displayCoinAmountA).div(tokenBalanceA).mul(100).toNumber(), 2, true, Decimal.ROUND_DOWN)
          }
        } else {
          if (amount && d(amount).gte(tokenBalanceB)) {
            slide = '100'
            isSelectMax = true
          } else {
            slide = formatNumber(d(displayCoinAmountB).div(tokenBalanceB).mul(100).toNumber(), 2, true, Decimal.ROUND_DOWN)
          }
        }
      }
      if (isReverse ? removeSide === 'OnlyCoinB' : removeSide === 'OnlyCoinA') {
        if (amount && d(amount).gte(tokenBalanceA)) {
          slide = '100'
          isSelectMax = true
        } else {
          slide = formatNumber(d(displayCoinAmountA).div(tokenBalanceA).mul(100).toNumber(), 2, true, Decimal.ROUND_DOWN)
        }
      }
      if (isReverse ? removeSide === 'OnlyCoinA' : removeSide === 'OnlyCoinB') {
        if (amount && d(amount).gte(tokenBalanceB)) {
          slide = '100'
          isSelectMax = true
        } else {
          slide = formatNumber(d(displayCoinAmountB).div(tokenBalanceB).mul(100).toNumber(), 2, true, Decimal.ROUND_DOWN)
        }
      }

      console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:267 ~ debouncedDlmmPreRemove ~ slide:', slide)
      if (isSelectMax) {
        setSlideValue('100')
        if (removeSide === 'Both') {
          if (!showDisplayTokenALock) setTokenAmountA(tokenBalanceA as string)
          setTokenAmountB(tokenBalanceB as string)
        }
        if (isReverse ? removeSide === 'OnlyCoinB' : removeSide === 'OnlyCoinA') {
          setTokenAmountA(tokenBalanceA as string)
          setTokenAmountB('')
        }
        if (isReverse ? removeSide === 'OnlyCoinA' : removeSide === 'OnlyCoinB') {
          setTokenAmountB(tokenBalanceB as string)
          setTokenAmountA('')
        }
      } else {
        if (!isUseSliderRef.current) {
          setSlideValue(String(slide))
        }
        if (removeSide === 'Both') {
          if (isFixedDisplayTokenA) {
            if (!isDisplayTokenBLock) {
              setTokenAmountB(displayCoinAmountB || '')
            }
          } else {
            if (!isDisplayTokenALock) {
              setTokenAmountA(displayCoinAmountA || '')
            }
          }
        }
      }
      console.log('🚀🚀🚀 ~ useDlmmPosremovePage.ts:141 ~ debouncedDlmmPreRemove ~ displayCoinAmountA:', displayCoinAmountA)
      console.log('🚀🚀🚀 ~ useDlmmPosremovePage.ts:142 ~ debouncedDlmmPreRemove ~ displayCoinAmountB:', displayCoinAmountB)
    } catch (error) {
      console.log('🚀🚀🚀 ~ useDlmmPosremovePage.ts:566 ~ debouncedDlmmPreRemove ~ error:', error)
      if (String(error).includes('is less than 1')) {
        setPreCalcError('amountTooSmall')
        setBinInfos({} as BinLiquidityInfo)
      } else {
        setPreCalcError(undefined)
      }
    }
  }

  const [isRemoveLoading, setIsRemoveLoading] = useState(false)
  const { batchSignAndExecuteTransaction } = useTransaction()
  const { dlmmMevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  const changeSlideFun = async (num: string) => {
    console.log('🚀🚀🚀 ~ useDlmmPosremovePage.ts:173 ~ changeSlideFun ~ num:', num)
    setSlideValue(num)

    const handleChangeAmount = (amountA: string, amountB: string) => {
      if (removeSide === 'Both') {
        if (!showDisplayTokenALock) {
          setTokenAmountA(amountA)
        } else {
          setTokenAmountA('')
        }
        if (!showDisplayTokenBLock) {
          setTokenAmountB(amountB)
        } else {
          setTokenAmountB('')
        }
      }
      if (removeSide === 'OnlyCoinA') {
        if (isReverse) {
          if (!showDisplayTokenBLock) {
            setTokenAmountB(amountB)
          } else {
            setTokenAmountB('')
          }
          setTokenAmountA('')
        } else {
          if (!showDisplayTokenALock) {
            setTokenAmountA(amountA)
          } else {
            setTokenAmountA('')
          }
          setTokenAmountB('')
        }
      }
      if (removeSide === 'OnlyCoinB') {
        if (isReverse) {
          if (!showDisplayTokenALock) {
            setTokenAmountA(amountA)
          } else {
            setTokenAmountA('')
          }
          setTokenAmountB('')
        } else {
          if (!showDisplayTokenBLock) {
            setTokenAmountB(amountB)
          } else {
            setTokenAmountB('')
          }
          setTokenAmountA('')
        }
      }
    }

    if (Number(num) == 100) {
      handleChangeAmount(tokenBalanceA, tokenBalanceB)
    } else if (Number(num) == 0) {
      resetInputAmount()
    } else {
      try {
        // const lowerBinId = BinUtils.getBinIdFromPrice(removeComma(minPriceData?.displayPrice), binStep, false, tokenA?.decimals, tokenB?.decimals)
        // const upperBinId = BinUtils.getBinIdFromPrice(removeComma(maxPriceData?.displayPrice), binStep, false, tokenA?.decimals, tokenB?.decimals)
        // console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:299 ~ changeSlideFun ~ lowerBinId:', lowerBinId)
        // console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:299 ~ changeSlideFun ~ upperBinId:', upperBinId)
        // console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:299 ~ changeSlideFun ~ amountInfo:', amountInfo)
        // console.log(tokenBalanceA, tokenBalanceB, isFixedDisplayTokenA, num, minPriceData, maxPriceData, 'tokenBalanceA test')
        // const bins = amountInfo?.bins.filter(
        //   bin =>
        //     bin.bin_id >= lowerBinId &&
        //     bin.bin_id <= upperBinId &&
        //     (removeSide !== 'both' ? bin.bin_id !== dlmmCurrentPosPoolsOriginalData.active_bin.bin_id : true)
        // )

        const _tokenAmountA = d(tokenBalanceA).mul(d(num).div(100)).toString()
        const _tokenAmountB = d(tokenBalanceB).mul(d(num).div(100)).toString()
        handleChangeAmount(_tokenAmountA, _tokenAmountB)

        // console.log('🚀🚀🚀 ~ useDlmmPosremovePage.ts:203 ~ changeSlideFun ~ calculateOption:', calculateOption)
      } catch (error) {
        console.log('🚀🚀🚀 ~ useDlmmPosremovePage.ts:188 ~ changeSlideFun ~ error:', error)
      }
    }
  }

  const calculateAmountBySlideValue = (slideValue: string) => {
    if (Number(slideValue) === 100) {
      return {
        amountA: tokenBalanceA,
        amountB: tokenBalanceB
      }
    }
    if (Number(slideValue) === 0) {
      return {
        amountA: '',
        amountB: ''
      }
    }
    const _tokenAmountA = d(tokenBalanceA).mul(d(slideValue).div(100)).toString()
    const _tokenAmountB = d(tokenBalanceB).mul(d(slideValue).div(100)).toString()
    return {
      amountA: _tokenAmountA,
      amountB: _tokenAmountB
    }
  }

  // 重新计算 (刷新按钮价格更新时 交易失败时)
  const reCalculateResult = (amountA: string = tokenAmountA, amountB: string = tokenAmountB, fixedTokenA: boolean = isFixedDisplayTokenA) => {
    const isAvailable = isAvailableObject(dlmmCurrentPosBaseInfo)
    if (supportZap && useZapOut) {
      return
    }
    console.log(tokenAmountB, tokenAmountA, isFixedDisplayTokenA, 'reCalculateResult')
    if ((tokenAmountA || tokenAmountB) && isAvailable) {
      console.log('🚀 ~ reCalculateResult ~ isFixedDisplayTokenA:', {
        slideValue,
        isFixedDisplayTokenA,
        tokenAmountA,
        tokenAmountB
      })
      if (slideValue === '--') return
      let amount
      let fixedDisplayTokenA = isFixedDisplayTokenA
      switch (removeSide) {
        case 'Both':
          if (fixedDisplayTokenA) {
            amount = tokenAmountA
            if (!+amount) {
              fixedDisplayTokenA = !fixedDisplayTokenA
              amount = tokenAmountB
            }
          } else {
            amount = tokenAmountB
            if (!+amount) {
              fixedDisplayTokenA = !fixedDisplayTokenA
              amount = tokenAmountA
            }
          }
          break
        case 'OnlyCoinA':
          amount = isReverse ? tokenAmountB : tokenAmountA
          break
        case 'OnlyCoinB':
          amount = isReverse ? tokenAmountA : tokenAmountB
          break
      }

      if (amount && +amount) {
        debouncedDlmmPreRemove(amount, fixedDisplayTokenA, displayTokenALock, displayTokenBLock)
      }
    } else {
      setTokenAmountA('')
      setTokenAmountB('')
    }
  }

  const { getList } = useGetDlmmRelatedPools()

  useEffect(() => {
    if (isAllRemove) {
      setIsAutoClaim(true)
    }
  }, [isAllRemove])

  const toRemove = async () => {
    let TrackDataParams: any = {}

    try {
      setIsRemoveLoading(true)

      const parameter: DlmmPosRemoveLiquidityParams | DlmmPosClosePositionParams = {
        dlmmPool: dlmmCurrentPosBaseInfo.dlmmPool,
        coinTypeA: dlmmCurrentPosBaseInfo.coinTypeA,
        coinTypeB: dlmmCurrentPosBaseInfo.coinTypeB,
        positionId: dlmmCurrentPosBaseInfo?.id,
        rewardCoins: dlmmCurrentPosPoolsOriginalData.reward_manager.rewards.map(ele => ele.reward_coin),
        binInfos,
        slippage: slippage as number,
        activeId: dlmmCurrentPosPoolsOriginalData?.active_id,
        binStep: dlmmCurrentPosPoolsOriginalData?.binStep,
        slideValue: Number(slideValue) / 100
      }

      console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:244 ~ toAdd ~ params:', {
        dlmmCurrentPosPoolsOriginalData,
        dlmmCurrentPosBaseInfo,
        parameter,
        isAllRemove,
        slideValue,
        removeSide,
        binInfos
      })

      const { binInfos: cBinsInfo, rewardCoins, ...trackData } = parameter
      TrackDataParams = {
        ...trackData
      }
      if (rewardCoins?.length > 0) {
        TrackDataParams['rewardCoins'] = JSON.stringify(rewardCoins)
      }

      const txs = isAllRemove ? [getDlmmPosClosePositionPayload(parameter)] : getDlmmPosRemoveLiquidityPayload(parameter, isAutoClaim)

      const msafeParams = {
        action: MsafeTransactionSubType.DlmmRemoveLiquidity,
        txbParams: parameter
      }
      // tx?.setGasBudget(Number(toDecimalsAmount(5, 9)))
      const toastInfo = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>, _: any, otherParams?: any) => {
          const description =
            'Remove ' +
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
            if (txs.length > 1) {
              info.toastDescriptionContent = `Completed transactions ${txs.length} /${txs.length} `
            } else {
              info.toastDescriptionContent = ''
            }
            info.modalDescriptionText = ''
            info.toastTitleText = 'Remove Liquidity Successful'
          }

          return info
        }
      }

      if (txs.length === 1) {
        transactionConfirmation(toastInfo)
      }
      console.log('🚀🚀🚀 ~ useDlmmPosAddPage.ts:299 ~ toAdd ~ tx:', toastInfo, txs)
      const res = await batchSignAndExecuteTransaction(txs, toastInfo, {
        useMev: dlmmMevProtect,
        // useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams,
        trackData: {
          params: TrackDataParams,
          actionType: 'dlmm',
          action: isAllRemove ? 'dlmmRemoveAllLiquidity' : 'dlmmDecreaseLiquidity'
        }
      })

      if (res && res.successResults.length > 0) {
        // 重新拿数据
        fetchAccountBalance()
        resetInputAmount()
        await getList({ poolId: dlmmCurrentPosBaseInfo?.dlmmPool })
        getDlmmCurrentPosBaseInfo(currentAccount?.address, dlmmCurrentPosBaseInfo?.id as string, true)
        if (isAllRemove) {
          navigate('/pools?tab=positions')
        } else {
          const dlmmPosBaseInfo: DlmmPosBaseInfo = await getDlmmCurrentPosBaseInfo(currentAccount?.address, dlmmCurrentPosBaseInfo?.id, true)
          getRemoveTokenBalance(true, dlmmPosBaseInfo)
          // getCurrentPosHistory(currentPosBaseInfo?.id as string, currentPosBaseInfo?.posId as string)
        }
      } else {
        if (dlmmCurrentPosBaseInfo) {
          // 如果失败，大概率都是池子价格变化了，需要重新计算
          getDlmmCurrentPosBaseInfo(currentAccount?.address, dlmmCurrentPosBaseInfo?.id, true).then(res => {
            console.log('🚀 ~ toClaim ~ res:', res)
            reCalculateResult()
          })
        }
      }
      setIsRemoveLoading(false)
    } catch (error) {
      console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:448 ~ toRemove ~ error:', error)
    } finally {
      setIsRemoveLoading(false)
    }
  }

  const handleRemove = () => {
    toRemove()
  }

  // const amountInfo: BinLiquidityInfo = useMemo(() => {
  //   if (dlmmCurrentPosBaseInfo && dlmmCurrentPosPoolsOriginalData) {
  //     const { liquidityShares } = dlmmCurrentPosBaseInfo
  //     const { active_bin } = dlmmCurrentPosPoolsOriginalData
  //     return parseLiquidityShares(liquidityShares, binStep, dlmmCurrentPosBaseInfo.lowerBinId, active_bin)
  //   }
  //   return []
  // }, [dlmmCurrentPosBaseInfo.liquidityShares, dlmmCurrentPosPoolsOriginalData, binStep])

  useEffect(() => {
    const minBinId = minPriceData?.binId
    const maxBinId = maxPriceData?.binId
    let rangeAmountInfo
    if (amountInfo?.bins?.[0]?.bin_id === minBinId && amountInfo?.bins?.at(-1)?.bin_id === maxBinId) {
      rangeAmountInfo = amountInfo
    } else {
      const minIndex = amountInfo?.bins?.findIndex(item => item?.bin_id >= minBinId)
      const maxIndex = amountInfo?.bins?.findIndex(item => item?.bin_id >= maxBinId)

      const rangeBins = amountInfo?.bins?.slice(minIndex, maxIndex! + 1)
      rangeAmountInfo = {
        amount_a: rangeBins?.reduce((sum, current) => d(sum).plus(current?.amount_a).toString(), '0'),
        amount_b: rangeBins?.reduce((sum, current) => d(sum).plus(current?.amount_b).toString(), '0'),
        bins: rangeBins
      }
    }
    if (removeSide === 'Both') {
      setTokenBalanceA(
        d(isReverse ? rangeAmountInfo?.amount_b || '0' : rangeAmountInfo?.amount_a || '0')
          .div(10 ** displayTokenA?.decimals)
          .toString()
      )
      setTokenBalanceB(
        d(isReverse ? rangeAmountInfo?.amount_a || '0' : rangeAmountInfo?.amount_b || '0')
          .div(10 ** displayTokenB?.decimals)
          .toString()
      )
    } else {
      const totalAmountA = rangeAmountInfo?.bins
        ?.filter(item => item?.amount_a !== '0' && item?.amount_b === '0')
        ?.reduce((sum, current) => d(sum).plus(current?.amount_a).toString(), '0')
      const totalAmountB = rangeAmountInfo?.bins
        ?.filter(item => item?.amount_a === '0' && item?.amount_b !== '0')
        ?.reduce((sum, current) => d(sum).plus(current?.amount_b).toString(), '0')
      setTokenBalanceA(
        d(isReverse ? totalAmountB || '0' : totalAmountA || '0')
          .div(10 ** displayTokenA?.decimals)
          .toString()
      )
      setTokenBalanceB(
        d(isReverse ? totalAmountA || '0' : totalAmountB || '0')
          .div(10 ** displayTokenB?.decimals)
          .toString()
      )
    }
  }, [amountInfo, removeSide, displayTokenA, displayTokenB, minPriceData, maxPriceData, isReverse])

  // 价格变动 重新计算余额
  useDebounceEffect(() => {
    if (dlmmCurrentPosPoolsOriginalData && dlmmCurrentPosBaseInfo) {
      getRemoveTokenBalance(true, dlmmCurrentPosBaseInfo, dlmmCurrentPosPoolsOriginalData)
    }
  }, [dlmmCurrentPosPoolsOriginalData, dlmmCurrentPosBaseInfo])

  const getRemoveTokenBalance = async (
    isInitBalance = false,
    posBaseInfo = dlmmCurrentPosBaseInfo,
    posPoolsOriginalData = dlmmCurrentPosPoolsOriginalData
  ) => {
    let posLiquidityInfo
    if (posBaseInfo && posPoolsOriginalData) {
      const { liquidityShares } = posBaseInfo
      const { active_bin } = posPoolsOriginalData
      posLiquidityInfo = parseLiquidityShares(liquidityShares, binStep, posBaseInfo.lowerBinId, active_bin)
      console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:476 ~ useDlmmPosRemovePage ~ posLiquidityInfo:', posLiquidityInfo)
      setAmountInfo(posLiquidityInfo)
    }
    if (!posLiquidityInfo) return
    const decimalsA = tokenA.decimals || 0
    const decimalsB = tokenB.decimals || 0

    const formatAmount = (amount: string, decimals: number) => bnToAmount(amount.toString(), decimals)

    const setBalances = (rawAmountA: string, rawAmountB: string) => {
      const amountA = formatAmount(rawAmountA, decimalsA)
      const amountB = formatAmount(rawAmountB, decimalsB)
      console.log('🚀🚀🚀 ~ useDlmmPosRemovePage.ts:855 ~ setBalances ~ amountA:', {
        isReverse,
        amountA,
        amountB
      })
      setTotalTokenBalanceA(isReverse ? amountB : amountA)
      setTotalTokenBalanceB(isReverse ? amountA : amountB)
    }

    if (isInitBalance) {
      setBalances(posLiquidityInfo.amount_a.toString(), posLiquidityInfo.amount_b.toString())
    }
  }

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

  useDebounceEffect(
    () => {
      if (isAvailableObject(minPriceData) && isAvailableObject(maxPriceData)) {
        reCalculateResult()
      }
    },
    [maxPriceData, minPriceData, displayTokenALock, displayTokenBLock, isFixedDisplayTokenA, tokenAmountA, tokenAmountB],
    { wait: 300 }
  )

  useDebounceEffect(() => {
    const { amountA, amountB } = calculateAmountBySlideValue(slideValue)
    setTokenAmountA(amountA)
    setTokenAmountB(amountB)
  }, [totalTokenBalanceA, totalTokenBalanceB])

  const changeSlideValue = (value: string | number) => {
    isUseSliderRef.current = true
    if (useZapOut) {
      if (value == 'MAX' || Number(value) == 100) {
        zapProps.handleChangeZapAmount('100', true)
      } else {
        const rate = String((value + '').split('%')[0])
        zapProps.handleChangeSlideValue?.(rate)
      }
    } else {
      if (value == 'MAX' || Number(value) == 100) {
        changeSlideFun('100')
      } else {
        changeSlideFun(String((value + '').split('%')[0]))
      }
    }
  }

  const supportZap = useMemo(() => {
    return zapProps.supportZap && !showDisplayTokenALock && !showDisplayTokenBLock
  }, [zapProps.supportZap, showDisplayTokenALock, showDisplayTokenBLock])

  const btnStatusText = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Remove',
      disabled: true
    }
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    if (supportZap && useZapOut) {
      if ((!binInfos?.amount_a && !binInfos?.amount_b) || !zapProps?.zapAmount) {
        btnInfo.text = 'Enter an amount'
        btnInfo.disabled = true
        return btnInfo
      }
      if (zapProps?.zapAmount && +zapProps?.zapAmount && d(zapProps?.zapAmount).gt(zapProps?.availableAmount || 0)) {
        btnInfo.disabled = true
        btnInfo.text = `Insufficient ${textEllipses(zapProps?.zapCoin?.symbol, 10)} Balance`
        return btnInfo
      }

      btnInfo.disabled = false
      return btnInfo
    }

    // 判断输入
    if (!+tokenAmountA && !+tokenAmountB) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    //判断余额
    if (!showDisplayTokenALock && tokenAmountA && d(tokenAmountA).gt(tokenBalanceA || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Invalid Amount`
      return btnInfo
    }
    //判断余额
    if (!showDisplayTokenBLock && tokenAmountB && d(tokenAmountB).gt(tokenBalanceB || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Invalid Amount`
      return btnInfo
    }

    if (showDisplayTokenALock && !+tokenAmountB) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    if (showDisplayTokenBLock && !+tokenAmountA) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    if (!binInfos?.amount_a) {
      btnInfo.disabled = true
      return btnInfo
    }

    btnInfo.disabled = false
    return btnInfo
  }, [
    useZapOut,
    zapProps?.zapAmount,
    zapProps?.availableAmount,
    zapProps?.zapCoin?.coin_type,
    binInfos,
    tokenAmountA,
    tokenAmountB,
    tokenBalanceA,
    tokenBalanceB,
    currentAccount?.address,
    showDisplayTokenALock,
    showDisplayTokenBLock
  ])

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
    if (showDisplayTokenALock) {
      setTokenAmountA('')
      setIsFixedDisplayTokenA(false)
    }
    if (showDisplayTokenBLock) {
      setTokenAmountB('')
      setIsFixedDisplayTokenA(true)
    }
    if (!showDisplayTokenALock && !showDisplayTokenBLock) {
      if (tokenAmountA && !tokenAmountB) {
        setIsFixedDisplayTokenA(true)
      }
      if (tokenAmountB && !tokenAmountA) {
        setIsFixedDisplayTokenA(false)
      }
    }
  }, [showDisplayTokenALock, showDisplayTokenBLock])

  useEffect(() => {
    if (dlmmPreRemoveLoading) {
      setTimeout(() => {
        setDlmmPreRemoveLoading(false)
      }, 500)
    }
  }, [dlmmPreRemoveLoading])

  useDebounceEffect(
    () => {
      if ((binInfos?.amount_a || binInfos?.amount_b) && !dlmmPreRemoveLoading && dlmmCurrentPosBaseInfo) {
        const removeAmountA = +binInfos?.amount_a
        const removeAmountB = +binInfos?.amount_b
        const amountA = dlmmCurrentPosBaseInfo.isReverse ? removeAmountB : removeAmountA
        const amountB = dlmmCurrentPosBaseInfo.isReverse ? removeAmountA : removeAmountB
        const tokenADecimals = dlmmCurrentPosBaseInfo.isReverse ? dlmmCurrentPosBaseInfo?.tokenB?.decimals : dlmmCurrentPosBaseInfo?.tokenA?.decimals
        const tokenBDecimals = dlmmCurrentPosBaseInfo.isReverse ? dlmmCurrentPosBaseInfo?.tokenA?.decimals : dlmmCurrentPosBaseInfo?.tokenB?.decimals
        const amountAF = fromDecimalsAmount(amountA, tokenADecimals)
        const amountBF = fromDecimalsAmount(amountB, tokenBDecimals)
        setTokenAmountAfterA(d(totalTokenBalanceA).sub(amountAF).toString())
        setTokenAmountAfterB(d(totalTokenBalanceB).sub(amountBF).toString())
      } else {
        setTokenAmountAfterA('')
        setTokenAmountAfterB('')
      }
    },
    [binInfos?.amount_a, binInfos?.amount_b, dlmmPreRemoveLoading, totalTokenBalanceA, totalTokenBalanceB],
    { wait: 200 }
  )

  useEffect(() => {
    return () => {
      resetInputAmount()
      setTokenAmountAfterA('')
      setTokenAmountAfterB('')
    }
  }, [])

  const numBins = useMemo(() => {
    if (minPriceData?.binId !== undefined && maxPriceData?.binId !== undefined) {
      return getNumBins(minPriceData!.binId, maxPriceData!.binId)
    } else {
      return '--'
    }
  }, [minPriceData?.binId, maxPriceData?.binId])

  const { isRegularTokenPair } = useSlippageTolerance(tokenA, tokenB, liquiditySlippage, useZapOut)

  const showRiskConfirm = useMemo(() => {
    if (zapProps == undefined) return false
    const { zapCoin, coinA, coinB, preWithdrawResult } = zapProps
    const isZapCoinA = zapCoin?.coin_type === coinA?.coin_type

    if (!preWithdrawResult?.swap_result || !coinA || !coinB) return false
    const { swap_in_amount } = preWithdrawResult.swap_result
    const fromCoin = isZapCoinA ? coinB : coinA
    const amount = fromDecimalsAmount(swap_in_amount || '0', fromCoin?.decimals).toString()
    const amountValue = getTokenAmountValue(fromCoin?.coin_type, amount)
    console.log(amount, amountValue, 'amount, amountValue')
    return isRegularTokenPair && useZapOut && d(amountValue || 0).gte(import.meta.env.VITE_LIMIT_RISK_AMOUNT) && d(liquiditySlippage).gt(0.02)
  }, [isRegularTokenPair, zapProps, liquiditySlippage, useZapOut, getTokenAmountValue])

  const [knowsRisk, setKnowsRisk] = useState<boolean>(false)

  const handleKnowsRisk = (value: boolean) => {
    setKnowsRisk(value)
  }

  return {
    displayTokenA,
    displayTokenB,
    tokenBalanceA,
    tokenBalanceB,
    posMinPriceBinId,
    posMaxPriceBinId,
    tokenAmountValueA,
    tokenAmountValueB,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    handleAmountChange,
    tokenAmountA,
    tokenAmountB,
    removeSide,
    setRemoveSide,
    dlmmPreRemoveLoading,
    isFixedDisplayTokenA,
    handleRemove,
    isRemoveLoading,
    changeSlideFun,
    slideValue,
    minPriceData,
    maxPriceData,
    handlePriceAction,
    posMinPrice,
    posMaxPrice,
    handleSlider,
    baseToken,
    quoteToken,
    isDirect,
    getRemoveTokenBalance,
    amountInfo,
    changeSlideValue,
    btnStatusText,
    isActive,
    displayTokenALock,
    displayTokenBLock,
    setTokenAmountA,
    setTokenAmountB,
    setSlideValue,
    isReverse,
    dlmmCurrentPosPoolsOriginalData,
    currentPosPoolsRelatedData,
    isAllRemove,
    tokenA,
    tokenB,
    numBins,
    zapProps,
    showRiskConfirm,
    knowsRisk,
    handleKnowsRisk,
    supportZap
  }
}
