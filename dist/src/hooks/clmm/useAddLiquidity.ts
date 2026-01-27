import useGetCurrentPrice from '@/hooks/clmm/useGetCurrentPrice'
import useTransaction from '@/hooks/common/useTransaction'
import usePositionList from '@/hooks/position/usePositionList'
import useZapSubmit from '@/hooks/zap/useZapSubmit'
import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import usePriceRangeStore from '@/store/clmm/priceRange'
import useGlobalStore from '@/store/common/global'
import useZapStore from '@/store/zap'
import { formatDescription } from '@/utils'
import { calcCoinProportion } from '@/utils/pool'
import { useAccountBalance } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import useNotifiStore from '@cetus/stores/src/notifi'
import { BalanceChanges, CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types'
import { Decimal, amountToBN, getBalanceChanges, isAvailableObject, parsePositionIdFromEvent } from '@cetus/utils'
import { TickUtil, d } from '@cetusprotocol/common-sdk'
import { useDebounceEffect, useDeepCompareEffect } from 'ahooks'
import { debounce } from 'lodash-es'
import { useEffect, useState } from 'react'
import useQuoteWhiteTokenList from '../create-pool/useQuoteWhiteTokenList'
import useNotifiSubscription from '../notifi/useNotifiSubscription'
import useGetContractPoolInfo from '../pool/useGetContractPoolInfo'
import usePosAdd from '../position/usePosAdd'
interface DebouncedPreAddProps {
  amount?: string | number
  isTokenA: boolean
  isFullRange: boolean
}

function useAddLiquidity(getList: () => Promise<void>, direct?: boolean) {
  const { preAdd, getClmmCreateAddData, getFarmsCreateAddData } = usePosAdd()
  const [preAddLoading, setPreAddLoading] = useState<boolean>(false)
  const { currentPriceData, apiPoolInfo, contractPoolInfo } = useLiquidityStore()
  const { getContractPoolInfo } = useGetContractPoolInfo()
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const { signAndExecuteTransaction, getTransactionStatus, transactionSuccess } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice, slippage, liquiditySlippage } = useGlobalStore()
  // const [nftOpen, setNftOpen] = useState(false)
  // const [relatedPosId, setRelatedPosId] = useState('')
  const { transactionConfirmation } = useTransactionModal()
  const { getCurrentPrice } = useGetCurrentPrice()
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
    percentMap,
    setPercentMap,
    isFullRange,
    setIsFullRange,
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
    autoStakePosition,
    liquidityAmount,
    setLiquidityAmount,
    useZapIn,
    setUseZapIn,
    confirmModalOpen,
    setConfirmModalOpen,
    nftOpen,
    setNftOpen,
    relatedPosId,
    setRelatedPosId
  } = useAddLiquidityStore()

  const { currentAccount, onWalletModal } = useAccountStore()
  const { getTokenAmountValue } = useTokenPrice()

  const { getZapDepositTx, getZapDepositToastInfo, reCalculateZapData } = useZapSubmit()
  const { setZapAmount, zapAmountRate } = useZapStore()

  const { getPositionBaseList } = usePositionList()

  useEffect(() => {
    if (currentAccount?.address) {
      getPositionBaseList(currentAccount?.address)
    }
  }, [currentAccount?.address])

  useDeepCompareEffect(() => {
    if (apiPoolInfo) {
      setIsTokenA(apiPoolInfo?.displayTokenA?.coin_type === apiPoolInfo?.tokenA?.coin_type)
    }
  }, [apiPoolInfo])

  const { isWhiteQuoteToken } = useQuoteWhiteTokenList()

  // notifi
  const { notifiSubscription } = useNotifiSubscription()
  const { isChecked } = useNotifiStore()

  useDebounceEffect(
    () => {
      if (isFullRange) {
        setPercentMap({ percentA: '50', percentB: '50' })
        return
      }

      if (
        apiPoolInfo &&
        apiPoolInfo?.tokenA &&
        apiPoolInfo?.tokenB &&
        typeof contractPoolInfo?.current_tick_index === 'number' &&
        lowerTickData?.tick !== undefined &&
        upperTickData?.tick !== undefined &&
        currentPriceData.currentSqrtPrice
      ) {
        if (d(lowerTickData.tick).lte(contractPoolInfo.current_tick_index) && d(upperTickData.tick).gt(contractPoolInfo.current_tick_index)) {
          const baseToken = isWhiteQuoteToken(apiPoolInfo.tokenA.coin_type) ? apiPoolInfo.tokenA : apiPoolInfo.tokenB
          const isTokenA = baseToken.coin_type === apiPoolInfo.tokenA.coin_type

          const res = preAdd({
            amount: amountToBN('1', baseToken.decimals).toString(),
            tokenA: apiPoolInfo?.tokenA,
            tokenB: apiPoolInfo?.tokenB,
            isTokenA,
            lowerTick: lowerTickData?.tick,
            upperTick: upperTickData?.tick,
            curSqrtPrice: currentPriceData.currentSqrtPrice,
            isReverse: apiPoolInfo?.isReverse,
            roundUp: true
          })

          const rateMap = calcCoinProportion(res.coinAmountA, res.coinAmountB, currentPriceData?.currentPrice, isFullRange)
          setPercentMap(rateMap)

          return
        }

        if (d(lowerTickData.tick).gt(contractPoolInfo.current_tick_index)) {
          setPercentMap({ percentA: '100', percentB: '0' })
          return
        }

        if (d(upperTickData.tick).lte(contractPoolInfo.current_tick_index)) {
          setPercentMap({ percentA: '0', percentB: '100' })
          return
        }
      }
    },
    [JSON.stringify(apiPoolInfo), currentPriceData, lowerTickData?.tick, upperTickData?.tick, isFullRange],
    { wait: 300 }
  )

  const handlePreCalc = ({ amount, isTokenA, isFullRange }: DebouncedPreAddProps) => {
    if (
      apiPoolInfo &&
      apiPoolInfo?.tokenA &&
      apiPoolInfo?.tokenB &&
      Object.keys(currentPriceData).length > 0 &&
      lowerTickData?.tick !== undefined &&
      upperTickData?.tick !== undefined &&
      fromToken &&
      toToken
    ) {
      let res

      if (
        typeof contractPoolInfo?.current_tick_index === 'number' &&
        d(lowerTickData?.tick).lte(contractPoolInfo?.current_tick_index) &&
        d(upperTickData?.tick).gt(contractPoolInfo?.current_tick_index)
      ) {
        res = preAdd({
          amount: amountToBN(amount && +amount ? amount + '' : '1', byAmountIn ? fromToken?.decimals : toToken?.decimals).toString(),
          tokenA: apiPoolInfo?.tokenA,
          tokenB: apiPoolInfo?.tokenB,
          isTokenA,
          lowerTick: lowerTickData?.tick,
          upperTick: upperTickData?.tick,
          curSqrtPrice: currentPriceData.currentSqrtPrice,
          isReverse: apiPoolInfo?.isReverse,
          roundUp: true
        })
      } else if (fromTokenLock && !toTokenLock) {
        const isTokenA = toToken?.coin_type === apiPoolInfo?.tokenA?.coin_type
        res = preAdd({
          amount: amountToBN(amount ? amount + '' : '1', toToken?.decimals).toString(),
          tokenA: apiPoolInfo?.tokenA,
          tokenB: apiPoolInfo?.tokenB,
          isTokenA,
          lowerTick: lowerTickData?.tick,
          upperTick: upperTickData?.tick,
          curSqrtPrice: currentPriceData.currentSqrtPrice,
          isReverse: apiPoolInfo?.isReverse,
          roundUp: true
        })

        // setPercentMap({
        //   percentA: isTokenA ? '100' : '0',
        //   percentB: isTokenA ? '0' : '100'
        // })
      } else if (toTokenLock && !fromTokenLock) {
        const isTokenA = fromToken?.coin_type === apiPoolInfo?.tokenA?.coin_type
        res = preAdd({
          amount: amountToBN(amount ? amount + '' : '1', fromToken?.decimals).toString(),
          tokenA: apiPoolInfo?.tokenA,
          tokenB: apiPoolInfo?.tokenB,
          isTokenA,
          lowerTick: lowerTickData?.tick,
          upperTick: upperTickData?.tick,
          curSqrtPrice: currentPriceData.currentSqrtPrice,
          isReverse: apiPoolInfo?.isReverse,
          roundUp: true
        })

        // setPercentMap({
        //   percentA: isTokenA ? '100' : '0',
        //   percentB: isTokenA ? '0' : '100'
        // })
      } else if (fromTokenLock && toTokenLock) {
        res = isTokenA
          ? { coinAmountA: amount ? amount + '' : '1', coinAmountB: '', tokenMaxA: amount ? amount + '' : '1', tokenMaxB: '' }
          : { coinAmountA: '', coinAmountB: amount ? amount + '' : '1', tokenMaxA: '', tokenMaxB: amount ? amount + '' : '1' }
      }
      setTokenMaxA(res?.tokenMaxA)
      setTokenMaxB(res?.tokenMaxB)
      if (amount) {
        if (d(amount).gt('0')) {
          if (byAmountIn) {
            const _toAmount = toToken?.coin_type === apiPoolInfo?.tokenA?.coin_type ? res?.coinAmountA : res?.coinAmountB
            const _fromAmountValue = getTokenAmountValue(fromToken?.coin_type, amount + '')
            const _toAmountValue = getTokenAmountValue(toToken?.coin_type, _toAmount)
            const _totalAmountValue = d(_fromAmountValue).plus(_toAmountValue).toString()
            console.log(_toAmount, _fromAmountValue, _toAmountValue, _totalAmountValue, '_totalAmountValue')
            setToAmount(_toAmount || '')
            setFromAmountValue(_fromAmountValue)
            setToAmountValue(_toAmountValue)
            setTotalAmount(_totalAmountValue)
          } else {
            const _fromAmount = fromToken?.coin_type === apiPoolInfo?.tokenA?.coin_type ? res?.coinAmountA : res?.coinAmountB
            const _fromAmountValue = getTokenAmountValue(fromToken?.coin_type, _fromAmount)
            const _toAmountValue = getTokenAmountValue(toToken?.coin_type, amount + '')
            const _totalAmountValue = d(_fromAmountValue).plus(_toAmountValue).toString()
            console.log(_fromAmount, _fromAmountValue, _toAmountValue, _totalAmountValue, '_totalAmountValue')
            setFromAmountValue(_fromAmountValue)
            setToAmountValue(_toAmountValue)
            setFromAmount(_fromAmount || '')
            setTotalAmount(_totalAmountValue)
          }
        } else {
          if (byAmountIn) {
            setToAmount('')
            setFromAmountValue('')
            setToAmountValue('')
            setTotalAmount('')
          } else {
            setFromAmount('')
            setFromAmountValue('')
            setToAmountValue('')
            setTotalAmount('')
          }
        }
      } else {
        setFromAmount('')
        setToAmount('')
        setFromAmountValue('')
        setToAmountValue('')
        setTotalAmount('')
      }
      if (res) {
        setLiquidityAmount(res?.liquidityAmount || '')
        // if ([fromTokenLock, toTokenLock]?.filter(Boolean).length !== 1) {
        //   //    const rateMap = calcCoinProportion(res.coinAmountA, res.coinAmountB, currentPriceData?.currentPrice, isFullRange)
        //   //  setPercentMap(rateMap)
        // }
      }
    }
  }

  useDebounceEffect(
    () => {
      handlePreCalc({ amount: byAmountIn ? fromAmount : toAmount, isTokenA, isFullRange })
    },
    [
      JSON.stringify(apiPoolInfo),
      currentPriceData,
      lowerTickData?.tick,
      upperTickData?.tick,
      fromAmount,
      toAmount,
      byAmountIn,
      isTokenA,
      fromTokenLock,
      toTokenLock,
      isFullRange
    ],
    { wait: 300 }
  )

  const handleAmountChange = (value: string, _byAmountIn: boolean, _isTokenA?: boolean) => {
    setByAmountIn(_byAmountIn)
    if (_byAmountIn) {
      setFromAmount(value)
    } else {
      setToAmount(value)
    }
    if (_isTokenA !== undefined) {
      setIsTokenA(_isTokenA)
    } else {
      setIsTokenA(false)
    }
  }

  const { balanceInfo: fromBalanceInfo } = useGetTokenBalance(fromToken)
  const { balanceInfo: toBalanceInfo } = useGetTokenBalance(toToken)

  useDeepCompareEffect(() => {
    if (byAmountIn) {
      setIsTokenA(fromToken?.coin_type === apiPoolInfo?.tokenA?.coin_type)
    } else {
      setIsTokenA(toToken?.coin_type === apiPoolInfo?.tokenA?.coin_type)
    }
  }, [apiPoolInfo, byAmountIn, fromToken, toToken])

  useEffect(() => {
    if (
      lowerTickData?.tick === TickUtil.getMinIndex(Number(lowerTickData?.tickSpacing || 0)) &&
      upperTickData?.tick === TickUtil.getMaxIndex(Number(upperTickData?.tickSpacing || 0))
    ) {
      setIsFullRange(true)
    } else {
      setIsFullRange(false)
    }
  }, [lowerTickData?.tick, upperTickData?.tick])

  useEffect(() => {
    if (contractPoolInfo?.current_tick_index !== undefined && isAvailableObject(lowerTickData) && isAvailableObject(upperTickData)) {
      if (d(lowerTickData?.tick).gte(d(upperTickData.tick))) {
        setFromTokenLock(true)
        setToTokenLock(true)
      } else {
        if (d(lowerTickData?.tick).gt(contractPoolInfo?.current_tick_index)) {
          setFromTokenLock(!direct)
          setToTokenLock(!!direct)
        } else if (d(upperTickData.tick).lte(contractPoolInfo?.current_tick_index)) {
          setFromTokenLock(!!direct)
          setToTokenLock(!direct)
        } else {
          setFromTokenLock(false)
          setToTokenLock(false)
        }
      }
    }
  }, [lowerTickData?.tick, upperTickData?.tick, contractPoolInfo, direct])

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
  }

  const { fetchAccountBalance } = useAccountBalance()
  const handleSubmit = async () => {
    let trackData: any = null
    let amount_a
    let amount_b
    try {
      let tx
      let toastInfo: ToastType
      let msafeParams
      if (!useZapIn) {
        const inputAmount = byAmountIn ? fromAmount : toAmount
        const tokenDecimals = byAmountIn ? fromToken!.decimals : toToken!.decimals
        const amount = d(inputAmount).mul(Decimal.pow(10, tokenDecimals)).toString()

        const fixAmountA =
          byAmountIn && fromToken?.coin_type === apiPoolInfo?.tokenA?.coin_type
            ? true
            : toToken?.coin_type === apiPoolInfo?.tokenA?.coin_type && !byAmountIn
              ? true
              : false

        const lowerTick = lowerTickData.tick
        const upperTick = upperTickData.tick
        const currentTickIndex = contractPoolInfo?.current_tick_index

        if (lowerTick !== undefined && upperTick !== undefined && currentTickIndex !== undefined) {
          if (currentTickIndex >= lowerTick && currentTickIndex <= upperTick) {
            amount_a = fixAmountA ? amount : tokenMaxA
            amount_b = fixAmountA ? tokenMaxB : amount
          } else if (currentTickIndex > upperTick) {
            amount_a = 0
            amount_b = amount
          } else if (currentTickIndex < lowerTick) {
            amount_a = amount
            amount_b = 0
          }
        }

        let rewarderCoinTypes: string[] = []
        if (contractPoolInfo?.index) {
          const { rewarder_infos } = contractPoolInfo
          rewarderCoinTypes =
            (rewarder_infos?.length > 0 &&
              rewarder_infos?.map((ele: any) => {
                return ele.coinAddress
              })) ||
            []
        }

        const params: any = {
          poolAddress: contractPoolInfo?.poolAddress,
          coinTypeA: contractPoolInfo?.coinTypeA,
          coinTypeB: contractPoolInfo?.coinTypeB,
          amountA: amount_a,
          amountB: amount_b,
          fixAmountA,
          lowerTick,
          upperTick,
          // currentSqrtPrice: currentPosPoolsRelatedData?.curSqrtPrice,
          currentSqrtPrice: contractPoolInfo?.current_sqrt_price,
          rewarderCoinTypes,
          farmsPoolId: apiPoolInfo?.farmsPoolAddress
        }

        toastInfo = {
          getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
            const description =
              'Add ' + [formatDescription(fromAmount, fromToken?.symbol), formatDescription(toAmount, toToken?.symbol)].filter(Boolean).join(' and ')

            const info: CommonTypeInfo = {
              modalDescriptionText: description,
              toastTitleText: description
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

              info.toastDescriptionContent = description
              info.modalDescriptionText = description
              info.toastTitleText = 'Supplied Successful'
            }

            return info
          }
        }
        transactionConfirmation(toastInfo)

        if (autoStakePosition) {
          const res = await getFarmsCreateAddData(params)
          tx = res?.tx
          msafeParams = res?.msafeParams
        } else {
          const res = await getClmmCreateAddData(params)
          tx = res?.tx
          msafeParams = res?.msafeParams
        }
      } else {
        toastInfo = getZapDepositToastInfo()
        transactionConfirmation(toastInfo)
        tx = await getZapDepositTx(lowerTickData?.tick, upperTickData?.tick, autoStakePosition)
      }

      trackData = {
        pool: contractPoolInfo?.poolAddress,
        lower: lowerTickData?.tick,
        upper: upperTickData?.tick,
        coinTypeA: contractPoolInfo?.coinTypeA,
        coinTypeB: contractPoolInfo?.coinTypeB,
        amountA: amount_a,
        amountB: amount_b,
        currentSqrtPrice: contractPoolInfo?.current_sqrt_price,
        slippage,
        liquiditySlippage,
        autoStack: autoStakePosition,
        txAction: useZapIn ? 'addLiquidity-zap' : 'addLiquidity'
      }

      let res = await signAndExecuteTransaction(tx, toastInfo, {
        useDevInspect: true,
        useMev: mevProtect,
        showSuccessModal: false,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams,
        trackData
      })

      if (res) {
        console.log('🚀🚀🚀 ~ file: useAddLiquidity.ts:403 ~ handleSubmit ~ res:', res)
        console.log('🚀🚀🚀 ~ file: useAddLiquidity.ts:411 ~ handleSubmit ~ isChecked:', isChecked)
        if (res?.events?.length === 0) {
          res = await getTransactionStatus(res.digest)
        }
        const { posId, farmsPosId } = parsePositionIdFromEvent(res)
        console.log('🚀 ~ file: useAddLiquidity.ts:436 ~ handleSubmit ~ posId:', { posId, farmsPosId })
        if (posId) {
          setNftOpen(true)
          if (farmsPosId) {
            setRelatedPosId(farmsPosId)
          } else {
            setRelatedPosId(posId)
          }
        } else {
          transactionSuccess(toastInfo)
        }

        if (isChecked) {
          const params = { subscriptionSource: 'AddLiquidity', events: res.events }
          notifiSubscription(params)
        }
        // 重新拿数据
        fetchAccountBalance()
        resetInputAmount()
        setZapAmount('')
        getList()
        if (currentAccount?.address) {
          setTimeout(() => {
            getPositionBaseList(currentAccount?.address)
          }, 2000)
        }
      } else {
        // 如果失败，大概率都是池子价格变化了，重新手动获取一次池子价格，避免用户重复提交导致再次失败
        if (contractPoolInfo) {
          getContractPoolInfo(contractPoolInfo?.poolAddress).then(res => {
            reCalculateZapData()
          })
        }
      }
    } catch (error) {
      console.error(error, 'handleSubmit ~ error')
      const errorLowerString = String(error).toLocaleLowerCase()
      if (errorLowerString.includes('user') && errorLowerString.includes('reject')) {
        if (apiPoolInfo?.poolAddress) {
          const _contractPoolInfo = await getContractPoolInfo(apiPoolInfo?.poolAddress)
          if (_contractPoolInfo) {
            getCurrentPrice(_contractPoolInfo?.current_sqrt_price, apiPoolInfo, _contractPoolInfo?.current_tick_index)
          }
        }
      }
      throw error
    }
  }

  const handleChangeZapIn = () => {
    setUseZapIn(!useZapIn)
  }

  useEffect(() => {
    resetInputAmount()
  }, [useZapIn])

  return {
    percentMap,
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
    useZapIn,
    handleChangeZapIn
  }
}

export default useAddLiquidity
