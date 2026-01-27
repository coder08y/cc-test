import useLiquidityStore from '@/store/clmm'
import useAddLiquidityStore from '@/store/clmm/addLiquidity'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { Token } from '@cetus/types'
import { d, textEllipses } from '@cetus/utils'
import { useEffect, useMemo, useState } from 'react'
import useGetLeverage from '../common/useGetLeverage'
import usePriceRange from './usePriceRange'

type DepositProps<T> = {
  rangeTabList: T[]
}

function useDeposit<T>({ rangeTabList }: DepositProps<T>) {
  // 获取流动性池信息 Get liquidity pool information
  const { apiPoolInfo } = useLiquidityStore()

  // 获取添加流动性相关状态和方法 Get add liquidity related states and methods
  const {
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    byAmountIn,
    setByAmountIn,
    setIsFarmRewardsRange,
    setAutoStakePosition,
    fromTokenLock,
    toTokenLock,
    fromAmount,
    toAmount,
    setFromAmount,
    setToAmount
  } = useAddLiquidityStore()

  // 获取价格范围数据 Get price range data
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const [currentRangeTab, setCurrentRangeTab] = useState<string>()
  const [liquidityChartTab, setLiquidityChartTab] = useState<string>('distribution')
  const { handleInitTickData } = usePriceRange()
  const { getLeverage } = useGetLeverage()

  const liquidityChartTabList = [
    {
      key: 'distribution',
      beforeIcon: {
        xlinkHref: '#icon-liquiditydistribution',
        svgW: '16px',
        svgH: '16px',
        svgHover: 'primary',
        activeColor: 'primary',
        activeHoverColor: 'primary'
      },
      tooltip: 'Liquidity Distribution'
    },
    {
      key: 'prices',
      beforeIcon: {
        xlinkHref: '#icon-poolhistoricprices',
        svgW: '16px',
        svgH: '16px',
        svgHover: 'primary',
        activeColor: 'primary',
        activeHoverColor: 'primary'
      },
      tooltip: 'Historical Pool Prices'
    }
  ]

  const handleChangeLiquidityChartTab = (item?: Tab) => {
    setLiquidityChartTab(item?.key)
  }

  // 初始化当前选中coin标签 Initialize current coin tab
  useEffect(() => {
    if (apiPoolInfo) {
      const coinType = apiPoolInfo?.displayTokenA?.coin_type
      setCurrentRangeTab(coinType)
    }
  }, [apiPoolInfo?.poolAddress])

  // 计算方向 Calculate direction
  const direct = useMemo(() => {
    return currentRangeTab === apiPoolInfo?.tokenA?.coin_type
  }, [currentRangeTab, apiPoolInfo?.tokenA?.coin_type])

  // 计算价格显示文本 Calculate price display text
  const perText = useMemo(() => {
    if (!apiPoolInfo?.tokenA || !apiPoolInfo?.tokenB) return ''
    return direct
      ? `${textEllipses(apiPoolInfo?.tokenB?.symbol, 10)}/${textEllipses(apiPoolInfo?.tokenA?.symbol, 10)}`
      : `${textEllipses(apiPoolInfo?.tokenA?.symbol, 10)}/${textEllipses(apiPoolInfo?.tokenB?.symbol, 10)}`
  }, [direct, apiPoolInfo?.tokenA as Token, apiPoolInfo?.tokenB as Token])

  // 计算杠杆率 Calculate leverage
  const leverage = useMemo(() => {
    const minPrice = lowerTickData?.price
    const maxPrice = upperTickData?.price
    return getLeverage(minPrice, maxPrice)
  }, [lowerTickData?.price, upperTickData?.price])

  // 处理farm奖励范围变化 Handle farm rewards range change
  const handleChangeIsFarmRewardsRange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFarmRewardsRange(event.target.checked)
    if (event.target.checked && apiPoolInfo?.farmsEffectiveTickLower && apiPoolInfo?.farmsEffectiveTickUpper) {
      handleInitTickData(apiPoolInfo?.farmsEffectiveTickLower, apiPoolInfo?.farmsEffectiveTickUpper, apiPoolInfo)
    }
  }

  // 监控farm奖励范围 Monitor farm rewards range
  useEffect(() => {
    if (d(lowerTickData?.tick).eq(d(apiPoolInfo?.farmsEffectiveTickLower)) && d(upperTickData?.tick).eq(d(apiPoolInfo?.farmsEffectiveTickUpper))) {
      setIsFarmRewardsRange(true)
    } else {
      setIsFarmRewardsRange(false)
    }
  }, [lowerTickData?.tick, upperTickData?.tick, apiPoolInfo?.farmsEffectiveTickLower, apiPoolInfo?.farmsEffectiveTickUpper])

  // 判断是否为全范围 Check if full range
  const isFullRange = useMemo(() => {
    return lowerTickData?.price === '0' && upperTickData?.price === '∞'
  }, [lowerTickData?.price, upperTickData?.price])

  // 处理tab反转点击 Handle tab reverse click
  const onReverseClick = (item?: Tab) => {
    if (item && item?.coin_type) {
      setCurrentRangeTab(item?.coin_type)
    } else {
      setCurrentRangeTab(rangeTabList?.find(tab => tab.key !== currentRangeTab)?.key)
    }
    setFromToken(toToken)
    setToToken(fromToken)
    setByAmountIn(!byAmountIn)
    if (byAmountIn) {
      setToAmount(fromAmount)
      setFromAmount('')
    } else {
      setFromAmount(toAmount)
      setToAmount('')
    }
  }

  // 处理自动质押仓位 Handle auto stake position
  useEffect(() => {
    if (apiPoolInfo?.haveFarming) {
      if (fromTokenLock || toTokenLock) {
        setAutoStakePosition(false)
      } else {
        setAutoStakePosition(true)
      }
    }
  }, [fromTokenLock, toTokenLock, apiPoolInfo?.haveFarming])

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
    handleChangeIsFarmRewardsRange,
    onReverseClick,
    leverage,
    currentRangeTab,
    isFullRange,
    handleChangeLiquidityChartTab,
    liquidityChartTab,
    liquidityChartTabList
  }
}

export default useDeposit
