import { DLMMZapProps } from '@/components/liquidity/dlmm/deposit/type'
import useGlobalStore from '@/store/common/global'
import { getDlmmZapTipsError } from '@/utils/dlmm'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useSdk } from '@cetus/sdk-factory'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import { Decimal, formatNumber, formatNumberWithDown, fromDecimalsAmountFix, getBalanceChanges } from '@cetus/utils'
import { d, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinAmount, DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { CalculationWithdrawOptions, CalculationWithdrawResult, WithdrawMode, WithdrawOptions } from '@cetusprotocol/dlmm-zap-sdk'
import { useDebounceEffect } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useIsSupportZap from '../common/useIsSupportZap'
import useTransaction from '../common/useTransaction'

export function useDlmmZapOut(
  mode: WithdrawMode,
  position_id: string | undefined,
  collect_fee: boolean,
  isAllRemove: boolean,
  collect_rewarder_types: string[],
  user_bins: BinAmount[],
  lower_bin_id: number | undefined,
  upper_bin_id: number | undefined,
  tokenA: Token | undefined,
  tokenB: Token | undefined,
  dlmmContractPoolInfo: DlmmPool | null,
  is_reverse: boolean,
  activeBin?: BinAmount,
  current_price?: string,
  refreshForSubmitAfter?: (toastInfo: any, txLength: number, res?: any) => void,
  setSlideValue?: (value: string) => void
) {
  const dlmmZapSdk = useSdk('dlmmZap')
  const dlmmSdk = useSdk('dlmm')
  const [zapOutPreCalcLoading, setZapOutPreCalcLoading] = useState(false)
  const [zapSubmitLoading, setZapSubmitLoading] = useState(false)
  const [zapCoin, setZapCoin] = useState<Token | undefined>(undefined)
  const [zapCoinList, setZapCoinList] = useState<Token[]>([])
  const [zapAmount, setZapAmount] = useState<string>('')
  const preCalcUuidRef = useRef<string>('')
  const [zapOutPreCalcResult, setZapOutPreCalcResult] = useState<CalculationWithdrawResult | undefined>(undefined)
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction, batchSignAndExecuteTransaction, getTransactionStatus, transactionSuccess, handleError } = useTransaction()
  const { dlmmMevProtect, maxCapForGas, transactionMode, customGasPrice, liquiditySlippage } = useGlobalStore()
  const [calculateAvailableLoading, setCalculateAvailableLoading] = useState(false)
  const { getTokenAmountValue } = useTokenPrice()
  const { isSupportZap } = useIsSupportZap(tokenA?.coin_type, tokenB?.coin_type)
  const { getTokenPrice } = useTokenPrice()
  const tokenAPrice = getTokenPrice(tokenA?.coin_type)
  const tokenBPrice = getTokenPrice(tokenB?.coin_type)
  // 初始化
  useEffect(() => {
    if (tokenA && tokenB) {
      if (mode === 'Both') {
        setZapCoin(is_reverse ? tokenB : tokenA)
      } else if (mode === 'OnlyCoinA') {
        setZapCoin(tokenB)
      } else if (mode === 'OnlyCoinB') {
        setZapCoin(tokenA)
      }

      setZapCoinList([tokenA, tokenB])
      setZapAmount('')
      setSlideValue?.('0')
    }
  }, [tokenA?.coin_type, tokenB?.coin_type, mode, is_reverse])

  const handleChangeZapCoin = (coin: Token) => {
    setZapCoin(coin)
    setZapAmount('')
    setSlideValue?.('0')
  }

  const [zapTipsError, setZapTipsError] = useState<string | undefined>(undefined)

  const checkZapTipsError = (zapAmount: string) => {
    const zapAmountValue = getTokenAmountValue(zapCoin?.coin_type, zapAmount)
    const zapTipsError = getDlmmZapTipsError(zapAmountValue)
    setZapTipsError(zapTipsError)
    if (zapTipsError) {
      preCalcUuidRef.current = ''
      setZapOutPreCalcLoading(false)
      setZapOutPreCalcResult(undefined)
      return false
    }
    return true
  }

  const remove_bin_range = useMemo(() => {
    if (lower_bin_id && upper_bin_id && dlmmContractPoolInfo) {
      return user_bins.filter(
        bin => bin.bin_id >= lower_bin_id && bin.bin_id <= upper_bin_id && (mode !== 'Both' ? bin.bin_id !== dlmmContractPoolInfo.active_id : true)
      )
    }
    return user_bins
  }, [user_bins, lower_bin_id, upper_bin_id, mode, dlmmContractPoolInfo?.active_id])

  const handleChangeSlideValue = (value: string) => {
    const amount = d(value).mul(availableAmount).div(100).toFixed(zapCoin?.decimals)
    setZapAmount(amount)
    setSlideValue?.(value)
  }

  const handleChangeZapAmount = (value: string, isClickMax?: boolean, isHalfClickMax?: boolean) => {
    if (isClickMax) {
      setSlideValue?.('100')
      setZapAmount(availableAmount)
    } else if (isHalfClickMax) {
      setSlideValue?.('50')
      setZapAmount(d(availableAmount).div(2).toFixed(zapCoin?.decimals))
    } else {
      if (+availableAmount && +value) {
        setZapAmount(value)
        const rate = d(value).div(availableAmount).mul(100).toNumber()
        setSlideValue?.(formatNumber(rate, 2, true, Decimal.ROUND_DOWN))
      } else {
        setSlideValue?.('0')
        setZapAmount(value)
      }
    }
  }

  const availableAmount = useMemo(() => {
    if (dlmmContractPoolInfo && zapCoin && tokenA && tokenB) {
      setCalculateAvailableLoading(true)
      const { active_id, bin_step, coin_type_a } = dlmmContractPoolInfo
      let prices
      if (tokenAPrice && tokenBPrice) {
        prices = {
          coin_a_price: tokenAPrice.price,
          coin_b_price: tokenBPrice.price
        }
      }
      const available_obj = dlmmZapSdk!.Zap.calculateZapOutAvailableAmount({
        remove_bin_range,
        active_id,
        bin_step,
        coin_decimal_a: tokenA.decimals,
        coin_decimal_b: tokenB.decimals,
        prices,
        is_receive_coin_a: zapCoin.coin_type === coin_type_a,
        mode
      })
      setCalculateAvailableLoading(false)
      return fromDecimalsAmountFix(available_obj.available_amount, zapCoin.decimals)
    }
    return '0'
  }, [remove_bin_range, zapCoin?.coin_type, tokenA?.coin_type, tokenB?.coin_type, tokenAPrice, tokenBPrice])

  const handleZapOutPreCalc = async (zapAmount: string, uuid: string) => {
    if (tokenA && tokenB && dlmmContractPoolInfo && user_bins.length > 0 && zapCoin && lower_bin_id && upper_bin_id) {
      if (d(zapAmount).gte(availableAmount)) {
        setSlideValue?.('100')
        setZapAmount(availableAmount)
      }
      setZapOutPreCalcLoading(true)
      const { active_id, bin_step, coin_type_a, coin_type_b } = dlmmContractPoolInfo

      const remove_bin_range = user_bins.filter(
        bin => bin.bin_id >= lower_bin_id && bin.bin_id <= upper_bin_id && (mode !== 'Both' ? bin.bin_id !== active_id : true)
      )

      let prices
      if (tokenAPrice && tokenBPrice) {
        prices = {
          coin_a_price: tokenAPrice.price,
          coin_b_price: tokenBPrice.price
        }
      }

      const options: CalculationWithdrawOptions = {
        remove_bin_range,
        active_id,
        bin_step,
        expected_receive_amount: toDecimalsAmount(zapAmount, zapCoin.decimals).toString(),
        is_receive_coin_a: zapCoin.coin_type === coin_type_a,
        mode,
        coin_type_a,
        coin_type_b,
        coin_decimal_a: tokenA.decimals,
        coin_decimal_b: tokenB.decimals,
        prices
      }

      try {
        console.log('🚀 ~ handleZapOutPreCalc ~ options:', options)
        const res = await dlmmZapSdk!.Zap.preCalculateWithdrawAmount(options)
        console.log('🚀 ~ handleZapOutPreCalc ~ res:', res)
        if (uuid === preCalcUuidRef.current) {
          setZapOutPreCalcResult(res)
        }
      } catch (error) {
        console.log('🚀 ~ handleZapOutPreCalc ~ error:', error)
        if (uuid === preCalcUuidRef.current) {
          setZapOutPreCalcResult(undefined)
        }
      } finally {
        setZapOutPreCalcLoading(false)
      }
    } else {
      preCalcUuidRef.current = ''
      setZapAmount('')
      setZapOutPreCalcLoading(false)
      setZapOutPreCalcResult(undefined)
    }
  }

  useDebounceEffect(
    () => {
      if (zapAmount && d(zapAmount).gt(0) && tokenA && tokenB && dlmmContractPoolInfo && lower_bin_id && upper_bin_id && user_bins.length > 0) {
        if (!checkZapTipsError(zapAmount)) {
          return
        }
        const uuid = v4()
        preCalcUuidRef.current = uuid
        handleZapOutPreCalc(zapAmount, uuid)
      } else {
        preCalcUuidRef.current = ''
        setZapAmount('')
        setZapOutPreCalcLoading(false)
        setZapOutPreCalcResult(undefined)
      }
    },
    [
      zapAmount,
      dlmmContractPoolInfo?.active_id,
      activeBin?.liquidity,
      tokenA?.coin_type,
      tokenB?.coin_type,
      lower_bin_id,
      upper_bin_id,
      availableAmount
    ],
    { wait: 300 }
  )

  const reCalculateZapData = () => {
    if (zapAmount && availableAmount && d(zapAmount).gt(0) && tokenA && tokenB && dlmmContractPoolInfo) {
      if (!checkZapTipsError(zapAmount)) {
        return
      }
      const uuid = v4()
      preCalcUuidRef.current = uuid
      const rate = d(zapAmount).div(availableAmount).mul(100).toNumber()
      setSlideValue?.(formatNumber(rate, 2, true, Decimal.ROUND_DOWN))
      handleZapOutPreCalc(zapAmount, uuid)
    } else {
      setSlideValue?.('0')
    }
  }

  const handleZapSubmit = async () => {
    if (zapOutPreCalcResult && dlmmContractPoolInfo && position_id) {
      console.log('🚀 ~ handleZapSubmit ~ zapOutPreCalcResult:', zapOutPreCalcResult)
      let TrackDataParams = []
      let toastInfo: ToastType
      setZapSubmitLoading(true)
      const { active_id, bin_step, id, coin_type_a, coin_type_b } = dlmmContractPoolInfo
      try {
        const withdrawOptions: WithdrawOptions = {
          withdraw_obj: zapOutPreCalcResult,
          swap_slippage: Number(liquiditySlippage),
          pool_id: id,
          position_id,
          active_id,
          bin_step,
          slippage: Number(liquiditySlippage),
          reward_coins: collect_rewarder_types,
          collect_fee,
          remove_percent: Number(zapOutPreCalcResult.remove_percent),
          coin_type_a,
          coin_type_b,
          is_close_position: isAllRemove
        }

        console.log('🚀 ~ handleZapSubmit ~ withdrawOptions:', withdrawOptions)

        const tx = await dlmmZapSdk!.Zap.buildWithdrawPayload(withdrawOptions)
        TrackDataParams.push({ ...withdrawOptions })

        toastInfo = {
          getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
            const description = `Withdraw ${formatNumberWithDown(zapAmount, zapCoin?.decimals)} ${zapCoin?.symbol}`
            const info: CommonTypeInfo = {
              modalDescriptionText: description,
              toastTitleText: description
            }

            if (status === 'success') {
              let amountAF
              let amountBF

              if (balanceChanges) {
                amountAF = getBalanceChanges(balanceChanges, tokenA as Token)
                amountBF = getBalanceChanges(balanceChanges, tokenB as Token)
              }
              info.toastDescriptionContent = ''
              info.modalDescriptionText = ''
              info.toastTitleText = 'Remove Liquidity Successful'
            }

            return info
          }
        }
        transactionConfirmation(toastInfo)
        const res = await signAndExecuteTransaction(tx, toastInfo, {
          useMev: dlmmMevProtect,
          maxCapForGas,
          customGasPrice,
          trackData: {
            params: TrackDataParams,
            actionType: 'dlmm',
            action: 'dlmmAddLiquidity'
          }
        })
        if (refreshForSubmitAfter) {
          refreshForSubmitAfter(toastInfo, 1, res)
        }

        if (res) {
          handleChangeZapAmount('')
        }

        console.log('🚀 ~ handleZapSubmit ~ res:', res)
      } catch (error) {
        console.log('🚀 ~ handleZapSubmit ~ error:', error)
      } finally {
        setZapSubmitLoading(false)
      }
    }
  }

  return {
    supportZap: isSupportZap,
    zapCoin,
    zapCoinList,
    handleChangeZapCoin,
    zapAmount,
    handleChangeZapAmount,
    action: 'Withdraw',
    current_price,
    coinA: tokenA,
    coinB: tokenB,
    zapPreCalcLoading: zapOutPreCalcLoading,
    preWithdrawResult: zapOutPreCalcResult,
    reCalculateZapData,
    handleZapSubmit,
    zapSubmitLoading,
    availableAmount,
    calculateAvailableLoading,
    handleChangeSlideValue,
    zapTipsError
  } as DLMMZapProps
}
