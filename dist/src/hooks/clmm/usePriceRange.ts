import useLiquidityStore from '@/store/clmm'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { PoolApiInfo, TickData } from '@/types'
import { getReversePrice } from '@/utils/pool'
import { d, formatTickPrice } from '@cetus/utils'
import { TickMath, TickUtil } from '@cetusprotocol/common-sdk'

export function getNearestTickByTick(tickIndex: number, tickSpacing: number, rounding?: boolean): number {
  const mod = Math.abs(tickIndex) % tickSpacing
  if (!mod) {
    if (rounding) {
      return tickIndex + tickSpacing
    }
    return tickIndex
  }
  if (tickIndex > 0) {
    if (mod > tickSpacing / 2) {
      return tickIndex + tickSpacing - mod
    }
    if (rounding && tickSpacing <= 2) {
      return tickIndex + tickSpacing - mod
    }
    return tickIndex - mod
  }
  if (mod > tickSpacing / 2) {
    return tickIndex - tickSpacing + mod
  }
  return tickIndex + mod
}

export default function usePriceRange() {
  const { lowerTickData, setLowerTickData, upperTickData, setUpperTickData } = usePriceRangeStore()
  const { contractPoolInfo } = useLiquidityStore()

  // 设置Tick data
  const handleSetTickData = (tick: number, type: 'lower' | 'upper', poolApiInfo: PoolApiInfo) => {
    console.log('🚀 ~ handleSetTickData ~ poolApiInfo:', poolApiInfo)
    if (!poolApiInfo?.tokenA || !poolApiInfo?.tokenB) return
    const decimalsA = poolApiInfo.tokenA.decimals
    const decimalsB = poolApiInfo.tokenB.decimals
    let price

    if (Math.abs(tick) == Math.abs(TickUtil.getMinIndex(Number(poolApiInfo.tickSpacing)))) {
      price = type === 'lower' ? '0' : '∞'
    } else {
      price = TickMath.tickIndexToPrice(tick, decimalsA, decimalsB).toString()
      console.log('🚀 ~ handleSetTickData ~ price:', price)
    }

    const displayPrice = price === '∞' ? '∞' : formatTickPrice(price, 6)
    console.log('🚀 ~ handleSetTickData ~ displayPrice:', displayPrice)

    const reversePrice = getReversePrice(price)

    const displayReversePrice = reversePrice === '∞' ? '∞' : formatTickPrice(reversePrice, 6)
    const data = {
      id: type,
      tokenA: poolApiInfo.tokenA,
      tokenB: poolApiInfo.tokenB,
      tick,
      price,
      displayPrice,
      reversePrice,
      displayReversePrice,
      tickSpacing: poolApiInfo.tickSpacing || (contractPoolInfo && contractPoolInfo.tickSpacing),
      pool: poolApiInfo.poolAddress
    }

    if (type === 'lower') {
      setLowerTickData({ ...data })
    } else {
      setUpperTickData({ ...data })
    }
  }

  // 初始化Tick Data（第一次进页面时候可用）
  const handleInitTickData = (lower: number, upper: number, poolApiInfo: PoolApiInfo) => {
    handleSetTickData(lower, 'lower', poolApiInfo)
    handleSetTickData(upper, 'upper', poolApiInfo)
  }

  // 加或减操作
  const handleActionPrice = (tickData: Partial<TickData>, action: 'Add' | 'Sub') => {
    const tokenA = tickData?.tokenA
    const tokenB = tickData?.tokenB
    const currentTick = tickData.tick
    const tickSpacing = tickData.tickSpacing

    if (!tokenA || !tokenB || !tickSpacing) return
    const newTick = action === 'Add' ? d(currentTick).add(tickSpacing).toNumber() : d(currentTick).sub(tickSpacing).toNumber()

    if (d(newTick).gt(TickUtil.getMaxIndex(Number(tickData.tickSpacing))) || d(newTick).lt(TickUtil.getMinIndex(Number(tickData.tickSpacing)))) return

    const price = TickMath.tickIndexToPrice(newTick, tokenA.decimals, tokenB.decimals).toString()
    const displayPrice = price === '∞' ? '∞' : formatTickPrice(price, 6)

    if (displayPrice === tickData.displayPrice) {
      handleActionPrice(
        {
          ...tickData,
          tick: newTick
        },
        action
      )
    } else {
      const reversePrice = getReversePrice(price)
      const displayReversePrice = reversePrice === '∞' ? '∞' : formatTickPrice(reversePrice, 6)
      const newData = {
        ...tickData,
        tick: newTick,
        price,
        displayPrice,
        reversePrice,
        displayReversePrice
      }

      if (tickData.id === 'lower') {
        console.log('🚀 ~ file: usePriceRange.ts:55 ~ handleActionPrice ~ lower newData:', newData)
        setLowerTickData({ ...newData })
      } else {
        console.log('🚀 ~ file: usePriceRange.ts:55 ~ handleActionPrice ~ upper newData:', newData)
        setUpperTickData({ ...newData })
      }
    }
  }

  // 加
  const handleAddPrice = (tickData: Partial<TickData>) => {
    handleActionPrice(tickData, 'Add')
  }

  // 减
  const handleSubPrice = (tickData: Partial<TickData>) => {
    handleActionPrice(tickData, 'Sub')
  }

  // 设置Full range
  const handleSetFullRange = (poolApiInfo: Partial<PoolApiInfo>) => {
    const lowerData = {
      ...lowerTickData,
      tick: TickUtil.getMinIndex(Number(poolApiInfo.tickSpacing)),
      price: '0',
      displayPrice: '0',
      reversePrice: '∞',
      displayReversePrice: '∞'
    }

    console.log('🚀 ~ file: usePriceRange.ts:115 ~ handleSetFullRange ~ lowerData:', lowerData)
    setLowerTickData(lowerData)

    const upperData = {
      ...upperTickData,
      tick: TickUtil.getMaxIndex(Number(poolApiInfo.tickSpacing)),
      price: '∞',
      displayPrice: '∞',
      reversePrice: '0',
      displayReversePrice: '0'
    }
    console.log('🚀 ~ file: usePriceRange.ts:115 ~ handleSetFullRange ~ upperData:', upperData)
    setUpperTickData(upperData)
  }

  // 失去焦点操作
  const setTickDataBasedOnPrice = (data: Partial<TickData>, value: string, direct?: boolean) => {
    const tokenA = data.tokenA
    const tokenB = data.tokenB

    if (!tokenA || !tokenB) return
    let tick
    let price = ''

    if (value === '∞' || value === 'Infinity') {
      tick = TickUtil.getMaxIndex(Number(data.tickSpacing))
      price = '∞'
    } else if (d(value).equals(0)) {
      tick = TickUtil.getMinIndex(Number(data.tickSpacing))
      price = '0'
    } else if (d(value).gt(0)) {
      const t = TickMath.priceToTickIndex(d(value), tokenA.decimals, tokenB.decimals)
      const nearTikRounding = (direct && data.id === 'lower') || (!direct && data.id === 'upper') ? false : true
      tick = getNearestTickByTick(Number(t), Number(data.tickSpacing), typeof direct === 'boolean' ? nearTikRounding : undefined)
      price = TickMath.tickIndexToPrice(Number(tick), tokenA.decimals, tokenB.decimals).toString()
    }

    const displayPrice = price === '∞' ? '∞' : formatTickPrice(price, 6)

    const reversePrice = getReversePrice(price)

    const displayReversePrice = reversePrice === '∞' ? '∞' : formatTickPrice(reversePrice, 6)

    const newData = {
      ...data,
      tick,
      price,
      displayPrice,
      reversePrice,
      displayReversePrice
    }

    if (data.id === 'lower') {
      setLowerTickData({ ...newData })
    } else {
      setUpperTickData({ ...newData })
    }
  }

  // 重置
  const handleResetRange = () => {
    setLowerTickData({})
    setUpperTickData({})
  }

  return {
    handleSetTickData,
    handleAddPrice,
    handleSubPrice,
    handleSetFullRange,
    handleInitTickData,
    setTickDataBasedOnPrice,
    handleResetRange
  }
}
