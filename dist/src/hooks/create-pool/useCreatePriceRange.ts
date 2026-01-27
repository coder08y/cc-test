import { TickData } from '@/types/clmm'
import { getReversePrice } from '@/utils/pool'
import { Token } from '@cetus/types'
import { formatNumberWithDown } from '@cetus/utils'
import { TickMath, TickUtil, d, getNearestTickByTick } from '@cetusprotocol/common-sdk'

export default function useCreatePriceRange() {
  // 设置Tick data
  const handleSetTickData = (tick: number, type: 'lower' | 'upper', baseToken: Token, quoteToken: Token, tickSpacing: number): TickData => {
    const decimalsA = baseToken!.decimals
    const decimalsB = quoteToken!.decimals
    let price

    if (Math.abs(tick) == Math.abs(TickUtil.getMinIndex(tickSpacing))) {
      price = type === 'lower' ? '0' : '∞'
    } else {
      price = TickMath.tickIndexToPrice(tick, decimalsA, decimalsB).toString()
    }

    const displayPrice = price === '∞' ? '∞' : formatNumberWithDown(price, 6).toString()

    const reversePrice = getReversePrice(price)

    const displayReversePrice = reversePrice === '∞' ? '∞' : formatNumberWithDown(reversePrice, 6).toString()
    const data: TickData = {
      id: type,
      tokenA: baseToken!,
      tokenB: quoteToken!,
      tick,
      price,
      displayPrice,
      reversePrice,
      displayReversePrice,
      tickSpacing: tickSpacing.toString(),
      pool: '1'
    }

    return data
  }

  /**
   * 通过价格更新Tick Data
   * @param data
   * @param value
   * @returns
   */
  const updateTickDataBasedOnPrice = (data: Partial<TickData>, value: string) => {
    const tokenA = data.tokenA
    const tokenB = data.tokenB

    if (!tokenA || !tokenB || value.length === 0) return

    let tick
    let price = ''

    if (value === '∞') {
      tick = TickUtil.getMaxIndex(Number(data.tickSpacing))
      price = '∞'
    } else if (d(value).equals(0)) {
      tick = TickUtil.getMinIndex(Number(data.tickSpacing))
      price = '0'
    } else if (d(value).gt(0)) {
      const t = TickMath.priceToTickIndex(d(value), tokenA.decimals, tokenB.decimals)
      tick = getNearestTickByTick(Number(t), Number(data.tickSpacing))
      price = TickMath.tickIndexToPrice(Number(tick), tokenA.decimals, tokenB.decimals).toString()
    }

    const displayPrice = price === '∞' ? '∞' : formatNumberWithDown(price, 6)

    const reversePrice = getReversePrice(price)

    const displayReversePrice = reversePrice === '∞' ? '∞' : formatNumberWithDown(reversePrice, 6)

    if (tick !== undefined) {
      const newData: TickData = {
        ...data,
        tick,
        price,
        displayPrice: displayPrice.toString(),
        reversePrice,
        displayReversePrice: displayReversePrice.toString()
      } as TickData

      return newData
    }
    return undefined
  }

  const handleActionPrice = (tickData: Partial<TickData>, action: 'Add' | 'Sub' = 'Add') => {
    const { tokenA, tokenB, tick, tickSpacing } = tickData
    if (tokenA && tokenB && tickSpacing) {
      const newTick = action === 'Add' ? d(tick).add(tickSpacing).toNumber() : d(tick).sub(tickSpacing).toNumber()
      if (d(newTick).gt(TickUtil.getMaxIndex(Number(tickData.tickSpacing))) || d(newTick).lt(TickUtil.getMinIndex(Number(tickData.tickSpacing)))) {
        return undefined
      }
      const price = TickMath.tickIndexToPrice(newTick, tokenA.decimals, tokenB.decimals).toString()
      const displayPrice = price === '∞' ? '∞' : formatNumberWithDown(price, 6)
      if (displayPrice === tickData.displayPrice) {
        // TODO 为避免 频繁调用，这种情况，每次步长 增加
        const step = Number(tickData.tickSpacing!) < 20 ? 40 : 1
        return handleActionPrice(
          {
            ...tickData,
            tick:
              action === 'Add'
                ? d(tick)
                    .add(Number(tickSpacing) * step)
                    .toNumber()
                : d(tick)
                    .sub(Number(tickSpacing) * step)
                    .toNumber()
          },
          action
        )
      } else {
        const reversePrice = getReversePrice(price)
        const displayReversePrice = reversePrice === '∞' ? '∞' : formatNumberWithDown(reversePrice, 6)

        const newData: TickData = {
          id: tickData.id!,
          tick: newTick,
          price: price.toString(),
          displayPrice: displayPrice.toString(),
          reversePrice: reversePrice.toString(),
          displayReversePrice: displayReversePrice.toString(),
          tokenA,
          tokenB,
          tickSpacing,
          pool: '1'
        }

        return newData
      }
    }

    return undefined
  }

  /**
   * 初始化价格区间
   * @param isFull
   */
  const calcInitPriceRange = (
    isFull: boolean,
    initPrice?: string,
    tickSpacing?: number,
    baseToken?: Token,
    quoteToken?: Token,
    initMinTick?: number,
    initMaxTick?: number
  ) => {
    console.log('🚀 ~ file: useCreatePriceRange.ts:84 ~ useCreatePriceRange ~ calcInitPriceRange:', {
      tickSpacing,
      baseToken,
      quoteToken
    })

    try {
      if (tickSpacing && baseToken && quoteToken) {
        const maxTick = TickUtil.getMaxIndex(tickSpacing)
        const minTick = TickUtil.getMinIndex(tickSpacing)
        if (isFull) {
          const minData: TickData = {
            id: 'lower',
            tokenA: baseToken!,
            tokenB: quoteToken!,
            tick: minTick,
            price: '0',
            displayPrice: '0',
            reversePrice: '∞',
            displayReversePrice: '∞',
            tickSpacing: tickSpacing.toString(),
            pool: new Date().getTime().toString()
          }

          const maxData: TickData = {
            id: 'upper',
            tokenA: baseToken!,
            tokenB: quoteToken!,
            tick: maxTick,
            price: '∞',
            displayPrice: '∞',
            reversePrice: '0',
            displayReversePrice: '0',
            tickSpacing: tickSpacing.toString(),
            pool: new Date().getTime().toString()
          }

          if (initPrice && +initPrice) {
            const currTick = TickMath.priceToTickIndex(d(initPrice), baseToken.decimals, quoteToken.decimals)
            return {
              minData,
              maxData,
              currTick
            }
          }
          return {
            minData,
            maxData,
            currTick: undefined
          }
        } else {
          if (initPrice && +initPrice) {
            const currTick = TickMath.priceToTickIndex(d(initPrice), baseToken.decimals, quoteToken.decimals)

            const minTickFormat = initMinTick ? initMinTick : getNearestTickByTick(Number(currTick - tickSpacing * 5), Number(tickSpacing))
            if (minTickFormat < minTick) {
              initMinTick = minTick
            }

            const maxTickFormat = initMaxTick ? initMaxTick : getNearestTickByTick(Number(currTick + tickSpacing * 5), Number(tickSpacing))
            if (maxTickFormat > maxTick) {
              initMaxTick = maxTick
            }

            const minData: TickData = handleSetTickData(minTickFormat, 'lower', baseToken, quoteToken, tickSpacing)
            const maxData: TickData = handleSetTickData(maxTickFormat, 'upper', baseToken, quoteToken, tickSpacing)

            return {
              minData,
              maxData,
              currTick
            }
          }
        }
      }
    } catch (error) {
      console.log('🚀 ~ file: useCreatePriceRange.ts:228 ~ useCreatePriceRange ~ error:', error)
    }

    return undefined
  }

  return {
    calcInitPriceRange,
    handleActionPrice,
    updateTickDataBasedOnPrice
  }
}
