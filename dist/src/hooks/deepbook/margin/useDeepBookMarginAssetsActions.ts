import useDeepBookStore from '@/store/deepbook'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { Token } from '@cetus/types'
import { Transaction } from '@mysten/sui/transactions'
import { useCallback } from 'react'
import useMarginOrderUtils from './useMarginOrderUtils'
import useMarginTransaction from './useMarginTransaction'
import useMarginValidators from './useMarginValidators'

export default function useDeepBookMarginAssetsActions() {
  const { currentDeepBookPool, setDepositAssetsLoading } = useDeepBookStore()
  const { currentAccount } = useAccountStore()
  const { deepBookSDK } = usePeripherySDKStore()

  // 使用工具函数和验证函数
  const { getMarginUtils, convertAmountToRawUnits, buildDepositParams } = useMarginOrderUtils()

  const { validatePoolAndToken, validatePoolAssets, validateAccount, validateMarginPools, getValidatedMarginContext } = useMarginValidators()

  const { executeTransaction, buildToastInfo } = useMarginTransaction()

  /**
   * 创建 margin manager 并存入抵押品
   * @param amount 存入金额（已格式化的字符串，如 "100"）
   * @param tokenInfo 代币信息
   * @param isBase 是否为 base asset
   */
  const createAndDeposit = useCallback(
    async (amount: string, tokenInfo: Token, isBase: boolean) => {
      try {
        setDepositAssetsLoading(true)

        validatePoolAndToken(tokenInfo)
        validatePoolAssets()

        const marginUtils = getMarginUtils()

        // 构建 poolInfo
        const poolInfo = {
          id: currentDeepBookPool.address,
          baseCoin: {
            coinType: currentDeepBookPool.baseAssets.coin_type
          },
          quoteCoin: {
            coinType: currentDeepBookPool.quoteAssets.coin_type
          }
        }

        // 转换金额
        const amountInRawUnits = convertAmountToRawUnits(amount, tokenInfo.decimals || 0)

        // 构建 toast 信息
        const toastInfo = buildToastInfo(amount, tokenInfo.symbol || '', 'Deposit', true)

        const tx = new Transaction()

        // 1️⃣ create margin manager
        const { margin_manager, initializer } = await deepBookSDK.MarginUtils.createMarginManager(poolInfo, tx)

        // 2️⃣ deposit（与 create 同一 tx）
        // margin_manager 是 NestedResult 类型，但在 Transaction 中可以正常使用
        const depositParams = buildDepositParams(margin_manager as any, amountInRawUnits, tokenInfo.coin_type)
        console.log('🚀🚀🚀 ~ useDeepBookMarginAssetsActions.ts:64 ~ useDeepBookMarginAssetsActions ~ depositParams:', depositParams)
        await marginUtils.deposit(depositParams, tx)

        // 3️⃣ share margin manager
        deepBookSDK.MarginUtils.shareMarginManager(
          {
            marginManager: margin_manager,
            initializer,
            baseCoin: { coinType: currentDeepBookPool.baseAssets.coin_type },
            quoteCoin: { coinType: currentDeepBookPool.quoteAssets.coin_type }
          },
          tx
        )

        // 4️⃣ execute transaction
        await executeTransaction(tx, toastInfo)

        setDepositAssetsLoading(false)
      } catch (error) {
        console.error('Failed to create and deposit:', error)
        setDepositAssetsLoading(false)
        throw error
      }
    },
    [
      currentDeepBookPool,
      getMarginUtils,
      convertAmountToRawUnits,
      buildToastInfo,
      buildDepositParams,
      executeTransaction,
      deepBookSDK,
      validatePoolAndToken,
      validatePoolAssets,
      setDepositAssetsLoading
    ]
  )

  /**
   * 存入抵押品到 margin manager
   * @param amount 存入金额（已格式化的字符串，如 "100"）
   * @param tokenInfo 代币信息
   * @param isBase 是否为 base asset
   */
  const deposit = useCallback(
    async (amount: string, tokenInfo: Token, isBase: boolean) => {
      try {
        setDepositAssetsLoading(true)

        validatePoolAndToken(tokenInfo)
        const { marginUtils, marginManagerId } = getValidatedMarginContext()

        // 转换金额
        const amountInRawUnits = convertAmountToRawUnits(amount, tokenInfo.decimals || 0)

        // 构建 deposit 参数
        const depositParams = buildDepositParams(marginManagerId, amountInRawUnits, tokenInfo.coin_type)

        // 构建 toast 信息
        const toastInfo = buildToastInfo(amount, tokenInfo.symbol || '', 'Deposit', false)

        // 调用 deposit 方法
        console.log('depositParams', depositParams)
        const tx = await marginUtils.deposit(depositParams)

        // 执行交易
        await executeTransaction(tx, toastInfo)

        setDepositAssetsLoading(false)
      } catch (error) {
        console.error('Failed to deposit:', error)
        setDepositAssetsLoading(false)
        throw error
      }
    },
    [
      validatePoolAndToken,
      getValidatedMarginContext,
      convertAmountToRawUnits,
      buildDepositParams,
      buildToastInfo,
      executeTransaction,
      setDepositAssetsLoading
    ]
  )

  /**
   * 提取抵押品从 margin manager
   * @param amount 提取金额（已格式化的字符串，如 "100"）
   * @param tokenInfo 代币信息
   * @param isBase 是否为 base asset
   */
  const withdraw = useCallback(
    async (amount: string, tokenInfo: Token, isBase: boolean) => {
      try {
        setDepositAssetsLoading(true)

        validatePoolAndToken(tokenInfo)
        validateAccount()
        const { marginUtils, marginManagerId } = getValidatedMarginContext()
        validatePoolAssets()
        validateMarginPools()

        // 转换金额
        const amountInRawUnits = convertAmountToRawUnits(amount, tokenInfo.decimals || 0)

        // 构建 withdraw 参数（根据测试用例）
        const withdrawParams = {
          account: currentAccount!.address, // 已通过 validateAccount() 验证
          marginManager: marginManagerId,
          baseMarginPool: currentDeepBookPool.baseMarginPool,
          quoteMarginPool: currentDeepBookPool.quoteMarginPool,
          pool: currentDeepBookPool.address,
          baseCoin: {
            coinType: currentDeepBookPool.baseAssets.coin_type,
            feed: currentDeepBookPool.baseAssets.feed as string
          },
          quoteCoin: {
            coinType: currentDeepBookPool.quoteAssets.coin_type,
            feed: currentDeepBookPool.quoteAssets.feed as string
          },
          withdrawCoinType: tokenInfo.coin_type,
          amount: amountInRawUnits
        }

        // 构建 toast 信息
        const toastInfo = buildToastInfo(amount, tokenInfo.symbol || '', 'Withdraw')

        // 调用 withdraw 方法
        console.log('🚀🚀🚀 ~ useDeepBookMarginAssetsActions.ts:193 ~ useDeepBookMarginAssetsActions ~ withdrawParams:', withdrawParams)
        const tx = await marginUtils.withdraw(withdrawParams)

        // 执行交易
        await executeTransaction(tx, toastInfo)

        setDepositAssetsLoading(false)
      } catch (error) {
        console.error('Failed to withdraw:', error)
        setDepositAssetsLoading(false)
        throw error
      }
    },
    [
      currentDeepBookPool,
      currentAccount,
      validatePoolAndToken,
      validateAccount,
      getValidatedMarginContext,
      validatePoolAssets,
      validateMarginPools,
      convertAmountToRawUnits,
      buildToastInfo,
      executeTransaction,
      setDepositAssetsLoading
    ]
  )

  /**
   * 偿还债务
   * @param amount 偿还金额（已格式化的字符串，如 "100"）
   * @param tokenInfo 代币信息
   * @param isBase 是否为 base asset
   */
  const repay = useCallback(
    async (amount: string, tokenInfo: Token, isBase: boolean) => {
      try {
        setDepositAssetsLoading(true)

        validatePoolAndToken(tokenInfo)
        const { marginUtils, marginManagerId } = getValidatedMarginContext()
        validatePoolAssets()

        // 转换金额
        const amountInRawUnits = convertAmountToRawUnits(amount, tokenInfo.decimals || 0)

        // 构建 toast 信息
        const toastInfo = buildToastInfo(amount, tokenInfo.symbol || '', 'Repay')

        let tx: Transaction

        console.log(marginUtils)
        const repayParams = {
          marginManager: marginManagerId,
          baseCoin: {
            coinType: currentDeepBookPool.baseAssets.coin_type,
            feed: currentDeepBookPool.baseAssets.feed as string,
            decimals: currentDeepBookPool.baseAssets.decimals
          },
          quoteCoin: {
            coinType: currentDeepBookPool.quoteAssets.coin_type,
            feed: currentDeepBookPool.quoteAssets.feed as string,
            decimals: currentDeepBookPool.quoteAssets.decimals
          },
          amount: amountInRawUnits,
          baseMarginPool: currentDeepBookPool.baseMarginPool,
          quoteMarginPool: currentDeepBookPool.quoteMarginPool,
          isBase
        }
        // 根据 token 类型选择调用 repayBase 或 repayQuote
        // if (isBase) {
        //   repayParams.baseMarginPool = currentDeepBookPool.baseMarginPool
        //   tx = await marginUtils.repayBase(repayParams)
        // } else {
        //   repayParams.quoteMarginPool = currentDeepBookPool.quoteMarginPool
        //   tx = await marginUtils.repayQuote(repayParams)
        // }
        console.log('repayParams:', repayParams)
        tx = await marginUtils.repay(repayParams)

        // 执行交易
        await executeTransaction(tx, toastInfo)

        setDepositAssetsLoading(false)
      } catch (error) {
        console.error('Failed to repay:', error)
        setDepositAssetsLoading(false)
        throw error
      }
    },
    [
      currentDeepBookPool,
      validatePoolAndToken,
      getValidatedMarginContext,
      validatePoolAssets,
      convertAmountToRawUnits,
      buildToastInfo,
      executeTransaction,
      setDepositAssetsLoading
    ]
  )

  return {
    createAndDeposit,
    deposit,
    withdraw,
    repay
  }
}
