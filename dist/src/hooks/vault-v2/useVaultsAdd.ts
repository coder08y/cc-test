import { VaultsZapProps } from '@/components/vaults-v2/detail/VaultsZapRoute'
import useGlobalStore from '@/store/common/global'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsPythPrice from '@/store/vaults-v2/useVaultsPythPrice'
import { MsafeTransactionSubType } from '@/types'
import { formatDescription, isDecimalWithZeros } from '@/utils'
import { useAccountBalance, useDebounceFunction } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import { convertScientificToDecimal, formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import { CoinAssist, d, fixCoinType, fromDecimalsAmount, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { CalculateAmountParams, InputType } from '@cetusprotocol/vaults-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { useDeepCompareEffect } from 'ahooks'
import {
  DepositCalculationOptions,
  DepositCalculationOptionsV2,
  DepositCalculationResultV2,
  DepositCalculationValueOptions,
  DepositMode
} from 'haedal-vault-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useSlippageTolerance from '../common/useSlippageTolerance'
import useTransaction from '../common/useTransaction'
import useGetVaultFarmingStaked from '../vaults-farming/useGetVaultFarmingStaked'
import useGetPythTokenPrice from './pyth-price/useGetPythTokenPrice'
import useCurrentVaultDetail from './useCurrentVaultDetail'
import useGetVaultsContract from './useGetVaultsContract'
import { useGetSuiStakeProtocol } from './useVaultsHelper'

export default function useVaultsAdd(
  vaultId: string,
  category: string,
  displayTokenA: Token,
  displayTokenB: Token,
  isReverse: boolean,
  assetAction: string,
  isCheckedZAP: boolean,
  quoteCoin?: Token,
  availableCapacityUSD?: string,
  availableCapacityWithQuoteCoin?: string,
  currentVaultsFarmsReward?: any,
  vaultsFarmingStaked?: any
) {
  const { balanceInfo: balanceInfoA } = useGetTokenBalance(displayTokenA)
  const { balanceInfo: balanceInfoB } = useGetTokenBalance(displayTokenB)
  const { amountInputA, amountInputB, setAmountInputA, setAmountInputB, setCalculateResult, calculateResult, vaultsZapProps, setVaultsZapProps } =
    useVaultsActionStore()
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()
  const { getTokenAmountValue } = useTokenPrice()
  const { volatileVaultsSdk, haedalFarmSdk } = usePeripherySDKStore()
  const vaultsSdk = useSdk('vaults')
  const { getCurrentVaultByVaultId } = useCurrentVaultDetail()
  const { fetchAccountBalance } = useAccountBalance()
  const [isSlider, setIsSlider] = useState(false)
  const { currentAccount } = useAccountStore()
  const { liquiditySlippage } = useGlobalStore()

  const { pythPriceMap } = useVaultsPythPrice()
  const { mevProtect, transactionMode, maxCapForGas, customGasPrice } = useGlobalStore()

  const { getVaultsFarmingStaked } = useGetVaultFarmingStaked()

  const { vaultsFarmObj, autoClaimStakeFarming } = useVaultsFarmingStore()
  const currentVaultsFarming = useMemo(() => {
    return vaultsFarmObj[vaultId]
  }, [vaultsFarmObj, vaultId])
  console.log('🚀🚀🚀 ~ useVaultsAdd.ts:63 ~ useVaultsAdd ~ currentVaultsFarming:', currentVaultsFarming)

  // 滑杆操作
  const [percentage, setPercentage] = useState(0)
  const percentageRef = useRef(0)
  useEffect(() => {
    percentageRef.current = percentage
  }, [percentage])

  // 计算输入框A的USD价值
  // cetus 直接使用markPrice汇率
  // haedal 不使用滑杆时 使用pyth价格 单Token质押使用滑杆时 直接使用池子当前Token剩余可注入的值 * 百分比
  const amountValueA = useMemo(() => {
    if (category == 'cetus') {
      return getTokenAmountValue(displayTokenA?.coin_type, amountInputA)
    } else {
      if (isCheckedZAP && isSlider && assetAction == displayTokenA?.coin_type) {
        return d(availableCapacityUSD || '0')
          .mul(percentage)
          .div(100)
          .toString()
      } else {
        return getTokenAmountValueByPyth(displayTokenA?.coin_type, amountInputA)
      }
    }
  }, [displayTokenA?.coin_type, amountInputA, pythPriceMap, category, isCheckedZAP, isSlider, percentage])

  // 计算输入框B的USD价值
  // cetus 直接使用markPrice汇率
  // haedal 不使用滑杆时 使用pyth价格 单Token质押使用滑杆时 直接使用池子当前Token剩余可注入的值 * 百分比
  const amountValueB = useMemo(() => {
    if (category == 'cetus') {
      return getTokenAmountValue(displayTokenB?.coin_type, amountInputB)
    } else {
      if (isCheckedZAP && isSlider && assetAction == displayTokenB?.coin_type) {
        return d(availableCapacityUSD || '0')
          .mul(percentage)
          .div(100)
          .toString()
      } else {
        return getTokenAmountValueByPyth(displayTokenB?.coin_type, amountInputB)
      }
    }
  }, [displayTokenA?.coin_type, amountInputB, pythPriceMap, category, isCheckedZAP, isSlider, percentage])

  // 合约层面的tokenA、tokenB
  const tokenA = useMemo(() => {
    return isReverse ? displayTokenB : displayTokenA
  }, [isReverse, displayTokenA, displayTokenB])

  const tokenB = useMemo(() => {
    return isReverse ? displayTokenA : displayTokenB
  }, [isReverse, displayTokenA, displayTokenB])

  // 预计算相关
  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useRef<string>('')
  useEffect(() => {
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:122 ~ useVaultsAdd ~ uuid:', uuid)
    uuidRef.current = uuid
  }, [uuid])

  // 页面固定哪一边
  const [isFixedDisplayTokenA, setIsFixedDisplayTokenA] = useState(false)
  const isFixedDisplayTokenARef = useRef(false)
  useEffect(() => {
    isFixedDisplayTokenARef.current = isFixedDisplayTokenA
  }, [isFixedDisplayTokenA])

  // 合约固定哪一边
  const [fixAmountA, setFixAmountA] = useState(false)
  const [preCalculateLoading, setPreCalculateLoading] = useState(false)
  const [calculateLpLoading, setCalculateLpLoading] = useState(false)

  const amountInputARef = useRef<string>('')
  const amountInputBRef = useRef<string>('')
  useEffect(() => {
    amountInputARef.current = amountInputA
  }, [amountInputA])

  useEffect(() => {
    amountInputBRef.current = amountInputB
  }, [amountInputB])

  // 预计算模式
  const mode = useMemo(() => {
    if (isCheckedZAP) {
      return assetAction == 'both' ? 'FlexibleBoth' : assetAction == tokenA?.coin_type ? 'OnlyCoinA' : 'OnlyCoinB'
    } else {
      return category == 'haevault_v2' ? 'FixedOneSide' : 'FixedOneSide'
    }
  }, [isCheckedZAP, assetAction, tokenA, category])

  // 预计算结束 给输入框赋值
  const wrapRes = (res: any, isFixedDisplayTokenA: boolean, isSlider = false) => {
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:141 ~ wrapRes ~ res:', res)
    if (res) {
      let coinOriginalAmount = res.re_balance ? res.re_balance.coin_amount : undefined
      let mode = res.re_balance ? res.re_balance.mode : undefined
      if (category == 'haedal' || category == 'haevault_v2') {
        let amountA = d(res.deposit_amount_a)
          .div(10 ** tokenA.decimals)
          .toString()
        console.log('🚀🚀🚀 ~ useVaultsAdd.ts:162 ~ wrapRes ~ amountA:', amountA)
        let amountB = d(res.deposit_amount_b)
          .div(10 ** tokenB.decimals)
          .toString()

        if (coinOriginalAmount) {
          if (mode == 'OnlyCoinA') {
            amountA = d(coinOriginalAmount)
              .div(10 ** tokenA.decimals)
              .toString()
            amountB = ''
          } else if (mode == 'OnlyCoinB') {
            amountB = d(coinOriginalAmount)
              .div(10 ** tokenB.decimals)
              .toString()
            amountA = ''
          }
        }

        if (isSlider) {
          if (assetAction == 'both' || assetAction == displayTokenA?.coin_type) {
            setAmountInputA(isReverse ? amountB : amountA)
          }
          if (assetAction == 'both' || assetAction == displayTokenB?.coin_type) {
            setAmountInputB(isReverse ? amountA : amountB)
          }
        } else {
          // 页面固定某一边 只需要set另一边
          if (isFixedDisplayTokenA) {
            setAmountInputB(isReverse ? amountA : amountB)
          } else {
            setAmountInputA(isReverse ? amountB : amountA)
          }
        }
      } else {
        const amountA = d(res.amount_a)
          .div(10 ** tokenA.decimals)
          .toString()
        const amountB = d(res.amount_b)
          .div(10 ** tokenB.decimals)
          .toString()
        // 页面固定某一边 只需要set另一边
        if (isFixedDisplayTokenA) {
          setAmountInputB(isReverse ? amountA : amountB)
        } else {
          setAmountInputA(isReverse ? amountB : amountA)
        }
      }
    }
  }

  // 预计算
  const preCalculate = async (amount: string, isFixedDisplayTokenA: boolean, otherAmount: string, uuid: string, isAutoCalculate = false) => {
    try {
      setCalculateLpLoading(!isAutoCalculate)
      const fixToken = (isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA) ? tokenA : tokenB
      const fixOtherToken = (isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA) ? tokenB : tokenA
      const inputAmount = toDecimalsAmount(amount, fixToken.decimals)
      const otherInputAmount = toDecimalsAmount(otherAmount || 0, fixOtherToken.decimals)
      const fixedCoinA = isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA

      setFixAmountA(fixedCoinA)
      if (category == 'haedal') {
        haedalPreCalculate(uuid, inputAmount, isFixedDisplayTokenA, otherInputAmount, fixedCoinA)
      } else if (category == 'haevault_v2') {
        haedalPreCalculate(uuid, inputAmount, isFixedDisplayTokenA, otherInputAmount, fixedCoinA, true)
      } else {
        lstPreCalculate(uuid, inputAmount, isFixedDisplayTokenA, fixedCoinA)
      }
    } catch (error) {
      setCalculateLpLoading(false)
    }
  }

  const [preCalcError, setPreCalcError] = useState<string | undefined>(undefined)

  const warpVaultsZapProps = (result: any) => {
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:359 ~ haedalPreCalculate ~ result:', result)
    if (category == 'cetus') {
      const { amount_a: deposit_amount_a, amount_b: deposit_amount_b, original_input_amount, swap_result } = result
      const { swap_in_amount, swap_out_amount } = swap_result
      const zapProps: VaultsZapProps = {
        action: 'Deposit',
        isZapCoinA: mode == 'OnlyCoinA',
        zapAmount: original_input_amount,
        swap_in_amount,
        swap_out_amount,
        coin_amount_a: deposit_amount_a,
        coin_amount_b: deposit_amount_b,
        re_balance: swap_result!,
        coinA: tokenA,
        coinB: tokenB,
        category,
        isReverse
      }
      console.log('🚀🚀🚀 ~ useVaultsAdd.ts:359 ~ haedalPreCalculate ~ zapProps:', zapProps)
      setVaultsZapProps(zapProps)
      return
    }
    const { deposit_amount_a, deposit_amount_b, re_balance } = result
    if (re_balance) {
      const { swap_in_amount, swap_out_amount } = re_balance.swap_result
      const inputAmount =
        mode == 'OnlyCoinA'
          ? fromDecimalsAmount(re_balance.coin_amount, tokenA.decimals)
          : fromDecimalsAmount(re_balance.coin_amount, tokenB.decimals)
      re_balance.mode = mode
      const zapProps: VaultsZapProps = {
        action: 'Deposit',
        isZapCoinA: mode == 'OnlyCoinA',
        zapAmount: inputAmount,
        swap_in_amount,
        swap_out_amount,
        coin_amount_a: deposit_amount_a,
        coin_amount_b: deposit_amount_b,
        re_balance: re_balance!,
        coinA: tokenA,
        coinB: tokenB,
        category,
        isReverse
      }
      console.log('🚀🚀🚀 ~ useVaultsAdd.ts:359 ~ haedalPreCalculate ~ zapProps:', zapProps)
      setVaultsZapProps(zapProps)
    }
  }

  // headal预计算
  const haedalPreCalculate = async (
    uuid: string,
    inputAmount: string,
    isFixedDisplayTokenA: boolean,
    otherInputAmount: string,
    fixedCoinA: boolean,
    isDlmm = false
  ) => {
    let params: DepositCalculationOptionsV2 | DepositCalculationOptions = {
      uuid,
      mode: 'FixedOneSide',
      fixed_amount: '0',
      fixed_coin_a: fixedCoinA,
      pool_id: vaultId,
      coin_decimals_a: tokenA?.decimals,
      coin_decimals_b: tokenB?.decimals
    }
    // 开启ZAP模式
    if (isCheckedZAP) {
      if (mode === 'OnlyCoinA') {
        params = {
          uuid,
          mode,
          pool_id: vaultId,
          coin_amount_a: inputAmount,
          re_balance: true,
          coin_decimals_a: tokenA?.decimals,
          coin_decimals_b: tokenB?.decimals
        }
      }
      if (mode === 'OnlyCoinB') {
        params = {
          uuid,
          mode,
          pool_id: vaultId,
          coin_amount_b: inputAmount,
          re_balance: true,
          coin_decimals_a: tokenA?.decimals,
          coin_decimals_b: tokenB?.decimals
        }
      }
      if (mode == 'FlexibleBoth') {
        params = {
          uuid,
          mode,
          pool_id: vaultId,
          coin_amount_a: fixedCoinA ? inputAmount : otherInputAmount,
          coin_amount_b: fixedCoinA ? otherInputAmount : inputAmount,
          coin_decimals_a: tokenA?.decimals,
          coin_decimals_b: tokenB?.decimals
        }
      }
    } else {
      params = {
        uuid,
        mode: 'FixedOneSide',
        fixed_amount: inputAmount,
        fixed_coin_a: fixedCoinA,
        pool_id: vaultId,
        coin_decimals_a: tokenA?.decimals,
        coin_decimals_b: tokenB?.decimals
      }
    }
    let res: any
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:273 ~ haedalPreCalculate ~ isDlmm:', {
      params,
      isDlmm
    })
    if (isDlmm) {
      try {
        setPreCalcError(undefined)
        res = await volatileVaultsSdk.VaultsV2.preCalculateDepositAmount(params, {
          onSuccess: receive_lp_amount => {
            console.log(
              '🚀🚀🚀 ~ useVaultsAdd.ts:lb ~ haedalPreCalculate ~ receive_lp_amount:',
              receive_lp_amount,
              res,
              mode,
              uuid,
              uuidRef.current,
              amountInputARef.current,
              amountInputBRef.current
            )

            const isAmountInputValid =
              mode == 'FixedOneSide' || mode == 'OnlyCoinA' || mode == 'OnlyCoinB'
                ? amountInputARef.current || amountInputBRef.current
                : amountInputARef.current && amountInputBRef.current

            if (!isAmountInputValid) {
              setCalculateResult(undefined)
              setVaultsZapProps(undefined)
              setCalculateLpLoading(false)
              return
            }

            if (uuid == uuidRef.current && isAmountInputValid) {
              if (receive_lp_amount == '0') {
                // setPreCalcError('amountTooSmall')
                setCalculateResult(undefined)
                setVaultsZapProps(undefined)
              } else {
                setCalculateResult({
                  amount_a: isReverse ? res.deposit_amount_b : res.deposit_amount_a,
                  amount_b: isReverse ? res.deposit_amount_a : res.deposit_amount_b,
                  ft_amount: receive_lp_amount
                })
              }
              setTimeout(() => {
                setCalculateLpLoading(false)
              }, 500)
            }
          },
          onError: (error, uuid) => {
            console.log('🚀🚀🚀 ~ useVaultsAdd.ts:lb ~ haedalPreCalculate ~ error:', error)
            if (uuid === uuidRef.current) {
              setCalculateLpLoading(false)
              setCalculateResult(undefined)
              setVaultsZapProps(undefined)
            }
          }
        })
        const result = res as DepositCalculationResultV2
        if ((mode == 'OnlyCoinA' || mode == 'OnlyCoinB') && uuid == uuidRef.current) {
          warpVaultsZapProps(result)
        }
      } catch (error) {
        if (uuid === uuidRef.current) {
          setCalculateResult(undefined)
          setPreCalcError(undefined)
          setCalculateLpLoading(false)
          setVaultsZapProps(undefined)
        }

        console.log('🚀🚀🚀 ~ useVaultsAdd.ts:302 ~ haedalPreCalculate ~ error:', error)
        if (String(error).includes('less than')) {
          setPreCalcError('amountTooSmall')
        }
      }
    } else {
      res = await volatileVaultsSdk.Vaults.preCalculateDepositAmount(params, {
        onSuccess: receive_lp_amount => {
          console.log('🚀🚀🚀 ~ useVaultsAdd.ts:301 ~ haedalPreCalculate ~ receive_lp_amount:', receive_lp_amount, res)
          if (
            uuid == uuidRef.current &&
            (mode == 'FixedOneSide' || mode == 'OnlyCoinA' || mode == 'OnlyCoinB'
              ? amountInputARef.current || amountInputBRef.current
              : amountInputARef.current && amountInputBRef.current)
          ) {
            setCalculateResult({
              amount_a: isReverse ? res.deposit_amount_b : res.deposit_amount_a,
              amount_b: isReverse ? res.deposit_amount_a : res.deposit_amount_b,
              ft_amount: receive_lp_amount
            })
            setCalculateLpLoading(false)
          } else {
            setCalculateLpLoading(false)
            setCalculateResult(undefined)
            setVaultsZapProps(undefined)
          }
        },
        onError: (error, uuid) => {
          console.log('🚀🚀🚀 ~ useVaultsAdd.ts:321 ~ haedalPreCalculate ~ error:', error)
          setCalculateLpLoading(false)
        }
      })

      if ((mode == 'OnlyCoinA' || mode == 'OnlyCoinB') && uuid == uuidRef.current) {
        warpVaultsZapProps(res)
      }
    }
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:301 ~ res:', res, mode)
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:327 ~ haedalPreCalculate ~ uuidRef.current:', uuidRef?.current, uuid, mode)
    if (uuidRef.current !== uuid) return
    // setPreCalculateLoading(false)
    if (mode == 'FixedOneSide' && uuid == uuidRef.current) {
      wrapRes(res, isFixedDisplayTokenA)
    }
  }

  useDeepCompareEffect(() => {
    if (availableCapacityUSD && calculateResult) {
      console.log('🚀🚀🚀 ~ useVaultsAdd.ts:454 ~ useDeepCompareEffect ~ calculateResult:', calculateResult)
      calculateDepositRatioWithAvailableCapacity(
        isReverse ? calculateResult.amount_b : calculateResult.amount_a,
        isReverse ? calculateResult.amount_a : calculateResult.amount_b
      )
    }
  }, [availableCapacityUSD, calculateResult])

  // cetus预计算
  const lstPreCalculate = async (uuid: string, inputAmount: string, isFixedDisplayTokenA: boolean, fixedCoinA: boolean) => {
    if (tokenA && tokenB && vaultId) {
      try {
        setCalculateLpLoading(true)
        const params: CalculateAmountParams = {
          vault_id: vaultId,
          fix_amount_a: fixedCoinA,
          input_amount: inputAmount,
          slippage: Number(liquiditySlippage),
          request_id: uuid,
          side: assetAction === 'both' ? InputType.Both : InputType.OneSide
        }
        const res = await vaultsSdk!.Vaults.calculateDepositAmount(params, true, true)
        console.log('🚀🚀🚀 ~ useVaultsAdd.ts:204 ~ lstPreCalculate ~ res:', {
          res,
          uuid,
          uuidRef: uuidRef.current
        })

        if (uuidRef.current === uuid) {
          if (!isCheckedZAP) {
            wrapRes(res, isFixedDisplayTokenA)
          }
          setCalculateResult(res)
          setCalculateLpLoading(false)

          if (mode == 'OnlyCoinA' || mode == 'OnlyCoinB') {
            warpVaultsZapProps(res)
          }
        }
      } catch (error) {
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
      } finally {
        setCalculateLpLoading(false)
      }
    }
  }

  // 预计算防抖
  const debouncedPreCalculate = useDebounceFunction(preCalculate, 500)

  // 输入框A、B值变化
  const handleAmountInputChange = async (amount: string, isFixedDisplayTokenA: boolean, otherAmount: string) => {
    setCalculateLpLoading(false)
    if (isFixedDisplayTokenA) {
      setAmountInputA(amount)
    } else {
      setAmountInputB(amount)
    }
    if (availableCapacityUSD == '0' && (category == 'haedal' || category == 'haevault_v2')) return
    setIsFixedDisplayTokenA(isFixedDisplayTokenA)
    if (!amount && !otherAmount) {
      resetInputAmount()
      return
    }

    if (assetAction == 'both' && isCheckedZAP && (!+amount || !+otherAmount)) {
      setCalculateLpLoading(false)
      setCalculateResult(undefined)
      setVaultsZapProps(undefined)
      setPercentage(0)
      return
    }

    // ZAP模式下大于10000 或者小于0.0001不进行预计算
    const amountVaule =
      category == 'haedal'
        ? getTokenAmountValueByPyth(isFixedDisplayTokenA ? displayTokenA.coin_type : displayTokenB.coin_type, amount)
        : getTokenAmountValue(isFixedDisplayTokenA ? displayTokenA.coin_type : displayTokenB.coin_type, amount)

    const otherAmountValue =
      category == 'haedal'
        ? getTokenAmountValueByPyth(isFixedDisplayTokenA ? displayTokenB.coin_type : displayTokenA.coin_type, otherAmount)
        : getTokenAmountValue(isFixedDisplayTokenA ? displayTokenB.coin_type : displayTokenA.coin_type, otherAmount)
    const totalValue = d(amountVaule).add(d(otherAmountValue))
    if (availableCapacityUSD && d(totalValue).gt(availableCapacityUSD)) {
      setCalculateLpLoading(false)
      setCalculateResult(undefined)
      setVaultsZapProps(undefined)
      setPercentage(100)
      return
    }

    if (isCheckedZAP && (totalValue.gt(10000) || (totalValue.gt(0) && totalValue.lt(0.0001)))) {
      // setPercentage(0)
      return
    }

    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:436 ~ handleAmountInputChange ~ +amount:', +amount)
    if (+amount) {
      if (!verifyZapAmountValue(amount, isFixedDisplayTokenA ? displayTokenA : displayTokenB, false)) {
        return
      }
      const uuid = v4()
      setUuid(uuid)
      uuidRef.current = uuid // 立即同步更新 ref
      debouncedPreCalculate(amount, isFixedDisplayTokenA, otherAmount, uuid)
    } else {
      if (!isCheckedZAP && (!amount || +amount == 0) && isDecimalWithZeros(amount)) {
        resetInputAmount()
      } else {
        isFixedDisplayTokenA ? setAmountInputB('') : setAmountInputA('')
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
      }
    }
  }

  // 重置输入框
  const resetInputAmount = () => {
    setAmountInputA('')
    setAmountInputB('')
    setPercentage(0)
    setUuid('')
    uuidRef.current = ''
    setCalculateResult(undefined)
    setVaultsZapProps(undefined)
    setCalculateLpLoading(false)
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
    if (isCheckedZAP) {
      return d(inputTotalValue).gt(0) && d(inputTotalValue).lt(d(0.0001))
    }
    return false
  }, [inputTotalValue, isCheckedZAP])

  // 单边提示文案
  const { stakeProtocolName } = useGetSuiStakeProtocol(!fixAmountA ? tokenA?.coin_type : tokenB?.coin_type)
  const showOnlySideTips = useMemo(() => {
    if (category == 'haedal') return undefined
    if (assetAction !== 'both' && tokenA && tokenB && (+amountInputA || +amountInputB)) {
      const amount = fixAmountA ? amountInputA : amountInputB
      const fixToken = fixAmountA ? tokenA : tokenB
      const targetToken = fixAmountA ? tokenB : tokenA

      if (calculateResult && calculateResult.swap_result) {
        const swapInAmount = fromDecimalsAmountFix(calculateResult.swap_result.swap_in_amount, fixToken.decimals)
        const swapOutAmount = fromDecimalsAmountFix(
          d(calculateResult.swap_result.swap_out_amount)
            .mul(1 - Number(liquiditySlippage))
            .toString(),
          targetToken.decimals
        )

        if (CoinAssist.isSuiCoin(fixToken.coin_type)) {
          return `By depositing ${convertScientificToDecimal(formatNumber(amount, 9).toString(), 9)} SUI, ${convertScientificToDecimal(formatNumber(swapInAmount, 9).toString(), 9)} SUI will be converted to ${targetToken?.symbol} via ${stakeProtocolName} liquid staking and added to the pool together.`
        }
        return `By depositing ${convertScientificToDecimal(formatNumber(amount, 9).toString(), 9)} ${fixToken?.symbol}, ${convertScientificToDecimal(formatNumber(swapInAmount, 9).toString(), 9)} ${fixToken?.symbol} will be traded for ${convertScientificToDecimal(formatNumber(swapOutAmount, 9).toString(), 9)} ${targetToken?.symbol} and then added to the pool together.`
      } else {
        // if (!CoinAssist.isSuiCoin(assetAction)) {
        //   const amountValue = getTokenAmountValue(assetAction, amount)
        //   if (d(amountValue).gt(50000)) {
        //     return "Single-asset deposit can't be higher than $50,000 at a time."
        //   }
        // }
      }
    }

    return undefined
  }, [assetAction, calculateResult, amountInputA, amountInputB, category])

  useEffect(() => {
    if (category !== 'haevault_v2') {
      setPreCalcError(undefined)
    }
  }, [category])

  const { signAndExecuteTransaction, transactionConfirmation, transactionRejected } = useTransaction()

  const verifyZapAmountValue = (amount: string, fixToken: Token, isValue: boolean) => {
    if (isCheckedZAP) {
      const tokenAmountValue = isValue
        ? amount
        : getTokenAmountValueByPyth(fixToken.coin_type, amount) || getTokenAmountValue(fixToken.coin_type, amount)
      if (d(tokenAmountValue).lt(d(0.0001)) || d(tokenAmountValue).gt(d(50000))) {
        setCalculateLpLoading(false)
        setVaultsZapProps(undefined)
        setCalculateResult(undefined)
        uuidRef.current = ''
        return false
      }
    }
    return true
  }

  // 重新计算
  const reCalculateResult = () => {
    if (availableCapacityUSD == '0' && category == 'haedal') {
      setAmountInputA('')
      setAmountInputB('')
      setPercentage(0)
      setCalculateLpLoading(false)
      setCalculateResult(undefined)
      setVaultsZapProps(undefined)
      return
    }

    if (assetAction == 'both' && (!+amountInputA || !+amountInputB)) {
      return
    }

    if (isSlider) {
      const coinPrice = pythPriceMap[fixCoinType(quoteCoin?.coin_type || quoteCoin?.coinType || '', false)]?.price
      const amountUSD = d(availableCapacityWithQuoteCoin).mul(percentageRef.current).div(100).mul(coinPrice).toString()
      if (!verifyZapAmountValue(amountUSD, isFixedDisplayTokenA ? displayTokenA : displayTokenB, true)) {
        return
      }
      debouncedPreCalculateDepositValue(percentageRef.current, availableCapacityWithQuoteCoin as string, quoteCoin as Token, uuid, true)
    } else {
      const amount = isFixedDisplayTokenARef.current ? amountInputARef.current : amountInputBRef.current
      const otherAmount = isFixedDisplayTokenA ? amountInputBRef.current : amountInputARef.current
      if (+amount) {
        if (!verifyZapAmountValue(amount, isFixedDisplayTokenA ? displayTokenA : displayTokenB, false)) {
          return
        }
        const uuid = v4()
        setUuid(uuid)
        uuidRef.current = uuid // 立即同步更新 ref
        debouncedPreCalculate(amount, isFixedDisplayTokenA, otherAmount, uuid, true)
      } else {
        setPreCalcError(undefined)
        setCalculateLpLoading(false)
      }
    }
  }

  useEffect(() => {
    if (calculateResult) {
      setPreCalcError(undefined)
    }
  }, [calculateResult])

  // 滑杆预计算
  const preCalculateDepositValue = async (percent: number, availableCapacityWithCoin: string, coin: Token, uuid: string, isAutoCalculate = false) => {
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:520 ~ preCalculateDepositValue ~ coin:', percent)
    const coinPrice = pythPriceMap[fixCoinType(coin?.coin_type || coin?.coinType, false)]?.price
    if (tokenA && tokenB && vaultId) {
      const amountUSD = d(availableCapacityWithCoin).mul(percent).div(100).mul(coinPrice).toString()
      if (amountUSD == '0') {
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
        setAmountInputA('')
        setAmountInputB('')
        setPercentage(0)
        setCalculateLpLoading(false)
        return
      }
      const amount = d(availableCapacityWithCoin).mul(percent).div(100).toString()
      setCalculateLpLoading(!isAutoCalculate)
      const params = {
        mode: mode === 'FixedOneSide' ? 'FlexibleBoth' : (mode as DepositMode),
        pool_id: vaultId,
        amount_usd: amountUSD,
        uuid,
        coin_decimals_a: tokenA?.decimals,
        coin_decimals_b: tokenB?.decimals,
        re_balance: true
      }
      console.log('🚀🚀🚀 ~ useVaultsAdd.ts:472 ~ preCalculateDepositValue ~ params:', params)
      let res: any
      if (category == 'haevault_v2') {
        res = await volatileVaultsSdk.VaultsV2.preCalculateDepositValue(params, {
          onSuccess: (receive_lp_amount, uuid) => {
            if (
              uuid == uuidRef.current &&
              (mode == 'FixedOneSide' || mode == 'OnlyCoinA' || mode == 'OnlyCoinB'
                ? amountInputARef.current || amountInputBRef.current
                : amountInputARef.current && amountInputBRef.current)
            ) {
              console.log('🚀🚀🚀 ~ useVaultsAdd.ts:537 ~ preCalculateDepositValue ~ res:', res)
              setCalculateResult({
                amount_a: isReverse ? res.deposit_amount_b : res.deposit_amount_a,
                amount_b: isReverse ? res.deposit_amount_a : res.deposit_amount_b,
                ft_amount: receive_lp_amount
              })
              setCalculateLpLoading(false)
            } else {
              setCalculateLpLoading(false)
              setCalculateResult(undefined)
              setVaultsZapProps(undefined)
            }
          },
          onError: (error, uuid) => {
            console.log('🚀 ~ preCalculate ~ error:', error)
          }
        })

        if ((mode == 'OnlyCoinA' || mode == 'OnlyCoinB') && uuid == uuidRef.current && res) {
          warpVaultsZapProps(res)
        }
      } else {
        res = await volatileVaultsSdk.Vaults.preCalculateDepositValue(params as DepositCalculationValueOptions, {
          onSuccess: (receive_lp_amount, uuid) => {
            if (
              uuid == uuidRef.current &&
              (mode == 'FixedOneSide' || mode == 'OnlyCoinA' || mode == 'OnlyCoinB'
                ? amountInputARef.current || amountInputBRef.current
                : amountInputARef.current && amountInputBRef.current)
            ) {
              setCalculateResult({
                amount_a: isReverse ? res.deposit_amount_b : res.deposit_amount_a,
                amount_b: isReverse ? res.deposit_amount_a : res.deposit_amount_b,
                ft_amount: receive_lp_amount
              })
              setCalculateLpLoading(false)
            } else {
              setCalculateLpLoading(false)
              setCalculateResult(undefined)
              setVaultsZapProps(undefined)
            }
          },
          onError: (error, uuid) => {
            console.log('🚀 ~ preCalculate ~ error:', error)
          }
        })
      }
      if (uuid !== uuidRef.current) return
      console.log('🚀🚀🚀 ~ useVaultsAdd.ts:492 ~ preCalculateDepositValue ~ res:', res)

      wrapRes(res, true, true)
    }
  }

  const debouncedPreCalculateDepositValue = useDebounceFunction(preCalculateDepositValue, 500)

  const handlePercentInputChange = (percent: number, availableCapacityWithQuoteCoin: string, quoteCoin: Token, uuid: string) => {
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:536 ~ handlePercentInputChange ~ percent:', percent)
    if (d(percent).lte(0)) {
      setCalculateResult(undefined)
      setVaultsZapProps(undefined)
      setPreCalcError(undefined)
      setAmountInputA('')
      setAmountInputB('')
      setCalculateLpLoading(false)
      return
    }

    const coinPrice = pythPriceMap[fixCoinType(quoteCoin?.coin_type || quoteCoin?.coinType || '', false)]?.price
    const amountUSD = d(availableCapacityWithQuoteCoin).mul(percent).div(100).mul(coinPrice).toString()
    // if (!verifyZapAmountValue(amountUSD, isFixedDisplayTokenA ? displayTokenA : displayTokenB, true)) {
    //   return
    // }

    debouncedPreCalculateDepositValue(percent, availableCapacityWithQuoteCoin, quoteCoin, uuid)
  }

  const calculateDepositRatioWithAvailableCapacity = async (deposit_amount_a: string, deposit_amount_b: string) => {
    console.log('🚀🚀🚀 ~ useVaultsAdd.ts:678 ~ calculateDepositRatioWithAvailableCapacity ~ (tokenA && tokenB && availableCapacityUSD:', {
      tokenA,
      tokenB,
      availableCapacityUSD,
      deposit_amount_a,
      deposit_amount_b
    })
    if (tokenA && tokenB) {
      const amountA = fromDecimalsAmount(deposit_amount_a, tokenA?.decimals)
      const amountB = fromDecimalsAmount(deposit_amount_b, tokenB?.decimals)
      const amountValueA = getTokenAmountValueByPyth(tokenA?.coin_type, String(amountA))
      const amountValueB = getTokenAmountValueByPyth(tokenB?.coin_type, String(amountB))
      const amountUSD = d(amountValueA)
        .add(amountValueB || 0)
        .toString()
      const ratio = d(amountUSD).div(d(availableCapacityUSD)).mul(100)
      if (availableCapacityUSD == '0') {
        setPercentage(0)
        setAmountInputA('')
        setAmountInputB('')
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
        setCalculateLpLoading(false)
        return
      }
      if (ratio.gt(100)) {
        const uuid = v4()
        setUuid(uuid)
        uuidRef.current = uuid // 立即同步更新 ref
        setPercentage(100)
        setCalculateLpLoading(false)
        setCalculateResult(undefined)
        setVaultsZapProps(undefined)
        if (!verifyZapAmountValue(amountUSD, isFixedDisplayTokenA ? displayTokenA : displayTokenB, true)) {
          return
        }
        //  debouncedPreCalculateDepositValue(100, availableCapacityWithQuoteCoin as string, quoteCoin as Token, uuid)
      } else {
        console.log('🚀🚀🚀 ~ useVaultsAdd.ts:678 ~ calculateDepositRatioWithAvailableCapacity ~ uui:', uuid, uuidRef.current)
        if (amountInputARef.current || amountInputBRef.current) {
          const ratioValue = formatNumber(ratio.toString(), 2)
          setPercentage(Number(ratioValue))
        }
      }
    }
  }
  // 提交交易
  const doAddAction = async () => {
    if (vaultId) {
      // 处理页面上的值 保证按照合约A,B传入
      let depositParams: any
      if (category == 'haedal' || category == 'haevault_v2') {
        depositParams = {
          pool_id: vaultId,
          amount_a: String(
            isReverse ? toDecimalsAmount(amountInputB || 0, String(tokenA?.decimals)) : toDecimalsAmount(amountInputA || 0, String(tokenA?.decimals))
          ),
          amount_b: String(
            isReverse ? toDecimalsAmount(amountInputA || 0, String(tokenB?.decimals)) : toDecimalsAmount(amountInputB || 0, String(tokenB?.decimals))
          )
        }
        if (vaultsZapProps?.re_balance) {
          depositParams.re_balance = {
            ...vaultsZapProps.re_balance,
            swap_slippage: Number(liquiditySlippage)
          }
        }
      } else {
        depositParams = {
          vault_id: vaultId,
          slippage: Number(liquiditySlippage),
          deposit_result: calculateResult
        }
      }
      console.log('🚀🚀🚀 ~ useVaultsAdd.ts:261 ~ doAddAction ~ depositParams:', depositParams)
      // 构建 交易提示
      const toastInfo: ToastType = {
        getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>, res?: any) => {
          console.log('🚀🚀🚀 ~ useVaultsAdd.ts:306 ~ doAddAction ~ res:', res)
          // 提示语也需要处理方向
          const description =
            'Deposit ' +
            [
              formatDescription(isReverse ? amountInputA : amountInputA, isReverse ? tokenB?.symbol : tokenA?.symbol),
              formatDescription(isReverse ? amountInputB : amountInputB, isReverse ? tokenA?.symbol : tokenB?.symbol)
            ]
              .filter(Boolean)
              .join(' and ')

          const info: CommonTypeInfo = {
            modalDescriptionText: description,
            toastTitleText: description
          }

          if (status === 'success') {
            let amountA = amountInputA
            let amountB = amountInputB

            if (res) {
              if (category === 'cetus') {
                res.events.forEach((event: any) => {
                  if (event.type.indexOf('pool::AddLiquidityV2Event') > -1 && tokenA && tokenB) {
                    amountA = String(fromDecimalsAmount(event.parsedJson.amount_a, tokenA.decimals))
                    amountB = String(fromDecimalsAmount(event.parsedJson.amount_b, tokenB.decimals))
                  }
                })
              } else {
                res.events.forEach((event: any) => {
                  if ((event.type.indexOf('::pool::DepositEvent') > -1 || event.type.indexOf('::vault::DepositEvent') > -1) && tokenA && tokenB) {
                    amountA = String(fromDecimalsAmount(event.parsedJson.amount_a, tokenA.decimals))
                    amountB = String(fromDecimalsAmount(event.parsedJson.amount_b, tokenB.decimals))
                  }
                })
              }
            }
            const description =
              'Deposit ' +
              [
                formatDescription(isReverse ? amountB : amountA, isReverse ? tokenB?.symbol : tokenA?.symbol),
                formatDescription(isReverse ? amountA : amountB, isReverse ? tokenA?.symbol : tokenB?.symbol)
              ]
                .filter(Boolean)
                .join(' and ')

            info.toastDescriptionContent = description
            info.modalDescriptionText = description
            info.toastTitleText = 'Deposit successful'
          }

          return info
        }
      }
      transactionConfirmation(toastInfo)
      console.log('🚀🚀🚀 ~ useVaultsAdd.ts:662 ~ doAddAction ~ vaultsFarmingStaked:', { vaultsFarmingStaked, currentVaultsFarmsReward })
      if (currentVaultsFarming?.isVaultsFarming && autoClaimStakeFarming && currentVaultsFarming?.isActiveVaultsFarming) {
        depositParams['return_lp_coin'] = true
      }
      try {
        const tx = new Transaction()
        tx.setSender(currentAccount.address)
        if (category == 'haedal') {
          const lpCoin = await volatileVaultsSdk.Vaults.buildDepositPayload(depositParams, tx)
          if (currentVaultsFarming?.isVaultsFarming && autoClaimStakeFarming && currentVaultsFarming?.isActiveVaultsFarming) {
            await haedalFarmSdk.Farms.buildStakePayload(
              {
                poolId: currentVaultsFarming?.poolId,
                stakeCoinType: currentVaultsFarming?.stakeCoinType,
                stakeObjectId: vaultsFarmingStaked?.stakeObjectId,
                lpCoin,
                decimals: currentVaultsFarming?.coinDetail?.decimals
              },
              tx
            )
          }
        } else if (category == 'haevault_v2') {
          const lpCoin = await volatileVaultsSdk.VaultsV2.buildDepositPayload(depositParams, tx)
          if (currentVaultsFarming?.isVaultsFarming && autoClaimStakeFarming) {
            await haedalFarmSdk.Farms.buildStakePayload(
              {
                poolId: currentVaultsFarming?.poolId,
                stakeCoinType: currentVaultsFarming?.stakeCoinType,
                stakeObjectId: vaultsFarmingStaked?.stakeObjectId,
                lpCoin,
                decimals: currentVaultsFarming?.coinDetail?.decimals
              },
              tx
            )
          }
        } else {
          console.log('🚀🚀🚀 ~ useVaultsAdd.ts:447 ~ doAddAction ~ vaultsSdk:', vaultsSdk, depositParams)
          await vaultsSdk!.Vaults.deposit(depositParams, tx)
        }

        console.log('🚀 ~ doAddAction ~ depositParams11111:', depositParams)
        const res = await signAndExecuteTransaction(tx, toastInfo, {
          useMev: mevProtect,
          txAction: 'signTransactionBlock',
          useFastMode: transactionMode === 'Fast Mode',
          maxCapForGas,
          customGasPrice,
          msafeParams: {
            action: MsafeTransactionSubType.AddVaultsPosition,
            txbParams: depositParams
          }
        })

        if (res) {
          resetInputAmount()
          setTimeout(() => {
            fetchAccountBalance()
            getCurrentVaultByVaultId(vaultId, true)
          }, 2000)
          if (currentVaultsFarming?.isVaultsFarming) {
            getVaultsFarmingStaked({ stakeCoinType: vaultsFarmingStaked.stakeCoinType, poolId: vaultsFarmingStaked.poolId }, vaultId)
            console.log('🚀🚀🚀 ~ useVaultsAdd.ts:714 ~ doAddAction ~ vaultsFarmingStaked:', vaultsFarmingStaked)
          }
        } else {
          reCalculateResult()
        }
      } catch (error) {
        console.log('🚀🚀🚀 ~ useVaultsAdd.ts:418 ~ doAddAction ~ error:', error)
        transactionRejected(toastInfo)
      }
    }
  }

  const isQuoteCoin = useMemo(() => {
    return assetAction == quoteCoin?.coin_type || assetAction == 'both'
  }, [assetAction, quoteCoin])

  useEffect(() => {
    return () => {
      uuidRef.current = ''
    }
  }, [])

  const { isRegularTokenPair } = useSlippageTolerance(displayTokenA, displayTokenB, liquiditySlippage, isCheckedZAP)

  const showRiskConfirm = useMemo(() => {
    if (vaultsZapProps == undefined) return false
    const amount = fromDecimalsAmount(
      vaultsZapProps?.swap_in_amount || '0',
      vaultsZapProps?.isZapCoinA ? vaultsZapProps?.coinA?.decimals : vaultsZapProps?.coinB?.decimals
    ).toString()
    const amountValue =
      category == 'haedal'
        ? getTokenAmountValueByPyth(vaultsZapProps?.isZapCoinA ? vaultsZapProps?.coinA?.coin_type : vaultsZapProps?.coinB?.coin_type, amount)
        : getTokenAmountValue(vaultsZapProps?.isZapCoinA ? vaultsZapProps?.coinA?.coin_type : vaultsZapProps?.coinB?.coin_type, amount)
    console.log(isRegularTokenPair, amountValue, category, vaultsZapProps?.swap_in_amount, '=========================')
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
    balanceInfoA,
    balanceInfoB,
    amountValueA,
    amountValueB,
    handleAmountInputChange,
    amountInputA,
    amountInputB,
    setAmountInputA,
    setAmountInputB,
    resetInputAmount,
    preCalculateLoading,
    isFixedDisplayTokenA,
    zapNumGtError,
    zapNumLtError,
    calculateLpLoading,
    inputTotalValue,
    showOnlySideTips,
    doAddAction,
    reCalculateResult,
    percentage,
    setPercentage,
    isSlider,
    setIsSlider,
    handlePercentInputChange,
    isQuoteCoin,
    setUuid,
    uuidRef,
    preCalcError,
    knowsRisk,
    handleKnowsRisk,
    showRiskConfirm
  }
}
