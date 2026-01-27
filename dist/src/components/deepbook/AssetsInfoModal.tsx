import { useCalculateRiskRatio } from '@/hooks/deepbook/margin/useCalculateRiskRatio'
import useDeepBookMarginPrices from '@/hooks/deepbook/margin/useDeepBookMarginPrices'
import useDeepbookMarginDebt from '@/hooks/deepbook/margin/useDeepbookMarginDebt'
import useGetDeepBookMarginBalance from '@/hooks/deepbook/margin/useGetDeepBookMarginBalance'
import { useRiskRatios } from '@/hooks/deepbook/margin/useRiskRatios'
import useGetDeepBookBalance from '@/hooks/deepbook/useGetDeepBookBalance'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { SelectTab, TradeInput } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { VaulDrawer } from '@cetus/ui-kit'
import { fixUp, formatCurrencyWithKMB, formatNumberWithDown } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { CoinAssist } from '@cetusprotocol/deepbook-utils'
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MarginAccountSummary, { getMarginAccountSummaryItems, RenderSummaryValue, type AccountSummaryItem } from './Margin/MarginAccountSummary'
import { MarginHealthRiskBlock } from './Margin/MarginHealthBlock'
import MarginHealthyChart from './Margin/MarginHealthyChart'
import MarginRiskRatios from './Margin/MarginRiskRatios'

type AssetsInfoModalProps = {
  token: Token
  title: 'Deposit' | 'Withdraw' | 'Repay' | 'Initialize & Deposit Collateral'
  isOpen: boolean
  onClose: (isManualClose?: boolean) => void
  onConfirm: (amount: string, tokenInfo?: Token, isBaseAsset?: boolean) => void | Promise<void>
  isBaseAsset: boolean
  mode?: 'normal' | 'margin' // 新增：模式选择
  allowTokenSwitch?: boolean // 是否允许切换 token（仅在 Deposit 模式下有效）
  // Margin 模式下的额外数据
  marginData?: {
    healthFactor?: number
    liquidationRatio?: number
    minBorrowRatio?: number
    minWithdrawRatio?: number
    totalCollateral?: string
    totalDebt?: string
    borrowLimit?: {
      current: string
      after: string
    }
    totalCollateralAfter?: string
    healthFactorAfter?: number // 操作后的健康因子值（可选，如果不提供则根据输入值计算）
  }
  // type?: 'spot' | 'margin'
}

type InputSource = 'slider' | 'input' | 'tab'

export default function AssetsInfoModal({
  token,
  title,
  isOpen,
  onClose,
  onConfirm,
  isBaseAsset,
  mode = 'normal',
  marginData,
  allowTokenSwitch = false
}: AssetsInfoModalProps) {
  const currentTitle = title
  const { isApp } = useWindowWidth()

  const [inputValue, setInputValue] = useState('')
  const [slideValue, setSlideValue] = useState(0)
  const [inputSource, setInputSource] = useState<InputSource>('slider')
  // 当前选中的 token（用于切换）
  const [currentToken, setCurrentToken] = useState<Token>(token)
  // 当前是否为 base asset
  const [currentIsBaseAsset, setCurrentIsBaseAsset] = useState<boolean>(isBaseAsset)
  // 交易提交状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const tabList: Tab[] = [{ label: '25%' }, { label: '50%' }, { label: '75%' }, { label: 'MAX' }]
  const { getTokenAmountValue } = useTokenPrice()
  const amountValue = getTokenAmountValue(currentToken?.coin_type, inputValue)

  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const { currentAccount } = useAccountStore()

  // 根据 type 选择使用哪个 hook 获取余额
  const spotBalance = useGetDeepBookBalance()

  // 获取当前池子的 managerId
  const managerId = useMarginStore((state: any) => {
    if (mode !== 'margin' || !currentAccount?.address || !currentDeepBookPool?.address) {
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

  // 从 store 读取 margin balance 数据（如果是 margin 模式）
  const marginBalanceData = useMarginStore((state: any) => {
    if (mode !== 'margin' || !currentAccount?.address || !currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address, managerId)
  })

  // 保留 hook 调用以获取 baseBalance 和 quoteBalance 对象（store 中没有存储这些对象）
  const marginBalanceHook = useGetDeepBookMarginBalance()

  // 根据 type 决定使用哪个余额数据
  const { baseBalance, quoteBalance, deepBalance, deepFreeBalance } = useMemo(() => {
    return mode === 'margin' ? marginBalanceHook : spotBalance
  }, [mode, marginBalanceHook, spotBalance])

  // 从 store 或 hook 获取 margin 模式的余额数据
  const baseFreeBalance = mode === 'margin' ? (marginBalanceData?.baseFreeBalance ?? marginBalanceHook.baseFreeBalance) : spotBalance.baseFreeBalance
  const quoteFreeBalance =
    mode === 'margin' ? (marginBalanceData?.quoteFreeBalance ?? marginBalanceHook.quoteFreeBalance) : spotBalance.quoteFreeBalance

  // 仅在 margin 模式下获取额外的 USD 数据
  const baseMarginBalanceUSD = mode === 'margin' ? (marginBalanceData?.baseMarginBalanceUSD ?? marginBalanceHook.baseMarginBalanceUSD ?? '0') : '0'
  const quoteMarginBalanceUSD = mode === 'margin' ? (marginBalanceData?.quoteMarginBalanceUSD ?? marginBalanceHook.quoteMarginBalanceUSD ?? '0') : '0'
  const totalCollateralValue = mode === 'margin' ? (marginBalanceData?.totalCollateralValue ?? marginBalanceHook.totalCollateralValue ?? '0') : '0'
  const baseTotalBalance = mode === 'margin' ? (marginBalanceData?.baseTotalBalance ?? marginBalanceHook.baseTotalBalance) : undefined
  const quoteTotalBalance = mode === 'margin' ? (marginBalanceData?.quoteTotalBalance ?? marginBalanceHook.quoteTotalBalance) : undefined
  const baseTotalBalanceUSD = mode === 'margin' ? (marginBalanceData?.baseTotalBalanceUSD ?? marginBalanceHook.baseTotalBalanceUSD) : undefined
  const quoteTotalBalanceUSD = mode === 'margin' ? (marginBalanceData?.quoteTotalBalanceUSD ?? marginBalanceHook.quoteTotalBalanceUSD) : undefined

  // 获取 margin debt 数据（仅在 margin 模式下使用）
  const debtData = useDeepbookMarginDebt()
  const baseDebt = mode === 'margin' ? debtData.baseDebt || '0' : '0'
  const quoteDebt = mode === 'margin' ? debtData.quoteDebt || '0' : '0'
  const baseDebtUSD = mode === 'margin' ? debtData.baseDebtUSD || '0' : '0'
  const quoteDebtUSD = mode === 'margin' ? debtData.quoteDebtUSD || '0' : '0'
  const totalDebtValue = mode === 'margin' ? debtData.totalDebtValue || '0' : '0'

  // 使用 useCalculateRiskRatio 计算风险率和 borrowLimit
  const {
    calculateRiskRatio,
    borrowLimit: currentBorrowLimit,
    totalAssetsValue: currentTotalAssetsValue,
    totalDebtValue: currentTotalDebtValue,
    riskRatio
  } = useCalculateRiskRatio()

  // 获取价格（用于计算最大可提取金额）
  const { basePrice, quotePrice } = useDeepBookMarginPrices()

  // 获取风险比率（必须在组件顶层调用，不能在条件函数中调用）
  const riskRatios = useRiskRatios()

  // 计算输入后的 borrowLimit 和 totalCollateral
  const [calculatedBorrowLimit, setCalculatedBorrowLimit] = useState<{ current: string; after: string } | null>(null)
  const [calculatedTotalCollateral, setCalculatedTotalCollateral] = useState<{ current: string; after: string } | null>(null)
  // 计算 Repay 操作后的负债值
  const [calculatedDebt, setCalculatedDebt] = useState<{ current: string; after: string } | null>(null)
  // 判断当前 token 的类型：base、quote 或 DEEP（第三种情况）
  const tokenType = useMemo(() => {
    if (!currentToken?.coin_type || !currentDeepBookPool) return null
    const isBase = currentToken.coin_type === currentDeepBookPool.baseAssets?.coin_type
    const isQuote = currentToken.coin_type === currentDeepBookPool.quoteAssets?.coin_type
    if (isBase) return 'base'
    if (isQuote) return 'quote'
    return 'deep' // 既不是 base 也不是 quote，是 DEEP（第三种情况）
  }, [currentToken?.coin_type, currentDeepBookPool])

  // 当输入值变化时，重新计算 borrowLimit、totalCollateral 和 debt
  useEffect(() => {
    if (mode !== 'margin' || !inputValue || !+inputValue) {
      setCalculatedBorrowLimit(null)
      setCalculatedTotalCollateral(null)
      setCalculatedDebt(null)
      return
    }

    const calculateValues = async () => {
      try {
        // 判断操作类型
        let action: 'deposit' | 'withdraw' | 'repay' | undefined
        if (currentTitle === 'Deposit') {
          action = 'deposit'
        } else if (currentTitle === 'Withdraw') {
          action = 'withdraw'
        } else if (currentTitle === 'Repay') {
          action = 'repay'
        }

        if (!action) {
          return
        }

        // 获取当前值（不传参数）
        const currentResult = await calculateRiskRatio()
        const currentBorrowLimitValue = `${formatCurrencyWithKMB(currentResult.borrowLimit)}`
        const currentCollateralValue = `${formatCurrencyWithKMB(currentResult.totalAssetsValue)}`
        const currentDebtValue = `${formatCurrencyWithKMB(currentResult.totalDebtValue)}`

        // 计算 after 值
        const afterResult = await calculateRiskRatio({
          action,
          amount: inputValue,
          isBase: currentIsBaseAsset
        })
        const afterBorrowLimitValue = `${formatCurrencyWithKMB(afterResult.borrowLimit)}`
        // Deposit 和 Withdraw 时，如果 totalAssetsValue 小于 0，则限制为 0
        const afterTotalAssetsValue =
          (currentTitle === 'Deposit' || currentTitle === 'Withdraw') && d(afterResult.totalAssetsValue || '0').lt(0)
            ? '0'
            : afterResult.totalAssetsValue
        const afterCollateralValue = `${formatCurrencyWithKMB(afterTotalAssetsValue)}`
        const afterDebtValue = `${formatCurrencyWithKMB(afterResult.totalDebtValue)}`

        // Deposit 时设置 borrowLimit 的 after 值
        if (currentTitle === 'Deposit') {
          setCalculatedBorrowLimit({
            current: currentBorrowLimitValue,
            after: afterBorrowLimitValue
          })
        } else {
          setCalculatedBorrowLimit(null)
        }

        // Deposit、Withdraw 和 Repay 时设置 Total Collateral 的 after 值
        if (currentTitle === 'Deposit' || currentTitle === 'Withdraw' || currentTitle === 'Repay') {
          setCalculatedTotalCollateral({
            current: currentCollateralValue,
            after: afterCollateralValue
          })
        } else {
          setCalculatedTotalCollateral(null)
        }

        // Repay 时设置 Total Debt 的 after 值
        if (currentTitle === 'Repay') {
          setCalculatedDebt({
            current: currentDebtValue,
            after: afterDebtValue
          })
        } else {
          setCalculatedDebt(null)
        }
      } catch (error) {
        console.error('Error calculating risk ratio:', error)
        setCalculatedBorrowLimit(null)
        setCalculatedTotalCollateral(null)
        setCalculatedDebt(null)
      }
    }

    calculateValues()
  }, [inputValue, currentTitle, currentIsBaseAsset, tokenType, mode, calculateRiskRatio])

  // 当 token 或 isBaseAsset 变化时，更新当前选中的 token
  useEffect(() => {
    if (isOpen) {
      setCurrentToken(token)
      setCurrentIsBaseAsset(isBaseAsset)
      // 重置输入值
      setInputValue('')
      setSlideValue(0)
      // 重置提交状态
      setIsSubmitting(false)
      // 重置计算的值
      setCalculatedBorrowLimit(null)
      setCalculatedTotalCollateral(null)
      setCalculatedDebt(null)
    }
  }, [token, isBaseAsset, isOpen])

  // 判断是否可以切换 token
  const canSwitchToken = useMemo(() => {
    return !!allowTokenSwitch
  }, [allowTokenSwitch])

  // 获取可切换的 token 列表（base 和 quote）
  const switchableTokenList = useMemo(() => {
    if (!canSwitchToken || !currentDeepBookPool) return []
    const tokens: Token[] = []
    if (currentDeepBookPool.baseAssets) {
      tokens.push(currentDeepBookPool.baseAssets)
    }
    if (currentDeepBookPool.quoteAssets) {
      tokens.push(currentDeepBookPool.quoteAssets)
    }

    // console.log('🚀🚀🚀 ~ switchableTokenList ~ tokens:', tokens)

    return tokens
  }, [canSwitchToken, currentDeepBookPool])

  // 处理 token 切换
  const handleTokenChange = useCallback(
    (newToken: Token) => {
      setCurrentToken(newToken)
      // 判断新 token 是 base 还是 quote
      const isNewBaseAsset = currentDeepBookPool?.baseAssets?.coin_type === newToken?.coin_type
      setCurrentIsBaseAsset(isNewBaseAsset)
      // 重置输入值
      setInputValue('')
      setSlideValue(0)
    },
    [currentDeepBookPool]
  )

  // 计算最大可提取金额（基于 minWithdrawRiskRatio）
  // 公式：withdrawAmountUSD <= Total Assets - minWithdrawRiskRatio * Total Debt
  const maxWithdrawableAmount = useMemo(() => {
    // 仅在 margin 模式下的 Withdraw 操作需要计算最大可提取金额
    if (mode !== 'margin' || currentTitle !== 'Withdraw' || !marginData) {
      return null
    }

    try {
      const minWithdrawRiskRatio = marginData.minWithdrawRatio || currentDeepBookPool?.minWithdrawRiskRatio
      if (!minWithdrawRiskRatio || !basePrice || !quotePrice) {
        return null
      }

      // 获取当前总资产和总债务（USD）
      const totalAssetsUSD = d(currentTotalAssetsValue || '0')
      const totalDebtUSD = d(currentTotalDebtValue || '0')

      // 如果没有债务，可以提取全部资产
      if (d(totalDebtUSD).lte(0)) {
        return null // 返回 null 表示不限制（可以使用全部余额）
      }

      // 计算最大可提取金额（USD）
      // withdrawAmountUSD <= Total Assets - minWithdrawRiskRatio * Total Debt
      const maxWithdrawableUSD = totalAssetsUSD.sub(d(minWithdrawRiskRatio).mul(totalDebtUSD))

      // 如果计算结果为负数或零，则不能提取
      if (maxWithdrawableUSD.lte(0)) {
        return '0'
      }

      // 根据 token 类型转换为对应的 token 数量
      if (currentIsBaseAsset) {
        // base token: maxAmount = maxWithdrawableUSD / basePrice
        const maxAmount = maxWithdrawableUSD.div(basePrice)

        // 获取对应的 freeBalance 并与 maxAmount 取最小值
        const freeBalance = baseFreeBalance || '0'
        const finalMaxAmount = d(maxAmount).lt(d(freeBalance)) ? maxAmount : d(freeBalance)

        // console.log('maxWithdrawableAmount: ', {
        //   totalAssetsUSD: totalAssetsUSD.toString(),
        //   totalDebtUSD: totalDebtUSD.toString(),
        //   maxWithdrawableUSD: maxWithdrawableUSD.toString(),
        //   basePrice: basePrice.toString(),
        //   quotePrice: quotePrice.toString(),
        //   minWithdrawRiskRatio: minWithdrawRiskRatio.toString(),
        //   maxAmount: maxAmount.toString(),
        //   freeBalance: freeBalance,
        //   finalMaxAmount: finalMaxAmount.toString()
        // })

        return finalMaxAmount.gt(0) ? finalMaxAmount.toString() : '0'
      } else {
        // quote token 或 deep token: maxAmount = maxWithdrawableUSD / quotePrice
        const maxAmount = maxWithdrawableUSD.div(quotePrice)

        // 判断是否是 deep token
        const isDeepToken =
          currentToken?.coin_type &&
          currentToken.coin_type !== currentDeepBookPool?.baseAssets?.coin_type &&
          currentToken.coin_type !== currentDeepBookPool?.quoteAssets?.coin_type

        // 获取对应的 freeBalance 并与 maxAmount 取最小值
        const freeBalance = isDeepToken ? deepFreeBalance || '0' : quoteFreeBalance || '0'
        const finalMaxAmount = d(maxAmount).lt(d(freeBalance)) ? maxAmount : d(freeBalance)

        return finalMaxAmount.gt(0) ? finalMaxAmount.toString() : '0'
      }
    } catch (error) {
      console.error('Error calculating max withdrawable amount:', error)
      return null
    }
  }, [
    mode,
    currentTitle,
    marginData,
    currentDeepBookPool?.minWithdrawRiskRatio,
    currentTotalAssetsValue,
    currentTotalDebtValue,
    basePrice,
    quotePrice,
    currentIsBaseAsset,
    baseFreeBalance,
    quoteFreeBalance,
    deepFreeBalance,
    currentToken?.coin_type,
    currentDeepBookPool?.baseAssets?.coin_type,
    currentDeepBookPool?.quoteAssets?.coin_type
  ])

  // 优化：提取余额计算逻辑
  // 如果是 margin 模式且 title="Initialize & Deposit Collateral"，使用钱包余额
  // 其他情况根据 Deposit/Withdraw 决定
  const currentBalance = useMemo(() => {
    // Initialize & Deposit Collateral: 使用钱包余额（从钱包存入到 margin account）
    if (mode === 'margin' && currentTitle === 'Initialize & Deposit Collateral') {
      if (tokenType === 'base') {
        return baseBalance?.balanceFormat
      } else if (tokenType === 'quote') {
        return quoteBalance?.balanceFormat
      } else if (tokenType === 'deep') {
        // DEEP 作为第三种情况（既不是 base 也不是 quote）
        return deepBalance?.balanceFormat
      }
      // 兜底逻辑：使用 currentIsBaseAsset
      return currentIsBaseAsset ? baseBalance?.balanceFormat : quoteBalance?.balanceFormat
    }

    // Deposit/Repay: 使用钱包余额
    if (currentTitle === 'Deposit') {
      if (tokenType === 'base') {
        return baseBalance?.balanceFormat
      } else if (tokenType === 'quote') {
        return quoteBalance?.balanceFormat
      } else if (tokenType === 'deep') {
        // DEEP 作为第三种情况（既不是 base 也不是 quote）
        return deepBalance?.balanceFormat
      }
      // 兜底逻辑：使用 currentIsBaseAsset
      return currentIsBaseAsset ? baseBalance?.balanceFormat : quoteBalance?.balanceFormat
    }

    // repay时候钱包余额+free balance
    if (currentTitle === 'Repay') {
      if (tokenType === 'base') {
        return d(baseBalance?.balanceFormat || '0')
          .add(baseFreeBalance || '0')
          .toString()
      } else if (tokenType === 'quote') {
        return d(quoteBalance?.balanceFormat || '0')
          .add(quoteFreeBalance || '0')
          .toString()
      } else if (tokenType === 'deep') {
        // DEEP 作为第三种情况（既不是 base 也不是 quote）
        return d(deepBalance?.balanceFormat || '0')
          .add(deepFreeBalance || '0')
          .toString()
      }
      // 兜底逻辑：使用 currentIsBaseAsset
      return currentIsBaseAsset ? baseBalance?.balanceFormat : quoteBalance?.balanceFormat
    }

    // Withdraw: 使用 margin trading 余额（free balance）

    // 如果是 margin 模式，需要考虑最大可提取金额限制
    let freeBalance: string | undefined
    if (tokenType === 'base') {
      freeBalance = baseFreeBalance
    } else if (tokenType === 'quote') {
      freeBalance = quoteFreeBalance
    } else if (tokenType === 'deep') {
      // DEEP 作为第三种情况（既不是 base 也不是 quote）
      freeBalance = deepFreeBalance
    } else {
      // 兜底逻辑：使用 currentIsBaseAsset
      freeBalance = currentIsBaseAsset ? baseFreeBalance : quoteFreeBalance
    }

    // 如果是 margin 模式下的 Withdraw，使用最大可提取金额和 free balance 的较小值
    if (mode === 'margin' && currentTitle === 'Withdraw' && maxWithdrawableAmount !== null && tokenType !== 'deep') {
      const freeBalanceNum = d(freeBalance || '0')
      const maxWithdrawableNum = d(maxWithdrawableAmount)
      // 返回两者中的较小值
      return freeBalanceNum.lt(maxWithdrawableNum) ? freeBalance : maxWithdrawableAmount
    }

    return freeBalance
  }, [
    mode,
    currentTitle,
    tokenType,
    currentIsBaseAsset,
    baseBalance?.balanceFormat,
    quoteBalance?.balanceFormat,
    deepBalance?.balanceFormat,
    baseFreeBalance,
    quoteFreeBalance,
    deepFreeBalance,
    currentToken?.coin_type,
    maxWithdrawableAmount
  ])

  // 优化：提取 SUI 币种判断
  const isSuiCoin = useMemo(() => {
    return CoinAssist.isSuiCoin(currentToken?.coin_type || '')
  }, [currentToken?.coin_type])

  const currentTab = useMemo(() => (slideValue === 100 ? 'MAX' : `${slideValue}%`), [slideValue])

  const changeSlideValue = useCallback((value: string | number, source: InputSource = 'slider') => {
    setInputSource(source)
    if (value === 'MAX' || value === 100) {
      setSlideValue(100)
    } else {
      const percent = Number(String(value).replace('%', ''))
      setSlideValue(percent)
    }
  }, [])

  const handleTabChange = useCallback(
    (tab: Tab) => {
      if (tab.label === 'MAX') {
        changeSlideValue(100, 'tab')
      } else {
        changeSlideValue(tab.label, 'tab')
      }
    },
    [changeSlideValue]
  )

  const handleSliderChange = useCallback(
    (value: number) => {
      changeSlideValue(`${value}%`, 'slider')
    },
    [changeSlideValue]
  )

  const handleInputChange = useCallback((value: string) => {
    setInputSource('input')
    setInputValue(value)
  }, [])

  // 优化：简化滑块/标签页更新输入值的逻辑
  useEffect(() => {
    if (inputSource === 'slider' || inputSource === 'tab') {
      if (slideValue === 0) {
        setInputValue('')
      } else if (currentBalance) {
        console.log('🚀🚀🚀 ~ AssetsInfoModal.tsx:542 ~ currentBalance:', currentBalance)

        // Repay 模式下，统一所有 sliderValue 的计算方式
        if (currentTitle === 'Repay' && mode === 'margin') {
          // 先计算最大可还款金额
          const debtAmount = currentIsBaseAsset ? baseDebt : quoteDebt
          console.log('🚀🚀🚀 ~ AssetsInfoModal.tsx:523 ~ AssetsInfoModal ~ debtAmount:', debtAmount)
          const availableBalance = currentBalance || '0'
          const maxRepayAmount = d(debtAmount).lte(0) ? availableBalance : d(availableBalance).lt(d(debtAmount)) ? availableBalance : debtAmount

          // MAX 情况下（slideValue === 100），直接使用债务金额，不做任何取整处理
          // 这样可以确保还款金额完全等于债务金额，避免精度损失导致无法完全还清
          if (slideValue === 100) {
            setInputValue(maxRepayAmount)
          } else {
            // 非 MAX 情况：基于 maxRepayAmount 计算百分比，然后向上取整
            const rawAmount = d(maxRepayAmount).mul(slideValue).div(100).toString()
            const decimals = currentToken?.decimals || 6
            let value = fixUp(rawAmount, decimals)

            // 确保不超过 maxRepayAmount
            if (d(value).gt(maxRepayAmount)) {
              value = maxRepayAmount
            }

            setInputValue(value)
          }
        } else {
          // 其他模式保持原有逻辑
          const remainAmount = isSuiCoin && currentTitle === 'Deposit' && slideValue === 100 ? 0.05 : 0
          const value = formatNumberWithDown(d(currentBalance).mul(slideValue).div(100).sub(remainAmount).toString(), currentToken?.decimals, true)
          if (d(value).lt(0)) {
            setInputValue(currentBalance)
          } else {
            setInputValue(value)
          }
        }
      }
    }
  }, [slideValue, inputSource, currentBalance, currentToken?.decimals, isSuiCoin, currentTitle, mode, currentIsBaseAsset, baseDebt, quoteDebt])

  // 优化：简化输入框更新滑块值的逻辑
  useEffect(() => {
    if (inputSource === 'input') {
      if (!inputValue || inputValue === '0') {
        setSlideValue(0)
      } else if (currentBalance) {
        // Repay 模式：限制输入不超过债务金额
        if (currentTitle === 'Repay' && mode === 'margin') {
          const debtAmount = currentIsBaseAsset ? baseDebt : quoteDebt
          const availableBalance = currentBalance || '0'

          // 最大可还款 = min(debt, availableBalance)
          const maxRepayAmount = d(debtAmount).lte(0) ? availableBalance : d(availableBalance).lt(d(debtAmount)) ? availableBalance : debtAmount

          // 限制输入值不超过最大可还款额
          let finalInputValue = inputValue
          if (d(inputValue).gt(maxRepayAmount)) {
            finalInputValue = maxRepayAmount
            setInputValue(finalInputValue)
          }
          // 基于债务金额计算百分比（不是基于钱包余额）
          // 当输入值等于债务金额时，slider = 100%
          const percentage = d(finalInputValue).div(d(maxRepayAmount)).mul(100)
          const clampedPercentage = d(percentage).gt(100) ? 100 : Number(percentage)
          setSlideValue(clampedPercentage)
        } else {
          // 只有当输入值接近总余额时（MAX 场景），才考虑 remainAmount
          const isNearMax = isSuiCoin && currentTitle === 'Deposit' && d(inputValue).add(0.05).gte(d(currentBalance))
          const remainAmount = isNearMax ? 0.05 : 0
          const percentage = d(inputValue).add(remainAmount).div(d(currentBalance)).mul(100)
          const clampedPercentage = d(percentage).gt(100) ? 100 : Number(percentage)
          setSlideValue(clampedPercentage)
        }
      }
    }
  }, [inputValue, inputSource, currentBalance, isSuiCoin, currentTitle])
  const tradeTypeByPool = useDeepBookStore(state => {
    return state.tradeTypeByPool
  })
  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool?.address])

  const tradeType = useMemo(() => {
    return poolAddress ? tradeTypeByPool[poolAddress] : 'Spot'
  }, [poolAddress, tradeTypeByPool])

  // 获取按钮文本
  const getButtonText = useCallback((title: string): string => {
    switch (title) {
      case 'Deposit':
        return 'Deposit'
      case 'Withdraw':
        return 'Withdraw'
      case 'Repay':
        return 'Repay'
      case 'Initialize & Deposit Collateral':
        return 'Deposit'
      default:
        return title
    }
  }, [])
  const [calculatedHealthFactorAfter, setCalculatedHealthFactorAfter] = useState<number | undefined>(undefined)

  const btnInfo = useMemo(() => {
    console.log(
      '🚀🚀🚀 ~ AssetsInfoModal.tsx:649 ~ AssetsInfoModal ~ d(riskRatio).lt(currentDeepBookPool?.minWithdrawRiskRatio):',
      riskRatio,
      currentDeepBookPool?.minWithdrawRiskRatio
    )
    if (
      ((tradeType == 'Margin' && tokenType === 'deep' && currentTitle == 'Withdraw' && d(riskRatio).lt(currentDeepBookPool?.minWithdrawRiskRatio)) ||
        (calculatedHealthFactorAfter && d(calculatedHealthFactorAfter).lt(currentDeepBookPool?.minWithdrawRiskRatio))) &&
      (baseDebt > 0 || quoteDebt > 0)
    ) {
      return {
        text: getButtonText(currentTitle),
        disabled: true,
        desc: 'Your margin account risk ratio is currently below the minimum withdrawal threshold. Withdrawals of all assets may be restricted, including assets not used in risk calculations. '
      }
    }

    if (!+inputValue) {
      return { text: '', disabled: true }
    }

    const inputAmount = d(inputValue || 0)
    const hasInsufficientBalance = inputAmount.gt(currentBalance || 0)

    if (hasInsufficientBalance) {
      return {
        text: `Insufficient ${currentToken?.symbol} balance`,
        disabled: true
      }
    }

    // console.log('🚀🚀🚀 ~ AssetsInfoModal.tsx:631 ~ AssetsInfoModal ~ riskRatio:', riskRatio)

    return {
      text: getButtonText(currentTitle),
      disabled: false
    }
  }, [
    inputValue,
    currentBalance,
    currentToken?.symbol,
    currentTitle,
    getButtonText,
    calculatedHealthFactorAfter,
    currentDeepBookPool?.minWithdrawRiskRatio,
    riskRatio,
    tradeType,
    baseDebt,
    quoteDebt
  ])

  // 计算操作后的健康因子值 - 使用 calculateRiskRatio 进行准确计算

  useEffect(() => {
    const calculateAfter = async () => {
      if (mode !== 'margin' || !marginData || !inputValue || !+inputValue || !currentToken) {
        setCalculatedHealthFactorAfter(undefined)
        return
      }

      const { healthFactorAfter: providedAfterValue } = marginData

      // 如果已经提供了 healthFactorAfter，直接使用
      if (providedAfterValue !== undefined) {
        setCalculatedHealthFactorAfter(providedAfterValue)
        return
      }

      try {
        // 使用 calculateRiskRatio 进行准确计算
        const isBase = currentIsBaseAsset
        const action =
          currentTitle === 'Deposit' ? 'deposit' : currentTitle === 'Withdraw' ? 'withdraw' : currentTitle === 'Repay' ? 'repay' : undefined

        if (action) {
          const result = await calculateRiskRatio({
            action,
            amount: inputValue,
            isBase
          })

          // console.log('🚀🚀🚀 ~ calculateAfter ~ result:', result)

          // riskRatio 就是健康因子
          // 如果 riskRatio 是 'Infinity'，则传递 Number.POSITIVE_INFINITY

          // console.log('🚀🚀🚀 ~ calculateAfter ~ result.riskRatio:', result.riskRatio)

          let healthFactorAfter: number | undefined
          if (result.riskRatio === 'Infinity') {
            healthFactorAfter = Number.POSITIVE_INFINITY
          } else if (d(result.riskRatio || '0').lt(0)) {
            healthFactorAfter = 0
          } else if (result.riskRatio && result.riskRatio !== '0') {
            healthFactorAfter = Number(result.riskRatio)
          } else {
            healthFactorAfter = undefined
          }
          setCalculatedHealthFactorAfter(healthFactorAfter)
        } else {
          setCalculatedHealthFactorAfter(undefined)
        }
      } catch (error) {
        console.error('Error calculating margin risk level after:', error)
        setCalculatedHealthFactorAfter(undefined)
      }
    }
    calculateAfter()
  }, [
    mode,
    marginData,
    inputValue,
    currentTitle,
    currentToken,
    currentIsBaseAsset,
    calculateRiskRatio,
    baseDebt,
    quoteDebt,
    baseDebtUSD,
    quoteDebtUSD,
    totalDebtValue,
    tokenType
  ])

  // Margin 模式下的计算值（必须在组件顶层调用 hooks）
  // 计算 collateral 和 debt 的显示值（与 MarginHealthBlock.tsx 一致）
  const collateralValueDisplay = useMemo(() => {
    if (mode !== 'margin' || !marginData) return '$0'
    // 优先使用计算的值（如果有输入值）
    if (calculatedTotalCollateral) {
      return calculatedTotalCollateral.current
    }
    // 使用 hook 返回的当前值
    if (currentTotalAssetsValue) {
      if (!currentTotalAssetsValue || currentTotalAssetsValue === '0') {
        return '$0'
      }
      return `${formatCurrencyWithKMB(currentTotalAssetsValue)}`
    }
    if (totalCollateralValue) {
      if (!totalCollateralValue || totalCollateralValue === '0') {
        return '$0'
      }
      return `${formatCurrencyWithKMB(totalCollateralValue)}`
    }
    // 如果 marginData 中有 totalCollateral，使用它；否则使用计算值
    return marginData.totalCollateral || '$0'
  }, [mode, marginData, totalCollateralValue, calculatedTotalCollateral, currentTotalAssetsValue])

  // 计算 Total Collateral 的 after 值
  const collateralAfterValueDisplay = useMemo(() => {
    if (mode !== 'margin' || !marginData) return undefined
    // 优先使用计算的值（如果有输入值）
    if (calculatedTotalCollateral && calculatedTotalCollateral.after) {
      return calculatedTotalCollateral.after
    }
    // 如果 marginData 中有 totalCollateralAfter，使用它
    return marginData.totalCollateralAfter
  }, [mode, marginData, calculatedTotalCollateral])

  const debtValueDisplay = useMemo(() => {
    if (mode !== 'margin' || !marginData) return '$0'
    // 优先使用计算的值（如果有输入值）
    if (calculatedDebt) {
      return calculatedDebt.current
    }
    // 如果 marginData 中没有 totalDebt，使用 hook 返回的 totalDebtValue 进行计算
    if (totalDebtValue) {
      if (!totalDebtValue || totalDebtValue === '0') {
        return '$0'
      }
      return `${formatCurrencyWithKMB(totalDebtValue)}`
    }
    return marginData.totalDebt || '$0'
  }, [mode, marginData, totalDebtValue, calculatedDebt])

  // 计算 Total Debt 的 after 值
  const debtAfterValueDisplay = useMemo(() => {
    if (mode !== 'margin' || !marginData) return undefined
    // 只在 Repay 操作时显示 after 值
    if (currentTitle !== 'Repay') {
      return undefined
    }
    // 优先使用计算的值（如果有输入值）
    if (calculatedDebt && calculatedDebt.after) {
      return calculatedDebt.after
    }
    return undefined
  }, [mode, marginData, currentTitle, calculatedDebt])

  const marginTooltip = useMemo(() => {
    if (currentTitle === 'Deposit') {
      return `The Margin Risk Level reflects your account's risk state after the deposit. Assets will be deposited into your free balance and can be used as collateral.`
    }
    if (currentTitle === 'Withdraw') {
      return `The Margin Risk Level reflects your account's risk state after withdrawal. You can only withdraw the assets when your Margin Risk Level remains above [min_withdraw_risk_ratio].`
    }
    if (currentTitle === 'Repay') {
      return `The Margin Risk Level reflects your account's risk state after debt repayment. A higher Margin Risk Level indicates a safer account with lower liquidation risk.`
    }
    return undefined
  }, [currentTitle])

  // Margin 模式下的左侧信息面板 - 复用 MarginHealthBlock 的逻辑
  const renderMarginLeftPanel = () => {
    if (currentTitle === 'Initialize & Deposit Collateral') return null
    if (mode !== 'margin' || !marginData) return null

    const {
      healthFactor = 2.5,
      // liquidationRatio = currentDeepBookPool?.liquidationRiskRatio,
      minBorrowRatio = currentDeepBookPool?.minBorrowRiskRatio,
      minWithdrawRatio = currentDeepBookPool?.minWithdrawRiskRatio
      // totalCollateral,
      // totalDebt,
      // borrowLimit,
      // totalCollateralAfter
    } = marginData

    const accountSummary: AccountSummaryItem[] = getMarginAccountSummaryItems({
      CollateralValue: collateralValueDisplay,
      CollateralAfterValue: collateralAfterValueDisplay,
      DebtValue: debtValueDisplay,
      DebtAfterValue: debtAfterValueDisplay
    })

    return (
      <VStack
        w="100%"
        h="100%"
        gap="16px"
        alignItems="flex-start"
        bg="bg_secondary"
        border="1px solid"
        borderColor="border"
        borderRadius="16px"
        p="16px"
        pt="4px"
      >
        {/* Margin Risk Level Chart */}
        <Box display="flex" justifyContent="center" alignItems="center" w="100%" h="120px">
          <MarginHealthyChart
            value={healthFactor}
            afterValue={calculatedHealthFactorAfter}
            actionType={currentTitle === 'Deposit' ? 'Deposit' : currentTitle === 'Withdraw' ? 'Withdraw' : 'Repay'}
            minBorrowRatio={minBorrowRatio}
            minWithdrawRatio={minWithdrawRatio}
            tooltip={marginTooltip}
          />
        </Box>

        {/* Risk Ratios - 使用公共组件 */}
        <MarginRiskRatios riskRatios={riskRatios} />

        {/* Account Summary - 使用公共组件 */}
        <VStack w="100%" gap="8px" alignItems="flex-start">
          {/* Your Borrow Limit - 只在 Deposit 时显示 */}
          {currentTitle === 'Deposit' && (
            <HStack w="100%" justifyContent="space-between">
              <Text fontSize="12px" lineHeight="16px">
                Your Borrow Limit
              </Text>
              <RenderSummaryValue
                value={calculatedBorrowLimit?.current || (currentBorrowLimit ? `${formatCurrencyWithKMB(currentBorrowLimit)}` : '$0')}
                showAfter={calculatedBorrowLimit?.after || undefined}
              />
            </HStack>
          )}
          <MarginAccountSummary
            noTooltip
            items={accountSummary}
            baseBalance={baseTotalBalance || baseFreeBalance}
            quoteBalance={quoteTotalBalance || quoteFreeBalance}
            baseBalanceUSD={baseTotalBalanceUSD || baseMarginBalanceUSD}
            quoteBalanceUSD={quoteTotalBalanceUSD || quoteMarginBalanceUSD}
            baseDebt={baseDebt}
            quoteDebt={quoteDebt}
            baseDebtUSD={baseDebtUSD}
            quoteDebtUSD={quoteDebtUSD}
            debtOnlyUSD={true}
          />
        </VStack>
      </VStack>
    )
  }

  // 右侧输入面板（普通模式和 Margin 模式共用）
  const renderRightPanel = () => (
    <VStack w="100%" h={mode === 'margin' ? '100%' : 'auto'} gap="16px" justifyContent="space-between">
      <VStack w="100%" gap="16px">
        <TradeInput
          wrapStyle={{ h: '110px', py: '20px !important', px: '16px !important', sx: { '& .verified_icon': { display: 'none' } } }}
          placeholder="0.0"
          value={inputValue}
          needRemainBalance={currentTitle === 'Deposit' || (currentTitle === 'Repay' && isSuiCoin)}
          amountValue={amountValue}
          onChange={handleInputChange}
          balance={currentBalance}
          token={currentToken}
          balanceLabel={currentTitle === 'Deposit' ? '' : 'Available'}
          inputStyle={{ width: '100%' }}
          half={false}
          max={false}
          dropSelectTokenList={canSwitchToken ? switchableTokenList : undefined}
          dropSelectTokenListConfig={{
            noFilter: true,
            tokenItemHasBgColor: true,
            style: {
              p: '8px',
              '& > div': {
                gap: '8px',
                '& > div': {
                  py: '8px',
                  borderRadius: '8px'
                }
              }
            }
          }}
          changeCurrentToken={canSwitchToken ? handleTokenChange : undefined}
          rightJustify="space-between"
        />

        <HStack w="100%" justify="space-between">
          <Text fontSize="20px" color="text_caption" whiteSpace="nowrap">
            {d(slideValue).gt(0) && slideValue < 0.01 ? '<0.01' : `${formatNumberWithDown(slideValue, 2)}%`}
          </Text>

          <SelectTab
            type="outlineTab"
            tabList={tabList}
            currentTab={currentTab}
            handleChangeTab={handleTabChange}
            wrapStyle={{
              w: { base: '220px', lg: '350px' },
              h: '32px',
              p: '3px',
              borderRadius: '8px'
            }}
            itemStyle={{
              flex: 1,
              fontSize: '14px',
              margin: 0
            }}
          />
        </HStack>

        <Box w="100%" mt="-10px">
          <Slider aria-label="assets-info-slider" min={0} max={100} focusThumbOnChange={false} value={slideValue} onChange={handleSliderChange}>
            <SliderTrack bg="bg_secondary" h="8px">
              <SliderFilledTrack h="4px" />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </VStack>

      {btnInfo?.desc && (
        <MarginHealthRiskBlock
          variant="yellow"
          text={btnInfo?.desc}
          textStyle={{
            textAlign: 'left'
          }}
        ></MarginHealthRiskBlock>
      )}

      <Button
        w="100%"
        fontWeight="500"
        fontSize="14px"
        lineHeight="18px"
        h="38px"
        onClick={async () => {
          if (isSubmitting || btnInfo.disabled) {
            return
          }

          try {
            setIsSubmitting(true)
            // 传递当前选中的 token 和 isBaseAsset 信息
            await onConfirm(inputValue, currentToken, currentIsBaseAsset)
            if (isOpen) {
              setTimeout(() => {
                setIsSubmitting(false)
              }, 100)
            }
          } catch (error) {
            console.error('Transaction failed:', error)
            // 错误时立即恢复按钮状态，让用户可以重试
            setIsSubmitting(false)
          }
        }}
        isDisabled={btnInfo.disabled || isSubmitting}
        isLoading={isSubmitting}
      >
        {title === 'Initialize & Deposit Collateral' ? 'Deposit' : btnInfo.text || getButtonText(currentTitle)}
      </Button>
    </VStack>
  )

  const renderContent = (tokenType: any) => {
    if (mode === 'margin') {
      // Initialize & Deposit Collateral 不显示左侧面板
      if (currentTitle === 'Initialize & Deposit Collateral') {
        return renderRightPanel()
      }

      // Margin 模式：桌面端左右布局，移动端上下布局
      if (isApp) {
        return (
          <VStack w="100%" gap="16px" alignItems="stretch">
            {/* 上方：Margin 信息面板 */}
            {tokenType !== 'deep' && (
              <Box w="100%" display="flex" flexDirection="column">
                {tokenType !== 'deep' && renderMarginLeftPanel()}
              </Box>
            )}

            {/* 下方：输入面板 */}
            <Box w="100%" display="flex" flexDirection="column">
              {renderRightPanel()}
            </Box>
          </VStack>
        )
      } else {
        return (
          <HStack w="100%" gap="24px" alignItems="stretch">
            {/* 左侧：Margin 信息面板 */}
            {tokenType !== 'deep' && (
              <Box flex="1" minW="300px" display="flex" flexDirection="column">
                {renderMarginLeftPanel()}
              </Box>
            )}

            {/* 右侧：输入面板 */}
            <Box flex="1" minW="300px" display="flex" flexDirection="column">
              {renderRightPanel()}
            </Box>
          </HStack>
        )
      }
    } else {
      return renderRightPanel()
    }
  }

  // 移动端使用 VaulDrawer
  if (isApp) {
    return (
      <VaulDrawer isOpen={isOpen} onClose={() => onClose(false)} placement="bottom" padding="16px">
        <Text fontSize="14px" lineHeight="18px" color="text_caption" fontWeight="500" whiteSpace="nowrap" mb="12px">
          {title}
        </Text>
        <Box textAlign={mode === 'margin' ? 'left' : 'center'}>{renderContent(tokenType)}</Box>
      </VaulDrawer>
    )
  }

  // 桌面端使用 Modal
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} trapFocus={false} isOpen={isOpen} onClose={() => onClose(false)} isCentered>
      <ModalOverlay />
      <ModalContent {...(mode === 'margin' && currentTitle !== 'Initialize & Deposit Collateral' && tokenType !== 'deep' ? { maxW: '832px' } : {})}>
        <ModalHeader
          sx={{
            p: '16px'
          }}
        >
          <Text fontSize="16px" color="text_caption" fontWeight="500" whiteSpace="nowrap">
            {title}
          </Text>
        </ModalHeader>
        <ModalCloseButton h={'28px'} />
        <ModalBody textAlign={mode === 'margin' ? 'left' : 'center'} p="0 16px 16px">
          {renderContent(tokenType)}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
