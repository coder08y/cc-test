import { AggregatorDexMap } from '@/config/aggregator'
import useTransaction from '@/hooks/common/useTransaction'
import useGlobalStore from '@/store/common/global'
import useProStore from '@/store/pro'
import { SwapConfigState } from '@/store/swap/swap'
import useSwapConfigStore from '@/store/swap/swapConfig'
import { SwapRfqData, SwapRouterData } from '@/types/swap'
import { isDecimalWithZeros } from '@/utils'
import { useAccountBalance, useDebounceFunction } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useClmmSDKStore from '@cetus/stores/src/useClmmSDKStore'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { addComma, amountToBN, d, getBalanceChanges, isSuiObjectType, sleepTime } from '@cetus/utils'
import { dealWithFastRouterSwapParamsForMsafe } from '@cetusprotocol/aggregator-sdk'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { fromBase64 } from '@mysten/sui/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 } from 'uuid'
import { useGetTokenBalance } from '../../../../hooks/src/useTokenBalance'
import useCheckTokenScamsAlert from '../common/useCheckTokenScamsAlert'
import useSlippageTolerance from '../common/useSlippageTolerance'
import { useFindBestRouting } from './useFindBestRouting'
import { useFindRfqRouting } from './useFindRfqRouting'
import { useGetAmountLimit } from './useSwapHelper'

export const aggregatorPartner =
  envConfigs.env === 'mainnet'
    ? '0xeb863165a109f7791a3182be08aff1438ab2a429314fc135ae19d953afe1edd6'
    : '0xfdc30896f88f74544fd507722d3bf52e46b06412ba8241ba0e854cbc65f8d85f'
export function useSwapHook(option: SwapConfigState, isSwapWidget: boolean, rfqCountdownFlagRef?: React.MutableRefObject<number | undefined>) {
  const {
    fromCoin,
    toCoin,
    setFromCoin,
    setToCoin,
    setToAmount,
    fromAmount,
    toAmount,
    setFromAmount,
    setFindRouterLoading,
    setByAmountIn,
    byAmountIn,
    setRfqData,
    setRouterData,
    rfqData,
    routerData,
    userSelectQuoteMode
  } = option
  const { from, to } = useParams()
  const { currentAccount } = useAccountStore()
  const { fetchRfqQuote, verifyRfqAvailable } = useFindRfqRouting()
  const { findBestRouters, checkProvidersKeys } = useFindBestRouting()
  const { fetchRfqTransactions } = useFindRfqRouting()
  const { fetchTokenPrices, getTokenAmountValue } = useTokenPrice()
  const { slippage, mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { aggregatorSDK } = useClmmSDKStore()
  const navigate = useNavigate()
  const { fetchTokenInfo } = useGetToken()
  const [isOpenConfirmModel, setIsOpenConfirmModel] = useState<boolean>(false)

  const { signAndExecuteTransaction, transactionConfirmation, handleError } = useTransaction()
  const { providersSwitchStates, isOpenRfqSwitch } = useSwapConfigStore()

  const { fetchAccountBalance } = useAccountBalance()

  const { setCurrentProTab, currentProTab, isProMode, setProTransactionList, coinBvPrice, coinBvPirceUnit, showTokenInfo } = useProStore()

  // 余额
  const { balanceInfo: fromBalanceInfo } = useGetTokenBalance(fromCoin)
  const { balanceInfo: toBalanceInfo } = useGetTokenBalance(toCoin)

  // 价值
  const fromAmountValue = getTokenAmountValue(fromCoin?.coin_type, fromAmount)
  const toAmountValue = getTokenAmountValue(toCoin?.coin_type, toAmount)

  const [uuid, setUuid] = useState<string>('')

  const uuidRef = useRef<string>('')
  const byAmountInRef = useRef<boolean>(true)
  const fromAmountRef = useRef<string>('')
  const toAmountRef = useRef<string>('')
  const fromCoinRef = useRef<Token | undefined>()
  const toCoinRef = useRef<Token | undefined>()
  const providerRef = useRef<any>([])
  // 保存上一次的 from 和 to，用于检测是否是互换
  const prevFromRef = useRef<string | undefined>(from)
  const prevToRef = useRef<string | undefined>(to)

  useEffect(() => {
    fromCoinRef.current = fromCoin
  }, [fromCoin])

  useEffect(() => {
    toCoinRef.current = toCoin
  }, [toCoin])

  useEffect(() => {
    uuidRef.current = uuid
  }, [uuid])

  useEffect(() => {
    byAmountInRef.current = byAmountIn
  }, [byAmountIn])

  useEffect(() => {
    fromAmountRef.current = fromAmount
  }, [fromAmount])

  useEffect(() => {
    toAmountRef.current = toAmount
  }, [toAmount])

  const initiaTokenSelect = useCallback(
    (isSwapped: boolean = false) => {
      // toDo: 按运营反馈要求调整，切换token时,只清空to amount
      resetInputAmount(isSwapped ? false : undefined)
      if (!from && !to) {
        setFromCoin(envConfigs.clmm_swap.from_coin)
        setToCoin(envConfigs.clmm_swap.to_coin)
        navigate(`/swap`)
      } else {
        //   if (navFromToken?.coin_type !== fromCoin?.coin_type) {
        //     setFromCoin(navFromToken)
        //   }
        //   if (navToToken?.coin_type !== toCoin?.coin_type) {
        //     setToCoin(navToToken)
        //   }
        if (from && isSuiObjectType(from)) {
          fetchTokenInfo<string>(from)
            .then((token: Token | undefined) => {
              if (!token) {
                navigate(`/swap/${fromCoin?.coin_type}/${toCoin?.coin_type}`)
              } else {
                if (token?.coin_type !== fromCoin?.coin_type) {
                  setFromCoin(token)
                }
              }
            })
            .catch(() => {
              navigate(`/swap/${fromCoin?.coin_type}/${toCoin?.coin_type}`)
            })
        } else {
          setFromCoin(undefined)
        }
        if (to && isSuiObjectType(to)) {
          fetchTokenInfo<string>(to)
            .then((token: Token | undefined) => {
              if (!token) {
                navigate(`/swap/${fromCoin?.coin_type}/${toCoin?.coin_type}`)
              } else {
                if (token?.coin_type !== toCoin?.coin_type) {
                  setToCoin(token)
                }
              }
            })
            .catch(() => {
              navigate(`/swap/${fromCoin?.coin_type}/${toCoin?.coin_type}`)
            })
        } else {
          setToCoin(undefined)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [from, to]
  )

  // Initialization Swap Token
  useEffect(() => {
    if (!isSwapWidget) {
      // 检测是否是互换的情况：from 和 to 互换位置
      const isSwapped =
        prevFromRef.current !== undefined &&
        prevToRef.current !== undefined &&
        from === prevToRef.current &&
        to === prevFromRef.current &&
        from !== to // 确保 from 和 to 不同

      initiaTokenSelect(isSwapped)

      // 更新上一次的值
      prevFromRef.current = from
      prevToRef.current = to
    }
  }, [from, to, initiaTokenSelect, isSwapWidget])

  /**
   * 预计算
   */
  const findRouters = async (amount: string, by_amount_in: boolean, uuid: string, useRfq: boolean) => {
    console.log('🚀🚀🚀 ~ useSwap.ts:182 ~ findRouters ~ providersSwitchStates:', providersSwitchStates)
    if (fromCoinRef.current && toCoinRef.current && +amount) {
      const providersKeys = isSwapWidget
        ? Object.entries(AggregatorDexMap).map(([key, _]) => key)
        : Object.entries(providersSwitchStates)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => key)

      if (+fromAmountRef.current || +toAmountRef.current) {
        setFindRouterLoading(true)
        setRfqData(undefined)
      }

      // const formatAmount = toDecimalsAmount(amount, by_amount_in ? fromCoinRef.current.decimals : toCoinRef.current.decimals)
      const formatAmount = amountToBN(amount, by_amount_in ? fromCoinRef.current.decimals : toCoinRef.current.decimals)

      if (useRfq && !isSwapWidget && by_amount_in && verifyRfqAvailable(fromCoinRef.current, toCoinRef.current, amount)) {
        // 异步处理rfq数据
        fetchRfqQuote({ fromToken: fromCoinRef.current, toToken: toCoinRef.current, amount: formatAmount.toString(), uuid }).then(res => {
          if (uuidRef.current === uuid) {
            setRfqData(res)
          }
        })
      }

      const checkProvidersKeysRes = await checkProvidersKeys(providersKeys as string[])
      console.log('🚀🚀🚀 ~ useSwap.ts:203 ~ findRouters ~ providersKeys:', providersKeys)
      console.log('🚀🚀🚀 ~ useSwap.ts:203 ~ findRouters ~ checkProvidersKeysRes:', checkProvidersKeysRes)

      const result = await findBestRouters({
        fromToken: fromCoinRef.current,
        toToken: toCoinRef.current,
        amount: formatAmount.toString(),
        providersKeys: checkProvidersKeysRes,
        by_amount_in,
        uuid,
        isAllProviders: isSwapWidget
      })

      setFindRouterLoading(false)

      if (uuidRef.current === uuid) {
        providerRef.current = checkProvidersKeysRes
        if (by_amount_in) {
          if (+fromAmountRef.current) {
            setToAmount(result?.toAmountUi || '')
            setRouterData(result)
          } else {
            setToAmount('')
          }
        } else {
          if (+toAmountRef.current) {
            setFromAmount(result?.fromAmountUi || '')
            setRouterData(result)
          } else {
            setFromAmount('')
          }
        }
      }
    } else {
      resetInputAmount(!by_amount_in)
    }
  }

  const debouncedFindRouters = useDebounceFunction(findRouters, 500)

  /**
   * 输入数量监听
   * @param amount
   */
  const handleAmountChange = (amount: string, by_amount_in: boolean, resetInput: boolean = false) => {
    if (rfqCountdownFlagRef) {
      rfqCountdownFlagRef.current = undefined
    }

    setByAmountIn(by_amount_in)
    if (by_amount_in) {
      setFromAmount(amount)
      if (resetInput) {
        setToAmount('')
      }
    } else {
      setToAmount(amount)
      if (resetInput) {
        setFromAmount('')
      }
    }

    if (+amount && fromCoinRef.current && toCoinRef.current) {
      const uuid = v4()
      setUuid(uuid)
      debouncedFindRouters(amount, by_amount_in, uuid, true)
    } else {
      setFindRouterLoading(false)
      setRfqData(undefined)
      setRouterData(undefined)
      if (!amount && isDecimalWithZeros(amount)) {
        resetInputAmount()
      } else {
        by_amount_in ? setToAmount('') : setFromAmount('')
      }
    }
  }

  /**
   * 重新计算RouteData
   */
  const reCalculateRouteData = (refreshRfq = true) => {
    if (rfqCountdownFlagRef) {
      rfqCountdownFlagRef.current = undefined
    }
    const amount = byAmountInRef.current ? fromAmountRef.current : toAmountRef.current

    console.log(
      '🚀 ~ file: useSwap.ts:273 ~ reCalculateRouteData ~ amount:',
      amount,
      byAmountInRef.current,
      fromAmountRef.current,
      toAmountRef.current
    )

    if (+amount && fromCoinRef.current && toCoinRef.current) {
      const uuid = v4()
      setUuid(uuid)
      debouncedFindRouters(amount, byAmountInRef.current, uuid, refreshRfq)
    } else {
      if (isDecimalWithZeros(amount)) {
        resetInputAmount()
      }
    }
  }

  // 路由源改变后，重新计算
  useEffect(() => {
    reCalculateRouteData()
  }, [JSON.stringify(providersSwitchStates) + isOpenRfqSwitch])

  /**
   * 切换token监听
   * @param coin
   * @param isFrom
   */
  const handleSelectToken = useCallback(
    (coin?: Token, isFrom: boolean = true) => {
      resetInputAmount()

      // ToDo: widget和swap选择token不应该同步
      if (!isSwapWidget) {
        if (isFrom) {
          if (coin && fixCoinType(coin?.coin_type || '') === fixCoinType(toCoin?.coin_type || '')) {
            setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy')
            navigate(`/swap/${coin?.coin_type}/${fromCoin?.coin_type}`)
          } else {
            navigate(`/swap/${coin?.coin_type}/${toCoin?.coin_type}`)
          }
        } else {
          if (coin && fixCoinType(coin?.coin_type || '') === fixCoinType(fromCoin?.coin_type || '')) {
            setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy')
            navigate(`/swap/${toCoin?.coin_type}/${coin?.coin_type}`)
          } else {
            navigate(`/swap/${fromCoin?.coin_type}/${coin?.coin_type}`)
          }
        }
      } else {
        if (isFrom) {
          if (coin && fixCoinType(coin?.coin_type || '') === fixCoinType(toCoin?.coin_type || '')) {
            setToCoin(fromCoin)
          }
          setFromCoin(coin)
        } else {
          if (coin && fixCoinType(coin?.coin_type || '') === fixCoinType(fromCoin?.coin_type || '')) {
            setFromCoin(toCoin)
          }
          setToCoin(coin)
        }
      }
    },
    [fromCoin?.coin_type, toCoin?.coin_type, currentProTab]
  )
  const { amountLimit } = useGetAmountLimit(slippage, routerData)

  const resetInputAmount = (resetAmountFrom?: boolean) => {
    if (resetAmountFrom === undefined) {
      setFromAmount('')
      setToAmount('')
    } else {
      if (resetAmountFrom) {
        setFromAmount('')
      } else {
        setToAmount('')
      }
    }
    setFindRouterLoading(false)
    setRfqData(undefined)
    setRouterData(undefined)
  }

  // 监听token 切换 刷新价格
  useEffect(() => {
    refreshMarketPrice()
  }, [fromCoin?.coin_type, toCoin?.coin_type])

  // 刷新市场价格
  const refreshMarketPrice = () => {
    const list = []
    if (fromCoin) {
      list.push(fromCoin.coin_type)
    }

    if (toCoin) {
      list.push(toCoin.coin_type)
    }

    if (list.length > 0) {
      fetchTokenPrices(list)
    }
  }

  const getSwapSecondaryData = () => {
    if (userSelectQuoteMode === 'rfq') {
      return rfqData!
    }
    return routerData!
  }

  /**
   * 执行swap
   * @param data
   */
  const handleRouterSwap = async (data: SwapRouterData | SwapRfqData) => {
    const isSelectedRfq = 'rfqQuote' in data
    setIsOpenConfirmModel(false)
    let toastType: ToastType
    let txb: () => Promise<Transaction>
    let fromAmountUi: string
    let toAmountUi: string
    let msafeParams: any

    try {
      fromAmountUi = data.fromAmountUi!
      toAmountUi = data.toAmountUi!

      // 构造txb
      if (isSelectedRfq) {
        txb = async () => {
          const transactions = await fetchRfqTransactions(data!.rfqQuote.id)
          console.log('🚀 ~ file: useSwap.ts:481 ~ handleRouterSwap ~ transactions:', transactions)
          return Transaction.from(fromBase64(transactions))
        }
      } else {
        const tx = new Transaction()

        // const params: any = {
        //   router: data!.routerData,
        const sdkParams: any = {
          router: data!.routerData!,
          partner: aggregatorPartner,
          txb: tx,
          slippage: Number(slippage),
          refreshAllCoins: true
        }
        console.log('🚀 ~ handleRouterSwap ~ sdkParams:', sdkParams)

        txb = async () => {
          await aggregatorSDK!.fastRouterSwap(sdkParams)
          console.log('🚀 ~ handleRouterSwap ~ tx:', tx)
          return tx
        }

        console.log('useSwap 🚀 ~ txb= ~ txb:', await txb)

        msafeParams = {
          action: 'AggregatorSwap',
          txbParams: {
            ...sdkParams,
            router: dealWithFastRouterSwapParamsForMsafe(sdkParams?.router)
          }
        }
      }

      // 关闭弹窗
      setIsOpenConfirmModel(false)

      let transactionData: any = {
        currentCoin: showTokenInfo,
        type: currentProTab
      }

      // 构造toast
      toastType = {
        isSwapWidget,
        actionType: 'swap',
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description = `Swapping ${addComma(fromAmountUi as string)} ${fromCoin?.symbol} for ${addComma(toAmountUi as string)} ${toCoin?.symbol}`
          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            let payAmountF = fromAmountUi
            let receiveAmountF = toAmountUi

            if (balanceChanges) {
              payAmountF = getBalanceChanges(balanceChanges, fromCoin) || fromAmountUi
              receiveAmountF = getBalanceChanges(balanceChanges, toCoin) || toAmountUi
            }
            const description = `Swapped ${addComma(payAmountF as string)} ${fromCoin?.symbol} for ${addComma(receiveAmountF as string)} ${toCoin?.symbol}`

            info.toastDescriptionContent = description
            info.modalDescriptionText = description
            info.toastTitleText = 'Swap Successful'

            if (isProMode) {
              transactionData = {
                ...transactionData,
                amount: currentProTab === 'Buy' ? receiveAmountF : payAmountF,
                time: new Date().getTime(),
                price: coinBvPrice?.price,
                priceUnit: coinBvPirceUnit
              }

              setProTransactionList(transactionData)
            }
          }

          if (status === 'rejected') {
            info.toastTitleText = description.replace('Swapping', 'Swap')
          }

          return info
        }
      }

      if (!isSwapWidget) {
        transactionConfirmation(toastType)
      }
      console.log('🚀 ~ handleRouterSwap ~ txb:', txb)
      const res = await signAndExecuteTransaction(txb, toastType, {
        useMev: mevProtect,
        useFastMode: !isSelectedRfq && transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams,
        otherParams: {
          routerData: option,
          providerKey: providerRef.current,
          from: fromCoinRef.current?.coin_type,
          to: toCoinRef.current?.coin_type
        }
      })

      console.log('🚀 ~ file: useSwap.ts:272 ~ doSwapAction ~ res:', res)

      if (res) {
        // 清空输入框
        resetInputAmount()
        //获取余额
        fetchAccountBalance()
        return true
      } else {
        // 如何失败 刷新一次路由计算
        reCalculateRouteData()
        return false
      }
    } catch (error) {
      console.log('🚀 ~ handleRouterSwap ~ error text:', error)
    }
  }

  // 风险token
  const { scamsCoinList } = useCheckTokenScamsAlert(fromCoin && toCoin ? [fromCoin, toCoin] : [])

  const scamsText = useMemo(() => {
    if (scamsCoinList.length === 0) {
      return undefined
    }

    // 检查 fromCoin 和 toCoin 是否在风险列表中
    const isFromScamsCoin = fromCoin && scamsCoinList.some(coin => coin.coin_type === fromCoin.coin_type)
    const isToScamsCoin = toCoin && scamsCoinList.some(coin => coin.coin_type === toCoin.coin_type)

    if (isFromScamsCoin && isToScamsCoin && fromCoin?.symbol && toCoin?.symbol) {
      return `${fromCoin.symbol} and ${toCoin.symbol} are`
    }

    if (isFromScamsCoin && fromCoin?.symbol) {
      return `${fromCoin.symbol} token is `
    }

    if (isToScamsCoin && toCoin?.symbol) {
      return `${toCoin.symbol} token is `
    }

    return undefined
  }, [scamsCoinList, fromCoin, toCoin])

  const onReverseClick = async (isOpenAggregatorMode: boolean, isClickToggle?: boolean) => {
    if (isClickToggle) {
      setCurrentProTab(currentProTab === 'Buy' ? 'Sell' : 'Buy', 'toggleBtn')
    }
    if (!isOpenAggregatorMode) {
      // Always swap tokens regardless of byAmountIn value
      if (isSwapWidget) {
        setFromCoin(toCoin)
        setToCoin(fromCoin)
      } else {
        navigate(`/swap/${toCoin?.coin_type}/${fromCoin?.coin_type}`, { state: { preventScroll: true } })
      }

      // Swap amounts
      setFromAmount(toAmount)
      setToAmount(fromAmount)

      // Toggle byAmountIn to maintain consistency
      // setByAmountIn(!byAmountIn)
      setByAmountIn(true)

      await sleepTime(200)
      reCalculateRouteData()
    } else {
      if (isSwapWidget) {
        setFromCoin(toCoin)
        setToCoin(fromCoin)
      } else {
        setFromCoin(toCoin)
        setToCoin(fromCoin)
        navigate(`/swap/${toCoin?.coin_type}/${fromCoin?.coin_type}`, { state: { preventScroll: true } })
      }

      setFromAmount(toAmount)
      setToAmount('')
      setByAmountIn(true)

      await sleepTime(200)
      reCalculateRouteData()
    }
  }

  // 销毁时清空输入
  useEffect(() => {
    return () => {
      if (!isSwapWidget) {
        setFromCoin(undefined)
        setToCoin(undefined)
      }
      setFromAmount('')
      setToAmount('')
    }
  }, [])

  const { isRegularTokenPair } = useSlippageTolerance(fromCoin, toCoin, slippage, true)

  console.log(fromAmountValue, slippage, 'fromAmountValue')

  const showRiskConfirm = useMemo(() => {
    return isRegularTokenPair && d(fromAmountValue || 0).gte(import.meta.env.VITE_LIMIT_RISK_AMOUNT) && d(slippage).gt(0.02)
  }, [isRegularTokenPair, fromAmountValue, slippage])

  const [knowsRisk, setKnowsRisk] = useState<boolean>(false)

  const handleKnowsRisk = (value: boolean) => {
    setKnowsRisk(value)
  }

  return {
    handleSelectToken,
    handleAmountChange,
    fromAmount,
    toAmount,
    fromAmountValue,
    toAmountValue,
    amountLimit,
    getSwapSecondaryData,
    reCalculateRouteData,
    fromBalanceInfo,
    toBalanceInfo,
    handleRouterSwap,
    scamsText,
    refreshMarketPrice,
    isOpenConfirmModel,
    setIsOpenConfirmModel,
    resetInputAmount,
    onReverseClick,
    showRiskConfirm,
    knowsRisk,
    handleKnowsRisk,
    slippage
  }
}
