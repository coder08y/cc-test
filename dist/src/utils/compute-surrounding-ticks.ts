import { Ticks } from '@/hooks/clmm/usePoolTickData'
import { Token } from '@cetus/types'
import { d } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'

const PRICE_FIXED_DIGITS = 8

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  tick: number
  liquidityActive: bigint
  liquidityNet: bigint
  price0: string
}

// Computes the numSurroundingTicks above or below the active tick.
export default function computeSurroundingTicks(
  token0: Token,
  token1: Token,
  activeTickProcessed: TickProcessed,
  sortedTickData: Ticks,
  pivot: number,
  ascending: boolean
): TickProcessed[] {
  let previousTickProcessed: TickProcessed = {
    ...activeTickProcessed
  }
  // Iterate outwards (either up or down depending on direction) from the active tick,
  // building active liquidity for every tick.
  let processedTicks: TickProcessed[] = []
  for (let i = pivot + (ascending ? 1 : -1); ascending ? i < sortedTickData.length : i >= 0; ascending ? i++ : i--) {
    const tick = Number(sortedTickData[i]?.tick)
    // const sdkPrice = tickToPrice(token0, token1, tick)
    const sdkPrice = TickMath.tickIndexToPrice(tick, token0.decimals, token1.decimals)
    const currentTickProcessed: TickProcessed = {
      liquidityActive: previousTickProcessed.liquidityActive,
      tick,
      liquidityNet: BigInt(sortedTickData[i]?.liquidityNet ?? ''),
      // price0: sdkPrice.toFixed(PRICE_FIXED_DIGITS)
      price0: sdkPrice.toString()
    }

    // Update the active liquidity.
    // If we are iterating ascending and we found an initialized tick we immediately apply
    // it to the current processed tick we are building.
    // If we are iterating descending, we don't want to apply the net liquidity until the following tick.
    if (ascending) {
      // currentTickProcessed.liquidityActive = JSBI.add(
      //   previousTickProcessed.liquidityActive,
      //   JSBI.BigInt(sortedTickData[i]?.liquidityNet ?? 0),
      // )
      currentTickProcessed.liquidityActive = BigInt(
        d(previousTickProcessed.liquidityActive.toString())
          .add(sortedTickData[i]?.liquidityNet ?? 0)
          .toString()
      )
    } else if (!ascending && !d(previousTickProcessed.liquidityNet.toString()).eq('0')) {
      // We are iterating descending, so look at the previous tick and apply any net liquidity.
      // currentTickProcessed.liquidityActive = JSBI.subtract(
      //   previousTickProcessed.liquidityActive,
      //   previousTickProcessed.liquidityNet,
      // )
      currentTickProcessed.liquidityActive = BigInt(
        d(previousTickProcessed.liquidityActive.toString()).sub(previousTickProcessed.liquidityNet.toString()).toString()
      )
    }

    processedTicks.push(currentTickProcessed)
    previousTickProcessed = currentTickProcessed
  }

  if (!ascending) {
    processedTicks = processedTicks.reverse()
  }

  return processedTicks
}

export function computeSurroundingTicksNew(list: any, token0: Token, token1: Token) {
  let d1 = 0
  return list?.map((item: any, index: number) => {
    d1 = d(item?.liquidityNet)?.plus(d1).toNumber()
    const sdkPrice = TickMath.tickIndexToPrice(item?.tick, token0.decimals, token1.decimals)
    const newItem = {
      liquidityActive: d1,
      liquidityNet: item?.liquidityNet,
      tick: item?.tick,
      price0: sdkPrice.toString()
    }
    return newItem
  })
}
