import { TicksPath } from '@/apis/path'
import { PoolContractInfo } from '@/types'
import computeSurroundingTicks from '@/utils/compute-surrounding-ticks'
import { getTickDataFromUrlData } from '@/utils/contract-helper'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetus/utils'
import { TickMath } from '@cetusprotocol/common-sdk'
import { useDeepCompareEffect } from 'ahooks'
import BN from 'bn.js'
import { useMemo, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import useGetTicks from './useGetTicks'

interface TickProcessed {
  tick: number
  liquidityActive: bigint
  liquidityNet: bigint
  price0: string
}

enum FeeAmount {
  LOWEST = '100',
  LOW = '500',
  MEDIUM = '2500',
  HIGH = '10000'
}

export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 2,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200
}

const MAX_TICK_INDEX = 443636

const MIN_TICK_INDEX = -443636

export type AllV3TicksQuery = {
  ticks: Array<{
    tick: string
    liquidityNet: string
    liquidityGross: string
  }>
}

export type Ticks = AllV3TicksQuery['ticks']
export type TickData = Ticks[number]
const PRICE_FIXED_DIGITS = 8

const getActiveTick = (tickCurrent: number | undefined, feeAmount: FeeAmount | undefined) => {
  return tickCurrent !== undefined && feeAmount ? Math.floor(tickCurrent / TICK_SPACINGS[feeAmount]) * TICK_SPACINGS[feeAmount] : undefined
}

function useTicksFromApi(poolInfo?: PoolContractInfo) {
  const { getTicks } = useGetTicks(poolInfo?.poolAddress)
  const clmmSdk = useSdk('clmm')
  // const getTicks = (args: { url: string; poolAddress: string | undefined }) => {
  //   if (!id) {
  //     return undefined
  //   }
  //   const params = {
  //     address: args.poolAddress,
  //     orderBy: 'index',
  //     limit: 1000
  //   }
  //   return fetchByApi(args.url, 'GET', params)
  // }
  const { data, error, isLoading, mutate } = useSWRImmutable({ url: TicksPath, poolAddress: poolInfo?.poolAddress }, getTicks)
  const handleRefresh = () => {
    // 手动触发数据刷新
    mutate()
  }

  const [tick, setTick] = useState<any>()
  const getTickData = async () => {
    if (!poolInfo) return
    try {
      if (data && data.list && data.list.length > 0) {
        const list = data?.list?.sort((a: any, b: any) => a.index - b.index)

        const tickList = list.map((tickItem: any) => {
          return {
            objectId: tickItem.object_id,
            index: tickItem.index,
            sqrtPrice: new BN(tickItem.sqrt_price),
            liquidityNet: new BN(tickItem.liquidity_net),
            liquidityGross: new BN(tickItem.liquidity_gross),
            feeGrowthOutsideA: new BN(tickItem.fee_growth_outside_a),
            feeGrowthOutsideB: new BN(tickItem.fee_growth_outside_b),
            rewardersGrowthOutside: tickItem.rewards_growth_outside
          }
        })

        setTick({ list: tickList, address: data.address })
      } else {
        const res = await clmmSdk!.Pool.fetchTicks({
          pool_id: poolInfo?.poolAddress,
          coin_type_a: poolInfo?.coinTypeA,
          coin_type_b: poolInfo.coinTypeB
        })
        setTick({ list: res, address: poolInfo?.poolAddress })
      }
    } catch (err) {
      console.log('🚀 ~ file: usePoolTickData.ts:104 ~ getTickData ~ err:', err)
      const res = await clmmSdk!.Pool.fetchTicks({
        pool_id: poolInfo?.poolAddress,
        coin_type_a: poolInfo?.coinTypeA,
        coin_type_b: poolInfo?.coinTypeB
      })
      setTick({ list: res, address: poolInfo?.poolAddress })
    }
  }

  useDeepCompareEffect(() => {
    getTickData()
  }, [data, poolInfo?.poolAddress])

  const ticksData = useMemo(() => {
    const result: any = []
    if (tick && tick?.list) {
      const formateList = getTickDataFromUrlData(tick?.list)

      formateList?.forEach((item: any) => {
        result.push({
          tick: Number(item.index),
          liquidityNet: d(item.liquidityNet.toString()).toString(),
          liquidityGross: item.liquidityGross.toString(),
          id: item.objectId
        })
      })

      return result
    }

    // ToDo: 暂时兼容从sdk拿tick列表
    // if (data) {
    //   console.log('ticksData data: ', data)
    //   data.forEach((item: any) => {
    //     result.push({
    //       tick: item.index,
    //       liquidityNet: item.liquidity_net,
    //       liquidityGross: item.liquidity_gross
    //       // id: item.id
    //     })
    //   })
    //   return result
    // }
  }, [JSON.stringify(tick)])

  return {
    isLoading,
    error,
    data: ticksData,
    handleRefresh
  }
}

// Fetches all ticks for a given pool
export function useAllV3Ticks(poolInfo?: PoolContractInfo): {
  isLoading: boolean
  error: unknown
  ticks: TickData[] | undefined
  handleRefresh: () => void
} {
  const subgraphTickData = useTicksFromApi(poolInfo)

  return {
    isLoading: subgraphTickData.isLoading,
    error: subgraphTickData.error,
    ticks: subgraphTickData.data,
    handleRefresh: subgraphTickData.handleRefresh
  }
}

export function usePoolActiveLiquidity(
  contractPoolInfo: PoolContractInfo | undefined,
  currencyA: any | undefined,
  currencyB: any | undefined,
  feeAmount: FeeAmount | undefined
): {
  isLoading: boolean
  error: any
  activeTick: number | undefined
  data: TickProcessed[] | undefined
  handleRefresh: () => void
} {
  // const pool = usePoolInfo({ token0: currencyA?.id, token1: currencyB?.id, fee: feeAmount })

  // Find nearest valid tick for pool in case tick is not initialized.
  // const activeTick = useMemo(() => getActiveTick(pool?.tick, feeAmount), [pool, feeAmount])
  const activeTick = useMemo(() => getActiveTick(contractPoolInfo?.current_tick_index, feeAmount), [contractPoolInfo?.poolAddress, feeAmount])

  const minTick = useMemo(() => {
    if (contractPoolInfo?.tickSpacing) {
      return TickMath.getInitializeTickIndex(MIN_TICK_INDEX, contractPoolInfo.tickSpacing)
    }
    return undefined
  }, [contractPoolInfo?.tickSpacing])

  const maxTick = useMemo(() => {
    if (contractPoolInfo?.tickSpacing) {
      return TickMath.getInitializeTickIndex(MAX_TICK_INDEX, contractPoolInfo.tickSpacing)
    }
    return undefined
  }, [contractPoolInfo?.tickSpacing])
  const { isLoading, error, ticks, handleRefresh } = useAllV3Ticks(contractPoolInfo)
  // const { isLoading, error, ticks, handleRefresh } = useAllV3Ticks(contractPoolInfo?.tick_manager?.id)

  return useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      activeTick === undefined ||
      ticks === undefined ||
      !ticks ||
      // ticks?.length === 0 ||
      isLoading ||
      !minTick ||
      !maxTick
    ) {
      return {
        isLoading,
        error,
        activeTick,
        data: undefined,
        handleRefresh
      }
    }

    if (ticks.length === 0) {
      return {
        isLoading,
        error,
        activeTick,
        data: [
          {
            liquidityActive: BigInt(contractPoolInfo?.liquidity ?? 0),
            tick: activeTick,
            liquidityNet: 0n,
            price0: TickMath.tickIndexToPrice(activeTick, currencyA.decimals, currencyB.decimals).toFixed(PRICE_FIXED_DIGITS)
          }
        ],
        handleRefresh
      }
    }

    const token0 = currencyA
    const token1 = currencyB

    const newTicks = ticks

    const pivot = newTicks.findIndex(({ tick }) => Number(tick) > activeTick) - 1
    console.log('🚀 ~ file: usePoolTickData.ts:253 ~ returnuseMemo ~ newTicks:', newTicks)
    console.log('🚀 ~ file: usePoolTickData.ts:253 ~ returnuseMemo ~ pivot:', pivot)
    console.log('🚀 ~ file: usePoolTickData.ts:253 ~ returnuseMemo ~ activeTick:', activeTick)
    console.log('🚀 ~ file: usePoolTickData.ts:253 ~ returnuseMemo ~ contractPoolInfo?.liquidity:', contractPoolInfo?.liquidity)

    if (pivot < 0) {
      // consider setting a local error
      // return {
      //   isLoading,
      //   error,
      //   activeTick,
      //   data: undefined,
      //   handleRefresh
      // }
      const subsequentTicks = computeSurroundingTicks(
        token0,
        token1,
        {
          liquidityActive: BigInt(contractPoolInfo?.liquidity ?? 0),
          tick: activeTick,
          liquidityNet: 0n,
          price0: TickMath.tickIndexToPrice(activeTick, currencyA.decimals, currencyB.decimals).toFixed(PRICE_FIXED_DIGITS)
        },
        newTicks,
        pivot,
        true
      )

      return {
        isLoading,
        error,
        activeTick,
        data: [
          {
            liquidityActive: BigInt(contractPoolInfo?.liquidity ?? 0),
            tick: activeTick,
            liquidityNet: 0n,
            price0: TickMath.tickIndexToPrice(activeTick, currencyA.decimals, currencyB.decimals).toFixed(PRICE_FIXED_DIGITS)
          },
          ...subsequentTicks
        ],
        handleRefresh
      }
    }

    const liquidity: any = contractPoolInfo?.liquidity ?? 0
    const activeTickProcessed: TickProcessed = {
      // liquidityActive: ticks.length >= 2 ? BigInt(liquidity ?? 0) : BigInt(0),
      liquidityActive: BigInt(liquidity ?? 0),
      tick: activeTick,
      liquidityNet: Number(ticks[pivot].tick) === activeTick ? BigInt(ticks[pivot].liquidityNet) : 0n,
      price0: TickMath.tickIndexToPrice(activeTick, token0.decimals, token1.decimals).toFixed(PRICE_FIXED_DIGITS)
    }

    // const subsequentTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, true)
    const subsequentTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, newTicks, pivot, true)
    console.log('🚀 ~ file: usePoolTickData.ts:309 ~ returnuseMemo ~ subsequentTicks:', subsequentTicks)

    // const previousTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, ticks, pivot, false)
    const previousTicks = computeSurroundingTicks(token0, token1, activeTickProcessed, newTicks, pivot, false)
    console.log('🚀 ~ file: usePoolTickData.ts:309 ~ returnuseMemo ~ previousTicks:', previousTicks)

    const ticksProcessed = previousTicks.concat(activeTickProcessed).concat(subsequentTicks)
    console.log('🚀 ~ file: usePoolTickData.ts:316 ~ returnuseMemo ~ ticksProcessed:', ticksProcessed)

    if (subsequentTicks.length == 1 && previousTicks.length == 1) {
      ticksProcessed[2].liquidityActive = ticksProcessed[1].liquidityActive
    }

    return {
      isLoading,
      error,
      activeTick,
      data: ticksProcessed,
      // data: ticksProcessedNew,
      handleRefresh
    }
  }, [currencyA?.address, currencyB?.address, activeTick, contractPoolInfo?.poolAddress, ticks, isLoading, error, minTick, maxTick])
}
