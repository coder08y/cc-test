import { MigrateSuccessResult } from '@/components/vaults-v2/modal/MigrateSuccessModal'
import { VaultMigrateModalOptions } from '@/components/vaults-v2/modal/VaultMigrateModal'
import useGlobalStore from '@/store/common/global'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPoolStore from '@/store/vaults-v2/useVaultsPool'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { MsafeTransactionSubType } from '@/types/msafe'
import { MigrateAmountResult, MigrateSwapResult, MigrateWithdrawResult } from '@/types/vaults-v2'
import { formatDescription } from '@/utils'
import { useAccountBalance, useDebounceFunction } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory/src/useSdk'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { BalanceChanges, CommonTypeInfo, ToastType, Token, TransactionStatusType } from '@cetus/types'
import { formatNumberWithDown, formatNumberWithThreshold } from '@cetus/utils/src/formatter'
import { d, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import {
  CalculateMigrateWithdrawOptions as CalculateMigrateWithdrawOptionsCetus,
  CalculateMigrateWithdrawResult as CalculateMigrateWithdrawResultCetus
} from '@cetusprotocol/vaults-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { useDeepCompareEffect } from 'ahooks'
import { CalculateMigrateWithdrawOptions, CalculateMigrateWithdrawResult } from 'haedal-vault-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useTransaction from '../common/useTransaction'
import useCalculateVaultFarmingRewardUSD from '../vaults-farming/useCalculateVaultFarmingRewardUSD'
import useGetVaultFarmingStaked from '../vaults-farming/useGetVaultFarmingStaked'
import useGetVaultDailyYield from './chart/useGetVaultDailyYield'
import useGetPythTokenPrice from './pyth-price/useGetPythTokenPrice'
import useCurrentVaultDetail from './useCurrentVaultDetail'

export function useVaultsMigrate(currentVaultId: string) {
  const vaultsSdk = useSdk('vaults')
  const { volatileVaultsSdk, haedalFarmSdk } = usePeripherySDKStore()
  const { vaultListObj, lpTokenInfoObj } = useVaultsListV2Store()
  const { getCurrentVaultContractInfo, getCurrentVaultByVaultId } = useCurrentVaultDetail()
  const { vaultsPoolObj } = useVaultsPoolStore()
  const { currentAccount } = useAccountStore()

  const { currentVaultPosition, dailyYieldPerLpMap, setDailyYieldPerLpMap } = useVaultsPositionStore()
  const [migrateModalOptions, setMigrateModalOptions] = useState<VaultMigrateModalOptions | undefined>(undefined)

  const [removePercent, setRemovePercent] = useState<number>(100)
  const [preCalculateLoading, setPreCalculateLoading] = useState<boolean>(false)
  const [migrateSubmitLoading, setMigrateSubmitLoading] = useState<boolean>(false)
  const [uuid, setUuid] = useState<string>('')
  const { fetchAccountBalance } = useAccountBalance()

  const [preCalculateResult, setPreCalculateResult] = useState<MigrateWithdrawResult | undefined>(undefined)

  const { liquiditySlippage, mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()
  const { getTokenAmountValue } = useTokenPrice()

  const { vaultsFarmObj, vaultsFarmingStaked, vaultsFarmingRewards } = useVaultsFarmingStore()

  const { getVaultDailyYield } = useGetVaultDailyYield()
  const [migrateSuccessResult, setMigrateSuccessResult] = useState<MigrateSuccessResult | undefined>(undefined)

  const { getVaultsFarmingStaked } = useGetVaultFarmingStaked()

  const uuidRef = useRef(uuid)
  useEffect(() => {
    uuidRef.current = uuid
  }, [uuid])

  /**
   * 当前池子API信息
   */
  const currentVaultApiInfo = useMemo(() => {
    return vaultListObj[currentVaultId as string]
  }, [vaultListObj, currentVaultId])

  /**
   * 当前池子合约信息
   */
  const currentVaultContractInfo = useMemo(() => {
    return vaultsPoolObj[currentVaultId as string]
  }, [vaultsPoolObj])

  /**
   * 目标池子API信息
   */
  const targetVaultApiInfo = useMemo(() => {
    if (currentVaultApiInfo?.migrate_target_vault) {
      return vaultListObj[currentVaultApiInfo?.migrate_target_vault as string]
    }
    return undefined
  }, [currentVaultApiInfo?.migrate_target_vault])

  /**
   * 获取目标池子每日收益
   */
  useEffect(() => {
    if (targetVaultApiInfo?.vaultId) {
      getVaultDailyYield(targetVaultApiInfo?.vaultId, targetVaultApiInfo?.category).then(res => {
        setDailyYieldPerLpMap(targetVaultApiInfo?.vaultId, Number(res))
      })
    }
  }, [targetVaultApiInfo?.vaultId])

  const targetVaultsFarming = useMemo(() => {
    if (currentVaultApiInfo?.migrate_target_vault) {
      return vaultsFarmObj[currentVaultApiInfo?.migrate_target_vault as string]
    }
    return undefined
  }, [vaultsFarmObj, currentVaultApiInfo?.migrate_target_vault])
  /**
   * 获取目标池子质押信息
   */
  useEffect(() => {
    if (targetVaultsFarming?.isActiveVaultsFarming && targetVaultApiInfo?.vaultId) {
      getVaultsFarmingStaked(
        {
          stakeCoinType: targetVaultsFarming.stakeCoinType,
          poolId: targetVaultsFarming.poolId
        },
        targetVaultApiInfo?.vaultId,
        targetVaultsFarming
      )
    }
  }, [targetVaultsFarming?.poolId, targetVaultApiInfo?.vaultId])

  const currentVaultsFarming = useMemo(() => {
    if (currentVaultApiInfo?.vaultId) {
      return vaultsFarmObj[currentVaultApiInfo?.vaultId as string]
    }
    return undefined
  }, [vaultsFarmObj, currentVaultApiInfo?.vaultId])

  const currentVaultsFarmingAvailableRewards = useMemo(() => {
    return vaultsFarmingRewards[currentVaultId]
  }, [vaultsFarmingRewards, currentVaultId])

  const { vaultFarmingRewardAmountUSD, vaultFarmingRewardAmount } = useCalculateVaultFarmingRewardUSD(currentVaultsFarmingAvailableRewards)

  const currentVaultsFarmingStaked: any = useMemo(() => {
    return vaultsFarmingStaked[currentVaultId]
  }, [vaultsFarmingStaked, currentVaultId])

  const targetVaultsFarmingStaked: any = useMemo(() => {
    return vaultsFarmingStaked[targetVaultApiInfo?.vaultId as string]
  }, [vaultsFarmingStaked, targetVaultApiInfo?.vaultId])

  /**
   * 目标池子合约信息
   */
  const targetVaultContractInfo = useMemo(() => {
    if (currentVaultApiInfo?.migrate_target_vault) {
      const targetVaultContractInfo = vaultsPoolObj[currentVaultApiInfo?.migrate_target_vault as string]
      return targetVaultContractInfo
    }
    return undefined
  }, [currentVaultApiInfo?.migrate_target_vault, vaultsPoolObj, getCurrentVaultContractInfo])

  /**
   * 初始化迁移模态框选项
   */
  useDeepCompareEffect(() => {
    console.log('🚀🚀🚀 ~ useVaultsMigrate.ts:9 ~ useEffect ~ init:', {
      currentVaultApiInfo,
      currentVaultContractInfo,
      targetVaultApiInfo,
      targetVaultContractInfo,
      currentVaultPosition
    })
    if (currentVaultApiInfo && currentVaultContractInfo && targetVaultApiInfo && targetVaultContractInfo && currentVaultPosition) {
      setMigrateModalOptions({
        currentVaultApiInfo,
        currentVaultContractInfo,
        targetVaultApiInfo,
        targetVaultContractInfo,
        currentVaultPosition
      })
    }
  }, [currentVaultApiInfo, currentVaultContractInfo, targetVaultApiInfo, targetVaultContractInfo, currentVaultPosition])

  /**
   * 获取目标池子信息
   */
  useEffect(() => {
    if (currentVaultApiInfo?.migrate_target_vault) {
      getCurrentVaultContractInfo([currentVaultApiInfo?.migrate_target_vault as string])
    }
  }, [currentVaultApiInfo?.migrate_target_vault])

  const isSameTokenPair = useMemo(() => {
    if (!currentVaultApiInfo || !targetVaultApiInfo) {
      return false
    }
    const { tokenA, tokenB } = currentVaultApiInfo
    const { tokenA: targetTokenA, tokenB: targetTokenB } = targetVaultApiInfo
    return (
      (tokenA.coin_type === targetTokenA.coin_type && tokenB.coin_type === targetTokenB.coin_type) ||
      (tokenA.coin_type === targetTokenB.coin_type && tokenB.coin_type === targetTokenA.coin_type)
    )
  }, [
    currentVaultApiInfo?.tokenA?.coin_type,
    currentVaultApiInfo?.tokenB?.coin_type,
    targetVaultApiInfo?.tokenA?.coin_type,
    targetVaultApiInfo?.tokenB?.coin_type
  ])

  /**
   * 是否显示迁移提示
   */
  const showMigrateTips = useMemo(() => {
    if (currentVaultApiInfo && targetVaultApiInfo) {
      const { status } = currentVaultApiInfo

      const isSunset = status === 'sunset'
      const isSunsetSoon = status === 'sunsetSoon'

      if (isSunset) {
        if (isSameTokenPair) {
          return 'This vault has been deprecated. An alternative new vault is detected. Migrate and try for better yields.'
        }
        return 'This Vault has been deprecated.An alternative new vault with similar token pairs is detected. Migrate and try for better yields.'
      } else if (isSunsetSoon) {
        if (isSameTokenPair) {
          return 'This vault will be deprecated soon. An alternative new vault is detected. Migrate and try for better yields. '
        }
        return 'This Vault will be deprecated soon. An alternative new vault with similar token pairs is detected. Migrate and try for better yields. '
      } else {
        if (isSameTokenPair) {
          return 'An alternative new vault is detected. Migrate and try for better yields.'
        }
        return 'An alternative new vault with similar token pairs is detected. Migrate and try for better yields. '
      }
    }
  }, [currentVaultApiInfo?.status, targetVaultApiInfo?.vaultId, isSameTokenPair])

  const buildMigrateAmountResult = (ft_amount: string, amount_a: string, amount_b: string, tokenA: Token, tokenB: Token) => {
    const amount_a_display = fromDecimalsAmount(amount_a, tokenA.decimals)
    const amount_b_display = fromDecimalsAmount(amount_b, tokenB.decimals)
    const amount_value_a =
      currentVaultApiInfo?.category === 'cetus'
        ? getTokenAmountValue(tokenA.coin_type, amount_a_display)
        : getTokenAmountValueByPyth(tokenA.coin_type, amount_a_display) || '0'
    const amount_value_b =
      currentVaultApiInfo?.category === 'cetus'
        ? getTokenAmountValue(tokenB.coin_type, amount_b_display)
        : getTokenAmountValueByPyth(tokenB.coin_type, amount_b_display) || '0'
    const info: MigrateAmountResult = {
      ft_amount,
      amount_a,
      amount_b,
      amount_a_display,
      amount_b_display,
      amount_value_a,
      amount_value_b
    }
    return info
  }

  const buildMigrateSwapResult = (coin_output: any) => {
    const { tokenA: fromTokenA, tokenB: fromTokenB } = currentVaultApiInfo!
    const { tokenA: toTokenA, tokenB: toTokenB } = targetVaultApiInfo!
    if (coin_output.route_obj) {
      const { from_coin_type, to_coin_type, from_coin_amount, to_coin_amount } = coin_output
      const in_token = fromTokenA.coin_type === from_coin_type ? fromTokenA : fromTokenB
      const out_token = toTokenA.coin_type === to_coin_type ? toTokenA : toTokenB
      const info: MigrateSwapResult = {
        in_token,
        out_token,
        swap_in_amount: from_coin_amount,
        swap_out_amount: to_coin_amount,
        swap_in_amount_display: fromDecimalsAmount(from_coin_amount, in_token.decimals),
        swap_out_amount_display: fromDecimalsAmount(to_coin_amount, out_token.decimals)
      }
      return info
    }
    return undefined
  }
  const handlePreCalculateResult = (result: any) => {
    const { tokenA: fromTokenA, tokenB: fromTokenB } = currentVaultApiInfo!
    const { tokenA: toTokenA, tokenB: toTokenB } = targetVaultApiInfo!
    const { deposit_amount_a, deposit_amount_b, obtained_ft_amount, burn_ft_amount, from_swap_result, rebalance_swap_result } =
      result as CalculateMigrateWithdrawResultCetus
    const withdraw_amount_a = from_swap_result.coin_output_a.from_coin_amount
    const withdraw_amount_b = from_swap_result.coin_output_b.from_coin_amount
    const { coin_output_a, coin_output_b } = from_swap_result
    const withdraw_result = buildMigrateAmountResult(burn_ft_amount, withdraw_amount_a, withdraw_amount_b, fromTokenA, fromTokenB)
    const deposit_result = buildMigrateAmountResult(obtained_ft_amount, deposit_amount_a, deposit_amount_b, toTokenA, toTokenB)

    const swap_results: MigrateSwapResult[] = []
    const swap_result_a = buildMigrateSwapResult(coin_output_a)
    const swap_result_b = buildMigrateSwapResult(coin_output_b)
    if (swap_result_a) {
      swap_results.push(swap_result_a)
    }
    if (swap_result_b) {
      swap_results.push(swap_result_b)
    }

    if (rebalance_swap_result?.route_obj) {
      const { route_obj } = rebalance_swap_result
      const { swap_direction, swap_in_amount, swap_out_amount } = route_obj
      const in_token = swap_direction === 'A_TO_B' ? toTokenA : toTokenB
      const out_token = swap_direction === 'A_TO_B' ? toTokenB : toTokenA
      const info: MigrateSwapResult = {
        in_token,
        out_token,
        swap_in_amount,
        swap_out_amount,
        swap_in_amount_display: fromDecimalsAmount(swap_in_amount, in_token.decimals),
        swap_out_amount_display: fromDecimalsAmount(swap_out_amount, out_token.decimals)
      }
      swap_results.push(info)
    }

    const info: MigrateWithdrawResult = {
      withdraw: withdraw_result,
      deposit: deposit_result,
      swap_results,
      raw_data: result
    }
    console.log('🚀🚀🚀 ~ useVaultsMigrate.ts:221 ~ handlePreCalculateResult ~ info:', info)
    setPreCalculateResult(info)
  }

  const preCalculateMigrate = async () => {
    if (removePercent > 0 && !preCalculateLoading) {
      handlePercentInputChange(removePercent, false)
    }
  }
  const preCalculate = async (burn_ft_amount: string, uuid: string, showLoading: boolean = true) => {
    try {
      setPreCalculateLoading(showLoading)
      const category = currentVaultApiInfo!.category
      let withdrawResult: any
      if (category === 'cetus') {
        const options: CalculateMigrateWithdrawOptionsCetus = {
          from_vault_id: currentVaultId,
          to_vault_id: targetVaultApiInfo?.vaultId as string,
          burn_ft_amount,
          liquidity_slippage: Number(liquiditySlippage)
        }
        console.log('🚀🚀🚀 ~ useVaultsMigrate.ts:139 ~ preCalculate ~ options:', options)
        withdrawResult = await vaultsSdk!.Migrate.calculateMigrateWithdraw(options)
      } else {
        const options: CalculateMigrateWithdrawOptions = {
          from_vault: {
            vault_id: currentVaultId,
            version: 'v1'
          },
          to_vault: {
            vault_id: targetVaultApiInfo?.vaultId as string,
            version: 'v2'
          },
          burn_ft_amount
        }
        withdrawResult = await volatileVaultsSdk!.Migrate.calculateMigrateWithdraw(options)
      }

      if (uuidRef.current === uuid) {
        console.log('🚀🚀🚀 ~ useVaultsMigrate.ts:255 ~ preCalculate ~ withdrawResult:', withdrawResult)
        handlePreCalculateResult(withdrawResult)
        setPreCalculateLoading(false)
      }
    } catch (error) {
      console.log('🚀🚀🚀 ~ useVaultsMigrate.ts:258 ~ preCalculate ~ error:', error)
      if (uuidRef.current === uuid) {
        setPreCalculateLoading(false)
      }
    }
  }

  const debouncedPercentInputChange = useDebounceFunction(preCalculate, 500)

  const handlePercentInputChange = (value: number, showLoading: boolean = true) => {
    if (preCalculateLoading || value == 0) {
      return
    }
    setRemovePercent(value)
    const removeLpAmount = formatNumberWithDown(
      d(currentVaultPosition?.balance || 0)
        .mul(value / 100)
        .toString(),
      0,
      true
    )
    if (d(removeLpAmount).isZero()) {
      setPreCalculateLoading(false)
      return
    }

    const uuid = v4()
    setUuid(uuid)
    debouncedPercentInputChange(removeLpAmount, uuid, showLoading)
  }

  const resetMigrateData = () => {
    setRemovePercent(100)
    setPreCalculateLoading(false)
    setPreCalculateResult(undefined)
    setUuid('')
  }

  const getToastInfo = (preCalculateResult: MigrateWithdrawResult, category: string) => {
    const toastInfo: ToastType = {
      getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>, res?: any) => {
        const isReverse = targetVaultApiInfo?.isReverse
        const { tokenA: fromTokenA, tokenB: fromTokenB } = targetVaultApiInfo!
        const { amount_a_display, amount_b_display } = preCalculateResult.deposit
        const description =
          'Deposit ' +
          [
            formatDescription(isReverse ? amount_b_display : amount_a_display, isReverse ? fromTokenB?.symbol : fromTokenA?.symbol),
            formatDescription(isReverse ? amount_a_display : amount_b_display, isReverse ? fromTokenA?.symbol : fromTokenB?.symbol)
          ]
            .filter(Boolean)
            .join(' and ')

        const info: CommonTypeInfo = {
          modalDescriptionText: '',
          toastTitleText: description
        }

        if (status === 'success') {
          let amountA = amount_a_display
          let amountB = amount_b_display

          if (res) {
            if (category === 'cetus') {
              res.events.forEach((event: any) => {
                if (event.type.indexOf('pool::AddLiquidityV2Event') > -1 && fromTokenA && fromTokenB) {
                  amountA = String(fromDecimalsAmount(event.parsedJson.amount_a, fromTokenA.decimals))
                  amountB = String(fromDecimalsAmount(event.parsedJson.amount_b, fromTokenB.decimals))
                }
              })
            } else {
              res.events.forEach((event: any) => {
                if (
                  (event.type.indexOf('::pool::DepositEvent') > -1 || event.type.indexOf('::vault::DepositEvent') > -1) &&
                  fromTokenA &&
                  fromTokenB
                ) {
                  amountA = String(fromDecimalsAmount(event.parsedJson.amount_a, fromTokenA.decimals))
                  amountB = String(fromDecimalsAmount(event.parsedJson.amount_b, fromTokenB.decimals))
                }
              })
            }
          }
          const description =
            'Deposit ' +
            [
              formatDescription(isReverse ? amountB : amountA, isReverse ? fromTokenB?.symbol : fromTokenA?.symbol),
              formatDescription(isReverse ? amountA : amountB, isReverse ? fromTokenA?.symbol : fromTokenB?.symbol)
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
    return toastInfo
  }

  const { signAndExecuteTransaction, transactionConfirmation, transactionRejected } = useTransaction()
  const handleMigrateSubmit = async () => {
    if (!preCalculateResult) {
      return
    }
    setMigrateSubmitLoading(true)
    try {
      const toastInfo = getToastInfo(preCalculateResult, currentVaultApiInfo!.category)
      transactionConfirmation(toastInfo)

      const category = currentVaultApiInfo!.category
      const tx = new Transaction()
      tx.setSender(currentAccount?.address as string)
      if (category === 'cetus') {
        await vaultsSdk!.Migrate.buildMigrateWithdrawTx(
          {
            withdraw_result: preCalculateResult.raw_data
          },
          tx
        )
      } else {
        const burn_ft_amount = preCalculateResult.withdraw.ft_amount
        const vault_ft_balance = currentVaultPosition?.vaultBalance || '0'
        // 如果目标池子是farming，则需要返回ft币
        const return_ft_coin = targetVaultsFarming?.isVaultsFarming && targetVaultsFarming?.isActiveVaultsFarming
        let farmingLpCoin: any
        //  提取数量大于vault可用 需要先从farming提取
        if (d(burn_ft_amount).gt(d(vault_ft_balance)) && currentVaultsFarming) {
          farmingLpCoin = await haedalFarmSdk.Farms.buildRawWithdrawPayload(
            {
              poolId: currentVaultsFarming.poolId,
              stakeCoinType: currentVaultsFarming.stakeCoinType,
              stakeObjectId: currentVaultsFarmingStaked.stakeObjectId,
              amount: d(burn_ft_amount).sub(vault_ft_balance).toString(),
              claimReward: true,
              rewardConfigs: currentVaultsFarming.rewardConfigs
            },
            tx
          )
        } else {
          // 如果是vault farming需要收割奖励
          if (currentVaultsFarming && currentVaultsFarming?.isVaultsFarming && currentVaultsFarmingStaked?.stakeObjectId) {
            for (let i = 0; i < currentVaultsFarmingStaked.rewardConfigs?.length; i++) {
              const claimParams = {
                poolId: currentVaultsFarming.poolId,
                stakeCoinType: currentVaultsFarming.stakeCoinType,
                stakeObjectId: currentVaultsFarmingStaked.stakeObjectId,
                rewardCoinType: currentVaultsFarmingStaked.rewardConfigs[i]?.rewardCoinType,
                rewardBank: currentVaultsFarmingStaked.rewardConfigs[i]?.bank
              }
              await haedalFarmSdk.Farms.buildHarvestPayload(claimParams, tx)
            }
          }
        }

        const lpCoin = await volatileVaultsSdk!.Migrate.buildMigrateWithdrawTx(
          {
            withdraw_result: preCalculateResult.raw_data,
            liquidity_slippage: Number(liquiditySlippage),
            return_ft_coin,
            extra_burn: farmingLpCoin
              ? { lp_burn_coin: farmingLpCoin, burn_lp_amount: d(burn_ft_amount).sub(vault_ft_balance).toString() }
              : undefined
          },
          tx
        )
        // 如果lpCoin不为空，则需要将lpCoin质押到farming
        if (lpCoin) {
          await haedalFarmSdk.Farms.buildStakePayload(
            {
              poolId: targetVaultsFarming!.poolId,
              stakeCoinType: targetVaultsFarming!.stakeCoinType,
              stakeObjectId: targetVaultsFarmingStaked!.stakeObjectId,
              lpCoin,
              decimals: targetVaultsFarmingStaked!.coinDetail?.decimals
            },
            tx
          )
        }
      }

      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        txAction: 'signTransactionBlock',
        useFastMode: transactionMode === 'Fast Mode',
        showSuccessModal: false,
        maxCapForGas,
        customGasPrice,
        msafeParams: {
          action: MsafeTransactionSubType.AddVaultsPosition
        }
      })
      if (res) {
        const { amount_value_a, amount_value_b, ft_amount } = preCalculateResult!.deposit
        const totalSupply = targetVaultContractInfo?.totalSupply || '0'
        const ft_amount_display = fromDecimalsAmount(ft_amount, lpTokenInfoObj[targetVaultApiInfo?.lpTokenType]?.decimals || 6)
        const dailyYield = dailyYieldPerLpMap[targetVaultApiInfo?.vaultId as string] || 0
        const data: MigrateSuccessResult = {
          total_amount_value: d(amount_value_a).add(d(amount_value_b)).toString(),
          share_of_pool: `${formatNumberWithThreshold(d(ft_amount).div(d(ft_amount).add(totalSupply)).mul(100).toString(), 2, 6)}%`,
          est_daily_yield: d(dailyYield).mul(ft_amount_display).toString(),
          min_ft_amount: d(ft_amount_display)
            .mul(1 - Number(liquiditySlippage))
            .toFixed(6),
          vaultId: targetVaultApiInfo?.vaultId as string,
          tx: res.digest,
          vaultApiInfo: targetVaultApiInfo
        }
        console.log('🚀🚀🚀 ~ useVaultsMigrate.ts:463 ~ handleMigrateSubmit ~ data:', {
          ...data,
          lpTokenInfoObj,
          ft_amount_display,
          dailyYield,
          targetVaultContractInfo,
          dailyYieldPerLpMap
        })
        setMigrateSuccessResult(data)

        resetMigrateData()
        setTimeout(() => {
          fetchAccountBalance()
          getCurrentVaultByVaultId(currentVaultId, true)
        }, 2000)
      } else {
        preCalculateMigrate()
      }
    } catch (error) {
      console.error('🚀🚀🚀 ~ useVaultsMigrate.ts:318 ~ handleMigrateSubmit ~ error:', error)
    } finally {
      setMigrateSubmitLoading(false)
    }
  }

  return {
    isSameTokenPair,
    showMigrateTips,
    migrateModalOptions,
    removePercent,
    preCalculateLoading,
    preCalculateResult,
    handlePercentInputChange,
    resetMigrateData,
    preCalculateMigrate,
    handleMigrateSubmit,
    migrateSubmitLoading,
    migrateSuccessResult,
    setMigrateSuccessResult,
    vaultFarmingRewardAmountUSD,
    vaultsFarmingRewards: currentVaultsFarmingAvailableRewards
  }
}
