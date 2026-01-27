import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useDebounceFunction } from '@cetus/hooks/src/useDebounce'
import { textEllipses } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo, useState } from 'react'
import useGetLeverage from '../common/useGetLeverage'

type DLMMDepositProps<T> = {
  rangeTabList: T[]
}

function useDLMMDeposit<T>({ rangeTabList }: DLMMDepositProps<T>) {
  // 获取dlmm流动性池信息 Get liquidity pool information
  const { dlmmApiPoolInfo, isAutoFill } = useDlmmLiquidityStore()

  // 获取添加流动性相关状态和方法 Get add liquidity related states and methods
  const {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    byAmountIn,
    setByAmountIn,
    fromTokenLock,
    toTokenLock,
    fromAmount,
    toAmount,
    setFromAmount,
    setToAmount,
    setFromLoading,
    setToLoading
  } = useAddDlmmLiquidityStore()

  // 获取价格范围数据 Get price range data
  const [currentRangeTab, setCurrentRangeTab] = useState<string>(dlmmApiPoolInfo?.displayTokenA?.coinType || '')
  const { getLeverage } = useGetLeverage()

  // 初始化当前选中coin标签 Initialize current coin tab
  useEffect(() => {
    if (dlmmApiPoolInfo?.displayTokenA?.coinType) {
      const coinType = dlmmApiPoolInfo?.displayTokenA?.coinType
      console.log('0925##🚀 trigger setCurrentRangeTab111:', coinType)
      setCurrentRangeTab(coinType)
    }
  }, [dlmmApiPoolInfo?.poolId])

  // 计算方向 Calculate direction
  const direct = useMemo(() => {
    return currentRangeTab === dlmmApiPoolInfo?.displayTokenA?.coinType
  }, [currentRangeTab, dlmmApiPoolInfo?.displayTokenA?.coinType])

  // 计算价格显示文本 Calculate price display text
  const perText = useMemo(() => {
    if (!dlmmApiPoolInfo) return ''

    return `${textEllipses(direct ? dlmmApiPoolInfo.displayTokenB?.symbol : dlmmApiPoolInfo.displayTokenA?.symbol, 8)}/${textEllipses(
      direct ? dlmmApiPoolInfo.displayTokenA?.symbol : dlmmApiPoolInfo.displayTokenB?.symbol,
      8
    )}`
  }, [direct, dlmmApiPoolInfo])

  // 处理tab反转点击 Handle tab reverse click
  const onReverseClick = (item?: Tab) => {
    const coinType = item?.coinType || item?.key
    if (fixCoinType(coinType) === fixCoinType(currentRangeTab)) {
      return
    }
    if (item && (item?.coinType || item?.key)) {
      setCurrentRangeTab(item?.coinType || item?.key)
    }
    // else {
    //   setCurrentRangeTab(rangeTabList?.find(tab => tab.key !== currentRangeTab)?.key)
    // }
    setFromToken(toToken)
    setToToken(fromToken)
    setByAmountIn(!byAmountIn)

    if (isAutoFill) {
      if (byAmountIn) {
        setToAmount(fromAmount)
        setFromAmount('')
      } else {
        setFromAmount(toAmount)
        setToAmount('')
      }
    } else {
      setFromAmount(toAmount)
      setToAmount(fromAmount)
    }
  }

  const debouncedOnReverseClick = useDebounceFunction(onReverseClick, 500)

  // 处理输入框锁定状态 Handle input lock status
  useEffect(() => {
    if (byAmountIn && fromTokenLock && !toTokenLock) {
      setFromAmount('')
      setToAmount('')
    }
    if (!byAmountIn && !fromTokenLock && toTokenLock) {
      setFromAmount('')
      setToAmount('')
    }
    if (byAmountIn && !fromTokenLock && toTokenLock) {
      setToAmount('')
    }
    if (!byAmountIn && fromTokenLock && !toTokenLock) {
      setFromAmount('')
    }
    if (fromTokenLock && toTokenLock) {
      setFromAmount('')
      setToAmount('')
    }
  }, [fromTokenLock, toTokenLock])

  return {
    direct,
    perText,
    debouncedOnReverseClick,
    currentRangeTab
  }
}

export default useDLMMDeposit
