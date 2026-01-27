import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetus/utils'
import { Transaction } from '@mysten/sui/transactions'
import { useCallback } from 'react'
import useGetDeepBookMarginBalance from './useGetDeepBookMarginBalance'
import useMarginOrderUtils from './useMarginOrderUtils'

/**
 * Margin Order 辅助函数 Hook
 * 包含处理借贷、抵押品存入等辅助逻辑
 */
export default function useMarginOrderHelpers() {
  const { currentAccount } = useAccountStore()
  const { currentDeepBookPool } = useDeepBookStore()

  // 从 store 读取 balance 数据
  const balanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return state.getMarginBalanceData('', '')
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address)
  })

  // 从 store 数据中提取需要的值
  const baseFreeBalance = balanceData.baseFreeBalance
  const quoteFreeBalance = balanceData.quoteFreeBalance

  // 如果需要 baseBalance 和 quoteBalance 对象，从 hook 获取（store 中没有存储这些对象）
  // 目前代码中未使用，但保留 hook 调用以防将来需要
  const { baseBalance, quoteBalance } = useGetDeepBookMarginBalance()

  const { convertAmountToRawUnits } = useMarginOrderUtils()

  /**
   * 处理借贷
   * 根据订单方向决定借贷的 token 类型（与抵押品类型无关）
   * @param borrowAmount - 借贷数量（Long: quote token 数量, Short: base token 数量）
   * @param priceInput - 订单价格（保留参数以保持接口兼容）
   * @param isBid - 订单方向：true = Long (买入 base)，false = Short (卖出 base)
   * @param leverage - 杠杆倍数（用于验证）
   * @param collateralAmounts - 抵押品数量（仅用于日志）
   */
  const handleBorrow = useCallback(
    async (
      tx: Transaction,
      marginUtils: any,
      managerId: string,
      poolInfo: any,
      borrowAmount: string,
      priceInput: string,
      isBid: boolean,
      leverage?: string
    ): Promise<void> => {
      const borrowAmountDecimal = d(borrowAmount)
      const leverageDecimal = leverage ? d(leverage) : d('1')

      if (borrowAmountDecimal.lte(0) && leverageDecimal.lte(1)) {
        return
      }

      if (isBid === true) {
        // Long 订单：借贷 quote token
        // borrowAmount 已经是 quote token 数量
        const quoteDecimals = poolInfo.quoteAssets.decimals || 0
        const borrowQuoteAmountRaw = borrowAmountDecimal
          .mul(d(Math.pow(10, quoteDecimals)))
          .ceil()
          .toString()

        console.log('[handleBorrow] Long - 借 quote token:', borrowAmountDecimal.toString())

        await marginUtils.borrowQuote(
          {
            marginManager: managerId,
            quoteMarginPool: poolInfo.quoteMarginPool,
            baseCoin: {
              coinType: poolInfo.baseAssets.coin_type,
              feed: poolInfo.baseAssets.feed
            },
            quoteCoin: {
              coinType: poolInfo.quoteAssets.coin_type,
              feed: poolInfo.quoteAssets.feed
            },
            pool: poolInfo.address,
            amount: borrowQuoteAmountRaw
          },
          tx
        )
      } else if (isBid === false) {
        // Short 订单：借贷 base token
        // borrowAmount 已经是 base token 数量，直接使用，不需要再除以价格
        const baseDecimals = poolInfo.baseAssets.decimals || 0
        const borrowBaseAmountRaw = borrowAmountDecimal
          .mul(d(Math.pow(10, baseDecimals)))
          .ceil()
          .toString()

        console.log('[handleBorrow] Short - 借 base token:')
        console.log('  - 借款数量 (human):', borrowAmountDecimal.toString())
        console.log('  - 借款数量 (raw):', borrowBaseAmountRaw)
        console.log('  - baseMarginPool:', poolInfo.baseMarginPool)
        console.log('  - 杠杆:', leverage)

        await marginUtils.borrowBase(
          {
            marginManager: managerId,
            baseMarginPool: poolInfo.baseMarginPool,
            baseCoin: {
              coinType: poolInfo.baseAssets.coin_type,
              feed: poolInfo.baseAssets.feed
            },
            quoteCoin: {
              coinType: poolInfo.quoteAssets.coin_type,
              feed: poolInfo.quoteAssets.feed
            },
            pool: poolInfo.address,
            amount: borrowBaseAmountRaw
          },
          tx
        )
      }
    },
    []
  )

  /**
   * 检查并处理保证金存入（如果需要）
   * 直接使用用户输入的 token，不进行转换
   * 同时检查手续费是否需要 deposit
   * 将存入操作添加到 transaction 中
   * @param collateralAmounts - 用户输入的抵押品数量 { base: string, quote: string }
   * @param isBid - 订单方向：true = Long, false = Short
   * @param priceInput - 订单价格（保留参数以保持接口兼容，但不影响逻辑）
   * @param feeAmount - 手续费金额（可选）
   * @param payWithDeep - 是否用 DEEP 支付手续费（可选）
   */
  // const handleCollateralDeposit = useCallback(
  //   async (
  //     tx: Transaction,
  //     marginUtils: any,
  //     managerId: string,
  //     poolInfo: any,
  //     collateralAmounts?: { base: string; quote: string },
  //     isBid?: boolean,
  //     priceInput?: string,
  //     feeAmount?: string,
  //     payWithDeep?: boolean
  //   ): Promise<void> => {
  //     if (!collateralAmounts) {
  //       return
  //     }

  //     const baseCollateral = d(collateralAmounts.base || '0')
  //     const quoteCollateral = d(collateralAmounts.quote || '0')
  //     const currentBaseFree = d(baseFreeBalance || '0')
  //     const currentQuoteFree = d(quoteFreeBalance || '0')

  //     // 计算需要 deposit 的数量（抵押品 + 手续费）
  //     let needDepositBase = d('0')
  //     let needDepositQuote = d('0')

  //     // 1. 计算抵押品需要 deposit 的数量
  //     if (baseCollateral.gt(currentBaseFree)) {
  //       needDepositBase = needDepositBase.add(baseCollateral.sub(currentBaseFree))
  //     }
  //     if (quoteCollateral.gt(currentQuoteFree)) {
  //       needDepositQuote = needDepositQuote.add(quoteCollateral.sub(currentQuoteFree))
  //     }

  //     // 2. 检查手续费是否需要 deposit
  //     // 手续费收取的 token 取决于订单方向和是否用 DEEP 支付：
  //     // - 如果用 DEEP 支付：手续费从钱包扣除，不需要 deposit 到 margin manager
  //     // - 如果不用 DEEP：Long 收 quote token，Short 收 base token
  //     if (feeAmount && d(feeAmount).gt(0) && !payWithDeep && isBid !== undefined) {
  //       const fee = d(feeAmount)

  //       if (isBid) {
  //         // Long: 手续费用 quote token 支付
  //         // 检查 margin balance + 即将 deposit 的 quote 是否足够支付手续费
  //         const availableQuote = currentQuoteFree.add(needDepositQuote)
  //         if (availableQuote.lt(quoteCollateral.add(fee))) {
  //           // 余额不足，需要额外 deposit 手续费
  //           const additionalDeposit = quoteCollateral.add(fee).sub(availableQuote)

  //           // 检查钱包是否有足够的 quote token 用于 deposit
  //           const walletQuoteBalance = d(quoteBalance?.balanceFormat || '0')
  //           if (walletQuoteBalance.lt(additionalDeposit)) {
  //             throw new Error(
  //               `Insufficient ${poolInfo.quoteAssets?.symbol || 'quote'} balance to pay fee. ` +
  //                 `Required: ${additionalDeposit.toString()}, ` +
  //                 `Available: ${walletQuoteBalance.toString()}. ` +
  //                 `Please ensure you have enough ${poolInfo.quoteAssets?.symbol || 'quote'} token in your wallet, ` +
  //                 `or enable "Pay with DEEP" option.`
  //             )
  //           }

  //           needDepositQuote = needDepositQuote.add(additionalDeposit)
  //           console.log('[handleCollateralDeposit] Long - 需要额外 deposit quote 手续费:', additionalDeposit.toString())
  //           console.log('[handleCollateralDeposit] 钱包 quote 余额:', walletQuoteBalance.toString())
  //         }
  //       } else {
  //         // Short: 手续费用 base token 支付
  //         // 检查 margin balance + 即将 deposit 的 base 是否足够支付手续费
  //         const availableBase = currentBaseFree.add(needDepositBase)
  //         if (availableBase.lt(baseCollateral.add(fee))) {
  //           // 余额不足，需要额外 deposit 手续费
  //           const additionalDeposit = baseCollateral.add(fee).sub(availableBase)

  //           // 检查钱包是否有足够的 base token 用于 deposit
  //           const walletBaseBalance = d(baseBalance?.balanceFormat || '0')
  //           if (walletBaseBalance.lt(additionalDeposit)) {
  //             throw new Error(
  //               `Insufficient ${poolInfo.baseAssets?.symbol || 'base'} balance to pay fee. ` +
  //                 `Required: ${additionalDeposit.toString()}, ` +
  //                 `Available: ${walletBaseBalance.toString()}. ` +
  //                 `Please ensure you have enough ${poolInfo.baseAssets?.symbol || 'base'} token in your wallet, ` +
  //                 `or enable "Pay with DEEP" option.`
  //             )
  //           }

  //           needDepositBase = needDepositBase.add(additionalDeposit)
  //           console.log('[handleCollateralDeposit] Short - 需要额外 deposit base 手续费:', additionalDeposit.toString())
  //           console.log('[handleCollateralDeposit] 钱包 base 余额:', walletBaseBalance.toString())
  //         }
  //       }
  //     }

  //     // 3. 执行 deposit 操作
  //     // Deposit base token（如果需要）
  //     if (needDepositBase.gt(0)) {
  //       const depositAmountRaw = convertAmountToRawUnits(needDepositBase.toString(), poolInfo.baseAssets.decimals || 0)
  //       const depositParams = {
  //         marginManager: managerId,
  //         baseCoin: {
  //           coinType: poolInfo.baseAssets.coin_type,
  //           feed: poolInfo.baseAssets.feed
  //         },
  //         quoteCoin: {
  //           coinType: poolInfo.quoteAssets.coin_type,
  //           feed: poolInfo.quoteAssets.feed
  //         },
  //         isBase: true,
  //         amount: depositAmountRaw,
  //         id: poolInfo.address
  //       }

  //       console.log('[handleCollateralDeposit] Deposit base token:', needDepositBase.toString())
  //       await marginUtils.deposit(depositParams, tx)
  //     }

  //     // Deposit quote token（如果需要）
  //     if (needDepositQuote.gt(0)) {
  //       const depositAmountRaw = convertAmountToRawUnits(needDepositQuote.toString(), poolInfo.quoteAssets.decimals || 0)
  //       const depositParams = {
  //         marginManager: managerId,
  //         baseCoin: {
  //           coinType: poolInfo.baseAssets.coin_type,
  //           feed: poolInfo.baseAssets.feed
  //         },
  //         quoteCoin: {
  //           coinType: poolInfo.quoteAssets.coin_type,
  //           feed: poolInfo.quoteAssets.feed
  //         },
  //         isBase: false,
  //         amount: depositAmountRaw,
  //         id: poolInfo.address
  //       }

  //       console.log('[handleCollateralDeposit] Deposit quote token:', needDepositQuote.toString())
  //       await marginUtils.deposit(depositParams, tx)
  //     }
  //   },
  //   [baseFreeBalance, quoteFreeBalance, baseBalance, quoteBalance, convertAmountToRawUnits]
  // )

  return {
    handleBorrow
    // handleCollateralDeposit
  }
}
