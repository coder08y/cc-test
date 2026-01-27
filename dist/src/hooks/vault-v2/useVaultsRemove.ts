import { VaultsZapProps } from '@/components/vaults-v2/detail/VaultsZapRoute'
import useGlobalStore from '@/store/common/global'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import { MsafeTransactionSubType } from '@/types'
import { formatDescription, isDecimalWithZeros } from '@/utils'
import { useAccountBalance, useDebounceFunction } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import { formatNumber, formatNumberWithDown, fromDecimalsAmountFix, getBalanceChanges } from '@cetus/utils'
import { d, fromDecimalsAmount, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { CalculateRemoveAmountParams, InputType, WithdrawBothParams, WithdrawOneSideParams } from '@cetusprotocol/vaults-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { WithdrawCalculationOptions, WithdrawMode, WithdrawOptions } from 'haedal-vault-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useSlippageTolerance from '../common/useSlippageTolerance'
import useTransaction from '../common/useTransaction'
import { useFindBestRouting } from '../swap/useFindBestRouting'
import useCurrentVaultsFarm from '../vaults-farming/useCurrentVaultsFarm'
import useZap from '../zap/useZap'
import useGetPythTokenPrice from './pyth-price/useGetPythTokenPrice'
import useCurrentVaultDetail from './useCurrentVaultDetail'

export default function useVaultsRemove(
  vaultId: string,
  category: string,
  displayTokenA: Token,
  displayTokenB: Token,
  isReverse: boolean,
  assetAction: string,
  isCheckedZAP: boolean,
  currentVaultPosition: any,
  vaultsFarmingStaked: any
) {
  const { autoClaimFarmingReward } = useVaultsFarmingStore()
  const { currentVaultsFarm } = useCurrentVaultsFarm(vaultId)

  const { amountInputA, amountInputB, calculateResult, setAmountInputA, setAmountInputB, setCalculateResult, setVaultsZapProps, vaultsZapProps } =
    useVaultsActionStore()
  const { findBestRouters } = useFindBestRouting()
  const { liquiditySlippage, mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { volatileVaultsSdk, haedalFarmSdk } = usePeripherySDKStore()
  const vaultsSdk = useSdk('vaults')
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()
  const [preCalculateLoading, setPreCalculateLoading] = useState(false)
  const [fixAmountA, setFixAmountA] = useState(false)
  const { fetchAccountBalance } = useAccountBalance()
  const { getCurrentVaultByVaultId } = useCurrentVaultDetail()
  const { providers } = useWebConfigStore()

  const fixAmountARef = useRef(fixAmountA)
  useEffect(() => {
    fixAmountARef.current = fixAmountA
  }, [fixAmountA])
  const [isSlider, setIsSlider] = useState(false)
  const [uuid, setUuid] = useState('')

  const uuidRef = useRef(uuid)
  useEffect(() => {
    uuidRef.current = uuid
  }, [uuid])

  const amountInputARef = useRef(amountInputA)
  const amountInputBRef = useRef(amountInputB)
  useEffect(() => {
    amountInputARef.current = amountInputA
  }, [amountInputA])

  useEffect(() => {
    amountInputBRef.current = amountInputB
  }, [amountInputB])

  const tokenA = useMemo(() => {
    return isReverse ? displayTokenB : displayTokenA
  }, [isReverse, displayTokenA, displayTokenB])

  const tokenB = useMemo(() => {
    return isReverse ? displayTokenA : displayTokenB
  }, [isReverse, displayTokenA, displayTokenB])

  // 价值
  const amountValueA =
    category == 'haedal'
      ? getTokenAmountValueByPyth(displayTokenA?.coin_type, amountInputA || '0')
      : getTokenAmountValue(displayTokenA?.coin_type, amountInputA || '0')
  const amountValueB =
    category == 'haedal'
      ? getTokenAmountValueByPyth(displayTokenB?.coin_type, amountInputB || '0')
      : getTokenAmountValue(displayTokenB?.coin_type, amountInputB || '0')

  // 可用数量
  const [availableAmountA, setAvailableAmountA] = useState(isReverse ? currentVaultPosition?.amountB : currentVaultPosition?.amountA)
  const [availableAmountB, setAvailableAmountB] = useState(isReverse ? currentVaultPosition?.amountA : currentVaultPosition?.amountB)

  const [calculateAvailableLoading, setCalculateAvailableLoading] = useState<boolean>(false)

  useEffect(() => {
    console.log('🚀🚀🚀 ~ useVaultsRemove.ts:103 ~ useEffect ~ availableAmountA:', availableAmountA, availableAmountB)
  }, [availableAmountA, availableAmountB])

  // 计算可用资产
  const calculateAvailableAmount = async () => {
    // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:103 ~ calculateAvailableAmount ~ calculateAvailableAmount:')
    const { amountA, amountB, vaultId: currentVaultId } = currentVaultPosition
    if (currentVaultId != vaultId) return
    setCalculateAvailableLoading(false)
    if (assetAction === 'both') {
      setAvailableAmountA(isReverse ? amountB : amountA)
      setAvailableAmountB(isReverse ? amountA : amountB)
      return
    }

    const isOnlyReceiveCoinA = assetAction === tokenA?.coin_type
    const fromAmount = isOnlyReceiveCoinA ? amountB : amountA
    const targetAmount = isOnlyReceiveCoinA ? amountA : amountB
    if (category == 'haedal' || category === 'haevault_v2') {
      haedalCalculateAvailableAmount(fromAmount, targetAmount, isOnlyReceiveCoinA)
    } else {
      // 利用findRouter 转化为 单一资产
      lstCalculateAvailableAmount(fromAmount, targetAmount, isOnlyReceiveCoinA)
    }
  }

  const [preCalcError, setPreCalcError] = useState<string | undefined>(undefined)
  /** */
  const warpVaultsZapProps = (result: any, inputAmount: string) => {
    const balanceA = toDecimalsAmount(currentVaultPosition?.amountA || '0', tokenA.decimals)
    const balanceB = toDecimalsAmount(currentVaultPosition?.amountB || '0', tokenB.decimals)
    console.log('🚀🚀🚀 ~ useVaultsRemove.ts:145 ~ warpVaultsZapProps ~ result:', {
      result,
      category,
      balanceA,
      balanceB,
      currentVaultPosition,
      tokenA,
      tokenB
    })
    if (category === 'cetus') {
      const { amount_a, amount_b, swap_result } = result
      if (swap_result) {
        const { swap_in_amount, swap_out_amount, route_obj } = swap_result
        const zapProps: VaultsZapProps = {
          action: 'Withdraw',
          isZapCoinA: mode == 'OnlyCoinA',
          zapAmount: inputAmount,
          swap_in_amount: removePercent === 100 ? (mode == 'OnlyCoinA' ? balanceB : balanceA) : swap_in_amount,
          swap_out_amount,
          coin_amount_a: removePercent === 100 ? balanceA : amount_a,
          coin_amount_b: removePercent === 100 ? balanceB : amount_b,
          re_balance: route_obj,
          coinA: tokenA,
          coinB: tokenB,
          category,
          isReverse
        }
        setVaultsZapProps(zapProps)
      }
    }
    const { swap } = result
    if (swap) {
      const { swap_amount_in, swap_amount_out, remove_amount_a, remove_amount_b } = swap
      const zapProps: VaultsZapProps = {
        action: 'Withdraw',
        isZapCoinA: mode == 'OnlyCoinA',
        zapAmount: inputAmount,
        swap_in_amount: removePercent === 100 ? (mode == 'OnlyCoinA' ? balanceB : balanceA) : swap_amount_in,
        swap_out_amount: swap_amount_out,
        coin_amount_a: removePercent === 100 ? balanceA : remove_amount_a,
        coin_amount_b: removePercent === 100 ? balanceB : remove_amount_b,
        re_balance: {},
        coinA: tokenA,
        coinB: tokenB,
        category,
        isReverse
      }
      setVaultsZapProps(zapProps)
    }
  }

  // haedal 计算可用资产
  const haedalCalculateAvailableAmount = async (fromAmount: string, targetAmount: string, isOnlyReceiveCoinA: boolean) => {
    console.log(
      '🚀🚀🚀 ~ useVaultsRemove.ts:183 ~ haedalCalculateAvailableAmount ~ fromAmount, targetAmount:',
      fromAmount,
      targetAmount,
      isOnlyReceiveCoinA
    )
    if (d(fromAmount).gt(0) || d(targetAmount).gt(0)) {
      setCalculateAvailableLoading(true)
      // mode为合约方向
      const params: any = {
        pool_id: vaultId,
        mode,
        burn_lp_amount: currentVaultPosition?.balance,
        available_lp_amount: currentVaultPosition?.balance
      }
      try {
        const res =
          category === 'haevault_v2'
            ? await volatileVaultsSdk.VaultsV2.preCalculateWithdrawAmount(params)
            : await volatileVaultsSdk.Vaults.preCalculateWithdrawAmount(params)
        console.log('🚀🚀🚀 ~ useVaultsRemove.ts:127 ~ haedalCalculateAvailableAmount ~ res:', res)
        // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:110 ~ calculateAvailableAmount ~ res:', res)
        // mode 为合约方向
        if (mode == 'OnlyCoinA') {
          const amount = fromDecimalsAmountFix(res.receive_amount_a, tokenA?.decimals)
          if (isReverse) {
            setAvailableAmountB(amount)
          } else {
            setAvailableAmountA(amount)
          }
        } else {
          const amount = fromDecimalsAmountFix(res.receive_amount_b, tokenB?.decimals)
          if (isReverse) {
            setAvailableAmountA(amount)
          } else {
            setAvailableAmountB(amount)
          }
        }
        setCalculateAvailableLoading(false)
      } catch (error) {
        console.log('🚀🚀🚀 ~ useVaultsRemove.ts:145 ~ calculateAvailableAmount ~ error:', error)
      }
    } else {
      if (mode === 'OnlyCoinA' || mode === 'OnlyCoinB') {
        setAvailableAmountA('0')
        setAvailableAmountB('0')
      } else {
        if (isOnlyReceiveCoinA) {
          isReverse ? setAvailableAmountB(targetAmount) : setAvailableAmountA(targetAmount)
        } else {
          isReverse ? setAvailableAmountA(targetAmount) : setAvailableAmountB(targetAmount)
        }
      }
    }
    setCalculateAvailableLoading(false)
  }

  // cetus 计算可用资产
  const lstCalculateAvailableAmount = async (fromAmount: string, targetAmount: string, isOnlyReceiveCoinA: boolean) => {
    if (d(fromAmount).gt(0)) {
      setCalculateAvailableLoading(true)
      const fromToken = isOnlyReceiveCoinA ? tokenB! : tokenA!
      const toToken = isOnlyReceiveCoinA ? tokenA! : tokenB!

      findBestRouters({
        fromToken,
        toToken,
        amount: toDecimalsAmount(fromAmount, fromToken.decimals).toString(),
        providersKeys: providers,
        by_amount_in: true,
        uuid: v4()
      })
        .then(result => {
          if (result.toAmountUi) {
            targetAmount = d(targetAmount).add(result.toAmountUi).toString()
          }
          if (isOnlyReceiveCoinA) {
            setAvailableAmountA(targetAmount)
          } else {
            setAvailableAmountB(targetAmount)
          }
        })
        .finally(() => {
          setCalculateAvailableLoading(false)
        })
    } else {
      if (isOnlyReceiveCoinA) {
        setAvailableAmountA(targetAmount)
      } else {
        setAvailableAmountB(targetAmount)
      }
    }
  }

  // 总价值 100% = 硬顶 - 当前TVL 不是百分百 显示输入框A、B的值相加
  const inputTotalValue = useMemo(() => {
    return d(amountValueA || '0')
      .add(amountValueB || '0')
      .toString()
  }, [amountValueA, amountValueB])

  // ZAP模式下不能超过50000
  const zapNumGtError = useMemo(() => {
    if (isCheckedZAP) return d(inputTotalValue).gt(d(50000))
    return false
  }, [inputTotalValue, isCheckedZAP])

  // ZAP模式下不能小于0.0001
  const zapNumLtError = useMemo(() => {
    if (isCheckedZAP) return d(inputTotalValue).gt(0) && d(inputTotalValue).lt(d(0.0001))
    return false
  }, [inputTotalValue, isCheckedZAP])

  const [removePercent, setRemovePercent] = useState<number>(0)

  // 清空输入框
  const resetInputAmount = () => {
    setAmountInputA('')
    setAmountInputB('')
    setRemovePercent(0)
    setPreCalculateLoading(false)
    setCalculateResult(undefined)
    setVaultsZapProps(undefined)
    setUuid('')
  }

  // 预计算结束 给输入框赋值
  const wrapRes = (res: any, isFixedDisplayTokenA: boolean, isSlider: boolean, displayRatio: number) => {
    console.log('🚀🚀🚀 ~ useVaultsRemove.ts:96 ~ wrapRes ~ res:', res, isSlider, displayRatio)
    if (res) {
      const amountA = d(category == 'haedal' || category == 'haevault_v2' ? res.receive_amount_a : res.amount_a)
        .div(10 ** tokenA.decimals)
        .toString()
      const amountB = d(category == 'haedal' || category == 'haevault_v2' ? res.receive_amount_b : res.amount_b)
        .div(10 ** tokenB.decimals)
        .toString()
      const swapOutAmount = d(res.swap_result?.swap_out_amount || res.swap?.swap_amount_out || '0')
        .div(10 ** (isFixedDisplayTokenA ? displayTokenA.decimals : displayTokenB.decimals))
        .toString()
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:239 ~ wrapRes ~ swapOutAmount:', swapOutAmount, amountA, amountB)
      // if (displayRatio === 100 && assetAction == 'both') {
      //   setAvailableAmountA(isReverse ? amountB : amountA)
      //   setAvailableAmountB(isReverse ? amountA : amountB)
      // }
      // 输入模式 滑杆模式
      // 输入模式下 只需要set另一边
      // 滑杆模式下 需要set两边

      if (!isSlider) {
        warpVaultsZapProps(res, assetAction == displayTokenA?.coin_type ? amountB : amountA)
        if (assetAction !== 'both') return
        if (isFixedDisplayTokenA) {
          setAmountInputB(isReverse ? amountA : amountB)
        } else {
          setAmountInputA(isReverse ? amountB : amountA)
        }
      } else {
        if (assetAction == 'both') {
          setAmountInputA(isReverse ? amountB : amountA)
          setAmountInputB(isReverse ? amountA : amountB)
        } else {
          if (assetAction == displayTokenA?.coin_type) {
            // const amount = d(swapOutAmount)
            //   .add(category == 'cetus' ? amountA : isReverse ? amountB : amountA)
            //   .toString()
            if (displayRatio == 100) {
              // setAvailableAmountA(amount)
            }
            const amount = d(availableAmountA).mul(displayRatio).div(100).toString()
            console.log('🚀🚀🚀 ~ useVaultsRemove.ts:264 ~ wrapRes ~ amount:', amount)
            setAmountInputA(amount)
            warpVaultsZapProps(res, amount)
          } else {
            // const amount = d(swapOutAmount)
            //   .add(category == 'cetus' ? amountB : isReverse ? amountA : amountB)
            //   .toString()
            if (displayRatio == 100) {
              // setAvailableAmountB(amount)
            }
            const amount = d(availableAmountB).mul(displayRatio).div(100).toString()
            setAmountInputB(amount)
            warpVaultsZapProps(res, amount)
          }
          // if (isFixedDisplayTokenA) {
          //   setAmountInputA(isReverse ? amountB : amountA)
          // } else {
          //   setAmountInputB(isReverse ? amountA : amountB)
          // }
        }
      }
    }
  }
  /**
   * 预计算
   * @param amount
   * @param isPercentInput
   * @param fix_amount_a
   * @param uuid
   */
  const preCalculate = async (amount: string, is_ft_input: boolean, isFixedDisplayTokenA: boolean, uuid: string, removePercent?: number) => {
    if (tokenA && tokenB && vaultId) {
      // 非百分比输入，要判断余额是否足够
      if (!removePercent) {
        if (isFixedDisplayTokenA) {
          if (d(amount).gt(availableAmountA)) {
            setUuid('')
            setAmountInputB('')
            setRemovePercent(0)
            setCalculateResult(undefined)
            setVaultsZapProps(undefined)
            setPreCalculateLoading(false)
            return
          }
        } else {
          if (d(amount).gt(availableAmountB)) {
            setUuid('')
            setAmountInputA('')
            setCalculateResult(undefined)
            setVaultsZapProps(undefined)
            setPreCalculateLoading(false)
            setRemovePercent(0)
            return
          }
        }
      }

      if (+amountInputARef.current || +amountInputBRef.current || removePercent) {
        setPreCalculateLoading(true)
      }

      const fixToken = (isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA) ? tokenA : tokenB
      const inputAmount = toDecimalsAmount(amount, fixToken.decimals)
      const availableRemoveAmount = isFixedDisplayTokenA
        ? toDecimalsAmount(availableAmountA, fixToken.decimals)
        : toDecimalsAmount(availableAmountB, fixToken.decimals)
      const fixedCoinA = isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA
      const ratio = d(inputAmount).div(d(availableRemoveAmount))
      const removeLpAmount = formatNumberWithDown(ratio.mul(currentVaultPosition?.balance).toString(), 0, true)
      const displayRatio = Number(formatNumberWithDown(ratio.mul(100).toString(), 2))
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:324 ~ preCalculate ~ fixedCoinA:', fixedCoinA)
      setFixAmountA(fixedCoinA)
      if (category === 'haedal') {
        haedalPreCalculate(removeLpAmount as string, isFixedDisplayTokenA, uuid, displayRatio, false)
      } else if (category == 'haevault_v2') {
        haedalPreCalculate(removeLpAmount as string, isFixedDisplayTokenA, uuid, displayRatio, false, true)
      } else {
        lstPreCalculate(removeLpAmount as string, isFixedDisplayTokenA, fixedCoinA, uuid, displayRatio, false)
      }
    }
  }

  // haedal 预计算
  const haedalPreCalculate = async (
    removeLpAmount: string,
    isFixedDisplayTokenA: boolean,
    uuid: string,
    displayRatio: number,
    isSlider: boolean,
    isDlmm = false
  ) => {
    let params: WithdrawCalculationOptions

    if (assetAction == 'both') {
      if (displayRatio === 100) {
        setAmountInputA(availableAmountA)
        setAmountInputB(availableAmountB)
        setPreCalculateLoading(false)
        setCalculateResult({
          receive_amount_a: toDecimalsAmount(availableAmountA, tokenA.decimals),
          receive_amount_b: toDecimalsAmount(availableAmountB, tokenB.decimals),
          burn_ft_amount: currentVaultPosition.balance,
          mode: 'FixedOneSide'
        } as any)
        return
      }
      params = {
        pool_id: vaultId,
        mode: 'FixedOneSide',
        burn_lp_amount: String(removeLpAmount)
        // request_id: uuid
      }
    } else {
      const mode = assetAction == tokenA?.coin_type ? 'OnlyCoinA' : 'OnlyCoinB'
      params = {
        pool_id: vaultId,
        mode,
        burn_lp_amount: String(removeLpAmount)
        // request_id: uuid
      }
    }

    try {
      let res: any
      if (isDlmm) {
        res = await volatileVaultsSdk.VaultsV2.preCalculateWithdrawAmount(params)
      } else {
        res = await volatileVaultsSdk.Vaults.preCalculateWithdrawAmount(params)
      }
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:386 ~ haedalPreCalculate ~ res:', res, uuid, uuidRef.current)
      // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:202 ~ haedalPreCalculate ~ res:', res)
      // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:215 ~ haedalPreCalculate ~ uuidRef.current:', uuidRef.current, uuid)
      // if (uuidRef.current !== params.request_id) return

      // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:224 ~ haedalPreCalculate ~ res:', res)
      if (res.burn_lp_amount == '0') {
        setPreCalculateLoading(false)
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
        return
      }
      if (uuidRef.current !== uuid) return

      wrapRes(res, isFixedDisplayTokenA, isSlider, displayRatio)
      setCalculateResult({
        ...res,
        burn_ft_amount: res.burn_lp_amount
      } as any)
      setRemovePercent(displayRatio)
    } catch (error) {
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:388 ~ haedalPreCalculate ~ error:', error)
      setCalculateResult(undefined)
      setVaultsZapProps(undefined)
    } finally {
      setPreCalculateLoading(false)
    }
  }

  const lstPreCalculate = async (
    removeLpAmount: string,
    isFixedDisplayTokenA: boolean,
    fixedCoinA: boolean,
    uuid: string,
    displayRatio: number,
    isSlider: boolean
  ) => {
    const params: CalculateRemoveAmountParams = {
      vault_id: vaultId,
      fix_amount_a: fixedCoinA,
      input_amount: removeLpAmount,
      slippage: Number(liquiditySlippage),
      request_id: uuid,
      side: assetAction === 'both' ? InputType.Both : InputType.OneSide,
      is_ft_input: true,
      max_ft_amount: currentVaultPosition?.balance
    }
    console.log('🚀🚀🚀 ~ useVaultsRemove.ts:275 ~ lstPreCalculate ~ params:', params)

    try {
      const res = await vaultsSdk!.Vaults.calculateWithdrawAmount(params)
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:386 ~ res:', res, displayRatio)
      // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:202 ~ haedalPreCalculate ~ res:', res)
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:215 ~ haedalPreCalculate ~ uuidRef.current:', uuidRef.current, uuid)
      // if (uuidRef.current !== uuid) return

      // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:224 ~ haedalPreCalculate ~ res:', res)
      if (res.burn_ft_amount == '0') {
        setPreCalculateLoading(false)
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
        return
      }
      if (uuidRef.current !== uuid) return
      wrapRes(res, isFixedDisplayTokenA, isSlider, displayRatio)
      setCalculateResult(res)
      setRemovePercent(displayRatio)
    } catch (error) {
      // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:297 ~ lstPreCalculate ~ error:', error)
      setCalculateResult(undefined)
      setVaultsZapProps(undefined)
    } finally {
      setPreCalculateLoading(false)
    }
  }
  const debouncedPreCalculate = useDebounceFunction(preCalculate, 500)
  const debouncedPercentInputChange = useDebounceFunction(category == 'cetus' ? lstPreCalculate : haedalPreCalculate, 500)

  // 百分比输入
  const handlePercentInputChange = (value: number, isFixedDisplayTokenA: boolean) => {
    if (value == 0) {
      resetInputAmount()
      return
    }
    console.log('🚀🚀🚀 ~ useVaultsRemove.ts:218 ~ handlePercentInputChange ~ value:', value, category)
    setIsSlider(true)
    setPreCalculateLoading(true)
    setRemovePercent(value)
    const uuid = v4()
    console.log('🚀🚀🚀 ~ useVaultsRemove.ts:225 ~ handlePercentInputChange ~ uuid:', uuid)
    setUuid(uuid)
    const removeLpAmount = formatNumberWithDown(
      d(currentVaultPosition?.balance)
        .mul(value / 100)
        .toString(),
      0,
      true
    )
    console.log('🚀🚀🚀 ~ useVaultsRemove.ts:459 ~ handlePercentInputChange ~ removeLpAmount:', removeLpAmount, currentVaultPosition?.balance)

    const fixedCoinA = isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA
    setFixAmountA(fixedCoinA)

    if (d(removeLpAmount).isZero()) {
      setPreCalculateLoading(false)
      return
    }

    if (category === 'haedal') {
      debouncedPercentInputChange(removeLpAmount as string, isFixedDisplayTokenA, uuid, value, true)
    } else if (category == 'haevault_v2') {
      debouncedPercentInputChange(removeLpAmount as string, isFixedDisplayTokenA, uuid, value, true, true)
    } else {
      debouncedPercentInputChange(removeLpAmount as string, isFixedDisplayTokenA, fixedCoinA, uuid, value, true)
    }
  }

  const handleAmountInputChange = (amount: string, isFixedDisplayTokenA: boolean, isClickMax?: boolean, isClickHalf?: boolean) => {
    if (d(currentVaultPosition?.balance || 0).isZero()) {
      setPreCalculateLoading(false)
      return
    }

    // 移除全部，走LP 移除
    if (isClickHalf || isClickMax) {
      // 单token移除这里赋值
      if (assetAction !== 'both') {
        if (isFixedDisplayTokenA) {
          setAmountInputA(amount)
        } else {
          setAmountInputB(amount)
        }
      }
    }
    if (isClickMax) {
      handlePercentInputChange(100, isFixedDisplayTokenA)
      return
    }

    if (isClickHalf) {
      handlePercentInputChange(50, isFixedDisplayTokenA)
      return
    }
    setIsSlider(false)

    if (isFixedDisplayTokenA) {
      setAmountInputA(amount)
    } else {
      setAmountInputB(amount)
    }

    if (+amount) {
      const uuid = v4()
      setUuid(uuid)
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:515 ~ handleAmountInputChange ~ amount:', amount)
      debouncedPreCalculate(amount, false, isFixedDisplayTokenA, uuid)
    } else {
      // resetInputAmount()
      console.log('🚀🚀🚀 ~ useVaultsRemove.ts:516 ~ handleAmountInputChange ~ amount:', amount, !amount && isDecimalWithZeros(amount))
      if (!amount && isDecimalWithZeros(amount)) {
        resetInputAmount()
      } else {
        console.log('🚀🚀🚀 ~ useVaultsRemove.ts:522 ~ handleAmountInputChange ~ isFixedDisplayTokenA:', isFixedDisplayTokenA)
        isFixedDisplayTokenA ? setAmountInputB('') : setAmountInputA('')
        setRemovePercent(0)
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
        setUuid('')
      }
    }
  }

  const mode: WithdrawMode = useMemo(() => {
    if (isCheckedZAP) {
      return assetAction == 'both' ? 'FixedOneSide' : assetAction == tokenA?.coin_type ? 'OnlyCoinA' : 'OnlyCoinB'
    } else {
      return 'FixedOneSide'
    }
  }, [isCheckedZAP, assetAction, tokenA])

  // 重新计算
  const reCalculateResult = () => {
    const isDisplayTokenA = isReverse ? !fixAmountARef.current : fixAmountARef.current
    if (isSlider) {
      handlePercentInputChange(removePercent, isDisplayTokenA)
    } else {
      const amount = fixAmountARef.current
        ? isReverse
          ? amountInputBRef.current
          : amountInputARef.current
        : isReverse
          ? amountInputARef.current
          : amountInputBRef.current
      handleAmountInputChange(amount, isDisplayTokenA)
    }
  }

  const { signAndExecuteTransaction, transactionConfirmation, transactionRejected } = useTransaction()
  const [submitLoading, setSubmitLoading] = useState(false)
  const doRemoveAction = async () => {
    if (vaultId && calculateResult && currentVaultPosition?.balance) {
      setSubmitLoading(true)

      let param: WithdrawOptions | WithdrawBothParams | WithdrawOneSideParams
      if (category == 'haedal' || category === 'haevault_v2') {
        param = {
          pool_id: vaultId,
          burn_lp_amount: removePercent == 100 ? currentVaultPosition?.balance : calculateResult.burn_ft_amount,
          mode,
          slippage: Number(liquiditySlippage)
        }
      } else {
        if (assetAction === 'both') {
          param = {
            vault_id: vaultId,
            ft_amount: calculateResult?.burn_ft_amount as string,
            slippage: Number(liquiditySlippage)
          }
        } else {
          const fix_amount_a = assetAction === tokenA?.coin_type
          if (removePercent === 100) {
            param = {
              vault_id: vaultId,
              is_ft_input: true,
              input_amount: currentVaultPosition?.balance,
              slippage: Number(liquiditySlippage),
              max_ft_amount: currentVaultPosition?.balance,
              fix_amount_a
            }
          } else {
            const input_amount = toDecimalsAmount(fixAmountA ? amountInputA : amountInputB, 9)
            param = {
              vault_id: vaultId,
              is_ft_input: false,
              input_amount: input_amount.toString(),
              slippage: Number(liquiditySlippage),
              max_ft_amount: currentVaultPosition?.balance,
              fix_amount_a
            }
          }
        }
      }
      // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:567 ~ doRemoveAction ~ calculateResult:', calculateResult)

      console.log('🚀 ~ doRemoveAction ~ params:', param)

      // 构建 交易提示
      const toastInfo: ToastType = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
          const description =
            'Withdraw ' +
            [formatDescription(amountInputA, displayTokenA.symbol), formatDescription(amountInputB, displayTokenB.symbol)]
              .filter(Boolean)
              .join(' and ')

          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastDescriptionContent: description
          }

          if (status === 'success') {
            let amountA = amountInputA || '0'
            let amountB = amountInputB || '0'

            // if (res) {
            //   res.events.forEach(event => {
            // //     console.log('🚀🚀🚀 ~ useVaultsAdd.ts:367 ~ doAddAction ~ event:', event)
            //     if (event.type.indexOf('::pool::WithdrawEvent') > -1 && tokenA && tokenB) {
            //       amountA = String(fromDecimalsAmount(event.parsedJson.amount_a, tokenA.decimals))
            // //       console.log('🚀🚀🚀 ~ useVaultsAdd.ts:361 ~ doAddAction ~ amountA:', amountA)
            //       amountB = String(fromDecimalsAmount(event.parsedJson.amount_b, tokenB.decimals))
            // //       console.log('🚀🚀🚀 ~ useVaultsAdd.ts:363 ~ doAddAction ~ amountB:', amountB)
            //     }
            //   })
            // }

            console.log('🚀🚀🚀 ~ useVaultsRemove.ts:582 ~ doRemoveAction ~ balanceChanges:', balanceChanges, amountInputA, amountInputB)
            if (balanceChanges) {
              amountA = d(amountInputA || '0').gt(0) ? getBalanceChanges(balanceChanges, displayTokenA) || amountInputA : ''
              amountB = d(amountInputB || '0').gt(0) ? getBalanceChanges(balanceChanges, displayTokenB) || amountInputB : ''
            }
            // console.log('🚀🚀🚀 ~ useVaultsRemove.ts:584 ~ doRemoveAction ~ amount:', amountA, amountB)

            const descriptionList = [formatDescription(amountA, displayTokenA.symbol), formatDescription(amountB, displayTokenB.symbol)].filter(
              Boolean
            )

            const description =
              (descriptionList && descriptionList.length > 1 ? 'Removed ' : 'Withdraw ') +
              [formatDescription(amountA, displayTokenA?.symbol), formatDescription(amountB, displayTokenB?.symbol)].filter(Boolean).join(' and ')

            info.toastDescriptionContent = description
            info.modalDescriptionText = description
          }

          return info
        }
      }
      transactionConfirmation(toastInfo)

      try {
        let tx = new Transaction()
        let lpCoin
        if (category == 'haedal') {
          // 提取数量大于vault可用 需要先从farming提取
          if (d(calculateResult.burn_ft_amount).gt(currentVaultPosition?.vaultBalance)) {
            lpCoin = await haedalFarmSdk.Farms.buildRawWithdrawPayload(
              {
                poolId: currentVaultsFarm.poolId,
                stakeCoinType: currentVaultsFarm.stakeCoinType,
                stakeObjectId: vaultsFarmingStaked.stakeObjectId,
                amount: d(calculateResult.burn_ft_amount).sub(currentVaultPosition?.vaultBalance).toString(),
                claimReward: autoClaimFarmingReward,
                rewardConfigs: autoClaimFarmingReward ? currentVaultsFarm.rewardConfigs : undefined
              },
              tx
            )
            console.log('🚀🚀🚀 ~ useVaultsRemove.ts:672 ~ doRemoveAction ~ lpCoin:', lpCoin)
          } else {
            // 如果是vault farming需要收割奖励
            if (currentVaultsFarm?.poolId && autoClaimFarmingReward && d(vaultsFarmingStaked?.stakedBalance || '0').gt(0)) {
              await haedalFarmSdk.Farms.buildHarvestPayload(
                {
                  poolId: currentVaultsFarm.poolId,
                  stakeCoinType: currentVaultsFarm.stakeCoinType,
                  stakeObjectId: vaultsFarmingStaked.stakeObjectId,
                  rewardCoinType: vaultsFarmingStaked.rewardConfigs[0]?.rewardCoinType,
                  rewardBank: vaultsFarmingStaked.rewardConfigs[0]?.bank
                },
                tx
              )
            }
          }
          // vault 提取
          await volatileVaultsSdk.Vaults.buildWithdrawPayload(
            {
              ...param,
              burn_lp_amount: d(calculateResult.burn_ft_amount).gt(currentVaultPosition?.vaultBalance)
                ? currentVaultPosition?.vaultBalance
                : calculateResult.burn_ft_amount,
              extra_burn: lpCoin
                ? {
                    lp_burn_coin: lpCoin,
                    burn_lp_amount: d(calculateResult.burn_ft_amount).sub(currentVaultPosition?.vaultBalance).toString()
                  }
                : undefined
            },
            tx
          )
        } else if (category == 'haevault_v2') {
          console.log('🚀🚀🚀 ~ useVaultsRemove.ts:726 ~ doRemoveAction ~ param:', param)
          // 提取数量大于vault可用 需要先从farming提取
          if (d(calculateResult.burn_ft_amount).gt(currentVaultPosition?.vaultBalance)) {
            lpCoin = await haedalFarmSdk.Farms.buildRawWithdrawPayload(
              {
                poolId: currentVaultsFarm.poolId,
                stakeCoinType: currentVaultsFarm.stakeCoinType,
                stakeObjectId: vaultsFarmingStaked.stakeObjectId,
                amount: d(calculateResult.burn_ft_amount).sub(currentVaultPosition?.vaultBalance).toString(),
                claimReward: autoClaimFarmingReward,
                rewardConfigs: autoClaimFarmingReward ? currentVaultsFarm.rewardConfigs : undefined
              },
              tx
            )
            console.log('🚀🚀🚀 ~ useVaultsRemove.ts:672 ~ doRemoveAction ~ lpCoin:', lpCoin)
          } else {
            // 如果是vault farming需要收割奖励
            if (currentVaultsFarm?.poolId && autoClaimFarmingReward && d(vaultsFarmingStaked?.stakedBalance || '0').gt(0)) {
              await haedalFarmSdk.Farms.buildHarvestPayload(
                {
                  poolId: currentVaultsFarm.poolId,
                  stakeCoinType: currentVaultsFarm.stakeCoinType,
                  stakeObjectId: vaultsFarmingStaked.stakeObjectId,
                  rewardCoinType: vaultsFarmingStaked.rewardConfigs[0]?.rewardCoinType,
                  rewardBank: vaultsFarmingStaked.rewardConfigs[0]?.bank
                },
                tx
              )
            }
          }
          const result = {
            ...param,
            pool_id: vaultId,
            burn_lp_amount: d(calculateResult.burn_ft_amount).gt(currentVaultPosition?.vaultBalance)
              ? currentVaultPosition?.vaultBalance
              : calculateResult.burn_ft_amount,
            mode
          }

          // vault 提取
          await volatileVaultsSdk.VaultsV2.buildWithdrawPayload(
            {
              ...param,
              burn_lp_amount: d(calculateResult.burn_ft_amount).gt(currentVaultPosition?.vaultBalance)
                ? currentVaultPosition?.vaultBalance
                : calculateResult.burn_ft_amount,
              extra_burn: lpCoin
                ? {
                    lp_burn_coin: lpCoin,
                    burn_lp_amount: d(calculateResult.burn_ft_amount).sub(currentVaultPosition?.vaultBalance).toString()
                  }
                : undefined
            },
            tx
          )
        } else {
          await vaultsSdk!.Vaults.withdraw(param as WithdrawBothParams | WithdrawOneSideParams, tx)
        }
        const res = await signAndExecuteTransaction(tx, toastInfo, {
          useMev: mevProtect,
          txAction: 'signTransactionBlock',
          useFastMode: transactionMode === 'Fast Mode',
          maxCapForGas,
          customGasPrice,
          msafeParams: {
            action: MsafeTransactionSubType.AddVaultsPosition,
            txbParams: param
          }
        })

        if (res) {
          resetInputAmount()

          setTimeout(() => {
            fetchAccountBalance()
            getCurrentVaultByVaultId(vaultId, true)
          }, 3500)
          // autoRefresh()
        } else {
          reCalculateResult()
        }
        setSubmitLoading(false)
      } catch (error) {
        console.log('🚀🚀🚀 ~ useVaultsRemove.ts:675 ~ doRemoveAction ~ error:', error)
        setSubmitLoading(false)
        transactionRejected(toastInfo)
      }
    }
  }

  // 单边提示文案
  const showOnlySideTips = useMemo(() => {
    // if (category == 'haedal') {
    //   return undefined
    // }
    if (calculateResult && (calculateResult.swap_result || calculateResult.swap) && assetAction !== 'both' && tokenA && tokenB) {
      let amountIn = category == 'cetus' ? calculateResult.swap_result.swap_in_amount : calculateResult.swap.swap_amount_in
      let amountOut = category == 'cetus' ? calculateResult.swap_result.swap_out_amount : calculateResult.swap.swap_amount_out

      const fixedAmountA = category == 'cetus' ? fixAmountA : isReverse ? !fixAmountA : fixAmountA
      const amount = fixedAmountA ? amountInputA : amountInputB

      const fixToken = fixedAmountA ? displayTokenA : displayTokenB

      const targetToken = fixedAmountA ? displayTokenB : displayTokenA

      const swapInAmount = fromDecimalsAmountFix(amountIn, targetToken.decimals)

      const swapOutAmount = fromDecimalsAmountFix(
        d(amountOut)
          .mul(1 - Number(liquiditySlippage))
          .toString(),
        fixToken.decimals
      )

      return `To withdraw ${formatNumber(amount, fixToken?.decimals)} ${fixToken?.symbol}, ${formatNumber(swapInAmount, targetToken?.decimals)} ${targetToken?.symbol} in the pool will be traded for ${formatNumber(swapOutAmount, fixToken?.decimals)} ${fixToken?.symbol}`
    }
    return undefined
  }, [assetAction, calculateResult, amountInputA, amountInputB, fixAmountA, category])

  useEffect(() => {
    reCalculateResult()
  }, [availableAmountA, availableAmountB])

  const { currentAccount } = useAccountStore()

  useEffect(() => {
    resetInputAmount()
    setTimeout(() => {
      if (currentVaultPosition?.amountA && currentVaultPosition?.amountB) {
        calculateAvailableAmount()
      }
    }, 200)
  }, [isCheckedZAP, assetAction, currentAccount?.address])

  useEffect(() => {
    calculateAvailableAmount()
  }, [currentVaultPosition?.amountA, currentVaultPosition?.amountB, currentVaultPosition?.balance])

  useEffect(() => {
    return () => {
      uuidRef.current = ''
      setUuid('')
    }
  }, [])

  const { isRegularTokenPair } = useSlippageTolerance(displayTokenA, displayTokenB, liquiditySlippage, isCheckedZAP)

  const showRiskConfirm = useMemo(() => {
    if (vaultsZapProps == undefined) return false
    const amount = fromDecimalsAmount(
      vaultsZapProps?.swap_in_amount || '0',
      vaultsZapProps?.isZapCoinA ? vaultsZapProps?.coinB?.decimals : vaultsZapProps?.coinA?.decimals
    ).toString()
    const amountValue =
      category == 'haedal'
        ? getTokenAmountValueByPyth(vaultsZapProps?.isZapCoinA ? vaultsZapProps?.coinB?.coin_type : vaultsZapProps?.coinA?.coin_type, amount)
        : getTokenAmountValue(vaultsZapProps?.isZapCoinA ? vaultsZapProps?.coinB?.coin_type : vaultsZapProps?.coinA?.coin_type, amount)

    console.log(amount, amountValue, '----amountValue---test')
    return isRegularTokenPair && isCheckedZAP && d(amountValue || 0).gte(import.meta.env.VITE_LIMIT_RISK_AMOUNT) && d(liquiditySlippage).gt(0.02)
  }, [
    isRegularTokenPair,
    vaultsZapProps?.swap_in_amount,
    liquiditySlippage,
    isCheckedZAP,
    category,
    getTokenAmountValueByPyth,
    getTokenAmountValue,
    vaultsZapProps?.isZapCoinA,
    vaultsZapProps?.coinA?.coin_type,
    vaultsZapProps?.coinB?.coin_type
  ])

  const [knowsRisk, setKnowsRisk] = useState<boolean>(false)

  const handleKnowsRisk = (value: boolean) => {
    setKnowsRisk(value)
  }

  return {
    calculateAvailableLoading,
    availableAmountA,
    availableAmountB,
    amountInputA,
    amountInputB,
    amountValueA,
    amountValueB,
    zapNumGtError,
    zapNumLtError,
    handleAmountInputChange,
    handlePercentInputChange,
    debouncedPercentInputChange,
    removePercent,
    showOnlySideTips,
    preCalculateLoading,
    doRemoveAction,
    inputTotalValue,
    calculateResult,
    setIsSlider,
    resetInputAmount,
    calculateAvailableAmount,
    submitLoading,
    isSlider,
    fixAmountA,
    reCalculateResult,
    uuidRef,
    setUuid,
    setAmountInputA,
    setAmountInputB,
    knowsRisk,
    handleKnowsRisk,
    showRiskConfirm
  }
}
