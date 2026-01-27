import { FreshProgressRef } from '@/components/swap/FreshProgressV2'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import useGlobalStore from '@/store/common/global'
import useZapStore from '@/store/zap/index'
import { useDebounceFunction } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, ToastType, TransactionStatusType } from '@cetus/types'
import { bnToAmount, d, fixDown, formatNumberWithDown, getBalanceChanges, textEllipses } from '@cetus/utils'
import { WithdrawCalculationOptions } from '@cetusprotocol/zap-sdk'
import { debounce } from 'lodash-es'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'

export default function useZapSubmit(type = 'Deposit') {
  const {
    zapAmount,
    currentZapToken,
    zapAmountRate,
    zapTokenBalance,
    isPreLoading,
    preDepositeData,
    zapApiPool,
    setIsPreLoading,
    lower,
    upper,
    liquidity,
    zapCurrPriceData,
    setPreDepositeData,
    zapSlideValue
  } = useZapStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { setConfirmModalOpen } = useAddLiquidityStore()
  const zapSdk = useSdk('zap')
  const { liquiditySlippage, slippage } = useGlobalStore()
  const [uuid, setUuid] = useState<string>('')
  const [zapNotAvailable, setZapNotAvailable] = useState<boolean>(false)

  const { getTokenPrice } = useTokenPrice()

  const tokenAPrice = getTokenPrice(zapApiPool?.tokenA?.coin_type)
  const tokenBPrice = getTokenPrice(zapApiPool?.tokenB?.coin_type)

  const marketPrice = useMemo(() => {
    if (tokenAPrice && tokenBPrice) {
      return d(tokenAPrice.price).div(tokenBPrice.price).toString()
    }
    return undefined
  }, [tokenAPrice?.price, tokenBPrice?.price])

  const submitBtnInfo = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: type === 'Withdraw' ? 'Zap Out' : 'Zap In',
      disabled: false
    }

    // if (isPreLoading) {
    //   btnInfo.disabled = true
    //   return btnInfo
    // }

    // 判断钱包
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // 判断输入
    if (!zapAmount || (zapAmount && !+zapAmount)) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }

    //判断余额
    if (d(zapAmount).gt(zapTokenBalance?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(zapTokenBalance?.symbol, 10)} Balance`
      return btnInfo
    }

    if (d(zapAmountRate).gt(50000) || (d(zapAmountRate).gt(0) && d(zapAmountRate).lt(0.0001))) {
      btnInfo.disabled = true
    }

    return btnInfo
  }, [currentAccount?.address, zapAmount, currentZapToken?.coin_type, isPreLoading, type, zapTokenBalance?.balanceFormat])

  const handleZapIn = debounce(
    () => {
      if (!currentAccount) {
        onWalletModal(true)
      } else {
        setConfirmModalOpen(true)
      }
    },
    300,
    {
      leading: true,
      trailing: false
    }
  )

  const getSubmitBaseInfo = () => {
    const amountA = preDepositeData?.amount_a
    const amountB = preDepositeData?.amount_b
    const tokenA = zapApiPool?.tokenA
    const tokenB = zapApiPool?.tokenB
    const displayTokenA = zapApiPool?.displayTokenA
    const displayTokenB = zapApiPool?.displayTokenB
    const dispalyAmountA = bnToAmount(!zapApiPool?.isReverse ? amountA : amountB, !zapApiPool?.isReverse ? tokenA?.decimals : tokenB?.decimals)
    const dispalyAmountB = bnToAmount(!zapApiPool?.isReverse ? amountB : amountA, !zapApiPool?.isReverse ? tokenB?.decimals : tokenA?.decimals)

    return {
      amountA,
      amountB,
      tokenA,
      tokenB,
      displayTokenA,
      displayTokenB,
      dispalyAmountA,
      dispalyAmountB
    }
  }

  const getZapDepositToastInfo = () => {
    const { displayTokenA, displayTokenB, dispalyAmountA, dispalyAmountB } = getSubmitBaseInfo()
    // toDo: 是否为单边，可能还是需要用价格区间判断后得到fromTokenLock, toTokenLock, 暂直接用数量判断
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description =
          !dispalyAmountA && !dispalyAmountB
            ? `Add ${dispalyAmountA} ${displayTokenA?.symbol} and ${dispalyAmountB} ${displayTokenB?.symbol}`
            : !dispalyAmountA
              ? `Add ${dispalyAmountA} ${displayTokenA?.symbol}`
              : !dispalyAmountB
                ? `Add ${dispalyAmountB} ${displayTokenB?.symbol}`
                : 'Add Liquidity'

        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }

        if (status === 'success') {
          let amountAF = dispalyAmountA
          let amountBF = dispalyAmountB

          if (balanceChanges) {
            amountAF = getBalanceChanges(balanceChanges, displayTokenA) || dispalyAmountA
            amountBF = getBalanceChanges(balanceChanges, displayTokenB) || dispalyAmountB
          }
          const description =
            !dispalyAmountA && !dispalyAmountB
              ? `Add ${amountAF} ${displayTokenA?.symbol} and ${amountBF} ${displayTokenB?.symbol}`
              : !dispalyAmountA && dispalyAmountB
                ? `Add ${amountAF} ${displayTokenA?.symbol}`
                : !dispalyAmountB && dispalyAmountA
                  ? `Add ${amountBF} ${displayTokenB?.symbol}`
                  : 'Add Liquidity'

          info.toastDescriptionContent = description
          info.modalDescriptionText = description
          info.toastTitleText = 'Supplied Successful'
        }

        return info
      }
    }

    return toastInfo
  }

  const getZapDepositTx = async (lower?: any, upper?: any, isFarm?: boolean, posObj?: any) => {
    console.log('🚀 ~ getZapDepositTx ~ isFarm:', isFarm)
    const { tokenA, tokenB } = getSubmitBaseInfo()

    // transactionConfirmation(toastInfo)

    const params: any = {
      deposit_obj: preDepositeData,
      pool_id: zapApiPool?.poolAddress,
      coin_type_a: tokenA?.coin_type,
      coin_type_b: tokenB?.coin_type,
      tick_lower: lower,
      tick_upper: upper,
      slippage: Number(slippage),
      swap_slippage: Number(liquiditySlippage)
    }

    if (posObj) {
      params['pos_obj'] = posObj
    }

    if (isFarm) {
      params['farms_pool_id'] = zapApiPool?.farmsPoolAddress
    }

    console.log('getZapTx buildDepositPayload params: ', params)

    const tx = await zapSdk!.Zap.buildDepositPayload(params)
    console.log('🚀 ~ getZapTx ~ tx:', tx)

    // const res = await signAndExecuteTransaction(tx, toastInfo, {
    //   useDevInspect: true,
    //   useMev: mevProtect,
    //   showSuccessModal: false,
    //   useFastMode: transactionMode === 'Fast Mode',
    //   maxCapForGas,
    //   customGasPrice
    // })

    return tx
  }

  const getZapWithdrawToastInfo = (showDisplayTokenALock: boolean, showDisplayTokenBLock: boolean) => {
    const { displayTokenA, displayTokenB, dispalyAmountA, dispalyAmountB } = getSubmitBaseInfo()

    const toastInfo = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
        const description = `Withdraw ${formatNumberWithDown(zapAmount, currentZapToken?.decimals)} ${currentZapToken?.symbol}`

        const info: CommonTypeInfo = {
          modalDescriptionText: description,
          toastTitleText: description
        }

        if (status === 'success') {
          let amountAF = dispalyAmountA
          let amountBF = dispalyAmountB

          if (balanceChanges) {
            amountAF = getBalanceChanges(balanceChanges, displayTokenA) || dispalyAmountA
            amountBF = getBalanceChanges(balanceChanges, displayTokenB) || dispalyAmountB
          }

          info.toastDescriptionContent = ''
          info.modalDescriptionText = ''
          info.toastTitleText = 'Remove Liquidity Successful'
        }

        return info
      }
    }

    return toastInfo
  }

  const getZapWithdrawTx = async (
    posId: string,
    liquidity: string,
    lower: any,
    upper: any,
    collect_rewarder_types: any,
    isFarm?: boolean,
    isVestingPos?: boolean,
    isAutoClaim?: boolean
  ) => {
    const { tokenA, tokenB } = getSubmitBaseInfo()

    const isRemoveAll = preDepositeData?.burn_liquidity === liquidity

    const params: any = {
      withdraw_obj: preDepositeData,
      pool_id: zapApiPool?.poolAddress,
      pos_id: posId,
      close_pos: !isVestingPos && isRemoveAll ? true : false,
      collect_farms_rewarder: isAutoClaim || isRemoveAll ? true : false,
      // close_pos: preDepositeData?.burn_liquidity === liquidity ? true : false,
      collect_fee: isAutoClaim || isRemoveAll,
      collect_rewarder_types: isAutoClaim || isRemoveAll ? collect_rewarder_types : [],
      coin_type_a: tokenA?.coin_type,
      coin_type_b: tokenB?.coin_type,
      tick_lower: lower,
      tick_upper: upper,
      slippage: Number(slippage),
      swap_slippage: Number(liquiditySlippage)
    }

    if (isFarm) {
      params['farms_pool_id'] = zapApiPool?.farmsPoolAddress
    }
    console.log('🚀 ~ useZapSubmit ~ getZapWithdrawTx params:', params)

    const tx = await zapSdk!.Zap.buildWithdrawPayload(params)

    return {
      tx,
      isClose: preDepositeData?.burn_liquidity === liquidity
    }
  }

  const preZapParamsRef = useRef<any>({})
  const zapProgressRef = useRef<FreshProgressRef>(null)
  const zapUuidRef = useRef<string>('')

  useEffect(() => {
    preZapParamsRef.current = {
      currentZapToken,
      zapApiPool,
      zapAmount,
      currentSqrtPrice: zapCurrPriceData?.currentSqrtPrice,
      lower,
      upper,
      liquidity,
      liquiditySlippage,
      zapAmountRate,
      marketPrice
    }
  }, [
    currentZapToken?.coin_type,
    zapApiPool?.poolAddress,
    zapAmount,
    zapCurrPriceData?.currentSqrtPrice,
    lower,
    upper,
    liquidity,
    liquiditySlippage,
    zapAmountRate,
    marketPrice
  ])

  const isMinimumPrecision = useMemo(() => {
    if (currentZapToken?.decimals && d(zapAmount).mul(Math.pow(10, currentZapToken?.decimals)).eq(1)) return true
    return false
  }, [currentZapToken?.decimals, zapAmount])

  const preZapIn = async (uuid?: string) => {
    console.log('🚀 ~ preZapIn ~ preZapIn:', preZapIn)
    const { currentZapToken, zapApiPool, zapAmount, currentSqrtPrice, lower, upper, liquidity, liquiditySlippage, marketPrice } =
      preZapParamsRef.current

    setIsPreLoading(true)
    const isCoinA = currentZapToken?.coin_type === zapApiPool?.tokenA?.coin_type
    const mode = isCoinA ? 'OnlyCoinA' : 'OnlyCoinB'
    const coinAmount = fixDown(d(zapAmount).mul(Math.pow(10, currentZapToken?.decimals)).toString(), 0)
    console.log('🚀 ~ preZapIn ~ options.liquiditySlippage:', slippage, liquiditySlippage)
    const options = {
      pool_id: zapApiPool?.poolAddress,
      tick_lower: lower,
      tick_upper: upper,
      current_sqrt_price: currentSqrtPrice,
      slippage: Number(slippage),
      swap_slippage: Number(liquiditySlippage),
      // mark_price: marketPrice ? (isCoinA ? marketPrice : d(1).div(marketPrice).toString()) : undefined
      mark_price: marketPrice
    }
    console.log('🚀 ~ preZapIn ~ options123:', options)

    const modeOptions = {
      mode,
      coin_amount: coinAmount,
      coin_type_a: zapApiPool?.tokenA?.coin_type,
      coin_type_b: zapApiPool?.tokenB?.coin_type,
      coin_decimal_a: zapApiPool?.tokenA?.decimals,
      coin_decimal_b: zapApiPool?.tokenB?.decimals,
      max_remain_rate: 0.01
    }
    console.log('🚀 ~ preZapIn ~ modeOptions:', modeOptions)

    let res: any
    try {
      res = await zapSdk!.Zap.preCalculateDepositAmount(options, modeOptions as any)
      console.log('🚀 ~ preZapIn ~ res:', res)
    } catch (error) {
      console.log('🚀 ~ preZapIn ~ error:', error)
      setZapNotAvailable(true)
    }

    if (uuid === zapUuidRef.current) {
      setPreDepositeData(res)
    }
    setIsPreLoading(false)
  }

  const preZapOut = async (uuid?: string) => {
    setIsPreLoading(true)
    const { currentZapToken, zapApiPool, zapAmount, currentSqrtPrice, lower, upper, liquidity, liquiditySlippage } = preZapParamsRef.current

    const isCoinA = currentZapToken?.coin_type === zapApiPool?.tokenA?.coin_type
    const mode = isCoinA ? 'OnlyCoinA' : 'OnlyCoinB'
    const coinAmount = d(zapAmount).mul(Math.pow(10, currentZapToken?.decimals)).toString()
    const options = {
      mode,
      pool_id: zapApiPool?.poolAddress,
      tick_lower: lower,
      tick_upper: upper,
      current_sqrt_price: currentSqrtPrice,
      coin_type_a: zapApiPool?.tokenA?.coin_type,
      coin_type_b: zapApiPool?.tokenB?.coin_type,
      coin_decimal_a: zapApiPool?.tokenA?.decimals,
      coin_decimal_b: zapApiPool?.tokenB?.decimals
    } as WithdrawCalculationOptions

    if (d(zapAmount).gte(zapTokenBalance?.balanceFormat)) {
      options['burn_liquidity'] = liquidity
    } else {
      options['burn_liquidity'] = fixDown(d(liquidity).mul(d(zapSlideValue).div(100)).toString(), 0)
    }

    console.log('🚀 ~ preZapInRemove ~ options:', options)

    let res: any
    try {
      res = await zapSdk!.Zap.preCalculateWithdrawAmount(options)
      console.log('🚀 ~ preZapInRemove ~ res:', res)
    } catch (error) {
      console.log('🚀 ~ preZapOut ~ error:', error)
      setZapNotAvailable(true)
    }

    if (uuid === zapUuidRef.current) {
      setPreDepositeData(res)
    }
    setIsPreLoading(false)
  }

  const debouncedPreZapIn = useDebounceFunction(preZapIn, 300)
  const debouncedPreZapOut = useDebounceFunction(preZapOut, 300)

  useEffect(() => {
    // if (!Number(zapAmount) || d(zapAmountRate).gt(10000) || d(zapAmountRate).lt(0.0001)) {
    //   setPreDepositeData(undefined)
    //   return
    // }
    // if (type === 'Deposit') {
    //   setIsPreLoading(true)
    //   debouncedPreZapIn()
    // } else {
    //   if (zapSlideValue) {
    //     setIsPreLoading(true)
    //     debouncedPreZapOut()
    //   }
    // }
    reCalculateZapData()
  }, [zapAmount, currentZapToken?.coin_type, zapCurrPriceData?.currentSqrtPrice, lower, upper, zapSlideValue, zapAmountRate])

  const handleResetZapProgress = () => {
    zapProgressRef.current?.reset()
  }

  const reCalculateZapData = () => {
    setZapNotAvailable(false)
    const { zapAmount, zapAmountRate } = preZapParamsRef.current
    console.log('🚀 ~ reCalculateZapData ~ zapAmount:', zapAmount)
    console.log('🚀 ~ reCalculateZapData ~ zapAmountRate:', zapAmountRate)
    console.log('🚀 ~ reCalculateZapData ~ zapAmountRate:', zapAmountRate)
    if (!Number(zapAmount) || d(zapAmountRate).gt(50000) || d(zapAmountRate).lt(0.0001) || isMinimumPrecision) {
      const uuid = v4()
      zapUuidRef.current = uuid
      setPreDepositeData(undefined)
      setIsPreLoading(false)
      return
    }

    setIsPreLoading(true)
    const uuid = v4()
    zapUuidRef.current = uuid
    if (type == 'Deposit') {
      debouncedPreZapIn(uuid)
    } else {
      debouncedPreZapOut(uuid)
    }
  }

  useEffect(() => {
    handleResetZapProgress()
  }, [zapAmount, zapApiPool?.poolAddress, type])

  useEffect(() => {
    return () => {
      handleResetZapProgress()
      preZapParamsRef.current = null
    }
  }, [])

  return {
    btnText: submitBtnInfo.text,
    btnDisabled: submitBtnInfo.disabled,
    handleZapIn,
    isPreLoading,
    getZapDepositToastInfo,
    getZapDepositTx,
    getZapWithdrawToastInfo,
    getZapWithdrawTx,
    zapProgressRef,
    handleResetZapProgress,
    reCalculateZapData,
    isMinimumPrecision,
    zapNotAvailable
  }
}
