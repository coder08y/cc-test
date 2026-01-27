import useTransaction from '@/hooks/common/useTransaction'
import useDeepBookMarginManager from '@/hooks/deepbook/margin/useDeepBookMarginManager'
import useDeepbookMarginDebt from '@/hooks/deepbook/margin/useDeepbookMarginDebt'
import useGetDeepBookMarginBalance from '@/hooks/deepbook/margin/useGetDeepBookMarginBalance'
import usePlaceMarginOrder from '@/hooks/deepbook/margin/useMarginOrderActions'
import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { CetusTooltip, TooltipIcon } from '@cetus/design'
import { useAccountBalance } from '@cetus/hooks'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { Icon, NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import { abbreviateTokenName, d, formatNumber, formatPriceWithDown, formatUSDPrice } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { Transaction } from '@mysten/sui/transactions'
import { SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSideFilter } from '../../../hooks/deepbook/useSideFilter'
import CoinPairInfo from '../../common/CoinPairInfo'
import MobileOrderList, { MobileOrderListField } from '../MobileOrderList'
import SideBadge from '../SideBadge'
import ClosePositionModal from './ClosePositionModal'
import MarginRiskLevelModal from './MarginRiskLevelModal'

export default function PositionsTableBlock({
  sideType,
  setSideType,
  instrumentType,
  setInstrumentType
}: {
  sideType: string
  setSideType: (val: string) => void
  instrumentType: string
  setInstrumentType: (val: string) => void
}) {
  // ===== Stores & Hooks =====
  const {
    currentDeepBookPool,
    deepBookPools,
    isCheckedAllMarkets,
    deepBookOpenOrders,
    setShowPositionsNum,
    orderListLoading,
    currentBalanceManagerInfoMap
  } = useDeepBookStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { type, handleTypeChangeDirect, filterOrders } = useSideFilter()
  const { isApp } = useWindowWidth()
  const { marginManagerByAccount, getMarginBalanceData, getMarginDebt, marginManagerByAccountOwner, currentMarginManagerInfoMap } = useMarginStore()
  // 使用 selector 订阅 marginBalanceData，确保数据更新时触发重新渲染
  const marginBalanceData = useMarginStore((state: any) => state.marginBalanceData)

  // 订阅 fetching 状态（直接订阅 store 状态，而不是函数）
  const balanceFetching = useMarginStore((state: any) => state.balanceFetching)
  const debtFetching = useMarginStore((state: any) => state.debtFetching)
  const { cancelAllMarginOrders, isLoading: isCancellingOrders } = usePlaceMarginOrder()
  const { deepBookSDK } = usePeripherySDKStore()
  const { transactionConfirmation } = useTransactionModal()
  const { signAndExecuteTransaction } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { fetchAccountBalance } = useAccountBalance()
  // 调用 hook 以确保数据被更新到 store（hook 内部会更新 store，触发批量获取逻辑）
  const { refreshMarginBalances } = useGetDeepBookMarginBalance()
  const { refreshMarginDebt } = useDeepbookMarginDebt()
  const { getMarginManagerByAccount } = useDeepBookMarginManager()

  // 监听 marginDebts 的变化，确保数据更新时重新计算
  const marginDebts = useMarginStore((state: any) => state.marginDebts)

  // 在 H5 下使用父组件传递的筛选状态
  const effectiveType = isApp ? sideType : type
  const effectiveSetType = isApp ? setSideType : handleTypeChangeDirect

  // ===== Loading State =====
  // 检查所有 margin pools 的 balance 和 debt 是否正在加载
  // 排除弹窗打开时的数据获取，避免弹窗打开时列表一直 loading
  const isOpenAssetsActionModal = useDeepBookStore(state => state.isOpenAssetsActionModal)
  const [modalJustClosed, setModalJustClosed] = useState(false)

  // 监听弹窗关闭，设置一个短暂的延迟，避免关闭弹窗后立即显示 loading
  const prevIsOpenRef = useRef(isOpenAssetsActionModal)
  useEffect(() => {
    // 检测弹窗从打开变为关闭
    if (prevIsOpenRef.current && !isOpenAssetsActionModal) {
      // 弹窗刚关闭，设置一个短暂的延迟，避免立即显示 loading
      setModalJustClosed(true)
      const timer = setTimeout(() => {
        setModalJustClosed(false)
      }, 500) // 500ms 后恢复正常 loading 检查
      return () => clearTimeout(timer)
    }
    // 更新 ref
    prevIsOpenRef.current = isOpenAssetsActionModal
  }, [isOpenAssetsActionModal])

  const positionsLoading = useMemo(() => {
    // 如果弹窗打开，不显示 loading（避免弹窗打开时列表一直 loading）
    if (isOpenAssetsActionModal) {
      return false
    }

    // 如果弹窗刚关闭，不显示 loading（避免关闭弹窗后立即显示 loading）
    if (modalJustClosed) {
      return false
    }

    if (!currentAccount?.address) {
      return false
    }

    // 如果 manager 还在加载中（marginManagerByAccountOwner 为 null），显示 loading
    if (marginManagerByAccountOwner === null) {
      return true
    }

    // 如果 manager 已加载完成但没有数据，不显示 loading
    if (!marginManagerByAccount || marginManagerByAccount.length === 0) {
      return false
    }

    // 检查是否有任何一个 pool 正在加载 balance 或 debt
    for (const manager of marginManagerByAccount) {
      const poolAddress = manager.deepbook_pool_id
      if (poolAddress) {
        const key = `${currentAccount.address}-${poolAddress}`
        const isBalanceLoading = balanceFetching[key] || false
        const isDebtLoading = debtFetching[key] || false
        if (isBalanceLoading || isDebtLoading) {
          return true
        }
      }
    }

    return false
  }, [
    currentAccount?.address,
    marginManagerByAccount,
    marginManagerByAccountOwner,
    balanceFetching,
    debtFetching,
    isOpenAssetsActionModal,
    modalJustClosed
  ])
  const [closePositionModalOpen, setClosePositionModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<any>(null)

  // ===== Handlers =====
  const handleOpenClosePositionModal = (item: any) => {
    setSelectedPosition(item)
    setClosePositionModalOpen(true)
  }

  const handleClosePosition = async () => {
    if (!selectedPosition?.address || !currentAccount?.address) {
      console.error('No position selected or no account')
      return
    }

    try {
      // 获取池子信息
      const pool = deepBookPools?.find((p: any) => p.address === selectedPosition.address) as any
      if (!pool) {
        console.error('Pool not found:', selectedPosition.address)
        return
      }

      // 获取 margin manager ID
      const marginManager = marginManagerByAccount?.find((m: any) => m.deepbook_pool_id === selectedPosition.address)
      const marginManagerId = marginManager?.margin_manager_id

      if (!marginManagerId) {
        console.error('Margin manager not found for pool:', selectedPosition.address)
        return
      }

      // 获取债务和余额数据（使用 marginManagerId 区分不同的 Manager）
      const debtData = getMarginDebt(currentAccount.address, selectedPosition.address)
      const balanceData = getMarginBalanceData(currentAccount.address, selectedPosition.address, marginManagerId)

      const baseDebt = d(debtData.baseDebt || '0')
      const quoteDebt = d(debtData.quoteDebt || '0')
      const baseTotalBalance = d(balanceData.baseTotalBalance || '0')
      const quoteTotalBalance = d(balanceData.quoteTotalBalance || '0')

      // 计算要提取的资产（总余额）
      const baseWithdrawAmount = baseTotalBalance
      const quoteWithdrawAmount = quoteTotalBalance

      // 创建 toast 信息
      const toastInfo = {
        getShowInfo: (status: any) => {
          const description = 'Close Position'
          const info: any = {
            modalDescriptionText: description,
            toastTitleText: description
          }
          if (status === 'success') {
            info.toastDescriptionContent = 'Position closed successfully'
            info.modalDescriptionText = 'Position closed successfully'
            info.toastTitleText = 'Close Position successful'
          }
          return info
        }
      }

      transactionConfirmation(toastInfo)

      const marginUtils = (deepBookSDK as any)?.MarginUtils || (deepBookSDK as any)?._marginUtils
      if (!marginUtils) {
        throw new Error('MarginUtils is not available')
      }

      // 创建交易对象
      const tx = new Transaction()

      // 1. 取消所有订单
      await marginUtils.cancelAllMarginOrders(
        {
          marginManager: marginManagerId,
          poolInfo: {
            id: pool.address,
            baseCoin: {
              coinType: pool.baseAssets.coin_type,
              decimals: pool.baseAssets.decimals
            },
            quoteCoin: {
              coinType: pool.quoteAssets.coin_type,
              decimals: pool.quoteAssets.decimals
            }
          }
        },
        tx
      )

      // 2. 偿还 base 债务（如果有）
      if (baseDebt.gt(0)) {
        const baseDebtRaw = d(baseDebt)
          .mul(Math.pow(10, pool.baseAssets.decimals || 0))
          .toFixed(0)

        await marginUtils.repay(
          {
            marginManager: marginManagerId,
            baseCoin: {
              coinType: pool.baseAssets.coin_type,
              feed: pool.baseAssets.feed as string,
              decimals: pool.baseAssets.decimals
            },
            quoteCoin: {
              coinType: pool.quoteAssets.coin_type,
              feed: pool.quoteAssets.feed as string,
              decimals: pool.quoteAssets.decimals
            },
            amount: baseDebtRaw,
            baseMarginPool: pool.baseMarginPool,
            quoteMarginPool: pool.quoteMarginPool,
            isBase: true
          },
          tx
        )
      }

      // 3. 偿还 quote 债务（如果有）
      if (quoteDebt.gt(0)) {
        const quoteDebtRaw = d(quoteDebt)
          .mul(Math.pow(10, pool.quoteAssets.decimals || 0))
          .toFixed(0)

        await marginUtils.repay(
          {
            marginManager: marginManagerId,
            baseCoin: {
              coinType: pool.baseAssets.coin_type,
              feed: pool.baseAssets.feed as string,
              decimals: pool.baseAssets.decimals
            },
            quoteCoin: {
              coinType: pool.quoteAssets.coin_type,
              feed: pool.quoteAssets.feed as string,
              decimals: pool.quoteAssets.decimals
            },
            baseMarginPool: pool.baseMarginPool,
            quoteMarginPool: pool.quoteMarginPool,
            isBase: false,
            amount: quoteDebtRaw
          },
          tx
        )
      }

      // tx实时计算剩余
      const [base, quote] = await tx.moveCall({
        target: `${deepBookSDK.sdkOptions.deepbook.margin_package_id}::margin_manager::calculate_assets`,
        arguments: [tx.object(marginManagerId), tx.object(pool.address)],
        typeArguments: [pool.baseAssets.coin_type, pool.quoteAssets.coin_type]
      })

      // 模拟交易获取下余额判断是否要提取
      const { baseAsset, quoteAsset } = await marginUtils.calculateAssets({
        account: currentAccount.address,
        marginManager: marginManagerId,
        pool: pool.address,
        baseCoin: {
          coinType: pool.baseAssets.coin_type,
          feed: pool.baseAssets.feed as string,
          scalar: pool.baseAssets.decimals
        },
        quoteCoin: {
          coinType: pool.quoteAssets.coin_type,
          feed: pool.quoteAssets.feed as string,
          scalar: pool.quoteAssets.decimals
        }
      })

      const feedIdsMap: any = await deepBookSDK.PythPrice.updatePythPriceIDs([pool.baseAssets.feed, pool.quoteAssets.feed], tx)
      const basePriceFeedObjectId = feedIdsMap.get(pool.baseAssets.feed)
      const quotePriceFeedObjectId = feedIdsMap.get(pool.quoteAssets.feed)

      // 有抵押资产或者债务，偿还后会有剩余资产，需要提取
      if (d(baseAsset).gt(0) || d(baseDebt).gt(0)) {
        const coin = await tx.moveCall({
          target: `${deepBookSDK.sdkOptions.margin_utils.published_at}::margin_utils::withdraw`,
          arguments: [
            tx.object(deepBookSDK.sdkOptions.margin_utils.global_config_id),
            tx.object(deepBookSDK.sdkOptions.margin_utils.versioned_id),
            tx.object(marginManagerId),
            tx.object(deepBookSDK.sdkOptions.margin_utils.margin_registry_id),
            tx.object(pool.baseMarginPool),
            tx.object(pool.quoteMarginPool),
            tx.object(basePriceFeedObjectId),
            tx.object(quotePriceFeedObjectId),
            tx.object(pool.address),
            base,
            tx.object(SUI_CLOCK_OBJECT_ID)
          ],
          typeArguments: [pool.baseAssets.coin_type, pool.quoteAssets.coin_type, pool.baseAssets.coin_type]
        })

        tx.transferObjects([coin], currentAccount.address)
      }

      // 有抵押资产或者债务，偿还后会有剩余资产，需要提取
      if (d(quoteAsset).gt(0) || d(quoteDebt).gt(0)) {
        const coin = await tx.moveCall({
          target: `${deepBookSDK.sdkOptions.margin_utils.published_at}::margin_utils::withdraw`,
          arguments: [
            tx.object(deepBookSDK.sdkOptions.margin_utils.global_config_id),
            tx.object(deepBookSDK.sdkOptions.margin_utils.versioned_id),
            tx.object(marginManagerId),
            tx.object(deepBookSDK.sdkOptions.margin_utils.margin_registry_id),
            tx.object(pool.baseMarginPool),
            tx.object(pool.quoteMarginPool),
            tx.object(basePriceFeedObjectId),
            tx.object(quotePriceFeedObjectId),
            tx.object(pool.address),
            quote,
            tx.object(SUI_CLOCK_OBJECT_ID)
          ],
          typeArguments: [pool.baseAssets.coin_type, pool.quoteAssets.coin_type, pool.quoteAssets.coin_type]
        })

        tx.transferObjects([coin], currentAccount.address)
      }

      // 执行交易
      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams: {}
      })

      if (res) {
        // 成功：刷新数据
        try {
          // 先刷新 margin manager 信息
          await getMarginManagerByAccount()

          // 等待一小段时间确保 store 更新完成
          await new Promise(resolve => setTimeout(resolve, 1000))

          // 然后刷新所有余额、债务和钱包余额
          await Promise.all([
            fetchAccountBalance(), // 刷新钱包余额
            refreshMarginBalances(), // 刷新 Manager 账户资产
            refreshMarginDebt() // 刷新债务数据
          ])

          // 延迟后再刷新一次，确保数据同步
          setTimeout(async () => {
            await Promise.all([fetchAccountBalance(), refreshMarginBalances(), refreshMarginDebt()])
          }, 3000)
        } catch (refreshError) {
          console.error('Failed to refresh data after closing position:', refreshError)
        }

        // 关闭弹窗
        setClosePositionModalOpen(false)
        setSelectedPosition(null)
      }
    } catch (error) {
      console.error('Failed to close position:', error)
      // 错误处理：可以在这里显示错误提示
      throw error
    }
  }

  const currentBalanceManagerInfo = useMemo(() => {
    const address = currentAccount?.address
    if (!address) return null
    // 验证存储的 margin manager 是否属于当前池子
    const storedInfo = (currentMarginManagerInfoMap as Record<string, any>)[address]
    // 验证存储的 margin manager 是否属于当前池子
    if (storedInfo && currentDeepBookPool?.address) {
      const belongsToCurrentPool = (marginManagerByAccount as any[])?.some(
        (m: any) => m?.margin_manager_id === storedInfo?.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPool.address
      )
      if (belongsToCurrentPool) {
        return storedInfo
      }
    }
    return null
  }, [currentAccount?.address, currentMarginManagerInfoMap, currentBalanceManagerInfoMap, currentDeepBookPool?.address, marginManagerByAccount])

  // ===== 获取持仓数据 =====
  // 根据 ManagerAccount (marginManagerByAccount) 分类持仓
  // 注意：当弹窗打开时，使用缓存的数据，避免数据变化导致 Position value 变化
  const dataSourceRef = useRef<any[]>([])
  const dataSource = useMemo(() => {
    if (!currentAccount?.address || !marginManagerByAccount || marginManagerByAccount.length === 0) {
      dataSourceRef.current = []
      return []
    }

    // 按池子地址分组订单（用于后续查找订单）
    const ordersByAddress = (deepBookOpenOrders || [])
      .filter((order: any) => order.instrument === 'Margin')
      .reduce((acc: Record<string, any[]>, order: any) => {
        const address = order?.address
        if (!address) return acc

        if (!acc[address]) {
          acc[address] = []
        }
        acc[address].push(order)
        return acc
      }, {})

    const positions: any[] = []

    // 遍历每个 ManagerAccount，创建 position
    marginManagerByAccount.forEach((manager: any) => {
      const address = manager.deepbook_pool_id
      const marginManagerId = manager.margin_manager_id

      if (!address || !marginManagerId) return

      // 查找对应的池子信息
      const pool = deepBookPools.find((p: any) => p.address === address) as any
      if (!pool || !pool?.baseAssets || !pool?.quoteAssets) return

      // 获取该池子下的所有订单（如果有）
      const orders = ordersByAddress[address] || []

      // 统计该池子的订单信息
      const marginOrders = orders.filter((o: any) => o.instrument === 'Margin')
      const spotOrders = orders.filter((o: any) => o.instrument === 'Spot')

      // 计算总订单数量
      const totalOrdersCount = orders.length
      const marginOrdersCount = marginOrders.length
      const spotOrdersCount = spotOrders.length

      // 计算 locked balance（订单中锁定的数量）
      const totalLockedQuantity = orders.reduce((sum: any, order: any) => {
        return d(sum).plus(d(order.originalQuantity || '0').minus(order.filledQuantity || '0'))
      }, d(0))

      // 判断持仓方向（如果有 margin 订单）
      let side = '--'
      if (marginOrders.length > 0) {
        // 根据 margin 订单的 side 判断
        const longOrders = marginOrders.filter((o: any) => o.side === 'Long' || o.side === 'Buy')
        const shortOrders = marginOrders.filter((o: any) => o.side === 'Short' || o.side === 'Sell')

        if (longOrders.length > shortOrders.length) {
          side = 'Long'
        } else if (shortOrders.length > longOrders.length) {
          side = 'Short'
        } else if (longOrders.length > 0) {
          side = 'Long' // 默认显示 Long
        }
      }

      // 从 Manager 账户读取 Total Collateral 数据（使用 managerId 区分不同的 Manager）
      const balanceData = currentAccount?.address
        ? getMarginBalanceData(currentAccount.address, address, marginManagerId)
        : {
            totalCollateralValue: '0',
            baseTotalBalance: '0',
            quoteTotalBalance: '0',
            baseTotalBalanceUSD: '0',
            quoteTotalBalanceUSD: '0',
            baseFreeBalance: '0',
            quoteFreeBalance: '0',
            baseLockedBalance: '0',
            quoteLockedBalance: '0',
            baseMarginBalanceUSD: '0',
            quoteMarginBalanceUSD: '0',
            baseLockedBalanceUSD: '0',
            quoteLockedBalanceUSD: '0'
          }

      // 从 Manager 账户读取 Total Debt 数据
      const debtData = currentAccount?.address
        ? getMarginDebt(currentAccount.address, address)
        : {
            baseDebt: '0',
            quoteDebt: '0',
            baseDebtUSD: '0',
            quoteDebtUSD: '0',
            totalDebtValue: '0'
          }

      // 获取池子的风险比率配置
      const poolIsMarginPool = (pool as any).isMarginPool
      const poolLiquidationRiskRatio = (pool as any).liquidationRiskRatio
      const poolMinBorrowRiskRatio = (pool as any).minBorrowRiskRatio
      const poolMinWithdrawRiskRatio = (pool as any).minWithdrawRiskRatio

      // 计算清算价格
      let liquidationPrice: string | null = null
      if (poolIsMarginPool && poolLiquidationRiskRatio) {
        const LR = d(poolLiquidationRiskRatio)
        const Collateral_base = d(balanceData.baseTotalBalance || '0')
        const Collateral_quote = d(balanceData.quoteTotalBalance || '0')
        const Debt_base = d(debtData.baseDebt || '0')
        const Debt_quote = d(debtData.quoteDebt || '0')

        // 检查是否有债务
        const hasBaseDebt = Debt_base.gt(0)
        const hasQuoteDebt = Debt_quote.gt(0)
        const hasBaseCollateral = Collateral_base.gt(0)
        const hasQuoteCollateral = Collateral_quote.gt(0)

        // 检查是否有债务，如果没有债务则不需要计算清算价格
        if (hasBaseDebt || hasQuoteDebt) {
          // 检查 Collateral 和 Debt 是否完全相同的 token
          // 如果 Collateral 和 Debt 为完全相同 token（都只有 base 或都只有 quote），则不计算（不存在价格风险，仅为数量风险）
          const isOnlyBase = hasBaseCollateral && !hasQuoteCollateral && hasBaseDebt && !hasQuoteDebt
          const isOnlyQuote = !hasBaseCollateral && hasQuoteCollateral && !hasBaseDebt && hasQuoteDebt

          if (!isOnlyBase && !isOnlyQuote) {
            let Price_liq: ReturnType<typeof d> | null = null

            // 情况1：Debt 为 quote token
            // 清算条件：(Collateral_quote + Collateral_base * Price_liq) / Debt_quote = LR
            // 推导：Price_liq = (LR * Debt_quote - Collateral_quote) / Collateral_base
            if (Debt_quote.gt(0) && Collateral_base.gt(0)) {
              const numerator = LR.mul(Debt_quote).sub(Collateral_quote)
              // 放宽检查条件：允许计算，无效值会在后续检查中被过滤
              Price_liq = numerator.div(Collateral_base)
            }

            // 情况2：Debt 为 base token（如果没有 quote debt 或计算失败）
            // 清算条件：(Collateral_quote + Collateral_base * Price_liq) / (Debt_base * Price_liq) = LR
            // 推导：Price_liq = Collateral_quote / (LR * Debt_base - Collateral_base)
            // 注意：放宽检查条件，允许计算，即使 Collateral_quote = 0，无效值会在后续被过滤
            if (!Price_liq && Debt_base.gt(0)) {
              const denominator = LR.mul(Debt_base).sub(Collateral_base)
              // 放宽检查条件：允许计算，无效值会在后续检查中被过滤
              // 如果 denominator = 0，Price_liq 会是 Infinity，会在后续被过滤
              if (!denominator.eq(0)) {
                Price_liq = Collateral_quote.div(denominator)
              }
            }

            // 验证清算价格是否有效
            if (Price_liq && Price_liq.gt(0) && Price_liq.isFinite() && !Price_liq.isNaN()) {
              liquidationPrice = Price_liq.toString()
            }
          }
        }
      }

      // 创建 position 对象
      positions.push({
        address: pool.address,
        baseAssets: pool.baseAssets,
        quoteAssets: pool.quoteAssets,
        instrument: marginOrders.length > 0 ? 'Margin' : 'Spot',
        side,
        totalOrdersCount,
        marginOrdersCount,
        spotOrdersCount,
        totalLockedQuantity: totalLockedQuantity.toString(),
        totalCollateralValue: balanceData.totalCollateralValue || '0',
        baseTotalBalance: balanceData.baseTotalBalance || '0',
        quoteTotalBalance: balanceData.quoteTotalBalance || '0',
        baseTotalBalanceUSD: balanceData.baseTotalBalanceUSD || '0',
        quoteTotalBalanceUSD: balanceData.quoteTotalBalanceUSD || '0',
        baseFreeBalance: balanceData.baseFreeBalance || '0',
        quoteFreeBalance: balanceData.quoteFreeBalance || '0',
        baseLockedBalance: balanceData.baseLockedBalance || '0',
        quoteLockedBalance: balanceData.quoteLockedBalance || '0',
        baseFreeBalanceUSD: balanceData.baseMarginBalanceUSD || '0',
        quoteFreeBalanceUSD: balanceData.quoteMarginBalanceUSD || '0',
        baseLockedBalanceUSD: balanceData.baseLockedBalanceUSD || '0',
        quoteLockedBalanceUSD: balanceData.quoteLockedBalanceUSD || '0',
        baseDebt: debtData.baseDebt || '0',
        quoteDebt: debtData.quoteDebt || '0',
        baseDebtUSD: debtData.baseDebtUSD || '0',
        quoteDebtUSD: debtData.quoteDebtUSD || '0',
        totalDebtValue: debtData.totalDebtValue || '0',
        baseBalance: '0', // 需要从实际数据获取
        quoteBalance: '0', // 需要从实际数据获取
        entryPrice: '0', // 需要从实际数据获取
        markPrice: pool.price || '0',
        liquidationPrice: liquidationPrice || null,
        liquidationRiskRatio: poolLiquidationRiskRatio || null,
        minBorrowRiskRatio: poolMinBorrowRiskRatio || null,
        minWithdrawRiskRatio: poolMinWithdrawRiskRatio || null,
        pnl: '0', // 需要计算
        leverage: '1x', // 需要计算
        orders, // 保存该池子的所有订单
        pool,
        marginManagerId
      })
    })

    // 应用筛选
    let filtered = positions

    // 如果 allMarket 未选中，只显示当前 market 的 position
    if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
      filtered = filtered.filter((pos: any) => {
        return pos.address === currentDeepBookPool.address
      })
    }

    if (effectiveType && !effectiveType.split(',').includes('All')) {
      const types = effectiveType.split(',')
      filtered = filtered.filter((pos: any) => types.includes(pos.side))
    }

    // 过滤掉抵押物和债务都为 0 的 position
    filtered = filtered.filter((pos: any) => {
      const totalCollateral = d(pos.totalCollateralValue || '0')
      const totalDebt = d(pos.totalDebtValue || '0')
      // 只有当抵押物或债务至少有一个大于 0 时才显示
      return totalCollateral.gt(0) || totalDebt.gt(0)
    })

    // 更新缓存（仅在弹窗未打开时更新）
    if (!isOpenAssetsActionModal) {
      dataSourceRef.current = filtered
    }

    return filtered
  }, [
    currentAccount?.address,
    deepBookOpenOrders,
    deepBookPools,
    effectiveType,
    marginBalanceData,
    marginDebts,
    isOpenAssetsActionModal,
    isCheckedAllMarkets,
    currentDeepBookPool?.address,
    currentBalanceManagerInfo
  ])

  // 当弹窗打开时，使用缓存的数据，避免数据变化导致 Position value 变化
  const finalDataSource = isOpenAssetsActionModal ? dataSourceRef.current : dataSource

  // 更新 Positions 数量到 store（使用过滤后的 dataSource 长度，排除抵押物和债务都为 0 的 position）
  useEffect(() => {
    // 使用过滤后的 dataSource 长度，而不是 marginManagerByAccount 的长度
    const positionsCount = dataSource?.length || 0
    setShowPositionsNum(positionsCount)
  }, [dataSource, setShowPositionsNum])

  // ===== Mobile fields configuration =====
  const mobileFields: MobileOrderListField[] = useMemo(
    () => [
      {
        key: 'instrumentType',
        label: 'Instrument',
        render: (item: any) => (
          <Box
            borderRadius={'4px'}
            bg="primary_opacity.10"
            p="0 8px"
            color="primary"
            height={'20px'}
            lineHeight={'20px'}
            display={'inline-block'}
            sx={{
              ...(item?.instrument === 'Margin' && {
                background: 'linear-gradient( 270deg, rgba(104,255,216,0.1) 0%, rgba(255,80,115,0.1) 99.99%) !important'
              })
            }}
          >
            <Text
              fontSize="12px"
              sx={{
                ...(item?.instrument === 'Margin'
                  ? {
                      background: 'linear-gradient( 270deg, rgba(104,255,216,1) 0%, rgba(255,80,115,1) 99.99%) !important',
                      '-webkit-background-clip': 'text !important',
                      '-webkit-text-fill-color': 'transparent !important'
                    }
                  : {
                      color: 'primary'
                    })
              }}
            >
              {item?.instrument}
            </Text>
          </Box>
        )
      },
      {
        key: 'side',
        label: 'Side',
        render: (item: any) => <SideBadge side={item?.side} />
      },
      {
        key: 'positionSize',
        label: 'Position Size',
        render: (item: any) => (
          <HStack justify="flex-end" gap="4px">
            <Text fontSize="12px" color="text_caption">
              {formatNumber(item?.baseBalance || '0')}
            </Text>
            <Text fontSize="12px" color="text_caption">
              {item?.baseAssets?.symbol || ''}
            </Text>
          </HStack>
        )
      },
      {
        key: 'pnl',
        label: 'PnL',
        render: (item: any) => {
          const pnl = d(item?.pnl || '0')
          const isPositive = pnl.gte(0)
          return (
            <Text fontSize="12px" color={isPositive ? 'primary_green' : 'primary_red'}>
              {isPositive ? '+' : ''}
              {formatNumber(pnl.toString())}
            </Text>
          )
        }
      }
    ],
    []
  )

  // ===== Render Mobile or Desktop =====
  if (isApp) {
    return (
      <>
        <ClosePositionModal
          isOpen={closePositionModalOpen}
          onClose={() => {
            setClosePositionModalOpen(false)
            setSelectedPosition(null)
          }}
          onConfirm={handleClosePosition}
          poolAddress={selectedPosition?.address || ''}
          ordersCount={selectedPosition?.totalOrdersCount || 0}
        />
        <MobileOrderList
          dataSource={finalDataSource}
          fields={mobileFields}
          loading={!currentAccount?.address ? false : positionsLoading}
          noDataText="No open positions"
          noDataType={!currentAccount?.address ? 'nowallet' : 'nodata'}
          onWalletConnect={() => onWalletModal(true)}
          showProgress={false}
          actions={(item: any) => (
            <Button
              variant="outline"
              borderRadius="6px"
              p="2px 6px"
              h={'24px'}
              fontSize="12px"
              color="text_paragraph"
              onClick={() => {
                handleOpenClosePositionModal(item)
              }}
            >
              Close
            </Button>
          )}
        />
      </>
    )
  }

  // 在组件中
  const [riskLevelModalData, setRiskLevelModalData] = useState<any>(null)

  return (
    <Box w="100%" h="100%" display="flex" flexDirection="column" overflow="auto">
      <ClosePositionModal
        isOpen={closePositionModalOpen}
        onClose={() => {
          setClosePositionModalOpen(false)
          setSelectedPosition(null)
        }}
        onConfirm={handleClosePosition}
        poolAddress={selectedPosition?.address || ''}
        ordersCount={selectedPosition?.totalOrdersCount || 0}
        isLoading={isCancellingOrders}
      />

      <MarginRiskLevelModal
        isOpen={riskLevelModalData?.isRiskLevelModalOpen}
        onClose={() =>
          setRiskLevelModalData({
            isRiskLevelModalOpen: false,
            poolAddress: null
          })
        }
        poolAddress={riskLevelModalData?.poolAddress}
      />
      <Table
        dataSource={finalDataSource}
        columns={getColumns({
          type: effectiveType,
          handleTypeChange: effectiveSetType,
          onClosePosition: handleOpenClosePositionModal,
          orderListLoading: orderListLoading || false,
          deepBookOpenOrders: deepBookOpenOrders || [],
          currentAccount,
          setRiskLevelModalData
        })}
        loading={!currentAccount?.address ? false : positionsLoading}
        fixedHeader
        headBg={'bg_secondary'}
        trPadding="4px"
        rowStyle={{
          _hover: {
            borderRadius: '6px !important',
            'td:first-of-type': {
              borderRadius: '6px 0 0 6px !important'
            },
            'td:last-of-type': {
              borderRadius: '0 6px 6px 0 !important'
            }
          }
        }}
        tableContainerWrapStyle={{
          h: '100%'
        }}
        sx={{
          'thead tr > th:first-of-type': {
            pl: '12px !important'
          },
          'tbody tr td:first-of-type': {
            pl: '12px !important'
          },
          'thead tr > th:last-of-type': {
            pr: '12px !important'
          },
          'tbody tr td:last-of-type': {
            pr: '12px !important'
          }
        }}
        noData={
          !currentAccount?.address ? (
            <NoData imgSize="100px" type="nowallet" noBorder bg="none" onboard={() => onWalletModal(true)} />
          ) : dataSource?.length === 0 ? (
            <NoData imgSize="100px" type="nodata" text="No open positions" noBorder bg="none" />
          ) : undefined
        }
      />
    </Box>
  )
}

interface GetColumnsParams {
  type: string
  handleTypeChange: (val: string) => void
  onClosePosition: (item: any) => void
  orderListLoading: boolean
  deepBookOpenOrders: any[]
  currentAccount: any
  setRiskLevelModalData: (data: any) => void
}

const getColumns = ({
  type,
  handleTypeChange,
  onClosePosition,
  orderListLoading,
  deepBookOpenOrders,
  currentAccount,
  setRiskLevelModalData
}: GetColumnsParams) => {
  const openAssetsActionModal = useDeepBookStore(state => state.openAssetsActionModal)

  return [
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Market
        </Text>
      ),
      key: '#',
      thConfig: {
        w: '20%'
      },
      render: (item: any) => {
        return (
          <HStack h="32px">
            <CoinPairInfo
              poolInfo={{
                displayTokenA: item?.baseAssets,
                displayTokenB: item?.quoteAssets,
                poolAddress: item?.address
              }}
              symbolFontSize="12px"
              imgStyle={{
                w: '20px',
                h: '20px'
              }}
              showFee={false}
            />
          </HStack>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Position value
          </Text>
          <TooltipIcon tooltipCon="Total collateral value - Total debt value" iconSize="16px"></TooltipIcon>
        </HStack>
      ),
      key: 'positionValue',
      thConfig: {
        w: '15%'
      },
      tdConfig: {
        textAlign: 'left !important' as const,
        justifyContent: 'flex-start'
      },
      render: (item: any) => {
        // Position value = Total Collateral Value - Total Debt Value
        const totalCollateral = d(item?.totalCollateralValue || '0')
        const totalDebt = d(item?.totalDebtValue || '0')
        const positionValue = totalCollateral.sub(totalDebt)

        return (
          <Text fontSize="12px" color="text_caption" textAlign="left">
            ${formatNumber(positionValue.toString(), 2)}
          </Text>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Total Collateral
          </Text>
          <TooltipIcon
            tooltipCon="The total value of assets in your DeepBook margin account that are counted as collateral, including free, locked, and settled balances"
            iconSize="16px"
          ></TooltipIcon>
        </HStack>
      ),
      key: 'totalCollateral',
      thConfig: {
        w: '10%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const totalCollateral = d(item?.totalCollateralValue || '0')
        const baseFreeBalance = d(item?.baseFreeBalance || '0')
        const quoteFreeBalance = d(item?.quoteFreeBalance || '0')
        const baseLockedBalance = d(item?.baseLockedBalance || '0')
        const quoteLockedBalance = d(item?.quoteLockedBalance || '0')
        const baseFreeBalanceUSD = item?.baseFreeBalanceUSD || '0'
        const quoteFreeBalanceUSD = item?.quoteFreeBalanceUSD || '0'
        const baseLockedBalanceUSD = item?.baseLockedBalanceUSD || '0'
        const quoteLockedBalanceUSD = item?.quoteLockedBalanceUSD || '0'
        const baseAssets = item?.baseAssets
        const quoteAssets = item?.quoteAssets

        // 检查是否有 locked balance 和 free balance
        const hasLockedBalance = baseLockedBalance.gt(0) || quoteLockedBalance.gt(0)
        const hasFreeBalance = baseFreeBalance.gt(0) || quoteFreeBalance.gt(0)

        // 构建 tooltip 内容：显示抵押资产数量（与 DeepBook Balance 格式一致）
        // 分为 Locked 和 Free Balance 两个部分
        const tooltipItems: Array<{ label: string; items: Array<{ balance: string; balanceUSD: string; iconUrl?: string; symbol: string }> }> = []

        // Locked Balance 部分
        if (hasLockedBalance) {
          const lockedItems = []
          if (baseLockedBalance.gt(0)) {
            lockedItems.push({
              balance: baseLockedBalance.toString(),
              balanceUSD: baseLockedBalanceUSD,
              iconUrl: baseAssets?.icon_url,
              symbol: baseAssets?.symbol || ''
            })
          }
          if (quoteLockedBalance.gt(0)) {
            lockedItems.push({
              balance: quoteLockedBalance.toString(),
              balanceUSD: quoteLockedBalanceUSD,
              iconUrl: quoteAssets?.icon_url,
              symbol: quoteAssets?.symbol || ''
            })
          }
          if (lockedItems.length > 0) {
            tooltipItems.push({ label: 'Locked', items: lockedItems })
          }
        }

        // Free Balance 部分
        if (hasFreeBalance) {
          const freeItems = []
          if (baseFreeBalance.gt(0)) {
            freeItems.push({
              balance: baseFreeBalance.toString(),
              balanceUSD: baseFreeBalanceUSD,
              iconUrl: baseAssets?.icon_url,
              symbol: baseAssets?.symbol || ''
            })
          }
          if (quoteFreeBalance.gt(0)) {
            freeItems.push({
              balance: quoteFreeBalance.toString(),
              balanceUSD: quoteFreeBalanceUSD,
              iconUrl: quoteAssets?.icon_url,
              symbol: quoteAssets?.symbol || ''
            })
          }
          if (freeItems.length > 0) {
            tooltipItems.push({ label: 'Free Balance', items: freeItems })
          }
        }

        const tooltipContent =
          tooltipItems.length > 0 ? (
            <VStack alignItems="flex-start" gap="4px">
              {tooltipItems.map((tooltipItem, itemIndex: number) =>
                tooltipItem.items.map((collateralItem, assetIndex: number) => (
                  <VStack
                    key={`${tooltipItem.label}-${assetIndex}`}
                    mb={itemIndex === 0 && tooltipItems.length > 1 && assetIndex === tooltipItem.items.length - 1 ? '8px' : '0px'}
                    gap="4px"
                    w="100%"
                    alignItems="flex-start"
                  >
                    {assetIndex === 0 && <Text fontSize="12px">{tooltipItem.label}</Text>}
                    <HStack gap="4px" bg="background" w="100%" justifyContent="space-between" p="8px" borderRadius="6px">
                      <HStack>
                        <SingleCoinImage
                          imageUrl={collateralItem.iconUrl}
                          imgBoxStyle={{ w: '16px', h: '16px' }}
                          imageStyle={{ w: '16px', h: '16px' }}
                        />
                        <Text color="text_caption" fontSize="12px">
                          {abbreviateTokenName(collateralItem.symbol)}
                        </Text>
                      </HStack>
                      <Text fontSize="12px" lineHeight="16px">
                        <Text as="span" color="text_caption" mr="2px" fontSize="12px" lineHeight="16px">
                          {formatPriceWithDown(collateralItem.balance ?? 0, 4)}
                        </Text>
                        (${formatUSDPrice(collateralItem.balanceUSD, true, 4)})
                      </Text>
                    </HStack>
                  </VStack>
                ))
              )}
            </VStack>
          ) : (
            <Text fontSize="12px" lineHeight="16px">
              No collateral
            </Text>
          )

        return (
          <HStack align="center" justify="flex-start" gap="2px">
            <CetusTooltip tooltip={tooltipContent}>
              <Text fontSize="12px" color="text_caption" textAlign="left" cursor="pointer">
                ${formatNumber(totalCollateral.toString(), 2)}
              </Text>
            </CetusTooltip>
            <Box
              as="button"
              w="16px"
              h="16px"
              borderRadius="4px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              bg="none"
              onClick={(e: any) => {
                e.stopPropagation()
                // 打开 Deposit 弹窗，默认使用 baseAssets，允许切换 token
                openAssetsActionModal('Deposit', item.baseAssets, true, item.pool)
              }}
              _hover={{
                borderColor: 'primary',
                svg: {
                  fill: 'primary'
                }
              }}
            >
              <Icon xlinkHref="#icon-icon_edit1" svgFill="primary" svgHover="primary" svgW="12px" svgH="12px" />
            </Box>
          </HStack>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Total Debt
          </Text>
          <TooltipIcon tooltipCon="Total debt including both the borrowed principal and any accrued interest." iconSize="16px"></TooltipIcon>
        </HStack>
      ),
      key: 'Total Debt',
      thConfig: {
        w: '15%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const totalDebt = d(item?.totalDebtValue || '0')
        return (
          <Text fontSize="12px" color="text_caption" textAlign="left">
            ${formatNumber(totalDebt.toString(), 2)}
          </Text>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" textAlign="left" fontWeight="500">
            Margin Risk Level
          </Text>
          <TooltipIcon
            tooltipCon="Margin Risk Level is calculated as: Total Collateral ÷ Total Debt. A higher Margin Risk Level Margin Risk Level：indicates a safer account with lower liquidation risk."
            iconSize="16px"
          ></TooltipIcon>
        </HStack>
      ),
      key: 'Margin Risk Level',
      thConfig: {
        w: '12%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        // 计算 risk ratio: riskRatio = totalCollateralValue / totalDebtValue
        const totalCollateral = d(item?.totalCollateralValue || '0')
        const totalDebt = d(item?.totalDebtValue || '0')

        // 获取风险比率配置
        const liquidationRiskRatio = item?.liquidationRiskRatio ? Number(item.liquidationRiskRatio) : 1.25
        const minBorrowRiskRatio = item?.minBorrowRiskRatio ? Number(item.minBorrowRiskRatio) : 1.5
        const minWithdrawRiskRatio = item?.minWithdrawRiskRatio ? Number(item.minWithdrawRiskRatio) : 2

        // 计算风险比率值
        let riskRatioValue: number | '∞' | null = null
        let riskRatioDisplay = ''
        if (totalDebt.gt(0)) {
          riskRatioValue = totalCollateral.div(totalDebt).toNumber()
          riskRatioDisplay = formatNumber(riskRatioValue.toString(), 2)
        } else if (totalCollateral.gt(0)) {
          // 如果负债为 0 但资产不为 0，显示无穷大
          riskRatioValue = '∞'
          riskRatioDisplay = '∞'
        } else {
          // 如果资产和负债都为 0，显示 0
          riskRatioValue = 0
          riskRatioDisplay = '0'
        }

        // 根据风险比率值确定风险等级
        let riskLevel = ''
        let riskColor = 'text_caption'
        let checkColor = 'text_caption'

        if (riskRatioValue === null) {
          riskLevel = '--'
        } else if (riskRatioValue === '∞') {
          riskLevel = 'Low risk'
          riskColor = 'primary_green'
          checkColor = 'primary_green_opacity.10'
        } else if (riskRatioValue <= liquidationRiskRatio) {
          riskLevel = 'Liquid'
          riskColor = 'primary_red'
          checkColor = 'primary_red_opacity.10'
        } else if (riskRatioValue < minBorrowRiskRatio) {
          riskLevel = 'Risky'
          riskColor = 'primary_red'
          checkColor = 'primary_red_opacity.10'
        } else if (riskRatioValue < minWithdrawRiskRatio) {
          riskLevel = 'Medium risk'
          riskColor = 'primary_yellow'
          checkColor = 'primary_yellow_opacity.10'
        } else {
          riskLevel = 'Low risk'
          riskColor = 'primary_green'
          checkColor = 'primary_green_opacity.10'
        }

        return (
          <HStack
            gap="4px"
            align="center"
            onClick={() =>
              setRiskLevelModalData({
                isRiskLevelModalOpen: true,
                poolAddress: item.address
              })
            }
          >
            <Box w="16px" h="16px" bg={checkColor} borderRadius="4px" />
            <Text fontSize="12px" color={riskColor} textAlign="left" textDecoration="underline dotted">
              {riskRatioDisplay}
            </Text>
            <Text ml="4px" fontSize="12px" color={riskColor} textAlign="left" padding="4px 8px" bg={checkColor} borderRadius="6px">
              {riskLevel}
            </Text>
          </HStack>
        )
      }
    },
    {
      title: (
        <Text color="text_paragraph" fontSize="12px" textAlign="left" fontWeight="500">
          In Open Orders
        </Text>
      ),
      key: 'In open orders',
      thConfig: {
        w: '12%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        // 如果订单数据正在加载，且当前账户存在，显示 loading
        // 注意：只在有账户且正在加载时显示，避免初始状态一直显示 loading
        const shouldShowLoading = orderListLoading && currentAccount?.address

        if (shouldShowLoading) {
          return <Skeleton height="16px" width="40px" borderRadius="4px" />
        }
        // 获取对应 address 下订单的长度
        const ordersCount = item?.totalOrdersCount || item?.orders?.length || 0
        return (
          <Text fontSize="12px" color="text_caption" textAlign="left">
            {ordersCount}
          </Text>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Est. Liquidation Price
          </Text>
          <TooltipIcon
            tooltipCon="An estimated price at which your position could be liquidated. It will not be shown if your margin risk level is very healthy or if your debt and collateral are the same asset."
            iconSize="16px"
          ></TooltipIcon>
        </HStack>
      ),
      key: 'Est. Liquidation Price',
      thConfig: {
        w: '10%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        // 计算并显示清算价格
        if (!item?.liquidationPrice) {
          return (
            <Text fontSize="12px" color="text_caption" textAlign="left">
              --
            </Text>
          )
        }

        const liquidationPrice = d(item.liquidationPrice)
        const markPrice = d(item.markPrice || '0')

        // 计算价格变化方向和百分比
        const isPriceDrop = liquidationPrice.lt(markPrice)
        const priceChangePercent = markPrice.gt(0) ? liquidationPrice.sub(markPrice).abs().div(markPrice).mul(100) : d('0')

        return (
          <VStack align="flex-start" gap="2px">
            <Text fontSize="12px" color="text_caption" textAlign="left">
              {formatNumber(liquidationPrice.toString(), 4)} {item?.quoteAssets?.symbol || ''}
            </Text>
            {markPrice.gt(0) && (
              <Text fontSize="11px" color={isPriceDrop ? 'primary_red' : 'primary_green'} textAlign="left">
                {isPriceDrop ? '↓' : '↑'} {formatNumber(priceChangePercent.toString(), 2)}%
              </Text>
            )}
          </VStack>
        )
      }
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Action
        </Text>
      ),
      key: 'action',
      thConfig: {
        w: '8%'
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-end">
          {d(item?.baseDebt).gt(0) ||
            (d(item?.quoteDebt).gt(0) && (
              <Button
                variant="ghost"
                h="24px"
                borderRadius="6px"
                borderColor="transparent !important"
                fontSize="12px"
                p={'3px 6px'}
                onClick={() => openAssetsActionModal('Repay', d(item?.baseDebt).gt(0) ? item.baseAssets : item.quoteAssets, false, item.pool)}
              >
                Repay
              </Button>
            ))}

          <Button
            variant="outline"
            h="24px"
            borderRadius="6px"
            fontSize="12px"
            color="text_paragraph"
            p={'3px 6px'}
            onClick={() => {
              onClosePosition(item)
            }}
            _hover={{ cursor: 'pointer', color: 'primary' }}
          >
            Close
          </Button>
        </HStack>
      )
    }
  ]
}
