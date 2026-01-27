import { DLMMZapProps } from '@/components/liquidity/dlmm/deposit/type'
import useGlobalStore from '@/store/common/global'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { getDlmmZapTipsError } from '@/utils/dlmm'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useSdk } from '@cetus/sdk-factory'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import { addComma, getBalanceChanges } from '@cetus/utils'
import { d, fromDecimalsAmount, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinAmount, DlmmPool, StrategyType } from '@cetusprotocol/dlmm-sdk'
import { BaseDepositOptions, CalculationDepositResult, DepositOptions, OnlyCoinDepositOptions } from '@cetusprotocol/dlmm-zap-sdk'
import { useDebounceEffect } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useIsSupportZap from '../common/useIsSupportZap'
import useTransaction from '../common/useTransaction'

export function useDlmmZapIn(
  isUseZapIn: boolean,
  strategy_type: StrategyType,
  lower_bin_id: number | undefined,
  upper_bin_id: number | undefined,
  tokenA: Token | undefined,
  tokenB: Token | undefined,
  dlmmContractPoolInfo: DlmmPool | null,
  is_reverse: boolean,
  activeBin?: BinAmount,
  current_price?: string,
  refreshForSubmitAfter?: (toastInfo: any, txLength: number, res?: any) => void,
  setPreCalcError?: (text?: 'amountTooSmall') => void,
  pos_obj?: {
    pos_id: string
    collect_fee: boolean
    collect_rewarder_types: string[]
  }
) {
  const dlmmZapSdk = useSdk('dlmmZap')
  const dlmmSdk = useSdk('dlmm')
  const [zapInPreCalcLoading, setZapInPreCalcLoading] = useState(false)
  const [zapInSubmitLoading, setZapInSubmitLoading] = useState(false)
  const [zapCoin, setZapCoin] = useState<Token | undefined>(undefined)
  const [zapCoinList, setZapCoinList] = useState<Token[]>([])
  const { balanceInfo: zapCoinBalanceInfo } = useGetTokenBalance(zapCoin)
  const [zapAmount, setZapAmount] = useState<string>('')
  const preCalcUuidRef = useRef<string>('')
  const [zapInPreCalcResult, setZapInPreCalcResult] = useState<CalculationDepositResult | undefined>(undefined)
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction, batchSignAndExecuteTransaction, getTransactionStatus, transactionSuccess, handleError } = useTransaction()
  const { dlmmMevProtect, maxCapForGas, transactionMode, customGasPrice, liquiditySlippage } = useGlobalStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { setPreCalcParams, fromTokenLock, toTokenLock } = useAddDlmmLiquidityStore()

  const { isSupportZap: supportZap } = useIsSupportZap(tokenA?.coin_type, tokenB?.coin_type)

  const isSupportZap = useMemo(() => {
    return supportZap && !fromTokenLock && !toTokenLock
  }, [supportZap, fromTokenLock, toTokenLock])

  // 初始化
  useEffect(() => {
    if (tokenA && tokenB) {
      setZapCoin(is_reverse ? tokenB : tokenA)
      setZapCoinList([tokenA, tokenB])
    }
  }, [tokenA?.coin_type, tokenB?.coin_type, is_reverse])

  const handleChangeZapCoin = (coin: Token) => {
    setZapCoin(coin)
    setZapAmount('')
    setPreCalcError?.(undefined)
  }

  const handleChangeZapAmount = (value: string) => {
    setZapAmount(value)
    if (!+value) {
      setPreCalcError?.(undefined)
      setZapTipsError(undefined)
    }
  }

  const handleZapInPreCalc = async (zapAmount: string, uuid: string) => {
    if (tokenA && tokenB && dlmmContractPoolInfo && lower_bin_id && upper_bin_id && zapCoin) {
      setZapInPreCalcLoading(true)
      setPreCalcError?.(undefined)
      let activeBinOfPool: BinAmount | undefined
      const { active_id, bin_step, id, bin_manager, coin_type_a } = dlmmContractPoolInfo
      if (activeBin) {
        activeBinOfPool = activeBin
      } else {
        activeBinOfPool = await dlmmSdk!.Position?.getActiveBinIfInRange(
          bin_manager.bin_manager_handle,
          lower_bin_id,
          upper_bin_id,
          active_id,
          bin_step,
          true
        )
      }
      const options: BaseDepositOptions = {
        pool_id: id,
        strategy_type,
        lower_bin_id,
        upper_bin_id,
        active_id,
        bin_step,
        active_bin_of_pool: activeBinOfPool
      }

      const modeOptions: OnlyCoinDepositOptions = {
        fix_amount_a: zapCoin.coin_type === coin_type_a,
        coin_amount: toDecimalsAmount(zapAmount, zapCoin.decimals).toString()
      }

      setPreCalcParams({
        zapIn: {
          options,
          modeOptions
        }
      })

      try {
        console.log('🚀 ~ handleZapInPreCalc ~ options:', options)
        console.log('🚀 ~ handleZapInPreCalc ~ modeOptions:', modeOptions)
        const res = await dlmmZapSdk!.Zap.preCalculateDepositAmount(options, modeOptions)
        console.log('🚀 ~ handleZapInPreCalc ~ res:', res)
        if (uuid === preCalcUuidRef.current) {
          setZapInPreCalcResult(res)
        }
      } catch (error) {
        console.log('🚀 ~ handleZapInPreCalc ~ error:', error)
        if (uuid === preCalcUuidRef.current) {
          if (String(error).includes('is less than 1')) {
            setPreCalcError?.('amountTooSmall')
          } else {
            setPreCalcError?.(undefined)
            setZapTipsError('Zap mode is not available.')
          }
          setZapInPreCalcResult(undefined)
        }
      } finally {
        setZapInPreCalcLoading(false)
      }
    } else {
      preCalcUuidRef.current = ''
      setZapInPreCalcLoading(false)
      setZapInPreCalcResult(undefined)
    }
  }
  const [zapTipsError, setZapTipsError] = useState<string | undefined>(undefined)

  const checkZapTipsError = (zapAmount: string) => {
    const zapAmountValue = getTokenAmountValue(zapCoin?.coin_type, zapAmount)
    const zapTipsError = getDlmmZapTipsError(zapAmountValue)
    setZapTipsError(zapTipsError)
    if (zapTipsError) {
      preCalcUuidRef.current = ''
      setZapInPreCalcLoading(false)
      setZapInPreCalcResult(undefined)
      return false
    }
    return true
  }

  useDebounceEffect(
    () => {
      if (!isUseZapIn) {
        return
      }
      if (zapAmount && d(zapAmount).gt(0) && tokenA && tokenB && dlmmContractPoolInfo && lower_bin_id && upper_bin_id) {
        if (!checkZapTipsError(zapAmount) || !isUseZapIn) {
          return
        }
        const uuid = v4()
        preCalcUuidRef.current = uuid
        handleZapInPreCalc(zapAmount, uuid)
      } else {
        setZapTipsError(undefined)
        preCalcUuidRef.current = ''
        setPreCalcError?.(undefined)
        setZapInPreCalcLoading(false)
        setZapInPreCalcResult(undefined)
      }
    },
    [
      zapAmount,
      dlmmContractPoolInfo?.active_id,
      activeBin?.liquidity,
      tokenA?.coin_type,
      tokenB?.coin_type,
      strategy_type,
      lower_bin_id,
      upper_bin_id,
      isUseZapIn
    ],
    { wait: 300 }
  )

  const reCalculateZapData = () => {
    if (zapAmount && d(zapAmount).gt(0) && tokenA && tokenB && dlmmContractPoolInfo) {
      if (!checkZapTipsError(zapAmount)) {
        return
      }
      const uuid = v4()
      preCalcUuidRef.current = uuid
      handleZapInPreCalc(zapAmount, uuid)
    }
  }

  const handleZapSubmit = async () => {
    if (zapInPreCalcResult && dlmmContractPoolInfo) {
      console.log('🚀 ~ handleZapSubmit ~ zapInPreCalcResult:', zapInPreCalcResult)
      const { bin_infos } = zapInPreCalcResult
      const bins = bin_infos.bins
      const lower_bin_id = bins[0].bin_id
      const upper_bin_id = bins[bins.length - 1].bin_id
      let TrackDataParams = []
      let toastInfo: ToastType
      setZapInSubmitLoading(true)
      const { active_id, bin_step, id } = dlmmContractPoolInfo
      try {
        const addOption: BaseDepositOptions = {
          pool_id: id,
          strategy_type,
          lower_bin_id,
          upper_bin_id,
          active_id,
          bin_step
        }
        const depositOptions: DepositOptions = {
          ...addOption,
          slippage: Number(liquiditySlippage),
          deposit_obj: zapInPreCalcResult,
          swap_slippage: Number(liquiditySlippage),
          pos_obj
        }

        console.log('🚀 ~ handleZapSubmit ~ depositOptions:', depositOptions)

        const tx = await dlmmZapSdk!.Zap.buildDepositPayload(depositOptions)
        TrackDataParams.push({ ...depositOptions })

        toastInfo = {
          getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>, res?: any) => {
            const description = 'Add Liquidity'
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

              if (res) {
                res.events.forEach((event: any) => {
                  if (event.type.indexOf('pool::AddLiquidityEvent') > -1 && tokenA && tokenB) {
                    amountAF = String(fromDecimalsAmount(event.parsedJson.total_amount_a, tokenA.decimals))
                    amountBF = String(fromDecimalsAmount(event.parsedJson.total_amount_b, tokenB.decimals))
                  }
                })
              }

              const description =
                amountAF && amountBF
                  ? !is_reverse
                    ? `Add ${addComma(amountAF)} ${tokenA?.symbol} and ${addComma(amountBF)} ${tokenB?.symbol}`
                    : `Add ${addComma(amountBF)} ${tokenB?.symbol} and ${addComma(amountAF)} ${tokenA?.symbol}`
                  : amountAF
                    ? `Add ${addComma(amountAF)} ${tokenA?.symbol}`
                    : amountBF
                      ? `Add ${addComma(amountBF)} ${tokenB?.symbol}`
                      : 'Add Liquidity'

              info.toastDescriptionContent = description
              info.modalDescriptionText = description
              info.toastTitleText = pos_obj !== undefined ? 'Supplied Successful' : 'Add Liquidity Successful'
            }

            return info
          }
        }
        transactionConfirmation(toastInfo)
        const res = await signAndExecuteTransaction(tx, toastInfo, {
          useMev: dlmmMevProtect,
          maxCapForGas,
          customGasPrice,
          showSuccessModal: pos_obj !== undefined,
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
        setZapInSubmitLoading(false)
      }
    }
  }

  return {
    supportZap: isSupportZap,
    handleZapInPreCalc,
    zapCoin,
    zapCoinList,
    handleChangeZapCoin,
    zapAmount,
    handleChangeZapAmount,
    action: 'Deposit',
    current_price,
    coinA: tokenA,
    coinB: tokenB,
    zapPreCalcLoading: zapInPreCalcLoading,
    preDepositResult: zapInPreCalcResult,
    reCalculateZapData,
    zapSubmitLoading: zapInSubmitLoading,
    handleZapSubmit,
    availableAmount: zapCoinBalanceInfo?.balanceFormat || '0',
    calculateAvailableLoading: false,
    zapTipsError
  } as DLMMZapProps
}
