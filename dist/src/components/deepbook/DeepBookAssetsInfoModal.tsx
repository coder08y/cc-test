import { useCalculateRiskRatio } from '@/hooks/deepbook/margin/useCalculateRiskRatio'
import useDeepBookMarginAssetsActions from '@/hooks/deepbook/margin/useDeepBookMarginAssetsActions'
import useDeepbookMarginDebt from '@/hooks/deepbook/margin/useDeepbookMarginDebt'
import useAssetsActionRefresh from '@/hooks/deepbook/useAssetsActionRefresh'
import useDeepBookAssetsActions from '@/hooks/deepbook/useDeepBookAssetsActions'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { formatNumber } from '@cetus/utils'
import { useMemo } from 'react'
import AssetsInfoModal from './AssetsInfoModal'

export default function DeepBookAssetsInfoModal() {
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const isOpenAssetsActionModal = useDeepBookStore(state => state.isOpenAssetsActionModal)
  const setIsOpenAssetsActionModal = useDeepBookStore(state => state.setIsOpenAssetsActionModal)
  const actionType = useDeepBookStore(state => state.actionType)
  const tokenInfo = useDeepBookStore(state => state.tokenInfo)
  const storeAllowTokenSwitch = useDeepBookStore(state => state.allowTokenSwitch)
  const { marginManagerByAccount } = useMarginStore()
  const { handleRefresh } = useAssetsActionRefresh()
  const { riskRatio: currentHealthFactor } = useCalculateRiskRatio()
  const { currentAccount } = useAccountStore()

  const tradeTypeByPool = useDeepBookStore(state => {
    return state.tradeTypeByPool
  })
  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool?.address])

  const tradeType = useMemo(() => {
    return poolAddress ? tradeTypeByPool[poolAddress] : 'Spot'
  }, [poolAddress, tradeTypeByPool])

  // 获取当前池子的 managerId
  const managerId = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return ''
    }
    const marginManagerByAccount = state.marginManagerByAccount
    const selectedManagerInfo = state.getCurrentMarginManagerInfo(currentAccount.address)

    // 优先使用用户选择的 manager
    if (selectedManagerInfo?.margin_manager_id && currentDeepBookPool.address) {
      const selectedManager = (marginManagerByAccount as any[])?.find(
        (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPool.address
      )
      if (selectedManager) {
        return selectedManagerInfo.margin_manager_id
      }
    }

    // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找
    const marginManager = (marginManagerByAccount as any[])?.find((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
    return marginManager?.margin_manager_id || ''
  })

  // 从 store 读取 balance 数据
  const marginBalanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return state.getMarginBalanceData('', '', '')
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address, managerId)
  })
  const marginDebtData = useDeepbookMarginDebt()
  const { deposit: marginDeposit, withdraw: marginWithdraw, createAndDeposit, repay } = useDeepBookMarginAssetsActions()
  const { deposit: spotDeposit, withdraw: spotWithdraw } = useDeepBookAssetsActions()

  // 计算 margin 相关的显示值（仅在 margin pool 模式下使用）
  const marginCollateralValue = useMemo(() => {
    if (tradeType !== 'Margin' || !marginBalanceData?.totalCollateralValue) {
      return '$0'
    }
    if (marginBalanceData.totalCollateralValue === '0') {
      return '$0'
    }
    return `$${formatNumber(marginBalanceData.totalCollateralValue, 2)}`
  }, [tradeType, marginBalanceData?.totalCollateralValue, currentDeepBookPool?.address])

  const marginDebtValue = useMemo(() => {
    if (tradeType !== 'Margin' || !marginDebtData?.totalDebtValue) {
      return '$0'
    }
    if (marginDebtData.totalDebtValue === '0') {
      return '$0'
    }
    return `$${formatNumber(marginDebtData.totalDebtValue, 2)}`
  }, [tradeType, marginDebtData?.totalDebtValue, currentDeepBookPool?.address])

  // 检查是否为初始状态（没有 margin manager）
  const isInitialState = useMemo(() => {
    if (tradeType !== 'Margin' || !currentDeepBookPool?.address || !marginManagerByAccount) {
      return false
    }
    return !marginManagerByAccount.some((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
  }, [tradeType, currentDeepBookPool?.address, marginManagerByAccount])

  // 根据 actionType 确定实际显示的 title
  const modalTitle = useMemo(() => {
    if (actionType === 'Deposit' && tradeType == 'Margin' && isInitialState) {
      return 'Initialize & Deposit Collateral'
    }
    return actionType
  }, [actionType, currentDeepBookPool?.address, tradeType, isInitialState])

  // 判断是否为 Initialize & Deposit Collateral 模式（必须在早期返回之前计算）
  const isInitDepositMode = useMemo(() => {
    return modalTitle === 'Initialize & Deposit Collateral'
  }, [modalTitle])

  // 如果 store 中有 allowTokenSwitch 值，使用 store 的值；否则使用默认逻辑（必须在早期返回之前计算）
  const allowTokenSwitch = useMemo(() => {
    if (storeAllowTokenSwitch !== null) {
      return storeAllowTokenSwitch
    }
    return isInitDepositMode || actionType === 'Deposit'
  }, [storeAllowTokenSwitch, isInitDepositMode, actionType])

  if (!isOpenAssetsActionModal || !tokenInfo || !actionType) {
    return null
  }

  // 确定 marginData（Initialize & Deposit Collateral 时不传递）
  const modalMarginData =
    tradeType == 'Margin' && !isInitDepositMode
      ? {
          healthFactor: currentHealthFactor || 0,
          liquidationRatio: currentDeepBookPool?.liquidationRiskRatio,
          minBorrowRatio: currentDeepBookPool?.minBorrowRiskRatio,
          minWithdrawRatio: currentDeepBookPool?.minWithdrawRiskRatio,
          totalCollateral: marginCollateralValue,
          totalDebt: marginDebtValue
          // totalCollateralAfter 和 borrowLimit 会在 AssetsInfoModal 内部根据输入值计算
        }
      : undefined

  // 确保 tokenInfo 存在（已在上面检查，这里用于类型收窄）
  const currentTokenInfo = tokenInfo as any

  return (
    <AssetsInfoModal
      token={currentTokenInfo}
      title={modalTitle as any}
      isOpen={isOpenAssetsActionModal}
      isBaseAsset={currentTokenInfo?.symbol === currentDeepBookPool?.baseAssets?.symbol}
      mode={tradeType == 'Margin' ? 'margin' : 'normal'}
      marginData={modalMarginData}
      allowTokenSwitch={allowTokenSwitch}
      onClose={() => setIsOpenAssetsActionModal(false)}
      onConfirm={async (inputValue, tokenInfoParam, isBaseAssetParam) => {
        // 使用传入的参数，如果没有则使用默认值
        const finalTokenInfo = tokenInfoParam || currentTokenInfo
        const finalIsBase = isBaseAssetParam !== undefined ? isBaseAssetParam : currentTokenInfo?.symbol === currentDeepBookPool?.baseAssets?.symbol

        // 根据是否为 margin pool 选择不同的 actions
        const isMarginPool = tradeType == 'Margin'

        try {
          if (modalTitle === 'Initialize & Deposit Collateral') {
            // 初始化并存入
            await createAndDeposit(inputValue, finalTokenInfo, finalIsBase)
          } else if (actionType === 'Deposit') {
            if (isMarginPool) {
              // margin 模式: deposit(amount: string, tokenInfo: Token, isBase: boolean)
              await marginDeposit(inputValue, finalTokenInfo, finalIsBase)
            } else {
              // spot 模式: deposit(amount: string, isBaseAsset: boolean, tokenInfo?: any)
              await spotDeposit(inputValue, finalIsBase, finalTokenInfo)
            }
          } else if (actionType === 'Withdraw') {
            if (isMarginPool) {
              // margin 模式: withdraw(amount: string, tokenInfo: Token, isBase: boolean)
              await marginWithdraw(inputValue, finalTokenInfo, finalIsBase)
            } else {
              // spot 模式: withdraw(amount: string, isBaseAsset: boolean, tokenInfo?: any)
              await spotWithdraw(inputValue, finalIsBase, finalTokenInfo)
            }
          } else if (actionType === 'Repay') {
            // Repay 只在 margin 模式下使用
            await repay(inputValue, finalTokenInfo, finalIsBase)
          }

          // 成功后执行回调
          setIsOpenAssetsActionModal(false)
          handleRefresh()
          setTimeout(() => {
            handleRefresh()
          }, 3000)
        } catch (error) {
          // 错误处理：让 AssetsInfoModal 的 isSubmitting 状态能够正确重置
          // 错误会被 AssetsInfoModal 的 try-catch 捕获并处理
          throw error
        }
      }}
    />
  )
}
